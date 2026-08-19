import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Bell,
  Zap,
  Tag,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { API_URL } from '../../api';
import { clearCache } from '../../utils/cache';
import ToastNotification from '../ToastNotification';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminReturns from './AdminReturns';
import AdminBilling from './AdminBilling';
import AdminNotifications from './AdminNotifications';
import AdminLiveSale from './AdminLiveSale';
import AdminCoupons from './AdminCoupons';
import AdminReports from './AdminReports';
import AdminHeroBanners from './AdminHeroBanners';
import AdminFlashSale from './AdminFlashSale';

const AdminPanel = ({ onExitAdmin }) => {
  const getInitialAdminTab = () => {
    const hash = window.location.hash.replace('#admin-', '').replace('#', '').trim();
    const validTabs = ['dashboard', 'products', 'categories', 'orders', 'returns', 'billing', 'notifications', 'live-sale', 'flash-sale', 'hero-banners', 'coupons', 'reports'];
    if (validTabs.includes(hash)) return hash;
    const saved = localStorage.getItem('df_admin_tab');
    if (saved && validTabs.includes(saved)) return saved;
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialAdminTab);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('df_admin_tab', tab);
    try {
      window.history.replaceState(null, '', `/admin#admin-${tab}`);
    } catch (e) {}
  };

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

  // Real-Time Notification State
  const [realtimeToast, setRealtimeToast] = useState(null);
  const [realtimeOrderUpdate, setRealtimeOrderUpdate] = useState(null);

  // REAL-TIME SSE (SERVER-SENT EVENTS) ORDER LISTENER
  useEffect(() => {
    if (!adminUser) return;

    let eventSource = null;
    try {
      eventSource = new EventSource(`${API_URL}/api/admin/order-stream`);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'new_order') {
            // Trigger floating Toast alert
            setRealtimeToast(data);
            setRealtimeOrderUpdate(data.order || data);

            // Invalidate caches so order lists and dashboard refresh cleanly
            clearCache('admin_orders');
            clearCache('admin_analytics');
            clearCache('admin_billing');

            // Play notification sound
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
              osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
              gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.35);
            } catch (err) {}
          }
        } catch (err) {}
      };

      eventSource.onerror = (err) => {
        if (eventSource) {
          eventSource.close();
        }
      };
    } catch (err) {
      console.warn('SSE Connection Warning:', err.message);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [adminUser]);

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
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f8fafc' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header Banner with Brand Logo & Shield Badge */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #701a75 100%)', padding: '2.5rem 1.5rem 2rem 1.5rem', textAlign: 'center', color: 'white', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
              <img
                src="/logo.jpg"
                alt="Dipto Fashion Logo"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-6px', background: '#c026d3', color: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                <ShieldAlert size={14} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              Dipto Fashion
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#f5d0fe', opacity: 0.9, marginTop: '0.25rem' }}>
              Admin Portal & Store Management Console
            </p>
          </div>

          <div style={{ padding: '1.75rem 1.5rem 2rem 1.5rem' }}>
            {authError && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 0.85rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} /> {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Admin Email ID or Ph Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="admin@diptofashion.in or phone"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 1rem 0 2.6rem',
                      fontSize: '0.95rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Admin Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 2.6rem 0 2.6rem',
                      fontSize: '0.95rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
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
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary blink-green"
                style={{
                  width: '100%',
                  height: '48px',
                  justify: 'center',
                  marginTop: '0.35rem',
                  fontSize: '1rem',
                  fontWeight: '800',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? 'Authenticating Admin Portal...' : 'Access Admin Dashboard'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={onExitAdmin}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
              >
                ← Return to Dipto Fashion Storefront
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ padding: '1rem 1.5rem' }}>
      {/* Sleek Admin Top Header Navbar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #701a75 100%)',
          padding: '0.85rem 1.35rem',
          borderRadius: '14px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/logo.jpg"
            alt="Dipto Fashion"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '1.5px solid rgba(255,255,255,0.4)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.2px' }}>
                Dipto Fashion
              </h2>
              <span style={{ fontSize: '0.7rem', background: '#c026d3', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Admin Console
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#f5d0fe', opacity: 0.9, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
              Live Store Stream • Logged in as: <strong>{adminUser.email}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons: Storefront Link & Admin Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={onExitAdmin}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease'
            }}
          >
            <Store size={16} />
            <span>Storefront</span>
          </button>
          <button
            onClick={handleAdminLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease'
            }}
            title="Admin Logout"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar: Strict 5 Columns Layout per Row */}
      <div className="admin-action-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: activeTab === 'dashboard' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'dashboard' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'dashboard' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'dashboard' ? '800' : '600'
          }}
        >
          <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
          <span>Dashboard</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
          style={{
            background: activeTab === 'products' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'products' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'products' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'products' ? '800' : '600'
          }}
        >
          <ShoppingBag size={18} style={{ flexShrink: 0 }} />
          <span>Product Management</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
          style={{
            background: activeTab === 'categories' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'categories' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'categories' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'categories' ? '800' : '600'
          }}
        >
          <Layers size={18} style={{ flexShrink: 0 }} />
          <span>Categories</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'orders' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'orders' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'orders' ? '800' : '600'
          }}
        >
          <ClipboardList size={18} style={{ flexShrink: 0 }} />
          <span>Orders</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
          style={{
            background: activeTab === 'returns' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'returns' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'returns' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'returns' ? '800' : '600'
          }}
        >
          <RotateCcw size={18} style={{ flexShrink: 0 }} />
          <span>Returns & Refunds</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
          style={{
            background: activeTab === 'billing' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'billing' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'billing' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'billing' ? '800' : '600'
          }}
        >
          <Receipt size={18} style={{ flexShrink: 0 }} />
          <span>Billing History</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          style={{
            background: activeTab === 'notifications' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'notifications' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'notifications' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'notifications' ? '800' : '600'
          }}
        >
          <Bell size={18} style={{ flexShrink: 0 }} />
          <span>Send Notification</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'live-sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('live-sale')}
          style={{
            background: activeTab === 'live-sale' ? '#fff7ed' : '#ffffff',
            borderColor: activeTab === 'live-sale' ? '#ea580c' : '#cbd5e1',
            color: activeTab === 'live-sale' ? '#ea580c' : '#475569',
            fontWeight: activeTab === 'live-sale' ? '800' : '600'
          }}
        >
          <Zap size={18} style={{ flexShrink: 0 }} />
          <span>Live Sale Banner</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'flash-sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('flash-sale')}
          style={{
            background: activeTab === 'flash-sale' ? '#fff7ed' : '#ffffff',
            borderColor: activeTab === 'flash-sale' ? '#ea580c' : '#cbd5e1',
            color: activeTab === 'flash-sale' ? '#ea580c' : '#475569',
            fontWeight: activeTab === 'flash-sale' ? '800' : '600'
          }}
        >
          <Zap size={18} style={{ flexShrink: 0 }} />
          <span>Flash Sale</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'hero-banners' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero-banners')}
          style={{
            background: activeTab === 'hero-banners' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'hero-banners' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'hero-banners' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'hero-banners' ? '800' : '600'
          }}
        >
          <ImageIcon size={18} style={{ flexShrink: 0 }} />
          <span>Hero Banners</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
          style={{
            background: activeTab === 'coupons' ? '#fdf4ff' : '#ffffff',
            borderColor: activeTab === 'coupons' ? '#c026d3' : '#cbd5e1',
            color: activeTab === 'coupons' ? '#c026d3' : '#475569',
            fontWeight: activeTab === 'coupons' ? '800' : '600'
          }}
        >
          <Tag size={18} style={{ flexShrink: 0 }} />
          <span>Coupons & Offers</span>
        </button>
        <button
          className={`admin-nav-btn btn-outline w-full min-h-[64px] flex items-center justify-center gap-2.5 text-center p-3.5 ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
          style={{
            background: activeTab === 'reports' ? '#fff7ed' : '#ffffff',
            borderColor: activeTab === 'reports' ? '#ea580c' : '#cbd5e1',
            color: activeTab === 'reports' ? '#ea580c' : '#475569',
            fontWeight: activeTab === 'reports' ? '800' : '600'
          }}
        >
          <HelpCircle size={18} style={{ flexShrink: 0 }} />
          <span>User Reports & Support</span>
        </button>
      </div>

      {/* Real-time Order Arrival Toast Notification */}
      <ToastNotification toast={realtimeToast} onClose={() => setRealtimeToast(null)} />

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <AdminDashboard
          onNavigateToOrders={() => setActiveTab('orders')}
          onNavigateToReturns={() => setActiveTab('returns')}
          realtimeOrderUpdate={realtimeOrderUpdate}
        />
      )}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'categories' && <AdminCategories />}
      {activeTab === 'orders' && <AdminOrders realtimeOrderUpdate={realtimeOrderUpdate} />}
      {activeTab === 'returns' && <AdminReturns />}
      {activeTab === 'billing' && <AdminBilling />}
      {activeTab === 'notifications' && <AdminNotifications />}
      {activeTab === 'live-sale' && <AdminLiveSale />}
      {activeTab === 'flash-sale' && <AdminFlashSale />}
      {activeTab === 'hero-banners' && <AdminHeroBanners />}
      {activeTab === 'coupons' && <AdminCoupons />}
      {activeTab === 'reports' && <AdminReports />}
    </div>
  );
};

export default AdminPanel;
