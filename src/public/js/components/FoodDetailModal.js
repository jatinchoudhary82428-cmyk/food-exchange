// Food Detail & Single-Click Claim Modal Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function setupFoodDetailModal() {
  const modalOverlay = document.getElementById('food-detail-modal-overlay');
  if (!modalOverlay) return;

  window.openFoodDetailModal = async function(listingId) {
    modalOverlay.classList.add('active');
    modalOverlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-body" style="text-align: center; padding: 3rem 1.5rem;">
          <div style="font-size: 2rem;">🍲</div>
          <div style="font-weight: 600; margin-top: 0.5rem; color: var(--text-muted);">Loading food details...</div>
        </div>
      </div>
    `;

    try {
      const data = await api.getListing(listingId);
      const listing = data.listing;
      const claim = data.claim;
      renderModalContent(listing, claim);
    } catch (err) {
      modalOverlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-body" style="text-align: center; padding: 2rem;">
            <div style="color: #ef4444; font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
            <h3>Failed to load listing</h3>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${err.message}</p>
            <button class="btn btn-outline btn-sm modal-close-btn-action">Close</button>
          </div>
        </div>
      `;
      modalOverlay.querySelector('.modal-close-btn-action')?.addEventListener('click', closeModal);
    }
  };

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function renderModalContent(item, claim) {
    const user = state.get('currentUser');
    const isNGO = user && user.role === 'ngo';
    const isVolunteer = user && user.role === 'volunteer';
    const isDonor = user && user.role === 'donor';

    const tagClass = item.food_type.toLowerCase().replace(/[^a-z]/g, '');

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 650px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="badge badge-${tagClass}">
              ${item.food_type}
            </span>
            <span class="status-badge status-${item.status.toLowerCase().replace(' ', '-')}">
              <span class="status-dot"></span>
              ${item.status}
            </span>
          </div>
          <button class="modal-close-btn modal-close-btn-action" aria-label="Close">
            ${icon('x', { size: 20 })}
          </button>
        </div>

        <div class="modal-body">
          <div style="position: relative; height: 260px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 1.5rem; background: #eee;">
            <img src="${item.image_url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg, transparent, rgba(0,0,0,0.85)); color: #fff; padding: 0.85rem 1.25rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--amber-200);">${item.donor_name} (${item.donor_subtype || 'Food Donor'})</div>
              <h2 style="color: #fff; font-size: 1.35rem; margin-top: 0.2rem;">${item.title}</h2>
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.925rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Description & Preparation</h4>
            <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">${item.description}</p>
          </div>

          <!-- Highlight Specs Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--bg-main); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Rescuable Quantity</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">
                ${item.quantity_value} ${item.quantity_unit}
              </div>
              <div style="font-size: 0.775rem; color: var(--primary-700); font-weight: 600;">~${item.servings_est} Meals (${item.weight_kg_est} kg)</div>
            </div>

            <div>
              <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Consumption Window</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--orange-600); margin-top: 0.2rem;">
                ${item.expiry_window_desc}
              </div>
              <div style="font-size: 0.775rem; color: var(--text-muted);">Prepared: ${item.prep_time}</div>
            </div>

            <div>
              <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Pickup Location</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
                ${icon('map-pin', { size: 14 })}
                <span>${item.pickup_address}</span>
              </div>
            </div>

            <div>
              <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Donor Contact</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
                ${icon('phone', { size: 14 })}
                <a href="tel:${item.contact_phone}" style="color: var(--primary-700); text-decoration: underline;">${item.contact_phone}</a>
              </div>
            </div>
          </div>

          <!-- Claim or Transit Status Notification -->
          ${item.status === 'Claimed' ? `
            <div style="background: var(--amber-50); border: 1.5px solid var(--amber-200); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
              <div style="font-size: 1.5rem;">🏢</div>
              <div>
                <div style="font-weight: 700; color: var(--orange-700);">Claimed by ${item.claimed_by_name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Claimed on ${new Date(item.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Waiting for volunteer pickup or direct collection.</div>
              </div>
            </div>
          ` : item.status === 'In Transit' ? `
            <div style="background: var(--status-transit-bg); border: 1.5px solid var(--status-transit-border); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
              <div style="font-size: 1.5rem;">🚴</div>
              <div>
                <div style="font-weight: 700; color: var(--status-transit-text);">In Transit with Volunteer ${item.volunteer_name || 'Assigned'}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">En route to shelter distribution center.</div>
              </div>
            </div>
          ` : item.status === 'Completed' ? `
            <div style="background: var(--status-completed-bg); border: 1.5px solid var(--status-completed-border); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
              <div style="font-size: 1.5rem;">✅</div>
              <div>
                <div style="font-weight: 700; color: var(--status-completed-text);">Food Successfully Rescued & Delivered!</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Distributed to beneficiaries. Impact logged into community ledger.</div>
              </div>
            </div>
          ` : ''}

          <!-- Hygiene & Transport Check -->
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: #fff; border: 1px dashed var(--border-default); border-radius: var(--radius-md);">
            ${icon('shield-check', { size: 16, className: 'text-emerald' })}
            <span>Donor verified hygienic preparation and food-grade packaging.</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline btn-sm modal-close-btn-action">Close</button>

          ${item.status === 'Available' ? `
            <button id="modal-btn-claim-action" class="btn btn-primary" data-listing-id="${item.id}">
              ${icon('check-circle', { size: 18 })}
              <span>${isNGO ? `Claim Food as ${user.name}` : 'Single-Click "Claim Food"'}</span>
            </button>
          ` : item.status === 'Claimed' && isVolunteer ? `
            <button id="modal-btn-volunteer-action" class="btn btn-secondary" data-listing-id="${item.id}">
              ${icon('truck', { size: 18 })}
              <span>Accept Delivery Route (Volunteer)</span>
            </button>
          ` : item.status === 'In Transit' && (isVolunteer || isDonor || isNGO) ? `
            <button id="modal-btn-complete-action" class="btn btn-primary" data-listing-id="${item.id}">
              ${icon('check', { size: 18 })}
              <span>Mark Delivered / Completed</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Bind Close Buttons
    modalOverlay.querySelectorAll('.modal-close-btn-action').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Single-Click Claim Handler
    const claimBtn = modalOverlay.querySelector('#modal-btn-claim-action');
    if (claimBtn) {
      claimBtn.addEventListener('click', async () => {
        claimBtn.disabled = true;
        claimBtn.innerHTML = `<span>Reserving donation...</span>`;

        try {
          // If not an NGO, default to City Hope NGO demo
          const ngoName = isNGO ? user.name : 'City Hope Food Bank (NGO)';
          const res = await api.claimListing(item.id, {
            ngoName,
            eta: 'Within 30-45 minutes'
          });

          if (res.success) {
            window.showToast?.(`Success! Food claimed by ${res.listing.claimed_by_name}`, 'success');
            closeModal();
            // Trigger feed refresh and impact update
            state.notify('filters', state.get('filters'));
            api.getImpact().then(d => state.set('impact', d));
          }
        } catch (err) {
          window.showToast?.('Could not claim food: ' + err.message, 'error');
          claimBtn.disabled = false;
          claimBtn.innerHTML = `<span>Retry Claim</span>`;
        }
      });
    }

    // Volunteer Action Handler
    const volBtn = modalOverlay.querySelector('#modal-btn-volunteer-action');
    if (volBtn) {
      volBtn.addEventListener('click', async () => {
        volBtn.disabled = true;
        try {
          const volName = isVolunteer ? user.name : 'Alex Rivera (Eco Courier)';
          const res = await api.assignVolunteer(item.id, { volunteerName: volName });
          if (res.success) {
            window.showToast?.(`Awesome! You are assigned to deliver ${item.title}`, 'success');
            closeModal();
            state.notify('filters', state.get('filters'));
            state.setView('volunteer');
          }
        } catch (err) {
          window.showToast?.('Failed to assign volunteer: ' + err.message, 'error');
          volBtn.disabled = false;
        }
      });
    }

    // Complete Action Handler
    const completeBtn = modalOverlay.querySelector('#modal-btn-complete-action');
    if (completeBtn) {
      completeBtn.addEventListener('click', async () => {
        completeBtn.disabled = true;
        try {
          const res = await api.updateListingStatus(item.id, 'Completed', 'Hygienically received & distributed.');
          if (res.success) {
            window.showToast?.('Donation marked as Completed & Delivered! Thank you for reducing food waste!', 'success');
            closeModal();
            state.notify('filters', state.get('filters'));
            api.getImpact().then(d => state.set('impact', d));
          }
        } catch (err) {
          window.showToast?.('Error updating status: ' + err.message, 'error');
          completeBtn.disabled = false;
        }
      });
    }
  }
}
