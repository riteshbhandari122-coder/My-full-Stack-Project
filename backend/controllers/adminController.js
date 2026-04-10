const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalCategories,
    pendingOrders,
    deliveredOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'packed'] } }),
    Order.countDocuments({ status: 'delivered' }),
  ]);

  // Revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    { $match: { status: 'delivered', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  // Total revenue
  const totalRevenue = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  // Revenue last 7 days
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: last7Days } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find({ isActive: true })
    .sort('-sold')
    .limit(5)
    .select('name sold images price discountedPrice ratings');

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(10);

  // Order status distribution
  const orderStatusDist = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      pendingOrders,
      deliveredOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    dailyRevenue,
    topProducts,
    recentOrders,
    orderStatusDist,
  });
});

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const startDate = new Date(Date.now() - parseInt(period, 10) * 24 * 60 * 60 * 1000);

  const salesData = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Category-wise sales
  const categorySales = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productInfo.category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo.name',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  res.json({ success: true, salesData, categorySales });
});

// @desc    Get inventory report
// @route   GET /api/admin/inventory
// @access  Admin
const getInventoryReport = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({ stock: { $lte: 10 }, isActive: true })
    .populate('category', 'name')
    .sort('stock')
    .limit(20);

  const outOfStock = await Product.find({ stock: 0, isActive: true })
    .populate('category', 'name')
    .limit(20);

  const stockStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        avgStock: { $avg: '$stock' },
        totalSold: { $sum: '$sold' },
      },
    },
  ]);

  res.json({
    success: true,
    lowStock,
    outOfStock,
    stats: stockStats[0] || {},
  });
});

// @desc    Get customer behavior insights
// @route   GET /api/admin/analytics/customers
// @access  Admin
const getCustomerInsights = asyncHandler(async (req, res) => {
  // New users per day (last 30 days)
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const newUsers = await User.aggregate([
    { $match: { createdAt: { $gte: last30Days } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top customers by order value
  const topCustomers = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: '$user', totalSpent: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.name': 1,
        'user.email': 1,
        'user.avatar': 1,
        totalSpent: 1,
        orderCount: 1,
      },
    },
  ]);

  res.json({ success: true, newUsers, topCustomers });
});

module.exports = { getDashboardStats, getSalesAnalytics, getInventoryReport, getCustomerInsights };
