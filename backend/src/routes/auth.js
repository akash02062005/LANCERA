const express = require('express');
const router = express.Router();
const { signup, verifyOTP, resendOTP, login, getMe, updateProfile, forgotPassword, resetPassword, bootstrapAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/bootstrap-admin', bootstrapAdmin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
