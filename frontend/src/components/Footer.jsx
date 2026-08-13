import React from 'react';
import {
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
  ExternalLink
} from 'lucide-react';

const Footer = ({ onOpenAboutUs, onOpenTermsPrivacy, isEmbedded = false }) => {
  return (
    <footer
      className="footer"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4a044e 100%)',
        color: '#f8fafc',
        paddingTop: isEmbedded ? '2rem' : '3rem',
        paddingBottom: '1.25rem',
        marginTop: isEmbedded ? '1.5rem' : '3rem',
        borderTop: '3px solid #c026d3',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.25)',
        width: '100%'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* BRAND IDENTITY */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <img
              src="/logo.jpg"
              alt="Dipto Fashion"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid #e879f9',
                boxShadow: '0 4px 12px rgba(192, 38, 211, 0.4)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                DIPTO FASHION
              </h2>
              <span style={{ fontSize: '0.68rem', color: '#e879f9', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Royal Ethnic Wear
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.1rem' }}>
            Elevate Your Style with Authentic Royal Collections & Designer Ethnic Wear. Premium Banarasi Sarees, Festive Kurtas & Exclusive Designer Wear.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '7px 10px', borderRadius: '10px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '700' }}>
              <ShieldCheck size={16} color="#e879f9" /> 100% Authentic
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '7px 10px', borderRadius: '10px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '700' }}>
              <Truck size={16} color="#38bdf8" /> Free Shipping
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION LINKS */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.1rem', position: 'relative', display: 'inline-block' }}>
            Quick Navigation
            <span style={{ position: 'absolute', bottom: '-4px', left: 0, width: '30px', height: '3px', background: '#c026d3', borderRadius: '2px' }} />
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
            <li>
              <button
                type="button"
                onClick={onOpenAboutUs}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: '600', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#e879f9')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                › About Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTermsPrivacy && onOpenTermsPrivacy('privacy')}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: '600', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#e879f9')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                › Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTermsPrivacy && onOpenTermsPrivacy('terms')}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: '600', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#e879f9')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                › Terms & Conditions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTermsPrivacy && onOpenTermsPrivacy('terms')}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: '600', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#e879f9')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                › Return Policy
              </button>
            </li>
          </ul>
        </div>

        {/* CONTACT INFORMATION */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.1rem', position: 'relative', display: 'inline-block' }}>
            Contact & Support
            <span style={{ position: 'absolute', bottom: '-4px', left: 0, width: '30px', height: '3px', background: '#c026d3', borderRadius: '2px' }} />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ background: 'rgba(192, 38, 211, 0.25)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <Phone size={15} color="#e879f9" />
              </div>
              <a href="tel:8388886231" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '600' }}>
                +91 8388886231
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ background: 'rgba(192, 38, 211, 0.25)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <Mail size={15} color="#e879f9" />
              </div>
              <a href="mailto:support@diptofashion.in" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '600' }}>
                support@diptofashion.in
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ background: 'rgba(192, 38, 211, 0.25)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <Globe size={15} color="#e879f9" />
              </div>
              <a href="https://diptofashion.in" target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                https://diptofashion.in <ExternalLink size={12} color="#94a3b8" />
              </a>
            </div>
          </div>
        </div>

        {/* TRUST & GUARANTEE */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.1rem', position: 'relative', display: 'inline-block' }}>
            Trust & Security
            <span style={{ position: 'absolute', bottom: '-4px', left: 0, width: '30px', height: '3px', background: '#c026d3', borderRadius: '2px' }} />
          </h3>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#ffffff' }}>
              <Sparkles size={15} color="#e879f9" /> Authentic Craftsmanship
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#ffffff' }}>
              <ShieldCheck size={15} color="#4ade80" /> Razorpay Safe Checkout
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#ffffff' }}>
              <RotateCcw size={15} color="#38bdf8" /> 7-Day Easy Returns
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT BAR */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '1rem',
          paddingBottom: '0.25rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#94a3b8'
        }}
      >
        <p style={{ margin: 0, fontWeight: '600' }}>
          © 2026 Dipto Fashion. All Rights Reserved. 
        </p>
      </div>
    </footer>
  );
};

export default Footer;
