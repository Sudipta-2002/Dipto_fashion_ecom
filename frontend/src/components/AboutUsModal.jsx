// import React from 'react';
// import {
//   X,
//   Sparkles,
//   Award,
//   ShieldCheck,
//   Truck,
//   RotateCcw,
//   Heart,
//   Users,
//   MapPin,
//   CheckCircle2,
//   Phone,
//   Mail,
//   ShoppingBag,
// } from 'lucide-react';
// import Footer from './Footer';

// const AboutUsModal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="modal-overlay" style={{ zIndex: 9999 }}>
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '680px',
//           width: 'min(93%, calc(100vw - 1.5rem))',
//           maxHeight: '88dvh',
//           borderRadius: '20px',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
//           background: '#ffffff'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* HEADER HERO */}
//         <div
//           style={{
//             background: 'linear-gradient(135deg, #701a75 0%, #c026d3 50%, #e879f9 100%)',
//             padding: '1.5rem 1.25rem',
//             color: 'white',
//             position: 'relative',
//             boxShadow: '0 4px 15px rgba(192, 38, 211, 0.3)'
//           }}
//         >
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//               <div
//                 style={{
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '12px',
//                   background: 'rgba(255, 255, 255, 0.2)',
//                   backdropFilter: 'blur(8px)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   border: '1.5px solid rgba(255, 255, 255, 0.4)'
//                 }}
//               >
//                 <Sparkles size={22} color="#ffffff" />
//               </div>
//               <div>
//                 <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, letterSpacing: '-0.3px', color: 'white' }}>
//                   About Dipto Fashion
//                 </h2>
//                 <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9, fontWeight: '600' }}>
//                   Crafting Timeless Indian Ethnic Elegance Since Day One
//                 </p>
//               </div>
//             </div>
//             <button
//               className="close-btn"
//               onClick={onClose}
//               style={{
//                 background: 'rgba(255, 255, 255, 0.2)',
//                 border: 'none',
//                 color: 'white',
//                 width: '34px',
//                 height: '34px',
//                 borderRadius: '50%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer'
//               }}
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* SCROLLABLE BODY */}
//         <div
//           className="about-us-modal-body"
//           style={{
//             padding: '1.25rem',
//             paddingBottom: '1.5rem',
//             overflowY: 'auto',
//             flex: 1,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '1.25rem',
//             background: '#fafafa'
//           }}
//         >
//           {/* OUR STORY BANNER */}
//           <div
//             style={{
//               background: 'white',
//               border: '1.5px solid #f5d0fe',
//               borderRadius: '16px',
//               padding: '1.25rem',
//               boxShadow: '0 2px 8px rgba(192, 38, 211, 0.06)'
//             }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', color: '#701a75', fontWeight: '800', fontSize: '0.95rem' }}>
//               <Heart size={18} color="#c026d3" fill="#c026d3" />
//               <span>Our Story & Commitment</span>
//             </div>
//             <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
//               Welcome to <strong>Dipto Fashion</strong>, your trusted destination for authentic royal ethnic wear, Banarasi sarees, and designer festive outfits. We blend traditional Indian heritage with modern elegance to bring you high-quality fabrics, exquisite embroideries, and handpicked collections for every occasion.
//             </p>
//           </div>

//           {/* BRAND HIGHLIGHTS GRID */}
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
//             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
//               <Award size={24} color="#c026d3" style={{ margin: '0 auto 0.35rem' }} />
//               <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>100% Authentic</div>
//               <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Premium Quality</div>
//             </div>

//             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
//               <Truck size={24} color="#0284c7" style={{ margin: '0 auto 0.35rem' }} />
//               <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Fast Shipping</div>
//               <div style={{ fontSize: '0.72rem', color: '#64748b' }}>All-India Delivery</div>
//             </div>

//             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
//               <RotateCcw size={24} color="#16a34a" style={{ margin: '0 auto 0.35rem' }} />
//               <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>7-Day Returns</div>
//               <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Easy Replacement</div>
//             </div>

//             <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
//               <ShieldCheck size={24} color="#d97706" style={{ margin: '0 auto 0.35rem' }} />
//               <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Safe Payments</div>
//               <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Razorpay Secured</div>
//             </div>
//           </div>

//           {/* WHY CHOOSE US */}
//           <div
//             style={{
//               background: 'white',
//               border: '1px solid #e2e8f0',
//               borderRadius: '16px',
//               padding: '1.1rem'
//             }}
//           >
//             <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <CheckCircle2 size={18} color="#16a34a" /> Why Shop with Dipto Fashion?
//             </div>
//             <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.7' }}>
//               <li><strong>Curated Collections:</strong> Banarasi Sarees, Royal Kurtas, Anarkalis & Festive Wear.</li>
//               <li><strong>Direct Customer Pricing:</strong> Unmatched value with high-grade fabrics and stitching.</li>
//               <li><strong>Secure Razorpay Payments:</strong> 100% safe online payment gateways + Cash on Delivery options.</li>
//               <li><strong>Instant AI & Customer Support:</strong> 24/7 shopping assistance for sizing, order tracking, and queries.</li>
//             </ul>
//           </div>

//           {/* CONTACT & STORE INFORMATION */}
//           <div
//             style={{
//               background: 'linear-gradient(135deg, #fdf4ff, #faf5ff)',
//               border: '1.5px solid #e9d5ff',
//               borderRadius: '16px',
//               padding: '1.1rem',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.65rem'
//             }}
//           >
//             <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#701a75' }}>
//               📍 Store Information & Support
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: '#475569' }}>
//               <MapPin size={16} color="#c026d3" /> <span>Dipto Fashion Outlet & Online Store, India</span>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: '#475569' }}>
//               <Mail size={16} color="#c026d3" /> <span>support@diptofashion.in</span>
//             </div>
//           </div>

//           {/* INTEGRATED FULL FOOTER */}
//           <div style={{ margin: '1rem -1.25rem -1.25rem -1.25rem' }}>
//             <Footer isEmbedded={true} />
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', justifyContent: 'flex-end' }}>
//           <button
//             className="btn-primary"
//             style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '10px' }}
//             onClick={onClose}
//           >
//             Close & Continue Shopping
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AboutUsModal;








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
} from 'lucide-react';
import Footer from './Footer';

const AboutUsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '1rem',
        overflow: 'hidden'
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '680px',
          width: isMobile ? '100%' : 'min(93%, calc(100vw - 1.5rem))',
          height: '100%',
          maxHeight: isMobile ? '100%' : '88dvh',
          borderRadius: isMobile ? '0px' : '20px',
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
            padding: '1.25rem 1.25rem',
            paddingTop: isMobile ? 'calc(0.85rem + env(safe-area-inset-top, 0px))' : '1.25rem',
            color: 'white',
            position: 'relative',
            boxShadow: '0 4px 15px rgba(192, 38, 211, 0.3)',
            flexShrink: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  flexShrink: 0
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
              type="button"
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
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div
          className="about-us-modal-body"
          style={{
            padding: '1.25rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: '#fafafa',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', color: '#701a75', fontWeight: '800', fontSize: '0.95rem' }}>
              <Heart size={18} color="#c026d3" fill="#c026d3" />
              <span>Our Story & Commitment</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
              Welcome to <strong>Dipto Fashion</strong>, your trusted destination for authentic royal ethnic wear, Banarasi sarees, and designer festive outfits. We blend traditional Indian heritage with modern elegance to bring you high-quality fabrics, exquisite embroideries, and handpicked collections for every occasion.
            </p>
          </div>

          {/* BRAND HIGHLIGHTS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
              <Award size={24} color="#c026d3" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>100% Authentic</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Premium Quality</div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
              <Truck size={24} color="#0284c7" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Fast Shipping</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>All-India Delivery</div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
              <RotateCcw size={24} color="#16a34a" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>7-Day Returns</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Easy Replacement</div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
              <ShieldCheck size={24} color="#d97706" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Safe Payments</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Razorpay Secured</div>
            </div>
          </div>

          {/* WHY CHOOSE US */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.1rem'
            }}
          >
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#16a34a" /> Why Shop with Dipto Fashion?
            </div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.7' }}>
              <li><strong>Curated Collections:</strong> Banarasi Sarees, Royal Kurtas, Anarkalis & Festive Wear.</li>
              <li><strong>Direct Customer Pricing:</strong> Unmatched value with high-grade fabrics and stitching.</li>
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
              <Mail size={16} color="#c026d3" /> <span>support@diptofashion.in</span>
            </div>
          </div>

          {/* INTEGRATED FULL FOOTER */}
          <div style={{ margin: '1rem -1.25rem 0 -1.25rem' }}>
            <Footer isEmbedded={true} />
          </div>

          {/* SCROLLABLE CONTINUE SHOPPING BUTTON */}
          <div style={{ paddingTop: '1.25rem', width: '100%', flexShrink: 0 }}>
            <button
              type="button"
              className="btn-primary"
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '0.95rem 1rem', 
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(192, 38, 211, 0.35)',
                display: 'block',
                textAlign: 'center'
              }}
              onClick={onClose}
            >
              Close & Continue Shopping
            </button>
          </div>

          {/* EXTRA BOTTOM BUFFER SPACE (মোবাইলে স্ক্রোল করার পর বটম ন্যাভবারের উপরে পুরো বাটনটিকে তুলে আনবে) */}
          <div 
            style={{ 
              height: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 20px))' : '1.5rem', 
              width: '100%', 
              flexShrink: 0 
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default AboutUsModal;