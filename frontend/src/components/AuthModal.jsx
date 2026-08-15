import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Mail, Phone, X, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react';
import { API_URL } from '../api';

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
  const [googleLoading, setGoogleLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "886817252299-cjii473fvu235otmm7obct3ji39j04l8.apps.googleusercontent.com";

  const sanitizeForStorage = (u) => {
    if (!u) return u;
    const clone = { ...u };
    if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
    if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
    return clone;
  };

  // Process and save auth payload immediately
  const handleAuthComplete = (data) => {
    const safeUser = sanitizeForStorage(data.user);
    try {
      localStorage.setItem('df_token', data.token);
      localStorage.setItem('df_user', JSON.stringify(safeUser));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    if (onAuthSuccess) onAuthSuccess(safeUser);
    onClose();
  };

  // Listen for Google Auth postMessage from popup window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.user) {
        setGoogleLoading(false);
        handleAuthComplete(event.data);
      } else if (event.data && event.data.type === 'GOOGLE_AUTH_ERROR') {
        setGoogleLoading(false);
        setError(event.data.error || 'Google Authentication failed');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthSuccess, onClose]);

  // Initialize GSI Client on load
  useEffect(() => {
    const setupGSI = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response?.credential) {
                setGoogleLoading(true);
                try {
                  const res = await fetch(`${API_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: response.credential })
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || 'Google authentication failed');
                  handleAuthComplete(data);
                } catch (err) {
                  setError(err.message || 'Google authentication failed');
                } finally {
                  setGoogleLoading(false);
                }
              }
            }
          });
        } catch (e) {
          console.warn('GSI Initialization Error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGSI();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          setupGSI();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [clientId]);

  // Google OAuth Auth Trigger
  const handleGoogleAuth = () => {
    setError('');
    setGoogleLoading(true);
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://www.diptofashion.in/auth/google/callback';

    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            triggerOAuthRedirect(clientId, redirectUri);
          }
        });
        return;
      } catch (e) {
        console.warn('GIS prompt error, falling back to OAuth redirect:', e);
      }
    }

    triggerOAuthRedirect(clientId, redirectUri);
  };

  const triggerOAuthRedirect = (clientId, redirectUri) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;

    const width = 500;
    const height = 620;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'GoogleAuthPopup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = authUrl;
    } else {
      setGoogleLoading(false);
    }
  };

  // Automatically close modal if user is already authenticated, or reset form fields when opening
  useEffect(() => {
    if (isOpen) {
      if (localStorage.getItem('df_token')) {
        onClose();
        return;
      }
      resetForm();
    }
  }, [isOpen, onClose]);

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
    setGoogleLoading(false);
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      if (mode === 'signup') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const res = await fetch(`${API_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, type: 'signup' }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({ message: `Server error (${res.status})` }));
        if (!res.ok) throw new Error(data.message || 'Failed to send OTP to Gmail');

        setError('');
        setOtpTargetEmail(cleanEmail);
        setOtpOrigin('signup');
        setOtpValues(['', '', '', '', '', '']);
        setResendTimer(30);
        setMode('otp');
        setSuccessMsg(`A 6-digit OTP code has been sent to ${cleanEmail}`);
      } else if (mode === 'login') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const res = await fetch(`${API_URL}/api/auth/login-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: formData.password }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({ message: `Server error (${res.status})` }));
        if (!res.ok) throw new Error(data.message || 'Login failed');

        if (res.ok || data.success || data.requireOtp) {
          setError('');
          setOtpTargetEmail(data.email || cleanEmail);
          setOtpOrigin('login');
          setOtpValues(['', '', '', '', '', '']);
          setResendTimer(30);
          setMode('otp');
          setSuccessMsg(data.message || `Credentials verified! A 6-digit OTP code has been sent to ${cleanEmail}`);
        } else {
          throw new Error(data.message || 'Login pre-check failed');
        }
      } else if (mode === 'forgot') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const res = await fetch(`${API_URL}/api/auth/forgot-password-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, newPassword: formData.newPassword }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({ message: `Server error (${res.status})` }));
        if (!res.ok) throw new Error(data.message || 'Failed to process request');

        setError('');
        setOtpTargetEmail(cleanEmail);
        setOtpOrigin('forgot');
        setOtpValues(['', '', '', '', '', '']);
        setResendTimer(30);
        setMode('otp');
        setSuccessMsg(`A 6-digit OTP code has been sent to ${cleanEmail}`);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your internet connection or backend server.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
      setError('Please enter full 6-digit OTP code');
      return;
    }

    setLoading(true);

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
        handleAuthComplete(data);
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
        handleAuthComplete(data);
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
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

            {/* MODE 1: OTP VERIFICATION VIEW */}
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

            /* MODE 2: FORGOT PASSWORD VIEW */
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

                {/* GOOGLE SIGN IN / SIGN UP BUTTON */}
                <div style={{ margin: '0.25rem 0 0 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '0.65rem 0', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      OR
                    </span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading || googleLoading}
                    style={{
                      width: '100%',
                      height: '44px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      opacity: (loading || googleLoading) ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && !googleLoading) {
                        e.currentTarget.style.borderColor = '#4285F4';
                        e.currentTarget.style.boxShadow = '0 3px 12px rgba(66, 133, 244, 0.15)';
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && !googleLoading) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                        e.currentTarget.style.background = '#ffffff';
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>
                      {googleLoading
                        ? 'Connecting to Google...'
                        : mode === 'signup'
                        ? 'Sign up with Google'
                        : 'Sign in with Google'}
                    </span>
                  </button>
                </div>
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