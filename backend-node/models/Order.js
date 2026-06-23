const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  unit:     { type: String },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    shippingAddress: {
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },

    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount:     { type: Number, default: 0 },
    totalAmount:  { type: Number, required: true },

    promoCode: { type: String, default: '' },

    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    trackingId:       { type: String, default: '' },
    estimatedDelivery: { type: String, default: '3–7 business days' },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
