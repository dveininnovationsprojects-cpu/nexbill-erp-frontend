import { useEffect, useState } from 'react';
import {
  Users, Clock, CheckCircle, X, Edit3, UserX, UserCheck,
  Search, ChevronDown, AlertCircle, IndianRupee, Building2,
  Monitor, Timer, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_APPROVE_FORM = { phone: '', branch: '', counterNumber: '', shiftTiming: '', basicSalary: '' };
const EMPTY_EDIT_FORM    = { counterNumber: '', shiftTiming: '', basicSalary: '', status: 'ACTIVE' };

export default function CashierManagement() {
  const { user } = useAuth();
  const headers  = { Authorization: `Bearer ${user.token}` };

  /* ── data ── */
  const [pending, setPending]   = useState([]);
  const [active,  setActive]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab,     setTab]       = useState('active'); // 'active' | 'pending'

  /* ── search ── */
  const [search, setSearch] = useState('');

  /* ── approve modal ── */
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveForm,   setApproveForm]   = useState(EMPTY_APPROVE_FORM);
  const [approving,     setApproving]     = useState(false);

  /* ── edit modal ── */
  const [editTarget, setEditTarget] = useState(null);
  const [editForm,   setEditForm]   = useState(EMPTY_EDIT_FORM);
  const [saving,     setSaving]     = useState(false);

  /* ── deactivate confirm ── */
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating,     setDeactivating]     = useState(false);

  /* ── toast ── */
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── fetch ── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes] = await Promise.allSettled([
        axios.get('/api/admin/all-cashiers', { headers, withCredentials: true }),
      ]);
      const all = allRes.status === 'fulfilled' ? allRes.value.data : [];
      setPending(all.filter(c => c.status === 'PENDING'));
      setActive(all.filter(c => c.status !== 'PENDING'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── approve ── */
  const handleApprove = async (e) => {
    e.preventDefault();
    setApproving(true);
    try {
      await axios.post(
        `/api/admin/approve-cashier/${approveTarget.email}`,
        { ...approveForm, basicSalary: parseFloat(approveForm.basicSalary) },
        { headers, withCredentials: true }
      );
      showToast(`${approveTarget.name || approveTarget.email} approved successfully!`);
      setApproveTarget(null);
      fetchAll();
    } catch { showToast('Approval failed. Try again.', 'error'); }
    finally   { setApproving(false); }
  };

  /* ── edit ── */
  const openEdit = (cashier) => {
    setEditTarget(cashier);
    setEditForm({
      counterNumber: cashier.counterNumber || '',
      shiftTiming:   cashier.shiftTiming   || '',
      basicSalary:   cashier.basicSalary   || '',
      status:        cashier.status        || 'ACTIVE',
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        counterNumber: editForm.counterNumber || null,
        shiftTiming:   editForm.shiftTiming   || null,
        basicSalary:   editForm.basicSalary   ? parseFloat(editForm.basicSalary) : null,
        status:        String(editForm.status),
      };
      await axios.put(
        `/api/profile/admin/staff/${editTarget.id}`,
        payload,
        { headers, withCredentials: true }
      );
      showToast(`${editTarget.name || editTarget.email} updated successfully!`);
      setEditTarget(null);
      fetchAll();
    } catch { showToast('Update failed. Try again.', 'error'); }
    finally   { setSaving(false); }
  };

  /* ── reactivate ── */
  const handleReactivate = async (cashier) => {
    try {
      await axios.put(
        `/api/admin/cashier/${cashier.id}/toggle-status?status=ACTIVE`,
        {},
        { headers, withCredentials: true }
      );
      showToast(`${cashier.name || cashier.email} re-activated successfully!`);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || 'Re-activation failed.';
      showToast(typeof msg === 'string' ? msg : 'Re-activation failed.', 'error');
    }
  };

  /* ── deactivate ── */
  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await axios.put(
        `/api/admin/cashier/${deactivateTarget.id}/toggle-status?status=SUSPENDED`,
        {},
        { headers, withCredentials: true }
      );
      showToast(`${deactivateTarget.name || deactivateTarget.email} deactivated.`, 'warn');
      setDeactivateTarget(null);
      fetchAll();
    } catch { showToast('Deactivation failed. Try again.', 'error'); }
    finally   { setDeactivating(false); }
  };

  /* ── filtered lists ── */
  const q = search.toLowerCase();
  const filteredActive  = active.filter(c =>
    (c.name  || '').toLowerCase().includes(q) ||
    (c.email || '').toLowerCase().includes(q) ||
    (c.branch || '').toLowerCase().includes(q)
  );
  const filteredPending = pending.filter(c =>
    (c.name  || '').toLowerCase().includes(q) ||
    (c.email || '').toLowerCase().includes(q)
  );

  const initials = (c) => (c.name || c.email || '?')[0].toUpperCase();

  /* ── status badge ── */
  const StatusBadge = ({ status }) => {
    const map = {
      ACTIVE:   { bg: '#D1FAE5', color: '#065F46', label: 'Active'   },
      SUSPENDED: { bg: '#FEE2E2', color: '#991B1B', label: 'Suspended' },
      PENDING:  { bg: '#FEF3C7', color: '#92400E', label: 'Pending'  },
    };
    const s = map[status] || map.PENDING;
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
        padding: '3px 10px', borderRadius: 20, letterSpacing: '0.3px' }}>
        {s.label}
      </span>
    );
  };

  return (
    <>
      <style>{`
        .cm-page { display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif; }

        /* Toast */
        .cm-toast { position:fixed;top:20px;right:28px;padding:12px 18px;border-radius:10px;font-size:13px;
          display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 16px rgba(45,45,45,0.2);
          animation:cmSlideIn 0.25s ease;font-family:inherit; }
        .cm-toast-success { background:#2D2D2D;color:#F8F5F2; }
        .cm-toast-error   { background:#7A3A3A;color:#F8F5F2; }
        .cm-toast-warn    { background:#7A5A1E;color:#F8F5F2; }
        @keyframes cmSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* Stats row */
        .cm-stats { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .cm-stat-card { background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;padding:18px 20px;
          display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(45,45,45,0.05); }
        .cm-stat-icon { width:42px;height:42px;border-radius:10px;display:flex;align-items:center;
          justify-content:center;flex-shrink:0; }
        .cm-stat-val  { font-size:26px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px; }
        .cm-stat-lbl  { font-size:13px;font-weight:500;color:#3F3F46; }

        /* Toolbar */
        .cm-toolbar { display:flex;align-items:center;gap:12px; }
        .cm-search-wrap { flex:1;position:relative; }
        .cm-search-wrap svg { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8B7355;pointer-events:none; }
        .cm-search { width:100%;padding:10px 12px 10px 38px;border:1.5px solid #EFE7DE;border-radius:10px;
          font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;box-sizing:border-box;transition:border-color 0.2s; }
        .cm-search:focus { border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFF; }
        .cm-refresh-btn { padding:10px 14px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:10px;
          color:#8B7355;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;
          font-weight:600;font-family:inherit;transition:all 0.2s; }
        .cm-refresh-btn:hover { background:#EFE7DE;color:#2D2D2D; }

        /* Tabs */
        .cm-tabs { display:flex;gap:4px;background:#F8F5F2;border:1px solid #EFE7DE;border-radius:12px;padding:4px; }
        .cm-tab { flex:1;padding:9px 16px;border:none;border-radius:9px;font-size:13px;font-weight:600;
          cursor:pointer;font-family:inherit;transition:all 0.2s;display:flex;align-items:center;
          justify-content:center;gap:6px;color:#8B7355;background:transparent; }
        .cm-tab.active { background:#2D2D2D;color:#F8F5F2;box-shadow:0 2px 8px rgba(45,45,45,0.15); }
        .cm-tab-badge { background:#C6A969;color:#2D2D2D;font-size:10px;font-weight:800;
          padding:1px 7px;border-radius:20px;min-width:18px;text-align:center; }
        .cm-tab.active .cm-tab-badge { background:#C6A969;color:#2D2D2D; }

        /* Card */
        .cm-card { background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;
          box-shadow:0 1px 4px rgba(45,45,45,0.05);overflow:hidden; }

        /* Table */
        .cm-table-wrap { overflow-x:auto; }
        .cm-table { width:100%;border-collapse:collapse;font-size:13px; }
        .cm-table th { text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;
          text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #EFE7DE;background:#FAFAF9; }
        .cm-table td { padding:14px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle; }
        .cm-table tr:last-child td { border-bottom:none; }
        .cm-table tr:hover td { background:#FAFAF9; }

        /* Avatar */
        .cm-avatar { width:36px;height:36px;background:#2D2D2D;color:#C6A969;border-radius:10px;
          display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0; }

        /* Action buttons */
        .cm-action-wrap { display:flex;gap:6px; }
        .cm-edit-btn { padding:6px 14px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:8px;
          font-size:12px;font-weight:600;color:#3F3F46;cursor:pointer;font-family:inherit;
          display:flex;align-items:center;gap:5px;transition:all 0.2s; }
        .cm-edit-btn:hover { background:#EFE7DE;color:#2D2D2D;border-color:#C6A969; }
        .cm-deact-btn { padding:6px 14px;background:#FEF2F2;border:1.5px solid #FECACA;border-radius:8px;
          font-size:12px;font-weight:600;color:#DC2626;cursor:pointer;font-family:inherit;
          display:flex;align-items:center;gap:5px;transition:all 0.2s; }
        .cm-deact-btn:hover { background:#FEE2E2;border-color:#FCA5A5; }
        .cm-approve-btn { padding:6px 16px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:8px;
          font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;
          display:flex;align-items:center;gap:5px;transition:background 0.2s; }
        .cm-approve-btn:hover { background:#C6A969;color:#2D2D2D; }

        /* Empty */
        .cm-empty { display:flex;flex-direction:column;align-items:center;gap:10px;
          padding:56px 0;color:#D6D3D1;font-size:13px; }
        .cm-empty svg { color:#EFE7DE; }

        /* Overlay + Modal */
        .cm-overlay { position:fixed;inset:0;background:rgba(45,45,45,0.45);backdrop-filter:blur(3px);
          z-index:200;display:flex;align-items:center;justify-content:center;padding:24px; }
        .cm-modal { background:#FFFFFF;border-radius:18px;width:100%;max-width:500px;
          box-shadow:0 24px 64px rgba(45,45,45,0.22);overflow:hidden; }
        .cm-modal-header { display:flex;align-items:flex-start;justify-content:space-between;
          padding:22px 24px 16px;border-bottom:1px solid #EFE7DE; }
        .cm-modal-header h3 { font-size:17px;font-weight:700;color:#2D2D2D;margin:0 0 3px; }
        .cm-modal-header p  { font-size:13px;color:#8B7355;margin:0; }
        .cm-modal-close { background:#F8F5F2;border:1px solid #EFE7DE;border-radius:8px;width:30px;height:30px;
          display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8B7355;flex-shrink:0; }
        .cm-modal-close:hover { background:#EFE7DE;color:#2D2D2D; }
        .cm-modal-body { padding:20px 24px 24px; }
        .cm-form-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px; }
        .cm-field { display:flex;flex-direction:column;gap:6px; }
        .cm-field.full { grid-column:1/-1; }
        .cm-field label { font-size:11px;font-weight:700;color:#3F3F46;text-transform:uppercase;letter-spacing:0.5px; }
        .cm-field input,.cm-field select { padding:10px 12px;border:1.5px solid #EFE7DE;border-radius:9px;
          font-size:13px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;
          width:100%;box-sizing:border-box;transition:border-color 0.2s; }
        .cm-field input:focus,.cm-field select:focus { border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFF; }
        .cm-modal-actions { display:flex;gap:10px;justify-content:flex-end; }
        .cm-cancel-btn { padding:10px 20px;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:9px;
          font-size:13px;font-weight:600;color:#8B7355;cursor:pointer;font-family:inherit; }
        .cm-cancel-btn:hover { background:#EFE7DE;color:#2D2D2D; }
        .cm-confirm-btn { padding:10px 22px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:9px;
          font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;
          display:flex;align-items:center;gap:6px;transition:background 0.2s; }
        .cm-confirm-btn:hover:not(:disabled) { background:#C6A969;color:#2D2D2D; }
        .cm-confirm-btn:disabled { opacity:0.6;cursor:not-allowed; }
        .cm-danger-btn { padding:10px 22px;background:#DC2626;color:#FFF;border:none;border-radius:9px;
          font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;
          display:flex;align-items:center;gap:6px;transition:background 0.2s; }
        .cm-danger-btn:hover:not(:disabled) { background:#B91C1C; }
        .cm-danger-btn:disabled { opacity:0.6;cursor:not-allowed; }

        /* Spinner */
        .cm-spinner { width:13px;height:13px;border:2px solid rgba(248,245,242,0.3);
          border-top-color:#F8F5F2;border-radius:50%;animation:cmSpin 0.7s linear infinite;display:inline-block; }
        @keyframes cmSpin { to{transform:rotate(360deg)} }

        /* Deactivate confirm box */
        .cm-deact-confirm { padding:16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;
          margin-bottom:20px;display:flex;gap:12px;align-items:flex-start; }
        .cm-deact-confirm p { font-size:13px;color:#7F1D1D;margin:0;line-height:1.5; }

        /* Pending item (card style for pending tab) */
        .cm-pending-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;padding:16px; }
        .cm-pending-card { background:#F8F5F2;border:1px solid #EFE7DE;border-radius:12px;
          padding:16px;display:flex;flex-direction:column;gap:12px; }
        .cm-pending-card-top { display:flex;align-items:center;gap:12px; }
        .cm-pending-name { font-size:14px;font-weight:600;color:#2D2D2D; }
        .cm-pending-email { font-size:12px;color:#8B7355;margin-top:1px; }
        .cm-pending-meta { font-size:12px;color:#6B7280; }
        .cm-pending-date { font-size:11px;color:#A8A29E;margin-top:2px; }

        @media (max-width: 768px) {
          .cm-stats { grid-template-columns:1fr 1fr; }
          .cm-form-grid { grid-template-columns:1fr; }
          .cm-field.full { grid-column:1; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`cm-toast cm-toast-${toast.type}`}>
          {toast.type === 'error' ? <X size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Approve Modal ── */}
      {approveTarget && (
        <div className="cm-overlay" onClick={() => setApproveTarget(null)}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className="cm-modal-header">
              <div>
                <h3>Approve Cashier</h3>
                <p>{approveTarget.name} · {approveTarget.email}</p>
              </div>
              <button className="cm-modal-close" onClick={() => setApproveTarget(null)}><X size={16} /></button>
            </div>
            <div className="cm-modal-body">
              <form onSubmit={handleApprove}>
                <div className="cm-form-grid">
                  <div className="cm-field">
                    <label>Phone</label>
                    <input placeholder="9876543210" required value={approveForm.phone}
                      onChange={e => setApproveForm({...approveForm, phone: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Branch</label>
                    <input placeholder="Main Branch" required value={approveForm.branch}
                      onChange={e => setApproveForm({...approveForm, branch: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Counter Number</label>
                    <input placeholder="Counter 1" required value={approveForm.counterNumber}
                      onChange={e => setApproveForm({...approveForm, counterNumber: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Shift Timing</label>
                    <input placeholder="9AM – 5PM" required value={approveForm.shiftTiming}
                      onChange={e => setApproveForm({...approveForm, shiftTiming: e.target.value})} />
                  </div>
                  <div className="cm-field full">
                    <label>Basic Salary (₹)</label>
                    <input type="number" min="0" placeholder="15000" required value={approveForm.basicSalary}
                      onChange={e => setApproveForm({...approveForm, basicSalary: e.target.value})} />
                  </div>
                </div>
                <div className="cm-modal-actions">
                  <button type="button" className="cm-cancel-btn" onClick={() => setApproveTarget(null)}>Cancel</button>
                  <button type="submit" className="cm-confirm-btn" disabled={approving}>
                    {approving ? <span className="cm-spinner" /> : <><CheckCircle size={14} /> Approve & Activate</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div className="cm-overlay" onClick={() => setEditTarget(null)}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className="cm-modal-header">
              <div>
                <h3>Edit Cashier Details</h3>
                <p>{editTarget.name} · {editTarget.email}</p>
              </div>
              <button className="cm-modal-close" onClick={() => setEditTarget(null)}><X size={16} /></button>
            </div>
            <div className="cm-modal-body">
              <form onSubmit={handleEdit}>
                <div className="cm-form-grid">
                  <div className="cm-field">
                    <label>Counter Number</label>
                    <input placeholder="Counter 1" required value={editForm.counterNumber}
                      onChange={e => setEditForm({...editForm, counterNumber: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Shift Timing</label>
                    <input placeholder="9AM – 5PM" required value={editForm.shiftTiming}
                      onChange={e => setEditForm({...editForm, shiftTiming: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Basic Salary (₹)</label>
                    <input type="number" min="0" placeholder="15000" required value={editForm.basicSalary}
                      onChange={e => setEditForm({...editForm, basicSalary: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Status</label>
                    <select value={editForm.status}
                      onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="cm-modal-actions">
                  <button type="button" className="cm-cancel-btn" onClick={() => setEditTarget(null)}>Cancel</button>
                  <button type="submit" className="cm-confirm-btn" disabled={saving}>
                    {saving ? <span className="cm-spinner" /> : <><CheckCircle size={14} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivate Confirm Modal ── */}
      {deactivateTarget && (
        <div className="cm-overlay" onClick={() => setDeactivateTarget(null)}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className="cm-modal-header">
              <div>
                <h3>Deactivate Cashier</h3>
                <p>{deactivateTarget.name} · {deactivateTarget.email}</p>
              </div>
              <button className="cm-modal-close" onClick={() => setDeactivateTarget(null)}><X size={16} /></button>
            </div>
            <div className="cm-modal-body">
              <div className="cm-deact-confirm">
                <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
                <p>
                  This will set <strong>{deactivateTarget.name || deactivateTarget.email}</strong>'s
                  status to <strong>Inactive</strong>. They will no longer be able to log in.
                  You can re-activate them at any time via Edit.
                </p>
              </div>
              <div className="cm-modal-actions">
                <button type="button" className="cm-cancel-btn" onClick={() => setDeactivateTarget(null)}>Cancel</button>
                <button className="cm-danger-btn" onClick={handleDeactivate} disabled={deactivating}>
                  {deactivating ? <span className="cm-spinner" style={{ borderTopColor: '#fff' }} /> : <><UserX size={14} /> Deactivate</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="cm-page">

        {/* ── Stats ── */}
        <div className="cm-stats">
          {[
            {
              label: 'Active Cashiers',
              value: loading ? '—' : active.filter(c => c.status === 'ACTIVE').length,
              icon: UserCheck,
              iconBg: '#D1FAE5', iconColor: '#065F46',
            },
            {
              label: 'Pending Approvals',
              value: loading ? '—' : pending.length,
              icon: Clock,
              iconBg: '#FEF3C7', iconColor: '#92400E',
            },
            {
              label: 'Inactive Cashiers',
              value: loading ? '—' : active.filter(c => c.status === 'SUSPENDED').length,
              icon: UserX,
              iconBg: '#FEE2E2', iconColor: '#991B1B',
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="cm-stat-card">
              <div className="cm-stat-icon" style={{ background: iconBg }}>
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <div>
                <div className="cm-stat-val">{value}</div>
                <div className="cm-stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="cm-toolbar">
          <div className="cm-search-wrap">
            <Search size={15} />
            <input
              className="cm-search"
              placeholder="Search by name, email or branch…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="cm-refresh-btn" onClick={fetchAll}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="cm-tabs">
          <button
            className={`cm-tab ${tab === 'active' ? 'active' : ''}`}
            onClick={() => setTab('active')}
          >
            <UserCheck size={15} />
            Active Cashiers
            <span className="cm-tab-badge">{active.length}</span>
          </button>
          <button
            className={`cm-tab ${tab === 'pending' ? 'active' : ''}`}
            onClick={() => setTab('pending')}
          >
            <Clock size={15} />
            Pending Approvals
            {pending.length > 0 && (
              <span className="cm-tab-badge">{pending.length}</span>
            )}
          </button>
        </div>

        {/* ── Active Cashiers Table ── */}
        {tab === 'active' && (
          <div className="cm-card">
            {loading ? (
              <div className="cm-empty"><RefreshCw size={32} /><p>Loading cashiers…</p></div>
            ) : filteredActive.length === 0 ? (
              <div className="cm-empty">
                <Users size={40} />
                <p>{search ? 'No cashiers match your search.' : 'No active cashiers yet.'}</p>
              </div>
            ) : (
              <div className="cm-table-wrap">
                <table className="cm-table">
                  <thead>
                    <tr>
                      <th>Cashier</th>
                      <th>Branch</th>
                      <th>Counter</th>
                      <th>Shift</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActive.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="cm-avatar">{initials(c)}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#2D2D2D', fontSize: 13 }}>{c.name || '—'}</div>
                              <div style={{ fontSize: 11, color: '#8B7355', marginTop: 1 }}>{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Building2 size={13} style={{ color: '#8B7355' }} />
                            {c.branch || '—'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Monitor size={13} style={{ color: '#8B7355' }} />
                            {c.counterNumber || '—'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Timer size={13} style={{ color: '#8B7355' }} />
                            {c.shiftTiming || '—'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#2D2D2D' }}>
                            <IndianRupee size={12} style={{ color: '#8B7355' }} />
                            {c.basicSalary ? Number(c.basicSalary).toLocaleString('en-IN') : '—'}
                          </div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <div className="cm-action-wrap">
                            <button className="cm-edit-btn" onClick={() => openEdit(c)}>
                              <Edit3 size={13} /> Edit
                            </button>
                            {c.status === 'ACTIVE' && (
                              <button className="cm-deact-btn" onClick={() => setDeactivateTarget(c)}>
                                <UserX size={13} /> Deactivate
                              </button>
                            )}
                            {c.status === 'SUSPENDED' && (
                              <button className="cm-edit-btn" onClick={() => handleReactivate(c)}
                                style={{ borderColor: '#BBF7D0', color: '#065F46', background: '#F0FDF4' }}>
                                <UserCheck size={13} /> Re-activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Pending Approvals ── */}
        {tab === 'pending' && (
          <div className="cm-card">
            {loading ? (
              <div className="cm-empty"><RefreshCw size={32} /><p>Loading…</p></div>
            ) : filteredPending.length === 0 ? (
              <div className="cm-empty">
                <CheckCircle size={40} />
                <p>{search ? 'No pending cashiers match your search.' : 'No pending approvals — you\'re all caught up!'}</p>
              </div>
            ) : (
              <div className="cm-pending-grid">
                {filteredPending.map(c => (
                  <div key={c.email} className="cm-pending-card">
                    <div className="cm-pending-card-top">
                      <div className="cm-avatar">{initials(c)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="cm-pending-name">{c.name || '—'}</div>
                        <div className="cm-pending-email">{c.email}</div>
                      </div>
                      <StatusBadge status="PENDING" />
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', paddingTop: 4, borderTop: '1px solid #EFE7DE' }}>
                      Registered and awaiting admin assignment of counter, shift &amp; salary before activation.
                    </div>
                    <button
                      className="cm-approve-btn"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => { setApproveTarget(c); setApproveForm(EMPTY_APPROVE_FORM); }}
                    >
                      <CheckCircle size={14} /> Approve &amp; Assign Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
