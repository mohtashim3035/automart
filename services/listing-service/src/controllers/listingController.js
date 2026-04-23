const Listing   = require('../models/Listing');
const { cloudinary } = require('../config/cloudinary');
const axios     = require('axios');

// USER ENDPOINTS

// POST /api/listings  — submit a new vehicle listing with image upload handled by multer middleware
exports.submitListing = async (req, res) => {
  try {
    const {
      name, brand, model, year, price, category, condition,
      fuelType, transmission, mileage, color, location, description, features,
    } = req.body;

    // req.files comes from multer-storage-cloudinary — each file already uploaded
    const imageUrls = (req.files || []).map((f) => f.path);

    const listing = new Listing({
      sellerId:    req.user.id,
      sellerName:  req.user.name,
      sellerEmail: req.user.email,
      sellerPhone: req.body.sellerPhone || '',
      name,
      brand,
      model,
      year:    Number(year),
      price:   Number(price),
      category,
      condition,
      fuelType,
      transmission,
      mileage,
      color,
      location,
      description,
      features: features ? features.split(',').map((f) => f.trim()).filter(Boolean) : [],
      images:   imageUrls,
      status:   'pending',
    });

    await listing.save();

    res.status(201).json({
      success: true,
      data:    listing,
      message: 'Your vehicle has been submitted for review. We will notify you shortly.',
    });
  } catch (err) {
    // If upload happened but save failed, clean up Cloudinary images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const publicId = file.filename || file.public_id;
          if (publicId) await cloudinary.uploader.destroy(publicId);
        } catch (_) {}
      }
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/listings/my-listings  — user sees their own submissions
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/listings/my-listings/:id  — single listing detail for user
exports.getMyListingById = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!listing)
      return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN ENDPOINTS

// GET /api/listings  — all listings
exports.getAllListings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const listings = await Listing.find(query).sort('-createdAt');
    res.json({ success: true, data: listings, total: listings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/listings/:id  — single listing detail
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/listings/:id/approve — admin approves listing and publishes it as a product
exports.approveListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Listing is not pending' });

    // Create a product in the product-service
    const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
    const productPayload = {
      name:         listing.name,
      description:  listing.description,
      price:        listing.price,
      category:     listing.category,
      brand:        listing.brand,
      model:        listing.model,
      year:         listing.year,
      fuelType:     listing.fuelType,
      transmission: listing.transmission,
      color:        listing.color,
      images:       listing.images,
      stock:        1,
      isAvailable:  true,
      isFeatured:   false,
      features:     listing.features,
      mileage:      listing.mileage,
    };

    // Call product service with admin JWT from request
    const productRes = await axios.post(
      `${productServiceUrl}/api/products`,
      productPayload,
      { headers: { Authorization: req.headers.authorization } }
    );

    const newProduct = productRes.data.data;

    // Update listing record
    listing.status             = 'approved';
    listing.reviewedAt         = new Date();
    listing.reviewedBy         = req.user.name;
    listing.publishedProductId = newProduct._id;
    listing.adminNote          = req.body.adminNote || 'Approved and published.';
    await listing.save();

    res.json({
      success: true,
      data:    listing,
      product: newProduct,
      message: 'Listing approved and published on the marketplace.',
    });
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    res.status(500).json({ success: false, message: msg });
  }
};

// PATCH /api/listings/:id/reject  — admin rejects listing with reason
exports.rejectListing = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '')
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Listing is not pending' });

    listing.status     = 'rejected';
    listing.adminNote  = reason.trim();
    listing.reviewedAt = new Date();
    listing.reviewedBy = req.user.name;
    await listing.save();

    res.json({ success: true, data: listing, message: 'Listing rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/listings/:id  — admin deletes a listing and its Cloudinary images
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: 'Listing not found' });

    // Remove Cloudinary images
    for (const url of listing.images) {
      try {
        // Extract public_id from URL: .../automart/listings/filename
        const parts   = url.split('/');
        const file    = parts[parts.length - 1];
        const publicId = `automart/listings/${file.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (_) {}
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/listings/upload-images  — admin-only image upload, returns URLs
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls, count: urls.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};