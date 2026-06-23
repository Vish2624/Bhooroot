// ============================================================
// seed.js — Populate MongoDB Atlas with initial data
// Run: node seed.js
// ============================================================

const dns      = require('dns');
const path     = require('path');
const dotenv   = require('dotenv');
const mongoose = require('mongoose');
const Product  = require('../models/Product');
const Vendor   = require('../models/Vendor');
const User     = require('../models/User');
const Order    = require('../models/Order');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ─── Data ─────────────────────────────────────────────────

// Map frontend category labels → schema enum values
const catMap = {
  Seeds:     'seeds',
  Fertilizers: 'fertilizer',
  Fertilizer:  'fertilizer',
  Chemicals:   'chemical',
  Chemical:    'chemical',
  Machinery:   'machinery',
  Irrigation:  'irrigation',
  Nutrients:   'nutrients',
  'Bio Inputs':'nutrients',
};

const badgeToTag = {
  'Best Seller': 'best',
  'Certified':   'best',
  'New':         'new',
  'Organic':     'new',
  'Top Pick':    'best',
  'CIB&RC':      'best',
  'Bulk':        'bulk',
};

const vendors = [
  { name: 'Mahyco Seeds',        category: 'seeds',     location: 'Jalna, Maharashtra',      rating: 4.8, products: 120, yearsActive: 2024 - 1963, verified: true, banner: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', logo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80', description: "India's leading hybrid seed company. Trusted by 8 million farmers. ICAR-recognized breeding programmes." },
  { name: 'Coromandel Int.',      category: 'fertilizer', location: 'Hyderabad, Telangana',   rating: 4.7, products: 85,  yearsActive: 2024 - 1961, verified: true, banner: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80', description: 'Top-3 crop nutrition company in India. Specialising in NPK, SSP, and specialty fertilizers.' },
  { name: 'Bayer CropScience',    category: 'chemical',  location: 'Mumbai, Maharashtra',     rating: 4.6, products: 200, yearsActive: 2024 - 1993, verified: true, banner: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80', logo: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80', description: 'Global leader in crop protection. All formulations CIB&RC registered and quality-audited.' },
  { name: 'Netafim India',        category: 'irrigation', location: 'Ahmedabad, Gujarat',     rating: 4.9, products: 60,  yearsActive: 2024 - 1965, verified: true, banner: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80', description: "World's #1 drip irrigation company. Pioneer of precision irrigation technology in India." },
  { name: 'VST Tillers Tractors', category: 'machinery', location: 'Bengaluru, Karnataka',   rating: 4.8, products: 40,  yearsActive: 2024 - 1967, verified: true, banner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80', logo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80', description: "India's largest power tiller manufacturer. ISO 9001:2015 certified. 5 lakh+ units sold." },
  { name: 'Jain Irrigation',      category: 'irrigation', location: 'Jalgaon, Maharashtra',  rating: 4.7, products: 90,  yearsActive: 2024 - 1963, verified: true, banner: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80', description: "World's 2nd largest drip irrigation manufacturer. Diversified agribusiness with 10,000+ SKUs." },
  { name: 'IFFCO',               category: 'fertilizer', location: 'New Delhi, Delhi',       rating: 4.5, products: 30,  yearsActive: 2024 - 1967, verified: true, banner: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80', description: "India's largest fertilizer cooperative. Serving 55 million+ farmer members across 28 states." },
  { name: 'Syngenta India',       category: 'chemical',  location: 'Pune, Maharashtra',      rating: 4.6, products: 150, yearsActive: 2024 - 1990, verified: true, banner: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80', logo: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80', description: 'Innovative agro solutions for pest, disease, and weed management across major Indian crops.' },
  { name: 'Rasi Seeds',           category: 'seeds',     location: 'Salem, Tamil Nadu',      rating: 4.6, products: 80,  yearsActive: 30, verified: true, banner: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=800&q=80', logo: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=200&q=80', description: 'Pioneer in Bt cotton and hybrid seeds for South and Central India.' },
  { name: 'Pioneer Seeds',        category: 'seeds',     location: 'Hyderabad, Telangana',   rating: 4.7, products: 70,  yearsActive: 40, verified: true, banner: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80', description: 'A DuPont brand. Globally trusted hybrid seeds for maize, sunflower, and paddy.' },
  { name: 'Advanta Seeds',        category: 'seeds',     location: 'Hyderabad, Telangana',   rating: 4.5, products: 55,  yearsActive: 25, verified: true, banner: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80', logo: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&q=80', description: 'High-oil hybrids for sunflower and canola. Known for downy mildew resistant varieties.' },
  { name: 'Bayer Seeds',          category: 'seeds',     location: 'Mumbai, Maharashtra',    rating: 4.8, products: 60,  yearsActive: 30, verified: true, banner: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80', logo: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&q=80', description: 'Stay-green drought-tolerant maize and vegetable hybrids from Bayer.' },
  { name: 'East-West Seeds',      category: 'seeds',     location: 'Pune, Maharashtra',      rating: 4.6, products: 90,  yearsActive: 35, verified: true, banner: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80', description: 'Specialised vegetable seed company. Market leader in chilli and cucurbit varieties.' },
  { name: 'Biofit Organics',      category: 'fertilizer', location: 'Bengaluru, Karnataka', rating: 4.5, products: 25,  yearsActive: 15, verified: true, banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80', description: 'Farm-grade composted organic matter enriched with beneficial microbes.' },
  { name: 'NFL India',            category: 'fertilizer', location: 'Noida, Uttar Pradesh', rating: 4.6, products: 20,  yearsActive: 50, verified: true, banner: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', logo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80', description: 'National Fertilizers Limited. BIS-certified urea and fertilizer producer.' },
  { name: 'Agri Gold',            category: 'fertilizer', location: 'Vijayawada, Andhra Pradesh', rating: 4.4, products: 35, yearsActive: 20, verified: false, banner: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80', description: 'Specialty micronutrients and humic acid products for precision farming.' },
  { name: 'UPL Ltd',             category: 'chemical',  location: 'Mumbai, Maharashtra',    rating: 4.5, products: 180, yearsActive: 2024 - 1969, verified: true, banner: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80', logo: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80', description: 'Leading global crop protection company. Extensive fungicide and herbicide portfolio.' },
  { name: 'Dhanuka Agritech',    category: 'chemical',  location: 'New Delhi, Delhi',       rating: 4.4, products: 120, yearsActive: 2024 - 1980, verified: true, banner: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80', logo: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80', description: 'Herbicides and insecticides for major crops. CIB&RC registered formulations.' },
  { name: 'Neptune Sprayers',    category: 'machinery', location: 'Surat, Gujarat',         rating: 4.6, products: 30,  yearsActive: 25, verified: false, banner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80', logo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80', description: 'Manual and motorised knapsack sprayers for small and large-scale farmers.' },
  { name: 'Shaktiman Agro',      category: 'machinery', location: 'Ludhiana, Punjab',       rating: 4.7, products: 50,  yearsActive: 30, verified: true, banner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80', logo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80', description: 'Premium rotavators and tillage equipment. Trusted by Punjab and Haryana farmers.' },
  { name: 'Mahindra Agri',       category: 'machinery', location: 'Mumbai, Maharashtra',    rating: 4.8, products: 45,  yearsActive: 45, verified: true, banner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80', logo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80', description: 'India\'s #1 tractor brand. Mini tractors and agri implements from Mahindra & Mahindra.' },
  { name: 'Fieldking India',     category: 'machinery', location: 'Hisar, Haryana',         rating: 4.5, products: 65,  yearsActive: 20, verified: true, banner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80', logo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80', description: 'Seed drills, cultivators, and tillage implements for tractor attachment.' },
  { name: 'Kirloskar Bros',      category: 'irrigation', location: 'Pune, Maharashtra',     rating: 4.8, products: 70,  yearsActive: 2024 - 1888, verified: true, banner: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80', description: 'India\'s legacy pump manufacturer. BEE-rated monoblock and centrifugal pumps.' },
  { name: 'CRI Pumps',           category: 'irrigation', location: 'Coimbatore, Tamil Nadu', rating: 4.7, products: 55, yearsActive: 2024 - 1973, verified: true, banner: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80', description: 'Energy-efficient submersible and monoblock pumps. ISO 9001 certified. Export to 100+ countries.' },
  { name: 'Rivulis India',       category: 'irrigation', location: 'Chennai, Tamil Nadu',   rating: 4.6, products: 40,  yearsActive: 20, verified: true, banner: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80', description: 'Precision irrigation specialists. Rain guns and micro-sprinklers for large-scale farming.' },
  { name: 'Biomax India',        category: 'nutrients',  location: 'Chennai, Tamil Nadu',   rating: 4.5, products: 30,  yearsActive: 20, verified: true, banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80', description: 'FCO-approved biofertilizers for nitrogen fixation and phosphorus solubilisation.' },
  { name: 'T Stanes & Co.',      category: 'nutrients',  location: 'Coimbatore, Tamil Nadu', rating: 4.4, products: 25, yearsActive: 2024 - 1910, verified: true, banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80', description: 'Legacy agrochemical and biofertilizer company. Rhizobium and Azospirillum cultures.' },
  { name: 'Kelpak India',        category: 'nutrients',  location: 'Bengaluru, Karnataka',  rating: 4.7, products: 15,  yearsActive: 20, verified: true, banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80', description: 'Cold-processed seaweed extracts. Globally certified for organic farming.' },
  { name: 'Agri Organics',       category: 'nutrients',  location: 'Hyderabad, Telangana',  rating: 4.6, products: 20,  yearsActive: 15, verified: false, banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80', description: 'OMRI-listed cold-pressed neem oil and botanical pesticide formulations.' },
  { name: 'VST Tillers',         category: 'machinery', location: 'Bengaluru, Karnataka',   rating: 4.9, products: 40,  yearsActive: 57, verified: true, banner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80', logo: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80', description: 'Power tiller specialists. 9 HP diesel models for paddy field operations.' },
];

// Extract unit from product name e.g. "(10g)" → "10g"
function extractUnit(name) {
  const m = name.match(/\(([^)]+)\)$/);
  return m ? m[1] : 'unit';
}

const productsData = [
  { name: 'Hybrid Tomato Seeds (10g)',       price: 299,    oldPrice: 349,    category: 'seeds',     vendor: 'Mahyco Seeds',       rating: 4.8, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1592482893145-b05987d0de18?w=500&q=80',  desc: 'High-yield F1 hybrid tomato. 95% germination rate. Suitable for all seasons and open-field cultivation.' },
  { name: 'BT Cotton Seeds (450g)',           price: 899,    oldPrice: 1099,   category: 'seeds',     vendor: 'Rasi Seeds',         rating: 4.6, badge: 'Certified',   image: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=500&q=80',  desc: 'GEAC-approved Bt cotton variety. Bollworm resistant. Ideal for Kharif season across black-soil regions.' },
  { name: 'Hybrid Paddy Seeds (5kg)',         price: 599,    oldPrice: 749,    category: 'seeds',     vendor: 'Pioneer Seeds',      rating: 4.7, badge: 'New',         image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',  desc: 'Short-duration (110 days) high-yielding hybrid paddy. Ideal for irrigated Kharif planting.' },
  { name: 'Sunflower Seeds (1kg)',             price: 349,    oldPrice: 399,    category: 'seeds',     vendor: 'Advanta Seeds',      rating: 4.5, badge: '',            image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&q=80',  desc: 'High oil-content hybrid sunflower. Downy mildew tolerant. Suitable for Rabi and Kharif planting.' },
  { name: 'Maize Hybrid Seeds (5kg)',          price: 699,    oldPrice: 849,    category: 'seeds',     vendor: 'Bayer Seeds',        rating: 4.8, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80',  desc: 'Stay-green maize hybrid with drought tolerance and 8–10 MT/ha yield potential.' },
  { name: 'Chilli Seeds (10g)',                price: 449,    oldPrice: 549,    category: 'seeds',     vendor: 'East-West Seeds',    rating: 4.6, badge: 'Certified',   image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',  desc: 'Hot chilli hybrid with long shelf life. Suitable for fresh market and dry chilli production.' },
  { name: 'NPK 19:19:19 (5kg)',               price: 1299,   oldPrice: 1549,   category: 'fertilizer',vendor: 'Coromandel Int.',     rating: 4.8, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80',  desc: 'Fully water-soluble balanced NPK. Suitable for fertigation and foliar spray on all crops.' },
  { name: 'DAP Fertilizer (50kg)',             price: 2499,   oldPrice: 2999,   category: 'fertilizer',vendor: 'IFFCO',              rating: 4.7, badge: '',            image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80',  desc: 'Di-ammonium Phosphate — superior source of phosphorus and nitrogen for basal application.' },
  { name: 'Organic Compost (25kg)',            price: 799,    oldPrice: 999,    category: 'fertilizer',vendor: 'Biofit Organics',    rating: 4.5, badge: 'Organic',     image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80',  desc: 'Farm-grade composted organic matter enriched with beneficial microbes. Improves soil health.' },
  { name: 'Urea 46% N (50kg)',                 price: 1150,   oldPrice: 1350,   category: 'fertilizer',vendor: 'NFL India',          rating: 4.6, badge: '',            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80',  desc: 'BIS-certified granular urea with 46% nitrogen. Best for top-dressing in rice, wheat, and sugarcane.' },
  { name: 'Potassium Humate (1kg)',            price: 899,    oldPrice: 1099,   category: 'fertilizer',vendor: 'Agri Gold',          rating: 4.4, badge: 'New',         image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80',  desc: 'Soluble potassium humate granules. Improves soil structure, CEC, and nutrient uptake efficiency.' },
  { name: 'Cypermethrin 25 EC (250ml)',        price: 499,    oldPrice: 599,    category: 'chemical',  vendor: 'Bayer CropScience',  rating: 4.6, badge: 'CIB&RC',      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80', desc: 'Broad-spectrum pyrethroid insecticide. Controls bollworm, aphids, and whitefly on cotton and vegetables.' },
  { name: 'Imidacloprid 17.8 SL (500ml)',     price: 649,    oldPrice: 799,    category: 'chemical',  vendor: 'Syngenta India',     rating: 4.7, badge: 'CIB&RC',      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80', desc: 'Systemic neonicotinoid insecticide. Controls thrips, jassids, and BPH in rice, cotton, and vegetables.' },
  { name: 'Mancozeb 75 WP (500g)',            price: 399,    oldPrice: 449,    category: 'chemical',  vendor: 'UPL Ltd',            rating: 4.5, badge: '',            image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80', desc: 'Protective fungicide for early and late blight control in potato and tomato. Dithiocarbamate group.' },
  { name: 'Glyphosate 41% SL (1L)',           price: 799,    oldPrice: null,   category: 'chemical',  vendor: 'Dhanuka Agritech',   rating: 4.4, badge: '',            image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80', desc: 'Non-selective systemic herbicide. Controls annual and perennial weeds before sowing.' },
  { name: 'Chlorpyrifos 20 EC (1L)',          price: 549,    oldPrice: 649,    category: 'chemical',  vendor: 'Dhanuka Agritech',   rating: 4.5, badge: 'CIB&RC',      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80', desc: 'Broad-spectrum organophosphate insecticide. Controls stem borer, cutworm, and termites in soil.' },
  { name: 'VST Shakti Power Tiller',          price: 89999,  oldPrice: 99999,  category: 'machinery', vendor: 'VST Tillers',        rating: 4.9, badge: 'Top Pick',    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80', desc: '9 HP diesel power tiller. Ideal for puddling, ploughing, and inter-cultivation in paddy fields.' },
  { name: 'Knapsack Sprayer 16L',             price: 2499,   oldPrice: 2999,   category: 'machinery', vendor: 'Neptune Sprayers',   rating: 4.6, badge: '',            image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80', desc: 'Manual knapsack sprayer with brass pump. Adjustable nozzle from fine mist to direct jet.' },
  { name: 'Rotavator 5ft (Tractor-fit)',      price: 34999,  oldPrice: 39999,  category: 'machinery', vendor: 'Shaktiman Agro',     rating: 4.7, badge: 'New',         image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80', desc: 'Heavy-duty rotavator. Fits 35–60 HP tractors. 48 L-type blades for deep soil tillage.' },
  { name: 'Mini Tractor 18 HP',              price: 249999, oldPrice: 274999, category: 'machinery', vendor: 'Mahindra Agri',      rating: 4.8, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80', desc: 'Compact 18 HP diesel tractor. Suitable for orchards, poly houses, and small landholdings.' },
  { name: 'Seed Drill Machine (7-row)',       price: 18999,  oldPrice: null,   category: 'machinery', vendor: 'Fieldking India',    rating: 4.5, badge: '',            image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80', desc: '7-row seed-cum-fertilizer drill. Works with 35 HP+ tractors. Adjustable row spacing from 15–25 cm.' },
  { name: 'Drip Irrigation Kit (1 Acre)',    price: 7499,   oldPrice: 8999,   category: 'irrigation',vendor: 'Netafim India',      rating: 4.9, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80', desc: 'Complete drip kit for 1 acre. Includes main line, laterals, inline emitters, filter, and valve unit.' },
  { name: 'Sprinkler System (1 Acre)',       price: 4999,   oldPrice: 5999,   category: 'irrigation',vendor: 'Jain Irrigation',    rating: 4.7, badge: '',            image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80', desc: 'Portable sprinkler set for 1-acre coverage. Ideal for wheat, groundnut, and fodder crops.' },
  { name: 'Monoblock Pump 1 HP',            price: 8999,   oldPrice: 10499,  category: 'irrigation',vendor: 'Kirloskar Bros',     rating: 4.8, badge: 'Certified',   image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80', desc: 'Single-phase 1 HP monoblock pump. Max head 30m. Suitable for open wells and shallow borewells.' },
  { name: 'Submersible Pump 2 HP',          price: 14999,  oldPrice: 17499,  category: 'irrigation',vendor: 'CRI Pumps',          rating: 4.7, badge: '',            image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80', desc: '2 HP borewell submersible pump. Max depth 60m. BEE 5-star rated for energy efficiency.' },
  { name: 'Rain Gun Sprinkler',             price: 3499,   oldPrice: 3999,   category: 'irrigation',vendor: 'Rivulis India',      rating: 4.6, badge: 'New',         image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80', desc: 'Heavy-duty rain gun with 360° coverage up to 25m radius. Suitable for sugarcane and fodder.' },
  { name: 'Azospirillum Bio Fertilizer',    price: 299,    oldPrice: 349,    category: 'nutrients', vendor: 'Biomax India',       rating: 4.5, badge: 'Organic',     image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80', desc: 'Nitrogen-fixing biofertilizer for cereals, oilseeds, and vegetables. FSSAI & FCO approved.' },
  { name: 'Rhizobium Culture (250g)',       price: 249,    oldPrice: null,   category: 'nutrients', vendor: 'T Stanes & Co.',     rating: 4.4, badge: '',            image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80', desc: 'Legume-specific Rhizobium. Boosts nodulation and atmospheric nitrogen fixation in pulses and soybean.' },
  { name: 'Seaweed Extract (1L)',           price: 899,    oldPrice: 1099,   category: 'nutrients', vendor: 'Kelpak India',       rating: 4.7, badge: 'Organic',     image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80', desc: 'Cold-processed seaweed extract rich in cytokinins and auxins. Improves crop quality, root growth, and yield.' },
  { name: 'Neem Oil Cold-pressed (1L)',     price: 599,    oldPrice: 699,    category: 'nutrients', vendor: 'Agri Organics',      rating: 4.6, badge: 'Organic',     image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80', desc: 'Pure cold-pressed neem oil. Controls fungal diseases, mites, and insects organically. OMRI listed.' },
];

// ─── Seed ─────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('MONGO_URI not set'); process.exit(1); }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected!');

  // Clear existing data
  await Product.deleteMany({});
  await Vendor.deleteMany({});
  await User.deleteMany({});
  await Order.deleteMany({});
  console.log('Cleared existing products, vendors, users, and orders.');

  // Insert vendors
  const insertedVendors = await Vendor.insertMany(vendors);
  console.log(`Inserted ${insertedVendors.length} vendors.`);

  // Build name → _id map
  const vendorMap = {};
  insertedVendors.forEach(v => { vendorMap[v.name] = v._id; });

  // Insert products with vendor references
  const productDocs = productsData.map(p => ({
    name:        p.name,
    brand:       p.vendor,
    category:    p.category,
    price:       p.price,
    oldPrice:    p.oldPrice || null,
    unit:        extractUnit(p.name),
    description: p.desc,
    tag:         badgeToTag[p.badge] || 'new',
    image:       p.image,
    rating:      p.rating,
    reviews:     Math.floor(Math.random() * 400 + 50),
    inStock:     true,
    stock:       Math.floor(Math.random() * 200 + 20),
    vendor:      vendorMap[p.vendor] || null,
  }));

  const insertedProducts = await Product.insertMany(productDocs);
  console.log(`Inserted ${insertedProducts.length} products.`);

  console.log('\nDatabase seeded successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
