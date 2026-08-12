const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// ─── Helpers ────────────────────────────────────────────────────────────────
// Generate a unique paymentId (no external dependency required)
const generatePaymentId = (method) => {
  const prefix = method === 'esewa' ? 'ESW' : method === 'khalti' ? 'KLT' : 'PAY';
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}_${Date.now()}_${random}`;
};

// ─── Stripe (unchanged) ─────────────────────────────────────────────────────
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

// ─── eSewa SANDBOX (ePay v2) ─────────────────────────────────────────────────
// eSewa v2 sandbox endpoints:
//   Initiate (form POST): https://rc-epay.esewa.com.np/api/epay/main/v2/form
//   Status check:         https://rc.esewa.com.np/api/epay/transaction/status/
// Sandbox product code: EPAYTEST
// Sandbox secret key:   8gBm/:&EnhH.1/q
// NOTE: v2 requires an HMAC-SHA256 signature and returns the user via a
// POST'd HTML form, not a simple redirect URL. The frontend must render
// and auto-submit that form (see note below).

const generateEsewaSignature = (totalAmount, transactionUuid, productCode) => {
  const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
};

// @desc    Initiate eSewa sandbox payment
// @route   POST /api/payment/esewa/initiate
// @access  Private
const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, returnUrl } = req.body;

  if (!orderId || !amount) {
    res.status(400);
    throw new Error('orderId and amount are required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
  const totalAmount = Number(amount);
  // eSewa requires a UUID unique per attempt (not just per order),
  // since retries need a fresh transaction_uuid
  const transactionUuid = `${order._id}-${Date.now()}`;

  const payment = await Payment.create({
    paymentId: generatePaymentId('esewa'),
    orderId: order._id,
    userId: req.user._id,
    paymentMethod: 'esewa',
    amount: totalAmount,
    paymentStatus: 'pending',
    transactionId: transactionUuid,
  });

  const successUrl = `${returnUrl}?oid=${order._id}&paymentId=${payment.paymentId}&status=success`;
  const failureUrl = `${returnUrl}?oid=${order._id}&paymentId=${payment.paymentId}&status=failure`;

  const signature = generateEsewaSignature(totalAmount, transactionUuid, productCode);

  // v2 is a form-POST flow, not a redirect URL — send the frontend everything
  // it needs to build and auto-submit a form to eSewa
  res.json({
    success: true,
    paymentId: payment.paymentId,
    formAction: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    formData: {
      amount: String(totalAmount),
      tax_amount: '0',
      total_amount: String(totalAmount),
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    },
  });
});

// @desc    Verify eSewa sandbox payment after redirect
// @route   POST /api/payment/esewa/verify
// @access  Private
const verifyEsewaPayment = asyncHandler(async (req, res) => {
  const { oid, paymentId } = req.body;
  // oid = order ID

  if (!oid) {
    res.status(400);
    throw new Error('Missing eSewa payment details');
  }

  const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

  // Find the Payment record (transactionId holds the transaction_uuid we generated at initiate)
  const payment = paymentId
    ? await Payment.findOne({ paymentId })
    : await Payment.findOne({ orderId: oid, paymentMethod: 'esewa' }).sort({ createdAt: -1 });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  try {
    // Verify with eSewa v2 SANDBOX status API
    const statusUrl = 'https://rc.esewa.com.np/api/epay/transaction/status/';
    const response = await axios.get(statusUrl, {
      params: {
        product_code: productCode,
        total_amount: payment.amount,
        transaction_uuid: payment.transactionId,
      },
    });

    const data = response.data;
    // v2 returns { status: "COMPLETE" | "PENDING" | "FULL_REFUND" | ... , ref_id, ... }
    if (!data || data.status !== 'COMPLETE') {
      payment.paymentStatus = 'failed';
      await payment.save();
      res.status(400);
      throw new Error(`eSewa payment not completed. Status: ${data?.status}`);
    }

    const refId = data.ref_id;

    // Update Payment record
    payment.transactionId = refId || payment.transactionId;
    payment.paymentStatus = 'success';
    await payment.save();

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
      message: 'Payment verified via eSewa (Sandbox)',
      timestamp: new Date(),
    });

    await order.save();
    res.json({ success: true, order, payment });
  } catch (error) {
    console.error('eSewa verification error:', error.message);
    if (payment) {
      payment.paymentStatus = 'failed';
      await payment.save();
    }
    res.status(400);
    throw new Error('eSewa payment verification failed: ' + error.message);
  }
});

// ─── Khalti SANDBOX ──────────────────────────────────────────────────────────
// Khalti sandbox endpoints (ePayment v2):
//   Initiate: https://a.khalti.com/api/v2/epayment/initiate/
//   Lookup:   https://a.khalti.com/api/v2/epayment/lookup/
// Test secret key: test_secret_key_xxxxx (from Khalti merchant dashboard > Test)

// @desc    Initiate Khalti sandbox payment
// @route   POST /api/payment/khalti/initiate
// @access  Private
const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, returnUrl } = req.body;

  if (!orderId || !amount) {
    res.status(400);
    throw new Error('orderId and amount are required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey) {
    res.status(500);
    throw new Error('Khalti secret key not configured on server');
  }

  const totalAmount = Math.round(Number(amount) * 100); // Khalti expects paisa

  // Create a pending Payment record
  const payment = await Payment.create({
    paymentId: generatePaymentId('khalti'),
    orderId: order._id,
    userId: req.user._id,
    paymentMethod: 'khalti',
    amount: Number(amount),
    paymentStatus: 'pending',
  });

  const websiteUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  // Khalti initiate request
  const response = await axios.post(
    'https://a.khalti.com/api/v2/epayment/initiate/',
    {
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: totalAmount,
      purchase_order_id: String(order._id),
      purchase_order_name: `Order ${order.orderNumber || order._id}`,
      customer_info: {
        name: order.shippingAddress?.fullName || req.user.name || 'Customer',
        email: req.user.email || 'customer@example.com',
        phone: order.shippingAddress?.phone || '9800000000',
      },
    },
    {
      headers: {
        Authorization: `Key ${secretKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const paymentUrl = response.data?.payment_url;
  const pidx = response.data?.pidx;

  // Save pidx as transactionId reference for later lookup
  if (pidx) {
    payment.transactionId = pidx;
    await payment.save();
  }

  if (!paymentUrl) {
    res.status(400);
    throw new Error('Failed to get Khalti payment URL');
  }

  res.json({
    success: true,
    paymentUrl,
    paymentId: payment.paymentId,
    pidx,
  });
});

// @desc    Verify Khalti sandbox payment after redirect
// @route   POST /api/payment/khalti/verify
// @access  Private
const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { pidx, orderId, paymentId, transactionId } = req.body;

  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey) {
    res.status(500);
    throw new Error('Khalti secret key not configured on server');
  }

  // Find the Payment record
  const payment = paymentId
    ? await Payment.findOne({ paymentId })
    : await Payment.findOne({ orderId, paymentMethod: 'khalti' }).sort({ createdAt: -1 });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  const lookupPidx = pidx || payment.transactionId;

  if (!lookupPidx) {
    res.status(400);
    throw new Error('Missing Khalti pidx for verification');
  }

  try {
    // Verify with Khalti SANDBOX lookup API
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx: lookupPidx },
      {
        headers: {
          Authorization: `Key ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;

    // Khalti returns status: 'Completed' for successful payments
    if (data.status !== 'Completed') {
      payment.paymentStatus = data.status === 'Refunded' ? 'failed' : 'failed';
      await payment.save();
      res.status(400);
      throw new Error(`Khalti payment not completed. Status: ${data.status}`);
    }

    // Update Payment record
    payment.transactionId = transactionId || data.transaction_id || lookupPidx;
    payment.paymentStatus = 'success';
    await payment.save();

    // Update order
    const order = await Order.findById(orderId || payment.orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: data.transaction_id || lookupPidx,
      status: 'completed',
      updateTime: new Date().toISOString(),
      paymentMethod: 'khalti',
    };
    order.status = 'confirmed';
    order.trackingHistory.push({
      status: 'confirmed',
      message: 'Payment verified via Khalti (Sandbox)',
      timestamp: new Date(),
    });

    await order.save();
    res.json({ success: true, order, payment });
  } catch (error) {
    console.error('Khalti verification error:', error.message);
    if (payment) {
      payment.paymentStatus = 'failed';
      await payment.save();
    }
    res.status(400);
    throw new Error('Khalti payment verification failed: ' + (error.response?.data?.detail || error.message));
  }
});

// ─── Cash on Delivery (unchanged) ───────────────────────────────────────────
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
  initiateEsewaPayment,
  verifyEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  cashOnDelivery,
};