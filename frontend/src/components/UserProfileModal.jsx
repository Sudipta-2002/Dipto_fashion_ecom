// import React, { useState, useEffect, useRef } from 'react';
// import {
//   X,
//   User,
//   ShoppingBag,
//   MapPin,
//   HelpCircle,
//   ShieldCheck,
//   LogOut,
//   ChevronRight,
//   Package,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Truck,
//   Phone,
//   Bot,
//   Star,
//   RotateCcw,
//   Trash2,
//   Send,
//   MessageSquare,
//   AlertCircle,
//   Crown,
//   Sparkles,
//   Ban,
//   Heart,
//   Plus,
//   Pencil,
//   Camera,
//   Save,
//   ArrowLeft,
//   Info
// } from 'lucide-react';
// import TermsPrivacyModal from './TermsPrivacyModal';
// import AiChatbotModal from './AiChatbotModal';
// import AboutUsModal from './AboutUsModal';
// import ProductRatingModal from './ProductRatingModal';
// import ProductReturnModal from './ProductReturnModal';
// import OrderCancelModal from './OrderCancelModal';
// import ProductCard from './ProductCard';
// import ToastNotification from './ToastNotification';
// import { API_URL } from '../api';
// import { getCache, setCache } from '../utils/cache';

// const UserProfileModal = ({
//   isOpen,
//   onClose,
//   user,
//   onLogout,
//   onUpdateUser,
//   wishlist = [],
//   onToggleWishlist,
//   onSelectProduct,
//   onAddToCart,
//   cartItems = [],
//   onOpenCart
// }) => {
//   const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'orders', 'addresses', 'support', 'editProfile'
//   const [userOrders, setUserOrders] = useState([]);
//   const [userAddresses, setUserAddresses] = useState(user?.addresses || []);
//   const [loadingOrders, setLoadingOrders] = useState(false);

//   // Modals inside Profile
//   const [isPolicyOpen, setIsPolicyOpen] = useState(false);
//   const [policyTab, setPolicyTab] = useState('privacy');
//   const [isAiChatOpen, setIsAiChatOpen] = useState(false);
//   const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  
//   // Rating, Return & Cancel Modals
//   const [ratingProduct, setRatingProduct] = useState(null);
//   const [returnOrder, setReturnOrder] = useState(null);
//   const [cancelOrder, setCancelOrder] = useState(null);

//   // New Address Form State
//   const [showAddAddrForm, setShowAddAddrForm] = useState(false);
//   const [newAddr, setNewAddr] = useState({
//     userName: user?.name || '',
//     mobileNumber: user?.phone || '',
//     address: '',
//     landmark: '',
//     pincode: ''
//   });
//   const [addrLoading, setAddrLoading] = useState(false);

//   // User Reports & Support State
//   const [userReports, setUserReports] = useState([]);
//   const [reportSubject, setReportSubject] = useState('');
//   const [reportCategory, setReportCategory] = useState('Order Issue');
//   const [reportMessage, setReportMessage] = useState('');
//   const [submittingReport, setSubmittingReport] = useState(false);
//   const [loadingReports, setLoadingReports] = useState(false);
//   const [reportToast, setReportToast] = useState(null);

//   // ──────────────────────────────────────
//   // EDIT PROFILE STATE
//   // ──────────────────────────────────────
//   const [editForm, setEditForm] = useState({
//     name: '',
//     gender: '',
//     avatar: ''
//   });
//   const [editSaving, setEditSaving] = useState(false);
//   const [editSuccess, setEditSuccess] = useState('');
//   const [editError, setEditError] = useState('');
//   const avatarInputRef = useRef(null);

//   useEffect(() => {
//     if (isOpen && user) {
//       fetchUserOrders();
//       fetchUserAddresses();
//       fetchUserReports();
//       setActiveTab('menu');
//       // Pre-fill the edit form with current user data
//       setEditForm({
//         name: user.name || '',
//         gender: user.gender || '',
//         avatar: user.avatar || ''
//       });
//       setEditSuccess('');
//       setEditError('');
//     }
//   }, [isOpen, user]);

//   // Real-time order status sync via Socket.io (dispatched from App.jsx)
//   useEffect(() => {
//     const handleOrderStatusUpdate = (e) => {
//       const updatedOrder = e.detail;
//       if (!updatedOrder) return;
//       setUserOrders((prev) =>
//         prev.map((o) =>
//           (o._id === updatedOrder._id || o.orderId === updatedOrder.orderId)
//             ? { ...o, ...updatedOrder }
//             : o
//         )
//       );
//     };
//     window.addEventListener('df_order_status_updated', handleOrderStatusUpdate);
//     return () => window.removeEventListener('df_order_status_updated', handleOrderStatusUpdate);
//   }, []);

//   const fetchUserAddresses = async () => {
//     try {
//       const token = localStorage.getItem('df_token');
//       let userEmail = user?.email || '';
//       if (!userEmail) {
//         try {
//           const savedUser = localStorage.getItem('df_user');
//           if (savedUser) userEmail = JSON.parse(savedUser).email || '';
//         } catch (e) {}
//       }
//       let url = `${API_URL}/api/user/addresses`;
//       if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;

//       const headers = {};
//       if (token) headers['Authorization'] = `Bearer ${token}`;

//       const res = await fetch(url, { headers });
//       if (res.ok) {
//         const data = await res.json();
//         if (Array.isArray(data)) {
//           setUserAddresses(data);
//         }
//       }
//     } catch (e) {
//       console.error('Error fetching user addresses:', e);
//     }
//   };

//   const fetchUserReports = async () => {
//     setLoadingReports(true);
//     try {
//       const token = localStorage.getItem('df_token');
//       let userEmail = user?.email || '';
//       if (!userEmail) {
//         try {
//           const savedUser = localStorage.getItem('df_user');
//           if (savedUser) userEmail = JSON.parse(savedUser).email || '';
//         } catch (e) {}
//       }
//       let url = `${API_URL}/api/reports/my-reports`;
//       if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;

//       const headers = {};
//       if (token) headers['Authorization'] = `Bearer ${token}`;

//       const res = await fetch(url, { headers });
//       if (res.ok) {
//         const data = await res.json();
//         setUserReports(Array.isArray(data) ? data : []);
//       }
//     } catch (e) {
//       console.error('Error fetching user reports:', e);
//     } finally {
//       setLoadingReports(false);
//     }
//   };

//   const handleSubmitReport = async (e) => {
//     e.preventDefault();
//     if (!reportSubject.trim() || !reportMessage.trim()) {
//       setReportToast({ type: 'error', message: 'Subject and detailed message are required' });
//       return;
//     }

//     setSubmittingReport(true);
//     try {
//       const token = localStorage.getItem('df_token');
//       let userEmail = user?.email || '';
//       let userName = user?.name || 'Customer';

//       if (!userEmail) {
//         try {
//           const savedUser = localStorage.getItem('df_user');
//           if (savedUser) {
//             const parsed = JSON.parse(savedUser);
//             userEmail = parsed.email || '';
//             userName = parsed.name || userName;
//           }
//         } catch (e) {}
//       }

//       const res = await fetch(`${API_URL}/api/reports`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({
//           subject: reportSubject.trim(),
//           category: reportCategory,
//           message: reportMessage.trim(),
//           userEmail,
//           userName
//         })
//       });

//       const data = await res.json();
//       if (res.ok && data.success) {
//         setReportToast({ type: 'success', message: 'Report ticket submitted successfully! Admin will respond soon.' });
//         setReportSubject('');
//         setReportMessage('');
//         if (data.report) {
//           setUserReports((prev) => [data.report, ...prev]);
//         }
//         fetchUserReports();
//       } else {
//         setReportToast({ type: 'error', message: data.message || 'Failed to submit report' });
//       }
//     } catch (e) {
//       setReportToast({ type: 'error', message: 'Network error submitting report' });
//     } finally {
//       setSubmittingReport(false);
//     }
//   };

//   const handleDeleteAddress = async (addrId) => {
//     if (!window.confirm('Delete this saved address?')) return;
//     try {
//       const token = localStorage.getItem('df_token');
//       let userEmail = user?.email || '';
//       if (!userEmail) {
//         try {
//           const savedUser = localStorage.getItem('df_user');
//           if (savedUser) userEmail = JSON.parse(savedUser).email || '';
//         } catch (e) {}
//       }
//       let url = `${API_URL}/api/user/addresses/${addrId}`;
//       if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;

//       const headers = {};
//       if (token) headers['Authorization'] = `Bearer ${token}`;

//       const res = await fetch(url, { method: 'DELETE', headers });
//       if (res.ok) {
//         const data = await res.json();
//         if (data.addresses) setUserAddresses(data.addresses);
//         else fetchUserAddresses();
//       }
//     } catch (e) {
//       console.error('Error deleting address:', e);
//     }
//   };

//   const fetchUserOrders = async (forceRefresh = false) => {
//     let userEmail = user?.email || '';
//     if (!userEmail) {
//       try {
//         const savedUser = localStorage.getItem('df_user');
//         if (savedUser) userEmail = JSON.parse(savedUser).email || '';
//       } catch (e) {}
//     }
//     const cacheKey = `user_orders_${user?._id || userEmail || 'guest'}`;

//     // Stale-While-Revalidate: load cached orders instantly if available
//     const cachedOrders = getCache(cacheKey);
//     if (cachedOrders && Array.isArray(cachedOrders)) {
//       setUserOrders(cachedOrders);
//       setLoadingOrders(false);
//     } else if (!userOrders.length) {
//       setLoadingOrders(true);
//     }

//     try {
//       const token = localStorage.getItem('df_token');
//       let url = `${API_URL}/api/user/my-orders`;
//       if (userEmail) {
//         url += `?email=${encodeURIComponent(userEmail)}&userEmail=${encodeURIComponent(userEmail)}`;
//       }

//       const headers = {};
//       if (token) headers['Authorization'] = `Bearer ${token}`;

//       const res = await fetch(url, { headers });
//       if (res.ok) {
//         const data = await res.json();
//         const ordersArray = Array.isArray(data) ? data : (data.orders || []);
//         setUserOrders(ordersArray);
//         setCache(cacheKey, ordersArray, 5 * 60 * 1000);
//       } else if (!cachedOrders) {
//         setUserOrders([]);
//       }
//     } catch (e) {
//       console.error('Error fetching user orders:', e);
//       if (!cachedOrders) setUserOrders([]);
//     } finally {
//       setLoadingOrders(false);
//     }
//   };

//   const handleAddAddress = async (e) => {
//     e.preventDefault();
//     if (!newAddr.userName || !newAddr.mobileNumber || !newAddr.address || !newAddr.pincode) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     setAddrLoading(true);
//     try {
//       const token = localStorage.getItem('df_token');
//       let userEmail = user?.email || '';
//       if (!userEmail) {
//         try {
//           const savedUser = localStorage.getItem('df_user');
//           if (savedUser) userEmail = JSON.parse(savedUser).email || '';
//         } catch (e) {}
//       }

//       const res = await fetch(`${API_URL}/api/user/address`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({ ...newAddr, email: userEmail })
//       });
//       if (res.ok) {
//         const updatedAddrs = await res.json();
//         setUserAddresses(Array.isArray(updatedAddrs) ? updatedAddrs : []);
//         setShowAddAddrForm(false);
//         setNewAddr({ userName: user?.name || '', mobileNumber: user?.phone || '', address: '', landmark: '', pincode: '' });
//       }
//     } catch (e) {
//       alert('Failed to save address');
//     } finally {
//       setAddrLoading(false);
//     }
//   };

//   // ── EDIT PROFILE HANDLERS ──────────────────────────────
//   const handleAvatarFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       setEditForm((prev) => ({ ...prev, avatar: ev.target.result }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setEditError('');
//     setEditSuccess('');

//     if (!editForm.name.trim()) {
//       setEditError('Name cannot be empty.');
//       return;
//     }

//     setEditSaving(true);

//     const token = localStorage.getItem('df_token');
//     const userEmail = user?.email || '';

//     try {
//       const res = await fetch(`${API_URL}/api/user/profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({
//           name: editForm.name.trim(),
//           gender: editForm.gender,
//           avatar: editForm.avatar,
//           profilePicture: editForm.avatar,
//           email: userEmail // fallback identifier for in-memory mode
//         })
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         // Confirm the server-returned user and sync state + localStorage
//         const confirmedUser = {
//           ...user,
//           ...data.user,
//           avatar: data.user?.avatar || data.user?.profilePicture || editForm.avatar,
//           profilePicture: data.user?.profilePicture || data.user?.avatar || editForm.avatar
//         };
//         if (onUpdateUser) onUpdateUser(confirmedUser);

//         // Also dispatch socket-compatible DOM event for any other listeners
//         window.dispatchEvent(new CustomEvent('df_user_profile_updated', {
//           detail: confirmedUser
//         }));

//         setEditSuccess('✅ Profile updated successfully!');
//         setTimeout(() => {
//           setEditSuccess('');
//           setActiveTab('menu');
//         }, 1800);
//       } else {
//         setEditError(data.message || 'Failed to update profile. Please try again.');
//       }
//     } catch (err) {
//       setEditError('Network error. Please check your connection.');
//     } finally {
//       setEditSaving(false);
//     }
//   };
//   // ──────────────────────────────────────────────────────

//   if (!isOpen || !user) return null;

//   const getUserInitial = () => {
//     return user.name ? user.name.charAt(0).toUpperCase() : 'U';
//   };

//   // FLIPKART-STYLE STEP TRACKING RENDERER
//   const renderFlipkartOrderTracker = (status, createdAt) => {
//     const steps = [
//       { id: 'placed', label: 'Order Placed' },
//       { id: 'confirmed', label: 'Order Confirmed' },
//       { id: 'shipped', label: 'Shipped' },
//       { id: 'out', label: 'Out for Delivery' },
//       { id: 'delivered', label: 'Delivered' }
//     ];

//     let currentStepIndex = 0;
//     if (status === 'Accepted') currentStepIndex = 1;
//     else if (status === 'Shipped') currentStepIndex = 2;
//     else if (status === 'Out for Delivery') currentStepIndex = 3;
//     else if (status === 'Delivered') currentStepIndex = 4;
//     else if (status === 'Rejected') {
//       return (
//         <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.82rem', fontWeight: '700', margin: '0.5rem 0' }}>
//           ❌ Order Rejected by Store Management
//         </div>
//       );
//     } else if (status === 'Return Requested') {
//       return (
//         <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#c2410c', fontSize: '0.82rem', fontWeight: '700', margin: '0.5rem 0' }}>
//           🔄 Return Requested — Pickup scheduled within 3 Days
//         </div>
//       );
//     }

//     return (
//       <div style={{ margin: '0.85rem 0', background: '#f8fafc', padding: '0.85rem 0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
//           {/* Connector Line */}
//           <div style={{ position: 'absolute', top: '12px', left: '15px', right: '15px', height: '3px', background: '#e2e8f0', zIndex: 1 }} />
//           <div style={{ position: 'absolute', top: '12px', left: '15px', width: `${(currentStepIndex / 4) * 100}%`, height: '3px', background: '#16a34a', zIndex: 2, transition: 'width 0.4s ease' }} />

//           {steps.map((step, idx) => {
//             const isDone = idx <= currentStepIndex;
//             const isCurrent = idx === currentStepIndex;

//             return (
//               <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
//                 <div
//                   style={{
//                     width: '24px',
//                     height: '24px',
//                     borderRadius: '50%',
//                     background: isDone ? '#16a34a' : 'white',
//                     border: isDone ? '2px solid #16a34a' : '2px solid #cbd5e1',
//                     color: isDone ? 'white' : '#94a3b8',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontSize: '0.7rem',
//                     fontWeight: '900',
//                     boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none'
//                   }}
//                 >
//                   {isDone ? '✓' : idx + 1}
//                 </div>
//                 <span style={{ fontSize: '0.68rem', fontWeight: isCurrent ? '800' : '600', color: isDone ? '#0f172a' : '#94a3b8', marginTop: '0.35rem', textAlign: 'center', lineHeight: '1.1' }}>
//                   {step.label}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   // Check if order is within 7-day return window
//   const isWithin7Days = (dateStr) => {
//     if (!dateStr) return true;
//     const orderDate = new Date(dateStr).getTime();
//     const now = Date.now();
//     const diffDays = (now - orderDate) / (1000 * 3600 * 24);
//     return diffDays <= 7;
//   };

//   return (
//     <div className="modal-overlay" style={{ zIndex: 300 }}>
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '400px',
//           width: '100%',
//           height: '100vh',
//           borderRadius: '0',
//           position: 'fixed',
//           right: '0',
//           top: '0',
//           bottom: '0',
//           display: 'flex',
//           flexDirection: 'column',
//           background: '#f8fafc'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* COMPACT BLINKIT STYLE TOP HEADER */}
//         <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '0.85rem 1.25rem', color: 'white', position: 'relative' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
//             {activeTab !== 'menu' ? (
//               <button
//                 onClick={() => setActiveTab('menu')}
//                 style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
//               >
//                 <ArrowLeft size={13} /> Back
//               </button>
//             ) : (
//               <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
//                 My Account
//               </div>
//             )}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               {/* Edit Profile Icon — only shown on menu tab */}
//               {activeTab === 'menu' && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setEditForm({ name: user.name || '', gender: user.gender || '', avatar: user.avatar || '' });
//                     setEditSuccess('');
//                     setEditError('');
//                     setActiveTab('editProfile');
//                   }}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.3)',
//                     color: 'white',
//                     padding: '4px 10px',
//                     borderRadius: '14px',
//                     fontSize: '0.75rem',
//                     fontWeight: '800',
//                     cursor: 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '4px'
//                   }}
//                   title="Edit your profile details"
//                 >
//                   <Pencil size={13} /> Edit Profile
//                 </button>
//               )}
//               <button
//                 type="button"
//                 onClick={() => {
//                   onLogout();
//                   onClose();
//                 }}
//                 style={{
//                   background: 'rgba(239, 68, 68, 0.25)',
//                   border: '1px solid rgba(252, 165, 165, 0.5)',
//                   color: '#fca5a5',
//                   padding: '4px 10px',
//                   borderRadius: '14px',
//                   fontSize: '0.75rem',
//                   fontWeight: '800',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '4px'
//                 }}
//                 title="Log Out of your account"
//               >
//                 <LogOut size={14} /> Log Out
//               </button>
//               <button className="close-btn" onClick={onClose} style={{ color: 'white' }}>
//                 <X size={20} />
//               </button>
//             </div>
//           </div>

//           {/* Compact User Banner */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//             {/* Avatar — shows uploaded photo or initials */}
//             <div
//               style={{ width: '46px', height: '46px', borderRadius: '50%', background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '900', color: 'white', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', overflow: 'hidden', flexShrink: 0 }}
//             >
//               {user.avatar
//                 ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 : getUserInitial()
//               }
//             </div>
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
//                 <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h3>
//                 <Crown size={15} color="#facc15" fill="#facc15" style={{ flexShrink: 0 }} />
//               </div>
//               <p style={{ fontSize: '0.72rem', opacity: 0.9, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                 {user.email || user.phone || 'Dipto Fashion VIP Customer'}
//                 {user.gender ? <span style={{ marginLeft: '6px', opacity: 0.75 }}>• {user.gender}</span> : null}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* METRICS CARDS WITH HIGHLIGHTED BORDERS */}
//         <div style={{ padding: '0.85rem 1.25rem', background: 'white', borderBottom: '1.5px solid #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
//           <div
//             onClick={() => setActiveTab('orders')}
//             style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
//           >
//             <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#c026d3' }}>{userOrders.length}</div>
//             <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#701a75' }}>My Orders</div>
//           </div>

//           <div
//             onClick={() => setActiveTab('wishlist')}
//             style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
//           >
//             <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#e11d48' }}>{wishlist.length}</div>
//             <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#be123c' }}>Wishlist</div>
//           </div>

//           <div
//             onClick={() => setActiveTab('addresses')}
//             style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
//           >
//             <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#16a34a' }}>
//               {userAddresses.length}
//             </div>
//             <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#15803d' }}>Addresses</div>
//           </div>

//           <div
//             onClick={() => setIsAiChatOpen(true)}
//             style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
//           >
//             <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
//               <Bot size={18} color="#2563eb" /> AI
//             </div>
//             <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1d4ed8' }}>AI Help</div>
//           </div>
//         </div>

//         {/* BODY CONTAINER */}
//         <div className="profile-scroll-body" style={{ flex: 1, overflowY: 'auto', padding: '1.1rem', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>

//           {/* ── EDIT PROFILE TAB ─────────────────────────────── */}
//           {activeTab === 'editProfile' && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                 <Pencil size={18} color="#c026d3" /> Edit Profile
//               </h4>

//               {/* Status Messages */}
//               {editSuccess && (
//                 <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                   <CheckCircle2 size={16} /> {editSuccess}
//                 </div>
//               )}
//               {editError && (
//                 <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                   <AlertCircle size={16} /> {editError}
//                 </div>
//               )}

//               {/* Avatar Upload Section */}
//               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1.5px solid #f5d0fe', borderRadius: '14px', padding: '1.25rem' }}>
//                 <div
//                   style={{ width: '80px', height: '80px', borderRadius: '50%', background: editForm.avatar ? 'transparent' : 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white', border: '3px solid #f5d0fe', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
//                   onClick={() => avatarInputRef.current?.click()}
//                   title="Click to change profile photo"
//                 >
//                   {editForm.avatar
//                     ? <img src={editForm.avatar} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                     : (editForm.name?.charAt(0)?.toUpperCase() || 'U')
//                   }
//                   {/* Camera overlay */}
//                   <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', background: '#c026d3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
//                     <Camera size={12} color="white" />
//                   </div>
//                 </div>
//                 <input
//                   ref={avatarInputRef}
//                   type="file"
//                   accept="image/*"
//                   style={{ display: 'none' }}
//                   onChange={handleAvatarFileChange}
//                 />
//                 <div style={{ textAlign: 'center' }}>
//                   <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Profile Photo</div>
//                   <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Click avatar to upload (JPG, PNG, WebP)</div>
//                 </div>
//                 {editForm.avatar && (
//                   <button
//                     type="button"
//                     onClick={() => setEditForm((prev) => ({ ...prev, avatar: '' }))}
//                     style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
//                   >
//                     Remove Photo
//                   </button>
//                 )}
//               </div>

//               {/* Edit Form */}
//               <form onSubmit={handleEditSubmit} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

//                 {/* Full Name */}
//                 <div>
//                   <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
//                     Full Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={editForm.name}
//                     onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
//                     placeholder="Your full name"
//                     required
//                     style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #c026d3', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', boxSizing: 'border-box' }}
//                   />
//                 </div>

//                 {/* Gender */}
//                 <div>
//                   <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
//                     Gender
//                   </label>
//                   <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//                     {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
//                       <button
//                         key={g}
//                         type="button"
//                         onClick={() => setEditForm((prev) => ({ ...prev, gender: prev.gender === g ? '' : g }))}
//                         style={{
//                           padding: '6px 14px',
//                           borderRadius: '20px',
//                           fontSize: '0.82rem',
//                           fontWeight: '700',
//                           cursor: 'pointer',
//                           background: editForm.gender === g ? '#c026d3' : 'white',
//                           color: editForm.gender === g ? 'white' : '#475569',
//                           border: editForm.gender === g ? '1.5px solid #c026d3' : '1.5px solid #cbd5e1',
//                           transition: 'all 0.15s ease'
//                         }}
//                       >
//                         {g}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Divider */}
//                 <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem' }}>
//                   <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
//                     🔒 Account Credentials (Read-only)
//                   </div>

//                   {/* Email — DISABLED/READ-ONLY */}
//                   <div style={{ marginBottom: '0.65rem' }}>
//                     <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', marginBottom: '0.3rem' }}>
//                       Email Address (Cannot be changed)
//                     </label>
//                     <div style={{ position: 'relative' }}>
//                       <input
//                         type="email"
//                         value={user.email || ''}
//                         readOnly
//                         disabled
//                         style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', boxSizing: 'border-box' }}
//                       />
//                       <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
//                         <ShieldCheck size={15} color="#cbd5e1" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Phone — DISABLED/READ-ONLY */}
//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', marginBottom: '0.3rem' }}>
//                       Phone Number (Cannot be changed)
//                     </label>
//                     <div style={{ position: 'relative' }}>
//                       <input
//                         type="text"
//                         value={user.phone || 'Not provided'}
//                         readOnly
//                         disabled
//                         style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', boxSizing: 'border-box' }}
//                       />
//                       <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
//                         <ShieldCheck size={15} color="#cbd5e1" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   disabled={editSaving || !editForm.name.trim()}
//                   style={{
//                     width: '100%',
//                     background: editSaving ? '#d1d5db' : 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)',
//                     color: 'white',
//                     border: 'none',
//                     padding: '0.8rem',
//                     borderRadius: '10px',
//                     fontWeight: '800',
//                     fontSize: '0.95rem',
//                     cursor: editSaving ? 'not-allowed' : 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px',
//                     boxShadow: editSaving ? 'none' : '0 4px 12px rgba(192,38,211,0.3)',
//                     transition: 'all 0.2s ease'
//                   }}
//                 >
//                   <Save size={17} />
//                   {editSaving ? 'Saving Changes...' : 'Save Profile Changes'}
//                 </button>
//               </form>
//             </div>
//           )}

//           {activeTab === 'menu' && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
//               <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                 Account Settings
//               </div>

//               {/* Edit Profile Option — shown at top of menu */}
//               <div
//                 onClick={() => {
//                   setEditForm({ name: user.name || '', gender: user.gender || '', avatar: user.avatar || '' });
//                   setEditSuccess('');
//                   setEditError('');
//                   setActiveTab('editProfile');
//                 }}
//                 style={{ background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)', border: '1.5px solid #e9d5ff', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(192,38,211,0.08)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
//                     {user.avatar
//                       ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                       : <User size={20} />
//                     }
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#701a75' }}>Edit My Profile</div>
//                     <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>Update name, gender & profile photo</div>
//                   </div>
//                 </div>
//                 <Pencil size={16} color="#c026d3" />
//               </div>

//               {/* My Orders Option */}
//               <div
//                 onClick={() => setActiveTab('orders')}
//                 style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <Package size={20} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>My Orders & Order History</div>
//                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Flipkart-style live tracking, ratings & returns</div>
//                   </div>
//                 </div>
//                 <ChevronRight size={18} color="#94a3b8" />
//               </div>

//               {/* My Wishlist Option */}
//               <div
//                 onClick={() => setActiveTab('wishlist')}
//                 style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <Heart size={20} fill="#e11d48" />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>My Wishlist ({wishlist.length})</div>
//                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Saved favorite apparel & sarees</div>
//                   </div>
//                 </div>
//                 <ChevronRight size={18} color="#94a3b8" />
//               </div>

//               {/* Saved Addresses Option */}
//               <div
//                 onClick={() => setActiveTab('addresses')}
//                 style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <MapPin size={20} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>Saved Delivery Addresses</div>
//                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Manage & add new shipping addresses</div>
//                   </div>
//                 </div>
//                 <ChevronRight size={18} color="#94a3b8" />
//               </div>

//               {/* AI Chatbot Option */}
//               <div
//                 onClick={() => setIsAiChatOpen(true)}
//                 style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <Bot size={20} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e40af' }}>Dipto AI Shopping Assistant</div>
//                     <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Instant 24/7 AI help for orders & sizing</div>
//                   </div>
//                 </div>
//                 <Sparkles size={18} color="#2563eb" />
//               </div>

//               {/* Report an Issue & Support Option */}
//               <div
//                 onClick={() => setActiveTab('support')}
//                 style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <HelpCircle size={20} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#9a3412' }}>Report an Issue & Help</div>
//                     <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>Submit queries, track tickets & view admin replies</div>
//                   </div>
//                 </div>
//                 <ChevronRight size={18} color="#ea580c" />
//               </div>

//               {/* About Us Option */}
//               <div
//                 onClick={() => setIsAboutUsOpen(true)}
//                 style={{ background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)', border: '1.5px solid #f5d0fe', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(192,38,211,0.08)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #e9d5ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <Info size={20} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#701a75' }}>About Us</div>
//                     <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>Learn about Dipto Fashion heritage & story</div>
//                   </div>
//                 </div>
//                 <ChevronRight size={18} color="#c026d3" />
//               </div>

//               {/* Terms & Privacy Option */}
//               <div
//                 onClick={() => {
//                   setPolicyTab('privacy');
//                   setIsPolicyOpen(true);
//                 }}
//                 style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
//                   <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#faf5ff', border: '1px solid #e9d5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <ShieldCheck size={20} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>Privacy Policy & Terms</div>
//                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dipto Fashion security & legal policies</div>
//                   </div>
//                 </div>
//                 <ChevronRight size={18} color="#94a3b8" />
//               </div>

//               {/* Logout Option */}
//               <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     onLogout();
//                     onClose();
//                   }}
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '0.65rem',
//                     padding: '0.85rem 1rem',
//                     background: '#fef2f2',
//                     color: '#dc2626',
//                     border: '1.5px solid #fca5a5',
//                     borderRadius: '12px',
//                     fontSize: '0.95rem',
//                     fontWeight: '800',
//                     cursor: 'pointer',
//                     boxShadow: '0 2px 6px rgba(220, 38, 38, 0.1)'
//                   }}
//                 >
//                   <LogOut size={19} />
//                   <span>Log Out of Dipto Fashion</span>
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === 'orders' && (
//             <div>
//               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
//                 My Orders & History ({userOrders.length})
//               </h4>

//               {loadingOrders ? (
//                 <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
//                   Loading your order history...
//                 </div>
//               ) : userOrders.length === 0 ? (
//                 <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '2rem 1rem', textAlign: 'center' }}>
//                   <Package size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
//                   <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>No orders placed yet</p>
//                   <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
//                     Explore our Sarees & Punjabi suits collection to place your first order!
//                   </p>
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
//                   {userOrders.map((order) => {
//                     const estDeliveryDateStr = new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
//                     const isDelivered = order.status === 'Delivered';
//                     const isCancelled = order.status === 'Cancelled';
//                     const isCancellationRequested = order.status === 'Cancellation Requested';
//                     const isReturnRequested = order.status === 'Return Requested' || order.status === 'Return Approved';
//                     const isReturnCompleted = order.status === 'Refund Completed' || order.status === 'Returned Successfully';
//                     const canReturn = isDelivered && isWithin7Days(order.updatedAt || order.createdAt);
//                     const canCancel = ['Pending Verification', 'Accepted'].includes(order.status);

//                     const deliveredDateStr = new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
//                     const returnCompletedDateStr = new Date(order.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
//                     const cancelledDateStr = new Date(order.cancellationDetails?.cancelledAt || order.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

//                     return (
//                       <div key={order._id || order.orderId} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', pb: '0.5rem' }}>
//                           <div>
//                             <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>ORDER ID: </span>
//                             <strong style={{ fontSize: '0.95rem', color: '#c026d3' }}>{order.orderId}</strong>
//                           </div>
//                           {isCancelled ? (
//                             <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: '800', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
//                               Cancelled
//                             </span>
//                           ) : isCancellationRequested ? (
//                             <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', background: '#fffbeb', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>
//                               ⏳ Cancellation Pending
//                             </span>
//                           ) : isReturnCompleted ? (
//                             <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
//                               Return Successful
//                             </span>
//                           ) : isReturnRequested ? (
//                             <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: '800', background: '#fff7ed', padding: '2px 8px', borderRadius: '10px' }}>
//                               Return In Progress
//                             </span>
//                           ) : isDelivered ? (
//                             <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
//                               Delivered
//                             </span>
//                           ) : (
//                             <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700' }}>
//                               Est. Delivery: {estDeliveryDateStr}
//                             </span>
//                           )}
//                         </div>

//                         {/* CONDITIONAL TRACKER OR FINAL STATUS DISPLAY */}
//                         {isCancelled ? (
//                           /* CANCELLED STATUS */
//                           <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#b91c1c', fontSize: '0.88rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <Ban size={20} color="#dc2626" />
//                             <div>
//                               <div>Cancelled</div>
//                               <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626' }}>
//                                 Cancelled on {cancelledDateStr} • Money refund within 24-48hrs
//                               </div>
//                             </div>
//                           </div>
//                         ) : isCancellationRequested ? (
//                           /* CANCELLATION REQUESTED — PENDING ADMIN APPROVAL */
//                           <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#92400e', fontSize: '0.85rem', fontWeight: '700', margin: '0.65rem 0' }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
//                               <Ban size={18} color="#d97706" />
//                               <span style={{ fontWeight: '800', color: '#92400e' }}>Cancellation Request Submitted</span>
//                             </div>
//                             <div style={{ fontSize: '0.75rem', color: '#b45309', paddingLeft: '26px' }}>
//                               ⏳ Awaiting admin review — your refund will be initiated once approved.
//                               {order.cancellationDetails?.refundToSource && (
//                                 <div style={{ marginTop: '2px' }}>Refund Method: Auto-refund to original payment source</div>
//                               )}
//                               {order.cancellationDetails?.upiId && (
//                                 <div style={{ marginTop: '2px' }}>Refund UPI: <strong>{order.cancellationDetails.upiId}</strong></div>
//                               )}
//                               {order.cancellationDetails?.accountNumber && (
//                                 <div style={{ marginTop: '2px' }}>Refund Account: <strong>••••{order.cancellationDetails.accountNumber.slice(-4)}</strong> (IFSC: {order.cancellationDetails.ifscCode})</div>
//                               )}
//                             </div>
//                           </div>
//                         ) : isReturnCompleted ? (
//                           /* RETURN COMPLETED STATUS */
//                           <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#15803d', fontSize: '0.88rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <CheckCircle2 size={20} color="#16a34a" />
//                             <div>
//                               <div>Returned Successfully</div>
//                               <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#16a34a' }}>Completed on {returnCompletedDateStr} • Money refund within 24-48hrs</div>
//                             </div>
//                           </div>
//                         ) : isReturnRequested ? (
//                           /* RETURN REQUESTED / IN PROGRESS */
//                           <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#c2410c', fontSize: '0.85rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <RotateCcw size={20} color="#ea580c" />
//                             <div>
//                               <div>Return Requested — Pickup Scheduled</div>
//                               <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ea580c' }}>Pickup by {order.returnDetails?.pickupDate || 'within 3 Days'}</div>
//                             </div>
//                           </div>
//                         ) : isDelivered ? (
//                           /* DELIVERED STATUS */
//                           <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#15803d', fontSize: '0.88rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <CheckCircle2 size={20} color="#16a34a" />
//                             <div>
//                               <div>Delivered</div>
//                               <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#16a34a' }}>Delivered on {deliveredDateStr}</div>
//                             </div>
//                           </div>
//                         ) : (
//                           /* IN PROGRESS ACTIVE ORDERS (Flipkart Step-by-Step Tracker) */
//                           renderFlipkartOrderTracker(order.status, order.createdAt)
//                         )}

//                         {/* Items */}
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.85rem' }}>
//                           {order.items?.map((item, idx) => (
//                             <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem' }}>
//                               <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
//                               <div style={{ flex: 1 }}>
//                                 <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{item.name}</div>
//                                 <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</div>
//                               </div>

//                               {/* RATING BUTTON AFTER PRODUCT IS DELIVERED */}
//                               {isDelivered && !isReturnCompleted && (
//                                 <button
//                                   type="button"
//                                   onClick={() => setRatingProduct(item)}
//                                   style={{ background: '#fef3c7', border: '1px solid #fde047', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
//                                 >
//                                   <Star size={13} fill="#b45309" /> Rate & Review
//                                 </button>
//                               )}
//                             </div>
//                           ))}
//                         </div>

//                         {/* Bottom Row with Details & Actions */}
//                         <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                           <div>
//                             <div>UTR Ref: <strong>{order.utrNumber}</strong></div>
//                             <div>Address: <strong>{order.shippingAddress?.userName}, {order.shippingAddress?.pincode}</strong></div>
//                           </div>
//                           <div style={{ textAlign: 'right' }}>
//                             <div style={{ fontSize: '1.05rem', fontWeight: '900', color: isCancelled ? '#dc2626' : '#16a34a' }}>
//                               ₹{order.totalAmount?.toLocaleString('en-IN')}
//                             </div>
//                           </div>
//                         </div>

//                         {/* PRE-SHIPMENT CANCEL BUTTON — hide if already Cancellation Requested or Cancelled */}
//                         {canCancel && !isCancelled && !isCancellationRequested && !isDelivered && (
//                           <div style={{ marginTop: '0.75rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
//                               Pre-Shipment Order Cancellation
//                             </span>
//                             <button
//                               type="button"
//                               onClick={() => setCancelOrder(order)}
//                               style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#dc2626', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
//                             >
//                               <Ban size={14} /> Cancel Order
//                             </button>
//                           </div>
//                         )}

//                         {/* RETURN BUTTON FOR DELIVERED ITEMS (Active up to 7 Days Post Delivery) */}
//                         {isDelivered && canReturn && !isReturnRequested && !isReturnCompleted && !isCancelled && (
//                           <div style={{ marginTop: '0.75rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '700' }}>
//                               7-Day Return Window Active
//                             </span>
//                             <button
//                               type="button"
//                               onClick={() => setReturnOrder(order)}
//                               style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
//                             >
//                               <RotateCcw size={14} /> Request Return
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'wishlist' && (
//             <div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//                 <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
//                   <Heart size={20} color="#ef4444" fill="#ef4444" /> My Wishlist ({wishlist.length})
//                 </h4>
//               </div>

//               {wishlist.length === 0 ? (
//                 <div style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
//                   <Heart size={44} color="#fca5a5" style={{ margin: '0 auto 0.75rem' }} />
//                   <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#334155' }}>Your Wishlist is Empty</h4>
//                   <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
//                     Tap the heart icon on any product to save it to your wishlist!
//                   </p>
//                 </div>
//               ) : (
//                 <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
//                   {wishlist.map((item) => {
//                     if (!item) return null;
//                     // If item is a string ID, try finding product in prop/cache or construct minimal fallback
//                     const prod = typeof item === 'object' ? item : { _id: item, name: 'Saved Item', price: 0 };
//                     return (
//                       <ProductCard
//                         key={prod._id || prod.id}
//                         product={prod}
//                         onAddToCart={onAddToCart}
//                         onClickProductTitle={(p) => {
//                           onClose();
//                           onSelectProduct(p);
//                         }}
//                         onClickProductImage={(p) => {
//                           onClose();
//                           onSelectProduct(p);
//                         }}
//                         isWishlisted={true}
//                         onToggleWishlist={onToggleWishlist}
//                         cartItems={cartItems}
//                         onOpenCart={() => {
//                           onClose();
//                           if (onOpenCart) onOpenCart();
//                         }}
//                       />
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'addresses' && (
//             <div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//                 <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
//                   Saved Delivery Addresses ({userAddresses.length})
//                 </h4>
//                 <button
//                   type="button"
//                   onClick={() => setShowAddAddrForm(!showAddAddrForm)}
//                   style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
//                 >
//                   <Plus size={15} /> {showAddAddrForm ? 'Cancel' : 'Add New Address'}
//                 </button>
//               </div>

//               {/* Add New Address Form */}
//               {showAddAddrForm && (
//                 <form onSubmit={handleAddAddress} style={{ background: 'white', border: '1.5px solid #c026d3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
//                   <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Enter New Shipping Address</h5>
                  
//                   <div className="form-group" style={{ marginBottom: '0.65rem' }}>
//                     <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Receiver Name *</label>
//                     <input
//                       type="text"
//                       placeholder="Full Name"
//                       value={newAddr.userName}
//                       onChange={(e) => setNewAddr({ ...newAddr, userName: e.target.value })}
//                       required
//                       style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
//                     />
//                   </div>

//                   <div className="form-group" style={{ marginBottom: '0.65rem' }}>
//                     <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Mobile Number *</label>
//                     <input
//                       type="text"
//                       placeholder="10-digit mobile number"
//                       value={newAddr.mobileNumber}
//                       onChange={(e) => setNewAddr({ ...newAddr, mobileNumber: e.target.value })}
//                       required
//                       style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
//                     />
//                   </div>

//                   <div className="form-group" style={{ marginBottom: '0.65rem' }}>
//                     <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Full Address *</label>
//                     <textarea
//                       rows="2"
//                       placeholder="Flat, House No., Building, Street, Area"
//                       value={newAddr.address}
//                       onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
//                       required
//                       style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
//                     />
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
//                     <div className="form-group" style={{ marginBottom: 0 }}>
//                       <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Landmark (Optional)</label>
//                       <input
//                         type="text"
//                         placeholder="Near temple/park"
//                         value={newAddr.landmark}
//                         onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
//                         style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
//                       />
//                     </div>
//                     <div className="form-group" style={{ marginBottom: 0 }}>
//                       <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Pincode *</label>
//                       <input
//                         type="text"
//                         placeholder="6-digit Pincode"
//                         value={newAddr.pincode}
//                         onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
//                         required
//                         style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
//                       />
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn-primary"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
//                     disabled={addrLoading}
//                   >
//                     {addrLoading ? 'Saving Address...' : 'Save Address'}
//                   </button>
//                 </form>
//               )}

//               {userAddresses.length > 0 ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                   {userAddresses.map((addr, idx) => (
//                     <div key={addr._id || idx} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
//                         <div>
//                           <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>{addr.userName}</span>
//                           <span style={{ marginLeft: '8px', fontSize: '0.78rem', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>{addr.mobileNumber}</span>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => handleDeleteAddress(addr._id || idx)}
//                           style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
//                           title="Delete Address"
//                         >
//                           <Trash2 size={13} /> Delete
//                         </button>
//                       </div>
//                       <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: '1.4' }}>
//                         {addr.address}{addr.landmark ? `, Landmark: ${addr.landmark}` : ''}, Pincode: <strong>{addr.pincode}</strong>
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '2rem 1rem', textAlign: 'center' }}>
//                   <MapPin size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
//                   <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>No saved addresses found</p>
//                   <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
//                     Click "+ Add New Address" above to save your delivery location!
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'support' && (
//             <div>
//               {reportToast && <ToastNotification toast={reportToast} onClose={() => setReportToast(null)} />}

//               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                 <HelpCircle size={20} color="#ea580c" /> Report an Issue & Customer Support
//               </h4>

//               {/* SUBMIT NEW REPORT FORM */}
//               <form onSubmit={handleSubmitReport} style={{ background: 'white', border: '1.5px solid #ea580c', borderRadius: '14px', padding: '1.15rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)' }}>
//                 <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#9a3412', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <Send size={16} color="#ea580c" /> Submit a New Support Ticket / Issue
//                 </h5>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
//                       Category *
//                     </label>
//                     <select
//                       value={reportCategory}
//                       onChange={(e) => setReportCategory(e.target.value)}
//                       style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', background: 'white' }}
//                     >
//                       <option value="Order Issue">Order Issue</option>
//                       <option value="Payment Issue">Payment Issue</option>
//                       <option value="Product Quality">Product Quality</option>
//                       <option value="App Bug">App Bug</option>
//                       <option value="Other">Other Query</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
//                       Subject *
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Brief title of the issue"
//                       value={reportSubject}
//                       onChange={(e) => setReportSubject(e.target.value)}
//                       required
//                       style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
//                     />
//                   </div>
//                 </div>

//                 <div style={{ marginBottom: '0.85rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
//                     Detailed Message / Description *
//                   </label>
//                   <textarea
//                     rows="3"
//                     placeholder="Describe your issue or question in detail..."
//                     value={reportMessage}
//                     onChange={(e) => setReportMessage(e.target.value)}
//                     required
//                     style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4' }}
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={submittingReport || !reportSubject.trim() || !reportMessage.trim()}
//                   style={{
//                     width: '100%',
//                     background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
//                     color: 'white',
//                     border: 'none',
//                     padding: '0.75rem',
//                     borderRadius: '10px',
//                     fontWeight: '800',
//                     fontSize: '0.9rem',
//                     cursor: submittingReport ? 'not-allowed' : 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '8px',
//                     boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
//                   }}
//                 >
//                   <Send size={16} />
//                   <span>{submittingReport ? 'Submitting Report...' : 'Submit Support Ticket'}</span>
//                 </button>
//               </form>

//               {/* MY REPORTED TICKETS & ADMIN REPLIES LIST */}
//               <div>
//                 <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
//                   My Reported Tickets & Admin Replies ({userReports.length})
//                 </h5>

//                 {loadingReports ? (
//                   <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
//                     Loading your support tickets...
//                   </div>
//                 ) : userReports.length === 0 ? (
//                   <div style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center' }}>
//                     <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
//                     <p style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155', margin: 0 }}>No reported tickets yet</p>
//                     <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
//                       If you face any order or payment issues, submit a ticket above for fast admin support!
//                     </p>
//                   </div>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
//                     {userReports.map((report) => {
//                       const isResolved = report.status === 'Resolved';
//                       const isInProgress = report.status === 'In Progress';

//                       return (
//                         <div key={report._id} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
//                           {/* Ticket Header */}
//                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
//                             <div>
//                               <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ea580c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '6px' }}>
//                                 {report.category}
//                               </span>
//                               <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0.35rem 0 0 0' }}>
//                                 {report.subject}
//                               </h5>
//                             </div>
//                             {isResolved ? (
//                               <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '10px' }}>
//                                 ✓ Resolved
//                               </span>
//                             ) : isInProgress ? (
//                               <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e40af', background: '#dbeafe', border: '1px solid #93c5fd', padding: '2px 8px', borderRadius: '10px' }}>
//                                 ⏳ In Progress
//                               </span>
//                             ) : (
//                               <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '10px' }}>
//                                 • Pending
//                               </span>
//                             )}
//                           </div>

//                           {/* Ticket Details */}
//                           <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
//                             Submitted on {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                           </div>

//                           <div style={{ fontSize: '0.85rem', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
//                             "{report.message}"
//                           </div>

//                           {/* ADMIN REPLY CALLOUT BOX */}
//                           {report.adminReply && (
//                             <div style={{ marginTop: '0.75rem', background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '0.85rem', color: '#1e40af' }}>
//                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '800', color: '#1d4ed8', marginBottom: '0.35rem' }}>
//                                 <MessageSquare size={16} color="#2563eb" />
//                                 <span>Official Admin Reply {report.repliedAt ? `• ${new Date(report.repliedAt).toLocaleDateString()}` : ''}</span>
//                               </div>
//                               <p style={{ fontSize: '0.85rem', color: '#1e3a8a', margin: 0, lineHeight: '1.45', whiteSpace: 'pre-wrap', fontWeight: '600' }}>
//                                 {report.adminReply}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Terms & Privacy Modal */}
//       <TermsPrivacyModal
//         isOpen={isPolicyOpen}
//         onClose={() => setIsPolicyOpen(false)}
//         initialTab={policyTab}
//       />

//       {/* AI Chatbot Assistant Modal */}
//       <AiChatbotModal
//         isOpen={isAiChatOpen}
//         onClose={() => setIsAiChatOpen(false)}
//         userName={user.name}
//         userOrders={userOrders}
//       />

//       {/* Product Rating & Review Modal */}
//       <ProductRatingModal
//         isOpen={!!ratingProduct}
//         onClose={() => setRatingProduct(null)}
//         product={ratingProduct}
//         userName={user.name}
//         onRatingSuccess={() => fetchUserOrders()}
//       />

//       {/* 7-Day Product Return Request Modal */}
//       <ProductReturnModal
//         isOpen={!!returnOrder}
//         onClose={() => setReturnOrder(null)}
//         order={returnOrder}
//         onReturnSuccess={() => fetchUserOrders()}
//       />

//       {/* Pre-Shipment Order Cancellation Modal */}
//       <OrderCancelModal
//         isOpen={!!cancelOrder}
//         onClose={() => setCancelOrder(null)}
//         order={cancelOrder}
//         onCancelSuccess={(updatedOrder) => {
//           // Immediately merge the returned order into local state (optimistic UI)
//           if (updatedOrder) {
//             setUserOrders((prev) =>
//               prev.map((o) =>
//                 (o._id === updatedOrder._id || o.orderId === updatedOrder.orderId)
//                   ? { ...o, ...updatedOrder }
//                   : o
//               )
//             );
//           } else {
//             fetchUserOrders();
//           }
//           setCancelOrder(null);
//         }}
//       />
//       {/* About Us Modal */}
//       <AboutUsModal
//         isOpen={isAboutUsOpen}
//         onClose={() => setIsAboutUsOpen(false)}
//       />
//     </div>
//   );
// };

// export default UserProfileModal;









import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  ShoppingBag,
  MapPin,
  HelpCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  Bot,
  Star,
  RotateCcw,
  Trash2,
  Send,
  MessageSquare,
  AlertCircle,
  Crown,
  Sparkles,
  Ban,
  Heart,
  Plus,
  Pencil,
  Camera,
  Save,
  ArrowLeft,
  Info
} from 'lucide-react';
import TermsPrivacyModal from './TermsPrivacyModal';
import AiChatbotModal from './AiChatbotModal';
import AboutUsModal from './AboutUsModal';
import ProductRatingModal from './ProductRatingModal';
import ProductReturnModal from './ProductReturnModal';
import OrderCancelModal from './OrderCancelModal';
import ProductCard from './ProductCard';
import ToastNotification from './ToastNotification';
import { API_URL } from '../api';
import { getCache, setCache } from '../utils/cache';

const UserProfileModal = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser,
  wishlist = [],
  onToggleWishlist,
  onSelectProduct,
  onAddToCart,
  cartItems = [],
  onOpenCart
}) => {
  const [activeTab, setActiveTab] = useState('menu');
  
  // Instant Hydration from localStorage for 0ms order view
  const [userOrders, setUserOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(`df_orders_${user?._id || user?.email || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [userAddresses, setUserAddresses] = useState(user?.addresses || []);
  const [loadingOrders, setLoadingOrders] = useState(() => userOrders.length === 0);

  // Modals inside Profile
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('privacy');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  
  // Rating, Return & Cancel Modals
  const [ratingProduct, setRatingProduct] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);

  // New Address Form State
  const [showAddAddrForm, setShowAddAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    userName: user?.name || '',
    mobileNumber: user?.phone || '',
    address: '',
    landmark: '',
    pincode: ''
  });
  const [addrLoading, setAddrLoading] = useState(false);

  // User Reports & Support State
  const [userReports, setUserReports] = useState([]);
  const [reportSubject, setReportSubject] = useState('');
  const [reportCategory, setReportCategory] = useState('Order Issue');
  const [reportMessage, setReportMessage] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportToast, setReportToast] = useState(null);

  // Edit Profile State
  const [editForm, setEditForm] = useState({
    name: '',
    gender: '',
    avatar: ''
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      // Prioritize orders fetch immediately
      fetchUserOrders();
      fetchUserAddresses();
      
      setActiveTab('menu');
      setEditForm({
        name: user.name || '',
        gender: user.gender || '',
        avatar: user.avatar || ''
      });
      setEditSuccess('');
      setEditError('');
    }
  }, [isOpen, user]);

  // Real-time order status sync via Socket.io
  useEffect(() => {
    const handleOrderStatusUpdate = (e) => {
      const updatedOrder = e.detail;
      if (!updatedOrder) return;
      setUserOrders((prev) => {
        const updated = prev.map((o) =>
          (o._id === updatedOrder._id || o.orderId === updatedOrder.orderId)
            ? { ...o, ...updatedOrder }
            : o
        );
        try {
          localStorage.setItem(`df_orders_${user?._id || user?.email || 'guest'}`, JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    };
    window.addEventListener('df_order_status_updated', handleOrderStatusUpdate);
    return () => window.removeEventListener('df_order_status_updated', handleOrderStatusUpdate);
  }, [user]);

  // Fast background fetch for orders with zero-delay cache update
  const fetchUserOrders = async () => {
    let userEmail = user?.email || '';
    const userId = user?._id || user?.id || '';
    const storageKey = `df_orders_${userId || userEmail || 'guest'}`;

    try {
      const token = localStorage.getItem('df_token');
      let url = `${API_URL}/api/user/my-orders`;
      if (userEmail) {
        url += `?email=${encodeURIComponent(userEmail)}`;
      }

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const ordersArray = Array.isArray(data) ? data : (data.orders || []);
        setUserOrders(ordersArray);
        try {
          localStorage.setItem(storageKey, JSON.stringify(ordersArray));
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error loading orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const token = localStorage.getItem('df_token');
      let userEmail = user?.email || '';
      let url = `${API_URL}/api/user/addresses`;
      if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUserAddresses(data);
      }
    } catch (e) {
      console.error('Error fetching addresses:', e);
    }
  };

  const fetchUserReports = async () => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('df_token');
      let userEmail = user?.email || '';
      let url = `${API_URL}/api/reports/my-reports`;
      if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setUserReports(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error loading reports:', e);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportSubject.trim() || !reportMessage.trim()) {
      setReportToast({ type: 'error', message: 'Subject and detailed message are required' });
      return;
    }

    setSubmittingReport(true);
    try {
      const token = localStorage.getItem('df_token');
      let userEmail = user?.email || '';
      let userName = user?.name || 'Customer';

      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: reportSubject.trim(),
          category: reportCategory,
          message: reportMessage.trim(),
          userEmail,
          userName
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReportToast({ type: 'success', message: 'Support ticket submitted!' });
        setReportSubject('');
        setReportMessage('');
        if (data.report) {
          setUserReports((prev) => [data.report, ...prev]);
        }
      } else {
        setReportToast({ type: 'error', message: data.message || 'Failed to submit' });
      }
    } catch (e) {
      setReportToast({ type: 'error', message: 'Network error submitting report' });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      const token = localStorage.getItem('df_token');
      let userEmail = user?.email || '';
      let url = `${API_URL}/api/user/addresses/${addrId}`;
      if (userEmail) url += `?email=${encodeURIComponent(userEmail)}`;

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { method: 'DELETE', headers });
      if (res.ok) {
        const data = await res.json();
        if (data.addresses) setUserAddresses(data.addresses);
        else fetchUserAddresses();
      }
    } catch (e) {
      console.error('Error deleting address:', e);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.userName || !newAddr.mobileNumber || !newAddr.address || !newAddr.pincode) {
      alert('Please fill in all required fields');
      return;
    }
    setAddrLoading(true);
    try {
      const token = localStorage.getItem('df_token');
      let userEmail = user?.email || '';

      const res = await fetch(`${API_URL}/api/user/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...newAddr, email: userEmail })
      });
      if (res.ok) {
        const updatedAddrs = await res.json();
        setUserAddresses(Array.isArray(updatedAddrs) ? updatedAddrs : []);
        setShowAddAddrForm(false);
        setNewAddr({ userName: user?.name || '', mobileNumber: user?.phone || '', address: '', landmark: '', pincode: '' });
      }
    } catch (e) {
      alert('Failed to save address');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditForm((prev) => ({ ...prev, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (!editForm.name.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }

    setEditSaving(true);
    const token = localStorage.getItem('df_token');
    const userEmail = user?.email || '';

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          gender: editForm.gender,
          avatar: editForm.avatar,
          profilePicture: editForm.avatar,
          email: userEmail
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const confirmedUser = {
          ...user,
          ...data.user,
          avatar: data.user?.avatar || editForm.avatar,
          profilePicture: data.user?.profilePicture || editForm.avatar
        };
        if (onUpdateUser) onUpdateUser(confirmedUser);

        window.dispatchEvent(new CustomEvent('df_user_profile_updated', {
          detail: confirmedUser
        }));

        setEditSuccess('✅ Profile updated successfully!');
        setTimeout(() => {
          setEditSuccess('');
          setActiveTab('menu');
        }, 1200);
      } else {
        setEditError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setEditError('Network error. Please check your connection.');
    } finally {
      setEditSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  const getUserInitial = () => {
    return user.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  const renderFlipkartOrderTracker = (status) => {
    const steps = [
      { id: 'placed', label: 'Order Placed' },
      { id: 'confirmed', label: 'Order Confirmed' },
      { id: 'shipped', label: 'Shipped' },
      { id: 'out', label: 'Out for Delivery' },
      { id: 'delivered', label: 'Delivered' }
    ];

    let currentStepIndex = 0;
    if (status === 'Accepted') currentStepIndex = 1;
    else if (status === 'Shipped') currentStepIndex = 2;
    else if (status === 'Out for Delivery') currentStepIndex = 3;
    else if (status === 'Delivered') currentStepIndex = 4;
    else if (status === 'Rejected') {
      return (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.82rem', fontWeight: '700', margin: '0.5rem 0' }}>
          ❌ Order Rejected by Store Management
        </div>
      );
    } else if (status === 'Return Requested') {
      return (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#c2410c', fontSize: '0.82rem', fontWeight: '700', margin: '0.5rem 0' }}>
          🔄 Return Requested — Pickup scheduled within 3 Days
        </div>
      );
    }

    return (
      <div style={{ margin: '0.85rem 0', background: '#f8fafc', padding: '0.85rem 0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', left: '15px', right: '15px', height: '3px', background: '#e2e8f0', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: '12px', left: '15px', width: `${(currentStepIndex / 4) * 100}%`, height: '3px', background: '#16a34a', zIndex: 2, transition: 'width 0.4s ease' }} />

          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isDone ? '#16a34a' : 'white',
                    border: isDone ? '2px solid #16a34a' : '2px solid #cbd5e1',
                    color: isDone ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none'
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: isCurrent ? '800' : '600', color: isDone ? '#0f172a' : '#94a3b8', marginTop: '0.35rem', textAlign: 'center', lineHeight: '1.1' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isWithin7Days = (dateStr) => {
    if (!dateStr) return true;
    const orderDate = new Date(dateStr).getTime();
    const now = Date.now();
    return (now - orderDate) / (1000 * 3600 * 24) <= 7;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '400px',
          width: '100%',
          height: '100vh',
          borderRadius: '0',
          position: 'fixed',
          right: '0',
          top: '0',
          bottom: '0',
          display: 'flex',
          flexDirection: 'column',
          background: '#f8fafc'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* COMPACT BLINKIT STYLE TOP HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '0.85rem 1.25rem', color: 'white', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            {activeTab !== 'menu' ? (
              <button
                onClick={() => setActiveTab('menu')}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={13} /> Back
              </button>
            ) : (
              <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                My Account
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeTab === 'menu' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({ name: user.name || '', gender: user.gender || '', avatar: user.avatar || '' });
                    setEditSuccess('');
                    setEditError('');
                    setActiveTab('editProfile');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Pencil size={13} /> Edit Profile
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(252, 165, 165, 0.5)',
                  color: '#fca5a5',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogOut size={14} /> Log Out
              </button>
              <button className="close-btn" onClick={onClose} style={{ color: 'white' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{ width: '46px', height: '46px', borderRadius: '50%', background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '900', color: 'white', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', overflow: 'hidden', flexShrink: 0 }}
            >
              {user.avatar
                ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getUserInitial()
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h3>
                <Crown size={15} color="#facc15" fill="#facc15" style={{ flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: '0.72rem', opacity: 0.9, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email || user.phone || 'VIP Customer'}
                {user.gender ? <span style={{ marginLeft: '6px', opacity: 0.75 }}>• {user.gender}</span> : null}
              </p>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ padding: '0.85rem 1.25rem', background: 'white', borderBottom: '1.5px solid #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
          <div
            onClick={() => setActiveTab('orders')}
            style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#c026d3' }}>{userOrders.length}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#701a75' }}>My Orders</div>
          </div>

          <div
            onClick={() => setActiveTab('wishlist')}
            style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#e11d48' }}>{wishlist.length}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#be123c' }}>Wishlist</div>
          </div>

          <div
            onClick={() => setActiveTab('addresses')}
            style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#16a34a' }}>
              {userAddresses.length}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#15803d' }}>Addresses</div>
          </div>

          <div
            onClick={() => setIsAiChatOpen(true)}
            style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '12px', padding: '0.6rem 0.3rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <Bot size={18} color="#2563eb" /> AI
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1d4ed8' }}>AI Help</div>
          </div>
        </div>

        {/* BODY CONTAINER */}
        <div className="profile-scroll-body" style={{ flex: 1, overflowY: 'auto', padding: '1.1rem', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>

          {/* EDIT PROFILE TAB */}
          {activeTab === 'editProfile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} color="#c026d3" /> Edit Profile
              </h4>

              {editSuccess && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} /> {editSuccess}
                </div>
              )}
              {editError && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {editError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1.5px solid #f5d0fe', borderRadius: '14px', padding: '1.25rem' }}>
                <div
                  style={{ width: '80px', height: '80px', borderRadius: '50%', background: editForm.avatar ? 'transparent' : 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white', border: '3px solid #f5d0fe', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {editForm.avatar
                    ? <img src={editForm.avatar} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (editForm.name?.charAt(0)?.toUpperCase() || 'U')
                  }
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', background: '#c026d3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    <Camera size={12} color="white" />
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Profile Photo</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Click avatar to upload (JPG, PNG, WebP)</div>
                </div>
                {editForm.avatar && (
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({ ...prev, avatar: '' }))}
                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <form onSubmit={handleEditSubmit} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #c026d3', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
                    Gender
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, gender: prev.gender === g ? '' : g }))}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          background: editForm.gender === g ? '#c026d3' : 'white',
                          color: editForm.gender === g ? 'white' : '#475569',
                          border: editForm.gender === g ? '1.5px solid #c026d3' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={editSaving || !editForm.name.trim()}
                  style={{
                    width: '100%',
                    background: editSaving ? '#d1d5db' : 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: editSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={17} />
                  {editSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* MAIN MENU TAB */}
          {activeTab === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Account Settings
              </div>

              {/* Edit Profile */}
              <div
                onClick={() => {
                  setEditForm({ name: user.name || '', gender: user.gender || '', avatar: user.avatar || '' });
                  setEditSuccess('');
                  setEditError('');
                  setActiveTab('editProfile');
                }}
                style={{ background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)', border: '1.5px solid #e9d5ff', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#701a75' }}>Edit My Profile</div>
                    <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>Update name, gender & profile photo</div>
                  </div>
                </div>
                <Pencil size={16} color="#c026d3" />
              </div>

              {/* My Orders Option */}
              <div
                onClick={() => setActiveTab('orders')}
                style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>My Orders & Order History</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Flipkart-style live tracking, ratings & returns</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              {/* My Wishlist */}
              <div
                onClick={() => setActiveTab('wishlist')}
                style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} fill="#e11d48" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>My Wishlist ({wishlist.length})</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Saved favorite apparel & sarees</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              {/* Saved Addresses */}
              <div
                onClick={() => setActiveTab('addresses')}
                style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>Saved Delivery Addresses</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Manage & add new shipping addresses</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              {/* AI Chatbot Option */}
              <div
                onClick={() => setIsAiChatOpen(true)}
                style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e40af' }}>Dipto AI Shopping Assistant</div>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Instant 24/7 AI help for orders & sizing</div>
                  </div>
                </div>
                <Sparkles size={18} color="#2563eb" />
              </div>

              {/* Report Issue & Help */}
              <div
                onClick={() => {
                  fetchUserReports();
                  setActiveTab('support');
                }}
                style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#9a3412' }}>Report an Issue & Help</div>
                    <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>Submit queries, track tickets & view admin replies</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#ea580c" />
              </div>

              {/* About Us */}
              <div
                onClick={() => setIsAboutUsOpen(true)}
                style={{ background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)', border: '1.5px solid #f5d0fe', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #e9d5ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Info size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#701a75' }}>About Us</div>
                    <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>Learn about Dipto Fashion heritage & story</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#c026d3" />
              </div>

              {/* Terms & Privacy */}
              <div
                onClick={() => {
                  setPolicyTab('privacy');
                  setIsPolicyOpen(true);
                }}
                style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#faf5ff', border: '1px solid #e9d5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>Privacy Policy & Terms</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dipto Fashion security & legal policies</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                My Orders & History ({userOrders.length})
              </h4>

              {loadingOrders && userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading your order history...
                </div>
              ) : userOrders.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '2rem 1rem', textAlign: 'center' }}>
                  <Package size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>No orders placed yet</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Explore our Sarees & Punjabi suits collection to place your first order!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {userOrders.map((order) => {
                    const estDeliveryDateStr = new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    const isDelivered = order.status === 'Delivered';
                    const isCancelled = order.status === 'Cancelled';
                    const isCancellationRequested = order.status === 'Cancellation Requested';
                    const isReturnRequested = order.status === 'Return Requested' || order.status === 'Return Approved';
                    const isReturnCompleted = order.status === 'Refund Completed' || order.status === 'Returned Successfully';
                    const canReturn = isDelivered && isWithin7Days(order.updatedAt || order.createdAt);
                    const canCancel = ['Pending Verification', 'Accepted'].includes(order.status);

                    const deliveredDateStr = new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    const returnCompletedDateStr = new Date(order.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    const cancelledDateStr = new Date(order.cancellationDetails?.cancelledAt || order.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

                    return (
                      <div key={order._id || order.orderId} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>ORDER ID: </span>
                            <strong style={{ fontSize: '0.95rem', color: '#c026d3' }}>{order.orderId}</strong>
                          </div>
                          {isCancelled ? (
                            <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: '800', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
                              Cancelled
                            </span>
                          ) : isCancellationRequested ? (
                            <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', background: '#fffbeb', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                              ⏳ Cancellation Pending
                            </span>
                          ) : isReturnCompleted ? (
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                              Return Successful
                            </span>
                          ) : isReturnRequested ? (
                            <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: '800', background: '#fff7ed', padding: '2px 8px', borderRadius: '10px' }}>
                              Return In Progress
                            </span>
                          ) : isDelivered ? (
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                              Delivered
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700' }}>
                              Est. Delivery: {estDeliveryDateStr}
                            </span>
                          )}
                        </div>

                        {/* Tracker or Status Card */}
                        {isCancelled ? (
                          <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#b91c1c', fontSize: '0.88rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Ban size={20} color="#dc2626" />
                            <div>
                              <div>Cancelled</div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626' }}>
                                Cancelled on {cancelledDateStr} • Money refund within 24-48hrs
                              </div>
                            </div>
                          </div>
                        ) : isCancellationRequested ? (
                          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#92400e', fontSize: '0.85rem', fontWeight: '700', margin: '0.65rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                              <Ban size={18} color="#d97706" />
                              <span style={{ fontWeight: '800', color: '#92400e' }}>Cancellation Request Submitted</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b45309', paddingLeft: '26px' }}>
                              ⏳ Awaiting admin review — your refund will be initiated once approved.
                            </div>
                          </div>
                        ) : isReturnCompleted ? (
                          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#15803d', fontSize: '0.88rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={20} color="#16a34a" />
                            <div>
                              <div>Returned Successfully</div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#16a34a' }}>Completed on {returnCompletedDateStr} • Money refund within 24-48hrs</div>
                            </div>
                          </div>
                        ) : isReturnRequested ? (
                          <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#c2410c', fontSize: '0.85rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RotateCcw size={20} color="#ea580c" />
                            <div>
                              <div>Return Requested — Pickup Scheduled</div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ea580c' }}>Pickup by {order.returnDetails?.pickupDate || 'within 3 Days'}</div>
                            </div>
                          </div>
                        ) : isDelivered ? (
                          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '0.75rem 0.85rem', borderRadius: '10px', color: '#15803d', fontSize: '0.88rem', fontWeight: '800', margin: '0.65rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={20} color="#16a34a" />
                            <div>
                              <div>Delivered</div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#16a34a' }}>Delivered on {deliveredDateStr}</div>
                            </div>
                          </div>
                        ) : (
                          renderFlipkartOrderTracker(order.status)
                        )}

                        {/* Order Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.85rem' }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem' }}>
                              <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{item.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</div>
                              </div>

                              {isDelivered && !isReturnCompleted && (
                                <button
                                  type="button"
                                  onClick={() => setRatingProduct(item)}
                                  style={{ background: '#fef3c7', border: '1px solid #fde047', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Star size={13} fill="#b45309" /> Rate
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Bottom Row */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div>UTR Ref: <strong>{order.utrNumber || 'N/A'}</strong></div>
                            <div>Address: <strong>{order.shippingAddress?.userName}, {order.shippingAddress?.pincode}</strong></div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: isCancelled ? '#dc2626' : '#16a34a' }}>
                              ₹{order.totalAmount?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Pre-Shipment Cancel Button */}
                        {canCancel && !isCancelled && !isCancellationRequested && !isDelivered && (
                          <div style={{ marginTop: '0.75rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                              Pre-Shipment Cancellation
                            </span>
                            <button
                              type="button"
                              onClick={() => setCancelOrder(order)}
                              style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#dc2626', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Ban size={14} /> Cancel Order
                            </button>
                          </div>
                        )}

                        {/* Return Request Button */}
                        {isDelivered && canReturn && !isReturnRequested && !isReturnCompleted && !isCancelled && (
                          <div style={{ marginTop: '0.75rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '700' }}>
                              7-Day Return Window Active
                            </span>
                            <button
                              type="button"
                              onClick={() => setReturnOrder(order)}
                              style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <RotateCcw size={14} /> Request Return
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={20} color="#ef4444" fill="#ef4444" /> My Wishlist ({wishlist.length})
              </h4>

              {wishlist.length === 0 ? (
                <div style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center' }}>
                  <Heart size={44} color="#fca5a5" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#334155' }}>Your Wishlist is Empty</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Tap the heart icon on any product to save it to your wishlist!
                  </p>
                </div>
              ) : (
                <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {wishlist.map((item) => {
                    if (!item) return null;
                    const prod = typeof item === 'object' ? item : { _id: item, name: 'Saved Item', price: 0 };
                    return (
                      <ProductCard
                        key={prod._id || prod.id}
                        product={prod}
                        onAddToCart={onAddToCart}
                        onClickProductTitle={(p) => {
                          onClose();
                          onSelectProduct(p);
                        }}
                        onClickProductImage={(p) => {
                          onClose();
                          onSelectProduct(p);
                        }}
                        isWishlisted={true}
                        onToggleWishlist={onToggleWishlist}
                        cartItems={cartItems}
                        onOpenCart={() => {
                          onClose();
                          if (onOpenCart) onOpenCart();
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Saved Delivery Addresses ({userAddresses.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddAddrForm(!showAddAddrForm)}
                  style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={15} /> {showAddAddrForm ? 'Cancel' : 'Add New Address'}
                </button>
              </div>

              {showAddAddrForm && (
                <form onSubmit={handleAddAddress} style={{ background: 'white', border: '1.5px solid #c026d3', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Enter New Shipping Address</h5>
                  
                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Receiver Name *</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddr.userName}
                      onChange={(e) => setNewAddr({ ...newAddr, userName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="10-digit mobile number"
                      value={newAddr.mobileNumber}
                      onChange={(e) => setNewAddr({ ...newAddr, mobileNumber: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700' }}>Full Address *</label>
                    <textarea
                      rows="2"
                      placeholder="Flat, House No., Building, Street, Area"
                      value={newAddr.address}
                      onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="Near temple/park"
                        value={newAddr.landmark}
                        onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Pincode *</label>
                      <input
                        type="text"
                        placeholder="6-digit Pincode"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                    disabled={addrLoading}
                  >
                    {addrLoading ? 'Saving Address...' : 'Save Address'}
                  </button>
                </form>
              )}

              {userAddresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {userAddresses.map((addr, idx) => (
                    <div key={addr._id || idx} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div>
                          <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>{addr.userName}</span>
                          <span style={{ marginLeft: '8px', fontSize: '0.78rem', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>{addr.mobileNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr._id || idx)}
                          style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: '1.4' }}>
                        {addr.address}{addr.landmark ? `, Landmark: ${addr.landmark}` : ''}, Pincode: <strong>{addr.pincode}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '2rem 1rem', textAlign: 'center' }}>
                  <MapPin size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>No saved addresses found</p>
                </div>
              )}
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div>
              {reportToast && <ToastNotification toast={reportToast} onClose={() => setReportToast(null)} />}

              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} color="#ea580c" /> Report an Issue & Customer Support
              </h4>

              <form onSubmit={handleSubmitReport} style={{ background: 'white', border: '1.5px solid #ea580c', borderRadius: '14px', padding: '1.15rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)' }}>
                <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#9a3412', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} color="#ea580c" /> Submit a New Support Ticket / Issue
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Category *</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', background: 'white' }}
                    >
                      <option value="Order Issue">Order Issue</option>
                      <option value="Payment Issue">Payment Issue</option>
                      <option value="Product Quality">Product Quality</option>
                      <option value="App Bug">App Bug</option>
                      <option value="Other">Other Query</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Subject *</label>
                    <input
                      type="text"
                      placeholder="Brief title of the issue"
                      value={reportSubject}
                      onChange={(e) => setReportSubject(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Detailed Message *</label>
                  <textarea
                    rows="3"
                    placeholder="Describe your issue in detail..."
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport || !reportSubject.trim() || !reportMessage.trim()}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: submittingReport ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Send size={16} />
                  <span>{submittingReport ? 'Submitting...' : 'Submit Support Ticket'}</span>
                </button>
              </form>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                  My Reported Tickets ({userReports.length})
                </h5>

                {loadingReports ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading tickets...</div>
                ) : userReports.length === 0 ? (
                  <div style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center' }}>
                    <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155', margin: 0 }}>No reported tickets yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {userReports.map((report) => (
                      <div key={report._id} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ea580c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '6px' }}>{report.category}</span>
                            <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0.35rem 0 0 0' }}>{report.subject}</h5>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', lineHeight: '1.4' }}>
                          "{report.message}"
                        </div>
                        {report.adminReply && (
                          <div style={{ marginTop: '0.75rem', background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '0.85rem', color: '#1e40af' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '800', color: '#1d4ed8', marginBottom: '0.35rem' }}>
                              <MessageSquare size={16} color="#2563eb" />
                              <span>Admin Reply:</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#1e3a8a', margin: 0, fontWeight: '600' }}>{report.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <TermsPrivacyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} initialTab={policyTab} />
      <AiChatbotModal isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} userName={user.name} userOrders={userOrders} />
      <ProductRatingModal isOpen={!!ratingProduct} onClose={() => setRatingProduct(null)} product={ratingProduct} userName={user.name} onRatingSuccess={() => fetchUserOrders()} />
      <ProductReturnModal isOpen={!!returnOrder} onClose={() => setReturnOrder(null)} order={returnOrder} onReturnSuccess={() => fetchUserOrders()} />
      <OrderCancelModal
        isOpen={!!cancelOrder}
        onClose={() => setCancelOrder(null)}
        order={cancelOrder}
        onCancelSuccess={(updatedOrder) => {
          if (updatedOrder) {
            setUserOrders((prev) =>
              prev.map((o) =>
                (o._id === updatedOrder._id || o.orderId === updatedOrder.orderId) ? { ...o, ...updatedOrder } : o
              )
            );
          } else {
            fetchUserOrders();
          }
          setCancelOrder(null);
        }}
      />
      <AboutUsModal isOpen={isAboutUsOpen} onClose={() => setIsAboutUsOpen(false)} />
    </div>
  );
};

export default UserProfileModal;