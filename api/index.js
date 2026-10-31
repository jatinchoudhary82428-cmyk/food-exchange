// ShareBite – Vercel Serverless API Handler
// Uses in-memory store (no SQLite needed) — compatible with Node.js 18/20

const crypto = require('crypto');

// ─── In-Memory Store ────────────────────────────────────────────────────────

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'sharebite_salt').digest('hex');
}

function makeExpiry(hours) {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}

const users = new Map([
  ['usr_donor_1', {
    id: 'usr_donor_1', name: 'The Green Olive Trattoria', email: 'donor@greenolive.com',
    password_hash: hashPassword('password123'), role: 'donor', subtype: 'Restaurant',
    phone: '+1 (555) 234-8901', address: '742 Evergreen Terrace, Downtown', city: 'Metro City',
    verified: 1, avatar_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }],
  ['usr_donor_2', {
    id: 'usr_donor_2', name: 'Spice Garden Banquet & Caterers', email: 'events@spicegarden.com',
    password_hash: hashPassword('password123'), role: 'donor', subtype: 'Caterer',
    phone: '+1 (555) 345-6789', address: '120 Grand Plaza Boulevard', city: 'Metro City',
    verified: 1, avatar_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }],
  ['usr_donor_3', {
    id: 'usr_donor_3', name: 'Sunrise Artisan Bakery', email: 'hello@sunrisebakery.org',
    password_hash: hashPassword('password123'), role: 'donor', subtype: 'Bakery',
    phone: '+1 (555) 456-7890', address: '88 Morning Glory Lane', city: 'Metro City',
    verified: 1, avatar_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }],
  ['usr_ngo_1', {
    id: 'usr_ngo_1', name: 'City Hope Food Bank', email: 'ngo@cityhope.org',
    password_hash: hashPassword('password123'), role: 'ngo', subtype: 'Food Bank',
    phone: '+1 (555) 987-6543', address: '404 Community Relief Ave', city: 'Metro City',
    verified: 1, avatar_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }],
  ['usr_ngo_2', {
    id: 'usr_ngo_2', name: 'Nourish All Children Shelter', email: 'contact@nourishall.org',
    password_hash: hashPassword('password123'), role: 'ngo', subtype: 'Orphanage / Shelter',
    phone: '+1 (555) 876-5432', address: '15 Hope Horizon Road', city: 'Metro City',
    verified: 1, avatar_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }],
  ['usr_vol_1', {
    id: 'usr_vol_1', name: 'Alex Rivera', email: 'volunteer@sharebite.org',
    password_hash: hashPassword('password123'), role: 'volunteer', subtype: 'Eco Courier / Driver',
    phone: '+1 (555) 765-4321', address: '22 Elm Street, Uptown', city: 'Metro City',
    verified: 1, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }]
]);

const listings = new Map([
  ['lst_1', {
    id: 'lst_1', donor_id: 'usr_donor_1', donor_name: 'The Green Olive Trattoria',
    title: 'Freshly Cooked Pasta & Salads – 50 portions',
    description: 'Homemade pasta (penne arrabbiata & pesto) with garden salads from today\'s lunch service.',
    food_type: 'Veg', quantity_value: 50, quantity_unit: 'servings',
    servings_est: 50, weight_kg_est: 15,
    prep_time: 'Today, 2:30 PM', expiry_time: makeExpiry(4), expiry_window_desc: 'Best before 4 hours',
    pickup_address: '742 Evergreen Terrace, Downtown', contact_phone: '+1 (555) 234-8901',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    status: 'Available', claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    volunteer_id: null, volunteer_name: null, completed_at: null,
    notes: 'Please bring insulated food carriers. Vegan option available (allergen free).',
    created_at: new Date().toISOString()
  }],
  ['lst_2', {
    id: 'lst_2', donor_id: 'usr_donor_2', donor_name: 'Spice Garden Banquet & Caterers',
    title: 'Biryani & Curry – 80 servings',
    description: 'Leftover catering from a corporate event. Fragrant basmati biryani with mixed vegetable curry.',
    food_type: 'Veg', quantity_value: 80, quantity_unit: 'servings',
    servings_est: 80, weight_kg_est: 30,
    prep_time: 'Today, 1:00 PM', expiry_time: makeExpiry(5), expiry_window_desc: 'Best before 5 hours',
    pickup_address: '120 Grand Plaza Boulevard', contact_phone: '+1 (555) 345-6789',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    status: 'Available', claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    volunteer_id: null, volunteer_name: null, completed_at: null,
    notes: 'Nut-free and allergen safe.',
    created_at: new Date().toISOString()
  }],
  ['lst_3', {
    id: 'lst_3', donor_id: 'usr_donor_3', donor_name: 'Sunrise Artisan Bakery',
    title: 'Assorted Artisan Sourdough & Croissants',
    description: 'End-of-day handcrafted sourdough rounds, baguettes, and flaky croissants.',
    food_type: 'Veg', quantity_value: 20, quantity_unit: 'kg',
    servings_est: 60, weight_kg_est: 20,
    prep_time: 'Today, 6:00 AM', expiry_time: makeExpiry(8), expiry_window_desc: 'Best before 12 hours',
    pickup_address: '88 Morning Glory Lane', contact_phone: '+1 (555) 456-7890',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    status: 'Available', claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    volunteer_id: null, volunteer_name: null, completed_at: null,
    notes: 'Ideal for breakfast at shelters.',
    created_at: new Date().toISOString()
  }],
  ['lst_4', {
    id: 'lst_4', donor_id: 'usr_donor_2', donor_name: 'Spice Garden Banquet & Caterers',
    title: 'Grilled Herb Chicken Skewers & Mediterranean Rice',
    description: 'Tender marinated chicken breast skewers with lemon herb rice.',
    food_type: 'Non-Veg', quantity_value: 40, quantity_unit: 'servings',
    servings_est: 40, weight_kg_est: 18,
    prep_time: 'Today, 12:45 PM', expiry_time: makeExpiry(3), expiry_window_desc: 'Best before 3 hours',
    pickup_address: '120 Grand Plaza Boulevard, Loading Dock 1', contact_phone: '+1 (555) 345-6789',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    status: 'Claimed', claimed_by_id: 'usr_ngo_1', claimed_by_name: 'City Hope Food Bank',
    claimed_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    volunteer_id: 'usr_vol_1', volunteer_name: 'Alex Rivera', completed_at: null,
    notes: 'Contains poultry.',
    created_at: new Date().toISOString()
  }],
  ['lst_5', {
    id: 'lst_5', donor_id: 'usr_donor_1', donor_name: 'The Green Olive Trattoria',
    title: 'Sealed Whole Grain Pasta & Canned Organic Legumes',
    description: 'Factory sealed pantry items: dry penne, canned chickpeas, diced tomatoes, and olive oil.',
    food_type: 'Packaged', quantity_value: 80, quantity_unit: 'kg',
    servings_est: 180, weight_kg_est: 80,
    prep_time: 'Packaged Stock', expiry_time: makeExpiry(720), expiry_window_desc: 'Non-perishable (Best by 6 months)',
    pickup_address: '742 Evergreen Terrace (Main Desk)', contact_phone: '+1 (555) 234-8901',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    status: 'Completed', claimed_by_id: 'usr_ngo_2', claimed_by_name: 'Nourish All Children Shelter',
    claimed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    volunteer_id: 'usr_vol_1', volunteer_name: 'Alex Rivera',
    completed_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    notes: 'Delivered to Nourish All pantry. Supported 180 youth meals.',
    created_at: new Date().toISOString()
  }]
]);

const sessions = new Map();

function createSession(userId) {
  const token = 'sb_tok_' + crypto.randomBytes(24).toString('hex');
  sessions.set(token, userId);
  return token;
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
  else if (req.headers['x-session-token']) token = req.headers['x-session-token'];
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  return users.get(userId) || null;
}

function safeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

function json(res, status, data) {
  res.status(status).json(data);
}

// ─── Main Handler ────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token, Accept, Origin');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const pathname = req.url.split('?')[0];
  const body = req.body || {};

  // ── AUTH ROUTES ──────────────────────────────────────────────────────────

  // POST /api/auth/register
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const { name, email, password, role, subtype, category, phone, address, city } = body;
    if (!name || !email || !password || !role)
      return json(res, 400, { error: 'Name, email, password, and role are required.' });

    const normalizedRole = role.toLowerCase().trim();
    if (!['donor', 'ngo', 'volunteer'].includes(normalizedRole))
      return json(res, 400, { error: 'Role must be donor, ngo, or volunteer.' });

    const cleanEmail = email.toLowerCase().trim();
    for (const u of users.values()) {
      if (u.email === cleanEmail) return json(res, 409, { error: 'An account with this email already exists.' });
    }

    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
    const resolvedSubtype = subtype || category || (normalizedRole === 'donor' ? 'Restaurant' : normalizedRole === 'ngo' ? 'Food Bank' : 'Eco Courier');
    const defaultAvatar = normalizedRole === 'donor'
      ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'
      : normalizedRole === 'ngo'
      ? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newUser = {
      id: userId, name: name.trim(), email: cleanEmail,
      password_hash: hashPassword(password), role: normalizedRole,
      subtype: resolvedSubtype, phone: phone || 'Not provided',
      address: address || 'Metro Area', city: city || 'Metro City',
      verified: 1, avatar_url: defaultAvatar, created_at: new Date().toISOString()
    };
    users.set(userId, newUser);
    const token = createSession(userId);
    return json(res, 201, { success: true, token, user: safeUser(newUser) });
  }

  // POST /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const { email, password } = body;
    if (!email || !password) return json(res, 400, { error: 'Email and password are required.' });
    const cleanEmail = email.toLowerCase().trim();
    let user = null;
    for (const u of users.values()) { if (u.email === cleanEmail) { user = u; break; } }
    if (!user || user.password_hash !== hashPassword(password))
      return json(res, 401, { error: 'Invalid email or password.' });
    const token = createSession(user.id);
    return json(res, 200, { success: true, token, user: safeUser(user) });
  }

  // GET /api/auth/me
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = getAuthUser(req);
    if (!user) return json(res, 401, { error: 'Not authenticated' });
    return json(res, 200, { user: safeUser(user) });
  }

  // GET /api/auth/demo-users
  if (req.method === 'GET' && pathname === '/api/auth/demo-users') {
    const demoUsers = Array.from(users.values()).map(safeUser).sort((a, b) => a.role.localeCompare(b.role));
    return json(res, 200, { users: demoUsers });
  }

  // POST /api/auth/quick-switch
  if (req.method === 'POST' && pathname === '/api/auth/quick-switch') {
    const { userId } = body;
    const user = users.get(userId) || Array.from(users.values())[0];
    if (!user) return json(res, 404, { error: 'Demo user not found' });
    const token = createSession(user.id);
    return json(res, 200, { success: true, token, user: safeUser(user) });
  }

  // ── LISTING ROUTES ───────────────────────────────────────────────────────

  // GET /api/listings
  if (req.method === 'GET' && (pathname === '/api/listings' || pathname === '/api/listings/')) {
    const urlObj = new URL(req.url, 'http://localhost');
    const status = urlObj.searchParams.get('status');
    const role = urlObj.searchParams.get('role');
    const donorId = urlObj.searchParams.get('donor_id');
    let result = Array.from(listings.values());
    if (status) result = result.filter(l => l.status.toLowerCase() === status.toLowerCase());
    if (donorId) result = result.filter(l => l.donor_id === donorId);
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return json(res, 200, { listings: result, total: result.length });
  }

  // POST /api/listings
  if (req.method === 'POST' && pathname === '/api/listings') {
    const user = getAuthUser(req);
    if (!user) return json(res, 401, { error: 'Authentication required.' });
    const { title, food_type, quantity_value, quantity_unit, pickup_address, contact_phone, expiry_time, image_url, notes, description, servings_est } = body;
    if (!title || !food_type || !quantity_value || !quantity_unit || !pickup_address)
      return json(res, 400, { error: 'title, food_type, quantity_value, quantity_unit, and pickup_address are required.' });
    const id = 'lst_' + crypto.randomUUID().slice(0, 8);
    const listing = {
      id, donor_id: user.id, donor_name: user.name, title, description: description || '',
      food_type, quantity_value: parseInt(quantity_value), quantity_unit,
      servings_est: parseInt(servings_est) || parseInt(quantity_value),
      weight_kg_est: null, prep_time: 'Just listed',
      expiry_time: expiry_time || makeExpiry(4), expiry_window_desc: 'See listing',
      pickup_address, contact_phone: contact_phone || user.phone,
      image_url: image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      status: 'Available', claimed_by_id: null, claimed_by_name: null, claimed_at: null,
      volunteer_id: null, volunteer_name: null, completed_at: null,
      notes: notes || '', created_at: new Date().toISOString()
    };
    listings.set(id, listing);
    return json(res, 201, { success: true, listing });
  }

  // GET /api/listings/:id
  const listingMatch = pathname.match(/^\/api\/listings\/([^/]+)$/);
  if (req.method === 'GET' && listingMatch) {
    const listing = listings.get(listingMatch[1]);
    if (!listing) return json(res, 404, { error: 'Listing not found.' });
    return json(res, 200, { listing });
  }

  // POST /api/listings/:id/claim
  const claimMatch = pathname.match(/^\/api\/listings\/([^/]+)\/claim$/);
  if (req.method === 'POST' && claimMatch) {
    const user = getAuthUser(req);
    if (!user) return json(res, 401, { error: 'Authentication required.' });
    const listing = listings.get(claimMatch[1]);
    if (!listing) return json(res, 404, { error: 'Listing not found.' });
    if (listing.status !== 'Available') return json(res, 409, { error: 'Listing is no longer available.' });
    listing.status = 'Claimed';
    listing.claimed_by_id = user.id;
    listing.claimed_by_name = user.name;
    listing.claimed_at = new Date().toISOString();
    return json(res, 200, { success: true, listing });
  }

  // POST /api/listings/:id/volunteer
  const volunteerMatch = pathname.match(/^\/api\/listings\/([^/]+)\/volunteer$/);
  if (req.method === 'POST' && volunteerMatch) {
    const user = getAuthUser(req);
    if (!user) return json(res, 401, { error: 'Authentication required.' });
    const listing = listings.get(volunteerMatch[1]);
    if (!listing) return json(res, 404, { error: 'Listing not found.' });
    listing.volunteer_id = user.id;
    listing.volunteer_name = user.name;
    if (listing.status === 'Available') { listing.status = 'Claimed'; listing.claimed_at = new Date().toISOString(); }
    return json(res, 200, { success: true, listing });
  }

  // PATCH /api/listings/:id/status
  const statusMatch = pathname.match(/^\/api\/listings\/([^/]+)\/status$/);
  if (req.method === 'PATCH' && statusMatch) {
    const user = getAuthUser(req);
    if (!user) return json(res, 401, { error: 'Authentication required.' });
    const listing = listings.get(statusMatch[1]);
    if (!listing) return json(res, 404, { error: 'Listing not found.' });
    const validStatuses = ['Available', 'Claimed', 'Delivered', 'Completed'];
    const newStatus = body.status;
    if (!validStatuses.includes(newStatus)) return json(res, 400, { error: 'Invalid status.' });
    listing.status = newStatus;
    if (newStatus === 'Completed') listing.completed_at = new Date().toISOString();
    return json(res, 200, { success: true, listing });
  }

  // ── IMPACT ROUTES ────────────────────────────────────────────────────────

  if (req.method === 'GET' && pathname === '/api/impact') {
    const all = Array.from(listings.values());
    const completed = all.filter(l => l.status === 'Completed' || l.status === 'Delivered');
    const totalMeals = all.reduce((s, l) => s + (l.servings_est || 0), 0);
    const activeNgos = new Set(all.filter(l => l.claimed_by_id).map(l => l.claimed_by_id)).size;
    const totalKg = all.reduce((s, l) => s + (l.weight_kg_est || 0), 0);
    return json(res, 200, {
      meals_saved: totalMeals,
      active_ngos: activeNgos,
      food_waste_saved_kg: totalKg,
      listings_completed: completed.length,
      total_listings: all.length
    });
  }

  // ── 404 ──────────────────────────────────────────────────────────────────
  return json(res, 404, { error: `Endpoint ${req.method} ${pathname} not found` });
};
