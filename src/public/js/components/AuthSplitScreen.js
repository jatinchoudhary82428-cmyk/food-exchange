// Split-Screen Sign In & Sign Up Component
// Inspired by Too Good To Go - 50/50 Desktop split with deep emerald branding

import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function renderAuthSplitScreen(container, initialMode = 'login') {
  let mode = initialMode; // 'login' | 'signup'
  let selectedRole = 'donor'; // 'donor' | 'ngo' | 'volunteer'
  let showPassword = false;
  let isSubmitting = false;

  function render() {
    const demoUsers = state.get('demoUsers') || [];
    const isLogin = mode === 'login';

    container.innerHTML = `
      <div class="auth-split-layout">
        <!-- LEFT SIDE: Deep Emerald Branded Panel -->
        <div class="auth-brand-panel">
          <div class="brand-panel-content">
            <!-- Top Left: Logo -->
            <div class="brand-panel-header">
              <a href="#home" class="brand-logo-link" title="Return to ShareBite Home">
                <div class="brand-logo-icon">
                  ${icon('utensils', { size: 22 })}
                </div>
                <span class="brand-logo-text">Share<span>Bite</span></span>
              </a>
            </div>

            <!-- Center: Bold Statement -->
            <div class="brand-panel-body">
              <div class="brand-mission-badge">
                ${icon('sparkles', { size: 14 })}
                <span>Too Good To Go Waste</span>
              </div>

              <h1 class="brand-headline">
                ${isLogin ? 'LOG IN TO<br/>SHAREBITE' : 'JOIN THE<br/>RESCUE MISSION'}
              </h1>

              <p class="brand-subtext">
                ${isLogin
                  ? 'Welcome back to the community where zero food waste meets zero hunger. Log in to manage food donations, claim rescues, or dispatch deliveries.'
                  : 'Connect your kitchen, shelter, or bicycle to our community network. Together, we divert delicious surplus food from landfills to plates in need.'}
              </p>

              <div class="brand-impact-pill">
                <div class="pill-dot"></div>
                <span>3,345+ Meals Rescued in Metro City</span>
              </div>
            </div>

            <!-- Bottom Left: Subtle Copyright -->
            <div class="brand-panel-footer">
              <span>© ShareBite • Clean Sustainability Network</span>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE: Clean White Form Panel -->
        <div class="auth-form-panel">
          <div class="auth-form-wrapper">
            <!-- Top Navigation: Back to Home & Tab Toggle -->
            <div class="form-panel-top">
              <a href="#home" class="btn-back-home" title="Back to main page">
                ${icon('arrow-left', { size: 16 })}
                <span>Back to Home</span>
              </a>

              <div class="auth-segmented-switch">
                <button class="auth-switch-tab ${isLogin ? 'active' : ''}" id="switch-to-login">Log In</button>
                <button class="auth-switch-tab ${!isLogin ? 'active' : ''}" id="switch-to-signup">Sign Up</button>
              </div>
            </div>

            <!-- Header Titles -->
            <div class="form-header-box">
              <h2 class="form-title">${isLogin ? 'Log in to your account' : 'Create your account'}</h2>
              <p class="form-subtitle">
                ${isLogin
                  ? 'Enter your credentials to continue your food rescue journey.'
                  : 'Start rescuing food or distributing meals in under two minutes.'}
              </p>
            </div>

            <!-- Instant 1-Click Demo Evaluation Pills -->
            <div class="demo-quick-bar">
              <span class="demo-bar-label">1-Click Test:</span>
              <div class="demo-pills-list">
                ${demoUsers.slice(0, 3).map(u => `
                  <button type="button" class="btn-demo-pill" data-user-id="${u.id}" title="Instant sign in as ${u.name}">
                    <span>${u.role === 'donor' ? '🍲 Donor' : u.role === 'ngo' ? '🏢 NGO' : '🚴 Volunteer'}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Active Form -->
            <form id="auth-main-form" novalidate>
              ${!isLogin ? `
                <!-- Name Field -->
                <div class="auth-form-group">
                  <label class="auth-label" for="input-name">
                    ${selectedRole === 'donor' ? 'Organization or Restaurant Name' : selectedRole === 'ngo' ? 'Shelter or NGO Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    id="input-name"
                    class="auth-input"
                    placeholder="${selectedRole === 'donor' ? 'The Green Olive Bistro' : selectedRole === 'ngo' ? 'City Hope Food Bank' : 'Alex Rivera'}"
                    required
                  />
                  <div class="field-error-msg" id="error-name"></div>
                </div>

                <!-- Role Selection Segmented Radio -->
                <div class="auth-form-group">
                  <label class="auth-label">Choose Your Role</label>
                  <div class="role-radio-group">
                    <label class="role-radio-card ${selectedRole === 'donor' ? 'selected' : ''}">
                      <input type="radio" name="signup-role" value="donor" ${selectedRole === 'donor' ? 'checked' : ''} />
                      <div class="role-radio-content">
                        <span class="role-emoji">🍲</span>
                        <div class="role-text-box">
                          <strong>Food Donor</strong>
                          <small>Restaurant / Caterer</small>
                        </div>
                      </div>
                    </label>

                    <label class="role-radio-card ${selectedRole === 'ngo' ? 'selected' : ''}">
                      <input type="radio" name="signup-role" value="ngo" ${selectedRole === 'ngo' ? 'checked' : ''} />
                      <div class="role-radio-content">
                        <span class="role-emoji">🏢</span>
                        <div class="role-text-box">
                          <strong>Receiver / NGO</strong>
                          <small>Shelter / Food Bank</small>
                        </div>
                      </div>
                    </label>

                    <label class="role-radio-card ${selectedRole === 'volunteer' ? 'selected' : ''}">
                      <input type="radio" name="signup-role" value="volunteer" ${selectedRole === 'volunteer' ? 'checked' : ''} />
                      <div class="role-radio-content">
                        <span class="role-emoji">🚴</span>
                        <div class="role-text-box">
                          <strong>Volunteer</strong>
                          <small>Eco Courier / Driver</small>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Category / Subtype Selector -->
                <div class="auth-form-group">
                  <label class="auth-label" for="input-category">Category / Specialization</label>
                  <select id="input-category" class="auth-select">
                    ${selectedRole === 'donor' ? `
                      <option value="Restaurant">Restaurant & Bistro</option>
                      <option value="Caterer">Event Caterer & Banquet</option>
                      <option value="Bakery">Artisan Bakery & Cafe</option>
                      <option value="Individual">Individual Food Donor</option>
                    ` : selectedRole === 'ngo' ? `
                      <option value="Food Bank">Food Bank</option>
                      <option value="Shelter">Homeless Shelter</option>
                      <option value="Orphanage">Children's Home / Orphanage</option>
                      <option value="Community Kitchen">Community Kitchen</option>
                    ` : `
                      <option value="Eco Courier / Biker">Eco Courier / Bicycle</option>
                      <option value="Car Driver">Driver (Car / Van)</option>
                      <option value="On-Foot Helper">On-Foot Neighborhood Courier</option>
                    `}
                  </select>
                </div>
              ` : ''}

              <!-- Email Field -->
              <div class="auth-form-group">
                <label class="auth-label" for="input-email">Email Address</label>
                <input
                  type="email"
                  id="input-email"
                  class="auth-input"
                  placeholder="name@example.com"
                  value="${isLogin ? 'donor@greenolive.com' : ''}"
                  autocomplete="email"
                  required
                />
                <div class="field-error-msg" id="error-email"></div>
              </div>

              <!-- Password Field with Eye Toggle -->
              <div class="auth-form-group">
                <div class="auth-label-row">
                  <label class="auth-label" for="input-password" style="margin-bottom: 0;">Password</label>
                  ${isLogin ? `
                    <button type="button" class="btn-forgot-password" id="btn-forgot-pwd">
                      Forgot password?
                    </button>
                  ` : ''}
                </div>

                <div class="password-input-wrap">
                  <input
                    type="${showPassword ? 'text' : 'password'}"
                    id="input-password"
                    class="auth-input"
                    placeholder="••••••••"
                    value="${isLogin ? 'password123' : ''}"
                    autocomplete="${isLogin ? 'current-password' : 'new-password'}"
                    required
                  />
                  <button type="button" class="btn-toggle-eye" id="btn-toggle-eye" aria-label="Toggle password visibility">
                    ${icon(showPassword ? 'eye-off' : 'eye', { size: 18 })}
                  </button>
                </div>
                <div class="field-error-msg" id="error-password"></div>
              </div>

              <!-- Action Buttons -->
              <div class="auth-actions-group">
                <button type="submit" class="btn-auth-primary" id="btn-auth-submit" ${isSubmitting ? 'disabled' : ''}>
                  <span>${isSubmitting ? 'PLEASE WAIT...' : isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}</span>
                </button>

                <button type="button" class="btn-auth-secondary" id="btn-auth-toggle-mode">
                  ${isLogin ? 'Sign up your account' : 'Log in to existing account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function validateEmail(email) {
    if (!email || !email.trim()) return 'Please enter your email address.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return 'Please enter a valid email address.';
    return null;
  }

  function validatePassword(pwd) {
    if (!pwd) return 'Please enter your password.';
    if (pwd.length < 6) return 'Password must be at least 6 characters.';
    return null;
  }

  function bindEvents() {
    // Mode toggles
    const switchLogin = container.querySelector('#switch-to-login');
    const switchSignup = container.querySelector('#switch-to-signup');
    const toggleModeBtn = container.querySelector('#btn-auth-toggle-mode');

    if (switchLogin) {
      switchLogin.addEventListener('click', () => {
        mode = 'login';
        window.location.hash = '#login';
        render();
      });
    }

    if (switchSignup) {
      switchSignup.addEventListener('click', () => {
        mode = 'signup';
        window.location.hash = '#signup';
        render();
      });
    }

    if (toggleModeBtn) {
      toggleModeBtn.addEventListener('click', () => {
        mode = mode === 'login' ? 'signup' : 'login';
        window.location.hash = `#${mode}`;
        render();
      });
    }

    // Role radio selection
    container.querySelectorAll('input[name="signup-role"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedRole = e.target.value;
        render();
      });
    });

    // Eye toggle for password visibility
    const eyeBtn = container.querySelector('#btn-toggle-eye');
    const pwdInput = container.querySelector('#input-password');
    if (eyeBtn && pwdInput) {
      eyeBtn.addEventListener('click', () => {
        showPassword = !showPassword;
        pwdInput.type = showPassword ? 'text' : 'password';
        eyeBtn.innerHTML = icon(showPassword ? 'eye-off' : 'eye', { size: 18 });
      });
    }

    // Forgot password hint
    const forgotBtn = container.querySelector('#btn-forgot-pwd');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        window.showToast?.('Default password for demo accounts is: password123', 'info');
      });
    }

    // Demo pills click (1-click test login)
    container.querySelectorAll('.btn-demo-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        try {
          const res = await api.quickSwitch(userId);
          if (res && res.success) {
            state.setUser(res.user, res.token);
            window.showToast?.(`Logged in as ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
            if (res.user.role === 'donor') state.setView('dashboard');
            else if (res.user.role === 'ngo') state.setView('feed');
            else state.setView('volunteer');
          }
        } catch (err) {
          window.showToast?.('Demo login failed: ' + err.message, 'error');
        }
      });
    });

    // Form submission
    const form = container.querySelector('#auth-main-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailEl = container.querySelector('#input-email');
        const pwdEl = container.querySelector('#input-password');
        const nameEl = container.querySelector('#input-name');
        const catEl = container.querySelector('#input-category');

        const errEmailEl = container.querySelector('#error-email');
        const errPwdEl = container.querySelector('#error-password');
        const errNameEl = container.querySelector('#error-name');

        // Clear previous error messages
        if (errEmailEl) errEmailEl.textContent = '';
        if (errPwdEl) errPwdEl.textContent = '';
        if (errNameEl) errNameEl.textContent = '';
        if (emailEl) emailEl.classList.remove('has-error');
        if (pwdEl) pwdEl.classList.remove('has-error');
        if (nameEl) nameEl.classList.remove('has-error');

        const email = emailEl?.value || '';
        const password = pwdEl?.value || '';
        const name = nameEl?.value || '';
        const category = catEl?.value || '';

        // Validation
        let hasError = false;

        if (mode === 'signup' && (!name || !name.trim())) {
          if (errNameEl) errNameEl.textContent = 'Please enter your organization or full name.';
          if (nameEl) nameEl.classList.add('has-error');
          hasError = true;
        }

        const emailErr = validateEmail(email);
        if (emailErr) {
          if (errEmailEl) errEmailEl.textContent = emailErr;
          if (emailEl) emailEl.classList.add('has-error');
          hasError = true;
        }

        const pwdErr = validatePassword(password);
        if (pwdErr) {
          if (errPwdEl) errPwdEl.textContent = pwdErr;
          if (pwdEl) pwdEl.classList.add('has-error');
          hasError = true;
        }

        if (hasError) return;

        isSubmitting = true;
        const submitBtn = container.querySelector('#btn-auth-submit');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>PLEASE WAIT...</span>`;
        }

        try {
          if (mode === 'login') {
            const res = await api.login(email, password);
            if (res && res.success) {
              state.setUser(res.user, res.token);
              window.showToast?.(`Welcome back, ${res.user.name}!`, 'success');
              if (res.user.role === 'donor') state.setView('dashboard');
              else if (res.user.role === 'ngo') state.setView('feed');
              else state.setView('volunteer');
            }
          } else {
            const res = await api.register({
              name,
              email,
              password,
              role: selectedRole,
              subtype: category,
              category,
              phone: '+1 (555) 123-4567',
              address: 'Metro Area',
              city: 'Metro City'
            });

            if (res && res.success) {
              state.setUser(res.user, res.token);
              const fallbackTag = res.isFallback ? ' (Local Mode)' : '';
              window.showToast?.(`Welcome to ShareBite, ${res.user.name}! Registered as ${res.user.role.toUpperCase()}${fallbackTag}`, 'success');
              if (res.user.role === 'donor') state.setView('dashboard');
              else if (res.user.role === 'ngo') state.setView('feed');
              else state.setView('volunteer');
            }
          }
        } catch (err) {
          console.error('Authentication Error:', err);
          const msg = err.message || 'Authentication failed. Please try again.';
          if (msg.toLowerCase().includes('email')) {
            if (errEmailEl) errEmailEl.textContent = msg;
            if (emailEl) emailEl.classList.add('has-error');
          } else if (msg.toLowerCase().includes('password')) {
            if (errPwdEl) errPwdEl.textContent = msg;
            if (pwdEl) pwdEl.classList.add('has-error');
          } else {
            window.showToast?.(msg, 'error');
          }
        } finally {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>${mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}</span>`;
          }
        }
      });
    }
  }

  render();
}
