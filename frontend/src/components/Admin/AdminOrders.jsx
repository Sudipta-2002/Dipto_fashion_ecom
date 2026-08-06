import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, FileText, Download, Calendar, Clock, Package } from 'lucide-react';
import ShippingLabel from './ShippingLabel';
import TableSkeleton from '../Skeletons/TableSkeleton';
import { API_URL } from '../../api';
import { fetchWithCache } from '../../utils/cache';

const groupOrdersByDate = (ordersList) => {
  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const today = [];
  const yesterdayOrders = [];
  const olderMap = {}; // Key: Date String, Value: Array of Orders

  ordersList.forEach((o) => {
    const orderDate = new Date(o.createdAt || Date.now());
    const dateStr = orderDate.toDateString();

    if (dateStr === todayStr) {
      today.push(o);
    } else if (dateStr === yesterdayStr) {
      yesterdayOrders.push(o);
    } else {
      const displayDate = orderDate.toLocaleDateString('en-GB', {
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

  return { today, yesterday: yesterdayOrders, olderGroups: olderMap };
};

const AdminOrders = ({ realtimeOrderUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUtrModal, setSelectedUtrModal] = useState(null);
  const [shippingDocketOrder, setShippingDocketOrder] = useState(null);

  const fetchOrders = async (forceRefresh = false) => {
    const { data: cachedData } = await fetchWithCache(
      'admin_orders',
      async () => {
        const res = await fetch(`${API_URL}/api/orders`);
        return await res.json();
      },
      { forceRefresh }
    );

    if (cachedData) {
      setOrders(cachedData);
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // REAL-TIME ORDER PREPENDING
  useEffect(() => {
    if (realtimeOrderUpdate) {
      setOrders((prevOrders) => {
        // Prevent duplicate prepend
        const exists = prevOrders.some(
          (o) => (o._id || o.orderId) === (realtimeOrderUpdate._id || realtimeOrderUpdate.orderId)
        );
        if (exists) return prevOrders;
        return [realtimeOrderUpdate, ...prevOrders];
      });
    }
  }, [realtimeOrderUpdate]);

  const updateOrderStatus = async (orderId, newStatus, reason = '') => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason })
      });
      if (res.ok) {
        const updated = await res.json();
        alert(`Order status updated to "${newStatus}"`);
        fetchOrders();

        if (newStatus === 'Accepted') {
          setShippingDocketOrder(updated);
        }
      }
    } catch (e) {
      alert('Error updating order status');
    }
  };

  const { today, yesterday, olderGroups } = groupOrdersByDate(orders);

  const renderOrdersTable = (orderItems) => (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer & Mobile</th>
            <th>Delivery Address</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>UTR Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((o) => (
            <tr key={o._id || o.orderId}>
              <td>
                <strong style={{ color: '#c026d3' }}>{o.orderId}</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td>
                <div style={{ fontWeight: '700' }}>{o.shippingAddress?.userName || o.userName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.shippingAddress?.mobileNumber}</div>
              </td>
              <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                {o.shippingAddress?.address}, Pincode: <strong>{o.shippingAddress?.pincode}</strong>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {o.items?.map((item, idx) => (
                    <span key={idx} style={{ fontSize: '0.8rem' }}>
                      • {item.name} ({item.selectedSize || 'Free Size'}) x{item.quantity}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>
                  ₹{o.totalAmount?.toLocaleString('en-IN')}
                </strong>
                {o.couponDiscount > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block', fontWeight: '700' }}>
                    Discount: -₹{o.couponDiscount?.toLocaleString('en-IN')} ({o.couponCode})
                  </div>
                )}
              </td>
              <td>
                <button
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedUtrModal(o)}
                >
                  <Eye size={14} /> View UTR
                </button>
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    background:
                      o.status === 'Delivered'
                        ? '#dcfce7'
                        : o.status === 'Out for Delivery'
                        ? '#e0f2fe'
                        : o.status === 'Shipped'
                        ? '#fef3c7'
                        : o.status === 'Accepted'
                        ? '#fdf4ff'
                        : o.status === 'Cancelled' || o.status === 'Rejected'
                        ? '#fee2e2'
                        : '#fff7ed',
                    color:
                      o.status === 'Delivered'
                        ? '#15803d'
                        : o.status === 'Out for Delivery'
                        ? '#0369a1'
                        : o.status === 'Shipped'
                        ? '#b45309'
                        : o.status === 'Accepted'
                        ? '#c026d3'
                        : o.status === 'Cancelled' || o.status === 'Rejected'
                        ? '#b91c1c'
                        : '#c2410c'
                  }}
                >
                  {o.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {o.status === 'Pending Verification' && (
                    <button
                      style={{ background: '#16a34a', color: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}
                      onClick={() => updateOrderStatus(o._id || o.orderId, 'Accepted')}
                    >
                      Accept Order
                    </button>
                  )}
                  {o.status === 'Accepted' && (
                    <button
                      style={{ background: '#2563eb', color: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}
                      onClick={() => updateOrderStatus(o._id || o.orderId, 'Shipped')}
                    >
                      Mark Shipped
                    </button>
                  )}
                  {o.status === 'Shipped' && (
                    <button
                      style={{ background: '#0284c7', color: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}
                      onClick={() => updateOrderStatus(o._id || o.orderId, 'Out for Delivery')}
                    >
                      Out for Delivery
                    </button>
                  )}
                  {o.status === 'Out for Delivery' && (
                    <button
                      style={{ background: '#16a34a', color: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}
                      onClick={() => updateOrderStatus(o._id || o.orderId, 'Delivered')}
                    >
                      Mark Delivered
                    </button>
                  )}
                  {['Pending Verification', 'Accepted'].includes(o.status) && (
                    <button
                      style={{ background: '#ef4444', color: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}
                      onClick={() => {
                        const reason = prompt('Enter rejection reason (optional):');
                        updateOrderStatus(o._id || o.orderId, 'Rejected', reason || '');
                      }}
                    >
                      Reject
                    </button>
                  )}
                  {['Accepted', 'Shipped', 'Out for Delivery', 'Delivered'].includes(o.status) && (
                    <button
                      className="btn-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', borderColor: '#c026d3', color: '#c026d3' }}
                      onClick={() => setShippingDocketOrder(o)}
                    >
                      <FileText size={14} /> Docket Label
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
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
          Customer Orders Management
        </h3>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
          Total Orders: {orders.length}
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : orders.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
          <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h4>No Customer Orders Found</h4>
        </div>
      ) : (
        <>
          {/* TODAY'S ORDERS CARD */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #bbf7d0', boxShadow: '0 4px 12px rgba(22,163,74,0.06)', overflow: 'hidden' }}>
            <div style={{ background: '#f0fdf4', padding: '0.85rem 1.25rem', borderBottom: '1.5px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#15803d', margin: 0 }}>
                    Today
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#16a34a', margin: 0 }}>Orders placed today</p>
                </div>
              </div>
              <span style={{ background: '#16a34a', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
                {today.length} {today.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
            <div style={{ padding: '1rem' }}>
              {today.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  No orders placed today yet.
                </div>
              ) : (
                renderOrdersTable(today)
              )}
            </div>
          </div>

          {/* YESTERDAY'S ORDERS CARD */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #bfdbfe', boxShadow: '0 4px 12px rgba(37,99,235,0.06)', overflow: 'hidden' }}>
            <div style={{ background: '#eff6ff', padding: '0.85rem 1.25rem', borderBottom: '1.5px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#1d4ed8', margin: 0 }}>
                    Yesterday
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#2563eb', margin: 0 }}>Orders placed yesterday</p>
                </div>
              </div>
              <span style={{ background: '#2563eb', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
                {yesterday.length} {yesterday.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
            <div style={{ padding: '1rem' }}>
              {yesterday.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  No orders placed yesterday.
                </div>
              ) : (
                renderOrdersTable(yesterday)
              )}
            </div>
          </div>

          {/* DATE-TO-DATE OLDER ORDERS CARDS */}
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
                      <p style={{ fontSize: '0.75rem', color: '#c026d3', margin: 0 }}>Date-to-Date Archive</p>
                    </div>
                  </div>
                  <span style={{ background: '#c026d3', color: 'white', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
                    {groupList.length} {groupList.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  {renderOrdersTable(groupList)}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* UTR Verification View Modal */}
      {selectedUtrModal && (
        <div className="modal-overlay" onClick={() => setSelectedUtrModal(null)}>
          <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment UTR Details</h3>
              <button className="close-btn" onClick={() => setSelectedUtrModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Submitted UTR / Transaction Reference Number:
              </p>
              <div style={{ background: '#f8fafc', border: '2px dashed #c026d3', borderRadius: '10px', padding: '1.25rem', fontSize: '1.4rem', fontWeight: '900', color: '#c026d3', letterSpacing: '1px', marginBottom: '1.25rem' }}>
                {selectedUtrModal.utrNumber}
              </div>
              <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#334155' }}>
                <p style={{ margin: '0 0 0.35rem 0' }}><strong>Order ID:</strong> {selectedUtrModal.orderId}</p>
                <p style={{ margin: '0 0 0.35rem 0' }}><strong>Customer Name:</strong> {selectedUtrModal.shippingAddress?.userName || selectedUtrModal.userName}</p>
                <p style={{ margin: '0 0 0.35rem 0' }}><strong>Actual Paid Amount:</strong> <span style={{ color: '#16a34a', fontWeight: '800' }}>₹{selectedUtrModal.totalAmount?.toLocaleString('en-IN')}</span></p>
                {selectedUtrModal.couponDiscount > 0 && (
                  <div style={{ color: '#15803d', background: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                    <strong>🏷️ Coupon Discount Applied:</strong> -₹{selectedUtrModal.couponDiscount?.toLocaleString('en-IN')} (Code: <strong>{selectedUtrModal.couponCode}</strong>)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Label / Docket Generator Modal */}
      {shippingDocketOrder && (
        <ShippingLabel order={shippingDocketOrder} onClose={() => setShippingDocketOrder(null)} />
      )}
    </div>
  );
};

export default AdminOrders;
