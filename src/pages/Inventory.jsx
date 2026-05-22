import { useState } from 'react';
import { Search, Pencil, X, CheckCircle, AlertTriangle, Package, TrendingDown, TrendingUp, BarChart2 } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 1, sku: 'SKU001', name: 'Wireless Mouse',    category: 'Electronics', stock: 45,  minStock: 10, unit: 'pcs',  lastUpdated: '2025-05-20' },
  { id: 2, sku: 'SKU002', name: 'Rice 5kg',          category: 'Groceries',   stock: 8,   minStock: 20, unit: 'bags', lastUpdated: '2025-05-21' },
  { id: 3, sku: 'SKU003', name: 'Blue Pen Pack',     category: 'Stationery',  stock: 300, minStock: 50, unit: 'pcs',  lastUpdated: '2025-05-19' },
  { id: 4, sku: 'SKU004', name: 'Cotton T-Shirt',    category: 'Clothing',    stock: 5,   minStock: 15, unit: 'pcs',  lastUpdated: '2025-05-22' },
  { id: 5, sku: 'SKU005', name: 'Mineral Water 1L',  category: 'Beverages',   stock: 500, minStock: 100,unit: 'btls', lastUpdated: '2025-05-18' },
  { id: 6, sku: 'SKU006', name: 'Notebook A4',       category: 'Stationery',  stock: 12,  minStock: 30, unit: 'pcs',  lastUpdated: '2025-05-20' },
  { id: 7, sku: 'SKU007', name: 'USB-C Cable',       category: 'Electronics', stock: 0,   minStock: 10, unit: 'pcs',  lastUpdated: '2025-05-17' },
];

function getStatus(stock, minStock) {
  if (stock === 0) return 'out';
  if (stock < minStock) return 'low';
  return 'ok';
}

export default function Inventory() {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out
  const [modal, setModal] = useState(null); // item object
  const [qty, setQty] = useState('');
  const [toast, setToast] = useState(null);

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

  const openUpdate = (item) => { setModal(item); setQty(String(item.stock)); };
  const closeModal = () => { setModal(null); setQty(''); };

  const handleUpdate = (e) => {
    e.preventDefault();
    setInventory(inventory.map(i => i.id === modal.id
      ? { ...i, stock: parseInt(qty), lastUpdated: new Date().toISOString().split('T')[0] }
      : i
    ));
    showToast(`${modal.name} stock updated to ${qty}`);
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
      `}</style>

      {toast && <div className="inv-toast"><CheckCircle size={14} />{toast}</div>}

      {/* Update Stock Modal */}
      {modal && (
        <div className="inv-overlay" onClick={closeModal}>
          <div className="inv-modal" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>Update Stock</h3>
              <button className="inv-modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-modal-meta">
                <div style={{fontWeight:600,marginBottom:4}}>{modal.name}</div>
                <span>SKU: {modal.sku} · Min Stock: {modal.minStock} {modal.unit}</span>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="inv-field">
                  <label>Current Stock ({modal.unit})</label>
                  <input type="number" min="0" required value={qty} onChange={e => setQty(e.target.value)} autoFocus />
                </div>
                <div className="inv-modal-actions">
                  <button type="button" className="inv-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="inv-save-btn">Update Stock</button>
                </div>
              </form>
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
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="inv-empty">No items found.</td></tr>
              ) : (
                filtered.map(item => {
                  const s = getStatus(item.stock, item.minStock);
                  return (
                    <tr key={item.id}>
                      <td><span className="inv-sku">{item.sku}</span></td>
                      <td style={{fontWeight:500,color:'#2D2D2D'}}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`inv-stock-num ${s==='out'?'inv-stock-out':s==='low'?'inv-stock-low':'inv-stock-ok'}`}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td style={{color:'#8B7355'}}>{item.minStock} {item.unit}</td>
                      <td>{statusBadge(item.stock, item.minStock)}</td>
                      <td><span className="inv-date">{item.lastUpdated}</span></td>
                      <td>
                        <button className="inv-update-btn" onClick={() => openUpdate(item)}>
                          <Pencil size={13} /> Update
                        </button>
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
