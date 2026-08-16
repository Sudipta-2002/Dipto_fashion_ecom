// import React, { useState } from 'react';
// import { X, AlertCircle, CheckCircle2, Ban, CreditCard } from 'lucide-react';
// import { API_URL } from '../api';

// const CANCELLATION_REASONS = [
//   "Changed my mind / Don't need it anymore",
//   'Ordered wrong size or color',
//   'Found a better price elsewhere',
//   'Delivery timeline is too long',
//   'Payment or UTR reference issue',
//   'Other / Personal reasons'
// ];

// const OrderCancelModal = ({ isOpen, onClose, order, onCancelSuccess }) => {
//   const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
//   const [customNotes, setCustomNotes] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [submitted, setSubmitted] = useState(false);

//   if (!isOpen || !order) return null;

//   const handleConfirmCancel = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const payload = {
//         reason: `${selectedReason}${customNotes ? ` — ${customNotes}` : ''}`,
//         refundToSource: true
//       };

//       const res = await fetch(`${API_URL}/api/orders/${order._id || order.orderId}/cancel`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed to submit cancellation request');

//       setSubmitted(true);
//       if (onCancelSuccess) onCancelSuccess(data.order || data);
//       setTimeout(() => {
//         onClose();
//         setSubmitted(false);
//       }, 2200);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay" style={{ zIndex: 9999 }}>
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '500px',
//           width: 'min(94%, calc(100vw - 1rem))',
//           borderRadius: '18px',
//           maxHeight: '85dvh',
//           overflowY: 'auto',
//           WebkitOverflowScrolling: 'touch',
//           display: 'flex',
//           flexDirection: 'column'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div style={{ background: 'linear-gradient(135deg, #fff1f2, #fdf4ff)', borderBottom: '1px solid #fecdd3', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', position: 'sticky', top: 0, zIndex: 10 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
//             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//               <Ban size={18} />
//             </div>
//             <div style={{ minWidth: 0 }}>
//               <h3 style={{ fontSize: 'clamp(0.9rem, 3.5vw, 0.98rem)', fontWeight: '800', color: '#be123c', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Request Order Cancellation</h3>
//               <p style={{ fontSize: '0.72rem', color: '#e11d48', margin: 0, wordBreak: 'break-all' }}>Order: <strong>{order.orderId}</strong> &nbsp;•&nbsp; ₹{order.totalAmount?.toLocaleString('en-IN')}</p>
//             </div>
//           </div>
//           <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', flexShrink: 0 }}>
//             <X size={20} color="#be123c" />
//           </button>
//         </div>

//         {/* Content */}
//         {submitted ? (
//           <div style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem) 1.25rem', textAlign: 'center' }}>
//             <div style={{ width: '56px', height: '56px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
//               <CheckCircle2 size={34} />
//             </div>
//             <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.3rem)', fontWeight: '900', color: '#15803d', marginBottom: '0.4rem' }}>
//               Cancellation Request Submitted!
//             </h2>
//             <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
//               Your cancellation for order <strong style={{ color: '#c026d3' }}>{order.orderId}</strong> is under review.
//               Refund amount will be refunded directly to the original payment source.
//             </p>
//           </div>
//         ) : (
//           <form onSubmit={handleConfirmCancel} style={{ padding: 'clamp(0.85rem, 4vw, 1.25rem)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
//             {error && (
//               <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                 <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
//               </div>
//             )}

//             {/* Reason */}
//             <div className="form-group" style={{ margin: 0 }}>
//               <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
//                 Cancellation Reason *
//               </label>
//               <select
//                 value={selectedReason}
//                 onChange={(e) => setSelectedReason(e.target.value)}
//                 style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
//               >
//                 {CANCELLATION_REASONS.map((reason, idx) => (
//                   <option key={idx} value={reason}>{reason}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group" style={{ margin: 0 }}>
//               <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
//                 Additional Comments <span style={{ fontWeight: '400', color: '#94a3b8' }}>(Optional)</span>
//               </label>
//               <textarea
//                 placeholder="Any additional details..."
//                 value={customNotes}
//                 onChange={(e) => setCustomNotes(e.target.value)}
//                 rows={2}
//                 style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '16px', outline: 'none', resize: 'vertical', maxHeight: '80px', boxSizing: 'border-box' }}
//               />
//             </div>

//             {/* Fixed Refund Source Pre-Selected Option */}
//             <div style={{ background: '#fdf4ff', border: '1.5px solid #c026d3', borderRadius: '12px', padding: '0.85rem' }}>
//               <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'default', margin: 0 }}>
//                 <input type="radio" checked disabled readOnly style={{ accentColor: '#c026d3', marginTop: '3px', flexShrink: 0 }} />
//                 <div>
//                   <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#701a75', display: 'flex', alignItems: 'center', gap: '5px' }}>
//                     <CreditCard size={16} style={{ flexShrink: 0 }} /> Refund to Original Payment Source
//                   </div>
//                   <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0', lineHeight: '1.4' }}>
//                     Refund amount will be refunded directly to the original payment source.
//                   </p>
//                 </div>
//               </label>
//             </div>

//             <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
//               <button
//                 type="button"
//                 className="btn-outline"
//                 onClick={onClose}
//                 style={{ flex: '1 1 120px', justifyContent: 'center', minWidth: '100px', padding: '0.75rem' }}
//               >
//                 Keep Order
//               </button>
//               <button
//                 type="submit"
//                 className="btn-primary"
//                 style={{ flex: '1 1 150px', justifyContent: 'center', background: '#dc2626', borderColor: '#b91c1c', minWidth: '130px', padding: '0.75rem' }}
//                 disabled={loading}
//               >
//                 {loading ? 'Submitting...' : 'Request Cancellation'}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrderCancelModal;













// import React, { useState } from 'react';
// import { X, Ban, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
// import { API_URL, apiFetch, parseResponseSafely } from '../api';

// const CANCEL_REASONS = [
//   'Changed my mind / Don\'t need it anymore',
//   'Ordered by mistake',
//   'Found a better price elsewhere',
//   'Delivery time is too long',
//   'Need to change shipping address / size',
//   'Other reasons'
// ];

// const OrderCancelModal = ({ isOpen, onClose, order, onCancelSuccess }) => {
//   const [reason, setReason] = useState(CANCEL_REASONS[0]);
//   const [comments, setComments] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   if (!isOpen || !order) return null;

//   const handleCancelSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const token = localStorage.getItem('df_token');
//       const res = await apiFetch(`/api/orders/${order._id || order.id}/cancel-request`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({
//           reason,
//           comments: comments.trim()
//         })
//       });

//       const data = await parseResponseSafely(res);

//       if (res.ok && data.success) {
//         if (onCancelSuccess) {
//           onCancelSuccess(data.order || { ...order, status: 'Cancellation Requested' });
//         }
//         onClose();
//       } else {
//         setError(data.message || 'Failed to submit cancellation request.');
//       }
//     } catch (err) {
//       setError('Network connection error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputFocus = (e) => {
//     const target = e.target;
//     setTimeout(() => {
//       target.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 250);
//   };

//   return (
//     <div
//       className="modal-overlay fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4"
//       style={{
//         zIndex: 9999,
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: 'rgba(15, 23, 42, 0.75)',
//         backdropFilter: 'blur(5px)',
//         WebkitBackdropFilter: 'blur(5px)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         boxSizing: 'border-box'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[85dvh] w-full max-w-[450px] rounded-none sm:rounded-[18px] bg-white shadow-2xl overflow-hidden flex flex-col relative"
//         style={{
//           maxWidth: '450px',
//           width: '100%',
//           maxHeight: '100dvh',
//           background: '#ffffff',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
//           position: 'relative',
//           animation: 'fadeInUp 0.25s ease-out'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Fixed Top Header */}
//         <div
//           className="modal-header sticky top-0 shrink-0 z-10 px-4 py-3.5 border-b border-rose-200 flex items-center justify-between gap-3"
//           style={{
//             background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
//             padding: '0.85rem 1rem',
//             paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.85rem)',
//             borderBottom: '1.5px solid #fecdd3',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: '0.75rem',
//             position: 'sticky',
//             top: 0,
//             zIndex: 10,
//             flexShrink: 0
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
//             <div
//               style={{
//                 width: '38px',
//                 height: '38px',
//                 borderRadius: '10px',
//                 background: '#fee2e2',
//                 border: '1px solid #fca5a5',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#dc2626',
//                 flexShrink: 0
//               }}
//             >
//               <Ban size={20} />
//             </div>
//             <div style={{ minWidth: 0, flex: 1 }}>
//               <h3
//                 style={{
//                   fontSize: 'clamp(0.88rem, 3.8vw, 1rem)',
//                   fontWeight: '800',
//                   color: '#991b1b',
//                   margin: 0,
//                   whiteSpace: 'nowrap',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis'
//                 }}
//               >
//                 Request Order Cancellation
//               </h3>
//               <p
//                 style={{
//                   fontSize: '0.75rem',
//                   color: '#b91c1c',
//                   margin: '2px 0 0 0',
//                   fontWeight: '600',
//                   whiteSpace: 'nowrap',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis'
//                 }}
//               >
//                 Order: <span style={{ color: '#dc2626', fontWeight: '800' }}>{order.orderId}</span> • ₹{order.totalAmount?.toLocaleString('en-IN')}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             style={{
//               background: 'white',
//               border: '1px solid #fca5a5',
//               borderRadius: '50%',
//               width: '32px',
//               height: '32px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#991b1b',
//               cursor: 'pointer',
//               flexShrink: 0,
//               boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//             }}
//             aria-label="Close"
//           >
//             <X size={17} />
//           </button>
//         </div>

//         {/* Form Container with Scrollable Body and Fixed Footer */}
//         <form
//           onSubmit={handleCancelSubmit}
//           className="flex-1 flex flex-col min-h-0 overflow-hidden"
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             flex: 1,
//             minHeight: 0,
//             overflow: 'hidden'
//           }}
//         >
//           {/* Scrollable Middle Body */}
//           <div
//             className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col gap-4"
//             style={{
//               flex: 1,
//               overflowY: 'auto',
//               WebkitOverflowScrolling: 'touch',
//               overscrollBehaviorY: 'contain',
//               padding: '1rem 1.15rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '1rem'
//             }}
//           >
//             {error && (
//               <div
//                 style={{
//                   background: '#fef2f2',
//                   border: '1.5px solid #fca5a5',
//                   padding: '0.75rem',
//                   borderRadius: '10px',
//                   color: '#b91c1c',
//                   fontSize: '0.82rem',
//                   fontWeight: '700',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '6px'
//                 }}
//               >
//                 <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
//               </div>
//             )}

//             {/* Cancellation Reason */}
//             <div>
//               <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//                 Cancellation Reason *
//               </label>
//               <select
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 onFocus={handleInputFocus}
//                 style={{
//                   width: '100%',
//                   padding: '0.75rem',
//                   borderRadius: '10px',
//                   border: '1.5px solid #cbd5e1',
//                   background: '#f8fafc',
//                   fontSize: '0.86rem',
//                   fontWeight: '600',
//                   color: '#1e293b',
//                   outline: 'none'
//                 }}
//               >
//                 {CANCEL_REASONS.map((r, idx) => (
//                   <option key={idx} value={r}>
//                     {r}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Additional Comments */}
//             <div>
//               <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//                 Additional Comments <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
//               </label>
//               <textarea
//                 rows="3"
//                 placeholder="Any additional details..."
//                 value={comments}
//                 onChange={(e) => setComments(e.target.value)}
//                 onFocus={handleInputFocus}
//                 style={{
//                   width: '100%',
//                   padding: '0.75rem',
//                   borderRadius: '10px',
//                   border: '1.5px solid #cbd5e1',
//                   background: '#ffffff',
//                   fontSize: '0.85rem',
//                   lineHeight: '1.4',
//                   color: '#1e293b',
//                   boxSizing: 'border-box',
//                   outline: 'none'
//                 }}
//               />
//             </div>

//             {/* Refund Notice Card */}
//             <div
//               style={{
//                 background: '#fdf4ff',
//                 border: '1.5px solid #f0abfc',
//                 borderRadius: '12px',
//                 padding: '0.85rem 1rem',
//                 display: 'flex',
//                 alignItems: 'flex-start',
//                 gap: '0.75rem'
//               }}
//             >
//               <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#c026d3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900', marginTop: '2px', flexShrink: 0 }}>
//                 ✓
//               </div>
//               <div>
//                 <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#86198f' }}>
//                   Refund to Original Payment Source
//                 </div>
//                 <div style={{ fontSize: '0.75rem', color: '#701a75', marginTop: '2px', lineHeight: '1.35' }}>
//                   The full refund amount (₹{order.totalAmount?.toLocaleString('en-IN')}) will be processed directly to your UPI/Bank account within 24-48 hours once approved.
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Fixed Bottom Action Footer */}
//           <div
//             className="shrink-0 p-4 pt-3 border-t border-slate-100 bg-white z-10 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr 1.3fr',
//               gap: '0.65rem',
//               padding: '0.85rem 1.15rem',
//               paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
//               borderTop: '1px solid #f1f5f9',
//               background: '#ffffff',
//               flexShrink: 0,
//               position: 'relative',
//               zIndex: 10
//             }}
//           >
//             <button
//               type="button"
//               onClick={onClose}
//               style={{
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 border: '1.5px solid #cbd5e1',
//                 background: '#ffffff',
//                 color: '#475569',
//                 fontWeight: '700',
//                 fontSize: '0.88rem',
//                 cursor: 'pointer'
//               }}
//             >
//               Keep Order
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               style={{
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 border: 'none',
//                 background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
//                 color: '#ffffff',
//                 fontWeight: '800',
//                 fontSize: '0.88rem',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
//               }}
//             >
//               {loading ? 'Processing...' : 'Request Cancellation'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OrderCancelModal;












// import React, { useState } from 'react';
// import { X, Ban, AlertCircle } from 'lucide-react';
// import { API_URL, apiFetch, parseResponseSafely } from '../api';

// const CANCEL_REASONS = [
//   'Changed my mind / Don\'t need it anymore',
//   'Ordered by mistake',
//   'Found a better price elsewhere',
//   'Delivery time is too long',
//   'Need to change shipping address / size',
//   'Other reasons'
// ];

// const OrderCancelModal = ({ isOpen, onClose, order, onCancelSuccess }) => {
//   const [reason, setReason] = useState(CANCEL_REASONS[0]);
//   const [comments, setComments] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   if (!isOpen || !order) return null;

//   const handleCancelSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const token = localStorage.getItem('df_token');
//       const res = await apiFetch(`/api/orders/${order._id || order.id}/cancel-request`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({
//           reason,
//           comments: comments.trim()
//         })
//       });

//       const data = await parseResponseSafely(res);

//       if (res.ok && data.success) {
//         if (onCancelSuccess) {
//           onCancelSuccess(data.order || { ...order, status: 'Cancellation Requested' });
//         }
//         onClose();
//       } else {
//         setError(data.message || 'Failed to submit cancellation request.');
//       }
//     } catch (err) {
//       setError('Network connection error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputFocus = (e) => {
//     const target = e.target;
//     setTimeout(() => {
//       target.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 250);
//   };

//   return (
//     <div
//       className="modal-overlay fixed inset-0 z-[99999] flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
//       style={{
//         zIndex: 99999,
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(15, 23, 42, 0.78)',
//         backdropFilter: 'blur(6px)',
//         WebkitBackdropFilter: 'blur(6px)',
//         display: 'flex',
//         justifyContent: 'center',
//         boxSizing: 'border-box'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card w-full max-w-[450px] bg-white shadow-2xl overflow-hidden flex flex-col relative rounded-none sm:rounded-[20px]"
//         style={{
//           maxWidth: '450px',
//           width: '100%',
//           height: '100dvh',
//           maxHeight: '100dvh',
//           background: '#ffffff',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
//           position: 'relative'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* 1. FIXED TOP HEADER */}
//         <div
//           className="modal-header shrink-0 px-4 py-3 border-b border-rose-200 flex items-center justify-between gap-3 sticky top-0 z-20"
//           style={{
//             background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
//             padding: '0.85rem 1rem',
//             paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.85rem)',
//             borderBottom: '1.5px solid #fecdd3',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: '0.75rem',
//             position: 'sticky',
//             top: 0,
//             zIndex: 20,
//             flexShrink: 0
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
//             <div
//               style={{
//                 width: '38px',
//                 height: '38px',
//                 borderRadius: '10px',
//                 background: '#fee2e2',
//                 border: '1px solid #fca5a5',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#dc2626',
//                 flexShrink: 0
//               }}
//             >
//               <Ban size={20} />
//             </div>
//             <div style={{ minWidth: 0, flex: 1 }}>
//               <h3
//                 style={{
//                   fontSize: 'clamp(0.88rem, 3.8vw, 1rem)',
//                   fontWeight: '800',
//                   color: '#991b1b',
//                   margin: 0,
//                   whiteSpace: 'nowrap',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis'
//                 }}
//               >
//                 Request Order Cancellation
//               </h3>
//               <p
//                 style={{
//                   fontSize: '0.75rem',
//                   color: '#b91c1c',
//                   margin: '2px 0 0 0',
//                   fontWeight: '600',
//                   whiteSpace: 'nowrap',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis'
//                 }}
//               >
//                 Order: <span style={{ color: '#dc2626', fontWeight: '800' }}>{order.orderId}</span> • ₹{order.totalAmount?.toLocaleString('en-IN')}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             style={{
//               background: 'white',
//               border: '1px solid #fca5a5',
//               borderRadius: '50%',
//               width: '32px',
//               height: '32px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#991b1b',
//               cursor: 'pointer',
//               flexShrink: 0,
//               boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//             }}
//             aria-label="Close"
//           >
//             <X size={17} />
//           </button>
//         </div>

//         {/* 2. ALL CONTENT & BUTTONS INSIDE SCROLLABLE AREA */}
//         <form
//           onSubmit={handleCancelSubmit}
//           className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4"
//           style={{
//             flex: 1,
//             overflowY: 'auto',
//             WebkitOverflowScrolling: 'touch',
//             overscrollBehaviorY: 'contain',
//             padding: '1rem',
//             /* Bottom navigation bar-er upore jate button uthe ase tai 90px extra padding */
//             paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '1rem'
//           }}
//         >
//           {error && (
//             <div
//               style={{
//                 background: '#fef2f2',
//                 border: '1.5px solid #fca5a5',
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 color: '#b91c1c',
//                 fontSize: '0.82rem',
//                 fontWeight: '700',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '6px'
//               }}
//             >
//               <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
//             </div>
//           )}

//           {/* Cancellation Reason */}
//           <div>
//             <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//               Cancellation Reason *
//             </label>
//             <select
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               onFocus={handleInputFocus}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 border: '1.5px solid #cbd5e1',
//                 background: '#f8fafc',
//                 fontSize: '0.86rem',
//                 fontWeight: '600',
//                 color: '#1e293b',
//                 outline: 'none'
//               }}
//             >
//               {CANCEL_REASONS.map((r, idx) => (
//                 <option key={idx} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Additional Comments */}
//           <div>
//             <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//               Additional Comments <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
//             </label>
//             <textarea
//               rows="3"
//               placeholder="Any additional details..."
//               value={comments}
//               onChange={(e) => setComments(e.target.value)}
//               onFocus={handleInputFocus}
//               style={{
//                 width: '100%',
//                 padding: '0.7rem',
//                 borderRadius: '10px',
//                 border: '1.5px solid #cbd5e1',
//                 background: '#ffffff',
//                 fontSize: '0.85rem',
//                 lineHeight: '1.4',
//                 color: '#1e293b',
//                 boxSizing: 'border-box',
//                 outline: 'none'
//               }}
//             />
//           </div>

//           {/* Refund Notice Card */}
//           <div
//             style={{
//               background: '#fdf4ff',
//               border: '1.5px solid #f0abfc',
//               borderRadius: '12px',
//               padding: '0.85rem 1rem',
//               display: 'flex',
//               alignItems: 'flex-start',
//               gap: '0.75rem'
//             }}
//           >
//             <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#c026d3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900', marginTop: '2px', flexShrink: 0 }}>
//               ✓
//             </div>
//             <div>
//               <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#86198f' }}>
//                 Refund to Original Payment Source
//               </div>
//               <div style={{ fontSize: '0.75rem', color: '#701a75', marginTop: '2px', lineHeight: '1.35' }}>
//                 The full refund amount (₹{order.totalAmount?.toLocaleString('en-IN')}) will be processed directly to your UPI/Bank account within 24-48 hours once approved.
//               </div>
//             </div>
//           </div>

//           {/* ACTION BUTTONS (Scrolls together inside the form) */}
//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr 1.3fr',
//               gap: '0.65rem',
//               marginTop: '0.5rem',
//               paddingTop: '0.5rem'
//             }}
//           >
//             <button
//               type="button"
//               onClick={onClose}
//               style={{
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 border: '1.5px solid #cbd5e1',
//                 background: '#ffffff',
//                 color: '#475569',
//                 fontWeight: '700',
//                 fontSize: '0.88rem',
//                 cursor: 'pointer'
//               }}
//             >
//               Keep Order
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               style={{
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 border: 'none',
//                 background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
//                 color: '#ffffff',
//                 fontWeight: '800',
//                 fontSize: '0.88rem',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
//               }}
//             >
//               {loading ? 'Processing...' : 'Request Cancellation'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OrderCancelModal;









import React, { useState } from 'react';
import { X, Ban, AlertCircle } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../api';

const CANCEL_REASONS = [
  'Changed my mind / Don\'t need it anymore',
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery time is too long',
  'Need to change shipping address / size',
  'Other reasons'
];

const OrderCancelModal = ({ isOpen, onClose, order, onCancelSuccess }) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('df_token');
      const res = await apiFetch(`/api/orders/${order._id || order.id}/cancel-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          reason,
          comments: comments.trim()
        })
      });

      const data = await parseResponseSafely(res);

      if (res.ok && data.success) {
        if (onCancelSuccess) {
          onCancelSuccess(data.order || { ...order, status: 'Cancellation Requested' });
        }
        onClose();
      } else {
        setError(data.message || 'Failed to submit cancellation request.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (e) => {
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      className="modal-overlay fixed inset-0 z-[99999] flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card w-full max-w-[450px] bg-white shadow-2xl overflow-hidden flex flex-col relative rounded-none sm:rounded-[20px]"
        style={{
          maxWidth: '450px',
          width: '100%',
          height: isMobile ? '100dvh' : 'auto',
          maxHeight: isMobile ? '100dvh' : '90vh',
          background: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. FIXED TOP HEADER WITH SAFE-ZONE CLEARANCE */}
        <div
          className="modal-header shrink-0 px-4 py-3 border-b border-rose-200 flex items-center justify-between gap-3 sticky top-0 z-20"
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
            padding: '0.85rem 1rem',
            paddingTop: isMobile ? 'calc(54px + env(safe-area-inset-top, 0px))' : '0.85rem',
            paddingBottom: '0.85rem',
            borderBottom: '1.5px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                flexShrink: 0
              }}
            >
              <Ban size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  fontSize: 'clamp(0.88rem, 3.8vw, 1rem)',
                  fontWeight: '800',
                  color: '#991b1b',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Request Order Cancellation
              </h3>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#b91c1c',
                  margin: '2px 0 0 0',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Order: <span style={{ color: '#dc2626', fontWeight: '800' }}>{order.orderId}</span> • ₹{order.totalAmount?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'white',
              border: '1px solid #fca5a5',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#991b1b',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <form
          onSubmit={handleCancelSubmit}
          className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
            padding: '1rem',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fca5a5',
                padding: '0.75rem',
                borderRadius: '10px',
                color: '#b91c1c',
                fontSize: '0.82rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Cancellation Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Cancellation Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={handleInputFocus}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.86rem',
                fontWeight: '600',
                color: '#1e293b',
                outline: 'none'
              }}
            >
              {CANCEL_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Comments */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Additional Comments <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="Any additional details..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              onFocus={handleInputFocus}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                color: '#1e293b',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Refund Notice Card */}
          <div
            style={{
              background: '#fdf4ff',
              border: '1.5px solid #f0abfc',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#c026d3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900', marginTop: '2px', flexShrink: 0 }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#86198f' }}>
                Refund to Original Payment Source
              </div>
              <div style={{ fontSize: '0.75rem', color: '#701a75', marginTop: '2px', lineHeight: '1.35' }}>
                The full refund amount (₹{order.totalAmount?.toLocaleString('en-IN')}) will be processed directly to your UPI/Bank account within 24-48 hours once approved.
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.3fr',
              gap: '0.65rem',
              marginTop: '0.5rem',
              paddingTop: '0.5rem'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 211, 0.25)'
              }}
            >
              {loading ? 'Processing...' : 'Request Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderCancelModal;