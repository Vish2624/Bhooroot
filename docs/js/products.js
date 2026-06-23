const Products = {
  _currentCategory: '',
  _currentSubCategory: '',
  _searchQuery: '',
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

  // ─── Normalize a single product from the API ────────────────
  _normalize(p) {
    if (p._id && !p.id)                        p.id     = String(p._id);
    if (p.vendor && typeof p.vendor === 'object') p.vendor = p.vendor.name || '';
    this.register(p);
    return p;
  },

  // ─── Fetch products from backend with fallback ──────────────
  async fetch(params = {}) {
    try {
      const data = await Api.getProducts(
        typeof params === 'string' ? Object.fromEntries(new URLSearchParams(params)) : params
      );
      const list = (data.data || data.products || []).map(p => this._normalize(p));
      return list;
    } catch (err) {
      console.warn('Products fetch failed, using local data:', err.message);
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

    if (!list) container.innerHTML = this._skeletonHTML(8);

    let products = list;
    if (!products) {
      let raw = await this.fetch(
        this._currentCategory ? { category: this._currentCategory, limit: 100 } : { limit: 100 }
      );

      if (this._currentSubCategory) {
        raw = raw.filter(p =>
          p.subCategory === this._currentSubCategory ||
          p.name.toLowerCase().includes(this._currentSubCategory.toLowerCase())
        );
      }

      if (this._searchQuery) {
        const sq = this._searchQuery.toLowerCase();
        raw = raw.filter(p =>
          p.name.toLowerCase().includes(sq) ||
          (p.desc || '').toLowerCase().includes(sq) ||
          (p.vendor || '').toLowerCase().includes(sq)
        );
      }

      products = raw;
    }

    if (!products.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:2rem;grid-column:1/-1;">No products found for this selection.</p>';
    } else {
      container.innerHTML = products.map(p => App._productCardHTML(p)).join('');
    }

    document.querySelectorAll('.filter-chip').forEach(chip => {
      const cat = chip.getAttribute('onclick').match(/'([^']*)'/)?.[1] || '';
      chip.classList.toggle('active', cat === this._currentCategory);
    });

    this._renderSubCategories();
  },

  // ─── Subcategories & search panel ───────────────────────────
  _renderSubCategories() {
    const container = document.getElementById('subCategoryPanel');
    if (!container) return;

    const subCats = (this._currentCategory && Data.subCategories?.[this._currentCategory]) || [];

    let html = `
      <div class="category-search-box">
        <iconify-icon icon="ph:magnifying-glass" width="16" height="16"></iconify-icon>
        <input type="text" id="catSearchInput" placeholder="Search in ${this._currentCategory || 'all'}…"
               value="${this._searchQuery}" oninput="Products.searchWithin(this.value)">
      </div>`;

    if (subCats.length) {
      html += `<div class="sub-category-pills">
        <button class="sub-cat-pill ${!this._currentSubCategory ? 'active' : ''}" onclick="Products.filterBySubCategory('')">All</button>
        ${subCats.map(sc => `
          <button class="sub-cat-pill ${this._currentSubCategory === sc ? 'active' : ''}"
                  onclick="Products.filterBySubCategory('${sc}')">${sc}</button>`).join('')}
      </div>`;
    }

    container.innerHTML = html;
  },

  // ─── Filter / search actions ─────────────────────────────────
  filterByCategory(category) {
    this._currentCategory    = category;
    this._currentSubCategory = '';
    this._searchQuery        = '';
    const input = document.getElementById('catSearchInput');
    if (input) input.value = '';
    Router.go('products');
  },
  filterBySubCategory(subCategory) {
    this._currentSubCategory = subCategory;
    this.render();
  },
  searchWithin(query) {
    this._searchQuery = query;
    this.render();
  },

  // ─── Home page — Top Products grid ──────────────────────────
  async fetchHomeProducts(limit = 10) {
    const grid = document.getElementById('homeProductsGrid');
    if (!grid) return;
    grid.innerHTML = this._skeletonHTML(limit);
    try {
      const data = await Api.getProducts({ limit, sort: 'rating' });
      const list = (data.data || data.products || []).map(p => this._normalize(p));
      if (!list.length) throw new Error('empty');
      grid.innerHTML = list.map(p => App._productCardHTML(p)).join('');
    } catch {
      const display = (Data.products || [])
        .sort((a, b) => {
          if (a.badge === 'Best Seller' && b.badge !== 'Best Seller') return -1;
          if (a.badge !== 'Best Seller' && b.badge === 'Best Seller') return  1;
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, limit);
      display.forEach(p => this.register(p));
      grid.innerHTML = display.map(p => App._productCardHTML(p)).join('');
    }
  },

  // ─── Home page — Featured grid ───────────────────────────────
  async fetchFeatured(limit = 8) {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    grid.innerHTML = this._skeletonHTML(limit);
    try {
      const data = await Api.getProducts({ featured: 'true', limit });
      const list = (data.data || data.products || []).map(p => this._normalize(p));
      if (!list.length) throw new Error('empty');
      grid.innerHTML = list.map(p => App._productCardHTML(p)).join('');
    } catch {
      const all    = Data.products || [];
      const badged = all.filter(p => p.badge === 'Best Seller' || p.featured);
      const display = (badged.length ? badged : all).slice(0, limit);
      display.forEach(p => this.register(p));
      grid.innerHTML = display.map(p => App._productCardHTML(p)).join('');
    }
  },

  // ─── Home page — Category section grid ──────────────────────
  async fetchCategorySection(gridId, category, limit = 5) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = this._skeletonHTML(limit);
    try {
      // Use server-side category filter instead of fetching everything
      const data = await Api.getProducts({ category, limit });
      const list = (data.data || data.products || []).map(p => this._normalize(p));
      if (!list.length) throw new Error('empty');
      grid.innerHTML = list.map(p => App._productCardHTML(p)).join('');
    } catch {
      // Fallback: filter local data by category
      const cat     = category.toLowerCase();
      const display = (Data.products || [])
        .filter(p => (p.category || '').toLowerCase() === cat)
        .slice(0, limit);
      if (display.length) {
        display.forEach(p => this.register(p));
        grid.innerHTML = display.map(p => App._productCardHTML(p)).join('');
      } else {
        const section = grid.closest('section');
        if (section) section.style.display = 'none';
      }
    }
  },
};
