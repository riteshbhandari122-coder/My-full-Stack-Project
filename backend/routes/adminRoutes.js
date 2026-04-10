const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryReport,
  getCustomerInsights,
} = require('../controllers/adminController');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics/sales', getSalesAnalytics);
router.get('/inventory', getInventoryReport);
router.get('/analytics/customers', getCustomerInsights);

module.exports = router;
