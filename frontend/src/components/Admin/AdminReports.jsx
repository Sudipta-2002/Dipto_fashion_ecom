// import React, { useState, useEffect, useRef } from 'react';
// import {
//   HelpCircle,
//   MessageSquare,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Search,
//   RefreshCw,
//   Send,
//   Trash2,
//   X,
//   Mail,
//   User,
//   Filter,
//   Sparkles
// } from 'lucide-react';
// import { API_URL } from '../../api';
// import ToastNotification from '../ToastNotification';

// const AdminReports = () => {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');

//   // Modal State for Reply
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [replyText, setReplyText] = useState('');
//   const [updateStatus, setUpdateStatus] = useState('Resolved');
//   const [replying, setReplying] = useState(false);
//   const [toast, setToast] = useState(null);

//   // Auto-refresh interval ref
//   const refreshIntervalRef = useRef(null);

//   const fetchReports = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch(`${API_URL}/api/admin/reports`);
//       if (res.ok) {
//         const data = await res.json();
//         setReports(Array.isArray(data) ? data : []);
//       } else {
//         setError('Failed to load user reports');
//       }
//     } catch (err) {
//       console.error('Fetch reports error:', err);
//       setError('Network error loading reports');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReports();

//     // Auto-refresh every 30 seconds to catch new tickets
//     refreshIntervalRef.current = setInterval(() => {
//       fetchReports();
//     }, 30000);

//     return () => {
//       if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
//     };
//   }, []);

//   const handleOpenReplyModal = (report) => {
//     setSelectedReport(report);
//     setReplyText(report.adminReply || '');
//     setUpdateStatus(report.status === 'Pending' ? 'Resolved' : report.status);
//   };

//   const handleSendReply = async (e) => {
//     e.preventDefault();
//     if (!selectedReport || !replyText.trim()) return;

//     const reportId = selectedReport._id;
//     const savedReply = replyText.trim();
//     const savedStatus = updateStatus;
//     let previousReports = [];

//     // OPTIMISTIC UI: Instantly update the report in the list
//     setReports((prev) => {
//       previousReports = prev;
//       return prev.map((r) =>
//         r._id === reportId
//           ? { ...r, status: savedStatus, adminReply: savedReply }
//           : r
//       );
//     });
//     setSelectedReport(null);
//     setToast({ type: 'success', message: 'Reply sent and status updated successfully!' });

//     setReplying(true);
//     try {
//       const res = await fetch(`${API_URL}/api/admin/reports/${reportId}/reply`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           adminReply: savedReply,
//           status: savedStatus
//         })
//       });

//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         // Rollback if API fails
//         setReports(previousReports);
//         setToast({ type: 'error', message: data.message || 'Failed to update report. Reverting.' });
//       }
//     } catch (err) {
//       // Rollback on network error
//       setReports(previousReports);
//       setToast({ type: 'error', message: 'Network error submitting reply. Reverting.' });
//     } finally {
//       setReplying(false);
//     }
//   };

//   const handleDeleteReport = async (reportId) => {
//     if (!window.confirm('Are you sure you want to delete this support report ticket?')) return;

//     let previousReports = [];

//     // OPTIMISTIC UI: Instantly remove from list
//     setReports((prev) => {
//       previousReports = prev;
//       return prev.filter((r) => r._id !== reportId);
//     });
//     setToast({ type: 'success', message: '🗑️ Report deleted successfully!' });

//     try {
//       const res = await fetch(`${API_URL}/api/admin/reports/${reportId}`, {
//         method: 'DELETE'
//       });
//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         // Rollback on failure
//         setReports(previousReports);
//         setToast({ type: 'error', message: data.message || 'Failed to delete report. Reverting.' });
//       }
//     } catch (err) {
//       // Rollback on network error
//       setReports(previousReports);
//       setToast({ type: 'error', message: 'Network error deleting report. Reverting.' });
//     }
//   };

//   // Filter Reports
//   const filteredReports = reports.filter((rep) => {
//     const matchesSearch =
//       (rep.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (rep.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (rep.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (rep.message || '').toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
//     const matchesCategory = categoryFilter === 'all' || rep.category === categoryFilter;

//     return matchesSearch && matchesStatus && matchesCategory;
//   });

//   const pendingCount = reports.filter((r) => r.status === 'Pending').length;
//   const inProgressCount = reports.filter((r) => r.status === 'In Progress').length;
//   const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'Resolved':
//         return (
//           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
//             <CheckCircle2 size={13} /> Resolved
//           </span>
//         );
//       case 'In Progress':
//         return (
//           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
//             <Clock size={13} /> In Progress
//           </span>
//         );
//       default:
//         return (
//           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
//             <AlertCircle size={13} /> Pending
//           </span>
//         );
//     }
//   };

//   return (
//     <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
//       {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}

//       {/* HEADER SECTION */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
//         <div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//             <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
//               <HelpCircle size={22} />
//             </div>
//             <div>
//               <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
//                 User Reports & Customer Support
//               </h2>
//               <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
//                 Manage customer issues, reply to tickets, and track resolution status
//               </p>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={fetchReports}
//           style={{ background: 'white', border: '1.5px solid #cbd5e1', color: '#475569', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
//         >
//           <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh List
//         </button>
//       </div>

//       {/* STATS SUMMARY CARDS */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
//         <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
//           <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tickets</div>
//           <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginTop: '0.25rem' }}>{reports.length}</div>
//         </div>

//         <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.05)' }}>
//           <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Tickets</div>
//           <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#d97706', marginTop: '0.25rem' }}>{pendingCount}</div>
//         </div>

//         <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)' }}>
//           <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</div>
//           <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#2563eb', marginTop: '0.25rem' }}>{inProgressCount}</div>
//         </div>

//         <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.05)' }}>
//           <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved</div>
//           <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#16a34a', marginTop: '0.25rem' }}>{resolvedCount}</div>
//         </div>
//       </div>

//       {/* FILTER & SEARCH BAR */}
//       <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
//         {/* Search */}
//         <div style={{ flex: '1 1 250px', position: 'relative' }}>
//           <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
//           <input
//             type="text"
//             placeholder="Search by user email, subject, or message..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.4rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem' }}
//           />
//         </div>

//         {/* Status Filter */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//           <Filter size={16} color="#64748b" />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             style={{ padding: '0.6rem 0.85rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', background: 'white', cursor: 'pointer' }}
//           >
//             <option value="all">All Statuses ({reports.length})</option>
//             <option value="Pending">Pending ({pendingCount})</option>
//             <option value="In Progress">In Progress ({inProgressCount})</option>
//             <option value="Resolved">Resolved ({resolvedCount})</option>
//           </select>
//         </div>

//         {/* Category Filter */}
//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           style={{ padding: '0.6rem 0.85rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', background: 'white', cursor: 'pointer' }}
//         >
//           <option value="all">All Categories</option>
//           <option value="Order Issue">Order Issue</option>
//           <option value="Payment Issue">Payment Issue</option>
//           <option value="Product Quality">Product Quality</option>
//           <option value="App Bug">App Bug</option>
//           <option value="Other">Other</option>
//         </select>
//       </div>

//       {/* REPORTS DATA TABLE */}
//       {loading ? (
//         <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '14px', border: '1.5px solid #e2e8f0', color: '#64748b' }}>
//           <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#ea580c' }} />
//           <p style={{ fontWeight: '700', margin: 0 }}>Loading user reports & tickets...</p>
//         </div>
//       ) : filteredReports.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '14px', border: '1.5px solid #e2e8f0', color: '#64748b' }}>
//           <HelpCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
//           <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>No Reports Found</h4>
//           <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
//             {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No tickets match your search or filter criteria.' : 'No user report tickets submitted yet.'}
//           </p>
//         </div>
//       ) : (
//         <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
//               <thead>
//                 <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                   <th style={{ padding: '0.85rem 1rem' }}>User Email</th>
//                   <th style={{ padding: '0.85rem 1rem' }}>Category</th>
//                   <th style={{ padding: '0.85rem 1rem' }}>Subject & Message</th>
//                   <th style={{ padding: '0.85rem 1rem' }}>Submitted Date</th>
//                   <th style={{ padding: '0.85rem 1rem' }}>Status</th>
//                   <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredReports.map((rep) => (
//                   <tr key={rep._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
//                     {/* User Info */}
//                     <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
//                       <div style={{ fontWeight: '800', color: '#0f172a' }}>{rep.userEmail}</div>
//                       <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rep.userName || 'Customer'}</div>
//                     </td>

//                     {/* Category */}
//                     <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
//                       <span style={{ display: 'inline-block', background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '3px 9px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
//                         {rep.category}
//                       </span>
//                     </td>

//                     {/* Subject & Message */}
//                     <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', maxWidth: '300px' }}>
//                       <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{rep.subject}</div>
//                       <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
//                         {rep.message}
//                       </div>

//                       {/* Admin Reply Indicator */}
//                       {rep.adminReply && (
//                         <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                           <MessageSquare size={12} /> <strong>Admin Replied:</strong> {rep.adminReply}
//                         </div>
//                       )}
//                     </td>

//                     {/* Date */}
//                     <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', fontSize: '0.8rem', color: '#64748b' }}>
//                       {new Date(rep.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                       <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
//                         {new Date(rep.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
//                       </div>
//                     </td>

//                     {/* Status */}
//                     <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
//                       {getStatusBadge(rep.status)}
//                     </td>

//                     {/* Actions */}
//                     <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right' }}>
//                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
//                         <button
//                           type="button"
//                           onClick={() => handleOpenReplyModal(rep)}
//                           style={{ background: '#fdf4ff', border: '1.5px solid #f5d0fe', color: '#c026d3', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
//                         >
//                           <Send size={14} /> {rep.adminReply ? 'Update Reply' : 'Reply & Update'}
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => handleDeleteReport(rep._id)}
//                           style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
//                           title="Delete Report"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* REPLY MODAL / DRAWER */}
//       {selectedReport && (
//         <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
//           <div style={{ background: 'white', borderRadius: '20px', maxWidth: '550px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', animation: 'scaleUp 0.2s ease-out' }}>
//             {/* Header */}
//             <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', color: 'white', padding: '1.15rem 1.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
//                 <HelpCircle size={22} color="#f5d0fe" />
//                 <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
//                   Reply & Resolve Ticket
//                 </h3>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setSelectedReport(null)}
//                 style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Body */}
//             <div style={{ padding: '1.35rem', maxHeight: '75vh', overflowY: 'auto' }}>
//               {/* User Report Details */}
//               <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.15rem' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
//                   <div>
//                     <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#c2410c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '6px' }}>
//                       {selectedReport.category}
//                     </span>
//                     <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0.4rem 0 0 0' }}>
//                       {selectedReport.subject}
//                     </h4>
//                   </div>
//                   {getStatusBadge(selectedReport.status)}
//                 </div>

//                 <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
//                   <strong>From:</strong> {selectedReport.userName} ({selectedReport.userEmail}) • {new Date(selectedReport.createdAt).toLocaleString()}
//                 </div>

//                 <div style={{ fontSize: '0.88rem', color: '#1e293b', background: 'white', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '8px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
//                   "{selectedReport.message}"
//                 </div>
//               </div>

//               {/* Reply Form */}
//               <form onSubmit={handleSendReply}>
//                 <div style={{ marginBottom: '1rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//                     Status Update *
//                   </label>
//                   <select
//                     value={updateStatus}
//                     onChange={(e) => setUpdateStatus(e.target.value)}
//                     style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', background: 'white' }}
//                   >
//                     <option value="Resolved">Resolved (Green Badge)</option>
//                     <option value="In Progress">In Progress (Blue Badge)</option>
//                     <option value="Pending">Pending (Amber Badge)</option>
//                   </select>
//                 </div>

//                 <div style={{ marginBottom: '1.25rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
//                     Admin Reply Message *
//                   </label>
//                   <textarea
//                     rows="4"
//                     placeholder="Write a clear, helpful response to the user's report..."
//                     value={replyText}
//                     onChange={(e) => setReplyText(e.target.value)}
//                     required
//                     style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', lineHeight: '1.4' }}
//                   />
//                 </div>

//                 <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
//                   <button
//                     type="button"
//                     onClick={() => setSelectedReport(null)}
//                     style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '0.7rem 1.15rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={replying || !replyText.trim()}
//                     style={{ background: 'linear-gradient(135deg, #c026d3 0%, #9333ea 100%)', border: 'none', color: 'white', padding: '0.7rem 1.35rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: replying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(192,38,211,0.3)' }}
//                   >
//                     <Send size={16} /> {replying ? 'Sending Reply...' : 'Submit Reply & Update Status'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminReports;





import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Send,
  Trash2,
  X,
  Filter
} from 'lucide-react';
import { API_URL } from '../../api';
import { fetchWithCache, clearCache } from '../../utils/cache';
import ToastNotification from '../ToastNotification';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Reply
  const [selectedReport, setSelectedReport] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('Resolved');
  const [replying, setReplying] = useState(false);
  const [toast, setToast] = useState(null);

  const refreshIntervalRef = useRef(null);

  const fetchReports = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) clearCache('admin_reports_list');

    try {
      const { data } = await fetchWithCache(
        'admin_reports_list',
        async () => {
          const res = await fetch(`${API_URL}/api/admin/reports`);
          if (res.ok) {
            return await res.json();
          }
          return [];
        },
        { forceRefresh }
      );

      if (data) {
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(false);

    refreshIntervalRef.current = setInterval(() => {
      fetchReports(true);
    }, 35000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [fetchReports]);

  const handleOpenReplyModal = (report) => {
    setSelectedReport(report);
    setReplyText(report.adminReply || '');
    setUpdateStatus(report.status === 'Pending' ? 'Resolved' : report.status);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedReport || !replyText.trim()) return;

    const reportId = selectedReport._id;
    const savedReply = replyText.trim();
    const savedStatus = updateStatus;
    let previousReports = reports;

    // OPTIMISTIC UI: Instant update
    setReports((prev) =>
      prev.map((r) =>
        r._id === reportId ? { ...r, status: savedStatus, adminReply: savedReply } : r
      )
    );
    setSelectedReport(null);
    setToast({ type: 'success', message: 'Reply sent and status updated!' });
    setReplying(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/reports/${reportId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReply: savedReply,
          status: savedStatus
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setReports(previousReports);
        setToast({ type: 'error', message: data.message || 'Failed to update report. Reverting.' });
      } else {
        clearCache('admin_reports_list');
      }
    } catch (err) {
      setReports(previousReports);
      setToast({ type: 'error', message: 'Network error submitting reply. Reverting.' });
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this support report ticket?')) return;

    let previousReports = reports;

    setReports((prev) => prev.filter((r) => r._id !== reportId));
    setToast({ type: 'success', message: '🗑️ Report deleted successfully!' });

    try {
      const res = await fetch(`${API_URL}/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReports(previousReports);
        setToast({ type: 'error', message: data.message || 'Failed to delete report. Reverting.' });
      } else {
        clearCache('admin_reports_list');
      }
    } catch (err) {
      setReports(previousReports);
      setToast({ type: 'error', message: 'Network error deleting report. Reverting.' });
    }
  };

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      (rep.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.message || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || rep.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
            <CheckCircle2 size={13} /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
            <Clock size={13} /> In Progress
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
            <AlertCircle size={13} /> Pending
          </span>
        );
    }
  };

  return (
    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              User Reports & Customer Support
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
              Manage customer issues, reply to tickets, and track resolution status
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchReports(true)}
          style={{ background: 'white', border: '1.5px solid #cbd5e1', color: '#475569', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* STATS SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tickets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginTop: '0.25rem' }}>{reports.length}</div>
        </div>

        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.05)' }}>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Tickets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#d97706', marginTop: '0.25rem' }}>{pendingCount}</div>
        </div>

        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)' }}>
          <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#2563eb', marginTop: '0.25rem' }}>{inProgressCount}</div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.05)' }}>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#16a34a', marginTop: '0.25rem' }}>{resolvedCount}</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by user email, subject, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.4rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', background: 'white', cursor: 'pointer' }}
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="In Progress">In Progress ({inProgressCount})</option>
            <option value="Resolved">Resolved ({resolvedCount})</option>
          </select>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '0.6rem 0.85rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', background: 'white', cursor: 'pointer' }}
        >
          <option value="all">All Categories</option>
          <option value="Order Issue">Order Issue</option>
          <option value="Payment Issue">Payment Issue</option>
          <option value="Product Quality">Product Quality</option>
          <option value="App Bug">App Bug</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* REPORTS DATA TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '14px', border: '1.5px solid #e2e8f0', color: '#64748b' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#ea580c' }} />
          <p style={{ fontWeight: '700', margin: 0 }}>Loading user reports & tickets...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '14px', border: '1.5px solid #e2e8f0', color: '#64748b' }}>
          <HelpCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>No Reports Found</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No tickets match your search criteria.' : 'No user report tickets submitted yet.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>User Email</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Subject & Message</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Submitted Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((rep) => (
                  <tr key={rep._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{rep.userEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rep.userName || 'Customer'}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      <span style={{ display: 'inline-block', background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '3px 9px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                        {rep.category}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', maxWidth: '300px' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{rep.subject}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rep.message}
                      </div>

                      {rep.adminReply && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={12} /> <strong>Admin Replied:</strong> {rep.adminReply}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(rep.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(rep.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      {getStatusBadge(rep.status)}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReplyModal(rep)}
                          style={{ background: '#fdf4ff', border: '1.5px solid #f5d0fe', color: '#c026d3', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Send size={14} /> {rep.adminReply ? 'Update Reply' : 'Reply & Update'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReport(rep._id)}
                          style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                          title="Delete Report"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPLY MODAL */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '550px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', color: 'white', padding: '1.15rem 1.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <HelpCircle size={22} color="#f5d0fe" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                  Reply & Resolve Ticket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.35rem', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#c2410c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '6px' }}>
                      {selectedReport.category}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0.4rem 0 0 0' }}>
                      {selectedReport.subject}
                    </h4>
                  </div>
                  {getStatusBadge(selectedReport.status)}
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                  <strong>From:</strong> {selectedReport.userName} ({selectedReport.userEmail}) • {new Date(selectedReport.createdAt).toLocaleString()}
                </div>

                <div style={{ fontSize: '0.88rem', color: '#1e293b', background: 'white', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '8px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  "{selectedReport.message}"
                </div>
              </div>

              <form onSubmit={handleSendReply}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
                    Status Update *
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', background: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="Resolved">Resolved (Green Badge)</option>
                    <option value="In Progress">In Progress (Blue Badge)</option>
                    <option value="Pending">Pending (Amber Badge)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
                    Admin Reply Message *
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Write a clear response to the user..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', lineHeight: '1.4', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '0.7rem 1.15rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    style={{ background: 'linear-gradient(135deg, #c026d3 0%, #9333ea 100%)', border: 'none', color: 'white', padding: '0.7rem 1.35rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: replying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={16} /> {replying ? 'Sending Reply...' : 'Submit Reply & Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;