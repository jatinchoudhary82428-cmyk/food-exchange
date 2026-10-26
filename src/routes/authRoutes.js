// Authentication & Role Management Routes
const crypto = require('node:crypto');
const { getDatabase, hashPassword } = require('../database/db');

// In-memory active session tokens mapping token -> userId
const sessions = new Map();
// In-memory fallback users in case SQLite DB encounters locks or issues
const inMemoryUsers = new Map();

// Helper to get authenticated user from request
function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-session-token']) {
    token = req.headers['x-session-token'];
  }

  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;

  try {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, email, role, subtype, phone, address, city, verified, avatar_url, created_at
      FROM users WHERE id = ?
    `).get(userId);

    if (user) return user;
  } catch (err) {
    console.warn('[ShareBite Auth] SQLite user lookup fallback:', err.message);
  }

  return inMemoryUsers.get(userId) || null;
}

function createSession(userId) {
  const token = 'sb_tok_' + crypto.randomBytes(24).toString('hex');
  sessions.set(token, userId);
  return token;
}

function handleAuthRoutes(req, res, url, body) {
  // POST /api/auth/register
  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    const { name, email, password, role, subtype, category, phone, address, city } = body;

    if (!name || !email || !password || !role) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Name, email, password, and role are required.' }));
      return true;
    }

    const normalizedRole = role.toLowerCase().trim();
    if (!['donor', 'ngo', 'volunteer'].includes(normalizedRole)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Role must be donor, ngo, or volunteer.' }));
      return true;
    }

    const cleanEmail = email.toLowerCase().trim();
    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
    const passwordHash = hashPassword(password);
    const resolvedSubtype = subtype || category || (normalizedRole === 'donor' ? 'Restaurant' : normalizedRole === 'ngo' ? 'Food Bank' : 'Eco Courier');
    const resolvedCity = city || 'Metro City';
    const resolvedPhone = phone || 'Not provided';
    const resolvedAddress = address || 'Metro Area';

    const defaultAvatar = normalizedRole === 'donor'
      ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'
      : normalizedRole === 'ngo'
      ? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    let userObj = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      role: normalizedRole,
      subtype: resolvedSubtype,
      category: resolvedSubtype,
      phone: resolvedPhone,
      address: resolvedAddress,
      city: resolvedCity,
      verified: 1,
      avatar_url: defaultAvatar,
      created_at: new Date().toISOString()
    };

    try {
      const db = getDatabase();
      // Check existing email
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existing) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'An account with this email address already exists.' }));
        return true;
      }

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, subtype, phone, address, city, verified, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `).run(
        userId,
        name.trim(),
        cleanEmail,
        passwordHash,
        normalizedRole,
        resolvedSubtype,
        resolvedPhone,
        resolvedAddress,
        resolvedCity,
        defaultAvatar
      );

      const dbUser = db.prepare(`
        SELECT id, name, email, role, subtype, phone, address, city, verified, avatar_url, created_at
        FROM users WHERE id = ?
      `).get(userId);

      if (dbUser) userObj = dbUser;
    } catch (err) {
      console.warn('[ShareBite Auth] SQLite DB error during register, using memory fallback:', err.message);
      inMemoryUsers.set(userId, userObj);
    }

    const token = createSession(userId);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, token, user: userObj }));
    return true;
  }

  // POST /api/auth/login
  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const { email, password } = body;
    if (!email || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Email and password are required.' }));
      return true;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    try {
      const db = getDatabase();
      user = db.prepare(`
        SELECT id, name, email, password_hash, role, subtype, phone, address, city, verified, avatar_url, created_at
        FROM users WHERE email = ?
      `).get(cleanEmail);
    } catch (err) {
      console.warn('[ShareBite Auth] SQLite DB error during login:', err.message);
    }

    if (!user) {
      for (const u of inMemoryUsers.values()) {
        if (u.email === cleanEmail) {
          user = u;
          break;
        }
      }
    }

    if (!user || (user.password_hash && user.password_hash !== hashPassword(password))) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid email or password.' }));
      return true;
    }

    const token = createSession(user.id);
    const { password_hash, ...safeUser } = user;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, token, user: safeUser }));
    return true;
  }

  // GET /api/auth/me
  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    const user = getAuthUser(req);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return true;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user }));
    return true;
  }

  // GET /api/auth/demo-users
  if (req.method === 'GET' && url.pathname === '/api/auth/demo-users') {
    try {
      const db = getDatabase();
      const users = db.prepare(`
        SELECT id, name, email, role, subtype, phone, address, city, avatar_url
        FROM users
        ORDER BY role ASC, name ASC
      `).all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ users }));
      return true;
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ users: Array.from(inMemoryUsers.values()) }));
      return true;
    }
  }

  // POST /api/auth/quick-switch
  if (req.method === 'POST' && url.pathname === '/api/auth/quick-switch') {
    const { userId } = body;
    let user = null;

    try {
      const db = getDatabase();
      if (userId) {
        user = db.prepare(`
          SELECT id, name, email, role, subtype, phone, address, city, verified, avatar_url, created_at
          FROM users WHERE id = ?
        `).get(userId);
      } else {
        user = db.prepare(`
          SELECT id, name, email, role, subtype, phone, address, city, verified, avatar_url, created_at
          FROM users LIMIT 1
        `).get();
      }
    } catch (err) {
      console.warn('[ShareBite Auth] Quick switch DB error:', err.message);
    }

    if (!user && userId) {
      user = inMemoryUsers.get(userId);
    }

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Demo user not found' }));
      return true;
    }

    const token = createSession(user.id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, token, user }));
    return true;
  }

  return false;
}

module.exports = {
  handleAuthRoutes,
  getAuthUser
};
