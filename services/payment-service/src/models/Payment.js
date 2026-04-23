const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId:       { type: String, required: true },
    userId:        { type: String, required: true },
    amount:        { type: Number, required: true },
    status:        {
      type:    String,
      enum:    ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    method:        {
      type:    String,
      enum:    ['card', 'upi', 'netbanking', 'emi', 'cod'],
      default: 'card',
    },
    transactionId: { type: String, unique: true, sparse: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);