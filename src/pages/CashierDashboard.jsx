import { Receipt, Users, TrendingUp, Clock } from 'lucide-react';

const kpis = [
  { label: "Today's Bills",    value: '0',  icon: Receipt,    sub: 'Invoices generated' },
  { label: "Today's Sales",    value: '₹0', icon: TrendingUp, sub: 'Total collected' },
  { label: 'Customers Served', value: '0',  icon: Users,      sub: 'Today' },
  { label: 'Shift',            value: '—',  icon: Clock,      sub: 'Current timing' },
];

export default function CashierDashboard() {
  return (
    <>
      <style>{`
        .cd-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
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
        .cd-table{width:100%;border-collapse:collapse;font-size:13px}
        .cd-table th{text-align:left;padding:8px 10px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #EFE7DE}
        .cd-table td{padding:11px 10px;border-bottom:1px solid #F8F5F2}
        .cd-skeleton{display:inline-block;height:12px;background:#EFE7DE;border-radius:4px;animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .cd-note{font-size:12px;color:#D6D3D1;text-align:center;margin:12px 0 0}
      `}</style>

      <div className="cd-page">
        <div className="cd-kpi-grid">
          {kpis.map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="cd-kpi-card">
              <div className="cd-kpi-icon"><Icon size={20} /></div>
              <div>
                <div className="cd-kpi-value">{value}</div>
                <div className="cd-kpi-label">{label}</div>
                <div className="cd-kpi-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="cd-grid2">
          <div className="cd-card">
            <div className="cd-card-title"><Receipt size={16} />Quick Actions</div>
            <div className="cd-actions">
              <button className="cd-action-btn">New Bill</button>
              <button className="cd-action-btn">Search Product</button>
              <button className="cd-action-btn">View Invoices</button>
              <button className="cd-action-btn">Customer Lookup</button>
            </div>
          </div>
          <div className="cd-card">
            <div className="cd-card-title"><Clock size={16} />Recent Bills</div>
            <table className="cd-table">
              <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td><span className="cd-skeleton" style={{width:70}} /></td>
                    <td><span className="cd-skeleton" style={{width:100}} /></td>
                    <td><span className="cd-skeleton" style={{width:55}} /></td>
                    <td><span className="cd-skeleton" style={{width:55}} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="cd-note">Bills will appear once billing is active.</p>
          </div>
        </div>
      </div>
    </>
  );
}
