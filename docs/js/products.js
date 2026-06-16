const Products = {
  _currentCategory: '',
  _registry: new Map(),

  register(product) {
    if (!this._registry) this._registry = new Map();
    if (product) {
      const id = String(product.id || product._id || '');
      if (id) this._registry.set(id, product);
    }
  },

  getById(id) {
    if (!this._registry) this._registry = new Map();
    let p = this._registry.get(String(id));
    if (!p && window.Data && Data.products) {
      p = Data.products.find(item => String(item.id) === String(id));
      if (p) this.register(p);
    }
    return p;
  },

  // ─── Fetch from backend (with local fallback) ───────────────
  async fetch(params = {}) {
    try {
      const data = await Api.getProducts(typeof params === 'string'
        ? Object.fromEntries(new URLSearchParams(params))
        : params);
      // Backend returns { success: true, data: [...], pagination: {...} }
      const list = data.data || data.products || [];
      list.forEach(p => {
        if (p._id && !p.id) p.id = p._id;
        if (p.vendor && typeof p.vendor === 'object') p.vendor = p.vendor.name;
        this.register(p);
      });
      return list;
    } catch (err) {
      console.warn('Backend products fetch failed, using fallback data:', err);
      const list = Data.products || [];
      list.forEach(p => this.register(p));
      return list;
    }
  },

  // ─── Skeleton placeholder cards ─────────────────────────────
  _skeletonHTML(count = 6) {
    return Array.from({ length: count }, () => `
      <div class="product-skeleton">
        <div class="skeleton skel-img"></div>
        <div class="skel-body">
          <div class="skeleton skel-tag"></div>
          <div class="skeleton skel-name"></div>
          <div class="skeleton skel-desc"></div>
          <div class="skeleton skel-price"></div>
        </div>
      </div>`).join('');
  },

  // ─── Render products page ────────────────────────────────────
  async render(list) {
    const container = document.getElementById('productList');
    if (!container) return;

    // Show skeleton while data loads
    if (!list) container.innerHTML = this._skeletonHTML(8);

    let products = list;
    if (!products) {
      const raw = await this.fetch();
      products = this._currentCategory
        ? raw.filter(p => p.category === this._currentCategory)
        : raw;
    }

    if (!products.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:2rem;grid-column:1/-1;">No products found.</p>';
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
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    // Show skeleton immediately
    grid.innerHTML = this._skeletonHTML(limit);

    const list = await this.fetch({ limit });
    const badged  = list.filter(p => p.badge === 'Best Seller');
    const rest    = list.filter(p => p.badge !== 'Best Seller');
    const display = [...badged, ...rest].slice(0, limit);
    grid.innerHTML = display.map(p => App._productCardHTML(p)).join('');
  },

  // ─── Category sections (home page) ──────────────────────────
  async fetchCategorySection(gridId, category, limit = 5) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = this._skeletonHTML(limit);
    const all = await this.fetch({ limit: 100 });
    const filtered = all.filter(p => p.category === category);
    const display = filtered.slice(0, limit);
    if (display.length) {
      grid.innerHTML = display.map(p => App._productCardHTML(p)).join('');
    } else {
      const section = grid.closest('section');
      if (section) section.style.display = 'none';
    }
  },
};
