const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, required: true },
    password_hash: { type: String, required: true, minlength: 6, select: false },
    role:     { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },

    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      pincode: { type: String, default: '' },
    },

    isVerified:  { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    wishlist:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Vendor-specific profile (populated only when role === 'vendor')
    vendorProfile: {
      businessName:  { type: String, default: '' },
      ownerName:     { type: String, default: '' },
      gstNumber:     { type: String, default: '' },
      panNumber:     { type: String, default: '' },
      storeLogo:     { type: String, default: '' },
      storeBanner:   { type: String, default: '' },
      storeDescription: { type: String, default: '' },
      pickupAddress: { type: String, default: '' },
      returnAddress: { type: String, default: '' },
      bankName:      { type: String, default: '' },
      bankAccount:   { type: String, default: '' },
      ifscCode:      { type: String, default: '' },
      // Documents
      gstCertificate:   { type: String, default: '' },
      panCopy:          { type: String, default: '' },
      cancelledCheque:  { type: String, default: '' },
      idProof:          { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Compare plain password to hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
