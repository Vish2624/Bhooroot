/* ═══════════════════════════════════════════
   LANG — language selector, detection, i18n
═══════════════════════════════════════════ */

const Lang = {

  LANGUAGES: [
    { code: 'en', label: 'English',   native: 'English',    bcp: 'en' },
    { code: 'hi', label: 'Hindi',     native: 'हिन्दी',      bcp: 'hi' },
    { code: 'ta', label: 'Tamil',     native: 'தமிழ்',      bcp: 'ta' },
    { code: 'te', label: 'Telugu',    native: 'తెలుగు',     bcp: 'te' },
    { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ',    bcp: 'kn' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം',  bcp: 'ml' },
    { code: 'bn', label: 'Bengali',   native: 'বাংলা',    bcp: 'bn' },
    { code: 'mr', label: 'Marathi',   native: 'मराठी',    bcp: 'mr' },
    { code: 'gu', label: 'Gujarati',  native: 'ગુજરાતી',   bcp: 'gu' },
    { code: 'pa', label: 'Punjabi',   native: 'ਪੰਜਾਬੀ',    bcp: 'pa' },
    { code: 'or', label: 'Odia',      native: 'ଓଡ଼ିଆ',      bcp: 'or' },
  ],

  STRINGS: {
    en: {
      home: 'Home', products: 'Products', vendors: 'Vendors', contact: 'Contact',
      getQuote: 'Get Quote', login: 'Login',
      searchPlaceholder: 'Search for seeds, fertilizers, tractors, pesticides…',
      language: 'Language',
    },
    hi: {
      home: 'होम', products: 'उत्पाद', vendors: 'विक्रेता', contact: 'संपर्क',
      getQuote: 'कोटेशन पाएं', login: 'लॉगिन',
      searchPlaceholder: 'बीज, उर्वरक, ट्रैक्टर, कीटनाशकों की खोज करें…',
      language: 'भाषा',
    },
    ta: {
      home: 'முகப்பு', products: 'தயாரிப்புகள்', vendors: 'விற்பனையாளர்கள்', contact: 'தொடர்பு',
      getQuote: 'மேற்கோள் பெறுக', login: 'உள்நுழைய',
      searchPlaceholder: 'விதைகள், உரங்கள், டிராக்டர்கள், பூச்சிக்கொல்லிகளைத் தேடுங்கள்…',
      language: 'மொழி',
    },
    te: {
      home: 'హోమ్', products: 'ఉత్పత్తులు', vendors: 'విక్రేతలు', contact: 'సంప్రదింపు',
      getQuote: 'కోటేషన్ పొందండి', login: 'లాగిన్',
      searchPlaceholder: 'విత్తనాలు, ఎరువులు, ట్రాక్టర్లు, పురుగుమందులు వెతకండి…',
      language: 'భాష',
    },
    kn: {
      home: 'ಮುಖಪುಟ', products: 'ಉತ್ಪನ್ನಗಳು', vendors: 'ಮಾರಾಟಗಾರರು', contact: 'ಸಂಪರ್ಕ',
      getQuote: 'ಕೋಟ್ ಪಡೆಯಿರಿ', login: 'ಲಾಗಿನ್',
      searchPlaceholder: 'ಬೀಜಗಳು, ಗೊಬ್ಬರಗಳು, ಟ್ರ್ಯಾಕ್ಟರ್, ಕೀಟನಾಶಕ ಹುಡುಕಿ…',
      language: 'ಭಾಷೆ',
    },
    ml: {
      home: 'ഹോം', products: 'ഉൽപ്പന്നങ്ങൾ', vendors: 'വിൽപ്പനക്കാർ', contact: 'ബന്ധപ്പെടുക',
      getQuote: 'ക്വോട്ട് നേടുക', login: 'ലോഗിൻ',
      searchPlaceholder: 'വിത്തുകൾ, വളങ്ങൾ, ട്രാക്ടറുകൾ, കീടനാശിനികൾ തിരയൂ…',
      language: 'ഭാഷ',
    },
    bn: {
      home: 'হোম', products: 'পণ্য', vendors: 'বিক্রেতা', contact: 'যোগাযোগ',
      getQuote: 'কোটেশন পান', login: 'লগইন',
      searchPlaceholder: 'বীজ, সার, ট্র্যাক্টর, কীটনাশক খুঁজুন…',
      language: 'ভাষা',
    },
    mr: {
      home: 'मुखपृष्ठ', products: 'उत्पादने', vendors: 'विक्रेते', contact: 'संपर्क',
      getQuote: 'कोटेशन मिळवा', login: 'लॉगिन',
      searchPlaceholder: 'बिया, खते, ट्रॅक्टर, कीटकनाशक शोधा…',
      language: 'भाषा',
    },
    gu: {
      home: 'હોમ', products: 'ઉત્પાદનો', vendors: 'વિક્રેતાઓ', contact: 'સંપર્ક',
      getQuote: 'ક્વોટ મેળવો', login: 'લૉગિન',
      searchPlaceholder: 'બિયારણ, ખાતર, ટ્રેક્ટર, જંતુનાશક શોધો…',
      language: 'ભાષા',
    },
    pa: {
      home: 'ਘਰ', products: 'ਉਤਪਾਦ', vendors: 'ਵਿਕਰੇਤਾ', contact: 'ਸੰਪਰਕ',
      getQuote: 'ਕੋਟੇਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ', login: 'ਲੌਗਿਨ',
      searchPlaceholder: 'ਬੀਜ, ਖਾਦ, ਟਰੈਕਟਰ, ਕੀਟਨਾਸ਼ਕ ਲੱਭੋ…',
      language: 'ਭਾਸ਼ਾ',
    },
    or: {
      home: 'ହୋମ', products: 'ଉତ୍ପାଦ', vendors: 'ବିକ୍ରେତା', contact: 'ଯୋଗାଯୋଗ',
      getQuote: 'ଉଦ୍ଧୃତ ପ୍ରାପ୍ତ କରନ୍ତୁ', login: 'ଲଗଇନ',
      searchPlaceholder: 'ଫସଲ ବିହନ, ସାର, ଟ୍ରାକ୍ଟର, କୀଟନାଶକ ଖୋଜ…',
      language: 'ଭାଷା',
    },
  },

  _current: 'en',
  _open: false,

  init() {
    this._buildDropdown();
    this._buildMobileList();

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

  _buildMobileList() {
    const list = document.getElementById('mobileLangList');
    if (!list) return;
    list.innerHTML = this.LANGUAGES.map(l => `
      <button type="button" class="mobile-lang-item" data-code="${l.code}" onclick="Lang.select('${l.code}')">
        <span>${l.native}</span>
        <span class="mobile-lang-en">${l.label}</span>
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

  toggleMobileList() {
    const list = document.getElementById('mobileLangList');
    const caret = document.getElementById('mobileLangCaret');
    if (!list) return;
    const isOpen = list.classList.toggle('mobile-lang-list-open');
    if (caret) caret.classList.toggle('lang-caret-open', isOpen);
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

    // Mobile language toggle label
    const mobileLabel = document.getElementById('mobileLangLabel');
    const lang = this.LANGUAGES.find(l => l.code === code);
    if (mobileLabel && lang) mobileLabel.textContent = lang.native;

    // Mobile lang toggle key
    const mobileLangKey = document.getElementById('mobileLangKey');
    if (mobileLangKey) mobileLangKey.textContent = s.language;
  },

  _updateBtnLabel() {
    const lang = this.LANGUAGES.find(l => l.code === this._current);
    const label = document.getElementById('langLabel');
    if (label && lang) label.textContent = lang.native;
  },

  _updateChecked() {
    document.querySelectorAll('.lang-item, .mobile-lang-item').forEach(el => {
      el.classList.toggle('lang-item-active', el.dataset.code === this._current);
    });
  },
};
