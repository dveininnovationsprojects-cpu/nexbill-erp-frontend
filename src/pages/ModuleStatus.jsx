// Module Status — shown inside AdminDashboard as a status table
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MODULES = [
  { name: 'Dashboard',        description: 'KPI cards, pending approvals, monthly sales chart',   status: 'done'    },
  { name: 'Products',         description: 'Add / Edit / Delete products, KPI cards, category filter', status: 'done' },
  { name: 'Suppliers',        description: 'Supplier list with left panel + stock bar chart',      status: 'done'    },
  { name: 'Inventory',        description: 'Stock adjust (Set/Add/Subtract), history, low stock filter', status: 'done' },
  { name: 'Customers',        description: 'Customer list page — not yet built',                   status: 'pending' },
  { name: 'Billing',          description: 'Bills table with KPI cards, filter by status/cashier', status: 'done'    },
  { name: 'Payments',         description: 'Payments table, method breakdown, status filter',      status: 'done'    },
  { name: 'Invoices',         description: 'Invoice list, PDF preview, create invoice modal',      status: 'done'    },
  { name: 'Reports',          description: 'Reports page — not yet built',                         status: 'pending' },
  { name: 'Settings',         description: 'Business Profile, Invoice, Tax, Notifications, Security, System', status: 'done' },
  { name: 'Profile',          description: 'User profile page',                                    status: 'partial' },
  { name: 'Cashier Dashboard',description: 'KPI cards, quick actions, recent bills skeleton',      status: 'partial' },
  { name: 'Cashier Billing',  description: 'Cashier billing page',                                 status: 'partial' },
  { name: 'Cashier Products', description: 'Read-only product list for cashier',                   status: 'partial' },
  { name: 'Cashier Customers',description: 'Cashier customer lookup',                              status: 'partial' },
  { name: 'Cashier Invoices', description: 'Cashier invoice view',                                 status: 'partial' },
  { name: 'Cashier Payments', description: 'Cashier payment view',                                 status: 'partial' },
];

const STATUS = {
  done:    { label: 'Complete',    icon: CheckCircle,    color: '#5A7A5A', bg: '#F0F7F0', border: '#C8DFC8' },
  partial: { label: 'In Progress', icon: Clock,          color: '#9A7030', bg: '#FDF8EE', border: '#E8D9A8' },
  pending: { label: 'Not Built',   icon: AlertTriangle,  color: '#9B4444', bg: '#FDF0F0', border: '#F0D0D0' },
};

export default function ModuleStatus() {
  const done    = MODULES.filter(m => m.status === 'done').length;
  const partial = MODULES.filter(m => m.status === 'partial').length;
  const pending = MODULES.filter(m => m.status === 'pending').length;

  return (
    <>
      <style>{`
        .ms-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .ms-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .ms-kpi{background:#fff;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ms-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ms-kpi-val{font-size:26px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .ms-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .ms-card{background:#fff;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .ms-table{width:100%;border-collapse:collapse;font-size:13px}
        .ms-table th{text-align:left;padding:12px 18px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .ms-table td{padding:13px 18px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .ms-table tr:last-child td{border-bottom:none}
        .ms-table tr:hover td{background:#FDFCFB}
        .ms-num{font-size:12px;color:#8B7355;font-weight:600;width:32px}
        .ms-name{font-weight:600;color:#2D2D2D;font-size:13px}
        .ms-desc{font-size:12px;color:#8B7355;margin-top:2px}
        .ms-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap}
      `}</style>

      <div className="ms-page">
        {/* KPI */}
        <div className="ms-kpi-grid">
          <div className="ms-kpi">
            <div className="ms-kpi-icon" style={{background:'#F0F7F0'}}><CheckCircle size={18} color="#5A7A5A" /></div>
            <div><div className="ms-kpi-val">{done}</div><div className="ms-kpi-label">Complete</div></div>
          </div>
          <div className="ms-kpi">
            <div className="ms-kpi-icon" style={{background:'#FDF8EE'}}><Clock size={18} color="#9A7030" /></div>
            <div><div className="ms-kpi-val">{partial}</div><div className="ms-kpi-label">In Progress</div></div>
          </div>
          <div className="ms-kpi">
            <div className="ms-kpi-icon" style={{background:'#FDF0F0'}}><AlertTriangle size={18} color="#9B4444" /></div>
            <div><div className="ms-kpi-val">{pending}</div><div className="ms-kpi-label">Not Built</div></div>
          </div>
        </div>

        {/* Table */}
        <div className="ms-card">
          <table className="ms-table">
            <thead>
              <tr>
                <th style={{width:40}}>#</th>
                <th>Module</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => {
                const s = STATUS[m.status];
                const Icon = s.icon;
                return (
                  <tr key={m.name}>
                    <td className="ms-num">{i + 1}</td>
                    <td><div className="ms-name">{m.name}</div></td>
                    <td><div className="ms-desc">{m.description}</div></td>
                    <td>
                      <span className="ms-badge" style={{color:s.color, background:s.bg, border:`1px solid ${s.border}`}}>
                        <Icon size={11} />{s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
