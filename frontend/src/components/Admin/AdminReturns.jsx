import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, CheckCircle2, Clock, Truck, Landmark, RefreshCw, Calendar, AlertCircle, Ban, CreditCard, Smartphone, Building2 } from 'lucide-react';
import TableSkeleton from '../Skeletons/TableSkeleton';
import { API_URL } from '../../api';
import { clearCache } from '../../utils/cache';

// ─────────────────────────────────────────────────────────────
// Helper: group both return AND cancellation requests by date
// ─────────────────────────────────────────────────────────────
const groupRequestsByDate = (list) => {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const today = [];
  const yesterdayItems = [];
  const olderMap = {};

  list.forEach((o) => {
    const dateRef = new Date(
      o.status === 'Cancellation Requested'
        ? (o.cancellationDetails?.requestedAt || o.updatedAt || o.createdAt)
        : (o.returnDetails?.requestedAt || o.updatedAt || o.createdAt || Date.now())
    );
    const dateStr = dateRef.toDateString();

    if (dateStr === todayStr) {
      today.push(o);
    } else if (dateStr === yesterdayStr) {
      yesterdayItems.push(o);
    } else {
      const displayDate = dateRef.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!olderMap[displayDate]) olderMap[displayDate] = [];
      olderMap[displayDate].push(o);
    }
  });

  return { today, yesterday: yesterdayItems, olderGroups: olderMap };
};

// ─────────────────────────────────────────────────────────────
// Sub-component: shows refund payout info for a cancellation
// ─────────────────────────────────────────────────────────────
const CancellationRefundBadge = ({ order }) => {
  const cd = order.cancellationDetails || {};
  if (cd.refundToSource) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#2563eb', fontWeight: '700' }}>
        <CreditCard size={13} /> Original Payment Source
      </div>
    );
  }
  if (cd.upiId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#7c3aed', fontWeight: '700' }}>
        <Smartphone size={13} /> UPI: {cd.upiId}
      </div>
    );
  }
  if (cd.accountNumber) {
    return (
      <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: '700' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1' }}>
          <Building2 size={13} /> A/c ••••{cd.accountNumber.slice(-4)}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
          {cd.accountHolder && <span>{cd.accountHolder} </span>}
          {cd.ifscCode && <span>• IFSC: {cd.ifscCode}</span>}
        </div>
      </div>
    );
  }
  return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>;
};

const AdminReturns = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState(null); // For detail modal
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'cancellation' | 'return'

  // Inline status messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const refreshIntervalRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  useEffect(() => {
    fetchRequests();

    refreshIntervalRef.current = setInterval(() => fetchRequests(true), 30000);

    const handleStatusUpdate = (e) => {
      const updated = e.detail;
      if (!updated) return;
      const s = updated.status || '';
      if (s.includes('Return') || s.includes('Refund') || s.includes('Cancell')) {
        fetchRequests(true);
      }
    };

    window.addEventListener('df_order_status_updated', handleStatusUpdate);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      window.removeEventListener('df_order_status_updated', handleStatusUpdate);
    };
  }, []);

  const fetchRequests = async (forceRefresh = false) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/returns`);
      if (res.ok) {
        const data = await res.json();
        setAllRequests(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching returns/cancellations:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Optimistic update for Return status changes ──
  const handleUpdateReturnStatus = async (orderId, newStatus) => {
    let previousRequests = [];
    setAllRequests((prev) => {
      previousRequests = prev;
      return prev.map((o) =>
        (o._id === orderId || o.orderId === orderId) ? { ...o, status: newStatus } : o
      );
    });
    showSuccess(`Status updated to "${newStatus}" ✅`);

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        clearCache('admin_returns');
        window.dispatchEvent(new CustomEvent('df_order_status_updated', {
          detail: { _id: orderId, orderId, status: newStatus }
        }));
      } else {
        setAllRequests(previousRequests);
        showError(`Failed to update to "${newStatus}". Reverting.`);
      }
    } catch (e) {
      setAllRequests(previousRequests);
      showError('Network error updating return status. Reverting.');
    }
  };

  // ── Approve Cancellation: calls dedicated endpoint ──
  const handleApproveCancellation = async (order) => {
    const orderId = order._id || order.orderId;
    let previousRequests = [];

    // Optimistic update: mark as Cancelled immediately
    setAllRequests((prev) => {
      previousRequests = prev;
      return prev.filter((o) => (o._id !== orderId && o.orderId !== orderId));
    });
    showSuccess(`Cancellation approved for ${order.orderId} ✅ — Stock restored.`);

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/approve-cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        clearCache('admin_returns');
        const data = await res.json();
        // Broadcast real-time event for user's My Orders to update
        window.dispatchEvent(new CustomEvent('df_order_status_updated', {
          detail: { _id: orderId, orderId: order.orderId, status: 'Cancelled', ...(data.order || {}) }
        }));
      } else {
        // Rollback
        setAllRequests(previousRequests);
        const errData = await res.json().catch(() => ({}));
        showError(errData.message || 'Failed to approve cancellation. Reverting.');
      }
    } catch (e) {
      setAllRequests(previousRequests);
      showError('Network error approving cancellation. Reverting.');
    }
  };

  // ── Filter ──
  const filteredRequests = allRequests.filter((o) => {
    if (activeFilter === 'cancellation') return o.status === 'Cancellation Requested';
    if (activeFilter === 'return') return ['Return Requested', 'Return Approved', 'Refund Completed'].includes(o.status);
    return true;
  });

  const cancellationCount = allRequests.filter(o => o.status === 'Cancellation Requested').length;
  const returnCount = allRequests.filter(o => ['Return Requested', 'Return Approved', 'Refund Completed'].includes(o.status)).length;

  const { today, yesterday, olderGroups } = groupRequestsByDate(filteredRequests);

  // ── Table renderer (handles both returns and cancellations) ──
  const renderTable = (itemsList) => (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer &amp; Phone</th>
            <th>Type / Reason</th>
            <th>Refund Details</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.map((o) => {
            const isCancellationReq = o.status === 'Cancellation Requested';
            return (
              <tr key={o._id || o.orderId}>
                {/* Order ID */}
                <td>
                  <strong style={{ color: isCancellationReq ? '#d97706' : '#c026d3' }}>{o.orderId}</strong>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px' }}>
                    {new Date(
                      isCancellationReq
                        ? (o.cancellationDetails?.requestedAt || o.updatedAt)
                        : (o.returnDetails?.requestedAt || o.updatedAt)
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* Customer */}
                <td>
                  <div style={{ fontWeight: '700' }}>{o.shippingAddress?.userName || o.userName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{o.shippingAddress?.mobileNumber}</div>
                </td>

                {/* Type + Reason */}
                <td style={{ maxWidth: '180px' }}>
                  {isCancellationReq ? (
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '900', color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: '8px', marginBottom: '4px' }}>
                        <Ban size={11} /> CANCELLATION
                      </span>
                      <div style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: '600' }}>
                        {o.cancellationDetails?.reason || 'Customer requested cancellation'}
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '900', color: '#c026d3', background: '#fdf4ff', border: '1px solid #f5d0fe', padding: '2px 7px', borderRadius: '8px', marginBottom: '4px' }}>
                        <RotateCcw size={11} /> RETURN
                      </span>
                      <div style={{ fontSize: '0.82rem', color: '#7e22ce', fontWeight: '600' }}>
                        {o.returnDetails?.reason || 'Return Requested'}
                      </div>
                      {o.returnDetails?.notes && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                          "{o.returnDetails.notes}"
                        </div>
                      )}
                    </>
                  )}
                </td>

                {/* Refund Details */}
                <td>
                  {isCancellationReq ? (
                    <CancellationRefundBadge order={o} />
                  ) : (
                    <button
                      className="btn-outline"
                      style={{ padding: '0.32rem 0.6rem', fontSize: '0.78rem' }}
                      onClick={() => setSelectedDetails({ ...o, type: 'return' })}
                    >
                      <Landmark size={13} /> View Bank / UPI
                    </button>
                  )}
                </td>

                {/* Amount */}
                <td>
                  <strong style={{ fontSize: '1.02rem', color: '#16a34a' }}>
                    ₹{o.totalAmount?.toLocaleString('en-IN')}
                  </strong>
                </td>

                {/* Status Badge */}
                <td>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.73rem',
                    background: o.status === 'Refund Completed' ? '#dcfce7'
                      : o.status === 'Return Approved' ? '#eff6ff'
                      : o.status === 'Cancellation Requested' ? '#fffbeb'
                      : '#fef2f2',
                    color: o.status === 'Refund Completed' ? '#15803d'
                      : o.status === 'Return Approved' ? '#1d4ed8'
                      : o.status === 'Cancellation Requested' ? '#92400e'
                      : '#b91c1c'
                  }}>
                    {o.status === 'Cancellation Requested' ? '⏳ Cancellation Requested' : o.status}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {/* ── CANCELLATION ACTIONS ── */}
                    {o.status === 'Cancellation Requested' && (
                      <button
                        style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => handleApproveCancellation(o)}
                        title="Approve cancellation, cancel the order and restore stock"
                      >
                        <CheckCircle2 size={13} /> Approve Cancellation
                      </button>
                    )}

                    {/* ── RETURN ACTIONS ── */}
                    {o.status === 'Return Requested' && (
                      <button
                        style={{ background: '#2563eb', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', border: 'none' }}
                        onClick={() => handleUpdateReturnStatus(o._id || o.orderId, 'Return Approved')}
                      >
                        Approve Pickup
                      </button>
                    )}
                    {o.status === 'Return Approved' && (
                      <button
                        style={{ background: '#16a34a', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', border: 'none' }}
                        onClick={() => handleUpdateReturnStatus(o._id || o.orderId, 'Refund Completed')}
                      >
                        Complete Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGroup = (itemsList, title, subtitle, borderColor, bgColor, badgeBg, textColor) => (
    <div style={{ background: 'white', borderRadius: '14px', border: `1.5px solid ${borderColor}`, boxShadow: `0 4px 12px ${bgColor}22`, overflow: 'hidden' }}>
      <div style={{ background: bgColor, padding: '0.85rem 1.25rem', borderBottom: `1.5px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${borderColor}44`, color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: '900', color: textColor, margin: 0 }}>{title}</h4>
            <p style={{ fontSize: '0.73rem', color: textColor, margin: 0, opacity: 0.8 }}>{subtitle}</p>
          </div>
        </div>
        <span style={{ background: badgeBg, color: 'white', fontSize: '0.78rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
          {itemsList.length} {itemsList.length === 1 ? 'Request' : 'Requests'}
        </span>
      </div>
      <div style={{ padding: '1rem' }}>
        {itemsList.length === 0 ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
            No requests for this period.
          </div>
        ) : renderTable(itemsList)}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c026d3' }}>
          <RotateCcw size={22} /> Returns &amp; Cancellations Dashboard
        </h3>
        <button className="btn-outline" onClick={() => fetchRequests(true)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `All Requests (${allRequests.length})` },
          { id: 'cancellation', label: `⏳ Cancellations (${cancellationCount})` },
          { id: 'return', label: `🔄 Returns (${returnCount})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '800',
              border: '2px solid',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderColor: activeFilter === tab.id ? '#c026d3' : '#e2e8f0',
              background: activeFilter === tab.id ? '#fdf4ff' : 'white',
              color: activeFilter === tab.id ? '#7e22ce' : '#64748b'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Inline Messages ── */}
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredRequests.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <RotateCcw size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#334155' }}>No Active Requests</h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Return requests and cancellation requests will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Today */}
          {renderGroup(today, 'Today', 'Requests submitted today', '#fecdd3', '#fff1f2', '#e11d48', '#be123c')}

          {/* Yesterday */}
          {renderGroup(yesterday, 'Yesterday', 'Requests submitted yesterday', '#fed7aa', '#fff7ed', '#ea580c', '#c2410c')}

          {/* Older by date */}
          {Object.keys(olderGroups).map((dateKey) =>
            renderGroup(olderGroups[dateKey], dateKey, 'Date-to-Date Archive', '#f5d0fe', '#fdf4ff', '#c026d3', '#a21caf')
          )}
        </>
      )}

      {/* ── Return Bank/UPI Details Modal ── */}
      {selectedDetails && (
        <div className="modal-overlay" onClick={() => setSelectedDetails(null)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Refund Details</h3>
              <button className="close-btn" onClick={() => setSelectedDetails(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                {selectedDetails.returnDetails?.upiId ? (
                  <div>
                    <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: '700' }}>UPI ID FOR REFUND:</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#c026d3', marginTop: '0.25rem' }}>
                      {selectedDetails.returnDetails.upiId}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div><strong>Account Holder:</strong> {selectedDetails.returnDetails?.accountHolder}</div>
                    <div><strong>Bank Name:</strong> {selectedDetails.returnDetails?.bankName}</div>
                    <div><strong>Account Number:</strong> {selectedDetails.returnDetails?.accountNumber}</div>
                    <div><strong>IFSC Code:</strong> {selectedDetails.returnDetails?.ifscCode}</div>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                <p><strong>Order ID:</strong> {selectedDetails.orderId}</p>
                <p><strong>Refund Amount:</strong> ₹{selectedDetails.totalAmount?.toLocaleString('en-IN')}</p>
                <p><strong>Return Reason:</strong> {selectedDetails.returnDetails?.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
