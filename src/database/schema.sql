-- ShareBite SQLite Database Schema
-- Optimized for node:sqlite DatabaseSync

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('donor', 'ngo', 'volunteer')),
  subtype TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Metro City',
  verified INTEGER NOT NULL DEFAULT 1,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  donor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  food_type TEXT NOT NULL CHECK(food_type IN ('Veg', 'Non-Veg', 'Vegan', 'Packaged')),
  quantity_value REAL NOT NULL,
  quantity_unit TEXT NOT NULL CHECK(quantity_unit IN ('servings', 'kg', 'boxes', 'meals')),
  servings_est INTEGER NOT NULL,
  weight_kg_est REAL NOT NULL,
  prep_time TEXT NOT NULL,
  expiry_time TEXT NOT NULL,
  expiry_window_desc TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Claimed', 'In Transit', 'Completed', 'Cancelled')),
  claimed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  claimed_by_name TEXT,
  claimed_at TEXT,
  volunteer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  volunteer_name TEXT,
  completed_at TEXT,
  safety_check_confirmed INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  ngo_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  volunteer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Claimed' CHECK(status IN ('Claimed', 'In Transit', 'Completed', 'Cancelled')),
  beneficiary_count INTEGER DEFAULT 0,
  pickup_eta TEXT,
  delivery_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_food_type ON listings(food_type);
CREATE INDEX IF NOT EXISTS idx_listings_donor ON listings(donor_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
