// Safety & Hygiene Guidelines Summary Card Component
import { icon } from '../icons.js';

export function renderSafetyCard(container) {
  container.innerHTML = `
    <section class="safety-section">
      <div class="container">
        <div class="safety-card">
          <div class="safety-card-left">
            <div class="safety-badge-header">
              ${icon('shield-check', { size: 16, className: 'text-emerald' })}
              <span>Certified Safety Standard</span>
            </div>
            <h3>Safety & Hygiene First, Always.</h3>
            <p class="safety-card-desc">
              Feeding our community requires uncompromising food hygiene. All ShareBite participants adhere to strict food safety protocols to ensure wholesome, risk-free meals.
            </p>
          </div>

          <div class="safety-points-grid">
            <div class="safety-point-item">
              <div class="safety-point-icon">
                ${icon('clock', { size: 16 })}
              </div>
              <div>
                <div class="safety-point-title">Strict 4-Hour Cook Window</div>
                <div class="safety-point-text">Cooked perishables must be claimed and distributed within safe consumption windows before temperature breakdown.</div>
              </div>
            </div>

            <div class="safety-point-item">
              <div class="safety-point-icon">
                ${icon('package', { size: 16 })}
              </div>
              <div>
                <div class="safety-point-title">Food-Grade Sealed Containers</div>
                <div class="safety-point-text">All donations must be stored in sanitized, tamper-evident containers or food-safe catering foil to prevent contamination.</div>
              </div>
            </div>

            <div class="safety-point-item">
              <div class="safety-point-icon">
                ${icon('check-circle', { size: 16 })}
              </div>
              <div>
                <div class="safety-point-title">Allergen & Dietary Transparency</div>
                <div class="safety-point-text">Clear labeling of dietary tags (Veg, Non-Veg, Vegan, Packaged) and common allergens like nuts, dairy, or gluten.</div>
              </div>
            </div>

            <div class="safety-point-item">
              <div class="safety-point-icon">
                ${icon('truck', { size: 16 })}
              </div>
              <div>
                <div class="safety-point-title">Insulated Courier Transport</div>
                <div class="safety-point-text">Volunteers utilize thermal bags and insulated carriers ensuring hot foods stay hot and cold items remain chilled.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
