const Payment = {

  open() {
    if (!Cart.items.length) {
      App.showToast('Your cart is empty!', '🛒');
      return;
    }
    Cart.close();
    document.getElementById('paymentModal').classList.add('open');
    this.renderSummary();
  },

  close() {
    document.getElementById('paymentModal').classList.remove('open');
  },

  renderSummary() {
    const summary = document.getElementById('paymentSummary');
    if (!summary) return;
    const total = Cart.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
    const itemsHtml = Cart.items
      .map(i => `<div style="display:flex;justify-content:space-between;gap:1rem;">
        <span>${i.name} × ${i.qty}</span>
        <span>₹${(i.price * (i.qty || 1)).toLocaleString('en-IN')}</span>
      </div>`)
      .join('');
    summary.innerHTML = `
      ${itemsHtml}
      <hr />
      <p style="display:flex;justify-content:space-between;">
        <span>Total</span>
        <strong>₹${total.toLocaleString('en-IN')}</strong>
      </p>`;
  },

  async pay() {
    const btn = document.querySelector('.payment-card .btn-full');
    const originalText = btn ? btn.textContent : '';

    // Validate fields
    const name    = document.getElementById('pay-name')?.value.trim();
    const phone   = document.getElementById('pay-phone')?.value.trim();
    const address = document.getElementById('pay-address')?.value.trim();

    if (!name || !phone || !address) {
      App.showToast('Please fill in all delivery details.', '⚠️');
      return;
    }

    if (btn) { btn.textContent = 'Processing…'; btn.disabled = true; }

    const items = Cart.items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty || 1 }));
    const total = Cart.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

    try {
      const data = await Api.createPayment(items, total);

      if (data.order && data.order.id && window.Razorpay) {
        // Real Razorpay checkout
        const rzp = new window.Razorpay({
          key:         data.keyId,
          amount:      data.order.amount,
          currency:    'INR',
          order_id:    data.order.id,
          name:        'Farm Basket Agro',
          description: 'Agro Inputs Order',
          prefill:     { name, contact: phone },
          handler: () => {
            App.showToast('Payment successful! Order confirmed.', '✅');
            this._resetAfterPayment();
          },
          modal: { ondismiss: () => {
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
          }},
        });
        rzp.open();
        return;
      }

      // Demo mode
      const orderId = data.orderId || ('FB-' + Date.now().toString().slice(-8));
      App.showToast(`Order placed! ID: ${orderId}`, '✅');
      this._resetAfterPayment();

    } catch (err) {
      console.error('Payment error:', err);
      App.showToast('Payment failed. Please try again.', '❌');
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
  },

  _resetAfterPayment() {
    Cart.items = [];
    Cart.render();
    this.close();
    // Clear form
    ['pay-name', 'pay-phone', 'pay-address'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },
};
