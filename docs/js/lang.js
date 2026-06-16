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
      catEyebrow: 'Shop By Category', catTitle: 'Everything Your Farm Needs',
      catSub: '5,000+ certified products across 10 major agro input categories',
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
      catEyebrow: 'श्रेणी से खरीदें', catTitle: 'आपके खेत की हर ज़रूरत',
      catSub: '10 प्रमुख कृषि श्रेणियों में 5,000+ प्रमाणित उत्पाद',
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
      catEyebrow: 'வகையின்படி வாங்கு', catTitle: 'உங்கள் நிலத்திற்கு தேவையான அனைத்தும்',
      catSub: '10 முக்கிய வகைகளில் 5,000+ சான்றளிக்கப்பட்ட தயாரிப்புகள்',
    },
    te: {
      home: 'హోమ్', products: 'ఉత్పత్తులు', vendors: 'విక్రేతలు', contact: 'సంప్రదింపు',
      getQuote: 'కోటేషన్ పొందండి', login: 'లాగిన్',
      searchPlaceholder: 'విత్తనాలు, ఎరువులు, ట్రాక్టర్లు, పురుగుమందులు వెతకండి…',
      language: 'భాష',
      heroPill: '12,000+ రైతులచే విశ్వసించబడింది',
      heroTitle: 'నిజమైన<br/>వ్యవసాయ ఉత్పత్తులు కొనండి<br/><em>నేరుగా</em> <strong>విశ్వసనీయ బ్రాండ్లనుండి</strong>',
      heroSubtitle: 'నాణ్యమైన వ్యవసాయ ఉత్పత్తులు మీ పొలానికే',
      heroCheck1: 'ధృవీకరించబడిన ఉత్పత్తులు', heroCheck2: 'కేష్ ఆన్ డెలివరీ',
      heroCheck3: 'బల్క్ ఆర్డర్లు అందుబాటులో', heroCheck4: 'భారతదేశమంతటా డెలివరీ',
      shopProducts: 'ఉత్పత్తులు కొనండి', getBulkQuote: 'బల్క్ కోటేషన్ పొందండి',
      statProducts: 'ఉత్పత్తులు', statBrands: 'బ్రాండ్లు', statStates: 'రాష్ట్రాలు', statFarmers: 'రైతులు',
      trust1Title: '100% నిజమైన ఉత్పత్తులు', trust1Desc: 'CIB&RC నమోదిత తయారీదారులు',
      trust2Title: 'కేష్ ఆన్ డెలివరీ', trust2Desc: '₹10,000 వరకు COD అందుబాటులో',
      trust3Title: 'సురక్షిత చెల్లింపులు', trust3Desc: 'UPI, కార్డులు మరియు నెట్ బ్యాంకింగ్',
      trust4Title: 'నిపుణుల వ్యవసాయ సహాయం', trust4Desc: 'వ్యవసాయ నిపుణులు సోమ–శని, ఉ 8–సా 7',
      bestSellersEyebrow: 'బెస్ట్ సెల్లర్లు', bestSellersTitle: 'అత్యధికంగా అమ్ముడైన ఉత్పత్తులు', viewAll: 'అన్నీ చూడండి →',
      catEyebrow: 'వర్గం ప్రకారం కొనండి', catTitle: 'మీ పొలానికి అవసరమైన అన్నీ',
      catSub: '10 ప్రధాన వర్గాలలో 5,000+ ధృవీకరించబడిన ఉత్పత్తులు',
    },
    kn: {
      home: 'ಮುಖಪುಟ', products: 'ಉತ್ಪನ್ನಗಳು', vendors: 'ಮಾರಾಟಗಾರರು', contact: 'ಸಂಪರ್ಕ',
      getQuote: 'ಕೋಟ್ ಪಡೆಯಿರಿ', login: 'ಲಾಗಿನ್',
      searchPlaceholder: 'ಬೀಜಗಳು, ಗೊಬ್ಬರಗಳು, ಟ್ರ್ಯಾಕ್ಟರ್, ಕೀಟನಾಶಕ ಹುಡುಕಿ…',
      language: 'ಭಾಷೆ',
      heroPill: '12,000+ ರೈತರ ವಿಶ್ವಾಸ',
      heroTitle: 'ಅಸಲಿ<br/>ಕೃಷಿ ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ<br/><em>ನೇರವಾಗಿ</em> <strong>ವಿಶ್ವಸನೀಯ ಬ್ರ್ಯಾಂಡ್‌ಗಳಿಂದ</strong>',
      heroSubtitle: 'ಗುಣಮಟ್ಟದ ಕೃಷಿ ಉತ್ಪನ್ನಗಳು ನಿಮ್ಮ ಹೊಲಕ್ಕೇ',
      heroCheck1: 'ಪ್ರಮಾಣೀಕೃತ ಉತ್ಪನ್ನಗಳು', heroCheck2: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ',
      heroCheck3: 'ಬಲ್ಕ್ ಆರ್ಡರ್ ಲಭ್ಯ', heroCheck4: 'ಭಾರತದ ತುಂಬ ಡೆಲಿವರಿ',
      shopProducts: 'ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ', getBulkQuote: 'ಬಲ್ಕ್ ಕೋಟ್ ಪಡೆಯಿರಿ',
      statProducts: 'ಉತ್ಪನ್ನಗಳು', statBrands: 'ಬ್ರ್ಯಾಂಡ್‌ಗಳು', statStates: 'ರಾಜ್ಯಗಳು', statFarmers: 'ರೈತರು',
      trust1Title: '100% ಅಸಲಿ ಉತ್ಪನ್ನಗಳು', trust1Desc: 'CIB&RC ನೋಂದಾಯಿತ ತಯಾರಕರು',
      trust2Title: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ', trust2Desc: '₹10,000 ವರೆಗೆ COD ಲಭ್ಯ',
      trust3Title: 'ಸುರಕ್ಷಿತ ಪಾವತಿ', trust3Desc: 'UPI, ಕಾರ್ಡ್ ಮತ್ತು ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್',
      trust4Title: 'ತಜ್ಞ ಕೃಷಿ ಬೆಂಬಲ', trust4Desc: 'ಕೃಷಿ ತಜ್ಞರು ಸೋಮ–ಶನಿ, ಬೆ 8–ಸಂ 7',
      bestSellersEyebrow: 'ಬೆಸ್ಟ್ ಸೆಲ್ಲರ್ಸ್', bestSellersTitle: 'ಅತ್ಯಧಿಕ ಮಾರಾಟದ ಉತ್ಪನ್ನಗಳು', viewAll: 'ಎಲ್ಲ ನೋಡಿ →',
      catEyebrow: 'ವರ್ಗದ ಪ್ರಕಾರ ಖರೀದಿಸಿ', catTitle: 'ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಬೇಕಾದ ಎಲ್ಲವೂ',
      catSub: '10 ಪ್ರಮುಖ ವರ್ಗಗಳಲ್ಲಿ 5,000+ ಪ್ರಮಾಣೀಕೃತ ಉತ್ಪನ್ನಗಳು',
    },
    ml: {
      home: 'ഹോം', products: 'ഉൽപ്പന്നങ്ങൾ', vendors: 'വിൽപ്പനക്കാർ', contact: 'ബന്ധപ്പെടുക',
      getQuote: 'ക്വോട്ട് നേടുക', login: 'ലോഗിൻ',
      searchPlaceholder: 'വിത്തുകൾ, വളങ്ങൾ, ട്രാക്ടറുകൾ, കീടനാശിനികൾ തിരയൂ…',
      language: 'ഭാഷ',
      heroPill: '12,000+ കർഷകർ വിശ്വസിക്കുന്നു',
      heroTitle: 'യഥാർഥ<br/>കൃഷി ഉൽപ്പന്നങ്ങൾ വാങ്ങൂ<br/><em>നേരിട്ട്</em> <strong>വിശ്വസ്ത ബ്രാൻഡുകളിൽ നിന്ന്</strong>',
      heroSubtitle: 'ഗുണമേന്മയുള്ള കൃഷി ഉൽപ്പന്നങ്ങൾ നിങ്ങളുടെ വയലിലേക്ക്',
      heroCheck1: 'സർട്ടിഫൈഡ് ഉൽപ്പന്നങ്ങൾ', heroCheck2: 'കാഷ് ഓൺ ഡെലിവറി',
      heroCheck3: 'ബൾക്ക് ഓർഡർ ലഭ്യം', heroCheck4: 'ഇന്ത്യ മുഴുവൻ ഡെലിവറി',
      shopProducts: 'ഉൽപ്പന്നങ്ങൾ വാങ്ങൂ', getBulkQuote: 'ബൾക്ക് ക്വോട്ട് നേടൂ',
      statProducts: 'ഉൽപ്പന്നങ്ങൾ', statBrands: 'ബ്രാൻഡുകൾ', statStates: 'സംസ്ഥാനങ്ങൾ', statFarmers: 'കർഷകർ',
      trust1Title: '100% യഥാർഥ ഉൽപ്പന്നങ്ങൾ', trust1Desc: 'CIB&RC രജിസ്ട്രേഷൻ ഉള്ള നിർമ്മാതാക്കൾ',
      trust2Title: 'കാഷ് ഓൺ ഡെലിവറി', trust2Desc: '₹10,000 വരെ COD ലഭ്യം',
      trust3Title: 'സുരക്ഷിത പേമെൻ്റ്', trust3Desc: 'UPI, കാർഡ് & നെറ്റ് ബാങ്കിംഗ്',
      trust4Title: 'വിദഗ്ധ കൃഷി സഹായം', trust4Desc: 'കൃഷി വിദഗ്ധർ തിങ്കൾ–ശനി, രാ 8–വൈ 7',
      bestSellersEyebrow: 'ബെസ്റ്റ് സെല്ലർ', bestSellersTitle: 'ഏറ്റവും കൂടുതൽ വിൽക്കുന്ന ഉൽപ്പന്നങ്ങൾ', viewAll: 'എല്ലാം കാണൂ →',
      catEyebrow: 'വിഭാഗം അനുസരിച്ച് വാങ്ങൂ', catTitle: 'നിങ്ങളുടെ വയലിന് ആവശ്യമുള്ളതെല്ലാം',
      catSub: '10 പ്രധാന വിഭാഗങ്ങളിൽ 5,000+ സർട്ടിഫൈഡ് ഉൽപ്പന്നങ്ങൾ',
    },
    bn: {
      home: 'হোম', products: 'পণ্য', vendors: 'বিক্রেতা', contact: 'যোগাযোগ',
      getQuote: 'কোটেশন পান', login: 'লগইন',
      searchPlaceholder: 'বীজ, সার, ট্র্যাক্টর, কীটনাশক খুঁজুন…',
      language: 'ভাষা',
      heroPill: '12,000+ কৃষকের বিশ্বাস',
      heroTitle: 'আসল<br/>কৃষি পণ্য কিনুন<br/><em>সরাসরি</em> <strong>বিশ্বস্ত ব্র্যান্ড থেকে</strong>',
      heroSubtitle: 'মানসম্পন্ন কৃষি পণ্য সরাসরি আপনার মাঠে',
      heroCheck1: 'সার্টিফাইড পণ্য', heroCheck2: 'ক্যাশ অন ডেলিভারি',
      heroCheck3: 'বাল্ক অর্ডার পাওয়া যায়', heroCheck4: 'সারা ভারতে ডেলিভারি',
      shopProducts: 'পণ্য কিনুন', getBulkQuote: 'বাল্ক কোটেশন পান',
      statProducts: 'পণ্য', statBrands: 'ব্র্যান্ড', statStates: 'রাজ্য', statFarmers: 'কৃষক',
      trust1Title: '100% আসল পণ্য', trust1Desc: 'CIB&RC নিবন্ধিত প্রস্তুতকারক',
      trust2Title: 'ক্যাশ অন ডেলিভারি', trust2Desc: '₹10,000 পর্যন্ত COD পাওয়া যায়',
      trust3Title: 'নিরাপদ পেমেন্ট', trust3Desc: 'UPI, কার্ড ও নেট ব্যাংকিং',
      trust4Title: 'বিশেষজ্ঞ কৃষি সহায়তা', trust4Desc: 'কৃষি বিশেষজ্ঞ সোম–শনি, সকাল ৮–সন্ধ্যা ৭',
      bestSellersEyebrow: 'বেস্ট সেলার', bestSellersTitle: 'সবচেয়ে বেশি বিক্রীত পণ্য', viewAll: 'সব দেখুন →',
      catEyebrow: 'ক্যাটাগরি অনুযায়ী কিনুন', catTitle: 'আপনার মাঠের সব প্রয়োজন',
      catSub: '10টি প্রধান বিভাগে 5,000+ সার্টিফাইড পণ্য',
    },
    mr: {
      home: 'मुखपृष्ठ', products: 'उत्पादने', vendors: 'विक्रेते', contact: 'संपर्क',
      getQuote: 'कोटेशन मिळवा', login: 'लॉगिन',
      searchPlaceholder: 'बिया, खते, ट्रॅक्टर, कीटकनाशक शोधा…',
      language: 'भाषा',
      heroPill: '12,000+ शेतकऱ्यांनी विश्वास ठेवलेला',
      heroTitle: 'खरी<br/>कृषी उत्पादने खरेदी करा<br/><em>थेट</em> <strong>विश्वसनीय ब्रँड्सकडून</strong>',
      heroSubtitle: 'दर्जेदार कृषी उत्पादने थेट तुमच्या शेतात',
      heroCheck1: 'प्रमाणित उत्पादने', heroCheck2: 'कॅश ऑन डिलिव्हरी',
      heroCheck3: 'बल्क ऑर्डर उपलब्ध', heroCheck4: 'संपूर्ण भारतात डिलिव्हरी',
      shopProducts: 'उत्पादने खरेदी करा', getBulkQuote: 'बल्क कोटेशन मिळवा',
      statProducts: 'उत्पादने', statBrands: 'ब्रँड्स', statStates: 'राज्ये', statFarmers: 'शेतकरी',
      trust1Title: '100% खरी उत्पादने', trust1Desc: 'CIB&RC नोंदणीकृत उत्पादक',
      trust2Title: 'कॅश ऑन डिलिव्हरी', trust2Desc: '₹10,000 पर्यंत COD उपलब्ध',
      trust3Title: 'सुरक्षित पेमेंट', trust3Desc: 'UPI, कार्ड आणि नेट बँकिंग',
      trust4Title: 'तज्ञ कृषी मदत', trust4Desc: 'कृषी तज्ञ सोम–शनि, सकाळी 8–संध्याकाळी 7',
      bestSellersEyebrow: 'बेस्ट सेलर', bestSellersTitle: 'सर्वाधिक विकल्या गेलेल्या उत्पादने', viewAll: 'सर्व पाहा →',
      catEyebrow: 'श्रेणीनुसार खरेदी करा', catTitle: 'तुमच्या शेतासाठी सर्व काही',
      catSub: '10 प्रमुख श्रेणींमध्ये 5,000+ प्रमाणित उत्पादने',
    },
    gu: {
      home: 'હોમ', products: 'ઉત્પાદનો', vendors: 'વિક્રેતાઓ', contact: 'સંપર્ક',
      getQuote: 'ક્વોટ મેળવો', login: 'લૉગિન',
      searchPlaceholder: 'બિયારણ, ખાતર, ટ્રેક્ટર, જંતુનાશક શોધો…',
      language: 'ભાષા',
      heroPill: '12,000+ ખેડૂતો દ્વારા વિશ્વાસ',
      heroTitle: 'અસલ<br/>કૃષિ ઉત્પાદનો ખરીદો<br/><em>સીધા</em> <strong>વિશ્વસનીય બ્રાન્ડ્સ પાસેથી</strong>',
      heroSubtitle: 'ગુણવત્તાવાળા ખેતી ઉત્પાદનો સીધા તમારા ખેતરે',
      heroCheck1: 'પ્રમાણિત ઉત્પાદનો', heroCheck2: 'કૅશ ઑન ડિલિવરી',
      heroCheck3: 'બલ્ક ઓર્ડર ઉપલબ્ધ', heroCheck4: 'સમગ્ર ભારતમાં ડિલિવરી',
      shopProducts: 'ઉત્પાદનો ખરીદો', getBulkQuote: 'બલ્ક ક્વોટ મેળવો',
      statProducts: 'ઉત્પાદનો', statBrands: 'બ્રાન્ડ્સ', statStates: 'રાજ્યો', statFarmers: 'ખેડૂતો',
      trust1Title: '100% અસલ ઉત્પાદનો', trust1Desc: 'CIB&RC નોંધાયેલ ઉત્પાદકો',
      trust2Title: 'કૅશ ઑન ડિલિવરી', trust2Desc: '₹10,000 સુધી COD ઉપલબ્ધ',
      trust3Title: 'સુરક્ષિત ચુકવણી', trust3Desc: 'UPI, કાર્ડ અને નેટ બૅન્કિંગ',
      trust4Title: 'નિષ્ણાત ખેતી સહાય', trust4Desc: 'કૃષિ નિષ્ણાત સોમ–શનિ, સવારે 8–સાંજે 7',
      bestSellersEyebrow: 'બેસ્ટ સેલર', bestSellersTitle: 'સૌથી વધુ વેચાતા ઉત્પાદનો', viewAll: 'બધું જુઓ →',
      catEyebrow: 'શ્રેણી પ્રમાણે ખરીદો', catTitle: 'તમારા ખેતરને જે જોઈએ તે બધું',
      catSub: '10 મુખ્ય શ્રેણીઓમાં 5,000+ પ્રમાણિત ઉત્પાદનો',
    },
    pa: {
      home: 'ਘਰ', products: 'ਉਤਪਾਦ', vendors: 'ਵਿਕਰੇਤਾ', contact: 'ਸੰਪਰਕ',
      getQuote: 'ਕੋਟੇਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ', login: 'ਲੌਗਿਨ',
      searchPlaceholder: 'ਬੀਜ, ਖਾਦ, ਟਰੈਕਟਰ, ਕੀਟਨਾਸ਼ਕ ਲੱਭੋ…',
      language: 'ਭਾਸ਼ਾ',
      heroPill: '12,000+ ਕਿਸਾਨਾਂ ਦਾ ਭਰੋਸਾ',
      heroTitle: 'ਅਸਲ<br/>ਖੇਤੀ ਉਤਪਾਦ ਖਰੀਦੋ<br/><em>ਸਿੱਧੇ</em> <strong>ਭਰੋਸੇਯੋਗ ਬ੍ਰਾਂਡਾਂ ਤੋਂ</strong>',
      heroSubtitle: 'ਵਧੀਆ ਖੇਤੀ ਉਤਪਾਦ ਸਿੱਧੇ ਤੁਹਾਡੇ ਖੇਤ ਤੱਕ',
      heroCheck1: 'ਪ੍ਰਮਾਣਿਤ ਉਤਪਾਦ', heroCheck2: 'ਕੈਸ਼ ਆਨ ਡਿਲੀਵਰੀ',
      heroCheck3: 'ਬਲਕ ਆਰਡਰ ਉਪਲਬਧ', heroCheck4: 'ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਡਿਲੀਵਰੀ',
      shopProducts: 'ਉਤਪਾਦ ਖਰੀਦੋ', getBulkQuote: 'ਬਲਕ ਕੋਟੇਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ',
      statProducts: 'ਉਤਪਾਦ', statBrands: 'ਬ੍ਰਾਂਡ', statStates: 'ਰਾਜ', statFarmers: 'ਕਿਸਾਨ',
      trust1Title: '100% ਅਸਲ ਉਤਪਾਦ', trust1Desc: 'CIB&RC ਰਜਿਸਟਰਡ ਨਿਰਮਾਤਾ',
      trust2Title: 'ਕੈਸ਼ ਆਨ ਡਿਲੀਵਰੀ', trust2Desc: '₹10,000 ਤੱਕ COD ਉਪਲਬਧ',
      trust3Title: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ', trust3Desc: 'UPI, ਕਾਰਡ ਅਤੇ ਨੈੱਟ ਬੈਂਕਿੰਗ',
      trust4Title: 'ਮਾਹਿਰ ਖੇਤੀ ਸਹਾਇਤਾ', trust4Desc: 'ਖੇਤੀ ਮਾਹਿਰ ਸੋਮ–ਸ਼ਨੀ, ਸਵੇਰੇ 8–ਸ਼ਾਮ 7',
      bestSellersEyebrow: 'ਬੈਸਟ ਸੈਲਰ', bestSellersTitle: 'ਸਭ ਤੋਂ ਵੱਧ ਵਿਕਣ ਵਾਲੇ ਉਤਪਾਦ', viewAll: 'ਸਭ ਦੇਖੋ →',
      catEyebrow: 'ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਖਰੀਦੋ', catTitle: 'ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਹਰ ਚੀਜ਼',
      catSub: '10 ਮੁੱਖ ਸ਼੍ਰੇਣੀਆਂ ਵਿੱਚ 5,000+ ਪ੍ਰਮਾਣਿਤ ਉਤਪਾਦ',
    },
    or: {
      home: 'ହୋମ', products: 'ଉତ୍ପାଦ', vendors: 'ବିକ୍ରେତା', contact: 'ଯୋଗାଯୋଗ',
      getQuote: 'ଉଦ୍ଧୃତ ପ୍ରାପ୍ତ କରନ୍ତୁ', login: 'ଲଗଇନ',
      searchPlaceholder: 'ଫସଲ ବିହନ, ସାର, ଟ୍ରାକ୍ଟର, କୀଟନାଶକ ଖୋଜ…',
      language: 'ଭାଷା',
      heroPill: '12,000+ ଚାଷୀଙ୍କ ବିଶ୍ୱାସ',
      heroTitle: 'ଆସଲ<br/>କୃଷି ଉତ୍ପାଦ କିଣନ୍ତୁ<br/><em>ସିଧାସଳଖ</em> <strong>ବିଶ୍ୱସ୍ତ ବ୍ରାଣ୍ଡଙ୍କ ଠାରୁ</strong>',
      heroSubtitle: 'ଗୁଣବତ୍ତା ଥିବା କୃଷି ଉତ୍ପାଦ ସିଧାସଳଖ ଆପଣଙ୍କ ଜମିକୁ',
      heroCheck1: 'ପ୍ରମାଣିତ ଉତ୍ପାଦ', heroCheck2: 'କ୍ୟାଶ୍ ଅନ ଡେଲିଭରି',
      heroCheck3: 'ବଲ୍କ ଅର୍ଡର ଉପଲବ୍ଧ', heroCheck4: 'ସମଗ୍ର ଭାରତରେ ଡେଲିଭରି',
      shopProducts: 'ଉତ୍ପାଦ କିଣନ୍ତୁ', getBulkQuote: 'ବଲ୍କ ଉଦ୍ଧୃତ ପ୍ରାପ୍ତ କରନ୍ତୁ',
      statProducts: 'ଉତ୍ପାଦ', statBrands: 'ବ୍ରାଣ୍ଡ', statStates: 'ରାଜ୍ୟ', statFarmers: 'ଚାଷୀ',
      trust1Title: '100% ଆସଲ ଉତ୍ପାଦ', trust1Desc: 'CIB&RC ନିବନ୍ଧିତ ଉତ୍ପାଦକ',
      trust2Title: 'କ୍ୟାଶ୍ ଅନ ଡେଲିଭରି', trust2Desc: '₹10,000 ପର୍ଯ୍ୟନ୍ତ COD ଉପଲବ୍ଧ',
      trust3Title: 'ସୁରକ୍ଷିତ ଦେୟ', trust3Desc: 'UPI, କାର୍ଡ ଏବଂ ନେଟ ବ୍ୟାଙ୍କିଙ୍ଗ',
      trust4Title: 'ବିଶେଷଜ୍ଞ କୃଷି ସହାୟତା', trust4Desc: 'କୃଷି ବିଶେଷଜ୍ଞ ସୋମ–ଶନି, ସକାଳ 8–ସନ୍ଧ୍ୟା 7',
      bestSellersEyebrow: 'ବେଷ୍ଟ ସେଲର', bestSellersTitle: 'ସର୍ବାଧିକ ବିକ୍ରୀ ଉତ୍ପାଦ', viewAll: 'ସବୁ ଦେଖନ୍ତୁ →',
      catEyebrow: 'ବର୍ଗ ଅନୁଯାୟୀ କିଣନ୍ତୁ', catTitle: 'ଆପଣଙ୍କ ଜମି ପାଇଁ ସବୁ କିଛି',
      catSub: '10 ପ୍ରମୁଖ ବର୍ଗରେ 5,000+ ପ୍ରମାଣିତ ଉତ୍ପାଦ',
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
