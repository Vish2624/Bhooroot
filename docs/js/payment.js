const Payment = {

  _pincodeTimer: null,
  _savedAddresses: [],
  _selectedAddrId: null,

  // ── Open checkout modal ────────────────────────────────────
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
    this._loadSavedAddresses();
  },

  close() {
    document.getElementById('paymentModal').classList.remove('open');
    this._savedAddresses = [];
    this._selectedAddrId = null;
  },

  // ── Saved Addresses ────────────────────────────────────────
  async _loadSavedAddresses() {
    if (!Api.getToken()) return;
    const section = document.getElementById('savedAddressesSection');
    if (!section) return;
    try {
      const res = await Api.getAddresses();
      this._savedAddresses = res.data || [];
      this._renderSavedAddresses();
    } catch {
      section.innerHTML = '';
    }
  },

  _renderSavedAddresses() {
    const section = document.getElementById('savedAddressesSection');
    if (!section) return;

    if (!this._savedAddresses.length) {
      section.innerHTML = '';
      document.getElementById('addrSaveCheckWrap')?.style.setProperty('display', 'flex');
      return;
    }

    const defaultAddr = this._savedAddresses.find(a => a.isdefault) || this._savedAddresses[0];
    if (!this._selectedAddrId) {
      this._selectedAddrId = defaultAddr.id || defaultAddr._id;
      this._fillFormFromAddress(defaultAddr);
    }

    section.innerHTML = `
      <div class="form-section-label">
        <iconify-icon icon="ph:map-pin-fill" width="13" height="13"></iconify-icon>
        Saved Addresses
      </div>
      <div class="saved-addr-list">
        ${this._savedAddresses.map(addr => {
          const id = addr.id || addr._id;
          const selected = id === this._selectedAddrId;
          return `
            <label class="saved-addr-card${selected ? ' selected' : ''}" onclick="Payment._selectAddr('${id}')">
              <input type="radio" name="saved_addr" value="${id}" ${selected ? 'checked' : ''} style="display:none">
              <div class="saved-addr-body">
                <div class="saved-addr-line1">${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}</div>
                <div class="saved-addr-line2">${addr.city}, ${addr.state} — ${addr.pincode}</div>
              </div>
              ${addr.isdefault ? '<span class="saved-addr-badge">Default</span>' : ''}
              ${selected ? '<iconify-icon icon="ph:check-circle-fill" width="18" height="18" class="saved-addr-check"></iconify-icon>' : ''}
            </label>`;
        }).join('')}
        <button type="button" class="addr-new-btn" id="addrNewBtn" onclick="Payment._showNewAddressForm()">
          <iconify-icon icon="ph:plus-circle-bold" width="14" height="14"></iconify-icon>
          Add a new address
        </button>
      </div>
      <div id="newAddrFormSection" style="display:none;">
        <div class="addr-divider">New Address</div>
      </div>`;

    // Hide the address form fields — saved address is selected
    this._toggleAddressFields(false);
    document.getElementById('addrSaveCheckWrap')?.style.setProperty('display', 'none');
  },

  _selectAddr(id) {
    this._selectedAddrId = id;
    const addr = this._savedAddresses.find(a => (a.id || a._id) === id);
    if (addr) this._fillFormFromAddress(addr);
    // Update selected state visually
    document.querySelectorAll('.saved-addr-card').forEach(card => {
      const isThis = card.querySelector('input[type="radio"]')?.value === id;
      card.classList.toggle('selected', isThis);
      const checkEl = card.querySelector('.saved-addr-check');
      if (isThis && !checkEl) {
        card.insertAdjacentHTML('beforeend', '<iconify-icon icon="ph:check-circle-fill" width="18" height="18" class="saved-addr-check"></iconify-icon>');
      } else if (!isThis && checkEl) {
        checkEl.remove();
      }
    });
    // Hide new address form if it was open
    const newForm = document.getElementById('newAddrFormSection');
    if (newForm) newForm.style.display = 'none';
    document.getElementById('addrNewBtn')?.style.setProperty('display', 'flex');
    this._toggleAddressFields(false);
    document.getElementById('addrSaveCheckWrap')?.style.setProperty('display', 'none');
  },

  _showNewAddressForm() {
    this._selectedAddrId = null;
    // Deselect all saved address cards
    document.querySelectorAll('.saved-addr-card').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.saved-addr-check')?.remove();
    });
    // Clear address fields
    ['pay-address', 'pay-city', 'pay-state', 'pay-pincode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    this._toggleAddressFields(true);
    document.getElementById('addrSaveCheckWrap')?.style.setProperty('display', 'flex');
    const newForm = document.getElementById('newAddrFormSection');
    if (newForm) newForm.style.display = 'block';
    document.getElementById('addrNewBtn')?.style.setProperty('display', 'none');
  },

  _fillFormFromAddress(addr) {
    const addrText = [addr.address_line1, addr.address_line2].filter(Boolean).join(', ');
    const el = (id) => document.getElementById(id);
    if (el('pay-address')) el('pay-address').value = addrText;
    if (el('pay-city'))    el('pay-city').value    = addr.city || '';
    if (el('pay-state'))   el('pay-state').value   = addr.state || '';
    if (el('pay-pincode')) el('pay-pincode').value = addr.pincode || '';
  },

  _toggleAddressFields(show) {
    const wrap = document.getElementById('addrFieldsWrap');
    if (wrap) wrap.style.display = show ? 'block' : 'none';
  },

  // ── Validation helpers ──────────────────────────────────────
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
      '10minutemail.com','trashmail.com','sharklasers.com','grr.la','spam4.me',
      'dispostable.com','mailnull.com','maildrop.cc','fakeinbox.com','tempmail.com',
    ];
    if (disposable.includes(domain)) {
      this._setHint('email-hint', 'Disposable emails are not allowed. Use your real email.', 'err');
      if (strict) App.showToast('Disposable emails not allowed.', 'ph:warning-fill');
      return false;
    }
    const typos = {
      'gmail.con':'gmail.com','gmail.co':'gmail.com','gnail.com':'gmail.com',
      'gmal.com':'gmail.com','gamil.com':'gmail.com','yaho.com':'yahoo.com',
      'hotmial.com':'hotmail.com','outloook.com':'outlook.com',
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
        // Auto-fill city/state if fields are empty
        const cityEl  = document.getElementById('pay-city');
        const stateEl = document.getElementById('pay-state');
        if (cityEl  && !cityEl.value)  cityEl.value  = po.District;
        if (stateEl && !stateEl.value) stateEl.value = po.State;
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

  // ── Order Summary ──────────────────────────────────────────
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

  // ── Pay ────────────────────────────────────────────────────
  async pay() {
    const btn           = document.querySelector('.payment-card .btn-full');
    const originalInner = btn ? btn.innerHTML : '';

    const name    = document.getElementById('pay-name')?.value.trim();
    const phone   = document.getElementById('pay-phone')?.value.trim();
    const email   = document.getElementById('pay-email')?.value.trim();
    const address = document.getElementById('pay-address')?.value.trim();
    const pincode = document.getElementById('pay-pincode')?.value.trim();
    const city    = document.getElementById('pay-city')?.value.trim()  || '';
    const state   = document.getElementById('pay-state')?.value.trim() || '';

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

    const total = Cart.items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

    try {
      // ── Step 1: Optionally save address to DB ─────────────
      if (!this._selectedAddrId && document.getElementById('addrSaveCheck')?.checked) {
        try {
          const parts = address.split(',').map(s => s.trim());
          await Api.createAddress({
            address_line1: parts[0] || address,
            address_line2: parts.slice(1).join(', '),
            city:    city    || 'N/A',
            state:   state   || 'N/A',
            country: 'India',
            pincode,
            isdefault: !this._savedAddresses.length,
          });
        } catch { /* non-blocking */ }
      }

      // ── Step 2: Create order in DB ────────────────────────
      let orderId  = null;
      let orderNum = null;
      try {
        const orderRes = await Api.createOrder({
          items: Cart.items.map(i => ({
            product:  i.id,
            name:     i.name,
            image:    i.image || '',
            price:    i.price,
            unit:     i.unit  || '',
            quantity: i.qty   || 1,
          })),
          shippingAddress: {
            name:    name,
            phone:   phone,
            street:  address,
            city:    city    || '',
            state:   state   || '',
            pincode: pincode,
          },
          paymentMethod: 'razorpay',
          subtotal:      total,
          shippingCost:  0,
          discount:      0,
          totalAmount:   total,
        });
        orderId  = orderRes.orderId;
        orderNum = orderRes.orderNumber;
      } catch { /* non-blocking — order saved in demo mode */ }

      // ── Step 3: Create Razorpay payment ───────────────────
      const data = await Api.createPayment(Cart.items, total);

      if (data.order && data.order.id && window.Razorpay) {
        const rzp = new window.Razorpay({
          key:         data.keyId,
          amount:      data.order.amount,
          currency:    'INR',
          order_id:    data.order.id,
          name:        'Uzhavumart Agro',
          description: 'Agro Inputs Order',
          prefill:     { name, contact: phone, email },
          handler: (response) => {
            // Verify payment signature
            Api.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId: orderId,
            }).catch(() => {});
            App.showToast('Payment successful! Order confirmed.', 'ph:check-circle-fill');
            this._resetAfterPayment(orderNum);
          },
          modal: { ondismiss: () => {
            if (btn) { btn.innerHTML = originalInner; btn.disabled = false; }
          }},
        });
        rzp.open();
        return;
      }

      // Demo / offline mode
      const demoId = data.orderId || orderNum || ('UM-' + Date.now().toString().slice(-8));
      App.showToast(`Order placed! ID: ${demoId}`, 'ph:check-circle-fill');
      this._resetAfterPayment(demoId);

    } catch (err) {
      console.error('Payment error:', err);
      App.showToast('Payment failed. Please try again.', 'ph:x-circle-fill');
      if (btn) { btn.innerHTML = originalInner; btn.disabled = false; }
    }
  },

  _resetAfterPayment(orderNum) {
    Cart.clear();
    this.close();
    if (orderNum) App.showToast(`Order ${orderNum} placed! Thank you.`, 'ph:check-circle-fill');
    ['pay-name','pay-phone','pay-email','pay-address','pay-city','pay-state','pay-pincode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; delete el._vbound; }
    });
    ['phone-hint','email-hint','pincode-hint'].forEach(id => this._setHint(id, '', ''));
  },
};


// ── Address Manager (Profile Page) ────────────────────────────
const Addresses = {
  _list: [],

  async load() {
    if (!Api.getToken()) return;
    const container = document.getElementById('accountAddressList');
    if (!container) return;
    container.innerHTML = '<div class="addr-loading">Loading addresses…</div>';
    try {
      const res  = await Api.getAddresses();
      this._list = res.data || [];
      this._render();
    } catch {
      container.innerHTML = '<div class="addr-loading">Could not load addresses.</div>';
    }
  },

  _render() {
    const container = document.getElementById('accountAddressList');
    if (!container) return;
    if (!this._list.length) {
      container.innerHTML = `
        <div class="addr-empty">
          <iconify-icon icon="ph:map-pin-slash" width="32" height="32"></iconify-icon>
          <p>No saved addresses yet.</p>
        </div>`;
      return;
    }
    container.innerHTML = this._list.map(addr => {
      const id = addr.id || addr._id;
      return `
        <div class="acaddr-row" id="acaddr-${id}">
          <div class="acaddr-body">
            <div class="acaddr-line1">${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}</div>
            <div class="acaddr-line2">${addr.city}, ${addr.state} ${addr.pincode} — ${addr.country}</div>
            ${addr.isdefault ? '<span class="acaddr-default-badge">Default</span>' : ''}
          </div>
          <div class="acaddr-actions">
            ${!addr.isdefault ? `<button class="btn btn-ghost btn-xs" onclick="Addresses.setDefault('${id}')">Set Default</button>` : ''}
            <button class="btn btn-ghost btn-xs btn-danger" onclick="Addresses.delete('${id}')">Delete</button>
          </div>
        </div>`;
    }).join('');
  },

  async setDefault(id) {
    try {
      await Api.setDefaultAddress(id);
      this._list = this._list.map(a => ({ ...a, isdefault: (a.id || a._id) === id }));
      this._render();
      App.showToast('Default address updated', 'ph:check-circle-fill');
    } catch { App.showToast('Could not update address', 'ph:x-circle-fill'); }
  },

  async delete(id) {
    if (!confirm('Delete this address?')) return;
    try {
      await Api.deleteAddress(id);
      this._list = this._list.filter(a => (a.id || a._id) !== id);
      this._render();
      App.showToast('Address deleted', 'ph:trash-fill');
    } catch { App.showToast('Could not delete address', 'ph:x-circle-fill'); }
  },

  openAdd() {
    const modal = document.getElementById('addAddressModal');
    if (modal) modal.classList.add('open');
  },

  closeAdd() {
    const modal = document.getElementById('addAddressModal');
    if (modal) modal.classList.remove('open');
    ['addr-line1','addr-line2','addr-city','addr-state','addr-pincode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },

  async save() {
    const line1   = document.getElementById('addr-line1')?.value.trim();
    const line2   = document.getElementById('addr-line2')?.value.trim() || '';
    const city    = document.getElementById('addr-city')?.value.trim();
    const state   = document.getElementById('addr-state')?.value.trim();
    const pincode = document.getElementById('addr-pincode')?.value.trim();

    if (!line1 || !city || !state || !pincode) {
      App.showToast('Please fill all required fields', 'ph:warning-fill');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      App.showToast('Enter a valid 6-digit pincode', 'ph:warning-fill');
      return;
    }

    try {
      const res = await Api.createAddress({
        address_line1: line1,
        address_line2: line2,
        city, state,
        country: 'India',
        pincode,
        isdefault: !this._list.length,
      });
      this._list.push(res.data);
      this._render();
      this.closeAdd();
      App.showToast('Address saved!', 'ph:check-circle-fill');
    } catch (err) {
      App.showToast(err.message || 'Could not save address', 'ph:x-circle-fill');
    }
  },
};
