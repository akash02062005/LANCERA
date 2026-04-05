const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/history', protect, ctrl.getPaymentHistory);
router.post('/order', protect, ctrl.createOrder);
router.post('/verify', protect, ctrl.verifyPayment);

module.exports = router;
