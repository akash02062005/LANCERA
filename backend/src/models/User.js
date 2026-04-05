const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
  profile: {
    bio: { type: String, default: '' },
    portfolioLink: { type: String, default: '' },
    githubLink: { type: String, default: '' },
    linkedinLink: { type: String, default: '' },
    orgName: { type: String, default: '' },
    orgWebsite: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  skills: [{ type: String }],
  aiScore: { type: Number, default: 0 },
  quizCount: { type: Number, default: 0 },
  projectsCount: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
