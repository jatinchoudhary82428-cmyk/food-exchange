// Navbar Component
import { state } from '../state.js';
import { api } from '../api.js';
import { icon } from '../icons.js';

export function renderNavbar(container) {
  function update() {
    const user = state.get('currentUser');
    const activeView = state.get('activeView');
    const demoUsers = state.get('demoUsers') || [];

    const isDonor = user && user.role === 'donor';
    const isNGO = user && user.role === 'ngo';
    const isVolunteer = user && user.role === 'volunteer';

    container.innerHTML = `
      <nav class="navbar">
        <div class="container navbar-inner">
          <a href="#home" class="nav-brand" data-view="home">
            <div class="nav-brand-logo">
              ${icon('utensils', { size: 20 })}
            </div>
            <span>Share<span style="color: var(--orange-500);">Bite</span></span>
          </a>

          <ul class="nav-links">
            <li>
              <a href="#home" class="nav-link ${activeView === 'home' ? 'active' : ''}" data-view="home">Home</a>
            </li>
            <li>
              <a href="#feed" class="nav-link ${activeView === 'feed' ? 'active' : ''}" data-view="feed">
                Find Food
              </a>
            </li>
            <li>
              <a href="#donate" class="nav-link ${activeView === 'donate' ? 'active' : ''}" data-view="donate">
                Donate Food
              </a>
            </li>
            <li>
              <a href="#volunteer" class="nav-link ${activeView === 'volunteer' ? 'active' : ''}" data-view="volunteer">
                Volunteer Hub
              </a>
            </li>
            ${user ? `
            <li>
              <a href="#dashboard" class="nav-link ${activeView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
                ${isDonor ? 'Donor Dashboard' : isNGO ? 'NGO Claims' : 'My Deliveries'}
              </a>
            </li>` : ''}
          </ul>

          <div class="nav-actions">
            <!-- Demo Quick Switcher Dropdown -->
            <div class="demo-switcher-wrap" style="position: relative;">
              <button id="btn-demo-switch" class="btn btn-outline btn-sm" title="Quickly switch demo personas for testing">
                ${icon('refresh', { size: 14 })}
                <span class="demo-btn-label">${user ? user.role.toUpperCase() : 'DEMO ROLES'}</span>
                ${icon('chevron-right', { size: 12, className: 'rotate-down' })}
              </button>
              <div id="demo-dropdown" class="demo-dropdown" style="display: none; position: absolute; right: 0; top: 110%; width: 270px; background: #fff; border: 1px solid var(--border-default); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); padding: 0.5rem; z-index: 500;">
                <div style="padding: 0.4rem 0.6rem; font-size: 0.725rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                  Switch Persona (1-Click Test)
                </div>
                ${demoUsers.map(u => `
                  <div class="demo-select-item" data-user-id="${u.id}" style="padding: 0.5rem 0.65rem; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.15s; ${user && user.id === u.id ? 'background: var(--primary-50); font-weight: 700;' : ''}">
                    <span style="font-size: 1.1rem;">${u.role === 'donor' ? '🍲' : u.role === 'ngo' ? '🏢' : '🚴'}</span>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 0.8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${u.name}</div>
                      <div style="font-size: 0.7rem; color: var(--text-muted);">${u.role.toUpperCase()} • ${u.subtype}</div>
                    </div>
                    ${user && user.id === u.id ? icon('check', { size: 14, className: 'text-emerald' }) : ''}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Auth Buttons -->
            ${user ? `
              <div class="user-pill">
                <img src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${user.name}" class="user-avatar-sm" />
                <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name.split(' ')[0]}</span>
                <button id="btn-logout" title="Log Out" style="color: var(--text-muted); margin-left: 0.2rem; display: flex; align-items: center;">
                  ${icon('log-out', { size: 15 })}
                </button>
              </div>
            ` : `
              <a href="#login" id="btn-open-auth" class="btn btn-primary btn-sm" data-view="login">
                ${icon('log-in', { size: 15 })}
                <span>Sign In / Join</span>
              </a>
            `}

            <button class="mobile-nav-toggle" id="btn-mobile-nav" aria-label="Toggle Navigation">
              ☰
            </button>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div id="mobile-drawer" style="display: none; background: #fff; border-bottom: 1px solid var(--border-default); padding: 1rem 1.25rem;">
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.85rem;">
            <li><a href="#home" class="nav-link" data-view="home">Home</a></li>
            <li><a href="#feed" class="nav-link" data-view="feed">Find Food</a></li>
            <li><a href="#donate" class="nav-link" data-view="donate">Donate Food</a></li>
            <li><a href="#volunteer" class="nav-link" data-view="volunteer">Volunteer Hub</a></li>
            ${user ? `<li><a href="#dashboard" class="nav-link" data-view="dashboard">Dashboard</a></li>` : ''}
          </ul>
        </div>
      </nav>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Navigation links click
    container.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.getAttribute('data-view');
        state.setView(view);
        const drawer = container.querySelector('#mobile-drawer');
        if (drawer) drawer.style.display = 'none';
      });
    });

    // Demo Dropdown Toggle
    const demoBtn = container.querySelector('#btn-demo-switch');
    const demoDropdown = container.querySelector('#demo-dropdown');
    if (demoBtn && demoDropdown) {
      demoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        demoDropdown.style.display = demoDropdown.style.display === 'none' ? 'block' : 'none';
      });

      document.addEventListener('click', (e) => {
        if (!demoBtn.contains(e.target) && !demoDropdown.contains(e.target)) {
          demoDropdown.style.display = 'none';
        }
      });
    }

    // Demo Switch Item Click
    container.querySelectorAll('.demo-select-item').forEach(el => {
      el.addEventListener('click', async () => {
        const userId = el.getAttribute('data-user-id');
        try {
          const res = await api.quickSwitch(userId);
          if (res.success) {
            state.setUser(res.user, res.token);
            window.showToast?.(`Switched to ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
            if (res.user.role === 'donor') {
              state.setView('dashboard');
            } else if (res.user.role === 'ngo') {
              state.setView('feed');
            } else {
              state.setView('volunteer');
            }
          }
        } catch (err) {
          window.showToast?.('Error switching demo user: ' + err.message, 'error');
        }
      });
    });

    // Auth Open Modal
    const authBtn = container.querySelector('#btn-open-auth');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        window.openAuthModal?.();
      });
    }

    // Logout
    const logoutBtn = container.querySelector('#btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        state.clearUser();
        window.showToast?.('Logged out successfully', 'info');
        state.setView('home');
      });
    }

    // Mobile nav toggle
    const mobileBtn = container.querySelector('#btn-mobile-nav');
    const mobileDrawer = container.querySelector('#mobile-drawer');
    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        mobileDrawer.style.display = mobileDrawer.style.display === 'none' ? 'block' : 'none';
      });
    }
  }

  // Subscribe to state changes
  state.subscribe('currentUser', update);
  state.subscribe('activeView', update);
  state.subscribe('demoUsers', update);

  update();
}
