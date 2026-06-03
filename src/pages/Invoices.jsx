// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Admin Invoice Module + PDF Preview                  ║
// ║   Includes: Invoice List, PDF Preview Modal, Create Invoice Modal   ║
// ║   All CSS, all components, all logic — ONE FILE                     ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useEffect } from 'react';
import {
  Search, Eye, Download, FileText, X,
  ChevronLeft, ChevronRight, Printer, CheckCircle,
  AlertCircle, Trash2, Receipt, TrendingUp, Filter,
  Clock, Package, User, Building2,
  Send, Copy, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Plus, DollarSign,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — NexBill Color Palette & Component Styles
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  .inv-page { display:flex; flex-direction:column; gap:20px; font-family:'Inter',system-ui,sans-serif; }

  /* ── KPI Cards ── */
  .inv-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .inv-kpi-card {
    background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:20px;
    display:flex; align-items:flex-start; gap:14px;
    box-shadow:0 1px 4px rgba(45,45,45,0.05);
    position:relative; overflow:hidden;
  }
  .inv-kpi-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
  }
  .inv-kpi-card.kpi-gold::before   { background:linear-gradient(90deg,#C6A969,#8B7355); }
  .inv-kpi-card.kpi-green::before  { background:linear-gradient(90deg,#16a34a,#4ade80); }
  .inv-kpi-card.kpi-amber::before  { background:linear-gradient(90deg,#ca8a04,#fbbf24); }
  .inv-kpi-card.kpi-red::before    { background:linear-gradient(90deg,#dc2626,#f87171); }
  .inv-kpi-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .inv-icon-gold  { background:#EFE7DE; color:#8B7355; }
  .inv-icon-green { background:#DCFCE7; color:#16a34a; }
  .inv-icon-amber { background:#FEF9C3; color:#ca8a04; }
  .inv-icon-red   { background:#FEE2E2; color:#dc2626; }
  .inv-kpi-body   { flex:1; min-width:0; }
  .inv-kpi-value  { font-size:22px; font-weight:800; color:#2D2D2D; line-height:1.1; margin-bottom:3px; }
  .inv-kpi-label  { font-size:12.5px; font-weight:500; color:#3F3F46; }
  .inv-kpi-sub    { font-size:11px; color:#8B7355; margin-top:3px; display:flex; align-items:center; gap:4px; }
  .inv-kpi-trend  { display:inline-flex; align-items:center; gap:2px; font-size:10.5px; font-weight:700; padding:1px 5px; border-radius:5px; margin-top:4px; }
  .trend-up   { background:#DCFCE7; color:#16a34a; }
  .trend-down { background:#FEE2E2; color:#dc2626; }

  /* ── Toolbar ── */
  .inv-toolbar { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .inv-search-box { flex:1; min-width:200px; display:flex; align-items:center; gap:8px; background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:9px; padding:0 12px; height:38px; transition:border-color 0.2s; }
  .inv-search-box:focus-within { border-color:#C6A969; }
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
  .inv-id-cell { font-weight:700; color:#2D2D2D; font-size:13px; font-family:'Inter',monospace; }
  .inv-customer-name { font-weight:600; color:#2D2D2D; font-size:13px; }
  .inv-customer-sub  { font-size:11px; color:#8B7355; margin-top:2px; }
  .inv-amount { font-weight:700; color:#2D2D2D; }
  .inv-payment-chip { display:inline-flex; align-items:center; padding:2px 8px; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:6px; font-size:10.5px; color:#3F3F46; font-weight:500; }

  /* ── Status Badges ── */
  .inv-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.2px; }
  .inv-badge::before { content:''; width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .badge-paid    { background:#DCFCE7; color:#16a34a; }
  .badge-paid::before    { background:#16a34a; }
  .badge-pending { background:#FEF9C3; color:#ca8a04; }
  .badge-pending::before { background:#ca8a04; }
  .badge-overdue { background:#FEE2E2; color:#dc2626; }
  .badge-overdue::before { background:#dc2626; }
  .badge-draft   { background:#F1F5F9; color:#64748b; }
  .badge-draft::before   { background:#64748b; }

  /* ── Action buttons ── */
  .inv-actions { display:flex; align-items:center; gap:4px; }
  .inv-act-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; transition:all 0.15s; flex-shrink:0; }
  .inv-act-btn:hover           { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .inv-act-btn.btn-green:hover { background:#DCFCE7; color:#16a34a; border-color:#86EFAC; }
  .inv-act-btn.btn-red:hover   { background:#FEE2E2; color:#dc2626; border-color:#FCA5A5; }
  .inv-act-btn.btn-blue:hover  { background:#DBEAFE; color:#2563eb; border-color:#93C5FD; }
  .inv-act-btn.btn-amber:hover { background:#FEF9C3; color:#ca8a04; border-color:#FDE68A; }

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
  .inv-pdf-modal { background:#FFFFFF; border-radius:18px; width:100%; max-width:840px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 28px 72px rgba(45,45,45,0.28); overflow:hidden; }
  .inv-pdf-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid #EFE7DE; flex-shrink:0; background:#FFFFFF; gap:12px; }
  .inv-pdf-modal-left { display:flex; align-items:center; gap:12px; min-width:0; }
  .inv-pdf-modal-title { font-size:14px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; white-space:nowrap; }
  .inv-pdf-status-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .inv-pdf-modal-acts { display:flex; gap:8px; align-items:center; flex-shrink:0; }
  .inv-pdf-modal-body { flex:1; overflow-y:auto; padding:28px; background:#F0EDE9; }
  .inv-close-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; transition:all 0.2s; }
  .inv-close-btn:hover { background:#EFE7DE; color:#2D2D2D; }
  .inv-btn-outline { display:flex; align-items:center; gap:6px; padding:0 14px; height:34px; background:#F8F5F2; color:#8B7355; border:1.5px solid #EFE7DE; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; white-space:nowrap; }
  .inv-btn-outline:hover { background:#EFE7DE; color:#2D2D2D; }
  .inv-btn-sm { display:flex; align-items:center; gap:6px; padding:0 16px; height:34px; background:#2D2D2D; color:#F8F5F2; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s,color 0.2s; white-space:nowrap; }
  .inv-btn-sm:hover { background:#C6A969; color:#2D2D2D; }

  /* ── Invoice Document ── */
  .inv-doc { background:#FFFFFF; border-radius:12px; padding:44px; box-shadow:0 4px 24px rgba(45,45,45,0.10); max-width:720px; margin:0 auto; }
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
  .inv-doc-table tbody tr:hover td { background:#FDFCFB; }

  .inv-doc-totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
  .inv-doc-totals-inner { min-width:300px; background:#F8F5F2; border-radius:10px; padding:14px 16px; }
  .inv-doc-tot-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:#3F3F46; }
  .inv-doc-tot-row.discount { color:#16a34a; font-weight:500; }
  .inv-doc-tot-row.grand { border-top:2px solid #EFE7DE; padding-top:10px; margin-top:4px; font-size:15px; font-weight:800; color:#2D2D2D; }

  .inv-doc-footer { display:flex; justify-content:space-between; align-items:flex-end; padding-top:24px; border-top:1px solid #EFE7DE; margin-top:4px; }
  .inv-doc-terms-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:6px; }
  .inv-doc-terms-txt { font-size:11.5px; color:#3F3F46; line-height:1.7; max-width:340px; }
  .inv-doc-sig { text-align:center; }
  .inv-doc-sig-line { width:140px; border-top:1.5px solid #D6D3D1; margin:0 auto 6px; margin-top:36px; }
  .inv-doc-sig-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; }
  .inv-doc-sig-name { font-size:12px; color:#2D2D2D; font-weight:600; margin-top:2px; }
  .inv-doc-thankyou { text-align:center; margin-top:24px; padding:16px; background:linear-gradient(135deg,#F8F5F2,#EFE7DE); border-radius:10px; border:1px solid #EFE7DE; }
  .inv-doc-thankyou-title { font-size:13px; font-weight:700; color:#2D2D2D; }
  .inv-doc-thankyou-sub { font-size:11.5px; color:#8B7355; margin-top:3px; }

  /* ── Create Invoice Modal ── */
  .inv-create-modal { background:#FFFFFF; border-radius:18px; width:100%; max-width:680px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 28px 72px rgba(45,45,45,0.28); overflow:hidden; }
  .inv-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid #EFE7DE; flex-shrink:0; }
  .inv-modal-title { font-size:15px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; }
  .inv-modal-body { flex:1; overflow-y:auto; padding:20px 24px; }
  .inv-modal-foot { padding:16px 24px; border-top:1px solid #EFE7DE; display:flex; gap:10px; justify-content:flex-end; flex-shrink:0; background:#FFFFFF; }

  .inv-field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
  .inv-field label { font-size:10.5px; font-weight:700; color:#3F3F46; text-transform:uppercase; letter-spacing:0.5px; }
  .inv-field input, .inv-field select, .inv-field textarea { padding:9px 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#2D2D2D; background:#F8F5F2; outline:none; font-family:inherit; transition:border-color 0.2s, box-shadow 0.2s; }
  .inv-field input:focus, .inv-field select:focus, .inv-field textarea:focus { border-color:#C6A969; box-shadow:0 0 0 3px rgba(198,169,105,0.12); background:#FFFFFF; }
  .inv-field textarea { resize:vertical; min-height:68px; }
  .inv-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .inv-section-label { font-size:11px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.7px; margin:18px 0 12px; display:flex; align-items:center; gap:6px; }
  .inv-section-label::after { content:''; flex:1; height:1px; background:#EFE7DE; }

  .inv-items-table { width:100%; border-collapse:collapse; margin-bottom:10px; }
  .inv-items-table thead th { padding:6px 8px; text-align:left; font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1.5px solid #EFE7DE; }
  .inv-items-table thead th.right { text-align:right; }
  .inv-items-table tbody td { padding:6px 4px; vertical-align:middle; border-bottom:1px solid #F8F5F2; }
  .inv-items-table tbody tr:last-child td { border-bottom:none; }
  .inv-item-input { padding:8px 10px; border:1.5px solid #EFE7DE; border-radius:8px; font-size:12px; background:#F8F5F2; outline:none; font-family:inherit; width:100%; transition:border-color 0.2s; }
  .inv-item-input:focus { border-color:#C6A969; background:#FFFFFF; }
  /* Hide native number spinners across all browsers */
  .inv-item-input[type=number]::-webkit-inner-spin-button,
  .inv-item-input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  .inv-item-input[type=number] { -moz-appearance:textfield; appearance:textfield; }
  .inv-field input[type=number]::-webkit-inner-spin-button,
  .inv-field input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  .inv-field input[type=number] { -moz-appearance:textfield; appearance:textfield; }

  /* Discount % inline-suffix input */
  .inv-pct-wrap {
    display:flex; align-items:stretch;
    border:1.5px solid #EFE7DE; border-radius:9px;
    background:#F8F5F2; overflow:hidden;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .inv-pct-wrap:focus-within {
    border-color:#C6A969; box-shadow:0 0 0 3px rgba(198,169,105,0.12); background:#FFFFFF;
  }
  .inv-pct-wrap input {
    flex:1; border:none; background:transparent; outline:none;
    padding:9px 10px; font-size:13px; color:#2D2D2D; font-family:inherit;
    min-width:0;
  }
  .inv-pct-sym {
    display:flex; align-items:center; padding:0 12px 0 6px;
    font-size:13px; font-weight:600; color:#8B7355;
    background:transparent; user-select:none; pointer-events:none;
    border-left:1px solid #EFE7DE;
  }
  .inv-item-total { font-size:12px; font-weight:700; color:#2D2D2D; text-align:right; padding-right:4px; white-space:nowrap; }
  .inv-del-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:#FEE2E2; border:none; border-radius:7px; cursor:pointer; color:#dc2626; flex-shrink:0; margin:auto; }
  .inv-del-btn:hover { background:#fca5a5; }
  .inv-del-btn:disabled { opacity:0.3; cursor:not-allowed; }
  .inv-add-item-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; background:#F8F5F2; border:1.5px dashed #C6A969; border-radius:9px; font-size:12px; font-weight:600; color:#8B7355; cursor:pointer; font-family:inherit; transition:all 0.2s; margin-top:10px; }
  .inv-add-item-btn:hover { background:#EFE7DE; color:#2D2D2D; border-style:solid; }

  .inv-totals-box { background:#F8F5F2; border-radius:10px; padding:14px 16px; margin-top:16px; border:1px solid #EFE7DE; }
  .inv-tot-row { display:flex; justify-content:space-between; font-size:13px; color:#3F3F46; margin-bottom:6px; }
  .inv-tot-row:last-child { font-size:15px; font-weight:800; color:#2D2D2D; border-top:1.5px solid #EFE7DE; padding-top:8px; margin-top:4px; margin-bottom:0; }
  .inv-tot-row.green { color:#16a34a; }

  /* ── Empty state ── */
  .inv-empty { display:flex; flex-direction:column; align-items:center; padding:48px 24px; color:#D6D3D1; gap:10px; }
  .inv-empty p { font-size:13px; }

  /* ── Toast ── */
  .inv-toast { position:fixed; top:20px; right:28px; background:#2D2D2D; color:#F8F5F2; padding:12px 18px; border-radius:10px; font-size:13px; display:flex; align-items:center; gap:8px; z-index:9999; box-shadow:0 4px 20px rgba(45,45,45,0.25); animation:invSlideIn 0.25s ease; }
  .inv-toast-err { background:#7A3A3A; }
  @keyframes invSlideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
  .inv-spinner { width:14px; height:14px; border:2px solid rgba(248,245,242,0.3); border-top-color:#F8F5F2; border-radius:50%; animation:invSpin 0.7s linear infinite; flex-shrink:0; }
  @keyframes invSpin { to{transform:rotate(360deg)} }
`;

import api from '../api';

const EMPTY_ITEM = { name: '', qty: '', rate: '', gst: 18 };

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
function printInvoice(inv, co = {}) {
  const { subtotal, gstTotal, total } = calcInvoice(inv);

  // Use real company settings, fallback to placeholders
  const coName    = co.companyName    || 'Your Company';
  const coTagline = co.tagline        || '';
  const coAddr    = co.companyAddress || '';
  const coPhone   = co.companyPhone   || '';
  const coEmail   = co.companyEmail   || '';
  const coGST     = co.gstNumber      || '';
  const coTerms   = co.invoicePaymentTerms || 'Payment is due within 7 days of invoice date. Late payments attract 2% monthly interest. Goods once sold cannot be returned without prior approval.';
  const coFooter  = co.invoiceFooterNote   || `For queries: ${co.companyEmail || ''}`;

  const rows = inv.items.map((it, i) => {
    const lineAmt = it.qty * it.rate;
    const lineGst = (lineAmt * it.gst) / 100;
    const cgst = lineGst / 2;
    const sgst = lineGst / 2;
    return `
      <tr>
        <td style="color:#8B7355;text-align:center">${i + 1}</td>
        <td style="font-weight:600;color:#2D2D2D">${it.name}</td>
        <td style="text-align:right">${it.qty}</td>
        <td style="text-align:right">${inr(it.rate)}</td>
        <td style="text-align:right">${inr(lineAmt)}</td>
        <td style="text-align:right">${it.gst/2}%<br><span style="color:#8B7355;font-size:10px">${inr(cgst)}</span></td>
        <td style="text-align:right">${it.gst/2}%<br><span style="color:#8B7355;font-size:10px">${inr(sgst)}</span></td>
        <td style="text-align:right;font-weight:700;color:#2D2D2D">${inr(lineAmt + lineGst)}</td>
      </tr>`;
  }).join('');

  const stampColor = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Draft:'#64748b' }[inv.status] || '#64748b';

  const statusColors = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Draft:'#64748b', CANCELLED:'#64748b', COMPLETED:'#16a34a' };
  const sColor = statusColors[inv.status] || '#64748b';
  const grandTotal = subtotal + gstTotal - (inv.discount || 0);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.id} — ${coName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f4f4f4;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 0 40px rgba(0,0,0,0.08)}

    /* ── HEADER BAND ── */
    .header-band{background:#1a1a1a;padding:18px 32px;display:flex;justify-content:space-between;align-items:center}
    .brand{display:flex;align-items:center;gap:12px}
    .logo-box{width:40px;height:40px;background:linear-gradient(135deg,#C6A969,#8B7355);border-radius:9px;
      display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;flex-shrink:0}
    .co-name{font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.2px}
    .co-tag{font-size:10px;color:#C6A969;margin-top:1px;font-weight:500}
    .inv-label{text-align:right}
    .inv-word{font-size:28px;font-weight:900;color:#C6A969;letter-spacing:3px;line-height:1}
    .inv-num{font-size:11.5px;color:#a0a0a0;margin-top:4px;font-weight:500}

    /* ── GOLD STRIP ── */
    .gold-strip{height:4px;background:linear-gradient(90deg,#C6A969 0%,#E8D5A0 50%,#8B7355 100%)}

    /* ── META ROW ── */
    .meta-band{background:#f8f6f3;padding:16px 40px;display:flex;gap:0;border-bottom:1px solid #ede9e4}
    .meta-item{flex:1;padding-right:24px;border-right:1px solid #e0dbd4}
    .meta-item:last-child{border-right:none;padding-right:0;padding-left:24px;text-align:right}
    .meta-item:not(:first-child):not(:last-child){padding-left:24px}
    .meta-lbl{font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .meta-val{font-size:13px;font-weight:700;color:#1a1a1a}
    .meta-val.accent{color:#C6A969}
    .status-chip{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
      background:${sColor}18;color:${sColor};border:1.5px solid ${sColor}40}

    /* ── BODY ── */
    .body{padding:24px 40px}

    /* ── PARTIES ── */
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;align-items:start}
    .party-box{background:#f8f6f3;border-radius:8px;padding:12px 16px;border:1px solid #ede9e4}
    .party-box.right{text-align:right}
    .party-lbl{font-size:8.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
    .party-name{font-size:13px;font-weight:800;color:#1a1a1a;margin-bottom:3px}
    .party-info{font-size:11px;color:#555;line-height:1.6}
    .party-gstin{font-size:10.5px;color:#8B7355;font-weight:600;margin-top:3px}
    .co-info{font-size:11px;color:#888;line-height:1.6;margin-top:4px}
    .stamp-wrap{margin-top:10px}
    .stamp{display:inline-block;padding:3px 12px;border:2px solid ${sColor};color:${sColor};
      border-radius:4px;font-size:10px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;
      transform:rotate(-7deg)}

    /* ── TABLE ── */
    .tbl-wrap{border-radius:10px;overflow:hidden;border:1px solid #ede9e4;margin-bottom:24px}
    table{width:100%;border-collapse:collapse}
    thead tr{background:#1a1a1a}
    thead th{padding:11px 14px;font-size:9.5px;font-weight:700;color:#C6A969;text-transform:uppercase;letter-spacing:0.8px;text-align:left}
    thead th.r{text-align:right}
    thead th.c{text-align:center}
    tbody tr:nth-child(even){background:#fafaf9}
    tbody tr:nth-child(odd){background:#fff}
    tbody td{padding:11px 14px;font-size:12.5px;color:#333;border-bottom:1px solid #f0ece8;vertical-align:top}
    tbody tr:last-child td{border-bottom:none}
    .td-num{text-align:center;color:#8B7355;font-weight:600;font-size:11px}
    .td-desc{font-weight:600;color:#1a1a1a}
    .td-sub{font-size:10.5px;color:#888;margin-top:2px}
    .td-r{text-align:right;font-weight:600;color:#1a1a1a}
    .td-gst{text-align:right;color:#555}
    .td-gst-amt{font-size:10px;color:#8B7355;margin-top:2px}
    .td-total{text-align:right;font-weight:800;color:#1a1a1a}

    /* ── TOTALS ── */
    .totals-wrap{display:flex;justify-content:flex-end;margin-bottom:28px}
    .totals-box{width:300px;border-radius:10px;overflow:hidden;border:1px solid #ede9e4}
    .tot-row{display:flex;justify-content:space-between;padding:9px 16px;font-size:12.5px;border-bottom:1px solid #f0ece8}
    .tot-row:last-child{border-bottom:none}
    .tot-lbl{color:#555;font-weight:500}
    .tot-val{font-weight:700;color:#1a1a1a}
    .tot-disc .tot-lbl,.tot-disc .tot-val{color:#16a34a}
    .tot-grand-row{background:#1a1a1a;padding:14px 16px;display:flex;justify-content:space-between;align-items:center}
    .tot-grand-lbl{color:#C6A969;font-size:13px;font-weight:700;letter-spacing:0.3px}
    .tot-grand-val{color:#fff;font-size:18px;font-weight:900}

    /* ── FOOTER ── */
    .footer-band{display:grid;grid-template-columns:1fr auto;gap:32px;align-items:end;padding-top:24px;border-top:2px solid #f0ece8;margin-bottom:0}
    .terms-lbl{font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
    .terms-txt{font-size:11px;color:#666;line-height:1.7;max-width:360px}
    .sig-area{text-align:center;min-width:160px}
    .sig-line{width:140px;border-top:1.5px solid #ccc;margin:32px auto 8px}
    .sig-lbl{font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px}
    .sig-name{font-size:12px;color:#1a1a1a;font-weight:700;margin-top:3px}

    /* ── THANK YOU ── */
    .thankyou{background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:12px 32px;text-align:center}
    .ty-title{font-size:12px;font-weight:700;color:#C6A969;letter-spacing:0.5px}
    .ty-sub{font-size:10.5px;color:#a0a0a0;margin-top:3px}

    @media print{
      body{background:#fff}
      .page{box-shadow:none}
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header-band">
    <div class="brand">
      <div class="logo-box">${coName[0]?.toUpperCase() || 'C'}</div>
      <div>
        <div class="co-name">${coName}</div>
        ${coTagline ? `<div class="co-tag">${coTagline}</div>` : ''}
      </div>
    </div>
    <div class="inv-label">
      <div class="inv-word">INVOICE</div>
      <div class="inv-num">${inv.id}</div>
    </div>
  </div>
  <div class="gold-strip"></div>

  <!-- META BAND -->
  <div class="meta-band">
    <div class="meta-item">
      <div class="meta-lbl">Invoice Date</div>
      <div class="meta-val">${inv.date}</div>
    </div>
    <div class="meta-item">
      <div class="meta-lbl">Due Date</div>
      <div class="meta-val">${inv.dueDate && inv.dueDate !== '—' ? inv.dueDate : 'On Receipt'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-lbl">Payment Mode</div>
      <div class="meta-val accent">${inv.payment}</div>
    </div>
    <div class="meta-item">
      <div class="meta-lbl">Status</div>
      <div class="meta-val"><span class="status-chip">${inv.status}</span></div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- PARTIES -->
    <div class="parties">
      <div class="party-box">
        <div class="party-lbl">Bill To</div>
        <div class="party-name">${inv.customer}</div>
        <div class="party-info">
          ${inv.address ? inv.address + '<br>' : ''}
          ${inv.phone ? inv.phone + '<br>' : ''}
          ${inv.email ? inv.email : ''}
        </div>
        ${inv.gstNo ? `<div class="party-gstin">GSTIN: ${inv.gstNo}</div>` : ''}
      </div>
      <div class="party-box right">
        <div class="party-lbl">From</div>
        <div class="party-name">${coName}</div>
        <div class="co-info">
          ${coAddr ? coAddr + '<br>' : ''}
          ${coPhone ? coPhone + '<br>' : ''}
          ${coEmail ? coEmail : ''}
        </div>
        ${coGST ? `<div class="party-gstin">GSTIN: ${coGST}</div>` : ''}
        <div class="stamp-wrap"><span class="stamp">${inv.status}</span></div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th class="c" style="width:36px">#</th>
            <th>Description</th>
            <th class="r">Qty</th>
            <th class="r">Rate</th>
            <th class="r">Taxable Amt</th>
            <th class="r">CGST</th>
            <th class="r">SGST</th>
            <th class="r">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="tot-row">
          <span class="tot-lbl">Subtotal</span>
          <span class="tot-val">${inr(subtotal)}</span>
        </div>
        <div class="tot-row">
          <span class="tot-lbl">GST Total</span>
          <span class="tot-val">${inr(gstTotal)}</span>
        </div>
        ${inv.discount > 0 ? `<div class="tot-row tot-disc"><span class="tot-lbl">Discount</span><span class="tot-val">-${inr(inv.discount)}</span></div>` : ''}
        <div class="tot-grand-row">
          <span class="tot-grand-lbl">GRAND TOTAL</span>
          <span class="tot-grand-val">${inr(grandTotal)}</span>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer-band">
      <div>
        <div class="terms-lbl">Terms &amp; Conditions</div>
        <div class="terms-txt">${coTerms}</div>
      </div>
      <div class="sig-area">
        <div class="sig-line"></div>
        <div class="sig-lbl">Authorized Signatory</div>
        <div class="sig-name">${coName}</div>
      </div>
    </div>

  </div><!-- /body -->

  <!-- THANK YOU -->
  <div class="thankyou">
    <div class="ty-title">Thank you for your business!</div>
    <div class="ty-sub">${coFooter}</div>
  </div>

</div><!-- /page -->
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
function PDFPreviewModal({ invoice, onClose, onEmail, co = {} }) {
  const { subtotal, gstTotal, total } = calcInvoice(invoice);
  const coName    = co.companyName    || 'Your Company';
  const coTagline = co.tagline        || '';
  const coAddr    = co.companyAddress || '';
  const coPhone   = co.companyPhone   || '';
  const coEmail   = co.companyEmail   || '';
  const coGST     = co.gstNumber      || '';
  const coTerms   = co.invoicePaymentTerms || 'Payment is due within 7 days of invoice date. Late payments attract 2% monthly interest.';
  const coFooter  = co.invoiceFooterNote   || (co.companyEmail ? `For queries: ${co.companyEmail}` : 'Thank you for your business!');

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-pdf-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="inv-pdf-modal-head">
          <div className="inv-pdf-modal-left">
            <FileText size={16} color="#8B7355" />
            <div className="inv-pdf-modal-title">{invoice.id}</div>
            <span className={`inv-pdf-status-badge inv-badge ${badgeClass(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <div className="inv-pdf-modal-acts">
            <button className="inv-btn-sm" onClick={() => printInvoice(invoice, co)}>
              <Printer size={13} /> Print / PDF
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
                  <div className="inv-doc-logo">{coName[0]?.toUpperCase() || 'C'}</div>
                  <div>
                    <div className="inv-doc-company">{coName}</div>
                    {coTagline && <div className="inv-doc-company-sub">{coTagline}</div>}
                  </div>
                </div>
                <div className="inv-doc-addr">
                  {coAddr}{coAddr && <br />}
                  {coPhone}{coPhone && coEmail && ' | '}{coEmail}{(coPhone || coEmail) && <br />}
                  {coGST && <>GSTIN: {coGST}</>}
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
                <div className="inv-doc-terms-txt">{coTerms}</div>
              </div>
              <div className="inv-doc-sig">
                <div className="inv-doc-sig-line" />
                <div className="inv-doc-sig-lbl">Authorized Signatory</div>
                <div className="inv-doc-sig-name">{coName}</div>
              </div>
            </div>

            {/* Thank You */}
            <div className="inv-doc-thankyou">
              <div className="inv-doc-thankyou-title">Thank you for your business!</div>
              <div className="inv-doc-thankyou-sub">{coFooter}</div>
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
    dueDate: '', payment: 'Cash', discount: '', notes: '',
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

  const subtotal     = items.reduce((s, it) => s + it.qty * it.rate, 0);
  const gstTotal     = items.reduce((s, it) => s + (it.qty * it.rate * it.gst) / 100, 0);
  const discountAmt  = ((subtotal + gstTotal) * Math.min(Number(form.discount || 0), 100)) / 100;
  const total        = subtotal + gstTotal - discountAmt;

  const handleSave = async () => {
    if (!form.customer || items.some(it => !it.name)) return;
    setSaving(true);
    try {
      const res = await api.post('/api/billing/create', { ...form, items });
      const inv = res.data;
      const newInv = {
        id:         inv.invoiceNumber || String(inv.id),
        customer:   inv.customer?.name    || form.customer,
        email:      inv.customer?.email   || form.email,
        phone:      inv.customer?.phone   || form.phone,
        address:    inv.customer?.address || form.address,
        gstNo:      inv.customer?.gstNo   || form.gstNo,
        items: (inv.items || items).map(it => ({
          name: it.productName || it.name,
          qty:  parseFloat(it.quantity  || it.qty  || 0),
          rate: parseFloat(it.unitPrice || it.rate || 0),
          gst:  parseFloat(it.gstPercentage || it.gst || 0),
        })),
        subtotal:   parseFloat(inv.subtotal      || 0),
        gstTotal:   parseFloat(inv.gstTotal      || 0),
        discount:   parseFloat(inv.discountTotal || 0),
        grandTotal: parseFloat(inv.grandTotal    || 0),
        status:     inv.status       || 'Draft',
        date:       inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        dueDate:    inv.dueDate   ? new Date(inv.dueDate).toLocaleDateString('en-IN',   { day: '2-digit', month: 'short', year: 'numeric' }) : form.dueDate || '—',
        cashier:    inv.cashierName   || '—',
        counter:    inv.counter       || '—',
        payment:    inv.paymentMethod || form.payment,
      };
      onCreate(newInv);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice. Try again.');
    } finally {
      setSaving(false);
    }
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
          <div className="inv-field">
            <label>Customer Name *</label>
            <input placeholder="Enter customer name" value={form.customer} onChange={e => set('customer', e.target.value)} />
          </div>
          <div className="inv-grid2">
            <div className="inv-field">
              <label>Email</label>
              <input type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="inv-field">
              <label>Phone</label>
              <input placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="inv-field">
            <label>Address</label>
            <input placeholder="Full billing address" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="inv-grid2">
            <div className="inv-field">
              <label>GST Number</label>
              <input placeholder="29AABCN1234M1Z5" value={form.gstNo} onChange={e => set('gstNo', e.target.value)} />
            </div>
            <div className="inv-field">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>

          {/* Line Items */}
          <div className="inv-section-label"><Package size={12} /> Line Items</div>
          <table className="inv-items-table">
            <thead>
              <tr>
                <th style={{ width: '36%' }}>Description</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '18%' }} className="right">Rate (₹)</th>
                <th style={{ width: '11%', textAlign: 'center' }}>GST %</th>
                <th style={{ width: '18%' }} className="right">Amount</th>
                <th style={{ width: '6%' }} />
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const rowTotal = it.qty * it.rate * (1 + it.gst / 100);
                return (
                  <tr key={i}>
                    <td>
                      <input
                        className="inv-item-input"
                        placeholder="Item name"
                        value={it.name}
                        onChange={e => setItem(i, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="inv-item-input"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        placeholder=""
                        value={it.qty}
                        onChange={e => setItem(i, 'qty', e.target.value)}
                        onWheel={e => e.target.blur()}
                        style={{ textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      <input
                        className="inv-item-input"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        placeholder=""
                        value={it.rate}
                        onChange={e => setItem(i, 'rate', e.target.value)}
                        onWheel={e => e.target.blur()}
                        style={{ textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        className="inv-item-input"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="28"
                        value={it.gst}
                        onChange={e => setItem(i, 'gst', e.target.value)}
                        onWheel={e => e.target.blur()}
                        style={{ textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      <div className="inv-item-total">{inr(rowTotal)}</div>
                    </td>
                    <td>
                      <button className="inv-del-btn" onClick={() => removeItem(i)} disabled={items.length === 1}>
                        <X size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="inv-add-item-btn" onClick={addItem}><Plus size={13} /> Add Item</button>

          {/* Discount & Payment */}
          <div className="inv-section-label"><DollarSign size={12} /> Pricing &amp; Payment</div>
          <div className="inv-grid2">
            <div className="inv-field">
              <label>Discount (%)</label>
              <div className="inv-pct-wrap">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  placeholder="e.g. 10"
                  value={form.discount}
                  onChange={e => set('discount', e.target.value)}
                  onWheel={e => e.target.blur()}
                  onBlur={e => {
                    const v = parseFloat(e.target.value);
                    if (isNaN(v) || v < 0) set('discount', '');
                    else if (v > 100) set('discount', 100);
                  }}
                />
                <span className="inv-pct-sym">%</span>
              </div>
            </div>
            <div className="inv-field">
              <label>Payment Method</label>
              <select value={form.payment} onChange={e => set('payment', e.target.value)}>
                {['Cash','Card','UPI','Bank Transfer','Cheque','Pending'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="inv-field">
            <label>Notes</label>
            <textarea placeholder="Additional notes or terms..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {/* Summary */}
          <div className="inv-totals-box">
            <div className="inv-tot-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="inv-tot-row"><span>GST Total</span><span>{inr(gstTotal)}</span></div>
            {Number(form.discount) > 0 && (
              <div className="inv-tot-row green">
                <span>Discount ({form.discount}%)</span>
                <span>-{inr(discountAmt)}</span>
              </div>
            )}
            <div className="inv-tot-row"><span>Grand Total</span><span>{inr(total)}</span></div>
          </div>
        </div>

        <div className="inv-modal-foot">
          <button className="inv-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="inv-btn-primary" onClick={handleSave} disabled={saving || !form.customer}>
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
const PAGE_SIZE = 5;

export default function AdminInvoices() {
  const [invoices, setInvoices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('Active');
  const [page, setPage]             = useState(1);
  const [previewInv, setPreview]    = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState(null);
  const [co, setCo]                 = useState({});

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/billing/history');
      const data = (res.data || []).map(inv => ({
        id:         inv.invoiceNumber || String(inv.id),
        customer:   inv.customer?.name    || inv.customerName || 'Walk-in Customer',
        email:      inv.customer?.email   || '',
        phone:      inv.customer?.phone   || '',
        address:    inv.customer?.address || '',
        gstNo:      inv.customer?.gstNo   || '',
        items: (inv.items || []).map(it => ({
          name: it.productName,
          qty:  parseFloat(it.quantity      || 0),
          rate: parseFloat(it.unitPrice     || 0),
          gst:  parseFloat(it.gstPercentage || 0),
        })),
        subtotal:   parseFloat(inv.subtotal      || 0),
        gstTotal:   parseFloat(inv.gstTotal      || 0),
        discount:   parseFloat(inv.discountTotal || 0),
        grandTotal: parseFloat(inv.grandTotal    || 0),
        totalItems: inv.totalItems || 0,
        status:     inv.status     || 'Paid',
        date:       inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        dueDate:    inv.dueDate   ? new Date(inv.dueDate).toLocaleDateString('en-IN',   { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        cashier:    inv.cashierName   || inv.cashierId || '—',
        counter:    inv.counter       || '—',
        payment:    inv.paymentMethod || 'CASH',
      }));
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    api.get('/api/settings').then(res => setCo(res.data || {})).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q)
      || inv.customer.toLowerCase().includes(q)
      || inv.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All'
      ? true
      : statusFilter === 'Active'
      ? inv.status !== 'CANCELLED'
      : inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/api/billing/status/${id}`, { status: 'Paid' });
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
      showToast('Invoice marked as Paid');
    } catch {
      showToast('Failed to update invoice status. Try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.put(`/api/billing/cancel/${id}`);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'CANCELLED' } : inv));
      showToast(`Invoice ${id} cancelled successfully.`, 'error');
    } catch {
      showToast('Failed to cancel invoice. Try again.', 'error');
    }
  };

  const handleCreate = (newInv) => {
    setInvoices(prev => [newInv, ...prev]);
    showToast(`Invoice ${newInv.id} created successfully!`);
  };

  const handleEmail = async (inv) => {
    try {
      await api.post(`/api/billing/send-email/${inv.id}`);
      showToast(`Email sent for invoice ${inv.id}`);
    } catch {
      showToast('Failed to send email. Try again.', 'error');
    }
  };

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
      {previewInv && (
        <PDFPreviewModal
          invoice={previewInv}
          onClose={() => setPreview(null)}
          onEmail={(inv) => { setPreview(null); handleEmail(inv); }}
          co={co}
        />
      )}

      {/* Create Invoice */}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      <div className="inv-page">
        {/* ── KPI Cards ── */}
        <div className="inv-kpi-grid">
          <div className="inv-kpi-card kpi-gold">
            <div className="inv-kpi-icon inv-icon-gold"><Receipt size={20} /></div>
            <div className="inv-kpi-body">
              <div className="inv-kpi-value">{invoices.length}</div>
              <div className="inv-kpi-label">Total Invoices</div>
              <div className="inv-kpi-sub">
                <span className="inv-kpi-trend trend-up"><ArrowUpRight size={10} /> {paidCount} paid</span>
              </div>
            </div>
          </div>
          <div className="inv-kpi-card kpi-green">
            <div className="inv-kpi-icon inv-icon-green"><TrendingUp size={20} /></div>
            <div className="inv-kpi-body">
              <div className="inv-kpi-value" style={{ fontSize: 18 }}>{inr(totalRevenue)}</div>
              <div className="inv-kpi-label">Total Revenue</div>
              <div className="inv-kpi-sub">
                <span className="inv-kpi-trend trend-up"><ArrowUpRight size={10} /> From {paidCount} paid invoices</span>
              </div>
            </div>
          </div>
          <div className="inv-kpi-card kpi-amber">
            <div className="inv-kpi-icon inv-icon-amber"><Clock size={20} /></div>
            <div className="inv-kpi-body">
              <div className="inv-kpi-value">{pendingCount}</div>
              <div className="inv-kpi-label">Pending</div>
              <div className="inv-kpi-sub">Awaiting payment</div>
            </div>
          </div>
          <div className="inv-kpi-card kpi-red">
            <div className="inv-kpi-icon inv-icon-red"><AlertCircle size={20} /></div>
            <div className="inv-kpi-body">
              <div className="inv-kpi-value">{overdueCount}</div>
              <div className="inv-kpi-label">Overdue</div>
              <div className="inv-kpi-sub">
                {overdueCount > 0 && <span className="inv-kpi-trend trend-down"><ArrowDownRight size={10} /> Action needed</span>}
                {overdueCount === 0 && 'All clear'}
              </div>
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
          <Filter size={15} color="#8B7355" style={{ flexShrink: 0 }} />
          <select className="inv-select" value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {['Active','All','Paid','Pending','CANCELLED'].map(s => <option key={s}>{s}</option>)}
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
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
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
                      <td><span className="inv-payment-chip">{inv.payment}</span></td>
                      <td style={{ color: '#8B7355' }}>{inv.date}</td>
                      <td style={{ color: inv.status === 'Overdue' ? '#dc2626' : '#8B7355', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>
                        {inv.dueDate}
                      </td>
                      <td>
                        <div className="inv-actions">
                          <button className="inv-act-btn" title="Preview PDF" onClick={() => setPreview(inv)}>
                            <Eye size={14} />
                          </button>
                          <button className="inv-act-btn" title="Download PDF" onClick={() => printInvoice(inv, co)}>
                            <Download size={14} />
                          </button>
                          {inv.status !== 'Paid' && (
                            <button className="inv-act-btn btn-green" title="Mark as Paid" onClick={() => handleMarkPaid(inv.id)}>
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {inv.status !== 'CANCELLED' && (
                            <button className="inv-act-btn btn-red" title="Cancel Invoice" onClick={() => handleDelete(inv.id)}>
                              <X size={14} />
                            </button>
                          )}
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
              Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} invoices
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
