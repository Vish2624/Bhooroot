// ============================================================
// routes/auth.js — Register & Login
// ============================================================

const express  = require('express');
const jwt      = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { registerValidators, loginValidators } = require('../utils/validators');

// Inline User model reference (import from models file in real use)
// const { User } = require('../models/Order');

const authRouter = express.Router();

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// POST /api/auth/register
authRouter.post('/register', registerValidators, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    // const { name, email, phone, password } = req.body;
    // const existing = await User.findOne({ email });
    // if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    // const user = await User.create({ name, email, phone, password });
    // res.status(201).json({ success: true, token: generateToken(user._id), user: { id: user._id, name, email } });

    // ── Demo response (remove when DB is connected) ──
    res.status(201).json({
      success: true,
      message: 'Registration successful (demo mode)',
      token: generateToken('demo_user_id'),
      user: { name: req.body.name, email: req.body.email },
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
  try {
    // const { email, password } = req.body;
    // const user = await User.findOne({ email }).select('+password');
    // if (!user || !(await user.matchPassword(password))) {
    //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
    // }
    // res.json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email } });

    // ── Demo response ──
    res.json({
      success: true,
      message: 'Login successful (demo mode)',
      token: generateToken('demo_user_id'),
      user: { name: 'Demo User', email: req.body.email },
    });
  } catch (err) {
      next(err);
    }
  }
);

module.exports = authRouter;
