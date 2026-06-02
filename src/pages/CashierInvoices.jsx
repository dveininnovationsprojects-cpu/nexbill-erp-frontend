// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Cashier Invoice Module + PDF Preview               ║
// ║   Includes: Invoice List, PDF Preview Modal, Email & Download      ║
// ║   All CSS, all components, all logic — ONE FILE                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useEffect } from 'react';
import {
  Search, Eye, Download, FileText, X,
  ChevronLeft, ChevronRight, Printer, CheckCircle,
  AlertCircle, Receipt, TrendingUp, Clock, Filter,
  Send, User, Calendar, Monitor, ArrowUpRight,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';


/* ══════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — NexBill Color Palette (matches project)
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  .ci-page { display:flex; flex-direction:column; gap:20px; font-family:'Inter',system-ui,sans-serif; }

  /* ── Cashier Info Strip ── */
  .ci-info-card {
    background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px;
    padding:14px 20px; display:flex; align-items:center; gap:12px;
    box-shadow:0 1px 4px rgba(45,45,45,0.05); flex-wrap:wrap;
  }
  .ci-info-label {
    font-size:10px; font-weight:700; color:#8B7355;
    text-transform:uppercase; letter-spacing:0.6px; margin-right:2px;
  }
  .ci-info-chip {
    display:flex; align-items:center; gap:7px;
    background:#F8F5F2; border:1px solid #EFE7DE; border-radius:9px;
    padding:7px 13px; font-size:12.5px; color:#3F3F46;
  }
  .ci-info-chip svg { color:#C6A969; flex-shrink:0; }
  .ci-info-chip strong { color:#2D2D2D; font-weight:700; }
  .ci-info-divider { width:1px; height:24px; background:#EFE7DE; flex-shrink:0; }

  /* ── KPI Cards ── */
  .ci-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .ci-kpi-card {
    background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:20px;
    display:flex; align-items:flex-start; gap:14px;
    box-shadow:0 1px 4px rgba(45,45,45,0.05);
    position:relative; overflow:hidden;
  }
  .ci-kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
  .ci-kpi-card.kpi-gold::before  { background:linear-gradient(90deg,#C6A969,#8B7355); }
  .ci-kpi-card.kpi-green::before { background:linear-gradient(90deg,#16a34a,#4ade80); }
  .ci-kpi-card.kpi-amber::before { background:linear-gradient(90deg,#ca8a04,#fbbf24); }
  .ci-kpi-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ci-icon-gold  { background:#EFE7DE; color:#8B7355; }
  .ci-icon-green { background:#DCFCE7; color:#16a34a; }
  .ci-icon-amber { background:#FEF9C3; color:#ca8a04; }
  .ci-kpi-body  { flex:1; min-width:0; }
  .ci-kpi-value { font-size:22px; font-weight:800; color:#2D2D2D; line-height:1.1; margin-bottom:3px; }
  .ci-kpi-label { font-size:12.5px; font-weight:500; color:#3F3F46; }
  .ci-kpi-sub   { font-size:11px; color:#8B7355; margin-top:3px; display:flex; align-items:center; gap:4px; }
  .ci-kpi-trend { display:inline-flex; align-items:center; gap:2px; font-size:10.5px; font-weight:700; padding:1px 5px; border-radius:5px; margin-top:4px; }
  .trend-up { background:#DCFCE7; color:#16a34a; }

  /* ── Toolbar ── */
  .ci-toolbar { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .ci-search-box { flex:1; min-width:200px; display:flex; align-items:center; gap:8px; background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:9px; padding:0 12px; height:38px; transition:border-color 0.2s; }
  .ci-search-box:focus-within { border-color:#C6A969; }
  .ci-search-box input { flex:1; border:none; background:transparent; outline:none; font-size:13px; color:#2D2D2D; font-family:inherit; }
  .ci-search-box input::placeholder { color:#D6D3D1; }
  .ci-select { height:38px; padding:0 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#3F3F46; background:#F8F5F2; outline:none; font-family:inherit; cursor:pointer; }
  .ci-select:focus { border-color:#C6A969; }

  /* ── Table Card ── */
  .ci-table-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .ci-table-scroll { overflow-x:auto; }
  .ci-table { width:100%; border-collapse:collapse; font-size:13px; }
  .ci-table thead th { background:#F8F5F2; padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #EFE7DE; white-space:nowrap; }
  .ci-table tbody td { padding:12px 14px; border-bottom:1px solid #F8F5F2; color:#3F3F46; vertical-align:middle; }
  .ci-table tbody tr:last-child td { border-bottom:none; }
  .ci-table tbody tr:hover td { background:#FDFCFB; }
  .ci-id-cell { font-weight:700; color:#2D2D2D; font-size:13px; font-family:'Inter',monospace; }
  .ci-customer-name { font-weight:600; color:#2D2D2D; font-size:13px; }
  .ci-customer-sub  { font-size:11px; color:#8B7355; margin-top:2px; }
  .ci-amount { font-weight:700; color:#2D2D2D; }
  .ci-payment-chip { display:inline-flex; align-items:center; padding:2px 8px; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:6px; font-size:10.5px; color:#3F3F46; font-weight:500; }

  /* ── Status Badges ── */
  .ci-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .ci-badge::before { content:''; width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .cbadge-paid    { background:#DCFCE7; color:#16a34a; }
  .cbadge-paid::before    { background:#16a34a; }
  .cbadge-pending { background:#FEF9C3; color:#ca8a04; }
  .cbadge-pending::before { background:#ca8a04; }
  .cbadge-overdue { background:#FEE2E2; color:#dc2626; }
  .cbadge-overdue::before { background:#dc2626; }
  .cbadge-draft   { background:#F1F5F9; color:#64748b; }
  .cbadge-draft::before   { background:#64748b; }

  /* ── Action Buttons ── */
  .ci-actions { display:flex; align-items:center; gap:4px; }
  .ci-act-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; transition:all 0.15s; flex-shrink:0; }
  .ci-act-btn:hover          { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .ci-act-btn.btn-blue:hover { background:#DBEAFE; color:#2563eb; border-color:#93C5FD; }

  /* ── Pagination ── */
  .ci-pagination { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-top:1px solid #EFE7DE; }
  .ci-page-info { font-size:12px; color:#8B7355; }
  .ci-page-btns { display:flex; gap:5px; }
  .ci-page-btn { min-width:30px; height:30px; padding:0 6px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; color:#8B7355; transition:all 0.15s; }
  .ci-page-btn:hover   { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .ci-page-btn.active  { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .ci-page-btn:disabled { opacity:0.4; cursor:not-allowed; }

  /* ── Overlay ── */
  .ci-overlay { position:fixed; inset:0; background:rgba(45,45,45,0.55); backdrop-filter:blur(4px); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; }

  /* ── PDF Modal ── */
  .ci-pdf-modal { background:#FFFFFF; border-radius:18px; width:100%; max-width:840px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 28px 72px rgba(45,45,45,0.28); overflow:hidden; }
  .ci-pdf-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid #EFE7DE; flex-shrink:0; background:#FFFFFF; gap:12px; }
  .ci-pdf-modal-left { display:flex; align-items:center; gap:12px; min-width:0; }
  .ci-pdf-modal-title { font-size:14px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; white-space:nowrap; }
  .ci-pdf-status-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .ci-pdf-modal-acts { display:flex; gap:8px; align-items:center; flex-shrink:0; }
  .ci-pdf-modal-body { flex:1; overflow-y:auto; padding:28px; background:#F0EDE9; }
  .ci-close-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; transition:all 0.2s; }
  .ci-close-btn:hover { background:#EFE7DE; color:#2D2D2D; }
  .ci-btn-outline { display:flex; align-items:center; gap:6px; padding:0 14px; height:34px; background:#F8F5F2; color:#8B7355; border:1.5px solid #EFE7DE; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; white-space:nowrap; }
  .ci-btn-outline:hover { background:#EFE7DE; color:#2D2D2D; }
  .ci-btn-sm { display:flex; align-items:center; gap:6px; padding:0 16px; height:34px; background:#2D2D2D; color:#F8F5F2; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s,color 0.2s; white-space:nowrap; }
  .ci-btn-sm:hover { background:#C6A969; color:#2D2D2D; }

  /* ── Invoice Document ── */
  .ci-doc { background:#FFFFFF; border-radius:12px; padding:44px; box-shadow:0 4px 24px rgba(45,45,45,0.10); max-width:720px; margin:0 auto; }
  .ci-doc-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; padding-bottom:28px; border-bottom:2px solid #EFE7DE; }
  .ci-doc-brand-row { display:flex; align-items:center; gap:14px; margin-bottom:12px; }
  .ci-doc-logo { width:48px; height:48px; background:#2D2D2D; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800; color:#C6A969; flex-shrink:0; }
  .ci-doc-company { font-size:20px; font-weight:800; color:#2D2D2D; }
  .ci-doc-company-sub { font-size:11px; color:#8B7355; margin-top:1px; }
  .ci-doc-addr { font-size:11.5px; color:#3F3F46; line-height:1.7; }
  .ci-doc-right { text-align:right; }
  .ci-doc-title { font-size:30px; font-weight:900; color:#2D2D2D; letter-spacing:-1px; margin-bottom:14px; }
  .ci-doc-meta-row { display:grid; grid-template-columns:auto auto; gap:4px 20px; justify-content:end; margin-bottom:3px; }
  .ci-doc-meta-lbl { font-size:11px; color:#8B7355; text-align:right; }
  .ci-doc-meta-val { font-size:12px; font-weight:600; color:#2D2D2D; text-align:right; }

  .ci-doc-parties { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-bottom:28px; }
  .ci-doc-party-lbl  { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.9px; margin-bottom:8px; }
  .ci-doc-party-name { font-size:14px; font-weight:700; color:#2D2D2D; margin-bottom:5px; }
  .ci-doc-party-info { font-size:12px; color:#3F3F46; line-height:1.7; }

  .ci-doc-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  .ci-doc-table thead th { background:#2D2D2D; color:#F8F5F2; padding:10px 12px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:left; }
  .ci-doc-table thead th:first-child { border-radius:7px 0 0 7px; text-align:center; }
  .ci-doc-table thead th:last-child  { border-radius:0 7px 7px 0; text-align:right; }
  .ci-doc-table thead th.right { text-align:right; }
  .ci-doc-table tbody td { padding:10px 12px; border-bottom:1px solid #EFE7DE; font-size:12.5px; color:#3F3F46; }
  .ci-doc-table tbody td.right { text-align:right; }
  .ci-doc-table tbody td.bold  { font-weight:700; color:#2D2D2D; }
  .ci-doc-table tbody tr:hover td { background:#FDFCFB; }

  .ci-doc-totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
  .ci-doc-totals-inner { min-width:300px; background:#F8F5F2; border-radius:10px; padding:14px 16px; }
  .ci-doc-tot-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:#3F3F46; }
  .ci-doc-tot-row.discount { color:#16a34a; font-weight:500; }
  .ci-doc-tot-row.grand { border-top:2px solid #EFE7DE; padding-top:10px; margin-top:4px; font-size:15px; font-weight:800; color:#2D2D2D; }

  .ci-doc-footer { display:flex; justify-content:space-between; align-items:flex-end; padding-top:24px; border-top:1px solid #EFE7DE; margin-top:4px; }
  .ci-doc-terms-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:6px; }
  .ci-doc-terms-txt { font-size:11.5px; color:#3F3F46; line-height:1.7; max-width:340px; }
  .ci-doc-sig { text-align:center; }
  .ci-doc-sig-line { width:140px; border-top:1.5px solid #D6D3D1; margin:0 auto 6px; margin-top:36px; }
  .ci-doc-sig-lbl  { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; }
  .ci-doc-sig-name { font-size:12px; color:#2D2D2D; font-weight:600; margin-top:2px; }
  .ci-doc-thankyou { text-align:center; margin-top:24px; padding:16px; background:linear-gradient(135deg,#F8F5F2,#EFE7DE); border-radius:10px; border:1px solid #EFE7DE; }
  .ci-doc-ty-title { font-size:13px; font-weight:700; color:#2D2D2D; }
  .ci-doc-ty-sub   { font-size:11.5px; color:#8B7355; margin-top:3px; }

  /* ── Empty State ── */
  .ci-empty { display:flex; flex-direction:column; align-items:center; padding:48px 24px; color:#D6D3D1; gap:10px; }
  .ci-empty p { font-size:13px; }

  /* ── Toast ── */
  .ci-toast { position:fixed; top:20px; right:28px; background:#2D2D2D; color:#F8F5F2; padding:12px 18px; border-radius:10px; font-size:13px; display:flex; align-items:center; gap:8px; z-index:9999; box-shadow:0 4px 20px rgba(45,45,45,0.25); animation:ciSlideIn 0.25s ease; }
  .ci-toast-err { background:#7A3A3A; }
  @keyframes ciSlideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
`;


/* ══════════════════════════════════════════════════════════════════════
   HELPERS
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
  return { Paid:'cbadge-paid', Pending:'cbadge-pending', Overdue:'cbadge-overdue', Draft:'cbadge-draft' }[status] || 'cbadge-draft';
}

function stampColor(status) {
  return { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Draft:'#64748b' }[status] || '#64748b';
}

/* ══════════════════════════════════════════════════════════════════════
   PRINT / PDF
══════════════════════════════════════════════════════════════════════ */
function printInvoice(inv) {
  const { subtotal, gstTotal, total } = calcInvoice(inv);
  const sc = stampColor(inv.status);

  const rows = inv.items.map((it, i) => {
    const lineAmt = it.qty * it.rate;
    const lineGst = (lineAmt * it.gst) / 100;
    const cgst = lineGst / 2;
    const sgst = lineGst / 2;
    return `<tr>
      <td style="text-align:center;color:#8B7355">${i + 1}</td>
      <td style="font-weight:600;color:#2D2D2D">${it.name}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">${inr(it.rate)}</td>
      <td style="text-align:right">${inr(lineAmt)}</td>
      <td style="text-align:right">${it.gst/2}%<br><span style="color:#8B7355;font-size:10px">${inr(cgst)}</span></td>
      <td style="text-align:right">${it.gst/2}%<br><span style="color:#8B7355;font-size:10px">${inr(sgst)}</span></td>
      <td style="text-align:right;font-weight:700;color:#2D2D2D">${inr(lineAmt + lineGst)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.id} — NexBill ERP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#2D2D2D;background:#fff;padding:40px;max-width:820px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #EFE7DE}
    .brand-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .logo{width:46px;height:46px;background:#2D2D2D;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#C6A969;text-align:center;line-height:46px}
    .co-name{font-size:18px;font-weight:800;color:#2D2D2D}
    .co-sub{font-size:10px;color:#8B7355;margin-top:1px}
    .co-addr{font-size:11px;color:#3F3F46;line-height:1.7}
    .inv-title{font-size:28px;font-weight:900;color:#2D2D2D;letter-spacing:-1px;margin-bottom:12px}
    .meta-row{display:flex;gap:20px;justify-content:flex-end;margin-bottom:3px}
    .meta-lbl{font-size:11px;color:#8B7355}
    .meta-val{font-size:12px;font-weight:600;color:#2D2D2D}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
    .party-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:6px}
    .party-name{font-size:14px;font-weight:700;color:#2D2D2D;margin-bottom:4px}
    .party-info{font-size:11.5px;color:#3F3F46;line-height:1.7}
    .stamp{display:inline-block;padding:4px 14px;border:3px solid ${sc};color:${sc};border-radius:6px;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;transform:rotate(-10deg);margin-top:12px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    thead th{background:#2D2D2D;color:#F8F5F2;padding:9px 11px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;text-align:left}
    thead th:first-child{border-radius:6px 0 0 6px;text-align:center}
    thead th:last-child{border-radius:0 6px 6px 0;text-align:right}
    thead th.r{text-align:right}
    tbody td{padding:9px 11px;border-bottom:1px solid #EFE7DE;font-size:12px;color:#3F3F46;vertical-align:top}
    .totals{display:flex;justify-content:flex-end;margin-bottom:24px}
    .totals-inner{min-width:300px;background:#F8F5F2;border-radius:8px;padding:12px 14px}
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
    @media print{body{padding:24px}thead th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
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
      <div class="co-addr">45 Tech Park, Bangalore, Karnataka 560001<br>+91 9876 543 210 | billing@nexbill.in<br>GSTIN: 29AABCN1234M1Z5</div>
    </div>
    <div style="text-align:right">
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
      <div class="party-info">${inv.address}<br>${inv.phone}<br>${inv.email}${inv.gstNo ? '<br>GSTIN: ' + inv.gstNo : ''}</div>
    </div>
    <div style="text-align:right">
      <div class="party-lbl">Handled By</div>
      <div class="party-name">${inv.cashier}</div>
      <div class="party-info">${inv.counter}</div>
      <div class="stamp">${inv.status}</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th style="width:30px">#</th><th>Description</th>
      <th class="r">Qty</th><th class="r">Rate</th>
      <th class="r">Taxable Amt</th><th class="r">CGST</th>
      <th class="r">SGST</th><th class="r">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
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
      <div class="terms-txt">Payment due within 7 days. Late payments attract 2% monthly interest. Goods once sold cannot be returned without prior approval. Computer-generated invoice.</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-lbl">Authorized Signatory</div>
      <div class="sig-name">NexBill ERP</div>
    </div>
  </div>
  <div class="thankyou">
    <div class="ty-title">Thank you for your business! 🙏</div>
    <div class="ty-sub">For queries: billing@nexbill.in | +91 9876 543 210</div>
  </div>
  <script>window.onload=function(){window.print()}</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ══════════════════════════════════════════════════════════════════════
   PDF PREVIEW MODAL
══════════════════════════════════════════════════════════════════════ */
function PDFPreviewModal({ invoice, onClose, onEmail }) {
  const { subtotal, gstTotal, total } = calcInvoice(invoice);
  const sc = stampColor(invoice.status);

  return (
    <div className="ci-overlay" onClick={onClose}>
      <div className="ci-pdf-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ci-pdf-modal-head">
          <div className="ci-pdf-modal-left">
            <FileText size={16} color="#8B7355" />
            <div className="ci-pdf-modal-title">{invoice.id}</div>
            <span className={`ci-pdf-status-badge ci-badge ${badgeClass(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <div className="ci-pdf-modal-acts">
            <button className="ci-btn-outline" onClick={() => onEmail(invoice)}>
              <Send size={13} /> Send Email
            </button>
            <button className="ci-btn-sm" onClick={() => printInvoice(invoice)}>
              <Printer size={13} /> Print / PDF
            </button>
            <button className="ci-close-btn" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="ci-pdf-modal-body">
          <div className="ci-doc">
            {/* Header */}
            <div className="ci-doc-head">
              <div>
                <div className="ci-doc-brand-row">
                  <div className="ci-doc-logo">N</div>
                  <div>
                    <div className="ci-doc-company">NexBill ERP</div>
                    <div className="ci-doc-company-sub">Smart Billing &amp; Inventory Management</div>
                  </div>
                </div>
                <div className="ci-doc-addr">
                  45 Tech Park, Bangalore, Karnataka 560001<br />
                  +91 9876 543 210 &nbsp;|&nbsp; billing@nexbill.in<br />
                  GSTIN: 29AABCN1234M1Z5
                </div>
              </div>
              <div className="ci-doc-right">
                <div className="ci-doc-title">INVOICE</div>
                {[
                  ['Invoice No.', invoice.id],
                  ['Date', invoice.date],
                  ['Due Date', invoice.dueDate],
                  ['Payment Mode', invoice.payment],
                ].map(([l, v]) => (
                  <div className="ci-doc-meta-row" key={l}>
                    <span className="ci-doc-meta-lbl">{l}</span>
                    <span className="ci-doc-meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parties */}
            <div className="ci-doc-parties">
              <div>
                <div className="ci-doc-party-lbl">Bill To</div>
                <div className="ci-doc-party-name">{invoice.customer}</div>
                <div className="ci-doc-party-info">
                  {invoice.address}<br />
                  {invoice.phone}<br />
                  {invoice.email}<br />
                  {invoice.gstNo && <>GSTIN: {invoice.gstNo}</>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ci-doc-party-lbl">Handled By</div>
                <div className="ci-doc-party-name">{invoice.cashier}</div>
                <div className="ci-doc-party-info">{invoice.counter}</div>
                <div style={{ marginTop: 14 }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 14px',
                    border: `3px solid ${sc}`, color: sc,
                    borderRadius: 6, fontSize: 12, fontWeight: 900,
                    letterSpacing: 2, textTransform: 'uppercase',
                    transform: 'rotate(-10deg)',
                  }}>{invoice.status}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="ci-doc-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
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
            <div className="ci-doc-totals">
              <div className="ci-doc-totals-inner">
                <div className="ci-doc-tot-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="ci-doc-tot-row"><span>GST Total</span><span>{inr(gstTotal)}</span></div>
                {invoice.discount > 0 && (
                  <div className="ci-doc-tot-row discount"><span>Discount</span><span>-{inr(invoice.discount)}</span></div>
                )}
                <div className="ci-doc-tot-row grand"><span>Grand Total</span><span>{inr(total)}</span></div>
              </div>
            </div>

            {/* Footer */}
            <div className="ci-doc-footer">
              <div>
                <div className="ci-doc-terms-lbl">Terms &amp; Conditions</div>
                <div className="ci-doc-terms-txt">
                  Payment due within 7 days. Late payments attract 2% monthly interest.
                  Goods once sold cannot be returned without prior approval. Computer-generated invoice.
                </div>
              </div>
              <div className="ci-doc-sig">
                <div className="ci-doc-sig-line" />
                <div className="ci-doc-sig-lbl">Authorized Signatory</div>
                <div className="ci-doc-sig-name">NexBill ERP</div>
              </div>
            </div>

            <div className="ci-doc-thankyou">
              <div className="ci-doc-ty-title">Thank you for your business! 🙏</div>
              <div className="ci-doc-ty-sub">For queries: billing@nexbill.in &nbsp;|&nbsp; +91 9876 543 210</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CASHIER INVOICES — DEFAULT EXPORT
══════════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 5;

export default function CashierInvoices() {
  const { user } = useAuth();

  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [page, setPage]           = useState(1);
  const [previewInv, setPreview]  = useState(null);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        console.log('Fetching cashier invoices with token:', user?.token);
        // Fetch from billing history
        const res = await api.get('/api/billing/history');
        console.log('Raw order response:', res.data);
        // Filter only this cashier's orders
        const cashierEmail = user?.email || user?.username;
        const cashierOrders = (res.data || []).filter(order => 
          order.cashier?.email === cashierEmail || order.cashier?.username === cashierEmail
        );
        
        const data = cashierOrders.map(order => {
          console.log('Processing cashier order:', order);
          
          let customerName = 'Walk-in Customer';
          if (order.customer?.name) {
            customerName = order.customer.name;
          } else if (order.customerId) {
            customerName = `Customer #${order.customerId}`;
          }
          
          return {
            id: order.invoiceNumber || `ORD-${order.id}`,
            customer: customerName,
            email: order.customer?.email || '',
            phone: order.customer?.mobile || order.customer?.phone || '',
            address: order.customer?.address || '',
            gstNo: order.customer?.gstNumber || '',
            items: (order.items || []).map(it => ({
              name: it.product?.name || it.productName,
              qty: parseFloat(it.quantity),
              rate: parseFloat(it.unitPrice),
              gst: parseFloat(it.gstPercentage || 0),
            })),
            discount: parseFloat(order.discountAmount || 0),
            status: order.status === 'COMPLETED' ? 'Paid' : 'Pending',
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            dueDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            cashier: order.cashier?.name || order.cashier?.email || user?.username || 'Cashier',
            counter: order.cashier?.counterNumber || 'Counter 1',
            payment: order.paymentMode || 'CASH',
            grandTotal: parseFloat(order.grandTotal || 0),
          };
        });
        console.log('Processed invoices:', data);
        setInvoices(data);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        if (err.response?.status === 401) {
          alert('Session expired or unauthorized. Please login again.');
        }
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/billing/history');
      const data = (res.data || []).map(inv => ({
        id:         inv.invoiceNumber || String(inv.id),
        customer:   inv.cashierId     || 'Walk-in Customer',
        email:      '',
        phone:      '',
        address:    '',
        gstNo:      '',
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
        status:     'Paid',
        date:       inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        dueDate:    inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        cashier:    inv.cashierId    || '—',
        counter:    'Counter 1',
        payment:    inv.paymentMethod || 'CASH',
      }));
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleEmail = (inv) => {
    showToast(`Email sent to ${inv.cashier}`);
  };


  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // KPI — from real data
  const paidInvs    = invoices.filter(i => i.status === 'Paid');
  const pendingInvs = invoices.filter(i => i.status === 'Pending');
  const totalRev    = paidInvs.reduce((s, i) => s + i.grandTotal, 0);

  return (
    <>
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && (
        <div className={`ci-toast ${toast.type === 'error' ? 'ci-toast-err' : ''}`}>
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
        />
      )}

      <div className="ci-page">
        {/* ── Cashier Info Strip ── */}
        <div className="ci-info-card">
          <div className="ci-info-chip">
            <User size={14} />
            <span className="ci-info-label">Cashier</span>
            <strong>{user?.email || '—'}</strong>
          </div>
          <div className="ci-info-divider" />
          <div className="ci-info-chip">
            <Calendar size={14} />
            <span className="ci-info-label">Date</span>
            <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="ci-kpi-grid">
          <div className="ci-kpi-card kpi-gold">
            <div className="ci-kpi-icon ci-icon-gold"><Receipt size={20} /></div>
            <div className="ci-kpi-body">
              <div className="ci-kpi-value">{invoices.length}</div>
              <div className="ci-kpi-label">My Invoices</div>
              <div className="ci-kpi-sub">
                <span className="ci-kpi-trend trend-up"><ArrowUpRight size={10} /> {paidInvs.length} paid</span>
              </div>
            </div>
          </div>
          <div className="ci-kpi-card kpi-green">
            <div className="ci-kpi-icon ci-icon-green"><TrendingUp size={20} /></div>
            <div className="ci-kpi-body">
              <div className="ci-kpi-value" style={{ fontSize: 18 }}>{inr(totalRev)}</div>
              <div className="ci-kpi-label">Revenue Collected</div>
              <div className="ci-kpi-sub">
                <span className="ci-kpi-trend trend-up"><ArrowUpRight size={10} /> {paidInvs.length} paid invoices</span>
              </div>
            </div>
          </div>
          <div className="ci-kpi-card kpi-amber">
            <div className="ci-kpi-icon ci-icon-amber"><Clock size={20} /></div>
            <div className="ci-kpi-body">
              <div className="ci-kpi-value">{pendingInvs.length}</div>
              <div className="ci-kpi-label">Pending</div>
              <div className="ci-kpi-sub">Awaiting payment</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="ci-toolbar">
          <div className="ci-search-box">
            <Search size={15} color="#D6D3D1" />
            <input
              placeholder="Search by invoice ID or customer…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Filter size={15} color="#8B7355" style={{ flexShrink: 0 }} />
          <select className="ci-select" value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {['All', 'Paid', 'Pending', 'Overdue'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── Invoice Table ── */}
        <div className="ci-table-card">
          <div className="ci-table-scroll">
            <table className="ci-table">
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
                      <div className="ci-empty"><FileText size={36} /><p>No invoices found</p></div>
                    </td>
                  </tr>
                ) : paginated.map(inv => {
                  const { total } = calcInvoice(inv);
                  return (
                    <tr key={inv.id}>
                      <td><span className="ci-id-cell">{inv.id}</span></td>
                      <td>
                        <div className="ci-customer-name">{inv.customer}</div>
                        <div className="ci-customer-sub">{inv.email}</div>
                      </td>
                      <td style={{ color: '#8B7355' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</td>
                      <td><span className="ci-amount">{inr(total)}</span></td>
                      <td>
                        <span className={`ci-badge ${badgeClass(inv.status)}`}>{inv.status}</span>
                      </td>
                      <td><span className="ci-payment-chip">{inv.payment}</span></td>
                      <td style={{ color: '#8B7355' }}>{inv.date}</td>
                      <td style={{ color: inv.status === 'Overdue' ? '#dc2626' : '#8B7355', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>
                        {inv.dueDate}
                      </td>
                      <td>
                        <div className="ci-actions">
                          <button className="ci-act-btn" title="Preview Invoice" onClick={() => setPreview(inv)}>
                            <Eye size={14} />
                          </button>
                          <button className="ci-act-btn" title="Download PDF" onClick={() => printInvoice(inv)}>
                            <Download size={14} />
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
          <div className="ci-pagination">
            <div className="ci-page-info">
              Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} invoices
            </div>
            <div className="ci-page-btns">
              <button className="ci-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`ci-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="ci-page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
