import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', padding: '1rem 0' }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem'
          }}
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="skeleton-box" style={{ height: '20px', width: cIdx === 0 ? '75%' : '90%' }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
