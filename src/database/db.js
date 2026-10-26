// Database Initialization and Query Helpers for ShareBite
// Powered by Node.js 24 native node:sqlite DatabaseSync

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../sharebite.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'sharebite_salt').digest('hex');
}

function getDatabase() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    // Enable WAL mode & foreign keys
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    // Load and execute schema
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);

    // Auto-seed if empty
    seedInitialData(db);
  }
  return db;
}

function seedInitialData(database) {
  const checkCount = database.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkCount.count > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding ShareBite database with initial community data...');

  const insertUser = database.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, subtype, phone, address, city, verified, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoUsers = [
    {
      id: 'usr_donor_1',
      name: 'The Green Olive Trattoria',
      email: 'donor@greenolive.com',
      password: 'password123',
      role: 'donor',
      subtype: 'Restaurant',
      phone: '+1 (555) 234-8901',
      address: '742 Evergreen Terrace, Downtown',
      city: 'Metro City',
      verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_donor_2',
      name: 'Spice Garden Banquet & Caterers',
      email: 'events@spicegarden.com',
      password: 'password123',
      role: 'donor',
      subtype: 'Caterer',
      phone: '+1 (555) 345-6789',
      address: '120 Grand Plaza Boulevard',
      city: 'Metro City',
      verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_donor_3',
      name: 'Sunrise Artisan Bakery',
      email: 'hello@sunrisebakery.org',
      password: 'password123',
      role: 'donor',
      subtype: 'Bakery / Individual',
      phone: '+1 (555) 456-7890',
      address: '88 Morning Glory Lane',
      city: 'Metro City',
      verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_ngo_1',
      name: 'City Hope Food Bank',
      email: 'ngo@cityhope.org',
      password: 'password123',
      role: 'ngo',
      subtype: 'Food Bank',
      phone: '+1 (555) 987-6543',
      address: '404 Community Relief Ave',
      city: 'Metro City',
      verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_ngo_2',
      name: 'Nourish All Children Shelter',
      email: 'contact@nourishall.org',
      password: 'password123',
      role: 'ngo',
      subtype: 'Orphanage / Shelter',
      phone: '+1 (555) 876-5432',
      address: '15 Hope Horizon Road',
      city: 'Metro City',
      verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_vol_1',
      name: 'Alex Rivera',
      email: 'volunteer@sharebite.org',
      password: 'password123',
      role: 'volunteer',
      subtype: 'Eco Courier / Driver',
      phone: '+1 (555) 765-4321',
      address: '22 Elm Street, Uptown',
      city: 'Metro City',
      verified: 1,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  ];

  for (const user of demoUsers) {
    insertUser.run(
      user.id,
      user.name,
      user.email,
      hashPassword(user.password),
      user.role,
      user.subtype,
      user.phone,
      user.address,
      user.city,
      user.verified,
      user.avatar_url
    );
  }

  const insertListing = database.prepare(`
    INSERT INTO listings (
      id, donor_id, title, description, food_type, quantity_value, quantity_unit,
      servings_est, weight_kg_est, prep_time, expiry_time, expiry_window_desc,
      pickup_address, contact_phone, image_url, status, claimed_by_id,
      claimed_by_name, claimed_at, volunteer_id, volunteer_name, completed_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const makeExpiry = (hoursAhead) => new Date(now.getTime() + hoursAhead * 3600 * 1000).toISOString();

  const demoListings = [
    {
      id: 'lst_1',
      donor_id: 'usr_donor_1',
      title: 'Freshly Baked Artisan Focaccia & Lasagna Trays',
      description: 'Surplus lunch trays of oven-baked Mediterranean vegetable lasagna and garlic herb focaccia loaves. Packaged in sanitized, insulated food-grade containers, ready for warm distribution.',
      food_type: 'Veg',
      quantity_value: 35,
      quantity_unit: 'servings',
      servings_est: 35,
      weight_kg_est: 14.5,
      prep_time: 'Today, 1:00 PM',
      expiry_time: makeExpiry(1.5), // Urgency test case: < 2 hours!
      expiry_window_desc: 'Best before 2 hours (Serve Hot)',
      pickup_address: '742 Evergreen Terrace (Kitchen Rear Door)',
      contact_phone: '+1 (555) 234-8901',
      image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
      status: 'Available',
      claimed_by_id: null,
      claimed_by_name: null,
      claimed_at: null,
      volunteer_id: null,
      volunteer_name: null,
      completed_at: null,
      notes: 'Contains gluten and dairy. Includes 4 sealed catering trays.'
    },
    {
      id: 'lst_2',
      donor_id: 'usr_donor_2',
      title: 'Corporate Buffet Excess: Basmati Biryani & Dal Makhani',
      description: 'High-end corporate banquet surplus from private conference. Aromatic basmati biryani with slow-cooked lentils and steamed vegetables. Sealed in clean stainless and food-grade foil containers.',
      food_type: 'Vegan',
      quantity_value: 50,
      quantity_unit: 'servings',
      servings_est: 50,
      weight_kg_est: 22.0,
      prep_time: 'Today, 2:30 PM',
      expiry_time: makeExpiry(4),
      expiry_window_desc: 'Best before 4 hours',
      pickup_address: '120 Grand Plaza Boulevard, Service Bay B',
      contact_phone: '+1 (555) 345-6789',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      status: 'Available',
      claimed_by_id: null,
      claimed_by_name: null,
      claimed_at: null,
      volunteer_id: null,
      volunteer_name: null,
      completed_at: null,
      notes: '100% plant-based, allergen free (nut free).'
    },
    {
      id: 'lst_3',
      donor_id: 'usr_donor_3',
      title: 'Assorted Artisan Sourdough & Croissants',
      description: 'End-of-day handcrafted sourdough rounds, baguettes, multigrain rolls, and flaky pain au chocolat. Perfectly fresh and individually bagged in paper sacks.',
      food_type: 'Veg',
      quantity_value: 20,
      quantity_unit: 'kg',
      servings_est: 60,
      weight_kg_est: 20.0,
      prep_time: 'Today, 6:00 AM',
      expiry_time: makeExpiry(8),
      expiry_window_desc: 'Best before 12 hours',
      pickup_address: '88 Morning Glory Lane',
      contact_phone: '+1 (555) 456-7890',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      status: 'Available',
      claimed_by_id: null,
      claimed_by_name: null,
      claimed_at: null,
      volunteer_id: null,
      volunteer_name: null,
      completed_at: null,
      notes: 'Ideal for breakfast at shelters or family pantry boxes.'
    },
    {
      id: 'lst_4',
      donor_id: 'usr_donor_2',
      title: 'Grilled Herb Chicken Skewers & Mediterranean Rice',
      description: 'Catering batch prepared for private luncheon. Tender marinated chicken breast skewers with lemon herb rice and grilled zucchini. Temperature-controlled in commercial warmers.',
      food_type: 'Non-Veg',
      quantity_value: 40,
      quantity_unit: 'servings',
      servings_est: 40,
      weight_kg_est: 18.0,
      prep_time: 'Today, 12:45 PM',
      expiry_time: makeExpiry(3),
      expiry_window_desc: 'Best before 3 hours',
      pickup_address: '120 Grand Plaza Boulevard, Loading Dock 1',
      contact_phone: '+1 (555) 345-6789',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      status: 'Claimed',
      claimed_by_id: 'usr_ngo_1',
      claimed_by_name: 'City Hope Food Bank',
      claimed_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      volunteer_id: 'usr_vol_1',
      volunteer_name: 'Alex Rivera',
      completed_at: null,
      notes: 'Contains poultry. Picked up by volunteer Alex Rivera for City Hope distribution.'
    },
    {
      id: 'lst_5',
      donor_id: 'usr_donor_1',
      title: 'Sealed Whole Grain Pasta & Canned Organic Legumes',
      description: 'Factory sealed pantry cartons donated from inventory rollover: dry penne rigate, canned chickpeas, diced tomatoes, and pure olive oil bottles. Non-perishable.',
      food_type: 'Packaged',
      quantity_value: 80,
      quantity_unit: 'kg',
      servings_est: 180,
      weight_kg_est: 80.0,
      prep_time: 'Packaged Stock',
      expiry_time: makeExpiry(720), // 30 days
      expiry_window_desc: 'Non-perishable (Best by 6 months)',
      pickup_address: '742 Evergreen Terrace (Main Desk)',
      contact_phone: '+1 (555) 234-8901',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      status: 'Completed',
      claimed_by_id: 'usr_ngo_2',
      claimed_by_name: 'Nourish All Children Shelter',
      claimed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      volunteer_id: 'usr_vol_1',
      volunteer_name: 'Alex Rivera',
      completed_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      notes: 'Delivered directly to Nourish All pantry. Supported 180 youth meals.'
    }
  ];

  for (const item of demoListings) {
    insertListing.run(
      item.id,
      item.donor_id,
      item.title,
      item.description,
      item.food_type,
      item.quantity_value,
      item.quantity_unit,
      item.servings_est,
      item.weight_kg_est,
      item.prep_time,
      item.expiry_time,
      item.expiry_window_desc,
      item.pickup_address,
      item.contact_phone,
      item.image_url,
      item.status,
      item.claimed_by_id,
      item.claimed_by_name,
      item.claimed_at,
      item.volunteer_id,
      item.volunteer_name,
      item.completed_at,
      item.notes
    );
  }

  // Insert seed claims
  const insertClaim = database.prepare(`
    INSERT INTO claims (id, listing_id, ngo_id, volunteer_id, status, beneficiary_count, pickup_eta, delivery_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertClaim.run(
    'clm_1',
    'lst_4',
    'usr_ngo_1',
    'usr_vol_1',
    'In Transit',
    40,
    '30 minutes',
    'Volunteer Alex Rivera dispatched with insulated food carrier.'
  );

  insertClaim.run(
    'clm_2',
    'lst_5',
    'usr_ngo_2',
    'usr_vol_1',
    'Completed',
    180,
    'Delivered yesterday',
    'Received in good condition by Sister Grace at shelter.'
  );

  console.log('✅ ShareBite database initialized and seeded successfully.');
}

module.exports = {
  getDatabase,
  hashPassword
};
