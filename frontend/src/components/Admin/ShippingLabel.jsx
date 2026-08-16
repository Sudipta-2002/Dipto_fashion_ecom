// import React, { useRef } from 'react';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { Download, CheckCircle, ShieldCheck } from 'lucide-react';
// import { formatFullAddress } from '../../utils/addressFormatter';

// const ShippingLabel = ({ order, onClose }) => {
//   const docketRef = useRef(null);

//   if (!order) return null;

//   const downloadPDF = async () => {
//     if (!docketRef.current) return;
//     try {
//       // Ensure all images inside docket are loaded before html2canvas capture
//       const images = docketRef.current.querySelectorAll('img');
//       await Promise.all(
//         Array.from(images).map((img) => {
//           if (img.complete) return Promise.resolve();
//           return new Promise((resolve) => {
//             img.onload = resolve;
//             img.onerror = resolve;
//           });
//         })
//       );

//       const canvas = await html2canvas(docketRef.current, {
//         scale: 2,
//         useCORS: true,
//         allowTaint: true,
//         logging: false
//       });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a5');
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`Shipping-Docket-${order.orderId}.pdf`);
//     } catch (err) {
//       console.error('Error generating PDF:', err);
//       window.print();
//     }
//   };

//   const { orderId, userName, shippingAddress, items, totalAmount, utrNumber } = order;

//   return (
//     <div className="modal-overlay" onClick={onClose} style={{ zIndex: 500 }}>
//       {/* Import Stylish Cursive Fonts for Signature */}
//       <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&display=swap" rel="stylesheet" />

//       <div className="modal-card" style={{ maxWidth: '580px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header" style={{ padding: '0.75rem 1.25rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
//           <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Official Shipping Docket / Dispatch Label</h3>
//           <div style={{ display: 'flex', gap: '0.5rem' }}>
//             <button className="btn-primary" onClick={downloadPDF} style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
//               <Download size={16} /> Download Docket PDF
//             </button>
//             <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
//           </div>
//         </div>

//         <div className="modal-body" style={{ background: '#f8fafc', padding: '1.25rem' }}>
//           {/* Printable Docket Content */}
//           <div
//             ref={docketRef}
//             className="shipping-docket"
//             style={{
//               width: '100%',
//               maxWidth: '500px',
//               background: 'white',
//               border: '2px dashed #000',
//               padding: '1.25rem',
//               color: '#000',
//               fontFamily: 'Arial, sans-serif',
//               margin: '0 auto',
//               boxSizing: 'border-box'
//             }}
//           >
//             {/* Header */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//                 <img src="/logo.jpg" alt="Dipto Fashion" crossOrigin="anonymous" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => (e.target.style.display = 'none')} />
//                 <div>
//                   <h2 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>DIPTO FASHION</h2>
//                   <p style={{ fontSize: '0.72rem', color: '#333', margin: 0, fontWeight: 'bold' }}>Premium Ethnic Apparel & Designer Collections</p>
//                 </div>
//               </div>
//               <div style={{ textAlign: 'right' }}>
//                 <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '900', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
//                   EXPRESS SHIPPING DOCKET
//                 </span>
//                 <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#000', marginTop: '4px' }}>{orderId}</div>
//               </div>
//             </div>

//             {/* Delivery Address Block */}
//             <div style={{ border: '1.5px solid #000', padding: '0.75rem', marginBottom: '0.85rem', background: '#fafafa', borderRadius: '4px' }}>
//               <span style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '4px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>
//                 DELIVER TO (RECIPIENT ADDRESS):
//               </span>
//               <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#000' }}>{shippingAddress?.userName || userName}</div>
//               <div style={{ fontSize: '0.9rem', margin: '4px 0', lineHeight: '1.3' }}>{formatFullAddress(shippingAddress)}</div>
//               <div style={{ fontSize: '0.9rem', fontWeight: '900', marginTop: '6px', background: '#eee', padding: '3px 6px', display: 'inline-block', border: '1px solid #ccc' }}>
//                 PINCODE: {shippingAddress?.pincode} | MOBILE: {shippingAddress?.mobileNumber}
//               </div>
//             </div>

//             {/* Product Summary Table with PROMINENT SIZE DISPLAY */}
//             <div style={{ border: '1.5px solid #000', marginBottom: '0.85rem', borderRadius: '4px', overflow: 'hidden' }}>
//               <div style={{ background: '#000', color: '#fff', padding: '4px 8px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                 ORDERED ITEMS & SIZE SPECIFICATION SUMMARY
//               </div>
//               {items?.map((item, idx) => {
//                 const itemSize = item.selectedSize || (item.name?.toLowerCase().includes('saree') ? 'Free Size' : 'M');
//                 const itemImg = item.image || item.imageUrl || (Array.isArray(item.images) && item.images[0]) || item.product?.image || item.product?.imageUrl || (Array.isArray(item.product?.images) && item.product?.images[0]) || 'https://placehold.co/100x100?text=Product';

//                 return (
//                   <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px', borderBottom: idx < items.length - 1 ? '1px solid #ddd' : 'none', background: idx % 2 === 0 ? '#fff' : '#fcfcfc' }}>
//                     <img
//                       src={itemImg}
//                       alt={item.name}
//                       crossOrigin="anonymous"
//                       style={{ width: '48px', height: '48px', objectFit: 'cover', border: '1px solid #bbb', borderRadius: '4px' }}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = 'https://placehold.co/100x100?text=Product';
//                       }}
//                     />
//                     <div style={{ flex: 1 }}>
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
//                         <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#000' }}>{item.name}</span>
//                         {/* PROMINENT PRODUCT SIZE BADGE */}
//                         <span style={{ background: '#c026d3', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', border: '1px solid #9333ea' }}>
//                           SIZE: {itemSize}
//                         </span>
//                       </div>
//                       <div style={{ fontSize: '0.78rem', color: '#333', marginTop: '3px', fontWeight: '600' }}>
//                         Quantity: <strong>{item.quantity} Pcs</strong> | Unit Price: <strong>₹{item.price?.toLocaleString('en-IN')}</strong> | Selected Size: <strong style={{ color: '#c026d3' }}>{itemSize}</strong>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Payment & Authority Signature Footer */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
//               <div>
//                 <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}><strong>Payment Mode:</strong> Prepaid (UPI Scan)</div>
//                 <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}><strong>Verified UTR:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{utrNumber}</span></div>
//                 <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
//                   <ShieldCheck size={14} /> Payment Verified & Quality Inspected
//                 </div>
//               </div>

//               {/* STYLISH AUTHORITY SIGNATURE ("Sudipta") */}
//               <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
//                 {/* Stylish Calligraphic Signature Sudipta */}
//                 <div
//                   style={{
//                     fontFamily: '"Dancing Script", "Great Vibes", "Caveat", "Brush Script MT", cursive',
//                     fontSize: '1.95rem',
//                     fontWeight: '700',
//                     color: '#0f172a',
//                     letterSpacing: '1px',
//                     transform: 'rotate(-4deg)',
//                     lineHeight: '1',
//                     marginBottom: '2px',
//                     textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.2)'
//                   }}
//                 >
//                   Sudipta
//                 </div>
//                 <div style={{ borderTop: '1.5px solid #000', width: '100%', paddingTop: '2px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                   AUTHORISED SIGNATORY
//                 </div>
//                 <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: '800' }}>
//                   DIPTO FASHION DISPATCH DEPT
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShippingLabel;









import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, ShieldCheck } from 'lucide-react';
import { formatFullAddress } from '../../utils/addressFormatter';

const ShippingLabel = ({ order, onClose, allProducts = [] }) => {
  const docketRef = useRef(null);

  if (!order) return null;

  // Catalog fallback lookup for legacy orders missing image property
  let catalogProducts = allProducts;
  if (!catalogProducts || catalogProducts.length === 0) {
    try {
      const cached = localStorage.getItem('df_storefront_products');
      if (cached) catalogProducts = JSON.parse(cached);
    } catch (e) {}
  }

  // Cloudinary / External image loader helper to convert to Base64 and bypass canvas taint
  const getSafeImageSrc = (rawSrc) => {
    if (!rawSrc) return 'https://placehold.co/100x100?text=Product';

    // Extract correct URL from all possible naming conventions
    let url = typeof rawSrc === 'string' ? rawSrc : rawSrc.url || rawSrc.secure_url || '';

    if (!url) return 'https://placehold.co/100x100?text=Product';

    // If Cloudinary URL, ensure standard delivery optimization
    if (url.includes('cloudinary.com') && !url.includes('f_auto,q_auto')) {
      url = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const downloadPDF = async () => {
    if (!docketRef.current) return;
    try {
      const images = docketRef.current.querySelectorAll('img');

      // Wait until all images (including Cloudinary ones) are loaded
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(docketRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Shipping-Docket-${order.orderId}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    }
  };

  const { orderId, userName, shippingAddress, items, utrNumber } = order;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 500 }}>
      {/* Import Stylish Cursive Fonts for Signature */}
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&display=swap" rel="stylesheet" />

      <div className="modal-card" style={{ maxWidth: '580px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '0.75rem 1.25rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Official Shipping Docket / Dispatch Label</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={downloadPDF} style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              <Download size={16} /> Download Docket PDF
            </button>
            <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc', padding: '1.25rem' }}>
          {/* Printable Docket Content */}
          <div
            ref={docketRef}
            className="shipping-docket"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: 'white',
              border: '2px dashed #000',
              padding: '1.25rem',
              color: '#000',
              fontFamily: 'Arial, sans-serif',
              margin: '0 auto',
              boxSizing: 'border-box'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src="/logo.jpg" alt="Dipto Fashion" crossOrigin="anonymous" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => (e.target.style.display = 'none')} />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>DIPTO FASHION</h2>
                  <p style={{ fontSize: '0.72rem', color: '#333', margin: 0, fontWeight: 'bold' }}>Premium Ethnic Apparel & Designer Collections</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '900', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                  EXPRESS SHIPPING DOCKET
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#000', marginTop: '4px' }}>{orderId}</div>
              </div>
            </div>

            {/* Delivery Address Block */}
            <div style={{ border: '1.5px solid #000', padding: '0.75rem', marginBottom: '0.85rem', background: '#fafafa', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '4px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>
                DELIVER TO (RECIPIENT ADDRESS):
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#000' }}>{shippingAddress?.userName || userName}</div>
              <div style={{ fontSize: '0.9rem', margin: '4px 0', lineHeight: '1.3' }}>{formatFullAddress(shippingAddress)}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '900', marginTop: '6px', background: '#eee', padding: '3px 6px', display: 'inline-block', border: '1px solid #ccc' }}>
                PINCODE: {shippingAddress?.pincode} | MOBILE: {shippingAddress?.mobileNumber}
              </div>
            </div>

            {/* Product Summary Table */}
            <div style={{ border: '1.5px solid #000', marginBottom: '0.85rem', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ background: '#000', color: '#fff', padding: '4px 8px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ORDERED ITEMS & SIZE SPECIFICATION SUMMARY
              </div>
              {items?.map((item, idx) => {
                const itemSize = item.selectedSize || (item.name?.toLowerCase().includes('saree') ? 'Free Size' : 'M');

                // Comprehensive lookup for Cloudinary and localized image paths
                let rawImg =
                  item.image ||
                  item.imageUrl ||
                  item.img ||
                  item.secure_url ||
                  item.thumbnail ||
                  (Array.isArray(item.images) && item.images[0]) ||
                  item.product?.image ||
                  item.product?.imageUrl ||
                  item.product?.secure_url ||
                  (Array.isArray(item.product?.images) && item.product?.images[0]) ||
                  '';

                // Fallback catalog lookup if existing order item lacks image property
                if (!rawImg && Array.isArray(catalogProducts) && catalogProducts.length > 0) {
                  const matchedProduct = catalogProducts.find(
                    (p) =>
                      String(p._id || p.id) === String(item.product || item._id || item.id || item.productId) ||
                      (item.name && p.name && p.name.trim().toLowerCase() === item.name.trim().toLowerCase())
                  );
                  if (matchedProduct) {
                    rawImg = matchedProduct.image || matchedProduct.imageUrl || (Array.isArray(matchedProduct.images) && matchedProduct.images[0]) || '';
                  }
                }

                const itemImg = getSafeImageSrc(rawImg);

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px', borderBottom: idx < items.length - 1 ? '1px solid #ddd' : 'none', background: idx % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                    <div style={{ width: '48px', height: '48px', minWidth: '48px', border: '1px solid #bbb', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={itemImg}
                        alt={item.name || 'Product'}
                        crossOrigin="anonymous"
                        loading="eager"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100?text=Product';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#000' }}>{item.name}</span>
                        {/* PROMINENT PRODUCT SIZE BADGE */}
                        <span style={{ background: '#c026d3', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', border: '1px solid #9333ea' }}>
                          SIZE: {itemSize}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#333', marginTop: '3px', fontWeight: '600' }}>
                        Quantity: <strong>{item.quantity} Pcs</strong> | Unit Price: <strong>₹{item.price?.toLocaleString('en-IN')}</strong> | Selected Size: <strong style={{ color: '#c026d3' }}>{itemSize}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment & Authority Signature Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}><strong>Payment Mode:</strong> Prepaid (UPI Scan)</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}><strong>Verified UTR:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{utrNumber}</span></div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={14} /> Payment Verified & Quality Inspected
                </div>
              </div>

              {/* STYLISH AUTHORITY SIGNATURE ("Sudipta") */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
                <div
                  style={{
                    fontFamily: '"Dancing Script", "Great Vibes", "Caveat", "Brush Script MT", cursive',
                    fontSize: '1.95rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    letterSpacing: '1px',
                    transform: 'rotate(-4deg)',
                    lineHeight: '1',
                    marginBottom: '2px',
                    textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.2)'
                  }}
                >
                  Sudipta
                </div>
                <div style={{ borderTop: '1.5px solid #000', width: '100%', paddingTop: '2px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AUTHORISED SIGNATORY
                </div>
                <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: '800' }}>
                  DIPTO FASHION DISPATCH DEPT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabel;