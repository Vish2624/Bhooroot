// ============================================================
// api.js — Central API configuration & helpers
// ============================================================

const Api = {
  // Use localhost if opened directly via file://, otherwise use the current origin
  BASE_URL: (window.location.protocol === 'file:' || window.location.origin === 'null' || window.location.origin === 'file://') 
    ? 'http://localhost:5000' 
    : window.location.origin,

  // Google Sheets auth — used when no backend is available (GitHub Pages)
  _SHEETS_URL: 'https://script.google.com/macros/s/AKfycbxVfqkoILhHmuQqx-Lr5DMS17QHfJHiwqTak1uE6uxY8jY7W5qEU0dCW_bXArxQIYyJ/exec',
  _isGitHubPages() {
    return window.location.hostname.includes('github.io');
  },
  async _sheetsCall(action, payload) {
    const url = new URL(this._SHEETS_URL);
    url.searchParams.set('action', action);
    Object.entries(payload).forEach(([k, v]) => v && url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Auth failed');
    return data;
  },

  // ── Token helpers (localStorage) ────────────────────────
  getToken() {
    return localStorage.getItem('um_token') || null;
  },
  setToken(token) {
    localStorage.setItem('um_token', token);
  },
  clearToken() {
    localStorage.removeItem('um_token');
    localStorage.removeItem('um_user');
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('um_user')); } catch { return null; }
  },
  setUser(user) {
    localStorage.setItem('um_user', JSON.stringify(user));
  },

  // ── Base fetch with JSON + auth header ──────────────────
  async request(path, options = {}) {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.BASE_URL}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.message || 'API error'), { status: res.status, data });
    return data;
  },

  // ── Health ───────────────────────────────────────────────
  health() {
    return this.request('/api/health');
  },

  // ── Products ─────────────────────────────────────────────
  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/products${qs ? '?' + qs : ''}`);
  },
  getProduct(id) {
    return this.request(`/api/products/${id}`);
  },

  // ── Vendors ──────────────────────────────────────────────
  getVendors() {
    return this.request('/api/vendors');
  },

  // ── Auth ─────────────────────────────────────────────────
  async register(name, email, phone, password) {
    if (this._isGitHubPages()) {
      const data = await this._sheetsCall('register', { name, email, phone, password });
      this.setUser(data.user);
      return data;
    }
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    if (data.token) { this.setToken(data.token); this.setUser(data.user); }
    return data;
  },
  async login(email, password) {
    if (this._isGitHubPages()) {
      const data = await this._sheetsCall('login', { email, password });
      this.setUser(data.user);
      return data;
    }
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) { this.setToken(data.token); this.setUser(data.user); }
    return data;
  },
  logout() {
    this.clearToken();
  },

  // ── Payment ──────────────────────────────────────────────
  createPayment(items, total) {
    return this.request('/api/payment', {
      method: 'POST',
      body: JSON.stringify({ items, total }),
    });
  },

  // ── Orders ───────────────────────────────────────────────
  createOrder(payload) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getOrder(id) {
    return this.request(`/api/orders/${id}`);
  },

  // ── Public — Banners & CMS (storefront reads) ────────────
  getBanners(type) {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    return this.request(`/api/banners${qs}`);
  },
  getCmsSection(key) {
    return this.request(`/api/cms/${encodeURIComponent(key)}`);
  },
};
