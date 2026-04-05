const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, ctrl.getConversations);
router.get('/:projectId', protect, ctrl.getMessages);
router.post('/:projectId', protect, ctrl.sendMessage);
router.put('/:projectId/read', protect, ctrl.markRead);
router.post('/:projectId/upload', protect, ctrl.uploadMiddleware, ctrl.uploadFile);

module.exports = router;
