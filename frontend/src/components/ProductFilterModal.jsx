import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  Tag,
  Star,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Percent
} from 'lucide-react';

const ProductFilterModal = ({
  isOpen,
  onClose,
  categories = [],
  allProducts = [],
  currentFilters = {},
  onApplyFilters,
  onResetFilters
}) => {
  const [activeTab, setActiveTab] = useState('category');
  const [localFilters, setLocalFilters] = useState({
    category: 'All',
    presetPrice: 'all',
    minPrice: '',
    maxPrice: '',
    minDiscount: 0,
    minRating: 0,
    inStockOnly: false,
    ...currentFilters
  });

  // Sync state when modal opens or currentFilters changes
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        category: 'All',
        presetPrice: 'all',
        minPrice: '',
        maxPrice: '',
        minDiscount: 0,
        minRating: 0,
        inStockOnly: false,
        ...currentFilters
      });
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  // Extract unique categories dynamically
  const categoryNames = categories.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
  const allCategoryList = Array.from(
    new Set(['All', ...categoryNames, ...allProducts.map((p) => p.category).filter(Boolean)])
  );

  // Calculate active filter count
  const activeCount = [
    localFilters.category && localFilters.category !== 'All' ? 1 : 0,
    localFilters.presetPrice && localFilters.presetPrice !== 'all' ? 1 : 0,
    localFilters.minPrice || localFilters.maxPrice ? 1 : 0,
    localFilters.minDiscount > 0 ? 1 : 0,
    localFilters.minRating > 0 ? 1 : 0,
    localFilters.inStockOnly ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetState = {
      category: 'All',
      presetPrice: 'all',
      minPrice: '',
      maxPrice: '',
      minDiscount: 0,
      minRating: 0,
      inStockOnly: false
    };
    setLocalFilters(resetState);
    if (onResetFilters) onResetFilters();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          animation: 'scaleUp 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            flexShrink: 0,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            color: 'white',
            padding: '1.1rem 1.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <SlidersHorizontal size={22} color="#f5d0fe" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Filter Products
                {activeCount > 0 && (
                  <span
                    style={{
                      background: '#c026d3',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: '900',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {activeCount} Active
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#f5d0fe', opacity: 0.9, margin: 0 }}>
                Refine by category, price range, discounts & ratings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* FLIPKART STYLE TWO-COLUMN BODY */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* LEFT SIDEBAR TABS */}
          <div
            style={{
              width: 'min(170px, 35vw)',
              background: '#f8fafc',
              borderRight: '1.5px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            {[
              { id: 'category', label: 'Category', icon: Layers },
              { id: 'price', label: 'Price Range', icon: DollarSign },
              { id: 'discount', label: 'Discount', icon: Percent },
              { id: 'rating', label: 'Customer Rating', icon: Star },
              { id: 'availability', label: 'Availability', icon: Package }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.95rem 0.85rem',
                    textAlign: 'left',
                    background: isActive ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '4px solid #c026d3' : '4px solid transparent',
                    color: isActive ? '#c026d3' : '#475569',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={17} color={isActive ? '#c026d3' : '#64748b'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT CONTENT PANE */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
            {/* TAB 1: CATEGORIES */}
            {activeTab === 'category' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
                  Select Product Category
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {allCategoryList.map((cat) => {
                    const isSelected = (localFilters.category || 'All') === cat;
                    return (
                      <label
                        key={cat}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
                          background: isSelected ? '#fdf4ff' : '#ffffff',
                          cursor: 'pointer',
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? '#c026d3' : '#334155',
                          fontSize: '0.88rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input
                            type="radio"
                            name="filterCategory"
                            checked={isSelected}
                            onChange={() => setLocalFilters({ ...localFilters, category: cat })}
                            style={{ accentColor: '#c026d3', cursor: 'pointer' }}
                          />
                          <span>{cat === 'All' ? 'All Categories (Entire Store)' : cat}</span>
                        </div>
                        {isSelected && <Check size={16} color="#c026d3" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PRICE RANGE */}
            {activeTab === 'price' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
                  Price Range Filter
                </h4>

                {/* Preset Ranges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under500', label: 'Under ₹500' },
                    { id: '500-1000', label: '₹500 - ₹1,000' },
                    { id: '1000-2000', label: '₹1,000 - ₹2,000' },
                    { id: 'above2000', label: 'Above ₹2,000' }
                  ].map((p) => {
                    const isSelected = localFilters.presetPrice === p.id && !localFilters.minPrice && !localFilters.maxPrice;
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
                          background: isSelected ? '#fdf4ff' : '#ffffff',
                          cursor: 'pointer',
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? '#c026d3' : '#334155',
                          fontSize: '0.88rem'
                        }}
                      >
                        <input
                          type="radio"
                          name="presetPrice"
                          checked={isSelected}
                          onChange={() => setLocalFilters({ ...localFilters, presetPrice: p.id, minPrice: '', maxPrice: '' })}
                          style={{ accentColor: '#c026d3' }}
                        />
                        <span>{p.label}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Min-Max Price Inputs */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Custom Price Range (₹)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Min Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 200"
                        value={localFilters.minPrice}
                        onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value, presetPrice: 'custom' })}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', marginTop: '3px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Max Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={localFilters.maxPrice}
                        onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value, presetPrice: 'custom' })}
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', marginTop: '3px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DISCOUNT */}
            {activeTab === 'discount' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
                  Minimum Discount %
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 0, label: 'All Items (Any Discount)' },
                    { value: 10, label: '10% or more' },
                    { value: 30, label: '30% or more' },
                    { value: 50, label: '50% or more (Half Price)' },
                    { value: 70, label: '70% or more (Mega Sale)' }
                  ].map((disc) => {
                    const isSelected = Number(localFilters.minDiscount) === disc.value;
                    return (
                      <label
                        key={disc.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
                          background: isSelected ? '#fdf4ff' : '#ffffff',
                          cursor: 'pointer',
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? '#c026d3' : '#334155',
                          fontSize: '0.88rem'
                        }}
                      >
                        <input
                          type="radio"
                          name="minDiscount"
                          checked={isSelected}
                          onChange={() => setLocalFilters({ ...localFilters, minDiscount: disc.value })}
                          style={{ accentColor: '#c026d3' }}
                        />
                        <span>{disc.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: RATING */}
            {activeTab === 'rating' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
                  Minimum Customer Rating
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 0, label: 'All Ratings' },
                    { value: 4.5, label: '4.5★ & above (Top Rated)' },
                    { value: 4.0, label: '4.0★ & above' },
                    { value: 3.5, label: '3.5★ & above' },
                    { value: 3.0, label: '3.0★ & above' }
                  ].map((rate) => {
                    const isSelected = Number(localFilters.minRating) === rate.value;
                    return (
                      <label
                        key={rate.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
                          background: isSelected ? '#fdf4ff' : '#ffffff',
                          cursor: 'pointer',
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? '#c026d3' : '#334155',
                          fontSize: '0.88rem'
                        }}
                      >
                        <input
                          type="radio"
                          name="minRating"
                          checked={isSelected}
                          onChange={() => setLocalFilters({ ...localFilters, minRating: rate.value })}
                          style={{ accentColor: '#c026d3' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{rate.label}</span>
                          {rate.value > 0 && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: AVAILABILITY */}
            {activeTab === 'availability' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
                  Stock Availability
                </h4>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: localFilters.inStockOnly ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                    background: localFilters.inStockOnly ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '800',
                    color: localFilters.inStockOnly ? '#15803d' : '#334155'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={localFilters.inStockOnly}
                    onChange={(e) => setLocalFilters({ ...localFilters, inStockOnly: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.92rem' }}>In Stock Only</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                      Hide items that are out of stock
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1.5px solid #e2e8f0',
            padding: '0.9rem 1.25rem',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            zIndex: 10
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              flex: 1,
              maxWidth: '160px',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#475569',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={16} /> Reset All
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              flex: 2,
              background: 'linear-gradient(135deg, #c026d3 0%, #9333ea 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(192, 38, 211, 0.35)'
            }}
          >
            <Check size={18} /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilterModal;
