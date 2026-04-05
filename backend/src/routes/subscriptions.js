const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', ctrl.getPlans);
router.get('/my', protect, ctrl.getMySubscription);
router.post('/subscribe', protect, ctrl.subscribe);
router.post('/cancel', protect, ctrl.cancelSubscription);

module.exports = router;
