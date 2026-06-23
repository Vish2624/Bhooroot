// ============================================================
// routes/categories.js — Public category reads
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');

const router = express.Router();

// GET /api/categories — list all active categories
router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }
    const cats = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

// GET /api/categories/:slug — single category by slug
router.get('/:slug', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
});

module.exports = router;
