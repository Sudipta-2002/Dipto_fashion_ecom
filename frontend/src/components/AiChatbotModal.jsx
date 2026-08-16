





// // //gemini code


// // // final version - Keyboard Retention & Fixed Navbar Scroll Fix

// // import React, { useState, useEffect, useRef } from 'react';
// // import { createPortal } from 'react-dom';
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

// //   // Dynamic visual viewport height for mobile keyboards
// //   const [viewportHeight, setViewportHeight] = useState('100dvh');

// //   const chatEndRef = useRef(null);
// //   const messagesContainerRef = useRef(null);
// //   const inputRef = useRef(null);

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

// //   // Smooth & Accurate Auto-Scroll to bottom inside the messages container only
// //   const scrollToBottom = (instant = false) => {
// //     requestAnimationFrame(() => {
// //       if (messagesContainerRef.current) {
// //         messagesContainerRef.current.scrollTo({
// //           top: messagesContainerRef.current.scrollHeight,
// //           behavior: instant ? 'auto' : 'smooth'
// //         });
// //       }
// //     });
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages, typing]);

// //   // Handle Mobile Virtual Keyboard without shaking or scrolling the Navbar
// //   useEffect(() => {
// //     if (!isOpen) return;

// //     // Prevent background body scrolling when modal is open
// //     const originalOverflow = document.body.style.overflow;
// //     const originalPosition = document.body.style.position;
// //     const originalWidth = document.body.style.width;

// //     document.body.style.overflow = 'hidden';
// //     document.body.style.position = 'fixed';
// //     document.body.style.width = '100%';

// //     const handleViewportChange = () => {
// //       if (window.visualViewport) {
// //         setViewportHeight(`${window.visualViewport.height}px`);
// //         // Always keep scroll position pinned to 0,0 to avoid page shift
// //         window.scrollTo(0, 0);
// //         scrollToBottom(true);
// //       }
// //     };

// //     if (window.visualViewport) {
// //       window.visualViewport.addEventListener('resize', handleViewportChange);
// //       window.visualViewport.addEventListener('scroll', handleViewportChange);
// //       handleViewportChange();
// //     }

// //     return () => {
// //       document.body.style.overflow = originalOverflow;
// //       document.body.style.position = originalPosition;
// //       document.body.style.width = originalWidth;
// //       if (window.visualViewport) {
// //         window.visualViewport.removeEventListener('resize', handleViewportChange);
// //         window.visualViewport.removeEventListener('scroll', handleViewportChange);
// //       }
// //     };
// //   }, [isOpen]);

// //   if (!isOpen) return null;

// //   const handleSend = (textToSend) => {
// //     const query = (textToSend || inputMsg).trim();
// //     if (!query) return;

// //     const newMsgs = [...messages, { sender: 'user', text: query }];
// //     setMessages(newMsgs);
// //     setInputMsg('');
// //     setTyping(true);

// //     // Keep mobile keyboard open & focused after sending
// //     requestAnimationFrame(() => {
// //       if (inputRef.current) {
// //         inputRef.current.focus();
// //       }
// //     });

// //     setTimeout(() => {
// //       let botResponse = getAiResponse(query);
// //       setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
// //       setTyping(false);
// //     }, 500);
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
// //         (o) => o.orderId?.toUpperCase() === searchedId || o.orderId?.toUpperCase().replace('-', '') === searchedId.replace('-', '')
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

// //   const modalContent = (
// //     <div
// //       className="modal-overlay"
// //       style={{
// //         zIndex: 999999,
// //         position: 'fixed',
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         bottom: 0,
// //         height: viewportHeight,
// //         maxHeight: viewportHeight,
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         background: 'rgba(15, 23, 42, 0.75)',
// //         backdropFilter: 'blur(4px)',
// //         overflow: 'hidden',
// //         touchAction: 'none'
// //       }}
// //       onClick={onClose}
// //     >
// //       <div
// //         className="modal-card"
// //         style={{
// //           maxWidth: '480px',
// //           width: '100%',
// //           height: '100%',
// //           maxHeight: '100%',
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
// //         {/* 1. FIXED TOP HEADER */}
// //         <div
// //           style={{
// //             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
// //             padding: '0.85rem 1.15rem',
// //             paddingTop: 'calc(0.85rem + env(safe-area-inset-top, 0px))',
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //             flexShrink: 0,
// //             zIndex: 10,
// //             boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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
// //             type="button"
// //             onClick={onClose}
// //             style={{
// //               background: 'rgba(255,255,255,0.15)',
// //               border: 'none',
// //               borderRadius: '50%',
// //               width: '34px',
// //               height: '34px',
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

// //         {/* 2. FIXED QUICK QUESTION CHIPS */}
// //         <div
// //           style={{
// //             background: '#f8fafc',
// //             padding: '0.55rem 0.85rem',
// //             borderBottom: '1px solid #e2e8f0',
// //             display: 'flex',
// //             gap: '0.4rem',
// //             overflowX: 'auto',
// //             whiteSpace: 'nowrap',
// //             flexShrink: 0,
// //             zIndex: 9,
// //             WebkitOverflowScrolling: 'touch'
// //           }}
// //         >
// //           {QUICK_QUESTIONS.map((q, idx) => (
// //             <button
// //               key={idx}
// //               type="button"
// //               onMouseDown={(e) => e.preventDefault()}
// //               onTouchStart={(e) => e.preventDefault()}
// //               onClick={() => handleSend(q)}
// //               style={{
// //                 background: 'white',
// //                 border: '1.5px solid #cbd5e1',
// //                 borderRadius: '16px',
// //                 padding: '4px 11px',
// //                 fontSize: '0.74rem',
// //                 fontWeight: '700',
// //                 color: '#c026d3',
// //                 cursor: 'pointer',
// //                 flexShrink: 0,
// //                 boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
// //               }}
// //             >
// //               {q}
// //             </button>
// //           ))}
// //         </div>

// //         {/* 3. ISOLATED CHAT MESSAGES CONTAINER */}
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
// //             WebkitOverflowScrolling: 'touch',
// //             overscrollBehavior: 'contain',
// //             touchAction: 'pan-y'
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
// //                   wordBreak: 'break-word',
// //                   boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
// //           <div ref={chatEndRef} style={{ height: '4px', flexShrink: 0 }} />
// //         </div>

// //         {/* 4. FIXED MESSAGE INPUT BAR */}
// //         <form
// //           onSubmit={(e) => {
// //             e.preventDefault();
// //             handleSend();
// //           }}
// //           style={{
// //             padding: '0.65rem 0.75rem',
// //             paddingBottom: 'calc(0.65rem + env(safe-area-inset-bottom, 8px))',
// //             background: '#ffffff',
// //             borderTop: '1.5px solid #e2e8f0',
// //             display: 'flex',
// //             gap: '0.5rem',
// //             alignItems: 'center',
// //             flexShrink: 0,
// //             zIndex: 10,
// //             boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
// //           }}
// //         >
// //           <input
// //             ref={inputRef}
// //             type="text"
// //             placeholder="Enter Order ID, ask 'last order' or 'return'..."
// //             value={inputMsg}
// //             onFocus={() => {
// //               window.scrollTo(0, 0);
// //               setTimeout(() => {
// //                 scrollToBottom(true);
// //               }, 250);
// //             }}
// //             onChange={(e) => setInputMsg(e.target.value)}
// //             style={{
// //               flex: 1,
// //               padding: '0.65rem 1rem',
// //               border: '1.5px solid #cbd5e1',
// //               borderRadius: '24px',
// //               fontSize: '0.9rem',
// //               outline: 'none',
// //               background: '#f8fafc',
// //               color: '#0f172a'
// //             }}
// //           />
// //           <button
// //             type="submit"
// //             className="btn-primary"
// //             onMouseDown={(e) => e.preventDefault()}
// //             onTouchStart={(e) => e.preventDefault()}
// //             onClick={(e) => {
// //               e.preventDefault();
// //               handleSend();
// //             }}
// //             style={{
// //               borderRadius: '50%',
// //               width: '42px',
// //               height: '42px',
// //               minWidth: '42px',
// //               padding: 0,
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               background: inputMsg.trim() ? 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)' : '#e2e8f0',
// //               border: 'none',
// //               cursor: inputMsg.trim() ? 'pointer' : 'default',
// //               transition: 'all 0.2s ease',
// //               boxShadow: inputMsg.trim() ? '0 3px 10px rgba(192, 38, 211, 0.3)' : 'none'
// //             }}
// //             disabled={!inputMsg.trim()}
// //           >
// //             <Send size={18} color={inputMsg.trim() ? 'white' : '#94a3b8'} />
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );

// //   return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
// // };

// // export default AiChatbotModal;







// // import React, { useState, useEffect, useRef } from 'react';
// // import { createPortal } from 'react-dom';
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

// //   // কীবোর্ডের রিয়েল-টাইম হাইট হ্যান্ডলিং
// //   const [visualHeight, setVisualHeight] = useState('100dvh');

// //   const chatEndRef = useRef(null);
// //   const messagesContainerRef = useRef(null);
// //   const inputRef = useRef(null);

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

// //   const scrollToBottom = (behavior = 'smooth') => {
// //     requestAnimationFrame(() => {
// //       if (messagesContainerRef.current) {
// //         messagesContainerRef.current.scrollTo({
// //           top: messagesContainerRef.current.scrollHeight,
// //           behavior: behavior
// //         });
// //       }
// //     });
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages, typing]);

// //   // মোবাইল কীবোর্ড ওপেন হলে পেজের মূল ন্যাভবার উঠে আসা বন্ধ করার সম্পূর্ণ লক
// //   useEffect(() => {
// //     if (!isOpen) return;

// //     const originalOverflow = document.body.style.overflow;
// //     const originalPosition = document.body.style.position;
// //     const originalTop = document.body.style.top;
// //     const originalWidth = document.body.style.width;
// //     const scrollY = window.scrollY;

// //     document.body.style.overflow = 'hidden';
// //     document.body.style.position = 'fixed';
// //     document.body.style.top = `-${scrollY}px`;
// //     document.body.style.width = '100%';
// //     document.documentElement.style.overflow = 'hidden';

// //     const handleViewportChange = () => {
// //       if (window.visualViewport) {
// //         setVisualHeight(`${window.visualViewport.height}px`);
// //         // ব্রাউজারকে পেজ স্ক্রোল করতে দেবে না
// //         window.scrollTo(0, 0);
// //         scrollToBottom('auto');
// //       }
// //     };

// //     if (window.visualViewport) {
// //       window.visualViewport.addEventListener('resize', handleViewportChange);
// //       window.visualViewport.addEventListener('scroll', handleViewportChange);
// //       handleViewportChange();
// //     }

// //     return () => {
// //       document.body.style.overflow = originalOverflow;
// //       document.body.style.position = originalPosition;
// //       document.body.style.top = originalTop;
// //       document.body.style.width = originalWidth;
// //       document.documentElement.style.overflow = '';
// //       window.scrollTo(0, scrollY);

// //       if (window.visualViewport) {
// //         window.visualViewport.removeEventListener('resize', handleViewportChange);
// //         window.visualViewport.removeEventListener('scroll', handleViewportChange);
// //       }
// //     };
// //   }, [isOpen]);

// //   if (!isOpen) return null;

// //   const handleSend = (textToSend) => {
// //     const query = (textToSend || inputMsg).trim();
// //     if (!query) return;

// //     const newMsgs = [...messages, { sender: 'user', text: query }];
// //     setMessages(newMsgs);
// //     setInputMsg('');
// //     setTyping(true);

// //     requestAnimationFrame(() => {
// //       if (inputRef.current) {
// //         inputRef.current.focus();
// //       }
// //     });

// //     setTimeout(() => {
// //       let botResponse = getAiResponse(query);
// //       setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
// //       setTyping(false);
// //     }, 450);
// //   };

// //   const getAiResponse = (userQuery) => {
// //     const q = userQuery.trim();
// //     const qLower = q.toLowerCase();

// //     // 1. ORDER ID LOOKUP
// //     const orderIdRegex = /(DF-?[A-Z0-9]{5,10})/i;
// //     const orderIdMatch = q.match(orderIdRegex);

// //     if (orderIdMatch) {
// //       const searchedId = orderIdMatch[0].toUpperCase().replace('DF', 'DF-');
// //       const foundOrder = orders.find(
// //         (o) => o.orderId?.toUpperCase() === searchedId || o.orderId?.toUpperCase().replace('-', '') === searchedId.replace('-', '')
// //       );

// //       if (foundOrder) {
// //         const itemsListStr = foundOrder.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
// //         const estDeliveryStr = new Date(new Date(foundOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// //         return `📦 **Order Details for ${foundOrder.orderId}**:
// // • **Status**: ${foundOrder.status}
// // • **Order Date**: ${new Date(foundOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
// // • **Items Ordered**:
// // ${itemsListStr}
// // • **Total Amount**: ₹${foundOrder.totalAmount?.toLocaleString('en-IN')}
// // • **UTR Ref**: ${foundOrder.utrNumber || 'N/A'}
// // • **Delivery Address**: ${foundOrder.shippingAddress?.userName || 'Customer'}, ${foundOrder.shippingAddress?.address || ''} (${foundOrder.shippingAddress?.pincode || ''})
// // • **Estimated Delivery**: ${foundOrder.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
// //       } else {
// //         return `🔍 **Order Search Result**:
// // Could not find an active order with ID **"${orderIdMatch[0]}"** in your account.

// // Please verify your Order ID under **Profile -> My Orders** or email support@diptofashion.in for manual lookup!`;
// //       }
// //     }

// //     // 2. LAST ORDER LOOKUP
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
// // • **UTR Ref**: ${last.utrNumber || 'N/A'}
// // • **Est. Delivery Date**: ${last.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
// //       } else {
// //         return `🛍️ You do not have any placed orders yet! Explore our Sarees & festive collections on the storefront to place your first order.`;
// //       }
// //     }

// //     // 3. RETURN GUIDE
// //     if (qLower.includes('return') || qLower.includes('refund') || qLower.includes('exchange') || qLower.includes('how to return')) {
// //       return `🔄 **Full Step-by-Step Product Return & Refund Guide**:

// // 1️⃣ **Open Your Profile**: Tap the profile icon at top right -> click **My Orders**.
// // 2️⃣ **Select Delivered Order**: Find your order (Returns are eligible within **7 Days** of delivery).
// // 3️⃣ **Click "Request Return"**: Select your return reason and enter your **Bank Details** or **UPI ID** for refund.
// // 4️⃣ **Pickup & Refund**: Our courier partner will pick up the product from your address within **3 Business Days**, and refund will be transferred directly to your bank account / UPI!`;
// //     }

// //     // 4. DELIVERY TIMELINE
// //     if (qLower.includes('delivery') || qLower.includes('time') || qLower.includes('days') || qLower.includes('shipping')) {
// //       return `🚚 **Express Shipping Timeline**:
// // All Dipto Fashion orders are shipped with **Express Free Shipping** and delivered within **7 Business Days** from order date. Live tracking is available under **My Orders**!`;
// //     }

// //     // 5. PAYMENT & UTR
// //     if (qLower.includes('utr') || qLower.includes('payment') || qLower.includes('qr') || qLower.includes('pay')) {
// //       return `💳 **Payment & UTR Verification**:
// // Scan our store QR code with Google Pay, PhonePe, Paytm, or BHIM UPI. After paying, paste your 12-digit UTR Transaction ID on the checkout page to confirm your order instantly!`;
// //     }

// //     // 6. SIZES
// //     if (qLower.includes('size') || qLower.includes('saree') || qLower.includes('punjabi') || qLower.includes('fabric')) {
// //       return `👗 **Sizes & Garment Specs**:
// // • **Sarees**: Standard 5.5 Meters silk/kanjivaram + 0.8m unstitched blouse piece (Free Size).
// // • **Punjabi Suits & Kurtas**: Standard S (36"), M (38"), L (40"), XL (42"), XXL (44") chest measurements. View size chart on product page for details.`;
// //     }

// //     // 7. FALLBACK
// //     return `🤖 Thank you for reaching out! For custom requests or queries outside order tracking and returns:

// // 📧 **Customer Support Email**: support@diptofashion.in
// // 📱 **WhatsApp Helpline**: +91 98765 43210
// // 🕒 **Working Hours**: Mon - Sun (9:00 AM - 10:00 PM)

// // Feel free to ask for your **last order**, enter an **Order ID**, or type **"Return"** for return guide!`;
// //   };

// //   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

// //   const modalContent = (
// //     <div
// //       className="modal-overlay"
// //       style={{
// //         zIndex: 9999999,
// //         position: 'fixed',
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         bottom: 0,
// //         height: isMobile ? visualHeight : '100vh',
// //         width: '100vw',
// //         display: 'flex',
// //         alignItems: isMobile ? 'flex-end' : 'center',
// //         justifyContent: 'center',
// //         background: 'rgba(15, 23, 42, 0.75)',
// //         backdropFilter: 'blur(4px)',
// //         overflow: 'hidden'
// //       }}
// //       onClick={onClose}
// //     >
// //       <div
// //         className="modal-card"
// //         style={{
// //           maxWidth: '480px',
// //           width: '100%',
// //           height: '100%',
// //           maxHeight: '100%',
// //           borderRadius: isMobile ? '0px' : '16px',
// //           display: 'flex',
// //           flexDirection: 'column',
// //           overflow: 'hidden',
// //           background: '#ffffff',
// //           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
// //           position: 'relative'
// //         }}
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         {/* 1. TOP HEADER (SCREEN TOP-E FIXED THAKBE) */}
// //         <div
// //           style={{
// //             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
// //             padding: '0.85rem 1.15rem',
// //             paddingTop: isMobile ? 'calc(0.75rem + env(safe-area-inset-top, 0px))' : '0.85rem',
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //             flexShrink: 0,
// //             zIndex: 20,
// //             boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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
// //             type="button"
// //             onClick={onClose}
// //             style={{
// //               background: 'rgba(255,255,255,0.15)',
// //               border: 'none',
// //               borderRadius: '50%',
// //               width: '34px',
// //               height: '34px',
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

// //         {/* 2. QUICK QUESTION CHIPS */}
// //         <div
// //           style={{
// //             background: '#f8fafc',
// //             padding: '0.55rem 0.85rem',
// //             borderBottom: '1px solid #e2e8f0',
// //             display: 'flex',
// //             gap: '0.4rem',
// //             overflowX: 'auto',
// //             whiteSpace: 'nowrap',
// //             flexShrink: 0,
// //             zIndex: 10,
// //             WebkitOverflowScrolling: 'touch'
// //           }}
// //         >
// //           {QUICK_QUESTIONS.map((q, idx) => (
// //             <button
// //               key={idx}
// //               type="button"
// //               onMouseDown={(e) => e.preventDefault()}
// //               onTouchStart={(e) => e.preventDefault()}
// //               onClick={() => handleSend(q)}
// //               style={{
// //                 background: 'white',
// //                 border: '1.5px solid #cbd5e1',
// //                 borderRadius: '16px',
// //                 padding: '4px 11px',
// //                 fontSize: '0.74rem',
// //                 fontWeight: '700',
// //                 color: '#c026d3',
// //                 cursor: 'pointer',
// //                 flexShrink: 0,
// //                 boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
// //               }}
// //             >
// //               {q}
// //             </button>
// //           ))}
// //         </div>

// //         {/* 3. ISOLATED SCROLLABLE MESSAGES AREA */}
// //         <div
// //           ref={messagesContainerRef}
// //           style={{
// //             flex: '1 1 auto',
// //             minHeight: 0,
// //             padding: '1rem',
// //             overflowY: 'auto',
// //             background: '#ffffff',
// //             display: 'flex',
// //             flexDirection: 'column',
// //             gap: '0.85rem',
// //             WebkitOverflowScrolling: 'touch',
// //             overscrollBehavior: 'contain'
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
// //                   maxWidth: '85%',
// //                   background: m.sender === 'user' ? '#c026d3' : '#f8fafc',
// //                   color: m.sender === 'user' ? 'white' : '#0f172a',
// //                   padding: '0.75rem 0.95rem',
// //                   borderRadius: '14px',
// //                   fontSize: '0.84rem',
// //                   lineHeight: '1.5',
// //                   border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
// //                   whiteSpace: 'pre-line',
// //                   wordBreak: 'break-word',
// //                   boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
// //           <div ref={chatEndRef} style={{ height: '4px', flexShrink: 0 }} />
// //         </div>

// //         {/* 4. PINNED BOTTOM INPUT BAR (KEYBOARD-ER THIK UPORE THAKBE) */}
// //         <form
// //           onSubmit={(e) => {
// //             e.preventDefault();
// //             handleSend();
// //           }}
// //           style={{
// //             padding: '0.65rem 0.75rem',
// //             paddingBottom: isMobile ? 'calc(0.65rem + env(safe-area-inset-bottom, 8px))' : '0.65rem',
// //             background: '#ffffff',
// //             borderTop: '1.5px solid #e2e8f0',
// //             display: 'flex',
// //             gap: '0.5rem',
// //             alignItems: 'center',
// //             flexShrink: 0,
// //             zIndex: 20,
// //             boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
// //           }}
// //         >
// //           <input
// //             ref={inputRef}
// //             type="text"
// //             placeholder="Enter Order ID, ask 'last order'..."
// //             value={inputMsg}
// //             onFocus={() => {
// //               window.scrollTo(0, 0);
// //               setTimeout(() => {
// //                 scrollToBottom('auto');
// //               }, 250);
// //             }}
// //             onChange={(e) => setInputMsg(e.target.value)}
// //             style={{
// //               flex: 1,
// //               padding: '0.65rem 1rem',
// //               border: '1.5px solid #cbd5e1',
// //               borderRadius: '24px',
// //               fontSize: '0.9rem',
// //               outline: 'none',
// //               background: '#f8fafc',
// //               color: '#0f172a'
// //             }}
// //           />
// //           <button
// //             type="submit"
// //             className="btn-primary"
// //             onMouseDown={(e) => e.preventDefault()}
// //             onTouchStart={(e) => e.preventDefault()}
// //             onClick={(e) => {
// //               e.preventDefault();
// //               handleSend();
// //             }}
// //             style={{
// //               borderRadius: '50%',
// //               width: '42px',
// //               height: '42px',
// //               minWidth: '42px',
// //               padding: 0,
// //               display: 'flex',
// //               alignItems: 'center',
// //               justifyContent: 'center',
// //               background: inputMsg.trim() ? 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)' : '#e2e8f0',
// //               border: 'none',
// //               cursor: inputMsg.trim() ? 'pointer' : 'default',
// //               transition: 'all 0.2s ease',
// //               boxShadow: inputMsg.trim() ? '0 3px 10px rgba(192, 38, 211, 0.3)' : 'none'
// //             }}
// //             disabled={!inputMsg.trim()}
// //           >
// //             <Send size={18} color={inputMsg.trim() ? 'white' : '#94a3b8'} />
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );

// //   return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
// // };

// // export default AiChatbotModal;




// import React, { useState, useEffect, useRef } from 'react';
// import { createPortal } from 'react-dom';
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

//   // কীবোর্ডের রিয়েল-টাইম হাইট হ্যান্ডলিং
//   const [visualHeight, setVisualHeight] = useState('100dvh');

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

//   const scrollToBottom = (behavior = 'smooth') => {
//     requestAnimationFrame(() => {
//       if (messagesContainerRef.current) {
//         messagesContainerRef.current.scrollTo({
//           top: messagesContainerRef.current.scrollHeight,
//           behavior: behavior
//         });
//       }
//     });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, typing]);

//   // মোবাইল কীবোর্ড ওপেন হলে পেজের মূল ন্যাভবার উঠে আসা বন্ধ করার সম্পূর্ণ লক
//   useEffect(() => {
//     if (!isOpen) return;

//     const originalOverflow = document.body.style.overflow;
//     const originalPosition = document.body.style.position;
//     const originalTop = document.body.style.top;
//     const originalWidth = document.body.style.width;
//     const scrollY = window.scrollY;

//     document.body.style.overflow = 'hidden';
//     document.body.style.position = 'fixed';
//     document.body.style.top = `-${scrollY}px`;
//     document.body.style.width = '100%';
//     document.documentElement.style.overflow = 'hidden';

//     const handleViewportChange = () => {
//       if (window.visualViewport) {
//         setVisualHeight(`${window.visualViewport.height}px`);
//         // ব্রাউজারকে পেজ স্ক্রোল করতে দেবে না
//         window.scrollTo(0, 0);
//         scrollToBottom('auto');
//       }
//     };

//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', handleViewportChange);
//       window.visualViewport.addEventListener('scroll', handleViewportChange);
//       handleViewportChange();
//     }

//     return () => {
//       document.body.style.overflow = originalOverflow;
//       document.body.style.position = originalPosition;
//       document.body.style.top = originalTop;
//       document.body.style.width = originalWidth;
//       document.documentElement.style.overflow = '';
//       window.scrollTo(0, scrollY);

//       if (window.visualViewport) {
//         window.visualViewport.removeEventListener('resize', handleViewportChange);
//         window.visualViewport.removeEventListener('scroll', handleViewportChange);
//       }
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleSend = (textToSend) => {
//     const query = (textToSend || inputMsg).trim();
//     if (!query) return;

//     const newMsgs = [...messages, { sender: 'user', text: query }];
//     setMessages(newMsgs);
//     setInputMsg('');
//     setTyping(true);

//     requestAnimationFrame(() => {
//       if (inputRef.current) {
//         inputRef.current.focus();
//       }
//     });

//     setTimeout(() => {
//       let botResponse = getAiResponse(query);
//       setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
//       setTyping(false);
//     }, 450);
//   };

//   const getAiResponse = (userQuery) => {
//     const q = userQuery.trim();
//     const qLower = q.toLowerCase();

//     // 1. ORDER ID LOOKUP
//     const orderIdRegex = /(DF-?[A-Z0-9]{5,10})/i;
//     const orderIdMatch = q.match(orderIdRegex);

//     if (orderIdMatch) {
//       const searchedId = orderIdMatch[0].toUpperCase().replace('DF', 'DF-');
//       const foundOrder = orders.find(
//         (o) => o.orderId?.toUpperCase() === searchedId || o.orderId?.toUpperCase().replace('-', '') === searchedId.replace('-', '')
//       );

//       if (foundOrder) {
//         const itemsListStr = foundOrder.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
//         const estDeliveryStr = new Date(new Date(foundOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

//         return `📦 **Order Details for ${foundOrder.orderId}**:
// • **Status**: ${foundOrder.status}
// • **Order Date**: ${new Date(foundOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
// • **Items Ordered**:
// ${itemsListStr}
// • **Total Amount**: ₹${foundOrder.totalAmount?.toLocaleString('en-IN')}
// • **UTR Ref**: ${foundOrder.utrNumber || 'N/A'}
// • **Delivery Address**: ${foundOrder.shippingAddress?.userName || 'Customer'}, ${foundOrder.shippingAddress?.address || ''} (${foundOrder.shippingAddress?.pincode || ''})
// • **Estimated Delivery**: ${foundOrder.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
//       } else {
//         return `🔍 **Order Search Result**:
// Could not find an active order with ID **"${orderIdMatch[0]}"** in your account.

// Please verify your Order ID under **Profile -> My Orders** or email support@diptofashion.in for manual lookup!`;
//       }
//     }

//     // 2. LAST ORDER LOOKUP
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
// • **UTR Ref**: ${last.utrNumber || 'N/A'}
// • **Est. Delivery Date**: ${last.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
//       } else {
//         return `🛍️ You do not have any placed orders yet! Explore our Sarees & festive collections on the storefront to place your first order.`;
//       }
//     }

//     // 3. RETURN GUIDE
//     if (qLower.includes('return') || qLower.includes('refund') || qLower.includes('exchange') || qLower.includes('how to return')) {
//       return `🔄 **Full Step-by-Step Product Return & Refund Guide**:

// 1️⃣ **Open Your Profile**: Tap the profile icon at top right -> click **My Orders**.
// 2️⃣ **Select Delivered Order**: Find your order (Returns are eligible within **7 Days** of delivery).
// 3️⃣ **Click "Request Return"**: Select your return reason and enter your **Bank Details** or **UPI ID** for refund.
// 4️⃣ **Pickup & Refund**: Our courier partner will pick up the product from your address within **3 Business Days**, and refund will be transferred directly to your bank account / UPI!`;
//     }

//     // 4. DELIVERY TIMELINE
//     if (qLower.includes('delivery') || qLower.includes('time') || qLower.includes('days') || qLower.includes('shipping')) {
//       return `🚚 **Express Shipping Timeline**:
// All Dipto Fashion orders are shipped with **Express Free Shipping** and delivered within **7 Business Days** from order date. Live tracking is available under **My Orders**!`;
//     }

//     // 5. PAYMENT & UTR
//     if (qLower.includes('utr') || qLower.includes('payment') || qLower.includes('qr') || qLower.includes('pay')) {
//       return `💳 **Payment & UTR Verification**:
// Scan our store QR code with Google Pay, PhonePe, Paytm, or BHIM UPI. After paying, paste your 12-digit UTR Transaction ID on the checkout page to confirm your order instantly!`;
//     }

//     // 6. SIZES
//     if (qLower.includes('size') || qLower.includes('saree') || qLower.includes('punjabi') || qLower.includes('fabric')) {
//       return `👗 **Sizes & Garment Specs**:
// • **Sarees**: Standard 5.5 Meters silk/kanjivaram + 0.8m unstitched blouse piece (Free Size).
// • **Punjabi Suits & Kurtas**: Standard S (36"), M (38"), L (40"), XL (42"), XXL (44") chest measurements. View size chart on product page for details.`;
//     }

//     // 7. FALLBACK
//     return `🤖 Thank you for reaching out! For custom requests or queries outside order tracking and returns:

// 📧 **Customer Support Email**: support@diptofashion.in
// 📱 **WhatsApp Helpline**: +91 98765 43210
// 🕒 **Working Hours**: Mon - Sun (9:00 AM - 10:00 PM)

// Feel free to ask for your **last order**, enter an **Order ID**, or type **"Return"** for return guide!`;
//   };

//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

//   const modalContent = (
//     <div
//       className="modal-overlay"
//       style={{
//         zIndex: 9999999,
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         height: isMobile ? visualHeight : '100vh',
//         width: '100vw',
//         display: 'flex',
//         alignItems: isMobile ? 'flex-end' : 'center',
//         justifyContent: 'center',
//         background: 'rgba(15, 23, 42, 0.75)',
//         backdropFilter: 'blur(4px)',
//         overflow: 'hidden'
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-card"
//         style={{
//           maxWidth: '480px',
//           width: '100%',
//           height: '100%',
//           maxHeight: '100%',
//           borderRadius: isMobile ? '0px' : '16px',
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: 'hidden',
//           background: '#ffffff',
//           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
//           position: 'relative'
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* 1. TOP HEADER (SCREEN TOP-E FIXED THAKBE) */}
//         <div
//           style={{
//             background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
//             padding: '1rem 1.15rem',
//             paddingTop: isMobile ? 'calc(3.8rem + env(safe-area-inset-top, 16px))' : '0.85rem',
//             minHeight: isMobile ? '76px' : 'auto',
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
//             type="button"
//             onClick={onClose}
//             style={{
//               background: 'rgba(255,255,255,0.15)',
//               border: 'none',
//               borderRadius: '50%',
//               width: '34px',
//               height: '34px',
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

//         {/* 2. QUICK QUESTION CHIPS */}
//         <div
//           style={{
//             background: '#f8fafc',
//             padding: '0.55rem 0.85rem',
//             borderBottom: '1px solid #e2e8f0',
//             display: 'flex',
//             gap: '0.4rem',
//             overflowX: 'auto',
//             whiteSpace: 'nowrap',
//             flexShrink: 0,
//             zIndex: 10,
//             WebkitOverflowScrolling: 'touch'
//           }}
//         >
//           {QUICK_QUESTIONS.map((q, idx) => (
//             <button
//               key={idx}
//               type="button"
//               onMouseDown={(e) => e.preventDefault()}
//               onTouchStart={(e) => e.preventDefault()}
//               onClick={() => handleSend(q)}
//               style={{
//                 background: 'white',
//                 border: '1.5px solid #cbd5e1',
//                 borderRadius: '16px',
//                 padding: '4px 11px',
//                 fontSize: '0.74rem',
//                 fontWeight: '700',
//                 color: '#c026d3',
//                 cursor: 'pointer',
//                 flexShrink: 0,
//                 boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
//               }}
//             >
//               {q}
//             </button>
//           ))}
//         </div>

//         {/* 3. ISOLATED SCROLLABLE MESSAGES AREA */}
//         <div
//           ref={messagesContainerRef}
//           style={{
//             flex: '1 1 auto',
//             minHeight: 0,
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
//                   maxWidth: '85%',
//                   background: m.sender === 'user' ? '#c026d3' : '#f8fafc',
//                   color: m.sender === 'user' ? 'white' : '#0f172a',
//                   padding: '0.75rem 0.95rem',
//                   borderRadius: '14px',
//                   fontSize: '0.84rem',
//                   lineHeight: '1.5',
//                   border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
//                   whiteSpace: 'pre-line',
//                   wordBreak: 'break-word',
//                   boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
//           <div ref={chatEndRef} style={{ height: '4px', flexShrink: 0 }} />
//         </div>

//         {/* 4. PINNED BOTTOM INPUT BAR (KEYBOARD-ER THIK UPORE THAKBE) */}
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleSend();
//           }}
//           style={{
//             padding: '0.65rem 0.75rem',
//             paddingBottom: isMobile ? 'calc(0.65rem + env(safe-area-inset-bottom, 8px))' : '0.65rem',
//             background: '#ffffff',
//             borderTop: '1.5px solid #e2e8f0',
//             display: 'flex',
//             gap: '0.5rem',
//             alignItems: 'center',
//             flexShrink: 0,
//             zIndex: 20,
//             boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
//           }}
//         >
//           <input
//             ref={inputRef}
//             type="text"
//             placeholder="Enter Order ID, ask 'last order'..."
//             value={inputMsg}
//             onFocus={() => {
//               window.scrollTo(0, 0);
//               setTimeout(() => {
//                 scrollToBottom('auto');
//               }, 250);
//             }}
//             onChange={(e) => setInputMsg(e.target.value)}
//             style={{
//               flex: 1,
//               padding: '0.65rem 1rem',
//               border: '1.5px solid #cbd5e1',
//               borderRadius: '24px',
//               fontSize: '0.9rem',
//               outline: 'none',
//               background: '#f8fafc',
//               color: '#0f172a'
//             }}
//           />
//           <button
//             type="submit"
//             className="btn-primary"
//             onMouseDown={(e) => e.preventDefault()}
//             onTouchStart={(e) => e.preventDefault()}
//             onClick={(e) => {
//               e.preventDefault();
//               handleSend();
//             }}
//             style={{
//               borderRadius: '50%',
//               width: '42px',
//               height: '42px',
//               minWidth: '42px',
//               padding: 0,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               background: inputMsg.trim() ? 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)' : '#e2e8f0',
//               border: 'none',
//               cursor: inputMsg.trim() ? 'pointer' : 'default',
//               transition: 'all 0.2s ease',
//               boxShadow: inputMsg.trim() ? '0 3px 10px rgba(192, 38, 211, 0.3)' : 'none'
//             }}
//             disabled={!inputMsg.trim()}
//           >
//             <Send size={18} color={inputMsg.trim() ? 'white' : '#94a3b8'} />
//           </button>
//         </form>
//       </div>
//     </div>
//   );

//   return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
// };

// export default AiChatbotModal;










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

  // রিয়েল-টাইম ভিউপোর্ট ট্র্যাকিং (কীবোর্ড হ্যান্ডলিং)
  const [vpHeight, setVpHeight] = useState('100dvh');

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

  const scrollToBottom = (behavior = 'smooth') => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: behavior
        });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // WhatsApp Style Body & Viewport Lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalInset = document.body.style.inset;

    // বডি পুরোপুরি ব্যাকগ্রাউন্ডে লক করা
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.inset = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';

    const handleResize = () => {
      if (window.visualViewport) {
        setVpHeight(`${window.visualViewport.height}px`);
        window.scrollTo(0, 0);
        scrollToBottom('auto');
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.inset = originalInset;
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = (textToSend || inputMsg).trim();
    if (!query) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    setInputMsg('');
    setTyping(true);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });

    setTimeout(() => {
      let botResponse = getAiResponse(query);
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      setTyping(false);
    }, 450);
  };

  const getAiResponse = (userQuery) => {
    const q = userQuery.trim();
    const qLower = q.toLowerCase();

    // 1. ORDER ID LOOKUP
    const orderIdRegex = /(DF-?[A-Z0-9]{5,10})/i;
    const orderIdMatch = q.match(orderIdRegex);

    if (orderIdMatch) {
      const searchedId = orderIdMatch[0].toUpperCase().replace('DF', 'DF-');
      const foundOrder = orders.find(
        (o) => o.orderId?.toUpperCase() === searchedId || o.orderId?.toUpperCase().replace('-', '') === searchedId.replace('-', '')
      );

      if (foundOrder) {
        const itemsListStr = foundOrder.items?.map((i) => `• ${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join('\n');
        const estDeliveryStr = new Date(new Date(foundOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        return `📦 **Order Details for ${foundOrder.orderId}**:
• **Status**: ${foundOrder.status}
• **Order Date**: ${new Date(foundOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
• **Items Ordered**:
${itemsListStr}
• **Total Amount**: ₹${foundOrder.totalAmount?.toLocaleString('en-IN')}
• **UTR Ref**: ${foundOrder.utrNumber || 'N/A'}
• **Delivery Address**: ${foundOrder.shippingAddress?.userName || 'Customer'}, ${foundOrder.shippingAddress?.address || ''} (${foundOrder.shippingAddress?.pincode || ''})
• **Estimated Delivery**: ${foundOrder.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
      } else {
        return `🔍 **Order Search Result**:
Could not find an active order with ID **"${orderIdMatch[0]}"** in your account.

Please verify your Order ID under **Profile -> My Orders** or email support@diptofashion.in for manual lookup!`;
      }
    }

    // 2. LAST ORDER LOOKUP
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
• **UTR Ref**: ${last.utrNumber || 'N/A'}
• **Est. Delivery Date**: ${last.status === 'Delivered' ? 'Delivered' : estDeliveryStr}`;
      } else {
        return `🛍️ You do not have any placed orders yet! Explore our Sarees & festive collections on the storefront to place your first order.`;
      }
    }

    // 3. RETURN GUIDE
    if (qLower.includes('return') || qLower.includes('refund') || qLower.includes('exchange') || qLower.includes('how to return')) {
      return `🔄 **Full Step-by-Step Product Return & Refund Guide**:

1️⃣ **Open Your Profile**: Tap the profile icon at top right -> click **My Orders**.
2️⃣ **Select Delivered Order**: Find your order (Returns are eligible within **7 Days** of delivery).
3️⃣ **Click "Request Return"**: Select your return reason and enter your **Bank Details** or **UPI ID** for refund.
4️⃣ **Pickup & Refund**: Our courier partner will pick up the product from your address within **3 Business Days**, and refund will be transferred directly to your bank account / UPI!`;
    }

    // 4. DELIVERY TIMELINE
    if (qLower.includes('delivery') || qLower.includes('time') || qLower.includes('days') || qLower.includes('shipping')) {
      return `🚚 **Express Shipping Timeline**:
All Dipto Fashion orders are shipped with **Express Free Shipping** and delivered within **7 Business Days** from order date. Live tracking is available under **My Orders**!`;
    }

    // 5. PAYMENT & UTR
    if (qLower.includes('utr') || qLower.includes('payment') || qLower.includes('qr') || qLower.includes('pay')) {
      return `💳 **Payment & UTR Verification**:
Scan our store QR code with Google Pay, PhonePe, Paytm, or BHIM UPI. After paying, paste your 12-digit UTR Transaction ID on the checkout page to confirm your order instantly!`;
    }

    // 6. SIZES
    if (qLower.includes('size') || qLower.includes('saree') || qLower.includes('punjabi') || qLower.includes('fabric')) {
      return `👗 **Sizes & Garment Specs**:
• **Sarees**: Standard 5.5 Meters silk/kanjivaram + 0.8m unstitched blouse piece (Free Size).
• **Punjabi Suits & Kurtas**: Standard S (36"), M (38"), L (40"), XL (42"), XXL (44") chest measurements. View size chart on product page for details.`;
    }

    // 7. FALLBACK
    return `🤖 Thank you for reaching out! For custom requests or queries outside order tracking and returns:

📧 **Customer Support Email**: support@diptofashion.in
📱 **WhatsApp Helpline**: +91 98765 43210
🕒 **Working Hours**: Mon - Sun (9:00 AM - 10:00 PM)

Feel free to ask for your **last order**, enter an **Order ID**, or type **"Return"** for return guide!`;
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const modalContent = (
    <div
      className="modal-overlay"
      style={{
        zIndex: 99999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: isMobile ? vpHeight : '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        overflow: 'hidden',
        touchAction: 'none'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          height: '100%',
          borderRadius: isMobile ? '0px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. WHATSAPP STYLE FIXED HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)',
            padding: '1rem 1.15rem',
            paddingTop: isMobile ? 'max(64px, calc(1.25rem + env(safe-area-inset-top, 24px)))' : '1rem',
            paddingBottom: '1rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 30,
            position: 'sticky',
            top: 0,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
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
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
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

        {/* 2. FIXED QUICK QUESTION CHIPS */}
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
            zIndex: 20,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
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

        {/* 3. ONLY SCROLLABLE AREA (MESSAGES CONTAINER) */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            padding: '1rem',
            overflowY: 'auto',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
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
                  background: m.sender === 'user' ? '#c026d3' : '#ffffff',
                  color: m.sender === 'user' ? 'white' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  border: m.sender === 'bot' ? '1px solid #bbf7d0' : 'none',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                style={{
                  maxWidth: '85%',
                  background: m.sender === 'user' ? '#c026d3' : '#ffffff',
                  color: m.sender === 'user' ? 'white' : '#0f172a',
                  padding: '0.75rem 0.95rem',
                  borderRadius: '14px',
                  fontSize: '0.84rem',
                  lineHeight: '1.5',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
                  background: '#ffffff',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #bbf7d0'
                }}
              >
                <Bot size={16} />
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem 0.85rem', borderRadius: '14px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                Dipto AI is checking your orders...
              </div>
            </div>
          )}
          <div ref={chatEndRef} style={{ height: '4px', flexShrink: 0 }} />
        </div>

        {/* 4. PINNED BOTTOM INPUT BAR (OVERLAP-FREE) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '0.75rem 0.85rem',
            paddingBottom: isMobile ? 'max(24px, calc(0.85rem + env(safe-area-inset-bottom, 16px)))' : '0.75rem',
            background: '#ffffff',
            borderTop: '1.5px solid #e2e8f0',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexShrink: 0,
            zIndex: 30,
            position: 'sticky',
            bottom: 0,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter Order ID, ask 'last order'..."
            value={inputMsg}
            onFocus={() => {
              window.scrollTo(0, 0);
              setTimeout(() => {
                scrollToBottom('auto');
              }, 200);
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
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
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