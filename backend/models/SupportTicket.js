const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: String, required: true },
  role:      { type: String, enum: ['customer', 'vendor', 'admin', 'support'], default: 'customer' },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  ticketId:    { type: String, unique: true },
  subject:     { type: String, required: true },
  category:    { type: String, enum: ['order', 'payment', 'product', 'account', 'shipping', 'other'], default: 'other' },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status:      { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submitterRole:{ type: String, enum: ['customer', 'vendor'], default: 'customer' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  messages:    [messageSchema],
}, { timestamps: true });

ticketSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId = 'TKT-' + Date.now().toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model('SupportTicket', ticketSchema);
