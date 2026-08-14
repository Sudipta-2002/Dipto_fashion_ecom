



// // import React, { useState, useEffect, useRef } from 'react';
// // import { X, Send, Bot, User, Sparkles } from 'lucide-react';
// // import { API_URL } from '../api';

// // const QUICK_QUESTIONS = [
// //   'What is my last order?',
// //   'How to return an item?',
// //   'Track order status',
// //   'Contact support email'
// // ];

// // const AiChatbotModal = ({ isOpen, onClose, userName, userOrders = [] }) => {
// //   const [messages, setMessages] = useState([
// //     {
// //       sender: 'bot',
// //       text: `Hello ${userName || 'Valued Customer'}! 👋 I am your **Dipto Fashion AI Assistant**. How can I help you with your order status, return process, or shopping today?`
// //     }
// //   ]);
// //   const [inputMsg, setInputMsg] = useState('');
// //   const [typing, setTyping] = useState(false);
// //   const [orders, setOrders] = useState(userOrders);
// //   const chatEndRef = useRef(null);
// //   const messagesContainerRef = useRef(null);

// //   useEffect(() => {
// //     if (isOpen) {
// //       fetchMyOrders();
// //     }
// //   }, [isOpen]);

// //   const fetchMyOrders = async () => {
// //     try {
// //       const token = localStorage.getItem('df_token');
// //       const savedUser = localStorage.getItem('df_user');
// //       let userEmail = '';
// //       if (savedUser) {
// //         try { userEmail = JSON.parse(savedUser).email || ''; } catch (e) {}
// //       }

// //       let url = `${API_URL}/api/user/my-orders`;
// //       if (userEmail) {
// //         url += `?email=${encodeURIComponent(userEmail)}`;
// //       }

// //       const headers = {};
// //       if (token) headers['Authorization'] = `Bearer ${token}`;

// //       const res = await fetch(url, { headers });
// //       if (res.ok) {
// //         const data = await res.json();
// //         const ordersArray = Array.isArray(data) ? data : [];
// //         setOrders(ordersArray);
// //       }
// //     } catch (e) {
// //       console.error('Chatbot order fetch error:', e);
// //     }
// //   };

// //   const scrollToBottom = () => {
// //     if (chatEndRef.current) {
// //       chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
// //     }
// //     if (messagesContainerRef.current) {
// //       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
// //     }
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages, typing]);

// //   // Adjust container height dynamically when mobile keyboard appears
// //   useEffect(() => {
// //     if (!isOpen) return;

// //     const handleResize = () => {
// //       scrollToBottom();
// //     };

// //     if (window.visualViewport) {
// //       window.visualViewport.addEventListener('resize', handleResize);
// //       window.visualViewport.addEventListener('scroll', handleResize);
// //     }

// //     return () => {
// //       if (window.visualViewport) {
// //         window.visualViewport.removeEventListener('resize', handleResize);
// //         window.visualViewport.removeEventListener('scroll', handleResize);
// //       }
// //     };
// //   }, [isOpen]);

// //   if (!isOpen) return null;

// //   const handleSend = (textToSend) => {
// //     const query = textToSend || inputMsg.trim();
// //     if (!query) return;

// //     const newMsgs = [...messages, { sender: 'user', text: query }];
// //     setMessages(newMsgs);
// //     setInputMsg('');
// //     setTyping(true);

// //     setTimeout(() => {
// //       let botResponse = getAiResponse(query);
// //       setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
// //       setTyping(false);
// //     }, 600);
// //   };

// //   const getAiResponse = (userQuery) => {
// //     const q = userQuery.trim();
// //     const qLower = q.toLowerCase();

// //     // 1. ORDER ID LOOKUP DETECTOR
// //     const orderIdRegex = /(DF-?[A-Z0-9]{5,10})/i;
// //     const orderIdMatch = q.match(orderIdRegex);

// //     if (orderIdMatch) {
// //       const searchedId = orderIdMatch[0].toUpperCase().replace('DF', 'DF-');
// //       const foundOrder = orders.find(
// //         (o) => o.orderId.toUpperCase() === searchedId || o.orderId.toUpperCase().replace('-', '') === searchedId.replace('-', '')
// //       );

// //       if (foundOrder) {
// //         const itemsListStr = foundOrder.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
// //         const estDeliveryStr = new Date(new Date(foundOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// //         return `📦 **Order Details for ${foundOrder.orderId}**:
// // • **Status**: ${foundOrder.status}
// // • **Order Date**: ${new Date(foundOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
// // • **Items**:
// // ${itemsListStr}
// // • **Total Amount**: ₹${foundOrder.totalAmount?.toLocaleString('en-IN')}
// // • **UTR Reference**: ${foundOrder.utrNumber}
// // • **Delivery Address**: ${foundOrder.shippingAddress?.userName}, ${foundOrder.shippingAddress?.address} (${foundOrder.shippingAddress?.pincode})
// // • **Estimated Delivery / Schedule**: ${foundOrder.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
// //       } else {
// //         return `🔍 **Order Search Result**:
// // Could not find an active order with ID **"${orderIdMatch[0]}"** in your account.

// // Please verify your Order ID under **Profile -> My Orders** or email support@diptofashion.com for manual lookup!`;
// //       }
// //     }

// //     // 2. LAST / LATEST ORDER DETAILS LOOKUP
// //     if (qLower.includes('last order') || qLower.includes('latest order') || qLower.includes('recent order') || qLower.includes('my order details')) {
// //       if (orders && orders.length > 0) {
// //         const last = orders[0];
// //         const itemsListStr = last.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
// //         const estDeliveryStr = new Date(new Date(last.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// //         return `🛍️ **Your Most Recent Order Details**:
// // • **Order ID**: ${last.orderId}
// // • **Status**: ${last.status}
// // • **Items Ordered**:
// // ${itemsListStr}
// // • **Total Amount**: ₹${last.totalAmount?.toLocaleString('en-IN')}
// // • **UTR Ref**: ${last.utrNumber}
// // • **Est. Delivery Date**: ${last.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
// //       } else {
// //         return `🛍️ You do not have any placed orders yet! Explore our Sarees & Punjabi suits collection on the storefront to place your first order.`;
// //       }
// //     }

// //     // 3. STEP-BY-STEP RETURN PROCESS EXPLANATION
// //     if (qLower.includes('return') || qLower.includes('refund') || qLower.includes('exchange') || qLower.includes('how to return')) {
// //       return `🔄 **Full Step-by-Step Product Return & Refund Guide**:

// // 1️⃣ **Open Your Profile**: Tap the profile icon at top right -> click **My Orders**.
// // 2️⃣ **Select Delivered Order**: Find your order (Returns are eligible within **7 Days** of delivery).
// // 3️⃣ **Click "Request Return"**: Select your return reason and enter your **Bank Details** or **UPI ID** for refund.
// // 4️⃣ **Pickup & Refund**: Our courier partner will pick up the product from your address within **3 Business Days**, and refund will be transferred directly to your bank account / UPI!`;
// //     }

// //     // 4. DELIVERY & SHIPPING TIMELINE
// //     if (qLower.includes('delivery') || qLower.includes('time') || qLower.includes('days') || qLower.includes('shipping')) {
// //       return `🚚 **Express Shipping Timeline**:
// // All Dipto Fashion orders are shipped with **Express Free Shipping** and delivered within **7 Business Days** from order date. Live step tracking is updated in real time under **My Orders**!`;
// //     }

// //     // 5. PAYMENT & UTR SUBMISSION
// //     if (qLower.includes('utr') || qLower.includes('payment') || qLower.includes('qr') || qLower.includes('pay')) {
// //       return `💳 **Payment & UTR Verification**:
// // Scan our store QR code with Google Pay, PhonePe, Paytm, or BHIM UPI. After paying, paste your 12-digit UTR Transaction ID on the checkout page to confirm your order instantly!`;
// //     }

// //     // 6. SIZES & FABRIC CARE
// //     if (qLower.includes('size') || qLower.includes('saree') || qLower.includes('punjabi') || qLower.includes('fabric')) {
// //       return `👗 **Sizes & Garment Specs**:
// // • **Sarees**: Standard 5.5 Meters silk/kanjivaram + 0.8m unstitched blouse piece (Free Size).
// // • **Punjabi Suits & Kurtas**: Standard S (36"), M (38"), L (40"), XL (42"), XXL (44") chest measurements. View size chart on product page for details.`;
// //     }

// //     // 7. GENERAL FALLBACK
// //     return `🤖 Thank you for reaching out! For custom requests or queries outside order tracking and returns:

// // 📧 **Customer Support Email**: support@diptofashion.com
// // 📱 **WhatsApp Helpline**: +91 98765 43210
// // 🕒 **Working Hours**: Mon - Sun (9:00 AM - 10:00 PM)

// // Feel free to ask for your **last order**, enter an **Order ID**, or type **"Return"** for return guide!`;
// //   };

// //   return (
// //     <div
// //       className="modal-overlay"
// //       style={{
// //         zIndex: 999,
// //         position: 'fixed',
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         bottom: 0,
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         background: 'rgba(15, 23, 42, 0.65)',
// //         backdropFilter: 'blur(4px)'
// //       }}
// //       onClick={onClose}
// //     >
// //       <div
// //         className="modal-card"
// //         style={{
// //           maxWidth: '460px',
// //           width: '100%',
// //           height: '100dvh',
// //           maxHeight: 'min(640px, 100dvh)',
// //           borderRadius: window.innerWidth < 640 ? '0px' : '16px',
// //           display: 'flex',
// //           flexDirection: 'column',
// //           overflow: 'hidden',
// //           background: '#ffffff',
// //           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
// //           position: 'relative'
// //         }}
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         {/* Header */}
// //         <div
// //           style={{
// //             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
// //             padding: '0.85rem 1.15rem',
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //             flexShrink: 0
// //           }}
// //         >
// //           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
// //             <div
// //               style={{
// //                 width: '36px',
// //                 height: '36px',
// //                 borderRadius: '50%',
// //                 background: 'rgba(255,255,255,0.2)',
// //                 display: 'flex',
// //                 alignItems: 'center',
// //                 justifyContent: 'center',
// //                 flexShrink: 0
// //               }}
// //             >
// //               <Bot size={22} color="#e879f9" />
// //             </div>
// //             <div>
// //               <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
// //                 Dipto AI Assistant <Sparkles size={14} color="#facc15" />
// //               </h3>
// //               <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Smart Order Tracking & Support</p>
// //             </div>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             style={{
// //               background: 'rgba(255,255,255,0.15)',
// //               border: 'none',
// //               borderRadius: '50%',
// //               width: '32px',
// //               height: '32px',
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               color: 'white',
// //               cursor: 'pointer'
// //             }}
// //           >
// //             <X size={18} />
// //           </button>
// //         </div>

// //         {/* Quick Question Chips */}
// //         <div
// //           style={{
// //             background: '#f8fafc',
// //             padding: '0.5rem 0.85rem',
// //             borderBottom: '1px solid #e2e8f0',
// //             display: 'flex',
// //             gap: '0.4rem',
// //             overflowX: 'auto',
// //             whiteSpace: 'nowrap',
// //             flexShrink: 0,
// //             WebkitOverflowScrolling: 'touch'
// //           }}
// //         >
// //           {QUICK_QUESTIONS.map((q, idx) => (
// //             <button
// //               key={idx}
// //               type="button"
// //               onClick={() => handleSend(q)}
// //               style={{
// //                 background: 'white',
// //                 border: '1px solid #cbd5e1',
// //                 borderRadius: '16px',
// //                 padding: '4px 10px',
// //                 fontSize: '0.73rem',
// //                 fontWeight: '700',
// //                 color: '#c026d3',
// //                 cursor: 'pointer',
// //                 flexShrink: 0
// //               }}
// //             >
// //               {q}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Chat Messages */}
// //         <div
// //           ref={messagesContainerRef}
// //           style={{
// //             flex: 1,
// //             padding: '1rem',
// //             overflowY: 'auto',
// //             background: '#ffffff',
// //             display: 'flex',
// //             flexDirection: 'column',
// //             gap: '0.85rem',
// //             WebkitOverflowScrolling: 'touch'
// //           }}
// //         >
// //           {messages.map((m, idx) => (
// //             <div
// //               key={idx}
// //               style={{
// //                 display: 'flex',
// //                 gap: '0.6rem',
// //                 flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
// //                 alignItems: 'flex-start'
// //               }}
// //             >
// //               <div
// //                 style={{
// //                   width: '30px',
// //                   height: '30px',
// //                   borderRadius: '50%',
// //                   background: m.sender === 'user' ? '#c026d3' : '#f0fdf4',
// //                   color: m.sender === 'user' ? 'white' : '#16a34a',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   fontSize: '0.75rem',
// //                   fontWeight: '800',
// //                   border: m.sender === 'bot' ? '1px solid #bbf7d0' : 'none',
// //                   flexShrink: 0
// //                 }}
// //               >
// //                 {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
// //               </div>
// //               <div
// //                 style={{
// //                   maxWidth: '82%',
// //                   background: m.sender === 'user' ? '#c026d3' : '#f8fafc',
// //                   color: m.sender === 'user' ? 'white' : '#0f172a',
// //                   padding: '0.75rem 0.95rem',
// //                   borderRadius: '14px',
// //                   fontSize: '0.84rem',
// //                   lineHeight: '1.5',
// //                   border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
// //                   whiteSpace: 'pre-line',
// //                   wordBreak: 'break-word'
// //                 }}
// //               >
// //                 {m.text}
// //               </div>
// //             </div>
// //           ))}

// //           {typing && (
// //             <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
// //               <div
// //                 style={{
// //                   width: '30px',
// //                   height: '30px',
// //                   borderRadius: '50%',
// //                   background: '#f0fdf4',
// //                   color: '#16a34a',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   flexShrink: 0
// //                 }}
// //               >
// //                 <Bot size={16} />
// //               </div>
// //               <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.85rem', borderRadius: '14px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
// //                 Dipto AI is checking your orders...
// //               </div>
// //             </div>
// //           )}
// //           <div ref={chatEndRef} style={{ height: '1px' }} />
// //         </div>

// //         {/* Input Bar (Stick to keyboard on mobile) */}
// //         <form
// //           onSubmit={(e) => {
// //             e.preventDefault();
// //             handleSend();
// //           }}
// //           style={{
// //             padding: '0.65rem 0.75rem',
// //             paddingBottom: 'calc(0.65rem + env(safe-area-inset-bottom))',
// //             background: '#f8fafc',
// //             borderTop: '1.5px solid #e2e8f0',
// //             display: 'flex',
// //             gap: '0.5rem',
// //             alignItems: 'center',
// //             flexShrink: 0
// //           }}
// //         >
// //           <input
// //             type="text"
// //             placeholder="Enter Order ID, ask 'last order' or 'return'..."
// //             value={inputMsg}
// //             onFocus={() => {
// //               setTimeout(scrollToBottom, 250);
// //             }}
// //             onChange={(e) => setInputMsg(e.target.value)}
// //             style={{
// //               flex: 1,
// //               padding: '0.65rem 1rem',
// //               border: '1.5px solid #cbd5e1',
// //               borderRadius: '24px',
// //               fontSize: '0.9rem',
// //               outline: 'none',
// //               background: '#ffffff',
// //               color: '#0f172a'
// //             }}
// //           />
// //           <button
// //             type="submit"
// //             className="btn-primary"
// //             style={{
// //               borderRadius: '50%',
// //               width: '42px',
// //               height: '42px',
// //               minWidth: '42px',
// //               padding: 0,
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               background: inputMsg.trim() ? '#c026d3' : '#cbd5e1',
// //               border: 'none',
// //               cursor: inputMsg.trim() ? 'pointer' : 'default',
// //               transition: 'background 0.2s ease'
// //             }}
// //             disabled={!inputMsg.trim()}
// //           >
// //             <Send size={18} color="white" />
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AiChatbotModal;



// import React, { useState, useEffect, useRef } from 'react';
// import { X, Send, Bot, User, Sparkles } from 'lucide-react';
// import { API_URL } from '../api';

// const QUICK_QUESTIONS = [
//   'What is my last order?',
//   'How to return an item?',
//   'Track order status',
//   'Contact support email'
// ];

// const AiChatbotModal = ({ isOpen, onClose, userName, userOrders = [] }) => {
//   const [messages, setMessages] = useState([
//     {
//       sender: 'bot',
//       text: `Hello ${userName || 'Valued Customer'}! 👋 I am your **Dipto Fashion AI Assistant**. How can I help you with your order status, return process, or shopping today?`
//     }
//   ]);
//   const [inputMsg, setInputMsg] = useState('');
//   const [typing, setTyping] = useState(false);
//   const [orders, setOrders] = useState(userOrders);
  
//   // Dynamic mobile viewport height state
//   const [viewportHeight, setViewportHeight] = useState('100%');
  
//   const chatEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (isOpen) {
//       fetchMyOrders();
//     }
//   }, [isOpen]);

//   const fetchMyOrders = async () => {
//     try {
//       const token = localStorage.getItem('df_token');
//       const savedUser = localStorage.getItem('df_user');
//       let userEmail = '';
//       if (savedUser) {
//         try { userEmail = JSON.parse(savedUser).email || ''; } catch (e) {}
//       }

//       let url = `${API_URL}/api/user/my-orders`;
//       if (userEmail) {
//         url += `?email=${encodeURIComponent(userEmail)}`;
//       }

//       const headers = {};
//       if (token) headers['Authorization'] = `Bearer ${token}`;

//       const res = await fetch(url, { headers });
//       if (res.ok) {
//         const data = await res.json();
//         const ordersArray = Array.isArray(data) ? data : [];
//         setOrders(ordersArray);
//       }
//     } catch (e) {
//       console.error('Chatbot order fetch error:', e);
//     }
//   };

//   // Ultra-smooth robust auto-scroll
//   const scrollToBottom = (instant = false) => {
//     requestAnimationFrame(() => {
//       if (messagesContainerRef.current) {
//         messagesContainerRef.current.scrollTo({
//           top: messagesContainerRef.current.scrollHeight,
//           behavior: instant ? 'auto' : 'smooth'
//         });
//       }
//       if (chatEndRef.current) {
//         chatEndRef.current.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'end' });
//       }
//     });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, typing]);

//   // Handle Virtual Keyboard appearance on iOS and Android
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleViewportChange = () => {
//       if (window.visualViewport) {
//         const currentHeight = window.visualViewport.height;
//         setViewportHeight(`${currentHeight}px`);
//         scrollToBottom(true);
//       }
//     };

//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', handleViewportChange);
//       window.visualViewport.addEventListener('scroll', handleViewportChange);
//       handleViewportChange();
//     }

//     return () => {
//       if (window.visualViewport) {
//         window.visualViewport.removeEventListener('resize', handleViewportChange);
//         window.visualViewport.removeEventListener('scroll', handleViewportChange);
//       }
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleSend = (textToSend) => {
//     const query = textToSend || inputMsg.trim();
//     if (!query) return;

//     const newMsgs = [...messages, { sender: 'user', text: query }];
//     setMessages(newMsgs);
//     setInputMsg('');
//     setTyping(true);

//     setTimeout(() => {
//       let botResponse = getAiResponse(query);
//       setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
//       setTyping(false);
//     }, 600);
//   };

//   const getAiResponse = (userQuery) => {
//     const q = userQuery.trim();
//     const qLower = q.toLowerCase();

//     // 1. ORDER ID LOOKUP DETECTOR
//     const orderIdRegex = /(DF-?[A-Z0-9]{5,10})/i;
//     const orderIdMatch = q.match(orderIdRegex);

//     if (orderIdMatch) {
//       const searchedId = orderIdMatch[0].toUpperCase().replace('DF', 'DF-');
//       const foundOrder = orders.find(
//         (o) => o.orderId.toUpperCase() === searchedId || o.orderId.toUpperCase().replace('-', '') === searchedId.replace('-', '')
//       );

//       if (foundOrder) {
//         const itemsListStr = foundOrder.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
//         const estDeliveryStr = new Date(new Date(foundOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

//         return `📦 **Order Details for ${foundOrder.orderId}**:
// • **Status**: ${foundOrder.status}
// • **Order Date**: ${new Date(foundOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
// • **Items**:
// ${itemsListStr}
// • **Total Amount**: ₹${foundOrder.totalAmount?.toLocaleString('en-IN')}
// • **UTR Reference**: ${foundOrder.utrNumber}
// • **Delivery Address**: ${foundOrder.shippingAddress?.userName}, ${foundOrder.shippingAddress?.address} (${foundOrder.shippingAddress?.pincode})
// • **Estimated Delivery / Schedule**: ${foundOrder.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
//       } else {
//         return `🔍 **Order Search Result**:
// Could not find an active order with ID **"${orderIdMatch[0]}"** in your account.

// Please verify your Order ID under **Profile -> My Orders** or email support@diptofashion.com for manual lookup!`;
//       }
//     }

//     // 2. LAST / LATEST ORDER DETAILS LOOKUP
//     if (qLower.includes('last order') || qLower.includes('latest order') || qLower.includes('recent order') || qLower.includes('my order details')) {
//       if (orders && orders.length > 0) {
//         const last = orders[0];
//         const itemsListStr = last.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
//         const estDeliveryStr = new Date(new Date(last.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

//         return `🛍️ **Your Most Recent Order Details**:
// • **Order ID**: ${last.orderId}
// • **Status**: ${last.status}
// • **Items Ordered**:
// ${itemsListStr}
// • **Total Amount**: ₹${last.totalAmount?.toLocaleString('en-IN')}
// • **UTR Ref**: ${last.utrNumber}
// • **Est. Delivery Date**: ${last.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
//       } else {
//         return `🛍️ You do not have any placed orders yet! Explore our Sarees & Punjabi suits collection on the storefront to place your first order.`;
//       }
//     }

//     // 3. STEP-BY-STEP RETURN PROCESS EXPLANATION
//     if (qLower.includes('return') || qLower.includes('refund') || qLower.includes('exchange') || qLower.includes('how to return')) {
//       return `🔄 **Full Step-by-Step Product Return & Refund Guide**:

// 1️⃣ **Open Your Profile**: Tap the profile icon at top right -> click **My Orders**.
// 2️⃣ **Select Delivered Order**: Find your order (Returns are eligible within **7 Days** of delivery).
// 3️⃣ **Click "Request Return"**: Select your return reason and enter your **Bank Details** or **UPI ID** for refund.
// 4️⃣ **Pickup & Refund**: Our courier partner will pick up the product from your address within **3 Business Days**, and refund will be transferred directly to your bank account / UPI!`;
//     }

//     // 4. DELIVERY & SHIPPING TIMELINE
//     if (qLower.includes('delivery') || qLower.includes('time') || qLower.includes('days') || qLower.includes('shipping')) {
//       return `🚚 **Express Shipping Timeline**:
// All Dipto Fashion orders are shipped with **Express Free Shipping** and delivered within **7 Business Days** from order date. Live step tracking is updated in real time under **My Orders**!`;
//     }

//     // 5. PAYMENT & UTR SUBMISSION
//     if (qLower.includes('utr') || qLower.includes('payment') || qLower.includes('qr') || qLower.includes('pay')) {
//       return `💳 **Payment & UTR Verification**:
// Scan our store QR code with Google Pay, PhonePe, Paytm, or BHIM UPI. After paying, paste your 12-digit UTR Transaction ID on the checkout page to confirm your order instantly!`;
//     }

//     // 6. SIZES & FABRIC CARE
//     if (qLower.includes('size') || qLower.includes('saree') || qLower.includes('punjabi') || qLower.includes('fabric')) {
//       return `👗 **Sizes & Garment Specs**:
// • **Sarees**: Standard 5.5 Meters silk/kanjivaram + 0.8m unstitched blouse piece (Free Size).
// • **Punjabi Suits & Kurtas**: Standard S (36"), M (38"), L (40"), XL (42"), XXL (44") chest measurements. View size chart on product page for details.`;
//     }

//     // 7. GENERAL FALLBACK
//     return `🤖 Thank you for reaching out! For custom requests or queries outside order tracking and returns:

// 📧 **Customer Support Email**: support@diptofashion.com
// 📱 **WhatsApp Helpline**: +91 98765 43210
// 🕒 **Working Hours**: Mon - Sun (9:00 AM - 10:00 PM)

// Feel free to ask for your **last order**, enter an **Order ID**, or type **"Return"** for return guide!`;
//   };

//   return (
//     <div
//       className="modal-overlay"
//       style={{
//         zIndex: 999,
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         height: viewportHeight,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         background: 'rgba(15, 23, 42, 0.65)',
//         backdropFilter: 'blur(4px)'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '460px',
//           width: '100%',
//           height: '100%',
//           maxHeight: '100%',
//           borderRadius: window.innerWidth < 640 ? '0px' : '16px',
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: 'hidden',
//           background: '#ffffff',
//           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
//           position: 'relative'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           style={{
//             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
//             padding: '0.85rem 1.15rem',
//             color: 'white',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             flexShrink: 0
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//             <div
//               style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '50%',
//                 background: 'rgba(255,255,255,0.2)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 flexShrink: 0
//               }}
//             >
//               <Bot size={22} color="#e879f9" />
//             </div>
//             <div>
//               <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
//                 Dipto AI Assistant <Sparkles size={14} color="#facc15" />
//               </h3>
//               <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Smart Order Tracking & Support</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: 'rgba(255,255,255,0.15)',
//               border: 'none',
//               borderRadius: '50%',
//               width: '32px',
//               height: '32px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               cursor: 'pointer'
//             }}
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Quick Question Chips */}
//         <div
//           style={{
//             background: '#f8fafc',
//             padding: '0.5rem 0.85rem',
//             borderBottom: '1px solid #e2e8f0',
//             display: 'flex',
//             gap: '0.4rem',
//             overflowX: 'auto',
//             whiteSpace: 'nowrap',
//             flexShrink: 0,
//             WebkitOverflowScrolling: 'touch'
//           }}
//         >
//           {QUICK_QUESTIONS.map((q, idx) => (
//             <button
//               key={idx}
//               type="button"
//               onClick={() => handleSend(q)}
//               style={{
//                 background: 'white',
//                 border: '1px solid #cbd5e1',
//                 borderRadius: '16px',
//                 padding: '4px 10px',
//                 fontSize: '0.73rem',
//                 fontWeight: '700',
//                 color: '#c026d3',
//                 cursor: 'pointer',
//                 flexShrink: 0
//               }}
//             >
//               {q}
//             </button>
//           ))}
//         </div>

//         {/* Chat Messages Container */}
//         <div
//           ref={messagesContainerRef}
//           style={{
//             flex: 1,
//             padding: '1rem',
//             overflowY: 'auto',
//             background: '#ffffff',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.85rem',
//             WebkitOverflowScrolling: 'touch',
//             overscrollBehavior: 'contain'
//           }}
//         >
//           {messages.map((m, idx) => (
//             <div
//               key={idx}
//               style={{
//                 display: 'flex',
//                 gap: '0.6rem',
//                 flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
//                 alignItems: 'flex-start'
//               }}
//             >
//               <div
//                 style={{
//                   width: '30px',
//                   height: '30px',
//                   borderRadius: '50%',
//                   background: m.sender === 'user' ? '#c026d3' : '#f0fdf4',
//                   color: m.sender === 'user' ? 'white' : '#16a34a',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '0.75rem',
//                   fontWeight: '800',
//                   border: m.sender === 'bot' ? '1px solid #bbf7d0' : 'none',
//                   flexShrink: 0
//                 }}
//               >
//                 {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
//               </div>
//               <div
//                 style={{
//                   maxWidth: '82%',
//                   background: m.sender === 'user' ? '#c026d3' : '#f8fafc',
//                   color: m.sender === 'user' ? 'white' : '#0f172a',
//                   padding: '0.75rem 0.95rem',
//                   borderRadius: '14px',
//                   fontSize: '0.84rem',
//                   lineHeight: '1.5',
//                   border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
//                   whiteSpace: 'pre-line',
//                   wordBreak: 'break-word'
//                 }}
//               >
//                 {m.text}
//               </div>
//             </div>
//           ))}

//           {typing && (
//             <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
//               <div
//                 style={{
//                   width: '30px',
//                   height: '30px',
//                   borderRadius: '50%',
//                   background: '#f0fdf4',
//                   color: '#16a34a',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   flexShrink: 0
//                 }}
//               >
//                 <Bot size={16} />
//               </div>
//               <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.85rem', borderRadius: '14px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
//                 Dipto AI is checking your orders...
//               </div>
//             </div>
//           )}
//           <div ref={chatEndRef} style={{ height: '2px', flexShrink: 0 }} />
//         </div>

//         {/* Input Bar (Locks directly on top of keyboard) */}
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleSend();
//           }}
//           style={{
//             padding: '0.65rem 0.75rem',
//             paddingBottom: 'calc(0.65rem + env(safe-area-inset-bottom))',
//             background: '#f8fafc',
//             borderTop: '1.5px solid #e2e8f0',
//             display: 'flex',
//             gap: '0.5rem',
//             alignItems: 'center',
//             flexShrink: 0
//           }}
//         >
//           <input
//             ref={inputRef}
//             type="text"
//             placeholder="Enter Order ID, ask 'last order' or 'return'..."
//             value={inputMsg}
//             onFocus={() => {
//               setTimeout(() => {
//                 scrollToBottom(true);
//               }, 300);
//             }}
//             onChange={(e) => setInputMsg(e.target.value)}
//             style={{
//               flex: 1,
//               padding: '0.65rem 1rem',
//               border: '1.5px solid #cbd5e1',
//               borderRadius: '24px',
//               fontSize: '0.9rem',
//               outline: 'none',
//               background: '#ffffff',
//               color: '#0f172a'
//             }}
//           />
//           <button
//             type="submit"
//             className="btn-primary"
//             style={{
//               borderRadius: '50%',
//               width: '42px',
//               height: '42px',
//               minWidth: '42px',
//               padding: 0,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               background: inputMsg.trim() ? '#c026d3' : '#cbd5e1',
//               border: 'none',
//               cursor: inputMsg.trim() ? 'pointer' : 'default',
//               transition: 'background 0.2s ease'
//             }}
//             disabled={!inputMsg.trim()}
//           >
//             <Send size={18} color="white" />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AiChatbotModal;








//final version

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { API_URL } from '../api';

const QUICK_QUESTIONS = [
  'What is my last order?',
  'How to return an item?',
  'Track order status',
  'Contact support email'
];

const AiChatbotModal = ({ isOpen, onClose, userName, userOrders = [] }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${userName || 'Valued Customer'}! 👋 I am your **Dipto Fashion AI Assistant**. How can I help you with your order status, return process, or shopping today?`
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const [orders, setOrders] = useState(userOrders);

  // Dynamic visual viewport state for mobile keyboards
  const [viewportStyle, setViewportStyle] = useState({
    height: '100dvh',
    top: '0px'
  });

  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchMyOrders();
    }
  }, [isOpen]);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('df_token');
      const savedUser = localStorage.getItem('df_user');
      let userEmail = '';
      if (savedUser) {
        try { userEmail = JSON.parse(savedUser).email || ''; } catch (e) {}
      }

      let url = `${API_URL}/api/user/my-orders`;
      if (userEmail) {
        url += `?email=${encodeURIComponent(userEmail)}`;
      }

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);
      }
    } catch (e) {
      console.error('Chatbot order fetch error:', e);
    }
  };

  // Smooth & Accurate Auto-Scroll to bottom
  const scrollToBottom = (instant = false) => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: instant ? 'auto' : 'smooth'
        });
      }
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({
          behavior: instant ? 'auto' : 'smooth',
          block: 'end'
        });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Handle Mobile Virtual Keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        setViewportStyle({
          height: `${window.visualViewport.height}px`,
          top: `${window.visualViewport.offsetTop}px`
        });
        scrollToBottom(true);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || inputMsg.trim();
    if (!query) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    setInputMsg('');
    setTyping(true);

    setTimeout(() => {
      let botResponse = getAiResponse(query);
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      setTyping(false);
    }, 500);
  };

  const getAiResponse = (userQuery) => {
    const q = userQuery.trim();
    const qLower = q.toLowerCase();

    // 1. ORDER ID LOOKUP DETECTOR
    const orderIdRegex = /(DF-?[A-Z0-9]{5,10})/i;
    const orderIdMatch = q.match(orderIdRegex);

    if (orderIdMatch) {
      const searchedId = orderIdMatch[0].toUpperCase().replace('DF', 'DF-');
      const foundOrder = orders.find(
        (o) => o.orderId.toUpperCase() === searchedId || o.orderId.toUpperCase().replace('-', '') === searchedId.replace('-', '')
      );

      if (foundOrder) {
        const itemsListStr = foundOrder.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
        const estDeliveryStr = new Date(new Date(foundOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        return `📦 **Order Details for ${foundOrder.orderId}**:
• **Status**: ${foundOrder.status}
• **Order Date**: ${new Date(foundOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
• **Items**:
${itemsListStr}
• **Total Amount**: ₹${foundOrder.totalAmount?.toLocaleString('en-IN')}
• **UTR Reference**: ${foundOrder.utrNumber}
• **Delivery Address**: ${foundOrder.shippingAddress?.userName}, ${foundOrder.shippingAddress?.address} (${foundOrder.shippingAddress?.pincode})
• **Estimated Delivery / Schedule**: ${foundOrder.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
      } else {
        return `🔍 **Order Search Result**:
Could not find an active order with ID **"${orderIdMatch[0]}"** in your account.

Please verify your Order ID under **Profile -> My Orders** or email support@diptofashion.com for manual lookup!`;
      }
    }

    // 2. LAST / LATEST ORDER DETAILS LOOKUP
    if (qLower.includes('last order') || qLower.includes('latest order') || qLower.includes('recent order') || qLower.includes('my order details')) {
      if (orders && orders.length > 0) {
        const last = orders[0];
        const itemsListStr = last.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
        const estDeliveryStr = new Date(new Date(last.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        return `🛍️ **Your Most Recent Order Details**:
• **Order ID**: ${last.orderId}
• **Status**: ${last.status}
• **Items Ordered**:
${itemsListStr}
• **Total Amount**: ₹${last.totalAmount?.toLocaleString('en-IN')}
• **UTR Ref**: ${last.utrNumber}
• **Est. Delivery Date**: ${last.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
      } else {
        return `🛍️ You do not have any placed orders yet! Explore our Sarees & Punjabi suits collection on the storefront to place your first order.`;
      }
    }

    // 3. STEP-BY-STEP RETURN PROCESS EXPLANATION
    if (qLower.includes('return') || qLower.includes('refund') || qLower.includes('exchange') || qLower.includes('how to return')) {
      return `🔄 **Full Step-by-Step Product Return & Refund Guide**:

1️⃣ **Open Your Profile**: Tap the profile icon at top right -> click **My Orders**.
2️⃣ **Select Delivered Order**: Find your order (Returns are eligible within **7 Days** of delivery).
3️⃣ **Click "Request Return"**: Select your return reason and enter your **Bank Details** or **UPI ID** for refund.
4️⃣ **Pickup & Refund**: Our courier partner will pick up the product from your address within **3 Business Days**, and refund will be transferred directly to your bank account / UPI!`;
    }

    // 4. DELIVERY & SHIPPING TIMELINE
    if (qLower.includes('delivery') || qLower.includes('time') || qLower.includes('days') || qLower.includes('shipping')) {
      return `🚚 **Express Shipping Timeline**:
All Dipto Fashion orders are shipped with **Express Free Shipping** and delivered within **7 Business Days** from order date. Live step tracking is updated in real time under **My Orders**!`;
    }

    // 5. PAYMENT & UTR SUBMISSION
    if (qLower.includes('utr') || qLower.includes('payment') || qLower.includes('qr') || qLower.includes('pay')) {
      return `💳 **Payment & UTR Verification**:
Scan our store QR code with Google Pay, PhonePe, Paytm, or BHIM UPI. After paying, paste your 12-digit UTR Transaction ID on the checkout page to confirm your order instantly!`;
    }

    // 6. SIZES & FABRIC CARE
    if (qLower.includes('size') || qLower.includes('saree') || qLower.includes('punjabi') || qLower.includes('fabric')) {
      return `👗 **Sizes & Garment Specs**:
• **Sarees**: Standard 5.5 Meters silk/kanjivaram + 0.8m unstitched blouse piece (Free Size).
• **Punjabi Suits & Kurtas**: Standard S (36"), M (38"), L (40"), XL (42"), XXL (44") chest measurements. View size chart on product page for details.`;
    }

    // 7. GENERAL FALLBACK
    return `🤖 Thank you for reaching out! For custom requests or queries outside order tracking and returns:

📧 **Customer Support Email**: support@diptofashion.com
📱 **WhatsApp Helpline**: +91 98765 43210
🕒 **Working Hours**: Mon - Sun (9:00 AM - 10:00 PM)

Feel free to ask for your **last order**, enter an **Order ID**, or type **"Return"** for return guide!`;
  };

  const modalContent = (
    <div
      className="modal-overlay"
      style={{
        zIndex: 999999, // Mounted directly to body, strictly above bottom nav
        position: 'fixed',
        top: viewportStyle.top,
        left: 0,
        right: 0,
        height: viewportStyle.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: window.innerWidth < 640 ? '#ffffff' : 'rgba(15, 23, 42, 0.75)',
        backdropFilter: window.innerWidth < 640 ? 'none' : 'blur(4px)',
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          borderRadius: window.innerWidth < 640 ? '0px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            padding: '0.85rem 1.15rem',
            paddingTop: 'calc(0.85rem + env(safe-area-inset-top, 0px))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bot size={22} color="#e879f9" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Dipto AI Assistant <Sparkles size={14} color="#facc15" />
              </h3>
              <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: 0 }}>Smart Order Tracking & Support</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div
          style={{
            background: '#f8fafc',
            padding: '0.55rem 0.85rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              style={{
                background: 'white',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '4px 11px',
                fontSize: '0.74rem',
                fontWeight: '700',
                color: '#c026d3',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Container */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.6rem',
                flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: m.sender === 'user' ? '#c026d3' : '#f0fdf4',
                  color: m.sender === 'user' ? 'white' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  border: m.sender === 'bot' ? '1px solid #bbf7d0' : 'none',
                  flexShrink: 0
                }}
              >
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                style={{
                  maxWidth: '82%',
                  background: m.sender === 'user' ? '#c026d3' : '#f8fafc',
                  color: m.sender === 'user' ? 'white' : '#0f172a',
                  padding: '0.75rem 0.95rem',
                  borderRadius: '14px',
                  fontSize: '0.84rem',
                  lineHeight: '1.5',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Bot size={16} />
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.85rem', borderRadius: '14px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                Dipto AI is checking your orders...
              </div>
            </div>
          )}
          <div ref={chatEndRef} style={{ height: '4px', flexShrink: 0 }} />
        </div>

        {/* Message Input Bar (Always completely visible above bottom nav & locks to virtual keyboard) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '0.65rem 0.75rem',
            paddingBottom: 'calc(0.65rem + env(safe-area-inset-bottom, 8px))',
            background: '#ffffff',
            borderTop: '1.5px solid #e2e8f0',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexShrink: 0,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter Order ID, ask 'last order' or 'return'..."
            value={inputMsg}
            onFocus={() => {
              setTimeout(() => {
                scrollToBottom(true);
              }, 250);
            }}
            onChange={(e) => setInputMsg(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              border: '1.5px solid #cbd5e1',
              borderRadius: '24px',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              minWidth: '42px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: inputMsg.trim() ? 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)' : '#e2e8f0',
              border: 'none',
              cursor: inputMsg.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              boxShadow: inputMsg.trim() ? '0 3px 10px rgba(192, 38, 211, 0.3)' : 'none'
            }}
            disabled={!inputMsg.trim()}
          >
            <Send size={18} color={inputMsg.trim() ? 'white' : '#94a3b8'} />
          </button>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default AiChatbotModal;