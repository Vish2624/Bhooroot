const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    logo:       { type: String },
    banner:     { type: String },
    location:   { type: String, required: true },
    category:   {
      type: String,
      enum: ['seeds', 'fertilizer', 'chemical', 'machinery', 'irrigation', 'nutrients'],
    },
    tags:       [{ type: String }],
    description:{ type: String },
    products:   { type: Number, default: 0 },
    rating:     { type: Number, default: 4.5 },
    yearsActive:{ type: Number, default: 1 },
    verified:   { type: Boolean, default: false },
    email:      { type: String },
    phone:      { type: String },
    website:    { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
