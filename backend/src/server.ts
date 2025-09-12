import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import { 
  securityMiddleware, 
  authLimiter, 
  uploadLimiter,
  auditLogger 
} from './middleware/security';

// Import routes
import testRoutes from './routes/test';
import authRoutes from './routes/auth';
import moduleRoutes from './routes/modules';
import gamificationRoutes from './routes/gamification';
import drillRoutes from './routes/drills';
import enhancedDrillRoutes from './routes/enhancedDrills';
import adminRoutes from './routes/admin';
import emergencyRoutes from './routes/emergency';
import alertRoutes from './routes/alerts';
import schoolRoutes from './routes/schools';
// import familyRoutes from './routes/family';

// Import services
import { seedAllModules } from './services/seedData';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.CORS_ORIGIN || 'https://frontend-hgq0wsbob-omkars-projects-9693e6b0.vercel.app'] 
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:3001',
          'file://',
          null
        ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Apply security middleware
app.use(securityMiddleware);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware - Enhanced for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://frontend-hgq0wsbob-omkars-projects-9693e6b0.vercel.app'] 
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000', 
        'http://localhost:3001',
        'file://', // Allow local HTML files
        null // Allow requests with no origin (like mobile apps)
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Static files
app.use(express.static('public'));

// API Routes with rate limiting and audit logging
app.use('/api/test', testRoutes);
app.use('/api/auth', authLimiter, auditLogger('auth'), authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/drills', drillRoutes);
app.use('/api/enhanced-drills', enhancedDrillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/schools', schoolRoutes);
// app.use('/api/family', familyRoutes); // Temporarily disabled

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disaster Preparedness API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Socket.io connection handling for real-time drill sessions
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join drill room
  socket.on('join-drill', (data) => {
    const { userId, drillType } = data;
    const roomId = `drill-${userId}`;
    socket.join(roomId);
    
    console.log(`User ${userId} joined drill room: ${roomId}`);
    
    // Emit drill started event
    socket.emit('drill-joined', {
      roomId,
      drillType,
      message: 'Connected to drill session'
    });
  });

  // Handle drill step completion
  socket.on('step-completed', (data) => {
    const { userId, stepNumber, completionTime } = data;
    const roomId = `drill-${userId}`;
    
    // Emit step completion to the specific room
    io.to(roomId).emit('step-completed', {
      stepNumber,
      completionTime,
      message: `Step ${stepNumber} completed in ${completionTime}s`
    });
  });

  // Handle drill completion
  socket.on('drill-completed', (data) => {
    const { userId, totalTime, score } = data;
    const roomId = `drill-${userId}`;
    
    io.to(roomId).emit('drill-completed', {
      totalTime,
      score,
      message: 'Drill completed successfully!'
    });
  });

  // Handle drill progress updates
  socket.on('drill-progress', (data) => {
    const { userId, currentStep, progress } = data;
    const roomId = `drill-${userId}`;
    
    io.to(roomId).emit('progress-update', {
      currentStep,
      progress
    });
  });

  // Handle emergency alerts for Punjab
  socket.on('join-alerts', (data) => {
    const { district } = data;
    socket.join(`alerts-${district}`);
    console.log(`User joined alerts for district: ${district}`);
  });

  // Admin broadcast emergency alert
  socket.on('broadcast-alert', (data) => {
    const { districts, alert } = data;
    
    districts.forEach((district: string) => {
      io.to(`alerts-${district}`).emit('emergency-alert', {
        ...alert,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log(`Emergency alert broadcasted to districts: ${districts.join(', ')}`);
  });

  // Handle leaderboard updates
  socket.on('join-leaderboard', (data) => {
    const { school, grade } = data;
    const leaderboardRoom = school ? `leaderboard-${school}` : 'leaderboard-global';
    socket.join(leaderboardRoom);
  });

  // Broadcast leaderboard updates
  socket.on('leaderboard-update', (data) => {
    const { school, leaderboardData } = data;
    const room = school ? `leaderboard-${school}` : 'leaderboard-global';
    
    io.to(room).emit('leaderboard-updated', leaderboardData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`
    🚀 Disaster Preparedness API Server started!
    📡 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
    🌐 API Health: http://localhost:${PORT}/api/health
    📊 Socket.io server ready for real-time connections
    💾 Database: MongoDB connection established
    🛡️  JWT Authentication enabled
    🔥 Ready to serve Punjab schools!
  `);
  
  // Seed initial data in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      await seedAllModules();
    } catch (error) {
      console.error('⚠️  Seeding error (non-fatal):', error);
      console.log('📡 Server will continue running without seeding');
    }
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export { io };
