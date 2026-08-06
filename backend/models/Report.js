import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: false },
  userEmail: { type: String, required: true, index: true },
  userName: { type: String, default: 'Customer' },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: ['Order Issue', 'Payment Issue', 'Product Quality', 'App Bug', 'Other'],
    required: true
  },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
    index: true
  },
  adminReply: { type: String, default: '' },
  repliedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
