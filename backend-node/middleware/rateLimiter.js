// ============================================================
// middleware/rateLimiter.js — Rate Limiting Middleware
// All limiters return JSON so the frontend can parse errors.
// ============================================================

const rateLimit = require('express-rate-limit');

const jsonHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests — please wait a moment and try again.',
  });
};

// General API limiter (100 req/min — relaxed for portal dashboards)
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  handler: jsonHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter (20 req/15 min — enough for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: jsonHandler,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment limiter (20 req/hour)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  handler: jsonHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, paymentLimiter };
