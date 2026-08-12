const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createStripeIntent,
  getStripeKey,
  initiateEsewaPayment,
  verifyEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  cashOnDelivery,
} = require('../controllers/paymentController');

// Stripe
router.get('/stripe/key', getStripeKey);
router.post('/stripe/intent', protect, createStripeIntent);

// eSewa Sandbox
router.post('/esewa/initiate', protect, initiateEsewaPayment);
router.post('/esewa/verify', protect, verifyEsewaPayment);

// Khalti Sandbox
router.post('/khalti/initiate', protect, initiateKhaltiPayment);
router.post('/khalti/verify', protect, verifyKhaltiPayment);

// Cash on Delivery
router.post('/cod', protect, cashOnDelivery);

module.exports = router;