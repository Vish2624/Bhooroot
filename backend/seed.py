#!/usr/bin/env python3
"""
seed.py — Populate MongoDB with sample data for all collections.
Run: python seed.py
"""
import asyncio
import random
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent / ".env")

MONGO_URI = os.getenv("MONGO_URI", "")
if not MONGO_URI or "YOUR_USER" in MONGO_URI or "YOUR_PASSWORD" in MONGO_URI:
    print("ERROR: MONGO_URI not set or still contains placeholder values in backend/.env")
    exit(1)

# ── Data ──────────────────────────────────────────────────────────────────────

ROLES = [
    {"role_name": "admin",    "description": "Full platform access — manage users, products, orders, vendors"},
    {"role_name": "vendor",   "description": "Vendor dashboard access — manage own products and orders"},
    {"role_name": "customer", "description": "Customer access — browse, cart, checkout"},
]

PERMISSIONS = [
    # Products
    {"permission_name": "products:read",   "description": "View product listings"},
    {"permission_name": "products:write",  "description": "Create and update products"},
    {"permission_name": "products:delete", "description": "Delete products"},
    # Orders
    {"permission_name": "orders:read",     "description": "View orders"},
    {"permission_name": "orders:update",   "description": "Update order status"},
    {"permission_name": "orders:cancel",   "description": "Cancel orders"},
    # Users
    {"permission_name": "users:read",      "description": "View user list"},
    {"permission_name": "users:suspend",   "description": "Suspend or reactivate users"},
    # Vendors
    {"permission_name": "vendors:read",    "description": "View vendors"},
    {"permission_name": "vendors:approve", "description": "Approve or reject vendor applications"},
    # Inventory
    {"permission_name": "inventory:read",  "description": "View inventory levels"},
    {"permission_name": "inventory:write", "description": "Adjust stock quantities"},
    # Categories
    {"permission_name": "categories:write","description": "Create and update categories"},
    # Coupons
    {"permission_name": "coupons:write",   "description": "Create and manage discount coupons"},
]

# Role → list of permission names
ROLE_PERMISSIONS = {
    "admin":    [p["permission_name"] for p in PERMISSIONS],   # all permissions
    "vendor":   [
        "products:read", "products:write",
        "orders:read", "orders:update",
        "inventory:read", "inventory:write",
    ],
    "customer": [
        "products:read",
        "orders:read", "orders:cancel",
    ],
}

CATEGORIES = [
    {"name": "Seeds",       "slug": "seeds",      "parent_id": None, "description": "Hybrid and open-pollinated seeds for all crops",   "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"},
    {"name": "Fertilizers", "slug": "fertilizer", "parent_id": None, "description": "Macro and micro-nutrient fertilizers",              "image": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80"},
    {"name": "Chemicals",   "slug": "chemical",   "parent_id": None, "description": "Pesticides, herbicides, and fungicides",            "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&q=80"},
    {"name": "Machinery",   "slug": "machinery",  "parent_id": None, "description": "Tractors, tillers, and farm implements",            "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=80"},
    {"name": "Irrigation",  "slug": "irrigation", "parent_id": None, "description": "Drip kits, pumps, and sprinkler systems",           "image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80"},
    {"name": "Bio Inputs",  "slug": "nutrients",  "parent_id": None, "description": "Biofertilizers, seaweed extracts, and neem oil",    "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80"},
]

VENDORS = [
    {"name": "Mahyco Seeds",        "category": "seeds",      "location": "Jalna, Maharashtra",           "rating": 4.8, "verified": True,  "description": "India's leading hybrid seed company. Trusted by 8 million farmers. ICAR-recognized breeding programmes.",          "logo": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"},
    {"name": "Coromandel Int.",      "category": "fertilizer", "location": "Hyderabad, Telangana",         "rating": 4.7, "verified": True,  "description": "Top-3 crop nutrition company in India. Specialising in NPK, SSP, and specialty fertilizers.",                    "logo": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80"},
    {"name": "Bayer CropScience",    "category": "chemical",   "location": "Mumbai, Maharashtra",          "rating": 4.6, "verified": True,  "description": "Global leader in crop protection. All formulations CIB&RC registered and quality-audited.",                       "logo": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80"},
    {"name": "Netafim India",        "category": "irrigation", "location": "Ahmedabad, Gujarat",           "rating": 4.9, "verified": True,  "description": "World's #1 drip irrigation company. Pioneer of precision irrigation technology in India.",                       "logo": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"},
    {"name": "VST Tillers Tractors", "category": "machinery",  "location": "Bengaluru, Karnataka",         "rating": 4.8, "verified": True,  "description": "India's largest power tiller manufacturer. ISO 9001:2015 certified. 5 lakh+ units sold.",                         "logo": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"},
    {"name": "Jain Irrigation",      "category": "irrigation", "location": "Jalgaon, Maharashtra",         "rating": 4.7, "verified": True,  "description": "World's 2nd largest drip irrigation manufacturer. Diversified agribusiness with 10,000+ SKUs.",                  "logo": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"},
    {"name": "IFFCO",                "category": "fertilizer", "location": "New Delhi, Delhi",             "rating": 4.5, "verified": True,  "description": "India's largest fertilizer cooperative. Serving 55 million+ farmer members across 28 states.",                    "logo": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80"},
    {"name": "Syngenta India",       "category": "chemical",   "location": "Pune, Maharashtra",            "rating": 4.6, "verified": True,  "description": "Innovative agro solutions for pest, disease, and weed management across major Indian crops.",                      "logo": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80"},
    {"name": "Rasi Seeds",           "category": "seeds",      "location": "Salem, Tamil Nadu",            "rating": 4.6, "verified": True,  "description": "Pioneer in Bt cotton and hybrid seeds for South and Central India.",                                             "logo": "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=800&q=80"},
    {"name": "Pioneer Seeds",        "category": "seeds",      "location": "Hyderabad, Telangana",         "rating": 4.7, "verified": True,  "description": "A DuPont brand. Globally trusted hybrid seeds for maize, sunflower, and paddy.",                                 "logo": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"},
    {"name": "Advanta Seeds",        "category": "seeds",      "location": "Hyderabad, Telangana",         "rating": 4.5, "verified": True,  "description": "High-oil hybrids for sunflower and canola. Known for downy mildew resistant varieties.",                         "logo": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80"},
    {"name": "Bayer Seeds",          "category": "seeds",      "location": "Mumbai, Maharashtra",          "rating": 4.8, "verified": True,  "description": "Stay-green drought-tolerant maize and vegetable hybrids from Bayer.",                                           "logo": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80"},
    {"name": "East-West Seeds",      "category": "seeds",      "location": "Pune, Maharashtra",            "rating": 4.6, "verified": True,  "description": "Specialised vegetable seed company. Market leader in chilli and cucurbit varieties.",                             "logo": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"},
    {"name": "Biofit Organics",      "category": "fertilizer", "location": "Bengaluru, Karnataka",         "rating": 4.5, "verified": True,  "description": "Farm-grade composted organic matter enriched with beneficial microbes.",                                         "logo": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"},
    {"name": "NFL India",            "category": "fertilizer", "location": "Noida, Uttar Pradesh",        "rating": 4.6, "verified": True,  "description": "National Fertilizers Limited. BIS-certified urea and fertilizer producer.",                                     "logo": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"},
    {"name": "Agri Gold",            "category": "fertilizer", "location": "Vijayawada, Andhra Pradesh",  "rating": 4.4, "verified": False, "description": "Specialty micronutrients and humic acid products for precision farming.",                                       "logo": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80"},
    {"name": "UPL Ltd",              "category": "chemical",   "location": "Mumbai, Maharashtra",          "rating": 4.5, "verified": True,  "description": "Leading global crop protection company. Extensive fungicide and herbicide portfolio.",                           "logo": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80"},
    {"name": "Dhanuka Agritech",     "category": "chemical",   "location": "New Delhi, Delhi",             "rating": 4.4, "verified": True,  "description": "Herbicides and insecticides for major crops. CIB&RC registered formulations.",                                  "logo": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80"},
    {"name": "Neptune Sprayers",     "category": "machinery",  "location": "Surat, Gujarat",               "rating": 4.6, "verified": False, "description": "Manual and motorised knapsack sprayers for small and large-scale farmers.",                                    "logo": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"},
    {"name": "Shaktiman Agro",       "category": "machinery",  "location": "Ludhiana, Punjab",             "rating": 4.7, "verified": True,  "description": "Premium rotavators and tillage equipment. Trusted by Punjab and Haryana farmers.",                              "logo": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"},
    {"name": "Mahindra Agri",        "category": "machinery",  "location": "Mumbai, Maharashtra",          "rating": 4.8, "verified": True,  "description": "India's #1 tractor brand. Mini tractors and agri implements from Mahindra & Mahindra.",                          "logo": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"},
    {"name": "Fieldking India",      "category": "machinery",  "location": "Hisar, Haryana",               "rating": 4.5, "verified": True,  "description": "Seed drills, cultivators, and tillage implements for tractor attachment.",                                    "logo": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"},
    {"name": "Kirloskar Bros",       "category": "irrigation", "location": "Pune, Maharashtra",            "rating": 4.8, "verified": True,  "description": "India's legacy pump manufacturer. BEE-rated monoblock and centrifugal pumps.",                                 "logo": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"},
    {"name": "CRI Pumps",            "category": "irrigation", "location": "Coimbatore, Tamil Nadu",       "rating": 4.7, "verified": True,  "description": "Energy-efficient submersible and monoblock pumps. ISO 9001 certified. Export to 100+ countries.",               "logo": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"},
    {"name": "Rivulis India",        "category": "irrigation", "location": "Chennai, Tamil Nadu",          "rating": 4.6, "verified": True,  "description": "Precision irrigation specialists. Rain guns and micro-sprinklers for large-scale farming.",                      "logo": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"},
    {"name": "Biomax India",         "category": "nutrients",  "location": "Chennai, Tamil Nadu",          "rating": 4.5, "verified": True,  "description": "FCO-approved biofertilizers for nitrogen fixation and phosphorus solubilisation.",                             "logo": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"},
    {"name": "T Stanes & Co.",       "category": "nutrients",  "location": "Coimbatore, Tamil Nadu",       "rating": 4.4, "verified": True,  "description": "Legacy agrochemical and biofertilizer company. Rhizobium and Azospirillum cultures.",                          "logo": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"},
    {"name": "Kelpak India",         "category": "nutrients",  "location": "Bengaluru, Karnataka",         "rating": 4.7, "verified": True,  "description": "Cold-processed seaweed extracts. Globally certified for organic farming.",                                     "logo": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"},
    {"name": "Agri Organics",        "category": "nutrients",  "location": "Hyderabad, Telangana",         "rating": 4.6, "verified": False, "description": "OMRI-listed cold-pressed neem oil and botanical pesticide formulations.",                                     "logo": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"},
    {"name": "VST Tillers",          "category": "machinery",  "location": "Bengaluru, Karnataka",         "rating": 4.9, "verified": True,  "description": "Power tiller specialists. 9 HP diesel models for paddy field operations.",                                    "logo": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200&q=80",  "banner": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"},
]

BADGE_TO_TAG = {
    "Best Seller": "best", "Certified": "best", "New": "new",
    "Organic": "new", "Top Pick": "best", "CIB&RC": "best", "Bulk": "bulk",
}

PRODUCTS_RAW = [
    {"name": "Hybrid Tomato Seeds (10g)",     "price": 299,    "oldPrice": 349,    "category": "seeds",      "vendor": "Mahyco Seeds",       "rating": 4.8, "badge": "Best Seller", "sku": "SED-TOM-001", "image": "https://images.unsplash.com/photo-1592482893145-b05987d0de18?w=500&q=80", "desc": "High-yield F1 hybrid tomato. 95% germination rate. Suitable for all seasons and open-field cultivation."},
    {"name": "BT Cotton Seeds (450g)",         "price": 899,    "oldPrice": 1099,   "category": "seeds",      "vendor": "Rasi Seeds",         "rating": 4.6, "badge": "Certified",   "sku": "SED-COT-001", "image": "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=500&q=80", "desc": "GEAC-approved Bt cotton variety. Bollworm resistant. Ideal for Kharif season across black-soil regions."},
    {"name": "Hybrid Paddy Seeds (5kg)",       "price": 599,    "oldPrice": 749,    "category": "seeds",      "vendor": "Pioneer Seeds",      "rating": 4.7, "badge": "New",         "sku": "SED-PAD-001", "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80", "desc": "Short-duration (110 days) high-yielding hybrid paddy. Ideal for irrigated Kharif planting."},
    {"name": "Sunflower Seeds (1kg)",           "price": 349,    "oldPrice": 399,    "category": "seeds",      "vendor": "Advanta Seeds",      "rating": 4.5, "badge": "",            "sku": "SED-SUN-001", "image": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&q=80", "desc": "High oil-content hybrid sunflower. Downy mildew tolerant. Suitable for Rabi and Kharif planting."},
    {"name": "Maize Hybrid Seeds (5kg)",        "price": 699,    "oldPrice": 849,    "category": "seeds",      "vendor": "Bayer Seeds",        "rating": 4.8, "badge": "Best Seller", "sku": "SED-MAI-001", "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80", "desc": "Stay-green maize hybrid with drought tolerance and 8–10 MT/ha yield potential."},
    {"name": "Chilli Seeds (10g)",              "price": 449,    "oldPrice": 549,    "category": "seeds",      "vendor": "East-West Seeds",    "rating": 4.6, "badge": "Certified",   "sku": "SED-CHI-001", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80", "desc": "Hot chilli hybrid with long shelf life. Suitable for fresh market and dry chilli production."},
    {"name": "NPK 19:19:19 (5kg)",             "price": 1299,   "oldPrice": 1549,   "category": "fertilizer", "vendor": "Coromandel Int.",     "rating": 4.8, "badge": "Best Seller", "sku": "FER-NPK-001", "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80", "desc": "Fully water-soluble balanced NPK. Suitable for fertigation and foliar spray on all crops."},
    {"name": "DAP Fertilizer (50kg)",           "price": 2499,   "oldPrice": 2999,   "category": "fertilizer", "vendor": "IFFCO",              "rating": 4.7, "badge": "",            "sku": "FER-DAP-001", "image": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80", "desc": "Di-ammonium Phosphate — superior source of phosphorus and nitrogen for basal application."},
    {"name": "Organic Compost (25kg)",          "price": 799,    "oldPrice": 999,    "category": "fertilizer", "vendor": "Biofit Organics",    "rating": 4.5, "badge": "Organic",     "sku": "FER-COM-001", "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80", "desc": "Farm-grade composted organic matter enriched with beneficial microbes. Improves soil health."},
    {"name": "Urea 46% N (50kg)",               "price": 1150,   "oldPrice": 1350,   "category": "fertilizer", "vendor": "NFL India",          "rating": 4.6, "badge": "",            "sku": "FER-URE-001", "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80", "desc": "BIS-certified granular urea with 46% nitrogen. Best for top-dressing in rice, wheat, and sugarcane."},
    {"name": "Potassium Humate (1kg)",          "price": 899,    "oldPrice": 1099,   "category": "fertilizer", "vendor": "Agri Gold",          "rating": 4.4, "badge": "New",         "sku": "FER-HUM-001", "image": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80", "desc": "Soluble potassium humate granules. Improves soil structure, CEC, and nutrient uptake efficiency."},
    {"name": "Cypermethrin 25 EC (250ml)",      "price": 499,    "oldPrice": 599,    "category": "chemical",   "vendor": "Bayer CropScience",  "rating": 4.6, "badge": "CIB&RC",      "sku": "CHM-CYP-001", "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80", "desc": "Broad-spectrum pyrethroid insecticide. Controls bollworm, aphids, and whitefly on cotton and vegetables."},
    {"name": "Imidacloprid 17.8 SL (500ml)",   "price": 649,    "oldPrice": 799,    "category": "chemical",   "vendor": "Syngenta India",     "rating": 4.7, "badge": "CIB&RC",      "sku": "CHM-IMI-001", "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80", "desc": "Systemic neonicotinoid insecticide. Controls thrips, jassids, and BPH in rice, cotton, and vegetables."},
    {"name": "Mancozeb 75 WP (500g)",          "price": 399,    "oldPrice": 449,    "category": "chemical",   "vendor": "UPL Ltd",            "rating": 4.5, "badge": "",            "sku": "CHM-MAN-001", "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80", "desc": "Protective fungicide for early and late blight control in potato and tomato."},
    {"name": "Glyphosate 41% SL (1L)",         "price": 799,    "oldPrice": None,   "category": "chemical",   "vendor": "Dhanuka Agritech",   "rating": 4.4, "badge": "",            "sku": "CHM-GLY-001", "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80", "desc": "Non-selective systemic herbicide. Controls annual and perennial weeds before sowing."},
    {"name": "Chlorpyrifos 20 EC (1L)",        "price": 549,    "oldPrice": 649,    "category": "chemical",   "vendor": "Dhanuka Agritech",   "rating": 4.5, "badge": "CIB&RC",      "sku": "CHM-CHL-001", "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&q=80", "desc": "Broad-spectrum organophosphate insecticide. Controls stem borer, cutworm, and termites in soil."},
    {"name": "VST Shakti Power Tiller",        "price": 89999,  "oldPrice": 99999,  "category": "machinery",  "vendor": "VST Tillers",        "rating": 4.9, "badge": "Top Pick",    "sku": "MAC-PTI-001", "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80", "desc": "9 HP diesel power tiller. Ideal for puddling, ploughing, and inter-cultivation in paddy fields."},
    {"name": "Knapsack Sprayer 16L",           "price": 2499,   "oldPrice": 2999,   "category": "machinery",  "vendor": "Neptune Sprayers",   "rating": 4.6, "badge": "",            "sku": "MAC-SPR-001", "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80", "desc": "Manual knapsack sprayer with brass pump. Adjustable nozzle from fine mist to direct jet."},
    {"name": "Rotavator 5ft (Tractor-fit)",    "price": 34999,  "oldPrice": 39999,  "category": "machinery",  "vendor": "Shaktiman Agro",     "rating": 4.7, "badge": "New",         "sku": "MAC-ROT-001", "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80", "desc": "Heavy-duty rotavator. Fits 35–60 HP tractors. 48 L-type blades for deep soil tillage."},
    {"name": "Mini Tractor 18 HP",            "price": 249999, "oldPrice": 274999, "category": "machinery",  "vendor": "Mahindra Agri",      "rating": 4.8, "badge": "Best Seller", "sku": "MAC-TRC-001", "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80", "desc": "Compact 18 HP diesel tractor. Suitable for orchards, poly houses, and small landholdings."},
    {"name": "Seed Drill Machine (7-row)",     "price": 18999,  "oldPrice": None,   "category": "machinery",  "vendor": "Fieldking India",    "rating": 4.5, "badge": "",            "sku": "MAC-DRL-001", "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&q=80", "desc": "7-row seed-cum-fertilizer drill. Works with 35 HP+ tractors. Adjustable row spacing 15–25 cm."},
    {"name": "Drip Irrigation Kit (1 Acre)",  "price": 7499,   "oldPrice": 8999,   "category": "irrigation", "vendor": "Netafim India",      "rating": 4.9, "badge": "Best Seller", "sku": "IRR-DRP-001", "image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80", "desc": "Complete drip kit for 1 acre. Includes main line, laterals, inline emitters, filter, and valve unit."},
    {"name": "Sprinkler System (1 Acre)",     "price": 4999,   "oldPrice": 5999,   "category": "irrigation", "vendor": "Jain Irrigation",    "rating": 4.7, "badge": "",            "sku": "IRR-SPK-001", "image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80", "desc": "Portable sprinkler set for 1-acre coverage. Ideal for wheat, groundnut, and fodder crops."},
    {"name": "Monoblock Pump 1 HP",          "price": 8999,   "oldPrice": 10499,  "category": "irrigation", "vendor": "Kirloskar Bros",     "rating": 4.8, "badge": "Certified",   "sku": "IRR-MBP-001", "image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80", "desc": "Single-phase 1 HP monoblock pump. Max head 30m. Suitable for open wells and shallow borewells."},
    {"name": "Submersible Pump 2 HP",        "price": 14999,  "oldPrice": 17499,  "category": "irrigation", "vendor": "CRI Pumps",          "rating": 4.7, "badge": "",            "sku": "IRR-SUB-001", "image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80", "desc": "2 HP borewell submersible pump. Max depth 60m. BEE 5-star rated for energy efficiency."},
    {"name": "Rain Gun Sprinkler",           "price": 3499,   "oldPrice": 3999,   "category": "irrigation", "vendor": "Rivulis India",      "rating": 4.6, "badge": "New",         "sku": "IRR-RGS-001", "image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80", "desc": "Heavy-duty rain gun with 360° coverage up to 25m radius. Suitable for sugarcane and fodder."},
    {"name": "Azospirillum Bio Fertilizer",  "price": 299,    "oldPrice": 349,    "category": "nutrients",  "vendor": "Biomax India",       "rating": 4.5, "badge": "Organic",     "sku": "BIO-AZO-001", "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80", "desc": "Nitrogen-fixing biofertilizer for cereals, oilseeds, and vegetables. FSSAI & FCO approved."},
    {"name": "Rhizobium Culture (250g)",     "price": 249,    "oldPrice": None,   "category": "nutrients",  "vendor": "T Stanes & Co.",     "rating": 4.4, "badge": "",            "sku": "BIO-RHI-001", "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80", "desc": "Legume-specific Rhizobium. Boosts nodulation and atmospheric N fixation in pulses and soybean."},
    {"name": "Seaweed Extract (1L)",         "price": 899,    "oldPrice": 1099,   "category": "nutrients",  "vendor": "Kelpak India",       "rating": 4.7, "badge": "Organic",     "sku": "BIO-SEA-001", "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80", "desc": "Cold-processed seaweed extract rich in cytokinins and auxins. Improves crop quality and root growth."},
    {"name": "Neem Oil Cold-pressed (1L)",   "price": 599,    "oldPrice": 699,    "category": "nutrients",  "vendor": "Agri Organics",      "rating": 4.6, "badge": "Organic",     "sku": "BIO-NEM-001", "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80", "desc": "Pure cold-pressed neem oil. Controls fungal diseases, mites, and insects organically. OMRI listed."},
]

HERO_BANNERS = [
    {"title": "Quality Seeds for Every Season",    "subtitle": "Hybrid & certified seeds from India's top brands",  "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=80", "ctaText": "Shop Seeds",     "ctaLink": "#products?category=seeds"},
    {"title": "Modern Irrigation Solutions",       "subtitle": "Drip kits, pumps & sprinklers — 1-acre ready packs","image": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80", "ctaText": "Shop Irrigation", "ctaLink": "#products?category=irrigation"},
    {"title": "Crop Protection Essentials",        "subtitle": "CIB&RC approved pesticides & herbicides",           "image": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&q=80", "ctaText": "Shop Chemicals",  "ctaLink": "#products?category=chemical"},
]


# ── Seed ──────────────────────────────────────────────────────────────────────

async def seed():
    from motor.motor_asyncio import AsyncIOMotorClient

    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=15000)
    await client.admin.command("ping")
    db = client["uhazvumart"]
    print("Connected!")

    now = datetime.utcnow()

    # Clear existing collections
    await asyncio.gather(
        db.products.delete_many({}),
        db.vendors.delete_many({}),
        db.categories.delete_many({}),
        db.banners.delete_many({}),
        db.inventory.delete_many({}),
        db.roles.delete_many({}),
        db.permissions.delete_many({}),
        db.user_roles.delete_many({}),
        db.role_permissions.delete_many({}),
        db.order_items.delete_many({}),
    )
    print("Cleared existing data.")

    # ── Roles ─────────────────────────────────────────────────────────────────
    role_docs = [{**r, "created_at": now} for r in ROLES]
    await db.roles.insert_many(role_docs)
    role_map = {r["role_name"]: r["_id"] for r in await db.roles.find({}).to_list(None)}
    print(f"Inserted {len(role_docs)} roles.")

    # ── Permissions ───────────────────────────────────────────────────────────
    perm_docs = [{**p, "created_at": now} for p in PERMISSIONS]
    await db.permissions.insert_many(perm_docs)
    perm_map = {p["permission_name"]: p["_id"] for p in await db.permissions.find({}).to_list(None)}
    print(f"Inserted {len(perm_docs)} permissions.")

    # ── Role-Permission mappings ───────────────────────────────────────────────
    rp_docs = []
    for role_name, perm_names in ROLE_PERMISSIONS.items():
        role_id = role_map.get(role_name)
        for pname in perm_names:
            pid = perm_map.get(pname)
            if role_id and pid:
                rp_docs.append({"role_id": role_id, "permission_id": pid, "created_at": now})
    if rp_docs:
        await db.role_permissions.insert_many(rp_docs)
    print(f"Inserted {len(rp_docs)} role-permission mappings.")

    # ── Categories ────────────────────────────────────────────────────────────
    cat_docs = [
        {**c, "isActive": True, "order": i, "status": "active", "createdAt": now, "updatedAt": now, "createdby": "seed"}
        for i, c in enumerate(CATEGORIES)
    ]
    await db.categories.insert_many(cat_docs)
    print(f"Inserted {len(cat_docs)} categories.")

    # ── Vendors ───────────────────────────────────────────────────────────────
    vendor_docs = [
        {**v, "status": "approved", "approvalStatus": "approved", "createdAt": now, "updatedAt": now, "createdby": "seed"}
        for v in VENDORS
    ]
    result = await db.vendors.insert_many(vendor_docs)
    vendor_map = {v["name"]: result.inserted_ids[i] for i, v in enumerate(VENDORS)}
    print(f"Inserted {len(vendor_docs)} vendors.")

    # ── Products ──────────────────────────────────────────────────────────────
    def _unit(name: str) -> str:
        import re
        m = re.search(r"\(([^)]+)\)$", name)
        return m.group(1) if m else "unit"

    def _discount_percent(price, old_price):
        if old_price and old_price > price:
            return round((old_price - price) / old_price * 100, 1)
        return 0.0

    product_docs = [
        {
            "name":             p["name"],
            "brand":            p["vendor"],
            "category":         p["category"],
            "price":            p["price"],
            "oldPrice":         p["oldPrice"],
            "discount_percent": _discount_percent(p["price"], p["oldPrice"]),
            "unit":             _unit(p["name"]),
            "description":      p["desc"],
            "shortDescription": p["desc"][:120] + "…" if len(p["desc"]) > 120 else p["desc"],
            "tag":              BADGE_TO_TAG.get(p["badge"], "new"),
            "image":            p["image"],
            "gallery":          [],
            "rating":           p["rating"],
            "reviews":          [],
            "inStock":          True,
            "stock":            random.randint(20, 200),
            "featured":         p["badge"] in ("Best Seller", "Top Pick"),
            "status":           "active",
            "approvalStatus":   "approved",
            "sku":              p.get("sku", ""),
            "vendor":           vendor_map.get(p["vendor"]),
            "createdAt":        now,
            "updatedAt":        now,
            "createdby":        "seed",
        }
        for p in PRODUCTS_RAW
    ]
    prod_result = await db.products.insert_many(product_docs)
    print(f"Inserted {len(product_docs)} products.")

    # ── Inventory (one record per product) ────────────────────────────────────
    inventory_docs = [
        {
            "product_id":        str(prod_result.inserted_ids[i]),
            "stock_quantity":    product_docs[i]["stock"],
            "reserved_quantity": 0,
            "last_restocked_at": now,
            "status":            "active",
            "createdAt":         now,
            "updatedAt":         now,
            "createdby":         "seed",
        }
        for i in range(len(product_docs))
    ]
    await db.inventory.insert_many(inventory_docs)
    print(f"Inserted {len(inventory_docs)} inventory records.")

    # ── Hero banners ──────────────────────────────────────────────────────────
    banner_docs = [
        {**b, "type": "hero", "status": "active", "order": i, "createdAt": now, "updatedAt": now}
        for i, b in enumerate(HERO_BANNERS)
    ]
    await db.banners.insert_many(banner_docs)
    print(f"Inserted {len(banner_docs)} hero banners.")

    client.close()
    print("\nDatabase seeded successfully! Start the server: uvicorn main:app --port 5000")


if __name__ == "__main__":
    asyncio.run(seed())
