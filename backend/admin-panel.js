const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-preparedness-punjab');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function listUsers() {
  console.log('\n👥 ALL USERS:');
  console.log('='.repeat(80));
  
  const users = await User.find({});
  
  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  console.log('ID  | Name             | Email                    | Role    | Active | Last Login');
  console.log('-'.repeat(80));
  
  users.forEach((user, index) => {
    const lastLogin = user.lastLogin ? 
      user.lastLogin.toLocaleDateString('en-IN') : 'Never';
    console.log(
      `${(index + 1).toString().padStart(2)} | ${user.name.padEnd(16).substring(0, 16)} | ${user.email.padEnd(24).substring(0, 24)} | ${user.role.padEnd(7)} | ${user.isActive ? 'Yes   ' : 'No    '} | ${lastLogin}`
    );
  });
}

async function findUser() {
  const email = await question('\nEnter email to search: ');
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('\n📋 USER DETAILS:');
  console.log('-'.repeat(50));
  console.log(`ID: ${user._id}`);
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
  console.log(`Phone: ${user.phone || 'Not provided'}`);
  console.log(`School: ${user.school || 'Not provided'}`);
  console.log(`Grade: ${user.grade || 'Not provided'}`);
  console.log(`Points: ${user.points}`);
  console.log(`Active: ${user.isActive ? 'Yes' : 'No'}`);
  console.log(`Last Login: ${user.lastLogin || 'Never'}`);
  console.log(`District: ${user.profile?.district || 'Not provided'}`);
  console.log(`Emergency Contact: ${user.profile?.emergencyContact || 'Not provided'}`);
  console.log(`Created: ${user.createdAt}`);
  console.log(`Updated: ${user.updatedAt}`);
  console.log(`Password Hash: ${user.password}`);
}

async function testPassword() {
  const email = await question('\nEnter email: ');
  const password = await question('Enter password to test: ');
  
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }

  const isMatch = await user.comparePassword(password);
  console.log(`\n🔑 Password Test Result: ${isMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
}

async function updateUserStatus() {
  const email = await question('\nEnter email: ');
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log(`Current status: ${user.isActive ? 'Active' : 'Inactive'}`);
  const newStatus = await question('Set active status (true/false): ');
  
  user.isActive = newStatus.toLowerCase() === 'true';
  await user.save();
  
  console.log(`✅ User status updated to: ${user.isActive ? 'Active' : 'Inactive'}`);
}

async function deleteUser() {
  const email = await question('\nEnter email to delete: ');
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log(`⚠️  WARNING: You are about to delete user: ${user.name} (${user.email})`);
  const confirm = await question('Type "DELETE" to confirm: ');
  
  if (confirm === 'DELETE') {
    await User.deleteOne({ email });
    console.log('✅ User deleted successfully');
  } else {
    console.log('❌ Deletion cancelled');
  }
}

async function resetPassword() {
  const email = await question('\nEnter email: ');
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }

  const newPassword = await question('Enter new password: ');
  
  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();
  
  console.log('✅ Password reset successfully');
}

async function showStats() {
  const total = await User.countDocuments();
  const active = await User.countDocuments({ isActive: true });
  const students = await User.countDocuments({ role: 'student' });
  const teachers = await User.countDocuments({ role: 'teacher' });
  const parents = await User.countDocuments({ role: 'parent' });
  const admins = await User.countDocuments({ role: 'admin' });

  console.log('\n📊 DATABASE STATISTICS:');
  console.log('='.repeat(40));
  console.log(`Total Users: ${total}`);
  console.log(`Active Users: ${active}`);
  console.log(`Inactive Users: ${total - active}`);
  console.log(`Students: ${students}`);
  console.log(`Teachers: ${teachers}`);
  console.log(`Parents: ${parents}`);
  console.log(`Admins: ${admins}`);
}

async function showMenu() {
  console.log('\n🛠️  USER MANAGEMENT ADMIN PANEL');
  console.log('='.repeat(40));
  console.log('1. List all users');
  console.log('2. Find user by email');
  console.log('3. Test password');
  console.log('4. Update user status');
  console.log('5. Reset password');
  console.log('6. Delete user');
  console.log('7. Show statistics');
  console.log('8. Exit');
  console.log('='.repeat(40));
}

async function main() {
  console.log('🚀 Starting Admin Panel...');
  await connectDB();

  while (true) {
    try {
      await showMenu();
      const choice = await question('\nSelect option (1-8): ');

      switch (choice) {
        case '1':
          await listUsers();
          break;
        case '2':
          await findUser();
          break;
        case '3':
          await testPassword();
          break;
        case '4':
          await updateUserStatus();
          break;
        case '5':
          await resetPassword();
          break;
        case '6':
          await deleteUser();
          break;
        case '7':
          await showStats();
          break;
        case '8':
          console.log('👋 Goodbye!');
          rl.close();
          await mongoose.disconnect();
          process.exit(0);
        default:
          console.log('❌ Invalid option. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

main();
