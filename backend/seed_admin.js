require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lancera');
    
    const adminEmail = 'admin@lancera.com';
    const existing = await User.findOne({ email: adminEmail });
    
    if (existing) {
      existing.role = 'admin';
      existing.isVerified = true;
      await existing.save();
      console.log('Admin user updated successfully.');
    } else {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
