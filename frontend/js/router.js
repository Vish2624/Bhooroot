const Router = {
  routes: ['home', 'products', 'vendors', 'contact', 'help', 'login'],

  go(page) {
    // Show/hide pages
    this.routes.forEach(route => {
      const el = document.getElementById(`page-${route}`);
      if (el) el.classList.toggle('active', route === page);
    });

    // Update active desktop nav link
    this.routes.forEach(route => {
      const link = document.getElementById(`nl-${route}`);
      if (link) link.classList.toggle('active', route === page);
    });

    // Update active bottom nav button
    this.routes.forEach(route => {
      const btn = document.getElementById(`bnav-${route}`);
      if (btn) btn.classList.toggle('active', route === page);
    });

    // Close mobile menu if open
    if (typeof App !== 'undefined' && App.closeMenu) App.closeMenu();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Page-specific init
    if (page === 'products') Products.render();
    if (page === 'vendors')  Vendors.render();
  },
};