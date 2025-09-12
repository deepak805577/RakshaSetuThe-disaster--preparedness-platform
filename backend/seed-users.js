const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-preparedness-punjab', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// User Schema (simplified version for seeding)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
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
  profile: {
    avatar: String,
    district: String,
    emergencyContact: String
  }
}, {
  timestamps: true
});

// Get or create User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Demo users data
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
    school: 'Punjab Education Department',
    isActive: true,
    profile: {
      district: 'Chandigarh',
      emergencyContact: '1122334455'
    }
  },
  {
    name: 'Teacher Demo',
    email: 'teacher@demo.com',
    password: 'teacher123',
    role: 'teacher',
    phone: '9876543211',
    school: 'Government High School, Ludhiana',
    isActive: true,
    profile: {
      district: 'Ludhiana',
      emergencyContact: '1122334456'
    }
  },
  {
    name: 'Student Demo',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
    phone: '9876543212',
    school: 'Government High School, Ludhiana',
    grade: 10,
    points: 150,
    badges: ['first_module', 'quiz_master'],
    isActive: true,
    profile: {
      district: 'Ludhiana',
      emergencyContact: '1122334457'
    }
  },
  {
    name: 'Parent Demo',
    email: 'parent@demo.com',
    password: 'parent123',
    role: 'parent',
    phone: '9876543213',
    isActive: true,
    profile: {
      district: 'Amritsar',
      emergencyContact: '1122334458'
    }
  }
];

// Seed function
async function seedUsers() {
  try {
    console.log('\n🌱 Starting user seeding process...\n');
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists - updating...`);
          
          // Hash the password
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(userData.password, salt);
          
          // Update existing user
          existingUser.name = userData.name;
          existingUser.password = hashedPassword;
          existingUser.role = userData.role;
          existingUser.phone = userData.phone;
          existingUser.school = userData.school;
          existingUser.grade = userData.grade;
          existingUser.points = userData.points || 0;
          existingUser.badges = userData.badges || [];
          existingUser.isActive = userData.isActive;
          existingUser.profile = userData.profile;
          
          await existingUser.save();
          console.log(`✅ Updated: ${userData.email} (${userData.role})`);
        } else {
          // Hash the password
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(userData.password, salt);
          
          // Create new user with hashed password
          const newUser = await User.create({
            ...userData,
            password: hashedPassword
          });
          
          console.log(`✅ Created: ${userData.email} (${userData.role})`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${userData.email}:`, error.message);
      }
    }
    
    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const parentCount = await User.countDocuments({ role: 'parent' });
    
    console.log(`Total Users: ${userCount}`);
    console.log(`Admins: ${adminCount}`);
    console.log(`Teachers: ${teacherCount}`);
    console.log(`Students: ${studentCount}`);
    console.log(`Parents: ${parentCount}`);
    
    console.log('\n🔐 Demo Credentials:');
    console.log('===================');
    demoUsers.forEach(user => {
      console.log(`${user.role.padEnd(10)} - Email: ${user.email.padEnd(20)} Password: ${user.password}`);
    });
    
    console.log('\n✅ User seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

// Main execution
async function main() {
  try {
    await connectDB();
    await seedUsers();
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Main process error:', error);
    process.exit(1);
  }
}

// Run the seeding
main();
