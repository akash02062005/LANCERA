const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const crypto = require('crypto');
const { sendOTP, sendWelcome, sendResetPasswordEmail } = require('../services/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, passwordHash: password, role });
    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendOTP(email, otp);

    res.status(201).json({ success: true, message: 'Account created. OTP sent to email.', email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc) return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

    if (otpDoc.attempts >= 3) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ success: false, message: `Invalid OTP. ${3 - otpDoc.attempts} attempts remaining.` });
    }

    await User.updateOne({ email }, { isVerified: true });
    await OTP.deleteOne({ email });
    const user = await User.findOne({ email });
    await sendWelcome(email, user.name);

    res.json({ success: true, message: 'Email verified successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendOTP(email, otp);

    res.json({ success: true, message: 'New OTP sent to email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Please verify your email first' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user._id);
    const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan, aiScore: user.aiScore, profile: user.profile, skills: user.skills };

    res.json({ success: true, token, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { profile, skills } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile, skills } },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (30 mins)
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    try {
      await sendResetPasswordEmail(user.email, resetUrl);
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bootstrapAdmin = async (req, res) => {
  try {
    const { email, secret } = req.body;
    // Simple secret check for safety
    if (secret !== 'LANCERA_ADMIN_RECOVERY_2026') {
      return res.status(401).json({ success: false, message: 'Unauthorized bootstrap attempt' });
    }

    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `User ${email} elevated to admin`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
