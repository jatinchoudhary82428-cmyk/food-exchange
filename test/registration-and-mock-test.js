// Registration and Mock Fallback Test Suite
const { handleAuthRoutes } = require('../src/routes/authRoutes');

function createMockReqRes(method, pathStr, body = {}, headers = {}) {
  const url = new URL(pathStr, 'http://localhost:3000');
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

  return { req, res, url, body, getResult: () => ({ statusCode, headers: responseHeaders, data: JSON.parse(responseBody || '{}') }) };
}

async function runTests() {
  console.log('🧪 Testing ShareBite Registration & Mock Fallback...\n');
  const { mockDb } = await import('../src/public/js/mockDb.js');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Backend /api/auth/register with 'category' field
  {
    const email = `caterer_${Date.now()}@banquet.com`;
    const { req, res, url, body, getResult } = createMockReqRes('POST', '/api/auth/register', {
      name: 'Grand Royal Banquet',
      email,
      password: 'securePass123',
      phone: '+1 (555) 444-5555',
      role: 'donor',
      category: 'Caterer',
      address: '77 Royal Crescent, Metro City'
    });

    handleAuthRoutes(req, res, url, body);
    const result = getResult();
    assert(result.statusCode === 201, 'Backend POST /api/auth/register handles "category" parameter');
    assert(result.data.user && result.data.user.subtype === 'Caterer', 'User subtype resolved from category');
    assert(result.data.user && result.data.user.role === 'donor', 'User role resolved properly');
    assert(!!result.data.token, 'Auth token generated');
  }

  // 2. Client-side Mock Database Fallback: mockDb.register
  {
    const mockEmail = `mock_user_${Date.now()}@mock.org`;
    const regRes = mockDb.register({
      name: 'Hope Orphanage & Care',
      email: mockEmail,
      password: 'password123',
      role: 'ngo',
      category: 'Orphanage',
      phone: '+1 (555) 999-0000',
      address: '10 Peace Avenue, Metro City'
    });

    assert(regRes.success === true, 'mockDb.register returns success: true');
    assert(regRes.isFallback === true, 'mockDb.register flags isFallback: true');
    assert(regRes.user.role === 'ngo', 'Mock user role set to "ngo"');
    assert(regRes.user.subtype === 'Orphanage', 'Mock user category/subtype set properly');
    assert(!!regRes.token, 'Mock token issued');

    // Test duplicate registration in mockDb
    let dupFailed = false;
    try {
      mockDb.register({
        name: 'Another User',
        email: mockEmail,
        password: 'password123',
        role: 'ngo'
      });
    } catch (e) {
      dupFailed = true;
    }
    assert(dupFailed, 'mockDb.register catches duplicate email');
  }

  // 3. Client-side Mock Database Fallback: mockDb.login
  {
    const loginRes = mockDb.login('ngo@cityhope.org', 'password123');
    assert(loginRes.success === true, 'mockDb.login authenticates demo account');
    assert(loginRes.user.role === 'ngo', 'mockDb.login returns NGO role');
  }

  console.log(`\n========================================`);
  console.log(`🏁 Registration & Mock Tests: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
