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
            <span><iconify-icon icon="ph:calendar-blank-bold" width="13" height="13" style="vertical-align:middle"></iconify-icon> Est. <strong>${v.since}</strong></span>
          </div>
        </div>
      </div>`).join('');
  },
};