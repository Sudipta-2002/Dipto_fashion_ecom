import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Flash Sale' },
    isActive: { type: Boolean, default: true },
    endTime: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

export default mongoose.models.FlashSale || mongoose.model('FlashSale', flashSaleSchema);
