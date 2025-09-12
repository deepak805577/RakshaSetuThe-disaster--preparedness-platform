// Demo users (same as register.js for consistency)
const users = [
  {
    _id: 'demo1',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    points: 0,
    badges: [],
    isActive: true
  },
  {
    _id: 'demo2', 
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    password: 'password123',
    role: 'teacher',
    points: 75,
    badges: ['educator'],
    isActive: true
  },
  {
    _id: 'demo3', 
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
    points: 150,
    badges: ['safety-champion'],
    isActive: true
  }
];

const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

module.exports = async (req, res) => {
  // Enhanced CORS headers for mobile compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const body = await parseBody(req);
    const { email, password } = body;
    
    // Enhanced logging for mobile debugging
    console.log('Login attempt:', {
      email,
      userAgent: req.headers['user-agent'],
      method: req.method,
      contentType: req.headers['content-type'],
      origin: req.headers.origin,
      bodyReceived: !!body,
      timestamp: new Date().toISOString()
    });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password (plain text for demo)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Generate simple token
    const token = Buffer.from(JSON.stringify({ id: user._id, email: user.email, role: user.role })).toString('base64');
    
    // Remove password from output
    const { password: _, ...userOutput } = user;
    userOutput.lastLogin = new Date();
    
    console.log('Login successful for:', email);
    
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
};
