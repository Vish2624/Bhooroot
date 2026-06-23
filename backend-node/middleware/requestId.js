// ============================================================
// middleware/requestId.js — Request ID Tracking Middleware
// ============================================================

const { v4: uuidv4 } = require('uuid');

const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = req.headers['x-request-id'] || uuidv4();
  
  // Add to response headers
  res.setHeader('x-request-id', req.id);
  
  // Log request with ID (for debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${req.id}] ${req.method} ${req.path}`);
  }
  
  next();
};

module.exports = requestIdMiddleware;
