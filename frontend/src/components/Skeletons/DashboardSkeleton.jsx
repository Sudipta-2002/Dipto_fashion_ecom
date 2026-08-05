import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Metric Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="skeleton-card" style={{ height: '110px', padding: '1.25rem' }}>
            <div className="skeleton-box" style={{ width: '40%', height: '12px' }} />
            <div className="skeleton-box" style={{ width: '60%', height: '28px', marginTop: '12px' }} />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="skeleton-card" style={{ height: '320px', padding: '1.5rem' }}>
        <div className="skeleton-box" style={{ width: '25%', height: '18px', marginBottom: '1rem' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '230px', borderRadius: '10px' }} />
      </div>

      {/* Table Skeleton */}
      <div className="skeleton-card" style={{ height: '200px', padding: '1.5rem' }}>
        <div className="skeleton-box" style={{ width: '20%', height: '18px', marginBottom: '1rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="skeleton-box" style={{ width: '100%', height: '36px' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
