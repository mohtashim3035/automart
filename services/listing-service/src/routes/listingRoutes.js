const express = require('express');
const router  = express.Router();
const {
  submitListing,
  getMyListings,
  getMyListingById,
  getAllListings,
  getListingById,
  approveListing,
  rejectListing,
  deleteListing,
  uploadImages,
} = require('../controllers/listingController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Shared image upload endpoint used by admin product form too
router.post('/upload-images',   protect, adminOnly, upload.array('images', 8), uploadImages);

// User routes
router.post('/',                protect, upload.array('images', 8), submitListing);
router.get('/my-listings',      protect, getMyListings);
router.get('/my-listings/:id',  protect, getMyListingById);

// Admin routes
router.get('/',                 protect, adminOnly, getAllListings);
router.get('/:id',              protect, adminOnly, getListingById);
router.patch('/:id/approve',    protect, adminOnly, approveListing);
router.patch('/:id/reject',     protect, adminOnly, rejectListing);
router.delete('/:id',           protect, adminOnly, deleteListing);

module.exports = router;
