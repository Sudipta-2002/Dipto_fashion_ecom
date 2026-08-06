import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CategorySidebar from './components/CategorySidebar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ImageLightboxModal from './components/ImageLightboxModal';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PaymentModal from './components/PaymentModal';
import UserProfileModal from './components/UserProfileModal';
import NotificationModal from './components/NotificationModal';
import LiveSaleBanner from './components/LiveSaleBanner';
import AdminPanel from './components/Admin/AdminPanel';
import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
import { fetchWithCache } from './utils/cache';
import { API_URL, apiFetch, parseResponseSafely } from './api';
import './App.css';

function App() {
  // Navigation / View State ('shop' or 'admin')
  const [currentView, setCurrentView] = useState('shop');

  // Check URL pathname for /admin or #/admin
  useEffect(() => {
    const handleLocation = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('shop');
      }
    };
    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  const setView = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  // Customer User State (Persistent Login)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('df_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Store Notifications & Real-Time SSE Listener
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    const saved = localStorage.getItem('df_read_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotificationBubble, setShowNotificationBubble] = useState(false);
  const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

  useEffect(() => {
    fetchNotifications();
    // Multi-device synchronization polling interval (12s)
    const interval = setInterval(fetchNotifications, 12000);
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data)) {
        setNotifications(data);
      } else {
        const saved = localStorage.getItem('df_local_notifications');
        if (saved) setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      const saved = localStorage.getItem('df_local_notifications');
      if (saved) setNotifications(JSON.parse(saved));
    }
  };

  // LOCAL ANNOUNCEMENT EVENT LISTENER FALLBACK
  useEffect(() => {
    const handleLocalNotif = (e) => {
      if (e.detail) {
        const newNotif = e.detail;
        setNotifications((prev) => [newNotif, ...prev.filter(n => n._id !== newNotif._id)]);
        setLatestNotificationTitle(newNotif.title);
        setShowNotificationBubble(true);
      }
    };
    window.addEventListener('df_new_notification', handleLocalNotif);
    return () => window.removeEventListener('df_new_notification', handleLocalNotif);
  }, []);

  // REAL-TIME SSE LISTENER FOR STORE ANNOUNCEMENTS
  useEffect(() => {
    let eventSource = null;
    let sseErrorCount = 0;
    try {
      eventSource = new EventSource(`${API_URL}/api/notifications/stream`);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'new_notification' && data.notification) {
            const newNotif = data.notification;
            setNotifications((prev) => [newNotif, ...prev.filter(n => n._id !== newNotif._id)]);
            setLatestNotificationTitle(newNotif.title);
            setShowNotificationBubble(true);

            // Chime audio alert for new announcement
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
              osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.3);
            } catch (err) {}
          }
        } catch (err) {}
      };

      eventSource.onerror = (err) => {
        sseErrorCount++;
        if (sseErrorCount > 2) {
          console.warn('Storefront notification stream offline. Closing SSE connection gracefully.');
          if (eventSource) eventSource.close();
        }
      };
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Persistent User / Guest ID for Notification readBy Tracking
  const currentUserId = user?._id || user?.id || (() => {
    try {
      let saved = localStorage.getItem('df_guest_id');
      if (!saved) {
        saved = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('df_guest_id', saved);
      }
      return saved;
    } catch (e) {
      return 'guest_user_1';
    }
  })();

  const unreadNotificationCount = notifications.filter(
    (n) => !readNotificationIds.includes(n._id) && (!Array.isArray(n.readBy) || !n.readBy.includes(currentUserId))
  ).length;

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    setShowNotificationBubble(false);
    // Automatically mark current notifications as viewed
    const allIds = notifications.map(n => n._id);
    const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(updatedRead);
    try {
      localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
    } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    const allIds = notifications.map(n => n._id);
    setReadNotificationIds(allIds);
    setShowNotificationBubble(false);
    try {
      localStorage.setItem('df_read_notifications', JSON.stringify(allIds));
    } catch (e) {}

    notifications.forEach(async (n) => {
      try {
        await apiFetch(`/api/notifications/${n._id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId })
        });
      } catch (e) {}
    });
  };

  const handleMarkSingleAsRead = async (id) => {
    if (!readNotificationIds.includes(id)) {
      const updated = [...readNotificationIds, id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('df_read_notifications', JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
    } catch (e) {}
  };

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Selected Product History
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [productHistory, setProductHistory] = useState([]);
  const productHistoryRef = useRef([]);

  const updateProductHistory = (newHistory) => {
    productHistoryRef.current = newHistory;
    setProductHistory(newHistory);
  };
  const [lightboxProduct, setLightboxProduct] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Customer Cart & Coupon State (Persistent across webpage refreshes)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('df_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('df_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart items:', e);
    }
  }, [cartItems]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  // Customer Wishlist State (Persistent)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('df_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('df_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = (prod) => {
    if (!prod) return;
    const prodId = prod._id || prod.id;
    setWishlist((prev) => {
      const exists = prev.some((item) => (item._id || item.id) === prodId);
      if (exists) {
        return prev.filter((item) => (item._id || item.id) !== prodId);
      } else {
        return [...prev, prod];
      }
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const { data } = await fetchWithCache('categories', async () => {
        const res = await fetch(`${API_URL}/api/categories`);
        return await res.json();
      });
      if (data) setCategories(data);
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const { data } = await fetchWithCache('all_products', async () => {
        const res = await fetch(`${API_URL}/api/products`);
        return await res.json();
      });
      if (data) setAllProducts(data);
    } catch (e) {
      console.error('Error loading all products:', e);
    }
  };

  const fetchProducts = async (forceRefresh = false) => {
    const cacheKey = `products_${selectedCategory}_${searchTerm.trim()}`;
    
    // Check if we have cached data to prevent flash loading spinner
    const { data: cachedData, isCached } = await fetchWithCache(
      cacheKey,
      async () => {
        let url = `${API_URL}/api/products?category=${encodeURIComponent(selectedCategory)}`;
        if (searchTerm.trim()) {
          url += `&search=${encodeURIComponent(searchTerm.trim())}`;
        }
        const res = await fetch(url);
        return await res.json();
      },
      { forceRefresh }
    );

    if (cachedData) {
      setProducts(cachedData);
      setLoading(false);
      if (selectedCategory === 'All' && !searchTerm.trim()) {
        setAllProducts(cachedData);
      }
    } else {
      setLoading(true);
    }
  };

  // Restore opened Product Detail Page if page was refreshed
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/#product=([^&]+)/);
    const savedProdId = match ? match[1] : sessionStorage.getItem('df_opened_product_id');

    if (savedProdId && (allProducts.length > 0 || products.length > 0)) {
      const pool = allProducts.length > 0 ? allProducts : products;
      const found = pool.find((p) => String(p._id || p.id) === String(savedProdId));
      if (found) {
        setSelectedProduct(found);
        updateProductHistory([found]);
        setIsDetailOpen(true);
      }
    }
  }, [allProducts, products]);

  // Click Title or Catalogue Picture -> Open Full Product Details Modal
  const handleOpenProductDetail = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    setSelectedProduct(product);
    updateProductHistory([product]);
    setIsDetailOpen(true);
    sessionStorage.setItem('df_opened_product_id', prodId);
    try {
      window.history.replaceState(null, '', `#product=${prodId}`);
    } catch (e) {}
  };

  // Related product click inside ProductDetailModal
  const handleSelectRelatedProduct = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    setSelectedProduct(product);
    updateProductHistory([...productHistoryRef.current, product]);
    setIsDetailOpen(true);
    sessionStorage.setItem('df_opened_product_id', prodId);
    try {
      window.history.replaceState(null, '', `#product=${prodId}`);
    } catch (e) {}
  };

  // Requirement 3: Step-by-Step Back Navigation Handler
  const handleProductDetailBack = () => {
    if (productHistoryRef.current.length > 1) {
      const nextHistory = [...productHistoryRef.current];
      nextHistory.pop();
      const prevProduct = nextHistory[nextHistory.length - 1];
      const prodId = prevProduct._id || prevProduct.id;
      updateProductHistory(nextHistory);
      setSelectedProduct(prevProduct);
      sessionStorage.setItem('df_opened_product_id', prodId);
      try {
        window.history.replaceState(null, '', `#product=${prodId}`);
      } catch (e) {}
    } else {
      updateProductHistory([]);
      setIsDetailOpen(false);
      sessionStorage.removeItem('df_opened_product_id');
      try {
        window.history.replaceState(null, '', window.location.pathname.replace(/#.*$/, ''));
      } catch (e) {}
    }
  };

  // Explicit close -> Go directly to storefront
  const handleCloseProductDetail = () => {
    updateProductHistory([]);
    setIsDetailOpen(false);
    sessionStorage.removeItem('df_opened_product_id');
    try {
      window.history.replaceState(null, '', window.location.pathname.replace(/#.*$/, ''));
    } catch (e) {}
  };

  const handleOpenImageLightbox = (product) => {
    setSelectedProduct(product);
    updateProductHistory([product]);
    setIsDetailOpen(true);
  };

  // Cart Actions
  const handleAddToCart = (product) => {
    const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
      ? product.availableSizes
      : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

    // Case 1: Size has already been chosen (e.g. from ProductDetailModal)
    if (product.selectedSize) {
      setCartItems((prevItems) => {
        const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
        if (existing) {
          return prevItems.map((item) =>
            (item._id === product._id && item.selectedSize === product.selectedSize)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
      setIsCartOpen(true);
      return;
    }

    // Case 2: Product has size options but user clicked "Add to Cart" on Storefront without selecting a size first!
    if (sizesList.length > 0 && sizesList.length > 1) {
      // Force open Product Details modal to prompt mandatory size selection
      setSelectedProduct(product);
      setIsDetailOpen(true);
      return;
    }

    // Case 3: Single size (Free Size) or no size requirements
    const autoSize = sizesList[0] || 'Standard';
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
      if (existing) {
        return prevItems.map((item) =>
          (item._id === product._id && item.selectedSize === autoSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  const handleLogout = () => {
    localStorage.removeItem('df_token');
    localStorage.removeItem('df_user');
    setUser(null);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleProceedToPayment = (address) => {
    setDeliveryAddress(address);
    setIsCheckoutOpen(false);
    setIsPaymentOpen(true);
  };

  const handleBackToCheckout = () => {
    setIsPaymentOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleBackToCart = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(true);
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    try {
      sessionStorage.removeItem('df_cart');
      localStorage.removeItem('df_cart');
    } catch (e) {}
  };

  // Keyboard Escape & Browser Back Button (popstate) Handler for active modals
  useEffect(() => {
    const handlePopState = () => {
      if (isPaymentOpen) {
        setIsPaymentOpen(false);
        setIsCheckoutOpen(true);
      } else if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        setIsCartOpen(true);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isProfileOpen) {
        setIsProfileOpen(false);
      } else if (isDetailOpen) {
        if (productHistoryRef.current.length > 1) {
          const nextHistory = [...productHistoryRef.current];
          nextHistory.pop();
          const prevProduct = nextHistory[nextHistory.length - 1];
          updateProductHistory(nextHistory);
          setSelectedProduct(prevProduct);
        } else {
          updateProductHistory([]);
          setIsDetailOpen(false);
        }
      } else if (isLightboxOpen) {
        setIsLightboxOpen(false);
      } else if (isAuthOpen) {
        setIsAuthOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPaymentOpen) {
          setIsPaymentOpen(false);
        } else if (isCheckoutOpen) {
          setIsCheckoutOpen(false);
        } else if (isCartOpen) {
          setIsCartOpen(false);
        } else if (isProfileOpen) {
          setIsProfileOpen(false);
        } else if (isDetailOpen) {
          handleProductDetailBack();
        } else if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else if (isAuthOpen) {
          setIsAuthOpen(false);
        }
      }
    };

    if (isPaymentOpen || isCheckoutOpen || isCartOpen || isProfileOpen || isDetailOpen || isLightboxOpen || isAuthOpen) {
      window.history.pushState({ modalOpen: true }, '');
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaymentOpen, isCheckoutOpen, isCartOpen, isProfileOpen, isDetailOpen, isLightboxOpen, isAuthOpen, productHistory.length]);

  return (
    <div className="app-container">
      {/* Sticky Meesho-Style Live Sale Banner */}
      {currentView === 'shop' && (
        <LiveSaleBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />
      )}

      {/* Header / Navbar (User details isolated & hidden in admin mode) */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        user={currentView === 'admin' ? null : user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setView}
        categories={categories}
        allProducts={allProducts.length > 0 ? allProducts : products}
        onSelectProduct={handleOpenProductDetail}
        unreadNotificationCount={unreadNotificationCount}
        showNotificationBubble={showNotificationBubble}
        latestNotificationTitle={latestNotificationTitle}
        onOpenNotifications={handleOpenNotifications}
      />

      {/* Main View Switch */}
      {currentView === 'admin' ? (
        <AdminPanel onExitAdmin={() => setView('shop')} />
      ) : (
        <div className="main-layout">
          {/* Left Category Sidebar */}
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catName) => setSelectedCategory(catName)}
          />

          {/* Products Grid */}
          <main className="products-section">
            <h2>
              <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>
                ({products.length} products)
              </span>
            </h2>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3>No products found</h3>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                  Try selecting another category or clear your search query.
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => {
                  const isWishlisted = wishlist.some(w => (w._id || w.id) === (product._id || product.id));
                  return (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onClickProductTitle={handleOpenProductDetail}
                      onClickProductImage={handleOpenProductDetail}
                      isWishlisted={isWishlisted}
                      onToggleWishlist={handleToggleWishlist}
                      cartItems={cartItems}
                      onOpenCart={() => setIsCartOpen(true)}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={handleCloseProductDetail}
        onAddToCart={handleAddToCart}
        allProducts={allProducts.length > 0 ? allProducts : products}
        onSelectProduct={handleSelectRelatedProduct}
        isWishlisted={wishlist.some(w => (w._id || w.id) === (selectedProduct?._id || selectedProduct?.id))}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        historyLength={productHistory.length}
        onGoBack={handleProductDetailBack}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Direct Image Lightbox Modal */}
      <ImageLightboxModal
        product={lightboxProduct}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsDetailOpen(true);
        }}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onBackToCart={handleBackToCart}
        user={user}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onBackToCheckout={handleBackToCheckout}
        user={user}
        cartItems={cartItems}
        deliveryAddress={deliveryAddress}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Store Front Notification Drawer & Detail Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        readNotificationIds={readNotificationIds}
        currentUserId={currentUserId}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkSingleAsRead={handleMarkSingleAsRead}
        onNavigateToShop={() => setView('shop')}
      />
    </div>
  );
}

export default App;
