const Cart = {
  items: [],

  addById(id) {
    const product = (window.Products && Products.getById(id)) || Data.products.find(p => String(p.id) === String(id));
    if (product) this.add(product);
  },

  add(product) {
    const existing = this.items.find(i => String(i.id) === String(product.id));
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.render();
    this.open();
    App.showToast(`${product.name} added to cart`, 'ph:shopping-cart-simple-bold');
  },

  remove(productId) {
    this.items = this.items.filter(i => String(i.id) !== String(productId));
    this.render();
  },

  updateQty(productId, qty) {
    const item = this.items.find(i => String(i.id) === String(productId));
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) this.remove(productId);
    else this.render();
  },

  open() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('show');
    // iOS Safari ignores overflow:hidden on body — use position:fixed instead
    const scrollY = window.scrollY;
    document.body.style.overflow  = 'hidden';
    document.body.style.position  = 'fixed';
    document.body.style.top       = `-${scrollY}px`;
    document.body.style.width     = '100%';
    document.body.dataset.scrollY = String(scrollY);
  },

  close() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('show');
    const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, scrollY);
  },

  _total() {
    return this.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
  },

  async applyCoupon() {
    const codeEl = document.getElementById('couponCode');
    const code   = (codeEl?.value || '').trim().toUpperCase();

    if (!code) {
      this._setCouponHint('Please enter a coupon code', 'err');
      return;
    }
    if (!this.items.length) {
      this._setCouponHint('Add items to your cart first', 'err');
      return;
    }

    const totalQty = this.items.reduce((s, i) => s + (i.qty || 1), 0);
    const totalAmt = this._total();

    // Default bulk thresholds — overridden by server response if present
    let minQty = 10;
    let minAmt = 5000;

    if (totalQty < minQty && totalAmt < minAmt) {
      this._setCouponHint(
        `Bulk orders only — need min ${minQty} items or ₹${minAmt.toLocaleString('en-IN')} in cart`,
        'err'
      );
      return;
    }

    this._setCouponHint('Checking code…', 'info');

    let whatsappNumber = '919876543210';
    let description    = 'Bulk order enquiry';

    try {
      const data = await Api.validateCoupon(code);
      if (!data.valid) {
        this._setCouponHint(data.message || 'Invalid or expired coupon code', 'err');
        return;
      }
      if (data.whatsappNumber) whatsappNumber = data.whatsappNumber;
      if (data.description)    description    = data.description;
      // Re-check thresholds the server actually set on this coupon
      if (data.bulkMinQty    !== undefined) minQty = data.bulkMinQty;
      if (data.bulkMinAmount !== undefined) minAmt = data.bulkMinAmount;
      if (totalQty < minQty && totalAmt < minAmt) {
        this._setCouponHint(
          `Bulk orders only — need min ${minQty} items or ₹${minAmt.toLocaleString('en-IN')}`,
          'err'
        );
        return;
      }
    } catch {
      // DB offline / demo — proceed with defaults
    }

    const lines = this.items
      .map(i => `• ${i.name} ×${i.qty || 1} = ₹${(i.price * (i.qty || 1)).toLocaleString('en-IN')}`)
      .join('\n');
    const msg = encodeURIComponent(
      `Hi! I have a *bulk order* enquiry with coupon *${code}*.\n\n${lines}\n\n*Total: ₹${totalAmt.toLocaleString('en-IN')}*\n\nPlease confirm availability and bulk pricing.`
    );

    this._setCouponHint('Opening WhatsApp…', 'ok');
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
  },

  _setCouponHint(msg, type) {
    const el = document.getElementById('coupon-hint');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'coupon-hint' + (type ? ` hint-${type}` : '');
  },

  render() {
    const container = document.getElementById('cartItems');
    const badge     = document.getElementById('cartBadge');
    const totalEl   = document.getElementById('cartTotal');

    const count = this.items.reduce((s, i) => s + (i.qty || 1), 0);
    if (badge)   badge.textContent = count;
    if (totalEl) totalEl.textContent = '₹' + this._total().toLocaleString('en-IN');

    if (!container) return;
    if (!this.items.length) {
      container.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-left">
          <strong title="${item.name}">${item.name}</strong>
          <div class="cart-qty">
            <button onclick="Cart.updateQty('${item.id}', ${(item.qty || 1) - 1})">−</button>
            <span>${item.qty || 1}</span>
            <button onclick="Cart.updateQty('${item.id}', ${(item.qty || 1) + 1})">＋</button>
          </div>
        </div>
        <div class="cart-right">
          <p>₹${(item.price * (item.qty || 1)).toLocaleString('en-IN')}</p>
          <button class="btn btn-link" onclick="Cart.remove('${item.id}')">Remove</button>
        </div>
      </div>`).join('');
  },
};
