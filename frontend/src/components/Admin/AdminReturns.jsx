import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Clock, Truck, Landmark, RefreshCw, Eye, Calendar, AlertCircle } from 'lucide-react';
import { API_URL } from '../../api';

const groupReturnsByDate = (returnsList) => {
  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const today = [];
  const yesterdayReturns = [];
  const olderMap = {}; // Key: Date String, Value: Array of Return Orders

  returnsList.forEach((o) => {
    const returnDate = new Date(o.returnDetails?.requestedAt || o.updatedAt || o.createdAt || Date.now());
    const dateStr = returnDate.toDateString();

    if (dateStr === todayStr) {
      today.push(o);
    } else if (dateStr === yesterdayStr) {
      yesterdayReturns.push(o);
    } else {
      const displayDate = returnDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      if (!olderMap[displayDate]) {
        olderMap[displayDate] = [];
      }
      olderMap[displayDate].push(o);
    }
  });

  return { today, yesterday: yesterdayReturns, olderGroups: olderMap };
};

const AdminReturns = () => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/returns`);
      if (res.ok) {
        const data = await res.json();
        setReturnOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert(`Return status updated to "${newStatus}"`);
        fetchReturns();
      }
    } catch (e) {
      alert('Error updating return status');
    }
  };

  const { today, yesterday, olderGroups } = groupReturnsByDate(returnOrders);

  const renderReturnsTable = (itemsList) => (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer & Phone</th>
            <th>Return Reason</th>
            <th>Refund Details (Bank/UPI)</th>
            <th>Amount</th>
            <th>Pickup Schedule</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.map((o) => (
            <tr key={o._id || o.orderId}>
              <td>
                <strong style={{ color: '#c026d3' }}>{o.orderId}</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(o.returnDetails?.requestedAt || o.updatedAt || o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td>
                <div style={{ fontWeight: '700' }}>{o.shippingAddress?.userName || o.userName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.shippingAddress?.mobileNumber}</div>
              </td>
              <td style={{ maxWidth: '180px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#e11d48' }}>
                  {o.returnDetails?.reason || 'Return Requested'}
                </span>
                {o.returnDetails?.notes && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                    "{o.returnDetails.notes}"
                  </div>
                )}
              </td>
              <td>
                <button
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedReturnDetails(o)}
                >
                  <Landmark size={14} /> View Bank / UPI
                </button>
              </td>
              <td>
                <strong style={{ fontSize: '1.05rem', color: '#16a34a' }}>
                  ₹{o.totalAmount?.toLocaleString('en-IN')}
                </strong>
              </td>
              <td>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={14} /> {o.returnDetails?.pickupDate || 'Within 3 Days'}
                </div>
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    background: o.status === 'Refund Completed' ? '#dcfce7' : o.status === 'Return Approved' ? '#eff6ff' : '#fef2f2',
                    color: o.status === 'Refund Completed' ? '#15803d' : o.status === 'Return Approved' ? '#1d4ed8' : '#b91c1c'
                  }}
                >
                  {o.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {o.status === 'Return Requested' && (
                    <button
                      style={{ background: '#2563eb', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
                      onClick={() => handleUpdateStatus(o._id || o.orderId, 'Return Approved')}
                    >
                      Approve Pickup
                    </button>
                  )}
                  {o.status === 'Return Approved' && (
                    <button
                      style={{ background: '#16a34a', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
                      onClick={() => handleUpdateStatus(o._id || o.orderId, 'Refund Completed')}
                    >
                      Complete Refund
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c026d3' }}>
          <RotateCcw size={22} /> Customer Returns & Refund Dashboard
        </h3>
        <button className="btn-outline" onClick={fetchReturns} style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Refresh Returns
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading customer return requests...
        </div>
      ) : returnOrders.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <RotateCcw size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#334155' }}>No Active Return Requests</h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Customer returns and refund requests will be listed here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* TODAY'S REFUND / RETURN REQUESTS CARD */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #fecdd3', boxShadow: '0 4px 12px rgba(225,29,72,0.06)', overflow: 'hidden' }}>
            <div style={{ background: '#fff1f2', padding: '0.85rem 1.25rem', borderBottom: '1.5px solid #fecdd3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#be123c', margin: 0 }}>
                    Today
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#e11d48', margin: 0 }}>Return requests submitted today</p>
                </div>
              </div>
              <span style={{ background: '#e11d48', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
                {today.length} {today.length === 1 ? 'Return' : 'Returns'}
              </span>
            </div>
            <div style={{ padding: '1rem' }}>
              {today.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  No return requests submitted today.
                </div>
              ) : (
                renderReturnsTable(today)
              )}
            </div>
          </div>

          {/* YESTERDAY'S REFUND / RETURN REQUESTS CARD */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #fed7aa', boxShadow: '0 4px 12px rgba(234,88,12,0.06)', overflow: 'hidden' }}>
            <div style={{ background: '#fff7ed', padding: '0.85rem 1.25rem', borderBottom: '1.5px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#c2410c', margin: 0 }}>
                    Yesterday
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#ea580c', margin: 0 }}>Return requests submitted yesterday</p>
                </div>
              </div>
              <span style={{ background: '#ea580c', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
                {yesterday.length} {yesterday.length === 1 ? 'Return' : 'Returns'}
              </span>
            </div>
            <div style={{ padding: '1rem' }}>
              {yesterday.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  No return requests submitted yesterday.
                </div>
              ) : (
                renderReturnsTable(yesterday)
              )}
            </div>
          </div>

          {/* DATE-TO-DATE OLDER RETURNS CARDS */}
          {Object.keys(olderGroups).map((dateKey) => {
            const groupList = olderGroups[dateKey];
            return (
              <div key={dateKey} style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #f5d0fe', boxShadow: '0 4px 12px rgba(192,38,211,0.06)', overflow: 'hidden' }}>
                <div style={{ background: '#fdf4ff', padding: '0.85rem 1.25rem', borderBottom: '1.5px solid #f5d0fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fae8ff', color: '#a21caf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#a21caf', margin: 0 }}>
                        {dateKey}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#c026d3', margin: 0 }}>Date-to-Date Returns Archive</p>
                    </div>
                  </div>
                  <span style={{ background: '#c026d3', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
                    {groupList.length} {groupList.length === 1 ? 'Return' : 'Returns'}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  {renderReturnsTable(groupList)}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Return Bank & UPI Details Modal */}
      {selectedReturnDetails && (
        <div className="modal-overlay" onClick={() => setSelectedReturnDetails(null)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Refund Details</h3>
              <button className="close-btn" onClick={() => setSelectedReturnDetails(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                {selectedReturnDetails.returnDetails?.upiId ? (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>UPI ID FOR REFUND:</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#c026d3', marginTop: '0.25rem' }}>
                      {selectedReturnDetails.returnDetails.upiId}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div><strong>Account Holder:</strong> {selectedReturnDetails.returnDetails?.accountHolder}</div>
                    <div><strong>Bank Name:</strong> {selectedReturnDetails.returnDetails?.bankName}</div>
                    <div><strong>Account Number:</strong> {selectedReturnDetails.returnDetails?.accountNumber}</div>
                    <div><strong>IFSC Code:</strong> {selectedReturnDetails.returnDetails?.ifscCode}</div>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                <p><strong>Order ID:</strong> {selectedReturnDetails.orderId}</p>
                <p><strong>Refund Amount:</strong> ₹{selectedReturnDetails.totalAmount?.toLocaleString('en-IN')}</p>
                <p><strong>Return Reason:</strong> {selectedReturnDetails.returnDetails?.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
