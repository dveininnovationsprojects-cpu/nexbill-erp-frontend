import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Warehouse, Users, Receipt,
  CreditCard, FileText, BarChart2, Settings, LogOut,
  Bell, ChevronDown, Menu, X, CheckCircle, UserCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Package,         label: 'Products',  to: '/admin/products' },
  { icon: Warehouse,       label: 'Inventory', to: '/admin/inventory' },
  { icon: Users,           label: 'Customers', to: '/admin/customers' },
  { icon: Receipt,         label: 'Billing',   to: '/admin/billing' },
  { icon: CreditCard,      label: 'Payments',  to: '/admin/payments' },
  { icon: FileText,        label: 'Invoices',  to: '/admin/invoices' },
  { icon: BarChart2,       label: 'Reports',   to: '/admin/reports' },
  { icon: Settings,        label: 'Settings',  to: '/admin/settings' },
  { icon: UserCircle,      label: 'Profile',   to: '/admin/profile'  },
];

const cashierNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/cashier/dashboard' },
  { icon: Receipt,         label: 'Billing',   to: '/cashier/billing' },
  { icon: Package,         label: 'Products',  to: '/cashier/products' },
  { icon: Users,           label: 'Customers', to: '/cashier/customers' },
  { icon: FileText,        label: 'Invoices',  to: '/cashier/invoices' },
  { icon: CreditCard,      label: 'Payments',  to: '/cashier/payments' },
  { icon: UserCircle,      label: 'Profile',   to: '/cashier/profile'  },
];

const EMPTY_FORM = { phone: '', branch: '', counterNumber: '', shiftTiming: '', basicSalary: '' };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [pendingList, setPendingList]   = useState([]);
  const [modal, setModal]               = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [approving, setApproving]       = useState(false);
  const [toast, setToast]               = useState(null);

  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : cashierNav;

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-cashiers', {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      setPendingList(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (cashier) => {
    setModal(cashier);
    setForm(EMPTY_FORM);
    setNotifOpen(false);
  };

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
    } catch {
      showToast('Approval failed. Try again.', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          <CheckCircle size={14} /> {toast.msg}
        </div>
      )}

      {/* Approve Modal */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Approve Cashier</h3>
                <p>{modal.name} · {modal.email}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleApprove} className={styles.modalForm}>
              <div className={styles.modalGrid}>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input placeholder="9876543210" required value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Branch</label>
                  <input placeholder="Main Branch" required value={form.branch}
                    onChange={e => setForm({ ...form, branch: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Counter Number</label>
                  <input placeholder="Counter 1" required value={form.counterNumber}
                    onChange={e => setForm({ ...form, counterNumber: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Shift Timing</label>
                  <input placeholder="9AM - 5PM" required value={form.shiftTiming}
                    onChange={e => setForm({ ...form, shiftTiming: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Basic Salary (₹)</label>
                  <input type="number" placeholder="15000" required value={form.basicSalary}
                    onChange={e => setForm({ ...form, basicSalary: e.target.value })} />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className={styles.approveBtn} disabled={approving}>
                  {approving ? <span className={styles.spinner} /> : <><CheckCircle size={14} /> Approve</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>N</div>
            {sidebarOpen && <span className={styles.brandName}>NexBill</span>}
          </div>
          <button className={styles.collapseBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
        {sidebarOpen && (
          <div className={styles.roleTag}>{isAdmin ? '⬡ Admin Panel' : '⬡ Cashier Panel'}</div>
        )}
        <nav className={styles.nav}>
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.navbar}>
          <div className={styles.navLeft}>
            <h1 className={styles.pageTitle}>
              {navItems.find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className={styles.navRight}>
            {isAdmin && (
              <div className={styles.notifWrap}>
                <button className={styles.iconBtn} onClick={() => setNotifOpen(!notifOpen)}>
                  <Bell size={18} />
                  {pendingList.length > 0 && <span className={styles.badge}>{pendingList.length}</span>}
                </button>
                {notifOpen && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>Pending Cashier Approvals</div>
                    {pendingList.length === 0 ? (
                      <div className={styles.notifEmpty}>No pending requests</div>
                    ) : (
                      pendingList.map(c => (
                        <div key={c.email} className={styles.notifItem}>
                          <div className={styles.notifAvatar}>{(c.name || c.email)[0].toUpperCase()}</div>
                          <div className={styles.notifInfo}>
                            <div className={styles.notifName}>{c.name || '—'}</div>
                            <div className={styles.notifEmail}>{c.email}</div>
                          </div>
                          <button className={styles.notifApproveBtn} onClick={() => openModal(c)}>
                            Approve
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={styles.profileWrap}>
              <button className={styles.profileBtn} onClick={() => setProfileOpen(!profileOpen)}>
                <div className={styles.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileEmail}>{user?.email}</span>
                  <span className={styles.profileRole}>{user?.role}</span>
                </div>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className={styles.dropdown}>
                  <button onClick={() => { setProfileOpen(false); navigate(isAdmin ? '/admin/profile' : '/cashier/profile'); }}>
                    <UserCircle size={14} /> My Profile
                  </button>
                  <button onClick={() => { setProfileOpen(false); navigate(isAdmin ? '/admin/settings' : '/cashier/settings'); }}>
                    <Settings size={14} /> Settings
                  </button>
                  <hr />
                  <button onClick={handleLogout} className={styles.dropLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
