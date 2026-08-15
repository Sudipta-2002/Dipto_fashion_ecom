// // // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // // import Navbar from './components/Navbar';
// // // import CategorySidebar from './components/CategorySidebar';
// // // import ProductCard from './components/ProductCard';
// // // import ProductDetailModal from './components/ProductDetailModal';
// // // import ImageLightboxModal from './components/ImageLightboxModal';
// // // import AuthModal from './components/AuthModal';
// // // import CartDrawer from './components/CartDrawer';
// // // import CheckoutModal from './components/CheckoutModal';
// // // import PaymentModal from './components/PaymentModal';
// // // import UserProfileModal from './components/UserProfileModal';
// // // import NotificationModal from './components/NotificationModal';
// // // import LiveSaleBanner from './components/LiveSaleBanner';
// // // import AdminPanel from './components/Admin/AdminPanel';
// // // import MobileBottomNav from './components/MobileBottomNav';
// // // import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// // // import ProductFilterModal from './components/ProductFilterModal';
// // // import Footer from './components/Footer';
// // // import AboutUsModal from './components/AboutUsModal';
// // // import TermsPrivacyModal from './components/TermsPrivacyModal';
// // // import { SlidersHorizontal, X, RotateCcw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
// // // import { fetchWithCache } from './utils/cache';
// // // import { API_URL, apiFetch, parseResponseSafely } from './api';
// // // import { useSocket } from './context/SocketContext.jsx';
// // // import './App.css';

// // // function App() {
// // //   // Navigation / View State ('shop' or 'admin')
// // //   const [currentView, setCurrentView] = useState('shop');

// // //   // Check URL pathname for /admin or #/admin
// // //   useEffect(() => {
// // //     const handleLocation = () => {
// // //       if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
// // //         setCurrentView('admin');
// // //       } else {
// // //         setCurrentView('shop');
// // //       }
// // //     };
// // //     handleLocation();
// // //     window.addEventListener('popstate', handleLocation);
// // //     return () => window.removeEventListener('popstate', handleLocation);
// // //   }, []);

// // //   const setView = (view) => {
// // //     setCurrentView(view);
// // //     if (view === 'admin') {
// // //       window.history.pushState(null, '', '/admin');
// // //     } else {
// // //       window.history.pushState(null, '', '/');
// // //     }
// // //   };

// // //   // Customer User State (Persistent Login)
// // //   const [user, setUser] = useState(() => {
// // //     const saved = localStorage.getItem('df_user');
// // //     return saved ? JSON.parse(saved) : null;
// // //   });

// // //   // Store Notifications & Real-Time SSE Listener
// // //   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
// // //   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
// // //   const [isTermsOpen, setIsTermsOpen] = useState(false);
// // //   const [termsTab, setTermsTab] = useState('privacy');
// // //   const [notifications, setNotifications] = useState([]);
// // //   const [readNotificationIds, setReadNotificationIds] = useState(() => {
// // //     const saved = localStorage.getItem('df_read_notifications');
// // //     return saved ? JSON.parse(saved) : [];
// // //   });
// // //   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
// // //   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

// // //   useEffect(() => {
// // //     fetchNotifications();
// // //     // Multi-device synchronization polling interval (12s)
// // //     const interval = setInterval(fetchNotifications, 12000);
// // //     const handleFocus = () => fetchNotifications();
// // //     window.addEventListener('focus', handleFocus);
// // //     return () => {
// // //       clearInterval(interval);
// // //       window.removeEventListener('focus', handleFocus);
// // //     };
// // //   }, []);

// // //   const fetchNotifications = async () => {
// // //     try {
// // //       const res = await apiFetch('/api/notifications');
// // //       const data = await parseResponseSafely(res);
// // //       if (res.ok && Array.isArray(data)) {
// // //         setNotifications(data);
// // //       } else {
// // //         const saved = localStorage.getItem('df_local_notifications');
// // //         if (saved) setNotifications(JSON.parse(saved));
// // //       }
// // //     } catch (e) {
// // //       const saved = localStorage.getItem('df_local_notifications');
// // //       if (saved) setNotifications(JSON.parse(saved));
// // //     }
// // //   };

// // //   // ============================================================
// // //   // REAL-TIME SOCKET.IO LISTENERS
// // //   // All global events from the backend are handled here so both
// // //   // Storefront and Admin get instant UI updates without refresh.
// // //   // ============================================================
// // //   const { socket } = useSocket();

// // //   useEffect(() => {
// // //     if (!socket) return;

// // //     // --- Product Catalog Sync ---
// // //     const onProductAdded = (newProduct) => {
// // //       console.log('[SOCKET] product_added', newProduct._id || newProduct.id);
// // //       setProducts((prev) => [newProduct, ...prev.filter(p => (p._id || p.id) !== (newProduct._id || newProduct.id))]);
// // //       setAllProducts((prev) => [newProduct, ...prev.filter(p => (p._id || p.id) !== (newProduct._id || newProduct.id))]);
// // //     };

// // //     const onProductUpdated = (updated) => {
// // //       console.log('[SOCKET] product_updated', updated._id || updated.id);
// // //       const updId = updated._id || updated.id;
// // //       setProducts((prev) => prev.map(p => (p._id || p.id) === updId ? { ...p, ...updated } : p));
// // //       setAllProducts((prev) => prev.map(p => (p._id || p.id) === updId ? { ...p, ...updated } : p));
// // //       // If the open product detail matches, update it too
// // //       setSelectedProduct((prev) => prev && (prev._id || prev.id) === updId ? { ...prev, ...updated } : prev);
// // //     };

// // //     const onProductDeleted = (deletedId) => {
// // //       console.log('[SOCKET] product_deleted', deletedId);
// // //       setProducts((prev) => prev.filter(p => (p._id || p.id) !== deletedId));
// // //       setAllProducts((prev) => prev.filter(p => (p._id || p.id) !== deletedId));
// // //     };

// // //     // --- New Order Placed (Admin alert + User confirmation) ---
// // //     const onNewOrderPlaced = (order) => {
// // //       console.log('[SOCKET] new_order_placed', order.orderId);
// // //       // Dispatch DOM event so AdminOrders can prepend the new order
// // //       window.dispatchEvent(new CustomEvent('df_new_order_placed', { detail: order }));
// // //       // Play the same chime alert used for notifications
// // //       try {
// // //         const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// // //         const osc = audioCtx.createOscillator();
// // //         const gain = audioCtx.createGain();
// // //         osc.type = 'sine';
// // //         osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
// // //         osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.15);
// // //         gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
// // //         osc.connect(gain);
// // //         gain.connect(audioCtx.destination);
// // //         osc.start();
// // //         osc.stop(audioCtx.currentTime + 0.35);
// // //       } catch (e) {}
// // //     };

// // //     // --- Order Status Updated (User My Orders sync) ---
// // //     const onOrderStatusUpdated = (updatedOrder) => {
// // //       console.log('[SOCKET] order_status_updated', updatedOrder.orderId, '->', updatedOrder.status);
// // //       // Dispatch a custom DOM event so UserProfileModal/AdminPanel can listen internally
// // //       window.dispatchEvent(new CustomEvent('df_order_status_updated', { detail: updatedOrder }));
// // //     };

// // //     // Helper to sanitize user object for localStorage (strips heavy base64 images)
// // //     const sanitizeUserForStorage = (u) => {
// // //       if (!u) return u;
// // //       const clone = { ...u };
// // //       if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// // //       if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// // //       return clone;
// // //     };

// // //     // --- User Profile Updated (Auth context sync) ---
// // //     const onUserProfileUpdated = (updatedUser) => {
// // //       console.log('[SOCKET] user_profile_updated', updatedUser._id || updatedUser.id);
// // //       setUser((prev) => {
// // //         if (!prev) return prev;
// // //         const prevId = prev._id || prev.id;
// // //         const updId = updatedUser._id || updatedUser.id;
// // //         if (prevId && updId && String(prevId) === String(updId)) {
// // //           const merged = { ...prev, ...updatedUser };
// // //           try { localStorage.setItem('df_user', JSON.stringify(sanitizeUserForStorage(merged))); } catch (e) {}
// // //           return merged;
// // //         }
// // //         return prev;
// // //       });
// // //     };

// // //     socket.on('product_added', onProductAdded);
// // //     socket.on('product_updated', onProductUpdated);
// // //     socket.on('product_deleted', onProductDeleted);
// // //     socket.on('new_order_placed', onNewOrderPlaced);
// // //     socket.on('order_status_updated', onOrderStatusUpdated);
// // //     socket.on('user_profile_updated', onUserProfileUpdated);

// // //     return () => {
// // //       socket.off('product_added', onProductAdded);
// // //       socket.off('product_updated', onProductUpdated);
// // //       socket.off('product_deleted', onProductDeleted);
// // //       socket.off('new_order_placed', onNewOrderPlaced);
// // //       socket.off('order_status_updated', onOrderStatusUpdated);
// // //       socket.off('user_profile_updated', onUserProfileUpdated);
// // //     };
// // //   }, [socket]);

// // //   // LOCAL ANNOUNCEMENT EVENT LISTENER FALLBACK
// // //   useEffect(() => {
// // //     const handleLocalNotif = (e) => {
// // //       if (e.detail) {
// // //         const newNotif = e.detail;
// // //         setNotifications((prev) => [newNotif, ...prev.filter(n => n._id !== newNotif._id)]);
// // //         setLatestNotificationTitle(newNotif.title);
// // //         setShowNotificationBubble(true);
// // //       }
// // //     };
// // //     window.addEventListener('df_new_notification', handleLocalNotif);
// // //     return () => window.removeEventListener('df_new_notification', handleLocalNotif);
// // //   }, []);

// // //   // LOCAL USER PROFILE UPDATE EVENT LISTENER FALLBACK
// // //   useEffect(() => {
// // //     const handleLocalProfileUpdate = (e) => {
// // //       if (e.detail) {
// // //         const updatedUser = e.detail;
// // //         setUser((prev) => {
// // //           const merged = { ...prev, ...updatedUser };
// // //           try {
// // //             const clone = { ...merged };
// // //             if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// // //             if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// // //             localStorage.setItem('df_user', JSON.stringify(clone));
// // //           } catch (err) {}
// // //           return merged;
// // //         });
// // //       }
// // //     };
// // //     window.addEventListener('df_user_profile_updated', handleLocalProfileUpdate);
// // //     return () => window.removeEventListener('df_user_profile_updated', handleLocalProfileUpdate);
// // //   }, []);

// // //   // REAL-TIME SSE LISTENER FOR STORE ANNOUNCEMENTS
// // //   useEffect(() => {
// // //     let eventSource = null;
// // //     let sseErrorCount = 0;
// // //     try {
// // //       eventSource = new EventSource(`${API_URL}/api/notifications/stream`);

// // //       eventSource.onmessage = (e) => {
// // //         try {
// // //           const data = JSON.parse(e.data);
// // //           if (data.type === 'new_notification' && data.notification) {
// // //             const newNotif = data.notification;
// // //             setNotifications((prev) => [newNotif, ...prev.filter(n => n._id !== newNotif._id)]);
// // //             setLatestNotificationTitle(newNotif.title);
// // //             setShowNotificationBubble(true);

// // //             // Chime audio alert for new announcement
// // //             try {
// // //               const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// // //               const osc = audioCtx.createOscillator();
// // //               const gain = audioCtx.createGain();
// // //               osc.type = 'sine';
// // //               osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
// // //               osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
// // //               gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
// // //               osc.connect(gain);
// // //               gain.connect(audioCtx.destination);
// // //               osc.start();
// // //               osc.stop(audioCtx.currentTime + 0.3);
// // //             } catch (err) {}
// // //           }
// // //         } catch (err) {}
// // //       };

// // //       eventSource.onerror = (err) => {
// // //         sseErrorCount++;
// // //         if (sseErrorCount > 2) {
// // //           console.warn('Storefront notification stream offline. Closing SSE connection gracefully.');
// // //           if (eventSource) eventSource.close();
// // //         }
// // //       };
// // //     } catch (e) {}

// // //     return () => {
// // //       if (eventSource) eventSource.close();
// // //     };
// // //   }, []);

// // //   // Persistent User / Guest ID for Notification readBy Tracking
// // //   const currentUserId = user?._id || user?.id || (() => {
// // //     try {
// // //       let saved = localStorage.getItem('df_guest_id');
// // //       if (!saved) {
// // //         saved = 'guest_' + Math.random().toString(36).substring(2, 9);
// // //         localStorage.setItem('df_guest_id', saved);
// // //       }
// // //       return saved;
// // //     } catch (e) {
// // //       return 'guest_user_1';
// // //     }
// // //   })();

// // //   const unreadNotificationCount = notifications.filter(
// // //     (n) => !readNotificationIds.includes(n._id) && (!Array.isArray(n.readBy) || !n.readBy.includes(currentUserId))
// // //   ).length;

// // //   const handleOpenNotifications = () => {
// // //     setIsNotificationsOpen(true);
// // //     setShowNotificationBubble(false);
// // //     // Automatically mark current notifications as viewed
// // //     const allIds = notifications.map(n => n._id);
// // //     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
// // //     setReadNotificationIds(updatedRead);
// // //     try {
// // //       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
// // //     } catch (e) {}
// // //   };

// // //   const handleMarkAllAsRead = async () => {
// // //     const allIds = notifications.map(n => n._id);
// // //     setReadNotificationIds(allIds);
// // //     setShowNotificationBubble(false);
// // //     try {
// // //       localStorage.setItem('df_read_notifications', JSON.stringify(allIds));
// // //     } catch (e) {}

// // //     notifications.forEach(async (n) => {
// // //       try {
// // //         await apiFetch(`/api/notifications/${n._id}/read`, {
// // //           method: 'POST',
// // //           headers: { 'Content-Type': 'application/json' },
// // //           body: JSON.stringify({ userId: currentUserId })
// // //         });
// // //       } catch (e) {}
// // //     });
// // //   };

// // //   const handleMarkSingleAsRead = async (id) => {
// // //     if (!readNotificationIds.includes(id)) {
// // //       const updated = [...readNotificationIds, id];
// // //       setReadNotificationIds(updated);
// // //       try {
// // //         localStorage.setItem('df_read_notifications', JSON.stringify(updated));
// // //       } catch (e) {}
// // //     }

// // //     try {
// // //       await apiFetch(`/api/notifications/${id}/read`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ userId: currentUserId })
// // //       });
// // //     } catch (e) {}
// // //   };

// // //   // Data States
// // //   const [categories, setCategories] = useState([]);
// // //   const [selectedCategory, setSelectedCategory] = useState('All');
// // //   const [searchTerm, setSearchTerm] = useState('');
// // //   const [products, setProducts] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [loadingMore, setLoadingMore] = useState(false);
// // //   const [page, setPage] = useState(1);
// // //   const [totalPages, setTotalPages] = useState(1);
// // //   const [totalProductsCount, setTotalProductsCount] = useState(0);
// // //   const [apiError, setApiError] = useState(null);

// // //   const catalogRef = useRef(null);
// // //   const isFetchingRef = useRef(false);

// // //   const fetchCategories = async () => {
// // //     try {
// // //       const { data } = await fetchWithCache('categories', async () => {
// // //         const res = await fetch(`${API_URL}/api/categories`);
// // //         return await res.json();
// // //       });
// // //       if (data) setCategories(data);
// // //     } catch (e) {
// // //       console.error('Error loading categories:', e);
// // //     }
// // //   };

// // //   const fetchProducts = async (pageNum = 1, forceRefresh = false) => {
// // //     if (isFetchingRef.current && !forceRefresh) return;
// // //     isFetchingRef.current = true;

// // //     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
// // //     const limitNum = pageNum === 1 ? 16 : 12;
// // //     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}_l${limitNum}`;
    
// // //     try {
// // //       if (pageNum === 1) {
// // //         setLoading(true);
// // //         setApiError(null);
// // //       } else {
// // //         setLoadingMore(true);
// // //       }

// // //       const buildUrl = (p) => {
// // //         let params = new URLSearchParams();
// // //         if (sanitizedCat) params.append('category', sanitizedCat);
// // //         if (searchTerm.trim()) params.append('search', searchTerm.trim());
// // //         params.append('page', p);
// // //         params.append('limit', 20); // 20 Products Per Page (4x5 desktop, 2x10 mobile)
// // //         params.append('t', Date.now());
// // //         return `${API_URL}/api/products?${params.toString()}`;
// // //       };

// // //       const { data: rawResponse } = await fetchWithCache(
// // //         cacheKey,
// // //         async () => {
// // //           const url = buildUrl(pageNum);
// // //           const res = await fetch(url);
// // //           if (!res.ok) {
// // //             throw new Error(`Server returned status ${res.status}`);
// // //           }
// // //           return await res.json();
// // //         },
// // //         { forceRefresh }
// // //       );

// // //       let fetchedProducts = [];
// // //       let totalPagesVal = 1;
// // //       let totalProductsVal = 0;

// // //       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
// // //         fetchedProducts = rawResponse.products || [];
// // //         totalPagesVal = rawResponse.totalPages || 1;
// // //         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
// // //       } else if (Array.isArray(rawResponse)) {
// // //         fetchedProducts = rawResponse;
// // //         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
// // //         totalProductsVal = fetchedProducts.length;
// // //       }

// // //       setProducts(fetchedProducts);
// // //       setTotalPages(totalPagesVal);
// // //       setTotalProductsCount(totalProductsVal);
// // //       setPage(pageNum);
// // //       setApiError(null);
// // //     } catch (e) {
// // //       console.error('Error fetching products:', e);
// // //       setApiError('Unable to load products. Please check your connection or try again.');
// // //     } finally {
// // //       setLoading(false);
// // //       setLoadingMore(false);
// // //       isFetchingRef.current = false;
// // //     }
// // //   };

// // //   // Flipkart-Style Product Filter State System
// // //   const DEFAULT_FILTERS = {
// // //     category: 'All',
// // //     presetPrice: 'all',
// // //     minPrice: '',
// // //     maxPrice: '',
// // //     minDiscount: 0,
// // //     minRating: 0,
// // //     inStockOnly: false
// // //   };

// // //   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
// // //   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

// // //   const activeFilterCount = useMemo(() => {
// // //     let count = 0;
// // //     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
// // //     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
// // //     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
// // //     if (appliedFilters.minDiscount > 0) count++;
// // //     if (appliedFilters.minRating > 0) count++;
// // //     if (appliedFilters.inStockOnly) count++;
// // //     return count;
// // //   }, [appliedFilters]);

// // //   const displayedProducts = useMemo(() => {
// // //     let list = Array.isArray(products) ? products : [];

// // //     // 1. Category Filter (from Category Sidebar OR Filter Modal)
// // //     if (selectedCategory && selectedCategory !== 'All') {
// // //       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
// // //     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
// // //       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
// // //     }

// // //     // 2. Search Term Filter
// // //     if (searchTerm.trim()) {
// // //       const q = searchTerm.trim().toLowerCase();
// // //       list = list.filter(
// // //         (p) =>
// // //           p.name?.toLowerCase().includes(q) ||
// // //           p.category?.toLowerCase().includes(q) ||
// // //           p.description?.toLowerCase().includes(q)
// // //       );
// // //     }

// // //     // 3. Custom Price Filter
// // //     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
// // //       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
// // //     }
// // //     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
// // //       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
// // //     }

// // //     // 4. Preset Price Range Filter
// // //     if (appliedFilters.presetPrice === 'under500') {
// // //       list = list.filter((p) => Number(p.price) < 500);
// // //     } else if (appliedFilters.presetPrice === '500-1000') {
// // //       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
// // //     } else if (appliedFilters.presetPrice === '1000-2000') {
// // //       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
// // //     } else if (appliedFilters.presetPrice === 'above2000') {
// // //       list = list.filter((p) => Number(p.price) > 2000);
// // //     }

// // //     // 5. Minimum Discount % Filter
// // //     if (appliedFilters.minDiscount > 0) {
// // //       list = list.filter((p) => {
// // //         if (!p.mrp || p.mrp <= p.price) return false;
// // //         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
// // //         return disc >= appliedFilters.minDiscount;
// // //       });
// // //     }

// // //     // 6. Minimum Rating Filter
// // //     if (appliedFilters.minRating > 0) {
// // //       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
// // //     }

// // //     // 7. In Stock Only Filter
// // //     if (appliedFilters.inStockOnly) {
// // //       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
// // //     }

// // //     return list;
// // //   }, [products, selectedCategory, searchTerm, appliedFilters]);

// // //   // Modals & Selected Product History
// // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // //   const [isDetailOpen, setIsDetailOpen] = useState(false);
// // //   const [productHistory, setProductHistory] = useState([]);
// // //   const productHistoryRef = useRef([]);

// // //   const updateProductHistory = (newHistory) => {
// // //     productHistoryRef.current = newHistory;
// // //     setProductHistory(newHistory);
// // //   };
// // //   const [lightboxProduct, setLightboxProduct] = useState(null);
// // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

// // //   // Customer Cart & Coupon State (Persistent across webpage refreshes)
// // //   const [cartItems, setCartItems] = useState(() => {
// // //     try {
// // //       const savedCart = localStorage.getItem('df_cart');
// // //       return savedCart ? JSON.parse(savedCart) : [];
// // //     } catch (e) {
// // //       return [];
// // //     }
// // //   });

// // //   const [appliedCoupon, setAppliedCoupon] = useState(null);

// // //   useEffect(() => {
// // //     try {
// // //       localStorage.setItem('df_cart', JSON.stringify(cartItems));
// // //     } catch (e) {
// // //       console.error('Failed to persist cart items:', e);
// // //     }
// // //   }, [cartItems]);

// // //   const [isAuthOpen, setIsAuthOpen] = useState(false);
// // //   const [isProfileOpen, setIsProfileOpen] = useState(false);
// // //   const [isCartOpen, setIsCartOpen] = useState(false);
// // //   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
// // //   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
// // //   const [deliveryAddress, setDeliveryAddress] = useState(null);

// // //   // Customer Wishlist State (Persistent)
// // //   // Safely parse initial state from localStorage (which stores only product ID strings or legacy product objects)
// // //   const [wishlist, setWishlist] = useState(() => {
// // //     try {
// // //       const saved = localStorage.getItem('df_wishlist');
// // //       if (!saved) return [];
// // //       const parsed = JSON.parse(saved);
// // //       // If array contains full objects from legacy cache, convert to array of IDs or objects
// // //       if (Array.isArray(parsed)) return parsed;
// // //       return [];
// // //     } catch (e) {
// // //       console.warn('LocalStorage wishlist read error:', e);
// // //       return [];
// // //     }
// // //   });

// // //   // Hydrate full wishlist products when allProducts loads or when user logs in
// // //   useEffect(() => {
// // //     const fetchUserWishlist = async () => {
// // //       const token = localStorage.getItem('df_token');
// // //       const userEmail = user?.email;
// // //       if (!token && !userEmail) return;

// // //       try {
// // //         let url = `${API_URL}/api/user/wishlist`;
// // //         if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;
// // //         const res = await apiFetch(url, {
// // //           headers: token ? { Authorization: `Bearer ${token}` } : {}
// // //         });
// // //         const data = await parseResponseSafely(res);
// // //         if (data && data.success && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
// // //           setWishlist(data.wishlist);
// // //         }
// // //       } catch (err) {
// // //         console.warn('Failed to hydrate wishlist from backend:', err);
// // //       }
// // //     };
// // //     fetchUserWishlist();
// // //   }, [user]);

// // //   // Safely persist ONLY Product IDs in LocalStorage inside a try-catch safeguard to prevent QuotaExceededError
// // //   useEffect(() => {
// // //     try {
// // //       // Extract ONLY string Product IDs to prevent QuotaExceededError
// // //       const wishlistIds = (wishlist || []).map((item) =>
// // //         typeof item === 'string' ? item : item?._id || item?.id
// // //       ).filter(Boolean);

// // //       localStorage.setItem('df_wishlist', JSON.stringify(wishlistIds));

// // //       // Sync backend if user logged in
// // //       const token = localStorage.getItem('df_token');
// // //       const userEmail = user?.email;
// // //       if (token || userEmail) {
// // //         apiFetch('/api/user/wishlist', {
// // //           method: 'POST',
// // //           headers: {
// // //             'Content-Type': 'application/json',
// // //             ...(token ? { Authorization: `Bearer ${token}` } : {})
// // //           },
// // //           body: JSON.stringify({ wishlistIds, email: userEmail })
// // //         }).catch(() => {});
// // //       }
// // //     } catch (e) {
// // //       console.warn('LocalStorage limit reached, relying on React state and backend persistence.', e);
// // //     }
// // //   }, [wishlist, user]);

// // //   const handleToggleWishlist = (prod) => {
// // //     if (!prod) return;
// // //     const prodId = typeof prod === 'string' ? prod : prod._id || prod.id;
    
// // //     setWishlist((prev) => {
// // //       const prevList = Array.isArray(prev) ? prev : [];
// // //       const exists = prevList.some((item) => {
// // //         const id = typeof item === 'string' ? item : item?._id || item?.id;
// // //         return id === prodId;
// // //       });

// // //       if (exists) {
// // //         return prevList.filter((item) => {
// // //           const id = typeof item === 'string' ? item : item?._id || item?.id;
// // //           return id !== prodId;
// // //         });
// // //       } else {
// // //         return [...prevList, prod];
// // //       }
// // //     });
// // //   };

// // //   useEffect(() => {
// // //     fetchCategories();
// // //   }, []);

// // //   // Reset pagination to page 1 on category or search term change
// // //   useEffect(() => {
// // //     setPage(1);
// // //     fetchProducts(1, true);
// // //   }, [selectedCategory, searchTerm]);

// // //   // Restore opened Product Detail Page if page was refreshed
// // //   useEffect(() => {
// // //     const hash = window.location.hash;
// // //     const match = hash.match(/#product=([^&]+)/);
// // //     const savedProdId = match ? match[1] : sessionStorage.getItem('df_opened_product_id');

// // //     if (savedProdId && products.length > 0) {
// // //       const found = products.find((p) => String(p._id || p.id) === String(savedProdId));
// // //       if (found) {
// // //         setSelectedProduct(found);
// // //         updateProductHistory([found]);
// // //         setIsDetailOpen(true);
// // //       }
// // //     }
// // //   }, [products]);

// // //   // Click Title or Catalogue Picture -> Open Full Product Details Modal
// // //   const handleOpenProductDetail = (product) => {
// // //     if (!product) return;
// // //     const prodId = product._id || product.id;
// // //     setSelectedProduct(product);
// // //     updateProductHistory([product]);
// // //     setIsDetailOpen(true);
// // //     sessionStorage.setItem('df_opened_product_id', prodId);
// // //     try {
// // //       window.history.replaceState(null, '', `#product=${prodId}`);
// // //     } catch (e) {}
// // //   };

// // //   // Related product click inside ProductDetailModal
// // //   const handleSelectRelatedProduct = (product) => {
// // //     if (!product) return;
// // //     const prodId = product._id || product.id;
// // //     setSelectedProduct(product);
// // //     updateProductHistory([...productHistoryRef.current, product]);
// // //     setIsDetailOpen(true);
// // //     sessionStorage.setItem('df_opened_product_id', prodId);
// // //     try {
// // //       window.history.replaceState(null, '', `#product=${prodId}`);
// // //     } catch (e) {}
// // //   };

// // //   // Requirement 3: Step-by-Step Back Navigation Handler
// // //   const handleProductDetailBack = () => {
// // //     if (productHistoryRef.current.length > 1) {
// // //       const nextHistory = [...productHistoryRef.current];
// // //       nextHistory.pop();
// // //       const prevProduct = nextHistory[nextHistory.length - 1];
// // //       const prodId = prevProduct._id || prevProduct.id;
// // //       updateProductHistory(nextHistory);
// // //       setSelectedProduct(prevProduct);
// // //       sessionStorage.setItem('df_opened_product_id', prodId);
// // //       try {
// // //         window.history.replaceState(null, '', `#product=${prodId}`);
// // //       } catch (e) {}
// // //     } else {
// // //       updateProductHistory([]);
// // //       setIsDetailOpen(false);
// // //       sessionStorage.removeItem('df_opened_product_id');
// // //       try {
// // //         window.history.replaceState(null, '', window.location.pathname.replace(/#.*$/, ''));
// // //       } catch (e) {}
// // //     }
// // //   };

// // //   // Explicit close -> Go directly to storefront
// // //   const handleCloseProductDetail = () => {
// // //     updateProductHistory([]);
// // //     setIsDetailOpen(false);
// // //     sessionStorage.removeItem('df_opened_product_id');
// // //     try {
// // //       window.history.replaceState(null, '', window.location.pathname.replace(/#.*$/, ''));
// // //     } catch (e) {}
// // //   };

// // //   const handleOpenImageLightbox = (product) => {
// // //     setSelectedProduct(product);
// // //     updateProductHistory([product]);
// // //     setIsDetailOpen(true);
// // //   };

// // //   // Cart Actions
// // //   const handleAddToCart = (product) => {
// // //     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
// // //     if (remStock <= 0) {
// // //       alert('Out of Stock - Cannot add to cart!');
// // //       return;
// // //     }

// // //     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
// // //       ? product.availableSizes
// // //       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

// // //     // Case 1: Size has already been chosen (e.g. from ProductDetailModal)
// // //     if (product.selectedSize) {
// // //       setCartItems((prevItems) => {
// // //         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
// // //         if (existing) {
// // //           return prevItems.map((item) =>
// // //             (item._id === product._id && item.selectedSize === product.selectedSize)
// // //               ? { ...item, quantity: item.quantity + 1 }
// // //               : item
// // //           );
// // //         }
// // //         return [...prevItems, { ...product, quantity: 1 }];
// // //       });
// // //       setIsCartOpen(true);
// // //       return;
// // //     }

// // //     // Case 2: Product has size options but user clicked "Add to Cart" on Storefront without selecting a size first!
// // //     if (sizesList.length > 0 && sizesList.length > 1) {
// // //       // Force open Product Details modal to prompt mandatory size selection
// // //       setSelectedProduct(product);
// // //       setIsDetailOpen(true);
// // //       return;
// // //     }

// // //     // Case 3: Single size (Free Size) or no size requirements
// // //     const autoSize = sizesList[0] || 'Standard';
// // //     setCartItems((prevItems) => {
// // //       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
// // //       if (existing) {
// // //         if (existing.quantity >= remStock) {
// // //           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
// // //           return prevItems;
// // //         }
// // //         return prevItems.map((item) =>
// // //           (item._id === product._id && item.selectedSize === autoSize)
// // //             ? { ...item, quantity: item.quantity + 1 }
// // //             : item
// // //         );
// // //       }
// // //       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
// // //     });
// // //     setIsCartOpen(true);
// // //   };

// // //   const handleUpdateQuantity = (productId, newQty) => {
// // //     if (newQty <= 0) {
// // //       handleRemoveFromCart(productId);
// // //       return;
// // //     }
// // //     const cartItem = cartItems.find((item) => item._id === productId);
// // //     if (cartItem) {
// // //       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
// // //       if (newQty > remStock) {
// // //         alert(`Only ${remStock} item(s) available in stock!`);
// // //         return;
// // //       }
// // //     }
// // //     setCartItems((prevItems) =>
// // //       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
// // //     );
// // //   };

// // //   const handleRemoveFromCart = (productId) => {
// // //     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
// // //   };

// // //   const handleLogout = () => {
// // //     localStorage.removeItem('df_token');
// // //     localStorage.removeItem('df_user');
// // //     setUser(null);
// // //   };

// // //   const handleProceedToCheckout = () => {
// // //     setIsCartOpen(false);
// // //     setIsCheckoutOpen(true);
// // //   };

// // //   const handleProceedToPayment = (address) => {
// // //     setDeliveryAddress(address);
// // //     setIsCheckoutOpen(false);
// // //     setIsPaymentOpen(true);
// // //   };

// // //   const handleBackToCheckout = () => {
// // //     setIsPaymentOpen(false);
// // //     setIsCheckoutOpen(true);
// // //   };

// // //   const handleBackToCart = () => {
// // //     setIsCheckoutOpen(false);
// // //     setIsCartOpen(true);
// // //   };

// // //   const handleOrderSuccess = () => {
// // //     setCartItems([]);
// // //     setAppliedCoupon(null);
// // //     setIsCartOpen(false);
// // //     setIsCheckoutOpen(false);
// // //     try {
// // //       sessionStorage.removeItem('df_cart');
// // //       localStorage.removeItem('df_cart');
// // //     } catch (e) {}
// // //   };

// // //   const closeAllModals = () => {
// // //     setIsCartOpen(false);
// // //     setIsCheckoutOpen(false);
// // //     setIsPaymentOpen(false);
// // //     setIsProfileOpen(false);
// // //     setIsAuthOpen(false);
// // //     setIsDetailOpen(false);
// // //     setIsNotificationsOpen(false);
// // //     setIsLightboxOpen(false);
// // //   };

// // //   const handleMobileHomeClick = () => {
// // //     closeAllModals();
// // //     setSelectedCategory('All');
// // //     window.scrollTo({ top: 0, behavior: 'smooth' });
// // //   };

// // //   const handleMobileAccountClick = () => {
// // //     closeAllModals();
// // //     if (user) {
// // //       setIsProfileOpen(true);
// // //     } else {
// // //       setIsAuthOpen(true);
// // //     }
// // //   };

// // //   const handleMobileCartClick = () => {
// // //     closeAllModals();
// // //     setIsCartOpen(true);
// // //   };

// // //   // Keyboard Escape & Browser Back Button (popstate) Handler for active modals
// // //   useEffect(() => {
// // //     const handlePopState = () => {
// // //       if (isPaymentOpen) {
// // //         setIsPaymentOpen(false);
// // //         setIsCheckoutOpen(true);
// // //       } else if (isCheckoutOpen) {
// // //         setIsCheckoutOpen(false);
// // //         setIsCartOpen(true);
// // //       } else if (isCartOpen) {
// // //         setIsCartOpen(false);
// // //       } else if (isProfileOpen) {
// // //         setIsProfileOpen(false);
// // //       } else if (isDetailOpen) {
// // //         if (productHistoryRef.current.length > 1) {
// // //           const nextHistory = [...productHistoryRef.current];
// // //           nextHistory.pop();
// // //           const prevProduct = nextHistory[nextHistory.length - 1];
// // //           updateProductHistory(nextHistory);
// // //           setSelectedProduct(prevProduct);
// // //         } else {
// // //           updateProductHistory([]);
// // //           setIsDetailOpen(false);
// // //         }
// // //       } else if (isLightboxOpen) {
// // //         setIsLightboxOpen(false);
// // //       } else if (isAuthOpen) {
// // //         setIsAuthOpen(false);
// // //       }
// // //     };

// // //     const handleKeyDown = (e) => {
// // //       if (e.key === 'Escape') {
// // //         if (isPaymentOpen) {
// // //           setIsPaymentOpen(false);
// // //         } else if (isCheckoutOpen) {
// // //           setIsCheckoutOpen(false);
// // //         } else if (isCartOpen) {
// // //           setIsCartOpen(false);
// // //         } else if (isProfileOpen) {
// // //           setIsProfileOpen(false);
// // //         } else if (isDetailOpen) {
// // //           handleProductDetailBack();
// // //         } else if (isLightboxOpen) {
// // //           setIsLightboxOpen(false);
// // //         } else if (isAuthOpen) {
// // //           setIsAuthOpen(false);
// // //         }
// // //       }
// // //     };

// // //     if (isPaymentOpen || isCheckoutOpen || isCartOpen || isProfileOpen || isDetailOpen || isLightboxOpen || isAuthOpen) {
// // //       window.history.pushState({ modalOpen: true }, '');
// // //     }

// // //     window.addEventListener('popstate', handlePopState);
// // //     window.addEventListener('keydown', handleKeyDown);

// // //     return () => {
// // //       window.removeEventListener('popstate', handlePopState);
// // //       window.removeEventListener('keydown', handleKeyDown);
// // //     };
// // //   }, [isPaymentOpen, isCheckoutOpen, isCartOpen, isProfileOpen, isDetailOpen, isLightboxOpen, isAuthOpen, productHistory.length]);

// // //   return (
// // //     <div className="app-container">
// // //       {/* Sticky Meesho-Style Live Sale Banner */}
// // //       {currentView === 'shop' && (
// // //         <LiveSaleBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />
// // //       )}

// // //       {/* Header / Navbar (User details isolated & hidden in admin mode) */}
// // //       <Navbar
// // //         searchTerm={searchTerm}
// // //         setSearchTerm={setSearchTerm}
// // //         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
// // //         onOpenCart={() => setIsCartOpen(true)}
// // //         user={currentView === 'admin' ? null : user}
// // //         onOpenAuth={() => setIsAuthOpen(true)}
// // //         onOpenProfile={() => setIsProfileOpen(true)}
// // //         onLogout={handleLogout}
// // //         currentView={currentView}
// // //         setCurrentView={setView}
// // //         categories={categories}
// // //         allProducts={products}
// // //         onSelectProduct={handleOpenProductDetail}
// // //         unreadNotificationCount={unreadNotificationCount}
// // //         showNotificationBubble={showNotificationBubble}
// // //         latestNotificationTitle={latestNotificationTitle}
// // //         onOpenNotifications={handleOpenNotifications}
// // //         activeFilterCount={activeFilterCount}
// // //         onOpenFilterModal={() => setIsFilterModalOpen(true)}
// // //       />

// // //       {/* Main View Switch */}
// // //       {currentView === 'admin' ? (
// // //         <AdminPanel onExitAdmin={() => setView('shop')} />
// // //       ) : (
// // //         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
// // //           {/* Top Section: Sidebar + Main Products Grid */}
// // //           <div className="main-layout" style={{ flex: '1 0 auto' }}>
// // //             {/* Left Category Sidebar */}
// // //             <CategorySidebar
// // //               categories={categories}
// // //               selectedCategory={selectedCategory}
// // //               onSelectCategory={(catName) => setSelectedCategory(catName)}
// // //             />

// // //             {/* Products Grid */}
// // //             <main ref={catalogRef} className="products-section">
// // //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
// // //               <h2>
// // //                 <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
// // //                 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
// // //                   ({displayedProducts.length} products)
// // //                 </span>
// // //               </h2>

// // //               <button
// // //                 type="button"
// // //                 onClick={() => setIsFilterModalOpen(true)}
// // //                 style={{
// // //                   display: 'inline-flex',
// // //                   alignItems: 'center',
// // //                   gap: '6px',
// // //                   background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
// // //                   border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
// // //                   color: activeFilterCount > 0 ? '#c026d3' : '#334155',
// // //                   padding: '0.45rem 0.85rem',
// // //                   borderRadius: '10px',
// // //                   fontWeight: '700',
// // //                   fontSize: '0.82rem',
// // //                   cursor: 'pointer',
// // //                   boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
// // //                 }}
// // //               >
// // //                 <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
// // //                 <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
// // //               </button>
// // //             </div>

// // //             {/* ACTIVE FILTERS STRIP */}
// // //             {activeFilterCount > 0 && (
// // //               <div
// // //                 style={{
// // //                   display: 'flex',
// // //                   alignItems: 'center',
// // //                   gap: '0.5rem',
// // //                   flexWrap: 'wrap',
// // //                   background: '#fdf4ff',
// // //                   border: '1.5px solid #f0abfc',
// // //                   padding: '0.65rem 0.85rem',
// // //                   borderRadius: '12px',
// // //                   marginBottom: '1.25rem'
// // //                 }}
// // //               >
// // //                 <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
// // //                   <Filter size={14} /> Active Filters:
// // //                 </span>

// // //                 {appliedFilters.category && appliedFilters.category !== 'All' && (
// // //                   <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
// // //                     Category: {appliedFilters.category}
// // //                   </span>
// // //                 )}

// // //                 {appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all' && (
// // //                   <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
// // //                     Price: {appliedFilters.presetPrice}
// // //                   </span>
// // //                 )}

// // //                 {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
// // //                   <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
// // //                     ₹{appliedFilters.minPrice || 0} - ₹{appliedFilters.maxPrice || '∞'}
// // //                   </span>
// // //                 )}

// // //                 {appliedFilters.minDiscount > 0 && (
// // //                   <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
// // //                     {appliedFilters.minDiscount}%+ Off
// // //                   </span>
// // //                 )}

// // //                 {appliedFilters.minRating > 0 && (
// // //                   <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
// // //                     {appliedFilters.minRating}★ & above
// // //                   </span>
// // //                 )}

// // //                 {appliedFilters.inStockOnly && (
// // //                   <span style={{ background: '#ffffff', border: '1px solid #bbf7d0', color: '#15803d', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
// // //                     In Stock Only
// // //                   </span>
// // //                 )}

// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
// // //                   style={{
// // //                     background: '#fef2f2',
// // //                     border: '1px solid #fca5a5',
// // //                     color: '#dc2626',
// // //                     padding: '2px 8px',
// // //                     borderRadius: '14px',
// // //                     fontSize: '0.75rem',
// // //                     fontWeight: '800',
// // //                     cursor: 'pointer',
// // //                     display: 'inline-flex',
// // //                     alignItems: 'center',
// // //                     gap: '3px',
// // //                     marginLeft: 'auto'
// // //                   }}
// // //                 >
// // //                   <RotateCcw size={12} /> Clear All
// // //                 </button>
// // //               </div>
// // //             )}

// // //             {apiError ? (
// // //               <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
// // //                 <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
// // //                 <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
// // //                   {apiError}
// // //                 </p>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => fetchProducts(1, true)}
// // //                   style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
// // //                 >
// // //                   Retry Loading
// // //                 </button>
// // //               </div>
// // //             ) : loading ? (
// // //               <ProductGridSkeleton count={8} />
// // //             ) : displayedProducts.length === 0 ? (
// // //               <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
// // //                 <h3>No matching products found</h3>
// // //                 <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
// // //                   Try resetting your filters or selecting another category.
// // //                 </p>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => {
// // //                     setAppliedFilters(DEFAULT_FILTERS);
// // //                     setSelectedCategory('All');
// // //                     setSearchTerm('');
// // //                   }}
// // //                   style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
// // //                 >
// // //                   Clear All Filters & Search
// // //                 </button>
// // //               </div>
// // //             ) : (
// // //               <>
// // //                 <div className="product-grid">
// // //                   {displayedProducts.map((product) => {
// // //                     const isWishlisted = wishlist.some(w => (w._id || w.id) === (product._id || product.id));
// // //                     return (
// // //                       <ProductCard
// // //                         key={product._id || product.id}
// // //                         product={product}
// // //                         onAddToCart={handleAddToCart}
// // //                         onClickProductTitle={handleOpenProductDetail}
// // //                         onClickProductImage={handleOpenProductDetail}
// // //                         isWishlisted={isWishlisted}
// // //                         onToggleWishlist={handleToggleWishlist}
// // //                         cartItems={cartItems}
// // //                         onOpenCart={() => setIsCartOpen(true)}
// // //                       />
// // //                     );
// // //                   })}
// // //                 </div>

// // //                 {/* Server-Side Pagination Bar */}
// // //                 {totalPages > 1 && (
// // //                   <div className="w-full flex flex-col items-center justify-center my-12 py-6 gap-4">
// // //                     {/* Pagination Buttons Row */}
// // //                     <div className="flex items-center justify-center gap-2 flex-wrap bg-white px-4 py-3 rounded-2xl shadow-sm border border-purple-100">
// // //                       {/* Prev Button */}
// // //                       <button
// // //                         type="button"
// // //                         disabled={page <= 1 || loading}
// // //                         onClick={() => {
// // //                           if (page > 1) {
// // //                             const newPage = page - 1;
// // //                             setPage(newPage);
// // //                             fetchProducts(newPage);
// // //                             window.scrollTo({ top: catalogRef.current?.offsetTop || 0, behavior: 'smooth' });
// // //                           }
// // //                         }}
// // //                         className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
// // //                           page <= 1 || loading
// // //                             ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
// // //                             : 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 active:scale-95 shadow-sm'
// // //                         }`}
// // //                       >
// // //                         Prev
// // //                       </button>

// // //                       {/* Step Back Arrow ‹ */}
// // //                       <button
// // //                         type="button"
// // //                         disabled={page <= 1 || loading}
// // //                         onClick={() => {
// // //                           if (page > 1) {
// // //                             const newPage = page - 1;
// // //                             setPage(newPage);
// // //                             fetchProducts(newPage);
// // //                             window.scrollTo({ top: catalogRef.current?.offsetTop || 0, behavior: 'smooth' });
// // //                           }
// // //                         }}
// // //                         className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition ${
// // //                           page <= 1 || loading ? 'opacity-40 cursor-not-allowed' : ''
// // //                         }`}
// // //                         title="Previous Page"
// // //                       >
// // //                         ‹
// // //                       </button>

// // //                       {/* Numbered Page Buttons */}
// // //                       {Array.from({ length: totalPages }, (_, i) => i + 1)
// // //                         .filter((p) => {
// // //                           if (totalPages <= 7) return true;
// // //                           return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
// // //                         })
// // //                         .reduce((acc, curr, idx, src) => {
// // //                           if (idx > 0 && curr - src[idx - 1] > 1) {
// // //                             acc.push('ellipsis-' + curr);
// // //                           }
// // //                           acc.push(curr);
// // //                           return acc;
// // //                         }, [])
// // //                         .map((item) => {
// // //                           if (typeof item === 'string' && item.startsWith('ellipsis')) {
// // //                             return (
// // //                               <span key={item} className="px-1 text-gray-400 font-bold select-none">
// // //                                 ...
// // //                               </span>
// // //                             );
// // //                           }

// // //                           const isCurrent = item === page;
// // //                           return (
// // //                             <button
// // //                               key={item}
// // //                               type="button"
// // //                               disabled={loading}
// // //                               onClick={() => {
// // //                                 if (item !== page) {
// // //                                   setPage(item);
// // //                                   fetchProducts(item);
// // //                                   window.scrollTo({ top: catalogRef.current?.offsetTop || 0, behavior: 'smooth' });
// // //                                 }
// // //                               }}
// // //                               className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
// // //                                 isCurrent
// // //                                   ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105 ring-2 ring-purple-400/40'
// // //                                   : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
// // //                               }`}
// // //                             >
// // //                               {item}
// // //                             </button>
// // //                           );
// // //                         })}

// // //                       {/* Step Forward Arrow › */}
// // //                       <button
// // //                         type="button"
// // //                         disabled={page >= totalPages || loading}
// // //                         onClick={() => {
// // //                           if (page < totalPages) {
// // //                             const newPage = page + 1;
// // //                             setPage(newPage);
// // //                             fetchProducts(newPage);
// // //                             window.scrollTo({ top: catalogRef.current?.offsetTop || 0, behavior: 'smooth' });
// // //                           }
// // //                         }}
// // //                         className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition ${
// // //                           page >= totalPages || loading ? 'opacity-40 cursor-not-allowed' : ''
// // //                         }`}
// // //                         title="Next Page"
// // //                       >
// // //                         ›
// // //                       </button>

// // //                       {/* Next Button */}
// // //                       <button
// // //                         type="button"
// // //                         disabled={page >= totalPages || loading}
// // //                         onClick={() => {
// // //                           if (page < totalPages) {
// // //                             const newPage = page + 1;
// // //                             setPage(newPage);
// // //                             fetchProducts(newPage);
// // //                             window.scrollTo({ top: catalogRef.current?.offsetTop || 0, behavior: 'smooth' });
// // //                           }
// // //                         }}
// // //                         className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
// // //                           page >= totalPages || loading
// // //                             ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
// // //                             : 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 active:scale-95 shadow-sm'
// // //                         }`}
// // //                       >
// // //                         Next
// // //                       </button>
// // //                     </div>

// // //                     {/* Summary Text */}
// // //                     <p className="text-xs text-gray-500 font-medium tracking-wide">
// // //                       Showing page <span className="font-semibold text-purple-700">{page}</span> of <span className="font-semibold text-purple-700">{totalPages}</span> • <span className="font-semibold text-gray-700">{totalProductsCount}</span> total products
// // //                     </p>
// // //                   </div>
// // //                 )}
// // //               </>
// // //             )}
// // //           </main>
// // //         </div>

// // //         {/* STOREFRONT FOOTER - OUTSIDE MAIN-LAYOUT GRID */}
// // //         <Footer
// // //           onOpenAboutUs={() => setIsAboutUsOpen(true)}
// // //           onOpenTermsPrivacy={(tab) => {
// // //             setTermsTab(tab);
// // //             setIsTermsOpen(true);
// // //           }}
// // //         />
// // //       </div>
// // //     )}

// // //       {/* Product Detail Modal */}
// // //       <ProductDetailModal
// // //         product={selectedProduct}
// // //         isOpen={isDetailOpen}
// // //         onClose={handleCloseProductDetail}
// // //         onAddToCart={handleAddToCart}
// // //         allProducts={products}
// // //         onSelectProduct={handleSelectRelatedProduct}
// // //         isWishlisted={wishlist.some(w => (w._id || w.id) === (selectedProduct?._id || selectedProduct?.id))}
// // //         onToggleWishlist={handleToggleWishlist}
// // //         wishlist={wishlist}
// // //         historyLength={productHistory.length}
// // //         onGoBack={handleProductDetailBack}
// // //         searchTerm={searchTerm}
// // //         setSearchTerm={setSearchTerm}
// // //         cartItems={cartItems}
// // //         onOpenCart={() => setIsCartOpen(true)}
// // //       />

// // //       {/* Direct Image Lightbox Modal */}
// // //       <ImageLightboxModal
// // //         product={lightboxProduct}
// // //         isOpen={isLightboxOpen}
// // //         onClose={() => setIsLightboxOpen(false)}
// // //       />

// // //       {/* Customer Auth Modal */}
// // //       <AuthModal
// // //         isOpen={isAuthOpen}
// // //         onClose={() => setIsAuthOpen(false)}
// // //         onAuthSuccess={(userData) => setUser(userData)}
// // //       />

// // //       {/* User Profile Modal */}
// // //       <UserProfileModal
// // //         isOpen={isProfileOpen}
// // //         onClose={() => setIsProfileOpen(false)}
// // //         user={user}
// // //         onLogout={handleLogout}
// // //         onUpdateUser={(updatedUser) => {
// // //           const merged = { ...user, ...updatedUser };
// // //           setUser(merged);
// // //           try {
// // //             const clone = { ...merged };
// // //             if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// // //             if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// // //             localStorage.setItem('df_user', JSON.stringify(clone));
// // //           } catch (e) {}
// // //         }}
// // //         wishlist={wishlist}
// // //         onToggleWishlist={handleToggleWishlist}
// // //         onSelectProduct={(p) => {
// // //           setSelectedProduct(p);
// // //           setIsDetailOpen(true);
// // //         }}
// // //         onAddToCart={handleAddToCart}
// // //         cartItems={cartItems}
// // //         onOpenCart={() => setIsCartOpen(true)}
// // //       />

// // //       {/* Shopping Cart Drawer */}
// // //       <CartDrawer
// // //         isOpen={isCartOpen}
// // //         onClose={() => setIsCartOpen(false)}
// // //         cartItems={cartItems}
// // //         onUpdateQuantity={handleUpdateQuantity}
// // //         onRemoveItem={handleRemoveFromCart}
// // //         onProceedToCheckout={handleProceedToCheckout}
// // //         user={user}
// // //         onOpenAuth={() => setIsAuthOpen(true)}
// // //         appliedCoupon={appliedCoupon}
// // //         setAppliedCoupon={setAppliedCoupon}
// // //       />

// // //       {/* Checkout Modal */}
// // //       <CheckoutModal
// // //         isOpen={isCheckoutOpen}
// // //         onClose={() => setIsCheckoutOpen(false)}
// // //         onBackToCart={handleBackToCart}
// // //         user={user}
// // //         onProceedToPayment={handleProceedToPayment}
// // //       />

// // //       {/* Payment Modal */}
// // //       <PaymentModal
// // //         isOpen={isPaymentOpen}
// // //         onClose={() => setIsPaymentOpen(false)}
// // //         onBackToCheckout={handleBackToCheckout}
// // //         user={user}
// // //         cartItems={cartItems}
// // //         deliveryAddress={deliveryAddress}
// // //         appliedCoupon={appliedCoupon}
// // //         onOrderSuccess={handleOrderSuccess}
// // //       />

// // //       {/* Store Front Notification Drawer & Detail Modal */}
// // //       <NotificationModal
// // //         isOpen={isNotificationsOpen}
// // //         onClose={() => setIsNotificationsOpen(false)}
// // //         notifications={notifications}
// // //         readNotificationIds={readNotificationIds}
// // //         currentUserId={currentUserId}
// // //         onMarkAllAsRead={handleMarkAllAsRead}
// // //         onMarkSingleAsRead={handleMarkSingleAsRead}
// // //         onNavigateToShop={() => setView('shop')}
// // //       />

// // //       {/* Mobile-Only Fixed Bottom Navigation Bar (Home, Account, Cart) */}
// // //       {currentView === 'shop' && (
// // //         <MobileBottomNav
// // //           activeTab={
// // //             (isCartOpen || isCheckoutOpen || isPaymentOpen)
// // //               ? 'cart'
// // //               : (isProfileOpen || isAuthOpen)
// // //               ? 'account'
// // //               : 'home'
// // //           }
// // //           onHomeClick={handleMobileHomeClick}
// // //           onAccountClick={handleMobileAccountClick}
// // //           onCartClick={handleMobileCartClick}
// // //           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
// // //           isLoggedIn={Boolean(user)}
// // //         />
// // //       )}

// // //       {/* Flipkart-Style Product Filter Modal */}
// // //       <ProductFilterModal
// // //         isOpen={isFilterModalOpen}
// // //         onClose={() => setIsFilterModalOpen(false)}
// // //         categories={categories}
// // //         allProducts={products}
// // //         currentFilters={appliedFilters}
// // //         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
// // //         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
// // //       />

// // //       {/* About Us Modal */}
// // //       <AboutUsModal
// // //         isOpen={isAboutUsOpen}
// // //         onClose={() => setIsAboutUsOpen(false)}
// // //       />

// // //       {/* Terms & Privacy Policy Modal */}
// // //       <TermsPrivacyModal
// // //         isOpen={isTermsOpen}
// // //         onClose={() => setIsTermsOpen(false)}
// // //         initialTab={termsTab}
// // //       />
// // //     </div>
// // //   );
// // // }

// // // export default App;







// // // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // // import Navbar from './components/Navbar';
// // // import CategorySidebar from './components/CategorySidebar';
// // // import ProductCard from './components/ProductCard';
// // // import ProductDetailModal from './components/ProductDetailModal';
// // // import ImageLightboxModal from './components/ImageLightboxModal';
// // // import AuthModal from './components/AuthModal';
// // // import CartDrawer from './components/CartDrawer';
// // // import CheckoutModal from './components/CheckoutModal';
// // // import PaymentModal from './components/PaymentModal';
// // // import UserProfileModal from './components/UserProfileModal';
// // // import NotificationModal from './components/NotificationModal';
// // // import LiveSaleBanner from './components/LiveSaleBanner';
// // // import AdminPanel from './components/Admin/AdminPanel';
// // // import MobileBottomNav from './components/MobileBottomNav';
// // // import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// // // import ProductFilterModal from './components/ProductFilterModal';
// // // import Footer from './components/Footer';
// // // import AboutUsModal from './components/AboutUsModal';
// // // import TermsPrivacyModal from './components/TermsPrivacyModal';
// // // import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// // // import { fetchWithCache } from './utils/cache';
// // // import { API_URL, apiFetch, parseResponseSafely } from './api';
// // // import { useSocket } from './context/SocketContext.jsx';
// // // import './App.css';

// // // function App() {
// // //   // Navigation / View State ('shop' or 'admin')
// // //   const [currentView, setCurrentView] = useState('shop');

// // //   // Check URL pathname for /admin or #/admin
// // //   useEffect(() => {
// // //     const handleLocation = () => {
// // //       if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
// // //         setCurrentView('admin');
// // //       } else {
// // //         setCurrentView('shop');
// // //       }
// // //     };
// // //     handleLocation();
// // //     window.addEventListener('popstate', handleLocation);
// // //     return () => window.removeEventListener('popstate', handleLocation);
// // //   }, []);

// // //   const setView = (view) => {
// // //     setCurrentView(view);
// // //     if (view === 'admin') {
// // //       window.history.pushState(null, '', '/admin');
// // //     } else {
// // //       window.history.pushState(null, '', '/');
// // //     }
// // //   };

// // //   // Customer User State (Persistent Login)
// // //   const [user, setUser] = useState(() => {
// // //     try {
// // //       const saved = localStorage.getItem('df_user');
// // //       return saved ? JSON.parse(saved) : null;
// // //     } catch (e) {
// // //       return null;
// // //     }
// // //   });

// // //   // Store Notifications & Real-Time Listeners
// // //   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
// // //   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
// // //   const [isTermsOpen, setIsTermsOpen] = useState(false);
// // //   const [termsTab, setTermsTab] = useState('privacy');
// // //   const [notifications, setNotifications] = useState([]);
// // //   const [readNotificationIds, setReadNotificationIds] = useState(() => {
// // //     try {
// // //       const saved = localStorage.getItem('df_read_notifications');
// // //       return saved ? JSON.parse(saved) : [];
// // //     } catch (e) {
// // //       return [];
// // //     }
// // //   });
// // //   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
// // //   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

// // //   useEffect(() => {
// // //     fetchNotifications();
// // //     const interval = setInterval(fetchNotifications, 15000);
// // //     const handleFocus = () => fetchNotifications();
// // //     window.addEventListener('focus', handleFocus);
// // //     return () => {
// // //       clearInterval(interval);
// // //       window.removeEventListener('focus', handleFocus);
// // //     };
// // //   }, []);

// // //   const fetchNotifications = async () => {
// // //     try {
// // //       const res = await apiFetch('/api/notifications');
// // //       const data = await parseResponseSafely(res);
// // //       if (res.ok && Array.isArray(data)) {
// // //         setNotifications(data);
// // //       } else {
// // //         const saved = localStorage.getItem('df_local_notifications');
// // //         if (saved) setNotifications(JSON.parse(saved));
// // //       }
// // //     } catch (e) {
// // //       const saved = localStorage.getItem('df_local_notifications');
// // //       if (saved) setNotifications(JSON.parse(saved));
// // //     }
// // //   };

// // //   // ============================================================
// // //   // REAL-TIME SOCKET.IO LISTENERS
// // //   // ============================================================
// // //   const { socket } = useSocket();

// // //   useEffect(() => {
// // //     if (!socket) return;

// // //     const onProductAdded = (newProduct) => {
// // //       setProducts((prev) => [newProduct, ...prev.filter(p => (p._id || p.id) !== (newProduct._id || newProduct.id))]);
// // //     };

// // //     const onProductUpdated = (updated) => {
// // //       const updId = updated._id || updated.id;
// // //       setProducts((prev) => prev.map(p => (p._id || p.id) === updId ? { ...p, ...updated } : p));
// // //       setSelectedProduct((prev) => prev && (prev._id || prev.id) === updId ? { ...prev, ...updated } : prev);
// // //     };

// // //     const onProductDeleted = (deletedId) => {
// // //       setProducts((prev) => prev.filter(p => (p._id || p.id) !== deletedId));
// // //     };

// // //     const onNewOrderPlaced = (order) => {
// // //       window.dispatchEvent(new CustomEvent('df_new_order_placed', { detail: order }));
// // //       try {
// // //         const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// // //         const osc = audioCtx.createOscillator();
// // //         const gain = audioCtx.createGain();
// // //         osc.type = 'sine';
// // //         osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
// // //         osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.15);
// // //         gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
// // //         osc.connect(gain);
// // //         gain.connect(audioCtx.destination);
// // //         osc.start();
// // //         osc.stop(audioCtx.currentTime + 0.35);
// // //       } catch (e) {}
// // //     };

// // //     const onOrderStatusUpdated = (updatedOrder) => {
// // //       window.dispatchEvent(new CustomEvent('df_order_status_updated', { detail: updatedOrder }));
// // //     };

// // //     const sanitizeUserForStorage = (u) => {
// // //       if (!u) return u;
// // //       const clone = { ...u };
// // //       if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// // //       if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// // //       return clone;
// // //     };

// // //     const onUserProfileUpdated = (updatedUser) => {
// // //       setUser((prev) => {
// // //         if (!prev) return prev;
// // //         const prevId = prev._id || prev.id;
// // //         const updId = updatedUser._id || updatedUser.id;
// // //         if (prevId && updId && String(prevId) === String(updId)) {
// // //           const merged = { ...prev, ...updatedUser };
// // //           try { localStorage.setItem('df_user', JSON.stringify(sanitizeUserForStorage(merged))); } catch (e) {}
// // //           return merged;
// // //         }
// // //         return prev;
// // //       });
// // //     };

// // //     socket.on('product_added', onProductAdded);
// // //     socket.on('product_updated', onProductUpdated);
// // //     socket.on('product_deleted', onProductDeleted);
// // //     socket.on('new_order_placed', onNewOrderPlaced);
// // //     socket.on('order_status_updated', onOrderStatusUpdated);
// // //     socket.on('user_profile_updated', onUserProfileUpdated);

// // //     return () => {
// // //       socket.off('product_added', onProductAdded);
// // //       socket.off('product_updated', onProductUpdated);
// // //       socket.off('product_deleted', onProductDeleted);
// // //       socket.off('new_order_placed', onNewOrderPlaced);
// // //       socket.off('order_status_updated', onOrderStatusUpdated);
// // //       socket.off('user_profile_updated', onUserProfileUpdated);
// // //     };
// // //   }, [socket]);

// // //   // LOCAL ANNOUNCEMENT EVENT LISTENER
// // //   useEffect(() => {
// // //     const handleLocalNotif = (e) => {
// // //       if (e.detail) {
// // //         const newNotif = e.detail;
// // //         setNotifications((prev) => [newNotif, ...prev.filter(n => n._id !== newNotif._id)]);
// // //         setLatestNotificationTitle(newNotif.title);
// // //         setShowNotificationBubble(true);
// // //       }
// // //     };
// // //     window.addEventListener('df_new_notification', handleLocalNotif);
// // //     return () => window.removeEventListener('df_new_notification', handleLocalNotif);
// // //   }, []);

// // //   // LOCAL USER PROFILE UPDATE EVENT LISTENER
// // //   useEffect(() => {
// // //     const handleLocalProfileUpdate = (e) => {
// // //       if (e.detail) {
// // //         const updatedUser = e.detail;
// // //         setUser((prev) => {
// // //           const merged = { ...prev, ...updatedUser };
// // //           try {
// // //             const clone = { ...merged };
// // //             if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// // //             if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// // //             localStorage.setItem('df_user', JSON.stringify(clone));
// // //           } catch (err) {}
// // //           return merged;
// // //         });
// // //       }
// // //     };
// // //     window.addEventListener('df_user_profile_updated', handleLocalProfileUpdate);
// // //     return () => window.removeEventListener('df_user_profile_updated', handleLocalProfileUpdate);
// // //   }, []);

// // //   // Persistent User ID for readBy Tracking
// // //   const currentUserId = user?._id || user?.id || (() => {
// // //     try {
// // //       let saved = localStorage.getItem('df_guest_id');
// // //       if (!saved) {
// // //         saved = 'guest_' + Math.random().toString(36).substring(2, 9);
// // //         localStorage.setItem('df_guest_id', saved);
// // //       }
// // //       return saved;
// // //     } catch (e) {
// // //       return 'guest_user_1';
// // //     }
// // //   })();

// // //   const unreadNotificationCount = notifications.filter(
// // //     (n) => !readNotificationIds.includes(n._id) && (!Array.isArray(n.readBy) || !n.readBy.includes(currentUserId))
// // //   ).length;

// // //   const handleOpenNotifications = () => {
// // //     setIsNotificationsOpen(true);
// // //     setShowNotificationBubble(false);
// // //     const allIds = notifications.map(n => n._id);
// // //     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
// // //     setReadNotificationIds(updatedRead);
// // //     try {
// // //       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
// // //     } catch (e) {}
// // //   };

// // //   const handleMarkAllAsRead = async () => {
// // //     const allIds = notifications.map(n => n._id);
// // //     setReadNotificationIds(allIds);
// // //     setShowNotificationBubble(false);
// // //     try {
// // //       localStorage.setItem('df_read_notifications', JSON.stringify(allIds));
// // //     } catch (e) {}

// // //     notifications.forEach(async (n) => {
// // //       try {
// // //         await apiFetch(`/api/notifications/${n._id}/read`, {
// // //           method: 'POST',
// // //           headers: { 'Content-Type': 'application/json' },
// // //           body: JSON.stringify({ userId: currentUserId })
// // //         });
// // //       } catch (e) {}
// // //     });
// // //   };

// // //   const handleMarkSingleAsRead = async (id) => {
// // //     if (!readNotificationIds.includes(id)) {
// // //       const updated = [...readNotificationIds, id];
// // //       setReadNotificationIds(updated);
// // //       try {
// // //         localStorage.setItem('df_read_notifications', JSON.stringify(updated));
// // //       } catch (e) {}
// // //     }

// // //     try {
// // //       await apiFetch(`/api/notifications/${id}/read`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ userId: currentUserId })
// // //       });
// // //     } catch (e) {}
// // //   };

// // //   // ============================================================
// // //   // FAST PRODUCT LOADING & INSTANT STATE WITH PRE-FETCHING
// // //   // ============================================================
// // //   const [categories, setCategories] = useState([]);
// // //   const [selectedCategory, setSelectedCategory] = useState('All');
// // //   const [searchTerm, setSearchTerm] = useState('');

// // //   // 1. Instant Cache Hydration to eliminate initial blank screen
// // //   const [products, setProducts] = useState(() => {
// // //     try {
// // //       const cached = localStorage.getItem('df_storefront_products');
// // //       return cached ? JSON.parse(cached) : [];
// // //     } catch (e) {
// // //       return [];
// // //     }
// // //   });

// // //   // Only show loading spinner/skeleton if we have 0 products in initial cache
// // //   const [loading, setLoading] = useState(() => products.length === 0);
// // //   const [page, setPage] = useState(1);
// // //   const [totalPages, setTotalPages] = useState(1);
// // //   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
// // //   const [apiError, setApiError] = useState(null);

// // //   const catalogRef = useRef(null);
// // //   const isFetchingRef = useRef(false);

// // //   const fetchCategories = async () => {
// // //     try {
// // //       const { data } = await fetchWithCache('categories', async () => {
// // //         const res = await fetch(`${API_URL}/api/categories`);
// // //         return await res.json();
// // //       });
// // //       if (data) setCategories(data);
// // //     } catch (e) {
// // //       console.error('Error loading categories:', e);
// // //     }
// // //   };

// // //   const fetchProducts = async (pageNum = 1, forceRefresh = false) => {
// // //     if (isFetchingRef.current && !forceRefresh) return;
// // //     isFetchingRef.current = true;

// // //     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
// // //     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

// // //     try {
// // //       if (products.length === 0) setLoading(true);
// // //       setApiError(null);

// // //       const params = new URLSearchParams();
// // //       if (sanitizedCat) params.append('category', sanitizedCat);
// // //       if (searchTerm.trim()) params.append('search', searchTerm.trim());
// // //       params.append('page', pageNum);
// // //       params.append('limit', 20);

// // //       const { data: rawResponse } = await fetchWithCache(
// // //         cacheKey,
// // //         async () => {
// // //           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
// // //           if (!res.ok) throw new Error(`Server status ${res.status}`);
// // //           return await res.json();
// // //         },
// // //         { forceRefresh }
// // //       );

// // //       let fetchedProducts = [];
// // //       let totalPagesVal = 1;
// // //       let totalProductsVal = 0;

// // //       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
// // //         fetchedProducts = rawResponse.products || [];
// // //         totalPagesVal = rawResponse.totalPages || 1;
// // //         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
// // //       } else if (Array.isArray(rawResponse)) {
// // //         fetchedProducts = rawResponse;
// // //         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
// // //         totalProductsVal = fetchedProducts.length;
// // //       }

// // //       setProducts(fetchedProducts);
// // //       setTotalPages(totalPagesVal);
// // //       setTotalProductsCount(totalProductsVal);
// // //       setPage(pageNum);

// // //       // Cache the first page locally for instant initial renders on future visits
// // //       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
// // //         try {
// // //           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
// // //         } catch (e) {}
// // //       }

// // //       // PRE-FETCH NEXT PAGE IN BACKGROUND (0ms Instant Transition on Next click)
// // //       if (pageNum < totalPagesVal) {
// // //         const nextParams = new URLSearchParams();
// // //         if (sanitizedCat) nextParams.append('category', sanitizedCat);
// // //         if (searchTerm.trim()) nextParams.append('search', searchTerm.trim());
// // //         nextParams.append('page', pageNum + 1);
// // //         nextParams.append('limit', 20);

// // //         fetchWithCache(
// // //           `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum + 1}`,
// // //           async () => {
// // //             const res = await fetch(`${API_URL}/api/products?${nextParams.toString()}`);
// // //             return await res.json();
// // //           }
// // //         ).catch(() => {});
// // //       }
// // //     } catch (e) {
// // //       console.error('Error fetching products:', e);
// // //       if (products.length === 0) {
// // //         setApiError('Unable to load products. Please check your connection or try again.');
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //       isFetchingRef.current = false;
// // //     }
// // //   };

// // //   // Click Next/Previous -> Switch page & smoothly scroll to the ABSOLUTE TOP of the webpage
// // //   const handlePageChange = (newPage) => {
// // //     if (newPage === page || newPage < 1 || newPage > totalPages) return;
    
// // //     setPage(newPage);
// // //     fetchProducts(newPage);

// // //     // 1. Instantly scroll to the absolute top (Navbar & Banner included)
// // //     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

// // //     // 2. Safeguard scroll after state re-render
// // //     setTimeout(() => {
// // //       window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
// // //     }, 100);
// // //   };

// // //   // Product Filters
// // //   const DEFAULT_FILTERS = {
// // //     category: 'All',
// // //     presetPrice: 'all',
// // //     minPrice: '',
// // //     maxPrice: '',
// // //     minDiscount: 0,
// // //     minRating: 0,
// // //     inStockOnly: false
// // //   };

// // //   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
// // //   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

// // //   const activeFilterCount = useMemo(() => {
// // //     let count = 0;
// // //     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
// // //     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
// // //     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
// // //     if (appliedFilters.minDiscount > 0) count++;
// // //     if (appliedFilters.minRating > 0) count++;
// // //     if (appliedFilters.inStockOnly) count++;
// // //     return count;
// // //   }, [appliedFilters]);

// // //   const displayedProducts = useMemo(() => {
// // //     let list = Array.isArray(products) ? products : [];

// // //     // Category Filter
// // //     if (selectedCategory && selectedCategory !== 'All') {
// // //       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
// // //     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
// // //       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
// // //     }

// // //     // Search Filter
// // //     if (searchTerm.trim()) {
// // //       const q = searchTerm.trim().toLowerCase();
// // //       list = list.filter(
// // //         (p) =>
// // //           p.name?.toLowerCase().includes(q) ||
// // //           p.category?.toLowerCase().includes(q) ||
// // //           p.description?.toLowerCase().includes(q)
// // //       );
// // //     }

// // //     // Custom Price Filter
// // //     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
// // //       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
// // //     }
// // //     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
// // //       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
// // //     }

// // //     // Preset Price Range
// // //     if (appliedFilters.presetPrice === 'under500') {
// // //       list = list.filter((p) => Number(p.price) < 500);
// // //     } else if (appliedFilters.presetPrice === '500-1000') {
// // //       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
// // //     } else if (appliedFilters.presetPrice === '1000-2000') {
// // //       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
// // //     } else if (appliedFilters.presetPrice === 'above2000') {
// // //       list = list.filter((p) => Number(p.price) > 2000);
// // //     }

// // //     // Minimum Discount %
// // //     if (appliedFilters.minDiscount > 0) {
// // //       list = list.filter((p) => {
// // //         if (!p.mrp || p.mrp <= p.price) return false;
// // //         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
// // //         return disc >= appliedFilters.minDiscount;
// // //       });
// // //     }

// // //     // Minimum Rating
// // //     if (appliedFilters.minRating > 0) {
// // //       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
// // //     }

// // //     // In Stock Only
// // //     if (appliedFilters.inStockOnly) {
// // //       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
// // //     }

// // //     return list;
// // //   }, [products, selectedCategory, searchTerm, appliedFilters]);

// // //   // Modal States
// // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // //   const [isDetailOpen, setIsDetailOpen] = useState(false);
// // //   const [productHistory, setProductHistory] = useState([]);
// // //   const productHistoryRef = useRef([]);

// // //   const updateProductHistory = (newHistory) => {
// // //     productHistoryRef.current = newHistory;
// // //     setProductHistory(newHistory);
// // //   };
// // //   const [lightboxProduct, setLightboxProduct] = useState(null);
// // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

// // //   // Cart & Coupon State
// // //   const [cartItems, setCartItems] = useState(() => {
// // //     try {
// // //       const savedCart = localStorage.getItem('df_cart');
// // //       return savedCart ? JSON.parse(savedCart) : [];
// // //     } catch (e) {
// // //       return [];
// // //     }
// // //   });

// // //   const [appliedCoupon, setAppliedCoupon] = useState(null);

// // //   useEffect(() => {
// // //     try {
// // //       localStorage.setItem('df_cart', JSON.stringify(cartItems));
// // //     } catch (e) {
// // //       console.error('Failed to persist cart items:', e);
// // //     }
// // //   }, [cartItems]);

// // //   const [isAuthOpen, setIsAuthOpen] = useState(false);
// // //   const [isProfileOpen, setIsProfileOpen] = useState(false);
// // //   const [isCartOpen, setIsCartOpen] = useState(false);
// // //   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
// // //   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
// // //   const [deliveryAddress, setDeliveryAddress] = useState(null);

// // //   // Customer Wishlist State
// // //   const [wishlist, setWishlist] = useState(() => {
// // //     try {
// // //       const saved = localStorage.getItem('df_wishlist');
// // //       if (!saved) return [];
// // //       const parsed = JSON.parse(saved);
// // //       if (Array.isArray(parsed)) return parsed;
// // //       return [];
// // //     } catch (e) {
// // //       return [];
// // //     }
// // //   });

// // //   useEffect(() => {
// // //     const fetchUserWishlist = async () => {
// // //       const token = localStorage.getItem('df_token');
// // //       const userEmail = user?.email;
// // //       if (!token && !userEmail) return;

// // //       try {
// // //         let url = `${API_URL}/api/user/wishlist`;
// // //         if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;
// // //         const res = await apiFetch(url, {
// // //           headers: token ? { Authorization: `Bearer ${token}` } : {}
// // //         });
// // //         const data = await parseResponseSafely(res);
// // //         if (data && data.success && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
// // //           setWishlist(data.wishlist);
// // //         }
// // //       } catch (err) {
// // //         console.warn('Failed to hydrate wishlist:', err);
// // //       }
// // //     };
// // //     fetchUserWishlist();
// // //   }, [user]);

// // //   useEffect(() => {
// // //     try {
// // //       const wishlistIds = (wishlist || []).map((item) =>
// // //         typeof item === 'string' ? item : item?._id || item?.id
// // //       ).filter(Boolean);

// // //       localStorage.setItem('df_wishlist', JSON.stringify(wishlistIds));

// // //       const token = localStorage.getItem('df_token');
// // //       const userEmail = user?.email;
// // //       if (token || userEmail) {
// // //         apiFetch('/api/user/wishlist', {
// // //           method: 'POST',
// // //           headers: {
// // //             'Content-Type': 'application/json',
// // //             ...(token ? { Authorization: `Bearer ${token}` } : {})
// // //           },
// // //           body: JSON.stringify({ wishlistIds, email: userEmail })
// // //         }).catch(() => {});
// // //       }
// // //     } catch (e) {}
// // //   }, [wishlist, user]);

// // //   const handleToggleWishlist = (prod) => {
// // //     if (!prod) return;
// // //     const prodId = typeof prod === 'string' ? prod : prod._id || prod.id;
    
// // //     setWishlist((prev) => {
// // //       const prevList = Array.isArray(prev) ? prev : [];
// // //       const exists = prevList.some((item) => {
// // //         const id = typeof item === 'string' ? item : item?._id || item?.id;
// // //         return id === prodId;
// // //       });

// // //       if (exists) {
// // //         return prevList.filter((item) => {
// // //           const id = typeof item === 'string' ? item : item?._id || item?.id;
// // //           return id !== prodId;
// // //         });
// // //       } else {
// // //         return [...prevList, prod];
// // //       }
// // //     });
// // //   };

// // //   useEffect(() => {
// // //     fetchCategories();
// // //   }, []);

// // //   useEffect(() => {
// // //     setPage(1);
// // //     fetchProducts(1, false);
// // //   }, [selectedCategory, searchTerm]);

// // //   // Restore opened Product Detail Page on refresh
// // //   useEffect(() => {
// // //     const hash = window.location.hash;
// // //     const match = hash.match(/#product=([^&]+)/);
// // //     const savedProdId = match ? match[1] : sessionStorage.getItem('df_opened_product_id');

// // //     if (savedProdId && products.length > 0) {
// // //       const found = products.find((p) => String(p._id || p.id) === String(savedProdId));
// // //       if (found) {
// // //         setSelectedProduct(found);
// // //         updateProductHistory([found]);
// // //         setIsDetailOpen(true);
// // //       }
// // //     }
// // //   }, [products]);

// // //   const handleOpenProductDetail = (product) => {
// // //     if (!product) return;
// // //     const prodId = product._id || product.id;
// // //     setSelectedProduct(product);
// // //     updateProductHistory([product]);
// // //     setIsDetailOpen(true);
// // //     sessionStorage.setItem('df_opened_product_id', prodId);
// // //     try {
// // //       window.history.replaceState(null, '', `#product=${prodId}`);
// // //     } catch (e) {}
// // //   };

// // //   const handleSelectRelatedProduct = (product) => {
// // //     if (!product) return;
// // //     const prodId = product._id || product.id;
// // //     setSelectedProduct(product);
// // //     updateProductHistory([...productHistoryRef.current, product]);
// // //     setIsDetailOpen(true);
// // //     sessionStorage.setItem('df_opened_product_id', prodId);
// // //     try {
// // //       window.history.replaceState(null, '', `#product=${prodId}`);
// // //     } catch (e) {}
// // //   };

// // //   const handleProductDetailBack = () => {
// // //     if (productHistoryRef.current.length > 1) {
// // //       const nextHistory = [...productHistoryRef.current];
// // //       nextHistory.pop();
// // //       const prevProduct = nextHistory[nextHistory.length - 1];
// // //       const prodId = prevProduct._id || prevProduct.id;
// // //       updateProductHistory(nextHistory);
// // //       setSelectedProduct(prevProduct);
// // //       sessionStorage.setItem('df_opened_product_id', prodId);
// // //       try {
// // //         window.history.replaceState(null, '', `#product=${prodId}`);
// // //       } catch (e) {}
// // //     } else {
// // //       updateProductHistory([]);
// // //       setIsDetailOpen(false);
// // //       sessionStorage.removeItem('df_opened_product_id');
// // //       try {
// // //         window.history.replaceState(null, '', window.location.pathname.replace(/#.*$/, ''));
// // //       } catch (e) {}
// // //     }
// // //   };

// // //   const handleCloseProductDetail = () => {
// // //     updateProductHistory([]);
// // //     setIsDetailOpen(false);
// // //     sessionStorage.removeItem('df_opened_product_id');
// // //     try {
// // //       window.history.replaceState(null, '', window.location.pathname.replace(/#.*$/, ''));
// // //     } catch (e) {}
// // //   };

// // //   // Cart Actions
// // //   const handleAddToCart = (product) => {
// // //     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
// // //     if (remStock <= 0) {
// // //       alert('Out of Stock - Cannot add to cart!');
// // //       return;
// // //     }

// // //     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
// // //       ? product.availableSizes
// // //       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

// // //     if (product.selectedSize) {
// // //       setCartItems((prevItems) => {
// // //         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
// // //         if (existing) {
// // //           return prevItems.map((item) =>
// // //             (item._id === product._id && item.selectedSize === product.selectedSize)
// // //               ? { ...item, quantity: item.quantity + 1 }
// // //               : item
// // //           );
// // //         }
// // //         return [...prevItems, { ...product, quantity: 1 }];
// // //       });
// // //       setIsCartOpen(true);
// // //       return;
// // //     }

// // //     if (sizesList.length > 1) {
// // //       setSelectedProduct(product);
// // //       setIsDetailOpen(true);
// // //       return;
// // //     }

// // //     const autoSize = sizesList[0] || 'Standard';
// // //     setCartItems((prevItems) => {
// // //       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
// // //       if (existing) {
// // //         if (existing.quantity >= remStock) {
// // //           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
// // //           return prevItems;
// // //         }
// // //         return prevItems.map((item) =>
// // //           (item._id === product._id && item.selectedSize === autoSize)
// // //             ? { ...item, quantity: item.quantity + 1 }
// // //             : item
// // //         );
// // //       }
// // //       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
// // //     });
// // //     setIsCartOpen(true);
// // //   };

// // //   const handleUpdateQuantity = (productId, newQty) => {
// // //     if (newQty <= 0) {
// // //       handleRemoveFromCart(productId);
// // //       return;
// // //     }
// // //     const cartItem = cartItems.find((item) => item._id === productId);
// // //     if (cartItem) {
// // //       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
// // //       if (newQty > remStock) {
// // //         alert(`Only ${remStock} item(s) available in stock!`);
// // //         return;
// // //       }
// // //     }
// // //     setCartItems((prevItems) =>
// // //       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
// // //     );
// // //   };

// // //   const handleRemoveFromCart = (productId) => {
// // //     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
// // //   };

// // //   const handleLogout = () => {
// // //     localStorage.removeItem('df_token');
// // //     localStorage.removeItem('df_user');
// // //     setUser(null);
// // //   };

// // //   const handleProceedToCheckout = () => {
// // //     setIsCartOpen(false);
// // //     setIsCheckoutOpen(true);
// // //   };

// // //   const handleProceedToPayment = (address) => {
// // //     setDeliveryAddress(address);
// // //     setIsCheckoutOpen(false);
// // //     setIsPaymentOpen(true);
// // //   };

// // //   const handleBackToCheckout = () => {
// // //     setIsPaymentOpen(false);
// // //     setIsCheckoutOpen(true);
// // //   };

// // //   const handleBackToCart = () => {
// // //     setIsCheckoutOpen(false);
// // //     setIsCartOpen(true);
// // //   };

// // //   const handleOrderSuccess = () => {
// // //     setCartItems([]);
// // //     setAppliedCoupon(null);
// // //     setIsCartOpen(false);
// // //     setIsCheckoutOpen(false);
// // //     try {
// // //       localStorage.removeItem('df_cart');
// // //     } catch (e) {}
// // //   };

// // //   const closeAllModals = () => {
// // //     setIsCartOpen(false);
// // //     setIsCheckoutOpen(false);
// // //     setIsPaymentOpen(false);
// // //     setIsProfileOpen(false);
// // //     setIsAuthOpen(false);
// // //     setIsDetailOpen(false);
// // //     setIsNotificationsOpen(false);
// // //     setIsLightboxOpen(false);
// // //   };

// // //   const handleMobileHomeClick = () => {
// // //     closeAllModals();
// // //     setSelectedCategory('All');
// // //     window.scrollTo({ top: 0, behavior: 'smooth' });
// // //   };

// // //   const handleMobileAccountClick = () => {
// // //     closeAllModals();
// // //     if (user) {
// // //       setIsProfileOpen(true);
// // //     } else {
// // //       setIsAuthOpen(true);
// // //     }
// // //   };

// // //   const handleMobileCartClick = () => {
// // //     closeAllModals();
// // //     setIsCartOpen(true);
// // //   };

// // //   // Keyboard Escape & PopState Handler
// // //   useEffect(() => {
// // //     const handlePopState = () => {
// // //       if (isPaymentOpen) {
// // //         setIsPaymentOpen(false);
// // //         setIsCheckoutOpen(true);
// // //       } else if (isCheckoutOpen) {
// // //         setIsCheckoutOpen(false);
// // //         setIsCartOpen(true);
// // //       } else if (isCartOpen) {
// // //         setIsCartOpen(false);
// // //       } else if (isProfileOpen) {
// // //         setIsProfileOpen(false);
// // //       } else if (isDetailOpen) {
// // //         handleProductDetailBack();
// // //       } else if (isLightboxOpen) {
// // //         setIsLightboxOpen(false);
// // //       } else if (isAuthOpen) {
// // //         setIsAuthOpen(false);
// // //       }
// // //     };

// // //     const handleKeyDown = (e) => {
// // //       if (e.key === 'Escape') {
// // //         if (isPaymentOpen) setIsPaymentOpen(false);
// // //         else if (isCheckoutOpen) setIsCheckoutOpen(false);
// // //         else if (isCartOpen) setIsCartOpen(false);
// // //         else if (isProfileOpen) setIsProfileOpen(false);
// // //         else if (isDetailOpen) handleProductDetailBack();
// // //         else if (isLightboxOpen) setIsLightboxOpen(false);
// // //         else if (isAuthOpen) setIsAuthOpen(false);
// // //       }
// // //     };

// // //     window.addEventListener('popstate', handlePopState);
// // //     window.addEventListener('keydown', handleKeyDown);

// // //     return () => {
// // //       window.removeEventListener('popstate', handlePopState);
// // //       window.removeEventListener('keydown', handleKeyDown);
// // //     };
// // //   }, [isPaymentOpen, isCheckoutOpen, isCartOpen, isProfileOpen, isDetailOpen, isLightboxOpen, isAuthOpen, productHistory.length]);

// // //   return (
// // //     <div className="app-container">
// // //       {/* Sticky Live Sale Banner */}
// // //       {currentView === 'shop' && (
// // //         <LiveSaleBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />
// // //       )}

// // //       {/* Header / Navbar */}
// // //       <Navbar
// // //         searchTerm={searchTerm}
// // //         setSearchTerm={setSearchTerm}
// // //         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
// // //         onOpenCart={() => setIsCartOpen(true)}
// // //         user={currentView === 'admin' ? null : user}
// // //         onOpenAuth={() => setIsAuthOpen(true)}
// // //         onOpenProfile={() => setIsProfileOpen(true)}
// // //         onLogout={handleLogout}
// // //         currentView={currentView}
// // //         setCurrentView={setView}
// // //         categories={categories}
// // //         allProducts={products}
// // //         onSelectProduct={handleOpenProductDetail}
// // //         unreadNotificationCount={unreadNotificationCount}
// // //         showNotificationBubble={showNotificationBubble}
// // //         latestNotificationTitle={latestNotificationTitle}
// // //         onOpenNotifications={handleOpenNotifications}
// // //         activeFilterCount={activeFilterCount}
// // //         onOpenFilterModal={() => setIsFilterModalOpen(true)}
// // //       />

// // //       {/* Main View Switch */}
// // //       {currentView === 'admin' ? (
// // //         <AdminPanel onExitAdmin={() => setView('shop')} />
// // //       ) : (
// // //         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
// // //           <div className="main-layout" style={{ flex: '1 0 auto' }}>
// // //             {/* Category Sidebar */}
// // //             <CategorySidebar
// // //               categories={categories}
// // //               selectedCategory={selectedCategory}
// // //               onSelectCategory={(catName) => setSelectedCategory(catName)}
// // //             />

// // //             {/* Products Grid */}
// // //             <main ref={catalogRef} className="products-section">
// // //               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
// // //                 <h2>
// // //                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
// // //                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
// // //                     ({displayedProducts.length} products)
// // //                   </span>
// // //                 </h2>

// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setIsFilterModalOpen(true)}
// // //                   style={{
// // //                     display: 'inline-flex',
// // //                     alignItems: 'center',
// // //                     gap: '6px',
// // //                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
// // //                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
// // //                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
// // //                     padding: '0.45rem 0.85rem',
// // //                     borderRadius: '10px',
// // //                     fontWeight: '700',
// // //                     fontSize: '0.82rem',
// // //                     cursor: 'pointer',
// // //                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
// // //                   }}
// // //                 >
// // //                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
// // //                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
// // //                 </button>
// // //               </div>

// // //               {/* Active Filter Strip */}
// // //               {activeFilterCount > 0 && (
// // //                 <div
// // //                   style={{
// // //                     display: 'flex',
// // //                     alignItems: 'center',
// // //                     gap: '0.5rem',
// // //                     flexWrap: 'wrap',
// // //                     background: '#fdf4ff',
// // //                     border: '1.5px solid #f0abfc',
// // //                     padding: '0.65rem 0.85rem',
// // //                     borderRadius: '12px',
// // //                     marginBottom: '1.25rem'
// // //                   }}
// // //                 >
// // //                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
// // //                     <Filter size={14} /> Active Filters:
// // //                   </span>

// // //                   {appliedFilters.category && appliedFilters.category !== 'All' && (
// // //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// // //                       Category: {appliedFilters.category}
// // //                     </span>
// // //                   )}

// // //                   {appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all' && (
// // //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// // //                       Price: {appliedFilters.presetPrice}
// // //                     </span>
// // //                   )}

// // //                   {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
// // //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// // //                       ₹{appliedFilters.minPrice || 0} - ₹{appliedFilters.maxPrice || '∞'}
// // //                     </span>
// // //                   )}

// // //                   {appliedFilters.minDiscount > 0 && (
// // //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// // //                       {appliedFilters.minDiscount}%+ Off
// // //                     </span>
// // //                   )}

// // //                   {appliedFilters.minRating > 0 && (
// // //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// // //                       {appliedFilters.minRating}★ & above
// // //                     </span>
// // //                   )}

// // //                   {appliedFilters.inStockOnly && (
// // //                     <span style={{ background: '#ffffff', border: '1px solid #bbf7d0', color: '#15803d', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// // //                       In Stock Only
// // //                     </span>
// // //                   )}

// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
// // //                     style={{
// // //                       background: '#fef2f2',
// // //                       border: '1px solid #fca5a5',
// // //                       color: '#dc2626',
// // //                       padding: '2px 8px',
// // //                       borderRadius: '14px',
// // //                       fontSize: '0.75rem',
// // //                       fontWeight: '800',
// // //                       cursor: 'pointer',
// // //                       display: 'inline-flex',
// // //                       alignItems: 'center',
// // //                       gap: '3px',
// // //                       marginLeft: 'auto'
// // //                     }}
// // //                   >
// // //                     <RotateCcw size={12} /> Clear All
// // //                   </button>
// // //                 </div>
// // //               )}

// // //               {/* Product Grid Render: Instant or Skeleton */}
// // //               {apiError ? (
// // //                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
// // //                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
// // //                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => fetchProducts(1, true)}
// // //                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
// // //                   >
// // //                     Retry Loading
// // //                   </button>
// // //                 </div>
// // //               ) : loading && products.length === 0 ? (
// // //                 <ProductGridSkeleton count={8} />
// // //               ) : displayedProducts.length === 0 ? (
// // //                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
// // //                   <h3>No matching products found</h3>
// // //                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
// // //                     Try resetting your filters or selecting another category.
// // //                   </p>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => {
// // //                       setAppliedFilters(DEFAULT_FILTERS);
// // //                       setSelectedCategory('All');
// // //                       setSearchTerm('');
// // //                     }}
// // //                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
// // //                   >
// // //                     Clear All Filters & Search
// // //                   </button>
// // //                 </div>
// // //               ) : (
// // //                 <>
// // //                   <div className="product-grid">
// // //                     {displayedProducts.map((product) => {
// // //                       const isWishlisted = wishlist.some(w => (w._id || w.id) === (product._id || product.id));
// // //                       return (
// // //                         <ProductCard
// // //                           key={product._id || product.id}
// // //                           product={product}
// // //                           onAddToCart={handleAddToCart}
// // //                           onClickProductTitle={handleOpenProductDetail}
// // //                           onClickProductImage={handleOpenProductDetail}
// // //                           isWishlisted={isWishlisted}
// // //                           onToggleWishlist={handleToggleWishlist}
// // //                           cartItems={cartItems}
// // //                           onOpenCart={() => setIsCartOpen(true)}
// // //                         />
// // //                       );
// // //                     })}
// // //                   </div>

// // //                   {/* SCREENSHOT-STYLE EXACT MATCH PREVIOUS / NEXT BUTTONS */}
// // //                   {totalPages > 1 && (
// // //                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
// // //                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
// // //                         {/* Previous Button */}
// // //                         <button
// // //                           type="button"
// // //                           disabled={page <= 1 || loading}
// // //                           onClick={() => handlePageChange(page - 1)}
// // //                           style={{
// // //                             display: 'inline-flex',
// // //                             alignItems: 'center',
// // //                             justifyContent: 'center',
// // //                             padding: '10px 22px',
// // //                             fontSize: '1rem',
// // //                             fontWeight: '600',
// // //                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
// // //                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
// // //                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
// // //                             border: '1px solid #e4e4e7',
// // //                             borderRadius: '4px',
// // //                             transition: 'all 0.15s ease',
// // //                             outline: 'none'
// // //                           }}
// // //                         >
// // //                           « Previous
// // //                         </button>

// // //                         {/* Next Button */}
// // //                         <button
// // //                           type="button"
// // //                           disabled={page >= totalPages || loading}
// // //                           onClick={() => handlePageChange(page + 1)}
// // //                           style={{
// // //                             display: 'inline-flex',
// // //                             alignItems: 'center',
// // //                             justifyContent: 'center',
// // //                             padding: '10px 24px',
// // //                             fontSize: '1rem',
// // //                             fontWeight: '600',
// // //                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
// // //                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
// // //                             color: '#ffffff',
// // //                             border: 'none',
// // //                             borderRadius: '4px',
// // //                             transition: 'all 0.15s ease',
// // //                             outline: 'none',
// // //                             boxShadow: page >= totalPages || loading ? 'none' : '0 2px 8px rgba(192, 38, 211, 0.25)'
// // //                           }}
// // //                         >
// // //                           Next »
// // //                         </button>
// // //                       </div>

// // //                       {/* Summary Caption */}
// // //                       <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', margin: 0 }}>
// // //                         Page <span style={{ color: '#c026d3', fontWeight: '800' }}>{page}</span> of{' '}
// // //                         <span style={{ color: '#0f172a', fontWeight: '800' }}>{totalPages}</span> ({totalProductsCount} total items)
// // //                       </p>
// // //                     </div>
// // //                   )}
// // //                 </>
// // //               )}
// // //             </main>
// // //           </div>

// // //           <Footer
// // //             onOpenAboutUs={() => setIsAboutUsOpen(true)}
// // //             onOpenTermsPrivacy={(tab) => {
// // //               setTermsTab(tab);
// // //               setIsTermsOpen(true);
// // //             }}
// // //           />
// // //         </div>
// // //       )}

// // //       {/* Modals & Drawers */}
// // //       <ProductDetailModal
// // //         product={selectedProduct}
// // //         isOpen={isDetailOpen}
// // //         onClose={handleCloseProductDetail}
// // //         onAddToCart={handleAddToCart}
// // //         allProducts={products}
// // //         onSelectProduct={handleSelectRelatedProduct}
// // //         isWishlisted={wishlist.some(w => (w._id || w.id) === (selectedProduct?._id || selectedProduct?.id))}
// // //         onToggleWishlist={handleToggleWishlist}
// // //         wishlist={wishlist}
// // //         historyLength={productHistory.length}
// // //         onGoBack={handleProductDetailBack}
// // //         searchTerm={searchTerm}
// // //         setSearchTerm={setSearchTerm}
// // //         cartItems={cartItems}
// // //         onOpenCart={() => setIsCartOpen(true)}
// // //       />

// // //       <ImageLightboxModal
// // //         product={lightboxProduct}
// // //         isOpen={isLightboxOpen}
// // //         onClose={() => setIsLightboxOpen(false)}
// // //       />

// // //       <AuthModal
// // //         isOpen={isAuthOpen}
// // //         onClose={() => setIsAuthOpen(false)}
// // //         onAuthSuccess={(userData) => setUser(userData)}
// // //       />

// // //       <UserProfileModal
// // //         isOpen={isProfileOpen}
// // //         onClose={() => setIsProfileOpen(false)}
// // //         user={user}
// // //         onLogout={handleLogout}
// // //         onUpdateUser={(updatedUser) => {
// // //           const merged = { ...user, ...updatedUser };
// // //           setUser(merged);
// // //           try {
// // //             const clone = { ...merged };
// // //             if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// // //             if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// // //             localStorage.setItem('df_user', JSON.stringify(clone));
// // //           } catch (e) {}
// // //         }}
// // //         wishlist={wishlist}
// // //         onToggleWishlist={handleToggleWishlist}
// // //         onSelectProduct={(p) => {
// // //           setSelectedProduct(p);
// // //           setIsDetailOpen(true);
// // //         }}
// // //         onAddToCart={handleAddToCart}
// // //         cartItems={cartItems}
// // //         onOpenCart={() => setIsCartOpen(true)}
// // //       />

// // //       <CartDrawer
// // //         isOpen={isCartOpen}
// // //         onClose={() => setIsCartOpen(false)}
// // //         cartItems={cartItems}
// // //         onUpdateQuantity={handleUpdateQuantity}
// // //         onRemoveItem={handleRemoveFromCart}
// // //         onProceedToCheckout={handleProceedToCheckout}
// // //         user={user}
// // //         onOpenAuth={() => setIsAuthOpen(true)}
// // //         appliedCoupon={appliedCoupon}
// // //         setAppliedCoupon={setAppliedCoupon}
// // //       />

// // //       <CheckoutModal
// // //         isOpen={isCheckoutOpen}
// // //         onClose={() => setIsCheckoutOpen(false)}
// // //         onBackToCart={handleBackToCart}
// // //         user={user}
// // //         onProceedToPayment={handleProceedToPayment}
// // //       />

// // //       <PaymentModal
// // //         isOpen={isPaymentOpen}
// // //         onClose={() => setIsPaymentOpen(false)}
// // //         onBackToCheckout={handleBackToCheckout}
// // //         user={user}
// // //         cartItems={cartItems}
// // //         deliveryAddress={deliveryAddress}
// // //         appliedCoupon={appliedCoupon}
// // //         onOrderSuccess={handleOrderSuccess}
// // //       />

// // //       <NotificationModal
// // //         isOpen={isNotificationsOpen}
// // //         onClose={() => setIsNotificationsOpen(false)}
// // //         notifications={notifications}
// // //         readNotificationIds={readNotificationIds}
// // //         currentUserId={currentUserId}
// // //         onMarkAllAsRead={handleMarkAllAsRead}
// // //         onMarkSingleAsRead={handleMarkSingleAsRead}
// // //         onNavigateToShop={() => setView('shop')}
// // //       />

// // //       {currentView === 'shop' && (
// // //         <MobileBottomNav
// // //           activeTab={
// // //             (isCartOpen || isCheckoutOpen || isPaymentOpen)
// // //               ? 'cart'
// // //               : (isProfileOpen || isAuthOpen)
// // //               ? 'account'
// // //               : 'home'
// // //           }
// // //           onHomeClick={handleMobileHomeClick}
// // //           onAccountClick={handleMobileAccountClick}
// // //           onCartClick={handleMobileCartClick}
// // //           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
// // //           isLoggedIn={Boolean(user)}
// // //         />
// // //       )}

// // //       <ProductFilterModal
// // //         isOpen={isFilterModalOpen}
// // //         onClose={() => setIsFilterModalOpen(false)}
// // //         categories={categories}
// // //         allProducts={products}
// // //         currentFilters={appliedFilters}
// // //         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
// // //         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
// // //       />

// // //       <AboutUsModal
// // //         isOpen={isAboutUsOpen}
// // //         onClose={() => setIsAboutUsOpen(false)}
// // //       />

// // //       <TermsPrivacyModal
// // //         isOpen={isTermsOpen}
// // //         onClose={() => setIsTermsOpen(false)}
// // //         initialTab={termsTab}
// // //       />
// // //     </div>
// // //   );
// // // }

// // // export default App;





// // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // import Navbar from './components/Navbar';
// // import CategorySidebar from './components/CategorySidebar';
// // import ProductCard from './components/ProductCard';
// // import ProductDetailModal from './components/ProductDetailModal';
// // import ImageLightboxModal from './components/ImageLightboxModal';
// // import AuthModal from './components/AuthModal';
// // import CartDrawer from './components/CartDrawer';
// // import CheckoutModal from './components/CheckoutModal';
// // import PaymentModal from './components/PaymentModal';
// // import UserProfileModal from './components/UserProfileModal';
// // import NotificationModal from './components/NotificationModal';
// // import LiveSaleBanner from './components/LiveSaleBanner';
// // import AdminPanel from './components/Admin/AdminPanel';
// // import MobileBottomNav from './components/MobileBottomNav';
// // import ProductGridSkeleton from './components/Skeletons/ProductGridSkeleton';
// // import ProductFilterModal from './components/ProductFilterModal';
// // import Footer from './components/Footer';
// // import AboutUsModal from './components/AboutUsModal';
// // import TermsPrivacyModal from './components/TermsPrivacyModal';
// // import { SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
// // import { fetchWithCache } from './utils/cache';
// // import { API_URL, apiFetch, parseResponseSafely } from './api';
// // import { useSocket } from './context/SocketContext.jsx';
// // import './App.css';

// // function App() {
// //   // Navigation / View State ('shop' or 'admin')
// //   const [currentView, setCurrentView] = useState('shop');

// //   // Check URL pathname for /admin or #/admin
// //   useEffect(() => {
// //     const handleLocation = () => {
// //       if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
// //         setCurrentView('admin');
// //       } else {
// //         setCurrentView('shop');
// //       }
// //     };
// //     handleLocation();
// //     window.addEventListener('popstate', handleLocation);
// //     return () => window.removeEventListener('popstate', handleLocation);
// //   }, []);

// //   const setView = (view) => {
// //     setCurrentView(view);
// //     if (view === 'admin') {
// //       window.history.pushState({ view: 'admin' }, '', '/admin');
// //     } else {
// //       window.history.pushState({ view: 'shop' }, '', '/');
// //     }
// //   };

// //   // Customer User State (Persistent Login)
// //   const [user, setUser] = useState(() => {
// //     try {
// //       const saved = localStorage.getItem('df_user');
// //       return saved ? JSON.parse(saved) : null;
// //     } catch (e) {
// //       return null;
// //     }
// //   });

// //   // Store Notifications & Modals State
// //   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
// //   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
// //   const [isTermsOpen, setIsTermsOpen] = useState(false);
// //   const [termsTab, setTermsTab] = useState('privacy');
// //   const [notifications, setNotifications] = useState([]);
// //   const [readNotificationIds, setReadNotificationIds] = useState(() => {
// //     try {
// //       const saved = localStorage.getItem('df_read_notifications');
// //       return saved ? JSON.parse(saved) : [];
// //     } catch (e) {
// //       return [];
// //     }
// //   });
// //   const [showNotificationBubble, setShowNotificationBubble] = useState(false);
// //   const [latestNotificationTitle, setLatestNotificationTitle] = useState('');

// //   // Modals / Drawers State
// //   const [selectedProduct, setSelectedProduct] = useState(null);
// //   const [isDetailOpen, setIsDetailOpen] = useState(false);
// //   const [productHistory, setProductHistory] = useState([]);
// //   const productHistoryRef = useRef([]);

// //   const updateProductHistory = (newHistory) => {
// //     productHistoryRef.current = newHistory;
// //     setProductHistory(newHistory);
// //   };
// //   const [lightboxProduct, setLightboxProduct] = useState(null);
// //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

// //   const [cartItems, setCartItems] = useState(() => {
// //     try {
// //       const savedCart = localStorage.getItem('df_cart');
// //       return savedCart ? JSON.parse(savedCart) : [];
// //     } catch (e) {
// //       return [];
// //     }
// //   });

// //   const [appliedCoupon, setAppliedCoupon] = useState(null);
// //   const [isAuthOpen, setIsAuthOpen] = useState(false);
// //   const [isProfileOpen, setIsProfileOpen] = useState(false);
// //   const [isCartOpen, setIsCartOpen] = useState(false);
// //   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
// //   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
// //   const [deliveryAddress, setDeliveryAddress] = useState(null);
// //   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

// //   // Sync state refs for popstate listener without stale closures
// //   const modalStatesRef = useRef({});
// //   modalStatesRef.current = {
// //     isPaymentOpen,
// //     isCheckoutOpen,
// //     isCartOpen,
// //     isProfileOpen,
// //     isDetailOpen,
// //     isLightboxOpen,
// //     isAuthOpen,
// //     isNotificationsOpen,
// //     isAboutUsOpen,
// //     isTermsOpen,
// //     isFilterModalOpen,
// //     productHistoryLength: productHistory.length,
// //     currentView
// //   };

// //   // Helper to open modal and push history state
// //   const pushModalHistory = (name) => {
// //     try {
// //       window.history.pushState({ modal: name }, '', window.location.href);
// //     } catch (e) {}
// //   };

// //   const openCartModal = () => {
// //     pushModalHistory('cart');
// //     setIsCartOpen(true);
// //   };

// //   const openProfileModal = () => {
// //     pushModalHistory('profile');
// //     setIsProfileOpen(true);
// //   };

// //   const openAuthModal = () => {
// //     pushModalHistory('auth');
// //     setIsAuthOpen(true);
// //   };

// //   const openFilterModal = () => {
// //     pushModalHistory('filter');
// //     setIsFilterModalOpen(true);
// //   };

// //   const openAboutUsModal = () => {
// //     pushModalHistory('about');
// //     setIsAboutUsOpen(true);
// //   };

// //   const openTermsModal = (tab = 'privacy') => {
// //     setTermsTab(tab);
// //     pushModalHistory('terms');
// //     setIsTermsOpen(true);
// //   };

// //   const openNotificationsModal = () => {
// //     pushModalHistory('notifications');
// //     setIsNotificationsOpen(true);
// //     setShowNotificationBubble(false);
// //     const allIds = notifications.map(n => n._id);
// //     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
// //     setReadNotificationIds(updatedRead);
// //     try {
// //       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
// //     } catch (e) {}
// //   };

// //   // ============================================================
// //   // SYSTEM & BROWSER BACK BUTTON (POPSTATE) STEP-BY-STEP HANDLER
// //   // ============================================================
// //   useEffect(() => {
// //     const handlePopState = (e) => {
// //       const state = modalStatesRef.current;

// //       if (state.isLightboxOpen) {
// //         setIsLightboxOpen(false);
// //       } else if (state.isPaymentOpen) {
// //         setIsPaymentOpen(false);
// //         setIsCheckoutOpen(true);
// //       } else if (state.isCheckoutOpen) {
// //         setIsCheckoutOpen(false);
// //         setIsCartOpen(true);
// //       } else if (state.isCartOpen) {
// //         setIsCartOpen(false);
// //       } else if (state.isFilterModalOpen) {
// //         setIsFilterModalOpen(false);
// //       } else if (state.isNotificationsOpen) {
// //         setIsNotificationsOpen(false);
// //       } else if (state.isAboutUsOpen) {
// //         setIsAboutUsOpen(false);
// //       } else if (state.isTermsOpen) {
// //         setIsTermsOpen(false);
// //       } else if (state.isProfileOpen) {
// //         setIsProfileOpen(false);
// //       } else if (state.isAuthOpen) {
// //         setIsAuthOpen(false);
// //       } else if (state.isDetailOpen) {
// //         if (productHistoryRef.current.length > 1) {
// //           const nextHistory = [...productHistoryRef.current];
// //           nextHistory.pop();
// //           const prevProduct = nextHistory[nextHistory.length - 1];
// //           const prodId = prevProduct._id || prevProduct.id;
// //           updateProductHistory(nextHistory);
// //           setSelectedProduct(prevProduct);
// //           sessionStorage.setItem('df_opened_product_id', prodId);
// //         } else {
// //           updateProductHistory([]);
// //           setIsDetailOpen(false);
// //           sessionStorage.removeItem('df_opened_product_id');
// //         }
// //       } else if (state.currentView === 'admin') {
// //         setCurrentView('shop');
// //       }
// //     };

// //     const handleKeyDown = (e) => {
// //       if (e.key === 'Escape') {
// //         const state = modalStatesRef.current;
// //         if (state.isLightboxOpen || state.isPaymentOpen || state.isCheckoutOpen || state.isCartOpen || state.isFilterModalOpen || state.isNotificationsOpen || state.isAboutUsOpen || state.isTermsOpen || state.isProfileOpen || state.isAuthOpen || state.isDetailOpen) {
// //           window.history.back();
// //         }
// //       }
// //     };

// //     window.addEventListener('popstate', handlePopState);
// //     window.addEventListener('keydown', handleKeyDown);

// //     return () => {
// //       window.removeEventListener('popstate', handlePopState);
// //       window.removeEventListener('keydown', handleKeyDown);
// //     };
// //   }, []);

// //   // Notifications fetch logic
// //   useEffect(() => {
// //     fetchNotifications();
// //     const interval = setInterval(fetchNotifications, 15000);
// //     const handleFocus = () => fetchNotifications();
// //     window.addEventListener('focus', handleFocus);
// //     return () => {
// //       clearInterval(interval);
// //       window.removeEventListener('focus', handleFocus);
// //     };
// //   }, []);

// //   const fetchNotifications = async () => {
// //     try {
// //       const res = await apiFetch('/api/notifications');
// //       const data = await parseResponseSafely(res);
// //       if (res.ok && Array.isArray(data)) {
// //         setNotifications(data);
// //       } else {
// //         const saved = localStorage.getItem('df_local_notifications');
// //         if (saved) setNotifications(JSON.parse(saved));
// //       }
// //     } catch (e) {
// //       const saved = localStorage.getItem('df_local_notifications');
// //       if (saved) setNotifications(JSON.parse(saved));
// //     }
// //   };

// //   // Socket.io Real-time Listeners
// //   const { socket } = useSocket();

// //   useEffect(() => {
// //     if (!socket) return;

// //     const onProductAdded = (newProduct) => {
// //       setProducts((prev) => [newProduct, ...prev.filter(p => (p._id || p.id) !== (newProduct._id || newProduct.id))]);
// //     };

// //     const onProductUpdated = (updated) => {
// //       const updId = updated._id || updated.id;
// //       setProducts((prev) => prev.map(p => (p._id || p.id) === updId ? { ...p, ...updated } : p));
// //       setSelectedProduct((prev) => prev && (prev._id || prev.id) === updId ? { ...prev, ...updated } : prev);
// //     };

// //     const onProductDeleted = (deletedId) => {
// //       setProducts((prev) => prev.filter(p => (p._id || p.id) !== deletedId));
// //     };

// //     const onNewOrderPlaced = (order) => {
// //       window.dispatchEvent(new CustomEvent('df_new_order_placed', { detail: order }));
// //     };

// //     const onOrderStatusUpdated = (updatedOrder) => {
// //       window.dispatchEvent(new CustomEvent('df_order_status_updated', { detail: updatedOrder }));
// //     };

// //     const onUserProfileUpdated = (updatedUser) => {
// //       setUser((prev) => {
// //         if (!prev) return prev;
// //         const prevId = prev._id || prev.id;
// //         const updId = updatedUser._id || updatedUser.id;
// //         if (prevId && updId && String(prevId) === String(updId)) {
// //           const merged = { ...prev, ...updatedUser };
// //           try { localStorage.setItem('df_user', JSON.stringify(merged)); } catch (e) {}
// //           return merged;
// //         }
// //         return prev;
// //       });
// //     };

// //     socket.on('product_added', onProductAdded);
// //     socket.on('product_updated', onProductUpdated);
// //     socket.on('product_deleted', onProductDeleted);
// //     socket.on('new_order_placed', onNewOrderPlaced);
// //     socket.on('order_status_updated', onOrderStatusUpdated);
// //     socket.on('user_profile_updated', onUserProfileUpdated);

// //     return () => {
// //       socket.off('product_added', onProductAdded);
// //       socket.off('product_updated', onProductUpdated);
// //       socket.off('product_deleted', onProductDeleted);
// //       socket.off('new_order_placed', onNewOrderPlaced);
// //       socket.off('order_status_updated', onOrderStatusUpdated);
// //       socket.off('user_profile_updated', onUserProfileUpdated);
// //     };
// //   }, [socket]);

// //   // Persistent User ID for readBy Tracking
// //   const currentUserId = user?._id || user?.id || (() => {
// //     try {
// //       let saved = localStorage.getItem('df_guest_id');
// //       if (!saved) {
// //         saved = 'guest_' + Math.random().toString(36).substring(2, 9);
// //         localStorage.setItem('df_guest_id', saved);
// //       }
// //       return saved;
// //     } catch (e) {
// //       return 'guest_user_1';
// //     }
// //   })();

// //   const unreadNotificationCount = notifications.filter(
// //     (n) => !readNotificationIds.includes(n._id) && (!Array.isArray(n.readBy) || !n.readBy.includes(currentUserId))
// //   ).length;

// //   const handleMarkAllAsRead = async () => {
// //     const allIds = notifications.map(n => n._id);
// //     setReadNotificationIds(allIds);
// //     setShowNotificationBubble(false);
// //     try {
// //       localStorage.setItem('df_read_notifications', JSON.stringify(allIds));
// //     } catch (e) {}

// //     notifications.forEach(async (n) => {
// //       try {
// //         await apiFetch(`/api/notifications/${n._id}/read`, {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({ userId: currentUserId })
// //         });
// //       } catch (e) {}
// //     });
// //   };

// //   const handleMarkSingleAsRead = async (id) => {
// //     if (!readNotificationIds.includes(id)) {
// //       const updated = [...readNotificationIds, id];
// //       setReadNotificationIds(updated);
// //       try {
// //         localStorage.setItem('df_read_notifications', JSON.stringify(updated));
// //       } catch (e) {}
// //     }

// //     try {
// //       await apiFetch(`/api/notifications/${id}/read`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ userId: currentUserId })
// //       });
// //     } catch (e) {}
// //   };

// //   // Products Loading & Fetching
// //   const [categories, setCategories] = useState([]);
// //   const [selectedCategory, setSelectedCategory] = useState('All');
// //   const [searchTerm, setSearchTerm] = useState('');

// //   const [products, setProducts] = useState(() => {
// //     try {
// //       const cached = localStorage.getItem('df_storefront_products');
// //       return cached ? JSON.parse(cached) : [];
// //     } catch (e) {
// //       return [];
// //     }
// //   });

// //   const [loading, setLoading] = useState(() => products.length === 0);
// //   const [page, setPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
// //   const [apiError, setApiError] = useState(null);

// //   const catalogRef = useRef(null);
// //   const isFetchingRef = useRef(false);

// //   const fetchCategories = async () => {
// //     try {
// //       const { data } = await fetchWithCache('categories', async () => {
// //         const res = await fetch(`${API_URL}/api/categories`);
// //         return await res.json();
// //       });
// //       if (data) setCategories(data);
// //     } catch (e) {
// //       console.error('Error loading categories:', e);
// //     }
// //   };

// //   const fetchProducts = async (pageNum = 1, forceRefresh = false) => {
// //     if (isFetchingRef.current && !forceRefresh) return;
// //     isFetchingRef.current = true;

// //     const sanitizedCat = (!selectedCategory || selectedCategory === 'All') ? '' : selectedCategory.trim();
// //     const cacheKey = `products_cat_${sanitizedCat || 'all'}_search_${searchTerm.trim()}_p${pageNum}`;

// //     try {
// //       if (products.length === 0) setLoading(true);
// //       setApiError(null);

// //       const params = new URLSearchParams();
// //       if (sanitizedCat) params.append('category', sanitizedCat);
// //       if (searchTerm.trim()) params.append('search', searchTerm.trim());
// //       params.append('page', pageNum);
// //       params.append('limit', 20);

// //       const { data: rawResponse } = await fetchWithCache(
// //         cacheKey,
// //         async () => {
// //           const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
// //           if (!res.ok) throw new Error(`Server status ${res.status}`);
// //           return await res.json();
// //         },
// //         { forceRefresh }
// //       );

// //       let fetchedProducts = [];
// //       let totalPagesVal = 1;
// //       let totalProductsVal = 0;

// //       if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
// //         fetchedProducts = rawResponse.products || [];
// //         totalPagesVal = rawResponse.totalPages || 1;
// //         totalProductsVal = rawResponse.totalProducts !== undefined ? rawResponse.totalProducts : fetchedProducts.length;
// //       } else if (Array.isArray(rawResponse)) {
// //         fetchedProducts = rawResponse;
// //         totalPagesVal = Math.ceil(fetchedProducts.length / 20) || 1;
// //         totalProductsVal = fetchedProducts.length;
// //       }

// //       setProducts(fetchedProducts);
// //       setTotalPages(totalPagesVal);
// //       setTotalProductsCount(totalProductsVal);
// //       setPage(pageNum);

// //       if (pageNum === 1 && !sanitizedCat && !searchTerm.trim()) {
// //         try {
// //           localStorage.setItem('df_storefront_products', JSON.stringify(fetchedProducts));
// //         } catch (e) {}
// //       }
// //     } catch (e) {
// //       console.error('Error fetching products:', e);
// //       if (products.length === 0) {
// //         setApiError('Unable to load products. Please check your connection.');
// //       }
// //     } finally {
// //       setLoading(false);
// //       isFetchingRef.current = false;
// //     }
// //   };

// //   const handlePageChange = (newPage) => {
// //     if (newPage === page || newPage < 1 || newPage > totalPages) return;
// //     setPage(newPage);
// //     fetchProducts(newPage);
// //     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
// //   };

// //   // Product Filters
// //   const DEFAULT_FILTERS = {
// //     category: 'All',
// //     presetPrice: 'all',
// //     minPrice: '',
// //     maxPrice: '',
// //     minDiscount: 0,
// //     minRating: 0,
// //     inStockOnly: false
// //   };

// //   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

// //   const activeFilterCount = useMemo(() => {
// //     let count = 0;
// //     if (appliedFilters.category && appliedFilters.category !== 'All') count++;
// //     if (appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all') count++;
// //     if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
// //     if (appliedFilters.minDiscount > 0) count++;
// //     if (appliedFilters.minRating > 0) count++;
// //     if (appliedFilters.inStockOnly) count++;
// //     return count;
// //   }, [appliedFilters]);

// //   const displayedProducts = useMemo(() => {
// //     let list = Array.isArray(products) ? products : [];

// //     if (selectedCategory && selectedCategory !== 'All') {
// //       list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
// //     } else if (appliedFilters.category && appliedFilters.category !== 'All') {
// //       list = list.filter((p) => p.category?.toLowerCase() === appliedFilters.category.toLowerCase());
// //     }

// //     if (searchTerm.trim()) {
// //       const q = searchTerm.trim().toLowerCase();
// //       list = list.filter(
// //         (p) =>
// //           p.name?.toLowerCase().includes(q) ||
// //           p.category?.toLowerCase().includes(q) ||
// //           p.description?.toLowerCase().includes(q)
// //       );
// //     }

// //     if (appliedFilters.minPrice !== '' && !isNaN(appliedFilters.minPrice)) {
// //       list = list.filter((p) => Number(p.price) >= Number(appliedFilters.minPrice));
// //     }
// //     if (appliedFilters.maxPrice !== '' && !isNaN(appliedFilters.maxPrice)) {
// //       list = list.filter((p) => Number(p.price) <= Number(appliedFilters.maxPrice));
// //     }

// //     if (appliedFilters.presetPrice === 'under500') {
// //       list = list.filter((p) => Number(p.price) < 500);
// //     } else if (appliedFilters.presetPrice === '500-1000') {
// //       list = list.filter((p) => Number(p.price) >= 500 && Number(p.price) <= 1000);
// //     } else if (appliedFilters.presetPrice === '1000-2000') {
// //       list = list.filter((p) => Number(p.price) >= 1000 && Number(p.price) <= 2000);
// //     } else if (appliedFilters.presetPrice === 'above2000') {
// //       list = list.filter((p) => Number(p.price) > 2000);
// //     }

// //     if (appliedFilters.minDiscount > 0) {
// //       list = list.filter((p) => {
// //         if (!p.mrp || p.mrp <= p.price) return false;
// //         const disc = Math.round(((p.mrp - p.price) / p.mrp) * 100);
// //         return disc >= appliedFilters.minDiscount;
// //       });
// //     }

// //     if (appliedFilters.minRating > 0) {
// //       list = list.filter((p) => (p.rating || 4.5) >= appliedFilters.minRating);
// //     }

// //     if (appliedFilters.inStockOnly) {
// //       list = list.filter((p) => (p.quantity !== undefined ? p.quantity > 0 : true));
// //     }

// //     return list;
// //   }, [products, selectedCategory, searchTerm, appliedFilters]);

// //   // Product Detail Chaining with History State
// //   const handleOpenProductDetail = (product) => {
// //     if (!product) return;
// //     const prodId = product._id || product.id;
// //     pushModalHistory(`product_${prodId}`);
// //     setSelectedProduct(product);
// //     updateProductHistory([product]);
// //     setIsDetailOpen(true);
// //     sessionStorage.setItem('df_opened_product_id', prodId);
// //   };

// //   const handleSelectRelatedProduct = (product) => {
// //     if (!product) return;
// //     const prodId = product._id || product.id;
// //     pushModalHistory(`product_${prodId}`);
// //     setSelectedProduct(product);
// //     updateProductHistory([...productHistoryRef.current, product]);
// //     setIsDetailOpen(true);
// //     sessionStorage.setItem('df_opened_product_id', prodId);
// //   };

// //   const handleProductDetailBack = () => {
// //     window.history.back();
// //   };

// //   const handleCloseProductDetail = () => {
// //     window.history.back();
// //   };

// //   // Cart Handlers
// //   const handleAddToCart = (product) => {
// //     const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
// //     if (remStock <= 0) {
// //       alert('Out of Stock - Cannot add to cart!');
// //       return;
// //     }

// //     const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
// //       ? product.availableSizes
// //       : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

// //     if (product.selectedSize) {
// //       setCartItems((prevItems) => {
// //         const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
// //         if (existing) {
// //           return prevItems.map((item) =>
// //             (item._id === product._id && item.selectedSize === product.selectedSize)
// //               ? { ...item, quantity: item.quantity + 1 }
// //               : item
// //           );
// //         }
// //         return [...prevItems, { ...product, quantity: 1 }];
// //       });
// //       openCartModal();
// //       return;
// //     }

// //     if (sizesList.length > 1) {
// //       handleOpenProductDetail(product);
// //       return;
// //     }

// //     const autoSize = sizesList[0] || 'Standard';
// //     setCartItems((prevItems) => {
// //       const existing = prevItems.find((item) => item._id === product._id && item.selectedSize === autoSize);
// //       if (existing) {
// //         if (existing.quantity >= remStock) {
// //           alert(`Only ${remStock} item(s) available in stock! Cannot add more.`);
// //           return prevItems;
// //         }
// //         return prevItems.map((item) =>
// //           (item._id === product._id && item.selectedSize === autoSize)
// //             ? { ...item, quantity: item.quantity + 1 }
// //             : item
// //         );
// //       }
// //       return [...prevItems, { ...product, quantity: 1, selectedSize: autoSize }];
// //     });
// //     openCartModal();
// //   };

// //   const handleUpdateQuantity = (productId, newQty) => {
// //     if (newQty <= 0) {
// //       handleRemoveFromCart(productId);
// //       return;
// //     }
// //     const cartItem = cartItems.find((item) => item._id === productId);
// //     if (cartItem) {
// //       const remStock = cartItem.remainingStock !== undefined && cartItem.remainingStock !== null ? cartItem.remainingStock : (cartItem.quantity !== undefined ? cartItem.quantity : 10);
// //       if (newQty > remStock) {
// //         alert(`Only ${remStock} item(s) available in stock!`);
// //         return;
// //       }
// //     }
// //     setCartItems((prevItems) =>
// //       prevItems.map((item) => (item._id === productId ? { ...item, quantity: newQty } : item))
// //     );
// //   };

// //   const handleRemoveFromCart = (productId) => {
// //     setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
// //   };

// //   const handleLogout = () => {
// //     localStorage.removeItem('df_token');
// //     localStorage.removeItem('df_user');
// //     setUser(null);
// //   };

// //   const handleProceedToCheckout = () => {
// //     pushModalHistory('checkout');
// //     setIsCartOpen(false);
// //     setIsCheckoutOpen(true);
// //   };

// //   const handleProceedToPayment = (address) => {
// //     setDeliveryAddress(address);
// //     pushModalHistory('payment');
// //     setIsCheckoutOpen(false);
// //     setIsPaymentOpen(true);
// //   };

// //   const handleBackToCheckout = () => {
// //     window.history.back();
// //   };

// //   const handleBackToCart = () => {
// //     window.history.back();
// //   };

// //   const handleOrderSuccess = () => {
// //     setCartItems([]);
// //     setAppliedCoupon(null);
// //     setIsCartOpen(false);
// //     setIsCheckoutOpen(false);
// //     setIsPaymentOpen(false);
// //     try {
// //       localStorage.removeItem('df_cart');
// //     } catch (e) {}
// //   };

// //   const closeAllModals = () => {
// //     setIsCartOpen(false);
// //     setIsCheckoutOpen(false);
// //     setIsPaymentOpen(false);
// //     setIsProfileOpen(false);
// //     setIsAuthOpen(false);
// //     setIsDetailOpen(false);
// //     setIsNotificationsOpen(false);
// //     setIsLightboxOpen(false);
// //     setIsAboutUsOpen(false);
// //     setIsTermsOpen(false);
// //     setIsFilterModalOpen(false);
// //   };

// //   const handleMobileHomeClick = () => {
// //     closeAllModals();
// //     setSelectedCategory('All');
// //     window.scrollTo({ top: 0, behavior: 'smooth' });
// //   };

// //   const handleMobileAccountClick = () => {
// //     closeAllModals();
// //     if (user) {
// //       openProfileModal();
// //     } else {
// //       openAuthModal();
// //     }
// //   };

// //   const handleMobileCartClick = () => {
// //     closeAllModals();
// //     openCartModal();
// //   };

// //   // Wishlist State
// //   const [wishlist, setWishlist] = useState(() => {
// //     try {
// //       const saved = localStorage.getItem('df_wishlist');
// //       return saved ? JSON.parse(saved) : [];
// //     } catch (e) {
// //       return [];
// //     }
// //   });

// //   const handleToggleWishlist = (prod) => {
// //     if (!prod) return;
// //     const prodId = typeof prod === 'string' ? prod : prod._id || prod.id;
    
// //     setWishlist((prev) => {
// //       const prevList = Array.isArray(prev) ? prev : [];
// //       const exists = prevList.some((item) => {
// //         const id = typeof item === 'string' ? item : item?._id || item?.id;
// //         return id === prodId;
// //       });

// //       if (exists) {
// //         return prevList.filter((item) => {
// //           const id = typeof item === 'string' ? item : item?._id || item?.id;
// //           return id !== prodId;
// //         });
// //       } else {
// //         return [...prevList, prod];
// //       }
// //     });
// //   };

// //   useEffect(() => {
// //     fetchCategories();
// //   }, []);

// //   useEffect(() => {
// //     setPage(1);
// //     fetchProducts(1, false);
// //   }, [selectedCategory, searchTerm]);

// //   return (
// //     <div className="app-container">
// //       {/* Sticky Live Sale Banner */}
// //       {currentView === 'shop' && (
// //         <LiveSaleBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />
// //       )}

// //       {/* Header / Navbar */}
// //       <Navbar
// //         searchTerm={searchTerm}
// //         setSearchTerm={setSearchTerm}
// //         cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
// //         onOpenCart={openCartModal}
// //         user={currentView === 'admin' ? null : user}
// //         onOpenAuth={openAuthModal}
// //         onOpenProfile={openProfileModal}
// //         onLogout={handleLogout}
// //         currentView={currentView}
// //         setCurrentView={setView}
// //         categories={categories}
// //         allProducts={products}
// //         onSelectProduct={handleOpenProductDetail}
// //         unreadNotificationCount={unreadNotificationCount}
// //         showNotificationBubble={showNotificationBubble}
// //         latestNotificationTitle={latestNotificationTitle}
// //         onOpenNotifications={openNotificationsModal}
// //         activeFilterCount={activeFilterCount}
// //         onOpenFilterModal={openFilterModal}
// //       />

// //       {/* Main View Switch */}
// //       {currentView === 'admin' ? (
// //         <AdminPanel onExitAdmin={() => setView('shop')} />
// //       ) : (
// //         <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
// //           <div className="main-layout" style={{ flex: '1 0 auto' }}>
// //             {/* Category Sidebar */}
// //             <CategorySidebar
// //               categories={categories}
// //               selectedCategory={selectedCategory}
// //               onSelectCategory={(catName) => setSelectedCategory(catName)}
// //             />

// //             {/* Products Section */}
// //             <main ref={catalogRef} className="products-section">
// //               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
// //                 <h2>
// //                   <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
// //                   <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
// //                     ({displayedProducts.length} products)
// //                   </span>
// //                 </h2>

// //                 <button
// //                   type="button"
// //                   onClick={openFilterModal}
// //                   style={{
// //                     display: 'inline-flex',
// //                     alignItems: 'center',
// //                     gap: '6px',
// //                     background: activeFilterCount > 0 ? '#fdf4ff' : '#ffffff',
// //                     border: activeFilterCount > 0 ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
// //                     color: activeFilterCount > 0 ? '#c026d3' : '#334155',
// //                     padding: '0.45rem 0.85rem',
// //                     borderRadius: '10px',
// //                     fontWeight: '700',
// //                     fontSize: '0.82rem',
// //                     cursor: 'pointer',
// //                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
// //                   }}
// //                 >
// //                   <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#c026d3' : '#475569'} />
// //                   <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
// //                 </button>
// //               </div>

// //               {/* Active Filter Strip */}
// //               {activeFilterCount > 0 && (
// //                 <div
// //                   style={{
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     gap: '0.5rem',
// //                     flexWrap: 'wrap',
// //                     background: '#fdf4ff',
// //                     border: '1.5px solid #f0abfc',
// //                     padding: '0.65rem 0.85rem',
// //                     borderRadius: '12px',
// //                     marginBottom: '1.25rem'
// //                   }}
// //                 >
// //                   <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86198f', display: 'flex', alignItems: 'center', gap: '4px' }}>
// //                     <Filter size={14} /> Active Filters:
// //                   </span>

// //                   {appliedFilters.category && appliedFilters.category !== 'All' && (
// //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// //                       Category: {appliedFilters.category}
// //                     </span>
// //                   )}

// //                   {appliedFilters.presetPrice && appliedFilters.presetPrice !== 'all' && (
// //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// //                       Price: {appliedFilters.presetPrice}
// //                     </span>
// //                   )}

// //                   {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
// //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// //                       ₹{appliedFilters.minPrice || 0} - ₹{appliedFilters.maxPrice || '∞'}
// //                     </span>
// //                   )}

// //                   {appliedFilters.minDiscount > 0 && (
// //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// //                       {appliedFilters.minDiscount}%+ Off
// //                     </span>
// //                   )}

// //                   {appliedFilters.minRating > 0 && (
// //                     <span style={{ background: '#ffffff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// //                       {appliedFilters.minRating}★ & above
// //                     </span>
// //                   )}

// //                   {appliedFilters.inStockOnly && (
// //                     <span style={{ background: '#ffffff', border: '1px solid #bbf7d0', color: '#15803d', padding: '2px 8px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '800' }}>
// //                       In Stock Only
// //                     </span>
// //                   )}

// //                   <button
// //                     type="button"
// //                     onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
// //                     style={{
// //                       background: '#fef2f2',
// //                       border: '1px solid #fca5a5',
// //                       color: '#dc2626',
// //                       padding: '2px 8px',
// //                       borderRadius: '14px',
// //                       fontSize: '0.75rem',
// //                       fontWeight: '800',
// //                       cursor: 'pointer',
// //                       display: 'inline-flex',
// //                       alignItems: 'center',
// //                       gap: '3px',
// //                       marginLeft: 'auto'
// //                     }}
// //                   >
// //                     <RotateCcw size={12} /> Clear All
// //                   </button>
// //                 </div>
// //               )}

// //               {/* Product Grid Render */}
// //               {apiError ? (
// //                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #fee2e2' }}>
// //                   <h3 style={{ color: '#dc2626' }}>Failed to Load Products</h3>
// //                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{apiError}</p>
// //                   <button
// //                     type="button"
// //                     onClick={() => fetchProducts(1, true)}
// //                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
// //                   >
// //                     Retry Loading
// //                   </button>
// //                 </div>
// //               ) : loading && products.length === 0 ? (
// //                 <ProductGridSkeleton count={8} />
// //               ) : displayedProducts.length === 0 ? (
// //                 <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
// //                   <h3>No matching products found</h3>
// //                   <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
// //                     Try resetting your filters or selecting another category.
// //                   </p>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       setAppliedFilters(DEFAULT_FILTERS);
// //                       setSelectedCategory('All');
// //                       setSearchTerm('');
// //                     }}
// //                     style={{ marginTop: '1rem', background: '#c026d3', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
// //                   >
// //                     Clear All Filters & Search
// //                   </button>
// //                 </div>
// //               ) : (
// //                 <>
// //                   <div className="product-grid">
// //                     {displayedProducts.map((product) => {
// //                       const isWishlisted = wishlist.some(w => (w._id || w.id) === (product._id || product.id));
// //                       return (
// //                         <ProductCard
// //                           key={product._id || product.id}
// //                           product={product}
// //                           onAddToCart={handleAddToCart}
// //                           onClickProductTitle={handleOpenProductDetail}
// //                           onClickProductImage={handleOpenProductDetail}
// //                           isWishlisted={isWishlisted}
// //                           onToggleWishlist={handleToggleWishlist}
// //                           cartItems={cartItems}
// //                           onOpenCart={openCartModal}
// //                         />
// //                       );
// //                     })}
// //                   </div>

// //                   {/* Previous / Next Pagination */}
// //                   {totalPages > 1 && (
// //                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '3.5rem 0 2.5rem 0', width: '100%', gap: '0.85rem' }}>
// //                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
// //                         <button
// //                           type="button"
// //                           disabled={page <= 1 || loading}
// //                           onClick={() => handlePageChange(page - 1)}
// //                           style={{
// //                             display: 'inline-flex',
// //                             alignItems: 'center',
// //                             justifyContent: 'center',
// //                             padding: '10px 22px',
// //                             fontSize: '1rem',
// //                             fontWeight: '600',
// //                             cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
// //                             background: page <= 1 || loading ? '#f1f5f9' : '#f4f4f5',
// //                             color: page <= 1 || loading ? '#94a3b8' : '#18181b',
// //                             border: '1px solid #e4e4e7',
// //                             borderRadius: '4px',
// //                             transition: 'all 0.15s ease',
// //                             outline: 'none'
// //                           }}
// //                         >
// //                           « Previous
// //                         </button>

// //                         <button
// //                           type="button"
// //                           disabled={page >= totalPages || loading}
// //                           onClick={() => handlePageChange(page + 1)}
// //                           style={{
// //                             display: 'inline-flex',
// //                             alignItems: 'center',
// //                             justifyContent: 'center',
// //                             padding: '10px 24px',
// //                             fontSize: '1rem',
// //                             fontWeight: '600',
// //                             cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
// //                             background: page >= totalPages || loading ? '#94a3b8' : '#c026d3',
// //                             color: '#ffffff',
// //                             border: 'none',
// //                             borderRadius: '4px',
// //                             transition: 'all 0.15s ease',
// //                             outline: 'none',
// //                             boxShadow: page >= totalPages || loading ? 'none' : '0 2px 8px rgba(192, 38, 211, 0.25)'
// //                           }}
// //                         >
// //                           Next »
// //                         </button>
// //                       </div>

// //                       <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', margin: 0 }}>
// //                         Page <span style={{ color: '#c026d3', fontWeight: '800' }}>{page}</span> of{' '}
// //                         <span style={{ color: '#0f172a', fontWeight: '800' }}>{totalPages}</span> ({totalProductsCount} total items)
// //                       </p>
// //                     </div>
// //                   )}
// //                 </>
// //               )}
// //             </main>
// //           </div>

// //           <Footer
// //             onOpenAboutUs={openAboutUsModal}
// //             onOpenTermsPrivacy={openTermsModal}
// //           />
// //         </div>
// //       )}

// //       {/* Modals & Drawers */}
// //       <ProductDetailModal
// //         product={selectedProduct}
// //         isOpen={isDetailOpen}
// //         onClose={handleCloseProductDetail}
// //         onAddToCart={handleAddToCart}
// //         allProducts={products}
// //         onSelectProduct={handleSelectRelatedProduct}
// //         isWishlisted={wishlist.some(w => (w._id || w.id) === (selectedProduct?._id || selectedProduct?.id))}
// //         onToggleWishlist={handleToggleWishlist}
// //         wishlist={wishlist}
// //         historyLength={productHistory.length}
// //         onGoBack={handleProductDetailBack}
// //         searchTerm={searchTerm}
// //         setSearchTerm={setSearchTerm}
// //         cartItems={cartItems}
// //         onOpenCart={openCartModal}
// //       />

// //       <ImageLightboxModal
// //         product={lightboxProduct}
// //         isOpen={isLightboxOpen}
// //         onClose={() => window.history.back()}
// //       />

// //       <AuthModal
// //         isOpen={isAuthOpen}
// //         onClose={() => window.history.back()}
// //         onAuthSuccess={(userData) => setUser(userData)}
// //       />

// //       <UserProfileModal
// //         isOpen={isProfileOpen}
// //         onClose={() => window.history.back()}
// //         user={user}
// //         onLogout={handleLogout}
// //         onUpdateUser={(updatedUser) => {
// //           const merged = { ...user, ...updatedUser };
// //           setUser(merged);
// //           try {
// //             const clone = { ...merged };
// //             if (clone.avatar && clone.avatar.startsWith('data:')) clone.avatar = '';
// //             if (clone.profilePicture && clone.profilePicture.startsWith('data:')) clone.profilePicture = '';
// //             localStorage.setItem('df_user', JSON.stringify(clone));
// //           } catch (e) {}
// //         }}
// //         wishlist={wishlist}
// //         onToggleWishlist={handleToggleWishlist}
// //         onSelectProduct={(p) => {
// //           handleOpenProductDetail(p);
// //         }}
// //         onAddToCart={handleAddToCart}
// //         cartItems={cartItems}
// //         onOpenCart={openCartModal}
// //       />

// //       <CartDrawer
// //         isOpen={isCartOpen}
// //         onClose={() => window.history.back()}
// //         cartItems={cartItems}
// //         onUpdateQuantity={handleUpdateQuantity}
// //         onRemoveItem={handleRemoveFromCart}
// //         onProceedToCheckout={handleProceedToCheckout}
// //         user={user}
// //         onOpenAuth={openAuthModal}
// //         appliedCoupon={appliedCoupon}
// //         setAppliedCoupon={setAppliedCoupon}
// //       />

// //       <CheckoutModal
// //         isOpen={isCheckoutOpen}
// //         onClose={() => window.history.back()}
// //         onBackToCart={handleBackToCart}
// //         user={user}
// //         onProceedToPayment={handleProceedToPayment}
// //       />

// //       <PaymentModal
// //         isOpen={isPaymentOpen}
// //         onClose={() => window.history.back()}
// //         onBackToCheckout={handleBackToCheckout}
// //         user={user}
// //         cartItems={cartItems}
// //         deliveryAddress={deliveryAddress}
// //         appliedCoupon={appliedCoupon}
// //         onOrderSuccess={handleOrderSuccess}
// //       />

// //       <NotificationModal
// //         isOpen={isNotificationsOpen}
// //         onClose={() => window.history.back()}
// //         notifications={notifications}
// //         readNotificationIds={readNotificationIds}
// //         currentUserId={currentUserId}
// //         onMarkAllAsRead={handleMarkAllAsRead}
// //         onMarkSingleAsRead={handleMarkSingleAsRead}
// //         onNavigateToShop={() => setView('shop')}
// //       />

// //       {currentView === 'shop' && (
// //         <MobileBottomNav
// //           activeTab={
// //             (isCartOpen || isCheckoutOpen || isPaymentOpen)
// //               ? 'cart'
// //               : (isProfileOpen || isAuthOpen)
// //               ? 'account'
// //               : 'home'
// //           }
// //           onHomeClick={handleMobileHomeClick}
// //           onAccountClick={handleMobileAccountClick}
// //           onCartClick={handleMobileCartClick}
// //           cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
// //           isLoggedIn={Boolean(user)}
// //         />
// //       )}

// //       <ProductFilterModal
// //         isOpen={isFilterModalOpen}
// //         onClose={() => window.history.back()}
// //         categories={categories}
// //         allProducts={products}
// //         currentFilters={appliedFilters}
// //         onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
// //         onResetFilters={() => setAppliedFilters(DEFAULT_FILTERS)}
// //       />

// //       <AboutUsModal
// //         isOpen={isAboutUsOpen}
// //         onClose={() => window.history.back()}
// //       />

// //       <TermsPrivacyModal
// //         isOpen={isTermsOpen}
// //         onClose={() => window.history.back()}
// //         initialTab={termsTab}
// //       />
// //     </div>
// //   );
// // }

// // export default App;






// import React, { useState, useEffect, useRef, useMemo } from 'react';
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

//   useEffect(() => {
//     const handleLocation = () => {
//       if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
//         setCurrentView('admin');
//       } else {
//         setCurrentView('shop');
//       }
//     };
//     handleLocation();
//     window.addEventListener('popstate', handleLocation);
//     return () => window.removeEventListener('popstate', handleLocation);
//   }, []);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ view: 'shop' }, '', '/');
//     }
//   };

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

//   const modalStatesRef = useRef({});
//   modalStatesRef.current = {
//     isPaymentOpen,
//     isCheckoutOpen,
//     isCartOpen,
//     isProfileOpen,
//     isDetailOpen,
//     isLightboxOpen,
//     isAuthOpen,
//     isNotificationsOpen,
//     isAboutUsOpen,
//     isTermsOpen,
//     isFilterModalOpen,
//     productHistoryLength: productHistory.length,
//     currentView
//   };

//   const pushModalHistory = (name) => {
//     try {
//       window.history.pushState({ modal: name }, '', window.location.href);
//     } catch (e) {}
//   };

//   const openCartModal = () => {
//     pushModalHistory('cart');
//     setIsCartOpen(true);
//   };

//   const openProfileModal = () => {
//     pushModalHistory('profile');
//     setIsProfileOpen(true);
//   };

//   const openAuthModal = () => {
//     pushModalHistory('auth');
//     setIsAuthOpen(true);
//   };

//   const openFilterModal = () => {
//     pushModalHistory('filter');
//     setIsFilterModalOpen(true);
//   };

//   const openAboutUsModal = () => {
//     pushModalHistory('about');
//     setIsAboutUsOpen(true);
//   };

//   const openTermsModal = (tab = 'privacy') => {
//     setTermsTab(tab);
//     pushModalHistory('terms');
//     setIsTermsOpen(true);
//   };

//   const openNotificationsModal = () => {
//     pushModalHistory('notifications');
//     setIsNotificationsOpen(true);
//     setShowNotificationBubble(false);
//     const allIds = notifications.map(n => n._id);
//     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updatedRead);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
//     } catch (e) {}
//   };

//   useEffect(() => {
//     const handlePopState = () => {
//       const state = modalStatesRef.current;

//       if (state.isLightboxOpen) {
//         setIsLightboxOpen(false);
//       } else if (state.isPaymentOpen) {
//         setIsPaymentOpen(false);
//         setIsCheckoutOpen(true);
//       } else if (state.isCheckoutOpen) {
//         setIsCheckoutOpen(false);
//         setIsCartOpen(true);
//       } else if (state.isCartOpen) {
//         setIsCartOpen(false);
//       } else if (state.isFilterModalOpen) {
//         setIsFilterModalOpen(false);
//       } else if (state.isNotificationsOpen) {
//         setIsNotificationsOpen(false);
//       } else if (state.isAboutUsOpen) {
//         setIsAboutUsOpen(false);
//       } else if (state.isTermsOpen) {
//         setIsTermsOpen(false);
//       } else if (state.isProfileOpen) {
//         setIsProfileOpen(false);
//       } else if (state.isAuthOpen) {
//         setIsAuthOpen(false);
//       } else if (state.isDetailOpen) {
//         if (productHistoryRef.current.length > 1) {
//           const nextHistory = [...productHistoryRef.current];
//           nextHistory.pop();
//           const prevProduct = nextHistory[nextHistory.length - 1];
//           const prodId = prevProduct._id || prevProduct.id;
//           updateProductHistory(nextHistory);
//           setSelectedProduct(prevProduct);
//           sessionStorage.setItem('df_opened_product_id', prodId);
//         } else {
//           updateProductHistory([]);
//           setIsDetailOpen(false);
//           sessionStorage.removeItem('df_opened_product_id');
//         }
//       } else if (state.currentView === 'admin') {
//         setCurrentView('shop');
//       }
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         const state = modalStatesRef.current;
//         if (state.isLightboxOpen || state.isPaymentOpen || state.isCheckoutOpen || state.isCartOpen || state.isFilterModalOpen || state.isNotificationsOpen || state.isAboutUsOpen || state.isTermsOpen || state.isProfileOpen || state.isAuthOpen || state.isDetailOpen) {
//           window.history.back();
//         }
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

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

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

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
//     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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
//     pushModalHistory(`product_${prodId}`);
//     setSelectedProduct(product);
//     updateProductHistory([product]);
//     setIsDetailOpen(true);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     pushModalHistory(`product_${prodId}`);
//     setSelectedProduct(product);
//     updateProductHistory([...productHistoryRef.current, product]);
//     setIsDetailOpen(true);
//     sessionStorage.setItem('df_opened_product_id', prodId);
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

//       {/* USER PROFILE MODAL WITH ALL PRODUCTS PROPS FOR INSTANT WISHLIST */}
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
//           pushModalHistory('checkout');
//           setIsCartOpen(false);
//           setIsCheckoutOpen(true);
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
//           pushModalHistory('payment');
//           setIsCheckoutOpen(false);
//           setIsPaymentOpen(true);
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
//           setIsCartOpen(false);
//           setIsCheckoutOpen(false);
//           setIsPaymentOpen(false);
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
//             setIsCartOpen(false);
//             setIsProfileOpen(false);
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








// import React, { useState, useEffect, useRef, useMemo } from 'react';
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

//   useEffect(() => {
//     const handleLocation = () => {
//       if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
//         setCurrentView('admin');
//       } else {
//         setCurrentView('shop');
//       }
//     };
//     handleLocation();
//     window.addEventListener('popstate', handleLocation);
//     return () => window.removeEventListener('popstate', handleLocation);
//   }, []);

//   const setView = (view) => {
//     setCurrentView(view);
//     if (view === 'admin') {
//       window.history.pushState({ view: 'admin' }, '', '/admin');
//     } else {
//       window.history.pushState({ view: 'shop' }, '', '/');
//     }
//   };

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

//   const modalStatesRef = useRef({});
//   modalStatesRef.current = {
//     isPaymentOpen,
//     isCheckoutOpen,
//     isCartOpen,
//     isProfileOpen,
//     isDetailOpen,
//     isLightboxOpen,
//     isAuthOpen,
//     isNotificationsOpen,
//     isAboutUsOpen,
//     isTermsOpen,
//     isFilterModalOpen,
//     productHistoryLength: productHistory.length,
//     currentView
//   };

//   const pushModalHistory = (name) => {
//     try {
//       window.history.pushState({ modal: name }, '', window.location.href);
//     } catch (e) {}
//   };

//   const openCartModal = () => {
//     pushModalHistory('cart');
//     setIsCartOpen(true);
//   };

//   const openProfileModal = () => {
//     pushModalHistory('profile');
//     setIsProfileOpen(true);
//   };

//   const openAuthModal = () => {
//     pushModalHistory('auth');
//     setIsAuthOpen(true);
//   };

//   const openFilterModal = () => {
//     pushModalHistory('filter');
//     setIsFilterModalOpen(true);
//   };

//   const openAboutUsModal = () => {
//     pushModalHistory('about');
//     setIsAboutUsOpen(true);
//   };

//   const openTermsModal = (tab = 'privacy') => {
//     setTermsTab(tab);
//     pushModalHistory('terms');
//     setIsTermsOpen(true);
//   };

//   const openNotificationsModal = () => {
//     pushModalHistory('notifications');
//     setIsNotificationsOpen(true);
//     setShowNotificationBubble(false);
//     const allIds = notifications.map(n => n._id);
//     const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
//     setReadNotificationIds(updatedRead);
//     try {
//       localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
//     } catch (e) {}
//   };

//   useEffect(() => {
//     const handlePopState = () => {
//       const state = modalStatesRef.current;

//       if (state.isLightboxOpen) {
//         setIsLightboxOpen(false);
//       } else if (state.isPaymentOpen) {
//         setIsPaymentOpen(false);
//         setIsCheckoutOpen(true);
//       } else if (state.isCheckoutOpen) {
//         setIsCheckoutOpen(false);
//         setIsCartOpen(true);
//       } else if (state.isCartOpen) {
//         setIsCartOpen(false);
//       } else if (state.isFilterModalOpen) {
//         setIsFilterModalOpen(false);
//       } else if (state.isNotificationsOpen) {
//         setIsNotificationsOpen(false);
//       } else if (state.isAboutUsOpen) {
//         setIsAboutUsOpen(false);
//       } else if (state.isTermsOpen) {
//         setIsTermsOpen(false);
//       } else if (state.isProfileOpen) {
//         setIsProfileOpen(false);
//       } else if (state.isAuthOpen) {
//         setIsAuthOpen(false);
//       } else if (state.isDetailOpen) {
//         if (productHistoryRef.current.length > 1) {
//           const nextHistory = [...productHistoryRef.current];
//           nextHistory.pop();
//           const prevProduct = nextHistory[nextHistory.length - 1];
//           const prodId = prevProduct._id || prevProduct.id;
//           updateProductHistory(nextHistory);
//           setSelectedProduct(prevProduct);
//           sessionStorage.setItem('df_opened_product_id', prodId);
//         } else {
//           updateProductHistory([]);
//           setIsDetailOpen(false);
//           sessionStorage.removeItem('df_opened_product_id');
//         }
//       } else if (state.currentView === 'admin') {
//         setCurrentView('shop');
//       }
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         const state = modalStatesRef.current;
//         if (state.isLightboxOpen || state.isPaymentOpen || state.isCheckoutOpen || state.isCartOpen || state.isFilterModalOpen || state.isNotificationsOpen || state.isAboutUsOpen || state.isTermsOpen || state.isProfileOpen || state.isAuthOpen || state.isDetailOpen) {
//           window.history.back();
//         }
//       }
//     };

//     window.addEventListener('popstate', handlePopState);
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

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

//   const [loading, setLoading] = useState(() => products.length === 0);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProductsCount, setTotalProductsCount] = useState(() => products.length);
//   const [apiError, setApiError] = useState(null);

//   const catalogRef = useRef(null);
//   const isFetchingRef = useRef(false);

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
//     pushModalHistory(`product_${prodId}`);
//     setSelectedProduct(product);
//     updateProductHistory([product]);
//     setIsDetailOpen(true);
//     sessionStorage.setItem('df_opened_product_id', prodId);
//   };

//   const handleSelectRelatedProduct = (product) => {
//     if (!product) return;
//     const prodId = product._id || product.id;
//     pushModalHistory(`product_${prodId}`);
//     setSelectedProduct(product);
//     updateProductHistory([...productHistoryRef.current, product]);
//     setIsDetailOpen(true);
//     sessionStorage.setItem('df_opened_product_id', prodId);
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

//       {/* USER PROFILE MODAL WITH ALL PRODUCTS PROPS FOR INSTANT WISHLIST */}
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
//           pushModalHistory('checkout');
//           setIsCartOpen(false);
//           setIsCheckoutOpen(true);
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
//           pushModalHistory('payment');
//           setIsCheckoutOpen(false);
//           setIsPaymentOpen(true);
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
//           setIsCartOpen(false);
//           setIsCheckoutOpen(false);
//           setIsPaymentOpen(false);
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
//             setIsCartOpen(false);
//             setIsProfileOpen(false);
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
import { API_URL, apiFetch, parseResponseSafely } from './api';
import { useSocket } from './context/SocketContext.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('shop');

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
    const urlParams = new URLSearchParams(window.location.search);
    const p = parseInt(urlParams.get('page')) || parseInt(sessionStorage.getItem('df_page')) || 1;
    const cat = urlParams.get('cat') || sessionStorage.getItem('df_selected_cat') || 'All';
    return { page: p, cat };
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

  // Sync URL Params on category/page change for refresh persistence
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
  // UNIFIED STACK-BASED HISTORY CONTROLLER (FULL BACK/FORWARD)
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
    if (!state || !state.modal) {
      closeAllModals();
      setCurrentView(window.location.pathname === '/admin' ? 'admin' : 'shop');
      return;
    }

    if (state.view) {
      setCurrentView(state.view);
    } else {
      setCurrentView(window.location.pathname === '/admin' ? 'admin' : 'shop');
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

  // Direct Close to Home (Clears modal stack directly)
  const closeToHome = useCallback(() => {
    closeAllModals();
    try {
      window.history.pushState({ modal: null, view: 'shop' }, '', window.location.pathname + window.location.search);
    } catch (e) {}
  }, [closeAllModals]);

  // Re-hydrate state on page refresh
  useEffect(() => {
    const savedModal = window.history.state?.modal || sessionStorage.getItem('df_active_modal');
    if (savedModal) {
      applyNavigationState(window.history.state || { modal: savedModal, view: 'shop' });
    } else if (!window.history.state) {
      window.history.replaceState(
        { modal: null, view: window.location.pathname === '/admin' ? 'admin' : 'shop' },
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
  const openFilterModal = () => navigateTo('filter');
  const openAboutUsModal = () => navigateTo('about');
  const openTermsModal = (tab = 'privacy') => navigateTo('terms', { termsTab: tab });

  const openNotificationsModal = () => {
    setShowNotificationBubble(false);
    const allIds = notifications.map(n => n._id);
    const updatedRead = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(updatedRead);
    try {
      localStorage.setItem('df_read_notifications', JSON.stringify(updatedRead));
    } catch (e) {}
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

    // 1. Instant top scroll for window, html, and body
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    // 2. Scroll catalogRef to ensure products section top is reached
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 3. Post-render safeguard (handles DOM height changes after new products load)
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

  const handleCloseProductDetail = () => {
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
  }, []);

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
        unreadNotificationCount={notifications.length}
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
        onMarkAllAsRead={() => {}}
        onMarkSingleAsRead={() => {}}
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