import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, CheckCircle, Tag } from 'lucide-react';
import api from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/all');
      setCategories(res.data || []);
    } catch { setCategories([]); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { setForm({ name: '', description: '' }); setEditId(null); setModal('add'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditId(c.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm({ name: '', description: '' }); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        const res = await api.post('/api/categories/add', form);
        setCategories(prev => [...prev, res.data]);
        showToast('Category added!');
      } else {
        const res = await api.put(`/api/categories/update/${editId}`, form);
        setCategories(prev => prev.map(c => c.id === editId ? res.data : c));
        showToast('Category updated!');
      }
      closeModal();
    } catch {
      showToast('Failed to save. Check backend.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/categories/delete/${deleteId}`);
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      showToast('Category deleted!');
    } catch {
      showToast('Failed to delete.', 'error');
    }
    setDeleteId(null);
  };

  return (
    <>
      <style>{`
        .cat-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}
        .cat-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .cat-title{font-size:14px;font-weight:600;color:#2D2D2D}
        .cat-add-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s}
        .cat-add-btn:hover{background:#C6A969;color:#2D2D2D}
        .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
        .cat-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05);transition:box-shadow 0.2s}
        .cat-card:hover{box-shadow:0 4px 12px rgba(45,45,45,0.1)}
        .cat-icon{width:42px;height:42px;border-radius:10px;background:#FDF8EE;color:#C6A969;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .cat-info{flex:1;min-width:0}
        .cat-name{font-size:14px;font-weight:700;color:#2D2D2D;margin-bottom:3px}
        .cat-desc{font-size:12px;color:#8B7355;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .cat-actions{display:flex;gap:6px;flex-shrink:0}
        .cat-edit-btn{padding:6px 10px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:7px;font-size:12px;color:#3F3F46;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s}
        .cat-edit-btn:hover{background:#2D2D2D;color:#F8F5F2;border-color:#2D2D2D}
        .cat-del-btn{padding:6px 10px;background:#FDF0F0;border:1.5px solid #F0D0D0;border-radius:7px;font-size:12px;color:#9B4444;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s}
        .cat-del-btn:hover{background:#9B4444;color:#FFFFFF;border-color:#9B4444}
        .cat-empty{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:48px;text-align:center;color:#D6D3D1;font-size:14px}
        .cat-overlay{position:fixed;inset:0;background:rgba(45,45,45,0.4);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .cat-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(45,45,45,0.2);overflow:hidden}
        .cat-modal-header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid #EFE7DE}
        .cat-modal-header h3{font-size:16px;font-weight:700;color:#2D2D2D;margin:0}
        .cat-modal-close{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355}
        .cat-modal-close:hover{background:#EFE7DE;color:#2D2D2D}
        .cat-modal-body{padding:20px 24px 24px;display:flex;flex-direction:column;gap:14px}
        .cat-field{display:flex;flex-direction:column;gap:6px}
        .cat-field label{font-size:12px;font-weight:600;color:#3F3F46;text-transform:uppercase;letter-spacing:0.4px}
        .cat-field input,.cat-field textarea{padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;width:100%;box-sizing:border-box}
        .cat-field input:focus,.cat-field textarea:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .cat-field textarea{resize:vertical;min-height:70px}
        .cat-modal-actions{display:flex;gap:10px;justify-content:flex-end}
        .cat-cancel-btn{padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit}
        .cat-cancel-btn:hover{background:#EFE7DE;color:#2D2D2D}
        .cat-save-btn{padding:10px 24px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
        .cat-save-btn:hover{background:#C6A969;color:#2D2D2D}
        .cat-del-modal{background:#FFFFFF;border-radius:18px;width:100%;max-width:360px;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(45,45,45,0.2)}
        .cat-del-modal h3{font-size:17px;font-weight:700;color:#2D2D2D;margin:0 0 8px}
        .cat-del-modal p{font-size:14px;color:#8B7355;margin:0 0 24px}
        .cat-del-actions{display:flex;gap:10px;justify-content:center}
        .cat-del-confirm{padding:10px 24px;background:#9B4444;color:#FFFFFF;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
        .cat-del-confirm:hover{background:#7A3030}
        .cat-toast{position:fixed;top:20px;right:28px;background:#2D2D2D;color:#F8F5F2;padding:12px 18px;border-radius:10px;font-size:13px;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);animation:catSlide 0.25s ease}
        .cat-toast.error{background:#7A3A3A}
        @keyframes catSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .cat-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .cat-kpi-icon{width:40px;height:40px;border-radius:10px;background:#FDF8EE;color:#C6A969;display:flex;align-items:center;justify-content:center}
        .cat-kpi-val{font-size:22px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .cat-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
      `}</style>

      {toast && <div className={`cat-toast ${toast.type === 'error' ? 'error' : ''}`}><CheckCircle size={14} />{toast.msg}</div>}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="cat-overlay" onClick={closeModal}>
          <div className="cat-modal" onClick={e => e.stopPropagation()}>
            <div className="cat-modal-header">
              <h3>{modal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
              <button className="cat-modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="cat-modal-body">
              <div className="cat-field">
                <label>Category Name *</label>
                <input placeholder="e.g. Electronics" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="cat-field">
                <label>Description</label>
                <textarea placeholder="Short description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="cat-modal-actions">
                <button type="button" className="cat-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="cat-save-btn" disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Add Category' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="cat-overlay" onClick={() => setDeleteId(null)}>
          <div className="cat-del-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Category?</h3>
            <p>This action cannot be undone.</p>
            <div className="cat-del-actions">
              <button className="cat-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="cat-del-confirm" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="cat-page">
        <div className="cat-kpi">
          <div className="cat-kpi-icon"><Tag size={18} /></div>
          <div><div className="cat-kpi-val">{categories.length}</div><div className="cat-kpi-label">Total Categories</div></div>
        </div>

        <div className="cat-topbar">
          <span className="cat-title">All Categories</span>
          <button className="cat-add-btn" onClick={openAdd}><Plus size={15} /> Add Category</button>
        </div>

        {categories.length === 0 ? (
          <div className="cat-empty">No categories yet. Click "Add Category" to create one.</div>
        ) : (
          <div className="cat-grid">
            {categories.map(c => (
              <div key={c.id} className="cat-card">
                <div className="cat-icon"><Tag size={18} /></div>
                <div className="cat-info">
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-desc">{c.description || 'No description'}</div>
                </div>
                <div className="cat-actions">
                  <button className="cat-edit-btn" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                  <button className="cat-del-btn" onClick={() => setDeleteId(c.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
