import { Receipt, Users, TrendingUp, Clock } from 'lucide-react';
import styles from '../css/CashierDashboard.module.css';

const kpis = [
  { label: "Today's Bills",    value: '0',  icon: Receipt,    sub: 'Invoices generated' },
  { label: "Today's Sales",    value: '₹0', icon: TrendingUp, sub: 'Total collected' },
  { label: 'Customers Served', value: '0',  icon: Users,      sub: 'Today' },
  { label: 'Shift',            value: '—',  icon: Clock,      sub: 'Current timing' },
];

export default function CashierDashboard() {
  return (
    <div className={styles.page}>
      {/* KPI */}
      <div className={styles.kpiGrid}>
        {kpis.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className={styles.kpiCard}>
            <div className={styles.kpiIcon}><Icon size={20} /></div>
            <div>
              <div className={styles.kpiValue}>{value}</div>
              <div className={styles.kpiLabel}>{label}</div>
              <div className={styles.kpiSub}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><Receipt size={16} /> Quick Actions</div>
          <div className={styles.actions}>
            <button className={styles.actionBtn}>New Bill</button>
            <button className={styles.actionBtn}>Search Product</button>
            <button className={styles.actionBtn}>View Invoices</button>
            <button className={styles.actionBtn}>Customer Lookup</button>
          </div>
        </div>

        {/* Recent Bills Placeholder */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><Clock size={16} /> Recent Bills</div>
          <table className={styles.table}>
            <thead>
              <tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td><span className={styles.skeleton} style={{ width: 70 }} /></td>
                  <td><span className={styles.skeleton} style={{ width: 100 }} /></td>
                  <td><span className={styles.skeleton} style={{ width: 55 }} /></td>
                  <td><span className={styles.skeleton} style={{ width: 55 }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>Bills will appear once billing is active.</p>
        </div>
      </div>
    </div>
  );
}
