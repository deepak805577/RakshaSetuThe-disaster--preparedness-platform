// Quick authentication test
async function testQuick() {
  const http = require('http');
  
  // Simple health check
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Server is running!');
      console.log('Response:', data);
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Server not responding:', e.message);
  });
  
  req.end();
}

testQuick();
