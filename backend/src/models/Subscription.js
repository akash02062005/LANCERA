const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  plan: { type: String, enum: ['starter', 'pro', 'enterprise'], required: true },
  razorpaySubscriptionId: { type: String, default: '' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
