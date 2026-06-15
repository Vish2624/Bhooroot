const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name:    { type: String, default: 'Customer' },
  rating:  { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String, default: '' },
  date:    { type: Date, default: Date.now },
});

const variantSchema = new mongoose.Schema({
  label:  { type: String },
  price:  { type: Number },
  stock:  { type: Number, default: 0 },
  sku:    { type: String },
});

const productSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    brand:            { type: String, default: '', trim: true },
    category:         { type: String, required: true },
    price:            { type: Number, required: true, min: 0 },
    oldPrice:         { type: Number, default: null },
    unit:             { type: String, default: 'piece' },
    description:      { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    tag:              { type: String, enum: ['new', 'sale', 'best', 'bulk'], default: 'new' },
    image:            { type: String, default: '' },
    gallery:          [{ type: String }],
    videoUrl:         { type: String, default: '' },
    rating:           { type: Number, default: 4.5, min: 0, max: 5 },
    reviews:          [reviewSchema],
    inStock:          { type: Boolean, default: true },
    stock:            { type: Number, default: 0 },
    sku:              { type: String, default: '' },
    hsnCode:          { type: String, default: '' },
    minOrderQty:      { type: Number, default: 1 },
    weight:           { type: Number, default: 0 },
    tags:             [{ type: String }],
    variants:         [variantSchema],

    approvalStatus: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    rejectionReason: { type: String, default: '' },

    specs: {
      spec1: String, s1k: String,
      spec2: String, s2k: String,
      spec3: String, s3k: String,
    },

    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
