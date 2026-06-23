const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    { type: String, default: '' },
  buttonText:  { type: String, default: '' },
  buttonUrl:   { type: String, default: '' },
  imageDesktop:{ type: String, default: '' },
  imageMobile: { type: String, default: '' },
  type:        { type: String, enum: ['hero', 'promotional', 'sidebar', 'festival', 'vendor'], default: 'hero' },
  status:      { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'inactive'], default: 'pending' },
  displayOrder:{ type: Number, default: 0 },
  startDate:   { type: Date },
  endDate:     { type: Date },
  vendor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  submittedBy: { type: String, default: '' },
  campaign:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
