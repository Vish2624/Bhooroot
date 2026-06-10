const Vendors = {

  async fetch() {
    try {
      const data = await Api.getVendors();
      return data.vendors || Data.vendors;
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
            ${v.verified ? '<span class="vendor-verified">✓ Verified</span>' : ''}
          </div>
          <div class="vendor-category">${v.category} · ${v.location}</div>
          <div class="vendor-desc">${v.desc}</div>
          <div class="vendor-stats">
            <span><span class="stat-icon">⭐</span> <strong>${v.rating}</strong></span>
            <span><span class="stat-icon">📦</span> <strong>${v.products}+</strong> products</span>
            <span><span class="stat-icon">📅</span> Est. <strong>${v.since}</strong></span>
          </div>
        </div>
      </div>`).join('');
  },
};