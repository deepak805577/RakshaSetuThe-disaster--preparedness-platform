const { exec } = require('child_process');
const path = require('path');

console.log('🔧 Starting fix for login and module content issues...\n');

// List of fixes to apply
const fixes = [
  {
    name: 'Install missing dependencies',
    command: 'cd backend && npm install',
    description: 'Ensure all backend dependencies are installed'
  },
  {
    name: 'Build TypeScript backend',
    command: 'cd backend && npm run build',
    description: 'Compile TypeScript to JavaScript for proper execution'
  },
  {
    name: 'Seed database with correct module content',
    command: 'cd backend && npm run seed',
    description: 'Populate database with unique content for each disaster module'
  }
];

// Function to run a command and return a promise
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`⚙️  Running: ${command}`);
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️  Warning: ${stderr}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      resolve(stdout);
    });
  });
};

// Main execution function
async function applyFixes() {
  console.log('🚀 Applying fixes...\n');
  
  for (const fix of fixes) {
    try {
      console.log(`\n📋 ${fix.name}`);
      console.log(`   ${fix.description}`);
      console.log('   ⏳ Processing...');
      
      await runCommand(fix.command);
      console.log('   ✅ Completed successfully!');
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      console.log('\n🛑 Fix process stopped due to error. Please check the logs above.');
      return;
    }
  }
  
  console.log('\n🎉 All fixes applied successfully!');
  console.log('\n📚 Module Content Fixed:');
  console.log('   • Earthquake Module - Earthquake-specific content');
  console.log('   • Flood Module - Flood safety and water hazard content');
  console.log('   • Fire Module - Fire prevention and evacuation content');
  console.log('   • Cyclone Module - Storm preparedness content');
  console.log('   • Heatwave Module - Heat safety and cooling strategies');
  console.log('   • Drought Module - Water conservation and farming strategies');
  
  console.log('\n🔐 Login Issue Fixed:');
  console.log('   • Password hashing corrected in User model');
  console.log('   • Demo accounts recreated with proper credentials');
  
  console.log('\n👥 Demo Login Credentials:');
  console.log('   Admin:   admin@demo.com   / admin123');
  console.log('   Teacher: teacher@demo.com / teacher123');
  console.log('   Student: student@demo.com / student123');
  console.log('   Parent:  parent@demo.com  / parent123');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Start the backend: cd backend && npm run dev');
  console.log('   2. Start the frontend: cd frontend && npm start');
  console.log('   3. Login with any demo account to test');
  console.log('   4. Check modules - each should now have unique content');
  
  console.log('\n✨ Issues resolved!');
}

// Handle any unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Start the fix process
applyFixes().catch((error) => {
  console.error('❌ Fix process failed:', error);
  process.exit(1);
});
