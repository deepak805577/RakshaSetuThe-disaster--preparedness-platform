const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (same as in server-auth.js)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'parent'],
    default: 'student'
  },
  phone: String,
  school: String,
  grade: Number,
  points: {
    type: Number,
    default: 0
  },
  badges: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profile: {
    avatar: String,
    district: String,
    emergencyContact: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function viewUserData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-preparedness-punjab');
    console.log('✅ Connected to MongoDB\n');

    console.log('👥 USER DATA (without passwords):');
    console.log('=' .repeat(80));
    
    // Get users without passwords
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. USER ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Phone: ${user.phone || 'Not provided'}`);
        console.log(`   School: ${user.school || 'Not provided'}`);
        console.log(`   Grade: ${user.grade || 'Not provided'}`);
        console.log(`   Points: ${user.points}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
        console.log(`   District: ${user.profile?.district || 'Not provided'}`);
        console.log(`   Emergency Contact: ${user.profile?.emergencyContact || 'Not provided'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Updated: ${user.updatedAt}`);
      });
    }

    console.log('\n🔒 ENCRYPTED PASSWORD DATA:');
    console.log('=' .repeat(80));
    
    // Get users WITH passwords (for admin/debugging purposes)
    const usersWithPasswords = await User.find({}).select('+password');
    
    usersWithPasswords.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}:`);
      console.log(`   Encrypted Password: ${user.password}`);
      console.log(`   Password Length: ${user.password.length} characters`);
      console.log(`   Password Hash Type: ${user.password.startsWith('$2a$') ? 'bcrypt' : 'Unknown'}`);
    });

    console.log('\n📊 DATABASE STATISTICS:');
    console.log('=' .repeat(80));
    console.log(`Total Users: ${users.length}`);
    console.log(`Active Users: ${users.filter(u => u.isActive).length}`);
    console.log(`Students: ${users.filter(u => u.role === 'student').length}`);
    console.log(`Teachers: ${users.filter(u => u.role === 'teacher').length}`);
    console.log(`Parents: ${users.filter(u => u.role === 'parent').length}`);
    console.log(`Admins: ${users.filter(u => u.role === 'admin').length}`);

    console.log('\n🗃️ DATABASE INFO:');
    console.log('=' .repeat(80));
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Test password verification function
async function testPasswordVerification(email, testPassword) {
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`\n🔑 Password Test for ${email}:`);
    console.log(`   Test Password: "${testPassword}"`);
    console.log(`   Result: ${isMatch ? '✅ Correct' : '❌ Incorrect'}`);
  } catch (error) {
    console.error('❌ Password test error:', error.message);
  }
}

// Run the script
async function main() {
  await viewUserData();
  
  // Uncomment to test password verification
  // await testPasswordVerification('auth.test@example.com', 'testpass123');
}

main();
