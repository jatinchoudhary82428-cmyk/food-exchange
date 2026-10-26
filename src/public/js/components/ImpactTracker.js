// Live Impact Tracker Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function renderImpactTracker(container) {
  async function loadData() {
    try {
      const data = await api.getImpact();
      state.set('impact', data);
      render(data);
    } catch (err) {
      console.error('Failed to load impact metrics:', err);
    }
  }

  function render(data) {
    const metrics = (data && data.metrics) || {
      mealsSaved: 3345,
      activeNGOs: 18,
      foodWasteSavedKg: 1338,
      co2PreventedKg: 3345,
      availableListings: 4
    };

    const recent = (data && data.recentActivity) || [];

    container.innerHTML = `
      <section class="impact-section" id="impact">
        <div class="container">
          <div class="section-header">
            <div class="hero-badge-pill" style="margin-bottom: 0.75rem;">
              ${icon('activity', { size: 14 })}
              <span>Verified Community Ledger</span>
            </div>
            <h2>Live Community Impact Tracker</h2>
            <p>Every donation on ShareBite directly cuts greenhouse gases, keeps landfill bins empty, and ensures nutritious food reaches underserved tables.</p>
          </div>

          <div class="impact-grid">
            <div class="impact-card">
              <div class="impact-card-icon emerald">
                ${icon('utensils', { size: 22 })}
              </div>
              <div class="impact-number" id="metric-meals">
                ${metrics.mealsSaved.toLocaleString()}+
              </div>
              <div class="impact-label">Meals Provided</div>
              <div class="impact-subtext">Nutritious portions served</div>
            </div>

            <div class="impact-card">
              <div class="impact-card-icon orange">
                ${icon('building', { size: 22 })}
              </div>
              <div class="impact-number" id="metric-ngos">
                ${metrics.activeNGOs}
              </div>
              <div class="impact-label">Active Verified NGOs</div>
              <div class="impact-subtext">Shelters & community kitchens</div>
            </div>

            <div class="impact-card">
              <div class="impact-card-icon amber">
                ${icon('package', { size: 22 })}
              </div>
              <div class="impact-number" id="metric-waste">
                ${metrics.foodWasteSavedKg.toLocaleString()} kg
              </div>
              <div class="impact-label">Food Waste Rescued</div>
              <div class="impact-subtext">Diverted from toxic landfills</div>
            </div>

            <div class="impact-card">
              <div class="impact-card-icon blue">
                ${icon('leaf', { size: 22 })}
              </div>
              <div class="impact-number" id="metric-co2">
                ${metrics.co2PreventedKg.toLocaleString()} kg
              </div>
              <div class="impact-label">CO₂e Emissions Prevented</div>
              <div class="impact-subtext">~2.5kg CO₂ averted per kg food</div>
            </div>
          </div>

          ${recent.length > 0 ? `
            <div class="activity-ticker">
              <span class="ticker-pulse-badge">Live Ticker</span>
              <div class="ticker-text">
                <strong>${recent[0].claimed_by_name || recent[0].donor_name}</strong>
                ${recent[0].status === 'Completed' ? 'successfully distributed' : recent[0].status === 'In Transit' ? 'is delivering' : 'claimed'}
                <strong>${recent[0].servings_est} meals</strong> from <em>${recent[0].donor_name}</em>
                (${recent[0].title.slice(0, 36)}...)
              </div>
              <span style="font-size: 0.775rem; color: var(--text-muted);">Real-time dispatch</span>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }

  // Initial render with placeholder or cached data
  render(state.get('impact'));
  loadData();

  // Refresh every 30 seconds for live feel
  const interval = setInterval(loadData, 30000);
  return () => clearInterval(interval);
}
