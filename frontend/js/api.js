// ============================================================
// api.js — Central API configuration & helpers
// ============================================================

const Api = {
  BASE_URL: (window.location.protocol === 'file:' || window.location.origin === 'null' || window.location.origin === 'file://')
    ? 'http://localhost:5000'
    : window.location.origin,

  _TIMEOUT: 12000,

  // Connection state: 'unknown' | 'live' | 'demo'
  _connState: 'unknown',

  // Simple GET-response cache: { url → { data, expires } }
  _cache: {},
  _CACHE_TTL: 30000, // 30 seconds

  // Google Sheets auth — used on GitHub Pages
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

  // ── Token helpers ────────────────────────────────────────
  getToken() { return localStorage.getItem('um_token') || null; },
  setToken(t) { localStorage.setItem('um_token', t); },
  clearToken() {
    localStorage.removeItem('um_token');
    localStorage.removeItem('um_user');
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('um_user')); } catch { return null; }
  },
  setUser(u) { localStorage.setItem('um_user', JSON.stringify(u)); },

  // ── Core fetch with timeout, cache, auth header, 401 handling ──
  async request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const url    = `${this.BASE_URL}${path}`;

    // Serve from cache for GETs
    if (method === 'GET') {
      const cached = this._cache[url];
      if (cached && cached.expires > Date.now()) return cached.data;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this._TIMEOUT);

    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(url, { ...options, headers, signal: controller.signal });
    } catch (err) {
      // Network error or timeout
      const msg = err.name === 'AbortError' ? 'Request timed out' : 'Network error — check your connection';
      throw Object.assign(new Error(msg), { isNetworkError: true });
    } finally {
      clearTimeout(timer);
    }

    const data = await res.json().catch(() => ({}));

    // Track connection state from each response
    if (res.ok && this._connState === 'demo') {
      this._connState = 'live';
      if (window.App) App._onLiveMode();
    } else if (res.status === 503 && this._connState !== 'demo') {
      this._connState = 'demo';
      if (window.App) App._onDemoMode();
    }

    // Auto-logout on 401
    if (res.status === 401) {
      this.clearToken();
      if (window.App && App.updateAuthUI) App.updateAuthUI();
    }

    if (!res.ok) {
      throw Object.assign(
        new Error(data.message || `HTTP ${res.status}`),
        { status: res.status, data, isNetworkError: false }
      );
    }

    // Cache successful GET responses
    if (method === 'GET') {
      this._cache[url] = { data, expires: Date.now() + this._CACHE_TTL };
    }

    return data;
  },

  // Invalidate cached response(s) for a path prefix
  invalidateCache(prefix) {
    Object.keys(this._cache).forEach(k => {
      if (k.includes(prefix)) delete this._cache[k];
    });
  },

  // ── Shorthand helpers ────────────────────────────────────
  get(path)            { return this.request(path); },
  post(path, body)     { return this.request(path, { method: 'POST',   body: JSON.stringify(body) }); },
  put(path, body)      { return this.request(path, { method: 'PUT',    body: JSON.stringify(body) }); },
  patch(path, body)    { return this.request(path, { method: 'PATCH',  body: JSON.stringify(body) }); },
  del(path)            { return this.request(path, { method: 'DELETE' }); },

  // ── Health ───────────────────────────────────────────────
  health() { return this.get('/api/health'); },

  // Ping health endpoint directly (bypasses request() cache/state)
  async checkHealth() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${this.BASE_URL}/api/health`, { signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      clearTimeout(timer);
      const state = data.dbState === 'connected' ? 'live' : 'demo';
      const prev  = this._connState;
      this._connState = state;
      if (prev === 'demo' && state === 'live' && window.App) App._onLiveMode();
      return data;
    } catch {
      clearTimeout(timer);
      this._connState = 'demo';
      return { dbState: 'demo' };
    }
  },

  // ── Products ─────────────────────────────────────────────
  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/products${qs ? '?' + qs : ''}`);
  },
  getProduct(id) { return this.get(`/api/products/${id}`); },

  // ── Vendors ──────────────────────────────────────────────
  getVendors(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/vendors${qs ? '?' + qs : ''}`);
  },
  getVendor(id) { return this.get(`/api/vendors/${id}`); },

  // ── Auth ─────────────────────────────────────────────────
  async register(name, email, phone, password) {
    if (this._isGitHubPages()) {
      const data = await this._sheetsCall('register', { name, email, phone, password });
      this.setUser(data.user);
      return data;
    }
    const data = await this.post('/api/auth/register', { name, email, phone, password });
    if (data.token) { this.setToken(data.token); this.setUser(data.user); }
    return data;
  },
  async login(email, password) {
    if (this._isGitHubPages()) {
      const data = await this._sheetsCall('login', { email, password });
      this.setUser(data.user);
      return data;
    }
    const data = await this.post('/api/auth/login', { email, password });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
      // Sync token to admin portal so admin users get seamless SSO
      if (data.user?.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
    }
    return data;
  },
  logout() { this.clearToken(); },

  // ── Orders ───────────────────────────────────────────────
  getMyOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/orders${qs ? '?' + qs : ''}`);
  },
  getOrder(id)         { return this.get(`/api/orders/${id}`); },
  createOrder(payload) { return this.post('/api/orders', payload); },

  // ── Payment ──────────────────────────────────────────────
  createPayment(items, total) { return this.post('/api/payment', { items, total }); },
  initiatePayment(amount, currency = 'INR') {
    return this.post('/api/payment/initiate', { amount, currency });
  },
  verifyPayment(payload) { return this.post('/api/payment/verify', payload); },

  // ── Coupons ──────────────────────────────────────────────
  validateCoupon(code) { return this.get(`/api/coupons/validate/${encodeURIComponent(code)}`); },

  // ── Categories ───────────────────────────────────────────
  getCategories() { return this.get('/api/categories'); },

  // ── Public — Banners & CMS ───────────────────────────────
  getBanners(type) {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    return this.get(`/api/banners${qs}`);
  },
  getCmsSection(key) { return this.get(`/api/cms/${encodeURIComponent(key)}`); },

  // ── Vendor Dashboard ─────────────────────────────────────
  getVendorStats()              { return this.get('/api/vendor/stats'); },
  getVendorProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/vendor/products${qs ? '?' + qs : ''}`);
  },
  getVendorOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/vendor/orders${qs ? '?' + qs : ''}`);
  },
  createVendorProduct(data)    { return this.post('/api/vendor/products', data); },
  updateVendorProduct(id, data){ return this.put(`/api/vendor/products/${id}`, data); },
  deleteVendorProduct(id)      { return this.del(`/api/vendor/products/${id}`); },

  // ── Admin — Products ─────────────────────────────────────
  adminGetProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/admin/products${qs ? '?' + qs : ''}`);
  },
  adminCreateProduct(data)    { return this.post('/api/admin/products', data); },
  adminUpdateProduct(id, data){ return this.put(`/api/admin/products/${id}`, data); },
  adminDeleteProduct(id)      { return this.del(`/api/admin/products/${id}`); },

  // ── Admin — Categories ───────────────────────────────────
  adminGetCategories()        { return this.get('/api/admin/categories'); },
  adminCreateCategory(data)   { return this.post('/api/admin/categories', data); },
  adminUpdateCategory(id, d)  { return this.put(`/api/admin/categories/${id}`, d); },
  adminDeleteCategory(id)     { return this.del(`/api/admin/categories/${id}`); },

  // ── Admin — Orders ───────────────────────────────────────
  adminGetOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/admin/orders${qs ? '?' + qs : ''}`);
  },
  adminUpdateOrderStatus(id, status) {
    return this.put(`/api/admin/orders/${id}/status`, { status });
  },

  // ── Admin — Users ────────────────────────────────────────
  adminGetUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/api/admin/users${qs ? '?' + qs : ''}`);
  },
  adminUpdateUser(id, data)   { return this.put(`/api/admin/users/${id}`, data); },
  adminDeleteUser(id)         { return this.del(`/api/admin/users/${id}`); },
};
