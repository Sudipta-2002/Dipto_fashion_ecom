import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../../api';
import { fetchWithCache, clearCache } from '../../utils/cache';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Inline status messages (replaces alert())
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Saree',
    mrp: '',
    price: '',
    quantity: '10',
    description: ''
  });

  // Multi-Image Upload State (Array of 1 to 5 Base64 image strings)
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Auto-refresh every 30 seconds to keep data fresh
    refreshIntervalRef.current = setInterval(() => {
      fetchProducts(true);
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  const fetchProducts = async (forceRefresh = false) => {
    try {
      const { data } = await fetchWithCache(
        'admin_products',
        async () => {
          const res = await fetch(`${API_URL}/api/products`);
          return await res.json();
        },
        { forceRefresh }
      );
      const productList = Array.isArray(data) ? data : (data?.products || data?.data || []);
      setProducts(productList);
    } catch (e) {
      console.error('Error fetching products:', e);
      setProducts([]);
    }
  };

  const fetchCategories = async (forceRefresh = false) => {
    try {
      const { data } = await fetchWithCache(
        'categories',
        async () => {
          const res = await fetch(`${API_URL}/api/categories`);
          return await res.json();
        },
        { forceRefresh }
      );
      if (data) {
        setCategories(data);
        if (data.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: data[0].name }));
        }
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  // Convert File to Base64 String
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle Multi-Image Upload (Min 1, Max 5)
  const handleImageFileChange = async (e) => {
    setUploadError('');
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setUploadError('Maximum 5 images allowed per product!');
      return;
    }

    try {
      const base64Promises = files.map(file => fileToBase64(file));
      const newBase64Images = await Promise.all(base64Promises);
      setUploadedImages(prev => [...prev, ...newBase64Images].slice(0, 5));
    } catch (err) {
      setUploadError('Failed to process image files');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const [selectedSizes, setSelectedSizes] = useState([]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: categories[0]?.name || 'Saree',
      mrp: '',
      price: '',
      quantity: '10',
      description: ''
    });
    setUploadedImages([]);
    setSelectedSizes([]);
    setEditingProduct(null);
    setShowAddForm(false);
    setUploadError('');
  };

  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || prod.title || '',
      category: prod.category || 'Saree',
      mrp: prod.mrp || prod.price || '',
      price: prod.price || prod.offerPrice || '',
      quantity: prod.quantity !== undefined ? prod.quantity : 10,
      description: prod.description || ''
    });
    const imgs = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : (prod.image ? [prod.image] : []);
    setUploadedImages(imgs);
    setSelectedSizes(prod.availableSizes || []);
    setShowAddForm(true);
    setUploadError('');
  };

  const toggleSizeSelection = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!formData.name || !formData.mrp || !formData.price) {
      setUploadError('Please fill in Name, MRP, and Discount Offer Price.');
      return;
    }

    // MANDATORY CONSTRAINT: Min 1 image, Max 5 images
    if (uploadedImages.length === 0) {
      setUploadError('At least 1 image is mandatory for a product!');
      return;
    }

    if (uploadedImages.length > 5) {
      setUploadError('Maximum 5 images allowed per product!');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      mrp: Number(formData.mrp),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      images: uploadedImages,
      availableSizes: selectedSizes
    };

    // OPTIMISTIC UI: Immediately update the list
    let previousProducts = [...products];
    if (editingProduct) {
      setProducts(prev => prev.map(p =>
        p._id === editingProduct._id ? { ...p, ...payload, _id: editingProduct._id } : p
      ));
    } else {
      // For new product, add a temporary entry at top
      const tempProduct = { ...payload, _id: 'temp_' + Date.now(), images: uploadedImages };
      setProducts(prev => [tempProduct, ...prev]);
    }

    const isEditing = !!editingProduct;
    const editingProductId = editingProduct ? editingProduct._id : null;
    resetForm();

    try {
      const endpoint = isEditing ? `${API_URL}/api/products/${editingProductId}` : `${API_URL}/api/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess(isEditing ? '✅ Product updated successfully!' : '✅ Product added successfully!');
        clearCache('admin_products');
        // Refresh to get actual server data (replaces temp ID etc.)
        fetchProducts(true);
      } else {
        const errData = await res.json();
        // Rollback on failure
        setProducts(previousProducts);
        setUploadError(errData.message || 'Failed to save product');
        showError('Failed to save product. Please try again.');
      }
    } catch (e) {
      // Rollback on error
      setProducts(previousProducts);
      showError('Network error saving product: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 0ms Optimistic UI Product Deletion
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    let previousProducts = [];

    // 1. Instantly update React local UI state (0ms latency)
    setProducts((prevProducts) => {
      previousProducts = prevProducts;
      return prevProducts.filter(p => (p._id || p.id) !== id);
    });

    showSuccess('🗑️ Product deleted successfully!');

    // 2. Execute background API call
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        setProducts(previousProducts);
        showError('Failed to delete product on server. Change reverted.');
      } else {
        clearCache('admin_products');
      }
    } catch (e) {
      setProducts(previousProducts);
      showError('Network error deleting product. Change reverted.');
    }
  };

  return (
    <div>
      {/* Inline status messages */}
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Product Inventory Management</h3>
        <button
          className="btn-primary"
          onClick={() => {
            if (showAddForm) resetForm();
            else { setEditingProduct(null); setShowAddForm(true); }
          }}
        >
          <Plus size={18} /> {showAddForm ? 'Close Form' : 'Add New Product'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#c026d3' }}>
            {editingProduct ? 'Edit Product Details' : 'Add Product Details'}
          </h4>

          {uploadError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {uploadError}
            </div>
          )}

          <form onSubmit={handleSaveProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Product Title / Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Kanjivaram Pure Silk Saree"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="Saree">Saree</option>
                  <option value="Punjabi">Punjabi</option>
                  {categories
                    .filter(c => c.name !== 'Saree' && c.name !== 'Punjabi')
                    .map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Original MRP (₹) *</label>
                <input
                  type="number"
                  name="mrp"
                  placeholder="5999"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Discounted Offer Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="2499"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Available Stock Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="10"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* SIZE CHART & AVAILABLE SIZES SELECTION (S to XXL & Free Size) */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '800', color: '#c026d3', display: 'block', marginBottom: '0.4rem' }}>
                  📏 Available Product Sizes (Optional - Select available sizes for catalog)
                </label>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', background: '#fdf4ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #f5d0fe' }}>
                  {ALL_SIZES.map(s => {
                    const isSelected = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSizeSelection(s)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          background: isSelected ? '#c026d3' : 'white',
                          color: isSelected ? 'white' : '#475569',
                          border: isSelected ? '1.5px solid #c026d3' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MULTI-IMAGE FILE UPLOAD OPTION (MIN 1, MAX 5) */}
              <div className="form-group">
                <label>
                  Upload Product Images * (Min 1, Max 5 Images)
                </label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '0.85rem', background: '#f8fafc', textAlign: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    id="image-file-upload"
                    style={{ display: 'none' }}
                    disabled={uploadedImages.length >= 5}
                  />
                  <label htmlFor="image-file-upload" style={{ cursor: uploadedImages.length >= 5 ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', color: '#c026d3', fontWeight: '700' }}>
                    <Upload size={22} />
                    <span>{uploadedImages.length >= 5 ? 'Maximum 5 Images Uploaded' : 'Click to Upload Images (Max 5)'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* PREVIEW OF UPLOADED IMAGES */}
            {uploadedImages.length > 0 && (
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                  Uploaded Images ({uploadedImages.length}/5):
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {uploadedImages.map((imgBase64, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={imgBase64} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>Description / Specification</label>
              <textarea
                name="description"
                rows="2"
                placeholder="Product details, fabric info, design patterns..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Save Product'}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image Gallery</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>MRP</th>
              <th>Offer Price</th>
              <th>Discount</th>
              <th>Stock Qty</th>
              <th>Remaining Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(products) ? products : []).map((p) => {
              const mrpVal = Number(p.mrp) || Number(p.price) || 0;
              const priceVal = Number(p.price) || Number(p.offerPrice) || Number(p.mrp) || 0;
              const discountPercent = mrpVal > 0 ? Math.max(0, Math.round(((mrpVal - priceVal) / mrpVal) * 100)) : 0;
              
              const rawImages = Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80']);

              const imgCount = rawImages.length;
              const mainImg = rawImages[0];
              const remStock = p.remainingStock !== undefined && p.remainingStock !== null ? p.remainingStock : (p.quantity || 0);
              const prodTitle = p.name || p.title || 'Fashion Product';

              return (
                <tr key={p._id || p.id}>
                  <td>
                    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                      <img
                        src={mainImg}
                        alt={prodTitle}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      {imgCount > 1 && (
                        <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#c026d3', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '1px 5px', borderRadius: '8px' }}>
                          {imgCount} PICS
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.95rem' }}>{prodTitle}</strong>
                  </td>
                  <td>
                    <span style={{ background: '#fdf4ff', color: '#c026d3', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', fontSize: '0.8rem' }}>
                      {p.category || 'General'}
                    </span>
                  </td>
                  <td style={{ textDecoration: 'line-through', color: '#94a3b8' }}>₹{mrpVal}</td>
                  <td style={{ fontWeight: '800', color: '#0f172a' }}>₹{priceVal}</td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: '700' }}>{discountPercent}% OFF</span>
                  </td>
                  <td><strong>{p.quantity || 0}</strong></td>
                  <td><strong>{remStock}</strong></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: '#0284c7', borderColor: '#38bdf8' }}
                        title="Edit Product"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id || p.id)}
                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
