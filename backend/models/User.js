import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  landmark: { type: String, default: '' },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''], default: '' },
  avatar: { type: String, default: '' }, // Cloudinary image URL
  profilePicture: { type: String, default: '' }, // Alias for avatar
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.index({ email: 1 }, { collation: { locale: 'en', strength: 2 } });

export default mongoose.model('User', userSchema);
