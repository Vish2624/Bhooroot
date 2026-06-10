// ============================================================
// routes/orders.js — Create & fetch orders
// ============================================================

const express = require('express');
const orderRouter = express.Router();
const protect = require('../middleware/auth');

// POST /api/orders — Create new order (protected)
orderRouter.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingCost, discount, totalAmount, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Generate order ID
    const orderId = 'FB-' + Date.now().toString().slice(-8);

    // const order = await Order.create({
    //   user: req.user._id,
    //   items, shippingAddress, paymentMethod,
    //   subtotal, shippingCost, discount, totalAmount, promoCode,
    // });

    res.status(201).json({
      success:  true,
      orderId,
      message:  'Order placed successfully',
      // data:  order,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — Get order (protected)
orderRouter.get('/:id', protect, async (req, res, next) => {
  try {
    // const order = await Order.findById(req.params.id).populate('items.product', 'name image');
    // if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // res.json({ success: true, data: order });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = orderRouter;
