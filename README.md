# ShareBite 🍽️🌱
> **Bridge the Gap Between Surplus Food and Empty Plates.**

A digital food rescue and redistribution platform designed to reduce food waste and alleviate hunger by connecting food donors (restaurants, caterers, banquet halls, individuals) with verified receiver organizations (NGOs, shelters, orphanages, food banks) and volunteer delivery couriers.

---

## 🌟 Key Highlights & Features

1. **User Authentication & 3-Role Community Selection**:
   - **🍲 Food Donor**: Restaurants, caterers, bakeries, event venues, and individuals with surplus.
   - **🏢 Receiver / NGO**: Verified food banks, homeless shelters, orphanages, and community soup kitchens.
   - **🚴 Volunteer**: Eco-couriers, drivers, and delivery logistics helpers.
   - **⚡ 1-Click Demo Persona Switcher**: Instantly switch roles between *The Green Olive Trattoria (Donor)*, *City Hope Food Bank (NGO)*, and *Alex Rivera (Volunteer)* for effortless testing.

2. **Engaging Home Experience**:
   - **Hero Banner**: *"Bridge the Gap Between Surplus Food and Empty Plates."* with dual CTAs (*Donate Food Now* and *Find Food Near Me*).
   - **Live Impact Tracker**: Dynamic real-time metrics showing *Meals Provided (3,345+)*, *Active Verified NGOs (18+)*, *Food Waste Saved (1,338 kg)*, and *CO₂e Prevented (3,345 kg)*.
   - **How It Works**: 3-step visual workflow (**01 Post** ➔ **02 Claim** ➔ **03 Deliver**).
   - **Safety & Hygiene Card**: Standards for safe 4-hour cook windows, insulated transport, tamper-sealed containers, and allergen transparency.

3. **Donor Features**:
   - **Surplus Food Posting Form**:
     - Dietary tags: `Veg`, `Non-Veg`, `Vegan`, `Packaged`.
     - Quantity with automatic conversion to standardized servings & weight in KG.
     - Preparation time & dynamic expiry countdown calculation.
     - Food photo preset picker (Italian Lasagna, Rice & Curry, Chicken Skewers, Dry Pantry Box) or custom URL.
     - Safety & Hygiene compliance checklist.
   - **Donor Dashboard**: Manage active listings, view real-time claim status (*Available*, *Claimed*, *Completed*), and mark deliveries as handoff completed.

4. **NGO & Volunteer Features**:
   - **Interactive Food Feed & Filtering**:
     - Instant keyword search (food title, donor name, address).
     - Dietary tag filter pills (`All`, `Veg`, `Vegan`, `Non-Veg`, `Packaged`).
     - Urgency filter (🚨 `< 2 Hours` remaining, `< 24 Hours`, `All`).
     - Status filter (`Available Only`, `Claimed`, `All`).
   - **Detailed Food Modal**: Full specifications, donor phone/address, and a **Single-Click "Claim Food"** button for verified NGOs.
   - **Volunteer Logistics Hub**: Active rescue tasks route display, with 1-click **"Accept Pickup"** and **"Confirm Delivery at Shelter"** actions.

5. **Dual Backend Support (Java & Node.js) - 0% Python**:
   - **Java Backend Option (`backend-java/`)**: Complete **Spring Boot 3 / Java 17+** enterprise REST API (JPA models, Repositories, Services, Controllers, and standalone zero-dependency server).
   - **Node.js 24 Server (`server.js`)**: Pure zero-dependency server running on native modules (`node:http`, `node:sqlite`).
   - **No Python**: Absolutely zero Python language or dependencies used anywhere in the project.
   - Fully persistent SQLite database (`sharebite.db`) with relational integrity and foreign keys.
   - Fully responsive UI styled with modern CSS variables, split-screen Too-Good-To-Go authentication, and warm Emerald Green branding.

---

## 📁 Full Folder Structure

```
sharebite/
├── package.json                    # Project metadata & npm scripts
├── server.js                       # Native Node 24 HTTP API & static file server
├── sharebite.db                    # Persistent SQLite database (WAL mode)
├── README.md                       # Comprehensive documentation
├── backend-java/                   # ☕ Complete Enterprise Java Backend
│   ├── pom.xml                     # Maven configuration (Spring Boot 3, SQLite JPA)
│   ├── ShareBiteStandaloneServer.java # Zero-dependency single-file Java server
│   └── src/main/java/com/sharebite/
│       ├── ShareBiteApplication.java  # Spring Boot entry point
│       ├── config/                 # CorsConfig, DataSeeder
│       ├── controller/             # AuthController, ListingController, ImpactController
│       ├── model/                  # User, FoodListing, Claim entities
│       ├── dto/                    # RegisterRequest, LoginRequest, ListingRequest
│       ├── repository/             # UserRepository, ListingRepository, ClaimRepository
│       └── service/                # AuthService, ListingService, ImpactService
├── src/
│   ├── config.js                   # Application constants, ports, baseline impact
│   ├── database/
│   │   ├── schema.sql              # Relational SQL schema (users, listings, claims)
│   │   └── db.js                   # node:sqlite DatabaseSync wrapper, migrations, seeding
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth (register, login, me, quick-switch)
│   │   ├── listingRoutes.js        # /api/listings (CRUD, search, filters, claim, volunteer, status)
│   │   └── impactRoutes.js         # /api/impact (live metrics, dynamic calculation)
│   └── public/                     # Modern Single-Page Application (Frontend)
│       ├── index.html              # Main HTML entry with semantic layout & accessibility
│       ├── css/
│       │   ├── variables.css       # Design tokens (Emerald, Amber, Slate, shadows)
│       │   ├── base.css            # CSS reset, typography, buttons, badges, navbar
│       │   └── components.css      # Hero, Impact, Cards, Modals, Feed, Toasts
│       └── js/
│           ├── api.js              # Fetch client with token injection & error handling
│           ├── state.js            # Reactive store with event-driven pub/sub
│           ├── icons.js            # 20+ crisp inline SVG icons (Zero CDN dependencies)
│           ├── app.js              # Application lifecycle, routing & mount
│           └── components/
│               ├── Navbar.js       # Sticky header, role indicator, demo switcher
│               ├── Hero.js         # Hero section & CTA navigation
│               ├── ImpactTracker.js# Dynamic metrics cards & live activity ticker
│               ├── HowItWorks.js   # 3-step visual workflow
│               ├── SafetyCard.js   # Hygiene and food handling protocol card
│               ├── FoodFeed.js     # Filterable food card grid & urgency badges
│               ├── FoodDetailModal.js # Detailed inspection & 1-click claim
│               ├── DonorDashboard.js # Post surplus form & active listings manager
│               ├── VolunteerHub.js # Courier route manager & status updater
│               └── AuthModal.js    # Sign-up / Login / 3-role selector modal
└── test/
    └── unit-integration.js         # 26 automated integration & API unit tests
```

---

## 🗄️ Database Models

Powered by native `node:sqlite DatabaseSync`:

### 1. `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique ID (e.g., `usr_donor_1`) |
| `name` | `TEXT` | `NOT NULL` | Organization or Individual name |
| `email` | `TEXT` | `UNIQUE NOT NULL`| User login email |
| `password_hash` | `TEXT` | `NOT NULL` | SHA-256 salted hash |
| `role` | `TEXT` | `CHECK(role IN ('donor', 'ngo', 'volunteer'))` | Primary role |
| `subtype` | `TEXT` | `NOT NULL` | Restaurant / Caterer / Food Bank / Shelter / Courier |
| `phone` | `TEXT` | `NOT NULL` | Contact number for pickup coordination |
| `address` | `TEXT` | `NOT NULL` | Physical pickup or delivery address |
| `city` | `TEXT` | `DEFAULT 'Metro City'` | Operational city |
| `verified` | `INTEGER` | `DEFAULT 1` | Verification status |

### 2. `listings` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique ID (e.g., `lst_1`) |
| `donor_id` | `TEXT` | `REFERENCES users(id)` | Foreign key to donor |
| `title` | `TEXT` | `NOT NULL` | Food dish name / surplus summary |
| `description` | `TEXT` | - | Details, packaging, allergens |
| `food_type` | `TEXT` | `CHECK('Veg', 'Non-Veg', 'Vegan', 'Packaged')` | Dietary classification |
| `quantity_value`| `REAL` | `NOT NULL` | Numerical quantity |
| `quantity_unit` | `TEXT` | `CHECK('servings', 'kg', 'boxes', 'meals')` | Unit of measure |
| `servings_est` | `INTEGER` | `NOT NULL` | Standardized portion count for impact metrics |
| `weight_kg_est` | `REAL` | `NOT NULL` | Standardized weight in KG (food waste saved) |
| `prep_time` | `TEXT` | `NOT NULL` | Timestamp / description of preparation |
| `expiry_time` | `TEXT` | `NOT NULL` | ISO 8601 expiry deadline |
| `expiry_window_desc` | `TEXT` | `NOT NULL` | Human-readable (e.g., "Best before 4 hours") |
| `pickup_address` | `TEXT` | `NOT NULL` | Location for courier collection |
| `contact_phone` | `TEXT` | `NOT NULL` | Donor phone number |
| `image_url` | `TEXT` | - | High-resolution food photo |
| `status` | `TEXT` | `CHECK('Available', 'Claimed', 'In Transit', 'Completed', 'Cancelled')` | Current lifecycle state |
| `claimed_by_id` | `TEXT` | `REFERENCES users(id)` | Claiming NGO ID |
| `claimed_by_name`| `TEXT`| - | Cached NGO name |
| `volunteer_id` | `TEXT` | `REFERENCES users(id)` | Assigned volunteer ID |
| `volunteer_name`| `TEXT` | - | Assigned volunteer name |

### 3. `claims` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Claim reference ID |
| `listing_id` | `TEXT` | `REFERENCES listings(id)` | Target listing |
| `ngo_id` | `TEXT` | `REFERENCES users(id)` | Claiming organization |
| `volunteer_id`| `TEXT` | `REFERENCES users(id)` | Delivery volunteer |
| `status` | `TEXT` | `CHECK('Claimed', 'In Transit', 'Completed', 'Cancelled')` | Claim lifecycle |
| `pickup_eta` | `TEXT` | - | Estimated pickup window |

---

## 🌐 API Endpoint Specifications

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/impact` | Live metrics (meals saved, active NGOs, KG saved, CO₂e) | No |
| `GET` | `/api/auth/demo-users` | Returns list of pre-seeded demo accounts | No |
| `POST` | `/api/auth/quick-switch` | 1-click login switch to any persona | No |
| `POST` | `/api/auth/register` | Register new user with role (`donor`, `ngo`, `volunteer`) | No |
| `POST` | `/api/auth/login` | Email/password authentication | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/listings` | Fetch listings with filters (`status`, `food_type`, `urgency`, `search`, `donor_id`) | No |
| `GET` | `/api/listings/:id` | Fetch single listing details with donor & claim information | No |
| `POST` | `/api/listings` | Create new food listing (calculates portions & KG) | Optional / Auto-assign |
| `POST` | `/api/listings/:id/claim` | Claim an available listing (sets status to `Claimed`) | Optional / Default NGO |
| `POST` | `/api/listings/:id/volunteer` | Assign courier to pickup (sets status to `In Transit`) | Optional / Default Vol |
| `PATCH` | `/api/listings/:id/status` | Update listing status (`Completed`, `Cancelled`) | Yes / Assigned |
| `DELETE` | `/api/listings/:id` | Cancel/delete an available listing | Yes / Donor |

---

## 🚀 How to Run ShareBite

### Prerequisites:
- **Node.js**: v20+ (Node v24 recommended for native `node:sqlite`).
- **Dependencies**: None! ShareBite is built purely with native standard libraries.

### Quick Start:
```bash
# 1. Navigate to the project directory
cd /Users/jatinchoudhary/.gemini/antigravity/scratch/sharebite

# 2. Run the test suite (Verifies 26 API & DB tests)
npm test

# 3. Start the application
npm start
```

### Accessing the Web App:
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 👥 Pre-Seeded Demo Accounts

You can test any role instantly using the **"DEMO ROLES"** dropdown in the top navigation bar, or log in with these credentials:

| Role | Name | Email | Password |
|---|---|---|---|
| **Food Donor** | The Green Olive Trattoria | `donor@greenolive.com` | `password123` |
| **Food Donor** | Spice Garden Banquet | `events@spicegarden.com` | `password123` |
| **Food Donor** | Sunrise Artisan Bakery | `hello@sunrisebakery.org` | `password123` |
| **Receiver / NGO** | City Hope Food Bank | `ngo@cityhope.org` | `password123` |
| **Receiver / NGO** | Nourish All Shelter | `contact@nourishall.org` | `password123` |
| **Volunteer** | Alex Rivera | `volunteer@sharebite.org` | `password123` |

---

## 🎨 Color Palette & UI Design System
- **Emerald Green** (`#059669`, `#10B981`): Represents environmental sustainability, life, freshness, and zero-waste rescue.
- **Warm Amber & Orange** (`#EA580C`, `#F97316`, `#F59E0B`): Evokes appetizing warmth, community caring, and urgent hunger relief.
- **Slate & Off-White** (`#F8FAFC`, `#0F172A`): Clean, accessible, high-contrast typography and readability.
