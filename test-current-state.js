console.log('🧪 TESTING CURRENT STATE OF MODULES AND VIDEOS');
console.log('='.repeat(60));

// Test 1: Check regular modules API
async function testModulesAPI() {
    try {
        console.log('🔍 Testing regular modules API...');
        const response = await fetch('http://localhost:5000/api/modules');
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Found ${data.count} modules from regular API:`);
            data.data.forEach(module => {
                const videoCount = module.content?.videos?.length || 0;
                console.log(`   📚 ${module.title} (${module.type}) - ${videoCount} videos`);
            });
        } else {
            console.log('❌ Regular modules API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error testing regular modules API:', error.message);
    }
}

// Test 2: Check specific module details
async function testModuleDetail(moduleId) {
    try {
        console.log(`🔍 Testing module detail for ID: ${moduleId}...`);
        const response = await fetch(`http://localhost:5000/api/modules/${moduleId}`);
        const data = await response.json();
        
        if (data.success) {
            const module = data.data;
            console.log(`✅ Module: ${module.title}`);
            if (module.content?.videos) {
                console.log(`   📹 Has ${module.content.videos.length} videos:`);
                module.content.videos.forEach(video => {
                    console.log(`      - ${video.title} (${video.section})`);
                });
            } else {
                console.log('   ❌ NO videos found in this module');
            }
        } else {
            console.log('❌ Module detail API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error testing module detail:', error.message);
    }
}

// Test 3: Check admin login
async function testAdminLogin() {
    try {
        console.log('🔍 Testing admin login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@demo.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✅ Admin login successful');
            return data.data.token;
        } else {
            console.log('❌ Admin login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Error testing admin login:', error.message);
        return null;
    }
}

// Test 4: Check admin modules API  
async function testAdminModulesAPI(token) {
    try {
        console.log('🔍 Testing admin modules API...');
        const response = await fetch('http://localhost:5000/api/admin/modules', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 404) {
            console.log('❌ Admin modules API returns 404 - routes not set up properly');
            return;
        }
        
        const data = await response.json();
        if (data.success) {
            console.log(`✅ Admin API found ${data.count} modules`);
        } else {
            console.log('❌ Admin modules API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error testing admin modules API:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting comprehensive test...\n');
    
    await testModulesAPI();
    console.log('');
    
    // Get first module ID to test details
    try {
        const response = await fetch('http://localhost:5000/api/modules');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            const firstModuleId = data.data[0]._id;
            await testModuleDetail(firstModuleId);
            console.log('');
        }
    } catch (error) {
        console.log('❌ Could not get module ID for detail test');
    }
    
    const token = await testAdminLogin();
    console.log('');
    
    if (token) {
        await testAdminModulesAPI(token);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Test complete! Check the results above.');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    runAllTests();
}
