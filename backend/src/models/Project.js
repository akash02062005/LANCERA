const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  deadline: { type: Date },
  paymentAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  rejectionFeedback: { type: String, default: '' },
  deliverables: [{ type: String }]
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: Number, required: true },
  minBid: { type: Number, required: true },
  duration: { type: String, required: true },
  freelancerLimit: { type: Number, default: 20 },
  bidDuration: { type: Number, default: 5 },
  bidStartTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['draft', 'open', 'bidding', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  closedCommunity: {
    enabled: { type: Boolean, default: false },
    inviteCode: { type: String, default: '' },
    joinRequests: [{
      freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      requestedAt: { type: Date, default: Date.now }
    }],
    acceptedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  phases: [phaseSchema],
  skills: [{ type: String }],
  assignedFreelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winnerBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  autoApprove: { type: Boolean, default: false },
  healthStatus: { type: String, enum: ['on_track', 'at_risk', 'delayed'], default: 'on_track' },
  aiGenerated: { type: Boolean, default: false },
  currentPhaseIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
