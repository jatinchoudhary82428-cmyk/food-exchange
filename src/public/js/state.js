// ShareBite Reactive State Store

class StateStore {
  constructor() {
    this.subscribers = new Map();

    const storedUser = localStorage.getItem('sb_user');
    const storedToken = localStorage.getItem('sb_token');

    this.state = {
      currentUser: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
      activeView: 'home',
      filters: {
        food_type: 'all',
        urgency: 'all',
        status: 'Available',
        search: ''
      },
      listings: [],
      impact: null,
      demoUsers: [],
      selectedListing: null
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.notify(key, value);
  }

  setUser(user, token) {
    this.state.currentUser = user;
    this.state.token = token;
    if (user && token) {
      localStorage.setItem('sb_user', JSON.stringify(user));
      localStorage.setItem('sb_token', token);
    } else {
      localStorage.removeItem('sb_user');
      localStorage.removeItem('sb_token');
    }
    this.notify('currentUser', user);
  }

  clearUser() {
    this.setUser(null, null);
  }

  setView(viewName) {
    this.state.activeView = viewName;
    window.location.hash = `#${viewName}`;
    this.notify('activeView', viewName);
  }

  updateFilters(partialFilters) {
    this.state.filters = { ...this.state.filters, ...partialFilters };
    this.notify('filters', this.state.filters);
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => this.subscribers.get(key).delete(callback);
  }

  notify(key, value) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => {
        try {
          callback(value);
        } catch (err) {
          console.error(`Error in state subscriber for ${key}:`, err);
        }
      });
    }
  }
}

export const state = new StateStore();
