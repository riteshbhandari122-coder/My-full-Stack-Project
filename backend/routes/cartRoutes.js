const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);

module.exports = router;
