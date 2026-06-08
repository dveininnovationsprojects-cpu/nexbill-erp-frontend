import { useState, useEffect } from 'react';
import { Search, Receipt, TrendingUp, Users, Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { getPageNumbers } from '../utils/pagination';

const MOCK_BILLS = [];

const STATUS_STYLE = {
  PAID:      { color: '#5A7A5A', bg: '#F0F7F0', border: '#C8DFC8' },
  PENDING:   { color: '#9A7030', bg: '#FDF8EE', border: '#E8D9A8' },
  CANCELLED: { color: '#9B4444', bg: '#FDF0F0', border: '#F0D0D0' },
};

const PAGE_SIZE = 5;

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cashierFilter, setCashierFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/api/billing/history')
      .then(res => setBills([...(res.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => setBills([]));
  }, []);

  const cashiers = [...new Set(bills.map(b => b.cashierId || b.cashier).filter(Boolean))];

  const filtered = bills.filter(b => {
    const inv = b.invoiceNumber || b.invoice || '';
    const cust = b.customerName || b.customer || '';
    const cash = b.cashierId || b.cashier || '';
    const matchSearch = inv.toLowerCase().includes(search.toLowerCase()) ||
      cust.toLowerCase().includes(search.toLowerCase()) ||
      cash.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' ? true : (b.status || b.paymentStatus) === statusFilter;
    const matchCashier = cashierFilter ? cash === cashierFilter : true;
    return matchSearch && matchStatus && matchCashier;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = bills.filter(b => ['PAID','COMPLETED'].includes(b.status || b.paymentStatus)).reduce((s, b) => s + (b.grandTotal || b.total || 0), 0);
  const totalBills = bills.length;
  const paidBills = bills.filter(b => ['PAID','COMPLETED'].includes(b.status || b.paymentStatus)).length;
  const pendingBills = bills.filter(b => (b.status || b.paymentStatus) === 'PENDING').length;

  return (
    <>
      <style>{`
        .ab-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .ab-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .ab-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ab-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ab-kpi-val{font-size:20px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .ab-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .ab-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .ab-search-wrap{position:relative;flex:1;min-width:200px}
        .ab-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .ab-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .ab-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .ab-select{padding:10px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;cursor:pointer}
        .ab-filter-btns{display:flex;gap:6px}
        .ab-filter-btn{padding:9px 14px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:#FFFFFF;color:#8B7355;transition:all 0.2s}
        .ab-filter-btn.active{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .ab-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ab-table{width:100%;border-collapse:collapse;font-size:13px}
        .ab-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .ab-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .ab-table tr:last-child td{border-bottom:none}
        .ab-table tr:hover td{background:#FDFCFB}
        .ab-inv{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600}
        .ab-cashier{display:flex;align-items:center;gap:6px}
        .ab-avatar{width:24px;height:24px;background:#2D2D2D;color:#C6A969;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .ab-status{display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px}
        .ab-method{font-size:11px;color:#8B7355;background:#F8F5F2;padding:3px 8px;border-radius:20px}
        .ab-total{font-weight:700;color:#2D2D2D}
        .ab-date{font-size:11px;color:#8B7355}
        .ab-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        .ab-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-top:1px solid #EFE7DE}
        .ab-page-info{font-size:12px;color:#8B7355}
        .ab-page-btns{display:flex;gap:5px}
        .ab-page-btn{min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#8B7355;transition:all 0.15s}
        .ab-page-btn:hover{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .ab-page-btn.active{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .ab-page-btn:disabled{opacity:0.4;cursor:not-allowed}
      `}</style>

      <div className="ab-page">
        {/* KPIs */}
        <div className="ab-kpi-grid">
          <div className="ab-kpi">
            <div className="ab-kpi-icon" style={{background:'#EFE7DE'}}><TrendingUp size={18} color="#8B7355" /></div>
            <div><div className="ab-kpi-val">₹{totalRevenue.toLocaleString()}</div><div className="ab-kpi-label">Total Revenue</div></div>
          </div>
          <div className="ab-kpi">
            <div className="ab-kpi-icon" style={{background:'#EFE7DE'}}><Receipt size={18} color="#8B7355" /></div>
            <div><div className="ab-kpi-val">{totalBills}</div><div className="ab-kpi-label">Total Bills</div></div>
          </div>
          <div className="ab-kpi">
            <div className="ab-kpi-icon" style={{background:'#F0F7F0'}}><CheckCircle size={18} color="#5A7A5A" /></div>
            <div><div className="ab-kpi-val">{paidBills}</div><div className="ab-kpi-label">Paid Bills</div></div>
          </div>
          <div className="ab-kpi">
            <div className="ab-kpi-icon" style={{background:'#FDF8EE'}}><Clock size={18} color="#9A7030" /></div>
            <div><div className="ab-kpi-val">{pendingBills}</div><div className="ab-kpi-label">Pending Bills</div></div>
          </div>
        </div>

        {/* Topbar */}
        <div className="ab-topbar">
          <div className="ab-search-wrap">
            <Search size={15} className="ab-search-icon" />
            <input placeholder="Search invoice, customer, cashier..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="ab-select" value={cashierFilter} onChange={e => setCashierFilter(e.target.value)}>
            <option value="">All Cashiers</option>
            {cashiers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="ab-filter-btns">
            {['ALL','PAID','PENDING','CANCELLED'].map(s => (
              <button key={s} className={`ab-filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="ab-card">
          <table className="ab-table">
            <thead>
              <tr><th>Invoice</th><th>Cashier</th><th>Customer</th><th>Items</th><th>GST</th><th>Discount</th><th>Total</th><th>Method</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="ab-empty">No bills found.</td></tr>
              ) : paginated.map(b => {
                const status = b.status || b.paymentStatus || 'PENDING';
                const displayStatus = status === 'COMPLETED' ? 'PAID' : status;
                const s = STATUS_STYLE[displayStatus] || STATUS_STYLE[status] || STATUS_STYLE.PENDING;
                const cashier = b.cashierId || b.cashier || '—';
                const invoice = b.invoiceNumber || b.invoice || '—';
                const total = b.grandTotal || b.total || 0;
                const gst = b.gstTotal || b.gst || 0;
                const discount = parseFloat(b.discountTotal || b.discount || 0);
                const items = b.totalItems || 0;
                const method = b.paymentMethod || b.method || '—';
                const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '—';
                const discountDisplay = discount > 0 ? `-₹${discount.toLocaleString('en-IN')}` : '—';
                return (
                  <tr key={b.id || b.invoiceNumber}>
                    <td style={{fontWeight:600,color:'#2D2D2D'}}>{invoice}</td>
                    <td>
                      <div className="ab-cashier">
                        <div className="ab-avatar">{cashier[0]}</div>
                        {cashier}
                      </div>
                    </td>
                    <td>{b.customerName || b.customer || 'Walk-in'}</td>
                    <td style={{color:'#8B7355'}}>{items} items</td>
                    <td style={{color:'#8B7355'}}>₹{gst}</td>
                    <td style={{color:'#5A7A5A'}}>{discountDisplay}</td>
                    <td><span className="ab-total">₹{Number(total).toLocaleString()}</span></td>
                    <td><span className="ab-method">{method}</span></td>
                    <td><span className="ab-status" style={{color:s.color,background:s.bg,border:`1px solid ${s.border}`}}>{displayStatus}</span></td>
                    <td><span className="ab-date">{date}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="ab-pagination">
              <span className="ab-page-info">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} bills</span>
              <div className="ab-page-btns">
                <button className="ab-page-btn" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft size={14}/></button>
                {getPageNumbers(page, totalPages).map(p=>(
                  <button key={p} className={`ab-page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
                ))}
                <button className="ab-page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}