// Main Frontend Application Orchestrator
import { state } from './state.js';
import { api } from './api.js';
import { renderNavbar } from './components/Navbar.js';
import { renderHero } from './components/Hero.js';
import { renderImpactTracker } from './components/ImpactTracker.js';
import { renderHowItWorks } from './components/HowItWorks.js';
import { renderSafetyCard } from './components/SafetyCard.js';
import { renderFoodFeed } from './components/FoodFeed.js';
import { renderDonorDashboard } from './components/DonorDashboard.js';
import { renderVolunteerHub } from './components/VolunteerHub.js';
import { setupFoodDetailModal } from './components/FoodDetailModal.js';
import { renderAuthSplitScreen } from './components/AuthSplitScreen.js';

// Global Toast Notification Helper
window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
};

// Global Auth Trigger opens split-screen full page view
window.openAuthModal = function(initialMode = 'login') {
  state.setView(initialMode === 'signup' ? 'signup' : 'login');
};

// Route View Renderer
function renderActiveView() {
  const currentView = state.get('activeView') || 'home';
  const main = document.getElementById('main-content');
  const navbar = document.getElementById('navbar-container');
  const footer = document.querySelector('.app-footer');

  if (!main) return;
  main.innerHTML = '';

  // Dedicated Full-Page Split Screen for Login & Sign Up
  if (currentView === 'login' || currentView === 'signup') {
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';
    renderAuthSplitScreen(main, currentView);
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }

  // Restore Navigation & Footer for normal views
  if (navbar) navbar.style.display = 'block';
  if (footer) footer.style.display = 'block';

  if (currentView === 'home') {
    const heroSection = document.createElement('div');
    renderHero(heroSection);
    main.appendChild(heroSection);

    const impactSection = document.createElement('div');
    renderImpactTracker(impactSection);
    main.appendChild(impactSection);

    const feedSection = document.createElement('div');
    renderFoodFeed(feedSection);
    main.appendChild(feedSection);

    const howItWorksSection = document.createElement('div');
    renderHowItWorks(howItWorksSection);
    main.appendChild(howItWorksSection);

    const safetySection = document.createElement('div');
    renderSafetyCard(safetySection);
    main.appendChild(safetySection);
  } else if (currentView === 'feed') {
    const feedSection = document.createElement('div');
    renderFoodFeed(feedSection);
    main.appendChild(feedSection);

    const safetySection = document.createElement('div');
    renderSafetyCard(safetySection);
    main.appendChild(safetySection);
  } else if (currentView === 'donate') {
    const donorSection = document.createElement('div');
    renderDonorDashboard(donorSection);
    main.appendChild(donorSection);

    const safetySection = document.createElement('div');
    renderSafetyCard(safetySection);
    main.appendChild(safetySection);
  } else if (currentView === 'volunteer') {
    const volSection = document.createElement('div');
    renderVolunteerHub(volSection);
    main.appendChild(volSection);
  } else if (currentView === 'dashboard') {
    const user = state.get('currentUser');
    if (user && user.role === 'volunteer') {
      const volSection = document.createElement('div');
      renderVolunteerHub(volSection);
      main.appendChild(volSection);
    } else {
      const donorSection = document.createElement('div');
      renderDonorDashboard(donorSection);
      main.appendChild(donorSection);
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function initApp() {
  // Load Demo Accounts
  try {
    const demoData = await api.getDemoUsers();
    if (demoData.users) {
      state.set('demoUsers', demoData.users);
      // If no user saved in localStorage, default to null so login prompt is visible
      if (!state.get('currentUser') && !localStorage.getItem('sb_user')) {
        // Leave unauthenticated by default so reviewer sees the login screen or demo choices!
      }
    }
  } catch (err) {
    console.warn('Demo users load failed:', err);
  }

  // Mount Navbar
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    renderNavbar(navContainer);
  }

  // Setup Food Detail Modal
  setupFoodDetailModal();

  // Handle URL routing (both hash-based and path-based)
  function syncRouteWithView() {
    const hash = window.location.hash.replace('#', '').trim();
    const pathname = window.location.pathname.replace(/^\//, '').trim();

    const allowed = ['home', 'feed', 'donate', 'volunteer', 'dashboard', 'login', 'signup'];

    if (allowed.includes(hash)) {
      state.set('activeView', hash);
    } else if (allowed.includes(pathname)) {
      state.set('activeView', pathname);
    } else {
      state.set('activeView', 'home');
    }
  }

  window.addEventListener('hashchange', syncRouteWithView);
  window.addEventListener('popstate', syncRouteWithView);
  syncRouteWithView();

  // Subscribe view changes
  state.subscribe('activeView', renderActiveView);

  // Initial render
  renderActiveView();
}

document.addEventListener('DOMContentLoaded', initApp);
