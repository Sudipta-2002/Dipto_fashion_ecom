import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, AlertTriangle, X, Clock, RefreshCw, Copy, Check, ShieldCheck, ArrowLeft } from 'lucide-react';
import CheckoutProgressTracker from './CheckoutProgressTracker';
import { API_URL } from '../api';

const PaymentModal = ({
  isOpen,
  onClose,
  onBackToCheckout,
  user,
  cartItems,
  deliveryAddress,
  onOrderSuccess
}) => {
  const [step, setStep] = useState('payment'); // 'payment', 'failed', or 'success'
  const [timeLeft, setTimeLeft] = useState(180); // 3 Minutes (180 Seconds) Countdown Timer
  const [fixedOrderId, setFixedOrderId] = useState(''); // FIXED Order ID (Does not change on timer ticks)
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [copied, setCopied] = useState(false);

  const [isQrRemoved, setIsQrRemoved] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Target UPI ID: palsudipto3@ybl
  const TARGET_UPI_ID = 'palsudipto3@ybl';

  // Initialize FIXED Order ID & Reset Timer when Modal Opens
  useEffect(() => {
    if (isOpen) {
      setFixedOrderId('DF-' + Math.floor(100000 + Math.random() * 900000));
      setTimeLeft(180);
      setStep('payment');
      setUtrNumber('');
      setUtrError('');
      setOrderConfirmed(null);
      setIsQrRemoved(false);
      setPaymentInitiated(false);
    }
  }, [isOpen]);

  // Requirement 2: Automatic Web Redirection & Return Listener after Mobile UPI Payment
  useEffect(() => {
    const handleReturnToWeb = () => {
      if (isOpen && step === 'payment' && paymentInitiated) {
        setIsQrRemoved(true); // Automatically remove QR code and present UTR input box!
      }
    };

    window.addEventListener('focus', handleReturnToWeb);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReturnToWeb();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleReturnToWeb);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, step, paymentInitiated]);

  // 3-Minute Countdown Timer (180s)
  useEffect(() => {
    let timer = null;

    if (isOpen && step === 'payment') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('failed'); // Timeout -> Payment Failed Screen
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Format seconds to mm:ss (e.g. 180 -> 03:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic UPI String targeting palsudipto3@ybl with FIXED Order ID
  const upiString = `upi://pay?pa=${TARGET_UPI_ID}&pn=Dipto%20Fashion&am=${totalAmount}&cu=INR&tn=Order%20${fixedOrderId}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(TARGET_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelPayment = () => {
    onClose();
  };

  // Requirement 1: Deep-linked mobile UPI app click handler
  const handleLaunchUpiApp = (appUrl) => {
    setPaymentInitiated(true);
    setIsQrRemoved(true); // Automatically remove QR code on web page
    window.location.href = appUrl;
  };

  const handleRetryPayment = () => {
    setFixedOrderId('DF-' + Math.floor(100000 + Math.random() * 900000));
    setTimeLeft(180);
    setStep('payment');
    setUtrError('');
    setUtrNumber('');
  };

  // SUBMIT UTR NUMBER -> AUTOMATICALLY CLOSES QR CODE & SHOWS ORDER SUCCESS PAGE
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit UTR / Transaction Reference Number');
      return;
    }
    if (cleanUtr.length < 6) {
      setUtrError('UTR / Transaction reference number must be at least 6 digits');
      return;
    }

    setLoading(true);
    setUtrError('');

    try {
      const token = localStorage.getItem('df_token');
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: fixedOrderId,
          items: cartItems.map((item) => ({
            product: item._id,
            name: item.name,
            selectedSize: item.selectedSize || 'Free Size',
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount,
          shippingAddress: deliveryAddress,
          paymentMethod: 'UPI_QR',
          utrNumber: cleanUtr
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOrderConfirmed(data);
        setStep('success'); // QR Code automatically closes & shows Order Success Screen!
        if (onOrderSuccess) onOrderSuccess();
      } else {
        const err = await res.json();
        setUtrError(err.message || 'Failed to register order. Please try again.');
      }
    } catch (err) {
      setUtrError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{ maxWidth: '520px', width: '92%', borderRadius: '16px', overflowY: 'auto', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dipto Fashion Logo & Brand Name */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '1rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {step !== 'success' && onBackToCheckout && (
              <button
                type="button"
                onClick={onBackToCheckout}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Back to Address"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <img src="/logo.jpg" alt="Dipto Fashion" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>Dipto Fashion</h3>
              <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>
                {step === 'success' ? 'Order Confirmation' : 'UPI QR Payment Gateway'}
              </p>
            </div>
          </div>
          {step !== 'success' && (
            <button className="close-btn" onClick={handleCancelPayment} style={{ color: 'white' }} title="Close Modal">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Requirement 2 & 3: 3-STEP PROGRESS TRACKER SYSTEM */}
        <CheckoutProgressTracker currentStep={step === 'success' ? 'confirmation' : 'payment'} />

        {step === 'payment' && (
          <div className="modal-body" style={{ padding: '1rem 1.25rem' }}>
            {/* FIXED ORDER ID & 3-MINUTE TIMER HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.6rem 0.85rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Order ID</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#c026d3' }}>{fixedOrderId}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Time Remaining</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', fontWeight: '800', fontSize: '1.05rem' }}>
                  <Clock size={15} />
                  <span>{formatTime(timeLeft)} min</span>
                </div>
              </div>
            </div>

            {/* Requirement 1 & 2: DYNAMIC QR CODE & INSTALLED MOBILE UPI APPS OR QR CODE REMOVAL BANNER */}
            {!isQrRemoved ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: '2px dashed #c026d3', borderRadius: '14px', padding: '1rem 0.75rem', marginBottom: '0.85rem' }}>
                {/* CLEAN RED NOTICE BANNER ABOVE QR CODE */}
                <div style={{
                  width: '100%',
                  background: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  marginBottom: '0.85rem',
                  textAlign: 'center'
                }}>
                  <p style={{
                    color: '#dc2626',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    margin: 0,
                    lineHeight: '1.35'
                  }}>
                    📌 <strong>Note:</strong> After completing the payment, please click the <strong>"I Have Paid"</strong> button below to enter your UTR number and confirm your order.
                  </p>
                </div>

                <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', border: '1px solid #f5d0fe' }}>
                  <QRCodeSVG value={upiString} size={150} level="H" includeMargin={true} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#16a34a', marginTop: '0.4rem' }}>
                  Payable: ₹{totalAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', background: '#f8fafc', padding: '3px 10px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>UPI ID:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{TARGET_UPI_ID}</strong>
                  <button type="button" onClick={handleCopyUpi} style={{ background: '#f1f5f9', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#c026d3', cursor: 'pointer' }}>
                    {copied ? <Check size={12} /> : 'Copy'}
                  </button>
                </div>                {/* Requirement 1: INSTALLED MOBILE UPI APPS SELECTION LIST WITH OFFICIAL CDN LOGOS */}
                <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                    Tap to Pay via Installed Mobile UPI Apps:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp(`tez://upi/pay?pa=${TARGET_UPI_ID}&pn=Dipto%20Fashion&am=${totalAmount}&cu=INR&tn=Order%20${fixedOrderId}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.65rem 0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src="https://img.icons8.com/color/512/google-pay.png" alt="Google Pay" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>Google Pay</span>
                    </button>

                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp(`phonepe://pay?pa=${TARGET_UPI_ID}&pn=Dipto%20Fashion&am=${totalAmount}&cu=INR&tn=Order%20${fixedOrderId}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.65rem 0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src="https://img.icons8.com/color/512/phone-pe.png" alt="PhonePe" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>PhonePe</span>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp(`paytmmp://pay?pa=${TARGET_UPI_ID}&pn=Dipto%20Fashion&am=${totalAmount}&cu=INR&tn=Order%20${fixedOrderId}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.65rem 0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src="https://img.icons8.com/color/512/paytm.png" alt="Paytm" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>Paytm</span>
                    </button>

                    {/* BHIM UPI */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp(`upi://pay?pa=${TARGET_UPI_ID}&pn=Dipto%20Fashion&am=${totalAmount}&cu=INR&tn=Order%20${fixedOrderId}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.65rem 0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src="https://img.icons8.com/color/512/bhim.png" alt="BHIM UPI" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>BHIM UPI</span>
                    </button>
                  </div>
                </div>

                {/* STEP 2 (VIA QR CODE): "I HAVE COMPLETED PAYMENT" BUTTON */}
                <div style={{ marginTop: '0.85rem', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setIsQrRemoved(true)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      fontSize: '0.92rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <CheckCircle size={18} /> I Have Paid (Enter UTR)
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 3: QR CODE REMOVED BANNER & AUTOMATIC UTR INPUT PRESENTATION */
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '0.85rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#15803d', fontWeight: '800', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                  <CheckCircle size={18} color="#16a34a" /> Payment Initiated / Completed
                </div>
                <p style={{ fontSize: '0.82rem', color: '#166534', margin: '0 0 0.4rem 0', fontWeight: '600', lineHeight: 1.35 }}>
                  QR code removed. Enter your 12-digit UTR/Transaction Reference Number below and click <strong>Confirm Order</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsQrRemoved(false)}
                  style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Show QR Code & UPI Apps Again
                </button>
              </div>
            )}

            {/* STEP 3: UTR SUBMISSION & ORDER CONFIRMATION (REVEALED ONLY WHEN QR IS REMOVED) */}
            {isQrRemoved && (
              <>
                {/* BOLD RED INSTRUCTION NOTICE */}
                <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.88rem', textAlign: 'center', margin: '0.4rem 0 0.75rem 0', lineHeight: '1.3' }}>
                  After the payment write the UTR number and click confirm button
                </p>

                {/* UTR NUMBER INPUT FIELD & CONFIRM BUTTON DIRECTLY ON THIS PAGE */}
                <form onSubmit={handleSubmitOrder}>
                  {utrError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                      {utrError}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Enter UTR / Transaction Reference Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 12-Digit UTR Number"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      required
                      style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '1px', textAlign: 'center', padding: '0.65rem', border: '2px solid #c026d3', borderRadius: '8px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1.05rem', borderRadius: '12px' }}
                    disabled={loading}
                  >
                    {loading ? 'Confirming Order...' : 'Confirm Order'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {step === 'failed' && (
          /* PAYMENT TIMEOUT / FAILED SCREEN */
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '60px', height: '60px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#b91c1c', marginBottom: '0.4rem' }}>
              Payment Failed / Time Out
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              The 3-minute payment window expired. Please try scanning the QR code again.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                onClick={handleRetryPayment}
              >
                <RefreshCw size={16} /> Retry Payment (3 min)
              </button>
              <button
                className="btn-outline"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                onClick={handleCancelPayment}
              >
                Back to Cart
              </button>
            </div>
          </div>
        )}

        {step === 'success' && orderConfirmed && (
          /* ORDER SUCCESSFULLY PLACED PAGE (QR Code Automatically Closed!) */
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '68px', height: '68px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={40} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Order Successfully Placed!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Thank you for shopping with <strong>Dipto Fashion</strong>. Your order is registered under pending verification.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', textAlign: 'left', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Order ID:</span>
                <span style={{ fontWeight: '800', color: '#c026d3' }}>{orderConfirmed.orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Submitted UTR:</span>
                <span style={{ fontWeight: '700' }}>{orderConfirmed.utrNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Amount Paid:</span>
                <span style={{ fontWeight: '800', color: '#16a34a' }}>₹{orderConfirmed.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Estimated Delivery:</span>
                <span style={{ fontWeight: '800', color: '#15803d' }}>
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Deliver To:</span>
                <span style={{ fontWeight: '600', textAlign: 'right' }}>
                  {orderConfirmed.shippingAddress.userName}, Pincode: {orderConfirmed.shippingAddress.pincode}
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
