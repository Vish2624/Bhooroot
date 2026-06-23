const mongoose = require('mongoose');

const cmsSectionSchema = new mongoose.Schema({
  sectionKey:   { type: String, required: true, unique: true },
  title:        { type: String, default: '' },
  subtitle:     { type: String, default: '' },
  description:  { type: String, default: '' },
  buttonText:   { type: String, default: '' },
  buttonUrl:    { type: String, default: '' },
  image:        { type: String, default: '' },
  isVisible:    { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  items:        { type: mongoose.Schema.Types.Mixed, default: [] },
  metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('CmsSection', cmsSectionSchema);
