// ============================================================
// routes/products.js — Product CRUD
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const productRouter = express.Router();

let Product;
try {
  Product = require('../models/Product');
} catch {
  Product = null;
}

const dbReady = () => mongoose.connection.readyState === 1;

// GET /api/products  — with optional filters
productRouter.get('/', async (req, res, next) => {
  try {
    const { category, q, search, sort, minPrice, maxPrice, limit = 50, page = 1 } = req.query;
    const term = q || search;

    if (Product && dbReady()) {
      const query = {};
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (term) query.$text = { $search: term };

      const sortOptions = {
        'price-asc':  { price: 1 },
        'price-desc': { price: -1 },
        'rating':     { rating: -1 },
        'name':       { name: 1 },
      };
      const sortQuery = sortOptions[sort] || { createdAt: -1 };

      const skip     = (Number(page) - 1) * Number(limit);
      const products = await Product.find(query).sort(sortQuery).skip(skip).limit(Number(limit));
      const total    = await Product.countDocuments(query);

      return res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
    }

    // ── No DB: return 404 so frontend falls back to local Data.products ──
    res.status(503).json({ success: false, message: 'Database not connected' });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
productRouter.get('/:id', async (req, res, next) => {
  try {
    if (Product && dbReady()) {
      const product = await Product.findById(req.params.id).populate('vendor', 'name location');
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    }
    res.status(503).json({ success: false, message: 'Database not connected' });
  } catch (err) {
    next(err);
  }
});

module.exports = productRouter;
