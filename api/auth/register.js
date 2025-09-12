// Simple in-memory storage for demo (resets on each function call)
let users = [
  {
    _id: 'demo1',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'password123', // Plain text for demo only
    role: 'admin'
  },
  {
    _id: 'demo2', 
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    password: 'password123',
    role: 'teacher'
  },
  {
    _id: 'demo3', 
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student'
  }
];
const JWT_SECRET = 'disaster_preparedness_punjab_secret_key_2024';

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
    const { name, email, password, role, phone, school, grade, profile } = body;
    
    console.log('Registration attempt:', { name, email, role });
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user (plain text password for demo only)
    const user = {
      _id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password, // Plain text for demo - NOT SECURE
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
    
    // Generate simple token (demo only)
    const token = Buffer.from(JSON.stringify({ id: user._id, email: user.email, role: user.role })).toString('base64');
    
    // Remove password from output
    const { password: _, ...userOutput } = user;
    
    console.log('Registration successful for:', email);
    
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
};
