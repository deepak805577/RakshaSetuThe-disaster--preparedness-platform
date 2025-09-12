const loginHandler = require('./api/auth/login.js');

async function testLogin(email, password) {
  console.log(`\n🔍 Testing login: ${email} with password: ${password}`);
  
  let responseData = null;
  let statusCode = 200;
  
  // Mock request object
  const mockReq = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    on: function(event, callback) {
      if (event === 'data') {
        callback(JSON.stringify({ email, password }));
      } else if (event === 'end') {
        callback();
      }
    }
  };

  // Mock response object
  const mockRes = {
    setHeader: () => {},
    status: function(code) {
      statusCode = code;
      return this;
    },
    json: function(data) {
      responseData = data;
      console.log(`📊 Status: ${statusCode}`);
      console.log(`📝 Response:`, JSON.stringify(data, null, 2));
    },
    end: () => {}
  };

  try {
    await loginHandler(mockReq, mockRes);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
  
  return { statusCode, responseData };
}

async function runTests() {
  console.log('🚀 Testing Authentication API Functions...\n');
  
  // Test valid credentials
  await testLogin('admin@demo.com', 'password123');
  await testLogin('teacher@demo.com', 'password123');
  await testLogin('student@demo.com', 'password123');
  
  // Test invalid credentials
  await testLogin('admin@demo.com', 'wrongpassword');
  await testLogin('nonexistent@email.com', 'password123');
  
  console.log('\n✅ Testing complete!');
}

runTests().catch(console.error);
