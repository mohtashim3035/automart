const express = require('express');
const router  = express.Router();
const { initiatePayment, getAllPayments, getUserPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/',    protect, initiatePayment);
router.get('/',     protect, adminOnly, getAllPayments);
router.get('/mine', protect, getUserPayments);

module.exports = router;