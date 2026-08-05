import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Ban } from 'lucide-react';

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
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !order) return null;

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${order._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: `${selectedReason}${customNotes ? ` (${customNotes})` : ''}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order');

      setConfirmed(true);
      setTimeout(() => {
        if (onCancelSuccess) onCancelSuccess();
        onClose();
        setConfirmed(false);
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 450 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '460px',
          width: '92%',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#be123c', margin: 0 }}>
                Cancel Order
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#e11d48', margin: 0 }}>Order ID: <strong>{order.orderId}</strong></p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none' }}>
            <X size={20} color="#be123c" />
          </button>
        </div>

        {/* Content */}
        {confirmed ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={54} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16a34a', marginBottom: '0.4rem' }}>
              Cancelled Confirmed
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
              Your order <strong>{order.orderId}</strong> has been cancelled successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmCancel} style={{ padding: '1.25rem' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.4' }}>
              Please tell us why you want to cancel this order. Pre-shipment cancellation is instantaneous.
            </p>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                Select Cancellation Reason *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: 'white' }}
              >
                {CANCELLATION_REASONS.map((reason, idx) => (
                  <option key={idx} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                Additional Comments (Optional)
              </label>
              <textarea
                placeholder="Any additional details or feedback..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
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
                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderCancelModal;
