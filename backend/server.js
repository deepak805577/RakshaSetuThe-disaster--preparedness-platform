const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
      callback(null, true); // Allow all for now during development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected successfully');
    } else {
      console.log('Running without database - MONGODB_URI not set');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
      modules: '/api/modules',
      auth: '/api/auth'
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

// Mock modules endpoint (works without database)
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

// Mock auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        _id: 'user-' + Date.now(),
        name,
        email,
        role: 'student',
        points: 0,
        level: 1
      }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        _id: 'user-' + Date.now(),
        name: 'Test User',
        email,
        role: 'student',
        points: 150,
        level: 2
      }
    }
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
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'all origins'}`);
});
