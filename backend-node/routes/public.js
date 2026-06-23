// ============================================================
// routes/public.js — Public read-only endpoints (no auth)
// Consumed by the main storefront (index.html)
// ============================================================

const express    = require('express');
const mongoose   = require('mongoose');
const Banner     = require('../models/Banner');
const CmsSection = require('../models/CmsSection');

const router = express.Router();

// GET /api/banners?type=hero|promotional|sidebar|festival
// Returns active banners visible today, sorted by displayOrder
router.get('/banners', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] });
    }

    const { type } = req.query;
    const now = new Date();

    const filter = {
      status: { $in: ['active', 'approved'] },
      $or: [
        { endDate: null },
        { endDate: { $exists: false } },
        { endDate: { $gte: now } },
      ],
    };
    if (type) filter.type = type;

    const banners = await Banner
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('title subtitle buttonText buttonUrl imageDesktop imageMobile type displayOrder');

    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

// GET /api/cms/:key
// Returns a single CMS section by key if visible
router.get('/cms/:key', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: null });
    }

    const section = await CmsSection.findOne({
      sectionKey: req.params.key,
      isVisible:  true,
    }).select('-lastEditedBy');

    res.json({ success: true, data: section || null });
  } catch (err) { next(err); }
});

module.exports = router;
