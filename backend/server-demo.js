const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration - allow all origins for demo
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// In-memory users storage (for demo purposes)
let users = [
  {
    _id: '1',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdKZWGJcyLIAOUu', // password123
    role: 'admin',
    phone: '9876543210',
    school: 'Demo School',
    isActive: true,
    lastLogin: new Date(),
    profile: {
      district: 'Ludhiana',
      emergencyContact: '9876543211'
    },
    points: 0,
    badges: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Demo Student',
    email: 'student@demo.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdKZWGJcyLIAOUu', // password123
    role: 'student',
    phone: '9876543212',
    school: 'Demo School',
    grade: 10,
    isActive: true,
    profile: {
      district: 'Ludhiana',
      emergencyContact: '9876543213'
    },
    points: 150,
    badges: ['safety-champion'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Utility functions
const generateId = () => Date.now().toString();
const findUserByEmail = (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase());
const findUserById = (id) => users.find(u => u._id === id);

// JWT secret
const JWT_SECRET = 'disaster_preparedness_punjab_secret_key_2024';

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);
    
    if (!user || !user.isActive) {
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

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIH Disaster Preparedness App - Demo Version',
    version: '1.0.0-demo',
    features: {
      authentication: 'In-memory storage',
      database: 'Mock data',
      realtime: 'Disabled for demo'
    },
    demo_accounts: {
      admin: 'admin@demo.com / password123',
      student: 'student@demo.com / password123'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running - Demo Mode',
    timestamp: new Date().toISOString(),
    environment: 'demo',
    users_count: users.length,
    features: 'Limited demo functionality'
  });
});

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
    if (findUserByEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      phone,
      school,
      grade,
      profile: profile || {},
      points: 0,
      badges: [],
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Remove password from output
    const { password: _, ...userOutput } = user;
    
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
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
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
    
    // Check for user
    const user = findUserByEmail(email);
    
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
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    user.updatedAt = new Date();
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Remove password from output
    const { password: _, ...userOutput } = user;
    
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
      message: 'Server error during login'
    });
  }
});

// Get profile endpoint
app.get('/api/auth/profile', authenticate, (req, res) => {
  try {
    const { password: _, ...userOutput } = req.user;
    
    res.status(200).json({
      success: true,
      data: userOutput
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
app.put('/api/auth/profile', authenticate, (req, res) => {
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
    
    // Update user data
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        req.user[key] = req.body[key];
      }
    });
    
    req.user.updatedAt = new Date();
    
    const { password: _, ...userOutput } = req.user;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userOutput
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
        points: 100,
        status: 'available'
      },
      {
        _id: '2',
        title: 'Fire Safety',
        description: 'Essential fire safety and prevention techniques',
        category: 'Fire Hazards',
        difficulty: 'Beginner',
        duration: 25,
        points: 80,
        status: 'available'
      },
      {
        _id: '3',
        title: 'Flood Preparedness',
        description: 'How to prepare for and respond to floods',
        category: 'Natural Disasters',
        difficulty: 'Intermediate',
        duration: 35,
        points: 120,
        status: 'available'
      }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📝 Demo accounts available:`);
  console.log(`   Admin: admin@demo.com / password123`);
  console.log(`   Student: student@demo.com / password123`);
  console.log(`⚠️  Note: This is a demo version with in-memory storage`);
});
