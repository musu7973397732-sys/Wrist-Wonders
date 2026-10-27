const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARE
// ==========================================
// Allow parsing JSON and form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all website files (HTML, CSS, images, JS) from this folder
app.use(express.static(__dirname));

// ==========================================
// 2. CONNECT TO MONGODB
// ==========================================
mongoose.connect('mongodb://127.0.0.1:27017/wrist_wonders')
  .then(() => console.log('>>> Connected to MongoDB database (wrist_wonders) successfully!'))
  .catch((err) => console.log('>>> MongoDB connection error:', err.message));

// ==========================================
// 3. MONGODB SCHEMAS & MODELS
// ==========================================
// Users collection (stores sign up & login accounts)
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true }));

// Queries collection (stores messages from QUERY.HTML)
const Query = mongoose.model('Query', new mongoose.Schema({
  name: { type: String, default: 'Customer' },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true }));

// Products collection (stores watches & accessories)
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  price: Number,
  imageUrl: String,
  description: String,
  rating: { type: Number, default: 4.5 },
  inStock: { type: Boolean, default: true }
}, { timestamps: true }));

// Orders collection
const Order = mongoose.model('Order', new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, default: 'Standard Delivery' },
  phone: { type: String, default: '' },
  status: { type: String, default: 'Confirmed' }
}, { timestamps: true }));

// ==========================================
// 4. SIMPLE ROUTES / API ENDPOINTS
// ==========================================

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Node.js & MongoDB backend is running smoothly!' });
});

// --- USER SIGN UP ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, fname, email, fgmail, password, fpass } = req.body;
    const userName = (name || fname || '').trim();
    const userEmail = (email || fgmail || '').trim().toLowerCase();
    const userPass = password || fpass;

    if (!userName || !userEmail || !userPass) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Save new user in MongoDB
    const newUser = await User.create({
      name: userName,
      email: userEmail,
      password: userPass
    });

    res.json({
      success: true,
      message: 'Account created successfully!',
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- USER LOGIN ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, fname, password, fpass } = req.body;
    const identifier = (email || fname || '').trim();
    const userPass = password || fpass;

    if (!identifier || !userPass) {
      return res.status(400).json({ success: false, message: 'Please enter username/email and password.' });
    }

    // Find user by email or by username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: identifier }
      ]
    });

    if (!user || user.password !== userPass) {
      return res.status(400).json({ success: false, message: 'Invalid username/email or password.' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- GET ALL USERS (For Admin Portal) ---
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- SUBMIT QUERY / FEEDBACK ---
app.post('/api/queries', async (req, res) => {
  try {
    const { name, email, fgmail, message } = req.body;
    const userEmail = (email || fgmail || '').trim();
    const userMsg = (message || '').trim();
    const userName = (name || 'Customer').trim();

    if (!userEmail || !userMsg) {
      return res.status(400).json({ success: false, message: 'Email and message are required.' });
    }

    // Save query to MongoDB
    const query = await Query.create({
      name: userName,
      email: userEmail,
      message: userMsg
    });

    res.json({
      success: true,
      message: 'Your query has been submitted and saved to MongoDB!',
      query
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- GET ALL QUERIES ---
app.get('/api/queries', async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json({ success: true, count: queries.length, queries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- DELETE A QUERY ---
app.delete('/api/queries/:id', async (req, res) => {
  try {
    await Query.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Query deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- GET PRODUCTS (Search & Filter) ---
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category.toLowerCase();
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ADD A PRODUCT ---
app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json({ success: true, message: 'Product added to MongoDB!', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- DELETE A PRODUCT ---
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ORDERS ---
// Create new order (Requires logged-in user check)
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount, shippingAddress, phone } = req.body;

    if (!customerEmail || !customerName) {
      return res.status(401).json({
        success: false,
        message: 'Please signup or login before confirming your order!'
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty!' });
    }

    // Verify user exists in database
    const user = await User.findOne({ email: customerEmail.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please sign up or login first!'
      });
    }

    const order = await Order.create({
      customerName: user.name,
      customerEmail: user.email,
      items,
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      shippingAddress: shippingAddress || 'Customer Address',
      phone: phone || '',
      status: 'Confirmed'
    });

    res.json({
      success: true,
      message: 'Order confirmed successfully! Thank you for shopping with Wrist Wonders.',
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get order history for a specific user
app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();
    const orders = await Order.find({ customerEmail: email }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all orders (for admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. START SERVER
// ==========================================
app.listen(PORT, '127.0.0.1', () => {
  console.log(`===============================================`);
  console.log(`  Wrist Wonders Server running!`);
  console.log(`  Open in browser: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
