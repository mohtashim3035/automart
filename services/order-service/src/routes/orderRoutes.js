const express = require('express');
const router  = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/',            protect, createOrder);
router.get('/my-orders',    protect, getUserOrders);
router.get('/',             protect, adminOnly, getAllOrders);
router.get('/:id',          protect, getOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;