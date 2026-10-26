// ShareBite Frontend API Client with Automatic Local Mock Fallback
import { state } from './state.js';
import { mockDb } from './mockDb.js';

class ApiClient {
  constructor() {
    this.baseUrl = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http'))
      ? window.location.origin
      : 'http://localhost:3000';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const token = state.get('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Session-Token'] = token;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (err) {
      // Re-throw known validation errors from server
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('Load failed')) {
        throw err;
      }

      // Propagate network failure to fallback handler
      console.warn(`[ShareBite API] Backend network issue on ${endpoint} (${err.message}). Seamlessly engaging local mock database fallback.`);
      throw err;
    }
  }

  // Auth Endpoints
  async register(userData) {
    try {
      return await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      // If validation error from backend (e.g. email exists), keep real error
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('Load failed')) {
        throw err;
      }
      // Transparent fallback to local mock store
      return mockDb.register(userData);
    }
  }

  async login(email, password) {
    try {
      return await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('Load failed')) {
        throw err;
      }
      return mockDb.login(email, password);
    }
  }

  async getMe() {
    try {
      return await this.request('/api/auth/me');
    } catch (err) {
      const user = state.get('currentUser');
      return { user, isFallback: true };
    }
  }

  async getDemoUsers() {
    try {
      return await this.request('/api/auth/demo-users');
    } catch (err) {
      return mockDb.getDemoUsers();
    }
  }

  async quickSwitch(userId) {
    try {
      return await this.request('/api/auth/quick-switch', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (err) {
      return mockDb.quickSwitch(userId);
    }
  }

  // Impact Endpoints
  async getImpact() {
    try {
      return await this.request('/api/impact');
    } catch (err) {
      return mockDb.getImpact();
    }
  }

  // Listings Endpoints
  async getListings(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.food_type && filters.food_type !== 'all') params.set('food_type', filters.food_type);
      if (filters.urgency && filters.urgency !== 'all') params.set('urgency', filters.urgency);
      if (filters.search) params.set('search', filters.search);
      if (filters.donor_id) params.set('donor_id', filters.donor_id);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await this.request(`/api/listings${queryStr}`);
    } catch (err) {
      return mockDb.getListings(filters);
    }
  }

  async getListing(id) {
    try {
      return await this.request(`/api/listings/${id}`);
    } catch (err) {
      return mockDb.getListing(id);
    }
  }

  async createListing(data) {
    try {
      return await this.request('/api/listings', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err) {
      return mockDb.createListing(data);
    }
  }

  async claimListing(id, payload = {}) {
    try {
      return await this.request(`/api/listings/${id}/claim`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      return mockDb.claimListing(id, payload);
    }
  }

  async assignVolunteer(id, payload = {}) {
    try {
      return await this.request(`/api/listings/${id}/volunteer`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      return mockDb.assignVolunteer(id, payload);
    }
  }

  async updateListingStatus(id, status, completionNotes = '') {
    try {
      return await this.request(`/api/listings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, completionNotes })
      });
    } catch (err) {
      return mockDb.updateListingStatus(id, status, completionNotes);
    }
  }

  async deleteListing(id) {
    try {
      return await this.request(`/api/listings/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return mockDb.deleteListing(id);
    }
  }
}

export const api = new ApiClient();
