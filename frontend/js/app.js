/* ═══════════════════════════════════════════
   APP — global utilities + page initialisation
═══════════════════════════════════════════ */

const App = {

  // ─── Toast ─────────────────────────────────────────────────
  _toastTimer: null,
  showToast(message, icon = 'ph:check-circle-fill') {
    const el = document.getElementById('toast');
    if (!el) return;
    const iconMarkup = icon.includes(':')
      ? `<iconify-icon icon="${icon}" width="20" height="20" class="toast-icon"></iconify-icon>`
      : `<span class="toast-icon">${icon}</span>`;
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
    const original = btn.innerHTML;
    btn.innerHTML = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      App.showToast('Message sent! We\'ll reply within 24 hours.', 'ph:envelope-fill');
    }, 1200);
  },

  contactViaWhatsApp() {
    const name    = document.getElementById('contact-name')?.value.trim()    || '';
    const phone   = document.getElementById('contact-phone')?.value.trim()   || '';
    const subject = document.getElementById('contact-subject')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';

    const parts = ['Hi Uhazvumart Team!'];
    if (name)    parts.push(`*Name:* ${name}`);
    if (phone)   parts.push(`*Phone:* ${phone}`);
    if (subject) parts.push(`*Subject:* ${subject}`);
    if (message) parts.push(`\n${message}`);
    if (!name && !message) parts.push('I have an enquiry.');

    const msg = encodeURIComponent(parts.join('\n'));
    window.open(`https://wa.me/917418702397?text=${msg}`, '_blank', 'noopener,noreferrer');
  },

  // ─── Authentication ────────────────────────────────────────
  _authMode: 'login',

  setAuthMode(mode) {
    this._authMode = mode;
    const isLogin = mode === 'login';

    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);

    document.getElementById('authTitle').textContent = isLogin ? 'Welcome Back' : 'Create Account';
    document.getElementById('authDesc').textContent = isLogin
      ? 'Login to manage your agro orders and farm data.'
      : 'Join 12,000+ farmers across India today.';

    document.getElementById('field-name').style.display = isLogin ? 'none' : 'block';
    document.getElementById('field-phone').style.display = isLogin ? 'none' : 'block';
    document.getElementById('authSubmit').textContent = isLogin ? 'Login to Uhazvumart' : 'Create My Account';
  },

  async handleAuthSubmit() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const submitBtn = document.getElementById('authSubmit');

    if (!email || !password) return this.showToast('Please fill all required fields', 'ph:warning-fill');

    const original = submitBtn.textContent;
    submitBtn.textContent = 'Processing…';
    submitBtn.disabled = true;

    try {
      let data;
      if (this._authMode === 'login') {
        data = await Api.login(email, password);
      } else {
        const name = document.getElementById('auth-name').value;
        const phone = document.getElementById('auth-phone').value;
        if (!name) throw new Error('Full name is required');
        data = await Api.register(name, email, phone, password);
      }

      this.showToast(data.message || 'Success!', 'ph:check-circle-fill');
      this.updateAuthUI();
      Router.go('login');
    } catch (err) {
      this.showToast(err.message || 'Authentication failed', 'ph:x-circle-fill');
    } finally {
      submitBtn.textContent = original;
      submitBtn.disabled = false;
    }
  },

  updateAuthUI() {
    const user = Api.getUser();
    const container = document.getElementById('nav-user-info');
    const bnavAccount = document.getElementById('bnav-login');
    const loginCard  = document.getElementById('loginCard');
    const accountCard = document.getElementById('accountCard');

    if (!container) return;

    if (user) {
      // Navbar avatar — click to go to profile page; logout only available on profile page
      container.innerHTML = `
        <div class="user-profile-nav">
          <button class="user-avatar" onclick="Router.go('login')" title="My Account" aria-label="My Account">${user.name.charAt(0)}</button>
        </div>`;
      if (bnavAccount) {
        const icon = bnavAccount.querySelector('iconify-icon');
        const span = bnavAccount.querySelector('span');
        if (icon) icon.setAttribute('icon', 'ph:user-circle-fill');
        if (span) span.textContent = user.name.split(' ')[0];
      }
      // Show profile card, hide login form
      if (loginCard)  loginCard.style.display  = 'none';
      if (accountCard) {
        accountCard.style.display = 'block';
        this._populateAccountCard(user);
      }
    } else {
      container.innerHTML = `
        <button type="button" class="login-btn" onclick="Router.go('login')">
          <iconify-icon icon="ph:user-bold" width="18" height="18"></iconify-icon>
          Login
        </button>`;
      if (bnavAccount) {
        const icon = bnavAccount.querySelector('iconify-icon');
        const span = bnavAccount.querySelector('span');
        if (icon) icon.setAttribute('icon', 'ph:user-bold');
        if (span) span.textContent = 'Account';
      }
      // Show login form, hide profile card
      if (loginCard)   loginCard.style.display   = 'block';
      if (accountCard) accountCard.style.display = 'none';
    }
  },

  async _populateAccountCard(user) {
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const avatar = document.getElementById('accountAvatar');
    if (avatar) { avatar.textContent = user.name.charAt(0).toUpperCase(); }
    setEl('accountName',  user.name);
    setEl('accountEmail', user.email || '');
    const rawId = (user.id || '').toString();
    const shortId = rawId.startsWith('demo_') ? 'DEMO' : ('#' + rawId.slice(-6).toUpperCase());
    setEl('accountId', shortId);
    const roleEl = document.getElementById('accountRole');
    if (roleEl) { roleEl.textContent = (user.role || 'customer').toUpperCase(); roleEl.dataset.role = user.role; }
    setEl('acstatId', shortId);
    const year = user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
    setEl('acstatSince', year);
    // Fetch orders
    const list = document.getElementById('accountOrdersList');
    if (!list) return;
    try {
      const res = await Api.get('/orders');
      const orders = res.data || [];
      setEl('acstatOrders', orders.length);
      if (orders.length === 0) {
        list.innerHTML = `<div class="account-orders-empty"><iconify-icon icon="ph:shopping-bag-open" width="36" height="36"></iconify-icon><p>No orders yet. Start shopping!</p><button type="button" class="btn btn-primary btn-sm" onclick="Router.go('products')">Browse Products</button></div>`;
      } else {
        list.innerHTML = orders.map(o => `
          <div class="acorder-row">
            <div class="acorder-id">#${(o._id || o.orderId || '').toString().slice(-6).toUpperCase()}</div>
            <div class="acorder-items">${o.items?.length || 0} item${(o.items?.length || 0) !== 1 ? 's' : ''}</div>
            <div class="acorder-amount">₹${(o.totalAmount || 0).toLocaleString('en-IN')}</div>
            <span class="acorder-status acorder-${(o.orderStatus || 'placed').toLowerCase()}">${(o.orderStatus || 'placed').toUpperCase()}</span>
          </div>`).join('');
      }
    } catch {
      setEl('acstatOrders', '0');
      list.innerHTML = `<div class="account-orders-empty"><iconify-icon icon="ph:shopping-bag-open" width="36" height="36"></iconify-icon><p>No orders yet. Start shopping!</p><button type="button" class="btn btn-primary btn-sm" onclick="Router.go('products')">Browse Products</button></div>`;
    }
  },

  logout() {
    Api.logout();
    this.updateAuthUI();
    this.showToast('Logged out successfully', 'ph:sign-out-bold');
    Router.go('home');
  },

  // ─── Ticker marquee ─────────────────────────────────────────
  initTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    // Duplicate items for seamless infinite scroll
    const items = [...Data.ticker, ...Data.ticker];
    track.innerHTML = items.map(v => `
      <span class="ticker-logo-card">
        <img src="${v.logo}" alt="${v.name}" class="ticker-logo-img"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="ticker-logo-fallback">${v.name}</span>
      </span>`).join('');
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
  async initCategories() {
    const track = document.getElementById('catGrid');
    if (!track) return;

    let cats;
    try {
      const res = await Api.getCategories();
      const apiCats = (res.data || []).filter(c => c.isActive !== false);
      if (apiCats.length) {
        cats = apiCats.map(c => ({
          id: c.slug,
          label: c.name,
          icon: c.icon || 'mdi:leaf',
          image: c.image || '',
          count: 0,
        }));
      }
    } catch { /* fall through to local data */ }

    if (!cats || !cats.length) cats = Data.categories;

    track.innerHTML = cats.map(cat => {
      const catIcon = (cat.icon || '').includes(':')
        ? `<iconify-icon icon="${cat.icon}" width="30" height="30" class="cat-icon"></iconify-icon>`
        : `<span class="cat-icon">${cat.icon || ''}</span>`;
      const countText = cat.count ? `${cat.count.toLocaleString()} products` : 'Shop now';
      return `
        <div class="cat-card" onclick="Products.filterByCategory('${cat.id}')">
          <img class="cat-img" src="${cat.image || ''}" alt="${cat.label}" loading="lazy" />
          <div class="cat-body">
            ${catIcon}
            <span class="cat-label">${cat.label}</span>
            <span class="cat-count">${countText}</span>
          </div>
        </div>`;
    }).join('');

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
    const cardWidth = 198 + 20; // card + gap (approx)
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

  // ─── Crop section (home page) ───────────────────────────────
  initCropSection() {
    const grid = document.getElementById('cropGrid');
    if (!grid) return;
    grid.innerHTML = Data.crops.map(crop => `
      <div class="crop-card" onclick="Products.filterByCategory('${crop.category}');App.showToast('${crop.label}','ph:leaf-fill')">
        <iconify-icon icon="${crop.icon}" width="40" height="40" class="crop-icon"></iconify-icon>
        <span class="crop-label">${crop.label}</span>
        <span class="crop-link">Shop →</span>
      </div>`).join('');
  },

  // ─── Featured grid (home page) — API-backed ─────────────────
  initFeatured() {
    return Products.fetchFeatured(12);
  },

  // ─── Category sections (home page) ──────────────────────────
  initCategorySections() {
    Products.fetchHomeProducts(10);
  },

  // ─── FAQ accordion (help page) ──────────────────────────────
  initFAQ() {
    const list = document.getElementById('faqList');
    if (!list) return;
    list.innerHTML = Data.faqs.map((faq, i) => `
      <div class="faq-item" id="faq-${i}">
        <div class="faq-question" onclick="App.toggleFAQ(${i})">
          <span>${faq.question}</span>
          <iconify-icon icon="ph:caret-down-bold" width="20" height="20" class="faq-chevron"></iconify-icon>
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
      '<iconify-icon icon="ph:star-fill" width="12" height="12" style="color:#FFB300"></iconify-icon>'
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
      <div class="product-card" onclick="ProductModal.open(${p.id})">
        <div class="product-img-wrap">
          <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.classList.add('img-broken')" />
          ${badgeHTML}
          <button class="card-add-overlay" onclick="Cart.addById('${p.id}');event.stopPropagation()">
            <iconify-icon icon="ph:shopping-cart-simple-fill" width="16" height="16"></iconify-icon>
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
            <button class="add-btn" onclick="Cart.addById('${p.id}');event.stopPropagation()">+ Cart</button>
          </div>
        </div>
      </div>`;
  },
};

/* ─── WhatsApp Chat Widget ──────────────────────────────────── */
const WaChat = {
  _WA: '917418702397',

  toggle() {
    const w = document.getElementById('waChatWidget');
    if (!w) return;
    const opening = !w.classList.contains('open');
    w.classList.toggle('open', opening);
    w.setAttribute('aria-hidden', String(!opening));
    if (opening) {
      setTimeout(() => document.getElementById('waChatMsg')?.focus(), 250);
    }
  },

  close() {
    const w = document.getElementById('waChatWidget');
    if (!w) return;
    w.classList.remove('open');
    w.setAttribute('aria-hidden', 'true');
  },

  send() {
    const msg = (document.getElementById('waChatMsg')?.value || '').trim()
      || 'Hi, I have an enquiry!';
    window.open(`https://wa.me/${this._WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  },

  onKey(e) {
    // Ctrl+Enter or Cmd+Enter sends; plain Enter adds a newline
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.send();
    }
  },
};

/* ─── Product Quick-View Modal ──────────────────────────────── */
const ProductModal = {
  _qty: 1,

  adjustQty(delta) {
    this._qty = Math.max(1, this._qty + delta);
    document.getElementById('pmodalQtyVal').textContent = this._qty;
  },

  open(id) {
    const p = Data.products.find(x => x.id === id);
    if (!p) return;

    this._qty = 1;
    document.getElementById('pmodalQtyVal').textContent = 1;

    const badgeMap = { 'Best Seller':'badge-best','New':'badge-new','Certified':'badge-cert','Organic':'badge-org','Top Pick':'badge-top','CIB&RC':'badge-cert' };
    const stars = Array.from({ length: 5 }, (_, i) =>
      `<iconify-icon icon="${i < Math.floor(p.rating) ? 'ph:star-fill' : (i < p.rating ? 'ph:star-half-fill' : 'ph:star')}" width="15" height="15" style="color:#FFB300"></iconify-icon>`
    ).join('');
    const discountPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const savings = p.oldPrice ? p.oldPrice - p.price : 0;

    const pImg = document.getElementById('pmodalImg');
    pImg.classList.remove('img-broken');
    pImg.src = p.image;
    pImg.alt = p.name;
    pImg.onerror = function() { this.onerror=null; this.classList.add('img-broken'); };
    document.getElementById('pmodalVendor').textContent = p.vendor;
    document.getElementById('pmodalName').textContent = p.name;

    const badge = document.getElementById('pmodalBadge');
    badge.textContent = p.badge || '';
    badge.className = `pmodal-img-badge ${badgeMap[p.badge] || ''}`;
    badge.style.display = p.badge ? '' : 'none';

    document.getElementById('pmodalRating').innerHTML =
      `${stars}<span class="rating-num">${p.rating}</span><span style="color:#6b7280">(verified)</span>`;

    document.getElementById('pmodalPriceRow').innerHTML = p.oldPrice
      ? `<span class="pmodal-price">₹${p.price.toLocaleString('en-IN')}</span>
         <span class="pmodal-old-price">₹${p.oldPrice.toLocaleString('en-IN')}</span>
         <span class="pmodal-discount">${discountPct}% OFF</span>`
      : `<span class="pmodal-price">₹${p.price.toLocaleString('en-IN')}</span>`;

    const savingsEl = document.getElementById('pmodalSavings');
    savingsEl.textContent = savings > 0 ? `You save ₹${savings.toLocaleString('en-IN')} on this order` : '';

    document.getElementById('pmodalDesc').textContent = p.desc || 'Premium quality agro product sourced from certified manufacturers.';

    const categoryLabel = { seeds:'Seeds', fertilizer:'Fertilizer', chemical:'Biological Agent', machinery:'Machinery', irrigation:'Irrigation', nutrients:'Bio Input', organic:'Organic', animal:'Animal', tools:'Tools', storage:'Post-Harvest' };
    document.getElementById('pmodalChips').innerHTML = `
      <span class="pmodal-chip pmodal-chip-cat"><iconify-icon icon="ph:tag-fill" width="12" height="12"></iconify-icon>${categoryLabel[p.category] || p.category}</span>
      <span class="pmodal-chip pmodal-chip-vendor"><iconify-icon icon="ph:storefront-fill" width="12" height="12"></iconify-icon>${p.vendor}</span>
      <span class="pmodal-chip pmodal-chip-delivery"><iconify-icon icon="ph:truck-fill" width="12" height="12"></iconify-icon>Free delivery ₹2000+</span>
    `;

    document.getElementById('pmodalCartBtn').onclick = (e) => {
      e.stopPropagation();
      for (let i = 0; i < this._qty; i++) Cart.addById(p.id);
      const label = this._qty > 1 ? `${this._qty}× ${p.name} added` : `${p.name} added to cart`;
      App.showToast(label, 'ph:shopping-cart-simple-fill');
    };

    document.getElementById('pmodal').classList.add('open');
    document.getElementById('pmodalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', ProductModal._onKey);
  },

  close() {
    document.getElementById('pmodal').classList.remove('open');
    document.getElementById('pmodalOverlay').classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', ProductModal._onKey);
  },

  _onKey(e) { if (e.key === 'Escape') ProductModal.close(); },
};

/* ─── Boot ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Slider.init();
  Search.init();
  Lang.init();
  App.initTicker();
  App.initPromoTimer();
  App.initCategories();
  App.initVendorCarousel();
  App.initCropSection();
  App.initCategorySections();
  App.initFAQ();
  App.updateAuthUI();
  Router.init();
  Cart.render();

  // Show float-sidebar once hero scrolls out of view; hide when user scrolls back
  const heroWrap = document.querySelector('.hero-wrap');
  const floatSidebar = document.querySelector('.float-sidebar');
  if (heroWrap && floatSidebar) {
    new IntersectionObserver(
      ([entry]) => floatSidebar.classList.toggle('fsb-hidden', entry.isIntersecting),
      { threshold: 0.05 }
    ).observe(heroWrap);
  }
});