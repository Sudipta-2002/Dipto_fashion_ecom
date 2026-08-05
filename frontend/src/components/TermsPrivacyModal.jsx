import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Truck, CheckCircle } from 'lucide-react';

const TermsPrivacyModal = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 350 }}>
      <div
        className="modal-card"
        style={{ maxWidth: '650px', width: '92%', borderRadius: '16px', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', padding: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={26} color="#e879f9" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Dipto Fashion Policies</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: 0 }}>Terms of Service & Data Privacy Information</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ color: 'white' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              borderBottom: activeTab === 'privacy' ? '3px solid #c026d3' : 'none',
              color: activeTab === 'privacy' ? '#c026d3' : '#64748b',
              background: activeTab === 'privacy' ? 'white' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Lock size={16} /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              borderBottom: activeTab === 'terms' ? '3px solid #c026d3' : 'none',
              color: activeTab === 'terms' ? '#c026d3' : '#64748b',
              background: activeTab === 'terms' ? 'white' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> Terms & Conditions
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
          {activeTab === 'privacy' ? (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                Dipto Fashion Privacy Policy
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                At <strong>Dipto Fashion</strong>, we prioritize your privacy and trust. This policy outlines how your personal information is collected, protected, and utilized when shopping for Sarees and Punjabi Suits on our portal.
              </p>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
                1. Information We Collect
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                We collect essential details required to fulfill your orders safely:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li>Contact details: Name, Email Address, Mobile Number</li>
                <li>Delivery address details including Street, Landmark, and Pincode</li>
                <li>Transaction Reference (UTR / Bank Payment IDs) for order verification</li>
              </ul>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
                2. How We Protect & Use Your Data
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                Your data is stored securely using encrypted database channels. We do NOT sell, rent, or share your personal data with third-party marketers. Data is strictly used for order dispatch, shipment updates, and verification.
              </p>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
                3. Payment Security
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                All payments on Dipto Fashion are made securely via direct UPI QR transfers. We never store bank PINs, card CVVs, or sensitive credentials.
              </p>
            </div>
          ) : (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                Dipto Fashion Terms & Conditions
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                By placing an order on <strong>Dipto Fashion</strong>, you agree to comply with the following operational terms and condition policies.
              </p>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
                1. Order Placement & UTR Verification
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                Orders are registered immediately after scanning the UPI QR code and submitting the valid 12-digit UTR/Bank Reference Number. Orders undergo automated verification prior to dispatch.
              </p>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
                2. Shipping & Estimated Delivery Timeline
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                All orders are processed within 24 hours. Estimated delivery is guaranteed within <strong>7 Business Days</strong> (Today + 7 Days) to your specified delivery address.
              </p>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
                3. Returns & Replacements
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                Dipto Fashion provides a 7-day hassle-free replacement warranty for defective or damaged apparel items.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-primary"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
            onClick={onClose}
          >
            <CheckCircle size={16} /> I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyModal;
