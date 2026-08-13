const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode, notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate stock and build order items
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product "${item.product?.name}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}"`);
    }

    // Find color-specific image
    const colorImage = item.color
      ? product.images?.find(img =>
          img.color?.toLowerCase() === item.color?.toLowerCase()
        )?.url
      : null;

    // ✅ Ensure product name is saved explicitly in the database item object
    orderItems.push({
      product: product._id,
      name: product.name,
      image: colorImage || product.images[0]?.url || '',
      price: item.price,
      quantity: item.quantity,
      color: item.color || '',
      size: item.size || '',
    });

    itemsPrice += item.price * item.quantity;
  }

  // Calculate prices
  const shippingPrice = itemsPrice > 2000 ? 0 : 100;
  const taxPrice = Math.round(itemsPrice * 0.13);
  let discountAmount = 0;

  if (couponCode || cart.couponCode) {
    const code = couponCode || cart.couponCode;
    const coupon = await Coupon.findOne({ code });
    if (coupon) {
      const validity = coupon.isValid(req.user._id, itemsPrice);
      if (validity.valid) {
        discountAmount = coupon.calculateDiscount(itemsPrice);
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice,
    couponCode: couponCode || cart.couponCode || '',
    notes,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    trackingHistory: [
      {
        status: 'placed',
        message: 'Your order has been placed successfully',
        timestamp: new Date(),
      },
    ],
  });

  // Send response IMMEDIATELY
  res.status(201).json({ success: true, order });

  // Post-response background tasks
  try {
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { orderHistory: order._id },
    });

    if (paymentMethod === 'cod') {
      cart.items = [];
      cart.couponCode = '';
      cart.discountAmount = 0;
      await cart.save();
    }

    await Notification.create({
      user: req.user._id,
      title: 'Order Placed!',
      message: `Your order #${order.orderNumber} has been placed successfully`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(String(req.user._id)).emit('orderUpdate', {
        orderId: order._id,
        status: 'placed',
        message: 'Order placed successfully',
      });
    }

    try {
      const ecoCount = cart.items.reduce(
        (acc, item) => (item.product?.isEcoFriendly ? acc + item.quantity : acc),
        0
      );

      if (ecoCount > 0) {
        const user = await User.findById(req.user._id);
        if (user) {
          const buyEcoChallenge = user.monthlyChallenges?.find(
            (c) => c.challengeKey === 'BUY_ECO'
          );

          if (buyEcoChallenge && !buyEcoChallenge.isCompleted) {
            buyEcoChallenge.currentCount = (buyEcoChallenge.currentCount || 0) + ecoCount;

            if (buyEcoChallenge.currentCount >= buyEcoChallenge.targetCount) {
              buyEcoChallenge.isCompleted = true;
              user.greenPoints = (user.greenPoints || 0) + buyEcoChallenge.points;
            }

            await user.save({ validateBeforeSave: false });

            if (io) {
              io.to(String(req.user._id)).emit('greenPointsUpdate', {
                greenPoints: user.greenPoints,
                monthlyChallenges: user.monthlyChallenges,
                message: buyEcoChallenge.isCompleted
                  ? `🎉 Challenge completed! +${buyEcoChallenge.points} green points!`
                  : `🌱 ${ecoCount} eco-friendly item(s) tracked!`,
              });
            }
          }
        }
      }
    } catch (greenErr) {
      console.log('Green points tracking failed:', greenErr.message);
    }

    // Send email with populated order data
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(order),
    });
  } catch (err) {
    console.log('Post-order tasks failed:', err.message);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (String(order.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    updateTime: req.body.update_time,
    emailAddress: req.body.payer?.email_address,
  };
  order.status = 'confirmed';
  order.trackingHistory.push({
    status: 'confirmed',
    message: 'Payment confirmed. Your order is being processed',
    timestamp: new Date(),
  });

  const updatedOrder = await order.save();

  const io = req.app.get('io');
  if (io) {
    io.to(String(order.user)).emit('orderUpdate', {
      orderId: order._id,
      status: 'confirmed',
      message: 'Payment confirmed',
    });
  }

  res.json({ success: true, order: updatedOrder });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
    res.status(400);
    throw new Error('Cannot cancel order that has been shipped');
  }

  order.status = 'cancelled';
  order.cancelledAt = Date.now();
  order.cancelReason = req.body.reason || 'Cancelled by user';
  order.trackingHistory.push({
    status: 'cancelled',
    message: req.body.reason || 'Order cancelled by customer',
    timestamp: new Date(),
  });

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  await order.save();
  res.json({ success: true, order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, location } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  order.trackingHistory.push({
    status,
    message: message || `Order status updated to ${status}`,
    timestamp: new Date(),
    location: location || '',
  });

  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.json({ success: true, order });

  try {
    const io = req.app.get('io');
    if (io) {
      io.to(String(order.user)).emit('orderUpdate', {
        orderId: order._id,
        status,
        message: message || `Order status: ${status}`,
      });
      io.to(`order_${order._id}`).emit('trackingUpdate', {
        status,
        message,
        timestamp: new Date(),
        location,
      });
    }

    await Notification.create({
      user: order.user,
      title: 'Order Update',
      message: message || `Your order #${order.orderNumber} is now ${status.replace('_', ' ')}`,
      type: 'delivery',
      link: `/orders/${order._id}`,
    });
  } catch (err) {
    console.log('Post-status update failed:', err.message);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) {
    query.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
};