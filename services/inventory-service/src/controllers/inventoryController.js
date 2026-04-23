const Inventory = require('../models/Inventory');

// GET /api/inventory — all inventory records
exports.getAllInventory = async (req, res) => {
  try {
    const inv = await Inventory.find().sort('-updatedAt');
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/low-stock
exports.getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/:productId/check
exports.checkStock = async (req, res) => {
  try {
    const inv = await Inventory.findOne({ productId: req.params.productId });
    res.json({
      success: true,
      inStock: inv ? inv.stock > 0 : false,
      stock:   inv ? inv.stock    : 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Called by product-service when a product is created or updated
exports.updateStock = async (req, res) => {
  try {
    const { stock, productName, location } = req.body;
    const inv = await Inventory.findOneAndUpdate(
      { productId: req.params.productId },
      {
        $set: {
          stock:       stock ?? 1,
          productName: productName || 'Unknown',
          location:    location    || 'Warehouse A',
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Called by order-service when an order is placed
exports.recordSale = async (req, res) => {
  try {
    const { quantity = 1, productName } = req.body;
    const inv = await Inventory.findOne({ productId: req.params.productId });

    if (!inv) {
      // Create the record on the fly if it doesn't exist yet
      const newInv = await Inventory.create({
        productId:   req.params.productId,
        productName: productName || 'Unknown',
        stock:       0,
        sold:        quantity,
        reserved:    0,
      });
      return res.json({ success: true, data: newInv });
    }

    inv.stock = Math.max(0, inv.stock - quantity);
    inv.sold  = (inv.sold || 0) + quantity;
    await inv.save();

    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Called by order-service when an order is cancelled
exports.restoreStock = async (req, res) => {
  try {
    const { quantity = 1, productName } = req.body;
    const inv = await Inventory.findOne({ productId: req.params.productId });

    if (!inv) {
      const newInv = await Inventory.create({
        productId:   req.params.productId,
        productName: productName || 'Unknown',
        stock:       quantity,
        sold:        0,
        reserved:    0,
      });
      return res.json({ success: true, data: newInv });
    }

    inv.stock = (inv.stock || 0) + quantity;
    inv.sold  = Math.max(0, (inv.sold || 0) - quantity);
    await inv.save();

    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Called by product-service when a product is deleted
exports.deleteRecord = async (req, res) => {
  try {
    await Inventory.findOneAndDelete({ productId: req.params.productId });
    res.json({ success: true, message: 'Inventory record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
