// ============================================================
// routes/products.js — Product CRUD
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { productFilterValidators, createProductValidators, updateProductValidators } = require('../utils/validators');
const { getPaginationMetadata } = require('../utils/pagination');

const productRouter = express.Router();

let Product;
try {
  Product = require('../models/Product');
} catch {
  Product = null;
}

const dbReady = () => mongoose.connection.readyState === 1;

// GET /api/products  — with optional filters
productRouter.get('/', productFilterValidators, async (req, res, next) => {
  try {
    // Validate query parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category, q, search, sort, minPrice, maxPrice, limit = 10, page = 1 } = req.query;
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

      // Get pagination metadata
      const total = await Product.countDocuments(query);
      const pageMeta = getPaginationMetadata(page, limit, total);

      const products = await Product.find(query)
        .sort(sortQuery)
        .skip(pageMeta.skip)
        .limit(pageMeta.limit);

      return res.json({
        success: true,
        data: products,
        pagination: {
          page: pageMeta.page,
          limit: pageMeta.limit,
          total: pageMeta.total,
          pages: pageMeta.pages,
          hasNext: pageMeta.hasNext,
          hasPrev: pageMeta.hasPrev,
        },
      });
    }

    // ── No DB: return 503 so frontend falls back to local Data.products ──
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
      return res.json({ success: true, data: product });
    }
    res.status(503).json({ success: false, message: 'Database not connected' });
  } catch (err) {
    next(err);
  }
});

// POST /api/products — Create product (vendor only)
productRouter.post('/', createProductValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!Product || !dbReady()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const product = await Product.create({
      ...req.body,
      vendor: req.user?._id, // Requires auth middleware
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id — Update product
productRouter.put('/:id', updateProductValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!Product || !dbReady()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
productRouter.delete('/:id', async (req, res, next) => {
  try {
    if (!Product || !dbReady()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = productRouter;
