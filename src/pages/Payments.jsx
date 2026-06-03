import { useState, useEffect } from 'react';
import { Search, TrendingUp, CreditCard, CheckCircle, XCircle, Clock, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MOCK_PAYMENTS = [];

const STATUS_CONFIG = {
  SUCCESS: { icon: CheckCircle, color: '#5A7A5A', bg: '#F0F7F0', border: '#C8DFC8' },
  FAILED:  { icon: XCircle,     color: '#9B4444', bg: '#FDF0F0', border: '#F0D0D0' },
  PENDING: { icon: Clock,       color: '#9A7030', bg: '#FDF8EE', border: '#E8D9A8' },
};

const METHOD_ICONS = { Cash: 'Cash', UPI: 'UPI', Card: 'Card', 'Net Banking': 'Net Banking' };

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cashierFilter, setCashierFilter] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching payment stats...');
      
      // Try payment stats endpoint first
      try {
        const res = await api.get('/api/payments/stats');
        console.log('Payment stats response:', res.data);
        
        if (res.data && res.data.length > 0) {
          const transformedPayments = [];
          for (const stat of res.data) {
            try {
              const txnRes = await api.get(`/api/payments/transactions/${stat.paymentMode}`);
              console.log(`💳 ${stat.paymentMode} transactions:`, txnRes.data);
              const transactions = txnRes.data.map(order => {
                console.log('📦 Transaction order:', order);
                return {
                  id: `PAY-${order.id}`,
                  invoice: order.invoiceNumber || `INV-${order.id}`,
                  cashier: order.cashierName || order.cashier?.name || order.cashier?.username || order.cashierId || 'Cashier',
                  customer: order.customerName || order.customer?.name || 'Walk-in',
                  amount: parseFloat(order.grandTotal || 0),
                  method: order.paymentMethod || stat.paymentMode,
                  status: 'SUCCESS',
                  date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '',
                };
              });
              transformedPayments.push(...transactions);
            } catch (err) {
              console.error(`Error fetching transactions for ${stat.paymentMode}:`, err);
            }
          }
          setPayments(transformedPayments);
        } else {
          throw new Error('Payment stats endpoint returned empty');
        }
      } catch (err) {
        console.warn('Payment stats endpoint failed, trying billing history:', err);
        
        // Fallback: Use billing history
        const billRes = await api.get('/api/billing/history');
        console.log('📋 Billing history response:', billRes.data);
        console.log('📋 First order sample:', billRes.data[0]);
        
        if (billRes.data && billRes.data.length > 0) {
          const transformedPayments = billRes.data.map(order => {
            console.log('📦 Order data:', order);
            return {
              id: `PAY-${order.id}`,
              invoice: order.invoiceNumber || `INV-${order.id}`,
              cashier: order.cashierName || order.cashier?.name || order.cashier?.username || order.cashierId || 'Cashier',
              customer: order.customerName || order.customer?.name || 'Walk-in',
              amount: parseFloat(order.grandTotal || 0),
              method: order.paymentMethod || 'CASH',
              status: 'SUCCESS',
              date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '',
            };
          });
          setPayments(transformedPayments);
        } else {
          setPayments([]);
        }
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const cashiers = [...new Set(payments.map(p => p.cashier))].filter(Boolean);

  const filtered = payments.filter(p => {
    const matchSearch = p.invoice.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.cashier.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;
    const matchCashier = cashierFilter ? p.cashier === cashierFilter : true;
    return matchSearch && matchStatus && matchCashier;
  });

  const totalCollected = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalPending   = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const totalFailed    = payments.filter(p => p.status === 'FAILED').reduce((s, p) => s + p.amount, 0);

  const methodBreakdown = payments.reduce((acc, p) => {
    if (!acc[p.method]) acc[p.method] = { count: 0, amount: 0 };
    acc[p.method].count += 1;
    acc[p.method].amount += p.amount;
    return acc;
  }, {});

  const totalTxn = payments.length;
  const paidCount = payments.filter(p => p.status === 'SUCCESS').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const failedCount = payments.filter(p => p.status === 'FAILED').length;

  return (
    <>
      <style>{`
        .ap-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .ap-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .ap-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ap-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
        .ap-kpi-val{font-size:20px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .ap-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .ap-grid2{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:20px;align-items:start;width:100%}
        .ap-right-col{display:flex;flex-direction:column;gap:16px;width:280px}
        .ap-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05);width:100%}
        .ap-table-wrapper{overflow-x:auto;overflow-y:visible}
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
        .ap-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle;white-space:nowrap}
        .ap-table tr:last-child td{border-bottom:none}
        .ap-table tr:hover td{background:#FDFCFB}
        .ap-id{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600;white-space:nowrap;display:inline-block}
        .ap-cashier{display:flex;align-items:center;gap:6px}
        .ap-avatar{width:24px;height:24px;background:#2D2D2D;color:#C6A969;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .ap-status{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap}
        .ap-method{display:flex;align-items:center;gap:5px;font-size:12px}
        .ap-amount{font-weight:700;color:#2D2D2D}
        .ap-date{font-size:11px;color:#8B7355}
        .ap-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        .ap-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-top:1px solid #EFE7DE}
        .ap-page-info{font-size:12px;color:#8B7355}
        .ap-page-btns{display:flex;gap:5px}
        .ap-page-btn{min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#8B7355;transition:all 0.15s}
        .ap-page-btn:hover{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .ap-page-btn.active{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .ap-page-btn:disabled{opacity:0.4;cursor:not-allowed}
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
            <div><div className="ap-kpi-val">{payments.length}</div><div className="ap-kpi-label">Transactions</div></div>
          </div>
        </div>

        <div className="ap-grid2">
          {/* Table */}
          <div>
            <div className="ap-topbar" style={{marginBottom:16}}>
              <div className="ap-search-wrap">
                <Search size={15} className="ap-search-icon" />
                <input placeholder="Search by ID, invoice, customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
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
              <div className="ap-table-wrapper">
                <table className="ap-table">
                <thead>
                  <tr><th style={{width:'110px'}}>Pay ID</th><th style={{width:'120px'}}>Invoice</th><th style={{width:'140px'}}>Cashier</th><th>Customer</th><th style={{width:'100px',textAlign:'right'}}>Amount</th><th style={{width:'100px'}}>Method</th><th style={{width:'120px'}}>Status</th><th style={{width:'90px'}}>Date</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="ap-empty">No payments found.</td></tr>
                  ) : paginated.map(p => {
                    const s = STATUS_CONFIG[p.status];
                    const Icon = s.icon;
                    return (
                      <tr key={p.id}>
                        <td style={{width:'110px'}}><span className="ap-id">{p.id}</span></td>
                        <td style={{width:'120px',color:'#8B7355',fontSize:12}}>{p.invoice}</td>
                        <td style={{width:'140px'}}><div className="ap-cashier"><div className="ap-avatar">{p.cashier[0]}</div>{p.cashier}</div></td>
                        <td>{p.customer}</td>
                        <td style={{width:'100px',textAlign:'right'}}><span className="ap-amount">₹{p.amount.toLocaleString()}</span></td>
                        <td style={{width:'100px'}}><span className="ap-method">{p.method}</span></td>
                        <td style={{width:'120px'}}><span className="ap-status" style={{color:s.color,background:s.bg,border:`1px solid ${s.border}`}}><Icon size={11}/>{p.status}</span></td>
                        <td style={{width:'90px'}}><span className="ap-date">{p.date}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
              {totalPages > 1 && (
                <div className="ap-pagination">
                  <span className="ap-page-info">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} payments</span>
                  <div className="ap-page-btns">
                    <button className="ap-page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                      <button key={p} className={`ap-page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
                    ))}
                    <button className="ap-page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="ap-right-col">
            <div className="ap-card">
              <div className="ap-card-header"><CreditCard size={15} /> Payment Methods</div>
              <div className="ap-method-list">
                {Object.entries(methodBreakdown).map(([method, data]) => (
                  <div key={method}>
                    <div className="ap-method-row">
                      <span className="ap-method-label">{method}</span>
                      <span className="ap-method-val">₹{data.amount.toLocaleString()}</span>
                    </div>
                    <div className="ap-method-bar-wrap">
                      <div className="ap-method-bar" style={{width:`${(data.count/totalTxn*100).toFixed(0)}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ap-card">
              <div className="ap-card-header"><BarChart2 size={15} /> Status Summary</div>
              <div className="ap-method-list">
                {[{label:'Paid',count:paidCount,color:'#5A7A5A',bar:'#5A7A5A'},{label:'Pending',count:pendingCount,color:'#9A7030',bar:'#C6A969'},{label:'Failed',count:failedCount,color:'#9B4444',bar:'#9B4444'}].map(s => (
                  <div key={s.label}>
                    <div className="ap-method-row">
                      <span className="ap-method-label">{s.label}</span>
                      <span className="ap-method-val" style={{color:s.color}}>{s.count}</span>
                    </div>
                    <div className="ap-method-bar-wrap">
                      <div className="ap-method-bar" style={{width:`${(s.count/totalTxn*100).toFixed(0)}%`,background:s.bar}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
