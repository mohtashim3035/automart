const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId:    { type: String, required: true },
    userName:  { type: String, required: true },
    userEmail: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name:      { type: String, required: true },
        price:     { type: Number, required: true },
        quantity:  { type: Number, required: true, default: 1 },
        image:     { type: String },
      },
    ],
    totalAmount:   { type: Number, required: true },
    status:        {
      type:    String,
      enum:    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type:    String,
      enum:    ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    shippingAddress: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);