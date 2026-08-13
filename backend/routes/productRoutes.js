import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { apiCache } from '../server.js';

const router = express.Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to clear cached products
export const clearProductCache = () => {
  try {
    const keys = apiCache.keys();
    keys.forEach(k => {
      if (k.startsWith('products_')) {
        apiCache.del(k);
      }
    });
  } catch (e) {
    console.error('Error clearing product cache:', e);
  }
};

// In-Memory Fallback Products
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

// GET / (mounted on /api/products or /products)
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const cacheKey = `products_${category || 'all'}_${search || 'none'}`;
  const cached = apiCache.get(cacheKey);
  if (cached && !req.query.t) return res.status(200).json(cached);

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
      let prods = await Product.find(query)
        .select('name price mrp image category rating reviewsCount quantity remainingStock description isFeatured')
        .sort({ createdAt: -1 })
        .lean();
      if (prods.length === 0 && !category && !search) {
        const inserted = await Product.insertMany(memoryProducts.map(p => {
          const { _id, ...rest } = p;
          return rest;
        }));
        prods = inserted.map(doc => doc.toObject());
      }
      apiCache.set(cacheKey, prods);
      return res.status(200).json(prods);
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
      apiCache.set(cacheKey, filtered);
      return res.status(200).json(filtered);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /
router.post('/', async (req, res) => {
  try {
    const { name, category, mrp, price, quantity, images, description, rating, reviewsCount } = req.body;
    if (!name || !category || !mrp || !price || !images || images.length === 0) {
      return res.status(400).json({ message: 'Product title, category, MRP, offer price, and at least 1 image are required' });
    }

    clearProductCache();

    const enteredQty = Number(quantity) || 10;

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
        images,
        image: images[0],
        description: description || ''
      });
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_added', prod);
      return res.json(prod);
    } else {
      const newProd = {
        _id: 'p_' + Date.now(),
        name,
        category,
        mrp: Number(mrp),
        price: Number(price),
        quantity: enteredQty,
        remainingStock: enteredQty,
        rating: Number(rating) || 4.5,
        reviewsCount: Number(reviewsCount) || 1,
        images,
        image: images[0],
        description: description || ''
      };
      memoryProducts.push(newProd);
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_added', newProd);
      return res.json(newProd);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, mrp, price, quantity, images, description, rating, reviewsCount } = req.body;
    if (!name || !category || !mrp || !price || !images || images.length === 0) {
      return res.status(400).json({ message: 'At least 1 image is required for product update' });
    }

    clearProductCache();

    const enteredQty = Number(quantity) || 10;

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
          images,
          image: images[0],
          description: description || ''
        },
        { new: true }
      );
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_updated', updated);
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
        prod.images = images;
        prod.image = images[0];
        prod.description = description || '';
        const reqIo = req.app.get('io');
        if (reqIo) reqIo.emit('product_updated', prod);
        return res.json(prod);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    clearProductCache();
    if (isMongoConnected()) {
      await Product.findByIdAndDelete(id);
    } else {
      memoryProducts = memoryProducts.filter(p => p._id !== id);
    }
    const reqIo = req.app.get('io');
    if (reqIo) reqIo.emit('product_deleted', id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /:id/review
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText, userName, userEmail, title } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    if (isMongoConnected()) {
      const prod = await Product.findById(id);
      if (!prod) return res.status(404).json({ message: 'Product not found' });

      const newRev = {
        userName: userName || 'Customer',
        userEmail: userEmail || '',
        rating: Number(rating),
        title: title || '',
        reviewText: reviewText || '',
        createdAt: new Date()
      };

      prod.reviews.push(newRev);
      const totalRatings = prod.reviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = Number((totalRatings / prod.reviews.length).toFixed(1));
      prod.reviewsCount = prod.reviews.length;

      await prod.save();
      clearProductCache();
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_updated', prod);
      return res.json(prod);
    } else {
      const prod = memoryProducts.find(p => p._id === id);
      if (!prod) return res.status(404).json({ message: 'Product not found' });

      if (!prod.reviews) prod.reviews = [];
      const newRev = {
        userName: userName || 'Customer',
        userEmail: userEmail || '',
        rating: Number(rating),
        title: title || '',
        reviewText: reviewText || '',
        createdAt: new Date().toISOString()
      };
      prod.reviews.push(newRev);
      const totalRatings = prod.reviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = Number((totalRatings / prod.reviews.length).toFixed(1));
      prod.reviewsCount = prod.reviews.length;

      clearProductCache();
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_updated', prod);
      return res.json(prod);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
