const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Test server health
async function testServerHealth() {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Server Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server Health Check Failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Backend server is not running at', API_URL);
    }
    return false;
  }
}

// Test registration
async function testRegister() {
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'student'
    };
    
    console.log('\nTesting Registration with:', testUser);
    const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
    console.log('✅ Registration Response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Registration Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test login
async function testLogin() {
  try {
    const credentials = {
      email: 'student@demo.com',
      password: 'student123'
    };
    
    console.log('\nTesting Login with:', credentials);
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    console.log('✅ Login Response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Login Failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   Invalid credentials or user not found');
    }
    return null;
  }
}

// Test protected route
async function testProtectedRoute(token) {
  try {
    console.log('\nTesting Protected Route with token:', token ? 'Present' : 'Missing');
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected Route Access:', response.data);
  } catch (error) {
    console.error('❌ Protected Route Failed:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  console.log('================================\n');
  
  // Check if server is running
  const serverHealthy = await testServerHealth();
  
  if (!serverHealthy) {
    console.log('\n⚠️  Backend server is not running!');
    console.log('   Please start the backend server first:');
    console.log('   cd backend');
    console.log('   npm start');
    return;
  }
  
  // Test registration
  const registerResult = await testRegister();
  
  // Test login
  const loginResult = await testLogin();
  
  // Test protected route if login was successful
  if (loginResult && loginResult.token) {
    await testProtectedRoute(loginResult.token);
  }
  
  console.log('\n================================');
  console.log('✅ Tests Complete!\n');
}

// Run tests
runTests().catch(console.error);
