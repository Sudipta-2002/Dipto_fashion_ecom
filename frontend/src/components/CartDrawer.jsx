import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingCart, Tag, Gift, Check, ChevronRight, Info, AlertCircle } from 'lucide-react';
import TermsPrivacyModal from './TermsPrivacyModal';
import CheckoutProgressTracker from './CheckoutProgressTracker';
import { API_URL, apiFetch, parseResponseSafely } from '../api';

const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  user,
  onOpenAuth,
  appliedCoupon,
  setAppliedCoupon
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('privacy');
  const [termsError, setTermsError] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Available coupons modal & data
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loadingActiveCoupons, setLoadingActiveCoupons] = useState(false);
  const [expandedTermsCode, setExpandedTermsCode] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchActiveCoupons();
    }
  }, [isOpen]);

  useEffect(() => {
    if (appliedCoupon?.code) {
      setCouponInput(appliedCoupon.code);
    }
  }, [appliedCoupon]);

  const fetchActiveCoupons = async () => {
    try {
      setLoadingActiveCoupons(true);
      const res = await apiFetch('/api/coupons/active');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data)) {
        setActiveCoupons(data);
      }
    } catch (e) {
      console.warn('Error fetching active coupons:', e);
    } finally {
      setLoadingActiveCoupons(false);
    }
  };

  if (!isOpen) return null;

  const totalMRP = cartItems.reduce((acc, item) => acc + (item.mrp || item.price) * item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalDiscount = totalMRP - totalAmount;
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayable = Math.max(0, totalAmount - couponDiscountAmount);

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

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply !== undefined ? codeToApply : couponInput).trim();
    setCouponError('');
    setCouponSuccessMsg('');

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!user) {
      alert('Sign-in is mandatory to apply coupon codes and receive discounts.');
      onOpenAuth();
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const res = await apiFetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartAmount: totalAmount })
      });
      const data = await parseResponseSafely(res);

      if (res.ok && data.valid) {
        const newCoupon = {
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue
        };
        if (setAppliedCoupon) setAppliedCoupon(newCoupon);
        setCouponInput(data.code);
        setCouponSuccessMsg(data.message || `🎉 Coupon '${data.code}' applied! You saved ₹${data.discountAmount}`);
        setCouponError('');
        setShowCouponsModal(false);
      } else {
        setCouponError(data.message || `Coupon code '${code}' does not match or is invalid`);
        if (setAppliedCoupon) setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon code. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (setAppliedCoupon) setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccessMsg('');
    setCouponError('');
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
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          minHeight: '100dvh',
          maxHeight: '100dvh',
          borderRadius: '0',
          position: 'fixed',
          right: '0',
          top: '0',
          bottom: '0',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED TOP NAVBAR */}
        <div className="modal-top-navbar" style={{ flexShrink: 0, zIndex: 10 }}>
          {/* Royal Gradient Header with Brand Logo & Cart Badge */}
          <div
            style={{
              padding: '0.95rem 1.15rem',
              paddingTop: 'max(0.95rem, calc(0.5rem + env(safe-area-inset-top, 12px)))',
              paddingLeft: 'max(1.15rem, env(safe-area-inset-left, 12px))',
              paddingRight: 'max(1.15rem, env(safe-area-inset-right, 12px))',
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

          {/* 3-STEP PROGRESS TRACKER SYSTEM AT THE TOP */}
          <CheckoutProgressTracker currentStep="cart" />
        </div>

        {/* SCROLLABLE BODY */}
        <div
          className="modal-body"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            padding: '1rem',
            paddingLeft: 'max(1rem, env(safe-area-inset-left, 12px))',
            paddingRight: 'max(1rem, env(safe-area-inset-right, 12px))',
            paddingBottom: 'max(140px, calc(100px + env(safe-area-inset-bottom, 24px)))',
            minHeight: 0
          }}
        >
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

              {/* REDBUS INSPIRED COUPON CODE SECTION */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ background: '#fdf4ff', border: '1px dashed #c026d3', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#701a75', fontWeight: '800', fontSize: '0.9rem' }}>
                      <Tag size={18} color="#c026d3" />
                      <span>Apply Coupon Code</span>
                    </div>
                    {activeCoupons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowCouponsModal(true)}
                        style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                      >
                        View Offers ({activeCoupons.length}) <ChevronRight size={14} />
                      </button>
                    )}
                  </div>

                  {/* APPLIED COUPON BANNER OR INPUT FIELD */}
                  {appliedCoupon ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Gift size={18} color="#16a34a" />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#15803d', display: 'block' }}>
                            '{appliedCoupon.code}' Applied!
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
                            You saved ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} on this order
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Enter Coupon Code (e.g. WELCOME100)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '0.55rem 0.75rem',
                            border: couponError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            fontSize: '16px',
                            letterSpacing: '0.5px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          disabled={isApplyingCoupon || !couponInput.trim()}
                          className="btn-primary blink-green"
                          style={{
                            padding: '0.55rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)',
                            opacity: (!couponInput.trim() || isApplyingCoupon) ? 0.6 : 1
                          }}
                        >
                          {isApplyingCoupon ? 'Checking...' : 'Apply'}
                        </button>
                      </div>

                      {/* VALIDATION ERROR MESSAGE */}
                      {couponError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: '600' }}>
                          <AlertCircle size={14} />
                          <span>{couponError}</span>
                        </div>
                      )}

                      {/* QUICK OFFER TEASER */}
                      {activeCoupons.length > 0 && !couponInput && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                          💡 Tip: Try code <strong style={{ color: '#c026d3', cursor: 'pointer' }} onClick={() => handleApplyCoupon(activeCoupons[0].code)}>{activeCoupons[0].code}</strong> to save on this purchase!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dynamic 7-Day Estimated Delivery Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', color: '#15803d', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Truck size={20} color="#16a34a" />
                  <span>Estimated Delivery by <strong>{getEstimatedDeliveryDate()}</strong></span>
                </div>

                {/* Price Breakdown */}
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem' }}>Price Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span>Total MRP</span>
                  <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#16a34a' }}>
                    <span>Store Discount</span>
                    <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#15803d', fontWeight: '700' }}>
                    <span>Coupon Savings ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span>Delivery Charges</span>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: '800', fontSize: '1.1rem' }}>
                  <span>Total Payable</span>
                  <span style={{ color: '#c026d3' }}>₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* IN-FLOW SCROLLABLE ACTION BUTTON FOR PLACE ORDER */}
              <div
                className="modal-bottom-navbar"
                style={{
                  padding: '1rem 0 0.5rem 0',
                  background: '#ffffff',
                  borderTop: '1.5px solid #e2e8f0',
                  marginTop: '1.25rem'
                }}
              >
                {/* Terms & Conditions & Privacy Policy Checkbox */}
                <div style={{ marginBottom: '0.75rem', padding: '0.65rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
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
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
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

      {/* REDBUS INSPIRED AVAILABLE COUPONS MODAL / DRAWER */}
      {showCouponsModal && (
        <div className="modal-overlay" onClick={() => setShowCouponsModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '420px', width: '92%', borderRadius: '16px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '1rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} color="#f5d0fe" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Available Offers & Coupons
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponsModal(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: RedBus Style Coupon Cards */}
            <div className="modal-body" style={{ padding: '1.15rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {loadingActiveCoupons ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading available coupons...</div>
              ) : activeCoupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No coupons currently active.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #f5d0fe',
                        borderRadius: '12px',
                        padding: '1rem',
                        boxShadow: '0 4px 12px rgba(112, 26, 117, 0.05)',
                        position: 'relative'
                      }}
                    >
                      {/* Top Row: Code Tag & Apply Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fdf4ff', border: '1.5px dashed #c026d3', padding: '4px 10px', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#c026d3', letterSpacing: '0.5px' }}>{coupon.code}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCouponInput(coupon.code);
                            handleApplyCoupon(coupon.code);
                          }}
                          className="btn-primary blink-green"
                          style={{
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                          }}
                        >
                          APPLY
                        </button>
                      </div>

                      {/* Discount Details */}
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                        {coupon.discountType === 'percentage'
                          ? `Get ${coupon.discountAmount}% OFF ${coupon.maxDiscountAmount ? `up to ₹${coupon.maxDiscountAmount}` : ''}`
                          : `Get Flat ₹${coupon.discountAmount.toLocaleString('en-IN')} OFF`}
                      </h4>

                      <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                        {coupon.minOrderAmount > 0 ? `Applicable on orders above ₹${coupon.minOrderAmount.toLocaleString('en-IN')}` : 'No minimum order threshold'}
                      </p>

                      {/* Expandable Terms & Conditions Accordion */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setExpandedTermsCode(expandedTermsCode === coupon.code ? null : coupon.code)}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                        >
                          <Info size={12} />
                          <span>{expandedTermsCode === coupon.code ? 'Hide Terms & Conditions' : 'Terms & Conditions'}</span>
                        </button>

                        {expandedTermsCode === coupon.code && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: '6px', lineHeight: '1.4' }}>
                            {coupon.description || 'Valid for all registered store customers. Applies directly to total bill.'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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









// import React, { useState, useEffect } from 'react';
// import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingCart, Tag, Gift, Check, ChevronRight, Info, AlertCircle } from 'lucide-react';
// import TermsPrivacyModal from './TermsPrivacyModal';
// import CheckoutProgressTracker from './CheckoutProgressTracker';
// import { API_URL, apiFetch, parseResponseSafely } from '../api';

// const CartDrawer = ({
//   isOpen,
//   onClose,
//   cartItems,
//   onUpdateQuantity,
//   onRemoveItem,
//   onProceedToCheckout,
//   user,
//   onOpenAuth,
//   appliedCoupon,
//   setAppliedCoupon
// }) => {
//   const [agreedToTerms, setAgreedToTerms] = useState(true);
//   const [isPolicyOpen, setIsPolicyOpen] = useState(false);
//   const [policyTab, setPolicyTab] = useState('privacy');
//   const [termsError, setTermsError] = useState('');

//   // Coupon state
//   const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
//   const [couponError, setCouponError] = useState('');
//   const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
//   const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

//   // Available coupons modal & data
//   const [showCouponsModal, setShowCouponsModal] = useState(false);
//   const [activeCoupons, setActiveCoupons] = useState([]);
//   const [loadingActiveCoupons, setLoadingActiveCoupons] = useState(false);
//   const [expandedTermsCode, setExpandedTermsCode] = useState(null);

//   // Keyboard Detection State
//   const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       fetchActiveCoupons();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (appliedCoupon?.code) {
//       setCouponInput(appliedCoupon.code);
//     }
//   }, [appliedCoupon]);

//   // Mobile Keyboard Detection
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.visualViewport) {
//         // স্ক্রিন উচ্চতা উল্লেখযোগ্যভাবে কমে গেলে কীবোর্ড ওপেন ধরা হবে
//         const keyboardActive = window.visualViewport.height < window.innerHeight * 0.78;
//         setIsKeyboardOpen(keyboardActive);
//       }
//     };

//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', handleResize);
//     }

//     return () => {
//       if (window.visualViewport) {
//         window.visualViewport.removeEventListener('resize', handleResize);
//       }
//     };
//   }, []);

//   const fetchActiveCoupons = async () => {
//     try {
//       setLoadingActiveCoupons(true);
//       const res = await apiFetch('/api/coupons/active');
//       const data = await parseResponseSafely(res);
//       if (res.ok && Array.isArray(data)) {
//         setActiveCoupons(data);
//       }
//     } catch (e) {
//       console.warn('Error fetching active coupons:', e);
//     } finally {
//       setLoadingActiveCoupons(false);
//     }
//   };

//   if (!isOpen) return null;

//   const totalMRP = cartItems.reduce((acc, item) => acc + (item.mrp || item.price) * item.quantity, 0);
//   const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
//   const totalDiscount = totalMRP - totalAmount;
//   const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

//   const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
//   const finalPayable = Math.max(0, totalAmount - couponDiscountAmount);

//   const getEstimatedDeliveryDate = () => {
//     const deliveryDate = new Date();
//     deliveryDate.setDate(deliveryDate.getDate() + 7);
//     return deliveryDate.toLocaleDateString('en-GB', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric'
//     });
//   };

//   const handleApplyCoupon = async (codeToApply) => {
//     const code = (codeToApply !== undefined ? codeToApply : couponInput).trim();
//     setCouponError('');
//     setCouponSuccessMsg('');

//     if (!code) {
//       setCouponError('Please enter a coupon code');
//       return;
//     }

//     if (!user) {
//       alert('Sign-in is mandatory to apply coupon codes and receive discounts.');
//       onOpenAuth();
//       return;
//     }

//     try {
//       setIsApplyingCoupon(true);
//       const res = await apiFetch('/api/coupons/apply', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ code, cartAmount: totalAmount })
//       });
//       const data = await parseResponseSafely(res);

//       if (res.ok && data.valid) {
//         const newCoupon = {
//           code: data.code,
//           discountAmount: data.discountAmount,
//           discountType: data.discountType,
//           discountValue: data.discountValue
//         };
//         if (setAppliedCoupon) setAppliedCoupon(newCoupon);
//         setCouponInput(data.code);
//         setCouponSuccessMsg(data.message || `🎉 Coupon '${data.code}' applied! You saved ₹${data.discountAmount}`);
//         setCouponError('');
//         setShowCouponsModal(false);
//       } else {
//         setCouponError(data.message || `Coupon code '${code}' does not match or is invalid`);
//         if (setAppliedCoupon) setAppliedCoupon(null);
//       }
//     } catch (err) {
//       setCouponError('Failed to validate coupon code. Please try again.');
//     } finally {
//       setIsApplyingCoupon(false);
//     }
//   };

//   const handleRemoveCoupon = () => {
//     if (setAppliedCoupon) setAppliedCoupon(null);
//     setCouponInput('');
//     setCouponSuccessMsg('');
//     setCouponError('');
//   };

//   const handleCheckoutClick = () => {
//     if (!user) {
//       alert('Sign-in is mandatory to place an order. Please log in or create an account.');
//       onOpenAuth();
//       return;
//     }
//     if (!agreedToTerms) {
//       setTermsError('Please agree to Dipto Fashion Terms & Conditions and Privacy Policy to proceed.');
//       return;
//     }
//     setTermsError('');
//     onProceedToCheckout();
//   };

//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

//   return (
//     <div
//       className="modal-overlay"
//       style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         zIndex: 40,
//         backgroundColor: 'rgba(15, 23, 42, 0.65)',
//         backdropFilter: 'blur(3px)',
//         display: 'flex',
//         justifyContent: 'flex-end',
//         overflow: 'hidden'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card"
//         style={{
//           width: '100%',
//           maxWidth: '440px',
//           height: isMobile
//             ? (isKeyboardOpen ? '100dvh' : 'calc(100dvh - 65px - env(safe-area-inset-bottom, 0px))')
//             : '100dvh',
//           borderRadius: '0',
//           position: 'fixed',
//           right: 0,
//           top: 0,
//           padding: 0,
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: 'hidden',
//           background: '#ffffff',
//           boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.2)'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* FIXED TOP NAVBAR */}
//         <div className="modal-top-navbar" style={{ flexShrink: 0, zIndex: 10 }}>
//           <div
//             style={{
//               padding: '0.85rem 1.15rem',
//               paddingTop: isMobile ? 'calc(10px + env(safe-area-inset-top, 0px))' : '0.85rem',
//               background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
//               color: 'white',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               gap: '0.5rem',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//             }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//               <img
//                 src="/logo.jpg"
//                 alt="Dipto Fashion Logo"
//                 onError={(e) => { e.target.style.display = 'none'; }}
//                 style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.4)' }}
//               />
//               <div>
//                 <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'white', letterSpacing: '-0.2px', display: 'block' }}>
//                   Shopping Cart
//                 </span>
//                 <span style={{ fontSize: '0.72rem', color: '#f5d0fe', opacity: 0.9 }}>
//                   {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your bag
//                 </span>
//               </div>
//             </div>

//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//               <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
//                 <ShoppingCart size={22} color="white" />
//                 {totalItemsCount > 0 && (
//                   <span
//                     style={{
//                       position: 'absolute',
//                       top: '-7px',
//                       right: '-9px',
//                       background: '#ef4444',
//                       color: 'white',
//                       borderRadius: '50%',
//                       width: '18px',
//                       height: '18px',
//                       fontSize: '0.72rem',
//                       fontWeight: '800',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)'
//                     }}
//                   >
//                     {totalItemsCount}
//                   </span>
//                 )}
//               </div>

//               <button
//                 className="close-btn"
//                 onClick={onClose}
//                 style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>

//           <CheckoutProgressTracker currentStep="cart" />
//         </div>

//         {/* SCROLLABLE BODY */}
//         <div
//           className="modal-body"
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             flex: '1 1 auto',
//             overflowY: 'auto',
//             padding: '1.15rem',
//             paddingBottom: '2.5rem',
//             minHeight: 0,
//             WebkitOverflowScrolling: 'touch',
//             overscrollBehavior: 'contain'
//           }}
//         >
//           {cartItems.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
//               <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Your cart is empty</p>
//               <p style={{ fontSize: '0.85rem' }}>Browse Sarees and Punjabi suits to add products!</p>
//             </div>
//           ) : (
//             <>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                 {cartItems.map((item) => (
//                   <div
//                     key={item._id}
//                     style={{
//                       display: 'flex',
//                       gap: '0.85rem',
//                       padding: '0.85rem',
//                       border: '1px solid #e2e8f0',
//                       borderRadius: '10px',
//                       background: '#fafafa'
//                     }}
//                   >
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
//                     />
//                     <div style={{ flex: 1 }}>
//                       <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.25rem' }}>{item.name}</h4>
//                       {item.selectedSize && (
//                         <div style={{ fontSize: '0.75rem', color: '#c026d3', fontWeight: '800', marginBottom: '0.25rem', display: 'inline-block', background: '#fdf4ff', padding: '1px 7px', borderRadius: '4px', border: '1px solid #f5d0fe' }}>
//                           Size: {item.selectedSize}
//                         </div>
//                       )}
//                       <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
//                         ₹{item.price.toLocaleString('en-IN')}
//                         {item.mrp > item.price && (
//                           <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
//                             ₹{item.mrp.toLocaleString('en-IN')}
//                           </span>
//                         )}
//                       </div>

//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 6px', background: 'white' }}>
//                           <button onClick={() => onUpdateQuantity(item._id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
//                           <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
//                           <button onClick={() => onUpdateQuantity(item._id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
//                         </div>
//                         <button onClick={() => onRemoveItem(item._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* COUPON CODE SECTION */}
//               <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
//                 <div style={{ background: '#fdf4ff', border: '1px dashed #c026d3', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#701a75', fontWeight: '800', fontSize: '0.9rem' }}>
//                       <Tag size={18} color="#c026d3" />
//                       <span>Apply Coupon Code</span>
//                     </div>
//                     {activeCoupons.length > 0 && (
//                       <button
//                         type="button"
//                         onClick={() => setShowCouponsModal(true)}
//                         style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
//                       >
//                         View Offers ({activeCoupons.length}) <ChevronRight size={14} />
//                       </button>
//                     )}
//                   </div>

//                   {appliedCoupon ? (
//                     <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <Gift size={18} color="#16a34a" />
//                         <div>
//                           <strong style={{ fontSize: '0.85rem', color: '#15803d', display: 'block' }}>
//                             '{appliedCoupon.code}' Applied!
//                           </strong>
//                           <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
//                             You saved ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} on this order
//                           </span>
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={handleRemoveCoupon}
//                         style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ) : (
//                     <div>
//                       <div style={{ display: 'flex', gap: '0.5rem' }}>
//                         <input
//                           type="text"
//                           placeholder="Enter Coupon Code"
//                           value={couponInput}
//                           onChange={(e) => {
//                             setCouponInput(e.target.value.toUpperCase());
//                             setCouponError('');
//                           }}
//                           style={{
//                             flex: 1,
//                             padding: '0.55rem 0.75rem',
//                             border: couponError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
//                             borderRadius: '8px',
//                             textTransform: 'uppercase',
//                             fontWeight: '700',
//                             fontSize: '0.85rem',
//                             letterSpacing: '0.5px'
//                           }}
//                         />
//                         <button
//                           type="button"
//                           onClick={() => handleApplyCoupon()}
//                           disabled={isApplyingCoupon || !couponInput.trim()}
//                           className="btn-primary blink-green"
//                           style={{
//                             padding: '0.55rem 1rem',
//                             fontSize: '0.85rem',
//                             fontWeight: '800',
//                             borderRadius: '8px',
//                             background: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)',
//                             opacity: (!couponInput.trim() || isApplyingCoupon) ? 0.6 : 1
//                           }}
//                         >
//                           {isApplyingCoupon ? 'Checking...' : 'Apply'}
//                         </button>
//                       </div>

//                       {couponError && (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: '600' }}>
//                           <AlertCircle size={14} />
//                           <span>{couponError}</span>
//                         </div>
//                       )}

//                       {activeCoupons.length > 0 && !couponInput && (
//                         <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
//                           💡 Tip: Try code <strong style={{ color: '#c026d3', cursor: 'pointer' }} onClick={() => handleApplyCoupon(activeCoupons[0].code)}>{activeCoupons[0].code}</strong> to save on this purchase!
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Delivery Date Banner */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', color: '#15803d', fontSize: '0.85rem', fontWeight: '600' }}>
//                   <Truck size={20} color="#16a34a" />
//                   <span>Estimated Delivery by <strong>{getEstimatedDeliveryDate()}</strong></span>
//                 </div>

//                 {/* Price Breakdown */}
//                 <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem' }}>Price Details</h4>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
//                   <span>Total MRP</span>
//                   <span>₹{totalMRP.toLocaleString('en-IN')}</span>
//                 </div>
//                 {totalDiscount > 0 && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#16a34a' }}>
//                     <span>Store Discount</span>
//                     <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
//                   </div>
//                 )}
//                 {appliedCoupon && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#15803d', fontWeight: '700' }}>
//                     <span>Coupon Savings ({appliedCoupon.code})</span>
//                     <span>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
//                   </div>
//                 )}
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
//                   <span>Delivery Charges</span>
//                   <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE</span>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: '800', fontSize: '1.1rem' }}>
//                   <span>Total Payable</span>
//                   <span style={{ color: '#c026d3' }}>₹{finalPayable.toLocaleString('en-IN')}</span>
//                 </div>
//               </div>

//               {/* IN-FLOW ACTION BUTTON FOR PLACE ORDER */}
//               <div
//                 className="modal-bottom-navbar"
//                 style={{
//                   padding: '1rem 0 0.5rem 0',
//                   background: '#ffffff',
//                   borderTop: '1.5px solid #e2e8f0',
//                   marginTop: '1.25rem'
//                 }}
//               >
//                 <div style={{ marginBottom: '0.75rem', padding: '0.65rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
//                   <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>
//                     <input
//                       type="checkbox"
//                       checked={agreedToTerms}
//                       onChange={(e) => {
//                         setAgreedToTerms(e.target.checked);
//                         if (e.target.checked) setTermsError('');
//                       }}
//                       style={{ marginTop: '2px', accentColor: '#c026d3', width: '16px', height: '16px', cursor: 'pointer' }}
//                     />
//                     <span>
//                       By placing an order, I agree to <strong>Dipto Fashion's</strong>{' '}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           setPolicyTab('terms');
//                           setIsPolicyOpen(true);
//                         }}
//                         style={{ background: 'none', border: 'none', color: '#c026d3', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
//                       >
//                         Terms & Conditions
//                       </button>{' '}
//                       and{' '}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           setPolicyTab('privacy');
//                           setIsPolicyOpen(true);
//                         }}
//                         style={{ background: 'none', border: 'none', color: '#c026d3', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
//                       >
//                         Privacy Policy
//                       </button>.
//                     </span>
//                   </label>
//                   {termsError && (
//                     <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: '600' }}>
//                       {termsError}
//                     </p>
//                   )}
//                 </div>

//                 <button
//                   className="btn-primary blink-green"
//                   style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
//                   onClick={handleCheckoutClick}
//                 >
//                   <span>Place Order</span>
//                   <ArrowRight size={18} />
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* AVAILABLE COUPONS MODAL */}
//       {showCouponsModal && (
//         <div className="modal-overlay" style={{ zIndex: 100 }} onClick={() => setShowCouponsModal(false)}>
//           <div
//             className="modal-card"
//             style={{ maxWidth: '420px', width: '92%', borderRadius: '16px', overflow: 'hidden' }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '1rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                 <Tag size={20} color="#f5d0fe" />
//                 <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
//                   Available Offers & Coupons
//                 </h3>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowCouponsModal(false)}
//                 style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="modal-body" style={{ padding: '1.15rem', maxHeight: '75vh', overflowY: 'auto' }}>
//               {loadingActiveCoupons ? (
//                 <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading available coupons...</div>
//               ) : activeCoupons.length === 0 ? (
//                 <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
//                   No coupons currently active.
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                   {activeCoupons.map((coupon) => (
//                     <div
//                       key={coupon._id}
//                       style={{
//                         background: '#ffffff',
//                         border: '1.5px solid #f5d0fe',
//                         borderRadius: '12px',
//                         padding: '1rem',
//                         boxShadow: '0 4px 12px rgba(112, 26, 117, 0.05)',
//                         position: 'relative'
//                       }}
//                     >
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
//                         <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fdf4ff', border: '1.5px dashed #c026d3', padding: '4px 10px', borderRadius: '6px' }}>
//                           <strong style={{ fontSize: '0.95rem', color: '#c026d3', letterSpacing: '0.5px' }}>{coupon.code}</strong>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => {
//                             setCouponInput(coupon.code);
//                             handleApplyCoupon(coupon.code);
//                           }}
//                           className="btn-primary blink-green"
//                           style={{
//                             padding: '0.4rem 0.85rem',
//                             fontSize: '0.8rem',
//                             fontWeight: '800',
//                             borderRadius: '6px',
//                             background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
//                           }}
//                         >
//                           APPLY
//                         </button>
//                       </div>

//                       <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
//                         {coupon.discountType === 'percentage'
//                           ? `Get ${coupon.discountAmount}% OFF ${coupon.maxDiscountAmount ? `up to ₹${coupon.maxDiscountAmount}` : ''}`
//                           : `Get Flat ₹${coupon.discountAmount.toLocaleString('en-IN')} OFF`}
//                       </h4>

//                       <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
//                         {coupon.minOrderAmount > 0 ? `Applicable on orders above ₹${coupon.minOrderAmount.toLocaleString('en-IN')}` : 'No minimum order threshold'}
//                       </p>

//                       <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.4rem' }}>
//                         <button
//                           type="button"
//                           onClick={() => setExpandedTermsCode(expandedTermsCode === coupon.code ? null : coupon.code)}
//                           style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
//                         >
//                           <Info size={12} />
//                           <span>{expandedTermsCode === coupon.code ? 'Hide Terms & Conditions' : 'Terms & Conditions'}</span>
//                         </button>

//                         {expandedTermsCode === coupon.code && (
//                           <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: '6px', lineHeight: '1.4' }}>
//                             {coupon.description || 'Valid for all registered store customers. Applies directly to total bill.'}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Terms & Privacy Policy Modal */}
//       <TermsPrivacyModal
//         isOpen={isPolicyOpen}
//         onClose={() => setIsPolicyOpen(false)}
//         initialTab={policyTab}
//       />
//     </div>
//   );
// };

// export default CartDrawer;