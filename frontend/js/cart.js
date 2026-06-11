const Cart = {
  items: [],

  addById(id) {
    const product = Data.products.find(p => p.id === id);
    if (product) this.add(product);
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.render();
    this.open();
    App.showToast(`${product.name} added to cart`, '🛒');
  },

  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.render();
  },

  updateQty(productId, qty) {
    const item = this.items.find(i => i.id === productId);
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
            <button onclick="Cart.updateQty(${item.id}, ${(item.qty || 1) - 1})">−</button>
            <span>${item.qty || 1}</span>
            <button onclick="Cart.updateQty(${item.id}, ${(item.qty || 1) + 1})">＋</button>
          </div>
        </div>
        <div class="cart-right">
          <p>₹${(item.price * (item.qty || 1)).toLocaleString('en-IN')}</p>
          <button class="btn btn-link" onclick="Cart.remove(${item.id})">Remove</button>
        </div>
      </div>`).join('');
  },
};
