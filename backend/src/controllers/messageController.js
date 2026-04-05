const Message = require('../models/Message');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadMiddleware = upload.single('file');
const User = require('../models/User');
const Project = require('../models/Project');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Direct Messages Aggregate
    const directMessages = await Message.aggregate([
      {
        $match: {
          projectId: null,
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$content" },
          messageType: { $first: "$messageType" },
          timestamp: { $first: "$timestamp" },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$readStatus", false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Project Messages Aggregate
    const projectMessages = await Message.aggregate([
      {
        $match: {
          projectId: { $ne: null },
          $or: [{ senderId: userId }, { receiverId: userId }] // For shared project chats
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$projectId",
          lastMessage: { $first: "$content" },
          messageType: { $first: "$messageType" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);

    // Populate Details
    const conversations = [];

    for (const dm of directMessages) {
      const otherUser = await User.findById(dm._id).select('name role profile');
      if (otherUser) {
        conversations.push({
          _id: otherUser._id,
          name: otherUser.name,
          type: 'direct',
          lastMessage: dm.lastMessage,
          messageType: dm.messageType,
          time: dm.timestamp,
          unread: dm.unread
        });
      }
    }

    for (const pm of projectMessages) {
      const project = await Project.findById(pm._id).select('title');
      if (project) {
        conversations.push({
          _id: project._id,
          name: project.title,
          type: 'project',
          lastMessage: pm.lastMessage,
          messageType: pm.messageType,
          time: pm.timestamp
        });
      }
    }

    res.json({ success: true, data: conversations.sort((a, b) => new Date(b.time) - new Date(a.time)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { projectId } = req.params;
    
    let query = { projectId };
    if (projectId === 'direct') {
      const { userId } = req.query;
      query = {
        projectId: null,
        $or: [
          { senderId: req.user._id, receiverId: userId },
          { senderId: userId, receiverId: req.user._id }
        ]
      };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name profile role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, receiverId, messageType } = req.body;
    const { projectId } = req.params;
    
    const message = await Message.create({
      projectId: projectId === 'direct' ? null : projectId,
      senderId: req.user._id,
      receiverId, content,
      messageType: messageType || 'text'
    });
    await message.populate('senderId', 'name profile role');
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Message.updateMany({ projectId: req.params.projectId, receiverId: req.user._id, readStatus: false }, { readStatus: true });
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    const isImage = req.file.mimetype.startsWith('image/');
    const { projectId } = req.params;
    const { receiverId } = req.body;
    
    const message = await Message.create({
      projectId: projectId === 'direct' ? null : projectId,
      senderId: req.user._id,
      receiverId: projectId === 'direct' ? receiverId : null,
      content: req.file.originalname,
      messageType: isImage ? 'image' : 'file',
      fileUrl,
      fileName: req.file.originalname
    });
    await message.populate('senderId', 'name profile role');
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
