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
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, default: null },
    isGoogleUser: { type: Boolean, default: false },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    
    // 🌱 Referral System Fields
    referralCode: { type: String, unique: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // 🌱 Green Points & Progress-tracked Challenges
    greenPoints: { type: Number, default: 0 }, 
    hasReceivedLoginBonus: { type: Boolean, default: false },
    monthlyChallenges: {
      type: [
        {
          challengeKey: { type: String, required: true },
          title: { type: String, required: true },
          points: { type: Number, required: true },
          currentCount: { type: Number, default: 0 },
          targetCount: { type: Number, required: true },
          isCompleted: { type: Boolean, default: false },
        },
      ],
      default: function () {
        return [
          { challengeKey: 'BUY_ECO', title: 'Buy 5 eco-friendly products', points: 150, currentCount: 0, targetCount: 5, isCompleted: false },
          { challengeKey: 'RETURN_PACKAGE', title: 'Return 2 packages for recycling', points: 100, currentCount: 0, targetCount: 2, isCompleted: false },
          { challengeKey: 'REFER_FRIEND', title: 'Refer a friend to EcoMart', points: 200, currentCount: 0, targetCount: 1, isCompleted: false },
        ];
      },
    },
  },
  { timestamps: true }
);

// ✅ Strictly auto-generate a unique referral code if missing
userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    let isUnique = false;
    let code = '';
    while (!isUnique) {
      code = 'ECO-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const existingUser = await mongoose.models.User.findOne({ referralCode: code });
      if (!existingUser) {
        isUnique = true;
      }
    }
    this.referralCode = code;
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next(); 
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);