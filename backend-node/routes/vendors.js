// ============================================================
// routes/vendors.js — Vendor listing
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const vendorRouter = express.Router();

let Vendor;
try {
  Vendor = require('../models/Vendor');
} catch {
  Vendor = null;
}

const dbReady = () => mongoose.connection.readyState === 1;

// GET /api/vendors
vendorRouter.get('/', async (req, res, next) => {
  try {
    if (Vendor && dbReady()) {
      const { category, verified, search } = req.query;
      const query = {};
      if (category) query.category = category;
      if (verified)  query.verified = verified === 'true';
      if (search)    query.$or = [{ name: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }];
      const vendors = await Vendor.find(query).sort({ rating: -1 });
      return res.json({ success: true, vendors });
    }

    // ── No DB: return 503 so frontend falls back to local Data.vendors ──
    res.status(503).json({ success: false, message: 'Database not connected' });
  } catch (err) {
    next(err);
  }
});

module.exports = vendorRouter;
