// import React, { useState, useEffect } from 'react';
// import {
//   X,
//   Package,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Truck,
//   RotateCcw,
//   Ban,
//   MapPin,
//   CreditCard,
//   Tag,
//   Star,
//   ArrowLeft,
//   ShieldCheck,
//   Calendar,
//   FileText
// } from 'lucide-react';
// import { API_URL } from '../api';
// import { formatFullAddress } from '../utils/addressFormatter';

// // Helper to check 7 days return window
// const isWithin7Days = (dateString) => {
//   if (!dateString) return false;
//   const deliveredDate = new Date(dateString);
//   const now = new Date();
//   const diffTime = Math.abs(now - deliveredDate);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays <= 7;
// };

// // Render Order Status Timeline Stepper
// const renderStatusTimeline = (status) => {
//   const steps = ['Pending Verification', 'Accepted', 'Shipped', 'Out for Delivery', 'Delivered'];
//   const normalizedStatus = status === 'Accepted' ? 'Accepted' : status;
//   let currentIndex = steps.indexOf(normalizedStatus);
//   if (currentIndex === -1) {
//     if (['Cancellation Requested', 'Cancelled', 'Rejected'].includes(status)) return null;
//     if (['Return Requested', 'Return Approved', 'Refund Completed'].includes(status)) currentIndex = 4;
//     else currentIndex = 0;
//   }

//   return (
//     <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', margin: '0.85rem 0' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '0.5rem' }}>
//         {/* Background line */}
//         <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', background: '#cbd5e1', zIndex: 1 }} />
//         {/* Active progress line */}
//         <div
//           style={{
//             position: 'absolute',
//             top: '14px',
//             left: '10%',
//             width: `${(currentIndex / (steps.length - 1)) * 80}%`,
//             height: '3px',
//             background: '#c026d3',
//             transition: 'width 0.3s ease',
//             zIndex: 1
//           }}
//         />

//         {steps.map((stepName, idx) => {
//           const isDone = idx <= currentIndex;
//           const isCurrent = idx === currentIndex;
//           return (
//             <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
//               <div
//                 style={{
//                   width: '28px',
//                   height: '28px',
//                   borderRadius: '50%',
//                   background: isDone ? '#c026d3' : '#ffffff',
//                   border: isDone ? '2px solid #c026d3' : '2px solid #cbd5e1',
//                   color: isDone ? '#ffffff' : '#94a3b8',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '0.75rem',
//                   fontWeight: '800',
//                   boxShadow: isCurrent ? '0 0 0 4px rgba(192, 38, 211, 0.2)' : 'none'
//                 }}
//               >
//                 {isDone ? <CheckCircle2 size={16} /> : idx + 1}
//               </div>
//               <span
//                 style={{
//                   fontSize: '0.68rem',
//                   fontWeight: isCurrent ? '800' : '600',
//                   color: isCurrent ? '#c026d3' : isDone ? '#0f172a' : '#94a3b8',
//                   marginTop: '6px',
//                   textAlign: 'center',
//                   lineHeight: '1.2'
//                 }}
//               >
//                 {stepName === 'Pending Verification' ? 'Placed' : stepName}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const OrderDetailsModal = ({
//   isOpen,
//   onClose,
//   order: initialOrder,
//   onRateProduct,
//   onCancelOrder,
//   onReturnOrder
// }) => {
//   // Client-side state access first (0ms instant render)
//   const [order, setOrder] = useState(initialOrder);

//   // Sync state when initialOrder prop changes
//   useEffect(() => {
//     setOrder(initialOrder);
//   }, [initialOrder]);

//   // History state integration for browser back button support
//   useEffect(() => {
//     if (!isOpen) return;

//     // Push history state if not already pushed
//     const stateKey = `order_modal_${initialOrder?.orderId || initialOrder?._id || Date.now()}`;
//     window.history.pushState({ orderModalOpen: true, key: stateKey }, '');

//     const handlePopState = () => {
//       onClose();
//     };

//     window.addEventListener('popstate', handlePopState);
//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [isOpen, initialOrder, onClose]);

//   // Non-blocking lazy background fetch to sync latest deep order state from backend
//   useEffect(() => {
//     if (!isOpen || (!order?._id && !order?.orderId)) return;

//     let isMounted = true;
//     const fetchLatestDetails = async () => {
//       try {
//         const token = localStorage.getItem('df_token');
//         const identifier = order._id || order.orderId;
//         const res = await fetch(`${API_URL}/api/orders/${identifier}`, {
//           headers: {
//             ...(token ? { Authorization: `Bearer ${token}` } : {})
//           }
//         });
//         if (res.ok) {
//           const latestData = await res.json();
//           if (isMounted && latestData) {
//             setOrder((prev) => ({ ...prev, ...latestData }));
//           }
//         }
//       } catch (e) {
//         // Silently fail, cached order data is already rendered
//       }
//     };

//     fetchLatestDetails();
//     return () => {
//       isMounted = false;
//     };
//   }, [isOpen, order?._id, order?.orderId]);

//   if (!isOpen || !order) return null;

//   const orderDateStr = order.createdAt
//     ? new Date(order.createdAt).toLocaleString('en-IN', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       })
//     : '';

//   const estDeliveryDateStr = order.createdAt
//     ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric'
//       })
//     : '';

//   const isDelivered = order.status === 'Delivered';
//   const isCancelled = order.status === 'Cancelled';
//   const isCancellationRequested = order.status === 'Cancellation Requested';
//   const isReturnRequested = order.status === 'Return Requested' || order.status === 'Return Approved';
//   const isReturnCompleted = order.status === 'Refund Completed' || order.status === 'Returned Successfully';
//   const canReturn = isDelivered && isWithin7Days(order.updatedAt || order.createdAt);
//   const canCancel = ['Pending Verification', 'Accepted'].includes(order.status);

//   // Price calculations
//   const itemsSubtotal = order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0;
//   const couponDiscount = order.couponDiscount || 0;
//   const deliveryCharge = 0; // Free delivery
//   const finalTotal = order.totalAmount || itemsSubtotal - couponDiscount;

//   const handleModalClose = () => {
//     if (window.history.state?.orderModalOpen) {
//       window.history.back();
//     } else {
//       onClose();
//     }
//   };

//   return (
//     <div
//       className="modal-overlay"
//       onClick={handleModalClose}
//       style={{
//         zIndex: 1100,
//         background: 'rgba(15, 23, 42, 0.65)',
//         backdropFilter: 'blur(4px)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '0.75rem'
//       }}
//     >
//       <div
//         className="modal-card"
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           width: '100%',
//           maxWidth: '560px',
//           maxHeight: '90dvh',
//           background: '#ffffff',
//           borderRadius: '16px',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
//         }}
//       >
//         {/* FIXED TOP HEADER */}
//         <div
//           style={{
//             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
//             padding: '1rem 1.25rem',
//             color: '#ffffff',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             flexShrink: 0,
//             zIndex: 10
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//             <button
//               type="button"
//               onClick={handleModalClose}
//               style={{
//                 background: 'rgba(255,255,255,0.2)',
//                 border: 'none',
//                 color: '#ffffff',
//                 width: '32px',
//                 height: '32px',
//                 borderRadius: '50%',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//               title="Back"
//             >
//               <ArrowLeft size={18} />
//             </button>
//             <div>
//               <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.2px' }}>
//                 Order Details
//               </h3>
//               <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>
//                 ID: <strong style={{ color: '#f5d0fe' }}>{order.orderId}</strong>
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={handleModalClose}
//             style={{
//               background: 'rgba(255,255,255,0.15)',
//               border: 'none',
//               color: '#ffffff',
//               width: '32px',
//               height: '32px',
//               borderRadius: '50%',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//             title="Close"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* SCROLLABLE BODY CONTENT */}
//         <div
//           style={{
//             flex: 1,
//             overflowY: 'auto',
//             overscrollBehavior: 'contain',
//             padding: '1.15rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '1rem'
//           }}
//         >
//           {/* HEADER ORDER META & STATUS CARD */}
//           <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
//               <div>
//                 <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Placed On</span>
//                 <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                   <Calendar size={14} color="#c026d3" /> {orderDateStr}
//                 </div>
//               </div>

//               {/* Status Badge */}
//               {isCancelled ? (
//                 <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: '800', background: '#fee2e2', padding: '3px 10px', borderRadius: '12px' }}>
//                   Cancelled
//                 </span>
//               ) : isCancellationRequested ? (
//                 <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', background: '#fffbeb', padding: '3px 10px', borderRadius: '12px', border: '1px solid #fde68a' }}>
//                   ⏳ Cancellation Pending
//                 </span>
//               ) : isReturnCompleted ? (
//                 <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
//                   Returned & Refunded
//                 </span>
//               ) : isReturnRequested ? (
//                 <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: '800', background: '#fff7ed', padding: '3px 10px', borderRadius: '12px' }}>
//                   Return In Progress
//                 </span>
//               ) : isDelivered ? (
//                 <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
//                   Delivered
//                 </span>
//               ) : (
//                 <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '800', background: '#e0f2fe', padding: '3px 10px', borderRadius: '12px' }}>
//                   {order.status || 'Order Placed'}
//                 </span>
//               )}
//             </div>

//             {/* Live Timeline Stepper */}
//             {!isCancelled && !isCancellationRequested && !isReturnCompleted && !isReturnRequested && renderStatusTimeline(order.status)}

//             {!isDelivered && !isCancelled && !isReturnRequested && (
//               <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
//                 <Truck size={15} color="#16a34a" /> Estimated Delivery: <strong>{estDeliveryDateStr}</strong>
//               </div>
//             )}
//           </div>

//           {/* ORDERED PRODUCTS LIST */}
//           <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
//             <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
//               <Package size={17} color="#c026d3" /> Ordered Items ({order.items?.length || 0})
//             </h4>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//               {order.items?.map((item, idx) => {
//                 const itemSize = item.selectedSize || (item.name?.toLowerCase().includes('saree') ? 'Free Size' : 'Standard');
//                 return (
//                   <div
//                     key={idx}
//                     style={{
//                       display: 'flex',
//                       gap: '0.85rem',
//                       alignItems: 'center',
//                       background: '#f8fafc',
//                       border: '1px solid #e2e8f0',
//                       borderRadius: '10px',
//                       padding: '0.65rem'
//                     }}
//                   >
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
//                       onError={(e) => {
//                         e.target.src = '/logo.jpg';
//                       }}
//                     />
//                     <div style={{ flex: 1, overflow: 'hidden' }}>
//                       <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                         {item.name}
//                       </div>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
//                         <span style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', fontSize: '0.72rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
//                           Size: {itemSize}
//                         </span>
//                         <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
//                           Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
//                         </span>
//                       </div>
//                     </div>

//                     <div style={{ textAlign: 'right', flexShrink: 0 }}>
//                       <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>
//                         ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* SHIPPING & DELIVERY ADDRESS */}
//           <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
//             <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
//               <MapPin size={17} color="#c026d3" /> Delivery Address
//             </h4>
//             <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.45' }}>
//               <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem', marginBottom: '2px' }}>
//                 {order.shippingAddress?.userName || order.userName || 'Customer'}
//               </div>
//               <div>{formatFullAddress(order.shippingAddress)}</div>
//               {order.shippingAddress?.mobileNumber && (
//                 <div style={{ marginTop: '4px', fontWeight: '700', color: '#475569', fontSize: '0.8rem' }}>
//                   Mobile: {order.shippingAddress.mobileNumber}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* PAYMENT INFORMATION */}
//           <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
//             <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
//               <CreditCard size={17} color="#c026d3" /> Payment Details
//             </h4>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <span style={{ color: '#64748b', fontWeight: '600' }}>Payment Mode:</span>
//                 <span style={{ fontWeight: '800', color: '#0f172a' }}>{order.paymentMethod || 'Prepaid (UPI QR)'}</span>
//               </div>
//               {order.utrNumber && order.utrNumber !== 'N/A' && (
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <span style={{ color: '#64748b', fontWeight: '600' }}>UTR / Reference No:</span>
//                   <span style={{ fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.utrNumber}</span>
//                 </div>
//               )}
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
//                 <span style={{ color: '#64748b', fontWeight: '600' }}>Payment Status:</span>
//                 <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
//                   <ShieldCheck size={13} /> Verified & Paid
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* BILLING SUMMARY / PRICE BREAKDOWN */}
//           <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
//             <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
//               <FileText size={17} color="#c026d3" /> Price Breakdown
//             </h4>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
//                 <span>Items Subtotal</span>
//                 <span style={{ fontWeight: '700' }}>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
//               </div>

//               {couponDiscount > 0 && (
//                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
//                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//                     <Tag size={13} /> Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}
//                   </span>
//                   <span style={{ fontWeight: '800' }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
//                 </div>
//               )}

//               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
//                 <span>Delivery Charge</span>
//                 <span style={{ fontWeight: '800', color: '#16a34a' }}>FREE</span>
//               </div>

//               <div
//                 style={{
//                   borderTop: '1.5px dashed #cbd5e1',
//                   paddingTop: '0.55rem',
//                   marginTop: '0.25rem',
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>Total Amount Paid</span>
//                 <span style={{ fontSize: '1.15rem', fontWeight: '900', color: isCancelled ? '#dc2626' : '#16a34a' }}>
//                   ₹{finalTotal.toLocaleString('en-IN')}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetailsModal;






import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Ban,
  MapPin,
  CreditCard,
  Tag,
  Star,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';
import { API_URL } from '../api';
import { formatFullAddress } from '../utils/addressFormatter';

// Helper to check 7 days return window
const isWithin7Days = (dateString) => {
  if (!dateString) return false;
  const deliveredDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - deliveredDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

// Render Order Status Timeline Stepper
const renderStatusTimeline = (status) => {
  const steps = ['Pending Verification', 'Accepted', 'Shipped', 'Out for Delivery', 'Delivered'];
  const normalizedStatus = status === 'Accepted' ? 'Accepted' : status;
  let currentIndex = steps.indexOf(normalizedStatus);
  if (currentIndex === -1) {
    if (['Cancellation Requested', 'Cancelled', 'Rejected'].includes(status)) return null;
    if (['Return Requested', 'Return Approved', 'Refund Completed'].includes(status)) currentIndex = 4;
    else currentIndex = 0;
  }

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', margin: '0.85rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '0.5rem' }}>
        {/* Background line */}
        <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', background: '#cbd5e1', zIndex: 1 }} />
        {/* Active progress line */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '10%',
            width: `${(currentIndex / (steps.length - 1)) * 80}%`,
            height: '3px',
            background: '#c026d3',
            transition: 'width 0.3s ease',
            zIndex: 1
          }}
        />

        {steps.map((stepName, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDone ? '#c026d3' : '#ffffff',
                  border: isDone ? '2px solid #c026d3' : '2px solid #cbd5e1',
                  color: isDone ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(192, 38, 211, 0.2)' : 'none'
                }}
              >
                {isDone ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: isCurrent ? '800' : '600',
                  color: isCurrent ? '#c026d3' : isDone ? '#0f172a' : '#94a3b8',
                  marginTop: '6px',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}
              >
                {stepName === 'Pending Verification' ? 'Placed' : stepName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetailsModal = ({
  isOpen,
  onClose,
  order: initialOrder,
  onRateProduct,
  onCancelOrder,
  onReturnOrder
}) => {
  // Client-side state access first (0ms instant render)
  const [order, setOrder] = useState(initialOrder);

  // Sync state when initialOrder prop changes
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // History state integration for browser back button support
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  // Non-blocking lazy background fetch to sync latest deep order state from backend
  useEffect(() => {
    if (!isOpen || (!order?._id && !order?.orderId)) return;

    let isMounted = true;
    const fetchLatestDetails = async () => {
      try {
        const token = localStorage.getItem('df_token');
        const identifier = order._id || order.orderId;
        const res = await fetch(`${API_URL}/api/orders/${identifier}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const latestData = await res.json();
          if (isMounted && latestData) {
            setOrder((prev) => ({ ...prev, ...latestData }));
          }
        }
      } catch (e) {
        // Silently fail, cached order data is already rendered
      }
    };

    fetchLatestDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, order?._id, order?.orderId]);

  if (!isOpen || !order) return null;

  const orderDateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const estDeliveryDateStr = order.createdAt
    ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const isCancellationRequested = order.status === 'Cancellation Requested';
  const isReturnRequested = order.status === 'Return Requested' || order.status === 'Return Approved';
  const isReturnCompleted = order.status === 'Refund Completed' || order.status === 'Returned Successfully';
  const canReturn = isDelivered && isWithin7Days(order.updatedAt || order.createdAt);
  const canCancel = ['Pending Verification', 'Accepted'].includes(order.status);

  // Price calculations
  const itemsSubtotal = order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0;
  const couponDiscount = order.couponDiscount || 0;
  const deliveryCharge = 0; // Free delivery
  const finalTotal = order.totalAmount || itemsSubtotal - couponDiscount;

  const handleModalClose = () => {
    onClose();
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      className="modal-overlay"
      onClick={handleModalClose}
      style={{
        zIndex: 1200,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '0.75rem',
        overflow: 'hidden'
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: isMobile ? '100dvh' : 'auto',
          maxHeight: isMobile ? '100dvh' : '90dvh',
          background: '#ffffff',
          borderRadius: isMobile ? '0' : '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* FIXED TOP HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            padding: '1rem 1.25rem',
            paddingTop: isMobile ? 'calc(0.85rem + env(safe-area-inset-top, 0px))' : '1rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleModalClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.2px' }}>
                Order Details
              </h3>
              <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>
                ID: <strong style={{ color: '#f5d0fe' }}>{order.orderId}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE BODY CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '1.15rem',
            paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 20px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* HEADER ORDER META & STATUS CARD */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Placed On</span>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} color="#c026d3" /> {orderDateStr}
                </div>
              </div>

              {/* Status Badge */}
              {isCancelled ? (
                <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: '800', background: '#fee2e2', padding: '3px 10px', borderRadius: '12px' }}>
                  Cancelled
                </span>
              ) : isCancellationRequested ? (
                <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', background: '#fffbeb', padding: '3px 10px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  ⏳ Cancellation Pending
                </span>
              ) : isReturnCompleted ? (
                <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                  Returned & Refunded
                </span>
              ) : isReturnRequested ? (
                <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: '800', background: '#fff7ed', padding: '3px 10px', borderRadius: '12px' }}>
                  Return In Progress
                </span>
              ) : isDelivered ? (
                <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                  Delivered
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '800', background: '#e0f2fe', padding: '3px 10px', borderRadius: '12px' }}>
                  {order.status || 'Order Placed'}
                </span>
              )}
            </div>

            {/* Live Timeline Stepper */}
            {!isCancelled && !isCancellationRequested && !isReturnCompleted && !isReturnRequested && renderStatusTimeline(order.status)}

            {!isDelivered && !isCancelled && !isReturnRequested && (
              <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Truck size={15} color="#16a34a" /> Estimated Delivery: <strong>{estDeliveryDateStr}</strong>
              </div>
            )}
          </div>

          {/* ORDERED PRODUCTS LIST */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={17} color="#c026d3" /> Ordered Items ({order.items?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.items?.map((item, idx) => {
                const itemSize = item.selectedSize || (item.name?.toLowerCase().includes('saree') ? 'Free Size' : 'Standard');
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'center',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.65rem'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      onError={(e) => {
                        e.target.src = '/logo.jpg';
                      }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', fontSize: '0.72rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                          Size: {itemSize}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SHIPPING & DELIVERY ADDRESS */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={17} color="#c026d3" /> Delivery Address
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.45' }}>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem', marginBottom: '2px' }}>
                {order.shippingAddress?.userName || order.userName || 'Customer'}
              </div>
              <div>{formatFullAddress(order.shippingAddress)}</div>
              {order.shippingAddress?.mobileNumber && (
                <div style={{ marginTop: '4px', fontWeight: '700', color: '#475569', fontSize: '0.8rem' }}>
                  Mobile: {order.shippingAddress.mobileNumber}
                </div>
              )}
            </div>
          </div>

          {/* PAYMENT INFORMATION */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={17} color="#c026d3" /> Payment Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Payment Mode:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>{order.paymentMethod || 'Prepaid (UPI QR)'}</span>
              </div>
              {order.utrNumber && order.utrNumber !== 'N/A' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>UTR / Reference No:</span>
                  <span style={{ fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.utrNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Payment Status:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={13} /> Verified & Paid
                </span>
              </div>
            </div>
          </div>

          {/* BILLING SUMMARY / PRICE BREAKDOWN */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.9rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={17} color="#c026d3" /> Price Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Items Subtotal</span>
                <span style={{ fontWeight: '700' }}>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={13} /> Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}
                  </span>
                  <span style={{ fontWeight: '800' }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Delivery Charge</span>
                <span style={{ fontWeight: '800', color: '#16a34a' }}>FREE</span>
              </div>

              <div
                style={{
                  borderTop: '1.5px dashed #cbd5e1',
                  paddingTop: '0.55rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>Total Amount Paid</span>
                <span style={{ fontSize: '1.15rem', fontWeight: '900', color: isCancelled ? '#dc2626' : '#16a34a' }}>
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;