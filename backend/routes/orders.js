// ============================================================
// routes/orders.js — Create & fetch orders
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const orderRouter = express.Router();
const protect = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrderValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');
const { logOrder } = require('../config/googleSheets');

const dbReady = () => mongoose.connection.readyState === 1;

// POST /api/orders — Create new order (protected)
orderRouter.post('/', protect, createOrderValidators, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingCost, discount, totalAmount, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Generate readable order ID
    const orderId = 'UM-' + Date.now().toString().slice(-8);

    // If DB is ready, save to MongoDB
    if (dbReady()) {
      const order = await Order.create({
        user: req.user?._id || null, // req.user is set by protect middleware
        items,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        discount,
        totalAmount,
        promoCode,
      });

      // Update product stock (asynchronous)
      items.forEach(item => {
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }).catch(e => console.warn('Stock update failed:', e.message));
      });

      // Log to Google Sheets
      await logOrder(orderId, req.user?.email || 'guest@demo.com', totalAmount, items.length, req.ip);

      return res.status(201).json({
        success: true,
        orderId: order._id,
        orderNumber: orderId,
        message: 'Order placed successfully',
        data: order,
      });
    }

    // Demo Mode fallback
    await logOrder(orderId, 'demo@customer.com', totalAmount, items.length, req.ip);
    res.status(201).json({
      success: true,
      orderId: 'demo_' + Date.now(),
      orderNumber: orderId,
      message: 'Order placed successfully (Demo Mode)',
      data: { orderId, totalAmount, itemsCount: items.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — Get order details
orderRouter.get('/:id', protect, async (req, res, next) => {
  try {
    if (!dbReady()) {
      return res.status(503).json({ success: false, message: 'Database not connected (Demo Mode)' });
    }

    const order = await Order.findById(req.params.id).populate('items.product', 'name image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization check: only owner or admin can view
    if (order.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — Get my orders
orderRouter.get('/', protect, async (req, res, next) => {
  try {
    if (!dbReady()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

module.exports = orderRouter;
