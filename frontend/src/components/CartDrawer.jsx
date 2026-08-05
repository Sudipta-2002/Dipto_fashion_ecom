import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';
import TermsPrivacyModal from './TermsPrivacyModal';
import CheckoutProgressTracker from './CheckoutProgressTracker';

const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  user,
  onOpenAuth
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('privacy');
  const [termsError, setTermsError] = useState('');

  if (!isOpen) return null;

  const totalMRP = cartItems.reduce((acc, item) => acc + (item.mrp || item.price) * item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalDiscount = totalMRP - totalAmount;
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate dynamic delivery date (Today + 7 Days)
  const getEstimatedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return deliveryDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCheckoutClick = () => {
    if (!user) {
      alert('Sign-in is mandatory to place an order. Please log in or create an account.');
      onOpenAuth();
      return;
    }
    if (!agreedToTerms) {
      setTermsError('Please agree to Dipto Fashion Terms & Conditions and Privacy Policy to proceed.');
      return;
    }
    setTermsError('');
    onProceedToCheckout();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{ width: '100%', maxWidth: '400px', height: '100vh', borderRadius: '0', position: 'fixed', right: '0', top: '0', bottom: '0', padding: 0, display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Royal Gradient Header with Brand Logo & Cart Badge */}
        <div
          style={{
            padding: '0.95rem 1.15rem',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {/* BRAND LOGO & NAME */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/logo.jpg"
              alt="Dipto Fashion Logo"
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.4)' }}
            />
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'white', letterSpacing: '-0.2px', display: 'block' }}>
                Shopping Cart
              </span>
              <span style={{ fontSize: '0.72rem', color: '#f5d0fe', opacity: 0.9 }}>
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your bag
              </span>
            </div>
          </div>

          {/* CART BADGE & CLOSE BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={22} color="white" />
              {totalItemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-9px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)'
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </div>

            <button
              className="close-btn"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Requirement 2 & 3: 3-STEP PROGRESS TRACKER SYSTEM AT THE TOP OF THE PAGE */}
        <CheckoutProgressTracker currentStep="cart" />

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '1.15rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem' }}>Browse Sarees and Punjabi suits to add products!</p>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: '#fafafa'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.25rem' }}>{item.name}</h4>
                      {item.selectedSize && (
                        <div style={{ fontSize: '0.75rem', color: '#c026d3', fontWeight: '800', marginBottom: '0.25rem', display: 'inline-block', background: '#fdf4ff', padding: '1px 7px', borderRadius: '4px', border: '1px solid #f5d0fe' }}>
                          Size: {item.selectedSize}
                        </div>
                      )}
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                        ₹{item.price.toLocaleString('en-IN')}
                        {item.mrp > item.price && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                            ₹{item.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 6px', background: 'white' }}>
                          <button onClick={() => onUpdateQuantity(item._id, item.quantity - 1)} style={{ background: 'none' }}><Minus size={14} /></button>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item._id, item.quantity + 1)} style={{ background: 'none' }}><Plus size={14} /></button>
                        </div>
                        <button onClick={() => onRemoveItem(item._id)} style={{ color: '#ef4444', background: 'none' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                {/* Dynamic 7-Day Estimated Delivery Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', color: '#15803d', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Truck size={20} color="#16a34a" />
                  <span>Estimated Delivery by <strong>{getEstimatedDeliveryDate()}</strong></span>
                </div>

                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem' }}>Price Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span>Total MRP</span>
                  <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#16a34a' }}>
                    <span>Discount Savings</span>
                    <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span>Delivery Charges</span>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: '800', fontSize: '1.1rem' }}>
                  <span>Total Payable</span>
                  <span style={{ color: '#c026d3' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Terms & Conditions & Privacy Policy Checkbox (Myntra / Flipkart Style) */}
                <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked) setTermsError('');
                      }}
                      style={{ marginTop: '2px', accentColor: '#c026d3', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>
                      By placing an order, I agree to <strong>Dipto Fashion's</strong>{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPolicyTab('terms');
                          setIsPolicyOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', color: '#c026d3', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                      >
                        Terms & Conditions
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPolicyTab('privacy');
                          setIsPolicyOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', color: '#c026d3', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                      >
                        Privacy Policy
                      </button>.
                    </span>
                  </label>
                  {termsError && (
                    <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: '600' }}>
                      {termsError}
                    </p>
                  )}
                </div>

                <button
                  className="btn-primary blink-green"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.85rem', padding: '0.85rem' }}
                  onClick={handleCheckoutClick}
                >
                  <span>Place Order</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms & Privacy Policy Modal */}
      <TermsPrivacyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        initialTab={policyTab}
      />
    </div>
  );
};

export default CartDrawer;
