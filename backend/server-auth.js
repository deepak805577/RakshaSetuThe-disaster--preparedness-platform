const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      const allowedOrigins = [
        'https://frontend-hgq0wsbob-omkars-projects-9693e6b0.vercel.app',
        'https://frontend-pq8wht2sz-omkars-projects-9693e6b0.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ];
      
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// User Schema
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

// Generate JWT token method
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET || 'disaster_preparedness_punjab_secret_key_2024',
    { 
      expiresIn: '7d'
    }
  );
};

// Get or create User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-preparedness-punjab', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Disaster Preparedness Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      modules: '/api/modules'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'disaster_preparedness_punjab_secret_key_2024');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Please authenticate'
    });
  }
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, school, grade, profile } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user (password will be hashed automatically by pre-save hook)
    const user = await User.create({
      name,
      email,
      password, // Raw password - will be hashed by pre-save hook
      role: role || 'student',
      phone,
      school,
      grade,
      profile
    });
    
    // Generate token using model method
    const token = user.generateAuthToken();
    
    // Remove password from output
    const userOutput = user.toObject();
    delete userOutput.password;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userOutput,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check for user with password field included
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }
    
    // Check password using model method
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token using model method
    const token = user.generateAuthToken();
    
    // Remove password from output
    const userOutput = user.toObject();
    delete userOutput.password;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userOutput,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get profile endpoint
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update profile endpoint
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'school', 'grade', 'profile'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Mock modules endpoint
app.get('/api/modules', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Earthquake Safety',
        description: 'Learn how to stay safe during earthquakes',
        category: 'Natural Disasters',
        difficulty: 'Beginner',
        duration: 30,
        points: 100
      },
      {
        _id: '2',
        title: 'Fire Safety',
        description: 'Essential fire safety and prevention techniques',
        category: 'Fire Hazards',
        difficulty: 'Beginner',
        duration: 25,
        points: 80
      },
      {
        _id: '3',
        title: 'Flood Preparedness',
        description: 'How to prepare for and respond to floods',
        category: 'Natural Disasters',
        difficulty: 'Intermediate',
        duration: 35,
        points: 120
      }
    ]
  });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  
  socket.on('join-drill', (data) => {
    socket.join(`drill-${data.userId}`);
    socket.emit('drill-joined', {
      message: 'Connected to drill session',
      drillType: data.drillType
    });
  });
  
  socket.on('step-completed', (data) => {
    const roomId = `drill-${data.userId}`;
    io.to(roomId).emit('step-completed', {
      stepNumber: data.stepNumber,
      completionTime: data.completionTime
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.NODE_ENV === 'development' ? 'all origins' : 'specific origins'}`);
});

module.exports = app;
