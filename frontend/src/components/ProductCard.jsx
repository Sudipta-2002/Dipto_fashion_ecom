// import React from 'react';
// import { ShoppingCart, Star, Eye, Heart, ArrowRight, Plus } from 'lucide-react';

// const ProductCard = ({
//   product,
//   onAddToCart,
//   onClickProductTitle,
//   onClickProductImage,
//   isWishlisted,
//   onToggleWishlist,
//   cartItems = [],
//   onOpenCart
// }) => {
//   const { name, category, mrp, price, images, image, description, rating = 4.7, reviewsCount = 184, quantity } = product;

//   // Use primary image
//   const displayImage = images && images.length > 0 ? images[0] : image;

//   // Calculate discount %
//   const discountPercent = Math.round(((mrp - price) / mrp) * 100);

//   // Check if product is currently in cart
//   const productId = product._id || product.id;
//   const isInCart = cartItems.some((item) => (item._id || item.id) === productId);
//   const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
//   const isOutOfStock = remStock <= 0;

//   return (
//     <div className="product-card" style={{ position: 'relative', opacity: isOutOfStock ? 0.82 : 1 }}>
//       {/* WISHLIST HEART BUTTON AT TOP RIGHT */}
//       {onToggleWishlist && (
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             onToggleWishlist(product);
//           }}
//           style={{
//             position: 'absolute',
//             top: '10px',
//             right: '10px',
//             background: 'rgba(255, 255, 255, 0.92)',
//             backdropFilter: 'blur(4px)',
//             border: 'none',
//             borderRadius: '50%',
//             width: '32px',
//             height: '32px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             cursor: 'pointer',
//             boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
//             zIndex: 15,
//             transition: 'all 0.2s ease'
//           }}
//           title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
//         >
//           <Heart size={17} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#475569'} />
//         </button>
//       )}

//       {/* Product Image & Myntra Badges */}
//       <div
//         className="product-img-wrapper"
//         style={{ cursor: 'pointer', position: 'relative' }}
//         onClick={() => onClickProductImage(product)}
//         title="Click to view product details & catalogue"
//       >
//         <img src={displayImage} alt={`Dipto Fashion - ${name} (${category || 'Collection'})`} loading="lazy" />
        
//         {category && <span className="category-tag">{category}</span>}

//         {isOutOfStock ? (
//           <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#dc2626', color: 'white', fontWeight: '900', fontSize: '0.72rem', padding: '3px 9px', borderRadius: '12px', zIndex: 12, boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)' }}>
//             OUT OF STOCK
//           </span>
//         ) : (
//           discountPercent > 0 && (
//             <span className="discount-badge">{discountPercent}% OFF</span>
//           )
//         )}

//         {/* MYNTRA APP STYLE RATING CAPSULE OVERLAY AT BOTTOM LEFT */}
//         <div className="myntra-rating-pill">
//           <span>{rating}</span>
//           <Star size={11} fill="#16a34a" color="#16a34a" />
//           <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
//           <span>{reviewsCount >= 1000 ? `${(reviewsCount / 1000).toFixed(1)}k` : reviewsCount}</span>
//         </div>

//         <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', color: 'white', padding: '2px 7px', borderRadius: '12px', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px', backdropFilter: 'blur(4px)' }}>
//           <Eye size={12} /> {images ? images.length : 1}
//         </div>
//       </div>

//       {/* Product Info - Myntra App Style */}
//       <div className="product-info">
//         <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#701a75', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
//           DIPTO FASHION
//         </div>

//         <h3
//           style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}
//           onClick={() => onClickProductTitle(product)}
//           title={name}
//         >
//           {name}
//         </h3>

//         {/* Price Row */}
//         <div className="price-row" style={{ marginTop: 'auto', paddingTop: '0.2rem' }}>
//           <span className="offer-price" style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a' }}>₹{price.toLocaleString('en-IN')}</span>
//           {mrp > price && (
//             <>
//               <span className="mrp-price" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</span>
//               <span className="off-percent" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#e11d48' }}>({discountPercent}% OFF)</span>
//             </>
//           )}
//         </div>

//         {/* Dynamic Button: Disabled when Out of Stock */}
//         {isOutOfStock ? (
//           <button
//             className="btn-primary"
//             style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.82rem', background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
//             disabled
//           >
//             <span>Out of Stock</span>
//           </button>
//         ) : !isInCart ? (
//           <button
//             className="btn-primary blink-green"
//             style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.82rem' }}
//             onClick={() => onAddToCart(product)}
//           >
//             <Plus size={15} />
//             <span>Add to Cart</span>
//           </button>
//         ) : (
//           <button
//             className="btn-primary blink-green"
//             style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.82rem' }}
//             onClick={() => (onOpenCart ? onOpenCart() : onAddToCart(product))}
//           >
//             <ArrowRight size={15} />
//             <span>Place Order</span>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;










import React from 'react';
import { ShoppingCart, Star, Eye, Heart, ArrowRight, Plus } from 'lucide-react';

const ProductCard = ({
  product,
  onAddToCart,
  onClickProductTitle,
  onClickProductImage,
  isWishlisted,
  onToggleWishlist,
  cartItems = [],
  onOpenCart
}) => {
  const { name, category, mrp, price, images, image, description, rating = 4.7, reviewsCount = 184, quantity } = product;

  // Use primary image
  const displayImage = images && images.length > 0 ? images[0] : image;

  // Calculate discount %
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  // Check if product is currently in cart
  const productId = product._id || product.id;
  const isInCart = cartItems.some((item) => (item._id || item.id) === productId);
  const remStock = product.remainingStock !== undefined && product.remainingStock !== null ? product.remainingStock : (product.quantity !== undefined ? product.quantity : 10);
  const isOutOfStock = remStock <= 0;

  return (
    <div className="product-card" style={{ position: 'relative', opacity: isOutOfStock ? 0.82 : 1 }}>
      {/* WISHLIST HEART BUTTON AT TOP RIGHT */}
      {onToggleWishlist && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            zIndex: 15,
            transition: 'all 0.2s ease'
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={17} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#475569'} />
        </button>
      )}

      {/* Product Image & Myntra Badges */}
      <div
        className="product-img-wrapper"
        style={{
          cursor: 'pointer',
          position: 'relative',
          width: '100%',
          overflow: 'hidden'
        }}
        onClick={() => onClickProductImage(product)}
        title="Click to view product details & catalogue"
      >
        <img
          src={displayImage}
          alt={`Dipto Fashion - ${name} (${category || 'Collection'})`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block'
          }}
        />
        
        {category && <span className="category-tag">{category}</span>}

        {isOutOfStock ? (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#dc2626', color: 'white', fontWeight: '900', fontSize: '0.72rem', padding: '3px 9px', borderRadius: '12px', zIndex: 12, boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)' }}>
            OUT OF STOCK
          </span>
        ) : (
          discountPercent > 0 && (
            <span className="discount-badge">{discountPercent}% OFF</span>
          )
        )}

        {/* MYNTRA APP STYLE RATING CAPSULE OVERLAY AT BOTTOM LEFT */}
        <div className="myntra-rating-pill">
          <span>{rating}</span>
          <Star size={11} fill="#16a34a" color="#16a34a" />
          <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
          <span>{reviewsCount >= 1000 ? `${(reviewsCount / 1000).toFixed(1)}k` : reviewsCount}</span>
        </div>

        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', color: 'white', padding: '2px 7px', borderRadius: '12px', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px', backdropFilter: 'blur(4px)' }}>
          <Eye size={12} /> {images ? images.length : 1}
        </div>
      </div>

      {/* Product Info - Myntra App Style */}
      <div className="product-info">
        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#701a75', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
          DIPTO FASHION
        </div>

        <h3
          style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}
          onClick={() => onClickProductTitle(product)}
          title={name}
        >
          {name}
        </h3>

        {/* Price Row */}
        <div className="price-row" style={{ marginTop: 'auto', paddingTop: '0.2rem' }}>
          <span className="offer-price" style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a' }}>₹{price.toLocaleString('en-IN')}</span>
          {mrp > price && (
            <>
              <span className="mrp-price" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</span>
              <span className="off-percent" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#e11d48' }}>({discountPercent}% OFF)</span>
            </>
          )}
        </div>

        {/* Dynamic Button: Disabled when Out of Stock */}
        {isOutOfStock ? (
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.82rem', background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
            disabled
          >
            <span>Out of Stock</span>
          </button>
        ) : !isInCart ? (
          <button
            className="btn-primary blink-green"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.82rem' }}
            onClick={() => onAddToCart(product)}
          >
            <Plus size={15} />
            <span>Add to Cart</span>
          </button>
        ) : (
          <button
            className="btn-primary blink-green"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.82rem' }}
            onClick={() => (onOpenCart ? onOpenCart() : onAddToCart(product))}
          >
            <ArrowRight size={15} />
            <span>Place Order</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;