import { useEffect, useState } from 'react';
import { Users, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import axios from 'axios';
import styles from './AdminDashboard.module.css';

const KPI_PLACEHOLDER = [
  { label: "Today's Revenue",  value: '₹0',  icon: TrendingUp, sub: 'Live sales' },
  { label: 'Total Products',   value: '0',   icon: ShoppingBag, sub: 'In inventory' },
  { label: 'Active Cashiers',  value: '0',   icon: Users,       sub: 'On duty' },
  { label: 'Low Stock Alerts', value: '0',   icon: AlertTriangle, sub: 'Need restock' },
];

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [approvingEmail, setApprovingEmail] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-cashiers', { withCredentials: true });
      setPending(res.data);
    } catch {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approveCashier = async (email) => {
    setApprovingEmail(email);
    try {
      await axios.post(`/api/admin/approve-cashier/${email}`, {}, { withCredentials: true });
      showToast(`${email} approved successfully`);
      fetchPending();
    } catch {
      showToast('Approval failed. Try again.', 'error');
    } finally {
      setApprovingEmail(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.type === 'error' ? <X size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {KPI_PLACEHOLDER.map(({ label, value, icon: Icon, sub }) => (
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
        {/* Pending Cashiers */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Clock size={16} />
              Pending Cashier Approvals
            </div>
            <span className={styles.countBadge}>{pending.length}</span>
          </div>

          {loadingPending ? (
            <div className={styles.empty}>Loading...</div>
          ) : pending.length === 0 ? (
            <div className={styles.empty}>
              <CheckCircle size={32} />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className={styles.pendingList}>
              {pending.map((c) => (
                <div key={c.email} className={styles.pendingItem}>
                  <div className={styles.pendingAvatar}>{c.name?.[0]?.toUpperCase() ?? c.email[0].toUpperCase()}</div>
                  <div className={styles.pendingInfo}>
                    <span className={styles.pendingName}>{c.name || '—'}</span>
                    <span className={styles.pendingEmail}>{c.email}</span>
                  </div>
                  <button
                    className={styles.approveBtn}
                    onClick={() => approveCashier(c.email)}
                    disabled={approvingEmail === c.email}
                  >
                    {approvingEmail === c.email ? <span className={styles.spinner} /> : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales Chart Placeholder */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><TrendingUp size={16} /> Monthly Sales</div>
          </div>
          <div className={styles.chartPlaceholder}>
            <BarChartMock />
          </div>
        </div>
      </div>

      {/* Recent Transactions Placeholder */}
      <div className={styles.card} style={{ marginTop: 20 }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}><ShoppingBag size={16} /> Recent Transactions</div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice #</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i}>
                <td><span className={styles.skeleton} style={{ width: 80 }} /></td>
                <td><span className={styles.skeleton} style={{ width: 120 }} /></td>
                <td><span className={styles.skeleton} style={{ width: 60 }} /></td>
                <td><span className={styles.skeleton} style={{ width: 80 }} /></td>
                <td><span className={styles.skeleton} style={{ width: 60 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.placeholderNote}>Transaction data will appear once billing is active.</p>
      </div>
    </div>
  );
}

function BarChartMock() {
  const bars = [40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 68];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', height: `${h}%`,
            background: i === 11 ? '#C6A969' : '#EFE7DE',
            borderRadius: '4px 4px 0 0',
            transition: 'background 0.2s'
          }} />
          <span style={{ fontSize: 9, color: '#8B7355' }}>{months[i]}</span>
        </div>
      ))}
    </div>
  );
}
