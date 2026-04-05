const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', ctrl.getProjects);
router.post('/', protect, requireRole('client'), ctrl.createProject);
router.get('/my/projects', protect, requireRole('client'), ctrl.getMyProjects);
router.get('/my/bids', protect, requireRole('freelancer'), ctrl.getMyBids);
router.post('/ai/description', protect, ctrl.aiGenerateDescription);
router.post('/ai/budget', protect, ctrl.aiSuggestBudget);
router.post('/ai/phases', protect, ctrl.aiSuggestPhases);
router.post('/ai/skills', protect, ctrl.aiIdentifySkills);
router.get('/:id', ctrl.getProject);
router.put('/:id', protect, requireRole('client'), ctrl.updateProject);
router.delete('/:id', protect, requireRole('client'), ctrl.deleteProject);
router.post('/:id/join-request', protect, requireRole('freelancer'), ctrl.requestJoin);
router.put('/:id/join-request/:freelancerId', protect, requireRole('client'), ctrl.handleJoinRequest);
router.get('/:id/join-requests', protect, requireRole('client'), ctrl.getJoinRequests);

module.exports = router;
