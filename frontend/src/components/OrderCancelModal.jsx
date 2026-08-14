import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Ban, CreditCard } from 'lucide-react';
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

  if (!isOpen || !order) return null;

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        reason: `${selectedReason}${customNotes ? ` — ${customNotes}` : ''}`,
        refundToSource: true
      };

      const res = await fetch(`${API_URL}/api/orders/${order._id || order.orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit cancellation request');

      setSubmitted(true);
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

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '500px',
          width: 'min(93%, calc(100vw - 1.5rem))',
          borderRadius: '18px',
          overflow: 'visible',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          maxHeight: '80dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #fff1f2, #fdf4ff)', borderBottom: '1px solid #fecdd3', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ban size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#be123c', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Request Order Cancellation</h3>
              <p style={{ fontSize: '0.72rem', color: '#e11d48', margin: 0, wordBreak: 'break-all' }}>Order: <strong>{order.orderId}</strong> &nbsp;•&nbsp; ₹{order.totalAmount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', flexShrink: 0 }}>
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
              Refund amount will be refunded directly to the original payment source.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmCancel} style={{ padding: 'clamp(0.85rem, 4vw, 1.25rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
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
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '16px', outline: 'none', resize: 'vertical', maxHeight: '80px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Fixed Refund Source Pre-Selected Option */}
            <div style={{ background: '#fdf4ff', border: '1.5px solid #c026d3', borderRadius: '12px', padding: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'default' }}>
                <input type="radio" checked disabled readOnly style={{ accentColor: '#c026d3', marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#701a75', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CreditCard size={16} /> Refund to Original Payment Source
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0', lineHeight: '1.4' }}>
                    Refund amount will be refunded directly to the original payment source.
                  </p>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
                style={{ flex: '1 1 120px', justifyContent: 'center', minWidth: '100px' }}
              >
                Keep Order
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: '1 1 150px', justifyContent: 'center', background: '#dc2626', borderColor: '#b91c1c', minWidth: '130px' }}
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
