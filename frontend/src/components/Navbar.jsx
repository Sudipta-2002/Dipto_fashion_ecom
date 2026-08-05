import React from 'react';
import { ShoppingBag, User, Bell } from 'lucide-react';
import ExpandableSearchBar from './ExpandableSearchBar';

const Navbar = ({
  searchTerm,
  setSearchTerm,
  cartItemsCount,
  onOpenCart,
  user,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  currentView,
  setCurrentView,
  categories = [],
  allProducts = [],
  onSelectProduct,
  unreadNotificationCount = 0,
  showNotificationBubble = false,
  latestNotificationTitle = '',
  onOpenNotifications
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', position: 'relative' }}>
        {/* Brand Logo & Name */}
        <div className="brand-logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }} onClick={() => setCurrentView('shop')}>
          <img
            src="/logo.jpg"
            alt="Dipto Fashion Logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span>Dipto Fashion</span>
        </div>

        {/* Customer Actions */}
        {currentView === 'shop' && (
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* STOREFRONT SEARCH ICON BESIDE LEFT SIDE OF CART */}
            <ExpandableSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categories={categories}
              allProducts={allProducts}
              onSelectProduct={onSelectProduct}
              expandedMaxWidth="min(560px, 75vw)"
            />

            <button className="cart-btn" onClick={onOpenCart}>
              <ShoppingBag size={19} />
              <span>Cart</span>
              {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            </button>

            {/* TOP-RIGHT STOREFRONT NOTIFICATION BELL ICON (REPLACES LOGOUT BUTTON) */}
            <div style={{ position: 'relative' }}>
              {/* PULSING POP-UP BUBBLE BADGE WHEN ADMIN SENDS A NEW ANNOUNCEMENT */}
              {showNotificationBubble && (
                <div
                  onClick={onOpenNotifications}
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: '0',
                    background: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)',
                    color: 'white',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(192, 38, 211, 0.4), 0 0 0 2px #ffffff',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    cursor: 'pointer',
                    animation: 'bounceBubble 1s infinite alternate ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>
                    ✨ New Announcement: "{latestNotificationTitle || 'Sale is Live!'}"
                  </span>
                  <div style={{ width: '8px', height: '8px', background: '#38bdf8', borderRadius: '50%' }} />
                </div>
              )}

              <button
                type="button"
                className="btn-outline"
                onClick={onOpenNotifications}
                title="View Store Notifications & Sales"
                style={{
                  position: 'relative',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: unreadNotificationCount > 0 ? '#c026d3' : '#cbd5e1',
                  background: unreadNotificationCount > 0 ? '#fdf4ff' : '#ffffff'
                }}
              >
                <Bell size={20} color={unreadNotificationCount > 0 ? '#c026d3' : '#475569'} />
                {unreadNotificationCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#dc2626',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: '900',
                      lineHeight: 1,
                      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                      border: '1.5px solid #ffffff'
                    }}
                  >
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Sign-In / Profile Account */}
            {user ? (
              <div
                onClick={onOpenProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  padding: '0.35rem 0.7rem 0.35rem 0.4rem',
                  borderRadius: '24px',
                  background: '#fdf4ff',
                  border: '1px solid #f5d0fe',
                  transition: 'all 0.2s ease'
                }}
                title="View Profile & Orders"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div style={{ textAlign: 'left' }} className="user-name-text">
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#c026d3', fontWeight: '700' }}>My Profile</div>
                </div>
              </div>
            ) : (
              <button className="btn-primary" onClick={onOpenAuth}>
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
