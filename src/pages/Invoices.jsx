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
  Copy, MoreHorizontal, ArrowUpRight, ArrowDownRight,
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
  .inv-doc { background:#FFFFFF; border-radius:12px; overflow:hidden; max-width:740px; margin:0 auto; box-shadow:0 4px 24px rgba(45,45,45,0.12); }
  .inv-doc-header-band { background:#F8F6F3; border-bottom:1px solid #EDE9E4; padding:18px 28px; display:flex; justify-content:space-between; align-items:center; }
  .inv-doc-brand  { display:flex; align-items:center; gap:12px; }
  .inv-doc-logo   { width:42px; height:42px; background:#FFFFFF; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:#2D2D2D; flex-shrink:0; overflow:hidden; padding:3px; border:1px solid #EDE9E4; }
  .inv-doc-logo img { width:100%; height:100%; object-fit:contain; border-radius:6px; }
  .inv-doc-company     { font-size:15px; font-weight:800; color:#2D2D2D; }
  .inv-doc-company-sub { font-size:10px; color:#8B7355; margin-top:2px; }
  .inv-doc-addr        { font-size:10px; color:#8B7355; margin-top:3px; }
  .inv-doc-inv-label  { text-align:right; }
  .inv-doc-title      { font-size:20px; font-weight:900; color:#C6A969; letter-spacing:4px; line-height:1; }
  .inv-doc-inv-num    { font-size:11px; color:#8B7355; margin-top:4px; }
  .inv-doc-gold-strip { height:4px; background:linear-gradient(90deg,#C6A969 0%,#E8D5A0 50%,#8B7355 100%); }
  .inv-doc-meta-band  { background:#F8F6F3; padding:12px 28px; display:flex; gap:0; border-bottom:1px solid #EDE9E4; }
  .inv-doc-meta-item  { flex:1; padding-right:20px; border-right:1px solid #E0DBD4; }
  .inv-doc-meta-item:last-child { border-right:none; padding-right:0; padding-left:20px; text-align:right; }
  .inv-doc-meta-item:not(:first-child):not(:last-child) { padding-left:20px; }
  .inv-doc-meta-lbl   { font-size:9px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
  .inv-doc-meta-val   { font-size:12px; font-weight:700; color:#2D2D2D; }
  .inv-doc-meta-val.accent { color:#C6A969; }
  .inv-doc-status-chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .inv-doc-body { padding:20px 28px; }
  .inv-doc-parties { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
  .inv-doc-party   { background:#F8F6F3; border-radius:8px; padding:12px 14px; border:1px solid #EDE9E4; }
  .inv-doc-party.right { text-align:right; }
  .inv-doc-party-lbl  { font-size:8.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .inv-doc-party-name { font-size:13px; font-weight:800; color:#2D2D2D; margin-bottom:3px; }
  .inv-doc-party-info { font-size:11px; color:#555; line-height:1.6; }
  .inv-doc-party-gstin{ font-size:10.5px; color:#8B7355; font-weight:600; margin-top:3px; }
  .inv-doc-stamp { display:inline-block; padding:3px 12px; border-radius:4px; font-size:10px; font-weight:900; letter-spacing:2.5px; text-transform:uppercase; transform:rotate(-7deg); margin-top:10px; }
  .inv-doc-table-wrap { border-radius:10px; overflow:hidden; border:1px solid #EDE9E4; margin-bottom:16px; }
  .inv-doc-table { width:100%; border-collapse:collapse; }
  .inv-doc-table thead tr { background:#F8F6F3; border-bottom:1px solid #EDE9E4; }
  .inv-doc-table thead th { padding:10px 12px; font-size:9.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; text-align:left; }
  .inv-doc-table thead th.r { text-align:right; }
  .inv-doc-table thead th.c { text-align:center; }
  .inv-doc-table tbody tr:nth-child(even) { background:#FAFAF9; }
  .inv-doc-table tbody tr:nth-child(odd)  { background:#FFFFFF; }
  .inv-doc-table tbody td { padding:10px 12px; font-size:12.5px; color:#333; border-bottom:1px solid #F0ECE8; }
  .inv-doc-table tbody tr:last-child td { border-bottom:none; }
  .inv-doc-table tbody td.r    { text-align:right; font-weight:600; color:#2D2D2D; }
  .inv-doc-table tbody td.c    { text-align:center; color:#8B7355; font-weight:600; font-size:11px; }
  .inv-doc-table tbody td.bold { font-weight:700; color:#2D2D2D; }
  .inv-doc-totals-wrap { display:flex; justify-content:flex-end; margin-bottom:20px; }
  .inv-doc-totals-box  { width:280px; border-radius:10px; overflow:hidden; border:1px solid #EDE9E4; }
  .inv-doc-tot-row     { display:flex; justify-content:space-between; padding:8px 14px; font-size:12.5px; border-bottom:1px solid #F0ECE8; }
  .inv-doc-tot-row:last-child { border-bottom:none; }
  .inv-doc-tot-lbl { color:#555; font-weight:500; }
  .inv-doc-tot-val { font-weight:700; color:#2D2D2D; }
  .inv-doc-tot-disc .inv-doc-tot-lbl, .inv-doc-tot-disc .inv-doc-tot-val { color:#16a34a; }
  .inv-doc-grand-row { background:#F8F6F3; border-top:2px solid #C6A969; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; }
  .inv-doc-grand-lbl { color:#8B7355; font-size:12px; font-weight:700; }
  .inv-doc-grand-val { color:#2D2D2D; font-size:18px; font-weight:900; }
  .inv-doc-footer { display:grid; grid-template-columns:1fr auto; gap:24px; align-items:flex-end; padding-top:16px; border-top:2px solid #F0ECE8; }
  .inv-doc-terms-lbl { font-size:9px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .inv-doc-terms-txt { font-size:11px; color:#555; line-height:1.6; max-width:340px; }
  .inv-doc-sig       { text-align:center; min-width:140px; }
  .inv-doc-sig-line  { width:120px; border-top:1.5px solid #CCC; margin:28px auto 6px; }
  .inv-doc-sig-lbl   { font-size:9px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; }
  .inv-doc-sig-name  { font-size:11px; color:#2D2D2D; font-weight:700; margin-top:2px; }
  .inv-doc-thankyou  { background:#F8F6F3; border-top:1px solid #EDE9E4; padding:12px 28px; text-align:center; }
  .inv-doc-thankyou-title { font-size:12px; font-weight:700; color:#8B7355; }
  .inv-doc-thankyou-sub   { font-size:10.5px; color:#8B7355; margin-top:2px; }

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
import { getPageNumbers } from '../utils/pagination';

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
  if (status === 'Paid')      return 'badge-paid';
  if (status === 'Pending')   return 'badge-pending';
  if (status === 'Overdue')   return 'badge-overdue';
  if (status === 'Cancelled') return 'badge-draft';
  return 'badge-draft';
}

// Normalize raw backend status + compute overdue from dueDate
function normalizeStatus(rawStatus, rawDueDate) {
  const s = (rawStatus || 'PENDING').toUpperCase();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isPastDue = rawDueDate && new Date(rawDueDate) < today && !['COMPLETED','PAID','CANCELLED'].includes(s);
  if (isPastDue)                         return 'Overdue';
  if (['COMPLETED','PAID'].includes(s))  return 'Paid';
  if (s === 'CANCELLED')                 return 'Cancelled';
  return 'Pending';
}

function stampStyle(status) {
  const colors = { Paid: '#16a34a', Pending: '#ca8a04', Overdue: '#dc2626', Cancelled: '#64748b' };
  return { border: `3px solid ${colors[status] || '#64748b'}`, color: colors[status] || '#64748b' };
}

/* ══════════════════════════════════════════════════════════════════════
   AMOUNT IN WORDS
══════════════════════════════════════════════════════════════════════ */
function amountInWords(amount) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function num(n) {
    if (n === 0) return '';
    if (n < 20)  return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '') + ' ';
    if (n < 1000)    return ones[Math.floor(n/100)]  + ' Hundred '  + num(n%100);
    if (n < 100000)  return num(Math.floor(n/1000))  + 'Thousand '  + num(n%1000);
    if (n < 10000000)return num(Math.floor(n/100000))+ 'Lakh '      + num(n%100000);
    return num(Math.floor(n/10000000))+'Crore '+num(n%10000000);
  }
  const r = Math.floor(amount), p = Math.round((amount-r)*100);
  return (num(r).trim()||'Zero')+' Rupees'+(p>0?' and '+num(p).trim()+' Paise':'')+' Only';
}

/* ══════════════════════════════════════════════════════════════════════
   PRINT / PDF — REAL ERP TAX INVOICE
══════════════════════════════════════════════════════════════════════ */
function printInvoice(inv, co = {}) {
  const { subtotal, gstTotal } = calcInvoice(inv);
  const P = ['Company Name Not Set','Please update Company Name','Please update Address'];
  const clean = v => (!v || P.includes(v?.trim())) ? '' : v.trim();
  const coName    = clean(co.companyName) || 'Your Company';
  const coTagline = co.tagline || '';
  const coAddr    = clean(co.companyAddress) || '';
  const coPhone   = co.companyPhone || '';
  const coEmail   = co.companyEmail || '';
  const coGST     = co.gstNumber || '';
  const coTerms   = co.defaultPaymentTerms || co.invoicePaymentTerms || '';
  const coFooter  = co.invoiceFooterNote || '';
  const showSig   = co.showSignatureArea !== false;
  const showTerms = co.showTermsAndConditions !== false;

  const grandTotal = subtotal + gstTotal - (inv.discount || 0);
  const sColors = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Cancelled:'#64748b' };
  const sColor  = sColors[inv.status] || '#16a34a';

  const rows = inv.items.map((it, i) => {
    const taxable = it.qty * it.rate;
    const gstAmt  = taxable * it.gst / 100;
    return `<tr>
      <td class="c">${i+1}</td>
      <td><strong>${it.name}</strong></td>
      <td class="c">${it.qty}</td>
      <td class="r">${inr(it.rate)}</td>
      <td class="r">${inr(taxable)}</td>
      <td class="c">${it.gst}%</td>
      <td class="r">${inr(gstAmt)}</td>
      <td class="r bold">${inr(taxable+gstAmt)}</td>
    </tr>`;
  }).join('');

  const taxMap = {};
  inv.items.forEach(it => {
    const taxable = it.qty * it.rate;
    if (!taxMap[it.gst]) taxMap[it.gst] = { taxable:0, gst:0 };
    taxMap[it.gst].taxable += taxable;
    taxMap[it.gst].gst     += taxable * it.gst / 100;
  });
  const taxRows = Object.entries(taxMap).map(([rate, v]) =>
    '<tr><td>' + rate + '%</td><td class="r">' + inr(v.taxable) + '</td><td class="r bold">' + inr(v.gst) + '</td></tr>'
  ).join('');

  const discountHtml = inv.discount > 0
    ? '<div class="tot-row tot-disc"><span class="tot-lbl">Discount</span><span class="tot-val">-' + inr(inv.discount) + '</span></div>'
    : '';
  const termsHtml = showTerms
    ? '<div><div class="terms-lbl">Terms &amp; Conditions</div><div class="terms-txt">' + coTerms + '</div></div>'
    : '<div></div>';
  const sigImgHtml = co.signatureUrl
    ? '<img src="' + co.signatureUrl + '" style="max-height:50px;max-width:160px;display:block;margin:0 auto 7px;object-fit:contain;" />'
    : '<div class="sig-line"></div>';
  const sigHtml = showSig
    ? '<div class="sig-area">' + sigImgHtml + '<div class="sig-lbl">Authorized Signatory</div><div class="sig-name">' + coName + '</div><div class="eoe">E. &amp; O.E.</div></div>'
    : '';
  const footerHtml = (showTerms || showSig)
    ? '<div class="footer">' + termsHtml + sigHtml + '</div>'
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TAX INVOICE — ${inv.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @page{margin:0;size:A4}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f0f0f0;color:#2D2D2D;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12px}
    .page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 0 40px rgba(0,0,0,0.1)}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;max-width:100%}}
    .hdr{background:#F8F6F3;border-bottom:1px solid #EDE9E4;padding:20px 32px;display:flex;justify-content:space-between;align-items:flex-start}
    .hdr-brand{display:flex;align-items:center;gap:12px}
    .hdr-logo{width:44px;height:44px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#C6A969;flex-shrink:0;border:1px solid #EDE9E4;background:#fff}
    .hdr-logo img{width:100%;height:100%;object-fit:contain}
    .hdr-name{font-size:17px;font-weight:800;color:#2D2D2D}
    .hdr-tag{font-size:10px;color:#8B7355;margin-top:2px}
    .hdr-addr{font-size:9.5px;color:#8B7355;margin-top:3px;line-height:1.6}
    .hdr-right{text-align:right}
    .hdr-inv-type{font-size:22px;font-weight:900;color:#C6A969;letter-spacing:4px;line-height:1}
    .hdr-inv-num{font-size:11px;color:#8B7355;margin-top:4px;font-weight:500}
    .gold-strip{height:4px;background:linear-gradient(90deg,#C6A969,#E8D5A0,#8B7355)}
    .info-band{background:#f8f6f3;border-bottom:1px solid #e8e2da;display:flex}
    .info-col{flex:1;padding:12px 20px;border-right:1px solid #e0dbd4}
    .info-col:last-child{border-right:none}
    .info-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:3px}
    .info-val{font-size:12px;font-weight:700;color:#2D2D2D}
    .info-val.gold{color:#C6A969}
    .status-pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${sColor}20;color:${sColor};border:1.5px solid ${sColor}50}
    .body{padding:20px 32px}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
    .party{background:#f8f6f3;border:1px solid #e8e2da;border-radius:8px;padding:12px 16px}
    .party.seller{text-align:right}
    .party-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;border-bottom:1px solid #e8e2da;padding-bottom:5px}
    .party-name{font-size:13px;font-weight:800;color:#2D2D2D;margin-bottom:4px}
    .party-detail{font-size:10.5px;color:#555;line-height:1.7}
    .party-gstin{font-size:10px;color:#8B7355;font-weight:600;margin-top:4px;padding-top:4px;border-top:1px dashed #e0dbd4}
    .stamp{display:inline-block;margin-top:8px;padding:3px 14px;border:2.5px solid ${sColor};color:${sColor};border-radius:3px;font-size:9px;font-weight:900;letter-spacing:3px;text-transform:uppercase;transform:rotate(-5deg)}
    .tbl-wrap{border:1px solid #ddd;border-radius:8px;overflow:hidden;margin-bottom:16px}
    .tbl{width:100%;border-collapse:collapse;font-size:11px}
    .tbl thead tr{background:#F8F6F3;border-bottom:1px solid #EDE9E4}
    .tbl thead th{padding:9px 10px;color:#8B7355;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:0.8px;text-align:left;white-space:nowrap}
    .tbl thead th.r{text-align:right}
    .tbl thead th.c{text-align:center}
    .tbl thead th.group{text-align:center;background:#2a2a2a;border-bottom:1px solid #3a3a3a;font-size:8.5px;letter-spacing:0.5px}
    .tbl tbody tr:nth-child(even){background:#fafafa}
    .tbl tbody tr:nth-child(odd){background:#fff}
    .tbl tbody td{padding:9px 10px;color:#333;border-bottom:1px solid #f0ece8;vertical-align:middle}
    .tbl tbody tr:last-child td{border-bottom:none}
    .tbl td.c{text-align:center}
    .tbl td.r{text-align:right}
    .tbl td.bold{font-weight:700;color:#2D2D2D}
    .bottom{display:grid;grid-template-columns:1fr 280px;gap:20px;margin-bottom:16px}
    .tax-summary{border:1px solid #e8e2da;border-radius:8px;overflow:hidden}
    .tax-title{background:#f0ede8;padding:7px 12px;font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e8e2da}
    .tax-tbl{width:100%;border-collapse:collapse;font-size:10.5px}
    .tax-tbl thead th{padding:7px 10px;background:#f8f6f3;font-size:8.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid #e8e2da}
    .tax-tbl thead th:first-child{text-align:left}
    .tax-tbl tbody td{padding:7px 10px;border-bottom:1px solid #f5f2ef;text-align:right;color:#333}
    .tax-tbl tbody td:first-child{text-align:left;font-weight:600;color:#2D2D2D}
    .tax-tbl tbody tr:last-child td{border-bottom:none}
    .totals{border:1px solid #e8e2da;border-radius:8px;overflow:hidden}
    .tot-row{display:flex;justify-content:space-between;padding:8px 14px;font-size:12px;border-bottom:1px solid #f5f2ef}
    .tot-row:last-child{border-bottom:none}
    .tot-lbl{color:#666;font-weight:500}
    .tot-val{font-weight:700;color:#2D2D2D}
    .tot-disc .tot-lbl,.tot-disc .tot-val{color:#16a34a}
    .tot-grand{background:#F8F6F3;border-top:2px solid #C6A969;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
    .tot-grand-lbl{color:#8B7355;font-size:12px;font-weight:700;letter-spacing:0.5px}
    .tot-grand-val{color:#2D2D2D;font-size:17px;font-weight:900}
    .amt-words{background:#f8f6f3;border:1px solid #e8e2da;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:11px}
    .amt-words-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}
    .amt-words-val{font-weight:600;color:#2D2D2D;font-style:italic}
    .footer{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:flex-end;padding-top:16px;border-top:2px solid #f0ece8}
    .terms-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
    .terms-txt{font-size:10.5px;color:#666;line-height:1.7;max-width:380px}
    .sig-area{text-align:center;min-width:160px}
    .sig-line{width:140px;border-top:1.5px solid #ccc;margin:36px auto 7px}
    .sig-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px}
    .sig-name{font-size:11px;color:#2D2D2D;font-weight:700;margin-top:3px}
    .eoe{font-size:9px;color:#aaa;margin-top:4px;font-style:italic}
    .ty-band{background:#F8F6F3;border-top:1px solid #EDE9E4;padding:12px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:20px}
    .ty-title{font-size:12px;font-weight:700;color:#8B7355}
    .ty-note{font-size:9.5px;color:#8B7355}
    .comp-gen{font-size:8.5px;color:#aaa;text-align:center;padding:6px;background:#f8f6f3;border-top:1px solid #e8e2da}
  </style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="hdr-brand">
      <div class="hdr-logo">${co.logoUrl?`<img src="${co.logoUrl}">`:`<span>${coName[0]?.toUpperCase()||'C'}</span>`}</div>
      <div>
        <div class="hdr-name">${coName}</div>
        ${coTagline?`<div class="hdr-tag">${coTagline}</div>`:''}
        <div class="hdr-addr">${[coAddr,coPhone,coEmail].filter(Boolean).join(' &nbsp;|&nbsp; ')}${coGST?` &nbsp;|&nbsp; GSTIN: ${coGST}`:''}</div>
      </div>
    </div>
    <div class="hdr-right">
      <div class="hdr-inv-type">TAX INVOICE</div>
      <div class="hdr-inv-num"># ${inv.id}</div>
    </div>
  </div>
  <div class="gold-strip"></div>
  <div class="info-band">
    <div class="info-col"><div class="info-lbl">Invoice Date</div><div class="info-val">${inv.date||'—'}</div></div>
    <div class="info-col"><div class="info-lbl">Due Date</div><div class="info-val">${inv.dueDate&&inv.dueDate!=='—'?inv.dueDate:'On Receipt'}</div></div>
    <div class="info-col"><div class="info-lbl">Payment Mode</div><div class="info-val gold">${inv.payment||'—'}</div></div>
    <div class="info-col"><div class="info-lbl">Place of Supply</div><div class="info-val">${coAddr?coAddr.split(',').pop()?.trim()||'':''}</div></div>
    <div class="info-col" style="text-align:right"><div class="info-lbl">Status</div><div class="info-val"><span class="status-pill">${inv.status}</span></div></div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party">
        <div class="party-lbl">Bill To</div>
        <div class="party-name">${inv.customer||'Walk-in Customer'}</div>
        <div class="party-detail">${inv.phone?`<div>${inv.phone}</div>`:''}${inv.email?`<div>${inv.email}</div>`:''}${inv.address?`<div>${inv.address}</div>`:''}</div>
        ${inv.gstNo?`<div class="party-gstin">GSTIN: ${inv.gstNo}</div>`:''}
      </div>
      <div class="party seller">
        <div class="party-lbl">Seller Details</div>
        <div class="party-name">${coName}</div>
        <div class="party-detail">${coPhone?`<div>${coPhone}</div>`:''}${coEmail?`<div>${coEmail}</div>`:''}${coAddr?`<div>${coAddr}</div>`:''}</div>
        ${coGST?`<div class="party-gstin">GSTIN: ${coGST}</div>`:''}
        <div><span class="stamp">${inv.status}</span></div>
      </div>
    </div>
    <div class="tbl-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th class="c" style="width:30px">#</th>
            <th>Description</th>
            <th class="c">Qty</th>
            <th class="r">Rate</th>
            <th class="r">Taxable Amt</th>
            <th class="c">GST %</th>
            <th class="r">GST Amt</th>
            <th class="r">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="bottom">
      <div class="tax-summary">
        <div class="tax-title">Tax Summary</div>
        <table class="tax-tbl">
          <thead><tr><th>GST Rate</th><th>Taxable Amt</th><th>GST Amount</th></tr></thead>
          <tbody>${taxRows}</tbody>
        </table>
      </div>
      <div class="totals">
        <div class="tot-row"><span class="tot-lbl">Subtotal</span><span class="tot-val">${inr(subtotal)}</span></div>
        <div class="tot-row"><span class="tot-lbl">GST</span><span class="tot-val">${inr(gstTotal)}</span></div>
        ${discountHtml}
        <div class="tot-grand"><span class="tot-grand-lbl">GRAND TOTAL</span><span class="tot-grand-val">${inr(grandTotal)}</span></div>
      </div>
    </div>
    <div class="amt-words">
      <div class="amt-words-lbl">Amount in Words</div>
      <div class="amt-words-val">${amountInWords(grandTotal)}</div>
    </div>
    ${footerHtml}
  </div>
  ${coFooter ? '<div class="ty-band"><div class="ty-title">' + coFooter + '</div></div>' : ''}
  <div class="comp-gen">This is a computer generated invoice and does not require a physical signature.</div>
</div>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;border:none;pointer-events:none;';
  document.body.appendChild(iframe);
  iframe.onload = function() {
    setTimeout(() => {
      iframe.contentWindow.onafterprint = function() {
        try { document.body.removeChild(iframe); } catch {}
      };
      iframe.contentWindow.print();
    }, 500);
  };
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  iframe.src = url;
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ══════════════════════════════════════════════════════════════════════
   DOWNLOAD PDF — jsPDF + html2canvas (no popup window)
══════════════════════════════════════════════════════════════════════ */
async function downloadInvoicePDF(inv, co = {}) {
  const h2c = window.html2canvas;
  const jsPDF = window.jspdf?.jsPDF;
  if (!h2c || !jsPDF) {
    alert('PDF engine loading, please try again in a moment.');
    return;
  }
  const { subtotal, gstTotal } = calcInvoice(inv);
  const P = ['Company Name Not Set','Please update Company Name','Please update Address'];
  const clean = v => (!v || P.includes(v?.trim())) ? '' : v.trim();
  const coName    = clean(co.companyName) || 'Your Company';
  const coTagline = co.tagline || '';
  const coAddr    = clean(co.companyAddress) || '';
  const coPhone   = co.companyPhone || '';
  const coEmail   = co.companyEmail || '';
  const coGST     = co.gstNumber || '';
  const coTerms   = co.defaultPaymentTerms || co.invoicePaymentTerms || '';
  const coFooter  = co.invoiceFooterNote || '';
  const showSig   = co.showSignatureArea !== false;
  const showTerms = co.showTermsAndConditions !== false;

  const grandTotal = subtotal + gstTotal - (inv.discount || 0);
  const sColors = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Cancelled:'#64748b' };
  const sColor  = sColors[inv.status] || '#16a34a';

  const rows = inv.items.map((it, i) => {
    const taxable = it.qty * it.rate;
    const gstAmt  = taxable * it.gst / 100;
    return `<tr><td class="c">${i+1}</td><td><strong>${it.name}</strong></td><td class="c">${it.qty}</td><td class="r">${inr(it.rate)}</td><td class="r">${inr(taxable)}</td><td class="c">${it.gst}%</td><td class="r">${inr(gstAmt)}</td><td class="r bold">${inr(taxable+gstAmt)}</td></tr>`;
  }).join('');

  const taxMap = {};
  inv.items.forEach(it => {
    const taxable = it.qty * it.rate;
    if (!taxMap[it.gst]) taxMap[it.gst] = { taxable:0, gst:0 };
    taxMap[it.gst].taxable += taxable;
    taxMap[it.gst].gst     += taxable * it.gst / 100;
  });
  const taxRows = Object.entries(taxMap).map(([rate, v]) =>
    '<tr><td>' + rate + '%</td><td class="r">' + inr(v.taxable) + '</td><td class="r bold">' + inr(v.gst) + '</td></tr>'
  ).join('');

  const discountHtml = inv.discount > 0
    ? '<div class="tot-row tot-disc"><span class="tot-lbl">Discount</span><span class="tot-val">-' + inr(inv.discount) + '</span></div>' : '';
  const termsHtml = showTerms
    ? '<div><div class="terms-lbl">Terms &amp; Conditions</div><div class="terms-txt">' + coTerms + '</div></div>'
    : '<div></div>';
  const sigImgHtml2 = co.signatureUrl
    ? '<img src="' + co.signatureUrl + '" style="max-height:50px;max-width:160px;display:block;margin:0 auto 7px;object-fit:contain;" />'
    : '<div class="sig-line"></div>';
  const sigHtml = showSig
    ? '<div class="sig-area">' + sigImgHtml2 + '<div class="sig-lbl">Authorized Signatory</div><div class="sig-name">' + coName + '</div><div class="eoe">E. &amp; O.E.</div></div>'
    : '';
  const footerHtml = (showTerms || showSig)
    ? '<div class="footer">' + termsHtml + sigHtml + '</div>' : '';

  // Reuse same CSS from printInvoice (without the print script)
  const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#fff;color:#2D2D2D;font-size:12px}
    .page{background:#fff;width:860px}
    .hdr{background:#F8F6F3;border-bottom:1px solid #EDE9E4;padding:20px 32px;display:flex;justify-content:space-between;align-items:flex-start}
    .hdr-brand{display:flex;align-items:center;gap:12px}
    .hdr-logo{width:44px;height:44px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#C6A969;flex-shrink:0;border:1px solid #EDE9E4;background:#fff}
    .hdr-logo img{width:100%;height:100%;object-fit:contain}
    .hdr-name{font-size:17px;font-weight:800;color:#2D2D2D}
    .hdr-tag{font-size:10px;color:#8B7355;margin-top:2px}
    .hdr-addr{font-size:9.5px;color:#8B7355;margin-top:3px;line-height:1.6}
    .hdr-right{text-align:right}
    .hdr-inv-type{font-size:22px;font-weight:900;color:#C6A969;letter-spacing:4px;line-height:1}
    .hdr-inv-num{font-size:11px;color:#8B7355;margin-top:4px;font-weight:500}
    .gold-strip{height:4px;background:linear-gradient(90deg,#C6A969,#E8D5A0,#8B7355)}
    .info-band{background:#f8f6f3;border-bottom:1px solid #e8e2da;display:flex}
    .info-col{flex:1;padding:12px 20px;border-right:1px solid #e0dbd4}
    .info-col:last-child{border-right:none}
    .info-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:3px}
    .info-val{font-size:12px;font-weight:700;color:#2D2D2D}
    .info-val.gold{color:#C6A969}
    .status-pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${sColor}20;color:${sColor};border:1.5px solid ${sColor}50}
    .body{padding:20px 32px}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
    .party{background:#f8f6f3;border:1px solid #e8e2da;border-radius:8px;padding:12px 16px}
    .party.seller{text-align:right}
    .party-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;border-bottom:1px solid #e8e2da;padding-bottom:5px}
    .party-name{font-size:13px;font-weight:800;color:#2D2D2D;margin-bottom:4px}
    .party-detail{font-size:10.5px;color:#555;line-height:1.7}
    .party-gstin{font-size:10px;color:#8B7355;font-weight:600;margin-top:4px;padding-top:4px;border-top:1px dashed #e0dbd4}
    .stamp{display:inline-block;margin-top:8px;padding:3px 14px;border:2.5px solid ${sColor};color:${sColor};border-radius:3px;font-size:9px;font-weight:900;letter-spacing:3px;text-transform:uppercase;transform:rotate(-5deg)}
    .tbl-wrap{border:1px solid #ddd;border-radius:8px;overflow:hidden;margin-bottom:16px}
    .tbl{width:100%;border-collapse:collapse;font-size:11px}
    .tbl thead tr{background:#F8F6F3;border-bottom:1px solid #EDE9E4}
    .tbl thead th{padding:9px 10px;color:#8B7355;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:0.8px;text-align:left;white-space:nowrap}
    .tbl thead th.r{text-align:right}.tbl thead th.c{text-align:center}
    .tbl tbody tr:nth-child(even){background:#fafafa}.tbl tbody tr:nth-child(odd){background:#fff}
    .tbl tbody td{padding:9px 10px;color:#333;border-bottom:1px solid #f0ece8;vertical-align:middle}
    .tbl tbody tr:last-child td{border-bottom:none}
    .tbl td.c{text-align:center}.tbl td.r{text-align:right}.tbl td.bold{font-weight:700;color:#2D2D2D}
    .bottom{display:grid;grid-template-columns:1fr 280px;gap:20px;margin-bottom:16px}
    .tax-summary{border:1px solid #e8e2da;border-radius:8px;overflow:hidden}
    .tax-title{background:#f0ede8;padding:7px 12px;font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e8e2da}
    .tax-tbl{width:100%;border-collapse:collapse;font-size:10.5px}
    .tax-tbl thead th{padding:7px 10px;background:#f8f6f3;font-size:8.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid #e8e2da}
    .tax-tbl thead th:first-child{text-align:left}
    .tax-tbl tbody td{padding:7px 10px;border-bottom:1px solid #f5f2ef;text-align:right;color:#333}
    .tax-tbl tbody td:first-child{text-align:left;font-weight:600;color:#2D2D2D}
    .totals{border:1px solid #e8e2da;border-radius:8px;overflow:hidden}
    .tot-row{display:flex;justify-content:space-between;padding:8px 14px;font-size:12px;border-bottom:1px solid #f5f2ef}
    .tot-row:last-child{border-bottom:none}
    .tot-lbl{color:#666;font-weight:500}.tot-val{font-weight:700;color:#2D2D2D}
    .tot-disc .tot-lbl,.tot-disc .tot-val{color:#16a34a}
    .tot-grand{background:#F8F6F3;border-top:2px solid #C6A969;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
    .tot-grand-lbl{color:#8B7355;font-size:12px;font-weight:700;letter-spacing:0.5px}
    .tot-grand-val{color:#2D2D2D;font-size:17px;font-weight:900}
    .amt-words{background:#f8f6f3;border:1px solid #e8e2da;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:11px}
    .amt-words-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}
    .amt-words-val{font-weight:600;color:#2D2D2D;font-style:italic}
    .footer{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:flex-end;padding-top:16px;border-top:2px solid #f0ece8}
    .terms-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
    .terms-txt{font-size:10.5px;color:#666;line-height:1.7;max-width:380px}
    .sig-area{text-align:center;min-width:160px}
    .sig-line{width:140px;border-top:1.5px solid #ccc;margin:36px auto 7px}
    .sig-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px}
    .sig-name{font-size:11px;color:#2D2D2D;font-weight:700;margin-top:3px}
    .eoe{font-size:9px;color:#aaa;margin-top:4px;font-style:italic}
    .ty-band{background:#F8F6F3;border-top:1px solid #EDE9E4;padding:12px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:20px}
    .ty-title{font-size:12px;font-weight:700;color:#8B7355}
    .comp-gen{font-size:8.5px;color:#aaa;text-align:center;padding:6px;background:#f8f6f3;border-top:1px solid #e8e2da}`;

  const bodyContent = `
  <div class="hdr">
    <div class="hdr-brand">
      <div class="hdr-logo">${co.logoUrl?`<img src="${co.logoUrl}">`:`<span>${coName[0]?.toUpperCase()||'C'}</span>`}</div>
      <div>
        <div class="hdr-name">${coName}</div>
        ${coTagline?`<div class="hdr-tag">${coTagline}</div>`:''}
        <div class="hdr-addr">${[coAddr,coPhone,coEmail].filter(Boolean).join(' | ')}${coGST?` | GSTIN: ${coGST}`:''}</div>
      </div>
    </div>
    <div class="hdr-right"><div class="hdr-inv-type">TAX INVOICE</div><div class="hdr-inv-num"># ${inv.id}</div></div>
  </div>
  <div class="gold-strip"></div>
  <div class="info-band">
    <div class="info-col"><div class="info-lbl">Invoice Date</div><div class="info-val">${inv.date||'—'}</div></div>
    <div class="info-col"><div class="info-lbl">Due Date</div><div class="info-val">${inv.dueDate&&inv.dueDate!=='—'?inv.dueDate:'On Receipt'}</div></div>
    <div class="info-col"><div class="info-lbl">Payment Mode</div><div class="info-val gold">${inv.payment||'—'}</div></div>
    <div class="info-col" style="text-align:right"><div class="info-lbl">Status</div><div class="info-val"><span class="status-pill">${inv.status}</span></div></div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party"><div class="party-lbl">Bill To</div><div class="party-name">${inv.customer||'Walk-in Customer'}</div><div class="party-detail">${inv.phone?`<div>${inv.phone}</div>`:''}${inv.email?`<div>${inv.email}</div>`:''}${inv.address?`<div>${inv.address}</div>`:''}</div>${inv.gstNo?`<div class="party-gstin">GSTIN: ${inv.gstNo}</div>`:''}</div>
      <div class="party seller"><div class="party-lbl">Seller Details</div><div class="party-name">${coName}</div><div class="party-detail">${coPhone?`<div>${coPhone}</div>`:''}${coEmail?`<div>${coEmail}</div>`:''}${coAddr?`<div>${coAddr}</div>`:''}</div>${coGST?`<div class="party-gstin">GSTIN: ${coGST}</div>`:''}<div><span class="stamp">${inv.status}</span></div></div>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th class="c" style="width:30px">#</th><th>Description</th><th class="c">Qty</th><th class="r">Rate</th><th class="r">Taxable Amt</th><th class="c">GST %</th><th class="r">GST Amt</th><th class="r">Total</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="bottom">
      <div class="tax-summary"><div class="tax-title">Tax Summary</div><table class="tax-tbl"><thead><tr><th>GST Rate</th><th>Taxable Amt</th><th>GST Amount</th></tr></thead><tbody>${taxRows}</tbody></table></div>
      <div class="totals"><div class="tot-row"><span class="tot-lbl">Subtotal</span><span class="tot-val">${inr(subtotal)}</span></div><div class="tot-row"><span class="tot-lbl">GST</span><span class="tot-val">${inr(gstTotal)}</span></div>${discountHtml}<div class="tot-grand"><span class="tot-grand-lbl">GRAND TOTAL</span><span class="tot-grand-val">${inr(grandTotal)}</span></div></div>
    </div>
    <div class="amt-words"><div class="amt-words-lbl">Amount in Words</div><div class="amt-words-val">${amountInWords(grandTotal)}</div></div>
    ${footerHtml}
  </div>
  ${coFooter ? '<div class="ty-band"><div class="ty-title">' + coFooter + '</div></div>' : ''}
  <div class="comp-gen">This is a computer generated invoice and does not require a physical signature.</div>`;

  // Render in hidden off-screen container
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:860px;background:#fff;z-index:-1;pointer-events:none;font-family:Inter,sans-serif;';
  wrapper.innerHTML = `<style>${css}</style><div class="page">${bodyContent}</div>`;
  document.body.appendChild(wrapper);
  const el = wrapper.querySelector('.page');

  try {
    const canvas = await h2c(el, { scale: 1.5, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', imageTimeout: 0 });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgH = pdfW / ratio;
    let posY = 0;
    let remaining = imgH;
    while (remaining > 0) {
      if (posY > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -posY, pdfW, imgH);
      posY += pdfH;
      remaining -= pdfH;
    }
    pdf.save(`Invoice-${inv.id}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}

/* ══════════════════════════════════════════════════════════════════════
   PDF PREVIEW MODAL
══════════════════════════════════════════════════════════════════════ */
function PDFPreviewModal({ invoice, onClose, co = {} }) {
  const { subtotal, gstTotal, total } = calcInvoice(invoice);
  const PLACEHOLDERS = ['Company Name Not Set','Please update Company Name','Please update Address'];
  const clean = v => (!v || PLACEHOLDERS.includes(v.trim())) ? '' : v.trim();
  const coName    = clean(co.companyName) || 'Your Company';
  const coTagline = co.tagline        || '';
  const coAddr    = clean(co.companyAddress) || '';
  const coPhone   = co.companyPhone   || '';
  const coEmail   = co.companyEmail   || '';
  const coGST     = co.gstNumber      || '';
  const coLogo    = co.logoUrl        || null;
  const coTerms   = co.defaultPaymentTerms || co.invoicePaymentTerms || '';
  const coFooter  = co.invoiceFooterNote || '';
  const showLogo  = co.showCompanyLogo        !== false;
  const showGST   = co.showGstBreakdown       !== false;
  const showSig   = co.showSignatureArea      !== false;
  const showTerms = co.showTermsAndConditions !== false;

  const statusColors = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Cancelled:'#64748b' };
  const sColor = statusColors[invoice.status] || '#64748b';

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-pdf-modal" onClick={e => e.stopPropagation()}>
        <div className="inv-pdf-modal-head">
          <div className="inv-pdf-modal-left">
            <FileText size={16} color="#8B7355" />
            <div className="inv-pdf-modal-title">{invoice.id}</div>
            <span className={`inv-pdf-status-badge inv-badge ${badgeClass(invoice.status)}`}>{invoice.status}</span>
          </div>
          <div className="inv-pdf-modal-acts">
            <button className="inv-close-btn" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        <div className="inv-pdf-modal-body">
          <div className="inv-doc">

            {/* Header */}
            <div className="inv-doc-header-band">
              <div className="inv-doc-brand">
                <div className="inv-doc-logo">
                  {coLogo ? <img src={coLogo} alt="logo" /> : coName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="inv-doc-company">{coName}</div>
                  {coTagline && <div className="inv-doc-company-sub">{coTagline}</div>}
                  <div className="inv-doc-addr">{[coAddr,coPhone,coEmail].filter(Boolean).join(' · ')}{coGST && ` | GSTIN: ${coGST}`}</div>
                </div>
              </div>
              <div className="inv-doc-inv-label">
                <div className="inv-doc-title">TAX INVOICE</div>
                <div className="inv-doc-inv-num"># {invoice.id}</div>
              </div>
            </div>
            <div className="inv-doc-gold-strip" />

            {/* Info Band */}
            <div className="inv-doc-meta-band">
              <div className="inv-doc-meta-item"><div className="inv-doc-meta-lbl">Invoice Date</div><div className="inv-doc-meta-val">{invoice.date||'—'}</div></div>
              <div className="inv-doc-meta-item"><div className="inv-doc-meta-lbl">Due Date</div><div className="inv-doc-meta-val">{invoice.dueDate&&invoice.dueDate!=='—'?invoice.dueDate:'On Receipt'}</div></div>
              <div className="inv-doc-meta-item"><div className="inv-doc-meta-lbl">Payment Mode</div><div className="inv-doc-meta-val accent">{invoice.payment}</div></div>
              <div className="inv-doc-meta-item"><div className="inv-doc-meta-lbl">Place of Supply</div><div className="inv-doc-meta-val">{coAddr?coAddr.split(',').pop()?.trim()||'':''}</div></div>
              <div className="inv-doc-meta-item"><div className="inv-doc-meta-lbl">Status</div><div className="inv-doc-meta-val"><span className="inv-doc-status-chip" style={{background:`${sColor}20`,color:sColor,border:`1.5px solid ${sColor}50`}}>{invoice.status}</span></div></div>
            </div>

            {/* Body */}
            <div className="inv-doc-body">

              {/* Parties */}
              <div className="inv-doc-parties">
                <div className="inv-doc-party">
                  <div className="inv-doc-party-lbl">Bill To</div>
                  <div className="inv-doc-party-name">{invoice.customer||'Walk-in Customer'}</div>
                  <div className="inv-doc-party-info">
                    {invoice.phone&&<div>{invoice.phone}</div>}
                    {invoice.email&&<div>{invoice.email}</div>}
                    {invoice.address&&<div>{invoice.address}</div>}
                  </div>
                  {invoice.gstNo&&<div className="inv-doc-party-gstin">GSTIN: {invoice.gstNo}</div>}
                </div>
                <div className="inv-doc-party right">
                  <div className="inv-doc-party-lbl">Seller Details</div>
                  <div className="inv-doc-party-name">{coName}</div>
                  <div className="inv-doc-party-info">
                    {coPhone&&<div>{coPhone}</div>}
                    {coEmail&&<div>{coEmail}</div>}
                    {coAddr&&<div>{coAddr}</div>}
                  </div>
                  {coGST&&<div className="inv-doc-party-gstin">GSTIN: {coGST}</div>}
                  <div><span className="inv-doc-stamp" style={{border:`2px solid ${sColor}`,color:sColor}}>{invoice.status}</span></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="inv-doc-table-wrap">
                <table className="inv-doc-table">
                  <thead>
                    <tr>
                      <th className="c" style={{width:28}}>#</th>
                      <th>Description</th>
                      <th className="r">Qty</th>
                      <th className="r">Rate</th>
                      <th className="r">Taxable Amt</th>
                      <th className="c">GST %</th>
                      <th className="r">GST Amt</th>
                      <th className="r">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((it,i)=>{
                      const taxable=it.qty*it.rate; const gstAmt=taxable*it.gst/100;
                      return(<tr key={i}>
                        <td className="c">{i+1}</td>
                        <td className="bold">{it.name}</td>
                        <td className="r">{it.qty}</td>
                        <td className="r">{inr(it.rate)}</td>
                        <td className="r">{inr(taxable)}</td>
                        <td className="c">{it.gst}%</td>
                        <td className="r">{inr(gstAmt)}</td>
                        <td className="r bold">{inr(taxable+gstAmt)}</td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom: Tax Summary + Totals */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:16,marginBottom:14}}>
                <div style={{border:'1px solid #e8e2da',borderRadius:8,overflow:'hidden'}}>
                  <div style={{background:'#f0ede8',padding:'6px 12px',fontSize:9,fontWeight:700,color:'#8B7355',textTransform:'uppercase',letterSpacing:1,borderBottom:'1px solid #e8e2da'}}>Tax Summary</div>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:10.5}}>
                    <thead><tr style={{background:'#f8f6f3'}}>
                      <th style={{padding:'6px 10px',fontSize:8,fontWeight:700,color:'#8B7355',textTransform:'uppercase',textAlign:'left',borderBottom:'1px solid #e8e2da'}}>GST Rate</th>
                      <th style={{padding:'6px 10px',fontSize:8,fontWeight:700,color:'#8B7355',textTransform:'uppercase',textAlign:'right',borderBottom:'1px solid #e8e2da'}}>Taxable Amt</th>
                      <th style={{padding:'6px 10px',fontSize:8,fontWeight:700,color:'#8B7355',textTransform:'uppercase',textAlign:'right',borderBottom:'1px solid #e8e2da'}}>GST Amount</th>
                    </tr></thead>
                    <tbody>
                      {(() => {
                        const tm = {};
                        invoice.items.forEach(it => {
                          const t = it.qty*it.rate;
                          if (!tm[it.gst]) tm[it.gst]={taxable:0,gst:0};
                          tm[it.gst].taxable+=t; tm[it.gst].gst+=t*it.gst/100;
                        });
                        return Object.entries(tm).map(([rate,v])=>(
                          <tr key={rate}>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid #f5f2ef',fontWeight:600,color:'#2D2D2D'}}>{rate}%</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid #f5f2ef',textAlign:'right',color:'#333'}}>{inr(v.taxable)}</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid #f5f2ef',textAlign:'right',fontWeight:700,color:'#2D2D2D'}}>{inr(v.gst)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="inv-doc-totals-box">
                  <div className="inv-doc-tot-row"><span className="inv-doc-tot-lbl">Subtotal</span><span className="inv-doc-tot-val">{inr(subtotal)}</span></div>
                  <div className="inv-doc-tot-row"><span className="inv-doc-tot-lbl">GST</span><span className="inv-doc-tot-val">{inr(gstTotal)}</span></div>
                  {invoice.discount>0&&<div className="inv-doc-tot-row inv-doc-tot-disc"><span className="inv-doc-tot-lbl">Discount</span><span className="inv-doc-tot-val">-{inr(invoice.discount)}</span></div>}
                  <div className="inv-doc-grand-row"><span className="inv-doc-grand-lbl">GRAND TOTAL</span><span className="inv-doc-grand-val">{inr(total)}</span></div>
                </div>
              </div>

              {/* Amount in Words */}
              <div style={{background:'#f8f6f3',border:'1px solid #e8e2da',borderRadius:8,padding:'8px 12px',marginBottom:14}}>
                <div style={{fontSize:8,fontWeight:700,color:'#8B7355',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>Amount in Words</div>
                <div style={{fontSize:11,fontWeight:600,color:'#2D2D2D',fontStyle:'italic'}}>{amountInWords(total)}</div>
              </div>

              {/* Footer */}
              {(showTerms||showSig)&&(
                <div className="inv-doc-footer">
                  {showTerms?<div><div className="inv-doc-terms-lbl">Terms &amp; Conditions</div><div className="inv-doc-terms-txt">{coTerms}</div></div>:<div/>}
                  {showSig&&<div className="inv-doc-sig">{co.signatureUrl?<img src={co.signatureUrl} style={{maxHeight:50,maxWidth:160,display:'block',margin:'0 auto 7px',objectFit:'contain'}}/>:<div className="inv-doc-sig-line"/>}<div className="inv-doc-sig-lbl">Authorized Signatory</div><div className="inv-doc-sig-name">{coName}</div><div style={{fontSize:9,color:'#aaa',marginTop:3,fontStyle:'italic'}}>E. &amp; O.E.</div></div>}
                </div>
              )}
            </div>

            {coFooter && (
              <div className="inv-doc-thankyou" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 24px'}}>
                <div className="inv-doc-thankyou-title">{coFooter}</div>
              </div>
            )}
            <div style={{fontSize:8,color:'#aaa',textAlign:'center',padding:4,background:'#f8f6f3',borderTop:'1px solid #e8e2da'}}>
              This is a computer generated invoice and does not require a physical signature.
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
    dueDate: '', payment: 'Cash', status: 'Pending', discount: '', notes: '',
  });
  const [items, setItems]   = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setItem = (i, k, v) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: k === 'name' ? v : Number(v) };
    setItems(next);
  };

  const addItem    = () => setItems(it => [...it, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setItems(it => it.filter((_, idx) => idx !== i));

  // Product search state
  const [products, setProducts]         = useState([]);
  const [productSearch, setProductSearch] = useState({});
  const [showDropdown, setShowDropdown]  = useState({});

  useEffect(() => {
    api.get('/api/products/all').then(res => {
      const prods = res.data || [];
      setProducts(prods.map(p => ({
        id:    p.id,
        name:  p.name,
        rate:  parseFloat(p.sellingPrice || p.price || 0),
        gst:   parseFloat(p.gstPercentage || p.gstRate || 0),
        stock: p.stock ?? null,
        sku:   p.sku || '',
      })));
    }).catch(() => {});
  }, []);

  const filteredProducts = (search) =>
    search.length < 1 ? [] :
    products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 8);

  const selectProduct = (i, p) => {
    const next = [...items];
    next[i] = { ...next[i], name: p.name, rate: p.rate, gst: p.gst };
    setItems(next);
    setProductSearch(s => ({ ...s, [i]: p.name }));
    setShowDropdown(s => ({ ...s, [i]: false }));
  };

  const subtotal     = items.reduce((s, it) => s + it.qty * it.rate, 0);
  const gstTotal     = items.reduce((s, it) => s + (it.qty * it.rate * it.gst) / 100, 0);
  const discountAmt  = ((subtotal + gstTotal) * Math.min(Number(form.discount || 0), 100)) / 100;
  const total        = subtotal + gstTotal - discountAmt;

  const handleSave = async () => {
    if (!form.customer) { setError('Customer name is required.'); return; }
    if (!form.phone || form.phone.length !== 10) { setError('Phone number is required and must be exactly 10 digits.'); return; }
    if (form.status === 'Pending' && !form.dueDate) { setError('Due date is required for Pending invoices.'); return; }
    if (items.some(it => !it.name)) { setError('All line items must have a description.'); return; }
    setError('');
    setSaving(true);
    try {
      // Map UI labels → backend enum values
      const PAY_ENUM = {
        Cash: 'CASH', Card: 'CARD', UPI: 'UPI',
        'Net Banking': 'NET_BANKING', Cheque: 'CHEQUE',
      };
      const discountPct = form.discount ? Number(form.discount) : 0;
      const subtotalVal = items.reduce((s, it) => s + it.qty * it.rate, 0);
      const gstVal      = items.reduce((s, it) => s + it.qty * it.rate * it.gst / 100, 0);
      const discountAmt = ((subtotalVal + gstVal) * discountPct) / 100;

      const res = await api.post('/api/billing/create', {
        customerName:    form.customer,
        customerEmail:   form.email    || null,
        customerPhone:   form.phone    || null,
        customerAddress: form.address  || null,
        customerGstNo:   form.gstNo    || null,
        paymentMethod:   PAY_ENUM[form.payment] || form.payment.toUpperCase(),
        status:          form.status === 'Paid' ? 'COMPLETED' : 'PENDING',
        dueDate:         form.dueDate  || null,
        discount:        discountPct,
        notes:           form.notes    || null,
        items: items.map(it => ({
          name: it.name,
          qty:  it.qty,
          rate: it.rate,
          gst:  it.gst,
        })),
      });
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
        status:     normalizeStatus(inv.status || inv.paymentStatus, inv.dueDate),
        date:       inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        dueDate:    inv.dueDate
          ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : form.dueDate
          ? new Date(form.dueDate + 'T12:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
        cashier:    inv.cashierName   || '—',
        counter:    inv.counter       || '—',
        payment:    inv.paymentMethod || form.payment,
      };
      onCreate(newInv);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      // Surface the exact backend validation message
      const msg = (typeof data === 'string' ? data : data?.message || data?.error || JSON.stringify(data)) || err.message || 'Failed to create invoice.';
      console.error('[billing/create] 400 body:', data);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Permission denied: only Cashiers can create invoices. Ask a cashier to generate it.');
      } else {
        setError(`(${err.response?.status || 'error'}) ${msg}`);
      }
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
              <input type="tel" inputMode="numeric" placeholder="10-digit mobile number" maxLength={10} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
          </div>
          <div className="inv-field">
            <label>Address</label>
            <input placeholder="Full billing address" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="inv-grid2">
            <div className="inv-field">
              <label>GST Number</label>
              <input placeholder="29AABCN1234M1Z5" maxLength={15} value={form.gstNo} onChange={e => set('gstNo', e.target.value.toUpperCase().slice(0, 15))} />
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
                    <td style={{ position: 'relative' }}>
                      <input
                        className="inv-item-input"
                        placeholder="Search product…"
                        value={productSearch[i] !== undefined ? productSearch[i] : it.name}
                        onChange={e => {
                          setProductSearch(s => ({ ...s, [i]: e.target.value }));
                          setItem(i, 'name', e.target.value);
                          setShowDropdown(s => ({ ...s, [i]: true }));
                        }}
                        onFocus={() => setShowDropdown(s => ({ ...s, [i]: true }))}
                        onBlur={() => setTimeout(() => setShowDropdown(s => ({ ...s, [i]: false })), 180)}
                        autoComplete="off"
                      />
                      {showDropdown[i] && filteredProducts(productSearch[i] || it.name).length > 0 && (
                        <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#FFFFFF', border:'1px solid #EFE7DE', borderRadius:9, boxShadow:'0 4px 16px rgba(45,45,45,0.12)', zIndex:999, maxHeight:200, overflowY:'auto' }}>
                          {filteredProducts(productSearch[i] || it.name).map(p => (
                            <div key={p.id}
                              onMouseDown={() => selectProduct(i, p)}
                              style={{ padding:'9px 12px', cursor:'pointer', borderBottom:'1px solid #F8F5F2', fontSize:13 }}
                              onMouseEnter={e => e.currentTarget.style.background='#F8F5F2'}
                              onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                              <div style={{ fontWeight:600, color:'#2D2D2D' }}>{p.name}</div>
                              <div style={{ fontSize:11, color:'#8B7355', marginTop:2 }}>
                                ₹{p.rate} &nbsp;|&nbsp; GST: {p.gst}% {p.sku && `| SKU: ${p.sku}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                {['Cash','Card','UPI','Net Banking','Cheque'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="inv-field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
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

        {error && (
          <div style={{ margin:'0 24px 0', padding:'10px 14px', background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:9, fontSize:12, color:'#dc2626', display:'flex', alignItems:'flex-start', gap:8 }}>
            <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />{error}
          </div>
        )}
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
  const [statusFilter, setStatus]   = useState('All');
  const [page, setPage]             = useState(1);
  const [previewInv, setPreview]    = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState(null);
  const [co, setCo]                 = useState({});

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/billing/history');
      const data = [...(res.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(inv => ({
        id:         inv.invoiceNumber || String(inv.id),
        customer:   inv.customerName  || inv.customer?.name    || 'Walk-in Customer',
        email:      inv.customerEmail || inv.customer?.email  || '',
        phone:      inv.customerPhone || inv.customer?.phone  || '',
        address:    inv.customerAddress || inv.customer?.address || '',
        gstNo:      inv.customerGstNo || inv.customer?.gstNo   || '',
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
        status:     normalizeStatus(inv.status || inv.paymentStatus, inv.dueDate),
        date:       inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        dueDate:    inv.dueDate
          ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
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
    api.get('/api/settings').then(res => {
      const settings = res.data || {};
      // If backend doesn't persist signatureUrl, fall back to localStorage
      if (!settings.signatureUrl) {
        try {
          const cached = localStorage.getItem('nexbill_sig_preview');
          if (cached) settings.signatureUrl = cached;
        } catch {}
      }
      setCo(settings);
    }).catch(() => {});
    // Preload PDF libs for fast download
    const preload = (src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src; s.async = true;
        document.head.appendChild(s);
      }
    };
    preload('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    preload('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
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
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/api/billing/pay/${id}`);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
      showToast(`Invoice ${id} marked as paid.`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Failed to mark as paid.';
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.put(`/api/billing/cancel/${id}`);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Cancelled' } : inv));
      showToast(`Invoice ${id} cancelled successfully.`, 'error');
    } catch {
      showToast('Failed to cancel invoice. Try again.', 'error');
    }
  };

  const handleCreate = (newInv) => {
    setInvoices(prev => [newInv, ...prev]);
    showToast(`Invoice ${newInv.id} created successfully!`);
  };

  // send-email endpoint not available in backend

  // KPI stats — statuses are already normalized by normalizeStatus()
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.grandTotal || calcInvoice(i).total), 0);
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
            {['All','Paid','Pending','Overdue','Cancelled'].map(s => <option key={s}>{s}</option>)}
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
                  const total = inv.grandTotal || calcInvoice(inv).total;
                  return (
                    <tr key={inv.id}>
                      <td><span className="inv-id-cell">{inv.id}</span></td>
                      <td>
                        <div className="inv-customer-name">{inv.customer}</div>
                      </td>
                      <td style={{ color: '#8B7355' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</td>
                      <td><span className="inv-amount">{inr(inv.grandTotal || total)}</span></td>
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
                          <button className="inv-act-btn" title="View Invoice" onClick={() => setPreview(inv)}>
                            <Eye size={14} />
                          </button>
                          <button className="inv-act-btn" title="Print Invoice" onClick={() => printInvoice(inv, co)}>
                            <Printer size={14} />
                          </button>
                          <button className="inv-act-btn" title="Download PDF" onClick={() => downloadInvoicePDF(inv, co)}>
                            <Download size={14} />
                          </button>
                          {inv.status === 'Pending' && (
                            <button className="inv-act-btn btn-green" title="Mark as Paid" onClick={() => handleMarkPaid(inv.id)}>
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {inv.status === 'Pending' && (
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
              <button className="inv-page-btn" disabled={page === 1 || totalPages === 0} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={14} />
              </button>
              {totalPages > 0 && getPageNumbers(page, totalPages).map(p => (
                <button key={p} className={`inv-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="inv-page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
