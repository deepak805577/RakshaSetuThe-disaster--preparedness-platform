// Troubleshooting script for admin access
// Run this in the browser console (F12) when on localhost:3000

console.log('🔧 Admin Access Troubleshooting Script');
console.log('=====================================');

// Check localStorage
const token = localStorage.getItem('token');
const userData = localStorage.getItem('user');

console.log('1. Checking localStorage:');
console.log('   Token exists:', !!token);
console.log('   User data exists:', !!userData);

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('   User name:', user.name);
    console.log('   User role:', user.role);
    console.log('   User email:', user.email);
    console.log('   Is admin?', user.role === 'admin');
  } catch (e) {
    console.error('   Error parsing user data:', e);
  }
}

// Check if on correct page
console.log('\n2. Current URL:', window.location.href);

// Force admin login if needed
if (!token || !userData) {
  console.log('\n3. No authentication found. Try logging in with:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: admin123');
} else {
  console.log('\n3. Authentication found. Looking for Admin link...');
  
  // Check if admin link exists
  const adminLink = document.querySelector('a[href="/admin"]');
  if (adminLink) {
    console.log('   ✅ Admin link found in DOM');
    adminLink.style.border = '3px solid red';
    adminLink.style.backgroundColor = 'yellow';
    console.log('   Admin link highlighted in yellow');
  } else {
    console.log('   ❌ Admin link NOT found in DOM');
    console.log('   This might indicate a role check issue');
  }
}

// Check React DevTools if available
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('\n4. React DevTools detected');
  console.log('   Check the AuthProvider state in React DevTools');
}

console.log('\n5. Manual Navigation:');
console.log('   If admin link is missing, manually navigate to: http://localhost:3000/admin');

console.log('\nTroubleshooting complete! Check the results above.');
