import { useEffect, useState } from 'react';
import { Users, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { phone: '', branch: '', counterNumber: '', shiftTiming: '', basicSalary: '' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pending, setPending]           = useState([]);
  const [activeCashiers, setActiveCashiers] = useState([]);
  const [loadingPending, setLoading]    = useState(true);
  const [modal, setModal]               = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [approving, setApproving]       = useState(false);
  const [toast, setToast]               = useState(null);
  const [kpis, setKpis] = useState({ revenue: '₹0', products: 0, cashiers: 0, lowStock: 0 });
  const [recentTxns, setRecentTxns] = useState([]);
  const [allBilling, setAllBilling] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-cashiers', {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      setPending(res.data);
    } catch { setPending([]); }
    finally { setLoading(false); }
  };

  const fetchKpis = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [productsRes, lowStockRes, cashiersRes, billingRes] = await Promise.allSettled([
        axios.get('/api/products/all', { headers, withCredentials: true }),
        axios.get('/api/inventory/low-stock', { headers, withCredentials: true }),
        axios.get('/api/admin/active-cashiers', { headers, withCredentials: true }),
        axios.get('/api/billing/history', { headers, withCredentials: true }),
      ]);
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const lowStock = lowStockRes.status === 'fulfilled' ? lowStockRes.value.data.length : 0;
      const cashiersList = cashiersRes.status === 'fulfilled' ? cashiersRes.value.data : [];
      const billing = billingRes.status === 'fulfilled' ? billingRes.value.data : [];

      // Today's revenue
      const today = new Date(); today.setHours(0,0,0,0);
      const todayBills = billing.filter(b => new Date(b.createdAt) >= today);
      const revenue = todayBills.reduce((s, b) => s + (b.grandTotal || 0), 0);

      setActiveCashiers(cashiersList);
      setKpis({ revenue: `₹${Number(revenue).toLocaleString('en-IN')}`, products: products.length, lowStock, cashiers: cashiersList.length });
      setAllBilling(billing);
      const sorted = [...billing].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTxns(sorted.slice(0, 5));
      console.log('BILLING DATA:', billing.length, billing.slice(0,2).map(b => ({createdAt: b.createdAt, grandTotal: b.grandTotal})));
    } catch (err) { console.error('fetchKpis error:', err?.response?.status, err?.message); }
  };

  useEffect(() => { fetchPending(); fetchKpis(); }, []);

  // Only use pending count as cashiers fallback if no active-cashiers endpoint
  useEffect(() => {
    setKpis(k => ({ ...k }));
  }, [pending]);

  const handleApprove = async (e) => {
    e.preventDefault();
    setApproving(true);
    try {
      await axios.post(
        `/api/admin/approve-cashier/${modal.email}`,
        { ...form, basicSalary: parseFloat(form.basicSalary) },
        { headers: { Authorization: `Bearer ${user.token}` }, withCredentials: true }
      );
      showToast(`${modal.name || modal.email} approved successfully!`);
      setModal(null);
      fetchPending();
    } catch { showToast('Approval failed. Try again.', 'error'); }
    finally { setApproving(false); }
  };

  return (
    <>
      <style>{`
        .ad-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .ad-toast{position:fixed;top:20px;right:28px;background:#2D2D2D;color:#F8F5F2;padding:12px 18px;border-radius:10px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);animation:slideIn 0.25s ease}
        .ad-toast-err{background:#7A3A3A}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .ad-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .ad-kpi-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:20px;display:flex;align-items:flex-start;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ad-kpi-icon{width:42px;height:42px;background:#EFE7DE;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#8B7355;flex-shrink:0}
        .ad-kpi-value{font-size:24px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:4px}
        .ad-kpi-label{font-size:13px;font-weight:500;color:#3F3F46}
        .ad-kpi-sub{font-size:11px;color:#8B7355;margin-top:2px}
        .ad-grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .ad-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ad-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .ad-card-title{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:600;color:#2D2D2D}
        .ad-count-badge{background:#EFE7DE;color:#8B7355;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px}
        .ad-pending-list{display:flex;flex-direction:column;gap:10px}
        .ad-pending-item{display:flex;align-items:center;gap:12px;padding:12px;background:#F8F5F2;border-radius:10px;border:1px solid #EFE7DE}
        .ad-pending-avatar{width:36px;height:36px;background:#2D2D2D;color:#C6A969;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0}
        .ad-pending-info{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
        .ad-pending-name{font-size:13px;font-weight:600;color:#2D2D2D}
        .ad-pending-email{font-size:12px;color:#8B7355;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ad-approve-btn{padding:7px 16px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;white-space:nowrap}
        .ad-approve-btn:hover{background:#C6A969;color:#2D2D2D}
        .ad-spinner{width:13px;height:13px;border:2px solid rgba(248,245,242,0.3);border-top-color:#F8F5F2;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ad-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px 0;color:#D6D3D1;font-size:13px}
        .ad-table{width:100%;border-collapse:collapse;font-size:13px}
        .ad-table th{text-align:left;padding:8px 12px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #EFE7DE}
        .ad-table td{padding:12px;border-bottom:1px solid #F8F5F2;color:#3F3F46}
        .ad-skeleton{display:inline-block;height:12px;background:#EFE7DE;border-radius:4px;animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .ad-chart-wrap{display:flex;flex-direction:column;gap:12px}
        .ad-chart-labels{display:flex;align-items:center;gap:12px;margin-bottom:4px;padding:0 4px;font-size:11px;color:#8B7355}
        .ad-chart-label{display:flex;align-items:center;gap:4px}
        .ad-chart-current{width:10px;height:10px;background:#C6A969;border-radius:2px}
        .ad-chart-other{width:10px;height:10px;background:#EFE7DE;border-radius:2px}
        .ad-chart-container{display:flex;align-items:flex-end;gap:8px;height:160px;padding:0 4px}
        .ad-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.4);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .ad-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .ad-modal-header{display:flex;align-items:flex-start;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid #EFE7DE}
        .ad-modal-header h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0 0 4px}
        .ad-modal-header p{font-size:13px;color:#8B7355;margin:0}
        .ad-modal-close{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355;flex-shrink:0}
        .ad-modal-close:hover{background:#EFE7DE;color:#2D2D2D}
        .ad-modal-body{padding:20px 24px 24px}
        .ad-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
        .ad-field{display:flex;flex-direction:column;gap:6px}
        .ad-field.full{grid-column:1/-1}
        .ad-field label{font-size:12px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:0.4px}
        .ad-field input{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;width:100%;box-sizing:border-box;transition:border-color 0.2s}
        .ad-field input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .ad-modal-actions{display:flex;gap:10px;justify-content:flex-end}
        .ad-cancel-btn{padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit}
        .ad-cancel-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .ad-confirm-btn{padding:10px 22px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;display:flex;align-items:center;gap:6px}
        .ad-confirm-btn:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .ad-confirm-btn:disabled{opacity:0.6;cursor:not-allowed}
      `}</style>

      {/* Approve Modal */}
      {modal && (
        <div className="ad-overlay" onClick={() => setModal(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <div>
                <h3>Approve Cashier</h3>
                <p>{modal.name} · {modal.email}</p>
              </div>
              <button className="ad-modal-close" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="ad-modal-body">
              <form onSubmit={handleApprove}>
                <div className="ad-form-grid">
                  <div className="ad-field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={form.phone}
                      onKeyDown={e => {
                        const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                        if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault();
                        if (/^[0-9]$/.test(e.key) && form.phone.length >= 10) e.preventDefault();
                      }}
                      onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    />
                  </div>
                  <div className="ad-field">
                    <label>Branch</label>
                    <input placeholder="Main Branch" required value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} />
                  </div>
                  <div className="ad-field">
                    <label>Counter Number</label>
                    <input placeholder="Counter 1" required value={form.counterNumber} onChange={e => setForm({...form, counterNumber: e.target.value})} />
                  </div>
                  <div className="ad-field">
                    <label>Shift Timing</label>
                    <input placeholder="9AM - 5PM" required value={form.shiftTiming} onChange={e => setForm({...form, shiftTiming: e.target.value})} />
                  </div>
                  <div className="ad-field full">
                    <label>Basic Salary (₹)</label>
                    <input type="number" placeholder="15000" required value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} />
                  </div>
                </div>
                <div className="ad-modal-actions">
                  <button type="button" className="ad-cancel-btn" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="ad-confirm-btn" disabled={approving}>
                    {approving ? <span className="ad-spinner" /> : <><CheckCircle size={14} /> Approve</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="ad-page">
        {toast && (
          <div className={`ad-toast ${toast.type === 'error' ? 'ad-toast-err' : ''}`}>
            {toast.type === 'error' ? <X size={14} /> : <CheckCircle size={14} />}{toast.msg}
          </div>
        )}

        <div className="ad-kpi-grid">
          {[
            { label: "Today's Revenue", value: kpis.revenue,            icon: TrendingUp,    sub: 'Live sales' },
            { label: 'Total Products',  value: String(kpis.products),    icon: ShoppingBag,   sub: 'In inventory' },
            { label: 'Active Cashiers', value: String(kpis.cashiers),    icon: Users,         sub: 'On duty' },
            { label: 'Low Stock Alerts',value: String(kpis.lowStock),    icon: AlertTriangle, sub: 'Need restock' },
          ].map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="ad-kpi-card">
              <div className="ad-kpi-icon"><Icon size={20} /></div>
              <div>
                <div className="ad-kpi-value">{value}</div>
                <div className="ad-kpi-label">{label}</div>
                <div className="ad-kpi-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ad-grid2">
          <div className="ad-card">
            <div className="ad-card-header">
              <div className="ad-card-title"><Clock size={16} />Pending Cashier Approvals</div>
              <span className="ad-count-badge">{pending.length}</span>
            </div>
            {loadingPending ? (
              <div className="ad-empty">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="ad-empty"><CheckCircle size={32} /><p>No pending approvals</p></div>
            ) : (
              <div className="ad-pending-list">
                {pending.map(c => (
                  <div key={c.email} className="ad-pending-item">
                    <div className="ad-pending-avatar">{(c.name || c.email)[0].toUpperCase()}</div>
                    <div className="ad-pending-info">
                      <span className="ad-pending-name">{c.name || '—'}</span>
                      <span className="ad-pending-email">{c.email}</span>
                    </div>
                    <button className="ad-approve-btn" onClick={() => { setModal(c); setForm(EMPTY_FORM); }}>Approve</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ad-card">
            <div className="ad-card-header">
              <div className="ad-card-title"><Users size={16} />Active Cashiers</div>
              <span className="ad-count-badge">{activeCashiers.length}</span>
            </div>
            {activeCashiers.length === 0 ? (
              <div className="ad-empty"><Users size={32} /><p>No active cashiers</p></div>
            ) : (
              <div className="ad-pending-list">
                {activeCashiers.map(c => (
                  <div key={c.email} className="ad-pending-item">
                    <div className="ad-pending-avatar" style={{background:'#5A7A5A',color:'#DCFCE7'}}>{(c.name || c.email)[0].toUpperCase()}</div>
                    <div className="ad-pending-info">
                      <span className="ad-pending-name">{c.name || '—'}</span>
                      <span className="ad-pending-email">{c.email}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
                      {c.branch && <span style={{fontSize:11,color:'#8B7355',background:'#F8F5F2',padding:'2px 8px',borderRadius:20}}>{c.branch}</span>}
                      {c.counterNumber && <span style={{fontSize:11,color:'#8B7355'}}>{c.counterNumber}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <div className="ad-card-title"><TrendingUp size={16} />Monthly Sales</div>
          </div>
          <BarChartMock billing={allBilling} />
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <div className="ad-card-title"><ShoppingBag size={16} />Recent Transactions</div>
          </div>
          <table className="ad-table">
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {recentTxns.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center',padding:'24px',color:'#D6D3D1',fontSize:13}}>No transactions yet</td></tr>
              ) : recentTxns.map((t, i) => (
                <tr key={i}>
                  <td style={{fontWeight:600,color:'#2D2D2D'}}>{t.invoiceNumber}</td>
                  <td>{t.customerName || 'Walk-in Customer'}</td>
                  <td style={{fontWeight:600}}>₹{Number(t.grandTotal||0).toLocaleString('en-IN')}</td>
                  <td style={{color:'#8B7355',fontSize:12}}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <span style={{padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700,
                      background: t.status==='COMPLETED'?'#DCFCE7': t.status==='CANCELLED'?'#FEE2E2':'#FEF9C3',
                      color: t.status==='COMPLETED'?'#16a34a': t.status==='CANCELLED'?'#dc2626':'#ca8a04'
                    }}>{t.status==='COMPLETED'?'Paid': t.status==='CANCELLED'?'Cancelled':'Pending'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function BarChartMock({ billing = [] }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentMonth = new Date().getMonth();
  const data = Array(12).fill(0);
  billing.forEach(b => {
    if (b.createdAt) {
      const m = new Date(b.createdAt).getMonth();
      data[m] += Number(b.grandTotal || 0);
    }
  });
  const max = Math.max(...data, 1);
  const totalSales = data.reduce((s, v) => s + v, 0);
  return (
    <div className="ad-chart-wrap">
      <div className="ad-chart-labels">
        <div className="ad-chart-label"><div className="ad-chart-current" /><span>Current Month</span></div>
        <div className="ad-chart-label"><div className="ad-chart-other" /><span>Other Months</span></div>
        <span style={{marginLeft:'auto',fontWeight:600}}>Total: ₹{Number(totalSales).toLocaleString('en-IN')}</span>
      </div>
      <div className="ad-chart-container">
        {data.map((val, i) => (
          <div key={i} style={{flex:'1 1 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',gap:6,height:'100%'}}>
            <div style={{width:'100%',height:`${Math.max((val/max)*120, 4)}px`,background:i===currentMonth?'#C6A969':'#EFE7DE',borderRadius:'4px 4px 0 0',transition:'all 0.3s'}} />
            <span style={{fontSize:10,color:'#8B7355',fontWeight:500,whiteSpace:'nowrap'}}>{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}