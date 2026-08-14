// import express from 'express';
// import mongoose from 'mongoose';
// import Product from '../models/Product.js';
// import { apiCache } from '../server.js';

// const router = express.Router();

// const isMongoConnected = () => mongoose.connection.readyState === 1;

// // Helper to clear cached products
// export const clearProductCache = () => {
//   try {
//     const keys = apiCache.keys();
//     keys.forEach(k => {
//       if (k.startsWith('products_')) {
//         apiCache.del(k);
//       }
//     });
//   } catch (e) {
//     console.error('Error clearing product cache:', e);
//   }
// };

// // In-Memory Fallback Products
// let memoryProducts = [
//   {
//     _id: 'p_1',
//     name: 'Kanjivaram Pure Silk Saree',
//     category: 'Saree',
//     mrp: 5999,
//     price: 2499,
//     quantity: 15,
//     rating: 4.8,
//     reviewsCount: 428,
//     images: [
//       'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
//       'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
//       'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
//     ],
//     image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
//     description: 'Exquisite Golden Zari Woven Royal Silk Saree with Blouse Piece'
//   },
//   {
//     _id: 'p_2',
//     name: 'Banarasi Soft Silk Saree',
//     category: 'Saree',
//     mrp: 4499,
//     price: 1899,
//     quantity: 20,
//     rating: 4.6,
//     reviewsCount: 295,
//     images: [
//       'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
//       'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
//     ],
//     image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
//     description: 'Designer Floral Pattern Crimson Red Banarasi Silk Saree'
//   },
//   {
//     _id: 'p_3',
//     name: 'Royal Heritage Silk Kurta Punjabi',
//     category: 'Punjabi',
//     mrp: 3999,
//     price: 1799,
//     quantity: 18,
//     rating: 4.9,
//     reviewsCount: 512,
//     images: [
//       'https://images.unsplash.com/photo-1621570074981-ee6a0145c8b5?auto=format&fit=crop&w=800&q=80',
//       'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
//     ],
//     image: 'https://images.unsplash.com/photo-1621570074981-ee6a0145c8b5?auto=format&fit=crop&w=800&q=80',
//     description: 'Embroidered Premium Silk Punjabi Kurta Pyjama Set'
//   }
// ];

// // GET / (mounted on /api/products or /products)
// router.get('/', async (req, res) => {
//   const { category, search, page, limit } = req.query;
//   const isPaginated = page !== undefined || limit !== undefined;
//   const pageNum = Math.max(1, parseInt(page, 10) || 1);
//   const limitNum = Math.max(1, parseInt(limit, 10) || 12);
//   const skip = (pageNum - 1) * limitNum;

//   const cacheKey = `products_${category || 'all'}_${search || 'none'}_p${isPaginated ? pageNum : 'all'}_l${isPaginated ? limitNum : 'all'}`;
//   const cached = apiCache.get(cacheKey);
//   if (cached && !req.query.t) return res.status(200).json(cached);

//   const sanitizeProduct = (p) => {
//     if (!p || typeof p !== 'object') return null;
//     const fallbackImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
//     return {
//       _id: p._id || p.id || `prod_${Math.random().toString(36).substr(2, 9)}`,
//       name: p.name || 'Fashion Apparel',
//       price: Number(p.price) || Number(p.mrp) || 999,
//       mrp: Number(p.mrp) || Number(p.price) || 1499,
//       image: p.image || (Array.isArray(p.images) && p.images[0]) || fallbackImg,
//       images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || fallbackImg],
//       category: p.category || 'General',
//       rating: Number(p.rating) || 4.5,
//       reviewsCount: Number(p.reviewsCount) || 12,
//       quantity: p.quantity !== undefined ? Number(p.quantity) : 10,
//       remainingStock: p.remainingStock !== undefined ? Number(p.remainingStock) : 10,
//       description: p.description || 'Premium Quality Ethnic & Modern Wear Collection',
//       isFeatured: Boolean(p.isFeatured)
//     };
//   };

//   try {
//     const isAllCategory = !category || category.trim() === '' || category.trim().toLowerCase() === 'all';
    
//     if (isMongoConnected()) {
//       let query = {};
//       if (!isAllCategory) {
//         query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
//       }
//       if (search && search.trim()) {
//         const searchRegex = new RegExp(search.trim(), 'i');
//         query.$or = [
//           { name: searchRegex },
//           { category: searchRegex },
//           { description: searchRegex }
//         ];
//         if (!isAllCategory) {
//           query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
//         }
//       }

//       let totalProducts = 0;
//       let totalInDb = 0;
//       try {
//         totalInDb = await Product.estimatedDocumentCount().catch(() => 0);
//         totalProducts = await Product.countDocuments(query);
//         console.log(`[PRODUCTS API] Total in DB: ${totalInDb} | Matched Filter: ${totalProducts} | Page: ${pageNum} | Skip: ${skip} | Limit: ${limitNum}`);
//       } catch (countErr) {
//         console.error('[MONGODB COUNT ERROR]', countErr);
//       }

//       const totalPages = Math.ceil(totalProducts / limitNum) || 1;

//       if (isPaginated && (pageNum > totalPages || skip >= totalProducts) && totalProducts > 0) {
//         const emptyResponse = {
//           success: true,
//           products: [],
//           currentPage: pageNum,
//           totalPages: totalPages,
//           totalProducts: totalProducts,
//           hasMore: false
//         };
//         apiCache.set(cacheKey, emptyResponse);
//         return res.status(200).json(emptyResponse);
//       }

//       let prods = [];
//       try {
//         let queryExec = Product.find(query)
//           .select('name price mrp image images category rating reviewsCount quantity remainingStock description isFeatured')
//           .sort({ createdAt: -1 });

//         if (isPaginated) {
//           queryExec = queryExec.skip(skip).limit(limitNum);
//         }

//         prods = await queryExec.lean();
//       } catch (findErr) {
//         console.error('[MONGODB FIND ERROR]', findErr);
//         prods = [];
//       }

//       if (prods.length === 0 && isAllCategory && !search && totalProducts === 0) {
//         try {
//           const inserted = await Product.insertMany(memoryProducts.map(p => {
//             const { _id, ...rest } = p;
//             return rest;
//           }));
//           prods = inserted.map(doc => doc.toObject());
//           totalProducts = prods.length;
//           if (isPaginated) {
//             prods = prods.slice(skip, skip + limitNum);
//           }
//         } catch (seedErr) {
//           console.error('[MONGODB SEED ERROR]', seedErr);
//           prods = memoryProducts;
//           if (isPaginated) prods = prods.slice(skip, skip + limitNum);
//         }
//       }

//       const sanitizedProds = prods.map(sanitizeProduct).filter(Boolean);

//       const responseData = isPaginated ? {
//         success: true,
//         products: sanitizedProds,
//         currentPage: pageNum,
//         totalPages: totalPages,
//         totalProducts: totalProducts,
//         hasMore: pageNum < totalPages
//       } : sanitizedProds;

//       apiCache.set(cacheKey, responseData);
//       return res.status(200).json(responseData);
//     } else {
//       let filtered = [...memoryProducts];
//       if (!isAllCategory) {
//         filtered = filtered.filter(p => p.category.toLowerCase() === category.trim().toLowerCase());
//       }
//       if (search && search.trim()) {
//         const s = search.trim().toLowerCase();
//         filtered = filtered.filter(p =>
//           p.name.toLowerCase().includes(s) ||
//           p.category.toLowerCase().includes(s) ||
//           (p.description && p.description.toLowerCase().includes(s))
//         );
//       }

//       const totalProducts = filtered.length;
//       const totalPages = Math.ceil(totalProducts / limitNum) || 1;

//       if (isPaginated && (pageNum > totalPages || skip >= totalProducts) && totalProducts > 0) {
//         const emptyResponse = {
//           success: true,
//           products: [],
//           currentPage: pageNum,
//           totalPages: totalPages,
//           totalProducts: totalProducts,
//           hasMore: false
//         };
//         apiCache.set(cacheKey, emptyResponse);
//         return res.status(200).json(emptyResponse);
//       }

//       let prods = filtered;
//       if (isPaginated) {
//         prods = filtered.slice(skip, skip + limitNum);
//       }

//       const sanitizedProds = prods.map(sanitizeProduct).filter(Boolean);

//       const responseData = isPaginated ? {
//         success: true,
//         products: sanitizedProds,
//         currentPage: pageNum,
//         totalPages: totalPages,
//         totalProducts: totalProducts,
//         hasMore: pageNum < totalPages
//       } : sanitizedProds;

//       apiCache.set(cacheKey, responseData);
//       return res.status(200).json(responseData);
//     }
//   } catch (err) {
//     console.error('[PRODUCTS API ERROR]', err);
//     return res.status(200).json(isPaginated ? {
//       success: true,
//       products: memoryProducts.slice(skip, skip + limitNum).map(sanitizeProduct).filter(Boolean),
//       currentPage: pageNum,
//       totalPages: Math.ceil(memoryProducts.length / limitNum) || 1,
//       totalProducts: memoryProducts.length,
//       hasMore: pageNum < (Math.ceil(memoryProducts.length / limitNum) || 1)
//     } : memoryProducts.map(sanitizeProduct).filter(Boolean));
//   }
// });

// import { uploadBase64ToCloudinary, upload } from '../config/cloudinaryConfig.js';

// // Helper to convert Base64 array / files to Cloudinary URLs
// const processProductImages = async (imagesList, files) => {
//   let finalUrls = [];

//   // If files were uploaded via multipart/form-data
//   if (files && files.length > 0) {
//     for (const file of files) {
//       if (file.path) {
//         finalUrls.push(file.path);
//       }
//     }
//   }

//   // If images array was passed (Base64 strings or URLs)
//   if (Array.isArray(imagesList)) {
//     for (const img of imagesList) {
//       if (typeof img === 'string') {
//         if (img.startsWith('data:image')) {
//           const uploadedUrl = await uploadBase64ToCloudinary(img, 'products');
//           finalUrls.push(uploadedUrl);
//         } else {
//           finalUrls.push(img);
//         }
//       }
//     }
//   }

//   return finalUrls.length > 0 ? finalUrls : [
//     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
//   ];
// };

// // POST / (Create product with optional Multer file upload)
// router.post('/', upload.array('images', 5), async (req, res) => {
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
//         reviewsCount: Number(reviewsCount) || 1,
//         images: processedImages,
//         image: processedImages[0],
//         description: description || ''
//       });
//       const reqIo = req.app.get('io');
//       if (reqIo) reqIo.emit('product_added', prod);
//       return res.json(prod);
//     } else {
//       const newProd = {
//         _id: 'p_' + Date.now(),
//         name,
//         category,
//         mrp: Number(mrp),
//         price: Number(price),
//         quantity: enteredQty,
//         remainingStock: enteredQty,
//         rating: Number(rating) || 4.5,
//         reviewsCount: Number(reviewsCount) || 1,
//         images: processedImages,
//         image: processedImages[0],
//         description: description || ''
//       };
//       memoryProducts.push(newProd);
//       const reqIo = req.app.get('io');
//       if (reqIo) reqIo.emit('product_added', newProd);
//       return res.json(newProd);
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /:id (Update product with optional Multer file upload)
// router.put('/:id', upload.array('images', 5), async (req, res) => {
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
//       const reqIo = req.app.get('io');
//       if (reqIo) reqIo.emit('product_updated', updated);
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
//         const reqIo = req.app.get('io');
//         if (reqIo) reqIo.emit('product_updated', prod);
//         return res.json(prod);
//       }
//       return res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE /:id
// router.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     clearProductCache();
//     if (isMongoConnected()) {
//       await Product.findByIdAndDelete(id);
//     } else {
//       memoryProducts = memoryProducts.filter(p => p._id !== id);
//     }
//     const reqIo = req.app.get('io');
//     if (reqIo) reqIo.emit('product_deleted', id);
//     res.json({ message: 'Product deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /:id/review
// router.post('/:id/review', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rating, reviewText, userName, userEmail, title } = req.body;

//     if (!rating || Number(rating) < 1 || Number(rating) > 5) {
//       return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
//     }

//     if (isMongoConnected()) {
//       const prod = await Product.findById(id);
//       if (!prod) return res.status(404).json({ message: 'Product not found' });

//       const newRev = {
//         userName: userName || 'Customer',
//         userEmail: userEmail || '',
//         rating: Number(rating),
//         title: title || '',
//         reviewText: reviewText || '',
//         createdAt: new Date()
//       };

//       prod.reviews.push(newRev);
//       const totalRatings = prod.reviews.reduce((sum, r) => sum + r.rating, 0);
//       prod.rating = Number((totalRatings / prod.reviews.length).toFixed(1));
//       prod.reviewsCount = prod.reviews.length;

//       await prod.save();
//       clearProductCache();
//       const reqIo = req.app.get('io');
//       if (reqIo) reqIo.emit('product_updated', prod);
//       return res.json(prod);
//     } else {
//       const prod = memoryProducts.find(p => p._id === id);
//       if (!prod) return res.status(404).json({ message: 'Product not found' });

//       if (!prod.reviews) prod.reviews = [];
//       const newRev = {
//         userName: userName || 'Customer',
//         userEmail: userEmail || '',
//         rating: Number(rating),
//         title: title || '',
//         reviewText: reviewText || '',
//         createdAt: new Date().toISOString()
//       };
//       prod.reviews.push(newRev);
//       const totalRatings = prod.reviews.reduce((sum, r) => sum + r.rating, 0);
//       prod.rating = Number((totalRatings / prod.reviews.length).toFixed(1));
//       prod.reviewsCount = prod.reviews.length;

//       clearProductCache();
//       const reqIo = req.app.get('io');
//       if (reqIo) reqIo.emit('product_updated', prod);
//       return res.json(prod);
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;


import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { apiCache } from '../server.js';
import { uploadBase64ToCloudinary, upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to clear cached products
export const clearProductCache = () => {
  try {
    const keys = apiCache.keys();
    keys.forEach(k => {
      if (k.startsWith('products_') || k.startsWith('admin_products')) {
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
    remainingStock: 15,
    rating: 4.8,
    reviewsCount: 428,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Exquisite Golden Zari Woven Royal Silk Saree'
  }
];

// Helper to convert Base64 array / files to Cloudinary URLs
const processProductImages = async (imagesList, files) => {
  let finalUrls = [];
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.path) finalUrls.push(file.path);
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

const sanitizeProduct = (p) => {
  if (!p || typeof p !== 'object') return null;
  const fallbackImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  return {
    _id: String(p._id || p.id),
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
    description: p.description || '',
    availableSizes: p.availableSizes || []
  };
};

// GET /api/products (Ultra-fast with Parallel Execution & Field Projection)
router.get('/', async (req, res) => {
  const { category, search, page, limit, t } = req.query;
  const isPaginated = page !== undefined || limit !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `products_${category || 'all'}_${search || 'none'}_p${isPaginated ? pageNum : 'all'}_l${isPaginated ? limitNum : 'all'}`;
  const cached = apiCache.get(cacheKey);
  if (cached && !t) return res.status(200).json(cached);

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
          { category: searchRegex }
        ];
      }

      // Parallel execution for Count & Lean Projection
      const [totalCount, prods] = await Promise.all([
        (!search && isAllCategory)
          ? Product.estimatedDocumentCount().maxTimeMS(2000).catch(() => Product.countDocuments(query))
          : Product.countDocuments(query).maxTimeMS(3000),
        Product.find(query)
          .select('name price mrp image images category rating reviewsCount quantity remainingStock description availableSizes createdAt')
          .sort({ createdAt: -1 })
          .skip(isPaginated ? skip : 0)
          .limit(isPaginated ? limitNum : 0)
          .lean()
          .maxTimeMS(5000)
      ]);

      const totalPages = Math.ceil((totalCount || 0) / limitNum) || 1;
      const sanitizedProds = (prods || []).map(sanitizeProduct).filter(Boolean);

      const responseData = isPaginated ? {
        success: true,
        products: sanitizedProds,
        currentPage: pageNum,
        totalPages: totalPages,
        totalProducts: totalCount,
        hasMore: pageNum < totalPages
      } : sanitizedProds;

      res.setHeader('X-Total-Count', totalCount || 0);
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
      apiCache.set(cacheKey, responseData);
      return res.status(200).json(responseData);

    } else {
      let filtered = [...memoryProducts];
      if (!isAllCategory) {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.trim().toLowerCase());
      }
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s)
        );
      }

      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / limitNum) || 1;
      const prods = isPaginated ? filtered.slice(skip, skip + limitNum) : filtered;
      const sanitizedProds = prods.map(sanitizeProduct).filter(Boolean);

      const responseData = isPaginated ? {
        success: true,
        products: sanitizedProds,
        currentPage: pageNum,
        totalPages: totalPages,
        totalProducts: totalCount,
        hasMore: pageNum < totalPages
      } : sanitizedProds;

      res.setHeader('X-Total-Count', totalCount);
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
      apiCache.set(cacheKey, responseData);
      return res.status(200).json(responseData);
    }
  } catch (err) {
    console.error('[PRODUCTS API ERROR]', err.message);
    res.setHeader('X-Total-Count', 0);
    return res.status(200).json(isPaginated ? {
      success: false,
      products: [],
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0,
      hasMore: false
    } : []);
  }
});

// POST /api/products (Add product)
router.post('/', upload.array('images', 5), async (req, res) => {
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

    clearProductCache();
    const enteredQty = Number(quantity) || 10;

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
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_added', prod);
      return res.status(201).json(prod);
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
        images: processedImages,
        image: processedImages[0],
        description: description || '',
        availableSizes: Array.isArray(parsedSizes) ? parsedSizes : []
      };
      memoryProducts.unshift(newProd);
      const reqIo = req.app.get('io');
      if (reqIo) reqIo.emit('product_added', newProd);
      return res.status(201).json(newProd);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id (Update product)
router.put('/:id', upload.array('images', 5), async (req, res) => {
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

    clearProductCache();
    const enteredQty = Number(quantity) || 10;

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
        prod.images = processedImages;
        prod.image = processedImages[0];
        prod.description = description || '';
        prod.availableSizes = Array.isArray(parsedSizes) ? parsedSizes : [];

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

// DELETE /api/products/:id
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

export default router;