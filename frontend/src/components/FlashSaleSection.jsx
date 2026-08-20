

// import React, { useState, useEffect, useRef } from 'react';
// import { Flame, ChevronRight, ChevronLeft, Heart, Plus, Clock } from 'lucide-react';
// import { apiFetch, parseResponseSafely } from '../api';

// const FlashSaleSection = ({
//   onSelectProduct,
//   onAddToCart,
//   onToggleWishlist,
//   wishlist = [],
//   onViewAllClick
// }) => {
//   const [flashSale, setFlashSale] = useState(null);
//   const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
//   const [loading, setLoading] = useState(true);
//   const scrollContainerRef = useRef(null);

//   useEffect(() => {
//     fetchFlashSale();
//     const interval = setInterval(fetchFlashSale, 20000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchFlashSale = async () => {
//     try {
//       const res = await apiFetch('/api/flash-sale/active');
//       const data = await parseResponseSafely(res);
//       if (res.ok && data) {
//         setFlashSale(data);
//       }
//     } catch (e) {
//       console.error('Error fetching flash sale:', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Real-time Countdown Timer (HH:MM:SS)
//   useEffect(() => {
//     if (!flashSale || !flashSale.isActive || !flashSale.endTime) return;

//     const calculateTimer = () => {
//       const targetTime = new Date(flashSale.endTime).getTime();
//       const now = new Date().getTime();
//       const diffMs = targetTime - now;

//       if (diffMs <= 0) {
//         setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
//         return;
//       }

//       const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

//       setTimeLeft({ hours: totalHours, minutes, seconds, totalMs: diffMs });
//     };

//     calculateTimer();
//     const timerInterval = setInterval(calculateTimer, 1000);
//     return () => clearInterval(timerInterval);
//   }, [flashSale]);

//   const handleScroll = (direction) => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = direction === 'left' ? -320 : 320;
//       scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   // Unmount cleanly if disabled, no products, or timer expired
//   if (
//     loading ||
//     !flashSale ||
//     !flashSale.isActive ||
//     !Array.isArray(flashSale.products) ||
//     flashSale.products.length === 0 ||
//     timeLeft.totalMs <= 0
//   ) {
//     return null;
//   }

//   const format2Digits = (num) => String(num).padStart(2, '0');

//   return (
//     <section
//       className="flash-sale-wrapper"
//       style={{
//         maxWidth: '1440px',
//         width: '100%',
//         margin: '1rem auto',
//         padding: '0 0.75rem',
//         boxSizing: 'border-box'
//       }}
//     >
//       <div
//         style={{
//           background: '#ffffff',
//           borderRadius: '16px',
//           border: '1px solid #f1f5f9',
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
//           padding: '1rem 0.75rem 1.25rem 0.75rem'
//         }}
//       >
//         {/* HEADER BAR */}
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: '0.5rem',
//             marginBottom: '0.85rem',
//             flexWrap: 'wrap'
//           }}
//         >
//           {/* Left: Fire Icon + Flash Sale Title + Orange Timer Badge */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//               <Flame size={22} color="#f97316" fill="#f97316" />
//               <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
//                 {flashSale.title || 'Flash Sale'}
//               </h3>
//             </div>

//             {/* Rounded Orange Countdown Badge */}
//             <div
//               style={{
//                 background: '#f97316',
//                 color: '#ffffff',
//                 fontWeight: '800',
//                 fontSize: '0.78rem',
//                 padding: '0.2rem 0.65rem',
//                 borderRadius: '9999px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '4px',
//                 boxShadow: '0 2px 6px rgba(249, 115, 22, 0.25)'
//               }}
//             >
//               <Clock size={13} color="#ffffff" />
//               <span>
//                 {format2Digits(timeLeft.hours)}:{format2Digits(timeLeft.minutes)}:{format2Digits(timeLeft.seconds)}
//               </span>
//             </div>
//           </div>

//           {/* Right: View All Button */}
//           <button
//             type="button"
//             onClick={onViewAllClick}
//             style={{
//               background: 'transparent',
//               border: 'none',
//               color: '#c026d3',
//               fontWeight: '800',
//               fontSize: '0.85rem',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '2px'
//             }}
//           >
//             <span>View All</span>
//             <ChevronRight size={16} />
//           </button>
//         </div>

//         {/* CAROUSEL CONTAINER WITH NAVIGATION ARROWS */}
//         <div style={{ position: 'relative' }}>
//           {/* Left Floating Arrow */}
//           <button
//             type="button"
//             onClick={() => handleScroll('left')}
//             className="scroll-btn left"
//             style={{
//               position: 'absolute',
//               left: '-10px',
//               top: '40%',
//               transform: 'translateY(-50%)',
//               zIndex: 10,
//               width: '32px',
//               height: '32px',
//               borderRadius: '50%',
//               background: 'rgba(255, 255, 255, 0.95)',
//               border: '1px solid #e2e8f0',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//           >
//             <ChevronLeft size={18} color="#1e293b" />
//           </button>

//           {/* Right Floating Arrow */}
//           <button
//             type="button"
//             onClick={() => handleScroll('right')}
//             className="scroll-btn right"
//             style={{
//               position: 'absolute',
//               right: '-10px',
//               top: '40%',
//               transform: 'translateY(-50%)',
//               zIndex: 10,
//               width: '32px',
//               height: '32px',
//               borderRadius: '50%',
//               background: 'rgba(255, 255, 255, 0.95)',
//               border: '1px solid #e2e8f0',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//           >
//             <ChevronRight size={18} color="#1e293b" />
//           </button>

//           {/* 8-COLUMN HORIZONTAL PRODUCT SLIDER */}
//           <div
//             ref={scrollContainerRef}
//             className="flash-sale-slider"
//             style={{
//               display: 'flex',
//               gap: '0.65rem',
//               overflowX: 'auto',
//               scrollSnapType: 'x mandatory',
//               scrollbarWidth: 'none',
//               padding: '0.2rem 0'
//             }}
//           >
//             {flashSale.products.map((product) => {
//               const prodId = product._id || product.id;
//               const isWishlisted = wishlist.some((w) => String(w._id || w.id || w) === String(prodId));

//               const discount =
//                 product.mrp && product.mrp > product.price
//                   ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
//                   : product.discount || null;

//               const imgUrl = (product.images && product.images[0]) || product.image || 'https://via.placeholder.com/300';
//               const brandName = product.brand || 'DIPTO FASHION';

//               return (
//                 <div
//                   key={prodId}
//                   className="flash-sale-card"
//                   onClick={() => onSelectProduct && onSelectProduct(product)}
//                   style={{
//                     scrollSnapAlign: 'start',
//                     flexShrink: 0,
//                     background: '#ffffff',
//                     border: '1px solid #e2e8f0',
//                     borderRadius: '10px',
//                     overflow: 'hidden',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'space-between',
//                     cursor: 'pointer',
//                     transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//                     position: 'relative'
//                   }}
//                 >
//                   {/* COMPACT IMAGE CONTAINER (100% Full Uncropped Image) */}
//                   <div
//                     style={{
//                       position: 'relative',
//                       width: '100%',
//                       height: '155px',
//                       background: '#ffffff',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       padding: '4px',
//                       boxSizing: 'border-box'
//                     }}
//                   >
//                     <img
//                       src={imgUrl}
//                       alt={product.name}
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain'
//                       }}
//                     />

//                     {/* DISCOUNT BADGE ONLY */}
//                     {discount && (
//                       <span
//                         style={{
//                           position: 'absolute',
//                           top: '6px',
//                           left: '6px',
//                           background: '#f97316',
//                           color: '#ffffff',
//                           fontSize: '0.62rem',
//                           fontWeight: '900',
//                           padding: '2px 5px',
//                           borderRadius: '4px',
//                           boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
//                           zIndex: 2
//                         }}
//                       >
//                         {discount}% OFF
//                       </span>
//                     )}

//                     {/* TOP RIGHT WISHLIST HEART ICON */}
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (onToggleWishlist) onToggleWishlist(product);
//                       }}
//                       style={{
//                         position: 'absolute',
//                         top: '6px',
//                         right: '6px',
//                         background: 'rgba(255, 255, 255, 0.9)',
//                         border: 'none',
//                         borderRadius: '50%',
//                         width: '24px',
//                         height: '24px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         cursor: 'pointer',
//                         boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
//                         zIndex: 2
//                       }}
//                     >
//                       <Heart
//                         size={13}
//                         color={isWishlisted ? '#dc2626' : '#64748b'}
//                         fill={isWishlisted ? '#dc2626' : 'none'}
//                       />
//                     </button>

//                     {/* RATING BADGE */}
//                     <div
//                       style={{
//                         position: 'absolute',
//                         bottom: '5px',
//                         left: '6px',
//                         background: '#15803d',
//                         color: '#ffffff',
//                         fontSize: '0.6rem',
//                         fontWeight: '800',
//                         padding: '1px 4px',
//                         borderRadius: '3px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '2px',
//                         zIndex: 2
//                       }}
//                     >
//                       <span>{product.rating || '4.5'} ★</span>
//                       <span style={{ color: '#86efac' }}>|</span>
//                       <span>{product.reviewsCount || '1'}</span>
//                     </div>
//                   </div>

//                   {/* PRODUCT INFO */}
//                   <div
//                     style={{
//                       padding: '0.45rem',
//                       display: 'flex',
//                       flexDirection: 'column',
//                       flex: 1,
//                       justifyContent: 'space-between',
//                       gap: '4px'
//                     }}
//                   >
//                     <div>
//                       {/* Brand Name */}
//                       <div
//                         style={{
//                           fontSize: '0.6rem',
//                           fontWeight: '700',
//                           color: '#94a3b8',
//                           textTransform: 'uppercase',
//                           letterSpacing: '0.4px',
//                           whiteSpace: 'nowrap',
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis'
//                         }}
//                       >
//                         {brandName}
//                       </div>

//                       {/* Title */}
//                       <h4
//                         style={{
//                           fontSize: '0.75rem',
//                           fontWeight: '700',
//                           color: '#0f172a',
//                           margin: '0 0 2px 0',
//                           lineHeight: 1.2,
//                           whiteSpace: 'nowrap',
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis'
//                         }}
//                       >
//                         {product.name}
//                       </h4>

//                       {/* Price Row */}
//                       <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
//                         <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>
//                           ₹{product.price?.toLocaleString('en-IN')}
//                         </span>
//                         {product.mrp && product.mrp > product.price && (
//                           <span style={{ fontSize: '0.65rem', color: '#94a3b8', textDecoration: 'line-through' }}>
//                             ₹{product.mrp?.toLocaleString('en-IN')}
//                           </span>
//                         )}
//                         {discount && (
//                           <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c026d3' }}>
//                             ({discount}%)
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* + ADD TO CART ACTION BUTTON */}
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (onAddToCart) onAddToCart(product);
//                       }}
//                       style={{
//                         width: '100%',
//                         background: '#c026d3',
//                         color: '#ffffff',
//                         border: 'none',
//                         padding: '0.35rem 0.4rem',
//                         borderRadius: '8px',
//                         fontSize: '0.72rem',
//                         fontWeight: '800',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '3px',
//                         marginTop: '3px',
//                         boxShadow: '0 2px 6px rgba(192, 38, 211, 0.2)'
//                       }}
//                     >
//                       <Plus size={12} strokeWidth={3} />
//                       <span>Add to Cart</span>
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* RESPONSIVE 8-COLUMN CARD SIZING */}
//       <style>{`
//         .flash-sale-slider::-webkit-scrollbar {
//           display: none;
//         }
//         .flash-sale-card {
//           width: 135px;
//           min-width: 135px;
//         }
//         @media (min-width: 1024px) {
//           .flash-sale-card {
//             width: calc((100% - (7 * 0.65rem)) / 8);
//             min-width: calc((100% - (7 * 0.65rem)) / 8);
//           }
//         }
//         .flash-sale-card:hover {
//           transform: translateY(-3px);
//           box-shadow: 0 6px 16px rgba(0,0,0,0.08);
//         }
//         .scroll-btn:hover {
//           background: #ffffff !important;
//           transform: translateY(-50%) scale(1.08) !important;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default FlashSaleSection;







// import React, { useState, useEffect, useRef } from 'react';
// import { Flame, ChevronRight, ChevronLeft, Heart, Plus, Clock } from 'lucide-react';
// import { apiFetch, parseResponseSafely } from '../api';

// const FlashSaleSection = ({
//   onSelectProduct,
//   onAddToCart,
//   onToggleWishlist,
//   wishlist = [],
//   onViewAllClick
// }) => {
//   const [flashSale, setFlashSale] = useState(null);
//   const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
//   const [loading, setLoading] = useState(true);
//   const scrollContainerRef = useRef(null);

//   useEffect(() => {
//     fetchFlashSale();
//     const interval = setInterval(fetchFlashSale, 20000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchFlashSale = async () => {
//     try {
//       const res = await apiFetch('/api/flash-sale/active');
//       const data = await parseResponseSafely(res);
//       if (res.ok && data) {
//         setFlashSale(data);
//       }
//     } catch (e) {
//       console.error('Error fetching flash sale:', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Real-time Countdown Timer (HH:MM:SS)
//   useEffect(() => {
//     if (!flashSale || !flashSale.isActive || !flashSale.endTime) return;

//     const calculateTimer = () => {
//       const targetTime = new Date(flashSale.endTime).getTime();
//       const now = new Date().getTime();
//       const diffMs = targetTime - now;

//       if (diffMs <= 0) {
//         setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
//         return;
//       }

//       const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

//       setTimeLeft({ hours: totalHours, minutes, seconds, totalMs: diffMs });
//     };

//     calculateTimer();
//     const timerInterval = setInterval(calculateTimer, 1000);
//     return () => clearInterval(timerInterval);
//   }, [flashSale]);

//   const handleScroll = (direction) => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = direction === 'left' ? -320 : 320;
//       scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   // Unmount cleanly if disabled, no products, or timer expired
//   if (
//     loading ||
//     !flashSale ||
//     !flashSale.isActive ||
//     !Array.isArray(flashSale.products) ||
//     flashSale.products.length === 0 ||
//     timeLeft.totalMs <= 0
//   ) {
//     return null;
//   }

//   const format2Digits = (num) => String(num).padStart(2, '0');

//   return (
//     <section
//       className="flash-sale-wrapper"
//       style={{
//         maxWidth: '1440px',
//         width: '100%',
//         margin: '1rem auto',
//         padding: '0 0.75rem',
//         boxSizing: 'border-box'
//       }}
//     >
//       <div
//         style={{
//           background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
//           borderRadius: '16px',
//           border: '1px solid #fdba74',
//           boxShadow: '0 4px 20px rgba(249, 115, 22, 0.08)',
//           padding: '1rem 0.75rem 1.25rem 0.75rem'
//         }}
//       >
//         {/* HEADER BAR */}
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: '0.5rem',
//             marginBottom: '0.85rem',
//             flexWrap: 'wrap'
//           }}
//         >
//           {/* Left: Fire Icon + Flash Sale Title + Orange Timer Badge */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//               <Flame size={22} color="#f97316" fill="#f97316" />
//               <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
//                 {flashSale.title || 'Flash Sale'}
//               </h3>
//             </div>

//             {/* Rounded Orange Countdown Badge */}
//             <div
//               style={{
//                 background: '#f97316',
//                 color: '#ffffff',
//                 fontWeight: '800',
//                 fontSize: '0.78rem',
//                 padding: '0.2rem 0.65rem',
//                 borderRadius: '9999px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '4px',
//                 boxShadow: '0 2px 6px rgba(249, 115, 22, 0.25)'
//               }}
//             >
//               <Clock size={13} color="#ffffff" />
//               <span>
//                 {format2Digits(timeLeft.hours)}:{format2Digits(timeLeft.minutes)}:{format2Digits(timeLeft.seconds)}
//               </span>
//             </div>
//           </div>

//           {/* Right: View All Button */}
//           <button
//             type="button"
//             onClick={onViewAllClick}
//             style={{
//               background: 'transparent',
//               border: 'none',
//               color: '#c026d3',
//               fontWeight: '800',
//               fontSize: '0.85rem',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '2px'
//             }}
//           >
//             <span>View All</span>
//             <ChevronRight size={16} />
//           </button>
//         </div>

//         {/* CAROUSEL CONTAINER WITH NAVIGATION ARROWS */}
//         <div style={{ position: 'relative' }}>
//           {/* Left Floating Arrow */}
//           <button
//             type="button"
//             onClick={() => handleScroll('left')}
//             className="scroll-btn left"
//             style={{
//               position: 'absolute',
//               left: '-10px',
//               top: '40%',
//               transform: 'translateY(-50%)',
//               zIndex: 10,
//               width: '32px',
//               height: '32px',
//               borderRadius: '50%',
//               background: 'rgba(255, 255, 255, 0.95)',
//               border: '1px solid #fed7aa',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//           >
//             <ChevronLeft size={18} color="#1e293b" />
//           </button>

//           {/* Right Floating Arrow */}
//           <button
//             type="button"
//             onClick={() => handleScroll('right')}
//             className="scroll-btn right"
//             style={{
//               position: 'absolute',
//               right: '-10px',
//               top: '40%',
//               transform: 'translateY(-50%)',
//               zIndex: 10,
//               width: '32px',
//               height: '32px',
//               borderRadius: '50%',
//               background: 'rgba(255, 255, 255, 0.95)',
//               border: '1px solid #fed7aa',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//           >
//             <ChevronRight size={18} color="#1e293b" />
//           </button>

//           {/* 8-COLUMN HORIZONTAL PRODUCT SLIDER */}
//           <div
//             ref={scrollContainerRef}
//             className="flash-sale-slider"
//             style={{
//               display: 'flex',
//               gap: '0.65rem',
//               overflowX: 'auto',
//               scrollSnapType: 'x mandatory',
//               scrollbarWidth: 'none',
//               padding: '0.2rem 0'
//             }}
//           >
//             {flashSale.products.map((product) => {
//               const prodId = product._id || product.id;
//               const isWishlisted = wishlist.some((w) => String(w._id || w.id || w) === String(prodId));

//               const discount =
//                 product.mrp && product.mrp > product.price
//                   ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
//                   : product.discount || null;

//               const imgUrl = (product.images && product.images[0]) || product.image || 'https://via.placeholder.com/300';
//               const brandName = product.brand || 'DIPTO FASHION';

//               return (
//                 <div
//                   key={prodId}
//                   className="flash-sale-card"
//                   onClick={() => onSelectProduct && onSelectProduct(product)}
//                   style={{
//                     scrollSnapAlign: 'start',
//                     flexShrink: 0,
//                     background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
//                     border: '1px solid #fed7aa',
//                     borderRadius: '10px',
//                     overflow: 'hidden',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'space-between',
//                     cursor: 'pointer',
//                     transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//                     position: 'relative',
//                     boxShadow: '0 2px 8px rgba(249, 115, 22, 0.05)'
//                   }}
//                 >
//                   {/* COMPACT IMAGE CONTAINER */}
//                   <div
//                     style={{
//                       position: 'relative',
//                       width: '100%',
//                       height: '155px',
//                       background: '#ffffff',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       padding: '4px',
//                       boxSizing: 'border-box'
//                     }}
//                   >
//                     <img
//                       src={imgUrl}
//                       alt={product.name}
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain'
//                       }}
//                     />

//                     {/* DISCOUNT BADGE ONLY */}
//                     {discount && (
//                       <span
//                         style={{
//                           position: 'absolute',
//                           top: '6px',
//                           left: '6px',
//                           background: '#f97316',
//                           color: '#ffffff',
//                           fontSize: '0.62rem',
//                           fontWeight: '900',
//                           padding: '2px 5px',
//                           borderRadius: '4px',
//                           boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
//                           zIndex: 2
//                         }}
//                       >
//                         {discount}% OFF
//                       </span>
//                     )}

//                     {/* TOP RIGHT WISHLIST HEART ICON */}
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (onToggleWishlist) onToggleWishlist(product);
//                       }}
//                       style={{
//                         position: 'absolute',
//                         top: '6px',
//                         right: '6px',
//                         background: 'rgba(255, 255, 255, 0.9)',
//                         border: 'none',
//                         borderRadius: '50%',
//                         width: '24px',
//                         height: '24px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         cursor: 'pointer',
//                         boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
//                         zIndex: 2
//                       }}
//                     >
//                       <Heart
//                         size={13}
//                         color={isWishlisted ? '#dc2626' : '#64748b'}
//                         fill={isWishlisted ? '#dc2626' : 'none'}
//                       />
//                     </button>

//                     {/* RATING BADGE */}
//                     <div
//                       style={{
//                         position: 'absolute',
//                         bottom: '5px',
//                         left: '6px',
//                         background: '#15803d',
//                         color: '#ffffff',
//                         fontSize: '0.6rem',
//                         fontWeight: '800',
//                         padding: '1px 4px',
//                         borderRadius: '3px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '2px',
//                         zIndex: 2
//                       }}
//                     >
//                       <span>{product.rating || '4.5'} ★</span>
//                       <span style={{ color: '#86efac' }}>|</span>
//                       <span>{product.reviewsCount || '1'}</span>
//                     </div>
//                   </div>

//                   {/* PRODUCT INFO */}
//                   <div
//                     style={{
//                       padding: '0.45rem',
//                       display: 'flex',
//                       flexDirection: 'column',
//                       flex: 1,
//                       justifyContent: 'space-between',
//                       gap: '4px'
//                     }}
//                   >
//                     <div>
//                       {/* Brand Name */}
//                       <div
//                         style={{
//                           fontSize: '0.6rem',
//                           fontWeight: '700',
//                           color: '#94a3b8',
//                           textTransform: 'uppercase',
//                           letterSpacing: '0.4px',
//                           whiteSpace: 'nowrap',
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis'
//                         }}
//                       >
//                         {brandName}
//                       </div>

//                       {/* Title */}
//                       <h4
//                         style={{
//                           fontSize: '0.75rem',
//                           fontWeight: '700',
//                           color: '#0f172a',
//                           margin: '0 0 2px 0',
//                           lineHeight: 1.2,
//                           whiteSpace: 'nowrap',
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis'
//                         }}
//                       >
//                         {product.name}
//                       </h4>

//                       {/* Price Row */}
//                       <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
//                         <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>
//                           ₹{product.price?.toLocaleString('en-IN')}
//                         </span>
//                         {product.mrp && product.mrp > product.price && (
//                           <span style={{ fontSize: '0.65rem', color: '#94a3b8', textDecoration: 'line-through' }}>
//                             ₹{product.mrp?.toLocaleString('en-IN')}
//                           </span>
//                         )}
//                         {discount && (
//                           <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c026d3' }}>
//                             ({discount}%)
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* + ADD TO CART ACTION BUTTON */}
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (onAddToCart) onAddToCart(product);
//                       }}
//                       style={{
//                         width: '100%',
//                         background: '#c026d3',
//                         color: '#ffffff',
//                         border: 'none',
//                         padding: '0.35rem 0.4rem',
//                         borderRadius: '8px',
//                         fontSize: '0.72rem',
//                         fontWeight: '800',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '3px',
//                         marginTop: '3px',
//                         boxShadow: '0 2px 6px rgba(192, 38, 211, 0.2)'
//                       }}
//                     >
//                       <Plus size={12} strokeWidth={3} />
//                       <span>Add to Cart</span>
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* RESPONSIVE 8-COLUMN CARD SIZING */}
//       <style>{`
//         .flash-sale-slider::-webkit-scrollbar {
//           display: none;
//         }
//         .flash-sale-card {
//           width: 135px;
//           min-width: 135px;
//         }
//         @media (min-width: 1024px) {
//           .flash-sale-card {
//             width: calc((100% - (7 * 0.65rem)) / 8);
//             min-width: calc((100% - (7 * 0.65rem)) / 8);
//           }
//         }
//         .flash-sale-card:hover {
//           transform: translateY(-3px);
//           box-shadow: 0 6px 16px rgba(0,0,0,0.08);
//         }
//         .scroll-btn:hover {
//           background: #ffffff !important;
//           transform: translateY(-50%) scale(1.08) !important;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default FlashSaleSection;






import React, { useState, useEffect, useRef } from 'react';
import { Flame, ChevronRight, ChevronLeft, Heart, Plus, Clock } from 'lucide-react';
import { apiFetch, parseResponseSafely } from '../api';

const FlashSaleSection = ({
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  onViewAllClick
}) => {
  const [flashSale, setFlashSale] = useState(() => {
    try {
      const saved = localStorage.getItem('df_flash_sale_active');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalMs: 1 });
  const [loading, setLoading] = useState(() => !flashSale);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchFlashSale();
    const interval = setInterval(fetchFlashSale, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchFlashSale = async () => {
    try {
      const res = await apiFetch('/api/flash-sale/active');
      const data = await parseResponseSafely(res);
      if (res.ok && data) {
        setFlashSale(data);
        try {
          localStorage.setItem('df_flash_sale_active', JSON.stringify(data));
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error fetching flash sale:', e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Countdown Timer (HH:MM:SS)
  useEffect(() => {
    if (!flashSale || !flashSale.isActive || !flashSale.endTime) return;

    const calculateTimer = () => {
      const targetTime = new Date(flashSale.endTime).getTime();
      const now = new Date().getTime();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours: totalHours, minutes, seconds, totalMs: diffMs });
    };

    calculateTimer();
    const timerInterval = setInterval(calculateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [flashSale]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Loading obosthay layout hold korar container
  if (loading && !flashSale) {
    return (
      <section
        className="flash-sale-wrapper"
        style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '1rem auto',
          padding: '0 0.75rem',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
            borderRadius: '16px',
            border: '1px solid #fdba74',
            minHeight: '260px'
          }}
        />
      </section>
    );
  }

  // Unmount cleanly if disabled, no products, or timer expired
  if (
    !flashSale ||
    !flashSale.isActive ||
    !Array.isArray(flashSale.products) ||
    flashSale.products.length === 0 ||
    timeLeft.totalMs <= 0
  ) {
    return null;
  }

  const format2Digits = (num) => String(num).padStart(2, '0');

  return (
    <section
      className="flash-sale-wrapper"
      style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '1rem auto',
        padding: '0 0.75rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
          borderRadius: '16px',
          border: '1px solid #fdba74',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.08)',
          padding: '1rem 0.75rem 1.25rem 0.75rem'
        }}
      >
        {/* HEADER BAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Fire Icon + Flash Sale Title + Orange Timer Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Flame size={22} color="#f97316" fill="#f97316" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {flashSale.title || 'Flash Sale'}
              </h3>
            </div>

            {/* Rounded Orange Countdown Badge */}
            <div
              style={{
                background: '#f97316',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.78rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(249, 115, 22, 0.25)'
              }}
            >
              <Clock size={13} color="#ffffff" />
              <span>
                {format2Digits(timeLeft.hours)}:{format2Digits(timeLeft.minutes)}:{format2Digits(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Right: View All Button */}
          <button
            type="button"
            onClick={onViewAllClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c026d3',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* CAROUSEL CONTAINER WITH NAVIGATION ARROWS */}
        <div style={{ position: 'relative' }}>
          {/* Left Floating Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="scroll-btn left"
            style={{
              position: 'absolute',
              left: '-10px',
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #fed7aa',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={18} color="#1e293b" />
          </button>

          {/* Right Floating Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="scroll-btn right"
            style={{
              position: 'absolute',
              right: '-10px',
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #fed7aa',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={18} color="#1e293b" />
          </button>

          {/* 8-COLUMN HORIZONTAL PRODUCT SLIDER */}
          <div
            ref={scrollContainerRef}
            className="flash-sale-slider"
            style={{
              display: 'flex',
              gap: '0.65rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              padding: '0.2rem 0'
            }}
          >
            {flashSale.products.map((product) => {
              const prodId = product._id || product.id;
              const isWishlisted = wishlist.some((w) => String(w._id || w.id || w) === String(prodId));

              const discount =
                product.mrp && product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : product.discount || null;

              const imgUrl = (product.images && product.images[0]) || product.image || 'https://via.placeholder.com/300';
              const brandName = product.brand || 'DIPTO FASHION';

              return (
                <div
                  key={prodId}
                  className="flash-sale-card"
                  onClick={() => onSelectProduct && onSelectProduct(product)}
                  style={{
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
                    border: '1px solid #fed7aa',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.05)'
                  }}
                >
                  {/* COMPACT IMAGE CONTAINER */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '155px',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />

                    {/* DISCOUNT BADGE ONLY */}
                    {discount && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: '#f97316',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: '900',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                          zIndex: 2
                        }}
                      >
                        {discount}% OFF
                      </span>
                    )}

                    {/* TOP RIGHT WISHLIST HEART ICON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) onToggleWishlist(product);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        zIndex: 2
                      }}
                    >
                      <Heart
                        size={13}
                        color={isWishlisted ? '#dc2626' : '#64748b'}
                        fill={isWishlisted ? '#dc2626' : 'none'}
                      />
                    </button>

                    {/* RATING BADGE */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '5px',
                        left: '6px',
                        background: '#15803d',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: '800',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        zIndex: 2
                      }}
                    >
                      <span>{product.rating || '4.5'} ★</span>
                      <span style={{ color: '#86efac' }}>|</span>
                      <span>{product.reviewsCount || '1'}</span>
                    </div>
                  </div>

                  {/* PRODUCT INFO */}
                  <div
                    style={{
                      padding: '0.45rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                      gap: '4px'
                    }}
                  >
                    <div>
                      {/* Brand Name */}
                      <div
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: '700',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {brandName}
                      </div>

                      {/* Title */}
                      <h4
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#0f172a',
                          margin: '0 0 2px 0',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {product.name}
                      </h4>

                      {/* Price Row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>
                          ₹{product.price?.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{product.mrp?.toLocaleString('en-IN')}
                          </span>
                        )}
                        {discount && (
                          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#c026d3' }}>
                            ({discount}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* + ADD TO CART ACTION BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddToCart) onAddToCart(product);
                      }}
                      style={{
                        width: '100%',
                        background: '#c026d3',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.35rem 0.4rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        marginTop: '3px',
                        boxShadow: '0 2px 6px rgba(192, 38, 211, 0.2)'
                      }}
                    >
                      <Plus size={12} strokeWidth={3} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RESPONSIVE 8-COLUMN CARD SIZING */}
      <style>{`
        .flash-sale-slider::-webkit-scrollbar {
          display: none;
        }
        .flash-sale-card {
          width: 135px;
          min-width: 135px;
        }
        @media (min-width: 1024px) {
          .flash-sale-card {
            width: calc((100% - (7 * 0.65rem)) / 8);
            min-width: calc((100% - (7 * 0.65rem)) / 8);
          }
        }
        .flash-sale-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .scroll-btn:hover {
          background: #ffffff !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
      `}</style>
    </section>
  );
};

export default FlashSaleSection;