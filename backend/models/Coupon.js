import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  discountAmount: {
    type: Number,
    required: true
  },
  maxDiscountAmount: {
    type: Number,
    default: 0 // 0 means no cap for percentage
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
