import React, { useState } from 'react';
import { User, Lock, Mail, Phone, X, Globe, Eye, EyeOff } from 'lucide-react';

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

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isLogin ? 'Sign In to Dipto Fashion' : 'Create an Account'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ borderColor: fieldErrors.name ? '#ef4444' : '' }}
                />
                {fieldErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>{fieldErrors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label>{isLogin ? 'Email ID or Mobile Number *' : 'Email Address *'}</label>
              <input
                type="text"
                name="email"
                placeholder="Email ID or Ph Number"
                value={formData.email}
                onChange={handleChange}
                style={{ borderColor: fieldErrors.email ? '#ef4444' : '' }}
              />
              {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password (Min. 8 characters) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ borderColor: fieldErrors.password ? '#ef4444' : '', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>{fieldErrors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Mobile Phone Number</label>
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
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ flex: 1, borderColor: fieldErrors.phone ? '#ef4444' : '' }}
                  />
                </div>
                {fieldErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>{fieldErrors.phone}</span>}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }} disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              style={{ color: '#c026d3', fontWeight: '700', cursor: 'pointer' }}
              onClick={() => { setIsLogin(!isLogin); setError(''); setFieldErrors({}); }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
