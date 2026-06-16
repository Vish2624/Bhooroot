const dns      = require('dns');
const path     = require('path');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const dotenv   = require('dotenv');

// Use Google DNS — routers often fail to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables
dotenv.config();

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const requestIdMiddleware = require('./middleware/requestId');
const { generalLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');

// Route imports
const productRoutes       = require('./routes/products');
const vendorRoutes        = require('./routes/vendors');
const orderRoutes         = require('./routes/orders');
const authRoutes          = require('./routes/auth');
const paymentRoutes       = require('./routes/payment');
const adminRoutes         = require('./routes/admin');
const vendorDashboardRoutes = require('./routes/vendorDashboard');
const publicRoutes        = require('./routes/public');

// Swagger
const swaggerUI  = require('swagger-ui-express');
const swaggerDoc = require('./config/swagger');

// Google Sheets
const { initSheets } = require('./config/googleSheets');

// ─── App Setup ────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'", "'unsafe-eval'",
                      'https://code.iconify.design',
                      'https://checkout.razorpay.com',
                      'https://cdn.jsdelivr.net',
                      'https://cdnjs.cloudflare.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:      ["'self'", "'unsafe-inline'",
                      'https://fonts.googleapis.com',
                      'https://cdnjs.cloudflare.com'],
      fontSrc:       ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      imgSrc:        ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc:    ["'self'",
                      'https://api.iconify.design',
                      'https://checkout.razorpay.com'],
      frameSrc:      ["'none'"],
    },
  },
}));

// CORS — allow GitHub Pages, localhost, and any configured CLIENT_URL
const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:3000',
  'https://vish2624.github.io',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, same-origin server calls)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, true); // allow all in demo mode; tighten in production if needed
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID tracking
app.use(requestIdMiddleware);

// HTTP request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Frontend ──────────────────────────────────────
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Clean URLs for Portals
app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendDir, 'admin.html'));
});

app.get('/vendor', (req, res) => {
  res.sendFile(path.join(frontendDir, 'vendor.html'));
});

// ─── API Documentation ────────────────────────────────────
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Uhazvumart API Documentation',
}));

// ─── API Routes with Rate Limiting ────────────────────────
app.use('/api/products',  generalLimiter, productRoutes);
app.use('/api/vendors',   generalLimiter, vendorRoutes);
app.use('/api/orders',    generalLimiter, orderRoutes);
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/payment',   paymentLimiter, paymentRoutes);
app.use('/api/admin',     generalLimiter, adminRoutes);
app.use('/api/vendor',    generalLimiter, vendorDashboardRoutes);
app.use('/api',           generalLimiter, publicRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: 'Uhazvumart API is running',
    time:    new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'demo',
  });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  // Serve portal files directly, fallback to index.html for SPA routes
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ───────────────────
const PORT = process.env.PORT || 5000;

const startServer = () => {
  initSheets(); // non-blocking, optional Google Sheets init
  app.listen(PORT, () => {
    console.log(`🚀  Uhazvumart API running  → http://localhost:${PORT}`);
    console.log(`📡  Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗  Health check → http://localhost:${PORT}/api/health`);
    console.log(`👤  Admin portal → http://localhost:${PORT}/admin.html`);
    console.log(`🏪  Vendor portal → http://localhost:${PORT}/vendor.html`);
  });
};

const mongoUri = process.env.MONGO_URI || '';
const isPlaceholder = !mongoUri || mongoUri.includes('YOUR_USER') || mongoUri.includes('YOUR_PASSWORD');

if (isPlaceholder) {
  console.warn('⚠️   MONGO_URI not configured — running in demo mode (no database)');
  startServer();
} else {
  console.log('🔌  Connecting to MongoDB...');
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('✅  MongoDB connected');
      startServer();
    })
    .catch((err) => {
      console.error('⚠️   MongoDB connection failed:', err.message);
      console.warn('   Continuing in demo mode without database...');
      startServer();
    });
}
