import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../../api';
import { clearCache } from '../../utils/cache';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Inline status messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

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
    fetchCategories();

    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchCategories(true);
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  const fetchCategories = async (forceRefresh = false) => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    // OPTIMISTIC UI: Immediately add category to list
    const tempCat = {
      _id: 'temp_' + Date.now(),
      name: name.trim(),
      description: description.trim()
    };
    setCategories(prev => [...prev, tempCat]);
    const savedName = name.trim();
    const savedDesc = description.trim();
    setName('');
    setDescription('');

    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: savedName, description: savedDesc })
      });
      if (res.ok) {
        showSuccess(`✅ Category "${savedName}" added successfully!`);
        clearCache('categories');
        // Refresh to get actual server IDs
        fetchCategories(true);
      } else {
        // Rollback
        setCategories(prev => prev.filter(c => c._id !== tempCat._id));
        showError('Failed to add category on server.');
      }
    } catch (e) {
      // Rollback
      setCategories(prev => prev.filter(c => c._id !== tempCat._id));
      showError('Network error adding category.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCategory) return;

    const catId = editingCategory._id;
    const newName = editName.trim();
    const newDesc = editDescription.trim();

    // OPTIMISTIC UI: Immediately update list
    setCategories(prev =>
      prev.map(c => c._id === catId ? { ...c, name: newName, description: newDesc } : c)
    );
    setEditingCategory(null);
    showSuccess(`✅ Category "${newName}" updated successfully!`);

    try {
      const res = await fetch(`${API_URL}/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc })
      });
      if (res.ok) {
        clearCache('categories');
        fetchCategories(true);
      } else {
        showError('Failed to update category on server. Reverting.');
        fetchCategories(true); // Revert by re-fetching
      }
    } catch (e) {
      showError('Network error updating category. Reverting.');
      fetchCategories(true);
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;

    // OPTIMISTIC UI: Immediately remove from list
    let previousCategories = [];
    setCategories(prev => {
      previousCategories = prev;
      return prev.filter(c => c._id !== id);
    });
    showSuccess(`🗑️ Category "${catName}" deleted successfully!`);

    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        clearCache('categories');
      } else {
        setCategories(previousCategories);
        showError('Failed to delete category on server. Reverting.');
      }
    } catch (e) {
      setCategories(previousCategories);
      showError('Network error deleting category. Reverting.');
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

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#c026d3' }}>
          Add New Product Category
        </h4>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Saree, Punjabi, Lehengas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '250px' }}>
            <label>Short Description</label>
            <input
              type="text"
              placeholder="Category details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Plus size={16} /> {loading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal-card" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button className="close-btn" onClick={() => setEditingCategory(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateCategory}>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  Update Category
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id || c.name}>
                <td>
                  <strong style={{ fontSize: '1rem', color: '#c026d3' }}>{c.name}</strong>
                  {(c.name === 'Saree' || c.name === 'Punjabi') && (
                    <span style={{ marginLeft: '0.5rem', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}>
                      Default
                    </span>
                  )}
                </td>
                <td style={{ color: '#64748b' }}>{c.description || 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="btn-outline"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: '#0284c7', borderColor: '#38bdf8' }}
                      title="Edit Category"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    {c.name !== 'Saree' && c.name !== 'Punjabi' && (
                      <button
                        onClick={() => handleDeleteCategory(c._id, c.name)}
                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
