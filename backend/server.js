const dns      = require('dns');
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

// Route imports
const productRoutes = require('./routes/products');
const vendorRoutes  = require('./routes/vendors');
const orderRoutes   = require('./routes/orders');
const authRoutes    = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

// Error handler
const errorHandler = require('./middleware/errorHandler');

// ─── App Setup ────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── API Routes ───────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/vendors',  vendorRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/payment',  paymentRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: 'FarmBasket API is running',
    time:    new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ───────────────────
const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀  FarmBasket API running  → http://localhost:${PORT}`);
    console.log(`📡  Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗  Health check → http://localhost:${PORT}/api/health`);
  });
};

const mongoUri = process.env.MONGO_URI || '';
const isPlaceholder = !mongoUri || mongoUri.includes('YOUR_USER') || mongoUri.includes('YOUR_PASSWORD');

if (isPlaceholder) {
  console.warn('⚠️   MONGO_URI not configured — running in demo mode (no database)');
  startServer();
} else {
  mongoose
    .connect(mongoUri)
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
