const Cart = {
  items: [],

  // ── MongoDB ObjectId detection ─────────────────────────────
  _isMongoId(id) {
    return /^[a-f0-9]{24}$/.test(String(id));
  },

  // ── DB sync (background, best-effort) ─────────────────────
  async syncFromDB() {
    if (!Api.getToken()) return;
    try {
      const res = await Api.get('/api/cart');
      if (res.success && Array.isArray(res.data) && res.data.length) {
        this.items = res.data
          .filter(item => item.product)
          .map(item => ({
            id:    item.product_id,
            name:  item.product.name  || 'Unknown',
            price: item.product.price || 0,
            image: item.product.image || '',
            unit:  item.product.unit  || '',
            qty:   item.quantity,
          }));
        this.render();
      }
    } catch { /* silently fail — offline or demo mode */ }
  },

  async _dbAdd(productId, qty) {
    if (!Api.getToken() || !this._isMongoId(productId)) return;
    try { await Api.post('/api/cart', { product_id: productId, quantity: qty }); } catch {}
  },

  async _dbUpdateQty(productId, qty) {
    if (!Api.getToken() || !this._isMongoId(productId)) return;
    try { await Api.patch(`/api/cart/${productId}`, { quantity: qty }); } catch {}
  },

  async _dbRemove(productId) {
    if (!Api.getToken() || !this._isMongoId(productId)) return;
    try { await Api.del(`/api/cart/${productId}`); } catch {}
  },

  async _dbClear() {
    if (!Api.getToken()) return;
    try { await Api.del('/api/cart'); } catch {}
  },

  // ── Public API ─────────────────────────────────────────────
  addById(id) {
    const product = (window.Products && Products.getById(id)) || Data.products.find(p => String(p.id) === String(id));
    if (product) this.add(product);
  },

  add(product) {
    const pid = String(product.id || product._id || '');
    const existing = this.items.find(i => String(i.id) === pid);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
      this._dbUpdateQty(pid, existing.qty);
    } else {
      this.items.push({ ...product, id: pid, qty: 1 });
      this._dbAdd(pid, 1);
    }
    this.render();
    this.open();
    App.showToast(`${product.name} added to cart`, 'ph:shopping-cart-simple-bold');
  },

  remove(productId) {
    this.items = this.items.filter(i => String(i.id) !== String(productId));
    this._dbRemove(String(productId));
    this.render();
  },

  updateQty(productId, qty) {
    const item = this.items.find(i => String(i.id) === String(productId));
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) {
      this.remove(productId);
    } else {
      this._dbUpdateQty(String(productId), qty);
      this.render();
    }
  },

  clear() {
    this.items = [];
    this._dbClear();
    this.render();
  },

  open() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('show');
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

  whatsappOrder() {
    if (!this.items.length) {
      App.showToast('Add items to your cart first', 'ph:shopping-cart-simple-bold');
      return;
    }
    const lines = this.items
      .map(i => `• ${i.name} ×${i.qty || 1} = ₹${(i.price * (i.qty || 1)).toLocaleString('en-IN')}`)
      .join('\n');
    const total = this._total();
    const msg = encodeURIComponent(
      `Hi Uzhavumart! I'd like to place an order:\n\n${lines}\n\n*Total: ₹${total.toLocaleString('en-IN')}*\n\nPlease confirm availability and delivery details.`
    );
    window.open(`https://wa.me/917418702397?text=${msg}`, '_blank', 'noopener,noreferrer');
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
