/* ═══════════════════════════════════════════
   LANG — language selector, detection, i18n
═══════════════════════════════════════════ */

const Lang = {

  LANGUAGES: [
    { code: 'en', label: 'English',   native: 'English',    bcp: 'en' },
    { code: 'ta', label: 'Tamil',     native: 'தமிழ்',      bcp: 'ta' },
    { code: 'hi', label: 'Hindi',     native: 'हिन्दी',      bcp: 'hi' },
  ],

  STRINGS: {
    en: {
      home: 'Home', products: 'Products', vendors: 'Vendors', contact: 'Contact',
      getQuote: 'Get Quote', login: 'Login',
      searchPlaceholder: 'Search for seeds, fertilizers, tractors, pesticides…',
      language: 'Language',
      heroPill: 'Trusted by 12,000+ Farmers Across India',
      heroTitle: 'Buy Genuine<br/>Agricultural Products<br/><em>Direct From</em> <strong>Trusted Brands</strong>',
      heroSubtitle: 'Quality agro products delivered direct to your farm gate',
      heroCheck1: 'Certified Products', heroCheck2: 'Cash on Delivery',
      heroCheck3: 'Bulk Orders Available', heroCheck4: 'Delivery Across India',
      shopProducts: 'Shop Products', getBulkQuote: 'Get Bulk Quote',
      statProducts: 'Products', statBrands: 'Brands', statStates: 'States', statFarmers: 'Farmers',
      trust1Title: '100% Genuine Products', trust1Desc: 'CIB&RC registered manufacturers',
      trust2Title: 'Cash on Delivery', trust2Desc: 'COD available up to ₹10,000',
      trust3Title: 'Secure Payments', trust3Desc: 'UPI, Cards & Net Banking',
      trust4Title: 'Expert Farming Support', trust4Desc: 'Agronomists Mon–Sat, 8 AM–7 PM',
      bestSellersEyebrow: 'Best Sellers', bestSellersTitle: 'Top Selling Products', viewAll: 'View All →',
      catEyebrow: 'Shop By Category', catTitle: 'Everything Your Farm <em>Needs</em>',
      catSub: '5,000+ certified products across 10 major agro input categories',
      productsTitle: 'Our Products', productsSubtitle: '5,000+ certified agro inputs — seeds, fertilizers, chemicals, machinery & irrigation',
      categoryLabel: 'Category', filterAll: 'All Products', filterSeeds: 'Seeds', filterFertilizer: 'Fertilizers',
      filterChemicals: 'Chemicals', filterMachinery: 'Machinery', filterIrrigation: 'Irrigation', filterBioInputs: 'Bio Inputs',
      vendorsEyebrow: 'Authorised Partners', vendorsTitle: 'Our Vendor Partners', vendorsSubtitle: 'All brands are KYC-verified, licence-checked, and quality-audited annually by our team.',
      contactEyebrow: 'Get in Touch', contactTitle: "We're Here to Help", contactSubtitle: 'Have questions about products, bulk orders, or delivery? Our certified agro experts are ready to assist Mon–Sat.',
      helpEyebrow: 'Support Centre', helpTitle: 'Help & FAQ',
    },
    ta: {
      home: 'முகப்பு', products: 'தயாரிப்புகள்', vendors: 'விற்பனையாளர்கள்', contact: 'தொடர்பு',
      getQuote: 'மேற்கோள் பெறுக', login: 'உள்நுழைய',
      searchPlaceholder: 'விதைகள், உரங்கள், டிராக்டர்கள், பூச்சிக்கொல்லிகளைத் தேடுங்கள்…',
      language: 'மொழி',
      heroPill: '12,000+ விவசாயிகளால் நம்பப்படுகிறது',
      heroTitle: 'உண்மையான<br/>விவசாய தயாரிப்புகள் வாங்குங்கள்<br/><em>நேரடியாக</em> <strong>நம்பகமான பிராண்டுகளிலிருந்து</strong>',
      heroSubtitle: 'தரமான விவசாய பொருட்கள் உங்கள் வயலுக்கே',
      heroCheck1: 'சான்றளிக்கப்பட்ட தயாரிப்புகள்', heroCheck2: 'விநியோகத்தில் பணம்',
      heroCheck3: 'மொத்த ஆர்டர்கள் கிடைக்கும்', heroCheck4: 'இந்தியா முழுவதும் விநியோகம்',
      shopProducts: 'தயாரிப்புகளை வாங்கு', getBulkQuote: 'மொத்த மேற்கோள் பெறு',
      statProducts: 'தயாரிப்புகள்', statBrands: 'பிராண்டுகள்', statStates: 'மாநிலங்கள்', statFarmers: 'விவசாயிகள்',
      trust1Title: '100% உண்மையான பொருட்கள்', trust1Desc: 'CIB&RC பதிவு செய்யப்பட்ட உற்பத்தியாளர்கள்',
      trust2Title: 'விநியோகத்தில் பணம்', trust2Desc: '₹10,000 வரை COD கிடைக்கும்',
      trust3Title: 'பாதுகாப்பான கட்டணம்', trust3Desc: 'UPI, அட்டைகள் மற்றும் நெட் வங்கி',
      trust4Title: 'நிபுணர் விவசாய ஆதரவு', trust4Desc: 'வேளாண் நிபுணர்கள் திங்கள்–சனி, காலை 8–மாலை 7',
      bestSellersEyebrow: 'சிறந்த விற்பனையாளர்கள்', bestSellersTitle: 'அதிகம் விற்கப்படும் தயாரிப்புகள்', viewAll: 'அனைத்தும் காண்க →',
      catEyebrow: 'வகையின்படி வாங்கு', catTitle: 'உங்கள் நிலத்திற்கு <em>தேவையான</em> அனைத்தும்',
      catSub: '10 முக்கிய வகைகளில் 5,000+ சான்றளிக்கப்பட்ட தயாரிப்புகள்',
      productsTitle: 'எங்கள் தயாரிப்புகள்', productsSubtitle: '5,000+ சான்றளிக்கப்பட்ட விவசாய பொருட்கள் — விதைகள், உரங்கள், இரசாயனங்கள், இயந்திரங்கள் மற்றும் நீர்ப்பாசனம்',
      categoryLabel: 'வகை', filterAll: 'அனைத்து தயாரிப்புகள்', filterSeeds: 'விதைகள்', filterFertilizer: 'உரங்கள்',
      filterChemicals: 'இரசாயனங்கள்', filterMachinery: 'இயந்திரங்கள்', filterIrrigation: 'நீர்ப்பாசனம்', filterBioInputs: 'உயிரி உள்ளீடுகள்',
      vendorsEyebrow: 'அங்கீகரிக்கப்பட்ட கூட்டாளர்கள்', vendorsTitle: 'எங்கள் விற்பனையாளர் கூட்டாளர்கள்', vendorsSubtitle: 'அனைத்து பிராண்டுகளும் KYC சரிபார்க்கப்பட்டவை, உரிமம் சரிபார்க்கப்பட்டவை மற்றும் ஆண்டுதோறும் தர தணிக்கை செய்யப்படுகின்றன.',
      contactEyebrow: 'தொடர்பு கொள்ளுங்கள்', contactTitle: 'நாங்கள் உதவ இங்கே இருக்கிறோம்', contactSubtitle: 'தயாரிப்புகள், மொத்த ஆர்டர்கள் அல்லது விநியோகம் பற்றி கேள்விகளா? எங்கள் நிபுணர்கள் திங்கள்–சனி கிடைக்கின்றனர்.',
      helpEyebrow: 'ஆதரவு மையம்', helpTitle: 'உதவி மற்றும் FAQ',
    },
    hi: {
      home: 'होम', products: 'उत्पाद', vendors: 'विक्रेता', contact: 'संपर्क',
      getQuote: 'कोटेशन पाएं', login: 'लॉगिन',
      searchPlaceholder: 'बीज, उर्वरक, ट्रैक्टर, कीटनाशकों की खोज करें…',
      language: 'भाषा',
      heroPill: '12,000+ किसानों द्वारा विश्वसनीय',
      heroTitle: 'असली<br/>कृषि उत्पाद खरीदें<br/><em>सीधे</em> <strong>विश्वसनीय ब्रांड्स से</strong>',
      heroSubtitle: 'गुणवत्तापूर्ण कृषि उत्पाद सीधे आपके खेत तक',
      heroCheck1: 'प्रमाणित उत्पाद', heroCheck2: 'कैश ऑन डिलीवरी',
      heroCheck3: 'बल्क ऑर्डर उपलब्ध', heroCheck4: 'पूरे भारत में डिलीवरी',
      shopProducts: 'उत्पाद देखें', getBulkQuote: 'बल्क कोटेशन पाएं',
      statProducts: 'उत्पाद', statBrands: 'ब्रांड्स', statStates: 'राज्य', statFarmers: 'किसान',
      trust1Title: '100% असली उत्पाद', trust1Desc: 'CIB&RC पंजीकृत निर्माता',
      trust2Title: 'कैश ऑन डिलीवरी', trust2Desc: '₹10,000 तक COD उपलब्ध',
      trust3Title: 'सुरक्षित भुगतान', trust3Desc: 'UPI, कार्ड और नेट बैंकिंग',
      trust4Title: 'विशेषज्ञ कृषि सहायता', trust4Desc: 'कृषि विशेषज्ञ सोम–शनि, सुबह 8–शाम 7',
      bestSellersEyebrow: 'सर्वश्रेष्ठ विक्रेता', bestSellersTitle: 'सबसे ज़्यादा बिकने वाले उत्पाद', viewAll: 'सभी देखें →',
      catEyebrow: 'श्रेणी से खरीदें', catTitle: 'आपके खेत की <em>हर ज़रूरत</em>',
      catSub: '10 प्रमुख कृषि श्रेणियों में 5,000+ प्रमाणित उत्पाद',
      productsTitle: 'हमारे उत्पाद', productsSubtitle: '5,000+ प्रमाणित कृषि उत्पाद — बीज, उर्वरक, रसायन, मशीनरी और सिंचाई',
      categoryLabel: 'श्रेणी', filterAll: 'सभी उत्पाद', filterSeeds: 'बीज', filterFertilizer: 'उर्वरक',
      filterChemicals: 'रसायन', filterMachinery: 'मशीनरी', filterIrrigation: 'सिंचाई', filterBioInputs: 'जैव इनपुट',
      vendorsEyebrow: 'अधिकृत भागीदार', vendorsTitle: 'हमारे विक्रेता भागीदार', vendorsSubtitle: 'सभी ब्रांड KYC-सत्यापित, लाइसेंस-जांच किए गए और वार्षिक गुणवत्ता-ऑडिट हैं।',
      contactEyebrow: 'संपर्क करें', contactTitle: 'हम मदद के लिए यहाँ हैं', contactSubtitle: 'उत्पादों, बल्क ऑर्डर या डिलीवरी के बारे में प्रश्न हैं? हमारे विशेषज्ञ सोम–शनि उपलब्ध हैं।',
      helpEyebrow: 'सहायता केंद्र', helpTitle: 'मदद और FAQ',
    },
  },

  _current: 'en',
  _open: false,

  init() {
    this._buildDropdown();

    const saved = localStorage.getItem('preferred_language');
    if (saved && this.LANGUAGES.find(l => l.code === saved)) {
      this._current = saved;
      this._applyStrings(saved);
    } else {
      this._detectLocale();
    }
    this._updateBtnLabel();
    this._updateChecked();

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!document.getElementById('langSelector')?.contains(e.target)) {
        this._closeDropdown();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._closeDropdown();
    });
  },

  _buildDropdown() {
    const dropdown = document.getElementById('langDropdown');
    if (!dropdown) return;
    dropdown.innerHTML =
      '<div class="lang-dropdown-head">Select Language</div>' +
      this.LANGUAGES.map(l => `
        <button type="button" class="lang-item" data-code="${l.code}" onclick="Lang.select('${l.code}')">
          <span class="lang-item-native">${l.native}</span>
          <span class="lang-item-en">${l.label}</span>
          <iconify-icon class="lang-item-check" icon="ph:check-bold" width="13" height="13" aria-hidden="true"></iconify-icon>
        </button>`).join('');
  },

  _detectLocale() {
    const bcp = (navigator.language || 'en').split('-')[0].toLowerCase();
    const match = this.LANGUAGES.find(l => l.bcp === bcp);
    if (match && match.code !== 'en') {
      this._showSuggestionPopup(match.code);
    }
  },

  _showSuggestionPopup(code) {
    const dismissed = localStorage.getItem('language_popup_dismissed');
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < 30 * 24 * 60 * 60 * 1000) return;
    }
    const lang = this.LANGUAGES.find(l => l.code === code);
    if (!lang) return;
    const popup = document.getElementById('langPopup');
    if (!popup) return;
    const nativeEl = document.getElementById('langPopupNative');
    if (nativeEl) nativeEl.textContent = lang.native;
    document.getElementById('langPopupSwitch').onclick = () => {
      this.select(code);
      popup.classList.remove('lang-popup-show');
    };
    document.getElementById('langPopupDismiss').onclick = () => {
      localStorage.setItem('language_popup_dismissed', String(Date.now()));
      popup.classList.remove('lang-popup-show');
    };
    setTimeout(() => popup.classList.add('lang-popup-show'), 1800);
  },

  toggle() {
    this._open ? this._closeDropdown() : this._openDropdown();
  },

  _openDropdown() {
    this._open = true;
    document.getElementById('langDropdown')?.classList.add('lang-dropdown-open');
    const btn = document.getElementById('langBtn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.getElementById('langCaret')?.classList.add('lang-caret-open');
  },

  _closeDropdown() {
    this._open = false;
    document.getElementById('langDropdown')?.classList.remove('lang-dropdown-open');
    const btn = document.getElementById('langBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.getElementById('langCaret')?.classList.remove('lang-caret-open');
  },

  select(code) {
    this._current = code;
    localStorage.setItem('preferred_language', code);
    localStorage.setItem('language_selected_manually', 'true');
    this._applyStrings(code);
    this._updateBtnLabel();
    this._updateChecked();
    this._closeDropdown();
    // Close mobile menu too
    App.closeMenu?.();
  },

  _applyStrings(code) {
    const s = this.STRINGS[code] || this.STRINGS.en;

    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('nl-home', s.home);
    set('nl-products', s.products);
    set('nl-vendors', s.vendors);
    set('nl-contact', s.contact);

    const quoteBtn = document.querySelector('.quote-btn');
    if (quoteBtn) quoteBtn.textContent = s.getQuote;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = s.searchPlaceholder;

    // Login btn — preserve icon element
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      const icon = loginBtn.querySelector('iconify-icon');
      loginBtn.innerHTML = (icon ? icon.outerHTML : '') + ' ' + s.login;
    }

    // data-i18n attributes (textContent)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (s[key] !== undefined) el.textContent = s[key];
    });

    // data-i18n-html attributes (innerHTML — trusted static strings only)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (s[key] !== undefined) el.innerHTML = s[key];
    });
  },

  _updateBtnLabel() {
    const lang = this.LANGUAGES.find(l => l.code === this._current);
    const label = document.getElementById('langLabel');
    if (label && lang) label.textContent = lang.native;
  },

  _updateChecked() {
    document.querySelectorAll('.lang-item').forEach(el => {
      el.classList.toggle('lang-item-active', el.dataset.code === this._current);
    });
  },
};
