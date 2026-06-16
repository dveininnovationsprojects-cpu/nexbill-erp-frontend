import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Warehouse, Users, Receipt,
  CreditCard, FileText, BarChart2, Settings, LogOut,
  Bell, ChevronDown, ChevronRight, Menu, X, CheckCircle, UserCircle, Truck,
  Building2, Percent, Shield, Settings2, BellRing, Tag
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';
import NotificationPanel from './NotificationPanel';

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  {
    icon: Package, label: 'Products', dropdown: [
      { icon: Package, label: 'Products',   to: '/admin/products' },
      { icon: Tag,     label: 'Categories', to: '/admin/categories' },
      { icon: Truck,   label: 'Suppliers',  to: '/admin/suppliers' },
    ]
  },
  { icon: Warehouse,       label: 'Inventory', to: '/admin/inventory' },
  { icon: Users,           label: 'Customers', to: '/admin/customers' },
  { icon: Receipt,         label: 'Billing',   to: '/admin/billing' },
  { icon: CreditCard,      label: 'Payments',  to: '/admin/payments' },
  { icon: FileText,        label: 'Invoices',  to: '/admin/invoices' },
  {
    icon: BarChart2, label: 'Reports', dropdown: [
      { icon: FileText,  label: 'Export',          to: '/admin/reports' },
      { icon: BarChart2, label: 'Sales Analytics', to: '/admin/sales-analytics' },
    ]
  },
  { icon: Users,           label: 'Cashiers',  to: '/admin/cashiers' },
  {
    icon: Settings, label: 'Settings', to: '/admin/settings'
  },
  { icon: UserCircle, label: 'Profile', to: '/admin/profile' },
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
  const [notifTab, setNotifTab]         = useState('unread');
  const [pendingList, setPendingList]   = useState([]);
  const [dismissedPending, setDismissedPending] = useState(
    () => JSON.parse(localStorage.getItem('dismissed_pending') || '[]')
  );
  const [company, setCompany]           = useState({ name: 'NexBill', logoUrl: null });

  useEffect(() => {
    axios.get('/api/settings', { headers: { Authorization: `Bearer ${user?.token}` } })
      .then(res => {
        const PLACEHOLDERS = ['Company Name Not Set', 'Please update Company Name'];
        const name = res.data?.companyName;
        const info = {
          name:    (!name || PLACEHOLDERS.includes(name)) ? 'NexBill' : name,
          logoUrl: res.data?.logoUrl || null,
          tagline: res.data?.tagline || '',
        };
        setCompany(info);
        // Save for login page (no token available there)
        localStorage.setItem('nexbill_company', JSON.stringify(info));
      }).catch(() => {});
  }, [user?.token]);
  const [lowStockList, setLowStockList] = useState([]);
  const [dismissedLowStock, setDismissedLowStock] = useState(
    () => JSON.parse(localStorage.getItem('dismissed_lowstock') || '[]')
  );
  const [cashierNotifs, setCashierNotifs] = useState([]);
  const [allCashierNotifs, setAllCashierNotifs] = useState([]);
  const [modal, setModal]               = useState(null); // cashier object
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [approving, setApproving]       = useState(false);
  const [toast, setToast]               = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : cashierNav;

  const visiblePending = pendingList.filter(c => !dismissedPending.includes(c.email));
  const visibleLowStock = lowStockList.filter(i => !dismissedLowStock.includes(i.inventoryId));

  const dismissPending = (email) => {
    const updated = [...dismissedPending, email];
    setDismissedPending(updated);
    localStorage.setItem('dismissed_pending', JSON.stringify(updated));
  };
  const dismissAllPending = () => {
    const emails = pendingList.map(c => c.email);
    const updated = [...new Set([...dismissedPending, ...emails])];
    setDismissedPending(updated);
    localStorage.setItem('dismissed_pending', JSON.stringify(updated));
  };
  const dismissLowStock = (id) => {
    const updated = [...dismissedLowStock, id];
    setDismissedLowStock(updated);
    localStorage.setItem('dismissed_lowstock', JSON.stringify(updated));
  };
  const dismissAllLowStock = () => {
    const ids = lowStockList.map(i => i.inventoryId);
    const updated = [...new Set([...dismissedLowStock, ...ids])];
    setDismissedLowStock(updated);
    localStorage.setItem('dismissed_lowstock', JSON.stringify(updated));
  };
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openNested, setOpenNested] = useState({});
  const [floatingPanel, setFloatingPanel] = useState(null);
  const [floatingPosition, setFloatingPosition] = useState({ top: 0 });

  useEffect(() => {
    adminNav.forEach(item => {
      if (item.dropdown) {
        const hasActive = item.dropdown.some(c => {
          if (c.to && location.pathname.startsWith(c.to)) return true;
          if (c.nested) return c.nested.some(n => location.pathname.startsWith(n.to));
          return false;
        });
        if (hasActive) {
          setOpenDropdown(item.label);
          // Open nested if active
          item.dropdown.forEach((subItem, idx) => {
            if (subItem.nested?.some(n => location.pathname.startsWith(n.to))) {
              setOpenNested(prev => ({ ...prev, [`${item.label}-${idx}`]: true }));
            }
          });
        }
      }
    });
  }, [location.pathname]);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/pending-cashiers', {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      setPendingList(res.data);
    } catch { /* ignore */ }
  };

  const fetchLowStock = async () => {
    try {
      const res = await axios.get('/api/inventory/low-stock', {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      setLowStockList(res.data);
    } catch { setLowStockList([]); }
  };

  const fetchCashierNotifs = async () => {
    try {
      const res = await axios.get('/api/notifications/my-alerts', {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      const all = res.data || [];
      setAllCashierNotifs(all);
      setCashierNotifs(all.filter(n => !n.read));
    } catch (err) {
      setCashierNotifs([]);
      setAllCashierNotifs([]);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPending();
      fetchLowStock();
      const interval = setInterval(() => { fetchPending(); fetchLowStock(); }, 30000);
      return () => clearInterval(interval);
    } else {
      fetchCashierNotifs();
      const interval = setInterval(fetchCashierNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchUserProfile = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get('/api/profile/me', {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      setUserProfile(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user?.token]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Show login success toast once on first dashboard landing
  useEffect(() => {
    if (location.state?.loginMsg) {
      showToast(location.state.loginMsg);
      window.history.replaceState({}, '');
    }
  }, []);

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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setProfileOpen(false);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login', { state: { message: 'You have been logged out successfully.' } });
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.overlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Logout</h3>
                <p>Are you sure you want to log out?</p>
              </div>
              <button className={styles.modalClose} onClick={() => setShowLogoutConfirm(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: '8px 24px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className={styles.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', background:'#7A3A3A', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
              >
                <LogOut size={14} /> Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          {sidebarOpen ? (
            <>
              <div className={styles.brand}>
                <div className={styles.brandLogo}>
                  {company.logoUrl
                    ? <img src={company.logoUrl} alt="logo" />
                    : (company.name?.[0]?.toUpperCase() || 'N')
                  }
                </div>
                <span className={styles.brandName}>NexBill</span>
              </div>
              <button className={styles.collapseBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
                <X size={16} />
              </button>
            </>
          ) : (
            <button className={styles.collapseBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
          )}
        </div>
        {sidebarOpen && (
          <div className={styles.roleTag}>{isAdmin ? '⬡ Admin Panel' : '⬡ Cashier Panel'}</div>
        )}
        <nav className={styles.nav}>
          {navItems.map((item, itemIdx) => {
            const Icon = item.icon;
            
            // Dropdown with nested items
            if (item.dropdown) {
              const isOpen = openDropdown === item.label;
              const isChildActive = item.dropdown.some(c => {
                if (c.to && location.pathname.startsWith(c.to)) return true;
                if (c.nested) return c.nested.some(n => location.pathname.startsWith(n.to));
                return false;
              });
              
              return (
                <div key={item.label}>
                  <button
                    className={`${styles.navItem} ${styles.navDropdownTrigger} ${isChildActive ? styles.navActive : ''}`}
                    onClick={(e) => {
                      if (!sidebarOpen) {
                        // If collapsed, show floating panel
                        const rect = e.currentTarget.getBoundingClientRect();
                        setFloatingPosition({ top: rect.top });
                        setFloatingPanel(floatingPanel === item.label ? null : item.label);
                      } else {
                        // If open, toggle dropdown
                        setOpenDropdown(isOpen ? null : item.label);
                      }
                    }}
                  >
                    <Icon size={18} />
                    {sidebarOpen && (
                      <>
                        <span style={{flex:1}}>{item.label}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          <ChevronRight size={14} />
                        </motion.div>
                      </>
                    )}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && sidebarOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className={styles.subNav}>
                          {item.dropdown.map((subItem, subIdx) => {
                            const SubIcon = subItem.icon;
                            const nestedKey = `${item.label}-${subIdx}`;
                            
                            // Has nested dropdown
                            if (subItem.nested) {
                              const isNestedActive = subItem.nested.some(n => location.pathname.startsWith(n.to));
                              
                              return (
                                <div key={subItem.label}>
                                  <button
                                    type="button"
                                    className={`${styles.subNavItem} ${styles.nestedTrigger} ${isNestedActive ? styles.navActive : ''}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setFloatingPosition({ top: rect.top });
                                      setFloatingPanel(floatingPanel === subItem.label ? null : subItem.label);
                                    }}
                                  >
                                    <SubIcon size={15} />
                                    <span style={{flex:1}}>{subItem.label}</span>
                                    <motion.div
                                      animate={{ rotate: floatingPanel === subItem.label ? 90 : 0 }}
                                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                                      style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}
                                    >
                                      <ChevronRight size={12} />
                                    </motion.div>
                                  </button>
                                </div>
                              );
                            }
                            
                            // Regular link
                            if (subItem.to) {
                              return (
                                <NavLink
                                  key={subItem.to}
                                  to={subItem.to}
                                  className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.navActive : ''}`}
                                >
                                  <SubIcon size={15} />
                                  <span>{subItem.label}</span>
                                </NavLink>
                              );
                            }
                            
                            return null;
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            
            // Regular link
            return (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
                <Icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Floating Nested Panel */}
      <AnimatePresence>
        {floatingPanel && (
          <>
            <motion.div
              key="floating-overlay"
              className={styles.floatingOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFloatingPanel(null)}
            />
            <motion.div
              key="floating-panel"
              className={styles.floatingNestedPanel}
              style={{ 
                top: Math.min(floatingPosition.top, window.innerHeight - 400), 
                left: sidebarOpen ? 230 : 64 
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className={styles.floatingPanelHeader}>
                {floatingPanel}
              </div>
              <div className={styles.floatingPanelBody}>
                {(() => {
                  // Check if floatingPanel is a main item (Products, Settings)
                  const mainItem = navItems.find(item => item.label === floatingPanel);
                  if (mainItem && mainItem.dropdown) {
                    // Show main dropdown items
                    return mainItem.dropdown.map((subItem) => {
                      const SubIcon = subItem.icon;
                      
                      // If has nested, show as button to open another panel
                      if (subItem.nested) {
                        return (
                          <button
                            key={subItem.label}
                            className={styles.floatingPanelItem}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setFloatingPosition({ top: rect.top });
                              setFloatingPanel(subItem.label);
                            }}
                          >
                            <SubIcon size={15} />
                            <span style={{flex:1}}>{subItem.label}</span>
                            <ChevronRight size={12} />
                          </button>
                        );
                      }
                      
                      // Regular link
                      if (subItem.to) {
                        return (
                          <NavLink
                            key={subItem.to}
                            to={subItem.to}
                            className={({ isActive }) => `${styles.floatingPanelItem} ${isActive ? styles.floatingPanelItemActive : ''}`}
                            onClick={() => setFloatingPanel(null)}
                          >
                            <SubIcon size={15} />
                            <span>{subItem.label}</span>
                          </NavLink>
                        );
                      }
                      return null;
                    });
                  }
                  
                  // Check if floatingPanel is a nested item (Accounts, Billing, Preferences)
                  for (const item of navItems) {
                    if (item.dropdown) {
                      const subItem = item.dropdown.find(sub => sub.label === floatingPanel);
                      if (subItem && subItem.nested) {
                        return subItem.nested.map((nestedItem) => {
                          const NestedIcon = nestedItem.icon;
                          return (
                            <NavLink
                              key={nestedItem.to}
                              to={nestedItem.to}
                              className={({ isActive }) => `${styles.floatingPanelItem} ${isActive ? styles.floatingPanelItemActive : ''}`}
                              onClick={() => setFloatingPanel(null)}
                            >
                              <NestedIcon size={15} />
                              <span>{nestedItem.label}</span>
                            </NavLink>
                          );
                        });
                      }
                    }
                  }
                  
                  return null;
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.navbar}>
          <div className={styles.navLeft}>
            <h1 className={styles.pageTitle}>
              {(() => {
                const path = location.pathname;
                
                // Check nested settings routes first
                if (path.includes('/settings/accounts/business-profile')) return 'Business Profile';
                if (path.includes('/settings/billing/invoice'))         return 'Invoice Settings';
                
                // Check main routes
                for (const item of navItems) {
                  if (item.to && path.startsWith(item.to)) return item.label;
                  
                  // Check dropdown items
                  if (item.dropdown) {
                    for (const subItem of item.dropdown) {
                      if (subItem.to && path.startsWith(subItem.to)) return subItem.label;
                      
                      // Check nested items
                      if (subItem.nested) {
                        for (const nestedItem of subItem.nested) {
                          if (nestedItem.to && path.startsWith(nestedItem.to)) return nestedItem.label;
                        }
                      }
                    }
                  }
                }
                
                return 'Dashboard';
              })()}
            </h1>
          </div>
          <div className={styles.navRight}>

            {/* Bell */}
            <div className={styles.notifWrap}>
              <button className={styles.iconBtn} onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                {(isAdmin ? (visiblePending.length + visibleLowStock.length) : cashierNotifs.length) > 0 && (
                  <span className={styles.badge}>
                    {isAdmin
                      ? (visiblePending.length + visibleLowStock.length > 99 ? '99+' : visiblePending.length + visibleLowStock.length)
                      : (cashierNotifs.length > 99 ? '99+' : cashierNotifs.length)}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifHeader}>
                    <span>Notifications</span>
                  </div>
                  {isAdmin ? (
                    <>
                      {visiblePending.length === 0 && visibleLowStock.length === 0 && (
                        <div className={styles.notifEmpty}>No new notifications</div>
                      )}
                      {(visiblePending.length > 0 || visibleLowStock.length > 0) && (
                        <div style={{display:'flex',justifyContent:'flex-end',padding:'4px 12px'}}>
                          <button
                            style={{fontSize:11,fontWeight:600,color:'#8B7355',background:'#F8F5F2',border:'1px solid #EFE7DE',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}
                            onClick={() => { dismissAllPending(); dismissAllLowStock(); }}
                          >✓ Mark all read</button>
                        </div>
                      )}
                      {visiblePending.length > 0 && (
                        <>
                          <div className={styles.notifSection}>👤 Pending Approvals ({visiblePending.length})</div>
                          {visiblePending.map(c => (
                            <div key={c.email} className={styles.notifItem}>
                              <div className={styles.notifAvatar}>{(c.name || c.email)[0].toUpperCase()}</div>
                              <div className={styles.notifInfo}>
                                <div className={styles.notifName}>{c.name || '—'}</div>
                                <div className={styles.notifEmail}>{c.email}</div>
                              </div>
                              <div style={{display:'flex',gap:4}}>
                                <button className={styles.notifApproveBtn} onClick={() => openModal(c)}>Approve</button>
                                <button className={styles.notifApproveBtn} style={{background:'#F8F5F2',color:'#8B7355',border:'1px solid #EFE7DE'}} onClick={() => dismissPending(c.email)}>Read</button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {visibleLowStock.length > 0 && (
                        <>
                          <div className={styles.notifSection}>⚠️ Low Stock ({visibleLowStock.length})</div>
                          {visibleLowStock.map(item => (
                            <div key={item.inventoryId} className={styles.notifItem}>
                              <div className={styles.notifAvatarWarn}>!</div>
                              <div className={styles.notifInfo}>
                                <div className={styles.notifName}>{item.productName}</div>
                                <div className={styles.notifEmail}>Stock: {item.availableQuantity} (Min: {item.reorderLevel})</div>
                              </div>
                              <button className={styles.notifApproveBtn} style={{background:'#F8F5F2',color:'#8B7355',border:'1px solid #EFE7DE'}} onClick={() => dismissLowStock(item.inventoryId)}>Read</button>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {cashierNotifs.length > 0 && (
                        <div style={{display:'flex',justifyContent:'flex-end',padding:'4px 12px'}}>
                          <button
                            style={{fontSize:11,fontWeight:600,color:'#8B7355',background:'#F8F5F2',border:'1px solid #EFE7DE',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}
                            onClick={async () => {
                              const unread = [...cashierNotifs];
                              setCashierNotifs([]);
                              try {
                                await Promise.all(unread.map(n =>
                                  axios.put(`/api/notifications/read/${n.id}`, {}, {
                                    headers: { Authorization: `Bearer ${user.token}` },
                                    withCredentials: true,
                                  })
                                ));
                              } catch {}
                            }}
                          >✓ Mark all read</button>
                        </div>
                      )}
                      {cashierNotifs.length > 0 ? (
                        cashierNotifs.map(notif => {
                          const getIcon = (type) => {
                            if (type === 'PROFILE_APPROVED') return '✅';
                            if (type === 'LOW_STOCK_ALERT') return '⚠️';
                            if (type === 'HIGH_VALUE_SALES') return '🎉';
                            return '🔔';
                          };
                          return (
                            <div key={notif.id} className={styles.notifItem}>
                              <div className={styles.notifAvatar}>{getIcon(notif.type)}</div>
                              <div className={styles.notifInfo}>
                                <div className={styles.notifName}>{notif.title}</div>
                                <div className={styles.notifEmail}>{notif.message}</div>
                              </div>
                              <button
                                className={styles.notifApproveBtn}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setCashierNotifs(prev => prev.filter(n => n.id !== notif.id));
                                  try {
                                    await axios.put(`/api/notifications/read/${notif.id}`, {}, {
                                      headers: { Authorization: `Bearer ${user.token}` },
                                      withCredentials: true,
                                    });
                                  } catch {}
                                }}
                              >Read</button>
                            </div>
                          );
                        })
                      ) : (
                        <div className={styles.notifEmpty}>No new notifications</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className={styles.profileWrap}>
              <button className={styles.profileBtn} onClick={() => setProfileOpen(!profileOpen)}>
                <div className={styles.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileEmail}>{user?.email}</span>
                  <span className={styles.profileRole}>{isAdmin ? 'Administrator' : 'Cashier'}</span>
                </div>
                <ChevronDown size={14} style={{ color: '#8B7355', flexShrink: 0 }} />
              </button>
              {profileOpen && (
                <div className={styles.dropdown}>
                  {/* User identity row */}
                  <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #EFE7DE', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#C6A969,#8B7355)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#2D2D2D', flexShrink: 0 }}>
                        {user?.email?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#2D2D2D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {userProfile?.name || user?.name || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div style={{ fontSize: 10, color: '#8B7355', fontWeight: 500, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate(isAdmin ? '/admin/profile' : '/cashier/profile'); }}>
                    <UserCircle size={14} /> Profile
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