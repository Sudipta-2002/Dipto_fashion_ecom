import React, { useState } from 'react';
import { Bell, X, CheckCheck, Megaphone, Tag, Gift, Zap, ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react';

const NotificationModal = ({
  isOpen,
  onClose,
  notifications = [],
  readNotificationIds = [],
  currentUserId = '',
  onMarkAllAsRead,
  onMarkSingleAsRead,
  onNavigateToShop
}) => {
  const [selectedNotification, setSelectedNotification] = useState(null);

  if (!isOpen) return null;

  const getCategoryBadge = (catVal) => {
    const val = (catVal || '').toLowerCase();
    if (val.includes('sale')) {
      return { label: '🔥 Sale Alert', bg: '#fef2f2', color: '#dc2626', icon: <Tag size={16} /> };
    }
    if (val.includes('offer')) {
      return { label: '🎁 Special Offer', bg: '#f0fdf4', color: '#16a34a', icon: <Gift size={16} /> };
    }
    if (val.includes('deal') || val.includes('flash')) {
      return { label: '⚡ Flash Deal', bg: '#fff7ed', color: '#ea580c', icon: <Zap size={16} /> };
    }
    return { label: '📢 Announcement', bg: '#fdf4ff', color: '#c026d3', icon: <Megaphone size={16} /> };
  };

  const getTimeAgo = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  const handleSelectNotification = (item) => {
    onMarkSingleAsRead(item._id);
    setSelectedNotification(item);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR (FLIPKART STYLE) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            padding: '1.1rem 1.25rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {selectedNotification && (
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Back to Notifications"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <img src="/logo.jpg" alt="Dipto Fashion" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
                {selectedNotification ? 'Announcement Details' : 'Notifications & Sale Alerts'}
              </h3>
              <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Dipto Fashion Updates</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!selectedNotification && notifications.length > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Mark all as read"
              >
                <CheckCheck size={14} /> Read All
              </button>
            )}
            <button
              className="close-btn"
              onClick={onClose}
              style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* NOTIFICATION DETAIL VIEW OR NOTIFICATION LIST */}
        {selectedNotification ? (
          /* DETAILED NOTIFICATION VIEW */
          <div style={{ padding: '1.5rem 1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* CATEGORY & TIME BADGE */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: getCategoryBadge(selectedNotification.category).bg, color: getCategoryBadge(selectedNotification.category).color, border: '1px solid rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {getCategoryBadge(selectedNotification.category).icon} {getCategoryBadge(selectedNotification.category).label}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>
                  {getTimeAgo(selectedNotification.createdAt)}
                </span>
              </div>

              {/* ANNOUNCEMENT CARD BANNER */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #701a75 100%)', borderRadius: '14px', padding: '1.5rem 1.25rem', color: 'white', marginBottom: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <img src="/logo.jpg" alt="Dipto Fashion" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)', marginBottom: '0.75rem' }} onError={(e) => e.target.style.display = 'none'} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: '0 0 0.5rem 0', lineHeight: '1.35' }}>
                  {selectedNotification.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#f5d0fe', opacity: 0.9, margin: 0 }}>
                  Official Announcement from Dipto Fashion Store
                </p>
              </div>

              {/* FULL MESSAGE BODY */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '500', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                {selectedNotification.message}
              </div>
            </div>

            {/* CALL TO ACTION BUTTON */}
            <button
              type="button"
              className="btn-primary blink-green"
              style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: '800', borderRadius: '12px', justifyContent: 'center' }}
              onClick={() => {
                onClose();
                if (onNavigateToShop) onNavigateToShop();
              }}
            >
              <ShoppingBag size={18} /> Shop Now & Explore Offers
            </button>
          </div>
        ) : (
          /* NOTIFICATIONS LIST VIEW (FLIPKART STYLE) */
          <div style={{ overflowY: 'auto', flex: 1, padding: '0.85rem 1rem' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                <Bell size={48} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#475569', margin: '0 0 0.35rem 0' }}>No Notifications Yet</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>You're all caught up! New sales, offers and store announcements will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {notifications.map((item) => {
                  const isRead = readNotificationIds.includes(item._id) || (Array.isArray(item.readBy) && currentUserId && item.readBy.includes(currentUserId));
                  const badge = getCategoryBadge(item.type || item.category);

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleSelectNotification(item)}
                      style={{
                        background: isRead ? '#ffffff' : '#fdf4ff',
                        border: isRead ? '1px solid #e2e8f0' : '1.5px solid #f5d0fe',
                        borderRadius: '12px',
                        padding: '0.9rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '0.85rem',
                        transition: 'all 0.2s ease',
                        boxShadow: isRead ? 'none' : '0 4px 12px rgba(192, 38, 211, 0.08)'
                      }}
                    >
                      {/* CATEGORY ICON CIRCLE */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: badge.bg,
                          color: badge.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        {badge.icon}
                      </div>

                      {/* TEXT CONTENT */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: badge.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
                            {getTimeAgo(item.createdAt)}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.95rem', fontWeight: isRead ? '700' : '800', color: '#0f172a', margin: '0 0 0.25rem 0', lineHeight: '1.3' }}>
                          {item.title}
                        </h4>

                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.message}
                        </p>
                      </div>

                      {/* UNREAD BLUE DOT / ARROW */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'center' }}>
                        {!isRead && (
                          <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#c026d3', boxShadow: '0 0 8px #c026d3' }} />
                        )}
                        <ChevronRight size={16} color="#cbd5e1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
