// Role-based authorization middleware
// Usage: protect, authorize('admin') or protect, authorize('admin','vendor')
const User = require('../models/User');

const authorize = (...roles) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  // role is attached by protect middleware via JWT payload
  const role = req.user.role;
  if (!roles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied — requires role: ${roles.join(' or ')}`,
    });
  }
  next();
};

module.exports = authorize;
