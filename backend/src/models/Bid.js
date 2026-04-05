const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  aiQuizScore: { type: Number, default: 0 },
  profileMatchScore: { type: Number, default: 0 },
  recommendationScore: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'won', 'lost'], default: 'active' }
});

module.exports = mongoose.model('Bid', bidSchema);
