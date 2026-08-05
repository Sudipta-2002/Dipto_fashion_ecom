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
import AdminPanel from './components/Admin/AdminPanel';
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

  // Customer Cart State (Persistent across webpage refreshes)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('df_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

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
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setAllProducts(data);
    } catch (e) {
      console.error('Error loading all products:', e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?category=${encodeURIComponent(selectedCategory)}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
      if (selectedCategory === 'All' && !searchTerm.trim()) {
        setAllProducts(data);
      }
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  // Click Title or Catalogue Picture -> Open Full Product Details Modal
  const handleOpenProductDetail = (product) => {
    setSelectedProduct(product);
    updateProductHistory([product]);
    setIsDetailOpen(true);
  };

  // Related product click inside ProductDetailModal
  const handleSelectRelatedProduct = (product) => {
    setSelectedProduct(product);
    updateProductHistory([...productHistoryRef.current, product]);
    setIsDetailOpen(true);
  };

  // Requirement 3: Step-by-Step Back Navigation Handler
  const handleProductDetailBack = () => {
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
  };

  // Explicit close -> Go directly to storefront
  const handleCloseProductDetail = () => {
    updateProductHistory([]);
    setIsDetailOpen(false);
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
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                Loading Dipto Fashion Collection...
              </div>
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
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default App;
