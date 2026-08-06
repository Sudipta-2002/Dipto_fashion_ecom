import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';

const ExpandableSearchBar = ({
  searchTerm = '',
  setSearchTerm,
  categories = [],
  allProducts = [],
  onSelectProduct,
  onSearchSubmit,
  placeholder = 'Search Sarees, Punjabi Suits, Collections...',
  expandedMaxWidth = 'min(750px, 85vw)',
  isMobileFullWidth = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when search bar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside listener to close suggestions & collapse if empty
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        if (!searchTerm.trim()) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchTerm]);

  const query = (searchTerm || '').trim().toLowerCase();

  // Extract unique category names
  const categoryNames = categories.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
  const allCategoryNames = Array.from(
    new Set([...categoryNames, ...allProducts.map((p) => p.category).filter(Boolean)])
  );

  // Requirement 2: Dynamic Search Suggestions (Letter/Word Matching ONLY)
  // Filter categories and products ONLY when query is non-empty. No default categories shown.
  const matchedCategories = query
    ? allCategoryNames.filter((cat) => cat.toLowerCase().includes(query))
    : [];

  const matchedProducts = query
    ? allProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      ).slice(0, 6)
    : [];

  const handleSelectSuggestion = (text) => {
    if (setSearchTerm) setSearchTerm(text);
    setShowSuggestions(false);
    if (onSearchSubmit) onSearchSubmit(text);
  };

  const handleProductClick = (product) => {
    if (setSearchTerm) setSearchTerm(product.name);
    setShowSuggestions(false);
    if (onSelectProduct) onSelectProduct(product);
    if (onSearchSubmit) onSearchSubmit(product.name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      if (onSearchSubmit) onSearchSubmit(searchTerm);
    }
  };

  const handleClear = () => {
    if (setSearchTerm) setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleCloseSearch = () => {
    setIsOpen(false);
    setShowSuggestions(false);
  };

  if (isMobileFullWidth) {
    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#c026d3',
              pointerEvents: 'none'
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              if (setSearchTerm) setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            style={{
              width: '100%',
              padding: '0.55rem 2.2rem 0.55rem 2.35rem',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              fontSize: '0.86rem',
              fontWeight: '600',
              background: '#f8fafc',
              outline: 'none',
              color: '#0f172a',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '10px',
                background: '#cbd5e1',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.72rem',
                color: '#334155'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* DYNAMIC SUGGESTIONS DROPDOWN FOR MOBILE */}
        {showSuggestions && query && (matchedCategories.length > 0 || matchedProducts.length > 0) && (
          <div
            className="expandable-search-suggestions"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1.5px solid #f0abfc',
              borderRadius: '14px',
              boxShadow: '0 10px 28px rgba(192, 38, 211, 0.2), 0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '340px',
              overflowY: 'auto',
              padding: '0.5rem 0'
            }}
          >
            {matchedCategories.length > 0 && (
              <div>
                <div style={{ padding: '0.35rem 0.85rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Categories
                </div>
                {matchedCategories.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => handleSelectSuggestion(cat)}
                    style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Search size={14} color="#c026d3" />
                      <span>{cat}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {matchedProducts.length > 0 && (
              <div style={{ borderTop: matchedCategories.length > 0 ? '1px solid #f1f5f9' : 'none', marginTop: matchedCategories.length > 0 ? '0.3rem' : 0, paddingTop: matchedCategories.length > 0 ? '0.3rem' : 0 }}>
                <div style={{ padding: '0.35rem 0.85rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Matching Products ({matchedProducts.length})
                </div>
                {matchedProducts.map((prod) => {
                  const prodImg = (prod.images && prod.images[0]) || prod.image;
                  return (
                    <div
                      key={prod._id || prod.id}
                      onClick={() => handleProductClick(prod)}
                      style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
                    >
                      {prodImg && (
                        <img src={prodImg} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#c026d3', fontWeight: '800' }}>
                          ₹{prod.price?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <ArrowUpRight size={14} color="#94a3b8" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="expandable-search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {!isOpen ? (
        /* SEARCH ICON BUTTON DISPLAYED BESIDE CART / WISHLIST */
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setShowSuggestions(true);
          }}
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
            color: '#475569',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          title="Click to search store catalog"
        >
          <Search size={19} color="#475569" />
        </button>
      ) : (
        /* EXPANDED WIDE SEARCH BAR OVERLAY IN NAVBAR */
        <div
          className="expandable-search-overlay"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            width: expandedMaxWidth,
            zIndex: 300,
            gap: '8px'
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                color: '#c026d3',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                if (setSearchTerm) setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              style={{
                width: '100%',
                padding: '0.7rem 2.4rem 0.7rem 2.8rem',
                border: '2px solid #c026d3',
                borderRadius: '28px',
                fontSize: '0.96rem',
                fontWeight: '600',
                background: '#ffffff',
                outline: 'none',
                boxShadow: '0 0 0 4px rgba(192, 38, 211, 0.18), 0 8px 24px rgba(0,0,0,0.12)',
                color: '#0f172a'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  color: '#475569'
                }}
                title="Clear text"
              >
                ✕
              </button>
            )}
          </div>

          {/* CLOSE SEARCH BUTTON */}
          <button
            type="button"
            onClick={handleCloseSearch}
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title="Close Search"
          >
            <X size={19} color="#475569" />
          </button>

          {/* Requirement 2: DYNAMIC SUGGESTIONS DROPDOWN */}
          {showSuggestions && query && (matchedCategories.length > 0 || matchedProducts.length > 0) && (
            <div
              className="expandable-search-suggestions"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: '46px',
                background: '#ffffff',
                border: '1.5px solid #f0abfc',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(192, 38, 211, 0.18), 0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '380px',
                overflowY: 'auto',
                padding: '0.75rem 0'
              }}
            >
              {/* CATEGORY SUGGESTIONS */}
              {matchedCategories.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: '0.4rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Categories
                  </div>
                  {matchedCategories.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => handleSelectSuggestion(cat)}
                      style={{
                        padding: '0.6rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#0f172a'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf4ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Search size={15} color="#c026d3" />
                        <span>{cat}</span>
                      </div>
                      <span
                        style={{
                          background: '#fdf4ff',
                          color: '#c026d3',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}
                      >
                        in Categories
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* MATCHING PRODUCTS SUGGESTIONS */}
              {matchedProducts.length > 0 && (
                <div style={{ borderTop: matchedCategories.length > 0 ? '1px solid #f1f5f9' : 'none', marginTop: matchedCategories.length > 0 ? '0.35rem' : 0, paddingTop: matchedCategories.length > 0 ? '0.35rem' : 0 }}>
                  <div
                    style={{
                      padding: '0.4rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Matching Products ({matchedProducts.length})
                  </div>
                  {matchedProducts.map((prod) => {
                    const prodImg = (prod.images && prod.images[0]) || prod.image;
                    return (
                      <div
                        key={prod._id || prod.id}
                        onClick={() => handleProductClick(prod)}
                        style={{
                          padding: '0.55rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {prodImg && (
                          <img
                            src={prodImg}
                            alt=""
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0'
                            }}
                          />
                        )}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: '700',
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                            <span style={{ color: '#c026d3', fontWeight: '800' }}>
                              ₹{prod.price?.toLocaleString('en-IN')}
                            </span>
                            {' • '}
                            <span>{prod.category}</span>
                          </div>
                        </div>
                        <ArrowUpRight size={16} color="#94a3b8" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandableSearchBar;
