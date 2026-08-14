import React, { useState, useEffect, useRef } from 'react';
import {
  Receipt,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { API_URL } from '../../api';
import { fetchWithCache } from '../../utils/cache';
import TableSkeleton from '../Skeletons/TableSkeleton';

const AdminBilling = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'weekly', 'monthly', 'yearly', 'custom'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    fetchBillingLedger();

    // Auto-refresh every 30 seconds so ledger stays live
    refreshIntervalRef.current = setInterval(() => {
      fetchBillingLedger(true);
    }, 30000);

    // Also listen for new order events to refresh billing immediately
    const handleNewOrder = () => fetchBillingLedger(true);
    window.addEventListener('df_new_order_placed', handleNewOrder);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      window.removeEventListener('df_new_order_placed', handleNewOrder);
    };
  }, []);

  const fetchBillingLedger = async (forceRefresh = false) => {
    const { data: cachedData } = await fetchWithCache(
      'admin_billing',
      async () => {
        const res = await fetch(`${API_URL}/api/admin/billing`);
        const data = await res.json();
        return data.ledger || [];
      },
      { forceRefresh }
    );

    if (cachedData) {
      setLedgerData(cachedData);
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  // Filter logic
  const getFilteredLedger = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return ledgerData.filter((entry) => {
      const entryDate = new Date(entry.date);
      const entryDateStr = entryDate.toISOString().split('T')[0];

      if (filterPeriod === 'weekly') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= sevenDaysAgo;
      }

      if (filterPeriod === 'monthly') {
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      }

      if (filterPeriod === 'yearly') {
        return entryDate.getFullYear() === now.getFullYear();
      }

      if (filterPeriod === 'custom') {
        if (fromDate && entryDateStr < fromDate) return false;
        if (toDate && entryDateStr > toDate) return false;
        return true;
      }

      return true; // 'all' default
    });
  };

  const filteredEntries = getFilteredLedger();

  // Summary calculations
  const totalSoldAmount = filteredEntries
    .filter((e) => e.type === 'credit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalRefundAmount = filteredEntries
    .filter((e) => e.type === 'debit')
    .reduce((sum, e) => sum + Math.abs(e.amount || 0), 0);

  const netTotalBill = totalSoldAmount - totalRefundAmount;

  // Chart data aggregation by date
  const chartMap = {};
  filteredEntries.forEach((e) => {
    const dateKey = new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (!chartMap[dateKey]) {
      chartMap[dateKey] = { date: dateKey, credit: 0, debit: 0 };
    }
    if (e.type === 'credit') {
      chartMap[dateKey].credit += e.amount;
    } else {
      chartMap[dateKey].debit += Math.abs(e.amount);
    }
  });

  const chartData = Object.values(chartMap).reverse();

  // Export to Excel (.xlsx) function
  const handleExportExcel = () => {
    if (filteredEntries.length === 0) {
      alert('No billing entries to export for selected duration!');
      return;
    }

    const reportTitle = `DIPTO FASHION - BILLING & FINANCIAL HISTORY REPORT`;
    const periodLabel = filterPeriod.toUpperCase() + (filterPeriod === 'custom' ? ` (${fromDate || 'Start'} to ${toDate || 'Today'})` : '');
    const exportDate = new Date().toLocaleString('en-IN');

    // Build worksheet data array
    const worksheetData = [
      [reportTitle],
      [`Filter Duration: ${periodLabel}`, '', '', `Generated On: ${exportDate}`],
      [`Total Sold Sales (+): ₹${totalSoldAmount.toLocaleString('en-IN')}`, '', `Total Refunds (-): ₹${totalRefundAmount.toLocaleString('en-IN')}`, `NET TOTAL BILL: ₹${netTotalBill.toLocaleString('en-IN')}`],
      [], // blank line
      ['Date', 'Order ID', 'Customer Name', 'UTR Number', 'Transaction Type', 'Order Status', 'Amount (₹)']
    ];

    filteredEntries.forEach((item) => {
      const formattedDate = new Date(item.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const amountFormatted = item.type === 'credit' ? `+ ₹${item.amount.toLocaleString('en-IN')}` : `- ₹${Math.abs(item.amount).toLocaleString('en-IN')}`;

      worksheetData.push([
        formattedDate,
        item.orderId,
        item.customerName,
        item.utrNumber,
        item.label,
        item.status,
        amountFormatted
      ]);
    });

    // Add Net Total Summary Row
    worksheetData.push([]);
    worksheetData.push([
      'TOTAL NET BILL AMOUNT',
      '',
      '',
      '',
      '',
      'NET REVENUE',
      `₹${netTotalBill.toLocaleString('en-IN')}`
    ]);

    // Create workbook & worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Billing History');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 22 },
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 16 }
    ];

    // Download file
    const fileName = `Dipto_Fashion_Billing_${filterPeriod}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="admin-billing-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SECTION HEADER & EXCEL EXPORT ACTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={24} color="#c026d3" /> Billing History & Financial Ledger
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Comprehensive billing records of shipped sales (+ Credit) & returned refunds (- Debit)
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.1rem', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <FileSpreadsheet size={18} /> Export Billing History (Excel)
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <>
          {/* FILTER CONTROL BAR: ALL, WEEKLY, MONTHLY, YEARLY, DATE-TO-DATE */}
          <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '0.5rem' }}>
                <Filter size={16} color="#c026d3" /> Duration Filter:
              </span>

          {[
            { id: 'all', label: 'All History' },
            { id: 'weekly', label: 'Weekly (Last 7 Days)' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly (2026)' },
            { id: 'custom', label: 'Date-to-Date' }
          ].map((item) => {
            const isSel = filterPeriod === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterPeriod(item.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: isSel ? '#c026d3' : '#f8fafc',
                  color: isSel ? 'white' : '#334155',
                  border: isSel ? '1.5px solid #c026d3' : '1px solid #cbd5e1',
                  boxShadow: isSel ? '0 2px 6px rgba(192,38,211,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* CUSTOM DATE-TO-DATE INPUTS */}
        {filterPeriod === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fdf4ff', padding: '4px 10px', borderRadius: '10px', border: '1px solid #f0abfc' }}>
            <Calendar size={16} color="#c026d3" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 6px', fontSize: '0.8rem' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#701a75', fontWeight: '800' }}>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 6px', fontSize: '0.8rem' }}
            />
          </div>
        )}
      </div>

      {/* SUMMARY STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* TOTAL SOLD ITEMS CREDIT (+ GREEN) */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Total Sold Sales (+)</span>
            <ArrowUpRight size={22} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#15803d' }}>
            + ₹{totalSoldAmount.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#16a34a', margin: '4px 0 0 0', fontWeight: '600' }}>
            Shipped & Delivered Orders Revenue
          </p>
        </div>

        {/* TOTAL RETURNED ITEMS DEBIT (- RED) */}
        <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Total Returned Refunds (-)</span>
            <ArrowDownRight size={22} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#b91c1c' }}>
            - ₹{totalRefundAmount.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#be123c', margin: '4px 0 0 0', fontWeight: '600' }}>
            Customer Returns & Refund Expenses
          </p>
        </div>

        {/* NET TOTAL BILL AMOUNT */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 100%)', borderRadius: '12px', padding: '1.1rem', color: 'white', boxShadow: '0 8px 20px rgba(112,26,117,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>NET TOTAL BILL AMOUNT</span>
            <DollarSign size={22} color="#facc15" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#facc15' }}>
            ₹{netTotalBill.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: '4px 0 0 0' }}>
            Final Bill (Sales [+] minus Returns [-])
          </p>
        </div>
      </div>

      {/* RECHARTS BILLING TREND GRAPH */}
      {chartData.length > 0 && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
            Billing Sales vs Returns Overview ({filterPeriod.toUpperCase()})
          </h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="credit" name="Sold Amount (+)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debit" name="Returned Refund (-)" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* BILLING HISTORY LEDGER TABLE */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Itemized Financial Ledger ({filteredEntries.length} Records)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
            Showing: {filterPeriod.toUpperCase()}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Loading Billing Ledger...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No billing records found for the selected duration filter.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID / Ref</th>
                  <th>User Details</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isCredit = entry.type === 'credit';
                  return (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: '800', color: '#0f172a' }}>{entry.orderId}</td>
                      <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <div style={{ fontWeight: '700' }}>{entry.customerName}</div>
                        {entry.userEmail && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{entry.userEmail}</div>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>
                        {new Date(entry.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            background: isCredit ? '#dcfce7' : '#fee2e2',
                            color: isCredit ? '#15803d' : '#b91c1c'
                          }}
                        >
                          {entry.label || (isCredit ? 'Sale (Shipped)' : 'Refund (Return/Cancel)')}
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', fontSize: '0.95rem', color: isCredit ? '#15803d' : '#b91c1c' }}>
                        {isCredit ? `+ ₹${entry.amount.toLocaleString('en-IN')}` : `- ₹${Math.abs(entry.amount).toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '0.95rem', color: entry.runningBalance >= 0 ? '#0f172a' : '#b91c1c' }}>
                        ₹{(entry.runningBalance || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={5} style={{ fontWeight: '900', fontSize: '0.95rem', color: '#0f172a', textAlign: 'right' }}>
                    NET REVENUE BALANCE:
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '1.25rem', color: '#c026d3' }}>
                    ₹{netTotalBill.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default AdminBilling;
