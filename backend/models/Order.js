import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  image: { type: String, required: true },
  selectedSize: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String },
  shippingAddress: {
    userName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  utrNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending Verification', 'Accepted', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected', 'Return Requested', 'Return Approved', 'Refund Completed'], 
    default: 'Pending Verification' 
  },
  rejectionReason: { type: String, default: '' },
  cancellationDetails: {
    reason: { type: String, default: '' },
    cancelledAt: { type: Date }
  },
  returnDetails: {
    reason: { type: String, default: '' },
    accountHolder: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' },
    notes: { type: String, default: '' },
    requestedAt: { type: Date },
    pickupDate: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
