// Direct In-Process Integration Test Suite for ShareBite
// Tests all route handlers, database operations, auth, claiming, and impact calculations

const { getDatabase } = require('../src/database/db');
const { handleAuthRoutes } = require('../src/routes/authRoutes');
const { handleListingRoutes } = require('../src/routes/listingRoutes');
const { handleImpactRoutes } = require('../src/routes/impactRoutes');

function createMockReqRes(method, pathStr, body = {}, headers = {}) {
  const url = new URL(pathStr, 'http://localhost');
  const req = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    }
  };

  let statusCode = 200;
  let responseHeaders = {};
  let responseBody = '';

  const res = {
    writeHead: (code, hdrs) => {
      statusCode = code;
      responseHeaders = hdrs || {};
    },
    end: (content) => {
      responseBody = content || '';
    }
  };

  return { req, res, url, body, getResult: () => ({ statusCode, data: JSON.parse(responseBody || '{}') }) };
}

function runTests() {
  console.log('🧪 Starting ShareBite In-Process Integration Tests...\n');
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

  // 1. Verify Database
  const db = getDatabase();
  const userCount = db.prepare('SELECT count(*) as c FROM users').get().c;
  const listingCount = db.prepare('SELECT count(*) as c FROM listings').get().c;
  assert(userCount >= 6, `Database seeded with users (count: ${userCount})`);
  assert(listingCount >= 5, `Database seeded with listings (count: ${listingCount})`);

  // 2. Test Impact Route
  {
    const { req, res, url, body, getResult } = createMockReqRes('GET', '/api/impact');
    const handled = handleImpactRoutes(req, res, url);
    assert(handled === true, 'handleImpactRoutes handled GET /api/impact');
    const result = getResult();
    assert(result.statusCode === 200, 'Impact returns 200');
    assert(result.data.metrics.mealsSaved >= 3000, `Meals saved metric valid (${result.data.metrics.mealsSaved})`);
    assert(result.data.metrics.activeNGOs >= 2, `Active NGOs valid (${result.data.metrics.activeNGOs})`);
  }

  // 3. Test Demo Users
  {
    const { req, res, url, body, getResult } = createMockReqRes('GET', '/api/auth/demo-users');
    const handled = handleAuthRoutes(req, res, url, body);
    assert(handled === true, 'handleAuthRoutes handled /api/auth/demo-users');
    const result = getResult();
    assert(result.statusCode === 200 && result.data.users.length >= 3, 'Demo users returned');
  }

  // 4. Test User Registration
  let newDonorToken = '';
  let newDonorId = '';
  {
    const { req, res, url, body, getResult } = createMockReqRes('POST', '/api/auth/register', {
      name: 'Sunrise Community Kitchen',
      email: `donor_${Date.now()}@sunrise.org`,
      password: 'password123',
      role: 'donor',
      subtype: 'Restaurant',
      phone: '+1 (555) 321-9876',
      address: '99 Sunburst Blvd',
      city: 'Metro City'
    });
    handleAuthRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 201, 'POST /api/auth/register returned 201 Created');
    assert(result.data.user && result.data.user.role === 'donor', 'Registered user has donor role');
    assert(!!result.data.token, 'Session token issued');
    newDonorToken = result.data.token;
    newDonorId = result.data.user.id;
  }

  // 5. Test Quick Switch
  {
    const { req, res, url, body, getResult } = createMockReqRes('POST', '/api/auth/quick-switch', {
      userId: 'usr_ngo_1'
    });
    handleAuthRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 200 && result.data.user.role === 'ngo', 'Quick switched to City Hope NGO');
  }

  // 6. Test Listing Filters
  {
    const { req, res, url, body, getResult } = createMockReqRes('GET', '/api/listings?status=Available&food_type=Veg');
    handleListingRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 200, 'GET /api/listings with filters returned 200');
    assert(Array.isArray(result.data.listings), 'Returned listings array');
  }

  // 7. Test Create Listing
  let createdListingId = '';
  {
    const { req, res, url, body, getResult } = createMockReqRes(
      'POST',
      '/api/listings',
      {
        title: 'Warm Herb Focaccia & Baked Rigatoni',
        description: 'Sanitized foil trays ready for food rescue distribution.',
        food_type: 'Veg',
        quantity_value: 45,
        quantity_unit: 'servings',
        expiry_hours: 2,
        expiry_window_desc: 'Best before 2 hours',
        pickup_address: '99 Sunburst Blvd, Service Bay',
        contact_phone: '+1 (555) 321-9876'
      },
      { 'authorization': `Bearer ${newDonorToken}` }
    );
    handleListingRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 201, 'POST /api/listings created new donation');
    assert(result.data.listing.status === 'Available', 'Listing starts with status Available');
    assert(result.data.listing.servings_est === 45, 'Servings standardized to 45');
    createdListingId = result.data.listing.id;
  }

  // 8. Test NGO Claiming Food
  {
    const { req, res, url, body, getResult } = createMockReqRes(
      'POST',
      `/api/listings/${createdListingId}/claim`,
      {
        ngoName: 'City Hope Food Bank',
        eta: '30 mins',
        notes: 'Dispatched volunteer.'
      }
    );
    handleListingRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 200, 'POST /api/listings/:id/claim returned 200');
    assert(result.data.listing.status === 'Claimed', 'Listing status updated to Claimed');
    assert(result.data.listing.claimed_by_name === 'City Hope Food Bank', 'Claimed by name recorded');
  }

  // 9. Test Volunteer Assignment
  {
    const { req, res, url, body, getResult } = createMockReqRes(
      'POST',
      `/api/listings/${createdListingId}/volunteer`,
      {
        volunteerName: 'Alex Rivera (Eco Courier)'
      }
    );
    handleListingRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 200, 'Volunteer assigned successfully');
    assert(result.data.listing.status === 'In Transit', 'Status updated to In Transit');
    assert(result.data.listing.volunteer_name.includes('Alex Rivera'), 'Volunteer name recorded');
  }

  // 10. Test Status Completed
  {
    const { req, res, url, body, getResult } = createMockReqRes(
      'PATCH',
      `/api/listings/${createdListingId}/status`,
      {
        status: 'Completed',
        completionNotes: 'Handed off to shelter kitchen manager.'
      }
    );
    handleListingRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 200, 'PATCH status updated to Completed');
    assert(result.data.listing.status === 'Completed', 'Final status is Completed');
    assert(!!result.data.listing.completed_at, 'Completion timestamp recorded');
  }

  console.log(`\n========================================`);
  console.log(`🏁 All In-Process Tests Finished: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
