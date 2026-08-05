import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, ShoppingBag, Filter, Bell, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { API_URL } from '../../api';
import { fetchWithCache } from '../../utils/cache';
import DashboardSkeleton from '../Skeletons/DashboardSkeleton';

const AdminDashboard = ({ onNavigateToOrders, onNavigateToReturns, realtimeOrderUpdate }) => {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthlySales: 0,
    totalSales: 0,
    totalOrders: 0,
    acceptedOrdersCount: 0,
    pendingOrdersCount: 0,
    dailyReturnQty: 0,
    dailyReturnAmount: 0,
    monthlyReturnQty: 0,
    monthlyReturnAmount: 0,
    pendingReturnsCount: 0,
    chartData: [],
    returnChartData: []
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (forceRefresh = false) => {
    const cacheKey = `admin_analytics_${startDate}_${endDate}`;
    const { data: cachedData } = await fetchWithCache(
      cacheKey,
      async () => {
        let url = `${API_URL}/api/admin/analytics`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url);
        return await res.json();
      },
      { forceRefresh }
    );

    if (cachedData) {
      setStats(cachedData);
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  // Real-time Order Arrival Listener
  useEffect(() => {
    if (realtimeOrderUpdate) {
      setStats((prev) => ({
        ...prev,
        totalOrders: (prev.totalOrders || 0) + 1,
        pendingOrdersCount: (prev.pendingOrdersCount || 0) + 1,
        todaySales: (prev.todaySales || 0) + (realtimeOrderUpdate.totalAmount || 0),
        totalSales: (prev.totalSales || 0) + (realtimeOrderUpdate.totalAmount || 0)
      }));
    }
  }, [realtimeOrderUpdate]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAnalytics();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      {/* PENDING RETURN REFUND POP-UP ALERT BANNER */}
      {stats.pendingReturnsCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          border: '2px solid #e11d48',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 20px rgba(225, 29, 72, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#e11d48', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#9f1239', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚨 PENDING RETURN REFUNDS ALERT ({stats.pendingReturnsCount})
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#be123c', marginTop: '2px', fontWeight: '600' }}>
                You have {stats.pendingReturnsCount} customer return request(s) awaiting pickup approval & refund verification!
              </p>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ background: '#e11d48', borderColor: '#be123c', padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}
            onClick={onNavigateToReturns || onNavigateToOrders}
          >
            <span>Manage Returns ({stats.pendingReturnsCount})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* PENDING ORDERS NOTIFICATION BANNER */}
      {stats.pendingOrdersCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '2px solid #f97316',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 20px rgba(249, 115, 22, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#f97316', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c2410c', margin: 0 }}>
                Pending Orders Alert ({stats.pendingOrdersCount})
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#9a3412', marginTop: '2px' }}>
                You have {stats.pendingOrdersCount} customer order(s) awaiting verification! Accept them to update status.
              </p>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ background: '#f97316', borderColor: '#ea580c', padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}
            onClick={onNavigateToOrders}
          >
            <span>Review Orders ({stats.pendingOrdersCount})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Date Range Filter */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
            <Filter size={16} /> Filter Date Range
          </button>
          {(startDate || endDate) && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchAnalytics, 100); }}
              style={{ padding: '0.55rem 1rem' }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* SALES & RETURN STATS GRID */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c026d3' }}>
            <h4>Today's Sales</h4>
            <DollarSign size={20} />
          </div>
          <div className="value">₹{stats.todaySales?.toLocaleString('en-IN')}</div>
          <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>
            ✔ Accepted Orders Today
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
            <h4>Monthly Sales</h4>
            <Calendar size={20} />
          </div>
          <div className="value">₹{stats.monthlySales?.toLocaleString('en-IN')}</div>
          <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>
            ✔ Accepted Orders This Month
          </p>
        </div>

        {/* DAILY RETURN QUANTITY & REFUND AMOUNT */}
        <div className="stat-card" style={{ border: '1.5px solid #fecdd3', background: '#fff1f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e11d48' }}>
            <h4>Today's Returns</h4>
            <RotateCcw size={20} />
          </div>
          <div className="value" style={{ color: '#e11d48' }}>
            {stats.dailyReturnQty || 0} Pcs <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>(₹{stats.dailyReturnAmount?.toLocaleString('en-IN') || 0})</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: '600', marginTop: '4px' }}>
            ↩ Daily Returned Quantity & Amount
          </p>
        </div>

        {/* MONTHLY RETURN QUANTITY & REFUND AMOUNT */}
        <div className="stat-card" style={{ border: '1.5px solid #fecdd3', background: '#fff1f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e11d48' }}>
            <h4>Monthly Returns</h4>
            <RotateCcw size={20} />
          </div>
          <div className="value" style={{ color: '#e11d48' }}>
            {stats.monthlyReturnQty || 0} Pcs <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>(₹{stats.monthlyReturnAmount?.toLocaleString('en-IN') || 0})</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: '600', marginTop: '4px' }}>
            ↩ Monthly Total Returns & Refunds
          </p>
        </div>
      </div>

      {/* GRAPH 1: Daily Sales Performance Graph */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', color: '#0f172a' }}>
          📈 Revenue & Sales Performance Graph
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
          * Graph reflects revenue from <strong>Accepted Orders</strong> over time.
        </p>

        <div style={{ width: '100%', height: 280 }}>
          {stats.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c026d3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#c026d3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip formatter={(val) => [`₹${val}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#c026d3" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              No accepted sales data recorded for selected date range
            </div>
          )}
        </div>
      </div>

      {/* GRAPH 2: Returns & Refunds Analysis Graph */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1.5px solid #fecdd3' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={20} /> 📊 Returns & Refunds Analytics Graph
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
          * Graph displays daily customer return item quantities and total refund amount.
        </p>

        <div style={{ width: '100%', height: 260 }}>
          {stats.returnChartData && stats.returnChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.returnChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip formatter={(val, name) => [name === 'returnAmount' ? `₹${val}` : `${val} Items`, name === 'returnAmount' ? 'Refund Amount' : 'Returned Quantity']} />
                <Bar dataKey="returnQty" fill="#e11d48" name="Returned Quantity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              No customer returns recorded for selected date range
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
