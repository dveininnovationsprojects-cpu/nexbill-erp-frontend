import { useState, useEffect } from 'react';
import { Receipt, Users, TrendingUp, Clock, Tag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function CashierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today');

  useEffect(() => { fetchDashboard(range); }, [range]);

  const getRange = (r) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    if (r === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (r === 'week') {
      // This week: Sunday to Saturday
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (r === 'month') {
      // This month: 1st to last day
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    return { start, end };
  };

  const fetchDashboard = async (currentRange) => {
    setLoading(true);
    try {
      const { start, end } = getRange(currentRange);

      const res = await api.get('/api/billing/history');

      const invoices = res.data || [];

      // Filter by date range
      const filtered = invoices.filter(inv => {
        if (!inv.createdAt) return false;
        const d = new Date(inv.createdAt);
        return d >= start && d <= end;
      });

      // Calculate totals from invoices
      const totalRevenue = filtered.reduce((s, i) => s + (i.grandTotal || 0), 0);
      const totalTax = filtered.reduce((s, i) => s + (i.gstTotal || 0), 0);
      const totalDiscount = filtered.reduce((s, i) => s + (i.discountTotal || 0), 0);

      // Payment breakdown
      const payMap = {};
      filtered.forEach(inv => {
        const pm = (inv.paymentMethod || inv.paymentMode || 'CASH').toUpperCase();
        if (!payMap[pm]) payMap[pm] = { paymentMode: pm, totalAmount: 0, transactionCount: 0 };
        payMap[pm].totalAmount += Number(inv.grandTotal || 0);
        payMap[pm].transactionCount += 1;
      });

      // Top products from invoice items
      const prodMap = {};
      filtered.forEach(inv => {
        (inv.items || []).forEach(item => {
          const name = item.productName;
          if (!prodMap[name]) prodMap[name] = { productName: name, totalQuantitySold: 0, totalRevenueGenerated: 0 };
          prodMap[name].totalQuantitySold += Number(item.quantity || 0);
          prodMap[name].totalRevenueGenerated += Number(item.finalTotal || 0);
        });
      });
      const topProducts = Object.values(prodMap)
        .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
        .slice(0, 5);

      // Cashier performance
      const cashierPerformances = user ? [{
        cashierName: user.name,
        cashierEmail: user.email,
        billsGenerated: filtered.length,
        totalRevenueHandled: totalRevenue
      }] : [];

      setData({
        totalGrossRevenue: totalRevenue,
        totalInvoicesGenerated: filtered.length,
        totalTaxCollected: totalTax,
        totalDiscountsGiven: totalDiscount,
        paymentBreakdown: Object.values(payMap),
        topProducts,
        cashierPerformances,
        allFiltered: filtered,
      });
    } catch (err) {
      console.error('Dashboard error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val) => Number(val || 0).toLocaleString('en-IN');

  const fmtPayMethod = (m) => ({
    CASH: 'Cash', UPI: 'UPI', CARD: 'Card', NET_BANKING: 'Net Banking'
  }[m] || m);

  const kpis = [
    { label: range === 'today' ? "Today's Bills" : range === 'week' ? "This Week Bills" : "This Month Bills", value: loading ? '...' : (data?.totalInvoicesGenerated || 0), icon: Receipt },
    { label: range === 'today' ? "Today's Sales" : range === 'week' ? "This Week Sales" : "This Month Sales", value: loading ? '...' : `₹${fmt(data?.totalGrossRevenue)}`, icon: TrendingUp },
    { label: 'Tax Collected',   value: loading ? '...' : `₹${fmt(data?.totalTaxCollected)}`,   icon: Tag },
    { label: 'Discounts Given', value: loading ? '...' : `₹${fmt(data?.totalDiscountsGiven)}`, icon: Package },
  ];

  return (
    <>
      <style>{`
        .cd-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .cd-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .cd-title{font-size:20px;font-weight:700;color:#2D2D2D;margin:0}
        .cd-filters{display:flex;gap:8px}
        .cd-filter-btn{padding:7px 14px;border:1.5px solid #EFE7DE;border-radius:8px;background:#FFFFFF;color:#8B7355;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .cd-filter-btn.active{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .cd-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .cd-kpi-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:20px;display:flex;align-items:flex-start;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .cd-kpi-icon{width:42px;height:42px;background:#EFE7DE;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#8B7355;flex-shrink:0}
        .cd-kpi-value{font-size:24px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:4px}
        .cd-kpi-label{font-size:13px;font-weight:500;color:#3F3F46}
        .cd-kpi-sub{font-size:11px;color:#8B7355;margin-top:2px}
        .cd-grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .cd-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .cd-card-title{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:600;color:#2D2D2D;margin-bottom:16px}
        .cd-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .cd-action-btn{padding:14px 12px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;font-weight:500;color:#3F3F46;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .cd-action-btn:hover{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .cd-pay-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#F8F5F2;border-radius:8px;margin-bottom:8px}
        .cd-pay-mode{font-size:13px;font-weight:600;color:#2D2D2D}
        .cd-pay-count{font-size:11px;color:#8B7355;margin-top:2px}
        .cd-pay-amount{font-size:14px;font-weight:700;color:#10B981}
        .cd-prod-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#F8F5F2;border-radius:8px;margin-bottom:8px}
        .cd-prod-rank{width:28px;height:28px;border-radius:50%;background:#2D2D2D;color:#C6A969;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
        .cd-prod-name{font-size:13px;font-weight:600;color:#2D2D2D}
        .cd-prod-stats{font-size:11px;color:#8B7355;margin-top:2px}
        .cd-empty{padding:30px;text-align:center;font-size:13px;color:#D6D3D1}
        .cd-table{width:100%;border-collapse:collapse;font-size:13px}
        .cd-table th{text-align:left;padding:8px 10px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #EFE7DE}
        .cd-table td{padding:11px 10px;border-bottom:1px solid #F8F5F2}

      `}</style>

      <div className="cd-page">
        {/* Header */}
        <div className="cd-header">
          <div className="cd-filters">
            {['today', 'week', 'month'].map(r => (
              <button
                key={r}
                className={`cd-filter-btn ${range === r ? 'active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="cd-kpi-grid">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div key={label} className="cd-kpi-card">
              <div className="cd-kpi-icon"><Icon size={20} /></div>
              <div>
                <div className="cd-kpi-value">{value}</div>
                <div className="cd-kpi-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Payment Breakdown */}
        <div className="cd-grid2">
          <div className="cd-card">
            <div className="cd-card-title"><Receipt size={16} />Quick Actions</div>
            <div className="cd-actions">
              <button className="cd-action-btn" onClick={() => navigate('/cashier/billing')}>New Bill</button>
              <button className="cd-action-btn" onClick={() => navigate('/cashier/billing')}>Search Product</button>
              <button className="cd-action-btn" onClick={() => navigate('/cashier/invoices')}>View Invoices</button>
              <button className="cd-action-btn" onClick={() => navigate('/cashier/customers')}>Customer Lookup</button>
            </div>
          </div>

          <div className="cd-card">
            <div className="cd-card-title"><TrendingUp size={16} />Payment Methods</div>
            {loading ? (
              <div className="cd-empty">Loading...</div>
            ) : data?.paymentBreakdown && data.paymentBreakdown.length > 0 ? (
              data.paymentBreakdown.map((p, i) => (
                <div key={i} className="cd-pay-item">
                  <div>
                    <div className="cd-pay-mode">{fmtPayMethod(p.paymentMode)}</div>
                    <div className="cd-pay-count">{p.transactionCount} transactions</div>
                  </div>
                  <div className="cd-pay-amount">₹{fmt(p.totalAmount)}</div>
                </div>
              ))
            ) : (
              <div className="cd-empty">No payment data</div>
            )}
          </div>
        </div>



        <div className="cd-grid2">
          <div className="cd-card">
            <div className="cd-card-title"><Package size={16} />Top Selling Products</div>
            {loading ? (
              <div className="cd-empty">Loading...</div>
            ) : data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="cd-prod-item">
                  <div className="cd-prod-rank">{i + 1}</div>
                  <div>
                    <div className="cd-prod-name">{p.productName}</div>
                    <div className="cd-prod-stats">{p.totalQuantitySold} units · ₹{fmt(p.totalRevenueGenerated)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="cd-empty">No products sold yet</div>
            )}
          </div>

          <div className="cd-card">
            <div className="cd-card-title"><Users size={16} />My Performance</div>
            {loading ? (
              <div className="cd-empty">Loading...</div>
            ) : data?.cashierPerformances && data.cashierPerformances.length > 0 ? (
              <div style={{padding:'12px',background:'#F8F5F2',borderRadius:10}}>
                <div style={{fontSize:16,fontWeight:700,color:'#2D2D2D',marginBottom:4}}>
                  {data.cashierPerformances[0].cashierName}
                </div>
                <div style={{fontSize:12,color:'#8B7355',marginBottom:16}}>
                  {data.cashierPerformances[0].cashierEmail}
                </div>
                <div style={{display:'flex',gap:24}}>
                  <div>
                    <div style={{fontSize:11,color:'#8B7355',fontWeight:600}}>BILLS</div>
                    <div style={{fontSize:22,fontWeight:700,color:'#2D2D2D'}}>{data.cashierPerformances[0].billsGenerated}</div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:'#8B7355',fontWeight:600}}>REVENUE</div>
                    <div style={{fontSize:22,fontWeight:700,color:'#2D2D2D'}}>₹{fmt(data.cashierPerformances[0].totalRevenueHandled)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cd-empty">No performance data</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
