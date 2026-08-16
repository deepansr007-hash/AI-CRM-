/**
 * AI CRM System - Integration Test Automation
 * Run: node tests/api.test.js
 */

async function runTests() {
  const host = 'http://localhost:5000';
  console.log('Starting CRM backend API sanity check tests...');
  
  try {
    // 1. Check Health Endpoint
    const healthRes = await fetch(`${host}/health`);
    if (healthRes.status !== 200) {
      throw new Error(`Health check failed with state: ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    console.log('✅ Health status:', healthData.status);

    // 2. Check Auth Login (fails with bad password style test)
    console.log('Testing authentication validation rules...');
    const loginRes = await fetch(`${host}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong_password_check' })
    });
    
    if (loginRes.status === 401) {
      console.log('✅ Auth rejection handled correctly (401 Unauthorized)');
    } else {
      throw new Error(`Authentication validation failed. Status: ${loginRes.status}`);
    }

    // 3. Authenticate and retrieve token (admin / admin123)
    const successRes = await fetch(`${host}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (successRes.status !== 200) {
      throw new Error(`Failed to authenticate admin: ${successRes.status}`);
    }
    const authData = await successRes.json();
    console.log('✅ Admin credentials authenticated. Token retrieved.');

    // 4. Load dashboard analytics (requires token)
    const statsRes = await fetch(`${host}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${authData.token}` }
    });
    if (statsRes.status !== 200) {
      throw new Error(`Load dashboard stats failed: ${statsRes.status}`);
    }
    const statsData = await statsRes.json();
    console.log('✅ Dashboard summary KPIs loaded. Total leads:', statsData.kpis.totalLeads);
    console.log('Pipeline Value:', statsData.kpis.pipelineValue);

    console.log('\n🎉 ALL TRADITIONAL API INTEGRATION CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(err.message);
    process.exit(1);
  }
}

// Allow server process to kick start first if run in bundle
setTimeout(runTests, 1000);
