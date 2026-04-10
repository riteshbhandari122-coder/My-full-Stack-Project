const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name images price discountedPrice ratings brand')
    .populate('recentlyViewed.product', 'name images price discountedPrice brand');
  res.json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, preferences } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();
  res.json({ success: true, user });
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.role) query.role = req.query.role;

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip(skip).limit(limit);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), users });
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, user });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'recentlyViewed.product',
    'name images price discountedPrice ratings brand'
  );

  const recentlyViewed = user.recentlyViewed
    .filter((rv) => rv.product)
    .slice(0, 10);

  res.json({ success: true, recentlyViewed });
});

// @desc    Get recommendations (AI-like based on purchase history & views)
// @route   GET /api/users/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('recentlyViewed.product');

  // Get categories from recently viewed
  const viewedCategories = user.recentlyViewed
    .filter((rv) => rv.product)
    .map((rv) => rv.product.category)
    .slice(0, 5);

  // Get products from similar categories
  const recommendations = await Product.find({
    category: { $in: viewedCategories },
    _id: { $nin: user.recentlyViewed.map((rv) => rv.product?._id).filter(Boolean) },
    isActive: true,
  })
    .populate('category', 'name slug')
    .sort('-ratings -sold')
    .limit(12);

  // If not enough, fill with popular products
  if (recommendations.length < 8) {
    const popular = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort('-sold -ratings')
      .limit(12 - recommendations.length);
    recommendations.push(...popular);
  }

  res.json({ success: true, products: recommendations });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getRecentlyViewed,
  getRecommendations,
};
