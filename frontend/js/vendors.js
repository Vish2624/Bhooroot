const Vendors = {

  async fetch() {
    try {
      const data = await Api.getVendors();
      return data.data || data.vendors || Data.vendors;
    } catch {
      return Data.vendors;
    }
  },

  async render() {
    const grid = document.getElementById('vendorGrid');
    if (!grid) return;
    const vendors = await this.fetch();
    grid.innerHTML = vendors.map(v => `
      <div class="vendor-card">
        <img class="vendor-card-img" src="${v.image}" alt="${v.name}" loading="lazy" />
        <div class="vendor-card-body">
          <div class="vendor-card-head">
            <div class="vendor-name">${v.name}</div>
            ${v.verified ? '<span class="vendor-verified"><iconify-icon icon="ph:seal-check-fill" width="12" height="12"></iconify-icon> Verified</span>' : ''}
          </div>
          <div class="vendor-category">${v.category} · ${v.location}</div>
          <div class="vendor-desc">${v.desc}</div>
          <div class="vendor-stats">
            <span><iconify-icon icon="ph:star-fill" width="13" height="13" style="color:#f59e0b;vertical-align:middle"></iconify-icon> <strong>${v.rating}</strong></span>
            <span><iconify-icon icon="ph:package-bold" width="13" height="13" style="vertical-align:middle"></iconify-icon> <strong>${v.products}+</strong> products</span>
          </div>
          <div class="vendor-card-footer">
            <button class="vendor-shop-btn" onclick="VendorShop.open(${v.id}); event.stopPropagation()">
              <iconify-icon icon="ph:storefront-bold" width="14" height="14"></iconify-icon>
              View Shop
            </button>
          </div>
        </div>
      </div>`).join('');
  },
};

/* ─── Vendor Shop ───────────────────────────────────────────── */
const VendorShop = {
  _vendorId: null,

  open(id) {
    this._vendorId = id;
    Router.go('vendor-shop');
  },

  render() {
    const v = Data.vendors.find(x => x.id === this._vendorId);
    if (!v) { Router.go('vendors'); return; }

    const products = Data.products.filter(p => p.vendor === v.name);
    const el = document.getElementById('page-vendor-shop');
    if (!el) return;

    el.innerHTML = `
      <div class="vendor-shop-page">
        <div class="container">
          <button class="vendor-shop-back" onclick="Router.go('vendors')">
            <iconify-icon icon="ph:arrow-left-bold" width="15" height="15"></iconify-icon>
            Back to Partners
          </button>
          <div class="vendor-shop-hero">
            <img class="vendor-shop-hero-img" src="${v.image}" alt="${v.name}" />
            <div class="vendor-shop-hero-info">
              <div class="vendor-shop-hero-meta">${v.category} &middot; ${v.location}</div>
              <h2 class="vendor-shop-hero-name">
                ${v.name}
                ${v.verified ? '<span class="vendor-verified"><iconify-icon icon="ph:seal-check-fill" width="12" height="12"></iconify-icon> Verified</span>' : ''}
              </h2>
              <p class="vendor-shop-hero-desc">${v.desc}</p>
              <div class="vendor-stats" style="border-top:none;padding-top:0;margin-top:0.25rem;">
                <span><iconify-icon icon="ph:star-fill" width="13" height="13" style="color:#f59e0b;vertical-align:middle"></iconify-icon> <strong>${v.rating}</strong></span>
                <span><iconify-icon icon="ph:package-bold" width="13" height="13" style="vertical-align:middle"></iconify-icon> <strong>${v.products}+</strong> listed</span>
              </div>
            </div>
          </div>
          <div class="vendor-shop-products-header">
            <h3 class="vendor-shop-section-title">
              <iconify-icon icon="ph:storefront-bold" width="18" height="18"></iconify-icon>
              Products by ${v.name}
            </h3>
            <span class="vendor-shop-count">${products.length} product${products.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="product-list">
            ${products.length > 0
              ? products.map(p => Products._productCardHTML(p)).join('')
              : `<div class="vendor-shop-empty">
                   <iconify-icon icon="ph:package-duotone" width="52" height="52"></iconify-icon>
                   <p>No products found for this vendor yet.</p>
                 </div>`
            }
          </div>
        </div>
      </div>
    `;
  },
};