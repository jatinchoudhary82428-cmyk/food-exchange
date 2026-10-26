// ShareBite Automated Test Suite
// Verifies Database, Auth, Listings, Claiming Workflow, and Impact Calculations

const http = require('node:http');
const server = require('../server');

const BASE_URL = 'http://localhost:3000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.status, statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.status, statusCode: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting ShareBite Full-Stack Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test Impact Metrics
    const impactRes = await request('/api/impact');
    assert(impactRes.statusCode === 200, 'GET /api/impact returns 200');
    assert(impactRes.data.metrics.mealsSaved > 3000, `Meals saved metric calculated (> 3000, actual: ${impactRes.data.metrics.mealsSaved})`);
    assert(impactRes.data.metrics.activeNGOs >= 2, `Active NGOs counted (actual: ${impactRes.data.metrics.activeNGOs})`);
    assert(impactRes.data.metrics.foodWasteSavedKg > 1000, `Food waste saved kg calculated (actual: ${impactRes.data.metrics.foodWasteSavedKg})`);

    // 2. Test Demo Users
    const demoRes = await request('/api/auth/demo-users');
    assert(demoRes.statusCode === 200, 'GET /api/auth/demo-users returns 200');
    assert(demoRes.data.users.length >= 3, `Demo accounts available (${demoRes.data.users.length} found)`);

    // 3. Test Registration
    const testEmail = `test_donor_${Date.now()}@test.org`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Bella Vista Catering',
        email: testEmail,
        password: 'password123',
        role: 'donor',
        subtype: 'Caterer',
        phone: '+1 (555) 777-8888',
        address: '55 Olive Way',
        city: 'Metro City'
      }
    });
    assert(regRes.statusCode === 201, 'POST /api/auth/register creates user');
    assert(regRes.data.token && regRes.data.user.role === 'donor', 'Registered user gets token and donor role');
    const donorToken = regRes.data.token;

    // 4. Test Login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: testEmail,
        password: 'password123'
      }
    });
    assert(loginRes.statusCode === 200, 'POST /api/auth/login authenticates registered user');

    // 5. Test Listings Filtering
    const listRes = await request('/api/listings?status=Available');
    assert(listRes.statusCode === 200, 'GET /api/listings?status=Available returns 200');
    assert(Array.isArray(listRes.data.listings), 'Listings returns an array');

    // 6. Test Create Listing
    const createRes = await request('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donorToken}`
      },
      body: {
        title: 'Freshly Baked Ciabatta & Vegetable Soup',
        description: 'End-of-day dinner buffet surplus. 20 portions of minestrone soup and 30 crusty ciabatta rolls.',
        food_type: 'Vegan',
        quantity_value: 30,
        quantity_unit: 'servings',
        expiry_hours: 3,
        pickup_address: '55 Olive Way, Kitchen Entrance',
        contact_phone: '+1 (555) 777-8888'
      }
    });
    assert(createRes.statusCode === 201, 'POST /api/listings creates donation');
    assert(createRes.data.listing.status === 'Available', 'New donation status is Available');
    const createdId = createRes.data.listing.id;

    // 7. Test Claim Listing (NGO Role)
    const claimRes = await request(`/api/listings/${createdId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        ngoName: 'City Hope Food Bank',
        eta: 'Within 30 minutes'
      }
    });
    assert(claimRes.statusCode === 200, 'POST /api/listings/:id/claim marks listing as Claimed');
    assert(claimRes.data.listing.status === 'Claimed', 'Listing status updated to Claimed');
    assert(claimRes.data.listing.claimed_by_name === 'City Hope Food Bank', 'Claimed by name set to NGO');

    // 8. Test Volunteer Assignment
    const volRes = await request(`/api/listings/${createdId}/volunteer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        volunteerName: 'Alex Rivera (Eco Courier)'
      }
    });
    assert(volRes.statusCode === 200, 'POST /api/listings/:id/volunteer assigns courier');
    assert(volRes.data.listing.status === 'In Transit', 'Listing status updated to In Transit');

    // 9. Test Completion & Delivery
    const compRes = await request(`/api/listings/${createdId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: {
        status: 'Completed',
        completionNotes: 'Delivered to shelter pantry.'
      }
    });
    assert(compRes.statusCode === 200, 'PATCH /api/listings/:id/status updates to Completed');
    assert(compRes.data.listing.status === 'Completed', 'Final status is Completed');

    // 10. Verify Recalculated Impact
    const updatedImpact = await request('/api/impact');
    assert(updatedImpact.data.metrics.mealsSaved >= impactRes.data.metrics.mealsSaved + 30, 'Impact tracker dynamically reflected newly rescued meals');

    console.log(`\n========================================`);
    console.log(`🏁 Test Results: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

// Allow server to boot before executing tests
setTimeout(runTests, 500);
