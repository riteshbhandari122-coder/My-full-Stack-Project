const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/generateToken');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, referralCodeInput } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  let referrer = null;
  if (referralCodeInput && referralCodeInput.trim() !== '') {
    referrer = await User.findOne({ referralCode: referralCodeInput.trim().toUpperCase() });
    if (!referrer) {
      res.status(400);
      throw new Error('Invalid referral code provided.');
    }
  }

  const user = await User.create({ 
    name, 
    email, 
    password, 
    phone,
    referredBy: referrer ? referrer._id : null
  });

  user.greenPoints = 100;
  user.hasReceivedLoginBonus = true;
  await user.save({ validateBeforeSave: false });

  if (referrer) {
    referrer.greenPoints = (referrer.greenPoints || 0) + 150;
    await referrer.save({ validateBeforeSave: false });
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      greenPoints: user.greenPoints,
      referralCode: user.referralCode, // ✅ Returned properly
      monthlyChallenges: user.monthlyChallenges || [],
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account deactivated.');
  }

  if (!user.hasReceivedLoginBonus) {
    user.greenPoints = (user.greenPoints || 0) + 100;
    user.hasReceivedLoginBonus = true;
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      greenPoints: user.greenPoints || 0,
      referralCode: user.referralCode, // ✅ Returned properly
      monthlyChallenges: user.monthlyChallenges || [],
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name images price discountedPrice ratings');
  res.json({ success: true, user });
});

module.exports = { register, login, getMe, logout: (req,res)=>res.json({success:true}) };