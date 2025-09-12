const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/disaster-preparedness-punjab');
    console.log('✓ Connected to MongoDB');
    
    // Get User model
    const User = require('./dist/models/User').default;
    
    // Find the admin user
    const user = await User.findOne({ email: 'admin@demo.com' }).select('+password');
    
    if (!user) {
      console.log('✗ User not found');
      process.exit(1);
    }
    
    console.log('✓ User found:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Password hash exists:', !!user.password);
    console.log('  Password hash length:', user.password ? user.password.length : 0);
    
    // Test password comparison
    const testPassword = 'admin123';
    console.log('\nTesting password:', testPassword);
    
    // Direct bcrypt comparison
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Direct bcrypt comparison result:', isMatch);
    
    // Using model method
    const isMatchMethod = await user.comparePassword(testPassword);
    console.log('Model method comparison result:', isMatchMethod);
    
    // If password doesn't match, reset it
    if (!isMatch) {
      console.log('\n✗ Password does not match. Resetting password...');
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(testPassword, salt);
      await user.save();
      console.log('✓ Password reset successfully');
      
      // Test again
      const updatedUser = await User.findOne({ email: 'admin@demo.com' }).select('+password');
      const newMatch = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('Password match after reset:', newMatch);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
