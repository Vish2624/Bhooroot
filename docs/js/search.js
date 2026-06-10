const Search = {
  _results: [],

  init() {
    const input = document.getElementById('searchInput');
    if (input) {
      input.addEventListener('input', e => this.handle(e.target.value));
    }
  },

  showDropdown() {
    const dd = document.getElementById('searchDropdown');
    if (dd && this._results.length) dd.style.display = 'block';
  },

  hideDropdown() {
    const dd = document.getElementById('searchDropdown');
    if (dd) dd.style.display = 'none';
  },

  clear() {
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    const clear = document.getElementById('searchClear');
    if (clear) clear.style.display = 'none';
    this._results = [];
    this.hideDropdown();
  },

  // Called when a dropdown result is clicked
  pick(index) {
    const product = this._results[index];
    if (!product) return;
    this.clear();
    // Navigate to products page and show just this product
    Products._currentCategory = '';
    Router.go('products');
    // Wait for router to activate the page then render the single result
    setTimeout(() => Products.render([product]), 80);
  },

  async handle(value) {
    const term = (value || '').trim();
    const clearBtn = document.getElementById('searchClear');
    if (clearBtn) clearBtn.style.display = term ? 'block' : 'none';

    if (!term) {
      this._results = [];
      this.hideDropdown();
      return;
    }

    // Try backend first, fall back to local data filter
    let list;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/products?q=${encodeURIComponent(term)}&limit=20`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      list = data.products || data || [];
    } catch {
      list = Data.products.filter(p =>
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.category.toLowerCase().includes(term.toLowerCase()) ||
        p.vendor.toLowerCase().includes(term.toLowerCase())
      );
    }

    this._results = list;

    // Populate dropdown
    const dd = document.getElementById('searchDropdown');
    if (dd) {
      if (!list.length) {
        dd.innerHTML = '<div class="search-item" style="color:var(--muted);cursor:default;">No results found</div>';
      } else {
        dd.innerHTML = list.slice(0, 6).map((p, i) => `
          <div class="search-item" onmousedown="Search.pick(${i})">
            <span>${p.name}</span>
            <small style="color:var(--muted);margin-left:auto;font-size:0.75rem;">₹${p.price.toLocaleString('en-IN')}</small>
          </div>`).join('');
      }
      dd.style.display = 'block';
    }
  },
};