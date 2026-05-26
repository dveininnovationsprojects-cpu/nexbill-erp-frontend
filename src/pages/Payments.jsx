import { useState } from 'react';
import { Search, TrendingUp, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

const MOCK_PAYMENTS = [
  { id: 'PAY001', invoice: 'INV001', cashier: 'Ravi Kumar',  customer: 'Priya S',    amount: 1176, method: 'UPI',         status: 'SUCCESS', date: '2025-05-22 10:30' },
  { id: 'PAY002', invoice: 'INV002', cashier: 'Meena R',    customer: 'Arjun M',    amount: 2430, method: 'Cash',        status: 'SUCCESS', date: '2025-05-22 11:15' },
  { id: 'PAY003', invoice: 'INV003', cashier: 'Ravi Kumar',  customer: 'Karthik V',  amount: 846,  method: 'Card',        status: 'PENDING', date: '2025-05-22 12:00' },
  { id: 'PAY004', invoice: 'INV004', cashier: 'Divya P',    customer: 'Meena R',    amount: 1680, method: 'UPI',         status: 'SUCCESS', date: '2025-05-22 13:45' },
  { id: 'PAY005', invoice: 'INV005', cashier: 'Meena R',    customer: 'Suresh K',   amount: 706,  method: 'Cash',        status: 'SUCCESS', date: '2025-05-21 09:20' },
  { id: 'PAY006', invoice: 'INV006', cashier: 'Divya P',    customer: 'Lakshmi T',  amount: 3384, method: 'Card',        status: 'FAILED',  date: '2025-05-21 14:30' },
  { id: 'PAY007', invoice: 'INV007', cashier: 'Ravi Kumar',  customer: 'Anand P',    amount: 560,  method: 'Net Banking', status: 'SUCCESS', date: '2025-05-21 16:00' },
];

const STATUS_CONFIG = {
  SUCCESS: { icon: CheckCircle, color: '#5A7A5A', bg: '#F0F7F0', border: '#C8DFC8' },
  FAILED:  { icon: XCircle,     color: '#9B4444', bg: '#FDF0F0', border: '#F0D0D0' },
  PENDING: { icon: Clock,       color: '#9A7030', bg: '#FDF8EE', border: '#E8D9A8' },
};

const METHOD_ICONS = { Cash: 'Cash', UPI: 'UPI', Card: 'Card', 'Net Banking': 'Net Banking' };

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cashierFilter, setCashierFilter] = useState('');

  const cashiers = [...new Set(MOCK_PAYMENTS.map(p => p.cashier))];

  const filtered = MOCK_PAYMENTS.filter(p => {
    const matchSearch = p.invoice.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.cashier.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;
    const matchCashier = cashierFilter ? p.cashier === cashierFilter : true;
    return matchSearch && matchStatus && matchCashier;
  });

  const totalCollected = MOCK_PAYMENTS.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const totalPending   = MOCK_PAYMENTS.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const totalFailed    = MOCK_PAYMENTS.filter(p => p.status === 'FAILED').reduce((s, p) => s + p.amount, 0);

  const methodBreakdown = MOCK_PAYMENTS.filter(p => p.status === 'SUCCESS').reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        .ap-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .ap-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .ap-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ap-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
        .ap-kpi-val{font-size:20px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .ap-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .ap-grid2{display:grid;grid-template-columns:1fr 280px;gap:20px}
        .ap-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ap-card-header{padding:16px 20px;border-bottom:1px solid #EFE7DE;font-size:14px;font-weight:600;color:#2D2D2D;display:flex;align-items:center;gap:8px}
        .ap-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .ap-search-wrap{position:relative;flex:1;min-width:200px}
        .ap-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .ap-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .ap-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .ap-select{padding:10px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;cursor:pointer}
        .ap-filter-btns{display:flex;gap:6px}
        .ap-filter-btn{padding:9px 14px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:#FFFFFF;color:#8B7355;transition:all 0.2s}
        .ap-filter-btn.active{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .ap-table{width:100%;border-collapse:collapse;font-size:13px}
        .ap-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .ap-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .ap-table tr:last-child td{border-bottom:none}
        .ap-table tr:hover td{background:#FDFCFB}
        .ap-id{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600}
        .ap-cashier{display:flex;align-items:center;gap:6px}
        .ap-avatar{width:24px;height:24px;background:#2D2D2D;color:#C6A969;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .ap-status{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px}
        .ap-method{display:flex;align-items:center;gap:5px;font-size:12px}
        .ap-amount{font-weight:700;color:#2D2D2D}
        .ap-date{font-size:11px;color:#8B7355}
        .ap-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        /* Method breakdown */
        .ap-method-list{padding:16px 20px;display:flex;flex-direction:column;gap:12px}
        .ap-method-row{display:flex;align-items:center;justify-content:space-between;font-size:13px}
        .ap-method-label{display:flex;align-items:center;gap:8px;color:#3F3F46}
        .ap-method-val{font-weight:700;color:#2D2D2D}
        .ap-method-bar-wrap{height:4px;background:#EFE7DE;border-radius:2px;margin-top:4px}
        .ap-method-bar{height:4px;background:#C6A969;border-radius:2px}
      `}</style>

      <div className="ap-page">
        {/* KPIs */}
        <div className="ap-kpi-grid">
          <div className="ap-kpi">
            <div className="ap-kpi-icon" style={{background:'#EFE7DE'}}><TrendingUp size={18} color="#8B7355" /></div>
            <div><div className="ap-kpi-val">₹{totalCollected.toLocaleString()}</div><div className="ap-kpi-label">Total Collected</div></div>
          </div>
          <div className="ap-kpi">
            <div className="ap-kpi-icon" style={{background:'#FDF8EE'}}><Clock size={18} color="#9A7030" /></div>
            <div><div className="ap-kpi-val">₹{totalPending.toLocaleString()}</div><div className="ap-kpi-label">Pending</div></div>
          </div>
          <div className="ap-kpi">
            <div className="ap-kpi-icon" style={{background:'#FDF0F0'}}><XCircle size={18} color="#9B4444" /></div>
            <div><div className="ap-kpi-val">₹{totalFailed.toLocaleString()}</div><div className="ap-kpi-label">Failed</div></div>
          </div>
          <div className="ap-kpi">
            <div className="ap-kpi-icon" style={{background:'#EFE7DE'}}><CreditCard size={18} color="#8B7355" /></div>
            <div><div className="ap-kpi-val">{MOCK_PAYMENTS.length}</div><div className="ap-kpi-label">Transactions</div></div>
          </div>
        </div>

        <div className="ap-grid2">
          {/* Table */}
          <div>
            <div className="ap-topbar" style={{marginBottom:16}}>
              <div className="ap-search-wrap">
                <Search size={15} className="ap-search-icon" />
                <input placeholder="Search by ID, invoice, customer..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="ap-select" value={cashierFilter} onChange={e => setCashierFilter(e.target.value)}>
                <option value="">All Cashiers</option>
                {cashiers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="ap-filter-btns">
                {['ALL','SUCCESS','PENDING','FAILED'].map(s => (
                  <button key={s} className={`ap-filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="ap-card">
              <table className="ap-table">
                <thead>
                  <tr><th>Pay ID</th><th>Invoice</th><th>Cashier</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="ap-empty">No payments found.</td></tr>
                  ) : filtered.map(p => {
                    const s = STATUS_CONFIG[p.status];
                    const Icon = s.icon;
                    return (
                      <tr key={p.id}>
                        <td><span className="ap-id">{p.id}</span></td>
                        <td style={{color:'#8B7355',fontSize:12}}>{p.invoice}</td>
                        <td><div className="ap-cashier"><div className="ap-avatar">{p.cashier[0]}</div>{p.cashier}</div></td>
                        <td>{p.customer}</td>
                        <td><span className="ap-amount">₹{p.amount.toLocaleString()}</span></td>
                        <td><span className="ap-method">{p.method}</span></td>
                        <td><span className="ap-status" style={{color:s.color,background:s.bg,border:`1px solid ${s.border}`}}><Icon size={11}/>{p.status}</span></td>
                        <td><span className="ap-date">{p.date}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Method Breakdown */}
          <div className="ap-card" style={{alignSelf:'start'}}>
            <div className="ap-card-header"><CreditCard size={15} /> Payment Methods</div>
            <div className="ap-method-list">
              {Object.entries(methodBreakdown).map(([method, amt]) => (
                <div key={method}>
                  <div className="ap-method-row">
                    <span className="ap-method-label">{method}</span>
                    <span className="ap-method-val">₹{amt.toLocaleString()}</span>
                  </div>
                  <div className="ap-method-bar-wrap">
                    <div className="ap-method-bar" style={{width:`${(amt/totalCollected*100).toFixed(0)}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
