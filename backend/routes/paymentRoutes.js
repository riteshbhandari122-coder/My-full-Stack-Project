const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createStripeIntent,
  getStripeKey,
  verifyEsewaPayment,
  verifyKhaltiPayment,
  cashOnDelivery,
} = require('../controllers/paymentController');

router.get('/stripe/key', getStripeKey);
router.post('/stripe/intent', protect, createStripeIntent);
router.post('/esewa/verify', protect, verifyEsewaPayment); // ✅ NEW
router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.post('/cod', protect, cashOnDelivery);

module.exports = router;