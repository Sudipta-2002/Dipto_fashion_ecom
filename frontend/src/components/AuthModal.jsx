import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Mail, Phone, X, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react';
import { API_URL } from '../api';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';

const COUNTRY_CODES = [
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+1', country: 'USA / Canada 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+880', country: 'Bangladesh 🇧🇩' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+61', country: 'Australia 🇦🇺' }
];

// Helper to mask phone number: e.g. "+91 9876543210" -> "+91 ******3210"
const maskPhoneNumber = (fullPhone) => {
  if (!fullPhone) return '+91 ******1234';
  const clean = fullPhone.trim();
  const parts = clean.split(' ');
  const code = parts.length > 1 ? parts[0] : '+91';
  const num = parts.length > 1 ? parts.slice(1).join('') : clean.replace(/^\+\d+\s*/, '');
  if (num.length >= 4) {
    const visible = num.slice(-4);
    const maskedLen = Math.max(num.length - 4, 6);
    return `${code} ${'*'.repeat(maskedLen)}${visible}`;
  }
  return clean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  // Modes: 'login' | 'signup' | 'forgot' | 'otp'
  const [mode, setMode] = useState('login');
  
  // State for OTP flow origin: 'login' | 'signup' | 'forgot'
  const [otpOrigin, setOtpOrigin] = useState('signup');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const otpInputRefs = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatically reset all form fields whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Resend Timer Countdown for OTP
  useEffect(() => {
    let timer;
    if (mode === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendTimer]);

  const resetForm = () => {
    setMode('login');
    setOtpOrigin('signup');
    setOtpTargetEmail('');
    setOtpValues(['', '', '', '', '', '']);
    setResendTimer(30);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setFieldErrors({});
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  // -------------------------------------------------------------
  // Validation Rules for Each Flow
  // -------------------------------------------------------------
  const validateForm = () => {
    const errors = {};

    if (mode === 'signup') {
      if (!formData.name.trim()) errors.name = 'Full Name is required';

      if (!formData.email.trim()) {
        errors.email = 'Email Address is required';
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email format (e.g., user@domain.com)';
      }
      
      const cleanPhone = formData.phone.trim().replace(/\D/g, '');
      if (!cleanPhone) {
        errors.phone = 'Mobile Number is required';
      } else if (cleanPhone.length !== 10) {
        errors.phone = 'Mobile Number must be exactly 10 digits';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (mode === 'login') {
      if (!formData.email.trim()) {
        errors.email = 'Gmail Address is required';
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email format (e.g., user@domain.com)';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    } else if (mode === 'forgot') {
      if (!formData.email.trim()) {
        errors.email = 'Registered Gmail Address is required';
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email format (e.g., user@domain.com)';
      }

      if (!formData.newPassword) {
        errors.newPassword = 'New Password is required';
      } else if (formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long';
      }

      if (!formData.confirmNewPassword) {
        errors.confirmNewPassword = 'Please confirm new password';
      } else if (formData.newPassword !== formData.confirmNewPassword) {
        errors.confirmNewPassword = 'Passwords do not match';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------------------------------------------------
  // Form Submit Handler (Triggers Nodemailer OTP Generation & Sending)
  // -------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      if (mode === 'signup') {
        const res = await fetch(`${API_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, type: 'signup' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send OTP to Gmail');

        setOtpTargetEmail(cleanEmail);
        setOtpOrigin('signup');
        setOtpValues(['', '', '', '', '', '']);
        setResendTimer(30);
        setMode('otp');
        setSuccessMsg(`A 6-digit OTP code has been sent to ${cleanEmail}`);
      } else if (mode === 'login') {
        const res = await fetch(`${API_URL}/api/auth/login-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        setOtpTargetEmail(cleanEmail);
        setOtpOrigin('login');
        setOtpValues(['', '', '', '', '', '']);
        setResendTimer(30);
        setMode('otp');
        setSuccessMsg(`Credentials verified! A 6-digit OTP code has been sent to ${cleanEmail}`);
      } else if (mode === 'forgot') {
        const res = await fetch(`${API_URL}/api/auth/forgot-password-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, newPassword: formData.newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to process request');

        setOtpTargetEmail(cleanEmail);
        setOtpOrigin('forgot');
        setOtpValues(['', '', '', '', '', '']);
        setResendTimer(30);
        setMode('otp');
        setSuccessMsg(`A 6-digit OTP code has been sent to ${cleanEmail}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // OTP Verification Handler (Verifies 6-digit OTP with Backend)
  // -------------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
      setError('Please enter full 6-digit OTP code');
      return;
    }

    setLoading(true);

    const sanitizeForStorage = (u) => {
      if (!u) return u;
      const clone = { ...u };
      if (clone.avatar && clone.avatar.startsWith('data:')) {
        clone.avatar = '';
      }
      if (clone.profilePicture && clone.profilePicture.startsWith('data:')) {
        clone.profilePicture = '';
      }
      return clone;
    };

    try {
      if (otpOrigin === 'signup') {
        const res = await fetch(`${API_URL}/api/auth/verify-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: otpTargetEmail,
            phone: formData.phone.trim(),
            password: formData.password,
            otp: otpCode
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Signup verification failed');

        try {
          localStorage.setItem('df_token', data.token);
          localStorage.setItem('df_user', JSON.stringify(sanitizeForStorage(data.user)));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }

        onAuthSuccess(data.user);
        onClose();
      } else if (otpOrigin === 'login') {
        const res = await fetch(`${API_URL}/api/auth/verify-login-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: otpTargetEmail,
            otp: otpCode
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login OTP verification failed');

        try {
          localStorage.setItem('df_token', data.token);
          localStorage.setItem('df_user', JSON.stringify(sanitizeForStorage(data.user)));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }

        onAuthSuccess(data.user);
        onClose();
      } else if (otpOrigin === 'forgot') {
        const res = await fetch(`${API_URL}/api/auth/verify-reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: otpTargetEmail,
            newPassword: formData.newPassword,
            otp: otpCode
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update password');

        setSuccessMsg('Password updated successfully! Please login with your new password.');
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
          setError('');
          setFormData((prev) => ({ ...prev, password: '' }));
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-digit OTP Input Typing & Auto-Focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setOtpValues(['', '', '', '', '', '']);
    setResendTimer(30);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpTargetEmail, type: otpOrigin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
      setSuccessMsg(`A new 6-digit OTP has been sent to ${otpTargetEmail}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    }
  };


  const inputStyle = (hasError) => ({
    width: '100%',
    height: '46px',
    padding: '0 1rem 0 2.5rem',
    fontSize: '0.9rem',
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
            <h2 style={{ fontSize: '1.55rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              {mode === 'otp'
                ? 'OTP Verification'
                : mode === 'forgot'
                ? 'Reset Password'
                : mode === 'login'
                ? 'Login'
                : "Looks like you're new here!"}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#f5d0fe', opacity: 0.9, marginTop: '0.5rem', lineHeight: '1.45' }}>
              {mode === 'otp'
                ? 'Enter the 6-digit verification OTP sent to your phone'
                : mode === 'forgot'
                ? 'Reset your password securely via OTP verification'
                : mode === 'login'
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your phone to get started with Dipto Fashion'}
            </p>
          </div>

          {/* Flipkart Brand Graphic Centerpiece */}
          <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
            <img
              src="/logo.jpg"
              alt="Dipto Fashion Logo"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '18px',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                margin: '0 auto 0.5rem'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
              Dipto Fashion
            </div>
            <div style={{ fontSize: '0.72rem', color: '#f5d0fe', opacity: 0.85, marginTop: '2px' }}>
              Premium Ethnic &amp; Fashion Collection
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#e9d5ff', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> 100% Safe &amp; Secure Verification
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
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: '600' }}>
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODE 1: OTP VERIFICATION VIEW */}
            {/* ------------------------------------------------------------- */}
            {mode === 'otp' ? (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ textAlign: 'center', margin: '0.5rem 0 0.25rem 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <KeyRound size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Enter 6-Digit OTP
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                    OTP sent to <strong style={{ color: '#c026d3' }}>{otpTargetEmail}</strong>
                  </p>
                </div>

                {/* 6-DIGIT OTP INPUT BOXES */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.45rem', margin: '0.5rem 0' }}>
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '42px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        borderRadius: '8px',
                        border: val ? '2px solid #c026d3' : '1.5px solid #cbd5e1',
                        background: val ? '#fdf4ff' : '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  {resendTimer > 0 ? (
                    <span>Resend OTP in <strong style={{ color: '#c026d3' }}>{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      style={{ background: 'none', border: 'none', color: '#c026d3', fontWeight: '800', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Resend OTP
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMode(otpOrigin); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change Email Address
                  </button>
                </div>

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
                  {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
                </button>
              </form>

            /* ------------------------------------------------------------- */
            /* MODE 2: FORGOT PASSWORD VIEW */
            /* ------------------------------------------------------------- */
            ) : mode === 'forgot' ? (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Registered Gmail Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="user@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ ...inputStyle(fieldErrors.email), width: '100%' }}
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.email}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    New Password (Min. 8 characters) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      placeholder="Enter New Password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      style={{ ...inputStyle(fieldErrors.newPassword), paddingRight: '2.6rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.newPassword}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmNewPassword"
                      placeholder="Re-enter New Password"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      style={{ ...inputStyle(fieldErrors.confirmNewPassword), paddingRight: '2.6rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.confirmNewPassword && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.confirmNewPassword}</span>}
                </div>

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
                  {loading ? 'SENDING OTP...' : 'SEND OTP'}
                </button>
              </form>
            ) : (
              /* MODE 3 & 4: LOGIN & SIGNUP VIEWS */
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mode === 'signup' && (
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

                {/* EMAIL FIELD FOR LOGIN & SIGNUP */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    {mode === 'login' ? 'Enter Registered Gmail *' : 'Enter Gmail Address *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="user@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="off"
                      style={inputStyle(fieldErrors.email)}
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.email}</span>}
                </div>

                {/* MOBILE NUMBER FIELD FOR SIGNUP */}
                {mode === 'signup' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Enter Mobile Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        inputMode="numeric"
                        maxLength={10}
                        style={inputStyle(fieldErrors.phone)}
                      />
                      <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                    {fieldErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.phone}</span>}
                  </div>
                )}

                {/* PASSWORD FIELD */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                      Enter Password (Min. 8 characters) *
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); resetForm(); setMode('forgot'); }}
                        style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
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
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.password}</span>}
                </div>

                {/* CONFIRM PASSWORD FIELD (SIGNUP ONLY) */}
                {mode === 'signup' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Confirm Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        style={{ ...inputStyle(fieldErrors.confirmPassword), paddingRight: '2.6rem' }}
                      />
                      <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '3px', display: 'block', fontWeight: '600' }}>{fieldErrors.confirmPassword}</span>}
                  </div>
                )}

                {/* Policy Disclaimer */}
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
                  {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'CONTINUE' : 'SIGN UP'}
                </button>
              </form>
            )}
          </div>

          {/* Flipkart Style Switch Account Link Banner at Bottom */}
          <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => { setMode('signup'); resetForm(); setMode('signup'); }}
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
            ) : mode === 'signup' || mode === 'forgot' || mode === 'otp' ? (
              <button
                type="button"
                onClick={() => { setMode('login'); resetForm(); setMode('login'); }}
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
