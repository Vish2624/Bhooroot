const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:           { type: String, required: true, unique: true, uppercase: true },
  discountType:   { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue:  { type: Number, required: true },
  minPurchase:    { type: Number, default: 0 },
  maxDiscount:    { type: Number, default: null },
  usageLimit:     { type: Number, default: null },
  usedCount:      { type: Number, default: 0 },
  expiryDate:     { type: Date },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status:         { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  vendor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  description:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
