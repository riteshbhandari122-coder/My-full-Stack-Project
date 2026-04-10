const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name images price discountedPrice stock isActive brand'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({ success: true, cart });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color = '', size = '' } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (i) => String(i.product) === String(productId) && i.color === color && i.size === size
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = Math.min(
      cart.items[itemIndex].quantity + quantity,
      product.stock
    );
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountedPrice || product.price,
      color,
      size,
    });
  }

  await cart.save();
  cart = await cart.populate('items.product', 'name images price discountedPrice stock brand');

  res.json({ success: true, cart });
});

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  const product = await Product.findById(item.product);
  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} items available`);
  }

  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name images price discountedPrice stock brand');

  res.json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items.pull(req.params.itemId);
  await cart.save();
  await cart.populate('items.product', 'name images price discountedPrice stock brand');

  res.json({ success: true, cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = '';
    cart.discountAmount = 0;
    await cart.save();
  }
  res.json({ success: true, message: 'Cart cleared' });
});

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const validity = coupon.isValid(req.user._id, subtotal);

  if (!validity.valid) {
    res.status(400);
    throw new Error(validity.message);
  }

  const discount = coupon.calculateDiscount(subtotal);
  cart.couponCode = coupon.code;
  cart.discountAmount = discount;
  await cart.save();

  res.json({
    success: true,
    message: 'Coupon applied successfully',
    discount,
    couponCode: coupon.code,
  });
});

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.couponCode = '';
    cart.discountAmount = 0;
    await cart.save();
  }
  res.json({ success: true, message: 'Coupon removed' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon };
