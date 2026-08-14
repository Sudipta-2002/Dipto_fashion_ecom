import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.Mixed, required: false },
  productId: { type: String, required: false },
  _id: { type: String, required: false },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  image: { type: String, default: '' },
  selectedSize: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.Mixed, required: false },
  userName: { type: String, default: 'Customer' },
  userEmail: { type: String, default: '' },
  shippingAddress: {
    userName: { type: String, default: 'Customer' },
    email: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    landmark: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  utrNumber: { type: String, default: 'N/A' },
  paymentMethod: { type: String, default: 'UPI_QR' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  refundId: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending Verification', 'Accepted', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected', 'Return Requested', 'Return Approved', 'Refund Completed', 'Cancellation Requested'], 
    default: 'Pending Verification' 
  },
  stockDeducted: { type: Boolean, default: false },
  stockRestored: { type: Boolean, default: false },
  returnStockRestored: { type: Boolean, default: false },
  rejectionReason: { type: String, default: '' },
  cancellationDetails: {
    reason: { type: String, default: '' },
    refundToSource: { type: Boolean, default: true },
    cancelledAt: { type: Date }
  },
  returnDetails: {
    reason: { type: String, default: '' },
    refundToSource: { type: Boolean, default: true },
    pickupDate: { type: String, default: '' },
    returnedAt: { type: Date }
  }
}, { timestamps: true });

// Essential Clean High-Performance Indexes
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.status": 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

// Safe syncIndexes helper function to automatically drop redundant/unused indexes from MongoDB
Order.syncOrderIndexes = async () => {
  try {
    await Order.syncIndexes();
    console.log('[MONGOOSE] Order schema indexes synchronized cleanly.');
  } catch (err) {
    console.error('[MONGOOSE INDEX SYNC WARN]', err.message);
  }
};

export default Order;
