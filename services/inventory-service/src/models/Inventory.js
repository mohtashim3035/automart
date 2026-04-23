const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productId:         { type: String, required: true, unique: true },
    productName:       { type: String, required: true },
    stock:             { type: Number, required: true, min: 0, default: 0 },
    reserved:          { type: Number, default: 0 },
    sold:              { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 2 },
    location:          { type: String, default: 'Warehouse A' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);