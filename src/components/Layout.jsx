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
      { icon: BarChart2, label: 'Sales Analytics', to: '/admin/sales-analytics' },
      { icon: FileText,  label: 'Export',          to: '/admin/reports/export' },
    ]
  },
  { icon: Users,           label: 'Cashiers',  to: '/admin/cashiers' },
  {
    icon: Settings, label: 'Settings', dropdown: [
      { 
        icon: UserCircle, 
        label: 'Accounts', 
        nested: [
          { icon: Building2, label: 'Business Profile', to: '/admin/settings/accounts/business-profile' },
        ]
      },
      { 
        icon: FileText, 
        label: 'Billing', 
        nested: [
          { icon: Percent, label: 'Tax', to: '/admin/settings/billing/tax' },
          { icon: Receipt, label: 'Invoice', to: '/admin/settings/billing/invoice' },
        ]
      },
      { 
        icon: Settings2, 
        label: 'Preferences', 
        nested: [
          { icon: BellRing, label: 'Notifications', to: '/admin/settings/preferences/notifications' },
          { icon: Shield, label: 'Security', to: '/admin/settings/preferences/security' },
        ]
      },
    ]
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
  { icon: Settings,        label: 'Settings',  to: '/cashier/settings' },
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
  const [lowStockList, setLowStockList] = useState([]);
  const [modal, setModal]               = useState(null); // cashier object
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [approving, setApproving]       = useState(false);
  const [toast, setToast]               = useState(null);

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : cashierNav;
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

  useEffect(() => {
    if (!isAdmin) return;
    fetchPending();
    fetchLowStock();
    const interval = setInterval(() => { fetchPending(); fetchLowStock(); }, 30000);
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
          {sidebarOpen ? (
            <>
              <div className={styles.brand}>
                <div className={styles.brandLogo}>N</div>
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
              className={styles.floatingOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFloatingPanel(null)}
            />
            <motion.div
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
                if (path.includes('/settings/billing/tax')) return 'Tax & GST';
                if (path.includes('/settings/billing/invoice')) return 'Invoice Settings';
                if (path.includes('/settings/preferences/notifications')) return 'Notifications';
                if (path.includes('/settings/preferences/security')) return 'Security';
                if (path.includes('/settings/preferences/system')) return 'System Preferences';
                
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

            {/* Bell — admin only */}
            {isAdmin && (
              <div className={styles.notifWrap}>
                <button className={styles.iconBtn} onClick={() => setNotifOpen(!notifOpen)}>
                  <Bell size={18} />
                  {pendingList.length + lowStockList.length > 0 && <span className={styles.badge}>{pendingList.length + lowStockList.length}</span>}
                </button>
                {notifOpen && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>Notifications</div>

                    {/* Pending Cashiers */}
                    {pendingList.length > 0 && (
                      <>
                        <div className={styles.notifSection}>👤 Pending Approvals ({pendingList.length})</div>
                        {pendingList.map(c => (
                          <div key={c.email} className={styles.notifItem}>
                            <div className={styles.notifAvatar}>{(c.name || c.email)[0].toUpperCase()}</div>
                            <div className={styles.notifInfo}>
                              <div className={styles.notifName}>{c.name || '—'}</div>
                              <div className={styles.notifEmail}>{c.email}</div>
                            </div>
                            <button className={styles.notifApproveBtn} onClick={() => openModal(c)}>Approve</button>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Low Stock */}
                    {lowStockList.length > 0 && (
                      <>
                        <div className={styles.notifSection}>⚠️ Low Stock ({lowStockList.length})</div>
                        {lowStockList.map(item => (
                          <div key={item.id} className={styles.notifItem}>
                            <div className={styles.notifAvatarWarn}>!</div>
                            <div className={styles.notifInfo}>
                              <div className={styles.notifName}>{item.name}</div>
                              <div className={styles.notifEmail}>Stock: {item.stock} (Min: {item.minStock})</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {pendingList.length === 0 && lowStockList.length === 0 && (
                      <div className={styles.notifEmpty}>No new notifications</div>
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
                          {isAdmin ? 'NexBill Admin' : 'Ahamed Yasik'}
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
                    <LogOut size={14} /> Sign Out
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

