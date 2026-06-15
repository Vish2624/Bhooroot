// ============================================================
// routes/vendorDashboard.js — Vendor Dashboard API
// All routes require: protect + authorize('vendor')
// ============================================================

const express   = require('express');
const protect   = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const Product   = require('../models/Product');
const Order     = require('../models/Order');
const User      = require('../models/User');
const Banner    = require('../models/Banner');
const Coupon    = require('../models/Coupon');
const Notification = require('../models/Notification');

const router = express.Router();
const guard  = [protect, authorize('vendor')];

// ─── Dashboard Stats ─────────────────────────────────────────
router.get('/stats', guard, async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const [
      totalProducts, activeProducts, pendingProducts, outOfStock,
      totalOrders, deliveredOrders,
    ] = await Promise.all([
      Product.countDocuments({ vendor: vendorId }),
      Product.countDocuments({ vendor: vendorId, approvalStatus: 'approved', inStock: true }),
      Product.countDocuments({ vendor: vendorId, approvalStatus: 'submitted' }),
      Product.countDocuments({ vendor: vendorId, inStock: false }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'delivered' }),
    ]);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'placed' });

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todaySales = await Order.countDocuments({ createdAt: { $gte: todayStart } });

    res.json({
      success: true,
      data: {
        totalProducts, activeProducts, pendingProducts, outOfStock,
        totalOrders, pendingOrders, deliveredOrders,
        totalRevenue, todaySales,
      },
    });
  } catch (err) { next(err); }
});

// ─── Product Management ──────────────────────────────────────
router.get('/products', guard, async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = { vendor: req.user._id };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.approvalStatus = status;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, total, page: +page });
  } catch (err) { next(err); }
});

router.post('/products', guard, async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      vendor: req.user._id,
      approvalStatus: req.body.status === 'draft' ? 'draft' : 'submitted',
    };
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.put('/products/:id', guard, async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    Object.assign(product, req.body);
    if (req.body.status !== 'draft') product.approvalStatus = 'submitted';
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.delete('/products/:id', guard, async (req, res, next) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
});

// ─── Order Management ────────────────────────────────────────
router.get('/orders', guard, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit),
      Order.countDocuments(filter),
    ]);
    const data = orders.map(o => ({ ...o.toObject(), status: o.orderStatus }));
    res.json({ success: true, data, total, page: +page });
  } catch (err) { next(err); }
});

router.put('/orders/:id/status', guard, async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const update = { orderStatus: status };
    if (trackingNumber) update.trackingId = trackingNumber;
    await Order.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, message: 'Order updated' });
  } catch (err) { next(err); }
});

// ─── Inventory ───────────────────────────────────────────────
router.get('/inventory', guard, async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
      .select('name sku stock inStock image').sort({ stock: 1 });
    const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStock = products.filter(p => p.stock === 0 || !p.inStock);
    res.json({ success: true, data: { products, lowStock, outOfStock } });
  } catch (err) { next(err); }
});

router.put('/inventory/:id', guard, async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user._id },
      { stock, inStock: stock > 0 },
      { new: true }
    );
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// ─── Coupons ─────────────────────────────────────────────────
router.get('/coupons', guard, async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
});

router.post('/coupons', guard, async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, vendor: req.user._id });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) { next(err); }
});

router.delete('/coupons/:id', guard, async (req, res, next) => {
  try {
    await Coupon.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
});

// ─── Banner Request ──────────────────────────────────────────
router.post('/banners', guard, async (req, res, next) => {
  try {
    const banner = await Banner.create({
      ...req.body,
      vendor: req.user._id,
      status: 'pending',
      type: 'vendor',
    });
    res.status(201).json({ success: true, data: banner });
  } catch (err) { next(err); }
});

router.get('/banners', guard, async (req, res, next) => {
  try {
    const banners = await Banner.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

// ─── Reviews ─────────────────────────────────────────────────
router.get('/reviews', guard, async (req, res, next) => {
  try {
    const products = await Product.find({
      vendor: req.user._id,
      reviews: { $exists: true, $not: { $size: 0 } },
    }).select('name reviews rating');
    const reviews = [];
    products.forEach(p => (p.reviews || []).forEach(r =>
      reviews.push({ ...r.toObject(), productName: p.name, productId: p._id })
    ));
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

// ─── Vendor Profile ──────────────────────────────────────────
router.get('/profile', guard, async (req, res, next) => {
  try {
    const vendor = await User.findById(req.user._id).select('-password_hash');
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
});

router.put('/profile', guard, async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address', 'vendorProfile'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const vendor = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password_hash');
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
});

// ─── Notifications ───────────────────────────────────────────
router.get('/notifications', guard, async (req, res, next) => {
  try {
    const notifs = await Notification.find({
      $or: [{ targetUser: req.user._id }, { targetRole: 'vendor' }, { targetRole: 'all' }],
    }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, data: notifs });
  } catch (err) { next(err); }
});

// ─── Sales Report ────────────────────────────────────────────
router.get('/reports/sales', guard, async (req, res, next) => {
  try {
    const months = await Order.aggregate([
      { $match: { 'items.vendor': req.user._id, paymentStatus: 'paid' } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, data: months });
  } catch (err) { next(err); }
});

module.exports = router;
