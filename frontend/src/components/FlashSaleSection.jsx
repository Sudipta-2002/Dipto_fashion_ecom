// import React, { useState, useEffect, useRef } from 'react';
// import { Flame, ChevronRight, Heart, ShoppingBag, Clock } from 'lucide-react';
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
//         margin: '1.25rem auto 1rem auto',
//         padding: '0 1.25rem',
//         boxSizing: 'border-box'
//       }}
//     >
//       <div
//         style={{
//           background: '#ffffff',
//           borderRadius: '16px',
//           border: '1px solid #f1f5f9',
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
//           padding: '1.25rem 1.25rem 1.5rem 1.25rem'
//         }}
//       >
//         {/* HEADER BAR */}
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: '0.75rem',
//             marginBottom: '1.1rem',
//             flexWrap: 'wrap'
//           }}
//         >
//           {/* Left: Fire Icon + Flash Sale Title + Orange Timer Badge */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
//               <Flame size={24} color="#f97316" fill="#f97316" />
//               <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
//                 {flashSale.title || 'Flash Sale'}
//               </h3>
//             </div>

//             {/* Rounded Orange Countdown Badge */}
//             <div
//               style={{
//                 background: '#f97316',
//                 color: '#ffffff',
//                 fontWeight: '900',
//                 fontSize: '0.85rem',
//                 padding: '0.25rem 0.85rem',
//                 borderRadius: '9999px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '4px',
//                 boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
//               }}
//             >
//               <Clock size={14} color="#ffffff" />
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
//               fontSize: '0.9rem',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '2px',
//               transition: 'opacity 0.2s'
//             }}
//           >
//             <span>View All</span>
//             <ChevronRight size={18} />
//           </button>
//         </div>

//         {/* HORIZONTAL PRODUCT SLIDER */}
//         <div
//           ref={scrollContainerRef}
//           className="flash-sale-slider"
//           style={{
//             display: 'flex',
//             gap: '1rem',
//             overflowX: 'auto',
//             scrollSnapType: 'x mandatory',
//             scrollbarWidth: 'none',
//             paddingBottom: '0.5rem'
//           }}
//         >
//           {flashSale.products.map((product) => {
//             const prodId = product._id || product.id;
//             const isWishlisted = wishlist.some((w) => String(w._id || w.id || w) === String(prodId));

//             const discount =
//               product.mrp && product.mrp > product.price
//                 ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
//                 : null;

//             const isBestseller = product.isBestseller || product.rating >= 4.5;
//             const isNew = product.isNewProduct;
//             const imgUrl = (product.images && product.images[0]) || product.image || 'https://via.placeholder.com/300';
//             const brandName = product.brand || 'DIPTO FASHION';

//             return (
//               <div
//                 key={prodId}
//                 className="flash-sale-card"
//                 onClick={() => onSelectProduct && onSelectProduct(product)}
//                 style={{
//                   minWidth: '220px',
//                   maxWidth: '220px',
//                   scrollSnapAlign: 'start',
//                   flexShrink: 0,
//                   background: '#ffffff',
//                   border: '1px solid #e2e8f0',
//                   borderRadius: '14px',
//                   overflow: 'hidden',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   cursor: 'pointer',
//                   transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//                   position: 'relative'
//                 }}
//               >
//                 {/* IMAGE CONTAINER */}
//                 <div
//                   style={{
//                     position: 'relative',
//                     width: '100%',
//                     height: '240px',
//                     background: '#f8fafc',
//                     overflow: 'hidden'
//                   }}
//                 >
//                   <img
//                     src={imgUrl}
//                     alt={product.name}
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover'
//                     }}
//                   />

//                   {/* TOP LEFT BADGES (Dual Badges) */}
//                   <div
//                     style={{
//                       position: 'absolute',
//                       top: '8px',
//                       left: '8px',
//                       display: 'flex',
//                       flexDirection: 'column',
//                       gap: '4px',
//                       zIndex: 2
//                     }}
//                   >
//                     {isBestseller && (
//                       <span
//                         style={{
//                           background: '#ec4899',
//                           color: '#ffffff',
//                           fontSize: '0.65rem',
//                           fontWeight: '900',
//                           padding: '2px 7px',
//                           borderRadius: '4px',
//                           textTransform: 'uppercase',
//                           letterSpacing: '0.3px',
//                           boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
//                         }}
//                       >
//                         BESTSELLER
//                       </span>
//                     )}
//                     {!isBestseller && isNew && (
//                       <span
//                         style={{
//                           background: '#10b981',
//                           color: '#ffffff',
//                           fontSize: '0.65rem',
//                           fontWeight: '900',
//                           padding: '2px 7px',
//                           borderRadius: '4px',
//                           textTransform: 'uppercase',
//                           letterSpacing: '0.3px'
//                         }}
//                       >
//                         NEW
//                       </span>
//                     )}
//                     {discount && (
//                       <span
//                         style={{
//                           background: '#f97316',
//                           color: '#ffffff',
//                           fontSize: '0.65rem',
//                           fontWeight: '900',
//                           padding: '2px 7px',
//                           borderRadius: '4px'
//                         }}
//                       >
//                         {discount}% OFF
//                       </span>
//                     )}
//                   </div>

//                   {/* TOP RIGHT WISHLIST HEART ICON */}
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (onToggleWishlist) onToggleWishlist(product);
//                     }}
//                     style={{
//                       position: 'absolute',
//                       top: '8px',
//                       right: '8px',
//                       background: 'rgba(255, 255, 255, 0.9)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '30px',
//                       height: '30px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
//                       zIndex: 2
//                     }}
//                     title="Add to Wishlist"
//                   >
//                     <Heart
//                       size={16}
//                       color={isWishlisted ? '#dc2626' : '#64748b'}
//                       fill={isWishlisted ? '#dc2626' : 'none'}
//                     />
//                   </button>
//                 </div>

//                 {/* PRODUCT INFO */}
//                 <div
//                   style={{
//                     padding: '0.75rem',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     flex: 1,
//                     justify: 'space-between'
//                   }}
//                 >
//                   <div>
//                     {/* Brand Name */}
//                     <div
//                       style={{
//                         fontSize: '0.68rem',
//                         fontWeight: '700',
//                         color: '#94a3b8',
//                         textTransform: 'uppercase',
//                         letterSpacing: '0.5px',
//                         marginBottom: '2px'
//                       }}
//                     >
//                       {brandName}
//                     </div>

//                     {/* Title 2-Line Clamped */}
//                     <h4
//                       style={{
//                         fontSize: '0.85rem',
//                         fontWeight: '700',
//                         color: '#0f172a',
//                         margin: '0 0 0.4rem 0',
//                         lineHeight: 1.25,
//                         display: '-webkit-box',
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: 'vertical',
//                         overflow: 'hidden',
//                         height: '2.5em'
//                       }}
//                     >
//                       {product.name}
//                     </h4>

//                     {/* Price Row */}
//                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
//                       <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>
//                         ₹{product.price?.toLocaleString('en-IN')}
//                       </span>
//                       {product.mrp && product.mrp > product.price && (
//                         <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
//                           ₹{product.mrp?.toLocaleString('en-IN')}
//                         </span>
//                       )}
//                       {discount && (
//                         <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#c026d3' }}>
//                           ({discount}% OFF)
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {/* ADD TO BAG ACTION BUTTON */}
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (onAddToCart) onAddToCart(product);
//                     }}
//                     style={{
//                       width: '100%',
//                       background: '#c026d3',
//                       color: '#ffffff',
//                       border: 'none',
//                       padding: '0.55rem',
//                       borderRadius: '20px',
//                       fontSize: '0.82rem',
//                       fontWeight: '800',
//                       cursor: 'pointer',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '5px',
//                       boxShadow: '0 3px 10px rgba(192, 38, 211, 0.25)',
//                       transition: 'background 0.2s'
//                     }}
//                   >
//                     <ShoppingBag size={14} />
//                     <span>Add to Bag</span>
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <style>{`
//         .flash-sale-slider::-webkit-scrollbar {
//           display: none;
//         }
//         .flash-sale-card:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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
  const [flashSale, setFlashSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
  const [loading, setLoading] = useState(true);
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

  // Unmount cleanly if disabled, no products, or timer expired
  if (
    loading ||
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
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
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
              border: '1px solid #e2e8f0',
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
              border: '1px solid #e2e8f0',
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
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* COMPACT IMAGE CONTAINER (100% Full Uncropped Image) */}
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