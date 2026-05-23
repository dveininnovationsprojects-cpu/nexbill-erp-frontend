// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Admin Invoice Module + PDF Preview                  ║
// ║   Includes: Invoice List, PDF Preview Modal, Create Invoice Modal   ║
// ║   All CSS, all components, all logic — ONE FILE                     ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState } from 'react';
import {
  Search, Eye, Download, Mail, Plus, X, FileText,
  ChevronLeft, ChevronRight, Printer, CheckCircle,
  AlertCircle, Trash2, Receipt, TrendingUp, Filter,
  Clock, DollarSign, Package, User, Building2,
  Send, Edit, MoreHorizontal,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — NexBill Color Palette & Component Styles
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  .inv-page { display:flex; flex-direction:column; gap:20px; font-family:'Inter',system-ui,sans-serif; }

  /* ── KPI Cards ── */
  .inv-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .inv-kpi-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:20px; display:flex; align-items:flex-start; gap:14px; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .inv-kpi-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .inv-icon-gold  { background:#EFE7DE; color:#8B7355; }
  .inv-icon-green { background:#DCFCE7; color:#16a34a; }
  .inv-icon-amber { background:#FEF9C3; color:#ca8a04; }
  .inv-icon-red   { background:#FEE2E2; color:#dc2626; }
  .inv-kpi-value  { font-size:24px; font-weight:700; color:#2D2D2D; line-height:1; margin-bottom:4px; }
  .inv-kpi-label  { font-size:13px; font-weight:500; color:#3F3F46; }
  .inv-kpi-sub    { font-size:11px; color:#8B7355; margin-top:2px; }

  /* ── Toolbar ── */
  .inv-toolbar { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .inv-search-box { flex:1; min-width:200px; display:flex; align-items:center; gap:8px; background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:9px; padding:0 12px; height:38px; }
  .inv-search-box input { flex:1; border:none; background:transparent; outline:none; font-size:13px; color:#2D2D2D; font-family:inherit; }
  .inv-search-box input::placeholder { color:#D6D3D1; }
  .inv-select { height:38px; padding:0 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#3F3F46; background:#F8F5F2; outline:none; font-family:inherit; cursor:pointer; }
  .inv-select:focus { border-color:#C6A969; }
  .inv-btn-primary { display:flex; align-items:center; gap:6px; padding:0 18px; height:38px; background:#2D2D2D; color:#F8F5F2; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s,color 0.2s; white-space:nowrap; }
  .inv-btn-primary:hover { background:#C6A969; color:#2D2D2D; }
  .inv-btn-secondary { display:flex; align-items:center; gap:6px; padding:0 18px; height:38px; background:#F8F5F2; color:#8B7355; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; white-space:nowrap; }
  .inv-btn-secondary:hover { background:#EFE7DE; color:#2D2D2D; }
  .inv-btn-ghost { display:flex; align-items:center; gap:6px; padding:0 14px; height:38px; background:transparent; color:#8B7355; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
  .inv-btn-ghost:hover { background:#F8F5F2; }

  /* ── Table ── */
  .inv-table-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .inv-table-scroll { overflow-x:auto; }
  .inv-table { width:100%; border-collapse:collapse; font-size:13px; }
  .inv-table thead th { background:#F8F5F2; padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #EFE7DE; white-space:nowrap; }
  .inv-table tbody td { padding:12px 14px; border-bottom:1px solid #F8F5F2; color:#3F3F46; vertical-align:middle; }
  .inv-table tbody tr:last-child td { border-bottom:none; }
  .inv-table tbody tr:hover td { background:#FDFCFB; }
  .inv-id-cell { font-weight:700; color:#2D2D2D; font-size:13px; }
  .inv-customer-name { font-weight:600; color:#2D2D2D; font-size:13px; }
  .inv-customer-sub  { font-size:11px; color:#8B7355; margin-top:2px; }
  .inv-amount { font-weight:700; color:#2D2D2D; }

  /* ── Status Badges ── */
  .inv-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.2px; }
  .badge-paid    { background:#DCFCE7; color:#16a34a; }
  .badge-pending { background:#FEF9C3; color:#ca8a04; }
  .badge-overdue { background:#FEE2E2; color:#dc2626; }
  .badge-draft   { background:#F1F5F9; color:#64748b; }

  /* ── Action buttons ── */
  .inv-actions { display:flex; align-items:center; gap:5px; }
  .inv-act-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; transition:all 0.15s; }
  .inv-act-btn:hover           { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .inv-act-btn.btn-green:hover { background:#DCFCE7; color:#16a34a; border-color:#86EFAC; }
  .inv-act-btn.btn-red:hover   { background:#FEE2E2; color:#dc2626; border-color:#FCA5A5; }
  .inv-act-btn.btn-blue:hover  { background:#DBEAFE; color:#2563eb; border-color:#93C5FD; }

  /* ── Pagination ── */
  .inv-pagination { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-top:1px solid #EFE7DE; }
  .inv-page-info { font-size:12px; color:#8B7355; }
  .inv-page-btns { display:flex; gap:5px; }
  .inv-page-btn { min-width:30px; height:30px; padding:0 6px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; color:#8B7355; transition:all 0.15s; }
  .inv-page-btn:hover   { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .inv-page-btn.active  { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .inv-page-btn:disabled { opacity:0.4; cursor:not-allowed; }

  /* ── Overlay ── */
  .inv-overlay { position:fixed; inset:0; background:rgba(45,45,45,0.55); backdrop-filter:blur(4px); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; }

  /* ── PDF Modal ── */
  .inv-pdf-modal { background:#FFFFFF; border-radius:18px; width:100%; max-width:820px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 28px 72px rgba(45,45,45,0.28); overflow:hidden; }
  .inv-pdf-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid #EFE7DE; flex-shrink:0; background:#FFFFFF; }
  .inv-pdf-modal-title { font-size:14px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; }
  .inv-pdf-modal-acts { display:flex; gap:8px; align-items:center; }
  .inv-pdf-modal-body { flex:1; overflow-y:auto; padding:28px; background:#F0EDE9; }
  .inv-close-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; }
  .inv-close-btn:hover { background:#EFE7DE; color:#2D2D2D; }

  /* ── Invoice Document ── */
  .inv-doc { background:#FFFFFF; border-radius:10px; padding:44px; box-shadow:0 2px 16px rgba(45,45,45,0.08); max-width:720px; margin:0 auto; }
  .inv-doc-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; padding-bottom:28px; border-bottom:2px solid #EFE7DE; }
  .inv-doc-brand-row { display:flex; align-items:center; gap:14px; margin-bottom:12px; }
  .inv-doc-logo { width:48px; height:48px; background:#2D2D2D; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800; color:#C6A969; flex-shrink:0; }
  .inv-doc-company { font-size:20px; font-weight:800; color:#2D2D2D; margin:0; }
  .inv-doc-company-sub { font-size:11px; color:#8B7355; margin-top:1px; }
  .inv-doc-addr { font-size:11.5px; color:#3F3F46; line-height:1.7; }
  .inv-doc-right { text-align:right; }
  .inv-doc-title { font-size:30px; font-weight:900; color:#2D2D2D; letter-spacing:-1px; margin-bottom:14px; }
  .inv-doc-meta-row { display:grid; grid-template-columns:auto auto; gap:4px 20px; justify-content:end; margin-bottom:3px; }
  .inv-doc-meta-lbl { font-size:11px; color:#8B7355; text-align:right; }
  .inv-doc-meta-val { font-size:12px; font-weight:600; color:#2D2D2D; text-align:right; }

  .inv-doc-parties { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-bottom:28px; }
  .inv-doc-party-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.9px; margin-bottom:8px; }
  .inv-doc-party-name { font-size:14px; font-weight:700; color:#2D2D2D; margin-bottom:5px; }
  .inv-doc-party-info { font-size:12px; color:#3F3F46; line-height:1.7; }

  .inv-doc-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  .inv-doc-table thead th { background:#2D2D2D; color:#F8F5F2; padding:10px 12px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:left; }
  .inv-doc-table thead th:first-child { border-radius:7px 0 0 7px; }
  .inv-doc-table thead th:last-child  { border-radius:0 7px 7px 0; text-align:right; }
  .inv-doc-table thead th.right { text-align:right; }
  .inv-doc-table tbody td { padding:10px 12px; border-bottom:1px solid #EFE7DE; font-size:12.5px; color:#3F3F46; }
  .inv-doc-table tbody td.right { text-align:right; }
  .inv-doc-table tbody td.bold { font-weight:700; color:#2D2D2D; }
  .inv-doc-table tfoot td { padding:10px 12px; font-size:12.5px; }

  .inv-doc-totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
  .inv-doc-totals-inner { min-width:280px; }
  .inv-doc-tot-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:#3F3F46; }
  .inv-doc-tot-row.discount { color:#16a34a; font-weight:500; }
  .inv-doc-tot-row.grand { border-top:2px solid #2D2D2D; padding-top:10px; margin-top:4px; font-size:15px; font-weight:800; color:#2D2D2D; }

  .inv-doc-footer { display:flex; justify-content:space-between; align-items:flex-end; padding-top:24px; border-top:1px solid #EFE7DE; margin-top:4px; }
  .inv-doc-terms-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:6px; }
  .inv-doc-terms-txt { font-size:11.5px; color:#3F3F46; line-height:1.7; max-width:340px; }
  .inv-doc-sig { text-align:center; }
  .inv-doc-sig-line { width:140px; border-top:1.5px solid #D6D3D1; margin:0 auto 6px; margin-top:36px; }
  .inv-doc-sig-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; }
  .inv-doc-sig-name { font-size:12px; color:#2D2D2D; font-weight:600; margin-top:2px; }
  .inv-doc-thankyou { text-align:center; margin-top:24px; padding:14px; background:#F8F5F2; border-radius:8px; }
  .inv-doc-thankyou-title { font-size:13px; font-weight:700; color:#2D2D2D; }
  .inv-doc-thankyou-sub { font-size:11.5px; color:#8B7355; margin-top:3px; }

  /* ── Create Invoice Modal ── */
  .inv-create-modal { background:#FFFFFF; border-radius:18px; width:100%; max-width:660px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 28px 72px rgba(45,45,45,0.28); overflow:hidden; }
  .inv-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid #EFE7DE; flex-shrink:0; }
  .inv-modal-title { font-size:15px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; }
  .inv-modal-body { flex:1; overflow-y:auto; padding:20px 24px; }
  .inv-modal-foot { padding:16px 24px; border-top:1px solid #EFE7DE; display:flex; gap:10px; justify-content:flex-end; flex-shrink:0; }

  .inv-field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
  .inv-field label { font-size:10.5px; font-weight:700; color:#3F3F46; text-transform:uppercase; letter-spacing:0.5px; }
  .inv-field input, .inv-field select, .inv-field textarea { padding:9px 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#2D2D2D; background:#F8F5F2; outline:none; font-family:inherit; transition:border-color 0.2s, box-shadow 0.2s; }
  .inv-field input:focus, .inv-field select:focus, .inv-field textarea:focus { border-color:#C6A969; box-shadow:0 0 0 3px rgba(198,169,105,0.12); background:#FFFFFF; }
  .inv-field textarea { resize:vertical; min-height:68px; }
  .inv-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .inv-section-label { font-size:11px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.7px; margin:18px 0 12px; display:flex; align-items:center; gap:6px; }
  .inv-section-label::after { content:''; flex:1; height:1px; background:#EFE7DE; }

  .inv-item-head { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 32px; gap:8px; padding:6px 0 8px; }
  .inv-item-head span { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.5px; }
  .inv-item-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 32px; gap:8px; align-items:center; padding:8px 0; border-bottom:1px solid #F8F5F2; }
  .inv-item-input { padding:8px 10px; border:1.5px solid #EFE7DE; border-radius:8px; font-size:12px; background:#F8F5F2; outline:none; font-family:inherit; width:100%; }
  .inv-item-input:focus { border-color:#C6A969; background:#FFFFFF; }
  .inv-del-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#FEE2E2; border:none; border-radius:7px; cursor:pointer; color:#dc2626; flex-shrink:0; }
  .inv-add-item-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; background:#F8F5F2; border:1.5px dashed #C6A969; border-radius:9px; font-size:12px; font-weight:600; color:#8B7355; cursor:pointer; font-family:inherit; transition:all 0.2s; margin-top:10px; }
  .inv-add-item-btn:hover { background:#EFE7DE; color:#2D2D2D; border-style:solid; }

  .inv-totals-box { background:#F8F5F2; border-radius:10px; padding:14px 16px; margin-top:16px; }
  .inv-tot-row { display:flex; justify-content:space-between; font-size:13px; color:#3F3F46; margin-bottom:6px; }
  .inv-tot-row:last-child { font-size:15px; font-weight:800; color:#2D2D2D; border-top:1px solid #EFE7DE; padding-top:8px; margin-top:4px; margin-bottom:0; }
  .inv-tot-row.green { color:#16a34a; }

  /* ── Empty state ── */
  .inv-empty { display:flex; flex-direction:column; align-items:center; padding:48px 24px; color:#D6D3D1; gap:10px; }
  .inv-empty p { font-size:13px; }

  /* ── Toast ── */
  .inv-toast { position:fixed; top:20px; right:28px; background:#2D2D2D; color:#F8F5F2; padding:12px 18px; border-radius:10px; font-size:13px; display:flex; align-items:center; gap:8px; z-index:999; box-shadow:0 4px 16px rgba(45,45,45,0.2); animation:invSlideIn 0.25s ease; }
  .inv-toast-err { background:#7A3A3A; }
  @keyframes invSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .inv-spinner { width:14px; height:14px; border:2px solid rgba(248,245,242,0.3); border-top-color:#F8F5F2; border-radius:50%; animation:invSpin 0.7s linear infinite; }
  @keyframes invSpin { to{transform:rotate(360deg)} }
`;

/* ══════════════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════════════ */
const MOCK_INVOICES = [
  {
    id: 'INV-2026-001', customer: 'Ahamed Yasik', email: 'ahamed@gmail.com',
    phone: '+91 9876543210', address: '12 MG Road, Chennai, Tamil Nadu 600001',
    gstNo: '33AABCC1234K1Z5',
    items: [
      { name: 'MacBook Pro 14"', qty: 1, rate: 125000, gst: 18 },
      { name: 'Magic Mouse', qty: 2, rate: 4500, gst: 18 },
    ],
    discount: 5000, status: 'Paid', date: '22 May 2026', dueDate: '29 May 2026',
    cashier: 'Ravi Kumar', counter: 'Counter 1', payment: 'UPI',
  },
  {
    id: 'INV-2026-002', customer: 'DVein Innovations', email: 'billing@dvein.in',
    phone: '+91 9012345678', address: '45 Tech Park, Bangalore, Karnataka 560001',
    gstNo: '29AABCD5678M1Z9',
    items: [
      { name: 'Office Chair Pro', qty: 10, rate: 8500, gst: 18 },
      { name: 'Standing Desk', qty: 5, rate: 15000, gst: 28 },
    ],
    discount: 10000, status: 'Pending', date: '21 May 2026', dueDate: '28 May 2026',
    cashier: 'Priya Sharma', counter: 'Counter 2', payment: 'Bank Transfer',
  },
  {
    id: 'INV-2026-003', customer: 'Tech Solutions Ltd', email: 'accounts@techsol.com',
    phone: '+91 8765432109', address: '78 IT Hub, Hyderabad, Telangana 500001',
    gstNo: '36AABCE9012P1Z3',
    items: [
      { name: 'Dell Monitor 27"', qty: 5, rate: 28000, gst: 18 },
      { name: 'Keyboard & Mouse Combo', qty: 5, rate: 3500, gst: 18 },
    ],
    discount: 8000, status: 'Paid', date: '20 May 2026', dueDate: '27 May 2026',
    cashier: 'Ravi Kumar', counter: 'Counter 1', payment: 'Card',
  },
  {
    id: 'INV-2026-004', customer: 'Retail Partners Co.', email: 'ap@retailco.in',
    phone: '+91 7654321098', address: '23 Commerce St, Mumbai, Maharashtra 400001',
    gstNo: '27AABCF3456Q1Z7',
    items: [
      { name: 'Samsung TV 55"', qty: 2, rate: 65000, gst: 28 },
      { name: 'Wall Mount Kit', qty: 2, rate: 2500, gst: 18 },
    ],
    discount: 0, status: 'Overdue', date: '10 May 2026', dueDate: '17 May 2026',
    cashier: 'Meena Raj', counter: 'Counter 3', payment: 'Pending',
  },
  {
    id: 'INV-2026-005', customer: 'Global Traders', email: 'info@globaltraders.net',
    phone: '+91 6543210987', address: '67 Export Zone, Pune, Maharashtra 411001',
    gstNo: '27AABCG7890R1Z1',
    items: [
      { name: 'Industrial Printer', qty: 3, rate: 45000, gst: 18 },
      { name: 'Ink Cartridges (Box)', qty: 10, rate: 2200, gst: 12 },
    ],
    discount: 15000, status: 'Draft', date: '23 May 2026', dueDate: '30 May 2026',
    cashier: 'Priya Sharma', counter: 'Counter 2', payment: 'Pending',
  },
  {
    id: 'INV-2026-006', customer: 'City Supermart', email: 'manager@citymart.in',
    phone: '+91 5432109876', address: '34 Market St, Coimbatore, Tamil Nadu 641001',
    gstNo: '33AABCH2345S1Z5',
    items: [
      { name: 'POS Terminal', qty: 5, rate: 18000, gst: 18 },
      { name: 'Receipt Paper Roll (100pcs)', qty: 20, rate: 450, gst: 5 },
    ],
    discount: 5000, status: 'Paid', date: '19 May 2026', dueDate: '26 May 2026',
    cashier: 'Ravi Kumar', counter: 'Counter 1', payment: 'Cheque',
  },
  {
    id: 'INV-2026-007', customer: 'NextGen Retail', email: 'finance@nextgen.in',
    phone: '+91 4321098765', address: '12 Broad St, Ahmedabad, Gujarat 380001',
    gstNo: '24AABCI6789T1Z9',
    items: [
      { name: 'Barcode Scanner', qty: 8, rate: 6500, gst: 18 },
      { name: 'Cash Drawer', qty: 4, rate: 4800, gst: 18 },
    ],
    discount: 3000, status: 'Pending', date: '18 May 2026', dueDate: '25 May 2026',
    cashier: 'Meena Raj', counter: 'Counter 3', payment: 'Pending',
  },
  {
    id: 'INV-2026-008', customer: 'Star Electronics', email: 'billing@starelectro.in',
    phone: '+91 3210987654', address: '56 Tech Ave, Delhi, Delhi 110001',
    gstNo: '07AABCJ0123U1Z3',
    items: [
      { name: 'iPhone 15 Pro', qty: 3, rate: 134900, gst: 18 },
      { name: 'AirPods Pro', qty: 3, rate: 24900, gst: 18 },
    ],
    discount: 10000, status: 'Paid', date: '17 May 2026', dueDate: '24 May 2026',
    cashier: 'Ravi Kumar', counter: 'Counter 1', payment: 'Card',
  },
];

const EMPTY_ITEM = { name: '', qty: 1, rate: 0, gst: 18 };

/* ══════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
══════════════════════════════════════════════════════════════════════ */
function calcInvoice(inv) {
  const subtotal = inv.items.reduce((s, it) => s + it.qty * it.rate, 0);
  const gstTotal = inv.items.reduce((s, it) => s + (it.qty * it.rate * it.gst) / 100, 0);
  const total    = subtotal + gstTotal - (inv.discount || 0);
  return { subtotal, gstTotal, total };
}

function inr(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function badgeClass(status) {
  return { Paid: 'badge-paid', Pending: 'badge-pending', Overdue: 'badge-overdue', Draft: 'badge-draft' }[status] || 'badge-draft';
}

function stampStyle(status) {
  const colors = { Paid: '#16a34a', Pending: '#ca8a04', Overdue: '#dc2626', Draft: '#64748b' };
  return { border: `3px solid ${colors[status] || '#64748b'}`, color: colors[status] || '#64748b' };
}

/* ══════════════════════════════════════════════════════════════════════
   PRINT / PDF — Opens a print-ready window
══════════════════════════════════════════════════════════════════════ */
function printInvoice(inv) {
  const { subtotal, gstTotal, total } = calcInvoice(inv);

  const rows = inv.items.map((it, i) => {
    const lineAmt = it.qty * it.rate;
    const lineGst = (lineAmt * it.gst) / 100;
    return `
      <tr>
        <td style="color:#8B7355;text-align:center">${i + 1}</td>
        <td style="font-weight:600;color:#2D2D2D">${it.name}</td>
        <td style="text-align:right">${it.qty}</td>
        <td style="text-align:right">${inr(it.rate)}</td>
        <td style="text-align:right">${it.gst}%</td>
        <td style="text-align:right">${inr(lineGst)}</td>
        <td style="text-align:right;font-weight:700;color:#2D2D2D">${inr(lineAmt + lineGst)}</td>
      </tr>`;
  }).join('');

  const discountRow = inv.discount > 0
    ? `<tr class="tr-discount"><td colspan="5" style="text-align:right">Discount</td><td colspan="2" style="text-align:right;color:#16a34a;font-weight:600">-${inr(inv.discount)}</td></tr>`
    : '';

  const stampColor = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Draft:'#64748b' }[inv.status] || '#64748b';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.id} — NexBill ERP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#2D2D2D;background:#fff;padding:40px;max-width:800px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #EFE7DE}
    .brand-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .logo{width:46px;height:46px;background:#2D2D2D;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#C6A969;text-align:center;line-height:46px}
    .co-name{font-size:18px;font-weight:800;color:#2D2D2D}
    .co-sub{font-size:10px;color:#8B7355;margin-top:1px}
    .co-addr{font-size:11px;color:#3F3F46;line-height:1.7}
    .inv-meta{text-align:right}
    .inv-title{font-size:28px;font-weight:900;color:#2D2D2D;letter-spacing:-1px;margin-bottom:12px}
    .meta-row{display:flex;gap:20px;justify-content:flex-end;margin-bottom:3px}
    .meta-lbl{font-size:11px;color:#8B7355}
    .meta-val{font-size:12px;font-weight:600;color:#2D2D2D;text-align:right}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
    .party-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:6px}
    .party-name{font-size:14px;font-weight:700;color:#2D2D2D;margin-bottom:4px}
    .party-info{font-size:11.5px;color:#3F3F46;line-height:1.7}
    .stamp{display:inline-block;padding:4px 14px;border:3px solid ${stampColor};color:${stampColor};border-radius:6px;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;transform:rotate(-10deg);margin-top:12px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    thead th{background:#2D2D2D;color:#F8F5F2;padding:9px 11px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;text-align:left}
    thead th:first-child{border-radius:6px 0 0 6px;text-align:center}
    thead th:last-child{border-radius:0 6px 6px 0;text-align:right}
    thead th.r{text-align:right}
    tbody td{padding:9px 11px;border-bottom:1px solid #EFE7DE;font-size:12px;color:#3F3F46}
    .totals{display:flex;justify-content:flex-end;margin-bottom:24px}
    .totals-inner{min-width:280px}
    .tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px;color:#3F3F46}
    .tot-grand{border-top:2px solid #2D2D2D;padding-top:10px;margin-top:4px;font-size:15px;font-weight:800;color:#2D2D2D}
    .footer{display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid #EFE7DE}
    .terms-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px}
    .terms-txt{font-size:11px;color:#3F3F46;line-height:1.7;max-width:320px}
    .sig-line{width:130px;border-top:1.5px solid #D6D3D1;margin:28px auto 5px}
    .sig-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.8px;text-align:center}
    .sig-name{font-size:11.5px;color:#2D2D2D;font-weight:700;text-align:center;margin-top:2px}
    .thankyou{text-align:center;margin-top:20px;padding:12px;background:#F8F5F2;border-radius:7px}
    .ty-title{font-size:13px;font-weight:700;color:#2D2D2D}
    .ty-sub{font-size:11px;color:#8B7355;margin-top:3px}
    @media print{body{padding:24px}.logo{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-row">
        <div class="logo">N</div>
        <div>
          <div class="co-name">NexBill ERP</div>
          <div class="co-sub">Smart Billing &amp; Inventory Management</div>
        </div>
      </div>
      <div class="co-addr">
        📍 45 Tech Park, Bangalore, Karnataka 560001<br>
        📞 +91 9876 543 210 &nbsp;|&nbsp; ✉ billing@nexbill.in<br>
        GSTIN: 29AABCN1234M1Z5
      </div>
    </div>
    <div class="inv-meta">
      <div class="inv-title">INVOICE</div>
      <div class="meta-row"><span class="meta-lbl">Invoice No.</span><span class="meta-val">${inv.id}</span></div>
      <div class="meta-row"><span class="meta-lbl">Date</span><span class="meta-val">${inv.date}</span></div>
      <div class="meta-row"><span class="meta-lbl">Due Date</span><span class="meta-val">${inv.dueDate}</span></div>
      <div class="meta-row"><span class="meta-lbl">Payment</span><span class="meta-val">${inv.payment}</span></div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-lbl">Bill To</div>
      <div class="party-name">${inv.customer}</div>
      <div class="party-info">
        ${inv.address}<br>
        ${inv.phone}<br>
        ${inv.email}<br>
        ${inv.gstNo ? 'GSTIN: ' + inv.gstNo : ''}
      </div>
    </div>
    <div style="text-align:right">
      <div class="party-lbl">Handled By</div>
      <div class="party-name">${inv.cashier}</div>
      <div class="party-info">${inv.counter}</div>
      <div class="stamp">${inv.status}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Description</th>
        <th class="r">Qty</th>
        <th class="r">Rate</th>
        <th class="r">GST%</th>
        <th class="r">GST Amt</th>
        <th class="r">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-inner">
      <div class="tot-row"><span>Subtotal</span><span>${inr(subtotal)}</span></div>
      <div class="tot-row"><span>GST Total</span><span>${inr(gstTotal)}</span></div>
      ${inv.discount > 0 ? `<div class="tot-row" style="color:#16a34a"><span>Discount</span><span>-${inr(inv.discount)}</span></div>` : ''}
      <div class="tot-row tot-grand"><span>Grand Total</span><span>${inr(total)}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>
      <div class="terms-lbl">Terms &amp; Conditions</div>
      <div class="terms-txt">Payment is due within 7 days of invoice date. Late payments attract 2% monthly interest. Goods once sold cannot be returned without prior approval. This is a computer-generated invoice and does not require a physical signature.</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-lbl">Authorized Signatory</div>
      <div class="sig-name">NexBill ERP</div>
    </div>
  </div>

  <div class="thankyou">
    <div class="ty-title">Thank you for your business! 🙏</div>
    <div class="ty-sub">For queries: billing@nexbill.in &nbsp;|&nbsp; +91 9876 543 210</div>
  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ══════════════════════════════════════════════════════════════════════
   PDF PREVIEW MODAL
══════════════════════════════════════════════════════════════════════ */
function PDFPreviewModal({ invoice, onClose }) {
  const { subtotal, gstTotal, total } = calcInvoice(invoice);
  const stampColor = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Draft:'#64748b' }[invoice.status] || '#64748b';

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-pdf-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="inv-pdf-modal-head">
          <div className="inv-pdf-modal-title">
            <FileText size={15} /> Invoice Preview — {invoice.id}
          </div>
          <div className="inv-pdf-modal-acts">
            <button className="inv-btn-primary" onClick={() => printInvoice(invoice)}>
              <Printer size={14} /> Print / Save PDF
            </button>
            <button className="inv-close-btn" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="inv-pdf-modal-body">
          <div className="inv-doc">
            {/* Company Header */}
            <div className="inv-doc-head">
              <div>
                <div className="inv-doc-brand-row">
                  <div className="inv-doc-logo">N</div>
                  <div>
                    <div className="inv-doc-company">NexBill ERP</div>
                    <div className="inv-doc-company-sub">Smart Billing &amp; Inventory Management</div>
                  </div>
                </div>
                <div className="inv-doc-addr">
                  📍 45 Tech Park, Bangalore, Karnataka 560001<br />
                  📞 +91 9876 543 210 &nbsp;|&nbsp; ✉ billing@nexbill.in<br />
                  GSTIN: 29AABCN1234M1Z5
                </div>
              </div>
              <div className="inv-doc-right">
                <div className="inv-doc-title">INVOICE</div>
                {[
                  ['Invoice No.', invoice.id],
                  ['Date', invoice.date],
                  ['Due Date', invoice.dueDate],
                  ['Payment Mode', invoice.payment],
                ].map(([l, v]) => (
                  <div className="inv-doc-meta-row" key={l}>
                    <span className="inv-doc-meta-lbl">{l}</span>
                    <span className="inv-doc-meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill To / Handled By */}
            <div className="inv-doc-parties">
              <div>
                <div className="inv-doc-party-lbl">Bill To</div>
                <div className="inv-doc-party-name">{invoice.customer}</div>
                <div className="inv-doc-party-info">
                  {invoice.address}<br />
                  {invoice.phone}<br />
                  {invoice.email}<br />
                  {invoice.gstNo && <>GSTIN: {invoice.gstNo}</>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="inv-doc-party-lbl">Handled By</div>
                <div className="inv-doc-party-name">{invoice.cashier}</div>
                <div className="inv-doc-party-info">{invoice.counter}</div>
                <div style={{ marginTop: 16 }}>
                  <span style={{ ...stampStyle(invoice.status), display:'inline-block', padding:'4px 14px', borderRadius:6, fontSize:12, fontWeight:900, letterSpacing:2, textTransform:'uppercase', transform:'rotate(-10deg)' }}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="inv-doc-table">
              <thead>
                <tr>
                  <th style={{ width: 28, textAlign: 'center' }}>#</th>
                  <th>Description</th>
                  <th className="right">Qty</th>
                  <th className="right">Rate</th>
                  <th className="right">GST%</th>
                  <th className="right">GST Amt</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, i) => {
                  const lineAmt = it.qty * it.rate;
                  const lineGst = (lineAmt * it.gst) / 100;
                  return (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', color: '#8B7355' }}>{i + 1}</td>
                      <td className="bold">{it.name}</td>
                      <td className="right">{it.qty}</td>
                      <td className="right">{inr(it.rate)}</td>
                      <td className="right">{it.gst}%</td>
                      <td className="right">{inr(lineGst)}</td>
                      <td className="right bold">{inr(lineAmt + lineGst)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="inv-doc-totals">
              <div className="inv-doc-totals-inner">
                <div className="inv-doc-tot-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="inv-doc-tot-row"><span>GST Total</span><span>{inr(gstTotal)}</span></div>
                {invoice.discount > 0 && (
                  <div className="inv-doc-tot-row discount"><span>Discount</span><span>-{inr(invoice.discount)}</span></div>
                )}
                <div className="inv-doc-tot-row grand"><span>Grand Total</span><span>{inr(total)}</span></div>
              </div>
            </div>

            {/* Footer */}
            <div className="inv-doc-footer">
              <div>
                <div className="inv-doc-terms-lbl">Terms &amp; Conditions</div>
                <div className="inv-doc-terms-txt">
                  Payment is due within 7 days of invoice date. Late payments attract 2% monthly interest.
                  Goods once sold cannot be returned without prior approval. This is a computer-generated invoice.
                </div>
              </div>
              <div className="inv-doc-sig">
                <div className="inv-doc-sig-line" />
                <div className="inv-doc-sig-lbl">Authorized Signatory</div>
                <div className="inv-doc-sig-name">NexBill ERP</div>
              </div>
            </div>

            {/* Thank You */}
            <div className="inv-doc-thankyou">
              <div className="inv-doc-thankyou-title">Thank you for your business! 🙏</div>
              <div className="inv-doc-thankyou-sub">For queries: billing@nexbill.in &nbsp;|&nbsp; +91 9876 543 210</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CREATE INVOICE MODAL
══════════════════════════════════════════════════════════════════════ */
function CreateInvoiceModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    customer: '', email: '', phone: '', address: '', gstNo: '',
    dueDate: '', payment: 'Cash', discount: 0, notes: '',
  });
  const [items, setItems]   = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setItem = (i, k, v) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: k === 'name' ? v : Number(v) };
    setItems(next);
  };

  const addItem    = () => setItems(it => [...it, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setItems(it => it.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.qty * it.rate, 0);
  const gstTotal = items.reduce((s, it) => s + (it.qty * it.rate * it.gst) / 100, 0);
  const total    = subtotal + gstTotal - Number(form.discount || 0);

  const handleSave = async () => {
    if (!form.customer || items.some(it => !it.name)) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 700)); // simulate API
    const newInv = {
      id: `INV-2026-${String(Date.now()).slice(-3)}`,
      ...form,
      items,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
      cashier: 'Current User',
      counter: 'Counter 1',
    };
    onCreate(newInv);
    setSaving(false);
    onClose();
  };

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-create-modal" onClick={e => e.stopPropagation()}>
        <div className="inv-modal-head">
          <div className="inv-modal-title"><Plus size={15} /> New Invoice</div>
          <button className="inv-close-btn" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="inv-modal-body">
          {/* Customer Details */}
          <div className="inv-section-label"><User size={12} /> Customer Details</div>
          <div className="inv-field"><label>Customer Name *</label>
            <input placeholder="Enter customer name" value={form.customer} onChange={e => set('customer', e.target.value)} />
          </div>
          <div className="inv-grid2">
            <div className="inv-field"><label>Email</label>
              <input type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="inv-field"><label>Phone</label>
              <input placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="inv-field"><label>Address</label>
            <input placeholder="Full billing address" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="inv-grid2">
            <div className="inv-field"><label>GST Number</label>
              <input placeholder="29AABCN1234M1Z5" value={form.gstNo} onChange={e => set('gstNo', e.target.value)} />
            </div>
            <div className="inv-field"><label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div className="inv-section-label"><Package size={12} /> Line Items</div>
          <div className="inv-item-head">
            <span>Description</span><span>Qty</span><span>Rate (₹)</span><span>GST%</span><span />
          </div>
          {items.map((it, i) => (
            <div className="inv-item-row" key={i}>
              <input className="inv-item-input" placeholder="Item name" value={it.name}
                onChange={e => setItem(i, 'name', e.target.value)} />
              <input className="inv-item-input" type="number" min="1" value={it.qty}
                onChange={e => setItem(i, 'qty', e.target.value)} />
              <input className="inv-item-input" type="number" min="0" value={it.rate}
                onChange={e => setItem(i, 'rate', e.target.value)} />
              <input className="inv-item-input" type="number" min="0" max="28" value={it.gst}
                onChange={e => setItem(i, 'gst', e.target.value)} />
              <button className="inv-del-btn" onClick={() => removeItem(i)} disabled={items.length === 1}>
                <X size={13} />
              </button>
            </div>
          ))}
          <button className="inv-add-item-btn" onClick={addItem}><Plus size={13} /> Add Item</button>

          {/* Discount & Payment */}
          <div className="inv-section-label"><DollarSign size={12} /> Pricing & Payment</div>
          <div className="inv-grid2">
            <div className="inv-field"><label>Discount (₹)</label>
              <input type="number" min="0" value={form.discount} onChange={e => set('discount', e.target.value)} />
            </div>
            <div className="inv-field"><label>Payment Method</label>
              <select value={form.payment} onChange={e => set('payment', e.target.value)}>
                {['Cash','Card','UPI','Bank Transfer','Cheque','Pending'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="inv-field"><label>Notes</label>
            <textarea placeholder="Additional notes or terms..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {/* Summary */}
          <div className="inv-totals-box">
            <div className="inv-tot-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="inv-tot-row"><span>GST Total</span><span>{inr(gstTotal)}</span></div>
            {Number(form.discount) > 0 && (
              <div className="inv-tot-row green"><span>Discount</span><span>-{inr(form.discount)}</span></div>
            )}
            <div className="inv-tot-row"><span>Grand Total</span><span>{inr(total)}</span></div>
          </div>
        </div>

        <div className="inv-modal-foot">
          <button className="inv-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="inv-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="inv-spinner" /> : <><CheckCircle size={14} /> Save Invoice</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ADMIN INVOICES — DEFAULT EXPORT
══════════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 6;

export default function AdminInvoices() {
  const [invoices, setInvoices]     = useState(MOCK_INVOICES);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [page, setPage]             = useState(1);
  const [previewInv, setPreview]    = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q)
      || inv.customer.toLowerCase().includes(q)
      || inv.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkPaid = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
    showToast('Invoice marked as Paid');
  };

  const handleDelete = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    showToast('Invoice deleted', 'error');
  };

  const handleCreate = (newInv) => {
    setInvoices(prev => [newInv, ...prev]);
    showToast(`Invoice ${newInv.id} created!`);
  };

  const handleEmail = (inv) => showToast(`Email sent to ${inv.email}`);

  // KPI stats
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + calcInvoice(i).total, 0);
  const paidCount    = invoices.filter(i => i.status === 'Paid').length;
  const pendingCount = invoices.filter(i => i.status === 'Pending').length;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  return (
    <>
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && (
        <div className={`inv-toast ${toast.type === 'error' ? 'inv-toast-err' : ''}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* PDF Preview */}
      {previewInv && <PDFPreviewModal invoice={previewInv} onClose={() => setPreview(null)} />}

      {/* Create Invoice */}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      <div className="inv-page">
        {/* ── KPI Cards ── */}
        <div className="inv-kpi-grid">
          <div className="inv-kpi-card">
            <div className="inv-kpi-icon inv-icon-gold"><Receipt size={20} /></div>
            <div>
              <div className="inv-kpi-value">{invoices.length}</div>
              <div className="inv-kpi-label">Total Invoices</div>
              <div className="inv-kpi-sub">All time</div>
            </div>
          </div>
          <div className="inv-kpi-card">
            <div className="inv-kpi-icon inv-icon-green"><TrendingUp size={20} /></div>
            <div>
              <div className="inv-kpi-value">{inr(totalRevenue)}</div>
              <div className="inv-kpi-label">Total Revenue</div>
              <div className="inv-kpi-sub">From paid invoices</div>
            </div>
          </div>
          <div className="inv-kpi-card">
            <div className="inv-kpi-icon inv-icon-amber"><Clock size={20} /></div>
            <div>
              <div className="inv-kpi-value">{pendingCount}</div>
              <div className="inv-kpi-label">Pending</div>
              <div className="inv-kpi-sub">Awaiting payment</div>
            </div>
          </div>
          <div className="inv-kpi-card">
            <div className="inv-kpi-icon inv-icon-red"><AlertCircle size={20} /></div>
            <div>
              <div className="inv-kpi-value">{overdueCount}</div>
              <div className="inv-kpi-label">Overdue</div>
              <div className="inv-kpi-sub">Past due date</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="inv-toolbar">
          <div className="inv-search-box">
            <Search size={15} color="#D6D3D1" />
            <input
              placeholder="Search by invoice ID, customer, email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Filter size={15} color="#8B7355" />
          <select className="inv-select" value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {['All','Paid','Pending','Overdue','Draft'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="inv-btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Invoice
          </button>
        </div>

        {/* ── Invoice Table ── */}
        <div className="inv-table-card">
          <div className="inv-table-scroll">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="inv-empty">
                        <FileText size={36} />
                        <p>No invoices match your search</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map(inv => {
                  const { total } = calcInvoice(inv);
                  return (
                    <tr key={inv.id}>
                      <td><span className="inv-id-cell">{inv.id}</span></td>
                      <td>
                        <div className="inv-customer-name">{inv.customer}</div>
                        <div className="inv-customer-sub">{inv.email}</div>
                      </td>
                      <td style={{ color: '#8B7355' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</td>
                      <td><span className="inv-amount">{inr(total)}</span></td>
                      <td>
                        <span className={`inv-badge ${badgeClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ color: '#8B7355' }}>{inv.date}</td>
                      <td style={{ color: inv.status === 'Overdue' ? '#dc2626' : '#8B7355', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>
                        {inv.dueDate}
                      </td>
                      <td>
                        <div className="inv-actions">
                          <button className="inv-act-btn" title="Preview PDF" onClick={() => setPreview(inv)}>
                            <Eye size={14} />
                          </button>
                          <button className="inv-act-btn" title="Download PDF" onClick={() => printInvoice(inv)}>
                            <Download size={14} />
                          </button>
                          <button className="inv-act-btn btn-blue" title="Send Email" onClick={() => handleEmail(inv)}>
                            <Send size={14} />
                          </button>
                          {inv.status !== 'Paid' && (
                            <button className="inv-act-btn btn-green" title="Mark as Paid" onClick={() => handleMarkPaid(inv.id)}>
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button className="inv-act-btn btn-red" title="Delete" onClick={() => handleDelete(inv.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="inv-pagination">
            <div className="inv-page-info">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} invoices
            </div>
            <div className="inv-page-btns">
              <button className="inv-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`inv-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="inv-page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
