const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, required: true, trim: true },
    category:    {
      type: String,
      required: true,
      enum: ['seeds', 'fertilizer', 'chemical', 'machinery', 'irrigation', 'nutrients'],
    },
    price:       { type: Number, required: true, min: 0 },
    oldPrice:    { type: Number, default: null },
    unit:        { type: String, required: true },
    description: { type: String, required: true },
    tag:         { type: String, enum: ['new', 'sale', 'best', 'bulk'], default: 'new' },
    image:       { type: String, required: true },
    rating:      { type: Number, default: 4.5, min: 0, max: 5 },
    reviews:     { type: Number, default: 0 },
    inStock:     { type: Boolean, default: true },
    stock:       { type: Number, default: 100 },
    specs: {
      spec1: String, s1k: String,
      spec2: String, s2k: String,
      spec3: String, s3k: String,
    },
    vendor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
