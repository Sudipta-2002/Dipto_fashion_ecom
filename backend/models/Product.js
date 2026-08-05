import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 10 },
  images: [{ type: String, required: true }],
  image: { type: String },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 142 },
  reviews: [reviewSchema],
  availableSizes: [{ type: String }], // e.g. ['S', 'M', 'L', 'XL', 'XXL', 'Free Size']
  description: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
