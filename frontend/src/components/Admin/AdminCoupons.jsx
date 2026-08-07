import React, { useState, useEffect, useRef } from 'react';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, XCircle, Copy, Check, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../../api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'fixed',
    discountAmount: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    description: '',
    isActive: true
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    fetchCoupons();

    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchCoupons();
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('df_token');
      const res = await apiFetch('/api/admin/coupons', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data)) {
        setCoupons(data);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'fixed',
      discountAmount: '',
      maxDiscountAmount: '',
      minOrderAmount: '',
      description: '',
      isActive: true
    });
    setFormError('');
    setViewMode('form');
  };

  const handleOpenEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || 'fixed',
      discountAmount: coupon.discountAmount,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      minOrderAmount: coupon.minOrderAmount || '',
      description: coupon.description || '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true
    });
    setFormError('');
    setViewMode('form');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingCoupon(null);
    setFormError('');
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Coupon Code is required');
      return;
    }
    if (!formData.discountAmount || Number(formData.discountAmount) <= 0) {
      setFormError('Valid Discount Amount is required');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('df_token');
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountAmount: Number(formData.discountAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : 0,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        description: formData.description.trim(),
        isActive: formData.isActive
      };

      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon._id}`
        : '/api/admin/coupons';

      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await parseResponseSafely(res);
      if (res.ok) {
        setViewMode('list');
        setEditingCoupon(null);
        fetchCoupons();
      } else {
        setFormError(data.message || 'Failed to save coupon');
      }
    } catch (err) {
      setFormError(err.message || 'Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const token = localStorage.getItem('df_token');
      const updatedStatus = !coupon.isActive;

      // Optimistic update
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: updatedStatus } : c))
      );

      await apiFetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isActive: updatedStatus })
      });
    } catch (err) {
      console.error('Error toggling status:', err);
      fetchCoupons();
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon code permanently?')) return;
    try {
      const token = localStorage.getItem('df_token');
      const res = await apiFetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert('Failed to delete coupon');
      }
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
        borderRadius: '16px',
        padding: '1.35rem 1.5rem',
        color: 'white',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(112, 26, 117, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={26} color="#f5d0fe" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              Coupon & Promo Code Management
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#f5d0fe', margin: '3px 0 0 0', opacity: 0.9 }}>
              Create customer discount codes with minimum order conditions & terms
            </p>
          </div>
        </div>

        {viewMode === 'list' ? (
          <button
            onClick={handleOpenCreateForm}
            className="btn-primary blink-green"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
            }}
          >
            <Plus size={18} />
            <span>+ Create New Coupon</span>
          </button>
        ) : (
          <button
            onClick={handleBackToList}
            className="btn-outline"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              padding: '0.65rem 1.15rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Coupon List</span>
          </button>
        )}
      </div>

      {/* VIEW MODE 1: FORM VIEW (FULL PAGE / INLINE FORM) */}
      {viewMode === 'form' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: '1rem', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={20} color="#c026d3" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                {editingCoupon ? `Edit Coupon Code: ${editingCoupon.code}` : 'Create New Coupon Code'}
              </h3>
            </div>
            <button
              onClick={handleBackToList}
              className="btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: '#475569' }}
            >
              <ArrowLeft size={14} /> Back to List
            </button>
          </div>

          <form onSubmit={handleSaveCoupon}>
            {formError && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.35rem', display: 'block' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME100 or FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', color: '#c026d3', fontSize: '1rem', padding: '0.75rem 0.9rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Code entered by customer at checkout (auto-capitalized)
                </span>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.35rem', display: 'block' }}>
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  style={{ fontSize: '0.95rem', padding: '0.75rem 0.9rem' }}
                >
                  <option value="fixed">Fixed Amount (₹ Flat Off)</option>
                  <option value="percentage">Percentage (% Off)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.35rem', display: 'block' }}>
                  Discount Value * ({formData.discountType === 'percentage' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={formData.discountType === 'percentage' ? '15' : '100'}
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  style={{ fontSize: '1rem', fontWeight: '700', padding: '0.75rem 0.9rem' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.35rem', display: 'block' }}>
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 499 (0 for no minimum)"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  style={{ fontSize: '0.95rem', padding: '0.75rem 0.9rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Minimum cart value required to apply coupon
                </span>
              </div>

              {formData.discountType === 'percentage' && (
                <div className="form-group">
                  <label style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.35rem', display: 'block' }}>
                    Maximum Cap Limit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 300 (0 for no limit)"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    style={{ fontSize: '0.95rem', padding: '0.75rem 0.9rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Maximum discount cap in Rupees for percentage offer
                  </span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.35rem', display: 'block' }}>
                Terms & Conditions Description
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Applicable on all sarees and suits above ₹499. One-time use per customer."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ fontSize: '0.9rem', padding: '0.75rem 0.9rem', lineHeight: '1.4' }}
              />
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="couponActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ accentColor: '#c026d3', width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="couponActive" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
                Enable & Activate Coupon Code Immediately on Storefront
              </label>
            </div>

            {/* ACTION BUTTONS BAR */}
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary blink-green"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  padding: '0.85rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={18} />
                <span>{submitting ? 'Saving Coupon...' : editingCoupon ? 'Update Coupon Code' : 'Save & Create Coupon'}</span>
              </button>

              <button
                type="button"
                className="btn-outline"
                style={{ padding: '0.85rem 1.5rem', fontSize: '0.9rem', color: '#475569', borderRadius: '12px' }}
                onClick={handleBackToList}
              >
                Cancel & Return to List
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW MODE 2: LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Coupon Codes</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginTop: '0.25rem' }}>{coupons.length}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' }}>Active & Live</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#16a34a', marginTop: '0.25rem' }}>{activeCount}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c026d3', textTransform: 'uppercase' }}>Inactive / Disabled</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#c026d3', marginTop: '0.25rem' }}>{coupons.length - activeCount}</div>
            </div>
          </div>

          {/* Coupons Table / Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading coupon codes...</div>
          ) : coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#64748b' }}>
              <Tag size={42} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.4rem 0', color: '#334155' }}>No Coupon Codes Created</h3>
              <p style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>Create discount coupons to boost storefront order conversions!</p>
              <button onClick={handleOpenCreateForm} className="btn-primary" style={{ padding: '0.65rem 1.15rem' }}>
                + Create First Coupon Code
              </button>
            </div>
          ) : (
            <div className="table-responsive" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount Benefit</th>
                    <th>Min. Order Value</th>
                    <th>Terms & Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fdf4ff', border: '1.5px dashed #c026d3', padding: '4px 10px', borderRadius: '8px' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#c026d3', letterSpacing: '0.5px' }}>{coupon.code}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon._id, coupon.code)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c026d3', padding: '2px' }}
                            title="Copy Code"
                          >
                            {copiedId === coupon._id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.95rem' }}>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountAmount}% OFF ${coupon.maxDiscountAmount ? `(Up to ₹${coupon.maxDiscountAmount})` : ''}`
                            : `₹${coupon.discountAmount.toLocaleString('en-IN')} Flat OFF`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>
                          {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount.toLocaleString('en-IN')}` : 'No Minimum'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                        {coupon.description || 'Valid for all registered store customers.'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            background: coupon.isActive ? '#dcfce7' : '#fee2e2',
                            color: coupon.isActive ? '#15803d' : '#b91c1c',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {coupon.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleOpenEditForm(coupon)}
                            title="Edit Coupon Details"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            className="btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            title="Delete Coupon"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCoupons;
