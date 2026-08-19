import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../../api';

const AdminHeroBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for new banner
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('SHOP CATEGORY');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchHeroBanners();
  }, []);

  const fetchHeroBanners = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/hero-banners');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data)) {
        setBanners(data);
      } else {
        const saved = localStorage.getItem('df_hero_banners');
        if (saved) setBanners(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error fetching hero banners:', e);
      const saved = localStorage.getItem('df_hero_banners');
      if (saved) setBanners(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, GIF)');
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setErrorMsg('');
  };

  const handleUploadBanner = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select an image file to upload.');
      return;
    }

    setUploading(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (title.trim()) formData.append('title', title.trim());
      if (subtitle.trim()) formData.append('subtitle', subtitle.trim());
      if (linkUrl.trim()) formData.append('linkUrl', linkUrl.trim());

      const res = await fetch(`${API_URL}/api/admin/hero-banners/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('df_admin_token') || ''}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg('Hero banner uploaded to Cloudinary successfully!');
        setSelectedFile(null);
        setPreviewUrl('');
        setTitle('');
        setSubtitle('SHOP CATEGORY');
        setLinkUrl('');
        fetchHeroBanners();
      } else {
        setErrorMsg(data.error || 'Failed to upload banner to Cloudinary.');
      }
    } catch (err) {
      console.error('Error uploading banner:', err);
      setErrorMsg('Network error while uploading banner to Cloudinary.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this hero banner?')) return;

    try {
      const res = await apiFetch(`/api/admin/hero-banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('df_admin_token') || ''}`
        }
      });

      const data = await parseResponseSafely(res);

      if (res.ok && data.success) {
        setStatusMsg('Hero banner deleted successfully!');
        setBanners((prev) => prev.filter((b) => String(b._id) !== String(bannerId)));
      } else {
        setErrorMsg(data.error || 'Failed to delete banner');
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
      setErrorMsg('Failed to delete banner.');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const res = await apiFetch(`/api/admin/hero-banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('df_admin_token') || ''}`
        },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      const data = await parseResponseSafely(res);
      if (res.ok && data.success) {
        fetchHeroBanners();
      }
    } catch (e) {
      console.error('Error toggling banner status:', e);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(192, 38, 211, 0.3)' }}>
              <ImageIcon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Hero Banner Carousel Manager</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Upload, preview, and delete homepage Hero Carousel banners via Cloudinary</p>
            </div>
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

        {/* UPLOAD FORM */}
        <form onSubmit={handleUploadBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Add New Hero Banner</h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
                Banner Subtitle / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. SHOP CATEGORY"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
                Main Title / Collection Name (Multiline) *
              </label>
              <textarea
                rows={3}
                placeholder={"e.g. SHOP CATEGORY\nKURTA & PANJABI SET\nUp to 50% OFF"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
                Target Category / Link URL
              </label>
              <input
                type="text"
                placeholder="e.g. Punjabi or Saree"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
              Select Banner Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px dashed #c026d3', background: '#ffffff', cursor: 'pointer', boxSizing: 'border-box' }}
            />
          </div>

          {/* IMAGE PREVIEW */}
          {previewUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '0.3rem' }}>Preview:</p>
              <div style={{ position: 'relative', width: '100%', maxHeight: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={previewUrl} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: '800',
              borderRadius: '10px',
              justifyContent: 'center',
              cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
              opacity: uploading || !selectedFile ? 0.6 : 1
            }}
          >
            {uploading ? <RefreshCw size={18} className="spin" /> : <Upload size={18} />}
            <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Hero Banner'}</span>
          </button>
        </form>

        {/* BANNERS LIST */}
        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Active Hero Banners ({banners.length})</h4>

        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading hero banners...</p>
        ) : banners.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
            <ImageIcon size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: '700', margin: 0 }}>No hero banners uploaded yet.</p>
            <p style={{ fontSize: '0.82rem', margin: '0.3rem 0 0' }}>Upload high quality sale banners above to display on the storefront hero carousel.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {banners.map((banner) => (
              <div
                key={banner._id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '140px', background: '#f1f5f9' }}>
                  <img src={banner.imageUrl} alt={banner.title || 'Hero Banner'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '8px', right: '8px', background: banner.isActive ? '#22c55e' : '#64748b', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                      {banner.title || 'Untitled Banner'}
                    </h5>
                    {banner.linkUrl && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, wordBreak: 'break-all' }}>
                        Target: {banner.linkUrl}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', pt: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner)}
                      style={{ background: 'none', border: 'none', color: banner.isActive ? '#16a34a' : '#64748b', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> {banner.isActive ? 'Hide' : 'Show'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner._id)}
                      style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeroBanners;
