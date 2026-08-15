// import React, { useState } from 'react';
// import { X, RotateCcw, Truck, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
// import { API_URL } from '../api';

// const RETURN_REASONS = [
//   'Size or fitting issue',
//   'Fabric or quality not as expected',
//   'Received damaged / defective item',
//   'Wrong color or design delivered',
//   'Changed mind / No longer required'
// ];

// const ProductReturnModal = ({ isOpen, onClose, order, onReturnSuccess }) => {
//   const [reason, setReason] = useState(RETURN_REASONS[0]);
//   const [notes, setNotes] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [confirmedReturn, setConfirmedReturn] = useState(null);

//   if (!isOpen || !order) return null;

//   const handleSubmitReturn = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await fetch(`${API_URL}/api/orders/${order._id || order.orderId}/return`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           reason,
//           notes
//         })
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed to submit return request');

//       setConfirmedReturn(data);
//       if (onReturnSuccess) onReturnSuccess(data);
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay" style={{ zIndex: 450 }}>
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '520px',
//           width: 'min(94%, calc(100vw - 1rem))',
//           borderRadius: '16px',
//           maxHeight: '85dvh',
//           overflowY: 'auto',
//           WebkitOverflowScrolling: 'touch',
//           display: 'flex',
//           flexDirection: 'column'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="modal-header" style={{ background: '#fdf4ff', borderBottom: '1px solid #f5d0fe', position: 'sticky', top: 0, zIndex: 10 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c026d3', minWidth: 0 }}>
//             <RotateCcw size={20} style={{ flexShrink: 0 }} />
//             <h3 style={{ margin: 0, fontSize: 'clamp(0.98rem, 3.5vw, 1.15rem)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Request Product Return</h3>
//           </div>
//           <button className="close-btn" onClick={onClose} style={{ flexShrink: 0 }}>
//             <X size={20} />
//           </button>
//         </div>

//         {confirmedReturn ? (
//           /* RETURN CONFIRMED SCREEN DISPLAYING 3-DAY PICKUP GUARANTEE */
//           <div className="modal-body" style={{ textAlign: 'center', padding: 'clamp(1.25rem, 4vw, 2rem) 1.25rem' }}>
//             <div style={{ width: '56px', height: '56px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
//               <CheckCircle2 size={34} />
//             </div>

//             <h3 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//               Return Requested Successfully!
//             </h3>
//             <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
//               Order ID: <strong style={{ color: '#c026d3' }}>{order.orderId}</strong>
//             </p>

//             {/* 3-DAY PICKUP NOTICE BANNER */}
//             <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem', textAlign: 'left' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
//                 <Truck size={20} style={{ flexShrink: 0 }} /> Return Pickup within 3 Days
//               </div>
//               <p style={{ fontSize: '0.82rem', color: '#16a34a', margin: 0, lineHeight: '1.45' }}>
//                 Our courier executive will visit your address for item pickup by <strong>{confirmedReturn.returnDetails?.pickupDate || '3 Business Days'}</strong>. Refund will be transferred directly to your bank account / UPI ID upon pickup inspection.
//               </p>
//             </div>

//             <button
//               className="btn-primary"
//               style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
//               onClick={onClose}
//             >
//               Close & Done
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmitReturn} className="modal-body" style={{ padding: 'clamp(0.85rem, 4vw, 1.25rem)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
//             <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontSize: '0.8rem', fontWeight: '600' }}>
//               <ShieldCheck size={18} style={{ flexShrink: 0 }} /> 7-Day Hassle-Free Return Warranty Active
//             </div>

//             {/* Reason Selection */}
//             <div className="form-group" style={{ margin: 0 }}>
//               <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Select Reason for Return *</label>
//               <select
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
//               >
//                 {RETURN_REASONS.map((r, idx) => (
//                   <option key={idx} value={r}>{r}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Refund Information Banner (Fixed Refund Notice) */}
//             <div style={{ background: '#fdf4ff', border: '1.5px solid #c026d3', borderRadius: '10px', padding: '0.85rem' }}>
//               <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'default', margin: 0 }}>
//                 <input type="radio" checked disabled readOnly style={{ accentColor: '#c026d3', marginTop: '3px', flexShrink: 0 }} />
//                 <div>
//                   <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#701a75', marginBottom: '0.2rem' }}>
//                     Refund to Original Payment Source
//                   </div>
//                   <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
//                     Refund amount will be refunded directly to the original payment source.
//                   </p>
//                 </div>
//               </label>
//             </div>

//             <div className="form-group" style={{ margin: 0 }}>
//               <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Additional Notes (Optional)</label>
//               <input
//                 type="text"
//                 placeholder="Any special instruction for pickup executive..."
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
//               />
//             </div>

//             <button
//               type="submit"
//               className="btn-primary"
//               style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', background: '#e11d48', borderColor: '#e11d48', marginTop: '0.25rem' }}
//               disabled={loading}
//             >
//               {loading ? 'Submitting Return...' : 'Confirm Return Request'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductReturnModal;









// import React, { useState } from 'react';
// import { X, RotateCcw, AlertCircle, Building2, Smartphone } from 'lucide-react';
// import { API_URL, apiFetch, parseResponseSafely } from '../api';

// const RETURN_REASONS = [
//   'Size / Fit issue',
//   'Defective / Damaged product received',
//   'Item not as described or shown in image',
//   'Received wrong item or color',
//   'Quality not satisfactory',
//   'Other reason'
// ];

// const ProductReturnModal = ({ isOpen, onClose, order, onReturnSuccess }) => {
//   const [reason, setReason] = useState(RETURN_REASONS[0]);
//   const [comments, setComments] = useState('');
//   const [refundMethod, setRefundMethod] = useState('upi'); // 'upi' or 'bank'
//   const [upiId, setUpiId] = useState('');
//   const [bankDetails, setBankDetails] = useState({
//     accountNumber: '',
//     ifscCode: '',
//     accountHolderName: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   if (!isOpen || !order) return null;

//   const handleReturnSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (refundMethod === 'upi' && !upiId.trim()) {
//       setError('Please enter your valid UPI ID (e.g. name@okhdfcbank)');
//       return;
//     }

//     if (refundMethod === 'bank' && (!bankDetails.accountNumber.trim() || !bankDetails.ifscCode.trim() || !bankDetails.accountHolderName.trim())) {
//       setError('Please fill in all bank details');
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem('df_token');
//       const res = await apiFetch(`/api/orders/${order._id || order.id}/return-request`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({
//           reason,
//           comments: comments.trim(),
//           refundMethod,
//           refundDetails: refundMethod === 'upi' ? { upiId: upiId.trim() } : bankDetails
//         })
//       });

//       const data = await parseResponseSafely(res);

//       if (res.ok && data.success) {
//         if (onReturnSuccess) {
//           onReturnSuccess(data.order || { ...order, status: 'Return Requested' });
//         }
//         onClose();
//       } else {
//         setError(data.message || 'Failed to submit return request.');
//       }
//     } catch (err) {
//       setError('Network connection error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="modal-overlay"
//       style={{
//         zIndex: 9999,
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: 'rgba(15, 23, 42, 0.75)',
//         backdropFilter: 'blur(5px)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '12px',
//         paddingTop: 'calc(12px + env(safe-area-inset-top))',
//         paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
//         boxSizing: 'border-box'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '460px',
//           width: '100%',
//           maxHeight: '90dvh',
//           background: '#ffffff',
//           borderRadius: '18px',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
//           position: 'relative',
//           animation: 'fadeInUp 0.25s ease-out'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           style={{
//             background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
//             padding: '1rem 1.15rem',
//             borderBottom: '1.5px solid #fed7aa',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             flexShrink: 0
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//             <div
//               style={{
//                 width: '38px',
//                 height: '38px',
//                 borderRadius: '10px',
//                 background: '#fed7aa',
//                 border: '1px solid #fdba74',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#ea580c',
//                 flexShrink: 0
//               }}
//             >
//               <RotateCcw size={20} />
//             </div>
//             <div>
//               <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#9a3412', margin: 0 }}>
//                 Request Product Return
//               </h3>
//               <p style={{ fontSize: '0.75rem', color: '#c2410c', margin: '2px 0 0 0', fontWeight: '600' }}>
//                 Order: <span style={{ color: '#ea580c', fontWeight: '800' }}>{order.orderId}</span> • 7-Day Window Active
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             style={{
//               background: 'white',
//               border: '1px solid #fdba74',
//               borderRadius: '50%',
//               width: '32px',
//               height: '32px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#9a3412',
//               cursor: 'pointer',
//               boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
//             }}
//           >
//             <X size={17} />
//           </button>
//         </div>

//         {/* Scrollable Form Body */}
//         <form
//           onSubmit={handleReturnSubmit}
//           style={{
//             padding: '1.15rem',
//             overflowY: 'auto',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '1rem',
//             flex: 1
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
//               <AlertCircle size={16} /> {error}
//             </div>
//           )}

//           {/* Return Reason */}
//           <div>
//             <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//               Reason for Return *
//             </label>
//             <select
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
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
//               {RETURN_REASONS.map((r, idx) => (
//                 <option key={idx} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Additional Comments */}
//           <div>
//             <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//               Comments / Product Issue <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
//             </label>
//             <textarea
//               rows="2"
//               placeholder="Describe the issue with the item..."
//               value={comments}
//               onChange={(e) => setComments(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '0.65rem',
//                 borderRadius: '10px',
//                 border: '1.5px solid #cbd5e1',
//                 background: '#ffffff',
//                 fontSize: '0.85rem',
//                 color: '#1e293b',
//                 boxSizing: 'border-box',
//                 outline: 'none'
//               }}
//             />
//           </div>

//           {/* Refund Method Switcher */}
//           <div>
//             <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//               Receive Refund via:
//             </label>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
//               <button
//                 type="button"
//                 onClick={() => setRefundMethod('upi')}
//                 style={{
//                   padding: '0.65rem',
//                   borderRadius: '10px',
//                   border: refundMethod === 'upi' ? '2px solid #c026d3' : '1.5px solid #cbd5e1',
//                   background: refundMethod === 'upi' ? '#fdf4ff' : '#ffffff',
//                   color: refundMethod === 'upi' ? '#86198f' : '#475569',
//                   fontWeight: '800',
//                   fontSize: '0.85rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '6px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 <Smartphone size={16} /> UPI ID
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setRefundMethod('bank')}
//                 style={{
//                   padding: '0.65rem',
//                   borderRadius: '10px',
//                   border: refundMethod === 'bank' ? '2px solid #c026d3' : '1.5px solid #cbd5e1',
//                   background: refundMethod === 'bank' ? '#fdf4ff' : '#ffffff',
//                   color: refundMethod === 'bank' ? '#86198f' : '#475569',
//                   fontWeight: '800',
//                   fontSize: '0.85rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '6px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 <Building2 size={16} /> Bank Account
//               </button>
//             </div>
//           </div>

//           {/* UPI or Bank Input Details */}
//           {refundMethod === 'upi' ? (
//             <div>
//               <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
//                 Your UPI ID (Google Pay / PhonePe / Paytm) *
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g. yourname@oksbi"
//                 value={upiId}
//                 onChange={(e) => setUpiId(e.target.value)}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '0.65rem',
//                   borderRadius: '8px',
//                   border: '1.5px solid #cbd5e1',
//                   fontSize: '0.88rem',
//                   boxSizing: 'border-box',
//                   outline: 'none'
//                 }}
//               />
//             </div>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//               <div>
//                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>
//                   Account Holder Name *
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Full Name as in Bank"
//                   value={bankDetails.accountHolderName}
//                   onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
//                   required
//                   style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
//                 />
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
//                 <div>
//                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>
//                     Account Number *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Bank Account No."
//                     value={bankDetails.accountNumber}
//                     onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
//                     required
//                     style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>
//                     IFSC Code *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="e.g. SBIN0001234"
//                     value={bankDetails.ifscCode}
//                     onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
//                     required
//                     style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Pickup Timeline Note */}
//           <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b' }}>
//             🚚 Our courier partner will pick up the item from your delivery address within <strong>3 business days</strong>.
//           </div>

//           {/* Buttons */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
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
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               style={{
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 border: 'none',
//                 background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
//                 color: '#ffffff',
//                 fontWeight: '800',
//                 fontSize: '0.88rem',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
//               }}
//             >
//               {loading ? 'Submitting...' : 'Confirm Return'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProductReturnModal;







import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../api';

const RETURN_REASONS = [
  'Size / Fit issue',
  'Defective / Damaged product received',
  'Item not as described or shown in image',
  'Received wrong item or color',
  'Quality not satisfactory',
  'Other reason'
];

const ProductReturnModal = ({ isOpen, onClose, order, onReturnSuccess }) => {
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('df_token');
      const res = await apiFetch(`/api/orders/${order._id || order.id}/return-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          reason,
          comments: comments.trim(),
          refundMethod: 'original_payment_account',
          refundDetails: {
            method: 'Original Payment Source',
            utrNumber: order.utrNumber || 'N/A'
          }
        })
      });

      const data = await parseResponseSafely(res);

      if (res.ok && data.success) {
        if (onReturnSuccess) {
          onReturnSuccess(data.order || { ...order, status: 'Return Requested' });
        }
        onClose();
      } else {
        setError(data.message || 'Failed to submit return request.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          maxHeight: '90dvh',
          background: '#ffffff',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          animation: 'fadeInUp 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            padding: '1rem 1.15rem',
            borderBottom: '1.5px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#fed7aa',
                border: '1px solid #fdba74',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                flexShrink: 0
              }}
            >
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#9a3412', margin: 0 }}>
                Request Product Return
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#c2410c', margin: '2px 0 0 0', fontWeight: '600' }}>
                Order: <span style={{ color: '#ea580c', fontWeight: '800' }}>{order.orderId}</span> • 7-Day Window Active
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'white',
              border: '1px solid #fdba74',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9a3412',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleReturnSubmit}
          style={{
            padding: '1.15rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flex: 1
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
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Return Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Reason for Return *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
              {RETURN_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Comments */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Comments / Product Issue <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="Describe the issue with the item..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.85rem',
                color: '#1e293b',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Refund Destination (Fixed & Pre-selected Radio) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Refund Destination:
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #fdba74',
                background: '#fffaf5'
              }}
            >
              <input
                type="radio"
                name="refundMethod"
                id="original_account"
                checked={true}
                readOnly
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#ea580c',
                  cursor: 'default',
                  flexShrink: 0
                }}
              />
              <label
                htmlFor="original_account"
                style={{
                  fontSize: '0.86rem',
                  fontWeight: '700',
                  color: '#9a3412',
                  margin: 0,
                  cursor: 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Money will be refunded to original payment account <CheckCircle2 size={16} color="#ea580c" />
              </label>
            </div>
          </div>

          {/* Pickup Timeline Note */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            🚚 Our courier partner will pick up the item from your delivery address within <strong>3 business days</strong>.
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              {loading ? 'Submitting...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductReturnModal;