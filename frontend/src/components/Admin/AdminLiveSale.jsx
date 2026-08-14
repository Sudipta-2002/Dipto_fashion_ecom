// import React, { useState, useEffect } from 'react';
// import { Zap, Clock, CheckCircle2, AlertCircle, Save, Sparkles, ToggleLeft, ToggleRight, Calendar, ShoppingBag } from 'lucide-react';
// import { apiFetch, parseResponseSafely } from '../../api';

// const AdminLiveSale = () => {
//   const [isActive, setIsActive] = useState(true);
//   const [title, setTitle] = useState('🔥 MEGA FESTIVE SALE IS LIVE!');
//   const [offerDetails, setOfferDetails] = useState('Up to 50% OFF on Banarasi Sarees & Royal Kurtas');
//   const [targetCategory, setTargetCategory] = useState('All');
//   const [endTime, setEndTime] = useState(() => {
//     const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     return defaultDate.toISOString().slice(0, 16);
//   });

//   const [categories, setCategories] = useState(['All', 'Saree', 'Punjabi']);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [statusMsg, setStatusMsg] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');

//   useEffect(() => {
//     fetchLiveSaleConfig();
//     fetchCategoriesList();
//   }, []);

//   const fetchCategoriesList = async () => {
//     try {
//       const res = await apiFetch('/api/categories');
//       const data = await parseResponseSafely(res);
//       if (res.ok && Array.isArray(data)) {
//         const catNames = ['All', ...data.map((c) => c.name)];
//         setCategories(Array.from(new Set(catNames)));
//       }
//     } catch (e) {}
//   };

//   const fetchLiveSaleConfig = async () => {
//     setLoading(true);
//     try {
//       const res = await apiFetch('/api/live-sale');
//       const data = await parseResponseSafely(res);
//       if (res.ok && data) {
//         setIsActive(Boolean(data.isActive));
//         if (data.title) setTitle(data.title);
//         if (data.offerDetails) setOfferDetails(data.offerDetails);
//         if (data.targetCategory) setTargetCategory(data.targetCategory);
//         if (data.endTime) {
//           const date = new Date(data.endTime);
//           setEndTime(date.toISOString().slice(0, 16));
//         }
//       } else {
//         loadLocalStorageFallback();
//       }
//     } catch (e) {
//       loadLocalStorageFallback();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadLocalStorageFallback = () => {
//     try {
//       const saved = localStorage.getItem('df_live_sale_config');
//       if (saved) {
//         const config = JSON.parse(saved);
//         setIsActive(Boolean(config.isActive));
//         if (config.title) setTitle(config.title);
//         if (config.offerDetails) setOfferDetails(config.offerDetails);
//         if (config.targetCategory) setTargetCategory(config.targetCategory);
//         if (config.endTime) {
//           setEndTime(new Date(config.endTime).toISOString().slice(0, 16));
//         }
//       }
//     } catch (e) {}
//   };

//   const setPresetTime = (hoursToAdd) => {
//     const futureDate = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
//     setEndTime(futureDate.toISOString().slice(0, 16));
//   };

//   const handleSaveConfig = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setStatusMsg('');
//     setErrorMsg('');

//     const liveSalePayload = {
//       isActive,
//       title: title.trim(),
//       offerDetails: offerDetails.trim(),
//       targetCategory,
//       endTime: new Date(endTime).toISOString()
//     };

//     // Always update localStorage as immediate fallback
//     try {
//       localStorage.setItem('df_live_sale_config', JSON.stringify(liveSalePayload));
//       window.dispatchEvent(new CustomEvent('df_live_sale_updated', { detail: liveSalePayload }));
//     } catch (e) {}

//     try {
//       const token = localStorage.getItem('df_admin_token');
//       const res = await apiFetch('/api/admin/live-sale', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify(liveSalePayload)
//       });

//       const data = await parseResponseSafely(res);
//       console.log('>>> [AdminLiveSale] Backend Response:', data);

//       if (res.ok && data && (data.success || data.liveSale || data.data)) {
//         setStatusMsg(`⚡ ${data.message || 'Live Sale campaign saved directly to MongoDB!'}`);
//       } else {
//         const errDetail = data?.error || data?.message || `Server Error ${res.status}`;
//         console.error('>>> [AdminLiveSale] Backend Error Response:', errDetail);
//         setErrorMsg(`⚠️ ${errDetail} (Saved locally in fallback mode)`);
//       }
//     } catch (err) {
//       console.error('>>> [AdminLiveSale] Network Exception:', err);
//       setErrorMsg(`⚠️ Network Error: ${err.message} (Saved locally in offline mode)`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggleActive = () => {
//     const newActiveState = !isActive;
//     setIsActive(newActiveState);

//     // Save toggle state immediately
//     const liveSalePayload = {
//       isActive: newActiveState,
//       title,
//       offerDetails,
//       targetCategory,
//       endTime: new Date(endTime).toISOString()
//     };

//     try {
//       localStorage.setItem('df_live_sale_config', JSON.stringify(liveSalePayload));
//       window.dispatchEvent(new CustomEvent('df_live_sale_updated', { detail: liveSalePayload }));
//     } catch (e) {}
//   };

//   return (
//     <div style={{ maxWidth: '840px', margin: '0 auto' }}>
//       <div
//         style={{
//           background: '#ffffff',
//           borderRadius: '16px',
//           border: '1px solid #e2e8f0',
//           boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
//           padding: '1.75rem',
//           marginBottom: '1.5rem'
//         }}
//       >
//         {/* HEADER BAR & INSTANT TOGGLE SWITCH */}
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//             <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #ea580c 0%, #c026d3 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
//               <Zap size={24} />
//             </div>
//             <div>
//               <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Live Sale Notification Banner</h3>
//               <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Configure Meesho-style sticky sale countdown banner on customer storefront</p>
//             </div>
//           </div>

//           {/* MANUAL INSTANT ON/OFF TOGGLE SWITCH */}
//           <div
//             onClick={handleToggleActive}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.6rem',
//               background: isActive ? '#f0fdf4' : '#f8fafc',
//               border: isActive ? '2px solid #22c55e' : '2px solid #cbd5e1',
//               padding: '0.5rem 1rem',
//               borderRadius: '30px',
//               cursor: 'pointer',
//               transition: 'all 0.25 ease'
//             }}
//           >
//             <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isActive ? '#15803d' : '#64748b' }}>
//               Live Banner: {isActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
//             </span>
//             {isActive ? <ToggleRight size={28} color="#22c55e" /> : <ToggleLeft size={28} color="#94a3b8" />}
//           </div>
//         </div>

//         {statusMsg && (
//           <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#166534', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//             <CheckCircle2 size={20} /> {statusMsg}
//           </div>
//         )}

//         {errorMsg && (
//           <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//             <AlertCircle size={20} /> {errorMsg}
//           </div>
//         )}

//         {/* CAMPAIGN EDIT FORM */}
//         <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
//           <div>
//             <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
//               Sale Title / Tagline *
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. 🔥 FESTIVE GRAND SALE IS LIVE!"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               style={{ width: '100%', padding: '0.8rem 0.95rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: '700', boxSizing: 'border-box' }}
//               required
//             />
//           </div>

//           <div>
//             <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
//               Discount Offer Details *
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Up to 50% OFF on Banarasi Sarees & Royal Kurtas"
//               value={offerDetails}
//               onChange={(e) => setOfferDetails(e.target.value)}
//               style={{ width: '100%', padding: '0.8rem 0.95rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: '600', boxSizing: 'border-box' }}
//               required
//             />
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
//             <div>
//               <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
//                 Target Category (Optional)
//               </label>
//               <select
//                 value={targetCategory}
//                 onChange={(e) => setTargetCategory(e.target.value)}
//                 style={{ width: '100%', padding: '0.8rem 0.95rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: '700', background: 'white', boxSizing: 'border-box' }}
//               >
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat === 'All' ? '🛒 All Store Products' : `🏷️ ${cat}`}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
//                 Sale End Date & Time *
//               </label>
//               <input
//                 type="datetime-local"
//                 value={endTime}
//                 onChange={(e) => setEndTime(e.target.value)}
//                 style={{ width: '100%', padding: '0.8rem 0.95rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: '700', boxSizing: 'border-box' }}
//                 required
//               />
//             </div>
//           </div>

//           {/* QUICK PRESET TIME SHORTCUTS */}
//           <div>
//             <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
//               Quick Timer Presets:
//             </label>
//             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//               {[
//                 { label: '+1 Hour', hours: 1 },
//                 { label: '+6 Hours', hours: 6 },
//                 { label: '+24 Hours (1 Day)', hours: 24 },
//                 { label: '+3 Days', hours: 72 }
//               ].map((preset) => (
//                 <button
//                   key={preset.label}
//                   type="button"
//                   onClick={() => setPresetTime(preset.hours)}
//                   style={{
//                     background: '#f1f5f9',
//                     border: '1px solid #cbd5e1',
//                     color: '#334155',
//                     padding: '0.45rem 0.8rem',
//                     borderRadius: '8px',
//                     fontSize: '0.8rem',
//                     fontWeight: '700',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
//                   {preset.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={saving}
//             className="btn-primary blink-green"
//             style={{
//               width: '100%',
//               padding: '0.9rem',
//               fontSize: '1.05rem',
//               fontWeight: '800',
//               borderRadius: '12px',
//               justifyContent: 'center',
//               marginTop: '0.5rem',
//               cursor: saving ? 'not-allowed' : 'pointer'
//             }}
//           >
//             <Save size={18} />
//             <span>{saving ? 'Updating Live Sale Banner...' : 'Save & Publish Live Sale Settings'}</span>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminLiveSale;





import React, { useState, useEffect } from 'react';
import { Zap, Clock, CheckCircle2, AlertCircle, Save, Plus, Trash2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { apiFetch, parseResponseSafely } from '../../api';

const defaultBannerTemplate = (id = 1) => ({
  _id: `temp_${Date.now()}_${id}`,
  title: id === 1 ? '🔥 MEGA FESTIVE SALE IS LIVE!' : id === 2 ? '⚡ FLASH DEAL: 50% OFF!' : '✨ WEEKEND SPECIAL DISCOUNT!',
  offerDetails: id === 1 ? 'Up to 50% OFF on Banarasi Sarees & Royal Kurtas' : 'Flat ₹300 OFF on Orders Above ₹1999',
  targetCategory: 'All',
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true
});

const AdminLiveSale = () => {
  const [banners, setBanners] = useState([defaultBannerTemplate(1)]);
  const [categories, setCategories] = useState(['All', 'Saree', 'Punjabi']);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBanners();
    fetchCategoriesList();
  }, []);

  const fetchCategoriesList = async () => {
    try {
      const res = await apiFetch('/api/categories');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data)) {
        const catNames = ['All', ...data.map((c) => c.name)];
        setCategories(Array.from(new Set(catNames)));
      }
    } catch (e) {}
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/live-sales');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setBanners(
          data.map((b) => ({
            ...b,
            endTime: b.endTime ? new Date(b.endTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
          }))
        );
      } else {
        loadLocalStorageFallback();
      }
    } catch (e) {
      loadLocalStorageFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStorageFallback = () => {
    try {
      const saved = localStorage.getItem('df_live_sale_banners');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) setBanners(list);
      }
    } catch (e) {}
  };

  const handleAddBanner = () => {
    if (banners.length >= 3) {
      setErrorMsg('⚠️ You can add a maximum of 3 Live Sale Banners simultaneously.');
      setTimeout(() => setErrorMsg(''), 3500);
      return;
    }
    setBanners((prev) => [...prev, defaultBannerTemplate(prev.length + 1)]);
  };

  const handleRemoveBanner = (index) => {
    if (banners.length === 1) {
      setErrorMsg('⚠️ At least 1 banner config is required. You can toggle it OFF instead of deleting.');
      setTimeout(() => setErrorMsg(''), 3500);
      return;
    }
    setBanners((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index, field, value) => {
    setBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleActive = (index) => {
    setBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      return updated;
    });
  };

  const setPresetTime = (index, hoursToAdd) => {
    const futureDate = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    handleUpdateField(index, 'endTime', futureDate.toISOString().slice(0, 16));
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    setErrorMsg('');

    const formattedPayload = banners.map((b) => ({
      ...b,
      title: b.title.trim(),
      offerDetails: b.offerDetails.trim(),
      endTime: new Date(b.endTime).toISOString()
    }));

    try {
      localStorage.setItem('df_live_sale_banners', JSON.stringify(formattedPayload));
      window.dispatchEvent(new CustomEvent('df_live_sale_updated', { detail: formattedPayload.filter(b => b.isActive) }));
    } catch (e) {}

    try {
      const res = await apiFetch('/api/admin/live-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: formattedPayload })
      });

      const data = await parseResponseSafely(res);
      if (res.ok) {
        setStatusMsg('⚡ All 1-3 Live Sale Banners Published & Synced Successfully!');
      } else {
        setErrorMsg(`⚠️ Server Error: ${data?.error || 'Failed to save to database'}`);
      }
    } catch (err) {
      setErrorMsg(`⚠️ Network exception: Saved locally in offline mode`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', padding: '1.75rem', marginBottom: '1.5rem' }}>
        
        {/* HEADER BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #ea580c 0%, #c026d3 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
              <Zap size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Live Sale Multi-Banners</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Configure up to 3 rotating live sale notification banners for storefront carousel</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddBanner}
            disabled={banners.length >= 3}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: banners.length >= 3 ? '#f1f5f9' : '#fdf4ff',
              color: banners.length >= 3 ? '#94a3b8' : '#c026d3',
              border: '1.5px dashed #c026d3',
              padding: '0.5rem 1rem',
              borderRadius: '24px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: banners.length >= 3 ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} /> Add Banner ({banners.length}/3)
          </button>
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

        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {banners.map((banner, index) => (
            <div
              key={index}
              style={{
                border: banner.isActive ? '1.5px solid #c026d3' : '1.5px solid #cbd5e1',
                background: banner.isActive ? '#ffffff' : '#f8fafc',
                borderRadius: '14px',
                padding: '1.25rem',
                boxShadow: banner.isActive ? '0 4px 14px rgba(192, 38, 211, 0.08)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '900', color: banner.isActive ? '#c026d3' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> Banner #{index + 1}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* ON/OFF TOGGLE */}
                  <div
                    onClick={() => handleToggleActive(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: banner.isActive ? '#f0fdf4' : '#ffffff',
                      border: banner.isActive ? '1.5px solid #22c55e' : '1.5px solid #cbd5e1',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: banner.isActive ? '#15803d' : '#64748b' }}>
                      {banner.isActive ? 'ACTIVE (ON)' : 'OFF'}
                    </span>
                    {banner.isActive ? <ToggleRight size={22} color="#22c55e" /> : <ToggleLeft size={22} color="#94a3b8" />}
                  </div>

                  {banners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(index)}
                      style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.35rem 0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Delete this banner"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.3rem' }}>
                    Sale Title / Tagline *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 MEGA FESTIVE SALE IS LIVE!"
                    value={banner.title}
                    onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: '700', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.3rem' }}>
                    Discount Offer Details *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 50% OFF on Banarasi Sarees & Royal Kurtas"
                    value={banner.offerDetails}
                    onChange={(e) => handleUpdateField(index, 'offerDetails', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: '600', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.3rem' }}>
                      Target Category
                    </label>
                    <select
                      value={banner.targetCategory}
                      onChange={(e) => handleUpdateField(index, 'targetCategory', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '700', background: 'white', boxSizing: 'border-box' }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'All' ? '🛒 All Store Products' : `🏷️ ${cat}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.3rem' }}>
                      Sale End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={banner.endTime}
                      onChange={(e) => handleUpdateField(index, 'endTime', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '700', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                      { label: '+1h', hours: 1 },
                      { label: '+6h', hours: 6 },
                      { label: '+24h (1 Day)', hours: 24 },
                      { label: '+3 Days', hours: 72 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPresetTime(index, preset.hours)}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '12px', justifyContent: 'center', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            <Save size={18} />
            <span>{saving ? 'Publishing Banners...' : 'Publish & Sync Live Sale Banners'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLiveSale;