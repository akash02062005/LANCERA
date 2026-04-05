const Project = require('../models/Project');
const aiService = require('../services/aiService');
const crypto = require('crypto');

const generateInviteCode = () => 'GS-PRJ-' + crypto.randomBytes(3).toString('hex').toUpperCase();

exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, minBid, duration, freelancerLimit, bidDuration, bidStartTime, phases, skills, closedCommunity, autoApprove, aiGenerated } = req.body;

    const projectData = {
      title, description, budget, minBid, duration, freelancerLimit, bidDuration,
      bidStartTime, skills, autoApprove, aiGenerated,
      clientId: req.user._id,
      phases: phases || [],
      closedCommunity: {
        enabled: closedCommunity?.enabled || false,
        inviteCode: closedCommunity?.enabled ? generateInviteCode() : ''
      }
    };

    const project = await Project.create(projectData);
    await project.populate('clientId', 'name email profile');
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { search, skill, minBudget, maxBudget, status, closed, sort, page = 1, limit = 12 } = req.query;
    const query = { status: { $in: ['open', 'bidding'] } };

    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    if (minBudget || maxBudget) query.budget = {};
    if (minBudget) query.budget.$gte = Number(minBudget);
    if (maxBudget) query.budget.$lte = Number(maxBudget);
    if (closed === 'true') query['closedCommunity.enabled'] = true;
    if (closed === 'false') query['closedCommunity.enabled'] = false;

    const sortOptions = sort === 'budget_asc' ? { budget: 1 } : sort === 'budget_desc' ? { budget: -1 } : { createdAt: -1 };

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('clientId', 'name profile.orgName')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: projects, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email profile')
      .populate('assignedFreelancerId', 'name email profile skills aiScore');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    Object.assign(project, req.body);
    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user._id },
      { status: 'cancelled' }, { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user._id })
      .populate('assignedFreelancerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const Bid = require('../models/Bid');
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('projectId', 'title budget status deadline')
      .sort({ timestamp: -1 });
    res.json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.aiGenerateDescription = async (req, res) => {
  try {
    const { title, keywords, description: existingDescription } = req.body;
    
    let description;
    if (existingDescription && existingDescription.trim().length > 0) {
      // Refine existing description
      description = await aiService.refineProjectDescription(existingDescription);
    } else {
      // Generate new description from title
      description = await aiService.generateProjectDescription(title, keywords || '');
    }
    
    res.json({ success: true, data: { description } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.aiSuggestBudget = async (req, res) => {
  try {
    const { description, skills } = req.body;
    const budget = await aiService.suggestBudget(description, skills || []);
    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.aiSuggestPhases = async (req, res) => {
  try {
    const { description, duration } = req.body;
    const phases = await aiService.suggestPhases(description, duration, '');
    res.json({ success: true, data: phases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.aiIdentifySkills = async (req, res) => {
  try {
    const { description } = req.body;
    const skills = await aiService.identifySkills(description);
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestJoin = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!project.closedCommunity.enabled) return res.status(400).json({ success: false, message: 'This is an open project' });
    if (project.closedCommunity.inviteCode !== inviteCode) return res.status(400).json({ success: false, message: 'Invalid invite code' });

    const existing = project.closedCommunity.joinRequests.find(r => r.freelancerId.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ success: false, message: 'Request already sent', status: existing.status });

    project.closedCommunity.joinRequests.push({ freelancerId: req.user._id });
    await project.save();
    res.json({ success: true, message: 'Join request sent. Waiting for client approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handleJoinRequest = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { action } = req.body;
    const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const request = project.closedCommunity.joinRequests.find(r => r.freelancerId.toString() === freelancerId);
    if (!request) return res.status(404).json({ success: false, message: 'Join request not found' });

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    if (action === 'accept') project.closedCommunity.acceptedFreelancers.push(freelancerId);
    await project.save();
    res.json({ success: true, message: `Request ${request.status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJoinRequests = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id })
      .populate('closedCommunity.joinRequests.freelancerId', 'name email profile skills aiScore');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project.closedCommunity.joinRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
