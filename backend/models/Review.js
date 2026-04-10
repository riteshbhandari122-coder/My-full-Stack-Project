const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isApproved: { type: Boolean, default: true },
    reply: {
      comment: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product ratings after review save
reviewSchema.post('save', async function () {
  await updateProductRatings(this.product);
});

reviewSchema.post('remove', async function () {
  await updateProductRatings(this.product);
});

async function updateProductRatings(productId) {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { ratings: 0, numReviews: 0 });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
