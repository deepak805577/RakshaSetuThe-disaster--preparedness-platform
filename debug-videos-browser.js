// 🧪 BROWSER CONSOLE DEBUG SCRIPT FOR VIDEO VISIBILITY
// Copy and paste this into your browser console (F12) when on the modules page

console.log('🧪 STARTING VIDEO VISIBILITY DEBUG');
console.log('=' + '='.repeat(50));

// Test 1: Check if the modules API is working from browser
async function testModulesAPIFromBrowser() {
    console.log('🔍 Test 1: Testing modules API from browser...');
    try {
        const response = await fetch('http://localhost:5000/api/modules');
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Found ${data.count} modules:`)
            data.data.forEach((module, index) => {
                console.log(`   ${index + 1}. ${module.title} (${module.type})`);
                console.log(`      - Has content: ${!!module.content}`);
                console.log(`      - Has videos: ${!!module.content?.videos}`);
                console.log(`      - Video count: ${module.content?.videos?.length || 0}`);
                if (module.content?.videos?.length > 0) {
                    module.content.videos.forEach((video, vIndex) => {
                        console.log(`         ${vIndex + 1}. ${video.title} (${video.section})`);
                    });
                }
                console.log('');
            });
            return data.data;
        } else {
            console.log('❌ API returned error:', data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ API call failed:', error.message);
        return null;
    }
}

// Test 2: Check React component state
function checkReactComponentState() {
    console.log('🔍 Test 2: Checking React component state...');
    
    // Check if we're on the right page
    if (!window.location.pathname.includes('/modules/')) {
        console.log('⚠️ You need to be on a module detail page (e.g., /modules/some-id)');
        return;
    }
    
    // Try to find React components
    const reactElements = document.querySelectorAll('[data-reactroot]');
    console.log(`Found ${reactElements.length} React root elements`);
    
    // Check for video elements
    const videoElements = document.querySelectorAll('[class*="video"], [class*="Video"]');
    console.log(`Found ${videoElements.length} potential video elements`);
    
    // Check for video sections
    const videoSections = document.querySelectorAll('[class*="section"], [role="tabpanel"]');
    console.log(`Found ${videoSections.length} potential video sections`);
    
    // Look for video tab
    const videoTabs = document.querySelectorAll('button[class*="tab"], nav a');
    console.log('Available tabs/nav items:');
    videoTabs.forEach((tab, index) => {
        console.log(`   ${index + 1}. "${tab.textContent.trim()}"`);
    });
}

// Test 3: Check localStorage and sessionStorage for cached data
function checkLocalStorage() {
    console.log('🔍 Test 3: Checking localStorage for cached data...');
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('User role:', user.role);
            console.log('User name:', user.name);
        } catch (e) {
            console.log('Error parsing user data:', e.message);
        }
    }
}

// Test 4: Check if we can manually fetch a specific module
async function testSpecificModule() {
    console.log('🔍 Test 4: Testing specific module API...');
    
    // Get module ID from URL if available
    const pathParts = window.location.pathname.split('/');
    const moduleId = pathParts[pathParts.length - 1];
    
    if (!moduleId || moduleId === 'modules') {
        console.log('⚠️ No module ID in URL. Try navigating to a specific module first.');
        return;
    }
    
    console.log(`Testing module ID: ${moduleId}`);
    
    try {
        const response = await fetch(`http://localhost:5000/api/modules/${moduleId}`);
        const data = await response.json();
        
        if (data.success) {
            const module = data.data;
            console.log(`✅ Module: ${module.title}`);
            console.log(`   Type: ${module.type}`);
            console.log(`   Has content: ${!!module.content}`);
            console.log(`   Has videos: ${!!module.content?.videos}`);
            console.log(`   Video count: ${module.content?.videos?.length || 0}`);
            
            if (module.content?.videos) {
                console.log('   📹 Videos found:');
                module.content.videos.forEach((video, index) => {
                    console.log(`      ${index + 1}. ${video.title}`);
                    console.log(`         - Section: ${video.section}`);
                    console.log(`         - URL: ${video.url}`);
                    console.log(`         - Duration: ${video.duration}s`);
                });
            }
            
            return module;
        } else {
            console.log('❌ Module API returned error:', data.message);
        }
    } catch (error) {
        console.log('❌ Module API call failed:', error.message);
    }
}

// Run all tests
async function runAllDebugTests() {
    console.log('🚀 Running comprehensive debug tests...\n');
    
    await testModulesAPIFromBrowser();
    console.log('');
    
    checkReactComponentState();
    console.log('');
    
    checkLocalStorage();
    console.log('');
    
    await testSpecificModule();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 DEBUG COMPLETE!');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Check the results above');
    console.log('2. If API shows videos but UI doesn\'t, it\'s a React rendering issue');
    console.log('3. If API doesn\'t show videos, it\'s a backend issue');
    console.log('4. Navigate to a specific module and run testSpecificModule() again');
}

// Auto-run
runAllDebugTests();
