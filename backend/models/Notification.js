import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Sale Alert', 'Special Offer', 'Flash Deal', 'Announcement'],
      default: 'Announcement'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    readBy: [{ type: String }],
    target: { type: String, default: 'ALL' }
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
