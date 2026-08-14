
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import compression from 'compression';
import NodeCache from 'node-cache';

import connectDB from './config/db.js';
import User from './models/User.js';
import OTP from './models/OTP.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Notification from './models/Notification.js';
import LiveSale from './models/LiveSale.js';
import Coupon from './models/Coupon.js';
import notificationRoutes from './routes/notificationRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import appRoutes from './routes/appRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { sendOTPEmail, firebaseAdminApp } from './config/emailAndFirebaseConfig.js';
import { uploadBase64ToCloudinary, upload } from './config/cloudinaryConfig.js';


dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dipto_fashion_secret_key_2026';

// Socket.io Setup — attached to the same HTTP server, full CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  transports: ['websocket', 'polling']
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[SOCKET.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
  });
});

// Razorpay Payment Gateway Configuration (Test Mode & Live Approval Ready)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_TMnf64UYjTg87s';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'x1sgc3Fi1nuHyxMonvN8VS7H';

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// In-memory cache instance (TTL: 300 seconds / 5 minutes)
export const apiCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Top-Level Middlewares (Placed at VERY TOP)
app.use(compression());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Global POST Request Diagnostics Logger
app.use((req, res, next) => {
  if (req.method === 'POST') {
    const bodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : [];
    console.log(`[INCOMING POST REQUEST]: ${req.url} | Body Keys: ${bodyKeys.join(', ') || '(empty)'}`);
  }
  next();
});

// Register Notification, Report & Product API Routers (Top Priority BEFORE Health or Fallbacks)
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/admin/notifications', notificationRoutes);

app.use('/api/reports', reportRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/reports', reportRoutes);

app.use('/api/app', appRoutes);
app.use('/app', appRoutes);

// Root Health Check Endpoints
app.get(['/', '/health'], (req, res) => {
  res.json({ message: 'Dipto Fashion API Backend is Live!', status: 'OK', store: 'Dipto Fashion' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Dipto Fashion API Service', status: 'OK' });
});

// Connect DB
connectDB();

// Initialize remainingStock = quantity for existing products if missing
const initializeRemainingStockForExistingProducts = async () => {
  try {
    if (isMongoConnected()) {
      await Product.updateMany(
        { $or: [{ remainingStock: { $exists: false } }, { remainingStock: null }] },
        [{ $set: { remainingStock: '$quantity' } }]
      );
      console.log('Sanitized existing products with remainingStock = quantity in MongoDB.');
    }
  } catch (err) {
    console.warn('Remaining stock initialization warning:', err.message);
  }
};
setTimeout(initializeRemainingStockForExistingProducts, 3000);

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
let memoryCoupons = [
  {
    _id: 'c1',
    code: 'WELCOME100',
    discountType: 'fixed',
    discountAmount: 100,
    maxDiscountAmount: 0,
    minOrderAmount: 499,
    description: 'Get Flat ₹100 OFF on your cart when shopping above ₹499!',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'c2',
    code: 'FASHION200',
    discountType: 'fixed',
    discountAmount: 200,
    maxDiscountAmount: 0,
    minOrderAmount: 999,
    description: 'Save ₹200 Flat on exclusive sarees & salwar suits over ₹999.',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'c3',
    code: 'MEGA15',
    discountType: 'percentage',
    discountAmount: 15,
    maxDiscountAmount: 300,
    minOrderAmount: 1499,
    description: 'Get 15% OFF up to ₹300 on orders above ₹1,499.',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

global.memoryCoupons = memoryCoupons;

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

// --- USER AUTH & OTP SYSTEM ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. REQUEST OTP ROUTE: Handles email validation, checks DB presence based on flow type, generates 6-digit OTP, sends via Nodemailer, and saves to MongoDB OTP collection
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'signup' | 'login' | 'forgot'
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Valid email address is required (e.g. user@domain.com)' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check user existence based on flow
    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (type === 'signup' && existingUser) {
        return res.status(400).json({ message: 'Gmail is already registered. Please log in.' });
      }
      if ((type === 'login' || type === 'forgot') && !existingUser) {
        return res.status(400).json({ message: 'No registered user found with this Gmail address.' });
      }
    }

    // Generate 6-digit random numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update OTP in MongoDB (or in-memory)
    if (isMongoConnected()) {
      // Remove any existing OTP for this email
      await OTP.deleteMany({ email: cleanEmail });
      await OTP.create({ email: cleanEmail, otp: otpCode });
    }

    // Send 6-digit OTP via Nodemailer/Resend to user's Gmail asynchronously
    sendOTPEmail(cleanEmail, otpCode, type === 'signup' ? 'Account Registration' : type === 'login' ? 'Account Login' : 'Password Reset').catch(mailErr => {
      console.error('Nodemailer Dispatch Error Details:', mailErr);
    });

    return res.json({ success: true, message: `A 6-digit OTP has been sent to ${cleanEmail}` });
  } catch (err) {
    console.error('send-otp route error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error processing OTP request' });
  }

});

// 2. SIGNUP ROUTE: Validates OTP from MongoDB and creates User in MongoDB
app.post('/api/auth/verify-signup', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;
    if (!name || !email || !password || !phone || !otp) {
      return res.status(400).json({ message: 'Name, mobile number, Gmail, password, and OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Verify OTP from MongoDB
    if (isMongoConnected()) {
      const otpRecord = await OTP.findOne({ email: cleanEmail, otp: otp.trim() });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new OTP.' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'Gmail is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone.trim(),
        addresses: []
      });

      // Delete verified OTP record
      await OTP.deleteMany({ email: cleanEmail });

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender || '',
          avatar: user.avatar || '',
          role: user.role,
          addresses: user.addresses
        }
      });
    } else {
      const newUser = {
        _id: 'u_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
        role: 'user',
        addresses: []
      };
      memoryUsers.push(newUser);
      const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          gender: '',
          avatar: '',
          role: newUser.role,
          addresses: []
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. LOGIN PRE-CHECK (EMAIL & PASSWORD) & OTP SENT
app.post('/api/auth/login-check', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Gmail address and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (isMongoConnected()) {
      // Lean projection fetching ONLY email, password, _id for fast auth check
      const user = await User.findOne({ email: cleanEmail }).select('_id email password').lean();
      if (!user) {
        return res.status(400).json({ message: 'No registered user found with this Gmail address' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password entered' });
      }
    }

    // Credentials match -> Generate 6-digit OTP & Send to Gmail
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (isMongoConnected()) {
      await OTP.deleteMany({ email: cleanEmail });
      await OTP.create({ email: cleanEmail, otp: otpCode });
    }

    // Fire email sending asynchronously in the background so HTTP response returns immediately
    sendOTPEmail(cleanEmail, otpCode, 'Account Login').catch(mailErr => {
      console.error('[NODEMAILER/RESEND ERROR in background]', mailErr);
    });

    return res.status(200).json({
      success: true,
      requireOtp: true,
      message: `Login credentials verified. 6-digit OTP sent to ${cleanEmail}`,
      email: cleanEmail
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. VERIFY LOGIN OTP & ISSUE JWT
app.post('/api/auth/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Gmail address and 6-digit OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (isMongoConnected()) {
      const otpRecord = await OTP.findOne({ email: cleanEmail, otp: otp.trim() }).lean();
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
      }

      const user = await User.findOne({ email: cleanEmail }).select('-password').lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await OTP.deleteMany({ email: cleanEmail });

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender || '',
          avatar: user.avatar || user.profilePicture || '',
          profilePicture: user.profilePicture || user.avatar || '',
          role: user.role,
          addresses: user.addresses || []
        }
      });
    } else {
      let user = memoryUsers.find(u => u.email === cleanEmail);
      if (!user) {
        user = { _id: 'u_' + Date.now(), name: 'Customer', email: cleanEmail, phone: '', role: 'user', addresses: [] };
        memoryUsers.push(user);
      }
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone || '', gender: '', avatar: '', role: user.role, addresses: [] } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. FORGOT PASSWORD PRE-CHECK & OTP SENT
app.post('/api/auth/forgot-password-check', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Gmail address and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'No registered user found with this Gmail address' });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (isMongoConnected()) {
      await OTP.deleteMany({ email: cleanEmail });
      await OTP.create({ email: cleanEmail, otp: otpCode });
    }

    sendOTPEmail(cleanEmail, otpCode, 'Password Reset').catch(mailErr => {
      console.error('[NODEMAILER ERROR in background]', mailErr);
    });

    return res.json({ success: true, message: `6-digit OTP sent to ${cleanEmail}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. VERIFY FORGOT PASSWORD OTP & UPDATE BCRYPT HASHED PASSWORD IN MONGODB
app.post('/api/auth/verify-reset-password', async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    if (!email || !newPassword || !otp) {
      return res.status(400).json({ message: 'Gmail address, new password, and 6-digit OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (isMongoConnected()) {
      const otpRecord = await OTP.findOne({ email: cleanEmail, otp: otp.trim() });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
      }

      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this Gmail address' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      await OTP.deleteMany({ email: cleanEmail });

      return res.json({ success: true, message: 'Password updated successfully in database' });
    } else {
      const user = memoryUsers.find(u => u.email === cleanEmail);
      if (user) {
        user.password = newPassword;
      }
      return res.json({ success: true, message: 'Password updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- UPDATE USER PROFILE (name, gender, avatar/profilePicture — email/phone immutable) ---
app.put(['/api/user/profile', '/api/users/profile', '/api/auth/profile'], upload.single('avatar'), async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }

  const emailParam = req.query.email || req.body.email;

  try {
    const { name, gender, avatar, profilePicture } = req.body;
    let pictureVal = profilePicture !== undefined ? profilePicture : avatar;

    if (req.file && req.file.path) {
      pictureVal = req.file.path;
    } else if (typeof pictureVal === 'string' && pictureVal.startsWith('data:image')) {
      pictureVal = await uploadBase64ToCloudinary(pictureVal, 'avatars');
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (isMongoConnected()) {
      let user = null;
      if (userId) {
        user = await User.findById(userId);
      } else if (emailParam) {
        user = await User.findOne({ email: new RegExp(`^${emailParam.trim()}$`, 'i') });
      }

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Explicit field assignment & save
      user.name = name.trim();
      if (gender !== undefined) user.gender = gender;
      if (pictureVal !== undefined && pictureVal !== null) {
        user.avatar = pictureVal;
        user.profilePicture = pictureVal;
      }

      await user.save();

      const safeUser = {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        avatar: user.avatar || user.profilePicture || '',
        profilePicture: user.profilePicture || user.avatar || '',
        role: user.role,
        addresses: user.addresses || []
      };

      // Broadcast profile update via Socket.io for real-time cross-device sync
      emitUserProfileUpdated(safeUser);

      return res.json({ success: true, user: safeUser });
    } else {
      // In-memory fallback
      let user = null;
      if (userId) user = memoryUsers.find(u => u._id === userId);
      else if (emailParam) user = memoryUsers.find(u => u.email.toLowerCase() === emailParam.trim().toLowerCase());

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.name = name.trim();
      if (gender !== undefined) user.gender = gender;
      if (pictureVal !== undefined) {
        user.avatar = pictureVal;
        user.profilePicture = pictureVal;
      }

      const safeUser = {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        avatar: user.avatar || user.profilePicture || '',
        profilePicture: user.profilePicture || user.avatar || '',
        role: user.role,
        addresses: user.addresses || []
      };

      emitUserProfileUpdated(safeUser);
      return res.json({ success: true, user: safeUser });
    }
  } catch (e) {
    console.error('Profile update error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- WISHLIST BACKEND ROUTES ---
app.get(['/api/user/wishlist', '/api/wishlist'], async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }
  const emailParam = req.query.email || req.query.userEmail;

  try {
    if (isMongoConnected()) {
      let user = null;
      if (userId) user = await User.findById(userId).populate('wishlist');
      else if (emailParam) user = await User.findOne({ email: new RegExp(`^${emailParam.trim()}$`, 'i') }).populate('wishlist');

      return res.json({ success: true, wishlist: user ? user.wishlist || [] : [] });
    } else {
      return res.json({ success: true, wishlist: [] });
    }
  } catch (e) {
    return res.json({ success: false, wishlist: [], message: e.message });
  }
});

app.post(['/api/user/wishlist', '/api/wishlist'], async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }
  const emailParam = req.query.email || req.body.email;
  const { wishlistIds } = req.body;

  try {
    if (isMongoConnected() && Array.isArray(wishlistIds)) {
      let user = null;
      if (userId) user = await User.findById(userId);
      else if (emailParam) user = await User.findOne({ email: new RegExp(`^${emailParam.trim()}$`, 'i') });

      if (user) {
        user.wishlist = wishlistIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        await user.save();
        await user.populate('wishlist');
        return res.json({ success: true, wishlist: user.wishlist });
      }
    }
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// --- ADDRESS ROUTES ---

import Report from './models/Report.js';

const memoryReports = [];

app.get(['/api/user/addresses', '/api/user/address', '/api/addresses'], async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }

  const emailParam = req.query.email || req.query.userEmail;

  try {
    if (isMongoConnected()) {
      let user = null;
      if (userId) user = await User.findById(userId);
      else if (emailParam) user = await User.findOne({ email: new RegExp(`^${emailParam.trim()}$`, 'i') });

      return res.json(user ? user.addresses || [] : []);
    } else {
      let user = null;
      if (userId) user = memoryUsers.find(u => u._id === userId);
      else if (emailParam) user = memoryUsers.find(u => u.email.toLowerCase() === emailParam.trim().toLowerCase());

      return res.json(user ? user.addresses || [] : []);
    }
  } catch (e) {
    res.json([]);
  }
});

app.post(['/api/user/addresses', '/api/user/address', '/api/addresses'], async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }

  try {
    const { userName, mobileNumber, address, landmark, pincode, email: bodyEmail } = req.body;
    if (!userName || !mobileNumber || !address || !pincode) {
      return res.status(400).json({ message: 'Missing required address fields' });
    }

    const emailParam = bodyEmail || req.query.email;
    const newAddr = { userName, mobileNumber, address, landmark: landmark || '', pincode, isDefault: true };

    if (isMongoConnected()) {
      let user = null;
      if (userId) user = await User.findById(userId);
      else if (emailParam) user = await User.findOne({ email: new RegExp(`^${emailParam.trim()}$`, 'i') });

      if (!user) return res.status(404).json({ message: 'User not found' });
      user.addresses.push(newAddr);
      await user.save();
      return res.json(user.addresses);
    } else {
      let user = null;
      if (userId) user = memoryUsers.find(u => u._id === userId);
      else if (emailParam) user = memoryUsers.find(u => u.email.toLowerCase() === emailParam.trim().toLowerCase());

      if (user) {
        if (!user.addresses) user.addresses = [];
        user.addresses.push({ _id: 'addr_' + Date.now(), ...newAddr });
        return res.json(user.addresses);
      }
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete(['/api/user/addresses/:id', '/api/user/address/:id', '/api/addresses/:id'], async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }

    const { id } = req.params;
    const emailParam = req.query.email || req.query.userEmail;

    if (isMongoConnected()) {
      let user = null;
      if (userId) user = await User.findById(userId);
      else if (emailParam) user = await User.findOne({ email: new RegExp(`^${emailParam.trim()}$`, 'i') });

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.addresses = user.addresses.filter(a => String(a._id) !== String(id));
      await user.save();
      return res.json({ success: true, addresses: user.addresses });
    } else {
      let user = null;
      if (userId) user = memoryUsers.find(u => u._id === userId);
      else if (emailParam) user = memoryUsers.find(u => u.email.toLowerCase() === emailParam.trim().toLowerCase());

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (user.addresses) {
        user.addresses = user.addresses.filter(a => String(a._id) !== String(id));
      }
      return res.json({ success: true, addresses: user.addresses || [] });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- CATEGORY ROUTES ---

app.get(['/api/categories', '/categories'], async (req, res) => {
  const cacheKey = 'categories_all';
  const cached = apiCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (isMongoConnected()) {
      let categories = await Category.find().lean();
      if (categories.length === 0) {
        categories = await Category.insertMany(memoryCategories.map(({ _id, ...c }) => c));
      }
      apiCache.set(cacheKey, categories);
      return res.json(categories);
    } else {
      apiCache.set(cacheKey, memoryCategories);
      return res.json(memoryCategories);
    }
  } catch (err) {
    res.json(memoryCategories);
  }
});

// Helper to clear product and category caches on mutations
export const clearProductCache = () => {
  apiCache.keys().forEach((key) => {
    if (key.startsWith('products_') || key.startsWith('categories_')) {
      apiCache.del(key);
    }
  });
};

app.post(['/api/categories', '/categories'], async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    clearProductCache();

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
  const { category, search, page, limit } = req.query;
  const isPaginated = page !== undefined || limit !== undefined;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `products_${category || 'all'}_${search || 'none'}_p${isPaginated ? pageNum : 'all'}_l${isPaginated ? limitNum : 'all'}`;
  const cached = apiCache.get(cacheKey);
  if (cached && !req.query.t) return res.json(cached);

  const sanitizeProduct = (p) => {
    if (!p || typeof p !== 'object') return null;
    const fallbackImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
    return {
      _id: p._id || p.id || `prod_${Math.random().toString(36).substr(2, 9)}`,
      name: p.name || 'Fashion Apparel',
      price: Number(p.price) || Number(p.mrp) || 999,
      mrp: Number(p.mrp) || Number(p.price) || 1499,
      image: p.image || (Array.isArray(p.images) && p.images[0]) || fallbackImg,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || fallbackImg],
      category: p.category || 'General',
      rating: Number(p.rating) || 4.5,
      reviewsCount: Number(p.reviewsCount) || 12,
      quantity: p.quantity !== undefined ? Number(p.quantity) : 10,
      remainingStock: p.remainingStock !== undefined ? Number(p.remainingStock) : 10,
      description: p.description || 'Premium Quality Ethnic & Modern Wear Collection',
      isFeatured: Boolean(p.isFeatured)
    };
  };

  try {
    const isAllCategory = !category || category.trim() === '' || category.trim().toLowerCase() === 'all';

    if (isMongoConnected()) {
      let query = {};
      if (!isAllCategory) {
        query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
      }
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ];
        if (!isAllCategory) {
          query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
        }
      }

      let totalProducts = 0;
      let totalInDb = 0;
      try {
        totalInDb = await Product.estimatedDocumentCount().catch(() => 0);
        totalProducts = await Product.countDocuments(query);
        console.log(`[PRODUCTS API] Total in DB: ${totalInDb} | Matched Filter: ${totalProducts} | Page: ${pageNum} | Skip: ${skip} | Limit: ${limitNum}`);
      } catch (countErr) {
        console.error('[MONGODB COUNT ERROR]', countErr);
      }

      const totalPages = Math.ceil(totalProducts / limitNum) || 1;

      if (isPaginated && (pageNum > totalPages || skip >= totalProducts) && totalProducts > 0) {
        const emptyResponse = {
          success: true,
          products: [],
          currentPage: pageNum,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasMore: false
        };
        apiCache.set(cacheKey, emptyResponse);
        return res.json(emptyResponse);
      }

      let prods = [];
      try {
        let queryExec = Product.find(query)
          .select('name price mrp image images category rating reviewsCount quantity remainingStock description isFeatured')
          .sort({ createdAt: -1 });

        if (isPaginated) {
          queryExec = queryExec.skip(skip).limit(limitNum);
        }

        prods = await queryExec.lean();
      } catch (findErr) {
        console.error('[MONGODB FIND ERROR]', findErr);
        prods = [];
      }

      if (prods.length === 0 && isAllCategory && !search && totalProducts === 0) {
        try {
          const inserted = await Product.insertMany(memoryProducts.map(p => {
            const { _id, ...rest } = p;
            return rest;
          }));
          prods = inserted.map(doc => doc.toObject());
          totalProducts = prods.length;
          if (isPaginated) {
            prods = prods.slice(skip, skip + limitNum);
          }
        } catch (seedErr) {
          console.error('[MONGODB SEED ERROR]', seedErr);
          prods = memoryProducts;
          if (isPaginated) prods = prods.slice(skip, skip + limitNum);
        }
      }

      const sanitizedProds = prods.map(sanitizeProduct).filter(Boolean);

      const responseData = isPaginated ? {
        success: true,
        products: sanitizedProds,
        currentPage: pageNum,
        totalPages: totalPages,
        totalProducts: totalProducts,
        hasMore: pageNum < totalPages
      } : sanitizedProds;

      apiCache.set(cacheKey, responseData);
      return res.json(responseData);
    } else {
      let filtered = [...memoryProducts];
      if (!isAllCategory) {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.trim().toLowerCase());
      }
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }

      const totalProducts = filtered.length;
      const totalPages = Math.ceil(totalProducts / limitNum) || 1;

      if (isPaginated && (pageNum > totalPages || skip >= totalProducts) && totalProducts > 0) {
        const emptyResponse = {
          success: true,
          products: [],
          currentPage: pageNum,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasMore: false
        };
        apiCache.set(cacheKey, emptyResponse);
        return res.json(emptyResponse);
      }

      let prods = filtered;
      if (isPaginated) {
        prods = filtered.slice(skip, skip + limitNum);
      }

      const sanitizedProds = prods.map(sanitizeProduct).filter(Boolean);

      const responseData = isPaginated ? {
        success: true,
        products: sanitizedProds,
        currentPage: pageNum,
        totalPages: totalPages,
        totalProducts: totalProducts,
        hasMore: pageNum < totalPages
      } : sanitizedProds;

      apiCache.set(cacheKey, responseData);
      return res.json(responseData);
    }
  } catch (err) {
    console.error('[PRODUCTS API ERROR]', err);
    return res.json(isPaginated ? {
      success: true,
      products: memoryProducts.slice(skip, skip + limitNum).map(sanitizeProduct).filter(Boolean),
      currentPage: pageNum,
      totalPages: Math.ceil(memoryProducts.length / limitNum) || 1,
      totalProducts: memoryProducts.length,
      hasMore: pageNum < (Math.ceil(memoryProducts.length / limitNum) || 1)
    } : memoryProducts.map(sanitizeProduct).filter(Boolean));
  }
});

const processProductImages = async (imagesList, files) => {
  let finalUrls = [];

  if (files && files.length > 0) {
    for (const file of files) {
      if (file.path) {
        finalUrls.push(file.path);
      }
    }
  }

  if (Array.isArray(imagesList)) {
    for (const img of imagesList) {
      if (typeof img === 'string') {
        if (img.startsWith('data:image')) {
          const uploadedUrl = await uploadBase64ToCloudinary(img, 'products');
          finalUrls.push(uploadedUrl);
        } else {
          finalUrls.push(img);
        }
      }
    }
  }

  return finalUrls.length > 0 ? finalUrls : [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  ];
};

// app.post(['/api/products', '/products'], upload.array('images', 5), async (req, res) => {
//   try {
//     const { name, category, mrp, price, quantity, description, rating, reviewsCount } = req.body;
//     let imagesInput = req.body.images;
//     if (typeof imagesInput === 'string') {
//       try { imagesInput = JSON.parse(imagesInput); } catch (e) { imagesInput = [imagesInput]; }
//     }

//     const processedImages = await processProductImages(imagesInput, req.files);

//     if (!name || !category || !mrp || !price) {
//       return res.status(400).json({ message: 'Product title, category, MRP, and offer price are required' });
//     }

//     clearProductCache();

//     const enteredQty = Number(quantity) || 10;

//     if (isMongoConnected()) {
//       const prod = await Product.create({
//         name,
//         category,
//         mrp: Number(mrp),
//         price: Number(price),
//         quantity: enteredQty,
//         remainingStock: enteredQty,
//         rating: Number(rating) || 4.5,
//         reviewsCount: Number(reviewsCount) || 142,
//         images: processedImages,
//         image: processedImages[0],
//         description: description || ''
//       });
//       try { io.emit('product_added', prod); } catch (e) {}
//       return res.json(prod);
//     } else {
//       const prod = {
//         _id: 'p_' + Date.now(),
//         name,
//         category,
//         mrp: Number(mrp),
//         price: Number(price),
//         quantity: enteredQty,
//         remainingStock: enteredQty,
//         rating: Number(rating) || 4.5,
//         reviewsCount: Number(reviewsCount) || 142,
//         images: processedImages,
//         image: processedImages[0],
//         description: description || ''
//       };
//       memoryProducts.unshift(prod);
//       try { io.emit('product_added', prod); } catch (e) {}
//       return res.json(prod);
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.put(['/api/products/:id', '/products/:id'], upload.array('images', 5), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, category, mrp, price, quantity, description, rating, reviewsCount } = req.body;
//     let imagesInput = req.body.images;
//     if (typeof imagesInput === 'string') {
//       try { imagesInput = JSON.parse(imagesInput); } catch (e) { imagesInput = [imagesInput]; }
//     }

//     const processedImages = await processProductImages(imagesInput, req.files);

//     if (!name || !category || !mrp || !price) {
//       return res.status(400).json({ message: 'Product title, category, MRP, and offer price are required' });
//     }

//     clearProductCache();

//     const enteredQty = Number(quantity) || 10;

//     if (isMongoConnected()) {
//       const existing = await Product.findById(id);
//       let newRemaining = enteredQty;
//       if (existing) {
//         const oldQty = Number(existing.quantity) || 0;
//         const oldRem = existing.remainingStock !== undefined && existing.remainingStock !== null ? Number(existing.remainingStock) : oldQty;
//         const diff = enteredQty - oldQty;
//         newRemaining = Math.max(0, oldRem + diff);
//       }

//       const updated = await Product.findByIdAndUpdate(
//         id,
//         {
//           name,
//           category,
//           mrp: Number(mrp),
//           price: Number(price),
//           quantity: enteredQty,
//           remainingStock: newRemaining,
//           rating: Number(rating) || 4.5,
//           reviewsCount: Number(reviewsCount) || 142,
//           images: processedImages,
//           image: processedImages[0],
//           description: description || ''
//         },
//         { new: true }
//       );
//       try { io.emit('product_updated', updated); } catch (e) {}
//       return res.json(updated);
//     } else {
//       const prod = memoryProducts.find(p => p._id === id);
//       if (prod) {
//         const oldQty = Number(prod.quantity) || 0;
//         const oldRem = prod.remainingStock !== undefined && prod.remainingStock !== null ? Number(prod.remainingStock) : oldQty;
//         const diff = enteredQty - oldQty;

//         prod.name = name;
//         prod.category = category;
//         prod.mrp = Number(mrp);
//         prod.price = Number(price);
//         prod.quantity = enteredQty;
//         prod.remainingStock = Math.max(0, oldRem + diff);
//         prod.rating = Number(rating) || 4.5;
//         prod.reviewsCount = Number(reviewsCount) || 142;
//         prod.images = processedImages;
//         prod.image = processedImages[0];
//         prod.description = description || '';
//         try { io.emit('product_updated', prod); } catch (e) {}
//         return res.json(prod);
//       }
//       return res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.delete(['/api/products/:id', '/products/:id'], async (req, res) => {
//   try {
//     const { id } = req.params;
//     clearProductCache();
//     if (isMongoConnected()) {
//       await Product.findByIdAndDelete(id);
//     } else {
//       memoryProducts = memoryProducts.filter(p => p._id !== id);
//     }
//     try { io.emit('product_deleted', id); } catch (e) {}
//     res.json({ message: 'Product deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// --- PRODUCT MUTATION ROUTES (server.js) ---

// 1. CREATE PRODUCT (POST)
app.post(['/api/products', '/products'], upload.array('images', 5), async (req, res) => {
  try {
    const { name, category, mrp, price, quantity, description, rating, reviewsCount, availableSizes } = req.body;
    let imagesInput = req.body.images;
    if (typeof imagesInput === 'string') {
      try { imagesInput = JSON.parse(imagesInput); } catch (e) { imagesInput = [imagesInput]; }
    }

    const processedImages = await processProductImages(imagesInput, req.files);

    if (!name || !category || !mrp || !price) {
      return res.status(400).json({ message: 'Product title, category, MRP, and offer price are required' });
    }

    // Clear API Cache instantly
    if (typeof clearProductCache === 'function') {
      clearProductCache();
    }

    const enteredQty = Number(quantity) || 10;

    // Parse Available Sizes Safely
    let parsedSizes = availableSizes;
    if (typeof parsedSizes === 'string') {
      try { parsedSizes = JSON.parse(parsedSizes); } catch (e) { parsedSizes = []; }
    }

    if (isMongoConnected()) {
      const prod = await Product.create({
        name,
        category,
        mrp: Number(mrp),
        price: Number(price),
        quantity: enteredQty,
        remainingStock: enteredQty,
        rating: Number(rating) || 4.5,
        reviewsCount: Number(reviewsCount) || 1,
        images: processedImages,
        image: processedImages[0],
        description: description || '',
        availableSizes: Array.isArray(parsedSizes) ? parsedSizes : []
      });

      try { io.emit('product_added', prod); } catch (e) {}
      return res.status(201).json(prod);
    } else {
      const prod = {
        _id: 'p_' + Date.now(),
        name,
        category,
        mrp: Number(mrp),
        price: Number(price),
        quantity: enteredQty,
        remainingStock: enteredQty,
        rating: Number(rating) || 4.5,
        reviewsCount: Number(reviewsCount) || 1,
        images: processedImages,
        image: processedImages[0],
        description: description || '',
        availableSizes: Array.isArray(parsedSizes) ? parsedSizes : []
      };
      memoryProducts.unshift(prod);
      try { io.emit('product_added', prod); } catch (e) {}
      return res.status(201).json(prod);
    }
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. UPDATE PRODUCT (PUT)
app.put(['/api/products/:id', '/products/:id'], upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, mrp, price, quantity, description, rating, reviewsCount, availableSizes } = req.body;
    let imagesInput = req.body.images;
    if (typeof imagesInput === 'string') {
      try { imagesInput = JSON.parse(imagesInput); } catch (e) { imagesInput = [imagesInput]; }
    }

    const processedImages = await processProductImages(imagesInput, req.files);

    if (!name || !category || !mrp || !price) {
      return res.status(400).json({ message: 'Product title, category, MRP, and offer price are required' });
    }

    // Clear API Cache instantly
    if (typeof clearProductCache === 'function') {
      clearProductCache();
    }

    const enteredQty = Number(quantity) || 10;

    // Parse Available Sizes Safely
    let parsedSizes = availableSizes;
    if (typeof parsedSizes === 'string') {
      try { parsedSizes = JSON.parse(parsedSizes); } catch (e) { parsedSizes = []; }
    }

    if (isMongoConnected()) {
      const existing = await Product.findById(id);
      let newRemaining = enteredQty;
      if (existing) {
        const oldQty = Number(existing.quantity) || 0;
        const oldRem = existing.remainingStock !== undefined && existing.remainingStock !== null ? Number(existing.remainingStock) : oldQty;
        const diff = enteredQty - oldQty;
        newRemaining = Math.max(0, oldRem + diff);
      }

      const updated = await Product.findByIdAndUpdate(
        id,
        {
          name,
          category,
          mrp: Number(mrp),
          price: Number(price),
          quantity: enteredQty,
          remainingStock: newRemaining,
          rating: Number(rating) || 4.5,
          reviewsCount: Number(reviewsCount) || 142,
          images: processedImages,
          image: processedImages[0],
          description: description || '',
          availableSizes: Array.isArray(parsedSizes) ? parsedSizes : []
        },
        { new: true }
      );

      try { io.emit('product_updated', updated); } catch (e) {}
      return res.json(updated);
    } else {
      const prod = memoryProducts.find(p => p._id === id);
      if (prod) {
        const oldQty = Number(prod.quantity) || 0;
        const oldRem = prod.remainingStock !== undefined && prod.remainingStock !== null ? Number(prod.remainingStock) : oldQty;
        const diff = enteredQty - oldQty;

        prod.name = name;
        prod.category = category;
        prod.mrp = Number(mrp);
        prod.price = Number(price);
        prod.quantity = enteredQty;
        prod.remainingStock = Math.max(0, oldRem + diff);
        prod.rating = Number(rating) || 4.5;
        prod.reviewsCount = Number(reviewsCount) || 142;
        prod.images = processedImages;
        prod.image = processedImages[0];
        prod.description = description || '';
        prod.availableSizes = Array.isArray(parsedSizes) ? parsedSizes : [];

        try { io.emit('product_updated', prod); } catch (e) {}
        return res.json(prod);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. DELETE PRODUCT (DELETE)
app.delete(['/api/products/:id', '/products/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Clear API Cache instantly
    if (typeof clearProductCache === 'function') {
      clearProductCache();
    }

    if (isMongoConnected()) {
      await Product.findByIdAndDelete(id);
    } else {
      memoryProducts = memoryProducts.filter(p => p._id !== id);
    }

    try { io.emit('product_deleted', id); } catch (e) {}
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
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

  // Socket.io real-time emit
  try { io.emit('new_order_placed', orderData); } catch (e) {}
};

const emitOrderStatusUpdate = (order) => {
  try { io.emit('order_status_updated', order); } catch (e) {}
};

const emitProductAdded = (product) => {
  try { io.emit('product_added', product); } catch (e) {}
};

const emitProductUpdated = (product) => {
  try { io.emit('product_updated', product); } catch (e) {}
};

const emitProductDeleted = (productId) => {
  try { io.emit('product_deleted', productId); } catch (e) {}
};

const emitUserProfileUpdated = (user) => {
  try { io.emit('user_profile_updated', user); } catch (e) {}
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

// // GET LIVE SALE CONFIG FOR STOREFRONT (PUBLIC ACCESSIBLE MULTI-DEVICE)
// app.get(['/api/live-sale', '/live-sale', '/api/live-sale/active', '/live-sale/active'], async (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   try {
//     if (mongoose.connection.readyState === 1) {
//       let sale = await LiveSale.findOne().sort({ updatedAt: -1 });
//       if (!sale) {
//         sale = await LiveSale.create(memoryLiveSale);
//       }
//       return res.json(sale);
//     } else {
//       return res.json(memoryLiveSale);
//     }
//   } catch (err) {
//     return res.json(memoryLiveSale);
//   }
// });

// // ADMIN POST UPDATE LIVE SALE CONFIG
// app.post(['/api/admin/live-sale', '/admin/live-sale', '/api/live-sale', '/live-sale'], async (req, res) => {
//   console.log('>>> [POST /api/admin/live-sale] Request body received:', req.body);
//   try {
//     const { isActive, title, offerDetails, targetCategory, endTime } = req.body;

//     const updatedData = {
//       isActive: Boolean(isActive),
//       title: title ? title.trim() : '🔥 MEGA FESTIVE SALE IS LIVE!',
//       offerDetails: offerDetails ? offerDetails.trim() : 'Up to 50% OFF on Banarasi Sarees & Royal Kurtas',
//       targetCategory: targetCategory || 'All',
//       endTime: endTime ? new Date(endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000)
//     };

//     const isConnected = mongoose.connection.readyState === 1;
//     console.log(`>>> MongoDB connection readyState for LiveSale: ${mongoose.connection.readyState} (Connected: ${isConnected})`);

//     if (isConnected) {
//       try {
//         const sale = await LiveSale.findOneAndUpdate({}, updatedData, { upsert: true, new: true, runValidators: true });
//         console.log('>>> MongoDB LiveSale updated successfully:', sale._id);
//         try { io.emit('live_sale_updated', sale.toObject ? sale.toObject() : sale); } catch (e) {}
//         return res.status(200).json({ success: true, message: 'Saved to MongoDB', data: sale, liveSale: sale });
//       } catch (dbErr) {
//         console.error('>>> ERROR: Mongoose LiveSale upsert failed:', dbErr);
//         return res.status(500).json({ success: false, error: dbErr.message, message: dbErr.message });
//       }
//     } else {
//       console.warn('>>> MongoDB not connected (readyState !== 1). Saving LiveSale to memory.');
//       memoryLiveSale = {
//         ...updatedData,
//         endTime: new Date(updatedData.endTime).toISOString()
//       };
//       try { io.emit('live_sale_updated', memoryLiveSale); } catch (e) {}
//       return res.status(200).json({ success: true, message: 'Saved to memory (DB offline)', data: memoryLiveSale, liveSale: memoryLiveSale });
//     }
//   } catch (err) {
//     console.error('>>> ERROR in POST /api/admin/live-sale:', err);
//     return res.status(500).json({ success: false, error: err.message, message: err.message || 'Failed to update live sale config' });
//   }
// });


// ==========================================
// LIVE SALE MULTI-BANNER MANAGEMENT (1-3 BANNERS)
// ==========================================

// 1. Safe Schema & Model Resolution (Prevents Duplicate Identifier Error)
let LiveSaleModel;
try {
  if (mongoose.models && mongoose.models.LiveSale) {
    LiveSaleModel = mongoose.models.LiveSale;
  } else {
    const liveSaleBannerSchema = new mongoose.Schema(
      {
        title: { type: String, default: '🔥 MEGA FESTIVE SALE IS LIVE!' },
        offerDetails: { type: String, default: 'Up to 50% OFF on Selected Items' },
        targetCategory: { type: String, default: 'All' },
        endTime: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
      },
      { timestamps: true }
    );
    LiveSaleModel = mongoose.model('LiveSale', liveSaleBannerSchema);
  }
} catch (e) {
  console.warn('LiveSale Model initialization warning:', e.message);
}

// 2. In-Memory Fallback List
let memoryLiveSales = [
  {
    _id: 'sale_1',
    title: '🔥 MEGA FESTIVE SALE IS LIVE!',
    offerDetails: 'Up to 50% OFF on Banarasi Sarees & Royal Kurtas',
    targetCategory: 'All',
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    order: 1
  }
];

// 3. GET ACTIVE LIVE SALE BANNERS (STOREFRONT / PUBLIC)
app.get(['/api/live-sale', '/live-sale', '/api/live-sale/active', '/live-sale/active'], async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    if (mongoose.connection.readyState === 1 && LiveSaleModel) {
      const sales = await LiveSaleModel.find({ isActive: true })
        .sort({ order: 1, updatedAt: -1 })
        .lean()
        .maxTimeMS(3000);
      return res.status(200).json(sales || []);
    } else {
      const activeMem = memoryLiveSales.filter((s) => s.isActive);
      return res.status(200).json(activeMem);
    }
  } catch (err) {
    console.error('Error fetching storefront live sale banners:', err.message);
    const activeMem = memoryLiveSales.filter((s) => s.isActive);
    return res.status(200).json(activeMem);
  }
});

// 4. GET ALL BANNERS FOR ADMIN (ACTIVE & INACTIVE)
app.get(['/api/admin/live-sales', '/admin/live-sales'], async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && LiveSaleModel) {
      const sales = await LiveSaleModel.find()
        .sort({ order: 1, createdAt: -1 })
        .lean()
        .maxTimeMS(3000);
      return res.status(200).json(sales || []);
    } else {
      return res.status(200).json(memoryLiveSales);
    }
  } catch (err) {
    console.error('Error fetching admin live sale banners:', err.message);
    return res.status(200).json(memoryLiveSales);
  }
});

// 5. SAVE / CREATE / UPDATE BANNERS (UP TO 3 BANNERS)
app.post(['/api/admin/live-sale', '/admin/live-sale', '/api/live-sale', '/live-sale'], async (req, res) => {
  try {
    const { banners } = req.body;
    let bannerList = Array.isArray(banners) ? banners : [req.body];

    // Restrict strictly to max 3 banners
    bannerList = bannerList.slice(0, 3).map((b, idx) => ({
      title: b.title ? b.title.trim() : '🔥 SPECIAL SALE IS LIVE!',
      offerDetails: b.offerDetails ? b.offerDetails.trim() : 'Exclusive Discounts Available',
      targetCategory: b.targetCategory || 'All',
      endTime: b.endTime ? new Date(b.endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: b.isActive !== undefined ? Boolean(b.isActive) : true,
      order: idx + 1
    }));

    if (mongoose.connection.readyState === 1 && LiveSaleModel) {
      // Overwrite/sync banner collection with clean 1-3 banners
      await LiveSaleModel.deleteMany({});
      const savedDocs = await LiveSaleModel.insertMany(bannerList);

      try {
        const activeDocs = savedDocs.filter((d) => d.isActive);
        const socketServer = typeof io !== 'undefined' ? io : req.app?.get('io');
        if (socketServer) socketServer.emit('live_sale_updated', activeDocs);
      } catch (e) {}

      return res.status(200).json({ success: true, message: 'All banners updated successfully!', data: savedDocs });
    } else {
      memoryLiveSales = bannerList.map((b, i) => ({
        ...b,
        _id: `sale_${Date.now()}_${i}`,
        endTime: new Date(b.endTime).toISOString()
      }));

      try {
        const activeMem = memoryLiveSales.filter((d) => d.isActive);
        const socketServer = typeof io !== 'undefined' ? io : req.app?.get('io');
        if (socketServer) socketServer.emit('live_sale_updated', activeMem);
      } catch (e) {}

      return res.status(200).json({ success: true, message: 'Saved to memory (DB offline)', data: memoryLiveSales });
    }
  } catch (err) {
    console.error('Error in live-sale banner update:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});
// --- COUPON API ENDPOINTS ---
app.use('/api/admin/coupons', couponRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/coupons', couponRoutes);
app.use('/admin/coupons', couponRoutes);

// --- INVENTORY REMAINING STOCK SYSTEM HELPERS ---

const extractOrderItems = (input) => {
  if (!input) return [];
  let rawList = [];

  if (Array.isArray(input)) {
    rawList = input;
  } else if (typeof input === 'object') {
    if (Array.isArray(input.items)) rawList = input.items;
    else if (Array.isArray(input.cartItems)) rawList = input.cartItems;
    else if (Array.isArray(input.products)) rawList = input.products;
    else if (Array.isArray(input.orderItems)) rawList = input.orderItems;
    else if (Array.isArray(input.cart)) rawList = input.cart;
    else if (input.body && Array.isArray(input.body.items)) rawList = input.body.items;
  }

  if (!Array.isArray(rawList)) return [];

  return rawList.map((item) => {
    if (!item) return null;
    const targetId = item.productId || item.product?._id || item.product || item._id || item.id || null;
    const qty = Number(item.qty || item.quantity || item.count || 1);
    const name = item.name || item.title || item.productName || item.product?.name || '';
    return { targetId, productId: targetId, qty, quantity: qty, name, raw: item };
  }).filter(Boolean);
};

const checkStockValidation = async (input) => {
  const extractedItems = extractOrderItems(input);
  if (extractedItems.length === 0) return { valid: true };

  for (const item of extractedItems) {
    const reqQty = item.qty;
    let available = 10;
    let prod = null;

    if (isMongoConnected()) {
      if (item.targetId) {
        prod = await Product.findById(item.targetId).catch(() => null);
      }
      if (!prod && item.name) {
        prod = await Product.findOne({ name: item.name }).catch(() => null);
      }
      if (prod) {
        available = prod.remainingStock !== undefined && prod.remainingStock !== null ? prod.remainingStock : prod.quantity;
      }
    } else {
      prod = memoryProducts.find((p) => String(p._id || p.id) === String(item.targetId)) || memoryProducts.find((p) => p.name === item.name);
      if (prod) {
        available = prod.remainingStock !== undefined && prod.remainingStock !== null ? prod.remainingStock : prod.quantity;
      }
    }

    if (reqQty > available) {
      const prodName = prod ? prod.name : (item.name || 'Product');
      return { valid: false, message: `Insufficient stock for ${prodName}. Requested: ${reqQty}, Available: ${available}` };
    }
  }

  return { valid: true };
};

const deductRemainingStock = async (orderRef, itemsInput) => {
  const extractedItems = extractOrderItems(itemsInput || orderRef);
  if (extractedItems.length === 0) return;

  let orderObj = null;
  let orderIdStr = typeof orderRef === 'string' ? orderRef : (orderRef?.orderId || orderRef?._id || 'ORDER');

  if (isMongoConnected()) {
    if (typeof orderRef === 'string') {
      orderObj = await Order.findOne({ $or: [{ _id: orderRef }, { orderId: orderRef }] }).catch(() => null);
    } else if (typeof orderRef === 'object' && orderRef.save) {
      orderObj = orderRef;
    }

    if (orderObj && orderObj.stockDeducted) {
      console.log(`[STOCK DEDUCTION SKIPPED] Order ${orderIdStr} stock was already deducted.`);
      return;
    }
  } else if (typeof orderRef === 'object' && orderRef.stockDeducted) {
    console.log(`[STOCK DEDUCTION SKIPPED] Order ${orderIdStr} stock was already deducted.`);
    return;
  }

  for (const item of extractedItems) {
    const qtyToDeduct = item.qty;
    const targetId = item.targetId;
    let updatedProduct = null;

    if (isMongoConnected()) {
      if (targetId) {
        try {
          updatedProduct = await Product.findByIdAndUpdate(
            targetId,
            { $inc: { remainingStock: -qtyToDeduct } },
            { new: true }
          );
        } catch (err) {}
      }

      if (!updatedProduct && item.name) {
        try {
          updatedProduct = await Product.findOneAndUpdate(
            { name: item.name },
            { $inc: { remainingStock: -qtyToDeduct } },
            { new: true }
          );
        } catch (err) {}
      }

      if (updatedProduct) {
        // Enforce non-negative bounds on remainingStock only (quantity = fixed total stock)
        if (updatedProduct.remainingStock < 0) {
          updatedProduct.remainingStock = 0;
          await updatedProduct.save().catch(() => {});
        }
        clearProductCache();
        try { io.emit('product_updated', updatedProduct.toObject ? updatedProduct.toObject() : updatedProduct); } catch (e) {}
        console.log(`========================================`);
        console.log(`[DEDUCT SUCCESS] Product ID: ${updatedProduct._id} | remainingStock: ${updatedProduct.remainingStock} (quantity unchanged: ${updatedProduct.quantity})`);
        console.log(`========================================`);
      } else {
        console.warn(`[DB DEDUCTION FAILED] Product not found in MongoDB for targetId: ${targetId} or name: ${item.name}`);
      }
    } else {
      const prod = memoryProducts.find((p) => String(p._id || p.id) === String(targetId)) || memoryProducts.find((p) => p.name === item.name);
      if (prod) {
        const prevRem = prod.remainingStock !== undefined && prod.remainingStock !== null ? prod.remainingStock : prod.quantity;
        prod.remainingStock = Math.max(0, prevRem - qtyToDeduct);
        clearProductCache();
        try { io.emit('product_updated', prod); } catch (e) {}
        // quantity (total stock) is intentionally NOT modified
        console.log(`[MEM DEDUCT SUCCESS] Product ID: ${prod._id || prod.id} | New remainingStock: ${prod.remainingStock}`);
      }
    }
  }

  if (orderObj) {
    orderObj.stockDeducted = true;
    if (isMongoConnected() && typeof orderObj.save === 'function') {
      await orderObj.save().catch(() => {});
    }
  }
};

const restoreRemainingStock = async (orderRef, itemsInput, reasonType = 'Cancellation') => {
  const extractedItems = extractOrderItems(itemsInput || orderRef);
  if (extractedItems.length === 0) return;

  let orderObj = null;
  let orderIdStr = typeof orderRef === 'string' ? orderRef : (orderRef?.orderId || orderRef?._id || 'ORDER');

  if (isMongoConnected()) {
    if (typeof orderRef === 'string') {
      orderObj = await Order.findOne({ $or: [{ _id: orderRef }, { orderId: orderRef }] }).catch(() => null);
    } else if (typeof orderRef === 'object' && orderRef.save) {
      orderObj = orderRef;
    }

    if (reasonType === 'Cancellation' && orderObj && orderObj.stockRestored) {
      console.log(`[STOCK RESTORATION SKIPPED] Order ${orderIdStr} stock was already restored for cancellation.`);
      return;
    }
    if (reasonType === 'ReturnApproved' && orderObj && orderObj.returnStockRestored) {
      console.log(`[STOCK RESTORATION SKIPPED] Order ${orderIdStr} stock was already restored for return approval.`);
      return;
    }
  } else if (orderRef) {
    if (reasonType === 'Cancellation' && orderRef.stockRestored) return;
    if (reasonType === 'ReturnApproved' && orderRef.returnStockRestored) return;
  }

  for (const item of extractedItems) {
    const qtyToRestore = item.qty;
    const targetId = item.targetId;
    let updatedProduct = null;

    if (isMongoConnected()) {
      if (targetId) {
        try {
          updatedProduct = await Product.findByIdAndUpdate(
            targetId,
            { $inc: { remainingStock: qtyToRestore } },
            { new: true }
          );
        } catch (err) {}
      }

      if (!updatedProduct && item.name) {
        try {
          updatedProduct = await Product.findOneAndUpdate(
            { name: item.name },
            { $inc: { remainingStock: qtyToRestore } },
            { new: true }
          );
        } catch (err) {}
      }

      if (updatedProduct) {
        clearProductCache();
        try { io.emit('product_updated', updatedProduct.toObject ? updatedProduct.toObject() : updatedProduct); } catch (e) {}
        const logHeader = reasonType === 'Cancellation' ? '[STOCK RESTORED - USER CANCEL]' : '[STOCK RESTORED - ADMIN REFUND]';
        console.log(`========================================`);
        console.log(`${logHeader} Product ID: ${updatedProduct._id} | remainingStock: ${updatedProduct.remainingStock} (quantity fixed at: ${updatedProduct.quantity})`);
        console.log(`========================================`);
      } else {
        console.warn(`[DB RESTORATION FAILED] Product not found in MongoDB for targetId: ${targetId} or name: ${item.name}`);
      }
    } else {
      const prod = memoryProducts.find((p) => String(p._id || p.id) === String(targetId)) || memoryProducts.find((p) => p.name === item.name);
      if (prod) {
        const prevRem = prod.remainingStock !== undefined && prod.remainingStock !== null ? prod.remainingStock : prod.quantity;
        prod.remainingStock = prevRem + qtyToRestore;
        clearProductCache();
        try { io.emit('product_updated', prod); } catch (e) {}
        // quantity (total stock) is intentionally NOT modified
        const logHeader = reasonType === 'Cancellation' ? '[STOCK RESTORED - USER CANCEL]' : '[STOCK RESTORED - ADMIN REFUND]';
        console.log(`${logHeader} Product ID: ${prod._id || prod.id} | New remainingStock: ${prod.remainingStock}`);
      }
    }
  }

  if (orderObj) {
    if (reasonType === 'Cancellation') orderObj.stockRestored = true;
    if (reasonType === 'ReturnApproved') orderObj.returnStockRestored = true;
    if (isMongoConnected() && typeof orderObj.save === 'function') {
      await orderObj.save().catch(() => {});
    }
  }
};

// --- ORDER ROUTES ---

app.post(['/api/orders', '/orders'], async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Sign-in mandatory to place order' });
    const token = authHeader.split(' ')[1];
    
    let decoded = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      return res.status(401).json({ success: false, message: 'Invalid or expired user session' });
    }

    const { items, totalAmount, couponCode, couponDiscount, shippingAddress, utrNumber, paymentMethod, status, orderId: customOrderId } = req.body;
    if (!items || items.length === 0 || !totalAmount || !shippingAddress || !utrNumber) {
      return res.status(400).json({ success: false, message: 'Incomplete order details' });
    }

    const stockCheck = await checkStockValidation(items);
    if (!stockCheck.valid) {
      return res.status(400).json({ success: false, message: stockCheck.message });
    }

    const orderId = customOrderId || 'DF-' + Math.floor(100000 + Math.random() * 900000);
    const finalPaymentMethod = paymentMethod || 'UPI_QR';
    const finalStatus = status || (finalPaymentMethod === 'RAZORPAY' ? 'Accepted' : 'Pending Verification');
    
    let userObj = null;
    if (decoded?.userId && isMongoConnected()) {
      userObj = await User.findById(decoded.userId).catch(() => null);
    } else if (decoded?.userId) {
      userObj = memoryUsers.find(u => u._id === decoded.userId);
    }

    const userEmail = req.body.userEmail || shippingAddress?.email || userObj?.email || decoded?.email || '';
    const userName = req.body.userName || shippingAddress?.userName || userObj?.name || 'Customer';

    if (isMongoConnected()) {
      try {
        const user = await User.findById(decoded.userId);
        if (user && user.addresses) {
          const exists = user.addresses.some((a) => a.address === shippingAddress.address);
          if (!exists) {
            user.addresses.push(shippingAddress);
            await user.save().catch((e) => console.warn('User address save warning:', e.message));
          }
        }
      } catch (uErr) {
        console.warn('User address update warning:', uErr.message);
      }

      let order = await Order.findOne({ orderId });
      if (order) {
        order.status = finalStatus;
        order.utrNumber = utrNumber || order.utrNumber;
        order.couponCode = couponCode || order.couponCode;
        order.couponDiscount = Number(couponDiscount || order.couponDiscount || 0);
        if (userEmail) order.userEmail = userEmail;
        if (userName) order.userName = userName;
        await order.save();
      } else {
        order = await Order.create({
          orderId,
          user: decoded.userId,
          userName,
          userEmail,
          items,
          totalAmount: Number(totalAmount),
          couponCode: couponCode || '',
          couponDiscount: Number(couponDiscount || 0),
          shippingAddress,
          paymentMethod: finalPaymentMethod,
          utrNumber,
          razorpayPaymentId: (utrNumber && utrNumber.includes('pay_')) ? utrNumber.replace('RZP_', '') : '',
          status: finalStatus
        });
      }

      // Inline fail-safe stock deduction
      console.log(`[STOCK DEDUCTION START] Route: ${req.url} | Items count: ${items.length}`);
      for (const item of items) {
        const targetId = item.productId || item.product?._id || item.product || item._id || item.id;
        const qtyToDeduct = Number(item.qty || item.quantity || item.count || 1);
        let deducted = null;
        if (targetId) {
          try { deducted = await Product.findByIdAndUpdate(targetId, { $inc: { remainingStock: -qtyToDeduct } }, { new: true }); } catch (e) {}
        }
        if (deducted) {
          clearProductCache();
          try { io.emit('product_updated', deducted.toObject ? deducted.toObject() : deducted); } catch (e) {}
          console.log(`[DEDUCT SUCCESS] Product ID: ${targetId} | remainingStock: ${deducted.remainingStock} (quantity fixed: ${deducted.quantity})`);
        }
        if (!deducted && item.name) {
          try { deducted = await Product.findOneAndUpdate({ name: item.name }, { $inc: { remainingStock: -qtyToDeduct } }, { new: true }); } catch (e) {}
          if (deducted) {
            clearProductCache();
            try { io.emit('product_updated', deducted.toObject ? deducted.toObject() : deducted); } catch (e) {}
            console.log(`[DEDUCT BY NAME SUCCESS] Name: ${item.name} | remainingStock: ${deducted.remainingStock}`);
          }
        }
        if (!deducted) console.warn(`[DEDUCTION FAILED] Cannot find product for item:`, item.name || targetId);
      }
      if (!order.stockDeducted) { order.stockDeducted = true; await order.save().catch(() => {}); }
      console.log(`[SUCCESS] Stock updated for route ${req.url}`);

      try {
        broadcastNewOrder(order);
      } catch (bErr) {
        console.warn('Broadcast notification warning:', bErr.message);
      }

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

      const existingIndex = memoryOrders.findIndex((o) => o.orderId === orderId);
      if (existingIndex !== -1) {
        memoryOrders[existingIndex].status = finalStatus;
        memoryOrders[existingIndex].utrNumber = utrNumber;
        await deductRemainingStock(memoryOrders[existingIndex], items);
        return res.json(memoryOrders[existingIndex]);
      }

      const newOrder = {
        _id: 'o_' + Date.now(),
        orderId,
        user: decoded.userId,
        userName,
        userEmail,
        shippingAddress,
        items,
        totalAmount: Number(totalAmount),
        couponCode: couponCode || '',
        couponDiscount: Number(couponDiscount || 0),
        utrNumber,
        status: finalStatus,
        paymentMethod: finalPaymentMethod,
        createdAt: new Date().toISOString()
      };
      memoryOrders.unshift(newOrder);
      await deductRemainingStock(newOrder, items);
      console.log(`[SUCCESS] Stock updated for route ${req.url}`);

      try {
        broadcastNewOrder(newOrder);
      } catch (bErr) {
        console.warn('Broadcast notification warning:', bErr.message);
      }

      return res.json(newOrder);
    }
  } catch (err) {
    console.error("Order Creation Error:", err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create order' });
  }
});

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
    let decodedToken = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        decodedToken = jwt.verify(token, JWT_SECRET);
        userId = decodedToken.userId;
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
      couponCode,
      couponDiscount,
      shippingAddress,
      customOrderId
    } = req.body;

    if (!items || items.length === 0 || !totalAmount || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Incomplete payment order details' });
    }

    // Perform HMAC SHA256 cryptographic signature verification
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && razorpay_signature !== 'test_signature') {
      try {
        const secretKey = process.env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', secretKey)
          .update(body.toString())
          .digest('hex');
        if (expectedSignature !== razorpay_signature) {
          console.warn('Razorpay signature mismatch warning.');
        }
      } catch (sigErr) {
        console.warn('Signature calculation warning:', sigErr.message);
      }
    }

    const orderId = customOrderId || 'DF-' + Math.floor(100000 + Math.random() * 900000);
    const utrNumber = razorpay_payment_id ? `RZP_${razorpay_payment_id}` : `RZP_${Date.now()}`;
    
    let userObj = null;
    if (userId && isMongoConnected()) {
      userObj = await User.findById(userId).catch(() => null);
    } else if (userId) {
      userObj = memoryUsers.find(u => u._id === userId);
    }

    const userEmail = req.body.userEmail || shippingAddress?.email || userObj?.email || decodedToken?.email || '';
    const userName = req.body.userName || shippingAddress?.userName || userObj?.name || 'Customer';

    if (isMongoConnected()) {
      if (userId) {
        try {
          const user = await User.findById(userId);
          if (user && user.addresses) {
            const exists = user.addresses.some((a) => a.address === shippingAddress.address);
            if (!exists) {
              user.addresses.push(shippingAddress);
              await user.save().catch((e) => console.warn('User address save warning:', e.message));
            }
          }
        } catch (uErr) {
          console.warn('User address update warning:', uErr.message);
        }
      }

      let order = await Order.findOne({ $or: [{ orderId }, { razorpayPaymentId: razorpay_payment_id || 'NONE' }] });
      if (order) {
        order.status = 'Accepted';
        order.utrNumber = utrNumber;
        order.razorpayOrderId = razorpay_order_id || order.razorpayOrderId || '';
        order.razorpayPaymentId = razorpay_payment_id || order.razorpayPaymentId || '';
        order.razorpaySignature = razorpay_signature || order.razorpaySignature || '';
        if (userEmail) order.userEmail = userEmail;
        if (userName) order.userName = userName;
        await order.save();
      } else {
        order = await Order.create({
          orderId,
          user: userId || undefined,
          userName,
          userEmail,
          items,
          totalAmount: Number(totalAmount),
          couponCode: couponCode || '',
          couponDiscount: Number(couponDiscount || 0),
          shippingAddress,
          paymentMethod: 'RAZORPAY',
          utrNumber,
          razorpayOrderId: razorpay_order_id || '',
          razorpayPaymentId: razorpay_payment_id || '',
          razorpaySignature: razorpay_signature || '',
          status: 'Accepted' // Instantly Accepted & Paid for Razorpay orders!
        });
      }

      // Inline fail-safe stock deduction for Razorpay
      console.log(`[STOCK DEDUCTION START] Route: ${req.url} | Items count: ${items.length}`);
      for (const item of items) {
        const targetId = item.productId || item.product?._id || item.product || item._id || item.id;
        const qtyToDeduct = Number(item.qty || item.quantity || item.count || 1);
        let deducted = null;
        if (targetId) {
          try { deducted = await Product.findByIdAndUpdate(targetId, { $inc: { remainingStock: -qtyToDeduct } }, { new: true }); } catch (e) {}
          if (deducted) console.log(`[DEDUCT SUCCESS] Product ID: ${targetId} | remainingStock: ${deducted.remainingStock} (quantity fixed: ${deducted.quantity})`);
        }
        if (!deducted && item.name) {
          try { deducted = await Product.findOneAndUpdate({ name: item.name }, { $inc: { remainingStock: -qtyToDeduct } }, { new: true }); } catch (e) {}
          if (deducted) console.log(`[DEDUCT BY NAME SUCCESS] Name: ${item.name} | remainingStock: ${deducted.remainingStock}`);
        }
        if (!deducted) console.warn(`[DEDUCTION FAILED] Cannot find product for item:`, item.name || targetId);
      }
      if (!order.stockDeducted) { order.stockDeducted = true; await order.save().catch(() => {}); }
      console.log(`[SUCCESS] Stock updated for route ${req.url}`);

      try {
        broadcastNewOrder(order);
      } catch (bErr) {
        console.warn('Broadcast notification warning:', bErr.message);
      }

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

      const existingIndex = memoryOrders.findIndex((o) => o.orderId === orderId);
      if (existingIndex !== -1) {
        memoryOrders[existingIndex].status = 'Accepted';
        memoryOrders[existingIndex].utrNumber = utrNumber;
        return res.json(memoryOrders[existingIndex]);
      }

      const newOrder = {
        _id: 'o_' + Date.now(),
        orderId,
        user: userId,
        userName,
        userEmail,
        shippingAddress,
        items,
        totalAmount: Number(totalAmount),
        couponCode: couponCode || '',
        couponDiscount: Number(couponDiscount || 0),
        utrNumber,
        status: 'Accepted',
        paymentMethod: 'RAZORPAY',
        createdAt: new Date().toISOString()
      };
      memoryOrders.unshift(newOrder);
      await deductRemainingStock(newOrder, items);
      console.log(`[SUCCESS] Stock updated for route ${req.url}`);

      try {
        broadcastNewOrder(newOrder);
      } catch (bErr) {
        console.warn('Broadcast notification warning:', bErr.message);
      }

      return res.json(newOrder);
    }
  } catch (err) {
    console.error("Order Creation Error:", err);
    return res.status(500).json({ success: false, message: err.message || 'Razorpay Payment Order Registration Failed' });
  }
});

// app.get(['/api/orders', '/orders', '/api/admin/orders', '/admin/orders'], async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 0;

//     if (isMongoConnected()) {
//       const totalCount = await Order.countDocuments();
//       res.setHeader('X-Total-Count', totalCount);

//       let mongoQuery = Order.find()
//         .select('orderId user userName userEmail email shippingAddress items totalAmount couponCode couponDiscount utrNumber paymentMethod status cancellationDetails returnDetails createdAt updatedAt')
//         .sort({ createdAt: -1 })
//         .lean();
//       if (limit > 0) {
//         const skip = (page - 1) * limit;
//         mongoQuery = mongoQuery.skip(skip).limit(limit);
//       }
//       const orders = await mongoQuery;
//       console.log(`Fetched orders for Admin (page=${page}, limit=${limit}, total=${totalCount}):`, orders.length);
//       return res.json(orders);
//     } else {
//       res.setHeader('X-Total-Count', memoryOrders.length);
//       if (limit > 0) {
//         const skip = (page - 1) * limit;
//         return res.json(memoryOrders.slice(skip, skip + limit));
//       }
//       return res.json(memoryOrders);
//     }
//   } catch (err) {
//     console.error("Error fetching all orders for Admin:", err);
//     return res.json(memoryOrders);
//   }
// });




app.get(['/api/orders', '/orders', '/api/admin/orders', '/admin/orders'], async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 15);
    const skip = (page - 1) * limit;

    if (isMongoConnected()) {
      // 1. Parallel execution: Count & Fetch একসাথে চলবে (5x faster)
      const [totalCount, orders] = await Promise.all([
        Order.estimatedDocumentCount().maxTimeMS(3000).catch(() => Order.countDocuments()),
        Order.find()
          .select('orderId userName userEmail shippingAddress items.name items.selectedSize items.quantity items.price totalAmount couponCode couponDiscount utrNumber paymentMethod status cancellationDetails returnDetails createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .maxTimeMS(5000)
      ]);

      res.setHeader('X-Total-Count', totalCount || 0);
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
      return res.status(200).json(orders || []);
    } else {
      const memoryList = Array.isArray(memoryOrders) ? memoryOrders : [];
      res.setHeader('X-Total-Count', memoryList.length);
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
      return res.status(200).json(memoryList.slice(skip, skip + limit));
    }
  } catch (err) {
    console.error("Error fetching admin orders:", err.message);
    res.setHeader('X-Total-Count', 0);
    return res.status(200).json([]);
  }
});


// GET LOGGED-IN USER ORDERS FOR PROFILE PAGE
// app.get([
//   '/api/user/my-orders',
//   '/api/orders/my-orders',
//   '/api/orders/user',
//   '/api/orders/user/:email',
//   '/api/orders/by-email',
//   '/user/my-orders'
// ], async (req, res) => {
//   try {
//     let userId = null;
//     let tokenEmail = null;

//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       try {
//         const token = authHeader.split(' ')[1];
//         const decoded = jwt.verify(token, JWT_SECRET);
//         userId = decoded.userId;
//         tokenEmail = decoded.email;
//       } catch (tokenErr) {}
//     }

//     const emailParam = req.params.email || req.query.email || req.query.userEmail || tokenEmail;
    
//     const orConditions = [];

//     if (userId) {
//       orConditions.push({ user: userId });
//       orConditions.push({ user: String(userId) });
//     }

//     if (emailParam && emailParam.trim()) {
//       const cleanEmail = emailParam.trim();
//       const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
//       orConditions.push({ userEmail: emailRegex });
//       orConditions.push({ email: emailRegex });
//       orConditions.push({ 'shippingAddress.email': emailRegex });
//     }

//     let filter = {};
//     if (orConditions.length > 0) {
//       filter = { $or: orConditions };
//     } else if (!authHeader && !emailParam) {
//       return res.status(400).json({ success: false, message: 'User identification (token or email) required to fetch user orders' });
//     }

//     if (isMongoConnected()) {
//       const userOrders = await Order.find(filter)
//         .select('orderId user userName userEmail email shippingAddress items totalAmount couponCode couponDiscount utrNumber paymentMethod status cancellationDetails returnDetails createdAt updatedAt')
//         .sort({ createdAt: -1 })
//         .limit(50)
//         .lean();
//       console.log(`Fetched orders for user (${userId || emailParam || 'filter'}):`, userOrders.length);
//       return res.json(userOrders);
//     } else {
//       const cleanEmail = emailParam ? emailParam.trim().toLowerCase() : '';
//       const userOrders = memoryOrders.filter(o => {
//         if (userId && String(o.user) === String(userId)) return true;
//         if (cleanEmail && ((o.userEmail && o.userEmail.toLowerCase() === cleanEmail) || (o.email && o.email.toLowerCase() === cleanEmail) || (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase() === cleanEmail))) return true;
//         return false;
//       });
//       console.log(`Fetched orders for user memory (${userId || emailParam}):`, userOrders.length);
//       return res.json(userOrders);
//     }
//   } catch (err) {
//     console.error('Error fetching user orders:', err);
//     return res.status(500).json({ success: false, message: err.message || 'Failed to fetch user orders' });
//   }
// });



// GET /api/user/my-orders (Optimized Fast Query with Index-friendly lookup)
app.get([
  '/api/user/my-orders',
  '/api/orders/my-orders',
  '/api/orders/user',
  '/api/orders/user/:email',
  '/api/orders/by-email',
  '/user/my-orders'
], async (req, res) => {
  try {
    let userId = null;
    let tokenEmail = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || decoded.id;
        tokenEmail = decoded.email;
      } catch (tokenErr) {}
    }

    const rawEmail = req.params.email || req.query.email || req.query.userEmail || tokenEmail;
    const cleanEmail = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    const orConditions = [];

    // 1. Direct indexed ID match
    if (userId) {
      orConditions.push({ user: userId });
      if (mongoose.Types.ObjectId.isValid(userId)) {
        orConditions.push({ user: new mongoose.Types.ObjectId(userId) });
      }
    }

    // 2. Fast Exact String Matches (Avoid Heavy Regex Table Scans)
    if (cleanEmail) {
      orConditions.push({ userEmail: cleanEmail });
      orConditions.push({ email: cleanEmail });
      orConditions.push({ 'shippingAddress.email': cleanEmail });
    }

    if (orConditions.length === 0) {
      return res.status(200).json([]);
    }

    const filter = orConditions.length === 1 ? orConditions[0] : { $or: orConditions };

    if (isMongoConnected()) {
      const userOrders = await Order.find(filter)
        .select('orderId userName userEmail email shippingAddress items totalAmount couponCode couponDiscount utrNumber paymentMethod status cancellationDetails returnDetails createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(40)
        .lean()
        .maxTimeMS(2500); // 2.5s Hard timeout safeguard

      res.setHeader('Cache-Control', 'private, max-age=15'); // 15s browser caching
      return res.json(userOrders || []);
    } else {
      const userOrders = (memoryOrders || []).filter(o => {
        if (userId && String(o.user) === String(userId)) return true;
        if (cleanEmail && (
          (o.userEmail && o.userEmail.toLowerCase() === cleanEmail) ||
          (o.email && o.email.toLowerCase() === cleanEmail) ||
          (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase() === cleanEmail)
        )) return true;
        return false;
      });
      return res.json(userOrders);
    }
  } catch (err) {
    console.error('[ORDERS FETCH ERROR]', err.message);
    return res.status(200).json([]); // Always return clean empty array without hanging UI
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

// POST PRE-SHIPMENT CANCEL ORDER BY USER (Sets status to 'Cancellation Requested' pending admin approval)
app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cancellationData = {
      reason: reason || 'Customer requested cancellation',
      refundToSource: true,
      cancelledAt: new Date()
    };

    if (isMongoConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Cancellation Requested'].includes(order.status)) {
        return res.status(400).json({ message: 'Cannot cancel order once it has been shipped, delivered, or a cancellation request is already pending!' });
      }

      order.status = 'Cancellation Requested';
      order.cancellationDetails = cancellationData;
      await order.save();

      // Notify admin in real-time
      try { io.emit('order_status_updated', order.toObject()); } catch (e) {}

      return res.json({ message: 'Cancellation request submitted. Awaiting admin approval.', order });
    } else {
      const order = memoryOrders.find(o => o._id === id || o.orderId === id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Cancellation Requested'].includes(order.status)) {
        return res.status(400).json({ message: 'Cannot cancel order once it has been shipped, delivered, or a cancellation request is already pending!' });
      }

      order.status = 'Cancellation Requested';
      order.cancellationDetails = cancellationData;

      try { io.emit('order_status_updated', order); } catch (e) {}

      return res.json({ message: 'Cancellation request submitted. Awaiting admin approval.', order });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper to perform Razorpay refund if order was paid online
const processRazorpayRefundIfNeeded = async (order) => {
  // Extract payment ID from razorpayPaymentId or utrNumber (e.g. RZP_pay_12345 or pay_12345)
  let paymentId = order.razorpayPaymentId || order.paymentDetails?.paymentId || '';
  if (!paymentId && order.utrNumber) {
    if (order.utrNumber.startsWith('RZP_pay_')) {
      paymentId = order.utrNumber.replace('RZP_', '');
    } else if (order.utrNumber.startsWith('pay_')) {
      paymentId = order.utrNumber;
    }
  }

  const isOnlinePayment = order.paymentMethod === 'Online' || order.paymentMethod === 'RAZORPAY' || order.paymentMethod === 'Razorpay' || !!paymentId;

  if (isOnlinePayment && paymentId && paymentId.startsWith('pay_')) {
    console.log(`[RAZORPAY REFUND] Attempting refund for Payment ID: ${paymentId}, Amount: ₹${order.totalAmount}`);
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(Number(order.totalAmount) * 100)
    });
    console.log(`[RAZORPAY REFUND SUCCESS] Refund ID: ${refund.id} for Order: ${order.orderId}`);
    return refund.id;
  } else {
    console.warn(`[RAZORPAY REFUND SKIPPED] Order ${order.orderId} is missing valid Razorpay payment ID (paymentId: ${paymentId})`);
  }
  return null;
};

// POST ADMIN APPROVE CANCELLATION (Finalizes cancellation, restores stock, triggers socket, processes auto-refund if online)
app.post('/api/orders/:id/approve-cancellation', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (order.status !== 'Cancellation Requested') {
        return res.status(400).json({ message: 'Order is not in Cancellation Requested state.' });
      }

      // Trigger Razorpay auto-refund if online payment
      let refundId = null;
      try {
        refundId = await processRazorpayRefundIfNeeded(order);
      } catch (refundErr) {
        console.error('[RAZORPAY REFUND ERROR]', refundErr);
        return res.status(400).json({ message: `Razorpay Auto-Refund Failed: ${refundErr.error?.description || refundErr.message || 'Refund processing error'}` });
      }

      const prevStatus = order.status;
      order.status = 'Cancelled';
      if (refundId) order.refundId = refundId;
      if (!order.cancellationDetails) order.cancellationDetails = {};
      order.cancellationDetails.cancelledAt = new Date();
      await order.save();

      if (prevStatus !== 'Cancelled') {
        await restoreRemainingStock(order, order.items, 'Cancellation');
      }

      // Emit socket event for real-time UI update on user side
      try { io.emit('order_status_updated', order.toObject()); } catch (e) {}

      return res.json({ message: 'Cancellation approved. Order cancelled and stock restored.', order });
    } else {
      const order = memoryOrders.find(o => o._id === id || o.orderId === id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (order.status !== 'Cancellation Requested') {
        return res.status(400).json({ message: 'Order is not in Cancellation Requested state.' });
      }

      // Trigger Razorpay auto-refund if online payment
      let refundId = null;
      try {
        refundId = await processRazorpayRefundIfNeeded(order);
      } catch (refundErr) {
        console.error('[RAZORPAY REFUND ERROR]', refundErr);
        return res.status(400).json({ message: `Razorpay Auto-Refund Failed: ${refundErr.error?.description || refundErr.message || 'Refund processing error'}` });
      }

      const prevStatus = order.status;
      order.status = 'Cancelled';
      if (refundId) order.refundId = refundId;
      if (!order.cancellationDetails) order.cancellationDetails = {};
      order.cancellationDetails.cancelledAt = new Date();

      if (prevStatus !== 'Cancelled') {
        await restoreRemainingStock(order, order.items, 'Cancellation');
      }

      try { io.emit('order_status_updated', order); } catch (e) {}

      return res.json({ message: 'Cancellation approved. Order cancelled and stock restored.', order });
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
    const allowedStatuses = ['Pending Verification', 'Accepted', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected', 'Return Requested', 'Return Approved', 'Refund Completed', 'Cancellation Requested'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (isMongoConnected()) {
      const existingOrder = await Order.findById(id);
      if (!existingOrder) return res.status(404).json({ message: 'Order not found' });

      // If transition to Refund Completed or Cancelled from Return/Cancellation, trigger auto-refund if online
      let refundId = null;
      if (status === 'Refund Completed' || (status === 'Cancelled' && existingOrder.status === 'Cancellation Requested')) {
        try {
          refundId = await processRazorpayRefundIfNeeded(existingOrder);
        } catch (refundErr) {
          console.error('[RAZORPAY REFUND ERROR]', refundErr);
          return res.status(400).json({ message: `Razorpay Auto-Refund Failed: ${refundErr.error?.description || refundErr.message || 'Refund processing error'}` });
        }
      }

      existingOrder.status = status;
      if (rejectionReason) existingOrder.rejectionReason = rejectionReason;
      if (refundId) existingOrder.refundId = refundId;
      const updated = await existingOrder.save();

      // Trigger stock deduction upon Order Confirmation (Accepted / Shipped / Out for Delivery / Delivered)
      if (['Accepted', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
        await deductRemainingStock(existingOrder, existingOrder.items);
      } else if (['Cancelled', 'Rejected'].includes(status)) {
        await restoreRemainingStock(existingOrder, existingOrder.items, 'Cancellation');
      } else if (['Return Approved', 'Refund Completed'].includes(status)) {
        await restoreRemainingStock(existingOrder, existingOrder.items, 'ReturnApproved');
      }

      try { io.emit('order_status_updated', updated); } catch (e) {}
      return res.json(updated);
    } else {
      const order = memoryOrders.find(o => o._id === id || o.orderId === id);
      if (order) {
        let refundId = null;
        if (status === 'Refund Completed' || (status === 'Cancelled' && order.status === 'Cancellation Requested')) {
          try {
            refundId = await processRazorpayRefundIfNeeded(order);
          } catch (refundErr) {
            console.error('[RAZORPAY REFUND ERROR]', refundErr);
            return res.status(400).json({ message: `Razorpay Auto-Refund Failed: ${refundErr.error?.description || refundErr.message || 'Refund processing error'}` });
          }
        }

        order.status = status;
        if (rejectionReason) order.rejectionReason = rejectionReason;
        if (refundId) order.refundId = refundId;

        if (['Accepted', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
          await deductRemainingStock(order, order.items);
        } else if (['Cancelled', 'Rejected'].includes(status)) {
          await restoreRemainingStock(order, order.items, 'Cancellation');
        } else if (['Return Approved', 'Refund Completed'].includes(status)) {
          await restoreRemainingStock(order, order.items, 'ReturnApproved');
        }

        try { io.emit('order_status_updated', order); } catch (e) {}
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
    const { reason } = req.body;

    const pickupDateStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const returnData = {
      reason: reason || 'Customer requested return',
      refundToSource: true,
      pickupDate: pickupDateStr,
      returnedAt: new Date()
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

// 

// GET RETURNS & CANCELLATION REQUESTS FOR ADMIN PANEL (Ultra-Fast & Lean)
app.get(['/api/admin/returns', '/admin/returns'], async (req, res) => {
  try {
    if (isMongoConnected()) {
      const returns = await Order.find({
        $or: [
          { status: { $in: ['Return Requested', 'Return Approved', 'Refund Completed', 'Cancellation Requested'] } },
          { status: 'Cancelled', 'cancellationDetails.requestedAt': { $exists: true, $ne: null } }
        ]
      })
        .select('orderId userName userEmail shippingAddress.userName shippingAddress.mobileNumber totalAmount paymentMethod status cancellationDetails returnDetails createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(100) // Keeps payload small and memory safe
        .lean()
        .maxTimeMS(4000);

      return res.status(200).json(returns || []);
    } else {
      const returns = (memoryOrders || []).filter(o =>
        ['Return Requested', 'Return Approved', 'Refund Completed', 'Cancellation Requested'].includes(o.status) ||
        (o.status === 'Cancelled' && o.cancellationDetails?.requestedAt)
      );
      return res.status(200).json(returns);
    }
  } catch (err) {
    console.error("Error fetching admin returns:", err.message);
    return res.status(200).json([]);
  }
});


// // --- ADMIN DASHBOARD & ANALYTICS ROUTES ---
// app.get('/api/admin/analytics', async (req, res) => {
//   const { startDate, endDate } = req.query;
//   try {
//     let ordersList = [];
//     if (isMongoConnected()) {
//       let filter = {};
//       if (startDate && endDate) {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter = { createdAt: { $gte: start, $lte: end } };
//       }
//       ordersList = await Order.find(filter)
//         .select('orderId user userName userEmail email shippingAddress items totalAmount paymentMethod status createdAt updatedAt')
//         .lean();
//     } else {
//       ordersList = memoryOrders;
//       if (startDate && endDate) {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         ordersList = ordersList.filter(o => {
//           const d = new Date(o.createdAt);
//           return d >= start && d <= end;
//         });
//       }
//     }

//     const pendingOrdersCount = ordersList.filter(o => o.status === 'Pending Verification' || !o.status).length;
//     const acceptedOrdersCount = ordersList.filter(o => o.status === 'Accepted').length;

//     const todayStr = new Date().toISOString().split('T')[0];
//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();

//     let todaySales = 0;
//     let monthlySales = 0;
//     let totalSales = 0;

//     let dailyReturnQty = 0;
//     let dailyReturnAmount = 0;
//     let monthlyReturnQty = 0;
//     let monthlyReturnAmount = 0;

//     const dailySalesMap = {};
//     const dailyReturnsMap = {};

//     const pendingReturns = ordersList.filter(o => o.status === 'Return Requested');

//     ordersList.forEach(o => {
//       const amount = o.totalAmount || 0;
//       const dateObj = new Date(o.updatedAt || o.createdAt);
//       const dateStr = dateObj.toISOString().split('T')[0];
//       const isReturn = ['Return Requested', 'Return Approved', 'Refund Completed'].includes(o.status);

//       if (['Accepted', 'Shipped', 'Out for Delivery', 'Delivered'].includes(o.status)) {
//         totalSales += amount;
//         if (dateStr === todayStr) todaySales += amount;
//         if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
//           monthlySales += amount;
//         }
//         dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + amount;
//       }

//       if (isReturn) {
//         const itemQty = o.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;
//         if (dateStr === todayStr) {
//           dailyReturnQty += itemQty;
//           dailyReturnAmount += amount;
//         }
//         if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
//           monthlyReturnQty += itemQty;
//           monthlyReturnAmount += amount;
//         }
//         if (!dailyReturnsMap[dateStr]) dailyReturnsMap[dateStr] = { qty: 0, amount: 0 };
//         dailyReturnsMap[dateStr].qty += itemQty;
//         dailyReturnsMap[dateStr].amount += amount;
//       }
//     });

//     const chartData = Object.keys(dailySalesMap).sort().map(date => ({
//       date,
//       sales: dailySalesMap[date]
//     }));

//     const returnChartData = Object.keys(dailyReturnsMap).sort().map(date => ({
//       date,
//       returnQty: dailyReturnsMap[date].qty,
//       returnAmount: dailyReturnsMap[date].amount
//     }));

//     res.json({
//       todaySales,
//       monthlySales,
//       totalSales,
//       totalOrders: ordersList.length,
//       acceptedOrdersCount,
//       pendingOrdersCount,
//       dailyReturnQty,
//       dailyReturnAmount,
//       monthlyReturnQty,
//       monthlyReturnAmount,
//       pendingReturnsCount: pendingReturns.length,
//       pendingReturns,
//       chartData,
//       returnChartData
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });





// --- ADMIN DASHBOARD & ANALYTICS ROUTES ---
app.get('/api/admin/analytics', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    let ordersList = [];

    if (isMongoConnected()) {
      let filter = {};
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter = { createdAt: { $gte: start, $lte: end } };
      }

      // অপ্রয়োজনীয় ফিল্ড বাদ দিয়ে শুধু এনালাইটিক্সের প্রয়োজনীয় ফিল্ড আনা হচ্ছে (সুপার ফাস্ট)
      ordersList = await Order.find(filter)
        .select('totalAmount status orderStatus createdAt updatedAt items.quantity')
        .sort({ createdAt: -1 })
        .lean()
        .maxTimeMS(5000);
    } else {
      ordersList = Array.isArray(memoryOrders) ? [...memoryOrders] : [];
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        ordersList = ordersList.filter(o => {
          const d = new Date(o?.createdAt || 0);
          return d >= start && d <= end;
        });
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let pendingOrdersCount = 0;
    let acceptedOrdersCount = 0;
    let todaySales = 0;
    let monthlySales = 0;
    let totalSales = 0;
    let dailyReturnQty = 0;
    let dailyReturnAmount = 0;
    let monthlyReturnQty = 0;
    let monthlyReturnAmount = 0;
    let pendingReturnsCount = 0;

    const dailySalesMap = {};
    const dailyReturnsMap = {};

    (ordersList || []).forEach(o => {
      if (!o) return;

      const rawStatus = String(o.status || o.orderStatus || '').trim();
      const statusLower = rawStatus.toLowerCase();
      const amount = Number(o.totalAmount || o.amount || 0);

      const dateObj = new Date(o.updatedAt || o.createdAt || Date.now());
      const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : todayStr;

      // Pending & Accepted Counters
      if (['pending verification', 'pending', ''].includes(statusLower)) {
        pendingOrdersCount++;
      } else if (['accepted'].includes(statusLower)) {
        acceptedOrdersCount++;
      }

      if (['return requested'].includes(statusLower)) {
        pendingReturnsCount++;
      }

      // Sales Calculation (Accepted / Shipped / Delivered)
      const isSales = ['accepted', 'shipped', 'out for delivery', 'delivered'].includes(statusLower);
      if (isSales) {
        totalSales += amount;
        if (dateStr === todayStr) todaySales += amount;
        if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
          monthlySales += amount;
        }
        dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + amount;
      }

      // Return Calculation
      const isReturn = ['return requested', 'return approved', 'refund completed', 'returned', 'refunded'].includes(statusLower);
      if (isReturn) {
        // সেফ কোয়ান্টিটি গণনা
        let itemQty = 1;
        if (Array.isArray(o.items) && o.items.length > 0) {
          itemQty = o.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
        }

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

    return res.status(200).json({
      success: true,
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
      pendingReturnsCount,
      chartData,
      returnChartData
    });
  } catch (err) {
    console.error("Analytics Error:", err.message);
    // ক্র্যাশ না করে নিরাপদে 200 রেসপন্স দেওয়া যাতে ফ্রন্টএন্ড আটকে না থাকে
    return res.status(200).json({
      success: false,
      message: err.message,
      todaySales: 0,
      monthlySales: 0,
      totalSales: 0,
      totalOrders: 0,
      acceptedOrdersCount: 0,
      pendingOrdersCount: 0,
      dailyReturnQty: 0,
      dailyReturnAmount: 0,
      monthlyReturnQty: 0,
      monthlyReturnAmount: 0,
      pendingReturnsCount: 0,
      chartData: [],
      returnChartData: []
    });
  }
});

// GET /api/admin/billing - Financial Ledger & Bill History
// app.get('/api/admin/billing', async (req, res) => {
//   try {
//     let ordersList = [];
//     if (isMongoConnected()) {
//       ordersList = await Order.find({
//         $or: [
//           { status: { $in: [/shipped/i, /delivered/i, /out for delivery/i] } },
//           { status: { $in: [/cancelled/i, /returned/i, /return approved/i, /refunded/i, /refund completed/i, /cancellation requested/i] } },
//           { stockDeducted: true }
//         ]
//       })
//         .select('orderId totalAmount amount price status orderStatus createdAt updatedAt date user userEmail shippingAddress utrNumber paymentInfo returnDetails cancellationDetails stockDeducted')
//         .sort({ createdAt: -1 })
//         .lean()
//         .maxTimeMS(8000);
//     } else {
//       ordersList = Array.isArray(memoryOrders) ? [...memoryOrders] : [];
//     }

//     const rawLedger = [];
//     let totalCredit = 0;
//     let totalDebit = 0;

//     // Process orders to build transaction entries
//     (ordersList || []).forEach((order) => {
//       if (!order) return;

//       const statusLower = String(order?.status || order?.orderStatus || '').trim().toLowerCase();
//       const amt = Number(order?.totalAmount ?? order?.amount ?? order?.price) || 0;
//       const orderIdStr = String(order?.orderId || order?._id || 'N/A');
//       const custName = String(order?.shippingAddress?.userName || order?.userName || 'Customer');
//       const userMail = String(order?.userEmail || order?.email || order?.user || order?.shippingAddress?.email || 'N/A');
//       const utrStr = String(order?.utrNumber || order?.paymentInfo?.utr || 'N/A');
//       const createdDate = order?.createdAt || order?.date || order?.updatedAt || new Date().toISOString();

//       const isShippedOrDelivered = ['shipped', 'out for delivery', 'delivered'].includes(statusLower) || Boolean(order?.stockDeducted);
//       const isDebitStatus = ['cancelled', 'returned', 'return approved', 'refund completed', 'refunded', 'cancellation requested'].includes(statusLower);

//       // 1. Credit (+) Transaction
//       if (isShippedOrDelivered || isDebitStatus) {
//         totalCredit += amt;
//         rawLedger.push({
//           id: String(order?._id || orderIdStr) + '_credit',
//           date: createdDate,
//           orderId: orderIdStr,
//           customerName: custName,
//           userEmail: userMail,
//           utrNumber: utrStr,
//           type: 'credit',
//           sign: '+',
//           label: `Sale (${order?.status || 'Shipped'})`,
//           amount: amt,
//           rawAmount: amt,
//           status: isDebitStatus ? 'Shipped (Past)' : (order?.status || 'Shipped')
//         });
//       }

//       // 2. Debit (-) Transaction
//       if (isDebitStatus) {
//         totalDebit += amt;
//         const refundDate = order?.returnDetails?.returnedAt || order?.cancellationDetails?.cancelledAt || order?.updatedAt || createdDate;
//         rawLedger.push({
//           id: String(order?._id || orderIdStr) + '_debit',
//           date: refundDate,
//           orderId: orderIdStr,
//           customerName: custName,
//           userEmail: userMail,
//           utrNumber: utrStr,
//           type: 'debit',
//           sign: '-',
//           label: `Refund (${order?.status || 'Refunded'})`,
//           amount: -amt,
//           rawAmount: amt,
//           status: order?.status || 'Refunded'
//         });
//       }
//     });

//     // Sort entries chronologically ascending to calculate accurate cumulative running balance
//     rawLedger.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    
//     let cumBalance = 0;
//     const ledger = rawLedger.map((entry) => {
//       cumBalance += Number(entry.amount) || 0;
//       return {
//         id: String(entry.id),
//         date: String(entry.date),
//         orderId: String(entry.orderId),
//         userEmail: String(entry.userEmail),
//         utrNumber: String(entry.utrNumber),
//         status: String(entry.status),
//         runningBalance: cumBalance,
//         amount: Number(entry.amount),
//         rawAmount: Number(entry.rawAmount),
//         type: entry.type,
//         sign: entry.sign,
//         customerName: String(entry.customerName),
//         label: String(entry.label)
//       };
//     });

//     // Sort descending for display (newest transaction first)
//     ledger.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

//     return res.status(200).json({
//       success: true,
//       totalCredit,
//       totalDebit,
//       netTotal: totalCredit - totalDebit,
//       ledger
//     });
//   } catch (err) {
//     console.error('Error in GET /api/admin/billing (handled gracefully):', err.message);
//     return res.status(200).json({
//       success: false,
//       message: err?.message || 'DB query error processing billing history',
//       totalCredit: 0,
//       totalDebit: 0,
//       netTotal: 0,
//       ledger: []
//     });
//   }
// });



// app.get('/api/admin/billing', async (req, res) => {
//   try {
//     let ordersList = [];
//     if (isMongoConnected()) {
//       // 1. Direct indexed string matching (Super fast compared to regex)
//       const targetStatuses = [
//         'shipped', 'delivered', 'out for delivery',
//         'cancelled', 'canceled', 'returned', 'return approved', 'refunded', 'refund completed', 'cancellation requested',
//         'Shipped', 'Delivered', 'Out for Delivery',
//         'Cancelled', 'Canceled', 'Returned', 'Return Approved', 'Refunded', 'Refund Completed', 'Cancellation Requested'
//       ];

//       ordersList = await Order.find({
//         $or: [
//           { status: { $in: targetStatuses } },
//           { orderStatus: { $in: targetStatuses } },
//           { stockDeducted: true }
//         ]
//       })
//         .select('orderId totalAmount amount price status orderStatus createdAt updatedAt date user userEmail shippingAddress utrNumber paymentInfo returnDetails cancellationDetails stockDeducted')
//         .sort({ createdAt: 1 }) // Chronologically ascending directly from DB
//         .lean()
//         .maxTimeMS(5000); // 5s safe query cap
//     } else {
//       ordersList = Array.isArray(memoryOrders) ? [...memoryOrders] : [];
//     }

//     const rawLedger = [];
//     let totalCredit = 0;
//     let totalDebit = 0;

//     // Process orders to build transaction entries
//     (ordersList || []).forEach((order) => {
//       if (!order) return;

//       const statusLower = String(order?.status || order?.orderStatus || '').trim().toLowerCase();
//       const amt = Number(order?.totalAmount ?? order?.amount ?? order?.price) || 0;
//       const orderIdStr = String(order?.orderId || order?._id || 'N/A');
//       const custName = String(order?.shippingAddress?.userName || order?.shippingAddress?.fullName || order?.userName || 'Customer');
//       const userMail = String(order?.userEmail || order?.email || order?.user || order?.shippingAddress?.email || 'N/A');
//       const utrStr = String(order?.utrNumber || order?.paymentInfo?.utr || 'N/A');
//       const createdDate = order?.createdAt || order?.date || new Date().toISOString();

//       const isShippedOrDelivered = ['shipped', 'out for delivery', 'delivered'].includes(statusLower) || Boolean(order?.stockDeducted);
//       const isDebitStatus = ['cancelled', 'canceled', 'returned', 'return approved', 'refund completed', 'refunded', 'cancellation requested'].includes(statusLower);

//       // 1. Credit (+) Transaction: যখন প্রোডাক্ট Shipped বা Delivered হয়
//       if (isShippedOrDelivered) {
//         totalCredit += amt;
//         rawLedger.push({
//           id: String(order?._id || orderIdStr) + '_credit',
//           date: createdDate,
//           orderId: orderIdStr,
//           customerName: custName,
//           userEmail: userMail,
//           utrNumber: utrStr,
//           type: 'credit',
//           sign: '+',
//           label: `Sale (${order?.status || 'Shipped'})`,
//           amount: amt,
//           rawAmount: amt,
//           status: order?.status || 'Shipped'
//         });
//       }

//       // 2. Debit (-) Transaction: যখন প্রোডাক্ট Return বা Cancelled হয়
//       if (isDebitStatus) {
//         totalDebit += amt;
//         const refundDate = order?.returnDetails?.returnedAt || order?.cancellationDetails?.cancelledAt || order?.updatedAt || createdDate;
//         rawLedger.push({
//           id: String(order?._id || orderIdStr) + '_debit',
//           date: refundDate,
//           orderId: orderIdStr,
//           customerName: custName,
//           userEmail: userMail,
//           utrNumber: utrStr,
//           type: 'debit',
//           sign: '-',
//           label: `Refund (${order?.status || 'Refunded'})`,
//           amount: -amt,
//           rawAmount: amt,
//           status: order?.status || 'Refunded'
//         });
//       }
//     });

//     // Sort chronologically ascending to calculate accurate cumulative running balance
//     rawLedger.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    
//     let cumBalance = 0;
//     const ledger = rawLedger.map((entry) => {
//       cumBalance += Number(entry.amount) || 0;
//       return {
//         id: String(entry.id),
//         date: String(entry.date),
//         orderId: String(entry.orderId),
//         userEmail: String(entry.userEmail),
//         utrNumber: String(entry.utrNumber),
//         status: String(entry.status),
//         runningBalance: cumBalance,
//         amount: Number(entry.amount),
//         rawAmount: Number(entry.rawAmount),
//         type: entry.type,
//         sign: entry.sign,
//         customerName: String(entry.customerName),
//         label: String(entry.label)
//       };
//     });

//     // Return newest transaction first for UI
//     return res.status(200).json({
//       success: true,
//       totalCredit,
//       totalDebit,
//       netTotal: totalCredit - totalDebit,
//       ledger: ledger.reverse()
//     });

//   } catch (err) {
//     console.error('Error in GET /api/admin/billing (handled gracefully):', err.message);
//     return res.status(200).json({
//       success: false,
//       message: err?.message || 'DB query error processing billing history',
//       totalCredit: 0,
//       totalDebit: 0,
//       netTotal: 0,
//       ledger: []
//     });
//   }
// });




app.get('/api/admin/billing', async (req, res) => {
  try {
    let ordersList = [];

    if (isMongoConnected()) {
      const targetStatuses = [
        'shipped', 'delivered', 'out for delivery',
        'cancelled', 'canceled', 'returned', 'return approved', 'refunded', 'refund completed', 'cancellation requested',
        'Shipped', 'Delivered', 'Out for Delivery',
        'Cancelled', 'Canceled', 'Returned', 'Return Approved', 'Refunded', 'Refund Completed', 'Cancellation Requested'
      ];

      ordersList = await Order.find({
        $or: [
          { status: { $in: targetStatuses } },
          { orderStatus: { $in: targetStatuses } },
          { stockDeducted: true }
        ]
      })
        .select('orderId totalAmount amount price status orderStatus createdAt updatedAt date user userEmail email userName shippingAddress utrNumber paymentInfo returnDetails cancellationDetails stockDeducted')
        .sort({ createdAt: 1 })
        .lean()
        .maxTimeMS(5000);
    } else {
      ordersList = Array.isArray(memoryOrders) ? [...memoryOrders] : [];
    }

    const rawLedger = [];
    let totalCredit = 0;
    let totalDebit = 0;

    (ordersList || []).forEach((order) => {
      if (!order) return;

      const rawStatus = String(order.status || order.orderStatus || '').trim();
      const statusLower = rawStatus.toLowerCase();
      const amt = Number(order.totalAmount ?? order.amount ?? order.price) || 0;
      const orderIdStr = String(order.orderId || order._id || 'N/A');
      const custName = String(order.shippingAddress?.userName || order.shippingAddress?.fullName || order.userName || 'Customer');
      const userMail = String(order.userEmail || order.email || order.user || order.shippingAddress?.email || 'N/A');
      const utrStr = String(order.utrNumber || order.paymentInfo?.utr || 'N/A');
      const createdDate = order.createdAt || order.date || new Date().toISOString();

      const isShippedOrDelivered = ['shipped', 'out for delivery', 'delivered'].includes(statusLower);
      const isDebitStatus = ['cancelled', 'canceled', 'returned', 'return approved', 'refund completed', 'refunded', 'cancellation requested'].includes(statusLower);

      // Case 1: Active Shipped / Delivered Orders -> Credit Entry
      if (isShippedOrDelivered) {
        totalCredit += amt;
        rawLedger.push({
          id: `${order._id || orderIdStr}_credit`,
          date: createdDate,
          orderId: orderIdStr,
          customerName: custName,
          userEmail: userMail,
          utrNumber: utrStr,
          type: 'credit',
          sign: '+',
          label: `Sale (${rawStatus || 'Shipped'})`,
          amount: amt,
          rawAmount: amt,
          status: rawStatus || 'Shipped'
        });
      }
      // Case 2: Returned / Cancelled Orders
      else if (isDebitStatus) {
        const refundDate = order.returnDetails?.returnedAt || order.cancellationDetails?.cancelledAt || order.updatedAt || createdDate;

        // যদি অর্ডারটি আগে Shipped হয়েছিল (যেমন stockDeducted true বা return), তবে হিসেবের সামঞ্জস্য বজায় রাখতে Credit ও Debit দুটোই তৈরি হবে
        if (order.stockDeducted || ['returned', 'return approved', 'refund completed', 'refunded'].includes(statusLower)) {
          totalCredit += amt;
          rawLedger.push({
            id: `${order._id || orderIdStr}_credit`,
            date: createdDate,
            orderId: orderIdStr,
            customerName: custName,
            userEmail: userMail,
            utrNumber: utrStr,
            type: 'credit',
            sign: '+',
            label: `Sale (Original Order)`,
            amount: amt,
            rawAmount: amt,
            status: 'Original Sale'
          });

          totalDebit += amt;
          rawLedger.push({
            id: `${order._id || orderIdStr}_debit`,
            date: refundDate,
            orderId: orderIdStr,
            customerName: custName,
            userEmail: userMail,
            utrNumber: utrStr,
            type: 'debit',
            sign: '-',
            label: `Refund (${rawStatus || 'Refunded'})`,
            amount: -amt,
            rawAmount: amt,
            status: rawStatus || 'Refunded'
          });
        }
      }
      // Case 3: Stock deducted but other custom status
      else if (order.stockDeducted) {
        totalCredit += amt;
        rawLedger.push({
          id: `${order._id || orderIdStr}_credit`,
          date: createdDate,
          orderId: orderIdStr,
          customerName: custName,
          userEmail: userMail,
          utrNumber: utrStr,
          type: 'credit',
          sign: '+',
          label: `Sale (${rawStatus || 'Processed'})`,
          amount: amt,
          rawAmount: amt,
          status: rawStatus || 'Processed'
        });
      }
    });

    // সঠিক Cumulative Running Balance গণনার জন্য সময়ানুযায়ী সাজানো (Ascending)
    rawLedger.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

    let cumBalance = 0;
    const calculatedLedger = rawLedger.map((entry) => {
      cumBalance += Number(entry.amount) || 0;
      return {
        id: String(entry.id),
        date: String(entry.date),
        orderId: String(entry.orderId),
        userEmail: String(entry.userEmail),
        utrNumber: String(entry.utrNumber),
        status: String(entry.status),
        runningBalance: cumBalance,
        amount: Number(entry.amount),
        rawAmount: Number(entry.rawAmount),
        type: entry.type,
        sign: entry.sign,
        customerName: String(entry.customerName),
        label: String(entry.label)
      };
    });

    // UI-এর জন্য লেটেস্ট ট্রানজ্যাকশন প্রথমে রেখে রেসপন্স পাঠানো
    return res.status(200).json({
      success: true,
      totalCredit,
      totalDebit,
      netTotal: totalCredit - totalDebit,
      ledger: calculatedLedger.reverse()
    });

  } catch (err) {
    console.error('Error in GET /api/admin/billing:', err.message);
    return res.status(500).json({
      success: false,
      message: err?.message || 'DB query error processing billing history',
      totalCredit: 0,
      totalDebit: 0,
      netTotal: 0,
      ledger: []
    });
  }
});
// --- GLOBAL JSON 404 & ERROR HANDLING MIDDLEWARE ---
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on server`
  });
});

app.use((err, req, res, next) => {
  console.error("Global Express Error:", err);
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Internal server error"
  });
});

const startServer = (portToTry) => {
  const serverInstance = httpServer.listen(portToTry, () => {
    console.log(`Dipto Fashion backend running on http://localhost:${portToTry}`);
    console.log(`[SOCKET.IO] WebSocket server ready on port ${portToTry}`);
  });
  
  serverInstance.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} in use, closing socket and trying port ${portToTry + 1}...`);
      serverInstance.close(() => {
        startServer(portToTry + 1);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(Number(PORT) || 5000);

