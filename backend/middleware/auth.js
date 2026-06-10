// ============================================================
// middleware/auth.js — JWT Authentication Middleware
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request
    // req.user = await User.findById(decoded.id).select('-password');
    req.user = { _id: decoded.id };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorised — token is invalid or expired' });
  }
};

module.exports = protect;
