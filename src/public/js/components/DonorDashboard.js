// Donor Dashboard & Food Listing Creation Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function renderDonorDashboard(container) {
  let donorListings = [];
  let isSubmitting = false;

  const PRESET_PHOTOS = [
    {
      name: 'Artisan Lasagna & Breads',
      type: 'Veg',
      url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Basmati Rice & Veg Curry',
      type: 'Vegan',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Roasted Chicken & Rice',
      type: 'Non-Veg',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Pantry Box & Dry Goods',
      type: 'Packaged',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    }
  ];

  let selectedImageUrl = PRESET_PHOTOS[0].url;

  async function loadDonorData() {
    const user = state.get('currentUser');
    const donorId = (user && user.role === 'donor') ? user.id : 'usr_donor_1';

    try {
      const data = await api.getListings({ donor_id: donorId, status: 'all' });
      donorListings = data.listings || [];
      render();
    } catch (err) {
      console.error('Error loading donor listings:', err);
    }
  }

  function render() {
    const user = state.get('currentUser');
    const donorName = user ? user.name : 'The Green Olive Trattoria (Donor)';
    const donorPhone = user ? user.phone : '+1 (555) 234-8901';
    const donorAddress = user ? user.address : '742 Evergreen Terrace, Downtown';

    const activeCount = donorListings.filter(l => l.status === 'Available').length;
    const claimedCount = donorListings.filter(l => l.status === 'Claimed' || l.status === 'In Transit').length;
    const completedCount = donorListings.filter(l => l.status === 'Completed').length;
    const totalServings = donorListings.reduce((acc, l) => acc + (l.servings_est || 0), 0);
    const totalKg = donorListings.reduce((acc, l) => acc + (l.weight_kg_est || 0), 0);

    container.innerHTML = `
      <section class="dashboard-section" id="donor-dashboard">
        <div class="container">
          <div class="dashboard-header">
            <div>
              <div class="hero-badge-pill" style="margin-bottom: 0.5rem;">
                ${icon('building', { size: 14 })}
                <span>Food Donor Portal</span>
              </div>
              <h2 style="font-size: 2rem;">Donor Management Dashboard</h2>
              <p>Welcome back, <strong>${donorName}</strong>. List your surplus food in seconds to immediately connect with verified local NGOs.</p>
            </div>

            <button id="btn-toggle-create-form" class="btn btn-primary">
              ${icon('plus', { size: 18 })}
              <span>Create New Food Donation</span>
            </button>
          </div>

          <!-- Stats Overview Cards -->
          <div class="dashboard-stats-grid">
            <div class="dashboard-stat-card">
              <div class="impact-card-icon emerald" style="margin-bottom: 0;">
                ${icon('package', { size: 24 })}
              </div>
              <div>
                <div class="dashboard-stat-num" style="color: var(--primary-700);">${activeCount}</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Active Listings Available</div>
              </div>
            </div>

            <div class="dashboard-stat-card">
              <div class="impact-card-icon orange" style="margin-bottom: 0;">
                ${icon('truck', { size: 24 })}
              </div>
              <div>
                <div class="dashboard-stat-num" style="color: var(--orange-600);">${claimedCount}</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">In-Progress Pickups</div>
              </div>
            </div>

            <div class="dashboard-stat-card">
              <div class="impact-card-icon amber" style="margin-bottom: 0;">
                ${icon('heart', { size: 24 })}
              </div>
              <div>
                <div class="dashboard-stat-num" style="color: var(--amber-600);">${totalServings}+</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Total Meals Rescued (${totalKg.toFixed(1)} kg)</div>
              </div>
            </div>
          </div>

          <!-- Create Food Listing Form Container -->
          <div id="create-listing-panel" class="form-card" style="display: none; border-left: 4px solid var(--primary-600);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-default); padding-bottom: 1rem;">
              <div>
                <h3 style="font-size: 1.35rem;">Post Excess / Surplus Food</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Fill out food specs to alert nearby food banks and shelters.</p>
              </div>
              <button id="btn-cancel-create" class="btn btn-outline btn-sm">Cancel</button>
            </div>

            <form id="form-create-listing">
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="food-title">Food Title *</label>
                  <input
                    type="text"
                    id="food-title"
                    class="form-input"
                    placeholder="e.g. Fresh Vegetable Lasagna & Sourdough Rolls"
                    required
                  />
                  <div class="form-hint">A clear, appetizing title helps NGOs assess distribution fit.</div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="food-diet-type">Dietary Tag *</label>
                  <select id="food-diet-type" class="form-select" required>
                    <option value="Veg">Vegetarian (Veg)</option>
                    <option value="Vegan">100% Plant-Based (Vegan)</option>
                    <option value="Non-Veg">Non-Vegetarian (Chicken/Meat)</option>
                    <option value="Packaged">Packaged / Non-Perishable Groceries</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="food-description">Detailed Description & Preparation Details</label>
                <textarea
                  id="food-description"
                  class="form-textarea"
                  rows="3"
                  placeholder="Detail the cooking method, packaging trays, allergen notes (e.g. dairy-free, contains gluten)..."
                ></textarea>
              </div>

              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label" for="food-quantity-val">Quantity Value *</label>
                  <input
                    type="number"
                    id="food-quantity-val"
                    class="form-input"
                    min="1"
                    step="any"
                    value="25"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="food-quantity-unit">Quantity Unit *</label>
                  <select id="food-quantity-unit" class="form-select">
                    <option value="servings">Individual Servings / Plates</option>
                    <option value="kg">Weight in Kilograms (KG)</option>
                    <option value="boxes">Catering Trays / Boxes</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="food-expiry-hours">Safe Expiry Window *</label>
                  <select id="food-expiry-hours" class="form-select">
                    <option value="2">🚨 Best before 2 Hours (Urgent Hot Food)</option>
                    <option value="4" selected>Best before 4 Hours</option>
                    <option value="8">Best before 8 Hours (End of Day)</option>
                    <option value="24">Best before 24 Hours (Refrigerated)</option>
                    <option value="168">Packaged Stock (7+ Days)</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="food-address">Pickup Address *</label>
                  <input
                    type="text"
                    id="food-address"
                    class="form-input"
                    value="${donorAddress}"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="food-phone">Contact Phone Number *</label>
                  <input
                    type="tel"
                    id="food-phone"
                    class="form-input"
                    value="${donorPhone}"
                    required
                  />
                </div>
              </div>

              <!-- Photo Preset Picker -->
              <div class="form-group">
                <label class="form-label">Food Photo (Choose Quick Preset or Custom Image URL)</label>
                <div class="form-preset-picker">
                  ${PRESET_PHOTOS.map((p, idx) => `
                    <div class="preset-thumbnail ${selectedImageUrl === p.url ? 'selected' : ''}" data-url="${p.url}">
                      <img src="${p.url}" alt="${p.name}" />
                      <span>${p.name}</span>
                    </div>
                  `).join('')}
                </div>
                <input
                  type="url"
                  id="food-custom-url"
                  class="form-input"
                  style="margin-top: 0.75rem;"
                  placeholder="Or paste an image URL..."
                  value="${selectedImageUrl}"
                />
              </div>

              <!-- Hygiene Checkbox -->
              <div class="form-group" style="background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: var(--radius-md); padding: 0.85rem 1rem;">
                <label style="display: flex; align-items: flex-start; gap: 0.6rem; cursor: pointer;">
                  <input type="checkbox" id="food-safety-check" checked required style="margin-top: 0.2rem;" />
                  <span style="font-size: 0.85rem; color: var(--primary-800); font-weight: 600;">
                    I certify that this food was cooked/stored in compliance with local food safety & hygiene standards, packed in sanitized containers, and is safe for immediate consumption.
                  </span>
                </label>
              </div>

              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                <button type="button" id="btn-cancel-create-2" class="btn btn-outline">Cancel</button>
                <button type="submit" id="btn-submit-listing" class="btn btn-primary btn-lg" ${isSubmitting ? 'disabled' : ''}>
                  ${icon('check-circle', { size: 18 })}
                  <span>${isSubmitting ? 'Publishing Post...' : 'Publish Food Donation'}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Existing Listings Table -->
          <div style="margin-top: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="font-size: 1.25rem;">Your Posted Surplus Food Listings</h3>
              <span style="font-size: 0.825rem; color: var(--text-muted); font-weight: 600;">${donorListings.length} total records</span>
            </div>

            <div class="listings-table-wrap">
              <table class="listings-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Dietary Type</th>
                    <th>Quantity</th>
                    <th>Expiry Window</th>
                    <th>Status</th>
                    <th>Claimed By</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${donorListings.length === 0 ? `
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        No food listings found for this donor yet. Click "Create New Food Donation" above to post!
                      </td>
                    </tr>
                  ` : donorListings.map(item => `
                    <tr>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <img src="${item.image_url}" alt="${item.title}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;" />
                          <div>
                            <div style="font-weight: 700; color: var(--text-main);">${item.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${item.pickup_address}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-${item.food_type.toLowerCase().replace(/[^a-z]/g, '')}">
                          ${item.food_type}
                        </span>
                      </td>
                      <td>
                        <strong>${item.quantity_value} ${item.quantity_unit}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">(~${item.servings_est} meals)</div>
                      </td>
                      <td>
                        <span style="font-size: 0.825rem; font-weight: 600; color: var(--orange-700);">
                          ${item.expiry_window_desc}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge status-${item.status.toLowerCase().replace(' ', '-')}">
                          <span class="status-dot ${item.status === 'Available' ? 'pulse' : ''}"></span>
                          ${item.status}
                        </span>
                      </td>
                      <td>
                        ${item.claimed_by_name ? `
                          <div style="font-weight: 700; color: var(--primary-700);">${item.claimed_by_name}</div>
                          <div style="font-size: 0.725rem; color: var(--text-muted);">Vol: ${item.volunteer_name || 'Direct Pickup'}</div>
                        ` : `
                          <span style="color: var(--text-muted); font-size: 0.8rem;">Waiting for NGO</span>
                        `}
                      </td>
                      <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 0.4rem;">
                          <button class="btn btn-outline btn-sm action-view-detail" data-id="${item.id}" title="View Details">
                            ${icon('info', { size: 14 })}
                          </button>

                          ${item.status !== 'Completed' ? `
                            <button class="btn btn-outline-primary btn-sm action-mark-complete" data-id="${item.id}" title="Mark as Completed / Picked Up">
                              ${icon('check', { size: 14 })}
                              <span>Complete</span>
                            </button>
                          ` : ''}

                          ${item.status === 'Available' ? `
                            <button class="btn btn-outline btn-sm action-delete-listing" data-id="${item.id}" title="Cancel Listing" style="color: #ef4444;">
                              ${icon('x', { size: 14 })}
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    `;

    bindEvents();
  }

  function bindEvents() {
    const toggleBtn = container.querySelector('#btn-toggle-create-form');
    const panel = container.querySelector('#create-listing-panel');
    const cancelBtn = container.querySelector('#btn-cancel-create');
    const cancelBtn2 = container.querySelector('#btn-cancel-create-2');

    if (toggleBtn && panel) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) panel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    [cancelBtn, cancelBtn2].forEach(btn => {
      if (btn && panel) {
        btn.addEventListener('click', () => {
          panel.style.display = 'none';
        });
      }
    });

    // Preset Photo Clicks
    container.querySelectorAll('.preset-thumbnail').forEach(el => {
      el.addEventListener('click', () => {
        selectedImageUrl = el.getAttribute('data-url');
        container.querySelectorAll('.preset-thumbnail').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
        const customInput = container.querySelector('#food-custom-url');
        if (customInput) customInput.value = selectedImageUrl;
      });
    });

    const customUrlInput = container.querySelector('#food-custom-url');
    if (customUrlInput) {
      customUrlInput.addEventListener('input', (e) => {
        selectedImageUrl = e.target.value.trim();
      });
    }

    // Form Submit
    const form = container.querySelector('#form-create-listing');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        isSubmitting = true;

        const title = container.querySelector('#food-title')?.value;
        const food_type = container.querySelector('#food-diet-type')?.value;
        const description = container.querySelector('#food-description')?.value;
        const quantity_value = container.querySelector('#food-quantity-val')?.value;
        const quantity_unit = container.querySelector('#food-quantity-unit')?.value;
        const expiry_hours = container.querySelector('#food-expiry-hours')?.value;
        const pickup_address = container.querySelector('#food-address')?.value;
        const contact_phone = container.querySelector('#food-phone')?.value;

        try {
          const res = await api.createListing({
            title,
            food_type,
            description,
            quantity_value,
            quantity_unit,
            expiry_hours,
            pickup_address,
            contact_phone,
            image_url: selectedImageUrl,
            prep_time: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

          if (res.success) {
            window.showToast?.('Food donation posted successfully! Local NGOs notified.', 'success');
            form.reset();
            if (panel) panel.style.display = 'none';
            await loadDonorData();
            state.notify('filters', state.get('filters'));
            api.getImpact().then(d => state.set('impact', d));
          }
        } catch (err) {
          window.showToast?.('Failed to create listing: ' + err.message, 'error');
        } finally {
          isSubmitting = false;
        }
      });
    }

    // View Details action
    container.querySelectorAll('.action-view-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.openFoodDetailModal?.(id);
      });
    });

    // Mark Complete action
    container.querySelectorAll('.action-mark-complete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.disabled = true;
        try {
          await api.updateListingStatus(id, 'Completed', 'Donor confirmed pickup handoff.');
          window.showToast?.('Listing marked as completed & distributed!', 'success');
          await loadDonorData();
          state.notify('filters', state.get('filters'));
          api.getImpact().then(d => state.set('impact', d));
        } catch (err) {
          window.showToast?.('Error updating status: ' + err.message, 'error');
          btn.disabled = false;
        }
      });
    });

    // Cancel / Delete listing
    container.querySelectorAll('.action-delete-listing').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to cancel this food donation?')) {
          try {
            await api.deleteListing(id);
            window.showToast?.('Listing cancelled.', 'info');
            await loadDonorData();
            state.notify('filters', state.get('filters'));
          } catch (err) {
            window.showToast?.('Failed to delete listing: ' + err.message, 'error');
          }
        }
      });
    });
  }

  // Subscribe to user role change
  state.subscribe('currentUser', loadDonorData);

  loadDonorData();
}
