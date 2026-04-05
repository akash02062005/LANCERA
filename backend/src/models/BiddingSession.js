const mongoose = require('mongoose');

const biddingSessionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', unique: true, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  currentLowestBid: { type: Number },
  currentLowestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalBids: { type: Number, default: 0 },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winnerBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  status: { type: String, enum: ['waiting', 'lobby', 'active', 'completed'], default: 'waiting' },
  lastBidAt: { type: Date, default: Date.now },
  concludingStartTime: { type: Date },
  joinedFreelancers: [{
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hasCompletedQuiz: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
    isQuit: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('BiddingSession', biddingSessionSchema);
