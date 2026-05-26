import { useState, useEffect } from 'react';
import { Search, Pencil, X, CheckCircle, AlertTriangle, Package, TrendingDown, TrendingUp, History, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MOCK_INVENTORY = [
  { id: 1, sku: 'SKU001', name: 'Wireless Mouse',    category: 'Electronics', stock: 45,  minStock: 10, unit: 'pcs',  lastUpdated: '2025-05-20', supplier: 'Tech Distributors', history: [{date:'2025-05-20',type:'in',qty:50,reason:'New stock',by:'Admin'}] },
  { id: 2, sku: 'SKU002', name: 'Rice 5kg',          category: 'Groceries',   stock: 8,   minStock: 20, unit: 'bags', lastUpdated: '2025-05-21', supplier: 'Agro Suppliers', history: [{date:'2025-05-21',type:'out',qty:12,reason:'Sold',by:'Cashier 1'}] },
  { id: 3, sku: 'SKU003', name: 'Blue Pen Pack',     category: 'Stationery',  stock: 300, minStock: 50, unit: 'pcs',  lastUpdated: '2025-05-19', supplier: 'Stationery Hub', history: [{date:'2025-05-19',type:'in',qty:300,reason:'Bulk order',by:'Admin'}] },
  { id: 4, sku: 'SKU004', name: 'Cotton T-Shirt',    category: 'Clothing',    stock: 5,   minStock: 15, unit: 'pcs',  lastUpdated: '2025-05-22', supplier: 'Fashion Wholesale', history: [{date:'2025-05-22',type:'out',qty:10,reason:'Sold',by:'Cashier 2'}] },
  { id: 5, sku: 'SKU005', name: 'Mineral Water 1L',  category: 'Beverages',   stock: 500, minStock: 100,unit: 'btls', lastUpdated: '2025-05-18', supplier: 'Aqua Traders', history: [{date:'2025-05-18',type:'in',qty:500,reason:'Weekly supply',by:'Admin'}] },
  { id: 6, sku: 'SKU006', name: 'Notebook A4',       category: 'Stationery',  stock: 12,  minStock: 30, unit: 'pcs',  lastUpdated: '2025-05-20', supplier: 'Stationery Hub', history: [{date:'2025-05-20',type:'adjustment',qty:-5,reason:'Damaged',by:'Admin'}] },
  { id: 7, sku: 'SKU007', name: 'USB-C Cable',       category: 'Electronics', stock: 0,   minStock: 10, unit: 'pcs',  lastUpdated: '2025-05-17', supplier: 'Tech Distributors', history: [{date:'2025-05-17',type:'out',qty:25,reason:'Sold out',by:'Cashier 1'}] },
];

function getStatus(stock, minStock) {
  if (stock === 0) return 'out';
  if (stock < minStock) return 'low';
  return 'ok';
}

export default function Inventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const headers = () => ({ Authorization: `Bearer ${user.token}` });

  useEffect(() => {
    axios.get('/api/products/all', { headers: headers(), withCredentials: true })
      .then(res => { if (res.data?.length) setInventory(res.data); })
      .catch(() => {});
  }, []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out
  const [modal, setModal] = useState(null); // item object
  const [qty, setQty] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('set'); // set | add | subtract
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = inventory.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(i.stock, i.minStock);
    const matchFilter = filter === 'all' ? true : filter === 'low' ? status === 'low' : status === 'out';
    return matchSearch && matchFilter;
  });

  const lowCount = inventory.filter(i => getStatus(i.stock, i.minStock) === 'low').length;
  const outCount = inventory.filter(i => getStatus(i.stock, i.minStock) === 'out').length;
  const totalItems = inventory.length;
  const healthyCount = inventory.filter(i => getStatus(i.stock, i.minStock) === 'ok').length;

  const openUpdate = (item) => { setModal(item); setQty(''); setAdjustmentType('set'); setReason(''); };
  const closeModal = () => { setModal(null); setQty(''); setReason(''); };
  const openHistory = (item) => setHistoryModal(item);
  const closeHistory = () => setHistoryModal(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const qtyNum = parseInt(qty);
    let newStock = modal.stock;
    let historyType = 'adjustment';

    if (adjustmentType === 'set') {
      newStock = qtyNum;
      historyType = qtyNum > modal.stock ? 'in' : qtyNum < modal.stock ? 'out' : 'adjustment';
    } else if (adjustmentType === 'add') {
      newStock = modal.stock + qtyNum;
      historyType = 'in';
    } else {
      newStock = Math.max(0, modal.stock - qtyNum);
      historyType = 'out';
    }

    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      type: historyType,
      qty: adjustmentType === 'set' ? newStock - modal.stock : adjustmentType === 'add' ? qtyNum : -qtyNum,
      reason: reason || 'Manual adjustment',
      by: 'Admin',
      oldStock: modal.stock,
      newStock,
    };

    try {
      await axios.put(
        `/api/products/update/${modal.id}`,
        { ...modal, stock: newStock },
        { headers: headers(), withCredentials: true }
      );
    } catch { /* fallback to local update */ }

    setInventory(prev => prev.map(i => i.id === modal.id
      ? { ...i, stock: newStock, lastUpdated: new Date().toISOString().split('T')[0], history: [historyEntry, ...(i.history || [])] }
      : i
    ));
    showToast(`${modal.name} stock updated: ${modal.stock} → ${newStock}`);
    closeModal();
  };

  const statusBadge = (stock, minStock) => {
    const s = getStatus(stock, minStock);
    if (s === 'out') return <span className="inv-badge inv-badge-out">Out of Stock</span>;
    if (s === 'low') return <span className="inv-badge inv-badge-low">Low Stock</span>;
    return <span className="inv-badge inv-badge-ok">In Stock</span>;
  };

  return (
    <>
      <style>{`
        .inv-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .inv-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .inv-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .inv-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .inv-kpi-icon.blue{background:#EFE7DE;color:#8B7355}
        .inv-kpi-icon.warn{background:#FDF8EE;color:#C6A969}
        .inv-kpi-icon.danger{background:#FDF0F0;color:#9B4444}
        .inv-kpi-icon.ok{background:#F0F7F0;color:#5A7A5A}
        .inv-kpi-val{font-size:22px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .inv-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .inv-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .inv-search-wrap{position:relative;flex:1;min-width:200px}
        .inv-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .inv-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .inv-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .inv-filter-btns{display:flex;gap:6px}
        .inv-filter-btn{padding:9px 16px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:#FFFFFF;color:#8B7355;transition:all 0.2s}
        .inv-filter-btn:hover{border-color:#C6A969;color:#2D2D2D}
        .inv-filter-btn.active{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .inv-filter-btn.warn.active{background:#C6A969;color:#2D2D2D;border-color:#C6A969}
        .inv-filter-btn.danger.active{background:#9B4444;color:#FFFFFF;border-color:#9B4444}
        .inv-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .inv-table{width:100%;border-collapse:collapse;font-size:13px}
        .inv-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .inv-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .inv-table tr:last-child td{border-bottom:none}
        .inv-table tr:hover td{background:#FDFCFB}
        .inv-sku{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600}
        .inv-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px}
        .inv-badge-ok{background:#F0F7F0;color:#5A7A5A}
        .inv-badge-low{background:#FDF8EE;color:#9A7030}
        .inv-badge-out{background:#FDF0F0;color:#9B4444}
        .inv-stock-num{font-weight:700;font-size:14px}
        .inv-stock-ok{color:#2D2D2D}
        .inv-stock-low{color:#C6A969}
        .inv-stock-out{color:#9B4444}
        .inv-update-btn{padding:6px 14px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:7px;font-size:12px;font-weight:500;color:#3F3F46;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;transition:all 0.2s}
        .inv-update-btn:hover{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .inv-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        .inv-date{font-size:11px;color:#D6D3D1}
        /* Modal */
        .inv-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.4);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .inv-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .inv-modal-header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid #EFE7DE}
        .inv-modal-header h3{font-size:16px;font-weight:700;color:#2D2D2D;margin:0}
        .inv-modal-close{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355;transition:all 0.2s}
        .inv-modal-close:hover{background:#EFE7DE;color:#2D2D2D}
        .inv-modal-body{padding:20px 24px 24px}
        .inv-modal-meta{background:#F8F5F2;border-radius:10px;padding:12px 14px;margin-bottom:18px;font-size:13px;color:#3F3F46}
        .inv-modal-meta span{color:#8B7355;font-size:12px}
        .inv-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
        .inv-field label{font-size:12px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:0.4px}
        .inv-field input{padding:11px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:14px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s;width:100%;box-sizing:border-box;font-weight:600}
        .inv-field input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .inv-modal-actions{display:flex;gap:10px;justify-content:flex-end}
        .inv-cancel-btn{padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .inv-cancel-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .inv-save-btn{padding:10px 24px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .inv-save-btn:hover{background:#C6A969;color:#2D2D2D}
        /* Toast */
        .inv-toast{position:fixed;top:20px;right:28px;background:#2D2D2D;color:#F8F5F2;padding:12px 18px;border-radius:10px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);animation:slideIn 0.25s ease}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .inv-adj-type{display:flex;gap:8px;margin-bottom:14px}
        .inv-adj-btn{flex:1;padding:10px;border:1.5px solid #EFE7DE;border-radius:9px;background:#F8F5F2;font-size:12px;font-weight:600;color:#3F3F46;cursor:pointer;font-family:inherit;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px}
        .inv-adj-btn:hover{border-color:#C6A969}
        .inv-adj-btn.active{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .inv-field textarea{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s;width:100%;box-sizing:border-box;resize:vertical;min-height:60px}
        .inv-field textarea:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .inv-history-btn{padding:6px 14px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:7px;font-size:12px;font-weight:500;color:#3F3F46;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;transition:all 0.2s}
        .inv-history-btn:hover{background:#DBEAFE;color:#2563eb;border-color:#93C5FD}
        .inv-history-list{max-height:300px;overflow-y:auto}
        .inv-history-item{padding:12px;border-bottom:1px solid #F8F5F2;display:flex;gap:10px}
        .inv-history-item:last-child{border-bottom:none}
        .inv-history-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .inv-history-icon.in{background:#DCFCE7;color:#16a34a}
        .inv-history-icon.out{background:#FEE2E2;color:#dc2626}
        .inv-history-icon.adj{background:#FEF9C3;color:#ca8a04}
        .inv-history-content{flex:1}
        .inv-history-title{font-size:13px;font-weight:600;color:#2D2D2D}
        .inv-history-meta{font-size:11px;color:#8B7355;margin-top:2px}
        .inv-history-qty{font-size:14px;font-weight:700;white-space:nowrap}
        .inv-history-qty.in{color:#16a34a}
        .inv-history-qty.out{color:#dc2626}
        .inv-history-qty.adj{color:#ca8a04}
      `}</style>

      {toast && <div className="inv-toast"><CheckCircle size={14} />{toast}</div>}

      {/* Update Stock Modal */}
      {modal && (
        <div className="inv-overlay" onClick={closeModal}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>Adjust Stock</h3>
              <button className="inv-modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-modal-meta">
                <div style={{fontWeight:600,marginBottom:4}}>{modal.name}</div>
                <span>SKU: {modal.sku} · Current: {modal.stock} {modal.unit} · Min: {modal.minStock} {modal.unit}</span>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="inv-adj-type">
                  <button type="button" className={`inv-adj-btn ${adjustmentType==='set'?'active':''}`} onClick={() => setAdjustmentType('set')}>
                    Set To
                  </button>
                  <button type="button" className={`inv-adj-btn ${adjustmentType==='add'?'active':''}`} onClick={() => setAdjustmentType('add')}>
                    <Plus size={14} /> Add
                  </button>
                  <button type="button" className={`inv-adj-btn ${adjustmentType==='subtract'?'active':''}`} onClick={() => setAdjustmentType('subtract')}>
                    <Minus size={14} /> Subtract
                  </button>
                </div>
                <div className="inv-field">
                  <label>{adjustmentType==='set' ? `Set Stock To (${modal.unit})` : `Quantity (${modal.unit})`}</label>
                  <input type="number" min="0" required value={qty} onChange={e => setQty(e.target.value)} placeholder={adjustmentType==='set' ? 'Enter new stock' : 'Enter quantity'} autoFocus />
                </div>
                <div className="inv-field">
                  <label>Reason</label>
                  <textarea placeholder="e.g. New purchase, Sold, Damaged, Expired..." value={reason} onChange={e => setReason(e.target.value)} />
                </div>
                {qty && (
                  <div style={{background:'#F8F5F2',border:'1px solid #EFE7DE',borderRadius:9,padding:'10px 14px',fontSize:12,color:'#3F3F46',marginBottom:4}}>
                    📦 New Stock: {modal.stock} → <strong style={{color:'#2D2D2D'}}>
                      {adjustmentType==='set' ? qty : adjustmentType==='add' ? modal.stock + parseInt(qty||0) : Math.max(0, modal.stock - parseInt(qty||0))}
                    </strong> {modal.unit}
                  </div>
                )}
                <div className="inv-modal-actions">
                  <button type="button" className="inv-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="inv-save-btn">Update Stock</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {historyModal && (
        <div className="inv-overlay" onClick={closeHistory}>
          <div className="inv-modal" onClick={e => e.stopPropagation()} style={{maxWidth:500}}>
            <div className="inv-modal-header">
              <h3>Stock History</h3>
              <button className="inv-modal-close" onClick={closeHistory}><X size={16} /></button>
            </div>
            <div className="inv-modal-body" style={{padding:'16px 20px'}}>
              <div className="inv-modal-meta" style={{marginBottom:16}}>
                <div style={{fontWeight:600,marginBottom:4}}>{historyModal.name}</div>
                <span>SKU: {historyModal.sku} · Current Stock: {historyModal.stock} {historyModal.unit}</span>
              </div>
              <div className="inv-history-list">
                {(historyModal.history || []).length === 0 ? (
                  <div style={{textAlign:'center',padding:'32px',color:'#D6D3D1',fontSize:13}}>No history available</div>
                ) : (
                  historyModal.history.map((h, i) => (
                    <div key={i} className="inv-history-item">
                      <div className={`inv-history-icon ${h.type}`}>
                        {h.type==='in' ? <Plus size={16} /> : h.type==='out' ? <Minus size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div className="inv-history-content">
                        <div className="inv-history-title">{h.reason}</div>
                        <div className="inv-history-meta">
                          {h.date} · by {h.by}
                          {h.oldStock !== undefined && ` · ${h.oldStock} → ${h.newStock} ${historyModal.unit}`}
                        </div>
                      </div>
                      <div className={`inv-history-qty ${h.type}`}>
                        {h.qty > 0 ? '+' : ''}{h.qty}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="inv-page">
        {/* KPI Cards */}
        <div className="inv-kpi-grid">
          <div className="inv-kpi">
            <div className="inv-kpi-icon blue"><Package size={18} /></div>
            <div><div className="inv-kpi-val">{totalItems}</div><div className="inv-kpi-label">Total Products</div></div>
          </div>
          <div className="inv-kpi">
            <div className="inv-kpi-icon ok"><TrendingUp size={18} /></div>
            <div><div className="inv-kpi-val">{healthyCount}</div><div className="inv-kpi-label">Healthy Stock</div></div>
          </div>
          <div className="inv-kpi">
            <div className="inv-kpi-icon warn"><AlertTriangle size={18} /></div>
            <div><div className="inv-kpi-val">{lowCount}</div><div className="inv-kpi-label">Low Stock</div></div>
          </div>
          <div className="inv-kpi">
            <div className="inv-kpi-icon danger"><TrendingDown size={18} /></div>
            <div><div className="inv-kpi-val">{outCount}</div><div className="inv-kpi-label">Out of Stock</div></div>
          </div>
        </div>

        {/* Topbar */}
        <div className="inv-topbar">
          <div className="inv-search-wrap">
            <Search size={15} className="inv-search-icon" />
            <input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="inv-filter-btns">
            <button className={`inv-filter-btn ${filter==='all'?'active':''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`inv-filter-btn warn ${filter==='low'?'active':''}`} onClick={() => setFilter('low')}>Low Stock {lowCount > 0 && `(${lowCount})`}</button>
            <button className={`inv-filter-btn danger ${filter==='out'?'active':''}`} onClick={() => setFilter('out')}>Out of Stock {outCount > 0 && `(${outCount})`}</button>
          </div>
        </div>

        {/* Table */}
        <div className="inv-card">
          <table className="inv-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="inv-empty">No items found.</td></tr>
              ) : (
                filtered.map(item => {
                  const s = getStatus(item.stock, item.minStock);
                  return (
                    <tr key={item.id}>
                      <td><span className="inv-sku">{item.sku}</span></td>
                      <td style={{fontWeight:500,color:'#2D2D2D'}}>{item.name}</td>
                      <td>{item.category}</td>
                      <td style={{fontSize:12,color:'#3F3F46'}}>{item.supplier || '—'}</td>
                      <td>
                        <span className={`inv-stock-num ${s==='out'?'inv-stock-out':s==='low'?'inv-stock-low':'inv-stock-ok'}`}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td style={{color:'#8B7355'}}>{item.minStock} {item.unit}</td>
                      <td>{statusBadge(item.stock, item.minStock)}</td>
                      <td><span className="inv-date">{item.lastUpdated}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="inv-update-btn" onClick={() => openUpdate(item)}>
                            <Pencil size={13} /> Adjust
                          </button>
                          <button className="inv-history-btn" onClick={() => openHistory(item)}>
                            <History size={13} /> History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
