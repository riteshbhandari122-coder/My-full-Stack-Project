const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Review.countDocuments({ product: req.params.productId, isApproved: true });
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), reviews, distribution });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, images } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  // Check if verified purchase
  const order = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: 'delivered',
  });

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase: !!order,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (String(review.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  const { rating, title, comment } = req.body;
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;

  await review.save();
  res.json({ success: true, review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const alreadyHelpful = review.helpful.includes(req.user._id);
  if (alreadyHelpful) {
    review.helpful.pull(req.user._id);
  } else {
    review.helpful.push(req.user._id);
    review.notHelpful.pull(req.user._id);
  }

  await review.save();
  res.json({ success: true, helpful: review.helpful.length });
});

module.exports = { getProductReviews, createReview, updateReview, deleteReview, markHelpful };
