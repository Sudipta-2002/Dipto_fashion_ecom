import React, { useState } from 'react';
import { Layers, ChevronRight, MoreVertical, X, Check } from 'lucide-react';

const CategorySidebar = ({ categories, selectedCategory, onSelectCategory }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar desktop-sidebar">
        <h3>
          <Layers size={18} color="#c026d3" />
          Categories
        </h3>
        <ul className="category-list">
          <li
            className={`category-item ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => onSelectCategory('All')}
          >
            <span>All Products</span>
            <ChevronRight size={16} />
          </li>
          {categories.map((cat) => (
            <li
              key={cat._id || cat.name}
              className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
            >
              <span>{cat.name}</span>
              <ChevronRight size={16} />
            </li>
          ))}
        </ul>
      </aside>

      {/* MOBILE ONLY: 3-DOT KEBAB ICON CATEGORY BUTTON & DROPDOWN */}
      <div className="mobile-category-trigger">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn-outline"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '20px',
            borderColor: '#c026d3',
            color: '#c026d3',
            background: '#fdf4ff',
            fontWeight: '800',
            fontSize: '0.82rem'
          }}
          title="Select Category"
        >
          <MoreVertical size={18} />
          <span>Category: {selectedCategory}</span>
        </button>

        {/* MOBILE DROPDOWN MODAL */}
        {mobileMenuOpen && (
          <div className="modal-overlay" style={{ zIndex: 350 }} onClick={() => setMobileMenuOpen(false)}>
            <div
              className="modal-card"
              style={{ maxWidth: '340px', width: '88%', borderRadius: '16px', padding: '1.25rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#c026d3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={18} /> Store Categories
                </h4>
                <button className="close-btn" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('All');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    background: selectedCategory === 'All' ? '#fdf4ff' : '#f8fafc',
                    color: selectedCategory === 'All' ? '#c026d3' : '#0f172a',
                    border: selectedCategory === 'All' ? '1.5px solid #c026d3' : '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <span>All Products</span>
                  {selectedCategory === 'All' && <Check size={16} color="#c026d3" />}
                </button>

                {categories.map((cat) => {
                  const isSel = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat._id || cat.name}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.name);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.7rem 0.85rem',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: '800',
                        background: isSel ? '#fdf4ff' : '#f8fafc',
                        color: isSel ? '#c026d3' : '#0f172a',
                        border: isSel ? '1.5px solid #c026d3' : '1px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{cat.name}</span>
                      {isSel && <Check size={16} color="#c026d3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategorySidebar;
