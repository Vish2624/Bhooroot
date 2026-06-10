// ============================================================
// api.js — Central API configuration & helpers
// ============================================================

const Api = {
  BASE_URL: 'http://localhost:5000',

  // ── Token helpers (localStorage) ────────────────────────
  getToken() {
    return localStorage.getItem('fb_token') || null;
  },
  setToken(token) {
    localStorage.setItem('fb_token', token);
  },
  clearToken() {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('fb_user')); } catch { return null; }
  },
  setUser(user) {
    localStorage.setItem('fb_user', JSON.stringify(user));
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
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    if (data.token) { this.setToken(data.token); this.setUser(data.user); }
    return data;
  },
  async login(email, password) {
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
};
