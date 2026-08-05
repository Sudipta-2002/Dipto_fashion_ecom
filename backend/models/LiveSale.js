import mongoose from 'mongoose';

const liveSaleSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: true },
    title: { type: String, required: true, default: '🔥 MEGA FESTIVE SALE IS LIVE!' },
    offerDetails: { type: String, required: true, default: 'Up to 50% OFF on Banarasi Sarees & Royal Kurtas' },
    targetCategory: { type: String, default: 'All' },
    endTime: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
  },
  { timestamps: true }
);

export default mongoose.models.LiveSale || mongoose.model('LiveSale', liveSaleSchema);
