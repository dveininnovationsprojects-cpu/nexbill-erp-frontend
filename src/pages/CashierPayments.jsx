import { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../api';

const MOCK_PAYMENTS = [];

const STATUS_CONFIG = {
  SUCCESS: { label: 'Success',  icon: CheckCircle, color: '#5A7A5A', bg: '#F0F7F0', border: '#C8DFC8' },
  FAILED:  { label: 'Failed',   icon: XCircle,     color: '#9B4444', bg: '#FDF0F0', border: '#F0D0D0' },
  PENDING: { label: 'Pending',  icon: Clock,       color: '#9A7030', bg: '#FDF8EE', border: '#E8D9A8' },
};

const METHOD_ICONS = { Cash: 'Cash', UPI: 'UPI', Card: 'Card', 'Net Banking': 'Net Banking' };

export default function CashierPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/billing/history');
      const orders = res.data || [];
      const transformed = orders.map(o => ({
        id: `PAY-${o.id}`,
        invoice: o.invoiceNumber || `INV-${o.id}`,
        customer: o.customerName || o.customer?.name || (o.customerId ? `Customer #${o.customerId}` : 'Walk-in Customer'),
        amount: parseFloat(o.grandTotal || 0),
        method: o.paymentMode || o.paymentMethod || 'CASH',
        status: o.status === 'COMPLETED' ? 'SUCCESS' : o.status === 'CANCELLED' ? 'FAILED' : 'PENDING',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '',
      }));
      setPayments(transformed);
    } catch (err) {
      console.error('Error fetching payments:', err?.response?.data || err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p => {
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSuccess = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <style>{`
        .pay-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .pay-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .pay-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .pay-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
        .pay-kpi-val{font-size:20px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .pay-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .pay-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .pay-search-wrap{position:relative;flex:1;min-width:200px}
        .pay-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .pay-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .pay-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .pay-filter-btns{display:flex;gap:6px}
        .pay-filter-btn{padding:9px 14px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:#FFFFFF;color:#8B7355;transition:all 0.2s}
        .pay-filter-btn.active{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .pay-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .pay-table{width:100%;border-collapse:collapse;font-size:13px}
        .pay-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .pay-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .pay-table tr:last-child td{border-bottom:none}
        .pay-table tr:hover td{background:#FDFCFB}
        .pay-id{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600}
        .pay-method{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500}
        .pay-status-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px}
        .pay-amount{font-weight:700;color:#2D2D2D}
        .pay-date{font-size:11px;color:#8B7355}
        .pay-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        .pay-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid #EFE7DE}
        .pay-page-info{font-size:12px;color:#8B7355}
        .pay-page-btns{display:flex;gap:5px}
        .pay-page-btn{min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#8B7355;transition:all 0.15s}
        .pay-page-btn:hover{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .pay-page-btn.active{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .pay-page-btn:disabled{opacity:0.4;cursor:not-allowed}
      `}</style>

      <div className="pay-page">
        {/* KPI */}
        <div className="pay-kpi-grid">
          <div className="pay-kpi">
            <div className="pay-kpi-icon" style={{background:'#F0F7F0'}}><CheckCircle size={18} color="#5A7A5A" /></div>
            <div><div className="pay-kpi-val">₹{totalSuccess.toLocaleString()}</div><div className="pay-kpi-label">Total Collected</div></div>
          </div>
          <div className="pay-kpi">
            <div className="pay-kpi-icon" style={{background:'#FDF8EE'}}><Clock size={18} color="#9A7030" /></div>
            <div><div className="pay-kpi-val">₹{totalPending.toLocaleString()}</div><div className="pay-kpi-label">Pending Amount</div></div>
          </div>
          <div className="pay-kpi">
            <div className="pay-kpi-icon" style={{background:'#EFE7DE'}}><CreditCard size={18} color="#8B7355" /></div>
            <div><div className="pay-kpi-val">{payments.length}</div><div className="pay-kpi-label">Total Transactions</div></div>
          </div>
        </div>

        {/* Topbar */}
        <div className="pay-topbar">
          <div className="pay-search-wrap">
            <Search size={15} className="pay-search-icon" />
            <input placeholder="Search by ID, invoice or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="pay-filter-btns">
            {['ALL','SUCCESS','PENDING','FAILED'].map(s => (
              <button key={s} className={`pay-filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="pay-card">
          <table className="pay-table">
            <thead>
              <tr><th>Payment ID</th><th>Invoice</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date & Time</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="pay-empty">No payments found.</td></tr>
              ) : paginated.map(p => {
                const s = STATUS_CONFIG[p.status];
                const Icon = s.icon;
                return (
                  <tr key={p.id}>
                    <td><span className="pay-id">{p.id}</span></td>
                    <td style={{fontWeight:500,color:'#2D2D2D'}}>{p.invoice}</td>
                    <td>{p.customer}</td>
                    <td><span className="pay-amount">₹{p.amount.toLocaleString()}</span></td>
                    <td><span className="pay-method">{p.method}</span></td>
                    <td>
                      <span className="pay-status-badge" style={{color:s.color,background:s.bg,border:`1px solid ${s.border}`}}>
                        <Icon size={11} />{s.label}
                      </span>
                    </td>
                    <td><span className="pay-date">{p.date}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pay-pagination">
            <div className="pay-page-info">
              Showing {filtered.length === 0 ? 0 : (page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
            <div className="pay-page-btns">
              <button className="pay-page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} className={`pay-page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
              <button className="pay-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}