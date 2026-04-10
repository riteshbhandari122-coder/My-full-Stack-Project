const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createStripeIntent,
  verifyKhaltiPayment,
  cashOnDelivery,
  getStripeKey,
} = require('../controllers/paymentController');

router.get('/stripe/key', getStripeKey);
router.post('/stripe/intent', protect, createStripeIntent);
router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.post('/cod', protect, cashOnDelivery);

module.exports = router;
