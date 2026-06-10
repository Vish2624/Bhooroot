// ============================================================
// routes/payment.js — Razorpay Integration
// ============================================================

const express = require('express');
const paymentRouter = express.Router();
const crypto = require('crypto');

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  Razorpay = null;
}

const protect = require('../middleware/auth');

// Razorpay instance
const getRazorpay = () => {
  if (!Razorpay) throw new Error('Razorpay package not installed. Run: npm install razorpay');
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payment — Direct checkout handler (frontend default endpoint)
// Creates a Razorpay order if keys are configured, otherwise returns a demo confirmation
paymentRouter.post('/', async (req, res, next) => {
  try {
    const { items = [], total } = req.body;
    if (!items.length) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    const amount = total || items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasRazorpay = Razorpay && keyId && !keyId.startsWith('rzp_test_XXXX');

    if (hasRazorpay) {
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rzp.orders.create({
        amount:   Math.round(amount * 100),
        currency: 'INR',
        receipt:  `rcpt_${Date.now()}`,
        notes:    { source: 'FarmBasket Agro Store' },
      });
      return res.json({ success: true, order, keyId });
    }

    // Demo mode — no real Razorpay keys
    res.json({
      success: true,
      demo:    true,
      orderId: 'FB-DEMO-' + Date.now().toString().slice(-8),
      amount,
      message: 'Demo payment accepted',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payment/initiate — Create Razorpay order
paymentRouter.post('/initiate', protect, async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency,
      receipt:  orderId || `rcpt_${Date.now()}`,
      notes:    { source: 'FarmBasket Agro Store' },
    });

    res.json({
      success:         true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payment/verify — Verify Razorpay signature
paymentRouter.post('/verify', protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // Update order payment status in DB
    // await Order.findByIdAndUpdate(orderId, {
    //   paymentStatus:     'paid',
    //   razorpayOrderId:   razorpay_order_id,
    //   razorpayPaymentId: razorpay_payment_id,
    //   orderStatus:       'confirmed',
    // });

    res.json({ success: true, message: 'Payment verified successfully', paymentId: razorpay_payment_id });
  } catch (err) {
    next(err);
  }
});

module.exports = paymentRouter;
