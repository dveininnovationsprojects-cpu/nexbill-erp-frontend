import { useEffect, useState } from 'react';
import { Users, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import axios from 'axios';

const KPIs = [
  { label: "Today's Revenue", value: '₹0',  icon: TrendingUp,    sub: 'Live sales' },
  { label: 'Total Products',  value: '0',   icon: ShoppingBag,   sub: 'In inventory' },
  { label: 'Active Cashiers', value: '0',   icon: Users,         sub: 'On duty' },
  { label: 'Low Stock Alerts',value: '0',   icon: AlertTriangle, sub: 'Need restock' },
];

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [approvingEmail, setApprovingEmail] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-cashiers', { withCredentials: true });
      setPending(res.data);
    } catch { setPending([]); } finally { setLoadingPending(false); }
  };

  useEffect(() => { fetchPending(); }, []);

  const approveCashier = async (email) => {
    setApprovingEmail(email);
    try {
      await axios.post(`/api/admin/approve-cashier/${email}`, {}, { withCredentials: true });
      showToast(`${email} approved successfully`);
      fetchPending();
    } catch { showToast('Approval failed. Try again.', 'error'); }
    finally { setApprovingEmail(null); }
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
        .ad-approve-btn{padding:7px 16px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;display:flex;align-items:center;justify-content:center;min-width:72px}
        .ad-approve-btn:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .ad-approve-btn:disabled{opacity:0.6;cursor:not-allowed}
        .ad-spinner{width:13px;height:13px;border:2px solid rgba(248,245,242,0.3);border-top-color:#F8F5F2;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ad-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px 0;color:#D6D3D1;font-size:13px}
        .ad-table{width:100%;border-collapse:collapse;font-size:13px}
        .ad-table th{text-align:left;padding:8px 12px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #EFE7DE}
        .ad-table td{padding:12px;border-bottom:1px solid #F8F5F2;color:#3F3F46}
        .ad-skeleton{display:inline-block;height:12px;background:#EFE7DE;border-radius:4px;animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .ad-placeholder-note{font-size:12px;color:#D6D3D1;text-align:center;margin:12px 0 0}
      `}</style>

      <div className="ad-page">
        {toast && (
          <div className={`ad-toast ${toast.type === 'error' ? 'ad-toast-err' : ''}`}>
            {toast.type === 'error' ? <X size={14} /> : <CheckCircle size={14} />}{toast.msg}
          </div>
        )}

        <div className="ad-kpi-grid">
          {KPIs.map(({ label, value, icon: Icon, sub }) => (
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
                    <div className="ad-pending-avatar">{c.name?.[0]?.toUpperCase() ?? c.email[0].toUpperCase()}</div>
                    <div className="ad-pending-info">
                      <span className="ad-pending-name">{c.name || '—'}</span>
                      <span className="ad-pending-email">{c.email}</span>
                    </div>
                    <button className="ad-approve-btn" onClick={() => approveCashier(c.email)} disabled={approvingEmail === c.email}>
                      {approvingEmail === c.email ? <span className="ad-spinner" /> : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ad-card">
            <div className="ad-card-header">
              <div className="ad-card-title"><TrendingUp size={16} />Monthly Sales</div>
            </div>
            <BarChartMock />
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <div className="ad-card-title"><ShoppingBag size={16} />Recent Transactions</div>
          </div>
          <table className="ad-table">
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td><span className="ad-skeleton" style={{width:80}} /></td>
                  <td><span className="ad-skeleton" style={{width:120}} /></td>
                  <td><span className="ad-skeleton" style={{width:60}} /></td>
                  <td><span className="ad-skeleton" style={{width:80}} /></td>
                  <td><span className="ad-skeleton" style={{width:60}} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ad-placeholder-note">Transaction data will appear once billing is active.</p>
        </div>
      </div>
    </>
  );
}

function BarChartMock() {
  const bars = [40,65,50,80,55,90,70,85,60,75,95,68];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:8,height:140,padding:'0 4px'}}>
      {bars.map((h,i) => (
        <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <div style={{width:'100%',height:`${h}%`,background:i===11?'#C6A969':'#EFE7DE',borderRadius:'4px 4px 0 0'}} />
          <span style={{fontSize:9,color:'#8B7355'}}>{months[i]}</span>
        </div>
      ))}
    </div>
  );
}
