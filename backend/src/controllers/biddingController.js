const Project = require('../models/Project');
const Bid = require('../models/Bid');
const BiddingSession = require('../models/BiddingSession');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { sendBidWon, sendBidClosed, sendQuizReport } = require('../services/emailService');

// io instance injected by socket setup
let _io = null;
exports.setIO = (io) => { _io = io; };

exports.joinBid = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!['open', 'bidding'].includes(project.status)) return res.status(400).json({ success: false, message: 'Project is not accepting bids' });

    // Check closed community
    if (project.closedCommunity.enabled) {
      const accepted = project.closedCommunity.acceptedFreelancers.map(id => id.toString());
      if (!accepted.includes(req.user._id.toString())) {
        return res.status(403).json({ success: false, message: 'You need approval to join this private bidding' });
      }
    }

    let session = await BiddingSession.findOne({ projectId: req.params.projectId });
    if (!session) {
      session = await BiddingSession.create({ projectId: req.params.projectId, currentLowestBid: project.budget });
    }

    // Check slot limit
    if (session.joinedFreelancers.length >= project.freelancerLimit) {
      return res.status(400).json({ success: false, message: 'Bid Full — All slots taken' });
    }

    const alreadyJoined = session.joinedFreelancers.find(f => f.freelancerId.toString() === req.user._id.toString());
    if (alreadyJoined) return res.status(400).json({ success: false, message: 'Already joined this bid' });

    session.joinedFreelancers.push({ freelancerId: req.user._id });
    await session.save();

    res.json({ success: true, message: 'Successfully joined the bid. Please complete the AI Quiz.', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.startQuiz = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check if already completed quiz
    const existing = await QuizResult.findOne({ freelancerId: req.user._id, projectId: req.params.projectId });
    if (existing) return res.json({ success: true, alreadyCompleted: true, score: existing.score, data: existing.questions });

    const questions = await aiService.generateQuizQuestions(project.description, project.skills, 5);
    // Return questions without correct answers
    const safeQuestions = questions.map(q => ({ question: q.question, options: q.options }));
    res.json({ success: true, data: { questions: safeQuestions, fullQuestions: questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers, questions, timeTaken } = req.body;
    const project = await Project.findById(req.params.projectId).populate('clientId', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    let correct = 0;
    const processedQuestions = questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return { ...q, selectedAnswer: answers[i], isCorrect };
    });

    const score = Math.round((correct / questions.length) * 100);

    const quizResult = await QuizResult.create({
      freelancerId: req.user._id,
      projectId: req.params.projectId,
      questions: processedQuestions,
      score, timeTaken
    });

    // Update session quiz completion
    const session = await BiddingSession.findOne({ projectId: req.params.projectId });
    if (session) {
      const freelancerEntry = session.joinedFreelancers.find(f => f.freelancerId.toString() === req.user._id.toString());
      if (freelancerEntry) {
        freelancerEntry.hasCompletedQuiz = true;
        freelancerEntry.quizScore = score;
        await session.save();
      }
    }

    // Update user's cumulative AI score
    const user = await User.findById(req.user._id);
    user.quizCount += 1;
    user.aiScore = Math.round(((user.aiScore * (user.quizCount - 1)) + score) / user.quizCount);
    await user.save();

    // Emit quiz score update to client room
    if (_io) {
      const allResults = await QuizResult.find({ projectId: req.params.projectId })
        .populate('freelancerId', 'name');
      const scores = allResults.map(r => ({
        freelancerId: r.freelancerId?._id,
        name: r.freelancerId?.name || 'Freelancer',
        score: r.score,
        correct: r.questions.filter(q => q.isCorrect).length,
        total: r.questions.length
      }));
      _io.to(`project_${req.params.projectId}`).emit('quiz_score_update', { scores });
      _io.to(`lobby_${req.params.projectId}`).emit('freelancer_quiz_done', {
        freelancerId: req.user._id, score, scores
      });

      // Check if all joined freelancers have completed quiz → send email report to client
      const completedCount = session?.joinedFreelancers?.filter(f => f.hasCompletedQuiz).length || 0;
      const totalJoined = session?.joinedFreelancers?.length || 0;
      if (totalJoined > 0 && completedCount === totalJoined && project.clientId) {
        sendQuizReport(
          project.clientId.email,
          project.clientId.name,
          project.title,
          scores
        ).catch(() => {});
      }
    }

    res.json({ success: true, data: { score, correct, total: questions.length, quizResult } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Client manually starts the bidding session
exports.startBidding = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or not authorized' });

    const session = await BiddingSession.findOne({ projectId: req.params.projectId });
    if (!session) return res.status(404).json({ success: false, message: 'No bidding session found' });
    if (session.status === 'active') return res.status(400).json({ success: false, message: 'Bidding already started' });
    if (session.status === 'completed') return res.status(400).json({ success: false, message: 'Bidding already ended' });

    const now = new Date();
    session.status = 'active';
    session.startTime = now;
    session.lastBidAt = now;
    // Calculate endTime based on project.bidDuration (minutes)
    const durationMs = (project.bidDuration || 30) * 60000;
    session.endTime = new Date(now.getTime() + durationMs);
    await session.save();

    project.status = 'bidding';
    await project.save();

    if (_io) {
      _io.to(`project_${req.params.projectId}`).emit('bid_started', {
        projectId: req.params.projectId,
        endTime: session.endTime
      });
      _io.to(`lobby_${req.params.projectId}`).emit('bid_started', {
        projectId: req.params.projectId,
        endTime: session.endTime
      });
    }

    res.json({ success: true, message: 'Bidding started successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.quitBid = async (req, res) => {
  try {
    const session = await BiddingSession.findOne({ projectId: req.params.projectId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const freelancerEntry = session.joinedFreelancers.find(f => f.freelancerId.toString() === req.user._id.toString());
    if (freelancerEntry) {
      freelancerEntry.isQuit = true;
      await session.save();
    }

    // Emit quit update via socket
    if (_io) {
      _io.to(`project_${req.params.projectId}`).emit('freelancer_quit_update', {
        freelancerId: req.user._id,
        projectId: req.params.projectId
      });
    }

    // If all active freelancers have quit and bidding is active → auto-conclude
    if (session.status === 'active') {
      const stillActive = session.joinedFreelancers.filter(f => !f.isQuit);
      if (stillActive.length === 0) {
        await endBidding(req.params.projectId, null, null);
        const updated = await BiddingSession.findOne({ projectId: req.params.projectId })
          .populate('winnerId', 'name profile aiScore');
        if (_io) {
          _io.to(`project_${req.params.projectId}`).emit('bid_ended', {
            projectId: req.params.projectId,
            winner: updated?.winnerId,
            winnerBidId: updated?.winnerBidId,
            reason: 'all_quit'
          });
        }
      }
    }

    res.json({ success: true, message: 'You have quit the bidding' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLobby = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('clientId', 'name');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const session = await BiddingSession.findOne({ projectId: req.params.projectId })
      .populate('joinedFreelancers.freelancerId', 'name profile aiScore');

    const quizResult = req.user ? await QuizResult.findOne({ freelancerId: req.user._id, projectId: req.params.projectId }) : null;

    res.json({
      success: true,
      data: {
        project: { title: project.title, budget: project.budget, deadline: project.deadline, minBid: project.minBid, bidDuration: project.bidDuration, bidStartTime: project.bidStartTime, freelancerLimit: project.freelancerLimit, status: project.status },
        session,
        hasCompletedQuiz: !!quizResult,
        quizScore: quizResult?.score || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.status !== 'bidding') return res.status(400).json({ success: false, message: 'Bidding is not active' });

    const session = await BiddingSession.findOne({ projectId: req.params.projectId });
    if (!session || session.status !== 'active') return res.status(400).json({ success: false, message: 'Bidding session not active' });

    if (bidAmount < project.minBid) return res.status(400).json({ success: false, message: `Bid must be at least ₹${project.minBid}` });
    if (session.currentLowestBid && bidAmount >= session.currentLowestBid) {
      return res.status(400).json({ success: false, message: 'Bid must be lower than current lowest bid' });
    }

    const quizResult = await QuizResult.findOne({ freelancerId: req.user._id, projectId: req.params.projectId });
    const quizScore = quizResult?.score || 0;

    const profileMatchScore = Math.min(100, (req.user.skills?.length || 0) * 10 + (req.user.aiScore || 0) * 0.5);
    const recommendationScore = aiService.calculateRecommendationScore(bidAmount, project.budget, quizScore, profileMatchScore);

    const bid = await Bid.create({
      projectId: req.params.projectId,
      freelancerId: req.user._id,
      bidAmount, aiQuizScore: quizScore, profileMatchScore, recommendationScore
    });

    // Update session
    session.currentLowestBid = bidAmount;
    session.currentLowestBidderId = req.user._id;
    session.totalBids += 1;
    session.lastBidAt = Date.now();
    session.concludingStartTime = null; // Reset 10s countdown if any
    await session.save();

    await bid.populate('freelancerId', 'name profile aiScore');
    res.json({ success: true, data: bid, message: 'Bid placed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBiddingSession = async (req, res) => {
  try {
    const session = await BiddingSession.findOne({ projectId: req.params.projectId })
      .populate('currentLowestBidderId', 'name profile')
      .populate('winnerId', 'name profile aiScore')
      .populate('joinedFreelancers.freelancerId', 'name profile');
    const bids = await Bid.find({ projectId: req.params.projectId })
      .populate('freelancerId', 'name profile aiScore')
      .sort({ bidAmount: 1, aiQuizScore: -1 });

    const freelancerId = req.user?._id;
    let hasCompletedQuiz = false;
    let quizScore = 0;
    
    if (freelancerId) {
      const quizResult = await QuizResult.findOne({ 
        projectId: req.params.projectId, 
        freelancerId: freelancerId 
      });
      if (quizResult) {
        hasCompletedQuiz = true;
        quizScore = quizResult.score;
      }
    }

    res.json({ 
      success: true, 
      data: { 
        session, 
        bids, 
        hasCompletedQuiz, 
        quizScore 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Quiz report for client — all freelancers' scores for a project
exports.getQuizReport = async (req, res) => {
  try {
    const results = await QuizResult.find({ projectId: req.params.projectId })
      .populate('freelancerId', 'name profile aiScore')
      .sort({ score: -1 });

    const scores = results.map((r, i) => ({
      rank: i + 1,
      freelancerId: r.freelancerId?._id,
      name: r.freelancerId?.name || 'Freelancer',
      avatar: r.freelancerId?.profile?.avatar,
      aiScore: r.freelancerId?.aiScore || 0,
      score: r.score,
      correct: r.questions.filter(q => q.isCorrect).length,
      total: r.questions.length,
      completedAt: r.completedAt
    }));

    res.json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBidFeedback = async (req, res) => {
  try {
    const { bidAmount } = req.query;
    const project = await Project.findById(req.params.projectId);
    const session = await BiddingSession.findOne({ projectId: req.params.projectId });

    const now = new Date();
    const endTime = session?.endTime ? new Date(session.endTime) : new Date();
    const timeLeft = Math.max(0, (endTime - now) / 1000);
    const joinedCount = session?.joinedFreelancers?.length || 0;

    const feedback = aiService.calculateSmartBidFeedback(
      Number(bidAmount),
      session?.currentLowestBid,
      project.minBid,
      project.budget,
      joinedCount,
      timeLeft
    );
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.selectWinner = async (req, res) => {
  try {
    const { winnerId, bidId } = req.body;
    const project = await Project.findOne({ _id: req.params.projectId, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await endBidding(req.params.projectId, winnerId, bidId);
    const updated = await BiddingSession.findOne({ projectId: req.params.projectId })
      .populate('winnerId', 'name profile aiScore');
    if (_io) {
      _io.to(`project_${req.params.projectId}`).emit('bid_ended', {
        projectId: req.params.projectId,
        winner: updated?.winnerId,
        winnerBidId: updated?.winnerBidId
      });
    }
    res.json({ success: true, message: 'Winner selected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBidHistory = async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.projectId })
      .populate('freelancerId', 'name profile aiScore')
      .sort({ bidAmount: 1, aiQuizScore: -1 });
    res.json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Internal function to end bidding and select winner
async function endBidding(projectId, winnerId, winnerBidId) {
  const session = await BiddingSession.findOne({ projectId });
  const project = await Project.findById(projectId);
  if (!session || !project) return;
  if (session.status === 'completed') return;

  let finalWinnerId = winnerId;
  let finalBidId = winnerBidId;

  if (!finalWinnerId) {
    // Auto-select: lowest bid, if tie then highest quiz score
    const bids = await Bid.find({ projectId }).sort({ bidAmount: 1, aiQuizScore: -1 });
    if (bids.length === 0) return;
    finalWinnerId = bids[0].freelancerId;
    finalBidId = bids[0]._id;
  }

  session.status = 'completed';
  session.winnerId = finalWinnerId;
  session.winnerBidId = finalBidId;
  await session.save();

  project.status = 'in_progress';
  project.assignedFreelancerId = finalWinnerId;
  project.winnerBidId = finalBidId;
  if (project.phases.length > 0) project.phases[0].status = 'in_progress';
  await project.save();

  await Bid.updateMany({ projectId, freelancerId: { $ne: finalWinnerId } }, { status: 'lost' });
  await Bid.updateOne({ _id: finalBidId }, { status: 'won' });

  // Notify winner and losers
  const winner = await User.findById(finalWinnerId);
  const winnerBid = await Bid.findById(finalBidId);
  if (winner) await sendBidWon(winner.email, winner.name, project.title, winnerBid?.bidAmount);

  const loserBids = await Bid.find({ projectId, status: 'lost' }).populate('freelancerId', 'email name');
  for (const bid of loserBids) {
    if (bid.freelancerId) await sendBidClosed(bid.freelancerId.email, bid.freelancerId.name, project.title);
  }
}

exports.endBidding = endBidding;
