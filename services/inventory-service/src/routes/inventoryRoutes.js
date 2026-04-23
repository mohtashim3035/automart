const express = require('express');
const router  = express.Router();
const {
  getAllInventory,
  getLowStock,
  checkStock,
  updateStock,
  recordSale,
  restoreStock,
  deleteRecord,
} = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes
router.get('/',                          protect, adminOnly, getAllInventory);
router.get('/low-stock',                 protect, adminOnly, getLowStock);


router.patch('/:productId',              protect, updateStock);
router.patch('/:productId/sell',         protect, recordSale);
router.patch('/:productId/restore',      protect, restoreStock);
router.delete('/:productId',             protect, deleteRecord);


router.get('/:productId/check',          checkStock);

module.exports = router;
