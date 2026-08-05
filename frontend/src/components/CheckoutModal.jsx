import React, { useState, useEffect } from 'react';
import { MapPin, Plus, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import CheckoutProgressTracker from './CheckoutProgressTracker';
import { API_URL } from '../api';

const COUNTRY_CODES = [
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+1', country: 'USA / Canada 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+880', country: 'Bangladesh 🇧🇩' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+61', country: 'Australia 🇦🇺' }
];

const CheckoutModal = ({ isOpen, onClose, onBackToCart, user, onProceedToPayment }) => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [countryCode, setCountryCode] = useState('+91');
  const [addressData, setAddressData] = useState({
    userName: user?.name || '',
    mobileNumber: user?.phone || '',
    address: '',
    landmark: '',
    pincode: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen && user) {
      fetchSavedAddresses();
    }
  }, [isOpen, user]);

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('df_token');
      const res = await fetch(`${API_URL}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data);
        if (data.length > 0) {
          setSelectedAddressIndex(0);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } else {
        setShowNewAddressForm(true);
      }
    } catch (e) {
      setShowNewAddressForm(true);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const validateAddress = () => {
    const errors = {};
    if (!addressData.userName.trim()) errors.userName = 'Receiver name is required';
    if (!addressData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else {
      const digits = addressData.mobileNumber.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        errors.mobileNumber = 'Enter a valid mobile number (e.g. 10 digits)';
      }
    }

    if (!addressData.address.trim()) errors.address = 'Full delivery address is required';

    if (!addressData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{5,8}$/.test(addressData.pincode.trim())) {
      errors.pincode = 'Enter a valid numeric pincode (e.g. 6 digits)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    let finalAddress = null;

    if (!showNewAddressForm && selectedAddressIndex !== null && savedAddresses[selectedAddressIndex]) {
      finalAddress = savedAddresses[selectedAddressIndex];
    } else {
      if (!validateAddress()) return;

      const formattedMobile = addressData.mobileNumber.startsWith('+')
        ? addressData.mobileNumber
        : `${countryCode} ${addressData.mobileNumber.trim()}`;

      finalAddress = {
        ...addressData,
        mobileNumber: formattedMobile
      };
    }

    onProceedToPayment(finalAddress);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{ width: '100%', maxWidth: '400px', height: '100vh', borderRadius: '0', position: 'fixed', right: '0', top: '0', bottom: '0', padding: 0, display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Royal Gradient Top Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '0.95rem 1.15rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {onBackToCart && (
              <button
                type="button"
                onClick={onBackToCart}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Back to Cart"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <img
              src="/logo.jpg"
              alt="Dipto Fashion"
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.4)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.2px' }}>
                Delivery Address
              </h3>
              <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Step 2 of 3 • Place Order</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ color: 'white' }} title="Close Modal">
            <X size={20} />
          </button>
        </div>

        {/* Progress Tracker System: Step 2 Place Order */}
        <CheckoutProgressTracker currentStep="checkout" />

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '1.15rem' }}>
          {savedAddresses.length > 0 && !showNewAddressForm && (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', fontWeight: '600' }}>
                Saved Delivery Addresses:
              </p>
              {savedAddresses.map((addr, index) => (
                <div
                  key={index}
                  className={`address-card-option ${selectedAddressIndex === index ? 'selected' : ''}`}
                  onClick={() => setSelectedAddressIndex(index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{addr.userName}</span>
                    <span style={{ fontSize: '0.85rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
                      {addr.mobileNumber}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                    {addr.address}{addr.landmark ? `, Landmark: ${addr.landmark}` : ''}, Pincode: <strong>{addr.pincode}</strong>
                  </p>
                  {selectedAddressIndex === index && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c026d3', fontSize: '0.8rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      <CheckCircle2 size={16} /> Selected as Delivery Address
                    </div>
                  )}
                </div>
              ))}

              <button
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', padding: '0.65rem' }}
                onClick={() => setShowNewAddressForm(true)}
              >
                <Plus size={16} />
                <span>+ Deliver to a Different / New Address</span>
              </button>
            </div>
          )}

          {(showNewAddressForm || savedAddresses.length === 0) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Enter New Address</h4>
                {savedAddresses.length > 0 && (
                  <button
                    style={{ background: 'none', color: '#c026d3', fontSize: '0.85rem', fontWeight: '700' }}
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Back to Saved Addresses
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Receiver Name *</label>
                <input
                  type="text"
                  name="userName"
                  placeholder="Full name of recipient"
                  value={addressData.userName}
                  onChange={handleInputChange}
                  style={{ borderColor: fieldErrors.userName ? '#ef4444' : '' }}
                />
                {fieldErrors.userName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{fieldErrors.userName}</span>}
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{ width: '110px', background: '#f8fafc' }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="9876543210"
                    value={addressData.mobileNumber}
                    onChange={handleInputChange}
                    style={{ flex: 1, borderColor: fieldErrors.mobileNumber ? '#ef4444' : '' }}
                  />
                </div>
                {fieldErrors.mobileNumber && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{fieldErrors.mobileNumber}</span>}
              </div>

              <div className="form-group">
                <label>Full Delivery Address *</label>
                <textarea
                  name="address"
                  rows="3"
                  placeholder="House/Flat No., Building, Street, Area"
                  value={addressData.address}
                  onChange={handleInputChange}
                  style={{ borderColor: fieldErrors.address ? '#ef4444' : '' }}
                />
                {fieldErrors.address && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{fieldErrors.address}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Near temple/park"
                    value={addressData.landmark}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="6-digit Pincode"
                    value={addressData.pincode}
                    onChange={handleInputChange}
                    style={{ borderColor: fieldErrors.pincode ? '#ef4444' : '' }}
                  />
                  {fieldErrors.pincode && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{fieldErrors.pincode}</span>}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
            {onBackToCart && (
              <button
                type="button"
                className="btn-outline"
                style={{ color: '#475569', borderColor: '#cbd5e1', padding: '0.85rem 1rem' }}
                onClick={onBackToCart}
                title="Back to Cart"
              >
                <ArrowLeft size={16} /> Back to Cart
              </button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
              onClick={handleContinue}
            >
              Proceed to Payment & QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
