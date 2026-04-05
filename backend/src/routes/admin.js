const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

// Protected admin routes
router.use(protect, requireRole('admin'));

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getAllUsers);
router.get('/projects', ctrl.getAllProjects);
router.put('/users/:userId/role', ctrl.updateUserRole);
router.delete('/users/:userId', ctrl.deleteUser);
router.delete('/projects/:projectId', ctrl.deleteProject);

module.exports = router;
