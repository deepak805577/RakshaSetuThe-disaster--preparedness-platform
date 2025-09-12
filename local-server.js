const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import API functions
const loginHandler = require('./api/auth/login');
const registerHandler = require('./api/auth/register');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Local development server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes - wrap the Vercel functions
app.post('/api/auth/login', async (req, res) => {
  console.log('🔑 Login request received:', req.body);
  
  // Create a mock Vercel request object
  const mockReq = {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body),
    on: function(event, callback) {
      if (event === 'data') {
        callback(this.body);
      } else if (event === 'end') {
        callback();
      }
    }
  };

  // Create a mock Vercel response object
  const mockRes = {
    setHeader: (key, value) => res.setHeader(key, value),
    status: (code) => {
      res.status(code);
      return mockRes;
    },
    json: (data) => {
      console.log('📤 Login response:', data);
      res.json(data);
    },
    end: () => res.end()
  };

  try {
    await loginHandler(mockReq, mockRes);
  } catch (error) {
    console.error('❌ Login handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register request received:', req.body);
  
  // Create a mock Vercel request object
  const mockReq = {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body),
    on: function(event, callback) {
      if (event === 'data') {
        callback(this.body);
      } else if (event === 'end') {
        callback();
      }
    }
  };

  // Create a mock Vercel response object
  const mockRes = {
    setHeader: (key, value) => res.setHeader(key, value),
    status: (code) => {
      res.status(code);
      return mockRes;
    },
    json: (data) => {
      console.log('📤 Register response:', data);
      res.json(data);
    },
    end: () => res.end()
  };

  try {
    await registerHandler(mockReq, mockRes);
  } catch (error) {
    console.error('❌ Register handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  });
});

app.listen(PORT, () => {
  console.log('🚀 Local development server started!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   - GET  /api/health');
  console.log('   - POST /api/auth/login');
  console.log('   - POST /api/auth/register');
  console.log('\n✨ You can now use the frontend with local API functions!\n');
});
