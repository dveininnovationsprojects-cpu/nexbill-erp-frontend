import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, CheckCircle, Truck, Package, MapPin, Tag, Phone, Mail, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DUMMY = [
  { id: 1, name: 'Tech Distributors',  contact: 'Ravi Kumar',  phone: '9876543210', email: 'ravi@techdist.com',    address: 'Chennai',    category: 'Electronics', totalProducts: 12,
    products: [{ name: 'Wireless Mouse', stock: 45 }, { name: 'USB-C Cable', stock: 0 }, { name: 'Keyboard', stock: 30 }] },
  { id: 2, name: 'Agro Suppliers',     contact: 'Murugan S',   phone: '9845123456', email: 'info@agrosup.com',     address: 'Coimbatore', category: 'Groceries',   totalProducts: 8,
    products: [{ name: 'Rice 5kg', stock: 8 }, { name: 'Wheat 10kg', stock: 50 }, { name: 'Sugar 1kg', stock: 120 }] },
  { id: 3, name: 'Stationery Hub',     contact: 'Priya R',     phone: '9123456789', email: 'priya@stathub.com',    address: 'Madurai',    category: 'Stationery',  totalProducts: 20,
    products: [{ name: 'Blue Pen Pack', stock: 300 }, { name: 'Notebook A4', stock: 12 }, { name: 'Stapler', stock: 25 }] },
  { id: 4, name: 'Fashion Wholesale',  contact: 'Karthik M',   phone: '9988776655', email: 'karthik@fashionw.com', address: 'Tirupur',    category: 'Clothing',    totalProducts: 35,
    products: [{ name: 'Cotton T-Shirt', stock: 5 }, { name: 'Jeans', stock: 18 }, { name: 'Jacket', stock: 7 }] },
  { id: 5, name: 'Aqua Traders',       contact: 'Selvi D',     phone: '9001122334', email: 'selvi@aquatrade.com',  address: 'Salem',      category: 'Beverages',   totalProducts: 5,
    products: [{ name: 'Mineral Water 1L', stock: 500 }, { name: 'Juice 500ml', stock: 80 }] },
];

const EMPTY = { name: '', contact: '', phone: '', email: '', address: '', category: '' };

const BAR_COLORS = ['#C6A969', '#8B7355', '#5A7A5A', '#9B4444', '#6B7280', '#2D2D2D'];

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState(DUMMY);
  const [selected, setSelected] = useState(DUMMY[0]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${user.token}` });

  useEffect(() => {
    axios.get('/api/suppliers/all', { headers: headers(), withCredentials: true })
      .then(res => { if (res.data?.length) { setSuppliers(res.data); setSelected(res.data[0]); } })
      .catch(() => {});
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s, e) => { e.stopPropagation(); setForm({ name: s.name, contact: s.contact, phone: s.phone, email: s.email, address: s.address, category: s.category }); setEditId(s.id); setModal(true); };
  const closeModal = () => { setModal(null); setForm(EMPTY); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!editId) {
        try {
          const res = await axios.post('/api/suppliers/add', form, { headers: headers(), withCredentials: true });
          setSuppliers(prev => [...prev, res.data]);
        } catch { setSuppliers(prev => [...prev, { ...form, id: Date.now(), totalProducts: 0, products: [] }]); }
        showToast('Supplier added!');
      } else {
        try {
          const res = await axios.put(`/api/suppliers/update/${editId}`, form, { headers: headers(), withCredentials: true });
          setSuppliers(prev => prev.map(s => s.id === editId ? { ...s, ...res.data } : s));
          if (selected?.id === editId) setSelected(prev => ({ ...prev, ...res.data }));
        } catch {
          setSuppliers(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
          if (selected?.id === editId) setSelected(prev => ({ ...prev, ...form }));
        }
        showToast('Supplier updated!');
      }
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await axios.delete(`/api/suppliers/delete/${deleteId}`, { headers: headers(), withCredentials: true }); } catch {}
    const remaining = suppliers.filter(s => s.id !== deleteId);
    setSuppliers(remaining);
    if (selected?.id === deleteId) setSelected(remaining[0] || null);
    setDeleteId(null);
    showToast('Supplier deleted!');
  };

  // Bar chart max
  const maxStock = selected?.products?.length ? Math.max(...selected.products.map(p => p.stock), 1) : 1;

  return (
    <>
      <style>{`
        .sp-wrap{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}

        /* KPI */
        .sp-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .sp-kpi{background:#fff;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .sp-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sp-kpi-icon.gold{background:#FDF8EE;color:#C6A969}
        .sp-kpi-icon.green{background:#F0F7F0;color:#5A7A5A}
        .sp-kpi-icon.blue{background:#EFE7DE;color:#8B7355}
        .sp-kpi-icon.dark{background:#F0F0EE;color:#2D2D2D}
        .sp-kpi-val{font-size:22px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .sp-kpi-label{font-size:12px;color:#8B7355;font-weight:500}

        /* Layout */
        .sp-body{display:grid;grid-template-columns:280px 1fr;gap:16px;min-height:500px}

        /* Left list */
        .sp-list-panel{background:#fff;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05);display:flex;flex-direction:column}
        .sp-list-top{padding:14px 14px 10px;border-bottom:1px solid #EFE7DE;display:flex;flex-direction:column;gap:8px}
        .sp-list-title{font-size:13px;font-weight:700;color:#2D2D2D;display:flex;align-items:center;justify-content:space-between}
        .sp-add-btn{display:flex;align-items:center;gap:4px;padding:6px 12px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .sp-add-btn:hover{background:#C6A969;color:#2D2D2D}
        .sp-search-wrap{position:relative}
        .sp-search-wrap input{width:100%;padding:8px 12px 8px 32px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:12px;background:#F8F5F2;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .sp-search-wrap input:focus{border-color:#C6A969}
        .sp-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#8B7355}
        .sp-list{flex:1;overflow-y:auto}
        .sp-list-item{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-bottom:1px solid #F8F5F2;transition:background 0.15s;position:relative}
        .sp-list-item:hover{background:#FDFCFB}
        .sp-list-item.active{background:#FDF8EE;border-left:3px solid #C6A969}
        .sp-list-item:not(.active){border-left:3px solid transparent}
        .sp-avatar{width:34px;height:34px;border-radius:9px;background:#2D2D2D;color:#C6A969;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
        .sp-list-info{flex:1;min-width:0}
        .sp-list-name{font-size:13px;font-weight:600;color:#2D2D2D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sp-list-cat{font-size:11px;color:#8B7355;margin-top:1px}
        .sp-list-actions{display:flex;gap:4px;opacity:0;transition:opacity 0.15s}
        .sp-list-item:hover .sp-list-actions{opacity:1}
        .sp-icon-btn{background:none;border:none;cursor:pointer;padding:4px;border-radius:5px;color:#8B7355;display:flex;align-items:center}
        .sp-icon-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .sp-icon-btn.del:hover{background:#FDF0F0;color:#9B4444}

        /* Right detail */
        .sp-detail-panel{background:#fff;border:1px solid #EFE7DE;border-radius:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05);overflow:hidden;display:flex;flex-direction:column}
        .sp-detail-header{padding:20px 24px 16px;border-bottom:1px solid #EFE7DE;display:flex;align-items:center;gap:14px}
        .sp-detail-avatar{width:48px;height:48px;border-radius:12px;background:#2D2D2D;color:#C6A969;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0}
        .sp-detail-name{font-size:18px;font-weight:700;color:#2D2D2D;margin:0 0 3px}
        .sp-detail-cat{font-size:12px;color:#8B7355;background:#F8F5F2;border:1px solid #EFE7DE;padding:2px 10px;border-radius:20px;display:inline-block}
        .sp-detail-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:16px 24px;border-bottom:1px solid #EFE7DE}
        .sp-meta-item{display:flex;align-items:center;gap:8px;font-size:13px;color:#3F3F46}
        .sp-meta-icon{color:#8B7355;flex-shrink:0}
        .sp-detail-body{padding:20px 24px;flex:1}
        .sp-chart-title{font-size:13px;font-weight:700;color:#2D2D2D;margin:0 0 16px;display:flex;align-items:center;gap:6px}
        .sp-chart-title span{font-size:11px;font-weight:500;color:#8B7355}
        .sp-chart{display:flex;flex-direction:column;gap:10px}
        .sp-bar-row{display:flex;align-items:center;gap:10px}
        .sp-bar-label{font-size:12px;color:#3F3F46;width:140px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sp-bar-track{flex:1;background:#F8F5F2;border-radius:6px;height:22px;overflow:hidden;position:relative}
        .sp-bar-fill{height:100%;border-radius:6px;transition:width 0.4s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:8px}
        .sp-bar-val{font-size:11px;font-weight:700;color:#fff;white-space:nowrap}
        .sp-bar-val.zero{color:#D6D3D1;padding-left:8px;position:absolute;left:0}
        .sp-empty-detail{display:flex;align-items:center;justify-content:center;height:200px;color:#D6D3D1;font-size:14px}

        /* Modal */
        .sp-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.4);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .sp-modal{background:#fff;border-radius:18px;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .sp-modal-header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid #EFE7DE}
        .sp-modal-header h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0}
        .sp-modal-close{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355}
        .sp-modal-close:hover{background:#EFE7DE;color:#2D2D2D}
        .sp-modal-body{padding:20px 24px 24px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .sp-field{display:flex;flex-direction:column;gap:6px}
        .sp-field.full{grid-column:1/-1}
        .sp-field label{font-size:12px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:0.4px}
        .sp-field input{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;width:100%;box-sizing:border-box}
        .sp-field input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#fff}
        .sp-modal-actions{grid-column:1/-1;display:flex;gap:10px;justify-content:flex-end;margin-top:4px}
        .sp-cancel-btn{padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit}
        .sp-cancel-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .sp-save-btn{padding:10px 24px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
        .sp-save-btn:hover{background:#C6A969;color:#2D2D2D}
        .sp-del-modal{background:#fff;border-radius:18px;width:100%;max-width:360px;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(45,45,45,0.2)}
        .sp-del-modal h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0 0 8px}
        .sp-del-modal p{font-size:14px;color:#8B7355;margin:0 0 24px}
        .sp-del-actions{display:flex;gap:10px;justify-content:center}
        .sp-del-confirm{padding:10px 24px;background:#9B4444;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
        .sp-del-confirm:hover{background:#7A3030}
        .sp-toast{position:fixed;top:20px;right:28px;background:#2D2D2D;color:#F8F5F2;padding:12px 18px;border-radius:10px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);animation:spSlide 0.25s ease}
        @keyframes spSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {toast && <div className="sp-toast"><CheckCircle size={14} />{toast}</div>}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="sp-overlay" onClick={closeModal}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h3>{editId ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button className="sp-modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="sp-modal-body">
              <div className="sp-field full">
                <label>Supplier Name *</label>
                <input placeholder="e.g. Tech Distributors" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="sp-field"><label>Contact Person</label><input placeholder="Ravi Kumar" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
              <div className="sp-field"><label>Phone</label><input type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="sp-field"><label>Email</label><input type="email" placeholder="supplier@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="sp-field"><label>Category</label><input placeholder="e.g. Electronics" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div className="sp-field full"><label>Address</label><input placeholder="City / Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="sp-modal-actions">
                <button type="button" className="sp-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="sp-save-btn" disabled={saving}>{saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="sp-overlay" onClick={() => setDeleteId(null)}>
          <div className="sp-del-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Supplier?</h3>
            <p>This action cannot be undone.</p>
            <div className="sp-del-actions">
              <button className="sp-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="sp-del-confirm" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="sp-wrap">
        {/* KPI */}
        {(() => {
          const totalProducts = suppliers.reduce((s, x) => s + (x.totalProducts || 0), 0);
          const cats = new Set(suppliers.map(s => s.category).filter(Boolean)).size;
          const cities = new Set(suppliers.map(s => s.address).filter(Boolean)).size;
          return (
            <div className="sp-kpi-grid">
              <div className="sp-kpi"><div className="sp-kpi-icon gold"><Truck size={18} /></div><div><div className="sp-kpi-val">{suppliers.length}</div><div className="sp-kpi-label">Total Suppliers</div></div></div>
              <div className="sp-kpi"><div className="sp-kpi-icon green"><Package size={18} /></div><div><div className="sp-kpi-val">{totalProducts}</div><div className="sp-kpi-label">Products Supplied</div></div></div>
              <div className="sp-kpi"><div className="sp-kpi-icon blue"><Tag size={18} /></div><div><div className="sp-kpi-val">{cats}</div><div className="sp-kpi-label">Categories</div></div></div>
              <div className="sp-kpi"><div className="sp-kpi-icon dark"><MapPin size={18} /></div><div><div className="sp-kpi-val">{cities}</div><div className="sp-kpi-label">Locations</div></div></div>
            </div>
          );
        })()}

        <div className="sp-body">
          {/* Left — Supplier List */}
          <div className="sp-list-panel">
            <div className="sp-list-top">
              <div className="sp-list-title">
                <span>Suppliers</span>
                <button className="sp-add-btn" onClick={openAdd}><Plus size={13} /> Add</button>
              </div>
              <div className="sp-search-wrap">
                <Search size={13} className="sp-search-icon" />
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="sp-list">
              {filtered.map(s => (
                <div key={s.id} className={`sp-list-item ${selected?.id === s.id ? 'active' : ''}`} onClick={() => setSelected(s)}>
                  <div className="sp-avatar">{s.name[0]}</div>
                  <div className="sp-list-info">
                    <div className="sp-list-name">{s.name}</div>
                    <div className="sp-list-cat">{s.category || '—'}</div>
                  </div>
                  <div className="sp-list-actions">
                    <button className="sp-icon-btn" onClick={e => openEdit(s, e)}><Pencil size={13} /></button>
                    <button className="sp-icon-btn del" onClick={e => { e.stopPropagation(); setDeleteId(s.id); }}><Trash2 size={13} /></button>
                  </div>
                  <ChevronRight size={14} style={{ color: selected?.id === s.id ? '#C6A969' : '#D6D3D1', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right — Detail + Chart */}
          <div className="sp-detail-panel">
            {!selected ? (
              <div className="sp-empty-detail">Select a supplier to view details</div>
            ) : (
              <>
                <div className="sp-detail-header">
                  <div className="sp-detail-avatar">{selected.name[0]}</div>
                  <div>
                    <div className="sp-detail-name">{selected.name}</div>
                    <span className="sp-detail-cat">{selected.category || 'No Category'}</span>
                  </div>
                </div>

                <div className="sp-detail-meta">
                  <div className="sp-meta-item"><Phone size={14} className="sp-meta-icon" />{selected.phone || '—'}</div>
                  <div className="sp-meta-item"><Mail size={14} className="sp-meta-icon" />{selected.email || '—'}</div>
                  <div className="sp-meta-item"><MapPin size={14} className="sp-meta-icon" />{selected.address || '—'}</div>
                  <div className="sp-meta-item"><Package size={14} className="sp-meta-icon" />{selected.contact || '—'}</div>
                </div>

                <div className="sp-detail-body">
                  <div className="sp-chart-title">
                    Stock by Product <span>— {selected.name}</span>
                  </div>
                  {(!selected.products || selected.products.length === 0) ? (
                    <div style={{ color: '#D6D3D1', fontSize: 13 }}>No product data available</div>
                  ) : (
                    <div className="sp-chart">
                      {selected.products.map((p, i) => {
                        const pct = maxStock > 0 ? (p.stock / maxStock) * 100 : 0;
                        const color = BAR_COLORS[i % BAR_COLORS.length];
                        return (
                          <div key={i} className="sp-bar-row">
                            <div className="sp-bar-label" title={p.name}>{p.name}</div>
                            <div className="sp-bar-track">
                              {p.stock === 0 ? (
                                <span className="sp-bar-val zero">0</span>
                              ) : (
                                <div className="sp-bar-fill" style={{ width: `${pct}%`, background: color }}>
                                  <span className="sp-bar-val">{p.stock}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
