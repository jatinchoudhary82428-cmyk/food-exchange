// Interactive Food Feed & Search/Filter Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function renderFoodFeed(container) {
  let listings = [];
  let isLoading = false;

  async function fetchFeedListings() {
    isLoading = true;
    render();
    try {
      const filters = state.get('filters');
      const data = await api.getListings(filters);
      listings = data.listings || [];
      state.set('listings', listings);
    } catch (err) {
      console.error('Error fetching food feed:', err);
      window.showToast?.('Error loading food listings: ' + err.message, 'error');
    } finally {
      isLoading = false;
      render();
    }
  }

  function getExpiryStatus(isoExpiry) {
    const diff = new Date(isoExpiry).getTime() - Date.now();
    if (diff <= 0) return { label: 'Expired', urgent: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 2) {
      return { label: `⏳ Urgent: ${hours}h ${mins}m left`, urgent: true };
    } else if (hours < 24) {
      return { label: `Best before ${hours}h ${mins}m`, urgent: false };
    } else {
      const days = Math.round(hours / 24);
      return { label: `Valid for ~${days} days`, urgent: false };
    }
  }

  function render() {
    const filters = state.get('filters');
    const user = state.get('currentUser');
    const isNGO = user && user.role === 'ngo';
    const isVolunteer = user && user.role === 'volunteer';

    container.innerHTML = `
      <section class="feed-section" id="feed-container">
        <div class="container">
          <div class="section-header">
            <div class="hero-badge-pill" style="margin-bottom: 0.75rem;">
              ${icon('utensils', { size: 14 })}
              <span>Live Rescue Feed</span>
            </div>
            <h2>Available Surplus Food Near You</h2>
            <p>Browse active donations ready for immediate pickup. NGOs can claim with a single click, and volunteer couriers can accept distribution routes.</p>
          </div>

          <!-- Filter & Search Controls -->
          <div class="filter-bar">
            <!-- Search Input -->
            <div class="search-input-wrapper">
              <span class="search-icon">${icon('search', { size: 18 })}</span>
              <input
                type="text"
                id="feed-search-input"
                class="search-input"
                placeholder="Search food, dishes, restaurants, or locations..."
                value="${filters.search || ''}"
              />
            </div>

            <!-- Dietary Tag Pills -->
            <div class="filter-pills-group">
              ${['all', 'Veg', 'Vegan', 'Non-Veg', 'Packaged'].map(type => `
                <button class="filter-pill ${filters.food_type === type ? 'active' : ''}" data-filter-type="${type}">
                  ${type === 'all' ? 'All Diets' : type}
                </button>
              `).join('')}
            </div>

            <!-- Dropdown Filters (Urgency & Status) -->
            <div class="filter-dropdowns">
              <select id="feed-urgency-select" class="filter-select">
                <option value="all" ${filters.urgency === 'all' ? 'selected' : ''}>Any Expiry Window</option>
                <option value="urgent" ${filters.urgency === 'urgent' ? 'selected' : ''}>🚨 Expiring in &lt; 2 Hrs</option>
                <option value="today" ${filters.urgency === 'today' ? 'selected' : ''}>Today (&lt; 24 Hrs)</option>
              </select>

              <select id="feed-status-select" class="filter-select">
                <option value="Available" ${filters.status === 'Available' ? 'selected' : ''}>Available Only</option>
                <option value="Claimed" ${filters.status === 'Claimed' ? 'selected' : ''}>Claimed / In Transit</option>
                <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All Posts</option>
              </select>
            </div>
          </div>

          <!-- Feed Content -->
          ${isLoading ? `
            <div style="text-align: center; padding: 4rem 0;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🍲</div>
              <div style="font-weight: 600; color: var(--text-muted);">Fetching freshly posted community surplus...</div>
            </div>
          ` : listings.length === 0 ? `
            <div style="text-align: center; padding: 4rem 1rem; background: #fff; border: 1px dashed var(--border-default); border-radius: var(--radius-xl);">
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🍽️</div>
              <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">No food listings match your current filters</h3>
              <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 1.5rem;">Try widening your dietary tag or search query, or be the first food donor to list fresh surplus meals right now!</p>
              <button id="btn-reset-filters" class="btn btn-outline btn-sm">Reset Filters</button>
            </div>
          ` : `
            <div class="food-grid">
              ${listings.map(item => {
                const expiryInfo = getExpiryStatus(item.expiry_time);
                const tagClass = item.food_type.toLowerCase().replace(/[^a-z]/g, '');

                return `
                  <div class="food-card" data-listing-id="${item.id}">
                    <div class="food-card-img-wrap">
                      <img src="${item.image_url}" alt="${item.title}" class="food-card-img" loading="lazy" />
                      
                      <!-- Dietary Tag -->
                      <span class="badge badge-${tagClass} food-card-tag-badge">
                        ${item.food_type === 'Veg' ? icon('leaf', { size: 12 }) :
                          item.food_type === 'Vegan' ? icon('sparkles', { size: 12 }) :
                          item.food_type === 'Non-Veg' ? icon('utensils', { size: 12 }) :
                          icon('package', { size: 12 })}
                        ${item.food_type}
                      </span>

                      <!-- Status Badge -->
                      <span class="status-badge status-${item.status.toLowerCase().replace(' ', '-')} food-card-status-badge">
                        <span class="status-dot ${item.status === 'Available' ? 'pulse' : ''}"></span>
                        ${item.status}
                      </span>

                      <!-- Urgency countdown banner -->
                      <div class="food-card-urgency-banner ${expiryInfo.urgent ? 'urgent' : ''}">
                        ${icon('clock', { size: 14 })}
                        <span>${expiryInfo.label} • ${item.expiry_window_desc}</span>
                      </div>
                    </div>

                    <div class="food-card-body">
                      <div class="food-card-header">
                        <div class="food-card-donor">
                          ${icon('building', { size: 14 })}
                          <span>${item.donor_name}</span>
                          ${icon('check-circle', { size: 12, className: 'text-emerald' })}
                        </div>
                        <h3 class="food-card-title">${item.title}</h3>
                      </div>

                      <p class="food-card-desc">${item.description || 'Nutritious surplus meal packed hygienically for food rescue.'}</p>

                      <div class="food-card-meta">
                        <div class="food-card-meta-row">
                          <span class="food-card-meta-item">
                            ${icon('package', { size: 14 })}
                            <span>Quantity:</span>
                          </span>
                          <span class="food-card-quantity">
                            ${item.quantity_value} ${item.quantity_unit} (~${item.servings_est} meals / ${item.weight_kg_est} kg)
                          </span>
                        </div>

                        <div class="food-card-meta-row">
                          <span class="food-card-meta-item">
                            ${icon('map-pin', { size: 14 })}
                            <span>Location:</span>
                          </span>
                          <span style="font-weight: 500; font-size: 0.8rem; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${item.pickup_address}
                          </span>
                        </div>

                        ${item.claimed_by_name ? `
                          <div class="food-card-meta-row" style="color: var(--orange-700); font-weight: 600; font-size: 0.8rem; margin-top: 0.2rem;">
                            <span>🏢 Claimed by:</span>
                            <span>${item.claimed_by_name}</span>
                          </div>
                        ` : ''}
                      </div>

                      <div class="food-card-footer">
                        ${item.status === 'Available' ? `
                          <button class="btn btn-primary btn-claim-action" style="width: 100%;" data-id="${item.id}">
                            ${icon('check-circle', { size: 16 })}
                            <span>${isNGO ? 'Claim Food (Single-Click)' : 'View & Claim Food'}</span>
                          </button>
                        ` : item.status === 'Claimed' ? `
                          <button class="btn btn-outline btn-detail-action" style="width: 100%; border-color: var(--orange-200); color: var(--orange-700); background: var(--orange-50);" data-id="${item.id}">
                            ${icon('info', { size: 16 })}
                            <span>${isVolunteer ? 'Help Deliver (Volunteer)' : 'View Claim Details'}</span>
                          </button>
                        ` : `
                          <button class="btn btn-outline btn-detail-action" style="width: 100%;" data-id="${item.id}">
                            ${icon('check-circle', { size: 16, className: 'text-emerald' })}
                            <span>Completed / Delivered</span>
                          </button>
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </section>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Dietary tag pills
    container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const type = pill.getAttribute('data-filter-type');
        state.updateFilters({ food_type: type });
        fetchFeedListings();
      });
    });

    // Urgency Select
    const urgencySelect = container.querySelector('#feed-urgency-select');
    if (urgencySelect) {
      urgencySelect.addEventListener('change', (e) => {
        state.updateFilters({ urgency: e.target.value });
        fetchFeedListings();
      });
    }

    // Status Select
    const statusSelect = container.querySelector('#feed-status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        state.updateFilters({ status: e.target.value });
        fetchFeedListings();
      });
    }

    // Search Input with Debounce
    const searchInput = container.querySelector('#feed-search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          state.updateFilters({ search: e.target.value });
          fetchFeedListings();
        }, 350);
      });
    }

    // Reset Filters
    const resetBtn = container.querySelector('#btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.updateFilters({ food_type: 'all', urgency: 'all', status: 'all', search: '' });
        fetchFeedListings();
      });
    }

    // Action clicks (Claim / Details)
    container.querySelectorAll('.btn-claim-action, .btn-detail-action, .food-card').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-id') || el.closest('.food-card')?.getAttribute('data-listing-id');
        if (id) {
          window.openFoodDetailModal?.(id);
        }
      });
    });
  }

  // Subscribe to changes
  state.subscribe('filters', fetchFeedListings);

  // Initial load
  fetchFeedListings();
}
