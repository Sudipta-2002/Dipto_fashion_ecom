import React, { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle2, AlertCircle, Save, ToggleLeft, ToggleRight, Search, Check, ShoppingBag } from 'lucide-react';
import { apiFetch, parseResponseSafely } from '../../api';

const AdminFlashSale = () => {
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState('Flash Sale');
  const [endTime, setEndTime] = useState(() => {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  });
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchFlashSaleConfig();
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const res = await apiFetch('/api/products?limit=100');
      const data = await parseResponseSafely(res);
      if (res.ok) {
        const list = Array.isArray(data) ? data : data.products || [];
        setAllProducts(list);
      }
    } catch (e) {
      console.error('Error fetching inventory products:', e);
    }
  };

  const fetchFlashSaleConfig = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/flash-sale');
      const data = await parseResponseSafely(res);
      if (res.ok && data) {
        setIsActive(data.isActive !== undefined ? Boolean(data.isActive) : true);
        if (data.title) setTitle(data.title);
        if (data.endTime) setEndTime(new Date(data.endTime).toISOString().slice(0, 16));
        if (Array.isArray(data.productIds)) {
          setSelectedProductIds(data.productIds.map((p) => typeof p === 'string' ? p : p._id));
        }
      }
    } catch (e) {
      console.error('Error fetching admin flash sale config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (prodId) => {
    setSelectedProductIds((prev) => {
      const exists = prev.some((id) => String(id) === String(prodId));
      if (exists) {
        return prev.filter((id) => String(id) !== String(prodId));
      } else {
        return [...prev, prodId];
      }
    });
  };

  const setPresetTime = (hoursToAdd) => {
    const futureDate = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    setEndTime(futureDate.toISOString().slice(0, 16));
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    setErrorMsg('');

    const payload = {
      title: title.trim(),
      isActive,
      endTime: new Date(endTime).toISOString(),
      productIds: selectedProductIds
    };

    try {
      const res = await apiFetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await parseResponseSafely(res);
      if (res.ok && data.success) {
        setStatusMsg('⚡ Flash Sale configuration saved successfully!');
      } else {
        setErrorMsg(data?.error || 'Failed to save Flash Sale settings.');
      }
    } catch (err) {
      console.error('Error saving Flash Sale:', err);
      setErrorMsg('Network error saving Flash Sale settings.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = allProducts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          padding: '1.75rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* HEADER BAR & TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #ea580c 0%, #c026d3 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
              <Flame size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Flash Sale Manager</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Configure live countdown flash sale section and pick product items for horizontal carousel slider</p>
            </div>
          </div>

          <div
            onClick={() => setIsActive(!isActive)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: isActive ? '#f0fdf4' : '#f8fafc',
              border: isActive ? '2px solid #22c55e' : '2px solid #cbd5e1',
              padding: '0.5rem 1rem',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isActive ? '#15803d' : '#64748b' }}>
              Flash Sale: {isActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
            </span>
            {isActive ? <ToggleRight size={28} color="#22c55e" /> : <ToggleLeft size={28} color="#94a3b8" />}
          </div>
        </div>

        {statusMsg && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#166534', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={20} /> {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
                Flash Sale Section Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Sale"
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: '700', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: '700', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Quick Timer Presets:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: '+2 Hours', hours: 2 },
                { label: '+6 Hours', hours: 6 },
                { label: '+24 Hours (1 Day)', hours: 24 },
                { label: '+48 Hours (2 Days)', hours: 48 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPresetTime(preset.hours)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT SELECTION TABLE */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Select Flash Sale Products ({selectedProductIds.length} Selected)
              </h4>

              {/* SEARCH INPUT */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.85rem 0.45rem 2.2rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white' }}>
              {filteredProducts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.88rem' }}>No products found.</p>
              ) : (
                filteredProducts.map((product) => {
                  const prodId = product._id || product.id;
                  const isChecked = selectedProductIds.some((id) => String(id) === String(prodId));
                  const imgUrl = (product.images && product.images[0]) || product.image;

                  return (
                    <div
                      key={prodId}
                      onClick={() => handleToggleProduct(prodId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isChecked ? '#fdf4ff' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: isChecked ? 'none' : '2px solid #cbd5e1',
                            background: isChecked ? '#c026d3' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0
                          }}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>

                        {imgUrl && (
                          <img src={imgUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                        )}

                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {product.category} • <strong style={{ color: '#c026d3' }}>₹{product.price}</strong>
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isChecked ? '#c026d3' : '#94a3b8' }}>
                        {isChecked ? 'Included' : 'Click to Add'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '12px', justifyContent: 'center', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            <Save size={18} />
            <span>{saving ? 'Publishing Flash Sale...' : 'Save & Publish Flash Sale Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFlashSale;
