const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const BiddingSession = require('../models/BiddingSession');
const Message = require('../models/Message');
const { endBidding, setIO } = require('../controllers/biddingController');

function setupSocket(io) {
  // Inject io into biddingController so it can emit events from REST handlers
  setIO(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      } catch {}
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_project', ({ projectId }) => {
      socket.join(`project_${projectId}`);
    });

    socket.on('join_lobby', ({ projectId }) => {
      socket.join(`lobby_${projectId}`);
      socket.join(`project_${projectId}`);
    });

    socket.on('leave_project', ({ projectId }) => {
      socket.leave(`project_${projectId}`);
      socket.leave(`lobby_${projectId}`);
    });

    // Broadcast bid placed to all in project room
    socket.on('bid_placed', async ({ projectId, bid }) => {
      io.to(`project_${projectId}`).emit('bid_update', { bid, projectId });
    });

    // Handle message sending
    socket.on('send_message', async ({ projectId, message }) => {
      try {
        const isDirect = projectId === 'direct';
        const savedMsg = await Message.create({
          projectId: isDirect ? null : projectId,
          senderId: socket.userId,
          receiverId: message.receiverId,
          content: message.content,
          messageType: message.messageType || 'text'
        });
        const populated = await savedMsg.populate('senderId', 'name profile role');

        if (isDirect) {
          const room = [socket.userId, message.receiverId].sort().join('_');
          io.to(`project_${room}`).emit('new_message', populated);
        } else {
          io.to(`project_${projectId}`).emit('new_message', populated);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('new_message_broadcast', ({ room, message }) => {
      io.to(`project_${room}`).emit('new_message', message);
    });

    socket.on('quiz_completed', ({ projectId, freelancerId, score }) => {
      io.to(`lobby_${projectId}`).emit('freelancer_quiz_done', { freelancerId, score });
    });

    // freelancer_quit is now handled by the REST API (quitBid), which calls _io.emit.
    // Keep this handler as a fallback for older clients.
    socket.on('freelancer_quit', async ({ projectId, freelancerId }) => {
      io.to(`project_${projectId}`).emit('freelancer_quit_update', { freelancerId, projectId });
    });

    socket.on('phase_update', ({ projectId, phaseIndex, status }) => {
      io.to(`project_${projectId}`).emit('phase_status_change', { phaseIndex, status });
    });

    socket.on('notification', ({ userId, message }) => {
      io.to(`user_${userId}`).emit('notification', message);
    });

    socket.on('join_user_room', () => {
      if (socket.userId) socket.join(`user_${socket.userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Schedule bid lifecycle timers
  scheduleBiddingTimers(io);
}

async function scheduleBiddingTimers(io) {
  setInterval(async () => {
    try {
      const now = new Date();

      // ── 1. Open lobby when bidStartTime arrives (status: waiting → lobby) ──
      const sessionsToOpen = await BiddingSession.find({ status: 'waiting' }).populate('projectId');
      for (const session of sessionsToOpen) {
        const project = session.projectId;
        if (!project) continue;
        const bidStart = project.bidStartTime ? new Date(project.bidStartTime) : null;
        if (bidStart && now >= bidStart) {
          session.status = 'active';
          session.startTime = now;
          session.lastBidAt = now;
          const durationMs = (project.bidDuration || 30) * 60000;
          session.endTime = new Date(now.getTime() + durationMs);
          await session.save();

          project.status = 'bidding';
          await project.save();

          io.to(`project_${project._id}`).emit('bid_started', { projectId: project._id.toString(), endTime: session.endTime });
          io.to(`lobby_${project._id}`).emit('bid_started', { projectId: project._id.toString(), endTime: session.endTime });
        }
      }

      // Also open lobby for projects that don't have a session yet
      const projectsWithoutSession = await Project.find({ status: 'open', bidStartTime: { $lte: now } });
      for (const project of projectsWithoutSession) {
        const existing = await BiddingSession.findOne({ projectId: project._id });
        if (!existing) {
          const session = await BiddingSession.create({
            projectId: project._id,
            currentLowestBid: project.budget,
            status: 'active',
            startTime: now,
            lastBidAt: now,
            endTime: new Date(now.getTime() + (project.bidDuration || 30) * 60000)
          });
          
          project.status = 'bidding';
          await project.save();

          io.to(`project_${project._id}`).emit('bid_started', { projectId: project._id.toString(), endTime: session.endTime });
          io.to(`lobby_${project._id}`).emit('bid_started', { projectId: project._id.toString(), endTime: session.endTime });
        }
      }

      // ── 2. Handle inactivity & concluding phase for ACTIVE sessions ──
      const activeSessions = await BiddingSession.find({ status: 'active' });

      for (const session of activeSessions) {
        const lastBidAt = new Date(session.lastBidAt || session.startTime || now);
        const inactivityMs = now - lastBidAt;

        // 1 minute inactivity → start 10s concluding countdown
        if (inactivityMs >= 60000 && !session.concludingStartTime) {
          session.concludingStartTime = now;
          await session.save();
          io.to(`project_${session.projectId}`).emit('bidding_concluding', {
            projectId: session.projectId,
            countdownMs: 10000
          });
        }

        // 10s countdown expired → end bidding
        if (session.concludingStartTime) {
          const concludingMs = now - new Date(session.concludingStartTime);
          if (concludingMs >= 10000) {
            await endBidding(session.projectId.toString(), null, null);
            const updatedSession = await BiddingSession.findOne({ projectId: session.projectId })
              .populate('winnerId', 'name profile aiScore');
            io.to(`project_${session.projectId}`).emit('bid_ended', {
              projectId: session.projectId,
              winner: updatedSession?.winnerId,
              winnerBidId: updatedSession?.winnerBidId
            });
          }
        }
      }
    } catch (err) {
      console.error('Timer error:', err.message);
    }
  }, 2000);
}

module.exports = { setupSocket };
