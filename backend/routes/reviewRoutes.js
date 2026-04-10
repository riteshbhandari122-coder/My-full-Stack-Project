const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
} = require('../controllers/reviewController');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
