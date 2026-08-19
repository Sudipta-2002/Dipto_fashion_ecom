import React from 'react';

const TopCategoryBar = ({ categories = [], selectedCategory = 'All', onSelectCategory }) => {
  const allCategories = [{ _id: 'cat_all', name: 'All' }, ...categories];

  return (
    <div
      className="top-category-bar-wrapper"
      style={{
        position: 'sticky',
        top: '64px',
        zIndex: 90,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        width: '100%'
      }}
    >
      <div
        className="top-category-bar-inner"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat._id || cat.name}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`category-text-tab ${isSelected ? 'active' : ''}`}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                padding: '0.85rem 0.25rem',
                cursor: 'pointer',
                flexShrink: 0,
                color: isSelected ? '#c026d3' : '#475569',
                fontWeight: isSelected ? '800' : '600',
                fontSize: '0.9rem',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{cat.name === 'All' ? 'All Collections' : cat.name}</span>
              <div
                className="hover-underline"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  borderRadius: '3px 3px 0 0',
                  background: '#c026d3',
                  opacity: isSelected ? 1 : 0,
                  transform: isSelected ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left center',
                  transition: 'transform 0.2s ease, opacity 0.2s ease'
                }}
              />
            </button>
          );
        })}
      </div>
      <style>{`
        .top-category-bar-inner::-webkit-scrollbar {
          display: none;
        }
        .category-text-tab:hover {
          color: #c026d3 !important;
        }
        .category-text-tab:hover .hover-underline {
          opacity: 1 !important;
          transform: scaleX(1) !important;
        }
      `}</style>
    </div>
  );
};

export default TopCategoryBar;
