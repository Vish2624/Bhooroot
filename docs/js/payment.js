const Payment = {

  _pincodeTimer: null,

  open() {
    if (!Cart.items.length) {
      App.showToast('Your cart is empty!', 'ph:shopping-cart-simple-bold');
      return;
    }

    const user = Api.getUser();
    if (!user) {
      App.showToast('Please login to continue checkout', 'ph:lock-bold');
      Router.go('login');
      return;
    }

    Cart.close();
    document.getElementById('paymentModal').classList.add('open');
    this.renderSummary();

    // Pre-fill user info
    const nameEl  = document.getElementById('pay-name');
    const phoneEl = document.getElementById('pay-phone');
    const emailEl = document.getElementById('pay-email');
    if (nameEl  && !nameEl.value)  nameEl.value  = user.name  || '';
    if (phoneEl && !phoneEl.value) phoneEl.value = user.phone || '';
    if (emailEl && !emailEl.value) emailEl.value = user.email || '';

    this._bindValidation();
  },

  close() {
    document.getElementById('paymentModal').classList.remove('open');
  },

  _bindValidation() {
    const phoneEl   = document.getElementById('pay-phone');
    const emailEl   = document.getElementById('pay-email');
    const pincodeEl = document.getElementById('pay-pincode');

    if (phoneEl && !phoneEl._vbound) {
      phoneEl._vbound = true;
      phoneEl.addEventListener('input', () => this._validatePhone(phoneEl.value));
      phoneEl.addEventListener('blur',  () => this._validatePhone(phoneEl.value, true));
    }
    if (emailEl && !emailEl._vbound) {
      emailEl._vbound = true;
      emailEl.addEventListener('input', () => this._validateEmail(emailEl.value));
      emailEl.addEventListener('blur',  () => this._validateEmail(emailEl.value, true));
    }
    if (pincodeEl && !pincodeEl._vbound) {
      pincodeEl._vbound = true;
      pincodeEl.addEventListener('input', () => {
        pincodeEl.value = pincodeEl.value.replace(/\D/g, '').slice(0, 6);
        clearTimeout(this._pincodeTimer);
        if (pincodeEl.value.length === 6) {
          this._setHint('pincode-hint', 'Verifying…', 'info');
          this._pincodeTimer = setTimeout(() => this._lookupPincode(pincodeEl.value), 500);
        } else {
          this._setHint('pincode-hint', '', '');
        }
      });
    }
  },

  // Returns true if valid, sets hint and shows toast if not
  _validatePhone(raw, strict = false) {
    const digits = raw.replace(/[\s\-\(\)\+]/g, '');
    const mobile = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
    if (!strict && mobile.length < 10) { this._setHint('phone-hint', '', ''); return true; }
    if (/^[6-9]\d{9}$/.test(mobile)) {
      this._setHint('phone-hint', 'Valid mobile number', 'ok');
      return true;
    }
    this._setHint('phone-hint', 'Must be a valid 10-digit Indian mobile (starts with 6–9)', 'err');
    if (strict) App.showToast('Enter a valid 10-digit Indian mobile number.', 'ph:warning-fill');
    return false;
  },

  _validateEmail(val, strict = false) {
    if (!strict && val.length < 5) { this._setHint('email-hint', '', ''); return true; }

    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(val)) {
      this._setHint('email-hint', 'Enter a valid email address (e.g. you@gmail.com)', 'err');
      if (strict) App.showToast('Enter a valid email address.', 'ph:warning-fill');
      return false;
    }

    const domain = val.split('@')[1].toLowerCase();

    const disposable = [
      'mailinator.com','guerrillamail.com','temp-mail.org','throwam.com','yopmail.com',
      '10minutemail.com','trashmail.com','sharklasers.com','grr.la','guerrillamail.info',
      'guerrillamail.biz','guerrillamail.de','guerrillamail.net','guerrillamail.org',
      'spam4.me','dispostable.com','mailnull.com','maildrop.cc','fakeinbox.com',
      'tempmail.com','throwaway.email','getairmail.com','discard.email',
    ];
    if (disposable.includes(domain)) {
      this._setHint('email-hint', 'Disposable emails are not allowed. Use your real email.', 'err');
      if (strict) App.showToast('Disposable emails not allowed.', 'ph:warning-fill');
      return false;
    }

    const typos = {
      'gmail.con':'gmail.com','gmail.co':'gmail.com','gnail.com':'gmail.com',
      'gmal.com':'gmail.com','gamil.com':'gmail.com','gmai.com':'gmail.com',
      'yaho.com':'yahoo.com','yahooo.com':'yahoo.com','yhoo.com':'yahoo.com',
      'hotmial.com':'hotmail.com','hotmal.com':'hotmail.com','hotmai.com':'hotmail.com',
      'outloook.com':'outlook.com','outlok.com':'outlook.com',
    };
    if (typos[domain]) {
      this._setHint('email-hint', `Did you mean ${val.split('@')[0]}@${typos[domain]}?`, 'warn');
      return true;
    }

    this._setHint('email-hint', 'Email looks good', 'ok');
    return true;
  },

  async _lookupPincode(pin) {
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success') {
        const po = data[0].PostOffice[0];
        this._setHint('pincode-hint', `${po.Name}, ${po.District}, ${po.State}`, 'ok');
      } else {
        this._setHint('pincode-hint', 'Invalid pincode — not found in India Post records', 'err');
      }
    } catch {
      this._setHint('pincode-hint', 'Could not verify pincode (check connection)', 'warn');
    }
  },

  _setHint(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className   = 'field-hint' + (type ? ` hint-${type}` : '');
  },

  renderSummary() {
    const summary = document.getElementById('paymentSummary');
    if (!summary) return;
    const total    = Cart.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
    const itemsHtml = Cart.items.map(i => `
      <div class="summary-row">
        <span class="summary-item-name">${i.name}</span>
        <span class="summary-item-qty">× ${i.qty || 1}</span>
        <span class="summary-item-price">₹${(i.price * (i.qty || 1)).toLocaleString('en-IN')}</span>
      </div>`).join('');
    summary.innerHTML = `
      <div class="summary-section-label">
        <iconify-icon icon="ph:receipt-fill" width="13" height="13"></iconify-icon>
        Order Summary
      </div>
      <div class="summary-items">${itemsHtml}</div>
      <div class="summary-total-row">
        <span class="summary-total-label">
          <iconify-icon icon="ph:tag-fill" width="14" height="14"></iconify-icon>
          Total
        </span>
        <span class="summary-total-amount">₹${total.toLocaleString('en-IN')}</span>
      </div>`;
  },

  async pay() {
    const btn         = document.querySelector('.payment-card .btn-full');
    const originalInner = btn ? btn.innerHTML : '';

    const name    = document.getElementById('pay-name')?.value.trim();
    const phone   = document.getElementById('pay-phone')?.value.trim();
    const email   = document.getElementById('pay-email')?.value.trim();
    const address = document.getElementById('pay-address')?.value.trim();
    const pincode = document.getElementById('pay-pincode')?.value.trim();

    if (!name)    { App.showToast('Please enter your full name.', 'ph:warning-fill'); return; }
    if (!this._validatePhone(phone, true))  return;
    if (!this._validateEmail(email, true))  return;
    if (!address) { App.showToast('Please enter your delivery address.', 'ph:warning-fill'); return; }
    if (!/^\d{6}$/.test(pincode)) {
      App.showToast('Please enter a valid 6-digit pincode.', 'ph:warning-fill');
      document.getElementById('pay-pincode')?.focus();
      return;
    }

    if (btn) {
      btn.innerHTML = '<iconify-icon icon="ph:spinner-gap-bold" width="18" height="18" class="spin-icon"></iconify-icon> Processing…';
      btn.disabled  = true;
    }

    const items = Cart.items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty || 1 }));
    const total = Cart.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

    try {
      const data = await Api.createPayment(items, total);

      if (data.order && data.order.id && window.Razorpay) {
        const rzp = new window.Razorpay({
          key:         data.keyId,
          amount:      data.order.amount,
          currency:    'INR',
          order_id:    data.order.id,
          name:        'Uhazvumart Agro',
          description: 'Agro Inputs Order',
          prefill:     { name, contact: phone, email },
          handler: () => {
            App.showToast('Payment successful! Order confirmed.', 'ph:check-circle-fill');
            this._resetAfterPayment();
          },
          modal: { ondismiss: () => {
            if (btn) { btn.innerHTML = originalInner; btn.disabled = false; }
          }},
        });
        rzp.open();
        return;
      }

      // Demo mode
      const orderId = data.orderId || ('FB-' + Date.now().toString().slice(-8));
      App.showToast(`Order placed! ID: ${orderId}`, 'ph:check-circle-fill');
      this._resetAfterPayment();

    } catch (err) {
      console.error('Payment error:', err);
      App.showToast('Payment failed. Please try again.', 'ph:x-circle-fill');
      if (btn) { btn.innerHTML = originalInner; btn.disabled = false; }
    }
  },

  _resetAfterPayment() {
    Cart.items = [];
    Cart.render();
    this.close();
    ['pay-name', 'pay-phone', 'pay-email', 'pay-address', 'pay-pincode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; delete el._vbound; }
    });
    ['phone-hint', 'email-hint', 'pincode-hint'].forEach(id => this._setHint(id, '', ''));
  },
};
