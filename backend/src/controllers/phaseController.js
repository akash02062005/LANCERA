const Project = require('../models/Project');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendPhaseApproved } = require('../services/emailService');
const { calculateProjectHealth } = require('../services/aiService');

exports.getPhases = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('clientId', 'name email')
      .populate('assignedFreelancerId', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: { phases: project.phases, project } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePhase = async (req, res) => {
  try {
    const { phaseIndex } = req.params;
    const project = await Project.findOne({ _id: req.params.projectId, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    Object.assign(project.phases[phaseIndex], req.body);
    await project.save();
    res.json({ success: true, data: project.phases[phaseIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitPhase = async (req, res) => {
  try {
    const { phaseIndex } = req.params;
    const { deliverables } = req.body;
    const project = await Project.findOne({ _id: req.params.projectId, assignedFreelancerId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or not assigned to you' });

    const phase = project.phases[phaseIndex];
    if (!phase) return res.status(404).json({ success: false, message: 'Phase not found' });
    if (!['in_progress', 'rejected'].includes(phase.status)) return res.status(400).json({ success: false, message: 'Phase cannot be submitted in current state' });

    phase.status = 'submitted';
    phase.submittedAt = new Date();
    if (deliverables) phase.deliverables = deliverables;

    // Update health
    project.healthStatus = calculateProjectHealth(project.phases, project.createdAt);
    await project.save();

    res.json({ success: true, message: 'Phase submitted for review', data: phase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approvePhase = async (req, res) => {
  try {
    const { phaseIndex } = req.params;
    const project = await Project.findOne({ _id: req.params.projectId, clientId: req.user._id })
      .populate('assignedFreelancerId', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const phase = project.phases[phaseIndex];
    if (phase.status !== 'submitted') return res.status(400).json({ success: false, message: 'Phase must be submitted before approval' });

    phase.status = 'approved';
    phase.approvedAt = new Date();

    // Move to next phase
    const nextIndex = Number(phaseIndex) + 1;
    if (nextIndex < project.phases.length) {
      project.phases[nextIndex].status = 'in_progress';
      project.currentPhaseIndex = nextIndex;
    } else {
      project.status = 'completed';
    }

    // Create payment record
    await Payment.create({
      projectId: project._id,
      phaseIndex: Number(phaseIndex),
      freelancerId: project.assignedFreelancerId._id,
      clientId: req.user._id,
      amount: phase.paymentAmount,
      status: 'completed'
    });

    // Update freelancer earnings
    await User.findByIdAndUpdate(project.assignedFreelancerId._id, {
      $inc: { totalEarned: phase.paymentAmount }
    });

    project.healthStatus = calculateProjectHealth(project.phases, project.createdAt);
    await project.save();

    await sendPhaseApproved(
      project.assignedFreelancerId.email,
      project.assignedFreelancerId.name,
      project.title, Number(phaseIndex), phase.paymentAmount
    );

    res.json({ success: true, message: `Phase ${Number(phaseIndex) + 1} approved and payment released`, data: phase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectPhase = async (req, res) => {
  try {
    const { phaseIndex } = req.params;
    const { feedback } = req.body;
    const project = await Project.findOne({ _id: req.params.projectId, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const phase = project.phases[phaseIndex];
    if (phase.status !== 'submitted') return res.status(400).json({ success: false, message: 'Phase must be submitted to reject' });

    phase.status = 'rejected';
    phase.rejectionFeedback = feedback || '';
    project.healthStatus = calculateProjectHealth(project.phases, project.createdAt);
    await project.save();

    res.json({ success: true, message: 'Phase rejected with feedback', data: phase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFreelancer = async (req, res) => {
  try {
    const { reason } = req.body;
    const project = await Project.findOne({ _id: req.params.projectId, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const removedFreelancerId = project.assignedFreelancerId;
    project.assignedFreelancerId = null;
    project.status = 'open';

    // Reset remaining phases
    project.phases.forEach((phase, i) => {
      if (!['approved'].includes(phase.status)) {
        phase.status = 'pending';
        phase.submittedAt = null;
        phase.approvedAt = null;
      }
    });

    await project.save();
    res.json({ success: true, message: 'Freelancer removed. Project reopened for bidding.', removedFreelancerId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
