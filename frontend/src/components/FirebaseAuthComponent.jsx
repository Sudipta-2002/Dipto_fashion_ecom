// FirebaseAuthComponent.jsx
// NOTE: This component previously used Firebase Phone Auth (signInWithPhoneNumber + RecaptchaVerifier).
// Phone OTP is now handled by Fast2SMS via the backend routes:
//   POST /api/auth/send-otp   — sends OTP via Fast2SMS
//   POST /api/auth/verify-otp — verifies OTP server-side
// This standalone demo component is kept for reference but is not used in the main auth flow.
// The main auth modal (AuthModal.jsx) has already been fully migrated.

import React, { useState, useEffect } from 'react';
import { Phone, Lock, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';
import { API_URL } from '../api';

const Fast2SMSAuthComponent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullPhone, setFullPhone] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Timer countdown for resend OTP
  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  // 1. Send OTP via Fast2SMS backend
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    const rawNumber = phoneNumber.trim().replace(/\D/g, '');
    if (!rawNumber || rawNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }

    // Build full E.164 phone
    const formatted = rawNumber.length === 10 ? `+91${rawNumber}` : `+${rawNumber}`;
    setFullPhone(formatted);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setOtpSent(true);
      setResendTimer(30);
      setSuccess(`OTP sent successfully to ${formatted}!`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP via Fast2SMS backend
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp: cleanOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP code entered.');
      setSuccess(`Phone verified successfully! (${fullPhone})`);
    } catch (err) {
      setError(err.message || 'Invalid OTP code entered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', width: '100%', margin: '2rem auto', padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
          {otpSent ? <KeyRound size={26} /> : <Phone size={26} />}
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          {otpSent ? 'Enter Verification Code' : 'Phone Verification'}
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
          {otpSent
            ? `Enter the 6-digit OTP sent to ${fullPhone}`
            : 'Enter your 10-digit mobile number (+91 will be auto-appended)'}
        </p>
      </div>

      {/* Error Feedback */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Success Feedback */}
      {success && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', padding: '0.75rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {!otpSent ? (
        /* PHONE NUMBER INPUT FORM */
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Mobile Phone Number *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ padding: '0 0.85rem', height: '46px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', color: '#475569' }}>
                +91 🇮🇳
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{ width: '100%', height: '46px', padding: '0 1rem 0 2.5rem', fontSize: '0.92rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{ width: '100%', height: '46px', background: 'linear-gradient(135deg, #c026d3, #9333ea)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}
            disabled={loading}
          >
            {loading ? 'SENDING OTP...' : 'SEND OTP'} <ArrowRight size={16} />
          </button>
        </form>
      ) : (
        /* OTP VERIFICATION FORM */
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              6-Digit OTP Code *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ width: '100%', height: '46px', padding: '0 1rem 0 2.5rem', fontSize: '1rem', letterSpacing: '2px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                required
              />
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            {resendTimer > 0 ? (
              <span style={{ color: '#64748b' }}>Resend in <strong style={{ color: '#c026d3' }}>{resendTimer}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                style={{ background: 'none', border: 'none', color: '#c026d3', fontWeight: '800', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Resend OTP
              </button>
            )}
            <button
              type="button"
              onClick={() => { setOtpSent(false); setError(''); setSuccess(''); setOtpCode(''); }}
              style={{ background: 'none', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Change Phone Number
            </button>
          </div>

          <button
            type="submit"
            style={{ width: '100%', height: '46px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'VERIFY OTP'} <CheckCircle2 size={16} />
          </button>
        </form>
      )}
    </div>
  );
};

export default Fast2SMSAuthComponent;
