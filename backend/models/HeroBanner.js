import mongoose from 'mongoose';

const heroBannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: 'SHOP CATEGORY' },
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.HeroBanner || mongoose.model('HeroBanner', heroBannerSchema);
