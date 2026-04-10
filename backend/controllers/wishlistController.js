const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'name images price discountedPrice discountPercentage ratings numReviews stock brand slug'
  );
  res.json({ success: true, wishlist: user.wishlist });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  if (user.wishlist.includes(req.params.productId)) {
    return res.json({ success: true, message: 'Already in wishlist', inWishlist: true });
  }

  user.wishlist.push(req.params.productId);
  await user.save();

  res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: req.params.productId },
  });

  res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
});

// @desc    Toggle wishlist
// @route   PUT /api/wishlist/:productId/toggle
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  const inWishlist = user.wishlist.includes(productId);
  if (inWishlist) {
    user.wishlist.pull(productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  res.json({ success: true, inWishlist: !inWishlist, message: inWishlist ? 'Removed from wishlist' : 'Added to wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist };
