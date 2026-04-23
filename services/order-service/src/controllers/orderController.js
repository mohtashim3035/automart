const Order = require('../models/Order');
const axios = require('axios');

const PRODUCT_URL   = () => process.env.PRODUCT_SERVICE_URL   || 'http://localhost:3001';
const INVENTORY_URL = () => process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';

const decreaseStockForOrder = async (items, authHeader) => {
  for (const item of items) {
    try {
      // Get current product
      const prodRes = await axios.get(
        `${PRODUCT_URL()}/api/products/${item.productId}`,
        { timeout: 5000 }
      );
      const product  = prodRes.data.data;
      const newStock = Math.max(0, (product.stock || 0) - (item.quantity || 1));

      // Update product stock (and mark unavailable if 0)
      await axios.put(
        `${PRODUCT_URL()}/api/products/${item.productId}`,
        {
          stock:       newStock,
          isAvailable: newStock > 0,
        },
        {
          headers: { Authorization: authHeader || '' },
          timeout: 5000,
        }
      );

      // Update inventory service — decrease stock, increase sold
      await axios.patch(
        `${INVENTORY_URL()}/api/inventory/${item.productId}/sell`,
        {
          quantity:    item.quantity || 1,
          productName: item.name,
        },
        {
          headers: { Authorization: authHeader || '' },
          timeout: 5000,
        }
      );

      console.log(`Stock updated for product ${item.productId}: ${product.stock} → ${newStock}`);
    } catch (err) {
      
      console.warn(`Stock update failed for product ${item.productId}: ${err.message}`);
    }
  }
};

// Helper: restore stock if order is cancelled
const restoreStockForOrder = async (items, authHeader) => {
  for (const item of items) {
    try {
      const prodRes  = await axios.get(
        `${PRODUCT_URL()}/api/products/${item.productId}`,
        { timeout: 5000 }
      );
      const product  = prodRes.data.data;
      const newStock = (product.stock || 0) + (item.quantity || 1);

      await axios.put(
        `${PRODUCT_URL()}/api/products/${item.productId}`,
        { stock: newStock, isAvailable: true },
        { headers: { Authorization: authHeader || '' }, timeout: 5000 }
      );

      await axios.patch(
        `${INVENTORY_URL()}/api/inventory/${item.productId}/restore`,
        { quantity: item.quantity || 1, productName: item.name },
        { headers: { Authorization: authHeader || '' }, timeout: 5000 }
      );

      console.log(`Stock restored for product ${item.productId}`);
    } catch (err) {
      console.warn(`Stock restore failed for product ${item.productId}: ${err.message}`);
    }
  }
};

// POST /api/orders — create order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      userId:    req.user.id,
      userName:  req.user.name,
      userEmail: req.user.email,
    });
    await order.save();

    // Decrease stock for all items in this order (non-blocking chain)
    decreaseStockForOrder(order.items, req.headers.authorization);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my-orders — user's own orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders — all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort('-createdAt');
    res.json({ success: true, data: orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id — single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorised' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/orders/:id/status — update status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status:        req.body.status,
        paymentStatus: req.body.paymentStatus,
      },
      { new: true }
    );
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/orders/:id/cancel — cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status === 'delivered')
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    if (order.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });

    const previousStatus = order.status;
    order.status = 'cancelled';
    await order.save();

    
    if (['confirmed', 'processing', 'shipped'].includes(previousStatus)) {
      restoreStockForOrder(order.items, req.headers.authorization);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
