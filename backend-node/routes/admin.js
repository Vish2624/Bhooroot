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
const Category  = require('../models/Category');
const Order     = require('../models/Order');
const Banner    = require('../models/Banner');
const Coupon    = require('../models/Coupon');
const SupportTicket = require('../models/SupportTicket');
const Notification  = require('../models/Notification');
const CmsSection    = require('../models/CmsSection');

const router = express.Router();
const guard  = [protect, authorize('admin')];

const dbReady = () => mongoose.connection.readyState === 1;

// Database connection check middleware (returns 503 for fallback to demo data)
router.use((req, res, next) => {
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: 'Database not connected (Demo Mode)' });
  }
  next();
});

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

// ─── Product Management (full CRUD) ──────────────────────────
router.get('/products', guard, async (req, res, next) => {
  try {
    const { search, category, status, featured, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (search)   filter.$or = [{ name: { $regex: search, $options: 'i' } }, { brand: { $regex: search, $options: 'i' } }];
    if (category) filter.category = category;
    if (status)   filter.status = status;
    if (featured === 'true') filter.featured = true;
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, total, page: +page });
  } catch (err) { next(err); }
});

router.post('/products', guard, async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      approvalStatus: 'approved',  // admin-created products are immediately approved
      status: req.body.status || 'active',
    });
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (err) { next(err); }
});

router.put('/products/:id', guard, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (err) { next(err); }
});

router.delete('/products/:id', guard, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
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
    if (status) filter.orderStatus = status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 })
        .skip((page-1)*limit).limit(+limit),
      Order.countDocuments(filter),
    ]);
    // normalise field name for the frontend
    const data = orders.map(o => ({ ...o.toObject(), status: o.orderStatus }));
    res.json({ success: true, data, total, page: +page });
  } catch (err) { next(err); }
});

router.put('/orders/:id/status', guard, async (req, res, next) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { orderStatus: status });
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
    const products = await Product.find({ reviews: { $exists: true, $not: { $size: 0 } } })
      .select('name reviews rating').limit(50);
    const all = [];
    products.forEach(p => (p.reviews || []).forEach(r =>
      all.push({ ...r.toObject(), productName: p.name, productId: p._id })
    ));
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

// ─── Category Management ─────────────────────────────────────
router.get('/categories', guard, async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

router.post('/categories', guard, async (req, res, next) => {
  try {
    const { name, description, icon, image, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cat = await Category.create({ name, slug, description, icon, image, displayOrder });
    res.status(201).json({ success: true, data: cat, message: 'Category created' });
  } catch (err) { next(err); }
});

router.put('/categories/:id', guard, async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat, message: 'Category updated' });
  } catch (err) { next(err); }
});

router.delete('/categories/:id', guard, async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
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
