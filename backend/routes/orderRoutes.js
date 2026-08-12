const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/admin/all', admin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
