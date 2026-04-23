const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    // Seller info
    sellerId:    { type: String, required: true },
    sellerName:  { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerPhone: { type: String },

    // Vehicle details
    name:         { type: String, required: true, trim: true },
    brand:        { type: String, required: true },
    model:        { type: String, required: true },
    year:         { type: Number, required: true },
    price:        { type: Number, required: true, min: 0 },
    category:     { type: String, required: true, enum: ['car', 'bike'] },
    condition:    { type: String, required: true, enum: ['new', 'excellent', 'good', 'fair'] },
    fuelType:     { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'] },
    transmission: { type: String, enum: ['manual', 'automatic'] },
    mileage:      { type: String },       
    color:        { type: String },
    location:     { type: String, required: true },
    description:  { type: String, required: true },
    features:     [{ type: String }],

    // Cloudinary image URLs
    images: [{ type: String }],

    // Review workflow
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote:       { type: String, default: '' },   
    reviewedAt:      { type: Date },
    reviewedBy:      { type: String },                
    publishedProductId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);