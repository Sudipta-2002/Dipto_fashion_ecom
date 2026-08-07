import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Ban, CreditCard, Smartphone, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from '../api';

const CANCELLATION_REASONS = [
  "Changed my mind / Don't need it anymore",
  'Ordered wrong size or color',
  'Found a better price elsewhere',
  'Delivery timeline is too long',
  'Payment or UTR reference issue',
  'Other / Personal reasons'
];

const OrderCancelModal = ({ isOpen, onClose, order, onCancelSuccess }) => {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Refund method state
  const isRazorpay = order?.paymentMethod === 'Razorpay' || !!(order?.razorpayPaymentId);
  const [refundMethod, setRefundMethod] = useState(isRazorpay ? 'source' : 'upi');

  // UPI / Bank detail state
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);

  if (!isOpen || !order) return null;

  const validateRefundDetails = () => {
    if (refundMethod === 'source') return true; // auto-refund to original source, no extra fields needed
    if (refundMethod === 'upi' && upiId.trim()) return true;
    if (refundMethod === 'bank' && accountNumber.trim() && ifscCode.trim() && accountHolder.trim()) return true;
    return false;
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateRefundDetails()) {
      if (refundMethod === 'upi') setError('Please enter a valid UPI ID for refund.');
      else if (refundMethod === 'bank') setError('Please fill in Account Holder Name, Account Number, and IFSC Code.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        reason: `${selectedReason}${customNotes ? ` — ${customNotes}` : ''}`,
        refundToSource: refundMethod === 'source',
        upiId: refundMethod === 'upi' ? upiId.trim() : '',
        accountHolder: refundMethod === 'bank' ? accountHolder.trim() : '',
        bankName: refundMethod === 'bank' ? bankName.trim() : '',
        accountNumber: refundMethod === 'bank' ? accountNumber.trim() : '',
        ifscCode: refundMethod === 'bank' ? ifscCode.trim() : ''
      };

      const res = await fetch(`${API_URL}/api/orders/${order._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit cancellation request');

      setSubmitted(true);
      // Notify parent of the updated order object so UI reflects immediately
      if (onCancelSuccess) onCancelSuccess(data.order || data);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refundMethodOptions = [
    ...(isRazorpay ? [{ id: 'source', icon: <CreditCard size={16} />, label: 'Auto-Refund to Original Payment Source', sub: 'Razorpay will refund to your original UPI / Card / Net-Banking' }] : []),
    { id: 'upi', icon: <Smartphone size={16} />, label: 'UPI ID', sub: 'Instant refund to any UPI ID (PhonePe, GPay, Paytm...)' },
    { id: 'bank', icon: <Building2 size={16} />, label: 'Bank Account Transfer (NEFT)', sub: 'Refund to your bank account via NEFT within 3–5 days' }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 450 }}>
      <div
        className="modal-card"
        style={{ maxWidth: '500px', width: '93%', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.22)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #fff1f2, #fdf4ff)', borderBottom: '1px solid #fecdd3', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#be123c', margin: 0 }}>Request Order Cancellation</h3>
              <p style={{ fontSize: '0.73rem', color: '#e11d48', margin: 0 }}>Order: <strong>{order.orderId}</strong> • ₹{order.totalAmount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none' }}>
            <X size={20} color="#be123c" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={38} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803d', marginBottom: '0.4rem' }}>
              Cancellation Request Submitted!
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
              Your cancellation for order <strong style={{ color: '#c026d3' }}>{order.orderId}</strong> is under review.
              Admin will approve and process your refund shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmCancel} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Reason */}
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                Cancellation Reason *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: 'white' }}
              >
                {CANCELLATION_REASONS.map((reason, idx) => (
                  <option key={idx} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                Additional Comments <span style={{ fontWeight: '400', color: '#94a3b8' }}>(Optional)</span>
              </label>
              <textarea
                placeholder="Any additional details..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Refund Method Selection */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                Select Refund Payout Method *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {refundMethodOptions.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setRefundMethod(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      border: `2px solid ${refundMethod === opt.id ? '#c026d3' : '#e2e8f0'}`,
                      background: refundMethod === opt.id ? '#fdf4ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: `2px solid ${refundMethod === opt.id ? '#c026d3' : '#94a3b8'}`,
                      background: refundMethod === opt.id ? '#c026d3' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.15s ease'
                    }}>
                      {refundMethod === opt.id && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div style={{ color: refundMethod === opt.id ? '#c026d3' : '#334155', flexShrink: 0 }}>{opt.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: refundMethod === opt.id ? '#7e22ce' : '#0f172a' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* UPI Details */}
            {refundMethod === 'upi' && (
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                  UPI ID for Refund *
                </label>
                <input
                  type="text"
                  placeholder="e.g. name@upi or 9876543210@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                  required={refundMethod === 'upi'}
                />
              </div>
            )}

            {/* Bank Account Details */}
            {refundMethod === 'bank' && (
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>Bank Account Details *</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: '700', color: '#475569' }}>Account Holder Name *</label>
                    <input
                      type="text"
                      placeholder="Full name as in bank"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', marginTop: '0.25rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: '700', color: '#475569' }}>Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SBI, HDFC"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', marginTop: '0.25rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: '700', color: '#475569' }}>Account Number *</label>
                    <input
                      type="text"
                      placeholder="Bank Account No."
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', marginTop: '0.25rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: '700', color: '#475569' }}>IFSC Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', marginTop: '0.25rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notice */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.77rem', color: '#92400e', lineHeight: '1.4' }}>
              ⚠️ Your cancellation request will be reviewed by our admin team. Once approved, the order will be cancelled and your refund will be initiated within 24–48 hours.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Keep Order
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', background: '#dc2626', borderColor: '#b91c1c' }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Request Cancellation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderCancelModal;
