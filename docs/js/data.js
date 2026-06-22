const Data = {

  subCategories: {
    'seeds': ['Vegetable Seeds', 'Field Crop Seeds', 'Fruit Seeds', 'Flower Seeds', 'Fodder Seeds'],
    'fertilizer': ['Nitrogenous', 'Phosphatic', 'Potassic', 'Complex NPK', 'Organic & Bio'],
    'chemical': ['Insecticides', 'Fungicides', 'Herbicides', 'Plant Growth Regulators'],
    'machinery': ['Tractors', 'Power Tillers', 'Sprayers', 'Harvesting', 'Implements'],
    'irrigation': ['Drip Systems', 'Sprinkler Systems', 'Pumps', 'Pipes & Fittings'],
    'nutrients': ['Micronutrients', 'Seaweed Extract', 'Humic Acid', 'Amino Acids'],
  },

  categories: [
    { id: 'seeds',      label: 'Seeds',            icon: 'ph:plant-duotone',           count: 1240, image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=90&fit=crop' },
    { id: 'fertilizer', label: 'Fertilizers',      icon: 'ph:flask-duotone',           count: 980,  image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=90&fit=crop' },
    { id: 'chemical',   label: 'Biological Agents', icon: 'ph:flask-duotone',           count: 760,  image: 'https://images.unsplash.com/photo-1628352081506-83c43123a6b9?w=600&q=90&fit=crop' },
    { id: 'machinery',  label: 'Machinery',        icon: 'ph:gear-duotone',            count: 430,  image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=90&fit=crop' },
    { id: 'irrigation', label: 'Irrigation',       icon: 'ph:drop-duotone',            count: 590,  image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=90&fit=crop' },
    { id: 'nutrients',  label: 'Bio Inputs',       icon: 'ph:leaf-duotone',            count: 310,  image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=90&fit=crop' },
    { id: 'organic',    label: 'Organic Farming',  icon: 'ph:flower-duotone',          count: 480,  image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=90&fit=crop' },
    { id: 'animal',     label: 'Animal Husbandry', icon: 'ph:dog-duotone',             count: 220,  image: 'https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=600&q=90&fit=crop' },
    { id: 'tools',      label: 'Hand Tools',       icon: 'ph:wrench-duotone',          count: 350,  image: 'https://images.unsplash.com/photo-1581122584612-713f89daa8eb?w=600&q=90&fit=crop' },
    { id: 'storage',    label: 'Post-Harvest',     icon: 'ph:package-duotone',         count: 190,  image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=90&fit=crop' },
  ],

  products: [
    // ── Seeds ────────────────────────────────────────────────────────────────
    {
      id: 1, name: 'Hybrid Tomato Seeds (10g)', price: 299, oldPrice: 349, category: 'seeds',
      vendor: 'Mahyco Seeds', rating: 4.8, badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1592482893145-b05987d0de18?w=700&q=90&fit=crop',
      desc: 'High-yield F1 hybrid tomato. 95% germination rate. Suitable for all seasons and open-field cultivation.',
      features: ['F1 hybrid with 95% germination rate', 'Indeterminate, suitable for all seasons', 'Tolerant to leaf curl virus and early blight', 'Uniform fruit size with long shelf life'],
    },
    {
      id: 2, name: 'BT Cotton Seeds (450g)', price: 899, oldPrice: 1099, category: 'seeds',
      vendor: 'Rasi Seeds', rating: 4.6, badge: 'Certified',
      image: 'https://images.unsplash.com/photo-1594911771122-3320491b4904?w=700&q=90&fit=crop',
      desc: 'GEAC-approved Bt cotton variety. Bollworm resistant. Ideal for Kharif season across black-soil regions.',
    },
    {
      id: 3, name: 'Hybrid Paddy Seeds', price: 599, oldPrice: 749, category: 'seeds',
      vendor: 'Pioneer Seeds', rating: 4.7, badge: 'New',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&q=90&fit=crop',
      desc: 'Short-duration (110 days) high-yielding hybrid paddy. Ideal for irrigated Kharif planting.',
      features: ['Short 110-day crop duration', 'High milling recovery and head rice percentage', 'Blast and BPH tolerant variety', 'Ideal for irrigated Kharif and Rabi seasons'],
      variants: [
        { label: '5 kg',  price: 599,  oldPrice: 749,  tag: '' },
        { label: '10 kg', price: 1099, oldPrice: 1498, tag: 'Save 27%' },
        { label: '25 kg', price: 2499, oldPrice: 3745, tag: 'Bulk' },
      ],
    },
    {
      id: 4, name: 'Sunflower Seeds (1kg)', price: 349, oldPrice: 399, category: 'seeds',
      vendor: 'Advanta Seeds', rating: 4.5, badge: '',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=700&q=90&fit=crop',
      desc: 'High oil-content hybrid sunflower. Downy mildew tolerant. Suitable for Rabi and Kharif planting.',
    },
    {
      id: 5, name: 'Maize Hybrid Seeds', price: 699, oldPrice: 849, category: 'seeds',
      vendor: 'Bayer Seeds', rating: 4.8, badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&q=90&fit=crop',
      desc: 'Stay-green maize hybrid with drought tolerance and 8–10 MT/ha yield potential.',
      features: ['High-yielding hybrid variety (8–10 MT/ha)', 'Drought tolerant and stay-green trait', 'Excellent grain quality and bold kernel size', 'Ideal for Kharif and Rabi seasons'],
      variants: [
        { label: '1 kg',  price: 159, oldPrice: 299,  tag: 'Best Seller' },
        { label: '2 kg',  price: 299, oldPrice: 598,  tag: 'Value Pack' },
        { label: '5 kg',  price: 699, oldPrice: 1495, tag: 'Value Pack' },
        { label: '10 kg', price: 1299,oldPrice: 2990, tag: 'Bulk Save' },
      ],
    },
    {
      id: 6, name: 'Chilli Seeds (10g)', price: 449, oldPrice: 549, category: 'seeds',
      vendor: 'East-West Seeds', rating: 4.6, badge: 'Certified',
      image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=700&q=90&fit=crop',
      desc: 'Hot chilli hybrid with long shelf life. Suitable for fresh market and dry chilli production.',
    },

    // ── Fertilizers ──────────────────────────────────────────────────────────
    {
      id: 7, name: 'NPK 19:19:19 (5kg)', price: 1299, oldPrice: 1549, category: 'fertilizer',
      vendor: 'Coromandel Int.', rating: 4.8, badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1563514227147-6d2ff66de8c4?w=700&q=90&fit=crop',
      desc: 'Fully water-soluble balanced NPK. Suitable for fertigation and foliar spray on all crops.',
    },
    {
      id: 8, name: 'DAP Fertilizer (50kg)', price: 2499, oldPrice: 2999, category: 'fertilizer',
      vendor: 'IFFCO', rating: 4.7, badge: '',
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123a6b9?w=700&q=90&fit=crop',
      desc: 'Di-ammonium Phosphate — superior source of phosphorus and nitrogen for basal application.',
    },
    {
      id: 9, name: 'Organic Compost (25kg)', price: 799, oldPrice: 999, category: 'fertilizer',
      vendor: 'Biofit Organics', rating: 4.5, badge: 'Organic',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=90&fit=crop',
      desc: 'Farm-grade composted organic matter enriched with beneficial microbes. Improves soil health.',
    },
    {
      id: 10, name: 'Urea 46% N (50kg)', price: 1150, oldPrice: 1350, category: 'fertilizer',
      vendor: 'NFL India', rating: 4.6, badge: '',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=90&fit=crop',
      desc: 'BIS-certified granular urea with 46% nitrogen. Best for top-dressing in rice, wheat, and sugarcane.',
    },
    {
      id: 11, name: 'Potassium Humate (1kg)', price: 899, oldPrice: 1099, category: 'fertilizer',
      vendor: 'Agri Gold', rating: 4.4, badge: 'New',
      image: 'https://images.unsplash.com/photo-1557234195-bd9f291f65bc?w=700&q=90&fit=crop',
      desc: 'Soluble potassium humate granules. Improves soil structure, CEC, and nutrient uptake efficiency.',
    },

    // ── Biological Agents ────────────────────────────────────────────────────
    {
      id: 12, name: 'Cypermethrin 25 EC (250ml)', price: 499, oldPrice: 599, category: 'chemical',
      vendor: 'Bayer CropScience', rating: 4.6, badge: 'CIB&RC',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=700&q=90&fit=crop',
      desc: 'Broad-spectrum pyrethroid insecticide. Controls bollworm, aphids, and whitefly on cotton and vegetables.',
    },
    {
      id: 13, name: 'Imidacloprid 17.8 SL (500ml)', price: 649, oldPrice: 799, category: 'chemical',
      vendor: 'Syngenta India', rating: 4.7, badge: 'CIB&RC',
      image: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=700&q=90&fit=crop',
      desc: 'Systemic neonicotinoid insecticide. Controls thrips, jassids, and BPH in rice, cotton, and vegetables.',
    },
    {
      id: 14, name: 'Mancozeb 75 WP (500g)', price: 399, oldPrice: 449, category: 'chemical',
      vendor: 'UPL Ltd', rating: 4.5, badge: '',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=90&fit=crop',
      desc: 'Protective fungicide for early and late blight control in potato and tomato. Dithiocarbamate group.',
    },
    {
      id: 15, name: 'Glyphosate 41% SL (1L)', price: 799, category: 'chemical',
      vendor: 'Dhanuka Agritech', rating: 4.4, badge: '',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=700&q=90&fit=crop',
      desc: 'Non-selective systemic herbicide. Controls annual and perennial weeds before sowing.',
    },
    {
      id: 16, name: 'Chlorpyrifos 20 EC (1L)', price: 549, oldPrice: 649, category: 'chemical',
      vendor: 'Dhanuka Agritech', rating: 4.5, badge: 'CIB&RC',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=90&fit=crop',
      desc: 'Broad-spectrum organophosphate insecticide. Controls stem borer, cutworm, and termites in soil.',
    },

    // ── Machinery ────────────────────────────────────────────────────────────
    {
      id: 17, name: 'VST Shakti Power Tiller', price: 89999, oldPrice: 99999, category: 'machinery',
      vendor: 'VST Tillers', rating: 4.9, badge: 'Top Pick',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=700&q=90&fit=crop',
      desc: '9 HP diesel power tiller. Ideal for puddling, ploughing, and inter-cultivation in paddy fields.',
    },
    {
      id: 18, name: 'Knapsack Sprayer 16L', price: 2499, oldPrice: 2999, category: 'machinery',
      vendor: 'Neptune Sprayers', rating: 4.6, badge: '',
      image: 'https://images.unsplash.com/photo-1564032997182-019688408077?w=700&q=90&fit=crop',
      desc: 'Manual knapsack sprayer with brass pump. Adjustable nozzle from fine mist to direct jet.',
    },
    {
      id: 19, name: 'Rotavator 5ft (Tractor-fit)', price: 34999, oldPrice: 39999, category: 'machinery',
      vendor: 'Shaktiman Agro', rating: 4.7, badge: 'New',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=90&fit=crop',
      desc: 'Heavy-duty rotavator. Fits 35–60 HP tractors. 48 L-type blades for deep soil tillage.',
    },
    {
      id: 20, name: 'Mini Tractor 18 HP', price: 249999, oldPrice: 274999, category: 'machinery',
      vendor: 'Mahindra Agri', rating: 4.8, badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=700&q=90&fit=crop',
      desc: 'Compact 18 HP diesel tractor. Suitable for orchards, poly houses, and small landholdings.',
    },
    {
      id: 21, name: 'Seed Drill Machine (7-row)', price: 18999, category: 'machinery',
      vendor: 'Fieldking India', rating: 4.5, badge: '',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=90&fit=crop',
      desc: '7-row seed-cum-fertilizer drill. Works with 35 HP+ tractors. Adjustable row spacing from 15–25 cm.',
    },

    // ── Irrigation ───────────────────────────────────────────────────────────
    {
      id: 22, name: 'Drip Irrigation Kit (1 Acre)', price: 7499, oldPrice: 8999, category: 'irrigation',
      vendor: 'Netafim India', rating: 4.9, badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=90&fit=crop',
      desc: 'Complete drip kit for 1 acre. Includes main line, laterals, inline emitters, filter, and valve unit.',
    },
    {
      id: 23, name: 'Sprinkler System (1 Acre)', price: 4999, oldPrice: 5999, category: 'irrigation',
      vendor: 'Jain Irrigation', rating: 4.7, badge: '',
      image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=700&q=90&fit=crop',
      desc: 'Portable sprinkler set for 1-acre coverage. Ideal for wheat, groundnut, and fodder crops.',
    },
    {
      id: 24, name: 'Monoblock Pump 1 HP', price: 8999, oldPrice: 10499, category: 'irrigation',
      vendor: 'Kirloskar Bros', rating: 4.8, badge: 'Certified',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=700&q=90&fit=crop',
      desc: 'Single-phase 1 HP monoblock pump. Max head 30m. Suitable for open wells and shallow borewells.',
    },
    {
      id: 25, name: 'Submersible Pump 2 HP', price: 14999, oldPrice: 17499, category: 'irrigation',
      vendor: 'CRI Pumps', rating: 4.7, badge: '',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=90&fit=crop',
      desc: '2 HP borewell submersible pump. Max depth 60m. BEE 5-star rated for energy efficiency.',
    },
    {
      id: 26, name: 'Rain Gun Sprinkler', price: 3499, oldPrice: 3999, category: 'irrigation',
      vendor: 'Rivulis India', rating: 4.6, badge: 'New',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&q=90&fit=crop',
      desc: 'Heavy-duty rain gun with 360° coverage up to 25m radius. Suitable for sugarcane and fodder.',
    },

    // ── Bio Inputs / Nutrients ────────────────────────────────────────────────
    {
      id: 27, name: 'Azospirillum Bio Fertilizer', price: 299, oldPrice: 349, category: 'nutrients',
      vendor: 'Biomax India', rating: 4.5, badge: 'Organic',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=90&fit=crop',
      desc: 'Nitrogen-fixing biofertilizer for cereals, oilseeds, and vegetables. FSSAI & FCO approved.',
    },
    {
      id: 28, name: 'Rhizobium Culture (250g)', price: 249, category: 'nutrients',
      vendor: 'T Stanes & Co.', rating: 4.4, badge: '',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=90&fit=crop',
      desc: 'Legume-specific Rhizobium. Boosts nodulation and atmospheric nitrogen fixation in pulses and soybean.',
    },
    {
      id: 29, name: 'Seaweed Extract (1L)', price: 899, oldPrice: 1099, category: 'nutrients',
      vendor: 'Kelpak India', rating: 4.7, badge: 'Organic',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=90&fit=crop',
      desc: 'Cold-processed seaweed extract rich in cytokinins and auxins. Improves crop quality, root growth, and yield.',
    },
    {
      id: 30, name: 'Neem Oil Cold-pressed (1L)', price: 599, oldPrice: 699, category: 'nutrients',
      vendor: 'Agri Organics', rating: 4.6, badge: 'Organic',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=90&fit=crop',
      desc: 'Pure cold-pressed neem oil. Controls fungal diseases, mites, and insects organically. OMRI listed.',
    },
  ],

  vendors: [
    {
      id: 1, name: 'Mahyco Seeds', category: 'Seeds', location: 'Jalna, Maharashtra',
      rating: 4.8, since: 1963, products: 120, verified: true,
      image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=90&fit=crop',
      desc: "India's leading hybrid seed company. Trusted by 8 million farmers. ICAR-recognized breeding programmes.",
    },
    {
      id: 2, name: 'Coromandel Int.', category: 'Fertilizers', location: 'Hyderabad, Telangana',
      rating: 4.7, since: 1961, products: 85, verified: true,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=90&fit=crop',
      desc: 'Top-3 crop nutrition company in India. Specialising in NPK, SSP, and specialty fertilizers.',
    },
    {
      id: 3, name: 'Bayer CropScience', category: 'Biological Agents', location: 'Mumbai, Maharashtra',
      rating: 4.6, since: 1993, products: 200, verified: true,
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=90&fit=crop',
      desc: 'Global leader in crop protection. All formulations CIB&RC registered and quality-audited.',
    },
    {
      id: 4, name: 'Netafim India', category: 'Irrigation', location: 'Ahmedabad, Gujarat',
      rating: 4.9, since: 1965, products: 60, verified: true,
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=90&fit=crop',
      desc: "World's #1 drip irrigation company. Pioneer of precision irrigation technology in India.",
    },
    {
      id: 5, name: 'VST Tillers Tractors', category: 'Machinery', location: 'Bengaluru, Karnataka',
      rating: 4.8, since: 1967, products: 40, verified: true,
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=90&fit=crop',
      desc: "India's largest power tiller manufacturer. ISO 9001:2015 certified. 5 lakh+ units sold.",
    },
    {
      id: 6, name: 'Jain Irrigation', category: 'Irrigation', location: 'Jalgaon, Maharashtra',
      rating: 4.7, since: 1963, products: 90, verified: true,
      image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=90&fit=crop',
      desc: "World's 2nd largest drip irrigation manufacturer. Diversified agribusiness with 10,000+ SKUs.",
    },
    {
      id: 7, name: 'IFFCO', category: 'Fertilizers', location: 'New Delhi, Delhi',
      rating: 4.5, since: 1967, products: 30, verified: true,
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=90&fit=crop',
      desc: "India's largest fertilizer cooperative. Serving 55 million+ farmer members across 28 states.",
    },
    {
      id: 8, name: 'Syngenta India', category: 'Biological Agents', location: 'Pune, Maharashtra',
      rating: 4.6, since: 1990, products: 150, verified: true,
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=90&fit=crop',
      desc: 'Innovative agro solutions for pest, disease, and weed management across major Indian crops.',
    },
  ],

  faqs: [
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major payment methods via Razorpay — UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), and Net Banking. Cash on Delivery (COD) is currently unavailable.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3–7 business days across India. Orders placed before 2 PM are dispatched the same day. Bio-inputs and perishable seeds are shipped via cold-chain logistics to preserve viability.',
    },
    {
      question: 'Do you offer bulk or wholesale discounts?',
      answer: 'Yes! FPOs, cooperative societies, and agro dealers get custom bulk pricing. Submit a Bulk Quote request on the Contact page — our team responds within 24 hours with a tailored offer.',
    },
    {
      question: 'Are all products certified and genuine?',
      answer: 'Absolutely. Every product is sourced directly from licensed manufacturers registered with CIB&RC (chemicals), ICAR (seeds), and FCO (fertilizers). We audit all vendor licences annually and reject non-compliant stock.',
    },
    {
      question: 'What is the return and refund policy?',
      answer: 'Quality issues can be raised within 7 days of delivery. Machinery defects are covered under the manufacturer warranty. Contact support with photos and batch numbers — refunds are processed within 5–7 working days.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Once dispatched, you receive an SMS and email with a live tracking link. You can also enter your Order ID on the Help page below for real-time status. Our support team is available Mon–Sat if you need help.',
    },
    {
      question: 'Do you deliver to rural and remote areas?',
      answer: 'Yes. We deliver to 28 states including rural pincodes via Delhivery, DTDC, and India Post for remote areas. Enter your pincode at checkout to confirm serviceability before placing your order.',
    },
    {
      question: 'Is there a minimum order value?',
      answer: 'No minimum order value for standard products. Free shipping applies on orders above ₹2,000. Bulk orders above ₹50,000 receive dedicated logistics support and a relationship manager.',
    },
    {
      question: 'Do you provide agro advisory services?',
      answer: 'Yes. Certified agronomists are available Mon–Sat, 8 AM – 7 PM on our helpline (+91 74187 02397). Free video consultation is provided with orders above ₹5,000. Advisory is available in Hindi, Tamil, Telugu, Kannada, and Marathi.',
    },
    {
      question: 'How can I become a vendor or reseller partner?',
      answer: 'Visit the Contact page and select "Vendor Partnership" as the subject. Our partner team reviews your licences (seed/fertilizer/pesticide dealer licence) and onboards you within 5–7 working days.',
    },
  ],

  crops: [
    { id: 'paddy',     label: 'Paddy',     icon: 'ph:plant-fill',      category: 'seeds' },
    { id: 'maize',     label: 'Maize',     icon: 'ph:ear-fill',        category: 'seeds' },
    { id: 'tomato',    label: 'Tomato',    icon: 'ph:leaf-fill',       category: 'seeds' },
    { id: 'onion',     label: 'Onion',     icon: 'ph:circle-fill',     category: 'seeds' },
    { id: 'chilli',    label: 'Chilli',    icon: 'ph:fire-fill',       category: 'seeds' },
    { id: 'groundnut', label: 'Groundnut', icon: 'ph:nut-fill',        category: 'seeds' },
    { id: 'cotton',    label: 'Cotton',    icon: 'ph:cloud-fill',      category: 'seeds' },
  ],

  ticker: [
    { name: 'Bayer',        logo: 'https://logo.clearbit.com/bayer.com' },
    { name: 'Syngenta',     logo: 'https://logo.clearbit.com/syngenta.com' },
    { name: 'Corteva',      logo: 'https://logo.clearbit.com/corteva.com' },
    { name: 'UPL',          logo: 'https://logo.clearbit.com/upl-ltd.com' },
    { name: 'Mahyco',       logo: 'https://logo.clearbit.com/mahyco.com' },
    { name: 'IFFCO',        logo: 'https://logo.clearbit.com/iffco.in' },
    { name: 'Coromandel',   logo: 'https://logo.clearbit.com/coromandel.biz' },
    { name: 'BASF',         logo: 'https://logo.clearbit.com/basf.com' },
    { name: 'Pioneer',      logo: 'https://logo.clearbit.com/pioneer.com' },
    { name: 'East-West',    logo: 'https://logo.clearbit.com/eastwestseed.com' },
    { name: 'Kirloskar',    logo: 'https://logo.clearbit.com/kirloskar.com' },
    { name: 'VST Tillers',  logo: 'https://logo.clearbit.com/vsttillers.com' },
  ],

  sliderImages: [
    {
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=92&fit=crop&crop=center',
      label: 'Harvest-Ready Produce',
      sub: 'Direct from farmer · genuine agro inputs at farm-gate prices',
      objectPosition: 'center 45%',
    },
    {
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1600&q=92&fit=crop&crop=center',
      label: 'Premium Seeds & Grains',
      sub: 'ICAR-certified varieties · 95% germination guarantee',
      objectPosition: 'center center',
    },
    {
      image: 'https://images.unsplash.com/photo-1599778150914-88e98e0c3a3e?w=1600&q=92&fit=crop&crop=center',
      label: 'Farm Machinery & Equipment',
      sub: 'Tractors, tillers & precision tools — delivered to your farm',
      objectPosition: 'center 55%',
    },
    {
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1600&q=92&fit=crop&crop=center',
      label: 'Organic & Bio Farming',
      sub: 'FCO-approved fertilizers · certified biological agents',
      objectPosition: 'center 35%',
    },
  ],
};
