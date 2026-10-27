const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (or protected if logged in)
const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount, shippingAddress } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!customerEmail || !customerName) {
      return res.status(400).json({ success: false, message: 'Customer name and email are required' });
    }

    const order = await Order.create({
      user: req.user ? req.user._id : undefined,
      customerName,
      customerEmail,
      items,
      totalAmount: totalAmount || items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
      shippingAddress: shippingAddress || 'Default Address',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Public
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
