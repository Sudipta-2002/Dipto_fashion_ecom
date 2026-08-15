








// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import Navbar from './components/Navbar';
// import CategorySidebar from './components/CategorySidebar';
// import ProductCard from './components/ProductCard';
// import ProductDetailModal from './components/ProductDetailModal';
// import ImageLightboxModal from './components/ImageLightboxModal';
// import AuthModal from './components/AuthModal';
// import CartDrawer from './components/CartDrawer';
// import CheckoutModal from './components/CheckoutModal';
// import PaymentModal from './components/PaymentModal';
// import UserProfileModal from './components/UserProfileModal';
// import NotificationModal from './components/NotificationModal';
// import LiveSaleBanner from './components/LiveSaleBanner';
// import AdminPanel from './components/Admin/AdminPanel';
// import MobileBottomNav from './components/MobileBottomNav';
// import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// import ProductFilterModal from './components/ProductFilterModal';
// import Footer from './components/Footer';
// import AboutUsModal from './components/AboutUsModal';
// import TermsPrivacyModal from './components/TermsPrivacyModal';
// import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// import { fetchWithCache } from './utils/cache';
// import { API_URL, apiFetch, parseResponseSafely } from './api';
// import { useSocket } from './context/SocketContext.jsx';
// import './App.css';

// function App() {
//   const [currentView, setCurrentView] = useState('shop');

//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
//   const [isTermsOpen, setIsTermsOpen] = useState(false);
//   const [termsTab, setTermsTab] = useState('privacy');
//   const [notifications, setNotifications] = useState([]);
//   const [readNotificationIds, setReadNotificationIds] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_read_notifications');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });
//   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
//   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [productHistory, setProductHistory] = useState([]);
//   const productHistoryRef = useRef([]);

//   const updateProductHistory = (newHistory) => {
//     productHistoryRef.current = newHistory;
//     setProductHistory(newHistory);
//   };
//   const [lightboxProduct, setLightboxProduct] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem('df_cart');
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');

//   const [products, setProducts] = useState(() => {
//     try {
//       const cached = localStorage.getItem('df_storefront_products');
//       return cached ? JSON.parse(cached) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const productsRef = useRef(products);
//   productsRef.current = products;

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

//   // ============================================================
//   // UNIFIED STACK-BASED HISTORY CONTROLLER (FULL BACK/FORWARD)
//   // ============================================================
//   const closeAllModals = useCallback(() => {
//     setIsCartOpen(false);
//     setIsProfileOpen(false);
//     setIsAuthOpen(false);
//     setIsDetailOpen(false);
//     setIsLightboxOpen(false);
//     setIsCheckoutOpen(false);
//     setIsPaymentOpen(false);
//     setIsNotificationsOpen(false);
//     setIsFilterModalOpen(false);
//     setIsAboutUsOpen(false);
//     setIsTermsOpen(false);
//   }, []);

//   const applyNavigationState = useCallback((state) => {
//     if (!state) {
//       closeAllModals();
//       setCurrentView(window.location.pathname === '/admin' ? 'admin' : 'shop');
//       return;
//     }

//     if (state.view) {
//       setCurrentView(state.view);
//     } else {
//       setCurrentView(window.location.pathname === '/admin' ? 'admin' : 'shop');
//     }

//     closeAllModals();

//     if (state.modal === 'cart') {
//       setIsCartOpen(true);
//     } else if (state.modal === 'profile') {
//       setIsProfileOpen(true);
//     } else if (state.modal === 'auth') {
//       setIsAuthOpen(true);
//     } else if (state.modal === 'detail') {
//       if (state.product) {
//         setSelectedProduct(state.product);
//       } else if (state.productId) {
//         const found = productsRef.current.find(p => String(p._id || p.id) === String(state.productId));
//         if (found) setSelectedProduct(found);
//       }
//       setIsDetailOpen(true);
//     } else if (state.modal === 'lightbox') {
//       if (state.product) setLightboxProduct(state.product);
//       setIsLightboxOpen(true);
//     } else if (state.modal === 'checkout') {
//       setIsCheckoutOpen(true);
//     } else if (state.modal === 'payment') {
//       if (state.deliveryAddress) setDeliveryAddress(state.deliveryAddress);
//       setIsPaymentOpen(true);
//     } else if (state.modal === 'notifications') {
//       setIsNotificationsOpen(true);
//     } else if (state.modal === 'filter') {
//       setIsFilterModalOpen(true);
//     } else if (state.modal === 'about') {
//       setIsAboutUsOpen(true);
//     } else if (state.modal === 'terms') {
//       if (state.termsTab) setTermsTab(state.termsTab);
//       setIsTermsOpen(true);
//     }
//   }, [closeAllModals]);

//   const navigateTo = useCallback((modalName, extraData = {}) => {
//     const statePayload = {
//       modal: modalName,
//       view: currentView,
//       ...extraData
//     };
//     try {
//       window.history.pushState(statePayload, '', window.location.href);
//     } catch (e) {}
//     applyNavigationState(statePayload);
//   }, [currentView, applyNavigationState]);

//   useEffect(() => {
//     if (!window.history.state) {
//       window.history.replaceState(
//         { modal: null, view: window.location.pathname === '/admin' ? 'admin' : 'shop' },
//         '',
//         window.location.href
//       );
//     }

//     const handlePopState = (e) => {
//       applyNavigationState(e.state);
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         window.history.back();
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [applyNavigationState]);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ modal: null, view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     }
//   };

//   const openCartModal = () => navigateTo('cart');
//   const openProfileModal = () => navigateTo('profile');
//   const openAuthModal = () => navigateTo('auth');
//   const openFilterModal = () => navigateTo('filter');
//   const openAboutUsModal = () => navigateTo('about');
//   const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

//   const openNotificationsModal = () => {
//     setShowNotificationBubble(false);
//     const allIds = notifications.map(n => n._id);
//     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updatedRead);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
//     } catch (e) {}
//     navigateTo('notifications');
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await fetchWithCache('categories', async () => {
//         const res = await fetch(`${API_URL}/api/categories`);
//         return await res.json();
//       });
//       if (data) setCategories(data);
//     } catch (e) {
//       console.error('Error loading categories:', e);
//     }
//   };

//   const fetchProducts = async (pageNum = 1, forceRefresh = false) => {
//     if (isFetchingRef.current && !forceRefresh) return;
//     isFetchingRef.current = true;

//     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
//     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

//     try {
//       if (products.length === 0) setLoading(true);
//       setApiError(null);

//       const params = new URLSearchParams();
//       if (sanitizedCat) params.append('category', sanitizedCat);
//       if (searchTerm.trim()) params.append('search', searchTerm.trim());
//       params.append('page', pageNum);
//       params.append('limit', 20);

//       const { data: rawResponse } = await fetchWithCache(
//         cacheKey,
//         async () => {
//           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
//           if (!res.ok) throw new Error(`Server status ${res.status}`);
//           return await res.json();
//         },
//         { forceRefresh }
//       );

//       let fetchedProducts = [];
//       let totalPagesVal = 1;
//       let totalProductsVal = 0;

//       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse.products || [];
//         totalPagesVal = rawResponse.totalPages || 1;
//         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
//       } else if (Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse;
//         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
//         totalProductsVal = fetchedProducts.length;
//       }

//       setProducts(fetchedProducts);
//       setTotalPages(totalPagesVal);
//       setTotalProductsCount(totalProductsVal);
//       setPage(pageNum);

//       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
//         try {
//           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
//         } catch (e) {}
//       }
//     } catch (e) {
//       console.error('Error fetching products:', e);
//       if (products.length === 0) {
//         setApiError('Unable to load products. Please check your connection.');
//       }
//     } finally {
//       setLoading(false);
//       isFetchingRef.current = false;
//     }
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage === page || newPage < 1 || newPage > totalPages) return;
//     setPage(newPage);
//     fetchProducts(newPage);

//     // 1. Instant top scroll for window, html, and body
//     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

//     // 2. Scroll catalogRef to ensure products section top is reached
//     if (catalogRef.current) {
//       catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }

//     // 3. Post-render safeguard (handles DOM height changes after new products load)
//     setTimeout(() => {
//       window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//       if (catalogRef.current) {
//         catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     }, 150);
//   };

//   const DEFAULT_FILTERS = {
//     category: 'All',
//     presetPrice: 'all',
//     minPrice: '',
//     maxPrice: '',
//     minDiscount: 0,
//     minRating: 0,
//     inStockOnly: false
//   };

//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
//     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
//     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
//     if (appliedFilters.minDiscount > 0) count++;
//     if (appliedFilters.minRating > 0) count++;
//     if (appliedFilters.inStockOnly) count++;
//     return count;
//   }, [appliedFilters]);

//   const displayedProducts = useMemo(() => {
//     let list = Array.isArray(products) ? products : [];

//     if (selectedCategory && selectedCategory !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
//     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
//     }

//     if (searchTerm.trim()) {
//       const q = searchTerm.trim().toLowerCase();
//       list = list.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(q) ||
//           p.category?.toLowerCase().includes(q) ||
//           p.description?.toLowerCase().includes(q)
//       );
//     }

//     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
//       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
//     }
//     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
//       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
//     }

//     if (appliedFilters.presetPrice === 'under500') {
//       list = list.filter((p) => Number(p.price) < 500);
//     } else if (appliedFilters.presetPrice === '500-1000') {
//       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
//     } else if (appliedFilters.presetPrice === '1000-2000') {
//       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
//     } else if (appliedFilters.presetPrice === 'above2000') {
//       list = list.filter((p) => Number(p.price) > 2000);
//     }

//     if (appliedFilters.minDiscount > 0) {
//       list = list.filter((p) => {
//         if (!p.mrp || p.mrp <= p.price) return false;
//         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
//         return disc >= appliedFilters.minDiscount;
//       });
//     }

//     if (appliedFilters.minRating > 0) {
//       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
//     }

//     if (appliedFilters.inStockOnly) {
//       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
//     }

//     return list;
//   }, [products, selectedCategory, searchTerm, appliedFilters]);

//   // Wishlist State Setup
//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const handleToggleWishlist = (prod) => {
//     if (!prod) return;
//     const prodId = typeof prod === 'string' ? prod : (prod._id || prod.id);
    
//     setWishlist((prev) => {
//       const prevList = Array.isArray(prev) ? prev : [];
//       const exists = prevList.some((item) => {
//         const id = typeof item === 'string' ? item : (item?._id || item?.id);
//         return String(id) === String(prodId);
//       });

//       let updated;
//       if (exists) {
//         updated = prevList.filter((item) => {
//           const id = typeof item === 'string' ? item : (item?._id || item?.id);
//           return String(id) !== String(prodId);
//         });
//       } else {
//         updated = [...prevList, prod];
//       }

//       try {
//         localStorage.setItem('df_wishlist', JSON.stringify(updated));
//       } catch (e) {}

//       return updated;
//     });
//   };

//   const handleOpenProductDetail = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([...productHistoryRef.current, product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleProductDetailBack = () => {
//     window.history.back();
//   };

//   const handleCloseProductDetail = () => {
//     window.history.back();
//   };

//   const handleAddToCart = (product) => {
//     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//     if (remStock <= 0) {
//       alert('Out of Stock - Cannot add to cart!');
//       return;
//     }

//     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//       ? product.availableSizes
//       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//     if (product.selectedSize) {
//       setCartItems((prevItems) => {
//         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
//         if (existing) {
//           return prevItems.map((item) =>
//             (item._id === product._id && item.selectedSize === product.selectedSize)
//               ? { ...item, quantity: item.quantity + 1 }
//               : item
//           );
//         }
//         return [...prevItems, { ...product, quantity: 1 }];
//       });
//       openCartModal();
//       return;
//     }

//     if (sizesList.length > 1) {
//       handleOpenProductDetail(product);
//       return;
//     }

//     const autoSize = sizesList[0] || 'Standard';
//     setCartItems((prevItems) => {
//       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
//       if (existing) {
//         if (existing.quantity >= remStock) {
//           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
//           return prevItems;
//         }
//         return prevItems.map((item) =>
//           (item._id === product._id && item.selectedSize === autoSize)
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
//     });
//     openCartModal();
//   };

//   const handleUpdateQuantity = (productId, newQty) => {
//     if (newQty <= 0) {
//       setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//       return;
//     }
//     const cartItem = cartItems.find((item) => item._id === productId);
//     if (cartItem) {
//       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
//       if (newQty > remStock) {
//         alert(`Only ${remStock} item(s) available in stock!`);
//         return;
//       }
//     }
//     setCartItems((prevItems) =>
//       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
//     );
//   };

//   const handleRemoveFromCart = (productId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('df_token');
//     localStorage.removeItem('df_user');
//     setUser(null);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     setPage(1);
//     fetchProducts(1, false);
//   }, [selectedCategory, searchTerm]);

//   return (
//     <div className="app-container">
//       {currentView === 'shop' && (
//         <LiveSaleBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />
//       )}

//       <Navbar
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
//         onOpenCart={openCartModal}
//         user={currentView === 'admin' ? null : user}
//         onOpenAuth={openAuthModal}
//         onOpenProfile={openProfileModal}
//         onLogout={handleLogout}
//         currentView={currentView}
//         setCurrentView={setView}
//         categories={categories}
//         allProducts={products}
//         onSelectProduct={handleOpenProductDetail}
//         unreadNotificationCount={notifications.length}
//         showNotificationBubble={showNotificationBubble}
//         latestNotificationTitle={latestNotificationTitle}
//         onOpenNotifications={openNotificationsModal}
//         activeFilterCount={activeFilterCount}
//         onOpenFilterModal={openFilterModal}
//       />

//       {currentView === 'admin' ? (
//         <AdminPanel onExitAdmin={() => setView('shop')} />
//       ) : (
//         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
//           <div className="main-layout" style={{ flex: '1 0 auto' }}>
//             <CategorySidebar
//               categories={categories}
//               selectedCategory={selectedCategory}
//               onSelectCategory={(catName) => setSelectedCategory(catName)}
//             />

//             <main ref={catalogRef} className="products-section">
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
//                 <h2>
//                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
//                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
//                     ({displayedProducts.length} products)
//                   </span>
//                 </h2>

//                 <button
//                   type="button"
//                   onClick={openFilterModal}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
//                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
//                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
//                     padding: '0.45rem 0.85rem',
//                     borderRadius: '10px',
//                     fontWeight: '700',
//                     fontSize: '0.82rem',
//                     cursor: 'pointer',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//                   }}
//                 >
//                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
//                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
//                 </button>
//               </div>

//               {activeFilterCount > 0 && (
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.5rem',
//                     flexWrap: 'wrap',
//                     background: '#fdf4ff',
//                     border: '1.5px solid #f0abfc',
//                     padding: '0.65rem 0.85rem',
//                     borderRadius: '12px',
//                     marginBottom: '1.25rem'
//                   }}
//                 >
//                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                     <Filter size={14} /> Active Filters:
//                   </span>

//                   {appliedFilters.category && appliedFilters.category !== 'All' && (
//                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
//                       Category: {appliedFilters.category}
//                     </span>
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
//                     style={{
//                       background: '#fef2f2',
//                       border: '1px solid #fca5a5',
//                       color: '#dc2626',
//                       padding: '2px 8px',
//                       borderRadius: '14px',
//                       fontSize: '0.75rem',
//                       fontWeight: '800',
//                       cursor: 'pointer',
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       gap: '3px',
//                       marginLeft: 'auto'
//                     }}
//                   >
//                     <RotateCcw size={12} /> Clear All
//                   </button>
//                 </div>
//               )}

//               {apiError ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
//                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
//                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
//                   <button
//                     type="button"
//                     onClick={() => fetchProducts(1, true)}
//                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
//                   >
//                     Retry Loading
//                   </button>
//                 </div>
//               ) : loading && products.length === 0 ? (
//                 <ProductGridSkeleton count={8} />
//               ) : displayedProducts.length === 0 ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
//                   <h3>No matching products found</h3>
//                 </div>
//               ) : (
//                 <>
//                   <div className="product-grid">
//                     {displayedProducts.map((product) => {
//                       const isWishlisted = wishlist.some(w => String(w._id || w.id || w) === String(product._id || product.id));
//                       return (
//                         <ProductCard
//                           key={product._id || product.id}
//                           product={product}
//                           onAddToCart={handleAddToCart}
//                           onClickProductTitle={handleOpenProductDetail}
//                           onClickProductImage={handleOpenProductDetail}
//                           isWishlisted={isWishlisted}
//                           onToggleWishlist={handleToggleWishlist}
//                           cartItems={cartItems}
//                           onOpenCart={openCartModal}
//                         />
//                       );
//                     })}
//                   </div>

//                   {totalPages > 1 && (
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <button
//                           type="button"
//                           disabled={page <= 1 || loading}
//                           onClick={() => handlePageChange(page - 1)}
//                           style={{
//                             padding: '10px 22px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
//                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
//                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
//                             border: '1px solid #e4e4e7',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           « Previous
//                         </button>

//                         <button
//                           type="button"
//                           disabled={page >= totalPages || loading}
//                           onClick={() => handlePageChange(page + 1)}
//                           style={{
//                             padding: '10px 24px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
//                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
//                             color: '#ffffff',
//                             border: 'none',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           Next »
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </main>
//           </div>

//           <Footer
//             onOpenAboutUs={openAboutUsModal}
//             onOpenTermsPrivacy={openTermsModal}
//           />
//         </div>
//       )}

//       {/* MODALS */}
//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isDetailOpen}
//         onClose={handleCloseProductDetail}
//         onAddToCart={handleAddToCart}
//         allProducts={products}
//         onSelectProduct={handleSelectRelatedProduct}
//         isWishlisted={wishlist.some(w => String(w._id || w.id || w) === String(selectedProduct?._id || selectedProduct?.id))}
//         onToggleWishlist={handleToggleWishlist}
//         wishlist={wishlist}
//         historyLength={productHistory.length}
//         onGoBack={handleProductDetailBack}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <ImageLightboxModal
//         product={lightboxProduct}
//         isOpen={isLightboxOpen}
//         onClose={() => window.history.back()}
//       />

//       <AuthModal
//         isOpen={isAuthOpen}
//         onClose={() => window.history.back()}
//         onAuthSuccess={(userData) => setUser(userData)}
//       />

//       <UserProfileModal
//         isOpen={isProfileOpen}
//         onClose={() => window.history.back()}
//         user={user}
//         onLogout={handleLogout}
//         onUpdateUser={(updatedUser) => {
//           const merged = { ...user, ...updatedUser };
//           setUser(merged);
//           try {
//             localStorage.setItem('df_user', JSON.stringify(merged));
//           } catch (e) {}
//         }}
//         wishlist={wishlist}
//         allProducts={products}
//         onToggleWishlist={handleToggleWishlist}
//         onSelectProduct={(p) => {
//           handleOpenProductDetail(p);
//         }}
//         onAddToCart={handleAddToCart}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={() => window.history.back()}
//         cartItems={cartItems}
//         onUpdateQuantity={handleUpdateQuantity}
//         onRemoveItem={handleRemoveFromCart}
//         onProceedToCheckout={() => {
//           navigateTo('checkout');
//         }}
//         user={user}
//         onOpenAuth={openAuthModal}
//         appliedCoupon={appliedCoupon}
//         setAppliedCoupon={setAppliedCoupon}
//       />

//       <CheckoutModal
//         isOpen={isCheckoutOpen}
//         onClose={() => window.history.back()}
//         onBackToCart={() => window.history.back()}
//         user={user}
//         onProceedToPayment={(addr) => {
//           setDeliveryAddress(addr);
//           navigateTo('payment', { deliveryAddress: addr });
//         }}
//       />

//       <PaymentModal
//         isOpen={isPaymentOpen}
//         onClose={() => window.history.back()}
//         onBackToCheckout={() => window.history.back()}
//         user={user}
//         cartItems={cartItems}
//         deliveryAddress={deliveryAddress}
//         appliedCoupon={appliedCoupon}
//         onOrderSuccess={() => {
//           setCartItems([]);
//           setAppliedCoupon(null);
//           closeAllModals();
//           navigateTo(null);
//           try { localStorage.removeItem('df_cart'); } catch (e) {}
//         }}
//       />

//       <NotificationModal
//         isOpen={isNotificationsOpen}
//         onClose={() => window.history.back()}
//         notifications={notifications}
//         readNotificationIds={readNotificationIds}
//         currentUserId={user?._id || user?.id || 'guest'}
//         onMarkAllAsRead={() => {}}
//         onMarkSingleAsRead={() => {}}
//         onNavigateToShop={() => setView('shop')}
//       />

//       {currentView === 'shop' && (
//         <MobileBottomNav
//           activeTab={
//             (isCartOpen || isCheckoutOpen || isPaymentOpen)
//               ? 'cart'
//               : (isProfileOpen || isAuthOpen)
//               ? 'account'
//               : 'home'
//           }
//           onHomeClick={() => {
//             if (isCartOpen || isProfileOpen || isAuthOpen || isDetailOpen || isCheckoutOpen || isPaymentOpen) {
//               navigateTo(null);
//             }
//             setSelectedCategory('All');
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//           }}
//           onAccountClick={() => {
//             if (user) openProfileModal();
//             else openAuthModal();
//           }}
//           onCartClick={openCartModal}
//           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
//           isLoggedIn={Boolean(user)}
//         />
//       )}

//       <ProductFilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => window.history.back()}
//         categories={categories}
//         allProducts={products}
//         currentFilters={appliedFilters}
//         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
//         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
//       />

//       <AboutUsModal
//         isOpen={isAboutUsOpen}
//         onClose={() => window.history.back()}
//       />

//       <TermsPrivacyModal
//         isOpen={isTermsOpen}
//         onClose={() => window.history.back()}
//         initialTab={termsTab}
//       />
//     </div>
//   );
// }

// export default App;














// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import Navbar from './components/Navbar';
// import CategorySidebar from './components/CategorySidebar';
// import ProductCard from './components/ProductCard';
// import ProductDetailModal from './components/ProductDetailModal';
// import ImageLightboxModal from './components/ImageLightboxModal';
// import AuthModal from './components/AuthModal';
// import CartDrawer from './components/CartDrawer';
// import CheckoutModal from './components/CheckoutModal';
// import PaymentModal from './components/PaymentModal';
// import UserProfileModal from './components/UserProfileModal';
// import NotificationModal from './components/NotificationModal';
// import LiveSaleBanner from './components/LiveSaleBanner';
// import AdminPanel from './components/Admin/AdminPanel';
// import MobileBottomNav from './components/MobileBottomNav';
// import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// import ProductFilterModal from './components/ProductFilterModal';
// import Footer from './components/Footer';
// import AboutUsModal from './components/AboutUsModal';
// import TermsPrivacyModal from './components/TermsPrivacyModal';
// import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// import { fetchWithCache } from './utils/cache';
// import { API_URL, apiFetch, parseResponseSafely } from './api';
// import { useSocket } from './context/SocketContext.jsx';
// import './App.css';

// function App() {
//   const [currentView, setCurrentView] = useState('shop');

//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
//   const [isTermsOpen, setIsTermsOpen] = useState(false);
//   const [termsTab, setTermsTab] = useState('privacy');
//   const [notifications, setNotifications] = useState([]);
//   const [readNotificationIds, setReadNotificationIds] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_read_notifications');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });
//   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
//   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [productHistory, setProductHistory] = useState([]);
//   const productHistoryRef = useRef([]);

//   const updateProductHistory = (newHistory) => {
//     productHistoryRef.current = newHistory;
//     setProductHistory(newHistory);
//   };
//   const [lightboxProduct, setLightboxProduct] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem('df_cart');
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

//   const [categories, setCategories] = useState([]);

//   // Read initial Page and Category from URL / Storage for refresh persistence
//   const getInitialParams = () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const p = parseInt(urlParams.get('page')) || parseInt(sessionStorage.getItem('df_page')) || 1;
//     const cat = urlParams.get('cat') || sessionStorage.getItem('df_selected_cat') || 'All';
//     return { page: p, cat };
//   };

//   const initialValues = getInitialParams();
//   const [selectedCategory, setSelectedCategory] = useState(initialValues.cat);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [products, setProducts] = useState(() => {
//     try {
//       const cached = localStorage.getItem('df_storefront_products');
//       return cached ? JSON.parse(cached) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const productsRef = useRef(products);
//   productsRef.current = products;

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(initialValues.page);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

//   // Sync URL Params on category/page change for refresh persistence
//   const updateUrlParams = (pageNum, catName) => {
//     try {
//       const url = new URL(window.location.href);
//       if (pageNum > 1) url.searchParams.set('page', pageNum);
//       else url.searchParams.delete('page');

//       if (catName && catName !== 'All') url.searchParams.set('cat', catName);
//       else url.searchParams.delete('cat');

//       sessionStorage.setItem('df_page', pageNum);
//       sessionStorage.setItem('df_selected_cat', catName);

//       window.history.replaceState(window.history.state, '', url.toString());
//     } catch (e) {}
//   };

//   // ============================================================
//   // UNIFIED STACK-BASED HISTORY CONTROLLER (FULL BACK/FORWARD)
//   // ============================================================
//   const closeAllModals = useCallback(() => {
//     setIsCartOpen(false);
//     setIsProfileOpen(false);
//     setIsAuthOpen(false);
//     setIsDetailOpen(false);
//     setIsLightboxOpen(false);
//     setIsCheckoutOpen(false);
//     setIsPaymentOpen(false);
//     setIsNotificationsOpen(false);
//     setIsFilterModalOpen(false);
//     setIsAboutUsOpen(false);
//     setIsTermsOpen(false);
//     sessionStorage.removeItem('df_active_modal');
//   }, []);

//   const applyNavigationState = useCallback((state) => {
//     if (!state || !state.modal) {
//       closeAllModals();
//       setCurrentView(window.location.pathname === '/admin' ? 'admin' : 'shop');
//       return;
//     }

//     if (state.view) {
//       setCurrentView(state.view);
//     } else {
//       setCurrentView(window.location.pathname === '/admin' ? 'admin' : 'shop');
//     }

//     closeAllModals();
//     sessionStorage.setItem('df_active_modal', state.modal);

//     if (state.modal === 'cart') {
//       setIsCartOpen(true);
//     } else if (state.modal === 'profile') {
//       setIsProfileOpen(true);
//     } else if (state.modal === 'auth') {
//       setIsAuthOpen(true);
//     } else if (state.modal === 'detail') {
//       if (state.product) {
//         setSelectedProduct(state.product);
//       } else if (state.productId) {
//         const found = productsRef.current.find(p => String(p._id || p.id) === String(state.productId));
//         if (found) setSelectedProduct(found);
//       }
//       setIsDetailOpen(true);
//     } else if (state.modal === 'lightbox') {
//       if (state.product) setLightboxProduct(state.product);
//       setIsLightboxOpen(true);
//     } else if (state.modal === 'checkout') {
//       setIsCheckoutOpen(true);
//     } else if (state.modal === 'payment') {
//       if (state.deliveryAddress) setDeliveryAddress(state.deliveryAddress);
//       setIsPaymentOpen(true);
//     } else if (state.modal === 'notifications') {
//       setIsNotificationsOpen(true);
//     } else if (state.modal === 'filter') {
//       setIsFilterModalOpen(true);
//     } else if (state.modal === 'about') {
//       setIsAboutUsOpen(true);
//     } else if (state.modal === 'terms') {
//       if (state.termsTab) setTermsTab(state.termsTab);
//       setIsTermsOpen(true);
//     }
//   }, [closeAllModals]);

//   const navigateTo = useCallback((modalName, extraData = {}) => {
//     const statePayload = {
//       modal: modalName,
//       view: currentView,
//       ...extraData
//     };
//     try {
//       window.history.pushState(statePayload, '', window.location.href);
//     } catch (e) {}
//     applyNavigationState(statePayload);
//   }, [currentView, applyNavigationState]);

//   // Direct Close to Home (Clears modal stack directly)
//   const closeToHome = useCallback(() => {
//     closeAllModals();
//     try {
//       window.history.pushState({ modal: null, view: 'shop' }, '', window.location.pathname + window.location.search);
//     } catch (e) {}
//   }, [closeAllModals]);

//   // Re-hydrate state on page refresh
//   useEffect(() => {
//     const savedModal = window.history.state?.modal || sessionStorage.getItem('df_active_modal');
//     if (savedModal) {
//       applyNavigationState(window.history.state || { modal: savedModal, view: 'shop' });
//     } else if (!window.history.state) {
//       window.history.replaceState(
//         { modal: null, view: window.location.pathname === '/admin' ? 'admin' : 'shop' },
//         '',
//         window.location.href
//       );
//     }

//     const handlePopState = (e) => {
//       applyNavigationState(e.state);
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         window.history.back();
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [applyNavigationState]);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ modal: null, view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     }
//   };

//   const openCartModal = () => navigateTo('cart');
//   const openProfileModal = () => navigateTo('profile');
//   const openAuthModal = () => navigateTo('auth');
//   const openFilterModal = () => navigateTo('filter');
//   const openAboutUsModal = () => navigateTo('about');
//   const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

//   const openNotificationsModal = () => {
//     setShowNotificationBubble(false);
//     const allIds = notifications.map(n => n._id);
//     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updatedRead);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
//     } catch (e) {}
//     navigateTo('notifications');
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await fetchWithCache('categories', async () => {
//         const res = await fetch(`${API_URL}/api/categories`);
//         return await res.json();
//       });
//       if (data) setCategories(data);
//     } catch (e) {
//       console.error('Error loading categories:', e);
//     }
//   };

//   const fetchProducts = async (pageNum = page, forceRefresh = false) => {
//     if (isFetchingRef.current && !forceRefresh) return;
//     isFetchingRef.current = true;

//     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
//     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

//     try {
//       if (products.length === 0) setLoading(true);
//       setApiError(null);

//       const params = new URLSearchParams();
//       if (sanitizedCat) params.append('category', sanitizedCat);
//       if (searchTerm.trim()) params.append('search', searchTerm.trim());
//       params.append('page', pageNum);
//       params.append('limit', 20);

//       const { data: rawResponse } = await fetchWithCache(
//         cacheKey,
//         async () => {
//           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
//           if (!res.ok) throw new Error(`Server status ${res.status}`);
//           return await res.json();
//         },
//         { forceRefresh }
//       );

//       let fetchedProducts = [];
//       let totalPagesVal = 1;
//       let totalProductsVal = 0;

//       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse.products || [];
//         totalPagesVal = rawResponse.totalPages || 1;
//         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
//       } else if (Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse;
//         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
//         totalProductsVal = fetchedProducts.length;
//       }

//       setProducts(fetchedProducts);
//       setTotalPages(totalPagesVal);
//       setTotalProductsCount(totalProductsVal);
//       setPage(pageNum);
//       updateUrlParams(pageNum, selectedCategory);

//       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
//         try {
//           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
//         } catch (e) {}
//       }
//     } catch (e) {
//       console.error('Error fetching products:', e);
//       if (products.length === 0) {
//         setApiError('Unable to load products. Please check your connection.');
//       }
//     } finally {
//       setLoading(false);
//       isFetchingRef.current = false;
//     }
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage === page || newPage < 1 || newPage > totalPages) return;
//     setPage(newPage);
//     fetchProducts(newPage);
//     updateUrlParams(newPage, selectedCategory);

//     // 1. Instant top scroll for window, html, and body
//     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

//     // 2. Scroll catalogRef to ensure products section top is reached
//     if (catalogRef.current) {
//       catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }

//     // 3. Post-render safeguard (handles DOM height changes after new products load)
//     setTimeout(() => {
//       window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//       if (catalogRef.current) {
//         catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     }, 150);
//   };

//   const DEFAULT_FILTERS = {
//     category: 'All',
//     presetPrice: 'all',
//     minPrice: '',
//     maxPrice: '',
//     minDiscount: 0,
//     minRating: 0,
//     inStockOnly: false
//   };

//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
//     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
//     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
//     if (appliedFilters.minDiscount > 0) count++;
//     if (appliedFilters.minRating > 0) count++;
//     if (appliedFilters.inStockOnly) count++;
//     return count;
//   }, [appliedFilters]);

//   const displayedProducts = useMemo(() => {
//     let list = Array.isArray(products) ? products : [];

//     if (selectedCategory && selectedCategory !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
//     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
//     }

//     if (searchTerm.trim()) {
//       const q = searchTerm.trim().toLowerCase();
//       list = list.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(q) ||
//           p.category?.toLowerCase().includes(q) ||
//           p.description?.toLowerCase().includes(q)
//       );
//     }

//     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
//       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
//     }
//     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
//       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
//     }

//     if (appliedFilters.presetPrice === 'under500') {
//       list = list.filter((p) => Number(p.price) < 500);
//     } else if (appliedFilters.presetPrice === '500-1000') {
//       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
//     } else if (appliedFilters.presetPrice === '1000-2000') {
//       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
//     } else if (appliedFilters.presetPrice === 'above2000') {
//       list = list.filter((p) => Number(p.price) > 2000);
//     }

//     if (appliedFilters.minDiscount > 0) {
//       list = list.filter((p) => {
//         if (!p.mrp || p.mrp <= p.price) return false;
//         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
//         return disc >= appliedFilters.minDiscount;
//       });
//     }

//     if (appliedFilters.minRating > 0) {
//       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
//     }

//     if (appliedFilters.inStockOnly) {
//       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
//     }

//     return list;
//   }, [products, selectedCategory, searchTerm, appliedFilters]);

//   // Wishlist State Setup
//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const handleToggleWishlist = (prod) => {
//     if (!prod) return;
//     const prodId = typeof prod === 'string' ? prod : (prod._id || prod.id);
    
//     setWishlist((prev) => {
//       const prevList = Array.isArray(prev) ? prev : [];
//       const exists = prevList.some((item) => {
//         const id = typeof item === 'string' ? item : (item?._id || item?.id);
//         return String(id) === String(prodId);
//       });

//       let updated;
//       if (exists) {
//         updated = prevList.filter((item) => {
//           const id = typeof item === 'string' ? item : (item?._id || item?.id);
//           return String(id) !== String(prodId);
//         });
//       } else {
//         updated = [...prevList, prod];
//       }

//       try {
//         localStorage.setItem('df_wishlist', JSON.stringify(updated));
//       } catch (e) {}

//       return updated;
//     });
//   };

//   const handleOpenProductDetail = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([...productHistoryRef.current, product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleProductDetailBack = () => {
//     window.history.back();
//   };

//   const handleCloseProductDetail = () => {
//     window.history.back();
//   };

//   const handleAddToCart = (product) => {
//     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//     if (remStock <= 0) {
//       alert('Out of Stock - Cannot add to cart!');
//       return;
//     }

//     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//       ? product.availableSizes
//       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//     if (product.selectedSize) {
//       setCartItems((prevItems) => {
//         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
//         if (existing) {
//           return prevItems.map((item) =>
//             (item._id === product._id && item.selectedSize === product.selectedSize)
//               ? { ...item, quantity: item.quantity + 1 }
//               : item
//           );
//         }
//         return [...prevItems, { ...product, quantity: 1 }];
//       });
//       openCartModal();
//       return;
//     }

//     if (sizesList.length > 1) {
//       handleOpenProductDetail(product);
//       return;
//     }

//     const autoSize = sizesList[0] || 'Standard';
//     setCartItems((prevItems) => {
//       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
//       if (existing) {
//         if (existing.quantity >= remStock) {
//           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
//           return prevItems;
//         }
//         return prevItems.map((item) =>
//           (item._id === product._id && item.selectedSize === autoSize)
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
//     });
//     openCartModal();
//   };

//   const handleUpdateQuantity = (productId, newQty) => {
//     if (newQty <= 0) {
//       setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//       return;
//     }
//     const cartItem = cartItems.find((item) => item._id === productId);
//     if (cartItem) {
//       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
//       if (newQty > remStock) {
//         alert(`Only ${remStock} item(s) available in stock!`);
//         return;
//       }
//     }
//     setCartItems((prevItems) =>
//       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
//     );
//   };

//   const handleRemoveFromCart = (productId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('df_token');
//     localStorage.removeItem('df_user');
//     setUser(null);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     fetchProducts(page, false);
//   }, [selectedCategory, searchTerm]);

//   return (
//     <div className="app-container">
//       {currentView === 'shop' && (
//         <LiveSaleBanner onSelectCategory={(cat) => {
//           setSelectedCategory(cat);
//           setPage(1);
//           updateUrlParams(1, cat);
//         }} />
//       )}

//       <Navbar
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
//         onOpenCart={openCartModal}
//         user={currentView === 'admin' ? null : user}
//         onOpenAuth={openAuthModal}
//         onOpenProfile={openProfileModal}
//         onLogout={handleLogout}
//         currentView={currentView}
//         setCurrentView={setView}
//         categories={categories}
//         allProducts={products}
//         onSelectProduct={handleOpenProductDetail}
//         unreadNotificationCount={notifications.length}
//         showNotificationBubble={showNotificationBubble}
//         latestNotificationTitle={latestNotificationTitle}
//         onOpenNotifications={openNotificationsModal}
//         activeFilterCount={activeFilterCount}
//         onOpenFilterModal={openFilterModal}
//       />

//       {currentView === 'admin' ? (
//         <AdminPanel onExitAdmin={() => setView('shop')} />
//       ) : (
//         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
//           <div className="main-layout" style={{ flex: '1 0 auto' }}>
//             <CategorySidebar
//               categories={categories}
//               selectedCategory={selectedCategory}
//               onSelectCategory={(catName) => {
//                 setSelectedCategory(catName);
//                 setPage(1);
//                 updateUrlParams(1, catName);
//               }}
//             />

//             <main ref={catalogRef} className="products-section">
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
//                 <h2>
//                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
//                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
//                     ({displayedProducts.length} products)
//                   </span>
//                 </h2>

//                 <button
//                   type="button"
//                   onClick={openFilterModal}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
//                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
//                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
//                     padding: '0.45rem 0.85rem',
//                     borderRadius: '10px',
//                     fontWeight: '700',
//                     fontSize: '0.82rem',
//                     cursor: 'pointer',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//                   }}
//                 >
//                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
//                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
//                 </button>
//               </div>

//               {activeFilterCount > 0 && (
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.5rem',
//                     flexWrap: 'wrap',
//                     background: '#fdf4ff',
//                     border: '1.5px solid #f0abfc',
//                     padding: '0.65rem 0.85rem',
//                     borderRadius: '12px',
//                     marginBottom: '1.25rem'
//                   }}
//                 >
//                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                     <Filter size={14} /> Active Filters:
//                   </span>

//                   {appliedFilters.category && appliedFilters.category !== 'All' && (
//                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
//                       Category: {appliedFilters.category}
//                     </span>
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
//                     style={{
//                       background: '#fef2f2',
//                       border: '1px solid #fca5a5',
//                       color: '#dc2626',
//                       padding: '2px 8px',
//                       borderRadius: '14px',
//                       fontSize: '0.75rem',
//                       fontWeight: '800',
//                       cursor: 'pointer',
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       gap: '3px',
//                       marginLeft: 'auto'
//                     }}
//                   >
//                     <RotateCcw size={12} /> Clear All
//                   </button>
//                 </div>
//               )}

//               {apiError ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
//                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
//                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
//                   <button
//                     type="button"
//                     onClick={() => fetchProducts(page, true)}
//                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
//                   >
//                     Retry Loading
//                   </button>
//                 </div>
//               ) : loading && products.length === 0 ? (
//                 <ProductGridSkeleton count={8} />
//               ) : displayedProducts.length === 0 ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
//                   <h3>No matching products found</h3>
//                 </div>
//               ) : (
//                 <>
//                   <div className="product-grid">
//                     {displayedProducts.map((product) => {
//                       const isWishlisted = wishlist.some(w => String(w._id || w.id || w) === String(product._id || product.id));
//                       return (
//                         <ProductCard
//                           key={product._id || product.id}
//                           product={product}
//                           onAddToCart={handleAddToCart}
//                           onClickProductTitle={handleOpenProductDetail}
//                           onClickProductImage={handleOpenProductDetail}
//                           isWishlisted={isWishlisted}
//                           onToggleWishlist={handleToggleWishlist}
//                           cartItems={cartItems}
//                           onOpenCart={openCartModal}
//                         />
//                       );
//                     })}
//                   </div>

//                   {totalPages > 1 && (
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <button
//                           type="button"
//                           disabled={page <= 1 || loading}
//                           onClick={() => handlePageChange(page - 1)}
//                           style={{
//                             padding: '10px 22px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
//                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
//                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
//                             border: '1px solid #e4e4e7',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           « Previous
//                         </button>

//                         <button
//                           type="button"
//                           disabled={page >= totalPages || loading}
//                           onClick={() => handlePageChange(page + 1)}
//                           style={{
//                             padding: '10px 24px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
//                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
//                             color: '#ffffff',
//                             border: 'none',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           Next »
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </main>
//           </div>

//           <Footer
//             onOpenAboutUs={openAboutUsModal}
//             onOpenTermsPrivacy={openTermsModal}
//           />
//         </div>
//       )}

//       {/* MODALS */}
//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isDetailOpen}
//         onClose={() => window.history.back()}
//         onAddToCart={handleAddToCart}
//         allProducts={products}
//         onSelectProduct={handleSelectRelatedProduct}
//         isWishlisted={wishlist.some(w => String(w._id || w.id || w) === String(selectedProduct?._id || selectedProduct?.id))}
//         onToggleWishlist={handleToggleWishlist}
//         wishlist={wishlist}
//         historyLength={productHistory.length}
//         onGoBack={handleProductDetailBack}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <ImageLightboxModal
//         product={lightboxProduct}
//         isOpen={isLightboxOpen}
//         onClose={() => window.history.back()}
//       />

//       <AuthModal
//         isOpen={isAuthOpen}
//         onClose={() => window.history.back()}
//         onAuthSuccess={(userData) => setUser(userData)}
//       />

//       {/* USER PROFILE MODAL - Closes directly to Home when clicking (X) */}
//       <UserProfileModal
//         isOpen={isProfileOpen}
//         onClose={closeToHome}
//         user={user}
//         onLogout={handleLogout}
//         onUpdateUser={(updatedUser) => {
//           const merged = { ...user, ...updatedUser };
//           setUser(merged);
//           try {
//             localStorage.setItem('df_user', JSON.stringify(merged));
//           } catch (e) {}
//         }}
//         wishlist={wishlist}
//         allProducts={products}
//         onToggleWishlist={handleToggleWishlist}
//         onSelectProduct={(p) => {
//           handleOpenProductDetail(p);
//         }}
//         onAddToCart={handleAddToCart}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={() => window.history.back()}
//         cartItems={cartItems}
//         onUpdateQuantity={handleUpdateQuantity}
//         onRemoveItem={handleRemoveFromCart}
//         onProceedToCheckout={() => {
//           navigateTo('checkout');
//         }}
//         user={user}
//         onOpenAuth={openAuthModal}
//         appliedCoupon={appliedCoupon}
//         setAppliedCoupon={setAppliedCoupon}
//       />

//       <CheckoutModal
//         isOpen={isCheckoutOpen}
//         onClose={() => window.history.back()}
//         onBackToCart={() => window.history.back()}
//         user={user}
//         onProceedToPayment={(addr) => {
//           setDeliveryAddress(addr);
//           navigateTo('payment', { deliveryAddress: addr });
//         }}
//       />

//       <PaymentModal
//         isOpen={isPaymentOpen}
//         onClose={() => window.history.back()}
//         onBackToCheckout={() => window.history.back()}
//         user={user}
//         cartItems={cartItems}
//         deliveryAddress={deliveryAddress}
//         appliedCoupon={appliedCoupon}
//         onOrderSuccess={() => {
//           setCartItems([]);
//           setAppliedCoupon(null);
//           closeToHome();
//           try { localStorage.removeItem('df_cart'); } catch (e) {}
//         }}
//       />

//       <NotificationModal
//         isOpen={isNotificationsOpen}
//         onClose={() => window.history.back()}
//         notifications={notifications}
//         readNotificationIds={readNotificationIds}
//         currentUserId={user?._id || user?.id || 'guest'}
//         onMarkAllAsRead={() => {}}
//         onMarkSingleAsRead={() => {}}
//         onNavigateToShop={() => setView('shop')}
//       />

//       {currentView === 'shop' && (
//         <MobileBottomNav
//           activeTab={
//             (isCartOpen || isCheckoutOpen || isPaymentOpen)
//               ? 'cart'
//               : (isProfileOpen || isAuthOpen)
//               ? 'account'
//               : 'home'
//           }
//           onHomeClick={() => {
//             if (isCartOpen || isProfileOpen || isAuthOpen || isDetailOpen || isCheckoutOpen || isPaymentOpen) {
//               closeToHome();
//             }
//             setSelectedCategory('All');
//             setPage(1);
//             updateUrlParams(1, 'All');
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//           }}
//           onAccountClick={() => {
//             if (user) openProfileModal();
//             else openAuthModal();
//           }}
//           onCartClick={openCartModal}
//           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
//           isLoggedIn={Boolean(user)}
//         />
//       )}

//       <ProductFilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => window.history.back()}
//         categories={categories}
//         allProducts={products}
//         currentFilters={appliedFilters}
//         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
//         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
//       />

//       <AboutUsModal
//         isOpen={isAboutUsOpen}
//         onClose={() => window.history.back()}
//       />

//       <TermsPrivacyModal
//         isOpen={isTermsOpen}
//         onClose={() => window.history.back()}
//         initialTab={termsTab}
//       />
//     </div>
//   );
// }

// export default App;










// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import Navbar from './components/Navbar';
// import CategorySidebar from './components/CategorySidebar';
// import ProductCard from './components/ProductCard';
// import ProductDetailModal from './components/ProductDetailModal';
// import ImageLightboxModal from './components/ImageLightboxModal';
// import AuthModal from './components/AuthModal';
// import CartDrawer from './components/CartDrawer';
// import CheckoutModal from './components/CheckoutModal';
// import PaymentModal from './components/PaymentModal';
// import UserProfileModal from './components/UserProfileModal';
// import NotificationModal from './components/NotificationModal';
// import LiveSaleBanner from './components/LiveSaleBanner';
// import AdminPanel from './components/Admin/AdminPanel';
// import MobileBottomNav from './components/MobileBottomNav';
// import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// import ProductFilterModal from './components/ProductFilterModal';
// import Footer from './components/Footer';
// import AboutUsModal from './components/AboutUsModal';
// import TermsPrivacyModal from './components/TermsPrivacyModal';
// import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// import { fetchWithCache } from './utils/cache';
// import { API_URL, apiFetch, parseResponseSafely } from './api';
// import { useSocket } from './context/SocketContext.jsx';
// import './App.css';

// function App() {
//   // Direct detection from URL path or hash on initial load
//   const [currentView, setCurrentView] = useState(() => {
//     if (typeof window !== 'undefined') {
//       const path = window.location.pathname.toLowerCase();
//       const hash = window.location.hash.toLowerCase();
//       if (path === '/admin' || path.startsWith('/admin') || hash === '#/admin') {
//         return 'admin';
//       }
//     }
//     return 'shop';
//   });

//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
//   const [isTermsOpen, setIsTermsOpen] = useState(false);
//   const [termsTab, setTermsTab] = useState('privacy');
//   const [notifications, setNotifications] = useState([]);
//   const [readNotificationIds, setReadNotificationIds] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_read_notifications');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });
//   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
//   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [productHistory, setProductHistory] = useState([]);
//   const productHistoryRef = useRef([]);

//   const updateProductHistory = (newHistory) => {
//     productHistoryRef.current = newHistory;
//     setProductHistory(newHistory);
//   };
//   const [lightboxProduct, setLightboxProduct] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem('df_cart');
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

//   const [categories, setCategories] = useState([]);

//   // Read initial Page and Category from URL / Storage for refresh persistence
//   const getInitialParams = () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const p = parseInt(urlParams.get('page')) || parseInt(sessionStorage.getItem('df_page')) || 1;
//     const cat = urlParams.get('cat') || sessionStorage.getItem('df_selected_cat') || 'All';
//     return { page: p, cat };
//   };

//   const initialValues = getInitialParams();
//   const [selectedCategory, setSelectedCategory] = useState(initialValues.cat);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [products, setProducts] = useState(() => {
//     try {
//       const cached = localStorage.getItem('df_storefront_products');
//       return cached ? JSON.parse(cached) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const productsRef = useRef(products);
//   productsRef.current = products;

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(initialValues.page);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

//   // Sync URL Params on category/page change for refresh persistence
//   const updateUrlParams = (pageNum, catName) => {
//     try {
//       const url = new URL(window.location.href);
//       if (pageNum > 1) url.searchParams.set('page', pageNum);
//       else url.searchParams.delete('page');

//       if (catName && catName !== 'All') url.searchParams.set('cat', catName);
//       else url.searchParams.delete('cat');

//       sessionStorage.setItem('df_page', pageNum);
//       sessionStorage.setItem('df_selected_cat', catName);

//       window.history.replaceState(window.history.state, '', url.toString());
//     } catch (e) {}
//   };

//   // ============================================================
//   // UNIFIED STACK-BASED HISTORY CONTROLLER (FULL BACK/FORWARD)
//   // ============================================================
//   const closeAllModals = useCallback(() => {
//     setIsCartOpen(false);
//     setIsProfileOpen(false);
//     setIsAuthOpen(false);
//     setIsDetailOpen(false);
//     setIsLightboxOpen(false);
//     setIsCheckoutOpen(false);
//     setIsPaymentOpen(false);
//     setIsNotificationsOpen(false);
//     setIsFilterModalOpen(false);
//     setIsAboutUsOpen(false);
//     setIsTermsOpen(false);
//     sessionStorage.removeItem('df_active_modal');
//   }, []);

//   const applyNavigationState = useCallback((state) => {
//     const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');

//     if (!state || !state.modal) {
//       closeAllModals();
//       if (state && state.view) {
//         setCurrentView(state.view);
//       } else {
//         setCurrentView(isPathAdmin ? 'admin' : 'shop');
//       }
//       return;
//     }

//     if (state.view) {
//       setCurrentView(state.view);
//     } else {
//       setCurrentView(isPathAdmin ? 'admin' : 'shop');
//     }

//     closeAllModals();
//     sessionStorage.setItem('df_active_modal', state.modal);

//     if (state.modal === 'cart') {
//       setIsCartOpen(true);
//     } else if (state.modal === 'profile') {
//       setIsProfileOpen(true);
//     } else if (state.modal === 'auth') {
//       setIsAuthOpen(true);
//     } else if (state.modal === 'detail') {
//       if (state.product) {
//         setSelectedProduct(state.product);
//       } else if (state.productId) {
//         const found = productsRef.current.find(p => String(p._id || p.id) === String(state.productId));
//         if (found) setSelectedProduct(found);
//       }
//       setIsDetailOpen(true);
//     } else if (state.modal === 'lightbox') {
//       if (state.product) setLightboxProduct(state.product);
//       setIsLightboxOpen(true);
//     } else if (state.modal === 'checkout') {
//       setIsCheckoutOpen(true);
//     } else if (state.modal === 'payment') {
//       if (state.deliveryAddress) setDeliveryAddress(state.deliveryAddress);
//       setIsPaymentOpen(true);
//     } else if (state.modal === 'notifications') {
//       setIsNotificationsOpen(true);
//     } else if (state.modal === 'filter') {
//       setIsFilterModalOpen(true);
//     } else if (state.modal === 'about') {
//       setIsAboutUsOpen(true);
//     } else if (state.modal === 'terms') {
//       if (state.termsTab) setTermsTab(state.termsTab);
//       setIsTermsOpen(true);
//     }
//   }, [closeAllModals]);

//   const navigateTo = useCallback((modalName, extraData = {}) => {
//     const statePayload = {
//       modal: modalName,
//       view: currentView,
//       ...extraData
//     };
//     try {
//       window.history.pushState(statePayload, '', window.location.href);
//     } catch (e) {}
//     applyNavigationState(statePayload);
//   }, [currentView, applyNavigationState]);

//   // Direct Close to Home (Clears modal stack directly)
//   const closeToHome = useCallback(() => {
//     closeAllModals();
//     try {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     } catch (e) {}
//   }, [closeAllModals]);

//   // Re-hydrate state on page refresh & route detection
//   useEffect(() => {
//     const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');
//     const savedModal = window.history.state?.modal || sessionStorage.getItem('df_active_modal');

//     if (isPathAdmin) {
//       setCurrentView('admin');
//     } else if (savedModal) {
//       applyNavigationState(window.history.state || { modal: savedModal, view: 'shop' });
//     } else if (!window.history.state) {
//       window.history.replaceState(
//         { modal: null, view: isPathAdmin ? 'admin' : 'shop' },
//         '',
//         window.location.href
//       );
//     }

//     const handlePopState = (e) => {
//       applyNavigationState(e.state);
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         window.history.back();
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [applyNavigationState]);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ modal: null, view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     }
//   };

//   const openCartModal = () => navigateTo('cart');
//   const openProfileModal = () => navigateTo('profile');
//   const openAuthModal = () => navigateTo('auth');
//   const openFilterModal = () => navigateTo('filter');
//   const openAboutUsModal = () => navigateTo('about');
//   const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

//   const openNotificationsModal = () => {
//     setShowNotificationBubble(false);
//     const allIds = notifications.map(n => n._id);
//     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updatedRead);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
//     } catch (e) {}
//     navigateTo('notifications');
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await fetchWithCache('categories', async () => {
//         const res = await fetch(`${API_URL}/api/categories`);
//         return await res.json();
//       });
//       if (data) setCategories(data);
//     } catch (e) {
//       console.error('Error loading categories:', e);
//     }
//   };

//   const fetchProducts = async (pageNum = page, forceRefresh = false) => {
//     if (isFetchingRef.current && !forceRefresh) return;
//     isFetchingRef.current = true;

//     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
//     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

//     try {
//       if (products.length === 0) setLoading(true);
//       setApiError(null);

//       const params = new URLSearchParams();
//       if (sanitizedCat) params.append('category', sanitizedCat);
//       if (searchTerm.trim()) params.append('search', searchTerm.trim());
//       params.append('page', pageNum);
//       params.append('limit', 20);

//       const { data: rawResponse } = await fetchWithCache(
//         cacheKey,
//         async () => {
//           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
//           if (!res.ok) throw new Error(`Server status ${res.status}`);
//           return await res.json();
//         },
//         { forceRefresh }
//       );

//       let fetchedProducts = [];
//       let totalPagesVal = 1;
//       let totalProductsVal = 0;

//       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse.products || [];
//         totalPagesVal = rawResponse.totalPages || 1;
//         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
//       } else if (Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse;
//         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
//         totalProductsVal = fetchedProducts.length;
//       }

//       setProducts(fetchedProducts);
//       setTotalPages(totalPagesVal);
//       setTotalProductsCount(totalProductsVal);
//       setPage(pageNum);
//       updateUrlParams(pageNum, selectedCategory);

//       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
//         try {
//           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
//         } catch (e) {}
//       }
//     } catch (e) {
//       console.error('Error fetching products:', e);
//       if (products.length === 0) {
//         setApiError('Unable to load products. Please check your connection.');
//       }
//     } finally {
//       setLoading(false);
//       isFetchingRef.current = false;
//     }
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage === page || newPage < 1 || newPage > totalPages) return;
//     setPage(newPage);
//     fetchProducts(newPage);
//     updateUrlParams(newPage, selectedCategory);

//     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

//     if (catalogRef.current) {
//       catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }

//     setTimeout(() => {
//       window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//       if (catalogRef.current) {
//         catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     }, 150);
//   };

//   const DEFAULT_FILTERS = {
//     category: 'All',
//     presetPrice: 'all',
//     minPrice: '',
//     maxPrice: '',
//     minDiscount: 0,
//     minRating: 0,
//     inStockOnly: false
//   };

//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
//     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
//     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
//     if (appliedFilters.minDiscount > 0) count++;
//     if (appliedFilters.minRating > 0) count++;
//     if (appliedFilters.inStockOnly) count++;
//     return count;
//   }, [appliedFilters]);

//   const displayedProducts = useMemo(() => {
//     let list = Array.isArray(products) ? products : [];

//     if (selectedCategory && selectedCategory !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
//     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
//     }

//     if (searchTerm.trim()) {
//       const q = searchTerm.trim().toLowerCase();
//       list = list.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(q) ||
//           p.category?.toLowerCase().includes(q) ||
//           p.description?.toLowerCase().includes(q)
//       );
//     }

//     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
//       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
//     }
//     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
//       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
//     }

//     if (appliedFilters.presetPrice === 'under500') {
//       list = list.filter((p) => Number(p.price) < 500);
//     } else if (appliedFilters.presetPrice === '500-1000') {
//       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
//     } else if (appliedFilters.presetPrice === '1000-2000') {
//       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
//     } else if (appliedFilters.presetPrice === 'above2000') {
//       list = list.filter((p) => Number(p.price) > 2000);
//     }

//     if (appliedFilters.minDiscount > 0) {
//       list = list.filter((p) => {
//         if (!p.mrp || p.mrp <= p.price) return false;
//         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
//         return disc >= appliedFilters.minDiscount;
//       });
//     }

//     if (appliedFilters.minRating > 0) {
//       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
//     }

//     if (appliedFilters.inStockOnly) {
//       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
//     }

//     return list;
//   }, [products, selectedCategory, searchTerm, appliedFilters]);

//   // Wishlist State Setup
//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const handleToggleWishlist = (prod) => {
//     if (!prod) return;
//     const prodId = typeof prod === 'string' ? prod : (prod._id || prod.id);
    
//     setWishlist((prev) => {
//       const prevList = Array.isArray(prev) ? prev : [];
//       const exists = prevList.some((item) => {
//         const id = typeof item === 'string' ? item : (item?._id || item?.id);
//         return String(id) === String(prodId);
//       });

//       let updated;
//       if (exists) {
//         updated = prevList.filter((item) => {
//           const id = typeof item === 'string' ? item : (item?._id || item?.id);
//           return String(id) !== String(prodId);
//         });
//       } else {
//         updated = [...prevList, prod];
//       }

//       try {
//         localStorage.setItem('df_wishlist', JSON.stringify(updated));
//       } catch (e) {}

//       return updated;
//     });
//   };

//   const handleOpenProductDetail = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([...productHistoryRef.current, product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleProductDetailBack = () => {
//     window.history.back();
//   };

//   const handleCloseProductDetail = () => {
//     window.history.back();
//   };

//   const handleAddToCart = (product) => {
//     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//     if (remStock <= 0) {
//       alert('Out of Stock - Cannot add to cart!');
//       return;
//     }

//     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//       ? product.availableSizes
//       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//     if (product.selectedSize) {
//       setCartItems((prevItems) => {
//         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
//         if (existing) {
//           return prevItems.map((item) =>
//             (item._id === product._id && item.selectedSize === product.selectedSize)
//               ? { ...item, quantity: item.quantity + 1 }
//               : item
//           );
//         }
//         return [...prevItems, { ...product, quantity: 1 }];
//       });
//       openCartModal();
//       return;
//     }

//     if (sizesList.length > 1) {
//       handleOpenProductDetail(product);
//       return;
//     }

//     const autoSize = sizesList[0] || 'Standard';
//     setCartItems((prevItems) => {
//       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
//       if (existing) {
//         if (existing.quantity >= remStock) {
//           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
//           return prevItems;
//         }
//         return prevItems.map((item) =>
//           (item._id === product._id && item.selectedSize === autoSize)
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
//     });
//     openCartModal();
//   };

//   const handleUpdateQuantity = (productId, newQty) => {
//     if (newQty <= 0) {
//       setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//       return;
//     }
//     const cartItem = cartItems.find((item) => item._id === productId);
//     if (cartItem) {
//       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
//       if (newQty > remStock) {
//         alert(`Only ${remStock} item(s) available in stock!`);
//         return;
//       }
//     }
//     setCartItems((prevItems) =>
//       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
//     );
//   };

//   const handleRemoveFromCart = (productId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('df_token');
//     localStorage.removeItem('df_user');
//     setUser(null);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     fetchProducts(page, false);
//   }, [selectedCategory, searchTerm]);

//   return (
//     <div className="app-container">
//       {currentView === 'shop' && (
//         <LiveSaleBanner onSelectCategory={(cat) => {
//           setSelectedCategory(cat);
//           setPage(1);
//           updateUrlParams(1, cat);
//         }} />
//       )}

//       <Navbar
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
//         onOpenCart={openCartModal}
//         user={currentView === 'admin' ? null : user}
//         onOpenAuth={openAuthModal}
//         onOpenProfile={openProfileModal}
//         onLogout={handleLogout}
//         currentView={currentView}
//         setCurrentView={setView}
//         categories={categories}
//         allProducts={products}
//         onSelectProduct={handleOpenProductDetail}
//         unreadNotificationCount={notifications.length}
//         showNotificationBubble={showNotificationBubble}
//         latestNotificationTitle={latestNotificationTitle}
//         onOpenNotifications={openNotificationsModal}
//         activeFilterCount={activeFilterCount}
//         onOpenFilterModal={openFilterModal}
//       />

//       {currentView === 'admin' ? (
//         <AdminPanel onExitAdmin={() => setView('shop')} />
//       ) : (
//         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
//           <div className="main-layout" style={{ flex: '1 0 auto' }}>
//             <CategorySidebar
//               categories={categories}
//               selectedCategory={selectedCategory}
//               onSelectCategory={(catName) => {
//                 setSelectedCategory(catName);
//                 setPage(1);
//                 updateUrlParams(1, catName);
//               }}
//             />

//             <main ref={catalogRef} className="products-section">
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
//                 <h2>
//                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
//                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
//                     ({displayedProducts.length} products)
//                   </span>
//                 </h2>

//                 <button
//                   type="button"
//                   onClick={openFilterModal}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
//                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
//                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
//                     padding: '0.45rem 0.85rem',
//                     borderRadius: '10px',
//                     fontWeight: '700',
//                     fontSize: '0.82rem',
//                     cursor: 'pointer',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//                   }}
//                 >
//                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
//                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
//                 </button>
//               </div>

//               {activeFilterCount > 0 && (
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.5rem',
//                     flexWrap: 'wrap',
//                     background: '#fdf4ff',
//                     border: '1.5px solid #f0abfc',
//                     padding: '0.65rem 0.85rem',
//                     borderRadius: '12px',
//                     marginBottom: '1.25rem'
//                   }}
//                 >
//                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                     <Filter size={14} /> Active Filters:
//                   </span>

//                   {appliedFilters.category && appliedFilters.category !== 'All' && (
//                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
//                       Category: {appliedFilters.category}
//                     </span>
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
//                     style={{
//                       background: '#fef2f2',
//                       border: '1px solid #fca5a5',
//                       color: '#dc2626',
//                       padding: '2px 8px',
//                       borderRadius: '14px',
//                       fontSize: '0.75rem',
//                       fontWeight: '800',
//                       cursor: 'pointer',
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       gap: '3px',
//                       marginLeft: 'auto'
//                     }}
//                   >
//                     <RotateCcw size={12} /> Clear All
//                   </button>
//                 </div>
//               )}

//               {apiError ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
//                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
//                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
//                   <button
//                     type="button"
//                     onClick={() => fetchProducts(page, true)}
//                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
//                   >
//                     Retry Loading
//                   </button>
//                 </div>
//               ) : loading && products.length === 0 ? (
//                 <ProductGridSkeleton count={8} />
//               ) : displayedProducts.length === 0 ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
//                   <h3>No matching products found</h3>
//                 </div>
//               ) : (
//                 <>
//                   <div className="product-grid">
//                     {displayedProducts.map((product) => {
//                       const isWishlisted = wishlist.some(w => String(w._id || w.id || w) === String(product._id || product.id));
//                       return (
//                         <ProductCard
//                           key={product._id || product.id}
//                           product={product}
//                           onAddToCart={handleAddToCart}
//                           onClickProductTitle={handleOpenProductDetail}
//                           onClickProductImage={handleOpenProductDetail}
//                           isWishlisted={isWishlisted}
//                           onToggleWishlist={handleToggleWishlist}
//                           cartItems={cartItems}
//                           onOpenCart={openCartModal}
//                         />
//                       );
//                     })}
//                   </div>

//                   {totalPages > 1 && (
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <button
//                           type="button"
//                           disabled={page <= 1 || loading}
//                           onClick={() => handlePageChange(page - 1)}
//                           style={{
//                             padding: '10px 22px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
//                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
//                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
//                             border: '1px solid #e4e4e7',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           « Previous
//                         </button>

//                         <button
//                           type="button"
//                           disabled={page >= totalPages || loading}
//                           onClick={() => handlePageChange(page + 1)}
//                           style={{
//                             padding: '10px 24px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
//                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
//                             color: '#ffffff',
//                             border: 'none',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           Next »
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </main>
//           </div>

//           <Footer
//             onOpenAboutUs={openAboutUsModal}
//             onOpenTermsPrivacy={openTermsModal}
//           />
//         </div>
//       )}

//       {/* MODALS */}
//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isDetailOpen}
//         onClose={() => window.history.back()}
//         onAddToCart={handleAddToCart}
//         allProducts={products}
//         onSelectProduct={handleSelectRelatedProduct}
//         isWishlisted={wishlist.some(w => String(w._id || w.id || w) === String(selectedProduct?._id || selectedProduct?.id))}
//         onToggleWishlist={handleToggleWishlist}
//         wishlist={wishlist}
//         historyLength={productHistory.length}
//         onGoBack={handleProductDetailBack}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <ImageLightboxModal
//         product={lightboxProduct}
//         isOpen={isLightboxOpen}
//         onClose={() => window.history.back()}
//       />

//       <AuthModal
//         isOpen={isAuthOpen}
//         onClose={() => window.history.back()}
//         onAuthSuccess={(userData) => setUser(userData)}
//       />

//       {/* USER PROFILE MODAL - Closes directly to Home when clicking (X) */}
//       <UserProfileModal
//         isOpen={isProfileOpen}
//         onClose={closeToHome}
//         user={user}
//         onLogout={handleLogout}
//         onUpdateUser={(updatedUser) => {
//           const merged = { ...user, ...updatedUser };
//           setUser(merged);
//           try {
//             localStorage.setItem('df_user', JSON.stringify(merged));
//           } catch (e) {}
//         }}
//         wishlist={wishlist}
//         allProducts={products}
//         onToggleWishlist={handleToggleWishlist}
//         onSelectProduct={(p) => {
//           handleOpenProductDetail(p);
//         }}
//         onAddToCart={handleAddToCart}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={() => window.history.back()}
//         cartItems={cartItems}
//         onUpdateQuantity={handleUpdateQuantity}
//         onRemoveItem={handleRemoveFromCart}
//         onProceedToCheckout={() => {
//           navigateTo('checkout');
//         }}
//         user={user}
//         onOpenAuth={openAuthModal}
//         appliedCoupon={appliedCoupon}
//         setAppliedCoupon={setAppliedCoupon}
//       />

//       <CheckoutModal
//         isOpen={isCheckoutOpen}
//         onClose={() => window.history.back()}
//         onBackToCart={() => window.history.back()}
//         user={user}
//         onProceedToPayment={(addr) => {
//           setDeliveryAddress(addr);
//           navigateTo('payment', { deliveryAddress: addr });
//         }}
//       />

//       <PaymentModal
//         isOpen={isPaymentOpen}
//         onClose={() => window.history.back()}
//         onBackToCheckout={() => window.history.back()}
//         user={user}
//         cartItems={cartItems}
//         deliveryAddress={deliveryAddress}
//         appliedCoupon={appliedCoupon}
//         onOrderSuccess={() => {
//           setCartItems([]);
//           setAppliedCoupon(null);
//           closeToHome();
//           try { localStorage.removeItem('df_cart'); } catch (e) {}
//         }}
//       />

//       <NotificationModal
//         isOpen={isNotificationsOpen}
//         onClose={() => window.history.back()}
//         notifications={notifications}
//         readNotificationIds={readNotificationIds}
//         currentUserId={user?._id || user?.id || 'guest'}
//         onMarkAllAsRead={() => {}}
//         onMarkSingleAsRead={() => {}}
//         onNavigateToShop={() => setView('shop')}
//       />

//       {currentView === 'shop' && (
//         <MobileBottomNav
//           activeTab={
//             (isCartOpen || isCheckoutOpen || isPaymentOpen)
//               ? 'cart'
//               : (isProfileOpen || isAuthOpen)
//               ? 'account'
//               : 'home'
//           }
//           onHomeClick={() => {
//             if (isCartOpen || isProfileOpen || isAuthOpen || isDetailOpen || isCheckoutOpen || isPaymentOpen) {
//               closeToHome();
//             }
//             setSelectedCategory('All');
//             setPage(1);
//             updateUrlParams(1, 'All');
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//           }}
//           onAccountClick={() => {
//             if (user) openProfileModal();
//             else openAuthModal();
//           }}
//           onCartClick={openCartModal}
//           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
//           isLoggedIn={Boolean(user)}
//         />
//       )}

//       <ProductFilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => window.history.back()}
//         categories={categories}
//         allProducts={products}
//         currentFilters={appliedFilters}
//         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
//         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
//       />

//       <AboutUsModal
//         isOpen={isAboutUsOpen}
//         onClose={() => window.history.back()}
//       />

//       <TermsPrivacyModal
//         isOpen={isTermsOpen}
//         onClose={() => window.history.back()}
//         initialTab={termsTab}
//       />
//     </div>
//   );
// }

// export default App;








// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import Navbar from './components/Navbar';
// import CategorySidebar from './components/CategorySidebar';
// import ProductCard from './components/ProductCard';
// import ProductDetailModal from './components/ProductDetailModal';
// import ImageLightboxModal from './components/ImageLightboxModal';
// import AuthModal from './components/AuthModal';
// import CartDrawer from './components/CartDrawer';
// import CheckoutModal from './components/CheckoutModal';
// import PaymentModal from './components/PaymentModal';
// import UserProfileModal from './components/UserProfileModal';
// import NotificationModal from './components/NotificationModal';
// import LiveSaleBanner from './components/LiveSaleBanner';
// import AdminPanel from './components/Admin/AdminPanel';
// import MobileBottomNav from './components/MobileBottomNav';
// import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// import ProductFilterModal from './components/ProductFilterModal';
// import Footer from './components/Footer';
// import AboutUsModal from './components/AboutUsModal';
// import TermsPrivacyModal from './components/TermsPrivacyModal';
// import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// import { fetchWithCache } from './utils/cache';
// import { API_URL } from './api';
// import './App.css';

// // Socket Safe Import Helper
// let useSocketHook = null;
// try {
//   const socketModule = await import('./context/SocketContext.jsx');
//   useSocketHook = socketModule.useSocket;
// } catch (e) {
//   // Context safe fallback
// }

// function App() {
//   // Safe socket retrieval without crashing
//   let socket = null;
//   try {
//     if (typeof useSocketHook === 'function') {
//       socket = useSocketHook();
//     }
//   } catch (e) {
//     socket = null;
//   }

//   // Direct detection from URL path or hash on initial load
//   const [currentView, setCurrentView] = useState(() => {
//     if (typeof window !== 'undefined') {
//       const path = window.location.pathname.toLowerCase();
//       const hash = window.location.hash.toLowerCase();
//       if (path === '/admin' || path.startsWith('/admin') || hash === '#/admin') {
//         return 'admin';
//       }
//     }
//     return 'shop';
//   });

//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
//   const [isTermsOpen, setIsTermsOpen] = useState(false);
//   const [termsTab, setTermsTab] = useState('privacy');
//   const [notifications, setNotifications] = useState([]);
//   const [readNotificationIds, setReadNotificationIds] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_read_notifications');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });
//   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
//   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [productHistory, setProductHistory] = useState([]);
//   const productHistoryRef = useRef([]);

//   const updateProductHistory = (newHistory) => {
//     productHistoryRef.current = newHistory;
//     setProductHistory(newHistory);
//   };
//   const [lightboxProduct, setLightboxProduct] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem('df_cart');
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

//   const [categories, setCategories] = useState([]);

//   // Read initial Page and Category from URL / Storage for refresh persistence
//   const getInitialParams = () => {
//     try {
//       const urlParams = new URLSearchParams(window.location.search);
//       const p = parseInt(urlParams.get('page')) || parseInt(sessionStorage.getItem('df_page')) || 1;
//       const cat = urlParams.get('cat') || sessionStorage.getItem('df_selected_cat') || 'All';
//       return { page: p, cat };
//     } catch (e) {
//       return { page: 1, cat: 'All' };
//     }
//   };

//   const initialValues = getInitialParams();
//   const [selectedCategory, setSelectedCategory] = useState(initialValues.cat);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [products, setProducts] = useState(() => {
//     try {
//       const cached = localStorage.getItem('df_storefront_products');
//       return cached ? JSON.parse(cached) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const productsRef = useRef(products);
//   productsRef.current = products;

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(initialValues.page);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

//   const updateUrlParams = (pageNum, catName) => {
//     try {
//       const url = new URL(window.location.href);
//       if (pageNum > 1) url.searchParams.set('page', pageNum);
//       else url.searchParams.delete('page');

//       if (catName && catName !== 'All') url.searchParams.set('cat', catName);
//       else url.searchParams.delete('cat');

//       sessionStorage.setItem('df_page', pageNum);
//       sessionStorage.setItem('df_selected_cat', catName);

//       window.history.replaceState(window.history.state, '', url.toString());
//     } catch (e) {}
//   };

//   // ============================================================
//   // UNIFIED STACK-BASED HISTORY CONTROLLER
//   // ============================================================
//   const closeAllModals = useCallback(() => {
//     setIsCartOpen(false);
//     setIsProfileOpen(false);
//     setIsAuthOpen(false);
//     setIsDetailOpen(false);
//     setIsLightboxOpen(false);
//     setIsCheckoutOpen(false);
//     setIsPaymentOpen(false);
//     setIsNotificationsOpen(false);
//     setIsFilterModalOpen(false);
//     setIsAboutUsOpen(false);
//     setIsTermsOpen(false);
//     sessionStorage.removeItem('df_active_modal');
//   }, []);

//   const applyNavigationState = useCallback((state) => {
//     const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');

//     if (!state || !state.modal) {
//       closeAllModals();
//       if (state && state.view) {
//         setCurrentView(state.view);
//       } else {
//         setCurrentView(isPathAdmin ? 'admin' : 'shop');
//       }
//       return;
//     }

//     if (state.view) {
//       setCurrentView(state.view);
//     } else {
//       setCurrentView(isPathAdmin ? 'admin' : 'shop');
//     }

//     closeAllModals();
//     sessionStorage.setItem('df_active_modal', state.modal);

//     if (state.modal === 'cart') {
//       setIsCartOpen(true);
//     } else if (state.modal === 'profile') {
//       setIsProfileOpen(true);
//     } else if (state.modal === 'auth') {
//       setIsAuthOpen(true);
//     } else if (state.modal === 'detail') {
//       if (state.product) {
//         setSelectedProduct(state.product);
//       } else if (state.productId) {
//         const found = productsRef.current.find(p => String(p._id || p.id) === String(state.productId));
//         if (found) setSelectedProduct(found);
//       }
//       setIsDetailOpen(true);
//     } else if (state.modal === 'lightbox') {
//       if (state.product) setLightboxProduct(state.product);
//       setIsLightboxOpen(true);
//     } else if (state.modal === 'checkout') {
//       setIsCheckoutOpen(true);
//     } else if (state.modal === 'payment') {
//       if (state.deliveryAddress) setDeliveryAddress(state.deliveryAddress);
//       setIsPaymentOpen(true);
//     } else if (state.modal === 'notifications') {
//       setIsNotificationsOpen(true);
//     } else if (state.modal === 'filter') {
//       setIsFilterModalOpen(true);
//     } else if (state.modal === 'about') {
//       setIsAboutUsOpen(true);
//     } else if (state.modal === 'terms') {
//       if (state.termsTab) setTermsTab(state.termsTab);
//       setIsTermsOpen(true);
//     }
//   }, [closeAllModals]);

//   const navigateTo = useCallback((modalName, extraData = {}) => {
//     const statePayload = {
//       modal: modalName,
//       view: currentView,
//       ...extraData
//     };
//     try {
//       window.history.pushState(statePayload, '', window.location.href);
//     } catch (e) {}
//     applyNavigationState(statePayload);
//   }, [currentView, applyNavigationState]);

//   const closeToHome = useCallback(() => {
//     closeAllModals();
//     try {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     } catch (e) {}
//   }, [closeAllModals]);

//   // Re-hydrate state on page refresh & route detection
//   useEffect(() => {
//     const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');
//     const savedModal = window.history.state?.modal || sessionStorage.getItem('df_active_modal');

//     if (isPathAdmin) {
//       setCurrentView('admin');
//     } else if (savedModal) {
//       applyNavigationState(window.history.state || { modal: savedModal, view: 'shop' });
//     } else if (!window.history.state) {
//       window.history.replaceState(
//         { modal: null, view: isPathAdmin ? 'admin' : 'shop' },
//         '',
//         window.location.href
//       );
//     }

//     const handlePopState = (e) => {
//       applyNavigationState(e.state);
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         window.history.back();
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [applyNavigationState]);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ modal: null, view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     }
//   };

//   const openCartModal = () => navigateTo('cart');
//   const openProfileModal = () => navigateTo('profile');
//   const openAuthModal = () => navigateTo('auth');
//   const openFilterModal = () => navigateTo('filter');
//   const openAboutUsModal = () => navigateTo('about');
//   const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

//   const openNotificationsModal = () => {
//     setShowNotificationBubble(false);
//     const allIds = notifications.map(n => n._id);
//     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updatedRead);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
//     } catch (e) {}
//     navigateTo('notifications');
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await fetchWithCache('categories', async () => {
//         const res = await fetch(`${API_URL}/api/categories`);
//         return await res.json();
//       });
//       if (data) setCategories(data);
//     } catch (e) {
//       console.error('Error loading categories:', e);
//     }
//   };

//   // Safe Fetch Notifications
//   const fetchNotifications = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/notifications`);
//       if (!res.ok) return;
//       const data = await res.json();

//       let list = [];
//       if (Array.isArray(data)) {
//         list = data;
//       } else if (data && Array.isArray(data.notifications)) {
//         list = data.notifications;
//       } else if (data && Array.isArray(data.data)) {
//         list = data.data;
//       }

//       setNotifications(list);
//     } catch (e) {
//       console.error('Error loading notifications:', e);
//     }
//   };

//   const handleMarkAllNotificationsAsRead = () => {
//     const allIds = notifications.map(n => n._id);
//     const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updated);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updated));
//     } catch (e) {}
//   };

//   const handleMarkSingleNotificationAsRead = (id) => {
//     if (!readNotificationIds.includes(id)) {
//       const updated = [...readNotificationIds, id];
//       setReadNotificationIds(updated);
//       try {
//         localStorage.setItem('df_read_notifications', JSON.stringify(updated));
//       } catch (e) {}
//     }
//   };

//   const fetchProducts = async (pageNum = page, forceRefresh = false) => {
//     if (isFetchingRef.current && !forceRefresh) return;
//     isFetchingRef.current = true;

//     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
//     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

//     try {
//       if (products.length === 0) setLoading(true);
//       setApiError(null);

//       const params = new URLSearchParams();
//       if (sanitizedCat) params.append('category', sanitizedCat);
//       if (searchTerm.trim()) params.append('search', searchTerm.trim());
//       params.append('page', pageNum);
//       params.append('limit', 20);

//       const { data: rawResponse } = await fetchWithCache(
//         cacheKey,
//         async () => {
//           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
//           if (!res.ok) throw new Error(`Server status ${res.status}`);
//           return await res.json();
//         },
//         { forceRefresh }
//       );

//       let fetchedProducts = [];
//       let totalPagesVal = 1;
//       let totalProductsVal = 0;

//       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse.products || [];
//         totalPagesVal = rawResponse.totalPages || 1;
//         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
//       } else if (Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse;
//         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
//         totalProductsVal = fetchedProducts.length;
//       }

//       setProducts(fetchedProducts);
//       setTotalPages(totalPagesVal);
//       setTotalProductsCount(totalProductsVal);
//       setPage(pageNum);
//       updateUrlParams(pageNum, selectedCategory);

//       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
//         try {
//           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
//         } catch (e) {}
//       }
//     } catch (e) {
//       console.error('Error fetching products:', e);
//       if (products.length === 0) {
//         setApiError('Unable to load products. Please check your connection.');
//       }
//     } finally {
//       setLoading(false);
//       isFetchingRef.current = false;
//     }
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage === page || newPage < 1 || newPage > totalPages) return;
//     setPage(newPage);
//     fetchProducts(newPage);
//     updateUrlParams(newPage, selectedCategory);

//     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

//     if (catalogRef.current) {
//       catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }

//     setTimeout(() => {
//       window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//       if (catalogRef.current) {
//         catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     }, 150);
//   };

//   const DEFAULT_FILTERS = {
//     category: 'All',
//     presetPrice: 'all',
//     minPrice: '',
//     maxPrice: '',
//     minDiscount: 0,
//     minRating: 0,
//     inStockOnly: false
//   };

//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
//     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
//     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
//     if (appliedFilters.minDiscount > 0) count++;
//     if (appliedFilters.minRating > 0) count++;
//     if (appliedFilters.inStockOnly) count++;
//     return count;
//   }, [appliedFilters]);

//   const displayedProducts = useMemo(() => {
//     let list = Array.isArray(products) ? products : [];

//     if (selectedCategory && selectedCategory !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
//     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
//     }

//     if (searchTerm.trim()) {
//       const q = searchTerm.trim().toLowerCase();
//       list = list.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(q) ||
//           p.category?.toLowerCase().includes(q) ||
//           p.description?.toLowerCase().includes(q)
//       );
//     }

//     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
//       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
//     }
//     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
//       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
//     }

//     if (appliedFilters.presetPrice === 'under500') {
//       list = list.filter((p) => Number(p.price) < 500);
//     } else if (appliedFilters.presetPrice === '500-1000') {
//       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
//     } else if (appliedFilters.presetPrice === '1000-2000') {
//       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
//     } else if (appliedFilters.presetPrice === 'above2000') {
//       list = list.filter((p) => Number(p.price) > 2000);
//     }

//     if (appliedFilters.minDiscount > 0) {
//       list = list.filter((p) => {
//         if (!p.mrp || p.mrp <= p.price) return false;
//         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
//         return disc >= appliedFilters.minDiscount;
//       });
//     }

//     if (appliedFilters.minRating > 0) {
//       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
//     }

//     if (appliedFilters.inStockOnly) {
//       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
//     }

//     return list;
//   }, [products, selectedCategory, searchTerm, appliedFilters]);

//   // Wishlist State Setup
//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const handleToggleWishlist = (prod) => {
//     if (!prod) return;
//     const prodId = typeof prod === 'string' ? prod : (prod._id || prod.id);
    
//     setWishlist((prev) => {
//       const prevList = Array.isArray(prev) ? prev : [];
//       const exists = prevList.some((item) => {
//         const id = typeof item === 'string' ? item : (item?._id || item?.id);
//         return String(id) === String(prodId);
//       });

//       let updated;
//       if (exists) {
//         updated = prevList.filter((item) => {
//           const id = typeof item === 'string' ? item : (item?._id || item?.id);
//           return String(id) !== String(prodId);
//         });
//       } else {
//         updated = [...prevList, prod];
//       }

//       try {
//         localStorage.setItem('df_wishlist', JSON.stringify(updated));
//       } catch (e) {}

//       return updated;
//     });
//   };

//   const handleOpenProductDetail = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([...productHistoryRef.current, product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleProductDetailBack = () => {
//     window.history.back();
//   };

//   const handleAddToCart = (product) => {
//     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//     if (remStock <= 0) {
//       alert('Out of Stock - Cannot add to cart!');
//       return;
//     }

//     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//       ? product.availableSizes
//       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//     if (product.selectedSize) {
//       setCartItems((prevItems) => {
//         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
//         if (existing) {
//           return prevItems.map((item) =>
//             (item._id === product._id && item.selectedSize === product.selectedSize)
//               ? { ...item, quantity: item.quantity + 1 }
//               : item
//           );
//         }
//         return [...prevItems, { ...product, quantity: 1 }];
//       });
//       openCartModal();
//       return;
//     }

//     if (sizesList.length > 1) {
//       handleOpenProductDetail(product);
//       return;
//     }

//     const autoSize = sizesList[0] || 'Standard';
//     setCartItems((prevItems) => {
//       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
//       if (existing) {
//         if (existing.quantity >= remStock) {
//           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
//           return prevItems;
//         }
//         return prevItems.map((item) =>
//           (item._id === product._id && item.selectedSize === autoSize)
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
//     });
//     openCartModal();
//   };

//   const handleUpdateQuantity = (productId, newQty) => {
//     if (newQty <= 0) {
//       setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//       return;
//     }
//     const cartItem = cartItems.find((item) => item._id === productId);
//     if (cartItem) {
//       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
//       if (newQty > remStock) {
//         alert(`Only ${remStock} item(s) available in stock!`);
//         return;
//       }
//     }
//     setCartItems((prevItems) =>
//       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
//     );
//   };

//   const handleRemoveFromCart = (productId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('df_token');
//     localStorage.removeItem('df_user');
//     setUser(null);
//   };

//   // Mount API Calls
//   useEffect(() => {
//     fetchCategories();
//     fetchNotifications();
//   }, []);

//   // Safe Socket Realtime Listener (No crashes if socket is offline)
//   useEffect(() => {
//     if (!socket || typeof socket.on !== 'function') return;

//     const handleNewNotif = (newNotif) => {
//       if (!newNotif) return;
//       setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
//       setShowNotificationBubble(true);
//       setLatestNotificationTitle(newNotif.title || 'New Announcement');
//     };

//     const handleDelNotif = (delId) => {
//       if (!delId) return;
//       setNotifications((prev) => prev.filter((n) => n._id !== delId));
//     };

//     socket.on('new_notification', handleNewNotif);
//     socket.on('notification_deleted', handleDelNotif);

//     return () => {
//       if (socket && typeof socket.off === 'function') {
//         socket.off('new_notification', handleNewNotif);
//         socket.off('notification_deleted', handleDelNotif);
//       }
//     };
//   }, [socket]);

//   useEffect(() => {
//     fetchProducts(page, false);
//   }, [selectedCategory, searchTerm]);

//   return (
//     <div className="app-container">
//       {currentView === 'shop' && (
//         <LiveSaleBanner onSelectCategory={(cat) => {
//           setSelectedCategory(cat);
//           setPage(1);
//           updateUrlParams(1, cat);
//         }} />
//       )}

//       <Navbar
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
//         onOpenCart={openCartModal}
//         user={currentView === 'admin' ? null : user}
//         onOpenAuth={openAuthModal}
//         onOpenProfile={openProfileModal}
//         onLogout={handleLogout}
//         currentView={currentView}
//         setCurrentView={setView}
//         categories={categories}
//         allProducts={products}
//         onSelectProduct={handleOpenProductDetail}
//         unreadNotificationCount={notifications.length}
//         showNotificationBubble={showNotificationBubble}
//         latestNotificationTitle={latestNotificationTitle}
//         onOpenNotifications={openNotificationsModal}
//         activeFilterCount={activeFilterCount}
//         onOpenFilterModal={openFilterModal}
//       />

//       {currentView === 'admin' ? (
//         <AdminPanel onExitAdmin={() => setView('shop')} />
//       ) : (
//         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
//           <div className="main-layout" style={{ flex: '1 0 auto' }}>
//             <CategorySidebar
//               categories={categories}
//               selectedCategory={selectedCategory}
//               onSelectCategory={(catName) => {
//                 setSelectedCategory(catName);
//                 setPage(1);
//                 updateUrlParams(1, catName);
//               }}
//             />

//             <main ref={catalogRef} className="products-section">
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
//                 <h2>
//                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
//                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
//                     ({displayedProducts.length} products)
//                   </span>
//                 </h2>

//                 <button
//                   type="button"
//                   onClick={openFilterModal}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
//                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
//                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
//                     padding: '0.45rem 0.85rem',
//                     borderRadius: '10px',
//                     fontWeight: '700',
//                     fontSize: '0.82rem',
//                     cursor: 'pointer',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//                   }}
//                 >
//                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
//                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
//                 </button>
//               </div>

//               {activeFilterCount > 0 && (
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.5rem',
//                     flexWrap: 'wrap',
//                     background: '#fdf4ff',
//                     border: '1.5px solid #f0abfc',
//                     padding: '0.65rem 0.85rem',
//                     borderRadius: '12px',
//                     marginBottom: '1.25rem'
//                   }}
//                 >
//                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                     <Filter size={14} /> Active Filters:
//                   </span>

//                   {appliedFilters.category && appliedFilters.category !== 'All' && (
//                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
//                       Category: {appliedFilters.category}
//                     </span>
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
//                     style={{
//                       background: '#fef2f2',
//                       border: '1px solid #fca5a5',
//                       color: '#dc2626',
//                       padding: '2px 8px',
//                       borderRadius: '14px',
//                       fontSize: '0.75rem',
//                       fontWeight: '800',
//                       cursor: 'pointer',
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       gap: '3px',
//                       marginLeft: 'auto'
//                     }}
//                   >
//                     <RotateCcw size={12} /> Clear All
//                   </button>
//                 </div>
//               )}

//               {apiError ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
//                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
//                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
//                   <button
//                     type="button"
//                     onClick={() => fetchProducts(page, true)}
//                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
//                   >
//                     Retry Loading
//                   </button>
//                 </div>
//               ) : loading && products.length === 0 ? (
//                 <ProductGridSkeleton count={8} />
//               ) : displayedProducts.length === 0 ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
//                   <h3>No matching products found</h3>
//                 </div>
//               ) : (
//                 <>
//                   <div className="product-grid">
//                     {displayedProducts.map((product) => {
//                       const isWishlisted = wishlist.some(w => String(w._id || w.id || w) === String(product._id || product.id));
//                       return (
//                         <ProductCard
//                           key={product._id || product.id}
//                           product={product}
//                           onAddToCart={handleAddToCart}
//                           onClickProductTitle={handleOpenProductDetail}
//                           onClickProductImage={handleOpenProductDetail}
//                           isWishlisted={isWishlisted}
//                           onToggleWishlist={handleToggleWishlist}
//                           cartItems={cartItems}
//                           onOpenCart={openCartModal}
//                         />
//                       );
//                     })}
//                   </div>

//                   {totalPages > 1 && (
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <button
//                           type="button"
//                           disabled={page <= 1 || loading}
//                           onClick={() => handlePageChange(page - 1)}
//                           style={{
//                             padding: '10px 22px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
//                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
//                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
//                             border: '1px solid #e4e4e7',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           « Previous
//                         </button>

//                         <button
//                           type="button"
//                           disabled={page >= totalPages || loading}
//                           onClick={() => handlePageChange(page + 1)}
//                           style={{
//                             padding: '10px 24px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
//                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
//                             color: '#ffffff',
//                             border: 'none',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           Next »
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </main>
//           </div>

//           <Footer
//             onOpenAboutUs={openAboutUsModal}
//             onOpenTermsPrivacy={openTermsModal}
//           />
//         </div>
//       )}

//       {/* MODALS */}
//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isDetailOpen}
//         onClose={() => window.history.back()}
//         onAddToCart={handleAddToCart}
//         allProducts={products}
//         onSelectProduct={handleSelectRelatedProduct}
//         isWishlisted={wishlist.some(w => String(w._id || w.id || w) === String(selectedProduct?._id || selectedProduct?.id))}
//         onToggleWishlist={handleToggleWishlist}
//         wishlist={wishlist}
//         historyLength={productHistory.length}
//         onGoBack={handleProductDetailBack}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <ImageLightboxModal
//         product={lightboxProduct}
//         isOpen={isLightboxOpen}
//         onClose={() => window.history.back()}
//       />

//       <AuthModal
//         isOpen={isAuthOpen}
//         onClose={() => window.history.back()}
//         onAuthSuccess={(userData) => setUser(userData)}
//       />

//       <UserProfileModal
//         isOpen={isProfileOpen}
//         onClose={closeToHome}
//         user={user}
//         onLogout={handleLogout}
//         onUpdateUser={(updatedUser) => {
//           const merged = { ...user, ...updatedUser };
//           setUser(merged);
//           try {
//             localStorage.setItem('df_user', JSON.stringify(merged));
//           } catch (e) {}
//         }}
//         wishlist={wishlist}
//         allProducts={products}
//         onToggleWishlist={handleToggleWishlist}
//         onSelectProduct={(p) => {
//           handleOpenProductDetail(p);
//         }}
//         onAddToCart={handleAddToCart}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={() => window.history.back()}
//         cartItems={cartItems}
//         onUpdateQuantity={handleUpdateQuantity}
//         onRemoveItem={handleRemoveFromCart}
//         onProceedToCheckout={() => {
//           navigateTo('checkout');
//         }}
//         user={user}
//         onOpenAuth={openAuthModal}
//         appliedCoupon={appliedCoupon}
//         setAppliedCoupon={setAppliedCoupon}
//       />

//       <CheckoutModal
//         isOpen={isCheckoutOpen}
//         onClose={() => window.history.back()}
//         onBackToCart={() => window.history.back()}
//         user={user}
//         onProceedToPayment={(addr) => {
//           setDeliveryAddress(addr);
//           navigateTo('payment', { deliveryAddress: addr });
//         }}
//       />

//       <PaymentModal
//         isOpen={isPaymentOpen}
//         onClose={() => window.history.back()}
//         onBackToCheckout={() => window.history.back()}
//         user={user}
//         cartItems={cartItems}
//         deliveryAddress={deliveryAddress}
//         appliedCoupon={appliedCoupon}
//         onOrderSuccess={() => {
//           setCartItems([]);
//           setAppliedCoupon(null);
//           closeToHome();
//           try { localStorage.removeItem('df_cart'); } catch (e) {}
//         }}
//       />

//       <NotificationModal
//         isOpen={isNotificationsOpen}
//         onClose={() => window.history.back()}
//         notifications={notifications}
//         readNotificationIds={readNotificationIds}
//         currentUserId={user?._id || user?.id || 'guest'}
//         onMarkAllAsRead={handleMarkAllNotificationsAsRead}
//         onMarkSingleAsRead={handleMarkSingleNotificationAsRead}
//         onNavigateToShop={() => setView('shop')}
//       />

//       {currentView === 'shop' && (
//         <MobileBottomNav
//           activeTab={
//             (isCartOpen || isCheckoutOpen || isPaymentOpen)
//               ? 'cart'
//               : (isProfileOpen || isAuthOpen)
//               ? 'account'
//               : 'home'
//           }
//           onHomeClick={() => {
//             if (isCartOpen || isProfileOpen || isAuthOpen || isDetailOpen || isCheckoutOpen || isPaymentOpen) {
//               closeToHome();
//             }
//             setSelectedCategory('All');
//             setPage(1);
//             updateUrlParams(1, 'All');
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//           }}
//           onAccountClick={() => {
//             if (user) openProfileModal();
//             else openAuthModal();
//           }}
//           onCartClick={openCartModal}
//           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
//           isLoggedIn={Boolean(user)}
//         />
//       )}

//       <ProductFilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => window.history.back()}
//         categories={categories}
//         allProducts={products}
//         currentFilters={appliedFilters}
//         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
//         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
//       />

//       <AboutUsModal
//         isOpen={isAboutUsOpen}
//         onClose={() => window.history.back()}
//       />

//       <TermsPrivacyModal
//         isOpen={isTermsOpen}
//         onClose={() => window.history.back()}
//         initialTab={termsTab}
//       />
//     </div>
//   );
// }

// export default App;







           
//work it



// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import Navbar from './components/Navbar';
// import CategorySidebar from './components/CategorySidebar';
// import ProductCard from './components/ProductCard';
// import ProductDetailModal from './components/ProductDetailModal';
// import ImageLightboxModal from './components/ImageLightboxModal';
// import AuthModal from './components/AuthModal';
// import CartDrawer from './components/CartDrawer';
// import CheckoutModal from './components/CheckoutModal';
// import PaymentModal from './components/PaymentModal';
// import UserProfileModal from './components/UserProfileModal';
// import NotificationModal from './components/NotificationModal';
// import LiveSaleBanner from './components/LiveSaleBanner';
// import AdminPanel from './components/Admin/AdminPanel';
// import MobileBottomNav from './components/MobileBottomNav';
// import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// import ProductFilterModal from './components/ProductFilterModal';
// import Footer from './components/Footer';
// import AboutUsModal from './components/AboutUsModal';
// import TermsPrivacyModal from './components/TermsPrivacyModal';
// import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// import { fetchWithCache } from './utils/cache';
// import { API_URL } from './api';
// import { useSocket } from './context/SocketContext.jsx';
// import './App.css';

// function App() {
//   // Safe socket retrieval
//   let socket = null;
//   try {
//     socket = useSocket();
//   } catch (e) {
//     socket = null;
//   }

//   // Direct detection from URL path or hash on initial load
//   const [currentView, setCurrentView] = useState(() => {
//     if (typeof window !== 'undefined') {
//       const path = window.location.pathname.toLowerCase();
//       const hash = window.location.hash.toLowerCase();
//       if (path === '/admin' || path.startsWith('/admin') || hash === '#/admin') {
//         return 'admin';
//       }
//     }
//     return 'shop';
//   });

//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_user');
//       return saved ? JSON.parse(saved) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
//   const [isTermsOpen, setIsTermsOpen] = useState(false);
//   const [termsTab, setTermsTab] = useState('privacy');
//   const [notifications, setNotifications] = useState([]);
//   const [readNotificationIds, setReadNotificationIds] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_read_notifications');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });
//   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
//   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

//   // Calculate ONLY Unread Notifications Count
//   const unreadNotificationCount = useMemo(() => {
//     const currentId = user?._id || user?.id || '';
//     return notifications.filter((n) => {
//       const isReadInStorage = readNotificationIds.includes(n._id);
//       const isReadInDb = currentId && Array.isArray(n.readBy) && n.readBy.includes(currentId);
//       return !isReadInStorage && !isReadInDb;
//     }).length;
//   }, [notifications, readNotificationIds, user]);

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [productHistory, setProductHistory] = useState([]);
//   const productHistoryRef = useRef([]);

//   const updateProductHistory = (newHistory) => {
//     productHistoryRef.current = newHistory;
//     setProductHistory(newHistory);
//   };
//   const [lightboxProduct, setLightboxProduct] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem('df_cart');
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState(null);
//   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

//   const [categories, setCategories] = useState([]);

//   // Read initial Page and Category from URL / Storage for refresh persistence
//   const getInitialParams = () => {
//     try {
//       const urlParams = new URLSearchParams(window.location.search);
//       const p = parseInt(urlParams.get('page')) || parseInt(sessionStorage.getItem('df_page')) || 1;
//       const cat = urlParams.get('cat') || sessionStorage.getItem('df_selected_cat') || 'All';
//       return { page: p, cat };
//     } catch (e) {
//       return { page: 1, cat: 'All' };
//     }
//   };

//   const initialValues = getInitialParams();
//   const [selectedCategory, setSelectedCategory] = useState(initialValues.cat);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [products, setProducts] = useState(() => {
//     try {
//       const cached = localStorage.getItem('df_storefront_products');
//       return cached ? JSON.parse(cached) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const productsRef = useRef(products);
//   productsRef.current = products;

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(initialValues.page);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

//   const updateUrlParams = (pageNum, catName) => {
//     try {
//       const url = new URL(window.location.href);
//       if (pageNum > 1) url.searchParams.set('page', pageNum);
//       else url.searchParams.delete('page');

//       if (catName && catName !== 'All') url.searchParams.set('cat', catName);
//       else url.searchParams.delete('cat');

//       sessionStorage.setItem('df_page', pageNum);
//       sessionStorage.setItem('df_selected_cat', catName);

//       window.history.replaceState(window.history.state, '', url.toString());
//     } catch (e) {}
//   };

//   // ============================================================
//   // UNIFIED STACK-BASED HISTORY CONTROLLER
//   // ============================================================
//   const closeAllModals = useCallback(() => {
//     setIsCartOpen(false);
//     setIsProfileOpen(false);
//     setIsAuthOpen(false);
//     setIsDetailOpen(false);
//     setIsLightboxOpen(false);
//     setIsCheckoutOpen(false);
//     setIsPaymentOpen(false);
//     setIsNotificationsOpen(false);
//     setIsFilterModalOpen(false);
//     setIsAboutUsOpen(false);
//     setIsTermsOpen(false);
//     sessionStorage.removeItem('df_active_modal');
//   }, []);

//   const applyNavigationState = useCallback((state) => {
//     const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');

//     if (!state || !state.modal) {
//       closeAllModals();
//       if (state && state.view) {
//         setCurrentView(state.view);
//       } else {
//         setCurrentView(isPathAdmin ? 'admin' : 'shop');
//       }
//       return;
//     }

//     if (state.view) {
//       setCurrentView(state.view);
//     } else {
//       setCurrentView(isPathAdmin ? 'admin' : 'shop');
//     }

//     closeAllModals();
//     sessionStorage.setItem('df_active_modal', state.modal);

//     if (state.modal === 'cart') {
//       setIsCartOpen(true);
//     } else if (state.modal === 'profile') {
//       setIsProfileOpen(true);
//     } else if (state.modal === 'auth') {
//       setIsAuthOpen(true);
//     } else if (state.modal === 'detail') {
//       if (state.product) {
//         setSelectedProduct(state.product);
//       } else if (state.productId) {
//         const found = productsRef.current.find(p => String(p._id || p.id) === String(state.productId));
//         if (found) setSelectedProduct(found);
//       }
//       setIsDetailOpen(true);
//     } else if (state.modal === 'lightbox') {
//       if (state.product) setLightboxProduct(state.product);
//       setIsLightboxOpen(true);
//     } else if (state.modal === 'checkout') {
//       setIsCheckoutOpen(true);
//     } else if (state.modal === 'payment') {
//       if (state.deliveryAddress) setDeliveryAddress(state.deliveryAddress);
//       setIsPaymentOpen(true);
//     } else if (state.modal === 'notifications') {
//       setIsNotificationsOpen(true);
//     } else if (state.modal === 'filter') {
//       setIsFilterModalOpen(true);
//     } else if (state.modal === 'about') {
//       setIsAboutUsOpen(true);
//     } else if (state.modal === 'terms') {
//       if (state.termsTab) setTermsTab(state.termsTab);
//       setIsTermsOpen(true);
//     }
//   }, [closeAllModals]);

//   const navigateTo = useCallback((modalName, extraData = {}) => {
//     const statePayload = {
//       modal: modalName,
//       view: currentView,
//       ...extraData
//     };
//     try {
//       window.history.pushState(statePayload, '', window.location.href);
//     } catch (e) {}
//     applyNavigationState(statePayload);
//   }, [currentView, applyNavigationState]);

//   const closeToHome = useCallback(() => {
//     closeAllModals();
//     try {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     } catch (e) {}
//   }, [closeAllModals]);

//   useEffect(() => {
//     const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');
//     const savedModal = window.history.state?.modal || sessionStorage.getItem('df_active_modal');

//     if (isPathAdmin) {
//       setCurrentView('admin');
//     } else if (savedModal) {
//       applyNavigationState(window.history.state || { modal: savedModal, view: 'shop' });
//     } else if (!window.history.state) {
//       window.history.replaceState(
//         { modal: null, view: isPathAdmin ? 'admin' : 'shop' },
//         '',
//         window.location.href
//       );
//     }

//     const handlePopState = (e) => {
//       applyNavigationState(e.state);
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         window.history.back();
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [applyNavigationState]);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ modal: null, view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ modal: null, view: 'shop' }, '', '/');
//     }
//   };

//   const openCartModal = () => navigateTo('cart');
//   const openProfileModal = () => navigateTo('profile');
//   const openAuthModal = () => navigateTo('auth');
//   const openFilterModal = () => navigateTo('filter');
//   const openAboutUsModal = () => navigateTo('about');
//   const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

//   const openNotificationsModal = () => {
//     setShowNotificationBubble(false);
//     navigateTo('notifications');
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await fetchWithCache('categories', async () => {
//         const res = await fetch(`${API_URL}/api/categories`);
//         return await res.json();
//       });
//       if (data) setCategories(data);
//     } catch (e) {
//       console.error('Error loading categories:', e);
//     }
//   };

//   const fetchNotifications = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/notifications`);
//       if (!res.ok) return;
//       const data = await res.json();

//       let list = [];
//       if (Array.isArray(data)) {
//         list = data;
//       } else if (data && Array.isArray(data.notifications)) {
//         list = data.notifications;
//       } else if (data && Array.isArray(data.data)) {
//         list = data.data;
//       }

//       setNotifications(list);
//     } catch (e) {
//       console.error('Error loading notifications:', e);
//     }
//   };

//   const handleMarkAllNotificationsAsRead = () => {
//     const allIds = notifications.map((n) => n._id);
//     const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updated);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updated));
//     } catch (e) {}
//   };

//   const handleMarkSingleNotificationAsRead = (id) => {
//     if (!readNotificationIds.includes(id)) {
//       const updated = [...readNotificationIds, id];
//       setReadNotificationIds(updated);
//       try {
//         localStorage.setItem('df_read_notifications', JSON.stringify(updated));
//       } catch (e) {}
//     }
//   };

//   const fetchProducts = async (pageNum = page, forceRefresh = false) => {
//     if (isFetchingRef.current && !forceRefresh) return;
//     isFetchingRef.current = true;

//     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
//     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

//     try {
//       if (products.length === 0) setLoading(true);
//       setApiError(null);

//       const params = new URLSearchParams();
//       if (sanitizedCat) params.append('category', sanitizedCat);
//       if (searchTerm.trim()) params.append('search', searchTerm.trim());
//       params.append('page', pageNum);
//       params.append('limit', 20);

//       const { data: rawResponse } = await fetchWithCache(
//         cacheKey,
//         async () => {
//           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
//           if (!res.ok) throw new Error(`Server status ${res.status}`);
//           return await res.json();
//         },
//         { forceRefresh }
//       );

//       let fetchedProducts = [];
//       let totalPagesVal = 1;
//       let totalProductsVal = 0;

//       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse.products || [];
//         totalPagesVal = rawResponse.totalPages || 1;
//         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
//       } else if (Array.isArray(rawResponse)) {
//         fetchedProducts = rawResponse;
//         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
//         totalProductsVal = fetchedProducts.length;
//       }

//       setProducts(fetchedProducts);
//       setTotalPages(totalPagesVal);
//       setTotalProductsCount(totalProductsVal);
//       setPage(pageNum);
//       updateUrlParams(pageNum, selectedCategory);

//       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
//         try {
//           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
//         } catch (e) {}
//       }
//     } catch (e) {
//       console.error('Error fetching products:', e);
//       if (products.length === 0) {
//         setApiError('Unable to load products. Please check your connection.');
//       }
//     } finally {
//       setLoading(false);
//       isFetchingRef.current = false;
//     }
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage === page || newPage < 1 || newPage > totalPages) return;
//     setPage(newPage);
//     fetchProducts(newPage);
//     updateUrlParams(newPage, selectedCategory);

//     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//     document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

//     if (catalogRef.current) {
//       catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }

//     setTimeout(() => {
//       window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
//       if (catalogRef.current) {
//         catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     }, 150);
//   };

//   const DEFAULT_FILTERS = {
//     category: 'All',
//     presetPrice: 'all',
//     minPrice: '',
//     maxPrice: '',
//     minDiscount: 0,
//     minRating: 0,
//     inStockOnly: false
//   };

//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
//     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
//     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
//     if (appliedFilters.minDiscount > 0) count++;
//     if (appliedFilters.minRating > 0) count++;
//     if (appliedFilters.inStockOnly) count++;
//     return count;
//   }, [appliedFilters]);

//   const displayedProducts = useMemo(() => {
//     let list = Array.isArray(products) ? products : [];

//     if (selectedCategory && selectedCategory !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
//     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
//       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
//     }

//     if (searchTerm.trim()) {
//       const q = searchTerm.trim().toLowerCase();
//       list = list.filter(
//         (p) =>
//           p.name?.toLowerCase().includes(q) ||
//           p.category?.toLowerCase().includes(q) ||
//           p.description?.toLowerCase().includes(q)
//       );
//     }

//     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
//       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
//     }
//     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
//       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
//     }

//     if (appliedFilters.presetPrice === 'under500') {
//       list = list.filter((p) => Number(p.price) < 500);
//     } else if (appliedFilters.presetPrice === '500-1000') {
//       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
//     } else if (appliedFilters.presetPrice === '1000-2000') {
//       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
//     } else if (appliedFilters.presetPrice === 'above2000') {
//       list = list.filter((p) => Number(p.price) > 2000);
//     }

//     if (appliedFilters.minDiscount > 0) {
//       list = list.filter((p) => {
//         if (!p.mrp || p.mrp <= p.price) return false;
//         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
//         return disc >= appliedFilters.minDiscount;
//       });
//     }

//     if (appliedFilters.minRating > 0) {
//       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
//     }

//     if (appliedFilters.inStockOnly) {
//       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
//     }

//     return list;
//   }, [products, selectedCategory, searchTerm, appliedFilters]);

//   // Wishlist State Setup
//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('df_wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   const handleToggleWishlist = (prod) => {
//     if (!prod) return;
//     const prodId = typeof prod === 'string' ? prod : (prod._id || prod.id);
    
//     setWishlist((prev) => {
//       const prevList = Array.isArray(prev) ? prev : [];
//       const exists = prevList.some((item) => {
//         const id = typeof item === 'string' ? item : (item?._id || item?.id);
//         return String(id) === String(prodId);
//       });

//       let updated;
//       if (exists) {
//         updated = prevList.filter((item) => {
//           const id = typeof item === 'string' ? item : (item?._id || item?.id);
//           return String(id) !== String(prodId);
//         });
//       } else {
//         updated = [...prevList, prod];
//       }

//       try {
//         localStorage.setItem('df_wishlist', JSON.stringify(updated));
//       } catch (e) {}

//       return updated;
//     });
//   };

//   const handleOpenProductDetail = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     updateProductHistory([...productHistoryRef.current, product]);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//     navigateTo('detail', { productId: prodId, product });
//   };

//   const handleProductDetailBack = () => {
//     window.history.back();
//   };

//   const handleAddToCart = (product) => {
//     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//     if (remStock <= 0) {
//       alert('Out of Stock - Cannot add to cart!');
//       return;
//     }

//     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//       ? product.availableSizes
//       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//     if (product.selectedSize) {
//       setCartItems((prevItems) => {
//         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
//         if (existing) {
//           return prevItems.map((item) =>
//             (item._id === product._id && item.selectedSize === product.selectedSize)
//               ? { ...item, quantity: item.quantity + 1 }
//               : item
//           );
//         }
//         return [...prevItems, { ...product, quantity: 1 }];
//       });
//       openCartModal();
//       return;
//     }

//     if (sizesList.length > 1) {
//       handleOpenProductDetail(product);
//       return;
//     }

//     const autoSize = sizesList[0] || 'Standard';
//     setCartItems((prevItems) => {
//       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
//       if (existing) {
//         if (existing.quantity >= remStock) {
//           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
//           return prevItems;
//         }
//         return prevItems.map((item) =>
//           (item._id === product._id && item.selectedSize === autoSize)
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
//     });
//     openCartModal();
//   };

//   const handleUpdateQuantity = (productId, newQty) => {
//     if (newQty <= 0) {
//       setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//       return;
//     }
//     const cartItem = cartItems.find((item) => item._id === productId);
//     if (cartItem) {
//       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
//       if (newQty > remStock) {
//         alert(`Only ${remStock} item(s) available in stock!`);
//         return;
//       }
//     }
//     setCartItems((prevItems) =>
//       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
//     );
//   };

//   const handleRemoveFromCart = (productId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('df_token');
//     localStorage.removeItem('df_user');
//     setUser(null);
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchNotifications();
//   }, []);

//   // Safe Socket Realtime Listener
//   useEffect(() => {
//     if (!socket || typeof socket.on !== 'function') return;

//     const handleNewNotif = (newNotif) => {
//       if (!newNotif) return;
//       setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
//       setShowNotificationBubble(true);
//       setLatestNotificationTitle(newNotif.title || 'New Announcement');
//     };

//     const handleDelNotif = (delId) => {
//       if (!delId) return;
//       setNotifications((prev) => prev.filter((n) => n._id !== delId));
//     };

//     socket.on('new_notification', handleNewNotif);
//     socket.on('notification_deleted', handleDelNotif);

//     return () => {
//       if (socket && typeof socket.off === 'function') {
//         socket.off('new_notification', handleNewNotif);
//         socket.off('notification_deleted', handleDelNotif);
//       }
//     };
//   }, [socket]);

//   useEffect(() => {
//     fetchProducts(page, false);
//   }, [selectedCategory, searchTerm]);

//   return (
//     <div className="app-container">
//       {currentView === 'shop' && (
//         <LiveSaleBanner onSelectCategory={(cat) => {
//           setSelectedCategory(cat);
//           setPage(1);
//           updateUrlParams(1, cat);
//         }} />
//       )}

//       <Navbar
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
//         onOpenCart={openCartModal}
//         user={currentView === 'admin' ? null : user}
//         onOpenAuth={openAuthModal}
//         onOpenProfile={openProfileModal}
//         onLogout={handleLogout}
//         currentView={currentView}
//         setCurrentView={setView}
//         categories={categories}
//         allProducts={products}
//         onSelectProduct={handleOpenProductDetail}
//         unreadNotificationCount={unreadNotificationCount}
//         showNotificationBubble={showNotificationBubble}
//         latestNotificationTitle={latestNotificationTitle}
//         onOpenNotifications={openNotificationsModal}
//         activeFilterCount={activeFilterCount}
//         onOpenFilterModal={openFilterModal}
//       />

//       {currentView === 'admin' ? (
//         <AdminPanel onExitAdmin={() => setView('shop')} />
//       ) : (
//         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
//           <div className="main-layout" style={{ flex: '1 0 auto' }}>
//             <CategorySidebar
//               categories={categories}
//               selectedCategory={selectedCategory}
//               onSelectCategory={(catName) => {
//                 setSelectedCategory(catName);
//                 setPage(1);
//                 updateUrlParams(1, catName);
//               }}
//             />

//             <main ref={catalogRef} className="products-section">
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
//                 <h2>
//                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
//                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
//                     ({displayedProducts.length} products)
//                   </span>
//                 </h2>

//                 <button
//                   type="button"
//                   onClick={openFilterModal}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
//                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
//                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
//                     padding: '0.45rem 0.85rem',
//                     borderRadius: '10px',
//                     fontWeight: '700',
//                     fontSize: '0.82rem',
//                     cursor: 'pointer',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//                   }}
//                 >
//                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
//                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
//                 </button>
//               </div>

//               {activeFilterCount > 0 && (
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.5rem',
//                     flexWrap: 'wrap',
//                     background: '#fdf4ff',
//                     border: '1.5px solid #f0abfc',
//                     padding: '0.65rem 0.85rem',
//                     borderRadius: '12px',
//                     marginBottom: '1.25rem'
//                   }}
//                 >
//                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                     <Filter size={14} /> Active Filters:
//                   </span>

//                   {appliedFilters.category && appliedFilters.category !== 'All' && (
//                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
//                       Category: {appliedFilters.category}
//                     </span>
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
//                     style={{
//                       background: '#fef2f2',
//                       border: '1px solid #fca5a5',
//                       color: '#dc2626',
//                       padding: '2px 8px',
//                       borderRadius: '14px',
//                       fontSize: '0.75rem',
//                       fontWeight: '800',
//                       cursor: 'pointer',
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       gap: '3px',
//                       marginLeft: 'auto'
//                     }}
//                   >
//                     <RotateCcw size={12} /> Clear All
//                   </button>
//                 </div>
//               )}

//               {apiError ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
//                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
//                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
//                   <button
//                     type="button"
//                     onClick={() => fetchProducts(page, true)}
//                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
//                   >
//                     Retry Loading
//                   </button>
//                 </div>
//               ) : loading && products.length === 0 ? (
//                 <ProductGridSkeleton count={8} />
//               ) : displayedProducts.length === 0 ? (
//                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
//                   <h3>No matching products found</h3>
//                 </div>
//               ) : (
//                 <>
//                   <div className="product-grid">
//                     {displayedProducts.map((product) => {
//                       const isWishlisted = wishlist.some(w => String(w._id || w.id || w) === String(product._id || product.id));
//                       return (
//                         <ProductCard
//                           key={product._id || product.id}
//                           product={product}
//                           onAddToCart={handleAddToCart}
//                           onClickProductTitle={handleOpenProductDetail}
//                           onClickProductImage={handleOpenProductDetail}
//                           isWishlisted={isWishlisted}
//                           onToggleWishlist={handleToggleWishlist}
//                           cartItems={cartItems}
//                           onOpenCart={openCartModal}
//                         />
//                       );
//                     })}
//                   </div>

//                   {totalPages > 1 && (
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//                         <button
//                           type="button"
//                           disabled={page <= 1 || loading}
//                           onClick={() => handlePageChange(page - 1)}
//                           style={{
//                             padding: '10px 22px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
//                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
//                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
//                             border: '1px solid #e4e4e7',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           « Previous
//                         </button>

//                         <button
//                           type="button"
//                           disabled={page >= totalPages || loading}
//                           onClick={() => handlePageChange(page + 1)}
//                           style={{
//                             padding: '10px 24px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
//                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
//                             color: '#ffffff',
//                             border: 'none',
//                             borderRadius: '4px'
//                           }}
//                         >
//                           Next »
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </main>
//           </div>

//           <Footer
//             onOpenAboutUs={openAboutUsModal}
//             onOpenTermsPrivacy={openTermsModal}
//           />
//         </div>
//       )}

//       {/* MODALS */}
//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isDetailOpen}
//         onClose={() => window.history.back()}
//         onAddToCart={handleAddToCart}
//         allProducts={products}
//         onSelectProduct={handleSelectRelatedProduct}
//         isWishlisted={wishlist.some(w => String(w._id || w.id || w) === String(selectedProduct?._id || selectedProduct?.id))}
//         onToggleWishlist={handleToggleWishlist}
//         wishlist={wishlist}
//         historyLength={productHistory.length}
//         onGoBack={handleProductDetailBack}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <ImageLightboxModal
//         product={lightboxProduct}
//         isOpen={isLightboxOpen}
//         onClose={() => window.history.back()}
//       />

//       <AuthModal
//         isOpen={isAuthOpen}
//         onClose={() => window.history.back()}
//         onAuthSuccess={(userData) => setUser(userData)}
//       />

//       {/* USER PROFILE MODAL - Closes directly to Home when clicking (X) */}
//       <UserProfileModal
//         isOpen={isProfileOpen}
//         onClose={closeToHome}
//         user={user}
//         onLogout={handleLogout}
//         onUpdateUser={(updatedUser) => {
//           const merged = { ...user, ...updatedUser };
//           setUser(merged);
//           try {
//             localStorage.setItem('df_user', JSON.stringify(merged));
//           } catch (e) {}
//         }}
//         wishlist={wishlist}
//         allProducts={products}
//         onToggleWishlist={handleToggleWishlist}
//         onSelectProduct={(p) => {
//           handleOpenProductDetail(p);
//         }}
//         onAddToCart={handleAddToCart}
//         cartItems={cartItems}
//         onOpenCart={openCartModal}
//       />

//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={() => window.history.back()}
//         cartItems={cartItems}
//         onUpdateQuantity={handleUpdateQuantity}
//         onRemoveItem={handleRemoveFromCart}
//         onProceedToCheckout={() => {
//           navigateTo('checkout');
//         }}
//         user={user}
//         onOpenAuth={openAuthModal}
//         appliedCoupon={appliedCoupon}
//         setAppliedCoupon={setAppliedCoupon}
//       />

//       <CheckoutModal
//         isOpen={isCheckoutOpen}
//         onClose={() => window.history.back()}
//         onBackToCart={() => window.history.back()}
//         user={user}
//         onProceedToPayment={(addr) => {
//           setDeliveryAddress(addr);
//           navigateTo('payment', { deliveryAddress: addr });
//         }}
//       />

//       <PaymentModal
//         isOpen={isPaymentOpen}
//         onClose={() => window.history.back()}
//         onBackToCheckout={() => window.history.back()}
//         user={user}
//         cartItems={cartItems}
//         deliveryAddress={deliveryAddress}
//         appliedCoupon={appliedCoupon}
//         onOrderSuccess={() => {
//           setCartItems([]);
//           setAppliedCoupon(null);
//           closeToHome();
//           try { localStorage.removeItem('df_cart'); } catch (e) {}
//         }}
//       />

//       <NotificationModal
//         isOpen={isNotificationsOpen}
//         onClose={() => window.history.back()}
//         notifications={notifications}
//         readNotificationIds={readNotificationIds}
//         currentUserId={user?._id || user?.id || 'guest'}
//         onMarkAllAsRead={handleMarkAllNotificationsAsRead}
//         onMarkSingleAsRead={handleMarkSingleNotificationAsRead}
//         onNavigateToShop={() => setView('shop')}
//       />

//       {currentView === 'shop' && (
//         <MobileBottomNav
//           activeTab={
//             (isCartOpen || isCheckoutOpen || isPaymentOpen)
//               ? 'cart'
//               : (isProfileOpen || isAuthOpen)
//               ? 'account'
//               : 'home'
//           }
//           onHomeClick={() => {
//             if (isCartOpen || isProfileOpen || isAuthOpen || isDetailOpen || isCheckoutOpen || isPaymentOpen) {
//               closeToHome();
//             }
//             setSelectedCategory('All');
//             setPage(1);
//             updateUrlParams(1, 'All');
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//           }}
//           onAccountClick={() => {
//             if (user) openProfileModal();
//             else openAuthModal();
//           }}
//           onCartClick={openCartModal}
//           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
//           isLoggedIn={Boolean(user)}
//         />
//       )}

//       <ProductFilterModal
//         isOpen={isFilterModalOpen}
//         onClose={() => window.history.back()}
//         categories={categories}
//         allProducts={products}
//         currentFilters={appliedFilters}
//         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
//         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
//       />

//       <AboutUsModal
//         isOpen={isAboutUsOpen}
//         onClose={() => window.history.back()}
//       />

//       <TermsPrivacyModal
//         isOpen={isTermsOpen}
//         onClose={() => window.history.back()}
//         initialTab={termsTab}
//       />
//     </div>
//   );
// }

// export default App;












import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import MobileBottomNav from './components/MobileBottomNav';
import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
import ProductFilterModal from './components/ProductFilterModal';
import Footer from './components/Footer';
import AboutUsModal from './components/AboutUsModal';
import TermsPrivacyModal from './components/TermsPrivacyModal';
import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
import { fetchWithCache } from './utils/cache';
import { API_URL } from './api';
import { useSocket } from './context/SocketContext.jsx';
import './App.css';

function App() {
  // const socket = useSocket();   //socket error modification

  const socketContext = useSocket();
  const socket = socketContext?.socket || socketContext;

  // Direct detection from URL path or hash on initial load
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash === '#/admin') {
        return 'admin';
      }
    }
    return 'shop';
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('df_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsTab, setTermsTab] = useState('privacy');
  const [notifications, setNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const saved = localStorage.getItem('df_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showNotificationBubble, setShowNotificationBubble] = useState(false);
  const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

  // Unread Notifications Count Calculation
  const unreadNotificationCount = useMemo(() => {
    const currentId = user?._id || user?.id || '';
    return notifications.filter((n) => {
      const isReadInStorage = readNotificationIds.includes(n._id);
      const isReadInDb = currentId && Array.isArray(n.readBy) && n.readBy.includes(currentId);
      return !isReadInStorage && !isReadInDb;
    }).length;
  }, [notifications, readNotificationIds, user]);

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

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('df_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);

  // Read initial Page and Category from URL / Storage for refresh persistence
  const getInitialParams = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const p = parseInt(urlParams.get('page')) || parseInt(sessionStorage.getItem('df_page')) || 1;
      const cat = urlParams.get('cat') || sessionStorage.getItem('df_selected_cat') || 'All';
      return { page: p, cat };
    } catch (e) {
      return { page: 1, cat: 'All' };
    }
  };

  const initialValues = getInitialParams();
  const [selectedCategory, setSelectedCategory] = useState(initialValues.cat);
  const [searchTerm, setSearchTerm] = useState('');

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('df_storefront_products');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const productsRef = useRef(products);
  productsRef.current = products;

  const [loading, setLoading] = useState(() => products.length === 0);
  const [page, setPage] = useState(initialValues.page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
  const [apiError, setApiError] = useState(null);

  const catalogRef = useRef(null);
  const isFetchingRef = useRef(false);

  const updateUrlParams = (pageNum, catName) => {
    try {
      const url = new URL(window.location.href);
      if (pageNum > 1) url.searchParams.set('page', pageNum);
      else url.searchParams.delete('page');

      if (catName && catName !== 'All') url.searchParams.set('cat', catName);
      else url.searchParams.delete('cat');

      sessionStorage.setItem('df_page', pageNum);
      sessionStorage.setItem('df_selected_cat', catName);

      window.history.replaceState(window.history.state, '', url.toString());
    } catch (e) {}
  };

  // ============================================================
  // UNIFIED STACK-BASED HISTORY CONTROLLER
  // ============================================================
  const closeAllModals = useCallback(() => {
    setIsCartOpen(false);
    setIsProfileOpen(false);
    setIsAuthOpen(false);
    setIsDetailOpen(false);
    setIsLightboxOpen(false);
    setIsCheckoutOpen(false);
    setIsPaymentOpen(false);
    setIsNotificationsOpen(false);
    setIsFilterModalOpen(false);
    setIsAboutUsOpen(false);
    setIsTermsOpen(false);
    sessionStorage.removeItem('df_active_modal');
  }, []);

  const applyNavigationState = useCallback((state) => {
    const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');

    if (!state || !state.modal) {
      closeAllModals();
      if (state && state.view) {
        setCurrentView(state.view);
      } else {
        setCurrentView(isPathAdmin ? 'admin' : 'shop');
      }
      return;
    }

    if (state.view) {
      setCurrentView(state.view);
    } else {
      setCurrentView(isPathAdmin ? 'admin' : 'shop');
    }

    closeAllModals();
    sessionStorage.setItem('df_active_modal', state.modal);

    if (state.modal === 'cart') {
      setIsCartOpen(true);
    } else if (state.modal === 'profile') {
      setIsProfileOpen(true);
    } else if (state.modal === 'auth') {
      setIsAuthOpen(true);
    } else if (state.modal === 'detail') {
      if (state.product) {
        setSelectedProduct(state.product);
      } else if (state.productId) {
        const found = productsRef.current.find(p => String(p._id || p.id) === String(state.productId));
        if (found) setSelectedProduct(found);
      }
      setIsDetailOpen(true);
    } else if (state.modal === 'lightbox') {
      if (state.product) setLightboxProduct(state.product);
      setIsLightboxOpen(true);
    } else if (state.modal === 'checkout') {
      setIsCheckoutOpen(true);
    } else if (state.modal === 'payment') {
      if (state.deliveryAddress) setDeliveryAddress(state.deliveryAddress);
      setIsPaymentOpen(true);
    } else if (state.modal === 'notifications') {
      setIsNotificationsOpen(true);
    } else if (state.modal === 'filter') {
      setIsFilterModalOpen(true);
    } else if (state.modal === 'about') {
      setIsAboutUsOpen(true);
    } else if (state.modal === 'terms') {
      if (state.termsTab) setTermsTab(state.termsTab);
      setIsTermsOpen(true);
    }
  }, [closeAllModals]);

  const navigateTo = useCallback((modalName, extraData = {}) => {
    const statePayload = {
      modal: modalName,
      view: currentView,
      ...extraData
    };
    try {
      window.history.pushState(statePayload, '', window.location.href);
    } catch (e) {}
    applyNavigationState(statePayload);
  }, [currentView, applyNavigationState]);

  const closeToHome = useCallback(() => {
    closeAllModals();
    try {
      window.history.pushState({ modal: null, view: 'shop' }, '', '/');
    } catch (e) {}
  }, [closeAllModals]);

  useEffect(() => {
    const isPathAdmin = window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase().startsWith('/admin');
    const savedModal = window.history.state?.modal || sessionStorage.getItem('df_active_modal');

    if (isPathAdmin) {
      setCurrentView('admin');
    } else if (savedModal) {
      applyNavigationState(window.history.state || { modal: savedModal, view: 'shop' });
    } else if (!window.history.state) {
      window.history.replaceState(
        { modal: null, view: isPathAdmin ? 'admin' : 'shop' },
        '',
        window.location.href
      );
    }

    const handlePopState = (e) => {
      applyNavigationState(e.state);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [applyNavigationState]);

  const setView = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({ modal: null, view: 'admin' }, '', '/admin');
    } else {
      window.history.pushState({ modal: null, view: 'shop' }, '', '/');
    }
  };

  const openCartModal = () => navigateTo('cart');
  const openProfileModal = () => navigateTo('profile');
  const openAuthModal = () => navigateTo('auth');

  // Handle Google OAuth Callback URI (/auth/google/callback)
  useEffect(() => {
    const handleGoogleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const path = window.location.pathname;

      if (code && (path.includes('/auth/google/callback') || path === '/auth/google/callback')) {
        try {
          const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://www.diptofashion.in/auth/google/callback';
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Google authentication failed');

          const sanitizeForStorage = (u) => {
            if (!u) return u;
            const clone = { ...u };
            if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
            if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
            return clone;
          };

          const safeUser = sanitizeForStorage(data.user);
          localStorage.setItem('df_token', data.token);
          localStorage.setItem('df_user', JSON.stringify(safeUser));

          if (window.opener && window.opener !== window) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token: data.token, user: safeUser }, '*');
            window.close();
            return;
          }

          setUser(safeUser);
          window.history.replaceState({}, '', '/');
        } catch (err) {
          console.error('Google Auth Callback Error:', err);
          if (window.opener && window.opener !== window) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: err.message }, '*');
            window.close();
          } else {
            alert(`Google Authentication Error: ${err.message}`);
            window.history.replaceState({}, '', '/');
          }
        }
      }
    };

    handleGoogleOAuthCallback();
  }, []);

  const openFilterModal = () => navigateTo('filter');
  const openAboutUsModal = () => navigateTo('about');
  const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

  const openNotificationsModal = () => {
    setShowNotificationBubble(false);
    navigateTo('notifications');
  };

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

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`);
      if (!res.ok) return;
      const data = await res.json();

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.notifications)) {
        list = data.notifications;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      setNotifications(list);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n._id);
    const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('df_read_notifications', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleMarkSingleNotificationAsRead = (id) => {
    if (!readNotificationIds.includes(id)) {
      const updated = [...readNotificationIds, id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('df_read_notifications', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const fetchProducts = async (pageNum = page, forceRefresh = false) => {
    if (isFetchingRef.current && !forceRefresh) return;
    isFetchingRef.current = true;

    const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
    const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

    try {
      if (products.length === 0) setLoading(true);
      setApiError(null);

      const params = new URLSearchParams();
      if (sanitizedCat) params.append('category', sanitizedCat);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', pageNum);
      params.append('limit', 20);

      const { data: rawResponse } = await fetchWithCache(
        cacheKey,
        async () => {
          const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
          if (!res.ok) throw new Error(`Server status ${res.status}`);
          return await res.json();
        },
        { forceRefresh }
      );

      let fetchedProducts = [];
      let totalPagesVal = 1;
      let totalProductsVal = 0;

      if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
        fetchedProducts = rawResponse.products || [];
        totalPagesVal = rawResponse.totalPages || 1;
        totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
      } else if (Array.isArray(rawResponse)) {
        fetchedProducts = rawResponse;
        totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
        totalProductsVal = fetchedProducts.length;
      }

      setProducts(fetchedProducts);
      setTotalPages(totalPagesVal);
      setTotalProductsCount(totalProductsVal);
      setPage(pageNum);
      updateUrlParams(pageNum, selectedCategory);

      if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
        try {
          localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error fetching products:', e);
      if (products.length === 0) {
        setApiError('Unable to load products. Please check your connection.');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchProducts(newPage);
    updateUrlParams(newPage, selectedCategory);

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      if (catalogRef.current) {
        catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const DEFAULT_FILTERS = {
    category: 'All',
    presetPrice: 'all',
    minPrice: '',
    maxPrice: '',
    minDiscount: 0,
    minRating: 0,
    inStockOnly: false
  };

  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.category && appliedFilters.category !== 'All') count++;
    if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
    if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
    if (appliedFilters.minDiscount > 0) count++;
    if (appliedFilters.minRating > 0) count++;
    if (appliedFilters.inStockOnly) count++;
    return count;
  }, [appliedFilters]);

  const displayedProducts = useMemo(() => {
    let list = Array.isArray(products) ? products : [];

    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    } else if (appliedFilters.category && appliedFilters.category !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
      list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
    }
    if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
      list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
    }

    if (appliedFilters.presetPrice === 'under500') {
      list = list.filter((p) => Number(p.price) < 500);
    } else if (appliedFilters.presetPrice === '500-1000') {
      list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
    } else if (appliedFilters.presetPrice === '1000-2000') {
      list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
    } else if (appliedFilters.presetPrice === 'above2000') {
      list = list.filter((p) => Number(p.price) > 2000);
    }

    if (appliedFilters.minDiscount > 0) {
      list = list.filter((p) => {
        if (!p.mrp || p.mrp <= p.price) return false;
        const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
        return disc >= appliedFilters.minDiscount;
      });
    }

    if (appliedFilters.minRating > 0) {
      list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
    }

    if (appliedFilters.inStockOnly) {
      list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
    }

    return list;
  }, [products, selectedCategory, searchTerm, appliedFilters]);

  // Wishlist State Setup
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('df_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleToggleWishlist = (prod) => {
    if (!prod) return;
    const prodId = typeof prod === 'string' ? prod : (prod._id || prod.id);
    
    setWishlist((prev) => {
      const prevList = Array.isArray(prev) ? prev : [];
      const exists = prevList.some((item) => {
        const id = typeof item === 'string' ? item : (item?._id || item?.id);
        return String(id) === String(prodId);
      });

      let updated;
      if (exists) {
        updated = prevList.filter((item) => {
          const id = typeof item === 'string' ? item : (item?._id || item?.id);
          return String(id) !== String(prodId);
        });
      } else {
        updated = [...prevList, prod];
      }

      try {
        localStorage.setItem('df_wishlist', JSON.stringify(updated));
      } catch (e) {}

      return updated;
    });
  };

  const handleOpenProductDetail = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    updateProductHistory([product]);
    sessionStorage.setItem('df_opened_product_id', prodId);
    navigateTo('detail', { productId: prodId, product });
  };

  const handleSelectRelatedProduct = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    updateProductHistory([...productHistoryRef.current, product]);
    sessionStorage.setItem('df_opened_product_id', prodId);
    navigateTo('detail', { productId: prodId, product });
  };

  const handleProductDetailBack = () => {
    window.history.back();
  };

  const handleAddToCart = (product) => {
    const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
    if (remStock <= 0) {
      alert('Out of Stock - Cannot add to cart!');
      return;
    }

    const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
      ? product.availableSizes
      : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

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
      openCartModal();
      return;
    }

    if (sizesList.length > 1) {
      handleOpenProductDetail(product);
      return;
    }

    const autoSize = sizesList[0] || 'Standard';
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
      if (existing) {
        if (existing.quantity >= remStock) {
          alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
          return prevItems;
        }
        return prevItems.map((item) =>
          (item._id === product._id && item.selectedSize === autoSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
    });
    openCartModal();
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
      return;
    }
    const cartItem = cartItems.find((item) => item._id === productId);
    if (cartItem) {
      const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
      if (newQty > remStock) {
        alert(`Only ${remStock} item(s) available in stock!`);
        return;
      }
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

  useEffect(() => {
    fetchCategories();
    fetchNotifications();
  }, []);

  // // Safe Realtime Socket Sync for Products and Notifications
  // useEffect(() => {
  //   if (!socket || typeof socket.on !== 'function') return;

  //   const handleProductAdded = (newProduct) => {
  //     if (!newProduct) return;
  //     setProducts((prev) => [newProduct, ...prev.filter(p => (p._id || p.id) !== (newProduct._id || newProduct.id))]);
  //     setTotalProductsCount((prev) => prev + 1);
  //   };

  //   const handleProductUpdated = (updatedProduct) => {
  //     if (!updatedProduct) return;
  //     const targetId = String(updatedProduct._id || updatedProduct.id);
      
  //     setProducts((prev) =>
  //       prev.map((p) => (String(p._id || p.id) === targetId ? { ...p, ...updatedProduct } : p))
  //     );

  //     setSelectedProduct((prev) => {
  //       if (prev && String(prev._id || prev.id) === targetId) {
  //         return { ...prev, ...updatedProduct };
  //       }
  //       return prev;
  //     });
  //   };

  //   const handleProductDeleted = (deletedId) => {
  //     if (!deletedId) return;
  //     const targetId = String(deletedId);

  //     setProducts((prev) => prev.filter((p) => String(p._id || p.id) !== targetId));
  //     setTotalProductsCount((prev) => Math.max(0, prev - 1));

  //     setSelectedProduct((prev) => {
  //       if (prev && String(prev._id || prev.id) === targetId) {
  //         setIsDetailOpen(false);
  //         return null;
  //       }
  //       return prev;
  //     });
  //   };

  //   const handleNewNotif = (newNotif) => {
  //     if (!newNotif) return;
  //     setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
  //     setShowNotificationBubble(true);
  //     setLatestNotificationTitle(newNotif.title || 'New Announcement');
  //   };

  //   const handleDelNotif = (delId) => {
  //     if (!delId) return;
  //     setNotifications((prev) => prev.filter((n) => n._id !== delId));
  //   };

  //   socket.on('product_added', handleProductAdded);
  //   socket.on('product_updated', handleProductUpdated);
  //   socket.on('product_deleted', handleProductDeleted);
  //   socket.on('new_notification', handleNewNotif);
  //   socket.on('notification_deleted', handleDelNotif);

  //   return () => {
  //     if (socket && typeof socket.off === 'function') {
  //       socket.off('product_added', handleProductAdded);
  //       socket.off('product_updated', handleProductUpdated);
  //       socket.off('product_deleted', handleProductDeleted);
  //       socket.off('new_notification', handleNewNotif);
  //       socket.off('notification_deleted', handleDelNotif);
  //     }
  //   };
  // }, [socket]);


// Safe Realtime Socket Sync for Products and Notifications
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    console.log('[App.jsx] Socket listener attached actively.');

    const invalidateLocalCaches = () => {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('products_') || key === 'df_storefront_products') {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {}
    };

    const handleProductAdded = (newProduct) => {
      if (!newProduct) return;
      console.log('[LIVE SYNC] Product Added:', newProduct.name);
      invalidateLocalCaches();
      setProducts((prev) => [newProduct, ...prev.filter((p) => (p._id || p.id) !== (newProduct._id || newProduct.id))]);
      setTotalProductsCount((prev) => prev + 1);
    };

    const handleProductUpdated = (updatedProduct) => {
      if (!updatedProduct) return;
      console.log('[LIVE SYNC] Product Updated:', updatedProduct.name);
      invalidateLocalCaches();
      const targetId = String(updatedProduct._id || updatedProduct.id);

      setProducts((prev) =>
        prev.map((p) => (String(p._id || p.id) === targetId ? { ...p, ...updatedProduct } : p))
      );

      setSelectedProduct((prev) => {
        if (prev && String(prev._id || prev.id) === targetId) {
          return { ...prev, ...updatedProduct };
        }
        return prev;
      });
    };

    const handleProductDeleted = (deletedId) => {
      if (!deletedId) return;
      console.log('[LIVE SYNC] Product Deleted ID:', deletedId);
      invalidateLocalCaches();
      const targetId = String(deletedId);

      setProducts((prev) => prev.filter((p) => String(p._id || p.id) !== targetId));
      setTotalProductsCount((prev) => Math.max(0, prev - 1));

      setSelectedProduct((prev) => {
        if (prev && String(prev._id || prev.id) === targetId) {
          setIsDetailOpen(false);
          return null;
        }
        return prev;
      });
    };

    const handleNewNotif = (newNotif) => {
      if (!newNotif) return;
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
      setShowNotificationBubble(true);
      setLatestNotificationTitle(newNotif.title || 'New Announcement');
    };

    const handleDelNotif = (delId) => {
      if (!delId) return;
      setNotifications((prev) => prev.filter((n) => n._id !== delId));
    };

    socket.on('product_added', handleProductAdded);
    socket.on('product_updated', handleProductUpdated);
    socket.on('product_deleted', handleProductDeleted);
    socket.on('new_notification', handleNewNotif);
    socket.on('notification_deleted', handleDelNotif);

    return () => {
      socket.off('product_added', handleProductAdded);
      socket.off('product_updated', handleProductUpdated);
      socket.off('product_deleted', handleProductDeleted);
      socket.off('new_notification', handleNewNotif);
      socket.off('notification_deleted', handleDelNotif);
    };
  }, [socket]);




  useEffect(() => {
    fetchProducts(page, false);
  }, [selectedCategory, searchTerm]);

  return (
    <div className="app-container">
      {currentView === 'shop' && (
        <LiveSaleBanner onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
          updateUrlParams(1, cat);
        }} />
      )}

      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={openCartModal}
        user={currentView === 'admin' ? null : user}
        onOpenAuth={openAuthModal}
        onOpenProfile={openProfileModal}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setView}
        categories={categories}
        allProducts={products}
        onSelectProduct={handleOpenProductDetail}
        unreadNotificationCount={unreadNotificationCount}
        showNotificationBubble={showNotificationBubble}
        latestNotificationTitle={latestNotificationTitle}
        onOpenNotifications={openNotificationsModal}
        activeFilterCount={activeFilterCount}
        onOpenFilterModal={openFilterModal}
      />

      {currentView === 'admin' ? (
        <AdminPanel onExitAdmin={() => setView('shop')} />
      ) : (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          <div className="main-layout" style={{ flex: '1 0 auto' }}>
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catName) => {
                setSelectedCategory(catName);
                setPage(1);
                updateUrlParams(1, catName);
              }}
            />

            <main ref={catalogRef} className="products-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <h2>
                  <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
                    ({displayedProducts.length} products)
                  </span>
                </h2>

                <button
                  type="button"
                  onClick={openFilterModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
                    border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
                    color: activeFilterCount > 0 ? '#c026d3' : '#334155',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
                  <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
                </button>
              </div>

              {activeFilterCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    background: '#fdf4ff',
                    border: '1.5px solid #f0abfc',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={14} /> Active Filters:
                  </span>

                  {appliedFilters.category && appliedFilters.category !== 'All' && (
                    <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Category: {appliedFilters.category}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      padding: '2px 8px',
                      borderRadius: '14px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      marginLeft: 'auto'
                    }}
                  >
                    <RotateCcw size={12} /> Clear All
                  </button>
                </div>
              )}

              {apiError ? (
                <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                  <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
                  <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
                  <button
                    type="button"
                    onClick={() => fetchProducts(page, true)}
                    style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Retry Loading
                  </button>
                </div>
              ) : loading && products.length === 0 ? (
                <ProductGridSkeleton count={8} />
              ) : displayedProducts.length === 0 ? (
                <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3>No matching products found</h3>
                </div>
              ) : (
                <>
                  <div className="product-grid">
                    {displayedProducts.map((product) => {
                      const isWishlisted = wishlist.some(w => String(w._id || w.id || w) === String(product._id || product.id));
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
                          onOpenCart={openCartModal}
                        />
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          disabled={page <= 1 || loading}
                          onClick={() => handlePageChange(page - 1)}
                          style={{
                            padding: '10px 22px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
                            background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
                            color: page <= 1 || loading ? '#94a3b8' : '#18181b',
                            border: '1px solid #e4e4e7',
                            borderRadius: '4px'
                          }}
                        >
                          « Previous
                        </button>

                        <button
                          type="button"
                          disabled={page >= totalPages || loading}
                          onClick={() => handlePageChange(page + 1)}
                          style={{
                            padding: '10px 24px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
                            background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px'
                          }}
                        >
                          Next »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>

          <Footer
            onOpenAboutUs={openAboutUsModal}
            onOpenTermsPrivacy={openTermsModal}
          />
        </div>
      )}

      {/* MODALS */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => window.history.back()}
        onAddToCart={handleAddToCart}
        allProducts={products}
        onSelectProduct={handleSelectRelatedProduct}
        isWishlisted={wishlist.some(w => String(w._id || w.id || w) === String(selectedProduct?._id || selectedProduct?.id))}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        historyLength={productHistory.length}
        onGoBack={handleProductDetailBack}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItems={cartItems}
        onOpenCart={openCartModal}
      />

      <ImageLightboxModal
        product={lightboxProduct}
        isOpen={isLightboxOpen}
        onClose={() => window.history.back()}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => window.history.back()}
        onAuthSuccess={(userData) => setUser(userData)}
      />

      {/* USER PROFILE MODAL - Closes directly to Home when clicking (X) */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={closeToHome}
        user={user}
        onLogout={handleLogout}
        onUpdateUser={(updatedUser) => {
          const merged = { ...user, ...updatedUser };
          setUser(merged);
          try {
            localStorage.setItem('df_user', JSON.stringify(merged));
          } catch (e) {}
        }}
        wishlist={wishlist}
        allProducts={products}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={(p) => {
          handleOpenProductDetail(p);
        }}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
        onOpenCart={openCartModal}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => window.history.back()}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          navigateTo('checkout');
        }}
        user={user}
        onOpenAuth={openAuthModal}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => window.history.back()}
        onBackToCart={() => window.history.back()}
        user={user}
        onProceedToPayment={(addr) => {
          setDeliveryAddress(addr);
          navigateTo('payment', { deliveryAddress: addr });
        }}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => window.history.back()}
        onBackToCheckout={() => window.history.back()}
        user={user}
        cartItems={cartItems}
        deliveryAddress={deliveryAddress}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={() => {
          setCartItems([]);
          setAppliedCoupon(null);
          closeToHome();
          try { localStorage.removeItem('df_cart'); } catch (e) {}
        }}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => window.history.back()}
        notifications={notifications}
        readNotificationIds={readNotificationIds}
        currentUserId={user?._id || user?.id || 'guest'}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onMarkSingleAsRead={handleMarkSingleNotificationAsRead}
        onNavigateToShop={() => setView('shop')}
      />

      {currentView === 'shop' && (
        <MobileBottomNav
          activeTab={
            (isCartOpen || isCheckoutOpen || isPaymentOpen)
              ? 'cart'
              : (isProfileOpen || isAuthOpen)
              ? 'account'
              : 'home'
          }
          onHomeClick={() => {
            if (isCartOpen || isProfileOpen || isAuthOpen || isDetailOpen || isCheckoutOpen || isPaymentOpen) {
              closeToHome();
            }
            setSelectedCategory('All');
            setPage(1);
            updateUrlParams(1, 'All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAccountClick={() => {
            if (user) openProfileModal();
            else openAuthModal();
          }}
          onCartClick={openCartModal}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          isLoggedIn={Boolean(user)}
        />
      )}

      <ProductFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => window.history.back()}
        categories={categories}
        allProducts={products}
        currentFilters={appliedFilters}
        onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
        onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
      />

      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => window.history.back()}
      />

      <TermsPrivacyModal
        isOpen={isTermsOpen}
        onClose={() => window.history.back()}
        initialTab={termsTab}
      />
    </div>
  );
}

export default App;