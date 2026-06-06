import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, CheckCircle, Package, TrendingUp, AlertTriangle, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';



const EMPTY_FORM = { sku: '', name: '', category: '', sellingPrice: '', purchasePrice: '', stock: '', minStock: '', gstRate: '0', barcode: '', supplier: '', expiryDate: '', description: '', imageUrl: '' };

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products/all');
      const prods = res.data || [];
      if (prods.length) {
        const invData = await Promise.allSettled(
          prods.map(p => api.get(`/api/inventory/product/${p.id}`))
        );
        const merged = prods.map((p, i) => ({
          ...p,
          stock: invData[i].status === 'fulfilled' ? parseFloat(invData[i].value.data.availableQuantity ?? 0) : 0,
          minStock: invData[i].status === 'fulfilled' ? parseFloat(invData[i].value.data.reorderLevel ?? 0) : 0,
        }));
        setProducts(merged);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setProducts([]);
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    api.get('/api/categories/all')
      .then(res => { 
        console.log('Categories:', res.data);
        if (res.data?.length) setCategories(res.data.map(c => ({ id: c.id, name: c.name }))); 
      })
      .catch(err => console.error('Categories fetch error:', err));
    api.get('/api/suppliers/active')
      .then(res => { 
        console.log('Suppliers:', res.data);
        if (res.data?.length) setSuppliersList(res.data.map(s => ({ id: s.id, name: s.companyName }))); 
      })
      .catch(err => console.error('Suppliers fetch error:', err));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? (p.category === categoryFilter || p.category?.name === categoryFilter) : true;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal('add'); };
  const openEdit = (p) => {
    setForm({
      sku: p.sku || '',
      name: p.name || '',
      category: p.category?.name || p.category || '',
      sellingPrice: String(p.sellingPrice || ''),
      purchasePrice: String(p.purchasePrice || ''),
      stock: String(p.stock || ''),
      minStock: String(p.minStock || ''),
      gstRate: String(p.gstPercentage || p.gstRate || '0'),
      barcode: p.barcode || '',
      supplier: p.supplier?.companyName || p.supplier || '',
      expiryDate: p.expiryDate || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
    });
    setEditId(p.id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault();
    console.log('Form data before save:', form);
    setSaving(true);
    // Find category object from categories list
    const categoryObj = categories.find(c => c.name === form.category);
    const supplierObj = suppliersList.find(s => s.name === form.supplier);
    const payload = {
      sku: form.sku,
      name: form.name,
      category: categoryObj ? { id: categoryObj.id } : { name: form.category },
      sellingPrice: parseFloat(form.sellingPrice),
      purchasePrice: parseFloat(form.purchasePrice),
      gstPercentage: parseFloat(form.gstRate) || 0,
      barcode: form.barcode || null,
      supplier: supplierObj ? { id: supplierObj.id } : null,
      expiryDate: form.expiryDate || null,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
    };
    console.log('Product payload:', JSON.stringify(payload, null, 2));
    try {
      if (modal === 'add') {
        const res = await api.post('/api/products/add', payload);
        // Stock inventory-la set pannanum
        if (form.stock && parseInt(form.stock) > 0) {
          await api.post(`/api/inventory/add/${res.data.id}`, null, { params: { quantity: parseInt(form.stock) } });
        }
        showToast('Product added successfully!');
        await fetchProducts();
      } else {
        const res = await api.put(`/api/products/update/${editId}`, payload);
        console.log('Product updated - Response:', res.data);
        showToast('Product updated successfully!');
        await fetchProducts();
      }
      closeModal();
    } catch (err) {
      console.error('Product save error:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);
      console.error('Error headers:', err?.response?.headers);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Unknown error';
      const status = err?.response?.status || '';
      showToast(`Failed (${status}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/products/delete/${deleteId}`);
      setProducts(prev => prev.filter(p => p.id !== deleteId));
      showToast('Product deleted!');
    } catch {
      showToast('Failed to delete.', 'error');
    }
    setDeleteId(null);
  };

  return (
    <>
      <style>{`
        .pr-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .pr-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .pr-kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .pr-kpi-icon.gold{background:#FDF8EE;color:#C6A969}
        .pr-kpi-icon.green{background:#F0F7F0;color:#5A7A5A}
        .pr-kpi-icon.red{background:#FDF0F0;color:#9B4444}
        .pr-kpi-icon.blue{background:#EFE7DE;color:#8B7355}
        .pr-kpi-val{font-size:22px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .pr-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .pr-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .pr-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .pr-search-wrap{position:relative;flex:1;min-width:200px}
        .pr-search-wrap input{width:100%;padding:10px 14px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;box-sizing:border-box}
        .pr-search-wrap input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .pr-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355}
        .pr-select{padding:10px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:13px;background:#FFFFFF;outline:none;font-family:inherit;color:#2D2D2D;cursor:pointer}
        .pr-select:focus{border-color:#C6A969}
        .pr-add-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;white-space:nowrap}
        .pr-add-btn:hover{background:#C6A969;color:#2D2D2D}
        .pr-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .pr-table-scroll{overflow-x:auto}
        .pr-table{width:100%;border-collapse:collapse;font-size:13px;min-width:1100px}
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
        /* Modal */
        .pr-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.4);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .pr-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .pr-modal-header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid #EFE7DE}
        .pr-modal-header h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0}
        .pr-modal-close{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355;transition:all 0.2s}
        .pr-modal-close:hover{background:#EFE7DE;color:#2D2D2D}
        .pr-modal-body{padding:20px 24px 24px}
        .pr-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .pr-field{display:flex;flex-direction:column;gap:6px}
        .pr-field.full{grid-column:1/-1}
        .pr-field label{font-size:12px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:0.4px}
        .pr-field input,.pr-field select{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s;width:100%;box-sizing:border-box}
        .pr-field input:focus,.pr-field select:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .pr-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
        .pr-cancel-btn{padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .pr-cancel-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .pr-save-btn{padding:10px 24px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .pr-save-btn:hover{background:#C6A969;color:#2D2D2D}
        /* Delete confirm */
        .pr-del-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:380px;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(45,45,45,0.2)}
        .pr-del-modal h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0 0 8px}
        .pr-del-modal p{font-size:14px;color:#8B7355;margin:0 0 24px}
        .pr-del-actions{display:flex;gap:10px;justify-content:center}
        .pr-del-confirm{padding:10px 24px;background:#9B4444;color:#FFFFFF;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .pr-del-confirm:hover{background:#7A3030}
        /* Toast */
        .pr-toast{position:fixed;top:20px;right:28px;background:#2D2D2D;color:#F8F5F2;padding:12px 18px;border-radius:10px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);animation:slideIn 0.25s ease}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .pr-skeleton{display:inline-block;height:12px;background:#EFE7DE;border-radius:4px;animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .pr-field textarea{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s;width:100%;box-sizing:border-box;resize:vertical;min-height:70px}
        .pr-field textarea:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .pr-modal-body{padding:20px 24px 24px;max-height:70vh;overflow-y:auto}
        .pr-section-label{font-size:10px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.7px;margin:16px 0 10px;display:flex;align-items:center;gap:6px}
        .pr-section-label::after{content:'';flex:1;height:1px;background:#EFE7DE}

        .pr-expiry-warn{color:#9B4444;font-weight:600}
        .pr-expiry-ok{color:#3F3F46}
        .pr-profit{font-size:11px;color:#5A7A5A;font-weight:600}
        .pr-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-top:1px solid #EFE7DE}
        .pr-page-info{font-size:12px;color:#8B7355}
        .pr-page-btns{display:flex;gap:5px}
        .pr-page-btn{min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#8B7355;transition:all 0.15s}
        .pr-page-btn:hover{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .pr-page-btn.active{background:#2D2D2D;color:#C6A969;border-color:#2D2D2D}
        .pr-page-btn:disabled{opacity:0.4;cursor:not-allowed}
      `}</style>

      {/* Toast */}
      {toast && <div className="pr-toast"><CheckCircle size={14} />{toast.msg}</div>}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="pr-overlay" onClick={closeModal}>
          <div className="pr-modal" onClick={e => e.stopPropagation()}>
            <div className="pr-modal-header">
              <h3>{modal === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
              <button className="pr-modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="pr-modal-body">
              <form onSubmit={handleSave}>

                <div className="pr-section-label">Basic Info</div>
                <div className="pr-form-grid">
                  <div className="pr-field full">
                    <label>Product Name *</label>
                    <input placeholder="e.g. Wireless Mouse" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>SKU *</label>
                    <input placeholder="SKU001" required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>Barcode</label>
                    <input placeholder="8901234567890" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>Category *</label>
                    <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="pr-field">
                    <label>Supplier</label>
                    <select value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}>
                      <option value="">Select supplier</option>
                      {suppliersList.length > 0 ? (
                        suppliersList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                      ) : (
                        <option disabled>No suppliers available</option>
                      )}
                    </select>
                  </div>
                  <div className="pr-field full">
                    <label>Description</label>
                    <textarea placeholder="Short product description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="pr-field full">
                    <label>Image URL</label>
                    <input placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                  </div>
                </div>

                <div className="pr-section-label">Pricing & Stock</div>
                <div className="pr-form-grid">
                  <div className="pr-field">
                    <label>Selling Price (₹) *</label>
                    <input type="number" placeholder="0.00" required min="0" step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>Purchase Price (₹) *</label>
                    <input type="number" placeholder="0.00" required min="0" step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>Stock Quantity *</label>
                    <input type="number" placeholder="0" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>Min Stock (Alert)</label>
                    <input type="number" placeholder="10" min="0" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
                  </div>
                  <div className="pr-field">
                    <label>GST Rate (%)</label>
                    <select value={form.gstRate} onChange={e => setForm({ ...form, gstRate: e.target.value })}>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                  <div className="pr-field">
                    <label>Expiry Date</label>
                    <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                  </div>
                </div>

                {form.sellingPrice && form.purchasePrice && (
                  <div style={{background:'#F0F7F0',border:'1px solid #C8DFC8',borderRadius:9,padding:'10px 14px',fontSize:12,color:'#5A7A5A',marginTop:4}}>
                    💰 Profit Margin: ₹{(parseFloat(form.sellingPrice||0) - parseFloat(form.purchasePrice||0)).toFixed(2)} &nbsp;|&nbsp;
                    {form.purchasePrice > 0 ? (((form.sellingPrice - form.purchasePrice) / form.purchasePrice) * 100).toFixed(1) : 0}%
                  </div>
                )}

                <div className="pr-modal-actions">
                  <button type="button" className="pr-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="pr-save-btn" disabled={saving}>{saving ? 'Saving...' : (modal === 'add' ? 'Add Product' : 'Save Changes')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
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
        {/* KPI Cards */}
        {(() => {
          const totalValue = products.reduce((s, p) => s + (p.sellingPrice || 0) * (p.stock || 0), 0);
          const lowStock   = products.filter(p => p.stock <= (p.minStock || 0) && p.stock > 0).length;
          const outStock   = products.filter(p => p.stock === 0).length;
          const cats = categories.length;
          return (
            <div className="pr-kpi-grid">
              <div className="pr-kpi">
                <div className="pr-kpi-icon gold"><Package size={18} /></div>
                <div><div className="pr-kpi-val">{products.length}</div><div className="pr-kpi-label">Total Products</div></div>
              </div>
              <div className="pr-kpi">
                <div className="pr-kpi-icon green"><TrendingUp size={18} /></div>
                <div><div className="pr-kpi-val">₹{totalValue.toLocaleString()}</div><div className="pr-kpi-label">Inventory Value</div></div>
              </div>
              <div className="pr-kpi">
                <div className="pr-kpi-icon red"><AlertTriangle size={18} /></div>
                <div><div className="pr-kpi-val">{lowStock + outStock}</div><div className="pr-kpi-label">Low / Out of Stock</div></div>
              </div>
              <div className="pr-kpi">
                <div className="pr-kpi-icon blue"><Tag size={18} /></div>
                <div><div className="pr-kpi-val">{cats}</div><div className="pr-kpi-label">Categories</div></div>
              </div>
            </div>
          );
        })()}
        {/* Top Bar */}
        <div className="pr-topbar">
          <div className="pr-search-wrap">
            <Search size={15} className="pr-search-icon" />
            <input placeholder="Search by name or SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="pr-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button className="pr-add-btn" onClick={openAdd}><Plus size={15} /> Add Product</button>
        </div>

        {/* Table */}
        <div className="pr-card">
          <div className="pr-table-scroll">
          <table className="pr-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Selling Price</th>
                <th>Purchase Price</th>
                <th>Profit</th>
                <th>Stock</th>
                <th>GST</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(11)].map((_, j) => <td key={j}><span className="pr-skeleton" style={{width:j===1?120:70}} /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="pr-empty">No products found.</td></tr>
              ) : (
                paginated.map(p => {
                  const profit = (p.sellingPrice || 0) - (p.purchasePrice || 0);
                  const isLowStock = p.stock <= (p.minStock || 20);
                  const isExpired = p.expiryDate && new Date(p.expiryDate) < new Date();
                  const isExpiringSoon = p.expiryDate && !isExpired && new Date(p.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return (
                  <tr key={p.id}>
                    <td><span className="pr-sku">{p.sku}</span></td>
                    <td>
                      <div style={{fontWeight:500,color:'#2D2D2D'}}>{p.name}</div>
                      {p.description && <div style={{fontSize:11,color:'#8B7355',marginTop:2}}>{p.description.slice(0,40)}{p.description.length>40?'...':''}</div>}
                      {p.barcode && <div style={{fontSize:10,color:'#D6D3D1',marginTop:1}}>#{p.barcode}</div>}
                    </td>
                    <td><span className="pr-cat-badge">{p.category?.name || p.category}</span></td>
                    <td>{p.supplier ? <span style={{fontSize:12,color:'#5A7A5A',fontWeight:500}}>{p.supplier?.companyName || p.supplier}</span> : <span style={{color:'#D6D3D1'}}>—</span>}</td>
                    <td>₹{(p.sellingPrice || 0).toLocaleString()}</td>
                    <td>₹{(p.purchasePrice || 0).toLocaleString()}</td>
                    <td><span className="pr-profit">₹{profit.toLocaleString()}</span></td>
                    <td><span className={isLowStock ? 'pr-stock-low' : 'pr-stock-ok'}>{p.stock || 0} {isLowStock ? '⚠' : ''}</span></td>
                    <td>{p.gstPercentage || p.gstRate || 0}%</td>
                    <td>
                      {p.expiryDate
                        ? <span className={isExpired ? 'pr-expiry-warn' : isExpiringSoon ? 'pr-expiry-warn' : 'pr-expiry-ok'}>
                            {p.expiryDate} {isExpired ? '❌' : isExpiringSoon ? '⚠' : ''}
                          </span>
                        : <span style={{color:'#D6D3D1'}}>—</span>
                      }
                    </td>
                    <td>
                      <div className="pr-actions">
                        <button className="pr-edit-btn" onClick={() => openEdit(p)}><Pencil size={13} /> Edit</button>
                        <button className="pr-del-btn" onClick={() => setDeleteId(p.id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pr-pagination">
              <span className="pr-page-info">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} products</span>
              <div className="pr-page-btns">
                <button className="pr-page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} className={`pr-page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
                ))}
                <button className="pr-page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </div>

        {/* OLD Pagination removed */}
      </div>
    </>
  );
}
