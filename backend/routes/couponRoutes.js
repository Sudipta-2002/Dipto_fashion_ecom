import express from 'express';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Helper to check MongoDB connection status
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch (e) {
    return false;
  }
};

// 1. GET / - Fetch all coupons (Admin)
router.get(['/', '/all', '/admin'], async (req, res) => {
  try {
    if (isMongoConnected()) {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      return res.json(coupons);
    } else {
      const memoryCoupons = global.memoryCoupons || [];
      return res.json(memoryCoupons);
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch coupons' });
  }
});

// 2. GET /active - Fetch active coupons (Public / Storefront)
router.get(['/active', '/public'], async (req, res) => {
  try {
    if (isMongoConnected()) {
      const activeCoupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 }).lean();
      return res.json(activeCoupons);
    } else {
      const memoryCoupons = global.memoryCoupons || [];
      return res.json(memoryCoupons.filter((c) => c.isActive));
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch active coupons' });
  }
});

// 3. POST / - Create new coupon (Admin)
router.post(['/', '/create'], async (req, res) => {
  try {
    const { code, discountType, discountAmount, maxDiscountAmount, minOrderAmount, description, isActive } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    if (discountAmount === undefined || discountAmount === null || Number(discountAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid discount amount is required' });
    }

    const uppercaseCode = code.trim().toUpperCase();

    if (isMongoConnected()) {
      const existing = await Coupon.findOne({ code: uppercaseCode });
      if (existing) {
        return res.status(400).json({ success: false, message: `Coupon code '${uppercaseCode}' already exists.` });
      }

      const newCoupon = await Coupon.create({
        code: uppercaseCode,
        discountType: discountType || 'fixed',
        discountAmount: Number(discountAmount),
        maxDiscountAmount: Number(maxDiscountAmount || 0),
        minOrderAmount: Number(minOrderAmount || 0),
        description: description ? description.trim() : '',
        isActive: isActive !== undefined ? Boolean(isActive) : true
      });

      return res.status(201).json(newCoupon);
    } else {
      global.memoryCoupons = global.memoryCoupons || [];
      const existing = global.memoryCoupons.find((c) => c.code === uppercaseCode);
      if (existing) {
        return res.status(400).json({ success: false, message: `Coupon code '${uppercaseCode}' already exists.` });
      }

      const newCoupon = {
        _id: 'c_' + Date.now(),
        code: uppercaseCode,
        discountType: discountType || 'fixed',
        discountAmount: Number(discountAmount),
        maxDiscountAmount: Number(maxDiscountAmount || 0),
        minOrderAmount: Number(minOrderAmount || 0),
        description: description ? description.trim() : '',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        createdAt: new Date().toISOString()
      };
      global.memoryCoupons.unshift(newCoupon);
      return res.status(201).json(newCoupon);
    }
  } catch (err) {
    console.error('Error creating coupon:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error creating coupon' });
  }
});

// 4. PUT /:id - Update existing coupon (Admin)
router.put(['/:id', '/update/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountAmount, maxDiscountAmount, minOrderAmount, description, isActive } = req.body;

    if (isMongoConnected()) {
      const updateFields = {};
      if (code) updateFields.code = code.trim().toUpperCase();
      if (discountType) updateFields.discountType = discountType;
      if (discountAmount !== undefined) updateFields.discountAmount = Number(discountAmount);
      if (maxDiscountAmount !== undefined) updateFields.maxDiscountAmount = Number(maxDiscountAmount);
      if (minOrderAmount !== undefined) updateFields.minOrderAmount = Number(minOrderAmount);
      if (description !== undefined) updateFields.description = description;
      if (isActive !== undefined) updateFields.isActive = Boolean(isActive);

      const updated = await Coupon.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });
      return res.json(updated);
    } else {
      global.memoryCoupons = global.memoryCoupons || [];
      const couponIndex = global.memoryCoupons.findIndex((c) => c._id === id);
      if (couponIndex === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });

      if (code) global.memoryCoupons[couponIndex].code = code.trim().toUpperCase();
      if (discountType) global.memoryCoupons[couponIndex].discountType = discountType;
      if (discountAmount !== undefined) global.memoryCoupons[couponIndex].discountAmount = Number(discountAmount);
      if (maxDiscountAmount !== undefined) global.memoryCoupons[couponIndex].maxDiscountAmount = Number(maxDiscountAmount);
      if (minOrderAmount !== undefined) global.memoryCoupons[couponIndex].minOrderAmount = Number(minOrderAmount);
      if (description !== undefined) global.memoryCoupons[couponIndex].description = description;
      if (isActive !== undefined) global.memoryCoupons[couponIndex].isActive = Boolean(isActive);

      return res.json(global.memoryCoupons[couponIndex]);
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update coupon' });
  }
});

// 5. DELETE /:id - Delete coupon (Admin)
router.delete(['/:id', '/remove/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Coupon.findByIdAndDelete(id);
    } else {
      global.memoryCoupons = (global.memoryCoupons || []).filter((c) => c._id !== id);
    }
    return res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete coupon' });
  }
});

// 6. POST /apply - Validate & Apply Coupon (Customer)
router.post(['/apply', '/validate'], async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, success: false, message: 'Please enter a coupon code' });
    }

    const amount = Number(cartAmount || 0);
    const searchCode = code.trim().toUpperCase();

    let coupon = null;
    if (isMongoConnected()) {
      coupon = await Coupon.findOne({ code: searchCode });
    } else {
      const memoryCoupons = global.memoryCoupons || [];
      coupon = memoryCoupons.find((c) => c.code === searchCode);
    }

    if (!coupon) {
      return res.status(400).json({ valid: false, success: false, message: `Coupon code '${searchCode}' does not match` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, success: false, message: `Coupon code '${coupon.code}' is currently inactive` });
    }

    if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
      const shortfall = coupon.minOrderAmount - amount;
      return res.status(400).json({
        valid: false,
        success: false,
        minOrderAmount: coupon.minOrderAmount,
        remainingAmount: shortfall,
        message: `Not Eligible: Add ₹${shortfall.toLocaleString('en-IN')} more to your cart to apply ${coupon.code} (Min Order: ₹${coupon.minOrderAmount.toLocaleString('en-IN')}).`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((amount * coupon.discountAmount) / 100);
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountAmount;
    }

    discountAmount = Math.min(discountAmount, amount);
    const payableAmount = Math.max(0, amount - discountAmount);

    return res.json({
      valid: true,
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountAmount,
      discountAmount,
      minOrderAmount: coupon.minOrderAmount || 0,
      payableAmount,
      message: `🎉 Coupon '${coupon.code}' applied successfully! You saved ₹${discountAmount.toLocaleString('en-IN')}.`
    });
  } catch (err) {
    return res.status(500).json({ valid: false, success: false, message: err.message || 'Error validating coupon' });
  }
});

export default router;
