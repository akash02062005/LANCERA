const Subscription = require('../models/Subscription');
const User = require('../models/User');

const PLANS = {
  starter: { name: 'Starter', price: 0, projectsPerMonth: 2, aiFeatures: false, description: 'Perfect for trying out the platform' },
  pro: { name: 'Pro', price: 999, projectsPerMonth: -1, aiFeatures: true, description: 'For growing freelancers and clients' },
  enterprise: { name: 'Enterprise', price: 4999, projectsPerMonth: -1, aiFeatures: true, teams: true, description: 'For businesses and power users' }
};

exports.getPlans = async (req, res) => {
  res.json({ success: true, data: PLANS });
};

exports.getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });
    res.json({ success: true, data: sub || { plan: 'starter', status: 'active' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const sub = await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      { plan, status: 'active', startDate: new Date(), endDate, razorpaySubscriptionId: `sub_mock_${Date.now()}` },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: plan });
    res.json({ success: true, data: sub, message: `Subscribed to ${PLANS[plan].name} plan` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    await Subscription.findOneAndUpdate({ userId: req.user._id }, { status: 'cancelled' });
    await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: 'starter' });
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
