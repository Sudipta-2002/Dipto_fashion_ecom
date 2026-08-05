import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { API_URL } from '../../api';
import { fetchWithCache, clearCache } from '../../utils/cache';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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
      if (data) setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description })
      });
      if (res.ok) {
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (e) {
      alert('Error adding category');
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
    try {
      const res = await fetch(`${API_URL}/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDescription })
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (e) {
      alert('Error updating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (e) {
      alert('Error deleting category');
    }
  };

  return (
    <div>
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
            <Plus size={16} /> Save Category
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
                        onClick={() => handleDeleteCategory(c._id)}
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
