import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, X, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { API_URL } from '../api';

const COUNTRY_CODES = [
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+1', country: 'USA / Canada 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+880', country: 'Bangladesh 🇧🇩' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+61', country: 'Australia 🇦🇺' }
];

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatically reset all form fields to completely BLANK whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: ''
    });
    setFieldErrors({});
    setError('');
    setShowPassword(false);
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errors = {};

    if (!isLogin && !formData.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email ID or Mobile Number is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!isLogin && formData.phone.trim()) {
      const cleanPhone = formData.phone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        errors.phone = 'Please enter a valid mobile number';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      ...formData,
      phone: !isLogin && formData.phone ? `${countryCode} ${formData.phone.trim()}` : ''
    };

    const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      localStorage.setItem('df_token', data.token);
      localStorage.setItem('df_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '48px',
    padding: '0 1rem 0 2.6rem',
    fontSize: '0.92rem',
    borderRadius: '8px',
    border: hasError ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(6px)', zIndex: 300 }}>
      <div
        className="modal-card flipkart-auth-modal"
        style={{
          maxWidth: '740px',
          width: '92%',
          maxHeight: '90vh',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'row'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* FLIPKART STYLE LEFT BRAND PANEL (~40% Width) */}
        <div
          style={{
            width: '40%',
            background: 'linear-gradient(160deg, #1e1b4b 0%, #701a75 100%)',
            padding: '2.25rem 1.75rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxSizing: 'border-box'
          }}
          className="auth-left-banner"
        >
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              {isLogin ? 'Login' : "Looks like you're new here!"}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#f5d0fe', opacity: 0.9, marginTop: '0.65rem', lineHeight: '1.45' }}>
              {isLogin
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your email to get started with Dipto Fashion'}
            </p>
          </div>

          {/* Flipkart Brand Graphic Centerpiece */}
          <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            <img
              src="/logo.jpg"
              alt="Dipto Fashion Logo"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                margin: '0 auto 0.65rem'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
              Dipto Fashion
            </div>
            <div style={{ fontSize: '0.72rem', color: '#f5d0fe', opacity: 0.85, marginTop: '2px' }}>
              Premium Ethnic & Fashion Collection
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#e9d5ff', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> 100% Safe & Secure Login
          </div>
        </div>

        {/* FLIPKART STYLE RIGHT FORM PANEL (~60% Width, Scrollable) */}
        <div
          style={{
            width: '60%',
            padding: '2rem 1.75rem 1.5rem 1.75rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
          className="auth-right-form"
        >
          {/* Close Button at top right */}
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              color: '#64748b',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Close Modal"
          >
            <X size={18} />
          </button>

          <div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 0.85rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.82rem', fontWeight: '600' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {!isLogin && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Enter Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="off"
                      style={inputStyle(fieldErrors.name)}
                    />
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  {fieldErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.name}</span>}
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  {isLogin ? 'Enter Email ID / Mobile Number *' : 'Enter Email Address *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="email"
                    placeholder={isLogin ? "Email ID or Mobile Number" : "name@example.com"}
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    style={inputStyle(fieldErrors.email)}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
                {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.email}</span>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Enter Password (Min. 8 characters) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{ ...inputStyle(fieldErrors.password), paddingRight: '2.6rem' }}
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.password}</span>}
              </div>

              {!isLogin && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Number (Optional)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        width: '105px',
                        height: '48px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        padding: '0 0.4rem'
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                      ))}
                    </select>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Mobile Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ ...inputStyle(fieldErrors.phone), width: '100%' }}
                      />
                      <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                  </div>
                  {fieldErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.phone}</span>}
                </div>
              )}

              {/* Flipkart Style Policy Agreement Disclaimer */}
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>
                By continuing, you agree to Dipto Fashion's{' '}
                <span style={{ color: '#c026d3', fontWeight: '700', cursor: 'pointer' }}>Terms of Use</span> and{' '}
                <span style={{ color: '#c026d3', fontWeight: '700', cursor: 'pointer' }}>Privacy Policy</span>.
              </p>

              <button
                type="submit"
                className="btn-primary blink-green auth-submit-btn"
                style={{
                  width: '100%',
                  maxWidth: '240px',
                  margin: '0.5rem auto 0 auto',
                  height: '44px',
                  justifyContent: 'center',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex'
                }}
                disabled={loading}
              >
                {loading ? 'AUTHENTICATING...' : isLogin ? 'CONTINUE' : 'SIGN UP'}
              </button>
            </form>
          </div>

          {/* Flipkart Style Switch Account Link Banner at Bottom */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            {isLogin ? (
              <button
                type="button"
                onClick={() => { setIsLogin(false); resetForm(); }}
                style={{
                  background: '#fdf4ff',
                  border: '1px solid #f5d0fe',
                  color: '#c026d3',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                New to Dipto Fashion? Create an account <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setIsLogin(true); resetForm(); }}
                style={{
                  background: '#fdf4ff',
                  border: '1px solid #f5d0fe',
                  color: '#c026d3',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Existing User? Log in <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
