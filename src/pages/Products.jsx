import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, CheckCircle } from 'lucide-react';

const MOCK_CATEGORIES = ['Electronics', 'Groceries', 'Clothing', 'Stationery', 'Beverages'];
const MOCK_PRODUCTS = [
  { id: 1, sku: 'SKU001', name: 'Wireless Mouse', category: 'Electronics', sellingPrice: 599, purchasePrice: 350, stock: 45, gstRate: 18 },
  { id: 2, sku: 'SKU002', name: 'Rice 5kg', category: 'Groceries', sellingPrice: 280, purchasePrice: 210, stock: 120, gstRate: 5 },
  { id: 3, sku: 'SKU003', name: 'Blue Pen Pack', category: 'Stationery', sellingPrice: 45, purchasePrice: 25, stock: 300, gstRate: 12 },
  { id: 4, sku: 'SKU004', name: 'Cotton T-Shirt', category: 'Clothing', sellingPrice: 399, purchasePrice: 200, stock: 80, gstRate: 5 },
  { id: 5, sku: 'SKU005', name: 'Mineral Water 1L', category: 'Beverages', sellingPrice: 20, purchasePrice: 10, stock: 500, gstRate: 0 },
];
const EMPTY_FORM = { sku: '', name: '', category: '', sellingPrice: '', purchasePrice: '', stock: '', gstRate: '' };

export default function Products() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 3000); };
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (categoryFilter ? p.category === categoryFilter : true);
  });
  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal('add'); };
  const openEdit = (p) => { setForm({ ...p, sellingPrice: String(p.sellingPrice), purchasePrice: String(p.purchasePrice), stock: String(p.stock), gstRate: String(p.gstRate) }); setEditId(p.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };
  const handleSave = (e) => {
    e.preventDefault();
    const product = { ...form, sellingPrice: parseFloat(form.sellingPrice), purchasePrice: parseFloat(form.purchasePrice), stock: parseInt(form.stock), gstRate: parseFloat(form.gstRate) };
    if (modal === 'add') { setProducts([...products, { ...product, id: Date.now() }]); showToast('Product added!'); }
    else { setProducts(products.map(p => p.id === editId ? { ...product, id: editId } : p)); showToast('Product updated!'); }
    closeModal();
  };
  const handleDelete = () => { setProducts(products.filter(p => p.id !== deleteId)); setDeleteId(null); showToast('Product deleted!'); };

  return (
    <>
      <style>{`
        .pr-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .pr-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .pr-search-wrap{position:relative;flex:1;min-width:200px}
        .pr-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .pr-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .pr-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .pr-select{padding:10px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;cursor:pointer}
        .pr-add-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .pr-add-btn:hover{background:#C6A969;color:#2D2D2D}
        .pr-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .pr-table{width:100%;border-collapse:collapse;font-size:13px}
        .pr-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .pr-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle}
        .pr-table tr:last-child td{border-bottom:none}
        .pr-table tr:hover td{background:#FDFCFB}
        .pr-sku{font-size:11px;color:#8B7355;background:#EFE7DE;padding:2px 8px;border-radius:20px;font-weight:600}
        .pr-cat-badge{font-size:11px;color:#3F3F46;background:#F8F5F2;border:1px solid #EFE7DE;padding:3px 10px;border-radius:20px}
        .pr-stock-low{color:#9B4444;font-weight:600}
        .pr-stock-ok{color:#3F3F46;font-weight:600}
        .pr-actions{display:flex;gap:8px}
        .pr-edit-btn{padding:6px 12px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:7px;font-size:12px;font-weight:500;color:#3F3F46;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;transition:all 0.2s}
        .pr-edit-btn:hover{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .pr-del-btn{padding:6px 12px;background:#FDF0F0;border:1.5px solid #F0D0D0;border-radius:7px;font-size:12px;font-weight:500;color:#9B4444;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;transition:all 0.2s}
        .pr-del-btn:hover{background:#9B4444;color:#FFFFFF;border-color:#9B4444}
        .pr-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        .pr-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.4);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .pr-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .pr-modal-header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid #EFE7DE}
        .pr-modal-header h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0}
        .pr-modal-close{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355}
        .pr-modal-body{padding:20px 24px 24px}
        .pr-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .pr-field{display:flex;flex-direction:column;gap:6px}
        .pr-field.full{grid-column:1/-1}
        .pr-field label{font-size:12px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:0.4px}
        .pr-field input,.pr-field select{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;width:100%;box-sizing:border-box}
        .pr-field input:focus,.pr-field select:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .pr-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
        .pr-cancel-btn{padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit}
        .pr-save-btn{padding:10px 24px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .pr-save-btn:hover{background:#C6A969;color:#2D2D2D}
        .pr-del-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:380px;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(45,45,45,0.2)}
        .pr-del-modal h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0 0 8px}
        .pr-del-modal p{font-size:14px;color:#8B7355;margin:0 0 24px}
        .pr-del-actions{display:flex;gap:10px;justify-content:center}
        .pr-del-confirm{padding:10px 24px;background:#9B4444;color:#FFFFFF;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
        .pr-toast{position:fixed;top:20px;right:28px;background:#2D2D2D;color:#F8F5F2;padding:12px 18px;border-radius:10px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);animation:slideIn 0.25s ease}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {toast && <div className="pr-toast"><CheckCircle size={14} />{toast.msg}</div>}

      {modal && (
        <div className="pr-overlay" onClick={closeModal}>
          <div className="pr-modal" onClick={e => e.stopPropagation()}>
            <div className="pr-modal-header">
              <h3>{modal === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
              <button className="pr-modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="pr-modal-body">
              <form onSubmit={handleSave}>
                <div className="pr-form-grid">
                  <div className="pr-field full"><label>Product Name</label><input placeholder="e.g. Wireless Mouse" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="pr-field"><label>SKU</label><input placeholder="SKU001" required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                  <div className="pr-field"><label>Category</label><select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select</option>{MOCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="pr-field"><label>Selling Price (₹)</label><input type="number" placeholder="0" required min="0" step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} /></div>
                  <div className="pr-field"><label>Purchase Price (₹)</label><input type="number" placeholder="0" required min="0" step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} /></div>
                  <div className="pr-field"><label>Stock</label><input type="number" placeholder="0" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                  <div className="pr-field"><label>GST Rate (%)</label><select value={form.gstRate} onChange={e => setForm({ ...form, gstRate: e.target.value })}><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option></select></div>
                </div>
                <div className="pr-modal-actions">
                  <button type="button" className="pr-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="pr-save-btn">{modal === 'add' ? 'Add Product' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="pr-overlay" onClick={() => setDeleteId(null)}>
          <div className="pr-del-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="pr-del-actions">
              <button className="pr-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="pr-del-confirm" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="pr-page">
        <div className="pr-topbar">
          <div className="pr-search-wrap">
            <Search size={15} className="pr-search-icon" />
            <input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="pr-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {MOCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="pr-add-btn" onClick={openAdd}><Plus size={15} /> Add Product</button>
        </div>
        <div className="pr-card">
          <table className="pr-table">
            <thead><tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Selling Price</th><th>Purchase Price</th><th>Stock</th><th>GST</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="pr-empty">No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="pr-sku">{p.sku}</span></td>
                  <td style={{fontWeight:500,color:'#2D2D2D'}}>{p.name}</td>
                  <td><span className="pr-cat-badge">{p.category}</span></td>
                  <td>₹{p.sellingPrice.toLocaleString()}</td>
                  <td>₹{p.purchasePrice.toLocaleString()}</td>
                  <td><span className={p.stock < 20 ? 'pr-stock-low' : 'pr-stock-ok'}>{p.stock} {p.stock < 20 ? '⚠' : ''}</span></td>
                  <td>{p.gstRate}%</td>
                  <td><div className="pr-actions"><button className="pr-edit-btn" onClick={() => openEdit(p)}><Pencil size={13} /> Edit</button><button className="pr-del-btn" onClick={() => setDeleteId(p.id)}><Trash2 size={13} /> Del</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
