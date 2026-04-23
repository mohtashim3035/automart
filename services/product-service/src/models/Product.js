const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    description:  { type: String, required: true },
    price:        { type: Number, required: true, min: 0 },
    category:     { type: String, required: true, enum: ['car', 'bike'] },
    brand:        { type: String, required: true },
    model:        { type: String, required: true },
    year:         { type: Number, required: true },
    mileage:      { type: String },
    fuelType:     { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
    transmission: { type: String, enum: ['manual', 'automatic'] },
    color:        { type: String },
    images:       [{ type: String }],
    stock:        { type: Number, default: 1 },
    isAvailable:  { type: Boolean, default: true },
    features:     [{ type: String }],
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:  { type: Number, default: 0 },
    isFeatured:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', model: 'text' });

module.exports = mongoose.model('Product', productSchema);