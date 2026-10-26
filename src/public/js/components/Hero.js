// Hero Component
import { state } from '../state.js';
import { icon } from '../icons.js';

export function renderHero(container) {
  container.innerHTML = `
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-content">
          <div class="hero-badge-pill">
            ${icon('sparkles', { size: 15 })}
            <span>Transforming Surplus into Sustenance</span>
          </div>

          <h1 class="hero-title">
            Bridge the Gap Between <span class="text-emerald">Surplus Food</span> and <span class="text-orange">Empty Plates.</span>
          </h1>

          <p class="hero-subtitle">
            Every day, tons of fresh, delicious food goes to landfills while local shelters struggle to feed those in need. ShareBite unites restaurants, caterers, and individuals with certified NGOs and grassroots volunteers for rapid, safe food rescue.
          </p>

          <div class="hero-cta-group">
            <button id="hero-btn-donate" class="btn btn-primary btn-lg">
              ${icon('utensils', { size: 18 })}
              <span>Donate Food Now</span>
            </button>
            <button id="hero-btn-feed" class="btn btn-secondary btn-lg">
              ${icon('search', { size: 18 })}
              <span>Find Food Near Me</span>
            </button>
          </div>

          <div class="hero-tags">
            <div class="hero-tag-item">
              ${icon('check-circle', { size: 16, className: 'text-emerald' })}
              <span>100% Free Platform</span>
            </div>
            <div class="hero-tag-item">
              ${icon('shield-check', { size: 16, className: 'text-emerald' })}
              <span>Hygiene & Safety Certified</span>
            </div>
            <div class="hero-tag-item">
              ${icon('clock', { size: 16, className: 'text-orange' })}
              <span>Under 45-Min Rescue Dispatch</span>
            </div>
          </div>
        </div>

        <div class="hero-visual-card">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80"
            alt="Community volunteers distributing warm meals"
            class="hero-visual-img"
          />
          <div class="hero-floating-badge">
            ${icon('heart', { size: 14 })}
            <span>Zero Food Waste Mission</span>
          </div>
          <div class="hero-floating-stat">
            <div class="impact-card-icon emerald" style="margin-bottom: 0; width: 2.25rem; height: 2.25rem;">
              ${icon('truck', { size: 16 })}
            </div>
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-main);">Rapid Pickup</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Active Volunteer Couriers En Route</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Attach button events
  const donateBtn = container.querySelector('#hero-btn-donate');
  const feedBtn = container.querySelector('#hero-btn-feed');

  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      const user = state.get('currentUser');
      if (user && user.role === 'donor') {
        state.setView('donate');
      } else {
        state.setView('donate');
      }
    });
  }

  if (feedBtn) {
    feedBtn.addEventListener('click', () => {
      state.setView('feed');
      const feedEl = document.querySelector('#feed-container');
      if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
