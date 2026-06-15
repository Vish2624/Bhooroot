// ============================================================
// middleware/auth.js — JWT Authentication Middleware
// Decodes role from JWT payload (role is embedded at sign time)
// ============================================================

const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    // role and _id are both embedded in the JWT payload
    req.user = { _id: decoded.id, role: decoded.role || 'customer' };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorised — token is invalid or expired' });
  }
};

module.exports = protect;
