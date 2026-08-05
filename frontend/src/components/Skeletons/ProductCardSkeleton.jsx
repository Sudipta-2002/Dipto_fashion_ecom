import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="skeleton-card" style={{ height: '290px' }}>
      {/* Image Skeleton */}
      <div className="skeleton-box" style={{ width: '100%', height: '165px', borderRadius: '8px' }} />
      
      {/* Brand Tag Line */}
      <div className="skeleton-box" style={{ width: '35%', height: '10px', marginTop: '4px' }} />
      
      {/* Title */}
      <div className="skeleton-box" style={{ width: '85%', height: '14px' }} />
      
      {/* Price Row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
        <div className="skeleton-box" style={{ width: '40%', height: '18px' }} />
        <div className="skeleton-box" style={{ width: '25%', height: '12px' }} />
      </div>

      {/* Button */}
      <div className="skeleton-box" style={{ width: '100%', height: '32px', borderRadius: '8px', marginTop: '6px' }} />
    </div>
  );
};

export default ProductCardSkeleton;
