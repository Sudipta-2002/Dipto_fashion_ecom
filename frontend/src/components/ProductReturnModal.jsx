import React, { useState } from 'react';
import { X, RotateCcw, Truck, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { API_URL } from '../api';

const RETURN_REASONS = [
  'Size or fitting issue',
  'Fabric or quality not as expected',
  'Received damaged / defective item',
  'Wrong color or design delivered',
  'Changed mind / No longer required'
];

const ProductReturnModal = ({ isOpen, onClose, order, onReturnSuccess }) => {
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedReturn, setConfirmedReturn] = useState(null);

  if (!isOpen || !order) return null;

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/${order._id || order.orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit return request');

      setConfirmedReturn(data);
      if (onReturnSuccess) onReturnSuccess(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 450 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '520px',
          width: 'min(94%, calc(100vw - 1rem))',
          borderRadius: '16px',
          maxHeight: '85dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ background: '#fdf4ff', borderBottom: '1px solid #f5d0fe', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c026d3', minWidth: 0 }}>
            <RotateCcw size={20} style={{ flexShrink: 0 }} />
            <h3 style={{ margin: 0, fontSize: 'clamp(0.98rem, 3.5vw, 1.15rem)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Request Product Return</h3>
          </div>
          <button className="close-btn" onClick={onClose} style={{ flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {confirmedReturn ? (
          /* RETURN CONFIRMED SCREEN DISPLAYING 3-DAY PICKUP GUARANTEE */
          <div className="modal-body" style={{ textAlign: 'center', padding: 'clamp(1.25rem, 4vw, 2rem) 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Return Requested Successfully!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Order ID: <strong style={{ color: '#c026d3' }}>{order.orderId}</strong>
            </p>

            {/* 3-DAY PICKUP NOTICE BANNER */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                <Truck size={20} style={{ flexShrink: 0 }} /> Return Pickup within 3 Days
              </div>
              <p style={{ fontSize: '0.82rem', color: '#16a34a', margin: 0, lineHeight: '1.45' }}>
                Our courier executive will visit your address for item pickup by <strong>{confirmedReturn.returnDetails?.pickupDate || '3 Business Days'}</strong>. Refund will be transferred directly to your bank account / UPI ID upon pickup inspection.
              </p>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              onClick={onClose}
            >
              Close & Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReturn} className="modal-body" style={{ padding: 'clamp(0.85rem, 4vw, 1.25rem)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontSize: '0.8rem', fontWeight: '600' }}>
              <ShieldCheck size={18} style={{ flexShrink: 0 }} /> 7-Day Hassle-Free Return Warranty Active
            </div>

            {/* Reason Selection */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Select Reason for Return *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
              >
                {RETURN_REASONS.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Refund Information Banner (Fixed Refund Notice) */}
            <div style={{ background: '#fdf4ff', border: '1.5px solid #c026d3', borderRadius: '10px', padding: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'default', margin: 0 }}>
                <input type="radio" checked disabled readOnly style={{ accentColor: '#c026d3', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#701a75', marginBottom: '0.2rem' }}>
                    Refund to Original Payment Source
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                    Refund amount will be refunded directly to the original payment source.
                  </p>
                </div>
              </label>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Additional Notes (Optional)</label>
              <input
                type="text"
                placeholder="Any special instruction for pickup executive..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', background: '#e11d48', borderColor: '#e11d48', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Submitting Return...' : 'Confirm Return Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductReturnModal;
