const express = require('express');
const router  = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeatured,
  getBrands,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/featured',  getFeatured);
router.get('/brands',    getBrands);
router.get('/',          getProducts);
router.get('/:id',       getProduct);
router.post('/',         protect, adminOnly, createProduct);
router.put('/:id',       protect, adminOnly, updateProduct);
router.delete('/:id',    protect, adminOnly, deleteProduct);

module.exports = router;