// ============================================================
// routes/admin.js — Super Admin API
// All routes require: protect + authorize('admin')
// ============================================================

const express   = require('express');
const mongoose  = require('mongoose');
const protect   = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const User      = require('../models/User');
const Product   = require('../models/Product');
const Order     = require('../models/Order');
const Banner    = require('../models/Banner');
const Coupon    = require('../models/Coupon');
const SupportTicket = require('../models/SupportTicket');
const Notification  = require('../models/Notification');
const CmsSection    = require('../models/CmsSection');

const router = express.Router();
const guard  = [protect, authorize('admin')];

// ─── Dashboard Stats ─────────────────────────────────────────
router.get('/stats', guard, async (req, res, next) => {
  try {
    const [
      totalCustomers, totalVendors, pendingVendors,
      totalProducts, pendingProducts,
      totalOrders, openTickets,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'vendor', isVerified: false }),
      Product.countDocuments(),
      Product.countDocuments({ approvalStatus: 'submitted' }),
      Order.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });

    res.json({
      success: true,
      data: {
        totalCustomers, totalVendors, pendingVendors,
        totalProducts, pendingProducts,
        totalOrders, todayOrders,
        totalRevenue, openTickets,
      },
    });
  } catch (err) { next(err); }
});

// ─── Vendor Management ────────────────────────────────────────
router.get('/vendors', guard, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'vendor' };
    if (status === 'pending')  filter.isVerified = false;
    if (status === 'approved') filter.isVerified = true;
    if (status === 'suspended') filter.isSuspended = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [vendors, total] = await Promise.all([
      User.find(filter).select('-password_hash')
        .skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: vendors, total, page: +page });
  } catch (err) { next(err); }
});

router.post('/vendors', guard, async (req, res, next) => {
  try {
    const { name, email, phone, password, businessName, gstNumber } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const vendor = await User.create({
      name, email, phone,
      password_hash: password,
      role: 'vendor',
      isVerified: true,
      vendorProfile: { businessName: businessName || name, gstNumber: gstNumber || '' },
    });
    res.status(201).json({ success: true, message: 'Vendor created', data: { id: vendor._id, name, email, role: 'vendor' } });
  } catch (err) { next(err); }
});

router.put('/vendors/:id/approve', guard, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true, isSuspended: false });
    res.json({ success: true, message: 'Vendor approved' });
  } catch (err) { next(err); }
});

router.put('/vendors/:id/suspend', guard, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isSuspended: true });
    res.json({ success: true, message: 'Vendor suspended' });
  } catch (err) { next(err); }
});

router.delete('/vendors/:id', guard, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) { next(err); }
});

// ─── Product Approval ─────────────────────────────────────────
router.get('/products/pending', guard, async (req, res, next) => {
  try {
    const products = await Product.find({ approvalStatus: { $in: ['submitted', 'under_review'] } })
      .populate('vendor', 'name email vendorProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
});

router.put('/products/:id/approve', guard, async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { approvalStatus: 'approved', inStock: true });
    res.json({ success: true, message: 'Product approved' });
  } catch (err) { next(err); }
});

router.put('/products/:id/reject', guard, async (req, res, next) => {
  try {
    const { reason } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { approvalStatus: 'rejected', rejectionReason: reason });
    res.json({ success: true, message: 'Product rejected' });
  } catch (err) { next(err); }
});

// ─── Customer Management ─────────────────────────────────────
router.get('/customers', guard, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const [customers, total] = await Promise.all([
      User.find(filter).select('-password_hash').skip((page-1)*limit).limit(+limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: customers, total, page: +page });
  } catch (err) { next(err); }
});

router.put('/customers/:id/block', guard, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isSuspended: true });
    res.json({ success: true, message: 'Customer blocked' });
  } catch (err) { next(err); }
});

// ─── Order Management ────────────────────────────────────────
router.get('/orders', guard, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 })
        .skip((page-1)*limit).limit(+limit),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, total, page: +page });
  } catch (err) { next(err); }
});

router.put('/orders/:id/status', guard, async (req, res, next) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) { next(err); }
});

// ─── Banner Management ───────────────────────────────────────
router.get('/banners', guard, async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

router.post('/banners', guard, async (req, res, next) => {
  try {
    const banner = await Banner.create({ ...req.body, status: 'active' });
    res.status(201).json({ success: true, data: banner });
  } catch (err) { next(err); }
});

router.put('/banners/:id', guard, async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: banner });
  } catch (err) { next(err); }
});

router.put('/banners/:id/approve', guard, async (req, res, next) => {
  try {
    await Banner.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ success: true, message: 'Banner approved' });
  } catch (err) { next(err); }
});

router.delete('/banners/:id', guard, async (req, res, next) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) { next(err); }
});

// ─── CMS Sections ────────────────────────────────────────────
router.get('/cms', guard, async (req, res, next) => {
  try {
    const sections = await CmsSection.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: sections });
  } catch (err) { next(err); }
});

router.put('/cms/:sectionKey', guard, async (req, res, next) => {
  try {
    const section = await CmsSection.findOneAndUpdate(
      { sectionKey: req.params.sectionKey },
      { ...req.body, lastEditedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: section });
  } catch (err) { next(err); }
});

// ─── Reviews ────────────────────────────────────────────────
router.get('/reviews', guard, async (req, res, next) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('name reviews').limit(50);
    const all = [];
    products.forEach(p => p.reviews.forEach(r => all.push({ ...r.toObject(), productName: p.name, productId: p._id })));
    res.json({ success: true, data: all });
  } catch (err) { next(err); }
});

// ─── Support Tickets ─────────────────────────────────────────
router.get('/tickets', guard, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit),
      SupportTicket.countDocuments(filter),
    ]);
    res.json({ success: true, data: tickets, total });
  } catch (err) { next(err); }
});

router.put('/tickets/:id/status', guard, async (req, res, next) => {
  try {
    const { status } = req.body;
    await SupportTicket.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: 'Ticket updated' });
  } catch (err) { next(err); }
});

// ─── Notifications ───────────────────────────────────────────
router.post('/notifications', guard, async (req, res, next) => {
  try {
    const notif = await Notification.create({ ...req.body, sentBy: req.user._id });
    res.status(201).json({ success: true, data: notif });
  } catch (err) { next(err); }
});

router.get('/notifications', guard, async (req, res, next) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifs });
  } catch (err) { next(err); }
});

// ─── Sales Analytics ─────────────────────────────────────────
router.get('/analytics/sales', guard, async (req, res, next) => {
  try {
    const months = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
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
