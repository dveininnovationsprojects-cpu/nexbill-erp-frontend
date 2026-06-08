import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, CheckCircle, Truck, Package, MapPin, Tag, Phone, Mail, ChevronRight, ToggleLeft, ToggleRight, IndianRupee } from 'lucide-react';
import api from '../api';

const DUMMY = [
  { id: 1, companyName: 'Tech Distributors',  contactPerson: 'Ravi Kumar',  mobile: '9876543210', email: 'ravi@techdist.com',    address: 'Chennai',    gstin: '', bankDetails: '', status: 'ACTIVE',   totalPurchasedAmount: 50000, totalPaidAmount: 30000, outstandingBalance: 20000 },
  { id: 2, companyName: 'Agro Suppliers',     contactPerson: 'Murugan S',   mobile: '9845123456', email: 'info@agrosup.com',     address: 'Coimbatore', gstin: '', bankDetails: '', status: 'INACTIVE', totalPurchasedAmount: 20000, totalPaidAmount: 20000, outstandingBalance: 0 },
  { id: 3, companyName: 'Stationery Hub',     contactPerson: 'Priya R',     mobile: '9123456789', email: 'priya@stathub.com',    address: 'Madurai',    gstin: '', bankDetails: '', status: 'ACTIVE',   totalPurchasedAmount: 0, totalPaidAmount: 0, outstandingBalance: 0 },
  { id: 4, companyName: 'Fashion Wholesale',  contactPerson: 'Karthik M',   mobile: '9988776655', email: 'karthik@fashionw.com', address: 'Tirupur',    gstin: '', bankDetails: '', status: 'ACTIVE',   totalPurchasedAmount: 0, totalPaidAmount: 0, outstandingBalance: 0 },
  { id: 5, companyName: 'Aqua Traders',       contactPerson: 'Selvi D',     mobile: '9001122334', email: 'selvi@aquatrade.com',  address: 'Salem',      gstin: '', bankDetails: '', status: 'INACTIVE', totalPurchasedAmount: 0, totalPaidAmount: 0, outstandingBalance: 0 },
];

const EMPTY = { companyName: '', gstin: '', contactPerson: '', mobile: '', email: '', address: '', bankDetails: '', status: 'ACTIVE' };
const EMPTY_LEDGER = { type: 'PAYMENT', amount: '', note: '', date: new Date().toISOString().split('T')[0] };

const BAR_COLORS = ['#C6A969', '#8B7355', '#5A7A5A', '#9B4444', '#6B7280', '#2D2D2D'];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ledgerModal, setLedgerModal] = useState(false);
  const [ledgerForm, setLedgerForm] = useState(EMPTY_LEDGER);
  const [ledgerSaving, setLedgerSaving] = useState(false);

  const headers = () => ({});

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/api/suppliers/all');
      const data = res.data || [];
      setSuppliers(data);
      setSelected(prev => prev ? (data.find(s => s.id === prev.id) || data[0] || null) : (data[0] || null));
    } catch {
      try {
        const res = await api.get('/api/suppliers/active');
        const data = res.data || [];
        setSuppliers(data);
        setSelected(prev => prev ? (data.find(s => s.id === prev.id) || data[0] || null) : (data[0] || null));
      } catch { setSuppliers([]); }
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = suppliers.filter(s => {
    const matchSearch = s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s, e) => { e.stopPropagation(); setForm({ companyName: s.companyName, gstin: s.gstin, contactPerson: s.contactPerson, mobile: s.mobile, email: s.email, address: s.address, bankDetails: s.bankDetails, status: s.status || 'ACTIVE' }); setEditId(s.id); setModal(true); };

  const handleToggleStatus = async (s, e) => {
    e.stopPropagation();
    const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/api/suppliers/${s.id}/toggle-status`, {});
      showToast(`Supplier marked ${newStatus}`);
      fetchSuppliers();
    } catch {
      setSuppliers(prev => prev.map(x => x.id === s.id ? { ...x, status: newStatus } : x));
      if (selected?.id === s.id) setSelected(prev => ({ ...prev, status: newStatus }));
      showToast(`Marked ${newStatus} (offline)`);
    }
  };

  const handleLedgerSave = async (e) => {
    e.preventDefault();
    if (!ledgerForm.amount || isNaN(ledgerForm.amount)) return;
    setLedgerSaving(true);
    const amount = parseFloat(ledgerForm.amount);
    try {
      if (ledgerForm.type === 'PAYMENT') {
        // Payment: only paid parameter
        await api.put(`/api/suppliers/${selected.id}/update-ledger`, null, { params: { paid: amount } });
        showToast('Payment recorded!');
      } else {
        // Purchase: only purchase parameter
        await api.put(`/api/suppliers/${selected.id}/update-ledger`, null, { params: { purchase: amount } });
        showToast('Purchase recorded!');
      }
      await fetchSuppliers(); // Re-fetch to get updated data from backend
    } catch (err) {
      console.error('Ledger save error:', err);
      console.error('Error response:', err?.response?.data);
      // Offline fallback
      if (ledgerForm.type === 'PAYMENT') {
        setSuppliers(prev => prev.map(x => x.id === selected.id
          ? { ...x, totalPaidAmount: (x.totalPaidAmount || 0) + amount, outstandingBalance: Math.max(0, (x.outstandingBalance || 0) - amount) }
          : x
        ));
        setSelected(prev => ({ ...prev, totalPaidAmount: (prev.totalPaidAmount || 0) + amount, outstandingBalance: Math.max(0, (prev.outstandingBalance || 0) - amount) }));
        showToast('Payment recorded (offline)!');
      } else {
        setSuppliers(prev => prev.map(x => x.id === selected.id
          ? { ...x, totalPurchasedAmount: (x.totalPurchasedAmount || 0) + amount, outstandingBalance: (x.outstandingBalance || 0) + amount }
          : x
        ));
        setSelected(prev => ({ ...prev, totalPurchasedAmount: (prev.totalPurchasedAmount || 0) + amount, outstandingBalance: (prev.outstandingBalance || 0) + amount }));
        showToast('Purchase recorded (offline)!');
      }
    } finally {
      setLedgerSaving(false);
      setLedgerModal(false);
      setLedgerForm(EMPTY_LEDGER);
    }
  };
  const closeModal = () => { setModal(null); setForm(EMPTY); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!editId) {
        await api.post('/api/suppliers', form);
        showToast('Supplier added!');
      } else {
        await api.put(`/api/suppliers/${editId}`, form);
        showToast('Supplier updated!');
      }
      closeModal();
      fetchSuppliers();
    } catch {
      showToast('Failed to save. Check backend connection.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/suppliers/${deleteId}`);
      showToast('Supplier deleted!');
      fetchSuppliers();
    } catch {
      showToast('Failed to delete. Check backend connection.');
    }
    setDeleteId(null);
  };

  const { user } = { user: null };

  // KPI computed from backend data
  const totalOutstanding = suppliers.reduce((s, x) => s + (x.outstandingBalance || 0), 0);
  const activeCount = suppliers.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = suppliers.filter(s => s.status === 'INACTIVE').length;

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

        /* Status tabs */
        .sp-tabs{display:flex;gap:6px;padding:0 0 10px}
        .sp-tab{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid #EFE7DE;background:#F8F5F2;color:#8B7355;font-family:inherit;transition:all 0.15s}
        .sp-tab.active-tab{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .sp-tab.act{background:#EAF4EA;color:#5A7A5A;border-color:#5A7A5A}
        .sp-tab.inact{background:#FDF0F0;color:#9B4444;border-color:#9B4444}
        /* Status badge */
        .sp-status-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;flex-shrink:0}
        .sp-status-badge.ACTIVE{background:#EAF4EA;color:#5A7A5A}
        .sp-status-badge.INACTIVE{background:#FDF0F0;color:#9B4444}
        /* Toggle btn */
        .sp-toggle-btn{background:none;border:none;cursor:pointer;padding:3px;border-radius:5px;display:flex;align-items:center;color:#8B7355}
        .sp-toggle-btn:hover{background:#EFE7DE}
        /* Layout */
        .sp-body{display:grid;grid-template-columns:280px 1fr;gap:16px;min-height:500px}

        /* Left list */
        .sp-list-panel{background:#fff;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05);display:flex;flex-direction:column}
        .sp-list-top{padding:14px 14px 0;border-bottom:1px solid #EFE7DE;display:flex;flex-direction:column;gap:8px}
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
        /* Ledger modal */
        .sp-ledger-btn{display:flex;align-items:center;gap:5px;padding:7px 14px;background:#5A7A5A;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;margin-left:auto}
        .sp-ledger-btn:hover{background:#4A6A4A}
        .sp-ledger-entries{margin-top:14px;display:flex;flex-direction:column;gap:6px}
        .sp-ledger-entry{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#F8F5F2;border-radius:8px;font-size:12px}
        .sp-ledger-entry-note{color:#3F3F46;font-weight:500}
        .sp-ledger-entry-amt{color:#5A7A5A;font-weight:700}
        /* Total row */
        .sp-total-row{padding:12px 14px;background:#2D2D2D;color:#F8F5F2;border-top:2px solid #C6A969;display:flex;flex-direction:column;gap:6px;font-size:11px}
        .sp-total-label{font-weight:700;color:#C6A969;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px}
        .sp-total-item{display:flex;justify-content:space-between;align-items:center}
        .sp-total-item-label{color:#EFE7DE}
        .sp-total-item-val{font-weight:700;color:#F8F5F2}
      `}</style>

      {toast && <div className="sp-toast"><CheckCircle size={14} />{toast}</div>}

      {/* Ledger Payment Modal */}
      {ledgerModal && (
        <div className="sp-overlay" onClick={() => setLedgerModal(false)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()} style={{maxWidth:380}}>
            <div className="sp-modal-header">
              <h3>Add Entry — {selected?.companyName}</h3>
              <button className="sp-modal-close" onClick={() => setLedgerModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleLedgerSave} className="sp-modal-body">
              <div className="sp-field full">
                <label>Type *</label>
                <select value={ledgerForm.type} onChange={e => setLedgerForm({ ...ledgerForm, type: e.target.value })} style={{padding:'10px 12px',border:'1.5px solid #EFE7DE',borderRadius:9,fontSize:13,color:'#2D2D2D',background:'#F8F5F2',outline:'none',fontFamily:'inherit',width:'100%',boxSizing:'border-box'}}>
                  <option value="PAYMENT">Payment</option>
                  <option value="PURCHASE">Purchase</option>
                </select>
              </div>
              <div className="sp-field full">
                <label>Amount (₹) *</label>
                <input type="number" min="1" placeholder="e.g. 5000" required value={ledgerForm.amount} onChange={e => setLedgerForm({ ...ledgerForm, amount: e.target.value })} />
              </div>
              <div className="sp-field">
                <label>Date</label>
                <input type="date" value={ledgerForm.date} onChange={e => setLedgerForm({ ...ledgerForm, date: e.target.value })} />
              </div>
              <div className="sp-field">
                <label>Note</label>
                <input placeholder="e.g. Invoice #123" value={ledgerForm.note} onChange={e => setLedgerForm({ ...ledgerForm, note: e.target.value })} />
              </div>
              <div className="sp-modal-actions">
                <button type="button" className="sp-cancel-btn" onClick={() => setLedgerModal(false)}>Cancel</button>
                <button type="submit" className="sp-save-btn" disabled={ledgerSaving}>{ledgerSaving ? 'Saving...' : ledgerForm.type === 'PAYMENT' ? 'Record Payment' : 'Record Purchase'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label>Company Name *</label>
                <input placeholder="e.g. Tech Distributors" required value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div className="sp-field"><label>GSTIN</label><input placeholder="29AABCN1234M1Z5" maxLength="15" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} /></div>
              <div className="sp-field"><label>Contact Person</label><input placeholder="Ravi Kumar" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
              <div className="sp-field"><label>Mobile</label><input type="tel" placeholder="9876543210" maxLength="10" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="sp-field"><label>Email</label><input type="email" placeholder="supplier@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="sp-field full"><label>Address</label><input placeholder="City / Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="sp-field full"><label>Bank Details</label><input placeholder="Bank name, account no..." value={form.bankDetails} onChange={e => setForm({ ...form, bankDetails: e.target.value })} /></div>
              <div className="sp-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{padding:'10px 12px',border:'1.5px solid #EFE7DE',borderRadius:9,fontSize:13,color:'#2D2D2D',background:'#F8F5F2',outline:'none',fontFamily:'inherit',width:'100%',boxSizing:'border-box'}}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
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
        <div className="sp-kpi-grid">
              <div className="sp-kpi"><div className="sp-kpi-icon gold"><Truck size={18} /></div><div><div className="sp-kpi-val">{suppliers.length}</div><div className="sp-kpi-label">Total Suppliers</div></div></div>
              <div className="sp-kpi"><div className="sp-kpi-icon green"><Package size={18} /></div><div><div className="sp-kpi-val">{activeCount}</div><div className="sp-kpi-label">Active Suppliers</div></div></div>
              <div className="sp-kpi"><div className="sp-kpi-icon blue"><Tag size={18} /></div><div><div className="sp-kpi-val">₹{totalOutstanding.toLocaleString()}</div><div className="sp-kpi-label">Outstanding Balance</div></div></div>
              <div className="sp-kpi"><div className="sp-kpi-icon dark"><MapPin size={18} /></div><div><div className="sp-kpi-val">{new Set(suppliers.map(s => s.address).filter(Boolean)).size}</div><div className="sp-kpi-label">Locations</div></div></div>
        </div>

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
              <div className="sp-tabs">
                <button className={`sp-tab ${statusFilter==='ALL'?'active-tab':''}`} onClick={() => setStatusFilter('ALL')}>All ({suppliers.length})</button>
                <button className={`sp-tab ${statusFilter==='ACTIVE'?'act':''}`} onClick={() => setStatusFilter('ACTIVE')}>Active ({activeCount})</button>
                <button className={`sp-tab ${statusFilter==='INACTIVE'?'inact':''}`} onClick={() => setStatusFilter('INACTIVE')}>Inactive ({inactiveCount})</button>
              </div>
            </div>
            <div className="sp-list">
              {filtered.map(s => (
                <div key={s.id} className={`sp-list-item ${selected?.id === s.id ? 'active' : ''}`} onClick={() => setSelected(s)}>
                  <div className="sp-avatar">{s.companyName?.[0] || '?'}</div>
                  <div className="sp-list-info">
                    <div className="sp-list-name">{s.companyName}</div>
                    <div className="sp-list-cat">{s.contactPerson || '—'}</div>
                  </div>
                  <span className={`sp-status-badge ${s.status || 'ACTIVE'}`}>{s.status === 'INACTIVE' ? 'Inactive' : 'Active'}</span>
                  <div className="sp-list-actions">
                    <button className="sp-toggle-btn" title={s.status === 'ACTIVE' ? 'Mark Inactive' : 'Mark Active'} onClick={e => handleToggleStatus(s, e)}>
                      {s.status === 'ACTIVE' ? <ToggleRight size={16} color="#5A7A5A" /> : <ToggleLeft size={16} color="#9B4444" />}
                    </button>
                    <button className="sp-icon-btn" onClick={e => openEdit(s, e)}><Pencil size={13} /></button>
                    <button className="sp-icon-btn del" onClick={e => { e.stopPropagation(); setDeleteId(s.id); }}><Trash2 size={13} /></button>
                  </div>
                  <ChevronRight size={14} style={{ color: selected?.id === s.id ? '#C6A969' : '#D6D3D1', flexShrink: 0 }} />
                </div>
              ))}
            </div>
            {filtered.length > 0 && (
              <div className="sp-total-row">
                <div className="sp-total-label">Total Summary</div>
                <div className="sp-total-item">
                  <span className="sp-total-item-label">Purchased:</span>
                  <span className="sp-total-item-val">₹{filtered.reduce((sum, s) => sum + (s.totalPurchasedAmount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="sp-total-item">
                  <span className="sp-total-item-label">Paid:</span>
                  <span className="sp-total-item-val">₹{filtered.reduce((sum, s) => sum + (s.totalPaidAmount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="sp-total-item">
                  <span className="sp-total-item-label">Outstanding:</span>
                  <span className="sp-total-item-val">₹{filtered.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right — Detail + Chart */}
          <div className="sp-detail-panel">
            {!selected ? (
              <div className="sp-empty-detail">Select a supplier to view details</div>
            ) : (
              <>
                <div className="sp-detail-header">
                  <div className="sp-detail-avatar">{selected.companyName?.[0] || '?'}</div>
                  <div>
                    <div className="sp-detail-name">{selected.companyName}</div>
                    <span className={`sp-status-badge ${selected.status || 'ACTIVE'}`} style={{marginTop:4}}>{selected.status === 'INACTIVE' ? 'Inactive' : 'Active'}</span>
                  </div>
                </div>

                <div className="sp-detail-meta">
                  <div className="sp-meta-item"><Phone size={14} className="sp-meta-icon" />{selected.mobile || '—'}</div>
                  <div className="sp-meta-item"><Mail size={14} className="sp-meta-icon" />{selected.email || '—'}</div>
                  <div className="sp-meta-item"><MapPin size={14} className="sp-meta-icon" />{selected.address || '—'}</div>
                  <div className="sp-meta-item"><Package size={14} className="sp-meta-icon" />{selected.contactPerson || '—'}</div>
                </div>

                <div className="sp-detail-body">
                  <div className="sp-chart-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{display:'flex',alignItems:'center',gap:6}}>Ledger Summary</span>
                    <button className="sp-ledger-btn" onClick={() => { setLedgerForm(EMPTY_LEDGER); setLedgerModal(true); }}><IndianRupee size={13} /> Add Entry</button>
                  </div>
                  <div className="sp-chart">
                    {[{label:'Total Purchased', val: selected.totalPurchasedAmount||0, color:'#C6A969'},
                      {label:'Total Paid',      val: selected.totalPaidAmount||0,      color:'#5A7A5A'},
                      {label:'Outstanding',     val: selected.outstandingBalance||0,   color:'#9B4444'}].map((row, i) => {
                      const max = Math.max(selected.totalPurchasedAmount||0, 1);
                      return (
                        <div key={i} className="sp-bar-row">
                          <div className="sp-bar-label">{row.label}</div>
                          <div className="sp-bar-track">
                            {row.val === 0 ? <span className="sp-bar-val zero">₹0</span> : (
                              <div className="sp-bar-fill" style={{width:`${Math.min((row.val/max)*100,100)}%`,background:row.color}}>
                                <span className="sp-bar-val">₹{row.val.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {selected.gstin && <div style={{marginTop:12,fontSize:12,color:'#8B7355'}}>GSTIN: {selected.gstin}</div>}
                    {selected.bankDetails && <div style={{fontSize:12,color:'#8B7355',marginTop:4}}>Bank: {selected.bankDetails}</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
