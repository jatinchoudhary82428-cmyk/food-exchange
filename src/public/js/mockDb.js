// ShareBite Client-Side Mock Database & Local State Fallback
// Provides 100% offline & zero-backend continuity for testing

const DEFAULT_MOCK_USERS = [
  {
    id: 'usr_donor_1',
    name: 'The Green Olive Trattoria',
    email: 'donor@greenolive.com',
    role: 'donor',
    subtype: 'Restaurant',
    category: 'Restaurant',
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
    role: 'donor',
    subtype: 'Caterer',
    category: 'Caterer',
    phone: '+1 (555) 345-6789',
    address: '120 Grand Plaza Boulevard',
    city: 'Metro City',
    verified: 1,
    avatar_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_ngo_1',
    name: 'City Hope Food Bank',
    email: 'ngo@cityhope.org',
    role: 'ngo',
    subtype: 'Food Bank',
    category: 'Food Bank',
    phone: '+1 (555) 987-6543',
    address: '404 Community Relief Ave',
    city: 'Metro City',
    verified: 1,
    avatar_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_vol_1',
    name: 'Alex Rivera',
    email: 'volunteer@sharebite.org',
    role: 'volunteer',
    subtype: 'Eco Courier / Driver',
    category: 'Eco Courier / Driver',
    phone: '+1 (555) 765-4321',
    address: '22 Elm Street, Uptown',
    city: 'Metro City',
    verified: 1,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_MOCK_LISTINGS = [
  {
    id: 'lst_1',
    donor_id: 'usr_donor_1',
    donor_name: 'The Green Olive Trattoria',
    donor_subtype: 'Restaurant',
    title: 'Freshly Baked Artisan Focaccia & Lasagna Trays',
    description: 'Surplus lunch trays of oven-baked Mediterranean vegetable lasagna and garlic herb focaccia loaves. Packaged in sanitized, insulated food-grade containers.',
    food_type: 'Veg',
    quantity_value: 35,
    quantity_unit: 'servings',
    servings_est: 35,
    weight_kg_est: 14.5,
    prep_time: 'Today, 1:00 PM',
    expiry_time: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
    expiry_window_desc: 'Best before 2 hours (Serve Hot)',
    pickup_address: '742 Evergreen Terrace (Kitchen Rear Door)',
    contact_phone: '+1 (555) 234-8901',
    image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    claimed_by_name: null,
    volunteer_name: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'lst_2',
    donor_id: 'usr_donor_2',
    donor_name: 'Spice Garden Banquet & Caterers',
    donor_subtype: 'Caterer',
    title: 'Corporate Buffet Excess: Basmati Biryani & Dal Makhani',
    description: 'High-end corporate banquet surplus from private conference. Aromatic basmati biryani with slow-cooked lentils and steamed vegetables.',
    food_type: 'Vegan',
    quantity_value: 50,
    quantity_unit: 'servings',
    servings_est: 50,
    weight_kg_est: 22.0,
    prep_time: 'Today, 2:30 PM',
    expiry_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    expiry_window_desc: 'Best before 4 hours',
    pickup_address: '120 Grand Plaza Boulevard, Service Bay B',
    contact_phone: '+1 (555) 345-6789',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    claimed_by_name: null,
    volunteer_name: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lst_3',
    donor_id: 'usr_donor_1',
    donor_name: 'The Green Olive Trattoria',
    donor_subtype: 'Restaurant',
    title: 'Grilled Herb Chicken Skewers & Mediterranean Rice',
    description: 'Catering batch prepared for private luncheon. Tender marinated chicken breast skewers with lemon herb rice and grilled zucchini.',
    food_type: 'Non-Veg',
    quantity_value: 40,
    quantity_unit: 'servings',
    servings_est: 40,
    weight_kg_est: 18.0,
    prep_time: 'Today, 12:45 PM',
    expiry_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    expiry_window_desc: 'Best before 3 hours',
    pickup_address: '742 Evergreen Terrace (Kitchen Rear Door)',
    contact_phone: '+1 (555) 234-8901',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    status: 'Claimed',
    claimed_by_name: 'City Hope Food Bank',
    volunteer_name: 'Alex Rivera',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

class MockDatabase {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      if (!localStorage.getItem('sb_mock_users')) {
        localStorage.setItem('sb_mock_users', JSON.stringify(DEFAULT_MOCK_USERS));
      }
      if (!localStorage.getItem('sb_mock_listings')) {
        localStorage.setItem('sb_mock_listings', JSON.stringify(DEFAULT_MOCK_LISTINGS));
      }
    } catch (e) {
      console.warn('Local storage not available, using in-memory mock store');
      this.inMemoryUsers = [...DEFAULT_MOCK_USERS];
      this.inMemoryListings = [...DEFAULT_MOCK_LISTINGS];
    }
  }

  getUsers() {
    try {
      const data = localStorage.getItem('sb_mock_users');
      return data ? JSON.parse(data) : DEFAULT_MOCK_USERS;
    } catch (e) {
      return this.inMemoryUsers || DEFAULT_MOCK_USERS;
    }
  }

  saveUsers(users) {
    try {
      localStorage.setItem('sb_mock_users', JSON.stringify(users));
    } catch (e) {
      this.inMemoryUsers = users;
    }
  }

  getListingsData() {
    try {
      const data = localStorage.getItem('sb_mock_listings');
      return data ? JSON.parse(data) : DEFAULT_MOCK_LISTINGS;
    } catch (e) {
      return this.inMemoryListings || DEFAULT_MOCK_LISTINGS;
    }
  }

  saveListings(listings) {
    try {
      localStorage.setItem('sb_mock_listings', JSON.stringify(listings));
    } catch (e) {
      this.inMemoryListings = listings;
    }
  }

  // --- Auth Fallback Methods ---

  register(userData) {
    const { name, email, password, role, subtype, category, phone, address, city } = userData;

    if (!name || !email || !password || !role) {
      throw new Error('Name, email, password, and role are required.');
    }

    const normalizedRole = role.toLowerCase();
    if (!['donor', 'ngo', 'volunteer'].includes(normalizedRole)) {
      throw new Error('Role must be donor, ngo, or volunteer.');
    }

    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const resolvedCategory = category || subtype || (normalizedRole === 'donor' ? 'Restaurant' : normalizedRole === 'ngo' ? 'Food Bank' : 'Eco Courier');
    const resolvedAddress = address || 'Metro City';
    const resolvedPhone = phone || '+1 (555) 123-4567';

    const defaultAvatar = normalizedRole === 'donor'
      ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'
      : normalizedRole === 'ngo'
      ? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: cleanEmail,
      role: normalizedRole,
      subtype: resolvedCategory,
      category: resolvedCategory,
      phone: resolvedPhone,
      address: resolvedAddress,
      city: city || 'Metro City',
      verified: 1,
      avatar_url: defaultAvatar,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    const token = 'sb_tok_mock_' + Math.random().toString(36).slice(2, 12);
    return { success: true, token, user: newUser, isFallback: true };
  }

  login(email, password) {
    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const token = 'sb_tok_mock_' + Math.random().toString(36).slice(2, 12);
    return { success: true, token, user, isFallback: true };
  }

  getDemoUsers() {
    return { users: this.getUsers().slice(0, 4) };
  }

  quickSwitch(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId) || users[0];
    const token = 'sb_tok_mock_' + Math.random().toString(36).slice(2, 12);
    return { success: true, token, user, isFallback: true };
  }

  // --- Listing Fallback Methods ---

  getListings(filters = {}) {
    let listings = [...this.getListingsData()];

    if (filters.status && filters.status !== 'all') {
      listings = listings.filter(l => l.status === filters.status);
    }
    if (filters.food_type && filters.food_type !== 'all') {
      listings = listings.filter(l => l.food_type === filters.food_type);
    }
    if (filters.donor_id) {
      listings = listings.filter(l => l.donor_id === filters.donor_id);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        l.donor_name.toLowerCase().includes(q)
      );
    }

    return { listings, count: listings.length, isFallback: true };
  }

  getListing(id) {
    const listings = this.getListingsData();
    const listing = listings.find(l => l.id === id);
    if (!listing) throw new Error('Listing not found');
    return { listing, claim: null, isFallback: true };
  }

  createListing(data) {
    const listings = this.getListingsData();
    const qVal = parseFloat(data.quantity_value) || 10;
    const qUnit = data.quantity_unit || 'servings';
    const servings = qUnit === 'servings' || qUnit === 'meals' ? Math.round(qVal) : Math.round(qVal * 2.5);
    const weightKg = parseFloat((servings * 0.4).toFixed(1));

    const newListing = {
      id: 'lst_' + Date.now().toString(36),
      donor_id: data.donor_id || 'usr_donor_1',
      donor_name: data.donor_name || 'The Green Olive Trattoria',
      donor_subtype: 'Restaurant',
      title: data.title.trim(),
      description: data.description || 'Nutritious surplus meal.',
      food_type: data.food_type || 'Veg',
      quantity_value: qVal,
      quantity_unit: qUnit,
      servings_est: servings,
      weight_kg_est: weightKg,
      prep_time: data.prep_time || 'Just now',
      expiry_time: new Date(Date.now() + (data.expiry_hours || 4) * 3600 * 1000).toISOString(),
      expiry_window_desc: data.expiry_window_desc || `Best before ${data.expiry_hours || 4} hours`,
      pickup_address: data.pickup_address || '742 Evergreen Terrace',
      contact_phone: data.contact_phone || '+1 (555) 234-8901',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      status: 'Available',
      claimed_by_name: null,
      volunteer_name: null,
      created_at: new Date().toISOString()
    };

    listings.unshift(newListing);
    this.saveListings(listings);
    return { success: true, listing: newListing, isFallback: true };
  }

  claimListing(id, payload = {}) {
    const listings = this.getListingsData();
    const item = listings.find(l => l.id === id);
    if (!item) throw new Error('Listing not found');
    if (item.status !== 'Available') throw new Error(`Listing is already ${item.status}`);

    item.status = 'Claimed';
    item.claimed_by_name = payload.ngoName || 'City Hope Food Bank';
    item.claimed_at = new Date().toISOString();
    this.saveListings(listings);

    return { success: true, message: `Claimed by ${item.claimed_by_name}`, listing: item, isFallback: true };
  }

  assignVolunteer(id, payload = {}) {
    const listings = this.getListingsData();
    const item = listings.find(l => l.id === id);
    if (!item) throw new Error('Listing not found');

    item.status = 'In Transit';
    item.volunteer_name = payload.volunteerName || 'Alex Rivera (Eco Courier)';
    this.saveListings(listings);

    return { success: true, message: `${item.volunteer_name} assigned`, listing: item, isFallback: true };
  }

  updateListingStatus(id, status, notes = '') {
    const listings = this.getListingsData();
    const item = listings.find(l => l.id === id);
    if (!item) throw new Error('Listing not found');

    item.status = status;
    if (status === 'Completed') {
      item.completed_at = new Date().toISOString();
    }
    this.saveListings(listings);
    return { success: true, status, listing: item, isFallback: true };
  }

  deleteListing(id) {
    let listings = this.getListingsData();
    listings = listings.filter(l => l.id !== id);
    this.saveListings(listings);
    return { success: true, message: 'Listing removed.', isFallback: true };
  }

  getImpact() {
    const listings = this.getListingsData();
    const rescued = listings.filter(l => ['Claimed', 'In Transit', 'Completed'].includes(l.status));
    const rescuedServings = rescued.reduce((acc, l) => acc + (l.servings_est || 0), 0);
    const rescuedWeight = rescued.reduce((acc, l) => acc + (l.weight_kg_est || 0), 0);

    const mealsSaved = 3200 + rescuedServings;
    const foodWasteSavedKg = parseFloat((1280 + rescuedWeight).toFixed(1));
    const co2PreventedKg = parseFloat((foodWasteSavedKg * 2.5).toFixed(1));

    return {
      metrics: {
        mealsSaved,
        activeNGOs: 18,
        foodWasteSavedKg,
        co2PreventedKg,
        availableListings: listings.filter(l => l.status === 'Available').length
      },
      recentActivity: listings.slice(0, 5),
      isFallback: true
    };
  }
}

export const mockDb = new MockDatabase();
