// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Settings Module                                     ║
// ║   Includes: Business Profile, Invoice Settings, Tax & GST,         ║
// ║             Notifications, Security, System Preferences             ║
// ║   All CSS, all components, all logic — ONE FILE                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState } from 'react';
import {
  Building2, FileText, Percent, Bell, Shield, Settings2,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, X,
  User, Phone, Mail, MapPin, Globe, Hash, Camera,
  CreditCard, Calendar, Clock, ToggleLeft, ToggleRight,
  ChevronRight, Lock, Smartphone, RefreshCw, Upload,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  .st-shell { display:flex; gap:24px; font-family:'Inter',system-ui,sans-serif; min-height:calc(100vh - 88px - 56px); }

  /* ── Sidebar ── */
  .st-sidebar { width:220px; flex-shrink:0; display:flex; flex-direction:column; gap:4px; }
  .st-sidebar-label { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; padding:0 10px; margin-bottom:4px; margin-top:8px; }
  .st-sidebar-label:first-child { margin-top:0; }
  .st-tab { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all 0.15s; color:#9E9087; font-size:13px; font-weight:500; border:none; background:none; font-family:inherit; width:100%; text-align:left; }
  .st-tab:hover { background:rgba(198,169,105,0.08); color:#EFE7DE; }
  .st-tab.active { background:rgba(198,169,105,0.15); color:#C6A969; }
  .st-tab svg { flex-shrink:0; }

  /* ── Content ── */
  .st-content { flex:1; min-width:0; display:flex; flex-direction:column; gap:20px; }

  /* ── Card ── */
  .st-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .st-card-head { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #EFE7DE; }
  .st-card-title { font-size:14px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; }
  .st-card-sub { font-size:12px; color:#8B7355; margin-top:3px; }
  .st-card-body { padding:20px 22px; }

  /* ── Form fields ── */
  .st-field { display:flex; flex-direction:column; gap:5px; margin-bottom:16px; }
  .st-field label { font-size:10.5px; font-weight:700; color:#3F3F46; text-transform:uppercase; letter-spacing:0.5px; }
  .st-field input, .st-field select, .st-field textarea {
    padding:9px 12px; border:1.5px solid #EFE7DE; border-radius:9px;
    font-size:13px; color:#2D2D2D; background:#F8F5F2; outline:none;
    font-family:inherit; transition:border-color 0.2s, box-shadow 0.2s; width:100%;
  }
  .st-field input:focus, .st-field select:focus, .st-field textarea:focus {
    border-color:#C6A969; box-shadow:0 0 0 3px rgba(198,169,105,0.12); background:#FFFFFF;
  }
  .st-field textarea { resize:vertical; min-height:80px; }
  .st-field-hint { font-size:11px; color:#8B7355; margin-top:3px; }
  .st-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .st-grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }

  /* Input with icon */
  .st-input-wrap { position:relative; }
  .st-input-wrap input { padding-left:36px; }
  .st-input-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#8B7355; pointer-events:none; }
  .st-input-wrap .st-eye-btn { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#8B7355; padding:2px; display:flex; align-items:center; }
  .st-input-wrap .st-eye-btn:hover { color:#2D2D2D; }

  /* ── Divider ── */
  .st-divider { border:none; border-top:1px solid #EFE7DE; margin:16px 0; }

  /* ── Section label ── */
  .st-section-lbl { font-size:11px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.7px; margin:20px 0 14px; display:flex; align-items:center; gap:6px; }
  .st-section-lbl::after { content:''; flex:1; height:1px; background:#EFE7DE; }

  /* ── Avatar / Logo ── */
  .st-avatar-wrap { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
  .st-avatar-logo { width:72px; height:72px; background:#2D2D2D; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:30px; font-weight:900; color:#C6A969; flex-shrink:0; }
  .st-avatar-info { flex:1; }
  .st-avatar-name { font-size:16px; font-weight:700; color:#2D2D2D; }
  .st-avatar-sub  { font-size:12px; color:#8B7355; margin-top:3px; }
  .st-avatar-upload { display:flex; align-items:center; gap:6px; padding:7px 14px; background:#F8F5F2; border:1.5px dashed #C6A969; border-radius:9px; font-size:12px; font-weight:600; color:#8B7355; cursor:pointer; font-family:inherit; transition:all 0.2s; margin-top:8px; }
  .st-avatar-upload:hover { background:#EFE7DE; color:#2D2D2D; }

  /* ── Toggle switch ── */
  .st-toggle-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:14px 0; border-bottom:1px solid #F8F5F2; }
  .st-toggle-row:last-child { border-bottom:none; padding-bottom:0; }
  .st-toggle-info { flex:1; }
  .st-toggle-label { font-size:13px; font-weight:600; color:#2D2D2D; }
  .st-toggle-desc  { font-size:12px; color:#8B7355; margin-top:3px; }
  .st-toggle-btn { background:none; border:none; cursor:pointer; padding:2px; display:flex; align-items:center; flex-shrink:0; }
  .st-toggle-on  { color:#C6A969; }
  .st-toggle-off { color:#D6D3D1; }

  /* ── GST rate card ── */
  .st-gst-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
  .st-gst-chip { background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:10px; padding:14px; text-align:center; cursor:pointer; transition:all 0.2s; }
  .st-gst-chip:hover   { border-color:#C6A969; background:#FBF8F4; }
  .st-gst-chip.selected { border-color:#C6A969; background:#EFE7DE; }
  .st-gst-rate { font-size:20px; font-weight:800; color:#2D2D2D; }
  .st-gst-name { font-size:11px; color:#8B7355; margin-top:3px; }

  /* ── Security item ── */
  .st-security-item { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #F8F5F2; gap:16px; }
  .st-security-item:last-child { border-bottom:none; padding-bottom:0; }
  .st-sec-icon { width:38px; height:38px; background:#EFE7DE; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#8B7355; flex-shrink:0; }
  .st-sec-info { flex:1; }
  .st-sec-label { font-size:13px; font-weight:600; color:#2D2D2D; }
  .st-sec-desc  { font-size:12px; color:#8B7355; margin-top:2px; }
  .st-sec-action { padding:7px 16px; background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:8px; font-size:12px; font-weight:600; color:#8B7355; cursor:pointer; font-family:inherit; transition:all 0.2s; white-space:nowrap; }
  .st-sec-action:hover { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }

  /* ── Buttons ── */
  .st-btn-primary { display:flex; align-items:center; gap:6px; padding:0 20px; height:38px; background:#2D2D2D; color:#F8F5F2; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s,color 0.2s; }
  .st-btn-primary:hover { background:#C6A969; color:#2D2D2D; }
  .st-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .st-btn-secondary { display:flex; align-items:center; gap:6px; padding:0 20px; height:38px; background:#F8F5F2; color:#8B7355; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
  .st-btn-secondary:hover { background:#EFE7DE; color:#2D2D2D; }
  .st-btn-danger { display:flex; align-items:center; gap:6px; padding:0 20px; height:38px; background:#FEE2E2; color:#dc2626; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
  .st-btn-danger:hover { background:#dc2626; color:#FFFFFF; }
  .st-card-foot { display:flex; gap:10px; justify-content:flex-end; padding:14px 22px; border-top:1px solid #EFE7DE; background:#FDFCFB; }

  /* ── Preview invoice sample ── */
  .st-inv-preview { background:#F8F5F2; border-radius:10px; padding:20px; border:1px solid #EFE7DE; }
  .st-inv-prev-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #EFE7DE; }
  .st-inv-prev-logo { width:36px; height:36px; background:#2D2D2D; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; color:#C6A969; }
  .st-inv-prev-title { font-size:18px; font-weight:800; color:#2D2D2D; }
  .st-inv-prev-meta { font-size:10px; color:#8B7355; margin-top:2px; text-align:right; }

  /* ── Toast ── */
  .st-toast { position:fixed; top:20px; right:28px; background:#2D2D2D; color:#F8F5F2; padding:12px 18px; border-radius:10px; font-size:13px; display:flex; align-items:center; gap:8px; z-index:999; box-shadow:0 4px 16px rgba(45,45,45,0.2); animation:stSlideIn 0.25s ease; }
  .st-toast-err { background:#7A3A3A; }
  @keyframes stSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .st-spinner { width:14px; height:14px; border:2px solid rgba(248,245,242,0.3); border-top-color:#F8F5F2; border-radius:50%; animation:stSpin 0.7s linear infinite; display:inline-block; }
  @keyframes stSpin { to{transform:rotate(360deg)} }

  /* ── Password change form ── */
  .st-pw-form { display:flex; flex-direction:column; gap:14px; }

  /* ── Plan / Quota bar ── */
  .st-quota-bar-wrap { background:#F8F5F2; border-radius:8px; padding:14px; margin-bottom:16px; }
  .st-quota-label { display:flex; justify-content:space-between; font-size:12px; color:#3F3F46; margin-bottom:8px; }
  .st-quota-bar { height:8px; background:#EFE7DE; border-radius:4px; overflow:hidden; }
  .st-quota-fill { height:100%; background:#C6A969; border-radius:4px; transition:width 0.4s ease; }

  /* ── Color picker ── */
  .st-color-chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
  .st-color-chip { width:28px; height:28px; border-radius:8px; cursor:pointer; border:2px solid transparent; transition:transform 0.15s,border-color 0.15s; }
  .st-color-chip:hover { transform:scale(1.15); }
  .st-color-chip.selected { border-color:#2D2D2D; transform:scale(1.1); }
`;

/* ══════════════════════════════════════════════════════════════════════
   TAB DEFINITIONS
══════════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'profile',       label: 'Business Profile',    icon: Building2  },
  { id: 'invoice',       label: 'Invoice Settings',    icon: FileText   },
  { id: 'tax',           label: 'Tax & GST',           icon: Percent    },
  { id: 'notifications', label: 'Notifications',       icon: Bell       },
  { id: 'security',      label: 'Security',            icon: Shield     },
  { id: 'system',        label: 'System',              icon: Settings2  },
];

/* ══════════════════════════════════════════════════════════════════════
   TOGGLE COMPONENT
══════════════════════════════════════════════════════════════════════ */
function Toggle({ on, onChange }) {
  return (
    <button className={`st-toggle-btn ${on ? 'st-toggle-on' : 'st-toggle-off'}`} onClick={() => onChange(!on)}>
      {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BUSINESS PROFILE TAB
══════════════════════════════════════════════════════════════════════ */
function ProfileTab({ onSave }) {
  const [form, setForm] = useState({
    companyName: 'NexBill ERP',
    tagline: 'Smart Billing & Inventory Management',
    email: 'billing@nexbill.in',
    phone: '+91 9876 543 210',
    website: 'www.nexbill.in',
    address: '45 Tech Park, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    gstNo: '29AABCN1234M1Z5',
    pan: 'AABCN1234M',
    cin: 'U72300KA2024PTC123456',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="st-card">
      <div className="st-card-head">
        <div>
          <div className="st-card-title"><Building2 size={15} /> Business Profile</div>
          <div className="st-card-sub">Your company information used on invoices and communications</div>
        </div>
      </div>
      <div className="st-card-body">
        {/* Logo */}
        <div className="st-avatar-wrap">
          <div className="st-avatar-logo">N</div>
          <div className="st-avatar-info">
            <div className="st-avatar-name">{form.companyName}</div>
            <div className="st-avatar-sub">{form.tagline}</div>
            <button className="st-avatar-upload"><Upload size={12} /> Upload Logo</button>
          </div>
        </div>

        <div className="st-section-lbl"><Building2 size={11} /> Company Details</div>
        <div className="st-grid2">
          <div className="st-field">
            <label>Company Name *</label>
            <div className="st-input-wrap">
              <Building2 size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 32 }} value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Your Company Name" />
            </div>
          </div>
          <div className="st-field">
            <label>Tagline</label>
            <input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Smart Billing & Inventory" />
          </div>
        </div>
        <div className="st-grid2">
          <div className="st-field">
            <label>Business Email *</label>
            <div className="st-input-wrap">
              <Mail size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 32 }} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="st-field">
            <label>Phone *</label>
            <div className="st-input-wrap">
              <Phone size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 32 }} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="st-grid2">
          <div className="st-field">
            <label>Website</label>
            <div className="st-input-wrap">
              <Globe size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 32 }} value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
          </div>
          <div className="st-field">
            <label>Street Address</label>
            <div className="st-input-wrap">
              <MapPin size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 32 }} value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="st-grid3">
          <div className="st-field"><label>City</label><input value={form.city} onChange={e => set('city', e.target.value)} /></div>
          <div className="st-field"><label>State</label><input value={form.state} onChange={e => set('state', e.target.value)} /></div>
          <div className="st-field"><label>PIN Code</label><input value={form.pincode} onChange={e => set('pincode', e.target.value)} /></div>
        </div>

        <div className="st-section-lbl"><Hash size={11} /> Tax Registration</div>
        <div className="st-grid3">
          <div className="st-field">
            <label>GSTIN</label>
            <input value={form.gstNo} onChange={e => set('gstNo', e.target.value)} placeholder="29AABCN1234M1Z5" />
          </div>
          <div className="st-field">
            <label>PAN Number</label>
            <input value={form.pan} onChange={e => set('pan', e.target.value)} placeholder="AABCN1234M" />
          </div>
          <div className="st-field">
            <label>CIN (optional)</label>
            <input value={form.cin} onChange={e => set('cin', e.target.value)} placeholder="U72300KA..." />
          </div>
        </div>
      </div>
      <div className="st-card-foot">
        <button className="st-btn-secondary">Discard</button>
        <button className="st-btn-primary" onClick={onSave}><Save size={14} /> Save Profile</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   INVOICE SETTINGS TAB
══════════════════════════════════════════════════════════════════════ */
function InvoiceSettingsTab({ onSave }) {
  const [form, setForm] = useState({
    prefix: 'INV-',
    startingNumber: '1001',
    dueDays: '7',
    currency: 'INR',
    dateFormat: 'DD MMM YYYY',
    paymentTerms: 'Payment is due within 7 days of invoice date. Late payments attract 2% monthly interest per month.',
    footerNote: 'Thank you for your business! For queries, contact billing@nexbill.in',
    showLogo: true,
    showGST: true,
    showSignature: true,
    showQR: false,
    showBankDetails: true,
    showTerms: true,
  });
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog  = (k)    => setForm(f => ({ ...f, [k]: !f[k] }));

  const TOGGLES = [
    { key: 'showLogo',        label: 'Company Logo',    desc: 'Display your logo on invoice header' },
    { key: 'showGST',         label: 'GST Details',     desc: 'Show GST number and breakdown' },
    { key: 'showSignature',   label: 'Signature Area',  desc: 'Include authorized signatory section' },
    { key: 'showQR',          label: 'QR Code',         desc: 'Add payment QR code to invoice' },
    { key: 'showBankDetails', label: 'Bank Details',    desc: 'Display account details for bank transfers' },
    { key: 'showTerms',       label: 'Terms & Conditions', desc: 'Show payment terms at invoice footer' },
  ];

  return (
    <div className="st-content">
      <div className="st-card">
        <div className="st-card-head">
          <div>
            <div className="st-card-title"><FileText size={15} /> Invoice Settings</div>
            <div className="st-card-sub">Control how invoices are numbered, formatted, and displayed</div>
          </div>
        </div>
        <div className="st-card-body">
          <div className="st-section-lbl">Numbering</div>
          <div className="st-grid3">
            <div className="st-field">
              <label>Invoice Prefix</label>
              <input value={form.prefix} onChange={e => set('prefix', e.target.value)} placeholder="INV-" />
              <div className="st-field-hint">E.g. INV-, BILL-, NB-</div>
            </div>
            <div className="st-field">
              <label>Starting Number</label>
              <input type="number" value={form.startingNumber} onChange={e => set('startingNumber', e.target.value)} />
              <div className="st-field-hint">Next: {form.prefix}{form.startingNumber}</div>
            </div>
            <div className="st-field">
              <label>Payment Due (Days)</label>
              <input type="number" value={form.dueDays} onChange={e => set('dueDays', e.target.value)} min="0" />
              <div className="st-field-hint">After invoice date</div>
            </div>
          </div>

          <div className="st-section-lbl">Format</div>
          <div className="st-grid2">
            <div className="st-field">
              <label>Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
                <option value="GBP">£ GBP — British Pound</option>
              </select>
            </div>
            <div className="st-field">
              <label>Date Format</label>
              <select value={form.dateFormat} onChange={e => set('dateFormat', e.target.value)}>
                <option>DD MMM YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div className="st-section-lbl">Content</div>
          <div className="st-field">
            <label>Default Payment Terms</label>
            <textarea value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} />
          </div>
          <div className="st-field">
            <label>Invoice Footer Note</label>
            <textarea value={form.footerNote} onChange={e => set('footerNote', e.target.value)} />
          </div>

          <div className="st-section-lbl">Display Options</div>
          {TOGGLES.map(({ key, label, desc }) => (
            <div className="st-toggle-row" key={key}>
              <div className="st-toggle-info">
                <div className="st-toggle-label">{label}</div>
                <div className="st-toggle-desc">{desc}</div>
              </div>
              <Toggle on={form[key]} onChange={() => tog(key)} />
            </div>
          ))}
        </div>
        <div className="st-card-foot">
          <button className="st-btn-secondary">Discard</button>
          <button className="st-btn-primary" onClick={onSave}><Save size={14} /> Save Settings</button>
        </div>
      </div>

      {/* Preview */}
      <div className="st-card">
        <div className="st-card-head">
          <div className="st-card-title"><FileText size={15} /> Invoice Preview</div>
        </div>
        <div className="st-card-body">
          <div className="st-inv-preview">
            <div className="st-inv-prev-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {form.showLogo && <div className="st-inv-prev-logo">N</div>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#2D2D2D' }}>NexBill ERP</div>
                  <div style={{ fontSize: 10, color: '#8B7355' }}>billing@nexbill.in</div>
                </div>
              </div>
              <div>
                <div className="st-inv-prev-title">INVOICE</div>
                <div className="st-inv-prev-meta">{form.prefix}1001 · 23 May 2026</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#8B7355', textAlign: 'center', padding: '8px 0' }}>
              Sample invoice preview · Next number: <strong style={{ color: '#2D2D2D' }}>{form.prefix}{form.startingNumber}</strong> · Due in <strong style={{ color: '#2D2D2D' }}>{form.dueDays} days</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAX & GST TAB
══════════════════════════════════════════════════════════════════════ */
const GST_SLABS = [
  { rate: '0%', name: 'Exempt', desc: 'Basic necessities' },
  { rate: '5%', name: 'Essential', desc: 'Packaged food, drugs' },
  { rate: '12%', name: 'Standard', desc: 'Processed food, business' },
  { rate: '18%', name: 'Standard+', desc: 'Most goods & services' },
  { rate: '28%', name: 'Luxury', desc: 'Luxury, sin goods' },
];

function TaxTab({ onSave }) {
  const [selected, setSelected] = useState(['18%', '5%']);
  const [cgst, setCGST]         = useState('9');
  const [sgst, setSGST]         = useState('9');
  const [igst, setIGST]         = useState('18');
  const [inclusive, setInclusive] = useState(false);
  const [hsnEnabled, setHSN]    = useState(true);
  const [sacEnabled, setSAC]    = useState(false);

  const toggleSlab = (rate) => {
    setSelected(prev =>
      prev.includes(rate) ? prev.filter(r => r !== rate) : [...prev, rate]
    );
  };

  return (
    <div className="st-card">
      <div className="st-card-head">
        <div>
          <div className="st-card-title"><Percent size={15} /> Tax &amp; GST Configuration</div>
          <div className="st-card-sub">Configure GST rates, CGST/SGST splits, and HSN/SAC codes</div>
        </div>
      </div>
      <div className="st-card-body">
        <div className="st-section-lbl">GST Slabs — Select Applicable Rates</div>
        <div className="st-gst-grid">
          {GST_SLABS.map(s => (
            <div
              key={s.rate}
              className={`st-gst-chip ${selected.includes(s.rate) ? 'selected' : ''}`}
              onClick={() => toggleSlab(s.rate)}
            >
              <div className="st-gst-rate">{s.rate}</div>
              <div className="st-gst-name" style={{ fontWeight: 700 }}>{s.name}</div>
              <div className="st-gst-name">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="st-section-lbl">CGST / SGST / IGST Rates</div>
        <div className="st-grid3">
          <div className="st-field">
            <label>CGST Rate (%)</label>
            <input type="number" value={cgst} onChange={e => setCGST(e.target.value)} min="0" max="14" />
            <div className="st-field-hint">Central GST portion</div>
          </div>
          <div className="st-field">
            <label>SGST Rate (%)</label>
            <input type="number" value={sgst} onChange={e => setSGST(e.target.value)} min="0" max="14" />
            <div className="st-field-hint">State GST portion</div>
          </div>
          <div className="st-field">
            <label>IGST Rate (%)</label>
            <input type="number" value={igst} onChange={e => setIGST(e.target.value)} min="0" max="28" />
            <div className="st-field-hint">Interstate GST</div>
          </div>
        </div>

        <div style={{ background: '#F8F5F2', borderRadius: 9, padding: 12, marginBottom: 16, fontSize: 12, color: '#3F3F46' }}>
          ℹ️ For intrastate sales: CGST ({cgst}%) + SGST ({sgst}%) = {Number(cgst) + Number(sgst)}%<br />
          &nbsp;&nbsp;&nbsp;For interstate sales: IGST ({igst}%) applies instead.
        </div>

        <div className="st-section-lbl">Tax Options</div>
        <div className="st-toggle-row">
          <div className="st-toggle-info">
            <div className="st-toggle-label">Tax Inclusive Pricing</div>
            <div className="st-toggle-desc">Product prices already include GST (tax included in MRP)</div>
          </div>
          <Toggle on={inclusive} onChange={setInclusive} />
        </div>
        <div className="st-toggle-row">
          <div className="st-toggle-info">
            <div className="st-toggle-label">HSN Code (Goods)</div>
            <div className="st-toggle-desc">Show HSN code on invoice line items for goods</div>
          </div>
          <Toggle on={hsnEnabled} onChange={setHSN} />
        </div>
        <div className="st-toggle-row">
          <div className="st-toggle-info">
            <div className="st-toggle-label">SAC Code (Services)</div>
            <div className="st-toggle-desc">Show SAC code on invoice line items for services</div>
          </div>
          <Toggle on={sacEnabled} onChange={setSAC} />
        </div>
      </div>
      <div className="st-card-foot">
        <button className="st-btn-secondary">Discard</button>
        <button className="st-btn-primary" onClick={onSave}><Save size={14} /> Save Tax Settings</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
══════════════════════════════════════════════════════════════════════ */
function NotificationsTab({ onSave }) {
  const [notifs, setNotifs] = useState({
    emailNewInvoice: true,
    emailPaymentReceived: true,
    emailOverdue: true,
    emailLowStock: false,
    emailCashierApproval: true,
    smsPaymentReceived: false,
    smsOverdue: true,
    appNewInvoice: true,
    appPaymentReceived: true,
    appOverdue: true,
    appLowStock: true,
    dailySummary: true,
    weeklySummary: false,
  });
  const tog = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }));

  const EMAIL_NOTIFS = [
    { key: 'emailNewInvoice',      label: 'New Invoice Created',     desc: 'Get notified when a new invoice is generated' },
    { key: 'emailPaymentReceived', label: 'Payment Received',        desc: 'Alert when a customer makes a payment' },
    { key: 'emailOverdue',         label: 'Invoice Overdue',         desc: 'Reminder when invoices pass their due date' },
    { key: 'emailLowStock',        label: 'Low Stock Alert',         desc: 'Email when product stock falls below threshold' },
    { key: 'emailCashierApproval', label: 'Cashier Approval Request',desc: 'New cashier registration waiting approval' },
  ];
  const SMS_NOTIFS = [
    { key: 'smsPaymentReceived',   label: 'Payment Confirmation',    desc: 'SMS to customer on payment success' },
    { key: 'smsOverdue',           label: 'Overdue Reminder SMS',    desc: 'SMS reminder to customers with overdue invoices' },
  ];
  const APP_NOTIFS = [
    { key: 'appNewInvoice',        label: 'New Invoice',             desc: 'In-app notification for new invoices' },
    { key: 'appPaymentReceived',   label: 'Payment Received',        desc: 'In-app alert for received payments' },
    { key: 'appOverdue',           label: 'Overdue Alert',           desc: 'In-app reminder for overdue invoices' },
    { key: 'appLowStock',          label: 'Low Stock',               desc: 'In-app alert for low inventory' },
  ];

  const NotifGroup = ({ title, icon: Icon, items }) => (
    <div className="st-card">
      <div className="st-card-head">
        <div className="st-card-title"><Icon size={15} /> {title}</div>
      </div>
      <div className="st-card-body">
        {items.map(({ key, label, desc }) => (
          <div className="st-toggle-row" key={key}>
            <div className="st-toggle-info">
              <div className="st-toggle-label">{label}</div>
              <div className="st-toggle-desc">{desc}</div>
            </div>
            <Toggle on={notifs[key]} onChange={() => tog(key)} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="st-content">
      <NotifGroup title="Email Notifications" icon={Mail} items={EMAIL_NOTIFS} />
      <NotifGroup title="SMS Notifications" icon={Smartphone} items={SMS_NOTIFS} />
      <NotifGroup title="In-App Notifications" icon={Bell} items={APP_NOTIFS} />

      <div className="st-card">
        <div className="st-card-head">
          <div className="st-card-title"><Calendar size={15} /> Reports &amp; Summaries</div>
        </div>
        <div className="st-card-body">
          <div className="st-toggle-row">
            <div className="st-toggle-info">
              <div className="st-toggle-label">Daily Summary Email</div>
              <div className="st-toggle-desc">Receive end-of-day sales and billing summary</div>
            </div>
            <Toggle on={notifs.dailySummary} onChange={() => tog('dailySummary')} />
          </div>
          <div className="st-toggle-row">
            <div className="st-toggle-info">
              <div className="st-toggle-label">Weekly Report Email</div>
              <div className="st-toggle-desc">Weekly performance and revenue report every Monday</div>
            </div>
            <Toggle on={notifs.weeklySummary} onChange={() => tog('weeklySummary')} />
          </div>
        </div>
        <div className="st-card-foot">
          <button className="st-btn-secondary">Discard</button>
          <button className="st-btn-primary" onClick={onSave}><Save size={14} /> Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════════════════════════════════════ */
function SecurityTab({ onSave }) {
  const [pwForm, setPWForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [twoFA, setTwoFA]   = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const togglePw = (k) => setShowPw(s => ({ ...s, [k]: !s[k] }));
  const setP = (k, v) => setPWForm(f => ({ ...f, [k]: v }));

  const PasswordInput = ({ field, label, placeholder }) => (
    <div className="st-field">
      <label>{label}</label>
      <div className="st-input-wrap">
        <Lock size={14} className="st-input-icon" />
        <input
          style={{ paddingLeft: 32, paddingRight: 36 }}
          type={showPw[field] ? 'text' : 'password'}
          value={pwForm[field]}
          placeholder={placeholder}
          onChange={e => setP(field, e.target.value)}
        />
        <button className="st-eye-btn" onClick={() => togglePw(field)}>
          {showPw[field] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="st-content">
      {/* Change Password */}
      <div className="st-card">
        <div className="st-card-head">
          <div>
            <div className="st-card-title"><Lock size={15} /> Change Password</div>
            <div className="st-card-sub">Keep your account secure with a strong password</div>
          </div>
        </div>
        <div className="st-card-body">
          <div className="st-pw-form">
            <PasswordInput field="current" label="Current Password" placeholder="Enter current password" />
            <PasswordInput field="newPw"   label="New Password"     placeholder="Min 8 characters" />
            <PasswordInput field="confirm" label="Confirm New Password" placeholder="Re-enter new password" />
          </div>
          <div style={{ background: '#F8F5F2', borderRadius: 9, padding: 12, fontSize: 12, color: '#8B7355', marginTop: 12 }}>
            🔐 Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.
          </div>
        </div>
        <div className="st-card-foot">
          <button className="st-btn-secondary">Cancel</button>
          <button className="st-btn-primary" onClick={onSave}><Shield size={14} /> Update Password</button>
        </div>
      </div>

      {/* Two-Factor Auth */}
      <div className="st-card">
        <div className="st-card-head">
          <div>
            <div className="st-card-title"><Smartphone size={15} /> Two-Factor Authentication</div>
            <div className="st-card-sub">Add an extra layer of security to your account</div>
          </div>
        </div>
        <div className="st-card-body">
          <div className="st-toggle-row" style={{ paddingTop: 0 }}>
            <div className="st-toggle-info">
              <div className="st-toggle-label">Enable 2FA</div>
              <div className="st-toggle-desc">Require a verification code on login using an authenticator app (Google Authenticator, Authy)</div>
            </div>
            <Toggle on={twoFA} onChange={setTwoFA} />
          </div>
          {twoFA && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 9, padding: 12, marginTop: 12, fontSize: 12, color: '#15803d' }}>
              ✅ 2FA is enabled. Use your authenticator app to get the 6-digit code on next login.
            </div>
          )}
        </div>
      </div>

      {/* Session & Access */}
      <div className="st-card">
        <div className="st-card-head">
          <div className="st-card-title"><Clock size={15} /> Session &amp; Access Control</div>
        </div>
        <div className="st-card-body">
          <div className="st-security-item" style={{ paddingTop: 0 }}>
            <div className="st-sec-icon"><Clock size={17} /></div>
            <div className="st-sec-info">
              <div className="st-sec-label">Session Timeout</div>
              <div className="st-sec-desc">Automatically log out after a period of inactivity</div>
            </div>
            <select
              className="st-select"
              style={{ height: 36, padding: '0 12px', border: '1.5px solid #EFE7DE', borderRadius: 9, fontSize: 13, background: '#F8F5F2', outline: 'none', fontFamily: 'inherit' }}
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours (shift)</option>
              <option value="0">Never</option>
            </select>
          </div>
          <div className="st-security-item">
            <div className="st-sec-icon"><RefreshCw size={17} /></div>
            <div className="st-sec-info">
              <div className="st-sec-label">Active Sessions</div>
              <div className="st-sec-desc">2 active sessions · Last login: 23 May 2026, 09:14 AM · Bangalore</div>
            </div>
            <button className="st-sec-action" onClick={() => onSave('All other sessions logged out')}>
              Revoke All
            </button>
          </div>
          <div className="st-security-item">
            <div className="st-sec-icon"><AlertCircle size={17} /></div>
            <div className="st-sec-info">
              <div className="st-sec-label">Login Activity</div>
              <div className="st-sec-desc">View all login attempts and IP addresses</div>
            </div>
            <button className="st-sec-action">View Log</button>
          </div>
        </div>
        <div className="st-card-foot">
          <button className="st-btn-secondary">Cancel</button>
          <button className="st-btn-primary" onClick={onSave}><Save size={14} /> Save Settings</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SYSTEM PREFERENCES TAB
══════════════════════════════════════════════════════════════════════ */
const ACCENT_COLORS = [
  { color: '#C6A969', name: 'Gold (Default)' },
  { color: '#2563eb', name: 'Blue'    },
  { color: '#16a34a', name: 'Green'   },
  { color: '#9333ea', name: 'Purple'  },
  { color: '#dc2626', name: 'Red'     },
  { color: '#ea580c', name: 'Orange'  },
  { color: '#0891b2', name: 'Cyan'    },
  { color: '#db2777', name: 'Pink'    },
];

function SystemTab({ onSave }) {
  const [accentColor, setAccent]   = useState('#C6A969');
  const [timezone, setTimezone]    = useState('Asia/Kolkata');
  const [language, setLanguage]    = useState('en');
  const [dateFormat, setDateFmt]   = useState('DD MMM YYYY');
  const [timeFormat, setTimeFmt]   = useState('12h');
  const [compactMode, setCompact]  = useState(false);
  const [animations, setAnims]     = useState(true);
  const [autoSave, setAutoSave]    = useState(true);
  const [dataRetention, setRetain] = useState('12');

  return (
    <div className="st-content">
      {/* Appearance */}
      <div className="st-card">
        <div className="st-card-head">
          <div className="st-card-title"><Settings2 size={15} /> Appearance</div>
        </div>
        <div className="st-card-body">
          <div className="st-field">
            <label>Accent Color</label>
            <div className="st-color-chips">
              {ACCENT_COLORS.map(c => (
                <div
                  key={c.color}
                  className={`st-color-chip ${accentColor === c.color ? 'selected' : ''}`}
                  style={{ background: c.color }}
                  title={c.name}
                  onClick={() => setAccent(c.color)}
                />
              ))}
            </div>
            <div className="st-field-hint">Selected: {ACCENT_COLORS.find(c => c.color === accentColor)?.name}</div>
          </div>
          <div className="st-toggle-row">
            <div className="st-toggle-info">
              <div className="st-toggle-label">Compact Mode</div>
              <div className="st-toggle-desc">Reduce spacing for denser information display</div>
            </div>
            <Toggle on={compactMode} onChange={setCompact} />
          </div>
          <div className="st-toggle-row">
            <div className="st-toggle-info">
              <div className="st-toggle-label">Interface Animations</div>
              <div className="st-toggle-desc">Enable smooth transitions and micro-animations</div>
            </div>
            <Toggle on={animations} onChange={setAnims} />
          </div>
        </div>
      </div>

      {/* Locale */}
      <div className="st-card">
        <div className="st-card-head">
          <div className="st-card-title"><Globe size={15} /> Locale &amp; Regional</div>
        </div>
        <div className="st-card-body">
          <div className="st-grid2">
            <div className="st-field">
              <label>Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="Asia/Kolkata">IST — Asia/Kolkata (UTC+5:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">EST — New York (UTC-5)</option>
                <option value="Europe/London">GMT — London (UTC+0)</option>
                <option value="Asia/Singapore">SGT — Singapore (UTC+8)</option>
                <option value="Australia/Sydney">AEST — Sydney (UTC+10)</option>
              </select>
            </div>
            <div className="st-field">
              <label>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>
            <div className="st-field">
              <label>Date Format</label>
              <select value={dateFormat} onChange={e => setDateFmt(e.target.value)}>
                <option>DD MMM YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="st-field">
              <label>Time Format</label>
              <select value={timeFormat} onChange={e => setTimeFmt(e.target.value)}>
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="st-card">
        <div className="st-card-head">
          <div className="st-card-title"><RefreshCw size={15} /> Data &amp; Storage</div>
        </div>
        <div className="st-card-body">
          <div className="st-quota-bar-wrap">
            <div className="st-quota-label">
              <span>Storage Used</span>
              <span style={{ fontWeight: 700, color: '#2D2D2D' }}>1.8 GB / 10 GB</span>
            </div>
            <div className="st-quota-bar">
              <div className="st-quota-fill" style={{ width: '18%' }} />
            </div>
          </div>

          <div className="st-toggle-row" style={{ paddingTop: 0 }}>
            <div className="st-toggle-info">
              <div className="st-toggle-label">Auto-save Drafts</div>
              <div className="st-toggle-desc">Automatically save invoice drafts while editing</div>
            </div>
            <Toggle on={autoSave} onChange={setAutoSave} />
          </div>

          <div className="st-field" style={{ marginTop: 14 }}>
            <label>Data Retention Period</label>
            <select value={dataRetention} onChange={e => setRetain(e.target.value)}>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">1 year</option>
              <option value="24">2 years</option>
              <option value="60">5 years</option>
              <option value="0">Indefinitely</option>
            </select>
            <div className="st-field-hint">Invoices and records older than this will be archived</div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="st-btn-secondary" style={{ height: 36, fontSize: 12 }} onClick={() => onSave('Data export started')}>
              Export All Data
            </button>
            <button className="st-btn-danger" style={{ height: 36, fontSize: 12 }}>
              Clear Cache
            </button>
          </div>
        </div>
        <div className="st-card-foot">
          <button className="st-btn-secondary">Discard</button>
          <button className="st-btn-primary" onClick={onSave}><Save size={14} /> Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SETTINGS — DEFAULT EXPORT
══════════════════════════════════════════════════════════════════════ */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast]         = useState(null);

  const showToast = (msg = 'Settings saved successfully!', type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileTab          onSave={() => showToast()} />;
      case 'invoice':       return <InvoiceSettingsTab  onSave={() => showToast()} />;
      case 'tax':           return <TaxTab              onSave={() => showToast()} />;
      case 'notifications': return <NotificationsTab    onSave={() => showToast()} />;
      case 'security':      return <SecurityTab         onSave={(m) => showToast(typeof m === 'string' ? m : 'Settings saved!')} />;
      case 'system':        return <SystemTab           onSave={(m) => showToast(typeof m === 'string' ? m : 'Settings saved!')} />;
      default:              return null;
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && (
        <div className={`st-toast ${toast.type === 'error' ? 'st-toast-err' : ''}`}>
          <CheckCircle size={14} /> {toast.msg}
        </div>
      )}

      <div className="st-shell">
        {/* ── Settings Sidebar ── */}
        <div className="st-sidebar">
          <div className="st-sidebar-label">Account</div>
          {TABS.slice(0, 1).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`st-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}

          <div className="st-sidebar-label">Billing</div>
          {TABS.slice(1, 3).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`st-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}

          <div className="st-sidebar-label">Preferences</div>
          {TABS.slice(3).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`st-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── Settings Content ── */}
        <div className="st-content">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
