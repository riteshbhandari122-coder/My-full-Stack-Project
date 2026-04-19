const asyncHandler = require('express-async-handler');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Order = require('../models/Order');

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/intent
// @access  Private
const createStripeIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { userId: String(req.user._id) },
  });
  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

// @desc    Get Stripe publishable key
// @route   GET /api/payment/stripe/key
// @access  Public
const getStripeKey = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  });
});

// @desc    Verify eSewa payment after redirect
// @route   POST /api/payment/esewa/verify
// @access  Private
const verifyEsewaPayment = asyncHandler(async (req, res) => {
  const { oid, amt, refId } = req.body;
  // oid = order ID, amt = amount, refId = eSewa reference ID

  if (!oid || !amt || !refId) {
    res.status(400);
    throw new Error('Missing eSewa payment details');
  }

  const merchantId = process.env.ESEWA_MERCHANT_ID;
  if (!merchantId) {
    res.status(500);
    throw new Error('eSewa merchant ID not configured on server');
  }

  try {
    // Verify with eSewa live API
    const verifyUrl = `https://esewa.com.np/epay/transrec`;
    const response = await axios.get(verifyUrl, {
      params: {
        amt,
        scd: merchantId,
        rid: refId,
        pid: oid,
      },
    });

    // eSewa returns XML — check for Success
    if (!response.data.includes('<response_code>Success</response_code>')) {
      res.status(400);
      throw new Error('eSewa payment verification failed');
    }

    // Update order
    const order = await Order.findById(oid);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: refId,
      status: 'completed',
      updateTime: new Date().toISOString(),
      paymentMethod: 'esewa',
    };
    order.status = 'confirmed';
    order.trackingHistory.push({
      status: 'confirmed',
      message: 'Payment verified via eSewa',
      timestamp: new Date(),
    });

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error('eSewa verification error:', error.message);
    res.status(400);
    throw new Error('eSewa payment verification failed: ' + error.message);
  }
});

// @desc    Verify Khalti payment
// @route   POST /api/payment/khalti/verify
// @access  Private
const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { token, amount, orderId } = req.body;
  try {
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      { token, amount },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const order = await Order.findById(orderId);
    if (!order) { res.status(404); throw new Error('Order not found'); }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: response.data.idx,
      status: 'completed',
      updateTime: new Date().toISOString(),
    };
    order.status = 'confirmed';
    order.trackingHistory.push({
      status: 'confirmed',
      message: 'Payment verified via Khalti',
      timestamp: new Date(),
    });

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(400);
    throw new Error('Khalti payment verification failed');
  }
});

// @desc    Cash on delivery
// @route   POST /api/payment/cod
// @access  Private
const cashOnDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (String(order.user) !== String(req.user._id)) { res.status(403); throw new Error('Not authorized'); }

  order.status = 'confirmed';
  order.trackingHistory.push({
    status: 'confirmed',
    message: 'Order confirmed - Cash on Delivery',
    timestamp: new Date(),
  });
  await order.save();
  res.json({ success: true, order });
});

module.exports = {
  createStripeIntent,
  getStripeKey,
  verifyEsewaPayment,
  verifyKhaltiPayment,
  cashOnDelivery,
};