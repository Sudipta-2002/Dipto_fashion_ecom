import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ClipboardList,
  Store,
  Lock,
  Mail,
  LogOut,
  ShieldAlert,
  RotateCcw,
  Receipt,
  Eye,
  EyeOff
} from 'lucide-react';
import { API_URL } from '../../api';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminReturns from './AdminReturns';
import AdminBilling from './AdminBilling';

const AdminPanel = ({ onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Admin Auth State (Check persistent login)
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('df_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('df_admin_token', data.token);
      localStorage.setItem('df_admin_user', JSON.stringify(data.admin));
      setAdminUser(data.admin);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('df_admin_token');
    localStorage.removeItem('df_admin_user');
    setAdminUser(null);
  };

  if (!adminUser) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Header Banner with Logo */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #701a75 100%)', padding: '2.5rem 1.5rem', textAlign: 'center', color: 'white' }}>
            <img
              src="/logo.jpg"
              alt="Dipto Fashion"
              style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', margin: '0 auto 0.85rem', border: '2px solid rgba(255,255,255,0.3)' }}
              onError={(e) => (e.target.style.display = 'none')}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Admin Portal Login</h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>Dipto Fashion Management Console</p>
          </div>

          <div style={{ padding: '1.75rem' }}>
            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} /> {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Admin Email ID or Ph Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Email ID or Ph Number"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
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
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={onExitAdmin}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
              >
                ← Return to Storefront
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="Dipto Fashion" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => (e.target.style.display = 'none')} />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#c026d3' }}>Dipto Fashion Admin Panel</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Logged in as: <strong>{adminUser.email}</strong></p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={onExitAdmin}>
            <Store size={18} />
            <span>Storefront</span>
          </button>
          <button className="btn-outline" onClick={handleAdminLogout} style={{ color: '#ef4444', borderColor: '#fca5a5' }} title="Admin Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`btn-outline ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          style={{ background: activeTab === 'dashboard' ? '#fdf4ff' : 'white', borderColor: activeTab === 'dashboard' ? '#c026d3' : '#cbd5e1', color: activeTab === 'dashboard' ? '#c026d3' : '#475569' }}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button
          className={`btn-outline ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
          style={{ background: activeTab === 'products' ? '#fdf4ff' : 'white', borderColor: activeTab === 'products' ? '#c026d3' : '#cbd5e1', color: activeTab === 'products' ? '#c026d3' : '#475569' }}
        >
          <ShoppingBag size={18} /> Product Management
        </button>
        <button
          className={`btn-outline ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
          style={{ background: activeTab === 'categories' ? '#fdf4ff' : 'white', borderColor: activeTab === 'categories' ? '#c026d3' : '#cbd5e1', color: activeTab === 'categories' ? '#c026d3' : '#475569' }}
        >
          <Layers size={18} /> Categories
        </button>
        <button
          className={`btn-outline ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{ background: activeTab === 'orders' ? '#fdf4ff' : 'white', borderColor: activeTab === 'orders' ? '#c026d3' : '#cbd5e1', color: activeTab === 'orders' ? '#c026d3' : '#475569' }}
        >
          <ClipboardList size={18} /> Orders
        </button>
        <button
          className={`btn-outline ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
          style={{ background: activeTab === 'returns' ? '#fdf4ff' : 'white', borderColor: activeTab === 'returns' ? '#c026d3' : '#cbd5e1', color: activeTab === 'returns' ? '#c026d3' : '#475569' }}
        >
          <RotateCcw size={18} /> Returns & Refunds
        </button>
        <button
          className={`btn-outline ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
          style={{ background: activeTab === 'billing' ? '#fdf4ff' : 'white', borderColor: activeTab === 'billing' ? '#c026d3' : '#cbd5e1', color: activeTab === 'billing' ? '#c026d3' : '#475569' }}
        >
          <Receipt size={18} /> Billing History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <AdminDashboard
          onNavigateToOrders={() => setActiveTab('orders')}
          onNavigateToReturns={() => setActiveTab('returns')}
        />
      )}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'categories' && <AdminCategories />}
      {activeTab === 'orders' && <AdminOrders />}
      {activeTab === 'returns' && <AdminReturns />}
      {activeTab === 'billing' && <AdminBilling />}
    </div>
  );
};

export default AdminPanel;
