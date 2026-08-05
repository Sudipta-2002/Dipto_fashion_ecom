import React, { useEffect } from 'react';
import { Bell, ShoppingBag, X } from 'lucide-react';

const ToastNotification = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className="realtime-toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
        color: 'white',
        padding: '0.95rem 1.25rem',
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(112, 26, 117, 0.4), 0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        minWidth: '320px',
        maxWidth: '420px',
        border: '1.5px solid rgba(255,255,255,0.2)'
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)'
        }}
      >
        <ShoppingBag size={20} color="white" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#facc15', letterSpacing: '0.5px' }}>
          🔔 Real-Time Order Received!
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: '800', margin: '2px 0 1px 0' }}>
          Order ID: {toast.orderId}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
          Total: <strong>₹{toast.totalAmount?.toLocaleString('en-IN')}</strong> • {toast.customerName || 'Customer'}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastNotification;
