const Payment = require('../models/Payment');
const crypto  = require('crypto');

// POST /api/payments  — initiate payment
exports.initiatePayment = async (req, res) => {
  try {
    const payment = new Payment({
      orderId: req.body.orderId,
      userId:  req.user.id,
      amount:  req.body.amount,
      method:  req.body.method || 'card',
    });

    // Simulate payment processing (replacing this with Razorpay / Stripe in production)
    await new Promise((r) => setTimeout(r, 800));

    payment.status        = 'success';
    payment.transactionId = 'TXN-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    await payment.save();

    res.json({ success: true, data: payment, message: 'Payment successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments  — all payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort('-createdAt');
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/mine  — user's own payments
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};