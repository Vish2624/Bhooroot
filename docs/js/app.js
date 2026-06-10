/* ═══════════════════════════════════════════
   APP — global utilities + page initialisation
═══════════════════════════════════════════ */

const App = {

  // ─── Toast ─────────────────────────────────────────────────
  _toastTimer: null,
  showToast(message, icon = '✅') {
    const el = document.getElementById('toast');
    if (!el) return;
    const iconMarkup = icon
      ? (icon.startsWith('images/icons/') ? `<img src="${icon}" alt="" class="toast-icon" />` : `<span class="toast-icon">${icon}</span>`)
      : '';
    el.innerHTML = `${iconMarkup}<span>${message}</span>`;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  },

  // ─── Mobile menu ────────────────────────────────────────────
  toggleMenu() {
    const nav = document.getElementById('mainNav');
    const ham = document.getElementById('hamburger');
    if (!nav || !ham) return;
    const isOpen = nav.classList.contains('menu-open');
    nav.classList.toggle('menu-open', !isOpen);
    ham.classList.toggle('open', !isOpen);
    ham.setAttribute('aria-expanded', String(!isOpen));
  },

  closeMenu() {
    const nav = document.getElementById('mainNav');
    const ham = document.getElementById('hamburger');
    if (!nav || !ham) return;
    nav.classList.remove('menu-open');
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
  },

  // ─── Contact form submit ────────────────────────────────────
  submitContact(btn) {
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      App.showToast('Message sent! We\'ll reply within 24 hours.', '📧');
    }, 1200);
  },

  // ─── Ticker marquee ─────────────────────────────────────────
  initTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    // Duplicate items for seamless infinite scroll
    const items = [...Data.ticker, ...Data.ticker];
    track.innerHTML = items
      .map(t => {
        const iconMarkup = t.icon.startsWith('images/icons/')
          ? `<img class="ticker-icon" src="${t.icon}" alt="" loading="lazy" />`
          : `<span class="ticker-icon">${t.icon}</span>`;
        return `<span class="ticker-item">${iconMarkup}${t.text}</span>`;
      })
      .join('');
  },

  // ─── Promo countdown timer ──────────────────────────────────
  initPromoTimer() {
    const el = document.getElementById('promoTimer');
    if (!el) return;
    // Target: last day of current month
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const render = () => {
      const diff = target - new Date();
      if (diff <= 0) { el.innerHTML = ''; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = n => String(n).padStart(2, '0');
      el.innerHTML = `
        <div class="promo-timer">
          <div class="timer-block"><span class="timer-val">${pad(d)}</span><span class="timer-label">Days</span></div>
          <span class="timer-sep">:</span>
          <div class="timer-block"><span class="timer-val">${pad(h)}</span><span class="timer-label">Hrs</span></div>
          <span class="timer-sep">:</span>
          <div class="timer-block"><span class="timer-val">${pad(m)}</span><span class="timer-label">Mins</span></div>
          <span class="timer-sep">:</span>
          <div class="timer-block"><span class="timer-val">${pad(s)}</span><span class="timer-label">Secs</span></div>
        </div>`;
    };
    render();
    setInterval(render, 1000);
  },

  // ─── Category carousel (home page) ─────────────────────────
  initCategories() {
    const track = document.getElementById('catGrid');
    if (!track) return;
    track.innerHTML = Data.categories
      .map(cat => `
        <div class="cat-card" onclick="Products.filterByCategory('${cat.id}')">
          <img class="cat-img" src="${cat.image}" alt="${cat.label}" loading="lazy" />
          <div class="cat-body">
            <span class="cat-icon">${cat.icon}</span>
            <span class="cat-label">${cat.label}</span>
            <span class="cat-count">${cat.count.toLocaleString()} products</span>
          </div>
        </div>`)
      .join('');

    // Auto-advance every 3 s, pause on hover
    let autoTimer = setInterval(() => this.catScroll(1), 3000);
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => this.catScroll(1), 3000);
    });
  },

  // Scroll the category carousel by 2 cards at a time
  catScroll(dir) {
    const track = document.getElementById('catGrid');
    if (!track) return;
    const cardWidth = 185 + 20; // card + gap (approx)
    const maxScroll = track.scrollWidth - track.clientWidth;
    const next = track.scrollLeft + dir * cardWidth * 2;
    // Wrap around
    if (next > maxScroll + 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (next < -10) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
    }
  },

  // ─── Vendor carousel strip (home page) ─────────────────────
  initVendorCarousel() {
    const el = document.getElementById('vendorCarousel');
    if (!el) return;
    el.innerHTML = Data.vendors
      .map(v => `
        <div class="vendor-logo-card" onclick="Router.go('vendors')">
          ${v.name}
          <span class="vendor-logo-tag">${v.category}</span>
        </div>`)
      .join('');
  },

  // ─── New arrivals grid (home page) ──────────────────────────
  async initNewArrivals() {
    const grid = document.getElementById('newArrivalsGrid');
    if (!grid) return;
    const list = await Products.fetch();
    const arrivals = list.filter(p => p.badge === 'New' || p.badge === 'Top Pick');
    const display  = arrivals.length >= 4 ? arrivals : list.slice(15, 19);
    grid.innerHTML = display.map(p => App._productCardHTML(p)).join('');
  },

  // ─── Featured grid (home page) — API-backed ─────────────────
  initFeatured() {
    return Products.fetchFeatured(8);
  },

  // ─── FAQ accordion (help page) ──────────────────────────────
  initFAQ() {
    const list = document.getElementById('faqList');
    if (!list) return;
    list.innerHTML = Data.faqs.map((faq, i) => `
      <div class="faq-item" id="faq-${i}">
        <div class="faq-question" onclick="App.toggleFAQ(${i})">
          <span>${faq.question}</span>
          <svg class="faq-chevron" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="faq-answer">${faq.answer}</div>
      </div>`).join('');
  },

  toggleFAQ(index) {
    const item = document.getElementById('faq-' + index);
    if (!item) return;
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  },

  // ─── Shared product card HTML builder ───────────────────────
  _productCardHTML(p) {
    const badgeMap = {
      'Best Seller': 'badge-best',
      'New':         'badge-new',
      'Certified':   'badge-cert',
      'Organic':     'badge-org',
      'Top Pick':    'badge-top',
      'CIB&RC':      'badge-cert',
    };
    const badgeClass = badgeMap[p.badge] || '';
    const badgeHTML = p.badge
      ? `<span class="badge ${badgeClass}">${p.badge}</span>`
      : '';
    const stars = Array.from({ length: Math.floor(p.rating) }, () =>
      '<span class="star-icon">⭐</span>'
    ).join('');
    const shortDesc = p.desc ? p.desc.slice(0, 60) + (p.desc.length > 60 ? '…' : '') : '';

    const discountPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const priceHTML = p.oldPrice
      ? `<div class="price-stack">
           <div class="price-top">
             <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
             <span class="price-discount">${discountPct}% OFF</span>
           </div>
           <span class="product-old-price">₹${p.oldPrice.toLocaleString('en-IN')}</span>
         </div>`
      : `<span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>`;

    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" />
          ${badgeHTML}
          <button class="card-wishlist" onclick="App.showToast('Added to wishlist','❤️');event.stopPropagation();" aria-label="Wishlist">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="card-add-overlay" onclick="Cart.addById(${p.id})">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
        </div>
        <div class="product-body">
          <div class="product-vendor-tag">${p.vendor}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-meta">
            <span class="rating-star">${stars}</span>
            <span class="rating-val">${p.rating}</span>
          </div>
          <div class="product-desc">${shortDesc}</div>
          <div class="price-row">
            ${priceHTML}
            <button class="add-btn" onclick="Cart.addById(${p.id})">+ Cart</button>
          </div>
        </div>
      </div>`;
  },
};

/* ─── Boot ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Slider.init();
  Search.init();
  App.initTicker();
  App.initPromoTimer();
  App.initCategories();
  App.initVendorCarousel();
  App.initNewArrivals();
  App.initFeatured();
  App.initFAQ();
  Router.go('home');
  Cart.render();
});