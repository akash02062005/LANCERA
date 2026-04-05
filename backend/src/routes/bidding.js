const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/biddingController');
const { protect, optionalAuth, requireRole } = require('../middleware/auth');

router.post('/join/:projectId', protect, requireRole('freelancer'), ctrl.joinBid);
router.get('/quiz/:projectId/start', protect, requireRole('freelancer'), ctrl.startQuiz);
router.post('/quiz/:projectId/submit', protect, requireRole('freelancer'), ctrl.submitQuiz);
router.get('/quiz-report/:projectId', protect, requireRole('client'), ctrl.getQuizReport);
router.get('/lobby/:projectId', protect, ctrl.getLobby);
router.post('/start/:projectId', protect, requireRole('client'), ctrl.startBidding);
router.post('/bid/:projectId', protect, requireRole('freelancer'), ctrl.placeBid);
router.get('/session/:projectId', optionalAuth, ctrl.getBiddingSession);
router.get('/feedback/:projectId', protect, requireRole('freelancer'), ctrl.getBidFeedback);
router.post('/quit/:projectId', protect, requireRole('freelancer'), ctrl.quitBid);
router.post('/winner/:projectId', protect, requireRole('client'), ctrl.selectWinner);
router.get('/history/:projectId', optionalAuth, ctrl.getBidHistory);

module.exports = router;
