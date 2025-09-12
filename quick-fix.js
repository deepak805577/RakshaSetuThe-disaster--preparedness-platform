#!/usr/bin/env node

/**
 * Quick Fix Script for Backend Issues
 * This will temporarily disable problematic routes and focus on core functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying quick fixes to get backend running...\n');

// Fix 1: Update server.ts to comment out problematic routes
const serverPath = path.join(__dirname, 'backend', 'src', 'server.ts');
const serverContent = fs.readFileSync(serverPath, 'utf8');

// Comment out family routes if they exist
const updatedServerContent = serverContent.replace(
  /app\.use\('\/api\/family',.*familyRoutes\);/g,
  '// app.use(\'/api/family\', familyRoutes); // Temporarily disabled'
);

fs.writeFileSync(serverPath, updatedServerContent);
console.log('✅ Temporarily disabled family routes in server.ts');

// Fix 2: Create a simple test endpoint
const testRouterContent = `
import express from 'express';
const router = express.Router();

// Test endpoint to verify backend is working
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running successfully!',
    timestamp: new Date().toISOString()
  });
});

export default router;
`;

const testRouterPath = path.join(__dirname, 'backend', 'src', 'routes', 'test.ts');
fs.writeFileSync(testRouterPath, testRouterContent);
console.log('✅ Created test routes');

// Fix 3: Add test routes to server
if (!updatedServerContent.includes('testRoutes')) {
  const finalServerContent = updatedServerContent.replace(
    /import authRoutes from/,
    `import testRoutes from './routes/test';\nimport authRoutes from`
  ).replace(
    /app\.use\('\/api\/auth'/,
    `app.use('/api/test', testRoutes);\napp.use('/api/auth'`
  );
  
  fs.writeFileSync(serverPath, finalServerContent);
  console.log('✅ Added test routes to server.ts');
}

console.log('\n🎯 Quick fixes applied. Try starting the server with: cd backend && npm run dev\n');
console.log('🌐 Test endpoints:');
console.log('   GET http://localhost:5000/api/test/health - Backend health check');
console.log('   POST http://localhost:5000/api/auth/login - Login with demo credentials');
console.log('   GET http://localhost:5000/api/modules - List disaster modules\n');
