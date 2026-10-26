// User Authentication & Role Selection Modal Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function setupAuthModal() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (!modalOverlay) return;

  let activeTab = 'signup'; // 'signup' | 'login'
  let selectedRole = 'donor'; // 'donor' | 'ngo' | 'volunteer'

  window.openAuthModal = function(initialTab = 'signup', initialRole = 'donor') {
    activeTab = initialTab;
    selectedRole = initialRole;
    modalOverlay.classList.add('active');
    render();
  };

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function render() {
    const demoUsers = state.get('demoUsers') || [];

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="nav-brand-logo" style="width: 1.75rem; height: 1.75rem;">
              ${icon('utensils', { size: 14 })}
            </div>
            <span style="font-weight: 800; font-size: 1.15rem; color: var(--primary-700);">ShareBite Community</span>
          </div>
          <button class="modal-close-btn modal-close-btn-action" aria-label="Close">
            ${icon('x', { size: 20 })}
          </button>
        </div>

        <!-- Quick 1-Click Demo Logins for fast evaluation -->
        <div style="background: var(--amber-50); border-bottom: 1px solid var(--amber-200); padding: 0.75rem 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--orange-700); text-transform: uppercase; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.3rem;">
            ${icon('sparkles', { size: 13 })}
            <span>Instant 1-Click Demo Evaluation</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            ${demoUsers.map(u => `
              <button class="btn btn-outline btn-sm btn-quick-demo-login" data-user-id="${u.id}" style="background: #fff; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-color: var(--amber-300);">
                <span>${u.role === 'donor' ? '🍲 Donor' : u.role === 'ngo' ? '🏢 NGO' : '🚴 Volunteer'}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="modal-body" style="padding-top: 1.25rem;">
          <!-- Tabs -->
          <div style="display: flex; border-bottom: 1.5px solid var(--border-default); margin-bottom: 1.5rem;">
            <button class="auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}" id="tab-signup" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 0.9rem; text-align: center; border-bottom: 2px solid ${activeTab === 'signup' ? 'var(--primary-600)' : 'transparent'}; color: ${activeTab === 'signup' ? 'var(--primary-700)' : 'var(--text-muted)'};">
              Create Account
            </button>
            <button class="auth-tab-btn ${activeTab === 'login' ? 'active' : ''}" id="tab-login" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 0.9rem; text-align: center; border-bottom: 2px solid ${activeTab === 'login' ? 'var(--primary-600)' : 'transparent'}; color: ${activeTab === 'login' ? 'var(--primary-700)' : 'var(--text-muted)'};">
              Sign In
            </button>
          </div>

          ${activeTab === 'signup' ? `
            <form id="form-auth-signup">
              <!-- Role Selector -->
              <div style="margin-bottom: 1rem;">
                <label class="form-label">Select Your Community Role *</label>
                <div class="role-cards-grid">
                  <div class="role-select-card ${selectedRole === 'donor' ? 'selected' : ''}" data-role="donor">
                    <div class="role-card-icon">🍲</div>
                    <div class="role-card-title">Food Donor</div>
                    <div class="role-card-desc">Restaurant, Caterer, or Individual with surplus</div>
                  </div>

                  <div class="role-select-card ${selectedRole === 'ngo' ? 'selected' : ''}" data-role="ngo">
                    <div class="role-card-icon">🏢</div>
                    <div class="role-card-title">Receiver / NGO</div>
                    <div class="role-card-desc">Shelter, Orphanage, or Food Bank distributing meals</div>
                  </div>

                  <div class="role-select-card ${selectedRole === 'volunteer' ? 'selected' : ''}" data-role="volunteer">
                    <div class="role-card-icon">🚴</div>
                    <div class="role-card-title">Volunteer</div>
                    <div class="role-card-desc">Logistics helper & delivery courier</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-name">
                  ${selectedRole === 'donor' ? 'Restaurant / Donor Name *' : selectedRole === 'ngo' ? 'NGO / Organization Name *' : 'Full Name *'}
                </label>
                <input type="text" id="reg-name" class="form-input" placeholder="${selectedRole === 'donor' ? 'e.g. Green Olive Bistro' : selectedRole === 'ngo' ? 'e.g. Hope Community Shelter' : 'e.g. Alex Rivera'}" required />
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="reg-email">Email Address *</label>
                  <input type="email" id="reg-email" class="form-input" placeholder="you@domain.org" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="reg-password">Password *</label>
                  <input type="password" id="reg-password" class="form-input" placeholder="••••••••" required />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="reg-phone">Phone Number *</label>
                  <input type="tel" id="reg-phone" class="form-input" placeholder="+1 (555) 000-0000" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="reg-subtype">Category / Subtype</label>
                  <select id="reg-subtype" class="form-select">
                    ${selectedRole === 'donor' ? `
                      <option value="Restaurant">Restaurant</option>
                      <option value="Caterer">Event Caterer / Banquet</option>
                      <option value="Bakery">Bakery / Cafe</option>
                      <option value="Individual">Individual Donor</option>
                    ` : selectedRole === 'ngo' ? `
                      <option value="Food Bank">Food Bank</option>
                      <option value="Shelter">Homeless Shelter</option>
                      <option value="Orphanage">Children's Home / Orphanage</option>
                      <option value="Community Kitchen">Community Soup Kitchen</option>
                    ` : `
                      <option value="Eco Courier / Biker">Eco Courier / Bicycle</option>
                      <option value="Car Driver">Driver (Car / Van)</option>
                      <option value="On-Foot Helper">On-Foot Neighborhood Helper</option>
                    `}
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-address">Street Address & City *</label>
                <input type="text" id="reg-address" class="form-input" placeholder="e.g. 104 Hope Way, Metro City" required />
              </div>

              <button type="submit" id="btn-submit-signup" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem;">
                ${icon('check-circle', { size: 18 })}
                <span>Create ShareBite Account</span>
              </button>
            </form>
          ` : `
            <form id="form-auth-login">
              <div class="form-group">
                <label class="form-label" for="login-email">Email Address</label>
                <input type="email" id="login-email" class="form-input" placeholder="donor@greenolive.com" value="donor@greenolive.com" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="login-password">Password</label>
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" value="password123" required />
              </div>

              <div style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                Default demo password: <code>password123</code> for all demo accounts.
              </div>

              <button type="submit" id="btn-submit-login" class="btn btn-primary btn-lg" style="width: 100%;">
                ${icon('log-in', { size: 18 })}
                <span>Sign In to ShareBite</span>
              </button>
            </form>
          `}
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Close button
    modalOverlay.querySelectorAll('.modal-close-btn-action').forEach(b => {
      b.addEventListener('click', closeModal);
    });

    // Tab switching
    const tabSignup = modalOverlay.querySelector('#tab-signup');
    const tabLogin = modalOverlay.querySelector('#tab-login');

    if (tabSignup) {
      tabSignup.addEventListener('click', () => {
        activeTab = 'signup';
        render();
      });
    }

    if (tabLogin) {
      tabLogin.addEventListener('click', () => {
        activeTab = 'login';
        render();
      });
    }

    // Role selection cards
    modalOverlay.querySelectorAll('.role-select-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedRole = card.getAttribute('data-role');
        render();
      });
    });

    // Quick demo login buttons inside modal
    modalOverlay.querySelectorAll('.btn-quick-demo-login').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        try {
          const res = await api.quickSwitch(userId);
          if (res.success) {
            state.setUser(res.user, res.token);
            window.showToast?.(`Logged in as ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
            closeModal();
            if (res.user.role === 'donor') state.setView('dashboard');
            else if (res.user.role === 'ngo') state.setView('feed');
            else state.setView('volunteer');
          }
        } catch (err) {
          window.showToast?.('Login failed: ' + err.message, 'error');
        }
      });
    });

    // Sign up submit
    const signupForm = modalOverlay.querySelector('#form-auth-signup');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = modalOverlay.querySelector('#btn-submit-signup');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Creating Account...</span>`;
        }

        const name = modalOverlay.querySelector('#reg-name')?.value;
        const email = modalOverlay.querySelector('#reg-email')?.value;
        const password = modalOverlay.querySelector('#reg-password')?.value;
        const phone = modalOverlay.querySelector('#reg-phone')?.value;
        const subtype = modalOverlay.querySelector('#reg-subtype')?.value;
        const address = modalOverlay.querySelector('#reg-address')?.value;

        try {
          const res = await api.register({
            name,
            email,
            password,
            role: selectedRole,
            subtype,
            category: subtype,
            phone,
            address,
            city: 'Metro City'
          });

          if (res && res.success) {
            state.setUser(res.user, res.token);
            const fallbackBadge = res.isFallback ? ' (Local Mode)' : '';
            window.showToast?.(`Welcome to ShareBite, ${res.user.name}! Registered as ${res.user.role.toUpperCase()}${fallbackBadge}`, 'success');
            closeModal();
            // Redirect / update UI according to chosen role
            if (res.user.role === 'donor') {
              state.setView('dashboard');
            } else if (res.user.role === 'ngo') {
              state.setView('feed');
            } else {
              state.setView('volunteer');
            }
          }
        } catch (err) {
          console.error('Registration submit error:', err);
          window.showToast?.('Registration error: ' + (err.message || 'Unknown error'), 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              ${icon('check-circle', { size: 18 })}
              <span>Create ShareBite Account</span>
            `;
          }
        }
      });
    }

    // Login submit
    const loginForm = modalOverlay.querySelector('#form-auth-login');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = modalOverlay.querySelector('#btn-submit-login');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Signing in...</span>`;
        }

        const email = modalOverlay.querySelector('#login-email')?.value;
        const password = modalOverlay.querySelector('#login-password')?.value;

        try {
          const res = await api.login(email, password);
          if (res && res.success) {
            state.setUser(res.user, res.token);
            window.showToast?.(`Welcome back, ${res.user.name}!`, 'success');
            closeModal();
            if (res.user.role === 'donor') state.setView('dashboard');
            else if (res.user.role === 'ngo') state.setView('feed');
            else state.setView('volunteer');
          }
        } catch (err) {
          console.error('Login submit error:', err);
          window.showToast?.('Login error: ' + (err.message || 'Invalid credentials'), 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              ${icon('log-in', { size: 18 })}
              <span>Sign In to ShareBite</span>
            `;
          }
        }
      });
    }
  }
}
