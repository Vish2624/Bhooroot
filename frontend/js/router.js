const Router = {
  routes: ['home', 'products', 'contact', 'about', 'help', 'login', 'track-order', 'return-policy', 'privacy', 'terms'],

  go(page, pushState = true) {
    if (!this.routes.includes(page)) page = 'home';

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

    // Push to browser history so back/forward buttons work
    if (pushState) {
      const hash = page === 'home' ? '#' : '#' + page;
      // Use just the hash for cleaner and more reliable path handling on GitHub Pages
      history.pushState({ page }, '', hash);
    }

    // Close mobile menu if open
    try {
      if (typeof App !== 'undefined' && App.closeMenu) App.closeMenu();
    } catch (e) { console.warn('Router: failed to close menu', e); }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Page-specific init
    try {
      if (page === 'products'     && typeof Products    !== 'undefined') Products.render();
    } catch (e) {
      console.error(`Router: failed to init page "${page}"`, e);
    }
  },

  // Called on DOMContentLoaded to restore page from URL hash
  init() {
    const page = location.hash.replace('#', '') || 'home';
    this.go(page, false);

    window.addEventListener('popstate', (e) => {
      const page = (e.state && e.state.page) || location.hash.replace('#', '') || 'home';
      this.go(page, false);
    });
  },
};