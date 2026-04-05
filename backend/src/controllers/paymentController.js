const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.getPaymentHistory = async (req, res) => {
  try {
    const query = req.user.role === 'client'
      ? { clientId: req.user._id }
      : { freelancerId: req.user._id };

    const payments = await Payment.find(query)
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { projectId, phaseIndex } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const phase = project.phases[phaseIndex];
    if (!phase) return res.status(404).json({ success: false, message: 'Phase not found' });

    if (phase.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Phase must be approved before payment' });
    }

    // Check if already paid
    const existing = await Payment.findOne({ projectId, phaseIndex: Number(phaseIndex), status: 'completed' });
    if (existing) return res.status(400).json({ success: false, message: 'This phase has already been paid' });

    // Create Razorpay order
    const options = {
      amount: phase.paymentAmount * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: `phase_${phaseIndex}_${projectId}`
    };

    const order = await razorpay.orders.create(options);

    // Create/update a pending payment record
    await Payment.findOneAndUpdate(
      { projectId, phaseIndex: Number(phaseIndex) },
      {
        projectId,
        phaseIndex: Number(phaseIndex),
        freelancerId: project.assignedFreelancerId,
        clientId: req.user._id,
        amount: phase.paymentAmount,
        status: 'pending',
        razorpayOrderId: order.id
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { order, key: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order. Check Razorpay keys.' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { projectId, phaseIndex, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    // Verify Razorpay HMAC signature
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    const payment = await Payment.findOneAndUpdate(
      { projectId, phaseIndex: Number(phaseIndex) },
      {
        razorpayPaymentId,
        razorpayOrderId,
        status: 'completed'
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Payment verified successfully', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
