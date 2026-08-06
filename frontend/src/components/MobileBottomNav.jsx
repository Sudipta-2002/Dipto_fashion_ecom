import React from 'react';
import { Home, User, ShoppingCart } from 'lucide-react';

const MobileBottomNav = ({
  activeTab,
  onHomeClick,
  onAccountClick,
  onCartClick,
  cartCount = 0,
  isLoggedIn = false
}) => {
  return (
    <div className="mobile-bottom-nav">
      {/* 1. HOME OPTION */}
      <button
        type="button"
        className={`mobile-bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={onHomeClick}
        aria-label="Home"
      >
        <Home size={19} />
        <span>Home</span>
      </button>

      {/* 2. ACCOUNT OPTION */}
      <button
        type="button"
        className={`mobile-bottom-nav-item ${activeTab === 'account' ? 'active' : ''}`}
        onClick={onAccountClick}
        aria-label="Account"
      >
        <User size={19} />
        <span>{isLoggedIn ? 'Account' : 'Sign In'}</span>
      </button>

      {/* 3. CART OPTION */}
      <button
        type="button"
        className={`mobile-bottom-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={onCartClick}
        aria-label="Cart"
      >
        <ShoppingCart size={19} />
        {cartCount > 0 && (
          <span className="mobile-bottom-nav-badge">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
        <span>Cart</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
