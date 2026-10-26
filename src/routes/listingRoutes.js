// Food Listings API Routes
const crypto = require('node:crypto');
const { getDatabase } = require('../database/db');
const { getAuthUser } = require('./authRoutes');
const { KG_PER_SERVING } = require('../config');

function handleListingRoutes(req, res, url, body) {
  const db = getDatabase();

  // GET /api/listings - Retrieve and filter listings
  if (req.method === 'GET' && url.pathname === '/api/listings') {
    const statusFilter = url.searchParams.get('status');
    const foodTypeFilter = url.searchParams.get('food_type');
    const searchQuery = url.searchParams.get('search');
    const urgencyFilter = url.searchParams.get('urgency');
    const donorIdFilter = url.searchParams.get('donor_id');

    let sql = `
      SELECT
        l.*,
        u.name AS donor_name,
        u.subtype AS donor_subtype,
        u.phone AS donor_phone,
        u.city AS donor_city,
        u.avatar_url AS donor_avatar
      FROM listings l
      JOIN users u ON l.donor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (statusFilter && statusFilter !== 'all') {
      sql += ' AND l.status = ?';
      params.push(statusFilter);
    }

    if (foodTypeFilter && foodTypeFilter !== 'all') {
      sql += ' AND l.food_type = ?';
      params.push(foodTypeFilter);
    }

    if (donorIdFilter) {
      sql += ' AND l.donor_id = ?';
      params.push(donorIdFilter);
    }

    if (searchQuery) {
      sql += ' AND (l.title LIKE ? OR l.description LIKE ? OR l.pickup_address LIKE ? OR u.name LIKE ?)';
      const term = `%${searchQuery.trim()}%`;
      params.push(term, term, term, term);
    }

    if (urgencyFilter === 'urgent') {
      // Within next 2 hours or expired
      const twoHoursLater = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      sql += " AND l.expiry_time <= ? AND l.status = 'Available'";
      params.push(twoHoursLater);
    } else if (urgencyFilter === 'today') {
      const dayLater = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      sql += ' AND l.expiry_time <= ?';
      params.push(dayLater);
    }

    sql += " ORDER BY CASE WHEN l.status = 'Available' THEN 1 WHEN l.status = 'Claimed' THEN 2 ELSE 3 END, l.created_at DESC";

    const listings = db.prepare(sql).all(...params);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ listings, count: listings.length }));
    return true;
  }

  // GET /api/listings/:id
  const matchId = url.pathname.match(/^\/api\/listings\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && matchId) {
    const listingId = matchId[1];
    const listing = db.prepare(`
      SELECT
        l.*,
        u.name AS donor_name,
        u.subtype AS donor_subtype,
        u.phone AS donor_phone,
        u.city AS donor_city,
        u.email AS donor_email,
        u.avatar_url AS donor_avatar
      FROM listings l
      JOIN users u ON l.donor_id = u.id
      WHERE l.id = ?
    `).get(listingId);

    if (!listing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Listing not found' }));
      return true;
    }

    // Fetch related claim if exists
    const claim = db.prepare('SELECT * FROM claims WHERE listing_id = ? ORDER BY created_at DESC LIMIT 1').get(listingId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ listing, claim }));
    return true;
  }

  // POST /api/listings - Create listing (Food Donors)
  if (req.method === 'POST' && url.pathname === '/api/listings') {
    const user = getAuthUser(req);
    const {
      title,
      description,
      food_type,
      quantity_value,
      quantity_unit,
      prep_time,
      expiry_hours,
      expiry_window_desc,
      pickup_address,
      contact_phone,
      image_url,
      notes
    } = body;

    // Fallback donor id if not logged in
    const donorId = user ? user.id : 'usr_donor_1';
    const donorUser = db.prepare('SELECT * FROM users WHERE id = ?').get(donorId);

    if (!title || !food_type || !quantity_value) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Title, food type, and quantity are required.' }));
      return true;
    }

    const qVal = parseFloat(quantity_value) || 10;
    const qUnit = quantity_unit || 'servings';

    let servings = 0;
    let weightKg = 0;
    if (qUnit === 'servings' || qUnit === 'meals') {
      servings = Math.round(qVal);
      weightKg = parseFloat((servings * KG_PER_SERVING).toFixed(1));
    } else if (qUnit === 'kg') {
      weightKg = parseFloat(qVal.toFixed(1));
      servings = Math.max(1, Math.round(weightKg / KG_PER_SERVING));
    } else if (qUnit === 'boxes') {
      servings = Math.round(qVal * 3);
      weightKg = parseFloat((servings * KG_PER_SERVING).toFixed(1));
    }

    const expHours = parseFloat(expiry_hours) || 4;
    const expiryTime = new Date(Date.now() + expHours * 3600 * 1000).toISOString();
    const expiryDesc = expiry_window_desc || `Best before ${expHours} hours`;

    // Food photo selection fallback if not provided
    const foodPlaceholders = {
      'Veg': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      'Non-Veg': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      'Vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      'Packaged': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    };

    const finalImage = image_url || foodPlaceholders[food_type] || foodPlaceholders['Veg'];
    const newId = 'lst_' + crypto.randomUUID().slice(0, 8);

    db.prepare(`
      INSERT INTO listings (
        id, donor_id, title, description, food_type, quantity_value, quantity_unit,
        servings_est, weight_kg_est, prep_time, expiry_time, expiry_window_desc,
        pickup_address, contact_phone, image_url, status, safety_check_confirmed, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', 1, ?)
    `).run(
      newId,
      donorId,
      title.trim(),
      description ? description.trim() : 'Fresh surplus food, hygienically packed.',
      food_type,
      qVal,
      qUnit,
      servings,
      weightKg,
      prep_time || 'Just now',
      expiryTime,
      expiryDesc,
      pickup_address || (donorUser ? donorUser.address : 'Metro Plaza'),
      contact_phone || (donorUser ? donorUser.phone : '+1 (555) 123-4567'),
      finalImage,
      notes || ''
    );

    const created = db.prepare(`
      SELECT l.*, u.name as donor_name, u.subtype as donor_subtype
      FROM listings l JOIN users u ON l.donor_id = u.id
      WHERE l.id = ?
    `).get(newId);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, listing: created }));
    return true;
  }

  // POST /api/listings/:id/claim - Claim food (NGOs)
  const matchClaim = url.pathname.match(/^\/api\/listings\/([a-zA-Z0-9_-]+)\/claim$/);
  if (req.method === 'POST' && matchClaim) {
    const listingId = matchClaim[1];
    const user = getAuthUser(req);
    const { ngoName, eta, notes } = body;

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
    if (!listing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Listing not found' }));
      return true;
    }

    if (listing.status !== 'Available') {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Listing is already ${listing.status}.` }));
      return true;
    }

    const claimerId = user ? user.id : 'usr_ngo_1';
    const claimerName = user ? user.name : (ngoName || 'City Hope Food Bank');
    const claimId = 'clm_' + crypto.randomUUID().slice(0, 8);
    const nowIso = new Date().toISOString();

    // Update listing
    db.prepare(`
      UPDATE listings
      SET status = 'Claimed',
          claimed_by_id = ?,
          claimed_by_name = ?,
          claimed_at = ?
      WHERE id = ?
    `).run(claimerId, claimerName, nowIso, listingId);

    // Insert claim record
    db.prepare(`
      INSERT INTO claims (id, listing_id, ngo_id, status, pickup_eta, delivery_notes, beneficiary_count)
      VALUES (?, ?, ?, 'Claimed', ?, ?, ?)
    `).run(
      claimId,
      listingId,
      claimerId,
      eta || 'Within 45 minutes',
      notes || 'NGO scheduled for rapid pickup.',
      listing.servings_est
    );

    const updated = db.prepare(`
      SELECT l.*, u.name as donor_name
      FROM listings l JOIN users u ON l.donor_id = u.id
      WHERE l.id = ?
    `).get(listingId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Successfully claimed by ${claimerName}`, listing: updated }));
    return true;
  }

  // POST /api/listings/:id/volunteer - Assign volunteer for pickup & delivery
  const matchVolunteer = url.pathname.match(/^\/api\/listings\/([a-zA-Z0-9_-]+)\/volunteer$/);
  if (req.method === 'POST' && matchVolunteer) {
    const listingId = matchVolunteer[1];
    const user = getAuthUser(req);
    const { volunteerName, vehicleType } = body;

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
    if (!listing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Listing not found' }));
      return true;
    }

    const volId = user ? user.id : 'usr_vol_1';
    const volName = user ? user.name : (volunteerName || 'Alex Rivera (Volunteer)');

    db.prepare(`
      UPDATE listings
      SET volunteer_id = ?,
          volunteer_name = ?,
          status = 'In Transit'
      WHERE id = ?
    `).run(volId, volName, listingId);

    // Update claims
    db.prepare(`
      UPDATE claims
      SET volunteer_id = ?,
          status = 'In Transit',
          updated_at = datetime('now')
      WHERE listing_id = ?
    `).run(volId, listingId);

    const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `${volName} assigned for delivery pickup!`, listing: updated }));
    return true;
  }

  // PATCH /api/listings/:id/status - Update listing status (e.g. Completed)
  const matchStatus = url.pathname.match(/^\/api\/listings\/([a-zA-Z0-9_-]+)\/status$/);
  if (req.method === 'PATCH' && matchStatus) {
    const listingId = matchStatus[1];
    const { status, completionNotes } = body;

    const validStatuses = ['Available', 'Claimed', 'In Transit', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }));
      return true;
    }

    const completedAt = status === 'Completed' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE listings
      SET status = ?,
          completed_at = COALESCE(?, completed_at),
          notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END
      WHERE id = ?
    `).run(status, completedAt, completionNotes, completionNotes, listingId);

    if (status === 'Completed') {
      db.prepare(`
        UPDATE claims
        SET status = 'Completed', updated_at = datetime('now')
        WHERE listing_id = ?
      `).run(listingId);
    }

    const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, status, listing: updated }));
    return true;
  }

  // DELETE /api/listings/:id
  const matchDelete = url.pathname.match(/^\/api\/listings\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'DELETE' && matchDelete) {
    const listingId = matchDelete[1];
    db.prepare('DELETE FROM listings WHERE id = ?').run(listingId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Listing removed.' }));
    return true;
  }

  return false;
}

module.exports = {
  handleListingRoutes
};
