import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Megaphone, Tag, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../../api';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('sale');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/notifications');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data)) {
        setNotifications(data);
      } else {
        loadLocalNotificationsFallback();
      }
    } catch (e) {
      console.warn('Backend notifications endpoint unreachable. Loading local storage notifications.');
      loadLocalNotificationsFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalNotificationsFallback = () => {
    try {
      const saved = localStorage.getItem('df_local_notifications');
      const localList = saved ? JSON.parse(saved) : [
        {
          _id: 'notif_default_1',
          title: '🔥 Welcome to Dipto Fashion!',
          message: 'Explore our exclusive Banarasi sarees, Festive Kurta collections, and special discount offers!',
          category: 'announcement',
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(localList);
    } catch (e) {}
  };

  const saveNotificationLocally = (notifObj) => {
    setNotifications((prev) => {
      const updated = [notifObj, ...prev.filter(n => n._id !== notifObj._id)];
      try {
        localStorage.setItem('df_local_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Dispatch a custom window event so App.jsx receives the announcement immediately
    window.dispatchEvent(new CustomEvent('df_new_notification', { detail: notifObj }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both title and message text');
      return;
    }

    setSending(true);
    setStatusMsg('');
    setErrorMsg('');

    const newNotifObj = {
      _id: 'notif_' + Date.now(),
      title: title.trim(),
      message: message.trim(),
      category,
      createdAt: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('df_admin_token');
      const res = await apiFetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          category
        })
      });

      const data = await parseResponseSafely(res);

      if (res.ok && (data.success || data.notification)) {
        setStatusMsg('📢 Announcement broadcasted successfully to all users!');
        setTitle('');
        setMessage('');
        fetchNotifications();
      } else {
        // Graceful Fallback if backend returns 404 HTML response
        console.warn('Backend notification API returned 404/Error. Saving locally in state fallback.');
        saveNotificationLocally(newNotifObj);
        setStatusMsg('📢 Announcement created & saved locally (Server fallback mode active)');
        setTitle('');
        setMessage('');
      }
    } catch (err) {
      console.warn('Network error posting notification. Saving locally in state fallback.', err);
      saveNotificationLocally(newNotifObj);
      setStatusMsg('📢 Announcement created & saved locally (Offline mode active)');
      setTitle('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const token = localStorage.getItem('df_admin_token');
      const res = await apiFetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
    } catch (err) {}

    // Always clean up local state & localStorage
    setNotifications((prev) => {
      const updated = prev.filter((n) => n._id !== id);
      try {
        localStorage.setItem('df_local_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const getCategoryBadge = (catVal) => {
    const val = (catVal || '').toLowerCase();
    if (val.includes('sale')) {
      return { label: '🔥 Sale Alert', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
    }
    if (val.includes('offer')) {
      return { label: '🎁 Special Offer', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
    }
    if (val.includes('deal') || val.includes('flash')) {
      return { label: '⚡ Flash Deal', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' };
    }
    return { label: '📢 Announcement', bg: '#fdf4ff', color: '#c026d3', border: '#f5d0fe' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* LEFT COLUMN: CREATE & BROADCAST NOTIFICATION FORM */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Send Notification</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Broadcast announcements to all customer storefronts</p>
          </div>
        </div>

        {statusMsg && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#166534', padding: '0.75rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
              Announcement Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'Sale Alert', label: '🔥 Sale Alert' },
                { id: 'Special Offer', label: '🎁 Special Offer' },
                { id: 'Flash Deal', label: '⚡ Flash Deal' },
                { id: 'Announcement', label: '📢 Announcement' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: category === item.id ? '2px solid #c026d3' : '1px solid #cbd5e1',
                    background: category === item.id ? '#fdf4ff' : '#ffffff',
                    color: category === item.id ? '#c026d3' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
              Notification Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Sale is live! 50% OFF on Banarasi Sarees"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                fontWeight: '700',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
              Message Details *
            </label>
            <textarea
              placeholder="Enter announcement details, promo codes or offer terms..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '500',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn-primary blink-green"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: '800',
              borderRadius: '10px',
              justifyContent: 'center',
              cursor: sending ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={18} />
            <span>{sending ? 'Broadcasting...' : 'Send Notification to All Users'}</span>
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: SENT NOTIFICATIONS HISTORY LIST */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Sent Announcements History</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>List of all store broadcast notifications</p>
          </div>
          <button
            type="button"
            onClick={fetchNotifications}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>Loading notifications history...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Bell size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#475569', margin: '0 0 0.25rem 0' }}>No Announcements Sent Yet</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Use the form on the left to broadcast your first notification to all users.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {notifications.map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <div
                  key={item._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                        {new Date(item.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(item._id)}
                      style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Delete Announcement"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {item.title}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                    {item.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
