const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:    { type: String, default: '' },

  // WhatsApp redirect — the number users are sent to when they apply this coupon
  whatsappNumber: { type: String, required: true }, // format: 91XXXXXXXXXX

  // Bulk-order thresholds — coupon is rejected client-side if neither is met
  bulkMinQty:    { type: Number, default: 10 },   // minimum total items in cart
  bulkMinAmount: { type: Number, default: 5000 },  // minimum cart value in ₹

  // Usage limits
  usageLimit:  { type: Number, default: null },
  usedCount:   { type: Number, default: 0 },

  // Validity window
  startDate:   { type: Date, default: Date.now },
  expiryDate:  { type: Date },

  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },

  // Optional scope restrictions
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

couponSchema.index({ status: 1, expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
