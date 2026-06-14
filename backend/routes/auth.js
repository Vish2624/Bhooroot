// ============================================================
// routes/auth.js — Register & Login
// ============================================================

const express  = require('express');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const User     = require('../models/User');
const { registerValidators, loginValidators } = require('../utils/validators');

const authRouter = express.Router();

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', { 
    expiresIn: process.env.JWT_EXPIRE || '30d' 
  });

// POST /api/auth/register
authRouter.post('/register', registerValidators, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database not connected. Please try again later.' });
  }

  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role
      },
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

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database not connected. Please try again later.' });
  }

  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = authRouter;
