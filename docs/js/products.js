const Products = {
  _currentCategory: '',

  // ─── Fetch from backend (with local fallback) ───────────────
  async fetch(params = {}) {
    try {
      const data = await Api.getProducts(typeof params === 'string'
        ? Object.fromEntries(new URLSearchParams(params))
        : params);
      return data.products || [];
    } catch {
      return Data.products;
    }
  },

  // ─── Render products page ────────────────────────────────────
  async render(list) {
    const container = document.getElementById('productList');
    if (!container) return;

    let products = list;
    if (!products) {
      const raw = await this.fetch();
      products = this._currentCategory
        ? raw.filter(p => p.category === this._currentCategory)
        : raw;
    }

    if (!products.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:2rem;">No products found.</p>';
      return;
    }

    container.innerHTML = products.map(p => App._productCardHTML(p)).join('');

    // Sync active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
      const cat = chip.getAttribute('onclick').match(/'([^']*)'/)?.[1] || '';
      chip.classList.toggle('active', cat === this._currentCategory);
    });
  },

  // ─── Filter by category ──────────────────────────────────────
  filterByCategory(category) {
    this._currentCategory = category;
    Router.go('products');
  },

  // ─── Featured grid (home page) ───────────────────────────────
  async fetchFeatured(limit = 8) {
    const list = await this.fetch({ limit });
    const container = document.getElementById('featuredGrid');
    if (!container) return;
    const featured = list.filter(p => p.badge === 'Best Seller').slice(0, limit);
    const display  = featured.length ? featured : list.slice(0, limit);
    container.innerHTML = display.map(p => App._productCardHTML(p)).join('');
  },
};