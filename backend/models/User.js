const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'Nepal' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    recentlyViewed: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    searchHistory: [
      {
        query: String,
        searchedAt: { type: Date, default: Date.now },
      },
    ],
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyEmailToken: String,
    verifyEmailExpire: Date,
    lastLogin: Date,
    preferences: {
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'NPR' },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Reset Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// Generate Email Verify Token
userSchema.methods.getVerifyEmailToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.verifyEmailToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.verifyEmailExpire = Date.now() + 24 * 60 * 60 * 1000;
  return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
