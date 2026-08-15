// import React, { useState, useEffect, useRef } from 'react';
// import {
//   X,
//   Star,
//   ShoppingCart,
//   ShieldCheck,
//   Truck,
//   RotateCcw,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   Ruler,
//   Maximize2,
//   AlertCircle,
//   Check,
//   Heart,
//   Sparkles,
//   ArrowRight,
//   Plus
// } from 'lucide-react';
// import SizeChartModal from './SizeChartModal';
// import ProductCard from './ProductCard';
// import ExpandableSearchBar from './ExpandableSearchBar';

// const ProductDetailModal = ({
//   isOpen,
//   onClose,
//   product,
//   onAddToCart,
//   allProducts = [],
//   onSelectProduct,
//   isWishlisted,
//   onToggleWishlist,
//   wishlist = [],
//   historyLength = 0,
//   onGoBack,
//   searchTerm = '',
//   setSearchTerm,
//   cartItems = [],
//   onOpenCart
// }) => {
//   const modalContainerRef = useRef(null);

//   const [activeImageIndex, setActiveImageIndex] = useState(0);
//   const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
//   const [isFullViewOpen, setIsFullViewOpen] = useState(false);
//   const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

//   // Available Sizes Calculation
//   const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//     ? product.availableSizes
//     : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//   const [selectedSize, setSelectedSize] = useState('');
//   const [sizeError, setSizeError] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setActiveImageIndex(0);
//       setIsFullViewOpen(false);
//       setSizeError(false);
//       setIsDetailsExpanded(false);
//       // Default to first size if available, or force pick if multiple
//       setSelectedSize(sizesList.length === 1 ? sizesList[0] : '');

//       // Requirement 1: Automatic Scroll to Product Details
//       if (modalContainerRef.current) {
//         modalContainerRef.current.scrollTop = 0;
//         modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//       }
//     }
//   }, [isOpen, product]);

//   if (!isOpen || !product) return null;

//   const { name, category, mrp, price, description, images, image, rating = 4.5, reviewsCount = 142 } = product;

//   // Requirement 2: Category-Specific Related Suggestions ONLY (Same category, excluding current item)
//   const currentId = product._id || product.id;
//   const relatedProducts = allProducts.filter(
//     (p) =>
//       (p._id || p.id) !== currentId &&
//       p.category &&
//       category &&
//       p.category.trim().toLowerCase() === category.trim().toLowerCase()
//   );


//   // Multi-image display fallback
//   const displayImages = (images && images.length > 0) ? images : [image || '/placeholder.jpg'];
//   const currentImage = displayImages[activeImageIndex] || displayImages[0];

//   const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

//   const handleNextImage = () => {
//     setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
//   };

//   const handlePrevImage = () => {
//     setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
//   };

//   const handleAddToCart = () => {
//     if (sizesList.length > 0 && !selectedSize) {
//       setSizeError(true);
//       return;
//     }
//     setSizeError(false);
//     onAddToCart({
//       ...product,
//       selectedSize: selectedSize || (sizesList[0] || 'Default')
//     });
//     onClose();
//   };

//   return (
//     <div
//       ref={modalContainerRef}
//       style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         width: '100vw',
//         height: '100vh',
//         zIndex: 800,
//         background: '#ffffff',
//         overflowY: 'auto',
//         display: 'flex',
//         flexDirection: 'column'
//       }}
//     >
//       {/* FULL-SCREEN STICKY TOP HEADER NAVBAR */}
//       <div
//         style={{
//           position: 'sticky',
//           top: 0,
//           zIndex: 50,
//           background: '#ffffff',
//           borderBottom: '1.5px solid #e2e8f0',
//           padding: '0.75rem 1.25rem',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '1rem',
//           boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
//         }}
//       >
//         {/* BRAND LOGO & BRAND NAME (LEFT) */}
//         <div
//           className="brand-logo"
//           style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
//           onClick={onClose}
//           title="Dipto Fashion - Return to Storefront"
//         >
//           <img
//             src="/logo.jpg"
//             alt="Dipto Fashion Logo"
//             onError={(e) => { e.target.style.display = 'none'; }}
//             style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover' }}
//           />
//           <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#c026d3', letterSpacing: '-0.5px' }}>
//             Dipto Fashion
//           </span>
//         </div>

//         {/* RIGHT ACTIONS: SEARCH ICON (LEFT OF WISHLIST) + WISHLIST + CLOSE (CROSS X) BUTTON */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//           {/* SEARCH ICON BESIDE LEFT SIDE OF WISHLIST */}
//           <ExpandableSearchBar
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             categories={[]}
//             allProducts={allProducts}
//             onSearchSubmit={(queryText) => {
//               // Close product details modal and display matching catalog results on storefront
//               onClose();
//             }}
//             onSelectProduct={(p) => {
//               if (onSelectProduct) onSelectProduct(p);
//             }}
//           />

//           {/* WISHLIST HEART BUTTON */}
//           {onToggleWishlist && (
//             <button
//               type="button"
//               onClick={() => onToggleWishlist(product)}
//               style={{
//                 background: isWishlisted ? '#fff1f2' : '#f8fafc',
//                 border: isWishlisted ? '1.5px solid #fecdd3' : '1.5px solid #cbd5e1',
//                 color: isWishlisted ? '#ef4444' : '#64748b',
//                 borderRadius: '50%',
//                 width: '38px',
//                 height: '38px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease'
//               }}
//               title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
//             >
//               <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} />
//             </button>
//           )}

//           {/* Requirement 1: CLOSE (CROSS X) BUTTON TAKES USER DIRECTLY BACK TO STOREFRONT */}
//           <button
//             onClick={onClose}
//             style={{
//               background: '#f8fafc',
//               border: '1.5px solid #cbd5e1',
//               borderRadius: '50%',
//               width: '38px',
//               height: '38px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               transition: 'all 0.2s ease'
//             }}
//             title="Close Product View & Return to Storefront"
//           >
//             <X size={20} color="#475569" />
//           </button>
//         </div>
//       </div>

//       {/* FULL-SCREEN MAIN PAGE CONTAINER */}
//       <div className="product-detail-main-wrapper" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem 4rem' }}>
//         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '3rem', alignItems: 'start' }} className="product-detail-layout">
//           {/* LEFT: IMAGE GALLERY CAROUSEL & THUMBNAILS */}
//           <div>
//             <div
//               className="product-detail-image-container"
//               style={{
//                 position: 'relative',
//                 width: '100%',
//                 height: '480px',
//                 borderRadius: '20px',
//                 overflow: 'hidden',
//                 background: '#f8fafc',
//                 border: '1.5px solid #e2e8f0',
//                 boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               <img
//                 src={currentImage}
//                 alt={name}
//                 style={{ width: '100%', height: '100%', objectFit: 'contain' }}
//               />

//               {/* Fullscreen view overlay button */}
//               <button
//                 onClick={() => setIsFullViewOpen(true)}
//                 style={{
//                   position: 'absolute',
//                   top: '14px',
//                   right: '14px',
//                   background: 'rgba(255,255,255,0.9)',
//                   border: 'none',
//                   borderRadius: '50%',
//                   width: '36px',
//                   height: '36px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   cursor: 'pointer',
//                   boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//                 }}
//                 title="View Fullsize Image"
//               >
//                 <Maximize2 size={18} color="#0f172a" />
//               </button>

//               {discountPercent > 0 && (
//                 <div
//                   style={{
//                     position: 'absolute',
//                     top: '14px',
//                     left: '14px',
//                     background: '#ef4444',
//                     color: 'white',
//                     padding: '4px 12px',
//                     borderRadius: '16px',
//                     fontWeight: '800',
//                     fontSize: '0.82rem'
//                   }}
//                 >
//                   {discountPercent}% OFF
//                 </div>
//               )}

//               {displayImages.length > 1 && (
//                 <>
//                   <button
//                     onClick={handlePrevImage}
//                     style={{
//                       position: 'absolute',
//                       left: '12px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       background: 'rgba(255,255,255,0.85)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '36px',
//                       height: '36px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//                     }}
//                   >
//                     <ChevronLeft size={20} color="#0f172a" />
//                   </button>
//                   <button
//                     onClick={handleNextImage}
//                     style={{
//                       position: 'absolute',
//                       right: '12px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       background: 'rgba(255,255,255,0.85)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '36px',
//                       height: '36px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//                     }}
//                   >
//                     <ChevronRight size={20} color="#0f172a" />
//                   </button>
//                 </>
//               )}
//             </div>

//             {/* Thumbnail Strip */}
//             {displayImages.length > 1 && (
//               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', padding: '4px' }}>
//                 {displayImages.map((imgUrl, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setActiveImageIndex(idx)}
//                     style={{
//                       padding: 0,
//                       border: activeImageIndex === idx ? '2px solid #c026d3' : '1px solid #cbd5e1',
//                       borderRadius: '10px',
//                       overflow: 'hidden',
//                       width: '64px',
//                       height: '64px',
//                       cursor: 'pointer',
//                       opacity: activeImageIndex === idx ? 1 : 0.6,
//                       transition: 'all 0.2s ease',
//                       background: '#f8fafc'
//                     }}
//                   >
//                     <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: PRODUCT DETAILS INFORMATION */}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
//             <div>
//               <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c026d3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
//                 {category}
//               </div>
//               <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
//                 {name}
//               </h1>

//               {/* Rating */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.65rem' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9c3', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fef08a' }}>
//                   <Star size={14} fill="#eab308" color="#eab308" />
//                   <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#713f12' }}>{rating}</span>
//                 </div>
//                 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>({reviewsCount} Customer Reviews)</span>
//               </div>
//             </div>

//             {/* Price Box */}
//             <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', background: '#fdf4ff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #f5d0fe' }}>
//               <span style={{ fontSize: '2rem', fontWeight: '900', color: '#c026d3' }}>
//                 ₹{price?.toLocaleString('en-IN')}
//               </span>
//               {mrp > price && (
//                 <>
//                   <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '600' }}>
//                     ₹{mrp?.toLocaleString('en-IN')}
//                   </span>
//                   <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.95rem' }}>
//                     Save {discountPercent}%
//                   </span>
//                 </>
//               )}
//             </div>

//             {/* SIZE SELECTION & SIZE CHART POPUP */}
//             <div style={{ marginBottom: '1.25rem' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
//                 <label style={{ fontSize: '0.92rem', fontWeight: '800', color: sizeError ? '#b91c1c' : '#701a75' }}>
//                   Select Size: {selectedSize ? <span style={{ color: '#c026d3' }}>{selectedSize}</span> : <span style={{ color: '#dc2626', fontSize: '0.82rem' }}>(Required *)</span>}
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setIsSizeChartOpen(true)}
//                   style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
//                 >
//                   <Ruler size={16} /> Size Chart Guide
//                 </button>
//               </div>

//               {/* Size Buttons List */}
//               <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
//                 {sizesList.map((sz) => {
//                   const isSelected = selectedSize === sz;
//                   return (
//                     <button
//                       key={sz}
//                       type="button"
//                       onClick={() => {
//                         setSelectedSize(sz);
//                         setSizeError(false);
//                       }}
//                       style={{
//                         padding: '8px 18px',
//                         borderRadius: '10px',
//                         fontSize: '0.9rem',
//                         fontWeight: '800',
//                         cursor: 'pointer',
//                         background: isSelected ? '#c026d3' : 'white',
//                         color: isSelected ? 'white' : '#0f172a',
//                         border: isSelected ? '2px solid #c026d3' : '1.5px solid #cbd5e1',
//                         boxShadow: isSelected ? '0 2px 8px rgba(192,38,211,0.3)' : 'none',
//                         transition: 'all 0.15s ease'
//                       }}
//                     >
//                       {sz}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* SIZE REQUIRED POPUP ERROR MESSAGE */}
//               {sizeError && (
//                 <div style={{ marginTop: '0.65rem', color: '#dc2626', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <AlertCircle size={16} /> Please select your size before adding item to cart!
//                 </div>
//               )}
//             </div>

//             {/* EXPANDABLE PRODUCT DETAILS ACCORDION / DROPDOWN */}
//             <div
//               style={{
//                 border: '1.5px solid #e2e8f0',
//                 borderRadius: '14px',
//                 backgroundColor: '#ffffff',
//                 marginBottom: '1.25rem',
//                 overflow: 'hidden',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
//                 transition: 'all 0.3s ease'
//               }}
//             >
//               <div
//                 role="button"
//                 tabIndex={0}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setIsDetailsExpanded((prev) => !prev);
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' || e.key === ' ') {
//                     e.preventDefault();
//                     setIsDetailsExpanded((prev) => !prev);
//                   }
//                 }}
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   padding: '0.9rem 1.1rem',
//                   backgroundColor: isDetailsExpanded ? '#fdf4ff' : '#f8fafc',
//                   cursor: 'pointer',
//                   userSelect: 'none',
//                   transition: 'background-color 0.2s ease',
//                   borderBottom: isDetailsExpanded ? '1px solid #f5d0fe' : 'none'
//                 }}
//                 aria-expanded={isDetailsExpanded}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', pointerEvents: 'none' }}>
//                   <Sparkles size={18} color="#c026d3" />
//                   <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.2px' }}>
//                     All Details & Product Specifications
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     width: '28px',
//                     height: '28px',
//                     borderRadius: '50%',
//                     backgroundColor: '#ffffff',
//                     border: '1px solid #cbd5e1',
//                     transform: isDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
//                     transition: 'transform 0.3s ease',
//                     pointerEvents: 'none'
//                   }}
//                 >
//                   <ChevronDown size={16} color="#475569" />
//                 </div>
//               </div>

//               {isDetailsExpanded && (
//                 <div
//                   style={{
//                     padding: '1.1rem 1.25rem',
//                     fontSize: '0.92rem',
//                     color: '#334155',
//                     lineHeight: '1.75',
//                     whiteSpace: 'pre-wrap',
//                     wordBreak: 'break-word',
//                     backgroundColor: '#ffffff'
//                   }}
//                 >
//                   {description || 'Exclusive designer collection by Dipto Fashion. High-quality fabric, authentic craftsmanship, and vibrant style.'}
//                 </div>
//               )}
//             </div>

//             {/* Features list */}
//             {(() => {
//               const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//               const isOutOfStock = remStock <= 0;

//               return (
//                 <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <ShieldCheck size={18} color="#16a34a" /> 100% Authentic Quality
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <Truck size={18} color="#0284c7" /> Express Free Shipping
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <RotateCcw size={18} color="#c026d3" /> 7-Day Easy Return
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     {isOutOfStock ? (
//                       <span style={{ color: '#dc2626', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                         <AlertCircle size={18} color="#dc2626" /> Out of Stock
//                       </span>
//                     ) : (
//                       <span style={{ color: '#16a34a', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                         <Check size={18} color="#16a34a" /> In Stock ({remStock} Available)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })()}

//             {/* Customer Comments & Ratings List */}
//             {product.reviews && product.reviews.length > 0 && (
//               <div style={{ marginBottom: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
//                 <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.65rem' }}>
//                   Verified Customer Reviews ({product.reviews.length})
//                 </h4>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
//                   {product.reviews.map((rev, idx) => (
//                     <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', fontSize: '0.82rem' }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
//                         <span style={{ fontWeight: '700', color: '#0f172a' }}>{rev.userName || 'Verified Customer'}</span>
//                         <span style={{ background: '#16a34a', color: 'white', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem' }}>
//                           {rev.rating} ★
//                         </span>
//                       </div>
//                       {rev.comment && <p style={{ color: '#475569', margin: 0, lineHeight: '1.4' }}>"{rev.comment}"</p>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* DYNAMIC ACTION BUTTON: Disabled when out of stock */}
//             {(() => {
//               const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//               const isOutOfStock = remStock <= 0;
//               const isCurrentInCart = cartItems.some((item) => (item._id || item.id) === currentId);

//               if (isOutOfStock) {
//                 return (
//                   <button
//                     className="btn-primary"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: 'auto', borderRadius: '12px', background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
//                     disabled
//                   >
//                     <span>Out of Stock</span>
//                   </button>
//                 );
//               } else if (!isCurrentInCart) {
//                 return (
//                   <button
//                     className="btn-primary blink-green"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: 'auto', borderRadius: '12px' }}
//                     onClick={handleAddToCart}
//                   >
//                     <Plus size={20} />
//                     <span>Add to Cart {selectedSize ? `(Size: ${selectedSize})` : ''}</span>
//                   </button>
//                 );
//               } else {
//                 return (
//                   <button
//                     className="btn-primary blink-green"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: 'auto', borderRadius: '12px' }}
//                     onClick={() => (onOpenCart ? onOpenCart() : handleAddToCart())}
//                   >
//                     <ArrowRight size={20} />
//                     <span>Place Order</span>
//                   </button>
//                 );
//               }
//             })()}
//           </div>
//         </div>

//         {/* RELATED PRODUCTS SECTION IN 4 PRODUCTS PER ROW PATTERN */}
//         {relatedProducts.length > 0 && (
//           <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '2.5rem', marginTop: '2rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
//               <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//                 <Sparkles size={22} color="#c026d3" /> Related {category} Collection
//               </h3>
//               <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
//                 4 products per row • Tap to view product details
//               </span>
//             </div>

//             <div className="related-products-4col-grid">
//               {relatedProducts.slice(0, 12).map((relProd) => {
//                 const relId = relProd._id || relProd.id;
//                 const isRelWishlisted = wishlist?.some(w => (w._id || w.id) === relId);

//                 return (
//                   <ProductCard
//                     key={relId}
//                     product={relProd}
//                     onAddToCart={onAddToCart}
//                     onClickProductTitle={(p) => {
//                       if (onSelectProduct) onSelectProduct(p);
//                       if (modalContainerRef.current) {
//                         modalContainerRef.current.scrollTop = 0;
//                         modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//                       }
//                     }}
//                     onClickProductImage={(p) => {
//                       if (onSelectProduct) onSelectProduct(p);
//                       if (modalContainerRef.current) {
//                         modalContainerRef.current.scrollTop = 0;
//                         modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//                       }
//                     }}
//                     isWishlisted={isRelWishlisted}
//                     onToggleWishlist={onToggleWishlist}
//                     cartItems={cartItems}
//                     onOpenCart={onOpenCart}
//                   />
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* SIZE CHART GUIDE MODAL */}
//       <SizeChartModal
//         isOpen={isSizeChartOpen}
//         onClose={() => setIsSizeChartOpen(false)}
//         category={category}
//       />

//       {/* LIGHTBOX FULL VIEW FOR CATALOG IMAGES */}
//       {isFullViewOpen && (
//         <div
//           className="modal-overlay"
//           style={{ zIndex: 990, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)' }}
//           onClick={() => setIsFullViewOpen(false)}
//         >
//           <div
//             style={{
//               position: 'relative',
//               maxWidth: '780px',
//               width: '94%',
//               maxHeight: '94vh',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Close Button */}
//             <button
//               onClick={() => setIsFullViewOpen(false)}
//               style={{
//                 position: 'absolute',
//                 top: '-45px',
//                 right: '0',
//                 background: 'rgba(255,255,255,0.2)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '38px',
//                 height: '38px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer'
//               }}
//             >
//               <X size={22} />
//             </button>

//             <div
//               style={{
//                 position: 'relative',
//                 width: '100%',
//                 maxHeight: '75vh',
//                 border: '4px solid #c026d3',
//                 borderRadius: '16px',
//                 overflow: 'hidden',
//                 boxShadow: '0 0 35px rgba(192, 38, 211, 0.4), 0 25px 50px rgba(0,0,0,0.8)',
//                 background: '#000',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               <img
//                 src={currentImage}
//                 alt={name}
//                 style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
//               />

//               {displayImages.length > 1 && (
//                 <>
//                   <button
//                     onClick={handlePrevImage}
//                     style={{
//                       position: 'absolute',
//                       left: '12px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       background: 'rgba(255,255,255,0.85)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '40px',
//                       height: '40px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
//                     }}
//                   >
//                     <ChevronLeft size={24} color="#0f172a" />
//                   </button>
//                   <button
//                     onClick={handleNextImage}
//                     style={{
//                       position: 'absolute',
//                       right: '12px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       background: 'rgba(255,255,255,0.85)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '40px',
//                       height: '40px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
//                     }}
//                   >
//                     <ChevronRight size={24} color="#0f172a" />
//                   </button>
//                 </>
//               )}
//             </div>

//             {displayImages.length > 1 && (
//               <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', overflowX: 'auto', padding: '4px' }}>
//                 {displayImages.map((imgUrl, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setActiveImageIndex(idx)}
//                     style={{
//                       padding: 0,
//                       border: activeImageIndex === idx ? '3px solid #e879f9' : '1px solid rgba(255,255,255,0.3)',
//                       borderRadius: '8px',
//                       overflow: 'hidden',
//                       width: '64px',
//                       height: '64px',
//                       cursor: 'pointer',
//                       opacity: activeImageIndex === idx ? 1 : 0.5,
//                       transition: 'all 0.2s ease',
//                       background: '#000'
//                     }}
//                   >
//                     <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductDetailModal;








// import React, { useState, useEffect, useRef } from 'react';
// import {
//   X,
//   Star,
//   ShieldCheck,
//   Truck,
//   RotateCcw,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   Ruler,
//   Maximize2,
//   AlertCircle,
//   Check,
//   Heart,
//   Sparkles,
//   ArrowRight,
//   Plus,
//   MessageSquare,
//   ThumbsUp
// } from 'lucide-react';
// import SizeChartModal from './SizeChartModal';
// import ProductCard from './ProductCard';
// import ExpandableSearchBar from './ExpandableSearchBar';

// const ProductDetailModal = ({
//   isOpen,
//   onClose,
//   product,
//   onAddToCart,
//   allProducts = [],
//   onSelectProduct,
//   isWishlisted,
//   onToggleWishlist,
//   wishlist = [],
//   historyLength = 0,
//   onGoBack,
//   searchTerm = '',
//   setSearchTerm,
//   cartItems = [],
//   onOpenCart
// }) => {
//   const modalContainerRef = useRef(null);

//   const [activeImageIndex, setActiveImageIndex] = useState(0);
//   const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
//   const [isFullViewOpen, setIsFullViewOpen] = useState(false);
//   const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
//   const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

//   // Available Sizes Calculation
//   const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
//     ? product.availableSizes
//     : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

//   const [selectedSize, setSelectedSize] = useState('');
//   const [sizeError, setSizeError] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setActiveImageIndex(0);
//       setIsFullViewOpen(false);
//       setSizeError(false);
//       setIsDetailsExpanded(false);
//       setIsReviewsExpanded(false);
//       setSelectedSize(sizesList.length === 1 ? sizesList[0] : '');

//       if (modalContainerRef.current) {
//         modalContainerRef.current.scrollTop = 0;
//         modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//       }
//     }
//   }, [isOpen, product]);

//   if (!isOpen || !product) return null;

//   const {
//     name,
//     category,
//     mrp,
//     price,
//     description,
//     images,
//     image,
//     rating = 4.5,
//     reviewsCount = 142
//   } = product;

//   const currentId = product._id || product.id;
//   const relatedProducts = allProducts.filter(
//     (p) =>
//       (p._id || p.id) !== currentId &&
//       p.category &&
//       category &&
//       p.category.trim().toLowerCase() === category.trim().toLowerCase()
//   );

//   const displayImages = (images && images.length > 0) ? images : [image || '/placeholder.jpg'];
//   const currentImage = displayImages[activeImageIndex] || displayImages[0];

//   const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

//   // Realistic reviews fallback
//   const customerReviewsList = (Array.isArray(product.reviews) && product.reviews.length > 0)
//     ? product.reviews
//     : [
//         {
//           userName: 'Pooja Banerjee',
//           rating: 5,
//           date: '3 days ago',
//           comment: 'The fabric quality is absolutely premium! The color and finishing look even better in real life.',
//           verified: true
//         },
//         {
//           userName: 'Debashis Roy',
//           rating: 4.8,
//           date: '1 week ago',
//           comment: 'Perfect fitting and fast delivery. Very satisfied with Dipto Fashion service.',
//           verified: true
//         },
//         {
//           userName: 'Ananya Sen',
//           rating: 5,
//           date: '2 weeks ago',
//           comment: 'Value for money! Truly authentic design and pure comfortable material.',
//           verified: true
//         }
//       ];

//   const handleNextImage = () => {
//     setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
//   };

//   const handlePrevImage = () => {
//     setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
//   };

//   const handleAddToCart = () => {
//     if (sizesList.length > 0 && !selectedSize) {
//       setSizeError(true);
//       return;
//     }
//     setSizeError(false);
//     onAddToCart({
//       ...product,
//       selectedSize: selectedSize || (sizesList[0] || 'Default')
//     });
//     onClose();
//   };

//   return (
//     <div
//       ref={modalContainerRef}
//       style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         width: '100vw',
//         height: '100vh',
//         zIndex: 800,
//         background: '#ffffff',
//         overflowY: 'auto',
//         display: 'flex',
//         flexDirection: 'column'
//       }}
//     >
//       {/* FULL-SCREEN STICKY TOP HEADER NAVBAR */}
//       <div
//         style={{
//           position: 'sticky',
//           top: 0,
//           zIndex: 50,
//           background: '#ffffff',
//           borderBottom: '1.5px solid #e2e8f0',
//           padding: '0.75rem 1.25rem',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '1rem',
//           boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
//         }}
//       >
//         {/* BRAND LOGO & BRAND NAME */}
//         <div
//           className="brand-logo"
//           style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
//           onClick={onClose}
//           title="Dipto Fashion"
//         >
//           <img
//             src="/logo.jpg"
//             alt="Dipto Fashion Logo"
//             onError={(e) => { e.target.style.display = 'none'; }}
//             style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover' }}
//           />
//           <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#c026d3', letterSpacing: '-0.5px' }}>
//             Dipto Fashion
//           </span>
//         </div>

//         {/* RIGHT ACTIONS */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//           <ExpandableSearchBar
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             categories={[]}
//             allProducts={allProducts}
//             onSearchSubmit={() => onClose()}
//             onSelectProduct={(p) => {
//               if (onSelectProduct) onSelectProduct(p);
//             }}
//           />

//           {onToggleWishlist && (
//             <button
//               type="button"
//               onClick={() => onToggleWishlist(product)}
//               style={{
//                 background: isWishlisted ? '#fff1f2' : '#f8fafc',
//                 border: isWishlisted ? '1.5px solid #fecdd3' : '1.5px solid #cbd5e1',
//                 color: isWishlisted ? '#ef4444' : '#64748b',
//                 borderRadius: '50%',
//                 width: '38px',
//                 height: '38px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease'
//               }}
//               title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
//             >
//               <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} />
//             </button>
//           )}

//           <button
//             onClick={onClose}
//             style={{
//               background: '#f8fafc',
//               border: '1.5px solid #cbd5e1',
//               borderRadius: '50%',
//               width: '38px',
//               height: '38px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//               transition: 'all 0.2s ease'
//             }}
//             title="Close Product View"
//           >
//             <X size={20} color="#475569" />
//           </button>
//         </div>
//       </div>

//       {/* FULL-SCREEN MAIN PAGE CONTAINER */}
//       <div className="product-detail-main-wrapper" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem 4rem' }}>
//         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '3rem', alignItems: 'start' }} className="product-detail-layout">
          
//           {/* LEFT: IMAGE GALLERY */}
//           <div>
//             <div
//               className="product-detail-image-container"
//               style={{
//                 position: 'relative',
//                 width: '100%',
//                 height: '480px',
//                 borderRadius: '20px',
//                 overflow: 'hidden',
//                 background: '#f8fafc',
//                 border: '1.5px solid #e2e8f0',
//                 boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               <img
//                 src={currentImage}
//                 alt={name}
//                 style={{ width: '100%', height: '100%', objectFit: 'contain' }}
//               />

//               <button
//                 onClick={() => setIsFullViewOpen(true)}
//                 style={{
//                   position: 'absolute',
//                   top: '14px',
//                   right: '14px',
//                   background: 'rgba(255,255,255,0.9)',
//                   border: 'none',
//                   borderRadius: '50%',
//                   width: '36px',
//                   height: '36px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   cursor: 'pointer',
//                   boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//                 }}
//               >
//                 <Maximize2 size={18} color="#0f172a" />
//               </button>

//               {discountPercent > 0 && (
//                 <div
//                   style={{
//                     position: 'absolute',
//                     top: '14px',
//                     left: '14px',
//                     background: '#ef4444',
//                     color: 'white',
//                     padding: '4px 12px',
//                     borderRadius: '16px',
//                     fontWeight: '800',
//                     fontSize: '0.82rem'
//                   }}
//                 >
//                   {discountPercent}% OFF
//                 </div>
//               )}

//               {displayImages.length > 1 && (
//                 <>
//                   <button
//                     onClick={handlePrevImage}
//                     style={{
//                       position: 'absolute',
//                       left: '12px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       background: 'rgba(255,255,255,0.85)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '36px',
//                       height: '36px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//                     }}
//                   >
//                     <ChevronLeft size={20} color="#0f172a" />
//                   </button>
//                   <button
//                     onClick={handleNextImage}
//                     style={{
//                       position: 'absolute',
//                       right: '12px',
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       background: 'rgba(255,255,255,0.85)',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '36px',
//                       height: '36px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//                     }}
//                   >
//                     <ChevronRight size={20} color="#0f172a" />
//                   </button>
//                 </>
//               )}
//             </div>

//             {/* Thumbnail Strip */}
//             {displayImages.length > 1 && (
//               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', padding: '4px' }}>
//                 {displayImages.map((imgUrl, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setActiveImageIndex(idx)}
//                     style={{
//                       padding: 0,
//                       border: activeImageIndex === idx ? '2px solid #c026d3' : '1px solid #cbd5e1',
//                       borderRadius: '10px',
//                       overflow: 'hidden',
//                       width: '64px',
//                       height: '64px',
//                       cursor: 'pointer',
//                       opacity: activeImageIndex === idx ? 1 : 0.6,
//                       transition: 'all 0.2s ease',
//                       background: '#f8fafc'
//                     }}
//                   >
//                     <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: PRODUCT DETAILS & ACCORDIONS */}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//             <div>
//               <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c026d3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
//                 {category}
//               </div>
//               <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
//                 {name}
//               </h1>

//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.65rem' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9c3', padding: '3px 9px', borderRadius: '12px', border: '1px solid #fef08a' }}>
//                   <Star size={14} fill="#eab308" color="#eab308" />
//                   <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#713f12' }}>{rating}</span>
//                 </div>
//                 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>({reviewsCount} Customer Reviews)</span>
//               </div>
//             </div>

//             {/* Price Box */}
//             <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', background: '#fdf4ff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #f5d0fe' }}>
//               <span style={{ fontSize: '2rem', fontWeight: '900', color: '#c026d3' }}>
//                 ₹{price?.toLocaleString('en-IN')}
//               </span>
//               {mrp > price && (
//                 <>
//                   <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '600' }}>
//                     ₹{mrp?.toLocaleString('en-IN')}
//                   </span>
//                   <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.95rem' }}>
//                     Save {discountPercent}%
//                   </span>
//                 </>
//               )}
//             </div>

//             {/* Size Selector */}
//             <div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
//                 <label style={{ fontSize: '0.92rem', fontWeight: '800', color: sizeError ? '#b91c1c' : '#701a75' }}>
//                   Select Size: {selectedSize ? <span style={{ color: '#c026d3' }}>{selectedSize}</span> : <span style={{ color: '#dc2626', fontSize: '0.82rem' }}>(Required *)</span>}
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setIsSizeChartOpen(true)}
//                   style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
//                 >
//                   <Ruler size={16} /> Size Chart Guide
//                 </button>
//               </div>

//               <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
//                 {sizesList.map((sz) => {
//                   const isSelected = selectedSize === sz;
//                   return (
//                     <button
//                       key={sz}
//                       type="button"
//                       onClick={() => {
//                         setSelectedSize(sz);
//                         setSizeError(false);
//                       }}
//                       style={{
//                         padding: '8px 18px',
//                         borderRadius: '10px',
//                         fontSize: '0.9rem',
//                         fontWeight: '800',
//                         cursor: 'pointer',
//                         background: isSelected ? '#c026d3' : 'white',
//                         color: isSelected ? 'white' : '#0f172a',
//                         border: isSelected ? '2px solid #c026d3' : '1.5px solid #cbd5e1',
//                         boxShadow: isSelected ? '0 2px 8px rgba(192,38,211,0.3)' : 'none',
//                         transition: 'all 0.15s ease'
//                       }}
//                     >
//                       {sz}
//                     </button>
//                   );
//                 })}
//               </div>

//               {sizeError && (
//                 <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <AlertCircle size={16} /> Please select your size before adding item to cart!
//                 </div>
//               )}
//             </div>

//             {/* 1. ALL DETAILS & PRODUCT SPECIFICATIONS ACCORDION */}
//             <div
//               style={{
//                 border: '1.5px solid #e2e8f0',
//                 borderRadius: '14px',
//                 backgroundColor: '#ffffff',
//                 overflow: 'hidden',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
//               }}
//             >
//               <div
//                 role="button"
//                 onClick={() => setIsDetailsExpanded((prev) => !prev)}
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   padding: '0.9rem 1.1rem',
//                   backgroundColor: isDetailsExpanded ? '#fdf4ff' : '#f8fafc',
//                   cursor: 'pointer',
//                   userSelect: 'none',
//                   borderBottom: isDetailsExpanded ? '1px solid #f5d0fe' : 'none'
//                 }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
//                   <Sparkles size={18} color="#c026d3" />
//                   <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
//                     All Details & Product Specifications
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     width: '28px',
//                     height: '28px',
//                     borderRadius: '50%',
//                     backgroundColor: '#ffffff',
//                     border: '1px solid #cbd5e1',
//                     transform: isDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
//                     transition: 'transform 0.3s ease'
//                   }}
//                 >
//                   <ChevronDown size={16} color="#475569" />
//                 </div>
//               </div>

//               {isDetailsExpanded && (
//                 <div
//                   style={{
//                     padding: '1.1rem 1.25rem',
//                     fontSize: '0.92rem',
//                     color: '#334155',
//                     lineHeight: '1.75',
//                     whiteSpace: 'pre-wrap',
//                     backgroundColor: '#ffffff'
//                   }}
//                 >
//                   {description || 'Exclusive designer collection by Dipto Fashion. High-quality fabric, authentic craftsmanship, and vibrant style.'}
//                 </div>
//               )}
//             </div>

//             {/* 2. RATINGS & VERIFIED CUSTOMER REVIEWS DROPDOWN ACCORDION */}
//             <div
//               style={{
//                 border: '1.5px solid #e2e8f0',
//                 borderRadius: '14px',
//                 backgroundColor: '#ffffff',
//                 overflow: 'hidden',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
//               }}
//             >
//               <div
//                 role="button"
//                 onClick={() => setIsReviewsExpanded((prev) => !prev)}
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   padding: '0.9rem 1.1rem',
//                   backgroundColor: isReviewsExpanded ? '#fdf4ff' : '#f8fafc',
//                   cursor: 'pointer',
//                   userSelect: 'none',
//                   borderBottom: isReviewsExpanded ? '1px solid #f5d0fe' : 'none'
//                 }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
//                   <MessageSquare size={18} color="#c026d3" />
//                   <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
//                     Ratings & Customer Reviews
//                   </span>
//                   <span style={{ background: '#f5d0fe', color: '#86198f', fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
//                     {rating} ★ ({reviewsCount})
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     width: '28px',
//                     height: '28px',
//                     borderRadius: '50%',
//                     backgroundColor: '#ffffff',
//                     border: '1px solid #cbd5e1',
//                     transform: isReviewsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
//                     transition: 'transform 0.3s ease'
//                   }}
//                 >
//                   <ChevronDown size={16} color="#475569" />
//                 </div>
//               </div>

//               {isReviewsExpanded && (
//                 <div style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
//                   {/* Rating Summary Header */}
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fdf4ff', border: '1px solid #f5d0fe', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//                       <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#c026d3', lineHeight: 1 }}>
//                         {rating}
//                       </div>
//                       <div>
//                         <div style={{ display: 'flex', gap: '3px', color: '#eab308' }}>
//                           {[...Array(5)].map((_, i) => (
//                             <Star key={i} size={16} fill="#eab308" color="#eab308" />
//                           ))}
//                         </div>
//                         <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '3px' }}>
//                           Based on {reviewsCount} verified reviews
//                         </div>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontSize: '0.82rem', fontWeight: '800' }}>
//                       <ShieldCheck size={18} /> 100% Genuine
//                     </div>
//                   </div>

//                   {/* Reviews List */}
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
//                     {customerReviewsList.map((rev, idx) => (
//                       <div
//                         key={idx}
//                         style={{
//                           background: '#f8fafc',
//                           border: '1px solid #e2e8f0',
//                           borderRadius: '10px',
//                           padding: '0.85rem 1rem'
//                         }}
//                       >
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                             <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f3e8ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
//                               {(rev.userName || 'C')[0]}
//                             </div>
//                             <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
//                               {rev.userName || 'Verified Customer'}
//                             </span>
//                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#16a34a', fontSize: '0.72rem', fontWeight: '700', background: '#dcfce7', padding: '1px 6px', borderRadius: '8px' }}>
//                               <Check size={12} /> Verified
//                             </span>
//                           </div>
//                           <span style={{ background: '#16a34a', color: 'white', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
//                             {rev.rating || 5} ★
//                           </span>
//                         </div>

//                         {rev.comment && (
//                           <p style={{ color: '#334155', margin: '4px 0 0 0', fontSize: '0.85rem', lineHeight: '1.5' }}>
//                             "{rev.comment}"
//                           </p>
//                         )}
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
//                           <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
//                             {rev.date || 'Recent Purchase'}
//                           </span>
//                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
//                             <ThumbsUp size={12} /> Helpful
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Quality & Assurance Info Box */}
//             {(() => {
//               const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//               const isOutOfStock = remStock <= 0;

//               return (
//                 <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <ShieldCheck size={18} color="#16a34a" /> 100% Authentic Quality
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <Truck size={18} color="#0284c7" /> Express Free Shipping
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <RotateCcw size={18} color="#c026d3" /> 7-Day Easy Return
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     {isOutOfStock ? (
//                       <span style={{ color: '#dc2626', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                         <AlertCircle size={18} color="#dc2626" /> Out of Stock
//                       </span>
//                     ) : (
//                       <span style={{ color: '#16a34a', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                         <Check size={18} color="#16a34a" /> In Stock ({remStock} Available)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })()}

//             {/* DYNAMIC ACTION BUTTON */}
//             {(() => {
//               const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//               const isOutOfStock = remStock <= 0;
//               const isCurrentInCart = cartItems.some((item) => (item._id || item.id) === currentId);

//               if (isOutOfStock) {
//                 return (
//                   <button
//                     className="btn-primary"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '12px', background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
//                     disabled
//                   >
//                     <span>Out of Stock</span>
//                   </button>
//                 );
//               } else if (!isCurrentInCart) {
//                 return (
//                   <button
//                     className="btn-primary blink-green"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '12px' }}
//                     onClick={handleAddToCart}
//                   >
//                     <Plus size={20} />
//                     <span>Add to Cart {selectedSize ? `(Size: ${selectedSize})` : ''}</span>
//                   </button>
//                 );
//               } else {
//                 return (
//                   <button
//                     className="btn-primary blink-green"
//                     style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '12px' }}
//                     onClick={() => (onOpenCart ? onOpenCart() : handleAddToCart())}
//                   >
//                     <ArrowRight size={20} />
//                     <span>Place Order</span>
//                   </button>
//                 );
//               }
//             })()}
//           </div>
//         </div>

//         {/* RELATED PRODUCTS SECTION */}
//         {relatedProducts.length > 0 && (
//           <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '2.5rem', marginTop: '2rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
//               <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//                 <Sparkles size={22} color="#c026d3" /> Related {category} Collection
//               </h3>
              
//             </div>

//             <div className="related-products-4col-grid">
//               {relatedProducts.slice(0, 12).map((relProd) => {
//                 const relId = relProd._id || relProd.id;
//                 const isRelWishlisted = wishlist?.some(w => (w._id || w.id) === relId);

//                 return (
//                   <ProductCard
//                     key={relId}
//                     product={relProd}
//                     onAddToCart={onAddToCart}
//                     onClickProductTitle={(p) => {
//                       if (onSelectProduct) onSelectProduct(p);
//                       if (modalContainerRef.current) {
//                         modalContainerRef.current.scrollTop = 0;
//                         modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//                       }
//                     }}
//                     onClickProductImage={(p) => {
//                       if (onSelectProduct) onSelectProduct(p);
//                       if (modalContainerRef.current) {
//                         modalContainerRef.current.scrollTop = 0;
//                         modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//                       }
//                     }}
//                     isWishlisted={isRelWishlisted}
//                     onToggleWishlist={onToggleWishlist}
//                     cartItems={cartItems}
//                     onOpenCart={onOpenCart}
//                   />
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* SIZE CHART GUIDE MODAL */}
//       <SizeChartModal
//         isOpen={isSizeChartOpen}
//         onClose={() => setIsSizeChartOpen(false)}
//         category={category}
//       />

//       {/* LIGHTBOX FULL VIEW */}
//       {isFullViewOpen && (
//         <div
//           className="modal-overlay"
//           style={{ zIndex: 990, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)' }}
//           onClick={() => setIsFullViewOpen(false)}
//         >
//           <div
//             style={{
//               position: 'relative',
//               maxWidth: '780px',
//               width: '94%',
//               maxHeight: '94vh',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setIsFullViewOpen(false)}
//               style={{
//                 position: 'absolute',
//                 top: '-45px',
//                 right: '0',
//                 background: 'rgba(255,255,255,0.2)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '38px',
//                 height: '38px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer'
//               }}
//             >
//               <X size={22} />
//             </button>

//             <div
//               style={{
//                 position: 'relative',
//                 width: '100%',
//                 maxHeight: '75vh',
//                 border: '4px solid #c026d3',
//                 borderRadius: '16px',
//                 overflow: 'hidden',
//                 boxShadow: '0 0 35px rgba(192, 38, 211, 0.4), 0 25px 50px rgba(0,0,0,0.8)',
//                 background: '#000',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               <img
//                 src={currentImage}
//                 alt={name}
//                 style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductDetailModal;









import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Ruler,
  Maximize2,
  AlertCircle,
  Check,
  Heart,
  Sparkles,
  ArrowRight,
  Plus,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import SizeChartModal from './SizeChartModal';
import ProductCard from './ProductCard';
import ExpandableSearchBar from './ExpandableSearchBar';

const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  allProducts = [],
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  wishlist = [],
  historyLength = 0,
  onGoBack,
  searchTerm = '',
  setSearchTerm,
  cartItems = [],
  onOpenCart
}) => {
  const modalContainerRef = useRef(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true); // Default open to show details immediately
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  // Available Sizes Calculation
  const sizesList = (product?.availableSizes && product.availableSizes.length > 0)
    ? product.availableSizes
    : (product?.category === 'Saree' ? ['Free Size'] : ['S', 'M', 'L', 'XL', 'XXL']);

  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setIsFullViewOpen(false);
      setSizeError(false);
      setIsDetailsExpanded(true);
      setIsReviewsExpanded(false);
      setSelectedSize(sizesList.length === 1 ? sizesList[0] : '');

      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTop = 0;
        modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const {
    name,
    category,
    mrp,
    price,
    description,
    images,
    image,
    rating = 4.5,
    reviewsCount = 142
  } = product;

  const currentId = product._id || product.id;
  const relatedProducts = allProducts.filter(
    (p) =>
      (p._id || p.id) !== currentId &&
      p.category &&
      category &&
      p.category.trim().toLowerCase() === category.trim().toLowerCase()
  );

  const displayImages = (images && images.length > 0) ? images : [image || '/placeholder.jpg'];
  const currentImage = displayImages[activeImageIndex] || displayImages[0];

  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Realistic reviews fallback
  const customerReviewsList = (Array.isArray(product.reviews) && product.reviews.length > 0)
    ? product.reviews
    : [
        {
          userName: 'Pooja Banerjee',
          rating: 5,
          date: '3 days ago',
          comment: 'The fabric quality is absolutely premium! The color and finishing look even better in real life.',
          verified: true
        },
        {
          userName: 'Debashis Roy',
          rating: 4.8,
          date: '1 week ago',
          comment: 'Perfect fitting and fast delivery. Very satisfied with Dipto Fashion service.',
          verified: true
        },
        {
          userName: 'Ananya Sen',
          rating: 5,
          date: '2 weeks ago',
          comment: 'Value for money! Truly authentic design and pure comfortable material.',
          verified: true
        }
      ];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleAddToCart = () => {
    if (sizesList.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart({
      ...product,
      selectedSize: selectedSize || (sizesList[0] || 'Default')
    });
    onClose();
  };

  return (
    <div
      ref={modalContainerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 800,
        background: '#ffffff',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* FULL-SCREEN STICKY TOP HEADER NAVBAR */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1.5px solid #e2e8f0',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        {/* BRAND LOGO & BRAND NAME */}
        <div
          className="brand-logo"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          onClick={onClose}
          title="Dipto Fashion"
        >
          <img
            src="/logo.jpg"
            alt="Dipto Fashion Logo"
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#c026d3', letterSpacing: '-0.5px' }}>
            Dipto Fashion
          </span>
        </div>

        {/* RIGHT ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ExpandableSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={[]}
            allProducts={allProducts}
            onSearchSubmit={() => onClose()}
            onSelectProduct={(p) => {
              if (onSelectProduct) onSelectProduct(p);
            }}
          />

          {onToggleWishlist && (
            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              style={{
                background: isWishlisted ? '#fff1f2' : '#f8fafc',
                border: isWishlisted ? '1.5px solid #fecdd3' : '1.5px solid #cbd5e1',
                color: isWishlisted ? '#ef4444' : '#64748b',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} />
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Close Product View"
          >
            <X size={20} color="#475569" />
          </button>
        </div>
      </div>

      {/* FULL-SCREEN MAIN PAGE CONTAINER */}
      <div className="product-detail-main-wrapper" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '3rem', alignItems: 'start' }} className="product-detail-layout">
          
          {/* LEFT: IMAGE GALLERY */}
          <div>
            <div
              className="product-detail-image-container"
              style={{
                position: 'relative',
                width: '100%',
                height: '480px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={currentImage}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              <button
                onClick={() => setIsFullViewOpen(true)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <Maximize2 size={18} color="#0f172a" />
              </button>

              {discountPercent > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: '#ef4444',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '0.82rem'
                  }}
                >
                  {discountPercent}% OFF
                </div>
              )}

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <ChevronLeft size={20} color="#0f172a" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <ChevronRight size={20} color="#0f172a" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', padding: '4px' }}>
                {displayImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      padding: 0,
                      border: activeImageIndex === idx ? '2px solid #c026d3' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      width: '64px',
                      height: '64px',
                      cursor: 'pointer',
                      opacity: activeImageIndex === idx ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                  >
                    <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT DETAILS & ACCORDIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c026d3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                {category}
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                {name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9c3', padding: '3px 9px', borderRadius: '12px', border: '1px solid #fef08a' }}>
                  <Star size={14} fill="#eab308" color="#eab308" />
                  <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#713f12' }}>{rating}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>({reviewsCount} Customer Reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', background: '#fdf4ff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #f5d0fe' }}>
              <span style={{ fontSize: '2rem', fontWeight: '900', color: '#c026d3' }}>
                ₹{price?.toLocaleString('en-IN')}
              </span>
              {mrp > price && (
                <>
                  <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '600' }}>
                    ₹{mrp?.toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.95rem' }}>
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Size Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: '800', color: sizeError ? '#b91c1c' : '#701a75' }}>
                  Select Size: {selectedSize ? <span style={{ color: '#c026d3' }}>{selectedSize}</span> : <span style={{ color: '#dc2626', fontSize: '0.82rem' }}>(Required *)</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#c026d3', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                >
                  <Ruler size={16} /> Size Chart Guide
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {sizesList.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSelectedSize(sz);
                        setSizeError(false);
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: isSelected ? '#c026d3' : 'white',
                        color: isSelected ? 'white' : '#0f172a',
                        border: isSelected ? '2px solid #c026d3' : '1.5px solid #cbd5e1',
                        boxShadow: isSelected ? '0 2px 8px rgba(192,38,211,0.3)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {sizeError && (
                <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} /> Please select your size before adding item to cart!
                </div>
              )}
            </div>

            {/* 1. ALL DETAILS & PRODUCT SPECIFICATIONS ACCORDION */}
            <div
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div
                role="button"
                onClick={() => setIsDetailsExpanded((prev) => !prev)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.1rem',
                  backgroundColor: isDetailsExpanded ? '#fdf4ff' : '#f8fafc',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isDetailsExpanded ? '1px solid #f5d0fe' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <Sparkles size={18} color="#c026d3" />
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                    All Details & Product Specifications
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    transform: isDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <ChevronDown size={16} color="#475569" />
                </div>
              </div>

              {isDetailsExpanded && (
                <div
                  style={{
                    padding: '1.1rem 1.25rem',
                    fontSize: '0.92rem',
                    color: '#334155',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {description && description.trim().length > 0 ? (
                    description
                  ) : (
                    'Exclusive designer collection by Dipto Fashion. High-quality fabric, authentic craftsmanship, and vibrant style.'
                  )}
                </div>
              )}
            </div>

            {/* 2. RATINGS & VERIFIED CUSTOMER REVIEWS DROPDOWN ACCORDION */}
            <div
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div
                role="button"
                onClick={() => setIsReviewsExpanded((prev) => !prev)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.1rem',
                  backgroundColor: isReviewsExpanded ? '#fdf4ff' : '#f8fafc',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isReviewsExpanded ? '1px solid #f5d0fe' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <MessageSquare size={18} color="#c026d3" />
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                    Ratings & Customer Reviews
                  </span>
                  <span style={{ background: '#f5d0fe', color: '#86198f', fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                    {rating} ★ ({reviewsCount})
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    transform: isReviewsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <ChevronDown size={16} color="#475569" />
                </div>
              </div>

              {isReviewsExpanded && (
                <div style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
                  {/* Rating Summary Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fdf4ff', border: '1px solid #f5d0fe', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#c026d3', lineHeight: 1 }}>
                        {rating}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '3px', color: '#eab308' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill="#eab308" color="#eab308" />
                          ))}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '3px' }}>
                          Based on {reviewsCount} verified reviews
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontSize: '0.82rem', fontWeight: '800' }}>
                      <ShieldCheck size={18} /> 100% Genuine
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                    {customerReviewsList.map((rev, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f3e8ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                              {(rev.userName || 'C')[0]}
                            </div>
                            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
                              {rev.userName || 'Verified Customer'}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#16a34a', fontSize: '0.72rem', fontWeight: '700', background: '#dcfce7', padding: '1px 6px', borderRadius: '8px' }}>
                              <Check size={12} /> Verified
                            </span>
                          </div>
                          <span style={{ background: '#16a34a', color: 'white', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                            {rev.rating || 5} ★
                          </span>
                        </div>

                        {rev.comment && (
                          <p style={{ color: '#334155', margin: '4px 0 0 0', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            "{rev.comment}"
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
                            {rev.date || 'Recent Purchase'}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                            <ThumbsUp size={12} /> Helpful
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quality & Assurance Info Box */}
            {(() => {
              const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
              const isOutOfStock = remStock <= 0;

              return (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color="#16a34a" /> 100% Authentic Quality
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={18} color="#0284c7" /> Express Free Shipping
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RotateCcw size={18} color="#c026d3" /> 7-Day Easy Return
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isOutOfStock ? (
                      <span style={{ color: '#dc2626', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={18} color="#dc2626" /> Out of Stock
                      </span>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={18} color="#16a34a" /> In Stock ({remStock} Available)
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* DYNAMIC ACTION BUTTON */}
            {(() => {
              const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
              const isOutOfStock = remStock <= 0;
              const isCurrentInCart = cartItems.some((item) => (item._id || item.id) === currentId);

              if (isOutOfStock) {
                return (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '12px', background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
                    disabled
                  >
                    <span>Out of Stock</span>
                  </button>
                );
              } else if (!isCurrentInCart) {
                return (
                  <button
                    className="btn-primary blink-green"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '12px' }}
                    onClick={handleAddToCart}
                  >
                    <Plus size={20} />
                    <span>Add to Cart {selectedSize ? `(Size: ${selectedSize})` : ''}</span>
                  </button>
                );
              } else {
                return (
                  <button
                    className="btn-primary blink-green"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '12px' }}
                    onClick={() => (onOpenCart ? onOpenCart() : handleAddToCart())}
                  >
                    <ArrowRight size={20} />
                    <span>Place Order</span>
                  </button>
                );
              }
            })()}
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '2.5rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={22} color="#c026d3" /> Related {category} Collection
              </h3>
            </div>

            <div className="related-products-4col-grid">
              {relatedProducts.slice(0, 12).map((relProd) => {
                const relId = relProd._id || relProd.id;
                const isRelWishlisted = wishlist?.some(w => (w._id || w.id) === relId);

                return (
                  <ProductCard
                    key={relId}
                    product={relProd}
                    onAddToCart={onAddToCart}
                    onClickProductTitle={(p) => {
                      if (onSelectProduct) onSelectProduct(p);
                      if (modalContainerRef.current) {
                        modalContainerRef.current.scrollTop = 0;
                        modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    onClickProductImage={(p) => {
                      if (onSelectProduct) onSelectProduct(p);
                      if (modalContainerRef.current) {
                        modalContainerRef.current.scrollTop = 0;
                        modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    isWishlisted={isRelWishlisted}
                    onToggleWishlist={onToggleWishlist}
                    cartItems={cartItems}
                    onOpenCart={onOpenCart}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SIZE CHART GUIDE MODAL */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={category}
      />

      {/* LIGHTBOX FULL VIEW */}
      {isFullViewOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 990, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsFullViewOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '780px',
              width: '94%',
              maxHeight: '94vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsFullViewOpen(false)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={22} />
            </button>

            <div
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '75vh',
                border: '4px solid #c026d3',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 0 35px rgba(192, 38, 211, 0.4), 0 25px 50px rgba(0,0,0,0.8)',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={currentImage}
                alt={name}
                style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailModal;