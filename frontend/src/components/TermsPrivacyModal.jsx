








// // import React, { useState } from 'react';
// // import { X, ShieldCheck, FileText, Lock, CheckCircle } from 'lucide-react';

// // const TermsPrivacyModal = ({ isOpen, onClose, initialTab = 'privacy' }) => {
// //   const [activeTab, setActiveTab] = useState(initialTab);

// //   if (!isOpen) return null;

// //   return (
// //     <div
// //       className="modal-overlay"
// //       style={{
// //         position: 'fixed',
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         bottom: 0,
// //         zIndex: 99999,
// //         backgroundColor: 'rgba(15, 23, 42, 0.75)',
// //         backdropFilter: 'blur(4px)',
// //         WebkitBackdropFilter: 'blur(4px)',
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         padding: '12px'
// //       }}
// //       onClick={onClose}
// //     >
// //       <div
// //         className="modal-card"
// //         style={{
// //           maxWidth: '650px',
// //           width: '100%',
// //           maxHeight: 'calc(100dvh - 80px)',
// //           borderRadius: '16px',
// //           overflow: 'hidden',
// //           display: 'flex',
// //           flexDirection: 'column',
// //           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
// //           background: '#ffffff'
// //         }}
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         {/* 1. Header */}
// //         <div
// //           style={{
// //             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
// //             padding: '1rem 1.25rem',
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //             flexShrink: 0
// //           }}
// //         >
// //           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
// //             <ShieldCheck size={26} color="#e879f9" />
// //             <div>
// //               <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Dipto Fashion Policies</h3>
// //               <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Terms of Service & Data Privacy Information</p>
// //             </div>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             style={{
// //               color: 'white',
// //               background: 'transparent',
// //               border: 'none',
// //               cursor: 'pointer',
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               padding: '4px'
// //             }}
// //           >
// //             <X size={22} />
// //           </button>
// //         </div>

// //         {/* 2. Tab Switcher */}
// //         <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
// //           <button
// //             onClick={() => setActiveTab('privacy')}
// //             style={{
// //               flex: 1,
// //               padding: '0.8rem',
// //               fontWeight: '700',
// //               fontSize: '0.88rem',
// //               borderBottom: activeTab === 'privacy' ? '3px solid #c026d3' : 'none',
// //               color: activeTab === 'privacy' ? '#c026d3' : '#64748b',
// //               background: activeTab === 'privacy' ? 'white' : 'transparent',
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               gap: '0.4rem',
// //               border: 'none',
// //               cursor: 'pointer'
// //             }}
// //           >
// //             <Lock size={16} /> Privacy Policy
// //           </button>
// //           <button
// //             onClick={() => setActiveTab('terms')}
// //             style={{
// //               flex: 1,
// //               padding: '0.8rem',
// //               fontWeight: '700',
// //               fontSize: '0.88rem',
// //               borderBottom: activeTab === 'terms' ? '3px solid #c026d3' : 'none',
// //               color: activeTab === 'terms' ? '#c026d3' : '#64748b',
// //               background: activeTab === 'terms' ? 'white' : 'transparent',
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               gap: '0.4rem',
// //               border: 'none',
// //               cursor: 'pointer'
// //             }}
// //           >
// //             <FileText size={16} /> Terms & Conditions
// //           </button>
// //         </div>

// //         {/* 3. Content Body (Scrollable with Extra Bottom Clearance) */}
// //         <div
// //           style={{
// //             padding: '1.25rem',
// //             paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))', // পর্যাপ্ত বটম স্পেস দেওয়া হয়েছে
// //             overflowY: 'auto',
// //             WebkitOverflowScrolling: 'touch',
// //             flex: 1,
// //             fontSize: '0.88rem',
// //             color: '#334155',
// //             lineHeight: '1.6'
// //           }}
// //         >
// //           {activeTab === 'privacy' ? (
// //             <div>
// //               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.7rem' }}>
// //                 Dipto Fashion Privacy Policy
// //               </h4>
// //               <p style={{ marginBottom: '0.85rem' }}>
// //                 At <strong>Dipto Fashion</strong>, we prioritize your privacy and trust. This policy outlines how your personal information is collected, protected, and utilized when shopping for Sarees and Punjabi Suits on our portal.
// //               </p>

// //               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
// //                 1. Information We Collect
// //               </h5>
// //               <p style={{ marginBottom: '0.75rem' }}>
// //                 We collect essential details required to fulfill your orders safely:
// //               </p>
// //               <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.85rem' }}>
// //                 <li>Contact details: Name, Email Address, Mobile Number</li>
// //                 <li>Delivery address details including Street, Landmark, and Pincode</li>
// //                 <li>Transaction Reference (UTR / Bank Payment IDs) for order verification</li>
// //               </ul>

// //               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
// //                 2. How We Protect & Use Your Data
// //               </h5>
// //               <p style={{ marginBottom: '0.85rem' }}>
// //                 Your data is stored securely using encrypted database channels. We do NOT sell, rent, or share your personal data with third-party marketers. Data is strictly used for order dispatch, shipment updates, and verification.
// //               </p>

// //               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
// //                 3. Payment Security
// //               </h5>
// //               <p style={{ marginBottom: '0.5rem' }}>
// //                 All payments on Dipto Fashion are made securely via direct UPI QR transfers. We never store bank PINs, card CVVs, or sensitive credentials.
// //               </p>
// //             </div>
// //           ) : (
// //             <div>
// //               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.7rem' }}>
// //                 Dipto Fashion Terms & Conditions
// //               </h4>
// //               <p style={{ marginBottom: '0.85rem' }}>
// //                 By placing an order on <strong>Dipto Fashion</strong>, you agree to comply with the following operational terms and condition policies.
// //               </p>

// //               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
// //                 1. Order Placement & UTR Verification
// //               </h5>
// //               <p style={{ marginBottom: '0.75rem' }}>
// //                 Orders are registered immediately after scanning the UPI QR code and submitting the valid 12-digit UTR/Bank Reference Number. Orders undergo automated verification prior to dispatch.
// //               </p>

// //               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
// //                 2. Shipping & Estimated Delivery Timeline
// //               </h5>
// //               <p style={{ marginBottom: '0.75rem' }}>
// //                 All orders are processed within 24 hours. Estimated delivery is guaranteed within <strong>7 Business Days</strong> (Today + 7 Days) to your specified delivery address.
// //               </p>

// //               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
// //                 3. Returns & Replacements
// //               </h5>
// //               <p style={{ marginBottom: '0.5rem' }}>
// //                 Dipto Fashion provides a 7-day hassle-free replacement warranty for defective or damaged apparel items.
// //               </p>
// //             </div>
// //           )}

// //           {/* Centered I Understand Button */}
// //           <div
// //             style={{
// //               marginTop: '1.75rem',
// //               paddingTop: '1rem',
// //               borderTop: '1px solid #f1f5f9',
// //               display: 'flex',
// //               justifyContent: 'center'
// //             }}
// //           >
// //             <button
// //               className="btn-primary"
// //               style={{
// //                 padding: '0.75rem 2.2rem',
// //                 fontSize: '0.92rem',
// //                 display: 'flex',
// //                 alignItems: 'center',
// //                 justifyContent: 'center',
// //                 gap: '8px',
// //                 borderRadius: '12px',
// //                 border: 'none',
// //                 cursor: 'pointer',
// //                 fontWeight: '800',
// //                 boxShadow: '0 4px 12px rgba(192, 38, 211, 0.25)'
// //               }}
// //               onClick={onClose}
// //             >
// //               <CheckCircle size={17} /> I Understand
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default TermsPrivacyModal;








// import React, { useState } from 'react';
// import { X, ShieldCheck, FileText, Lock, CheckCircle } from 'lucide-react';

// const TermsPrivacyModal = ({ isOpen, onClose, initialTab = 'privacy' }) => {
//   const [activeTab, setActiveTab] = useState(initialTab);

//   if (!isOpen) return null;

//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

//   return (
//     <div
//       className="modal-overlay"
//       style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         zIndex: 99999,
//         backgroundColor: 'rgba(15, 23, 42, 0.75)',
//         backdropFilter: 'blur(4px)',
//         WebkitBackdropFilter: 'blur(4px)',
//         display: 'flex',
//         alignItems: isMobile ? 'flex-start' : 'center',
//         justifyContent: 'center',
//         padding: isMobile ? 0 : '12px',
//         overflow: 'hidden'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '650px',
//           width: '100%',
//           height: isMobile ? '100dvh' : 'auto',
//           maxHeight: isMobile ? '100dvh' : 'calc(100dvh - 80px)',
//           borderRadius: isMobile ? '0px' : '16px',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
//           background: '#ffffff',
//           position: 'relative'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* 1. Header (Cancel Order Request Page-er moto safe-area adjusted) */}
//         <div
//           style={{
//             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
//             padding: '0.85rem 1.25rem',
//             paddingTop: isMobile ? 'calc(54px + env(safe-area-inset-top, 0px))' : '1rem',
//             paddingBottom: '0.85rem',
//             color: 'white',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             flexShrink: 0,
//             zIndex: 20,
//             boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//             <ShieldCheck size={26} color="#e879f9" />
//             <div>
//               <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Dipto Fashion Policies</h3>
//               <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Terms of Service & Data Privacy Information</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               color: 'white',
//               background: 'rgba(255, 255, 255, 0.15)',
//               border: 'none',
//               borderRadius: '50%',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               width: '34px',
//               height: '34px',
//               flexShrink: 0
//             }}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* 2. Tab Switcher */}
//         <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
//           <button
//             onClick={() => setActiveTab('privacy')}
//             style={{
//               flex: 1,
//               padding: '0.8rem',
//               fontWeight: '700',
//               fontSize: '0.88rem',
//               borderBottom: activeTab === 'privacy' ? '3px solid #c026d3' : 'none',
//               color: activeTab === 'privacy' ? '#c026d3' : '#64748b',
//               background: activeTab === 'privacy' ? 'white' : 'transparent',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.4rem',
//               border: 'none',
//               cursor: 'pointer'
//             }}
//           >
//             <Lock size={16} /> Privacy Policy
//           </button>
//           <button
//             onClick={() => setActiveTab('terms')}
//             style={{
//               flex: 1,
//               padding: '0.8rem',
//               fontWeight: '700',
//               fontSize: '0.88rem',
//               borderBottom: activeTab === 'terms' ? '3px solid #c026d3' : 'none',
//               color: activeTab === 'terms' ? '#c026d3' : '#64748b',
//               background: activeTab === 'terms' ? 'white' : 'transparent',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '0.4rem',
//               border: 'none',
//               cursor: 'pointer'
//             }}
//           >
//             <FileText size={16} /> Terms & Conditions
//           </button>
//         </div>

//         {/* 3. Content Body (Scrollable with Extra Bottom Clearance) */}
//         <div
//           style={{
//             padding: '1.25rem',
//             paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 20px))' : '1.5rem',
//             overflowY: 'auto',
//             WebkitOverflowScrolling: 'touch',
//             overscrollBehavior: 'contain',
//             flex: 1,
//             fontSize: '0.88rem',
//             color: '#334155',
//             lineHeight: '1.6'
//           }}
//         >
//           {activeTab === 'privacy' ? (
//             <div>
//               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.7rem' }}>
//                 Dipto Fashion Privacy Policy
//               </h4>
//               <p style={{ marginBottom: '0.85rem' }}>
//                 At <strong>Dipto Fashion</strong>, we prioritize your privacy and trust. This policy outlines how your personal information is collected, protected, and utilized when shopping for Sarees and Punjabi Suits on our portal.
//               </p>

//               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
//                 1. Information We Collect
//               </h5>
//               <p style={{ marginBottom: '0.75rem' }}>
//                 We collect essential details required to fulfill your orders safely:
//               </p>
//               <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.85rem' }}>
//                 <li>Contact details: Name, Email Address, Mobile Number</li>
//                 <li>Delivery address details including Street, Landmark, and Pincode</li>
//                 <li>Transaction Reference (UTR / Bank Payment IDs) for order verification</li>
//               </ul>

//               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
//                 2. How We Protect & Use Your Data
//               </h5>
//               <p style={{ marginBottom: '0.85rem' }}>
//                 Your data is stored securely using encrypted database channels. We do NOT sell, rent, or share your personal data with third-party marketers. Data is strictly used for order dispatch, shipment updates, and verification.
//               </p>

//               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
//                 3. Payment Security
//               </h5>
//               <p style={{ marginBottom: '0.5rem' }}>
//                 All payments on Dipto Fashion are made securely via direct UPI QR transfers. We never store bank PINs, card CVVs, or sensitive credentials.
//               </p>
//             </div>
//           ) : (
//             <div>
//               <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.7rem' }}>
//                 Dipto Fashion Terms & Conditions
//               </h4>
//               <p style={{ marginBottom: '0.85rem' }}>
//                 By placing an order on <strong>Dipto Fashion</strong>, you agree to comply with the following operational terms and condition policies.
//               </p>

//               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
//                 1. Order Placement & UTR Verification
//               </h5>
//               <p style={{ marginBottom: '0.75rem' }}>
//                 Orders are registered immediately after scanning the UPI QR code and submitting the valid 12-digit UTR/Bank Reference Number. Orders undergo automated verification prior to dispatch.
//               </p>

//               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
//                 2. Shipping & Estimated Delivery Timeline
//               </h5>
//               <p style={{ marginBottom: '0.75rem' }}>
//                 All orders are processed within 24 hours. Estimated delivery is guaranteed within <strong>7 Business Days</strong> (Today + 7 Days) to your specified delivery address.
//               </p>

//               <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
//                 3. Returns & Replacements
//               </h5>
//               <p style={{ marginBottom: '0.5rem' }}>
//                 Dipto Fashion provides a 7-day hassle-free replacement warranty for defective or damaged apparel items.
//               </p>
//             </div>
//           )}

//           {/* Centered I Understand Button */}
//           <div
//             style={{
//               marginTop: '1.75rem',
//               paddingTop: '1rem',
//               borderTop: '1px solid #f1f5f9',
//               display: 'flex',
//               justifyContent: 'center'
//             }}
//           >
//             <button
//               className="btn-primary"
//               style={{
//                 padding: '0.75rem 2.2rem',
//                 fontSize: '0.92rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '8px',
//                 borderRadius: '12px',
//                 border: 'none',
//                 cursor: 'pointer',
//                 fontWeight: '800',
//                 boxShadow: '0 4px 12px rgba(192, 38, 211, 0.25)'
//               }}
//               onClick={onClose}
//             >
//               <CheckCircle size={17} /> I Understand
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TermsPrivacyModal;










import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle } from 'lucide-react';

const TermsPrivacyModal = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '12px',
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '650px',
          width: '100%',
          height: isMobile ? '100dvh' : 'auto',
          maxHeight: isMobile ? '100dvh' : 'calc(100dvh - 80px)',
          borderRadius: isMobile ? '0px' : '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          background: '#ffffff',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (Gap Adjusted to remove extra space) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            padding: '0.85rem 1.25rem',
            paddingTop: isMobile ? 'calc(10px + env(safe-area-inset-top, 0px))' : '0.85rem',
            paddingBottom: '0.85rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={26} color="#e879f9" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Dipto Fashion Policies</h3>
              <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Terms of Service & Data Privacy Information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              padding: '0.8rem',
              fontWeight: '700',
              fontSize: '0.88rem',
              borderBottom: activeTab === 'privacy' ? '3px solid #c026d3' : 'none',
              color: activeTab === 'privacy' ? '#c026d3' : '#64748b',
              background: activeTab === 'privacy' ? 'white' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Lock size={16} /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              padding: '0.8rem',
              fontWeight: '700',
              fontSize: '0.88rem',
              borderBottom: activeTab === 'terms' ? '3px solid #c026d3' : 'none',
              color: activeTab === 'terms' ? '#c026d3' : '#64748b',
              background: activeTab === 'terms' ? 'white' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FileText size={16} /> Terms & Conditions
          </button>
        </div>

        {/* 3. Content Body */}
        <div
          style={{
            padding: '1.25rem',
            paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 20px))' : '1.5rem',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            flex: 1,
            fontSize: '0.88rem',
            color: '#334155',
            lineHeight: '1.6'
          }}
        >
          {activeTab === 'privacy' ? (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.7rem' }}>
                Dipto Fashion Privacy Policy
              </h4>
              <p style={{ marginBottom: '0.85rem' }}>
                At <strong>Dipto Fashion</strong>, we prioritize your privacy and trust. This policy outlines how your personal information is collected, protected, and utilized when shopping for Sarees and Punjabi Suits on our portal.
              </p>

              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                1. Information We Collect
              </h5>
              <p style={{ marginBottom: '0.75rem' }}>
                We collect essential details required to fulfill your orders safely:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.85rem' }}>
                <li>Contact details: Name, Email Address, Mobile Number</li>
                <li>Delivery address details including Street, Landmark, and Pincode</li>
                <li>Transaction Reference (UTR / Bank Payment IDs) for order verification</li>
              </ul>

              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                2. How We Protect & Use Your Data
              </h5>
              <p style={{ marginBottom: '0.85rem' }}>
                Your data is stored securely using encrypted database channels. We do NOT sell, rent, or share your personal data with third-party marketers. Data is strictly used for order dispatch, shipment updates, and verification.
              </p>

              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                3. Payment Security
              </h5>
              <p style={{ marginBottom: '0.5rem' }}>
                All payments on Dipto Fashion are made securely via direct UPI QR transfers. We never store bank PINs, card CVVs, or sensitive credentials.
              </p>
            </div>
          ) : (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.7rem' }}>
                Dipto Fashion Terms & Conditions
              </h4>
              <p style={{ marginBottom: '0.85rem' }}>
                By placing an order on <strong>Dipto Fashion</strong>, you agree to comply with the following operational terms and condition policies.
              </p>

              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                1. Order Placement & UTR Verification
              </h5>
              <p style={{ marginBottom: '0.75rem' }}>
                Orders are registered immediately after scanning the UPI QR code and submitting the valid 12-digit UTR/Bank Reference Number. Orders undergo automated verification prior to dispatch.
              </p>

              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                2. Shipping & Estimated Delivery Timeline
              </h5>
              <p style={{ marginBottom: '0.75rem' }}>
                All orders are processed within 24 hours. Estimated delivery is guaranteed within <strong>7 Business Days</strong> (Today + 7 Days) to your specified delivery address.
              </p>

              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                3. Returns & Replacements
              </h5>
              <p style={{ marginBottom: '0.5rem' }}>
                Dipto Fashion provides a 7-day hassle-free replacement warranty for defective or damaged apparel items.
              </p>
            </div>
          )}

          {/* Centered I Understand Button */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <button
              className="btn-primary"
              style={{
                padding: '0.75rem 2.2rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '800',
                boxShadow: '0 4px 12px rgba(192, 38, 211, 0.25)'
              }}
              onClick={onClose}
            >
              <CheckCircle size={17} /> I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyModal;