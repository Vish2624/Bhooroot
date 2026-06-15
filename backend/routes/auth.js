// ============================================================
// routes/auth.js — Register & Login
// Logs events to Google Sheets when configured
// ============================================================

const express  = require('express');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const User     = require('../models/User');
const { registerValidators, loginValidators } = require('../utils/validators');
const { logLogin, logRegistration } = require('../config/googleSheets');

const authRouter = express.Router();

// Generate JWT — embeds role so middleware can authorize without a DB round-trip
const generateToken = (id, role = 'customer') =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// ─── Demo Mode Accounts ──────────────────────────────────────
// When DB is unavailable these hardcoded credentials allow testing portals
const DEMO_ACCOUNTS = [
  { email: 'admin@uhazvumart.com',  password: 'admin123',  role: 'admin',  name: 'Super Admin',  id: 'demo_admin_id' },
  { email: 'vendor@uhazvumart.com', password: 'vendor123', role: 'vendor', name: 'Demo Vendor',  id: 'demo_vendor_id' },
  { email: 'demo@uhazvumart.com',   password: 'demo123',   role: 'customer', name: 'Demo User', id: 'demo_user_id' },
];

// POST /api/auth/register
authRouter.post('/register', registerValidators, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  if (mongoose.connection.readyState !== 1) {
    await logLogin(req.body.email, 'customer', 'demo_register', req.ip);
    return res.status(200).json({
      success: true,
      message: 'Registration successful (Demo Mode)',
      token: generateToken('demo_user_id', 'customer'),
      user: { id: 'demo_id', name: req.body.name || 'Demo User', email: req.body.email, phone: req.body.phone || '', role: 'customer' },
    });
  }

  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password_hash: password });
    await logRegistration(name, email, phone, 'customer');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id, user.role),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', loginValidators, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    // Check demo accounts
    const demo = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (demo) {
      await logLogin(email, demo.role, 'demo_success', req.ip);
      return res.status(200).json({
        success: true,
        message: 'Login successful (Demo Mode)',
        token: generateToken(demo.id, demo.role),
        user: { id: demo.id, name: demo.name, email: demo.email, phone: '', role: demo.role },
      });
    }
    // Generic demo fallback
    await logLogin(email, 'customer', 'demo_fallback', req.ip);
    return res.status(200).json({
      success: true,
      message: 'Login successful (Demo Mode)',
      token: generateToken('demo_user_id', 'customer'),
      user: { id: 'demo_id', name: 'Demo User', email, phone: '', role: 'customer' },
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password_hash');

    if (!user || !(await user.matchPassword(password))) {
      await logLogin(email, 'unknown', 'failed', req.ip);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    await logLogin(email, user.role, 'success', req.ip);

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id, user.role),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/me — get current user info from token
authRouter.get('/me', require('../middleware/auth'), async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: req.user });
    }
    const user = await require('../models/User').findById(req.user._id).select('-password_hash');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

module.exports = authRouter;
