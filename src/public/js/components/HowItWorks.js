// How It Works Component (3-Step Visual Workflow)
import { icon } from '../icons.js';

export function renderHowItWorks(container) {
  container.innerHTML = `
    <section class="workflow-section" id="how-it-works">
      <div class="container">
        <div class="section-header">
          <div class="hero-badge-pill" style="margin-bottom: 0.75rem;">
            ${icon('refresh', { size: 14 })}
            <span>Seamless Coordination</span>
          </div>
          <h2>How ShareBite Works in 3 Simple Steps</h2>
          <p>We designed our food rescue pipeline to take surplus meals from kitchen counters to hungry families in record time with zero red tape.</p>
        </div>

        <div class="workflow-grid">
          <!-- Step 1: Post -->
          <div class="workflow-card">
            <span class="workflow-step-num">01</span>
            <div class="workflow-icon-wrap">
              ${icon('utensils', { size: 28 })}
            </div>
            <h3 class="workflow-title">1. Post Surplus Food</h3>
            <p class="workflow-desc">
              Restaurants, caterers, or households list excess food in under 2 minutes. Specify dietary type, quantity (servings/kg), preparation time, and best-before window.
            </p>
          </div>

          <!-- Step 2: Claim -->
          <div class="workflow-card">
            <span class="workflow-step-num">02</span>
            <div class="workflow-icon-wrap">
              ${icon('building', { size: 28 })}
            </div>
            <h3 class="workflow-title">2. Verified NGOs Claim</h3>
            <p class="workflow-desc">
              Registered NGOs and community shelters receive instant geographical alerts. With a single click, an NGO claims the donation and reserves it for their beneficiaries.
            </p>
          </div>

          <!-- Step 3: Deliver -->
          <div class="workflow-card">
            <span class="workflow-step-num">03</span>
            <div class="workflow-icon-wrap">
              ${icon('truck', { size: 28 })}
            </div>
            <h3 class="workflow-title">3. Deliver & Nourish</h3>
            <p class="workflow-desc">
              Registered volunteer couriers or NGO drivers pick up the temperature-sealed food containers and deliver them straight to local shelters, orphanages, or food banks.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}
