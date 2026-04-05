const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, default: '' },
  messageType: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  readStatus: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);
