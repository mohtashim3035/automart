const Product = require('../models/Product');
const axios   = require('axios');

// Helper: sync a product's stock to inventory service
// We call this after create and update. We never fail the main
// operation if inventory sync fails — just log a warning.
const syncInventory = async (product, authHeader) => {
  try {
    const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
    await axios.patch(
      `${inventoryUrl}/api/inventory/${product._id}`,
      {
        stock:       product.stock ?? 1,
        productName: product.name,
        location:    'Warehouse A',
      },
      {
        headers:  { Authorization: authHeader || '' },
        timeout:  5000,    
      }
    );
    console.log(`Inventory synced for product: ${product.name}`);
  } catch (err) {
    // Non-fatal — product operation still succeeds
    console.warn(`Inventory sync failed for ${product._id}: ${err.message}`);
  }
};

// Helper: delete inventory record when product is deleted
const deleteInventoryRecord = async (productId, authHeader) => {
  try {
    const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
    await axios.delete(
      `${inventoryUrl}/api/inventory/${productId}`,
      {
        headers: { Authorization: authHeader || '' },
        timeout: 5000,
      }
    );
    console.log(`Inventory record deleted for product: ${productId}`);
  } catch (err) {
    console.warn(`Inventory delete failed for ${productId}: ${err.message}`);
  }
};

// GET all products with filters, search, pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      category, brand, minPrice, maxPrice, search,
      sortBy = 'createdAt', order = 'desc',
      page = 1, limit = 12,
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (brand)    query.brand    = new RegExp(brand, 'i');

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Regex search — works without a text index
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name:        regex },
        { brand:       regex },
        { model:       regex },
        { description: regex },
      ];
    }

    const skip      = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success:    true,
      data:       products,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Sync to inventory service (non-blocking)
    await syncInventory(product, req.headers.authorization);

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    // Sync updated stock to inventory service (non-blocking)
    await syncInventory(product, req.headers.authorization);

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    // Remove the inventory record too (non-blocking)
    await deleteInventoryRecord(req.params.id, req.headers.authorization);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET featured products
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(6);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all brands (for filter dropdown)
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
