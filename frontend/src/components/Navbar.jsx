import React from 'react';
import { ShoppingBag, User, LogOut } from 'lucide-react';
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
  onSelectProduct
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

            {/* User Sign-In / Profile Account */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                <button
                  className="btn-outline"
                  onClick={onLogout}
                  title="Log Out"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={16} />
                </button>
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
