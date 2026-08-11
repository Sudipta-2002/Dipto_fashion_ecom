import React from 'react';
import {
  X,
  Sparkles,
  Award,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Users,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';

const AboutUsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '680px',
          width: 'min(93%, calc(100vw - 1.5rem))',
          maxHeight: '88dvh',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          background: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER HERO */}
        <div
          style={{
            background: 'linear-gradient(135deg, #701a75 0%, #c026d3 50%, #e879f9 100%)',
            padding: '1.5rem 1.25rem',
            color: 'white',
            position: 'relative',
            boxShadow: '0 4px 15px rgba(192, 38, 211, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)'
                }}
              >
                <Sparkles size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, letterSpacing: '-0.3px', color: 'white' }}>
                  About Dipto Fashion
                </h2>
                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9, fontWeight: '600' }}>
                  Crafting Timeless Indian Ethnic Elegance Since Day One
                </p>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div
          className="modal-body"
          style={{
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: '#fafafa'
          }}
        >
          {/* OUR STORY BANNER */}
          <div
            style={{
              background: 'white',
              border: '1.5px solid #f5d0fe',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(192, 38, 211, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Award size={20} color="#c026d3" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#701a75', margin: 0 }}>
                Our Heritage & Vision
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
              Welcome to <strong>Dipto Fashion</strong> — your premier destination for authentic Indian ethnic apparel.
              We specialize in exquisite Kanjivaram & Banarasi Silk Sarees, designer Punjabi suits, embroidered Kurtas,
              and contemporary women’s wear. Every garment in our collection is handpicked for exceptional fabric quality,
              vibrant color palettes, and intricate craftsmanship.
            </p>
          </div>

          {/* 4 CORE VALUE PILLARS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem'
            }}
          >
            <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
              <ShieldCheck size={26} color="#c026d3" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#701a75' }}>100% Authentic</div>
              <div style={{ fontSize: '0.72rem', color: '#a855f7', marginTop: '2px' }}>Genuine Weaver Quality</div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
              <Truck size={26} color="#2563eb" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e40af' }}>Express Shipping</div>
              <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '2px' }}>Fast Delivery Across India</div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
              <RotateCcw size={26} color="#16a34a" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#15803d' }}>7-Day Returns</div>
              <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: '2px' }}>Easy Pickup Guarantee</div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
              <Heart size={26} color="#ea580c" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#c2410c' }}>10K+ Happy Shoppers</div>
              <div style={{ fontSize: '0.72rem', color: '#f97316', marginTop: '2px' }}>Verified High Ratings</div>
            </div>
          </div>

          {/* WHY CHOOSE DIPTO FASHION */}
          <div
            style={{
              background: 'white',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#16a34a" /> Why Shop With Dipto Fashion?
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.55rem', lineHeight: '1.5' }}>
              <li><strong>Direct Manufacturer Pricing:</strong> Premium sarees and Punjabi suits at wholesale prices.</li>
              <li><strong>Rigorous Quality Check:</strong> Every saree & suit undergoes a 3-step quality inspection before dispatch.</li>
              <li><strong>Secure Razorpay Payments:</strong> 100% safe online payment gateways + Cash on Delivery options.</li>
              <li><strong>Instant AI & Customer Support:</strong> 24/7 shopping assistance for sizing, order tracking, and queries.</li>
            </ul>
          </div>

          {/* CONTACT & STORE INFORMATION */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)',
              border: '1.5px solid #e9d5ff',
              borderRadius: '16px',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#701a75' }}>
              📍 Store Information & Support
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: '#475569' }}>
              <MapPin size={16} color="#c026d3" /> <span>Dipto Fashion Outlet & Online Store, India</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: '#475569' }}>
              <Mail size={16} color="#c026d3" /> <span>support@diptofashion.com</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '10px' }}
            onClick={onClose}
          >
            Close & Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUsModal;
