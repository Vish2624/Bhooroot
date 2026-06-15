const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['order', 'product', 'payment', 'stock', 'admin', 'system'], default: 'system' },
  targetRole:{ type: String, enum: ['all', 'customer', 'vendor', 'admin'], default: 'all' },
  targetUser:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isRead:    { type: Boolean, default: false },
  channel:   { type: String, enum: ['in_app', 'email', 'sms', 'push'], default: 'in_app' },
  sentBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  link:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
