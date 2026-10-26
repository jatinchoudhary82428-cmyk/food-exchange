// Volunteer Logistics Hub Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function renderVolunteerHub(container) {
  let rescueTasks = [];

  async function loadTasks() {
    try {
      // Get claimed and in-transit listings
      const data = await api.getListings({ status: 'all' });
      rescueTasks = (data.listings || []).filter(l => ['Claimed', 'In Transit'].includes(l.status));
      render();
    } catch (err) {
      console.error('Error fetching volunteer tasks:', err);
    }
  }

  function render() {
    const user = state.get('currentUser');
    const isVolunteer = user && user.role === 'volunteer';
    const volName = user ? user.name : 'Alex Rivera (Eco Courier)';

    container.innerHTML = `
      <section class="dashboard-section" id="volunteer-hub">
        <div class="container">
          <div class="dashboard-header">
            <div>
              <div class="hero-badge-pill" style="margin-bottom: 0.5rem;">
                ${icon('truck', { size: 14 })}
                <span>Volunteer Logistics & Delivery</span>
              </div>
              <h2 style="font-size: 2rem;">Food Rescue Logistics Hub</h2>
              <p>Registered eco-couriers and drivers bridge the physical distance between donor kitchens and distribution shelters.</p>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="badge badge-veg">
                ${icon('check-circle', { size: 14 })}
                Active Courier: ${volName}
              </span>
            </div>
          </div>

          <!-- Pending Tasks Grid -->
          <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1.25rem;">Active Pickups & Rescue Deliveries</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">${rescueTasks.length} deliveries awaiting or in progress</span>
          </div>

          ${rescueTasks.length === 0 ? `
            <div style="text-align: center; padding: 4rem 1rem; background: #fff; border: 1px dashed var(--border-default); border-radius: var(--radius-xl);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🚴‍♂️</div>
              <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">All food deliveries are currently completed!</h3>
              <p style="color: var(--text-muted); max-width: 460px; margin: 0 auto;">When an NGO claims a donation that requires courier assistance, the pickup dispatch task will appear right here in real time.</p>
            </div>
          ` : `
            <div class="volunteer-grid">
              ${rescueTasks.map(task => `
                <div class="volunteer-card ${task.status === 'In Transit' ? 'in-transit' : ''}">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                      <span class="status-badge status-${task.status.toLowerCase().replace(' ', '-')}">
                        <span class="status-dot ${task.status === 'In Transit' ? 'pulse' : ''}"></span>
                        ${task.status}
                      </span>
                      <h4 style="font-size: 1.15rem; margin-top: 0.4rem; color: var(--text-main);">${task.title}</h4>
                    </div>
                    <img src="${task.image_url}" alt="${task.title}" style="width: 52px; height: 52px; border-radius: var(--radius-md); object-fit: cover; flex-shrink: 0;" />
                  </div>

                  <!-- Route Box -->
                  <div style="background: #fff; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1rem; font-size: 0.85rem;">
                    <div style="display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.5rem;">
                      <div style="color: var(--orange-600); margin-top: 0.15rem;">${icon('map-pin', { size: 16 })}</div>
                      <div>
                        <div style="font-weight: 700; color: var(--text-main);">Pickup: ${task.donor_name}</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">${task.pickup_address} (📞 ${task.contact_phone})</div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; gap: 0.6rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-subtle);">
                      <div style="color: var(--primary-700); margin-top: 0.15rem;">${icon('building', { size: 16 })}</div>
                      <div>
                        <div style="font-weight: 700; color: var(--text-main);">Destination: ${task.claimed_by_name || 'Designated Shelter'}</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">NGO Distribution Center</div>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                    <span>Quantity: <strong>${task.quantity_value} ${task.quantity_unit} (~${task.servings_est} meals)</strong></span>
                    <span>Window: <strong style="color: var(--orange-700);">${task.expiry_window_desc}</strong></span>
                  </div>

                  <div style="margin-top: auto; display: flex; gap: 0.5rem;">
                    ${task.status === 'Claimed' ? `
                      <button class="btn btn-secondary btn-assign-vol" style="flex: 1;" data-id="${task.id}">
                        ${icon('truck', { size: 16 })}
                        <span>Accept Pickup & Start Delivery</span>
                      </button>
                    ` : `
                      <button class="btn btn-primary btn-complete-vol" style="flex: 1;" data-id="${task.id}">
                        ${icon('check', { size: 16 })}
                        <span>Confirm Delivery at Shelter</span>
                      </button>
                    `}
                    <button class="btn btn-outline btn-sm btn-view-vol" data-id="${task.id}" title="Details">
                      ${icon('info', { size: 16 })}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </section>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Accept Delivery
    container.querySelectorAll('.btn-assign-vol').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.disabled = true;
        const user = state.get('currentUser');
        const volName = user ? user.name : 'Alex Rivera (Eco Courier)';
        try {
          await api.assignVolunteer(id, { volunteerName: volName });
          window.showToast?.(`You are assigned to deliver this rescue! En route.`, 'success');
          await loadTasks();
          api.getImpact().then(d => state.set('impact', d));
        } catch (err) {
          window.showToast?.('Error accepting delivery: ' + err.message, 'error');
          btn.disabled = false;
        }
      });
    });

    // Confirm Delivery
    container.querySelectorAll('.btn-complete-vol').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.disabled = true;
        try {
          await api.updateListingStatus(id, 'Completed', 'Delivered safely to shelter coordinator.');
          window.showToast?.('Food successfully delivered! Meals provided to community.', 'success');
          await loadTasks();
          api.getImpact().then(d => state.set('impact', d));
        } catch (err) {
          window.showToast?.('Error completing delivery: ' + err.message, 'error');
          btn.disabled = false;
        }
      });
    });

    // View details
    container.querySelectorAll('.btn-view-vol').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.openFoodDetailModal?.(id);
      });
    });
  }

  state.subscribe('currentUser', loadTasks);
  loadTasks();
}
