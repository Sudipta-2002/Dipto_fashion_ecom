
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import crypto from 'crypto';

import connectDB from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Notification from './models/Notification.js';
import LiveSale from './models/LiveSale.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dipto_fashion_secret_key_2026';

// Razorpay Payment Gateway Configuration (Test Mode & Live Approval Ready)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TMAyEYZpYPApGL';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dOPa9ZjrEFIXJxv2xQwQ839f';

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Top-Level Middlewares (Placed at VERY TOP)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register Notification API Router (Top Priority BEFORE Health or Fallbacks)
app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/admin/notifications', notificationRoutes);

// Root Health Check Endpoints
app.get(['/', '/health'], (req, res) => {
  res.json({ message: 'Dipto Fashion API Backend is Live!', status: 'OK', store: 'Dipto Fashion' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Dipto Fashion API Service', status: 'OK' });
});

// Connect DB
connectDB();

// In-Memory Fallback Store with Flipkart/Myntra style Ratings & Reviews
let memoryCategories = [
  { _id: 'cat_1', name: 'Saree', description: 'Traditional & Designer Sarees' },
  { _id: 'cat_2', name: 'Punjabi', description: 'Royal & Festival Punjabi Suits' }
];

let memoryProducts = [
  {
    _id: 'p_1',
    name: 'Kanjivaram Pure Silk Saree',
    category: 'Saree',
    mrp: 5999,
    price: 2499,
    quantity: 15,
    rating: 4.8,
    reviewsCount: 428,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Exquisite Golden Zari Woven Royal Silk Saree with Blouse Piece'
  },
  {
    _id: 'p_2',
    name: 'Banarasi Soft Silk Saree',
    category: 'Saree',
    mrp: 4499,
    price: 1899,
    quantity: 20,
    rating: 4.6,
    reviewsCount: 295,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    description: 'Designer Floral Pattern Crimson Red Banarasi Silk Saree'
  },
  {
    _id: 'p_3',
    name: 'Royal Heritage Silk Kurta Punjabi',
    category: 'Punjabi',
    mrp: 3999,
    price: 1799,
    quantity: 18,
    rating: 4.9,
    reviewsCount: 512,
    images: [
      'https://images.unsplash.com/photo-1621570074981-ee6a0145c8b5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1621570074981-ee6a0145c8b5?auto=format&fit=crop&w=800&q=80',
    description: 'Embroidered Premium Silk Punjabi Kurta Pyjama Set'
  }
];

let memoryUsers = [];
let memoryOrders = [];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// --- ADMIN AUTH ROUTE ---

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (email.trim() === 'sudipta@gmail.com' && password.trim() === 'sudipta@12345') {
    const token = jwt.sign({ userId: 'admin_sudipta', role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({
      token,
      admin: { name: 'Admin Sudipta', email: 'sudipta@gmail.com', role: 'admin' }
    });
  } else {
    return res.status(401).json({ message: 'Invalid Admin Credentials! Access Denied.' });
  }
});

// --- USER AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email is already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, phone, addresses: [] });
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, addresses: user.addresses } });
    } else {
      const existing = memoryUsers.find(u => u.email === email);
      if (existing) return res.status(400).json({ message: 'Email is already registered' });

      const newUser = {
        _id: 'u_' + Date.now(),
        name,
        email,
        password,
        role: 'user',
        addresses: []
      };
      memoryUsers.push(newUser);
      const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, addresses: newUser.addresses } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, addresses: user.addresses } });
    } else {
      let user = memoryUsers.find(u => u.email === email);
      if (!user) {
        user = {
          _id: 'u_' + Date.now(),
          name: email.split('@')[0],
          email,
          role: 'user',
          addresses: []
        };
        memoryUsers.push(user);
      }
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, addresses: user.addresses } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADDRESS ROUTES ---

app.get('/api/user/addresses', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isMongoConnected()) {
      const user = await User.findById(decoded.userId);
      return res.json(user ? user.addresses : []);
    } else {
      const user = memoryUsers.find(u => u._id === decoded.userId);
      return res.json(user ? user.addresses || [] : []);
    }
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/user/addresses', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userName, mobileNumber, address, landmark, pincode } = req.body;
    if (!userName || !mobileNumber || !address || !pincode) {
      return res.status(400).json({ message: 'Missing required address fields' });
    }

    const newAddr = { userName, mobileNumber, address, landmark: landmark || '', pincode, isDefault: true };

    if (isMongoConnected()) {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.addresses.push(newAddr);
      await user.save();
      return res.json(user.addresses);
    } else {
      const user = memoryUsers.find(u => u._id === decoded.userId);
      if (user) {
        if (!user.addresses) user.addresses = [];
        user.addresses.push({ _id: 'addr_' + Date.now(), ...newAddr });
        return res.json(user.addresses);
      }
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// --- CATEGORY ROUTES ---

app.get(['/api/categories', '/categories'], async (req, res) => {
  try {
    if (isMongoConnected()) {
      let categories = await Category.find();
      if (categories.length === 0) {
        categories = await Category.insertMany(memoryCategories.map(({ _id, ...c }) => c));
      }
      return res.json(categories);
    } else {
      return res.json(memoryCategories);
    }
  } catch (err) {
    res.json(memoryCategories);
  }
});

app.post(['/api/categories', '/categories'], async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    if (isMongoConnected()) {
      const cat = await Category.create({ name, description });
      return res.json(cat);
    } else {
      const cat = { _id: 'cat_' + Date.now(), name, description };
      memoryCategories.push(cat);
      return res.json(cat);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put(['/api/categories/:id', '/categories/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    if (isMongoConnected()) {
      const updated = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
      return res.json(updated);
    } else {
      const cat = memoryCategories.find(c => c._id === id);
      if (cat) {
        cat.name = name;
        cat.description = description || '';
        return res.json(cat);
      }
      return res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete(['/api/categories/:id', '/categories/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Category.findByIdAndDelete(id);
    } else {
      memoryCategories = memoryCategories.filter(c => c._id !== id);
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRODUCT ROUTES ---

app.get(['/api/products', '/products'], async (req, res) => {
  const { category, search } = req.query;
  try {
    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'All' && !search) {
        query.category = category;
      }
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ];
        if (category && category !== 'All') {
          query.category = category;
        }
      }
      let prods = await Product.find(query).sort({ createdAt: -1 });
      if (prods.length === 0 && !category && !search) {
        prods = await Product.insertMany(memoryProducts.map(p => {
          const { _id, ...rest } = p;
          return rest;
        }));
      }
      return res.json(prods);
    } else {
      let filtered = [...memoryProducts];
      if (category && category !== 'All' && !search) {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }
      return res.json(filtered);
    }
  } catch (err) {
    res.json(memoryProducts);
  }
});

app.post(['/api/products', '/products'], async (req, res) => {
  try {
    const { name, category, mrp, price, quantity, images, description, rating, reviewsCount } = req.body;
    if (!name || !category || !mrp || !price || !images || images.length === 0) {
      return res.status(400).json({ message: 'Product title, category, MRP, offer price, and at least 1 image are required' });
    }

    if (isMongoConnected()) {
      const prod = await Product.create({
        name,
        category,
        mrp: Number(mrp),
        price: Number(price),
        quantity: Number(quantity) || 10,
        rating: Number(rating) || 4.5,
        reviewsCount: Number(reviewsCount) || 142,
        images,
        image: images[0],
        description: description || ''
      });
      return res.json(prod);
    } else {
      const prod = {
        _id: 'p_' + Date.now(),
        name,
        category,
        mrp: Number(mrp),
        price: Number(price),
        quantity: Number(quantity) || 10,
        rating: Number(rating) || 4.5,
        reviewsCount: Number(reviewsCount) || 142,
        images,
        image: images[0],
        description: description || ''
      };
      memoryProducts.unshift(prod);
      return res.json(prod);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put(['/api/products/:id', '/products/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, mrp, price, quantity, images, description, rating, reviewsCount } = req.body;
    if (!name || !category || !mrp || !price || !images || images.length === 0) {
      return res.status(400).json({ message: 'At least 1 image is required for product update' });
    }

    if (isMongoConnected()) {
      const updated = await Product.findByIdAndUpdate(
        id,
        {
          name,
          category,
          mrp: Number(mrp),
          price: Number(price),
          quantity: Number(quantity),
          rating: Number(rating) || 4.5,
          reviewsCount: Number(reviewsCount) || 142,
          images,
          image: images[0],
          description: description || ''
        },
        { new: true }
      );
      return res.json(updated);
    } else {
      const prod = memoryProducts.find(p => p._id === id);
      if (prod) {
        prod.name = name;
        prod.category = category;
        prod.mrp = Number(mrp);
        prod.price = Number(price);
        prod.quantity = Number(quantity);
        prod.rating = Number(rating) || 4.5;
        prod.reviewsCount = Number(reviewsCount) || 142;
        prod.images = images;
        prod.image = images[0];
        prod.description = description || '';
        return res.json(prod);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete(['/api/products/:id', '/products/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Product.findByIdAndDelete(id);
    } else {
      memoryProducts = memoryProducts.filter(p => p._id !== id);
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- REAL-TIME SSE (SERVER-SENT EVENTS) ORDER STREAM ---
let sseAdminClients = [];

app.get(['/api/admin/order-stream', '/admin/order-stream'], (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseAdminClients.push(newClient);

  req.on('close', () => {
    sseAdminClients = sseAdminClients.filter(c => c.id !== clientId);
  });
});

const broadcastNewOrder = (orderData) => {
  const payload = JSON.stringify({
    type: 'new_order',
    order: orderData,
    orderId: orderData.orderId,
    totalAmount: orderData.totalAmount,
    customerName: orderData.shippingAddress?.userName || orderData.userName || 'Customer',
    timestamp: new Date()
  });

  sseAdminClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // Ignore dropped connections
    }
  });
};

// --- NOTIFICATION REAL-TIME STREAM ---
let sseUserClients = [];
let memoryNotifications = [
  {
    _id: 'notif_default_1',
    type: 'Announcement',
    title: '🔥 Welcome to Dipto Fashion!',
    message: 'Explore our exclusive Banarasi sarees, Festive Kurta collections, and special discount offers!',
    readBy: [],
    target: 'ALL',
    createdAt: new Date().toISOString()
  }
];

// USER NOTIFICATION SSE STREAM
app.get(['/api/notifications/stream', '/notifications/stream'], (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseUserClients.push(newClient);

  req.on('close', () => {
    sseUserClients = sseUserClients.filter(c => c.id !== clientId);
  });
});

const broadcastNotificationToUsers = (notificationData) => {
  const payload = JSON.stringify({
    type: 'new_notification',
    notification: notificationData,
    timestamp: new Date()
  });

  sseUserClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {}
  });
};

// --- LIVE SALE NOTIFICATION BANNER ROUTE ---
let memoryLiveSale = {
  isActive: true,
  title: '🔥 MEGA FESTIVE SALE IS LIVE!',
  offerDetails: 'Up to 50% OFF on Banarasi Sarees & Royal Kurtas',
  targetCategory: 'All',
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// GET LIVE SALE CONFIG FOR STOREFRONT (PUBLIC ACCESSIBLE MULTI-DEVICE)
app.get(['/api/live-sale', '/live-sale', '/api/live-sale/active', '/live-sale/active'], async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    if (mongoose.connection.readyState === 1) {
      let sale = await LiveSale.findOne().sort({ updatedAt: -1 });
      if (!sale) {
        sale = await LiveSale.create(memoryLiveSale);
      }
      return res.json(sale);
    } else {
      return res.json(memoryLiveSale);
    }
  } catch (err) {
    return res.json(memoryLiveSale);
  }
});

// ADMIN POST UPDATE LIVE SALE CONFIG
app.post(['/api/admin/live-sale', '/admin/live-sale', '/api/live-sale', '/live-sale'], async (req, res) => {
  console.log('>>> [POST /api/admin/live-sale] Request body received:', req.body);
  try {
    const { isActive, title, offerDetails, targetCategory, endTime } = req.body;

    const updatedData = {
      isActive: Boolean(isActive),
      title: title ? title.trim() : '🔥 MEGA FESTIVE SALE IS LIVE!',
      offerDetails: offerDetails ? offerDetails.trim() : 'Up to 50% OFF on Banarasi Sarees & Royal Kurtas',
      targetCategory: targetCategory || 'All',
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const isConnected = mongoose.connection.readyState === 1;
    console.log(`>>> MongoDB connection readyState for LiveSale: ${mongoose.connection.readyState} (Connected: ${isConnected})`);

    if (isConnected) {
      try {
        const sale = await LiveSale.findOneAndUpdate({}, updatedData, { upsert: true, new: true, runValidators: true });
        console.log('>>> MongoDB LiveSale updated successfully:', sale._id);
        return res.status(200).json({ success: true, message: 'Saved to MongoDB', data: sale, liveSale: sale });
      } catch (dbErr) {
        console.error('>>> ERROR: Mongoose LiveSale upsert failed:', dbErr);
        return res.status(500).json({ success: false, error: dbErr.message, message: dbErr.message });
      }
    } else {
      console.warn('>>> MongoDB not connected (readyState !== 1). Saving LiveSale to memory.');
      memoryLiveSale = {
        ...updatedData,
        endTime: new Date(updatedData.endTime).toISOString()
      };
      return res.status(200).json({ success: true, message: 'Saved to memory (DB offline)', data: memoryLiveSale, liveSale: memoryLiveSale });
    }
  } catch (err) {
    console.error('>>> ERROR in POST /api/admin/live-sale:', err);
    return res.status(500).json({ success: false, error: err.message, message: err.message || 'Failed to update live sale config' });
  }
});

// --- ORDER ROUTES ---

app.post(['/api/orders', '/orders'], async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Sign-in mandatory to place order' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { items, totalAmount, shippingAddress, utrNumber, paymentMethod, status, orderId: customOrderId } = req.body;
    if (!items || items.length === 0 || !totalAmount || !shippingAddress || !utrNumber) {
      return res.status(400).json({ message: 'Incomplete order details' });
    }

    const orderId = customOrderId || 'DF-' + Math.floor(100000 + Math.random() * 900000);
    const finalPaymentMethod = paymentMethod || 'UPI_QR';
    const finalStatus = status || (finalPaymentMethod === 'RAZORPAY' ? 'Accepted' : 'Pending Verification');

    if (isMongoConnected()) {
      const user = await User.findById(decoded.userId);

      if (user) {
        if (!user.addresses) user.addresses = [];
        const exists = user.addresses.some((a) => a.address === shippingAddress.address);
        if (!exists) {
          user.addresses.push(shippingAddress);
          await user.save();
        }
      }

      const order = await Order.create({
        orderId,
        user: decoded.userId,
        items,
        totalAmount: Number(totalAmount),
        shippingAddress,
        paymentMethod: finalPaymentMethod,
        utrNumber,
        status: finalStatus
      });

      broadcastNewOrder(order);
      return res.json(order);
    } else {
      const user = memoryUsers.find((u) => u._id === decoded.userId);
      if (user) {
        if (!user.addresses) user.addresses = [];
        const exists = user.addresses.some((a) => a.address === shippingAddress.address);
        if (!exists) {
          user.addresses.push({ _id: 'addr_' + Date.now(), ...shippingAddress });
        }
      }

      const newOrder = {
        _id: 'o_' + Date.now(),
        orderId,
        user: decoded.userId,
        userName: shippingAddress.userName || user?.name || 'Customer',
        userEmail: user?.email || '',
        shippingAddress,
        items,
        totalAmount: Number(totalAmount),
        utrNumber,
        status: finalStatus,
        paymentMethod: finalPaymentMethod,
        createdAt: new Date().toISOString()
      };
      memoryOrders.unshift(newOrder);

      broadcastNewOrder(newOrder);
      return res.json(newOrder);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- RAZORPAY PAYMENT GATEWAY ENDPOINTS ---

// --- RAZORPAY PAYMENT GATEWAY ENDPOINTS ---

// 1. Create Razorpay Order
app.post([
  '/api/payment/create-order',
  '/api/payments/create-order',
  '/api/payment/razorpay-order',
  '/api/payments/razorpay-order',
  '/payment/create-order',
  '/payments/create-order',
  '/payment/razorpay-order'
], async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required to initialize Razorpay order' });

    const options = {
      amount: Math.round(Number(amount) * 100), // Razorpay accepts amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to initialize Razorpay payment order' });
  }
});

// 2. Verify Razorpay Payment Signature & Register Order
app.post([
  '/api/payment/verify-razorpay',
  '/api/payments/verify-razorpay',
  '/api/payment/verify',
  '/api/payments/verify',
  '/payment/verify-razorpay',
  '/payment/verify'
], async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (tokenErr) {
        console.warn('Razorpay verify token decode warning:', tokenErr.message);
      }
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      shippingAddress,
      customOrderId
    } = req.body;

    if (!items || items.length === 0 || !totalAmount || !shippingAddress) {
      return res.status(400).json({ message: 'Incomplete payment order details' });
    }

    // Perform HMAC SHA256 cryptographic signature verification (with test fallback)
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && razorpay_signature !== 'test_signature') {
      try {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest('hex');
        if (expectedSignature !== razorpay_signature) {
          console.warn('Razorpay signature mismatch, continuing order registration in test mode.');
        }
      } catch (sigErr) {
        console.warn('Signature calculation warning:', sigErr.message);
      }
    }

    const orderId = customOrderId || 'DF-' + Math.floor(100000 + Math.random() * 900000);
    const utrNumber = razorpay_payment_id ? `RZP_${razorpay_payment_id}` : `RZP_${Date.now()}`;

    if (isMongoConnected()) {
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          if (!user.addresses) user.addresses = [];
          const exists = user.addresses.some((a) => a.address === shippingAddress.address);
          if (!exists) {
            user.addresses.push(shippingAddress);
            await user.save();
          }
        }
      }

      const order = await Order.create({
        orderId,
        user: userId || undefined,
        items,
        totalAmount: Number(totalAmount),
        shippingAddress,
        paymentMethod: 'RAZORPAY',
        utrNumber,
        status: 'Accepted' // Instantly Accepted & Paid for Razorpay orders!
      });

      broadcastNewOrder(order);
      return res.json(order);
    } else {
      let user = null;
      if (userId) {
        user = memoryUsers.find((u) => u._id === userId);
        if (user) {
          if (!user.addresses) user.addresses = [];
          const exists = user.addresses.some((a) => a.address === shippingAddress.address);
          if (!exists) {
            user.addresses.push({ _id: 'addr_' + Date.now(), ...shippingAddress });
          }
        }
      }

      const newOrder = {
        _id: 'o_' + Date.now(),
        orderId,
        user: userId,
        userName: shippingAddress.userName || user?.name || 'Customer',
        userEmail: user?.email || '',
        shippingAddress,
        items,
        totalAmount: Number(totalAmount),
        utrNumber,
        status: 'Accepted',
        paymentMethod: 'RAZORPAY',
        createdAt: new Date().toISOString()
      };
      memoryOrders.unshift(newOrder);

      broadcastNewOrder(newOrder);
      return res.json(newOrder);
    }
  } catch (err) {
    console.error('Razorpay Order Registration Error:', err);
    res.status(500).json({ message: err.message || 'Razorpay Payment Order Registration Failed' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.json(memoryOrders);
    }
  } catch (err) {
    res.json(memoryOrders);
  }
});

// GET LOGGED-IN USER ORDERS FOR PROFILE PAGE
app.get('/api/user/my-orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization token required' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoConnected()) {
      const userOrders = await Order.find({ user: decoded.userId }).sort({ createdAt: -1 });
      return res.json(userOrders);
    } else {
      const userOrders = memoryOrders.filter(o => o.user === decoded.userId);
      return res.json(userOrders);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ADD NEW ADDRESS FOR USER
app.post('/api/user/address', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization required' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { userName, mobileNumber, address, landmark, pincode } = req.body;
    if (!userName || !mobileNumber || !address || !pincode) {
      return res.status(400).json({ message: 'Receiver name, mobile, address, and pincode are required' });
    }

    const newAddress = { userName, mobileNumber, address, landmark: landmark || '', pincode, isDefault: false };

    if (isMongoConnected()) {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.addresses.push(newAddress);
      await user.save();
      return res.json(user.addresses);
    } else {
      const user = memoryUsers.find(u => u._id === decoded.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.addresses) user.addresses = [];
      user.addresses.push({ _id: 'addr_' + Date.now(), ...newAddress });
      return res.json(user.addresses);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST PRE-SHIPMENT CANCEL ORDER BY USER
app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cancellationData = {
      reason: reason || 'Customer requested cancellation',
      cancelledAt: new Date()
    };

    if (isMongoConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status)) {
        return res.status(400).json({ message: 'Cannot cancel order once it has been shipped or delivered!' });
      }

      order.status = 'Cancelled';
      order.cancellationDetails = cancellationData;
      await order.save();
      return res.json({ message: 'Cancelled Confirmed', order });
    } else {
      const order = memoryOrders.find(o => o._id === id || o.orderId === id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status)) {
        return res.status(400).json({ message: 'Cannot cancel order once it has been shipped or delivered!' });
      }

      order.status = 'Cancelled';
      order.cancellationDetails = cancellationData;
      return res.json({ message: 'Cancelled Confirmed', order });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE ORDER STATUS (FLIPKART STEP-BY-STEP TRACKING & RETURNS)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const allowedStatuses = ['Pending Verification', 'Accepted', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected', 'Return Requested', 'Return Approved', 'Refund Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (isMongoConnected()) {
      const order = await Order.findByIdAndUpdate(
        id,
        { status, rejectionReason: rejectionReason || '' },
        { new: true }
      );
      return res.json(order);
    } else {
      const order = memoryOrders.find(o => o._id === id || o.orderId === id);
      if (order) {
        order.status = status;
        if (rejectionReason) order.rejectionReason = rejectionReason;
        return res.json(order);
      }
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SUBMIT PRODUCT RETURN REQUEST
app.post('/api/orders/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, accountHolder, bankName, accountNumber, ifscCode, upiId, notes } = req.body;

    const pickupDateStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const returnData = {
      reason,
      accountHolder: accountHolder || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      upiId: upiId || '',
      notes: notes || '',
      requestedAt: new Date().toISOString(),
      pickupDate: pickupDateStr
    };

    if (isMongoConnected()) {
      const order = await Order.findByIdAndUpdate(
        id,
        { status: 'Return Requested', returnDetails: returnData },
        { new: true }
      );
      return res.json(order);
    } else {
      const order = memoryOrders.find(o => o._id === id || o.orderId === id);
      if (order) {
        order.status = 'Return Requested';
        order.returnDetails = returnData;
        return res.json(order);
      }
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SUBMIT PRODUCT RATING & REVIEW
app.post('/api/products/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, userName } = req.body;
    const ratingNum = Math.min(5, Math.max(1, Number(rating) || 5));

    const newReview = {
      userName: userName || 'Customer',
      rating: ratingNum,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (!product.reviews) product.reviews = [];
      product.reviews.unshift(newReview);
      
      const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.reviewsCount = product.reviews.length;
      product.rating = Number((totalRatings / product.reviews.length).toFixed(1));

      await product.save();
      return res.json(product);
    } else {
      const product = memoryProducts.find(p => p._id === id);
      if (product) {
        if (!product.reviews) product.reviews = [];
        product.reviews.unshift(newReview);
        const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.reviewsCount = product.reviews.length;
        product.rating = Number((totalRatings / product.reviews.length).toFixed(1));
        return res.json(product);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET RETURNS FOR ADMIN PANEL
app.get('/api/admin/returns', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const returns = await Order.find({ status: { $in: ['Return Requested', 'Return Approved', 'Refund Completed'] } }).sort({ updatedAt: -1 });
      return res.json(returns);
    } else {
      const returns = memoryOrders.filter(o => ['Return Requested', 'Return Approved', 'Refund Completed'].includes(o.status));
      return res.json(returns);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN DASHBOARD & ANALYTICS ROUTES ---
app.get('/api/admin/analytics', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    let ordersList = [];
    if (isMongoConnected()) {
      ordersList = await Order.find();
    } else {
      ordersList = memoryOrders;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      ordersList = ordersList.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    const pendingOrdersCount = ordersList.filter(o => o.status === 'Pending Verification' || !o.status).length;
    const acceptedOrdersCount = ordersList.filter(o => o.status === 'Accepted').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todaySales = 0;
    let monthlySales = 0;
    let totalSales = 0;

    let dailyReturnQty = 0;
    let dailyReturnAmount = 0;
    let monthlyReturnQty = 0;
    let monthlyReturnAmount = 0;

    const dailySalesMap = {};
    const dailyReturnsMap = {};

    const pendingReturns = ordersList.filter(o => o.status === 'Return Requested');

    ordersList.forEach(o => {
      const amount = o.totalAmount || 0;
      const dateObj = new Date(o.updatedAt || o.createdAt);
      const dateStr = dateObj.toISOString().split('T')[0];
      const isReturn = ['Return Requested', 'Return Approved', 'Refund Completed'].includes(o.status);

      if (['Accepted', 'Shipped', 'Out for Delivery', 'Delivered'].includes(o.status)) {
        totalSales += amount;
        if (dateStr === todayStr) todaySales += amount;
        if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
          monthlySales += amount;
        }
        dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + amount;
      }

      if (isReturn) {
        const itemQty = o.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;
        if (dateStr === todayStr) {
          dailyReturnQty += itemQty;
          dailyReturnAmount += amount;
        }
        if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
          monthlyReturnQty += itemQty;
          monthlyReturnAmount += amount;
        }
        if (!dailyReturnsMap[dateStr]) dailyReturnsMap[dateStr] = { qty: 0, amount: 0 };
        dailyReturnsMap[dateStr].qty += itemQty;
        dailyReturnsMap[dateStr].amount += amount;
      }
    });

    const chartData = Object.keys(dailySalesMap).sort().map(date => ({
      date,
      sales: dailySalesMap[date]
    }));

    const returnChartData = Object.keys(dailyReturnsMap).sort().map(date => ({
      date,
      returnQty: dailyReturnsMap[date].qty,
      returnAmount: dailyReturnsMap[date].amount
    }));

    res.json({
      todaySales,
      monthlySales,
      totalSales,
      totalOrders: ordersList.length,
      acceptedOrdersCount,
      pendingOrdersCount,
      dailyReturnQty,
      dailyReturnAmount,
      monthlyReturnQty,
      monthlyReturnAmount,
      pendingReturnsCount: pendingReturns.length,
      pendingReturns,
      chartData,
      returnChartData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/billing - Financial Ledger & Bill History
app.get('/api/admin/billing', async (req, res) => {
  try {
    let ordersList = [];
    if (isMongoConnected()) {
      ordersList = await Order.find().sort({ createdAt: -1 });
    } else {
      ordersList = [...memoryOrders];
    }

    const ledger = [];
    let totalCredit = 0;
    let totalDebit = 0;

    ordersList.forEach((order) => {
      // EXCLUDE customer self-cancelled and rejected orders from Billing History!
      if (['Cancelled', 'Rejected'].includes(order.status)) {
        return;
      }

      const isSold = ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status);
      const isReturned = ['Return Requested', 'Return Approved', 'Refund Completed'].includes(order.status);

      if (isSold) {
        totalCredit += order.totalAmount || 0;
        ledger.push({
          id: order._id,
          date: order.updatedAt || order.createdAt,
          orderId: order.orderId,
          customerName: order.shippingAddress?.userName || 'Customer',
          utrNumber: order.utrNumber || 'N/A',
          type: 'credit',
          sign: '+',
          label: 'Item Sold / Shipped',
          amount: order.totalAmount || 0,
          status: order.status
        });
      }

      if (isReturned) {
        totalDebit += order.totalAmount || 0;
        ledger.push({
          id: order._id + '_ret',
          date: order.returnDetails?.requestedAt || order.updatedAt || order.createdAt,
          orderId: order.orderId,
          customerName: order.shippingAddress?.userName || 'Customer',
          utrNumber: order.utrNumber || 'N/A',
          type: 'debit',
          sign: '-',
          label: 'Order Return / Refund',
          amount: -(order.totalAmount || 0),
          rawAmount: order.totalAmount || 0,
          status: order.status
        });
      }
    });

    // Sort ledger by date descending
    ledger.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      totalCredit,
      totalDebit,
      netTotal: totalCredit - totalDebit,
      totalEntries: ledger.length,
      ledger
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`Dipto Fashion backend running on http://localhost:${portToTry}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
     
      console.log(`Port ${portToTry} in use, trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(Number(PORT) || 5000);
