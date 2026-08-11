import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingBag, X, Sparkles, ChevronRight } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../api';
import { useSocket } from '../context/SocketContext';

const LiveSaleBanner = ({ onSelectCategory }) => {
  const [config, setConfig] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
  const [isDismissed, setIsDismissed] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchSaleConfig();
    // Multi-device synchronization polling (10s)
    const interval = setInterval(fetchSaleConfig, 10000);
    const handleFocus = () => fetchSaleConfig();
    window.addEventListener('focus', handleFocus);

    const handleUpdateEvent = (e) => {
      if (e.detail) {
        setConfig(e.detail);
        setIsDismissed(false);
      }
    };
    window.addEventListener('df_live_sale_updated', handleUpdateEvent);

    const handleSocketUpdate = (data) => {
      if (data) {
        setConfig(data);
        setIsDismissed(false);
      }
    };

    if (socket) {
      socket.on('live_sale_updated', handleSocketUpdate);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('df_live_sale_updated', handleUpdateEvent);
      if (socket) {
        socket.off('live_sale_updated', handleSocketUpdate);
      }
    };
  }, [socket]);

  const fetchSaleConfig = async () => {
    try {
      let res = await apiFetch('/api/live-sale/active');
      if (!res.ok) {
        res = await apiFetch('/api/live-sale');
      }
      const data = await parseResponseSafely(res);
      if (res.ok && data) {
        setConfig(data);
      } else {
        loadLocalStorageConfig();
      }
    } catch (e) {
      loadLocalStorageConfig();
    }
  };

  const loadLocalStorageConfig = () => {
    try {
      const saved = localStorage.getItem('df_live_sale_config');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!config || !config.isActive || !config.endTime) return;

    const calculateTimer = () => {
      const targetTime = new Date(config.endTime).getTime();
      const now = new Date().getTime();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diffMs });
    };

    calculateTimer();
    const interval = setInterval(calculateTimer, 1000);
    return () => clearInterval(interval);
  }, [config]);

  // VISIBILITY RULES: Automatically hide if OFF, dismissed, or timer expired
  if (!config || !config.isActive || isDismissed || timeLeft.totalMs <= 0) {
    return null;
  }

  const formatDigit = (num) => String(num).padStart(2, '0');

  const handleBannerClick = () => {
    if (onSelectCategory && config.targetCategory) {
      onSelectCategory(config.targetCategory === 'All' ? 'All' : config.targetCategory);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #701a75 0%, #c026d3 50%, #ea580c 100%)',
        color: '#ffffff',
        padding: '0.55rem 1rem',
        position: 'relative',
        zIndex: 99,
        boxShadow: '0 4px 15px rgba(112, 26, 117, 0.25)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeInDown 0.3s ease-in-out'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        {/* SALE TITLE & OFFER DETAILS */}
        <div
          onClick={handleBannerClick}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Zap size={14} className="spin-slow" /> LIVE SALE
          </div>

          <span style={{ fontSize: '0.92rem', fontWeight: '900', letterSpacing: '-0.2px' }}>
            {config.title}
          </span>

          <span style={{ fontSize: '0.82rem', fontWeight: '600', opacity: 0.95 }} className="banner-offer-text">
            • {config.offerDetails}
          </span>
        </div>

        {/* COUNTDOWN TIMER BADGES & SHOP NOW ACTION BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* REAL-TIME DYNAMIC COUNTDOWN TIMER (MEESHO STYLE) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={15} style={{ opacity: 0.9, marginRight: '3px' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.9 }}>Ends in:</span>

            {timeLeft.days > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ background: '#0f172a', color: '#ffffff', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '900', minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {formatDigit(timeLeft.days)}
                </span>
                <span style={{ fontWeight: '800', fontSize: '0.78rem' }}>d</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ background: '#0f172a', color: '#ffffff', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '900', minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {formatDigit(timeLeft.hours)}
              </span>
              <span style={{ fontWeight: '800', fontSize: '0.78rem' }}>h</span>
            </div>

            <span style={{ fontWeight: '900', opacity: 0.7 }}>:</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ background: '#0f172a', color: '#ffffff', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '900', minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {formatDigit(timeLeft.minutes)}
              </span>
              <span style={{ fontWeight: '800', fontSize: '0.78rem' }}>m</span>
            </div>

            <span style={{ fontWeight: '900', opacity: 0.7 }}>:</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ background: '#16a34a', color: '#ffffff', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '900', minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
                {formatDigit(timeLeft.seconds)}
              </span>
              <span style={{ fontWeight: '800', fontSize: '0.78rem' }}>s</span>
            </div>
          </div>

          {/* SHOP NOW ACTION BUTTON */}
          <button
            type="button"
            onClick={handleBannerClick}
            style={{
              background: '#ffffff',
              color: '#701a75',
              border: 'none',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingBag size={14} /> Shop Sale <ChevronRight size={14} />
          </button>

          {/* DISMISS X BUTTON */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.85
            }}
            title="Hide Live Sale Banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSaleBanner;
