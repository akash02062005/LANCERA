const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/phaseController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/:projectId', protect, ctrl.getPhases);
router.put('/:projectId/:phaseIndex', protect, requireRole('client'), ctrl.updatePhase);
router.post('/:projectId/:phaseIndex/submit', protect, requireRole('freelancer'), ctrl.submitPhase);
router.post('/:projectId/:phaseIndex/approve', protect, requireRole('client'), ctrl.approvePhase);
router.post('/:projectId/:phaseIndex/reject', protect, requireRole('client'), ctrl.rejectPhase);
router.post('/:projectId/remove-freelancer', protect, requireRole('client'), ctrl.removeFreelancer);

module.exports = router;
