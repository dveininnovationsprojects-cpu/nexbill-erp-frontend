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
  User, Calendar, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';


/* ══════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — NexBill Color Palette (matches project)
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  .ci-page { display:flex; flex-direction:column; gap:20px; font-family:'Inter',system-ui,sans-serif; width:100%; overflow-x:hidden; }

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
  .ci-toolbar { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 1px 4px rgba(45,45,45,0.05); width:100%; box-sizing:border-box; }
  .ci-search-box { flex:1; min-width:200px; display:flex; align-items:center; gap:8px; background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:9px; padding:0 12px; height:38px; transition:border-color 0.2s; }
  .ci-search-box:focus-within { border-color:#C6A969; }
  .ci-search-box input { flex:1; border:none; background:transparent; outline:none; font-size:13px; color:#2D2D2D; font-family:inherit; }
  .ci-search-box input::placeholder { color:#D6D3D1; }
  .ci-select { height:38px; padding:0 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#3F3F46; background:#F8F5F2; outline:none; font-family:inherit; cursor:pointer; }
  .ci-select:focus { border-color:#C6A969; }

  /* ── Table Card ── */
  .ci-table-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(45,45,45,0.05); width:100%; box-sizing:border-box; }
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
  .ci-doc { background:#FFFFFF; border-radius:12px; overflow:hidden; max-width:760px; margin:0 auto; box-shadow:0 4px 24px rgba(45,45,45,0.12); font-size:12px; }
  .ci-doc-header-band { background:#F8F6F3; border-bottom:1px solid #EDE9E4; padding:18px 28px; display:flex; justify-content:space-between; align-items:flex-start; }
  .ci-doc-brand  { display:flex; align-items:center; gap:12px; }
  .ci-doc-logo   { width:42px; height:42px; background:transparent; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:#C6A969; flex-shrink:0; overflow:hidden; }
  .ci-doc-logo img { width:100%; height:100%; object-fit:contain; }
  .ci-doc-company     { font-size:15px; font-weight:800; color:#2D2D2D; }
  .ci-doc-company-sub { font-size:10px; color:#8B7355; margin-top:2px; }
  .ci-doc-addr        { font-size:9.5px; color:#8B7355; margin-top:3px; line-height:1.5; }
  .ci-doc-inv-label  { text-align:right; }
  .ci-doc-title      { font-size:20px; font-weight:900; color:#C6A969; letter-spacing:4px; line-height:1; }
  .ci-doc-inv-num    { font-size:11px; color:#A0A0A0; margin-top:4px; }
  .ci-doc-gold-strip { height:4px; background:linear-gradient(90deg,#C6A969 0%,#E8D5A0 50%,#8B7355 100%); }

  /* Info band */
  .ci-doc-info-band { background:#F8F6F3; display:flex; border-bottom:1px solid #E8E2DA; }
  .ci-doc-info-col  { flex:1; padding:10px 14px; border-right:1px solid #E0DBD4; }
  .ci-doc-info-col:last-child { border-right:none; text-align:right; }
  .ci-doc-info-lbl  { font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
  .ci-doc-info-val  { font-size:11.5px; font-weight:700; color:#1a1a1a; }
  .ci-doc-info-val.gold { color:#C6A969; }
  .ci-doc-status-chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:10px; font-weight:700; }

  /* Body */
  .ci-doc-body { padding:16px 24px; }

  /* Parties */
  .ci-doc-parties { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
  .ci-doc-party   { background:#F8F6F3; border-radius:8px; padding:10px 14px; border:1px solid #EDE9E4; }
  .ci-doc-party.right { text-align:right; }
  .ci-doc-party-lbl  { font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; border-bottom:1px solid #EDE9E4; padding-bottom:4px; }
  .ci-doc-party-name { font-size:13px; font-weight:800; color:#1a1a1a; margin-bottom:3px; }
  .ci-doc-party-info { font-size:10.5px; color:#555; line-height:1.6; }
  .ci-doc-party-gstin{ font-size:10px; color:#8B7355; font-weight:600; margin-top:4px; border-top:1px dashed #E0DBD4; padding-top:4px; }
  .ci-doc-stamp { display:inline-block; padding:3px 12px; border-radius:3px; font-size:9px; font-weight:900; letter-spacing:3px; text-transform:uppercase; transform:rotate(-5deg); margin-top:8px; }

  /* Table */
  .ci-doc-table-wrap { border-radius:8px; overflow:hidden; border:1px solid #DDD; margin-bottom:14px; }
  .ci-doc-table { width:100%; border-collapse:collapse; font-size:11px; }
  .ci-doc-table thead tr.main-hdr { background:#F8F6F3; border-bottom:1px solid #EDE9E4; }
  .ci-doc-table thead tr.sub-hdr  { background:#F0EDE8; }
  .ci-doc-table thead th { padding:8px 10px; font-size:8.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.7px; text-align:left; white-space:nowrap; }
  .ci-doc-table thead th.r { text-align:right; }
  .ci-doc-table thead th.c { text-align:center; }
  .ci-doc-table thead th.grp { text-align:center; font-size:8px; color:#bbb; }
  .ci-doc-table tbody tr:nth-child(even) { background:#FAFAFA; }
  .ci-doc-table tbody tr:nth-child(odd)  { background:#FFFFFF; }
  .ci-doc-table tbody td { padding:8px 10px; font-size:11px; color:#333; border-bottom:1px solid #F0ECE8; }
  .ci-doc-table tbody tr:last-child td { border-bottom:none; }
  .ci-doc-table tbody td.r    { text-align:right; font-weight:600; color:#1a1a1a; }
  .ci-doc-table tbody td.c    { text-align:center; }
  .ci-doc-table tbody td.bold { font-weight:700; color:#1a1a1a; }

  /* Bottom grid */
  .ci-doc-bottom { display:grid; grid-template-columns:1fr 240px; gap:14px; margin-bottom:12px; }

  /* Tax summary */
  .ci-doc-tax-box   { border:1px solid #E8E2DA; border-radius:8px; overflow:hidden; }
  .ci-doc-tax-title { background:#F0EDE8; padding:6px 12px; font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #E8E2DA; }
  .ci-doc-tax-table { width:100%; border-collapse:collapse; font-size:10px; }
  .ci-doc-tax-table th { padding:5px 10px; background:#F8F6F3; font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.5px; text-align:right; border-bottom:1px solid #E8E2DA; }
  .ci-doc-tax-table th:first-child { text-align:left; }
  .ci-doc-tax-table td { padding:5px 10px; border-bottom:1px solid #F5F2EF; text-align:right; color:#333; }
  .ci-doc-tax-table td:first-child { text-align:left; font-weight:600; color:#1a1a1a; }
  .ci-doc-tax-table tr:last-child td { border-bottom:none; }

  /* Totals */
  .ci-doc-totals-box  { border:1px solid #E8E2DA; border-radius:8px; overflow:hidden; }
  .ci-doc-tot-row     { display:flex; justify-content:space-between; padding:7px 12px; font-size:11.5px; border-bottom:1px solid #F5F2EF; }
  .ci-doc-tot-row:last-child { border-bottom:none; }
  .ci-doc-tot-lbl { color:#666; font-weight:500; }
  .ci-doc-tot-val { font-weight:700; color:#1a1a1a; }
  .ci-doc-tot-disc .ci-doc-tot-lbl, .ci-doc-tot-disc .ci-doc-tot-val { color:#16a34a; }
  .ci-doc-grand-row { background:#F8F6F3; border-top:2px solid #C6A969; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; }
  .ci-doc-grand-lbl { color:#8B7355; font-size:11px; font-weight:700; letter-spacing:0.3px; }
  .ci-doc-grand-val { color:#2D2D2D; font-size:15px; font-weight:900; }

  /* Amount in words */
  .ci-doc-amt-words { background:#F8F6F3; border:1px solid #E8E2DA; border-radius:8px; padding:8px 12px; margin-bottom:12px; }
  .ci-doc-amt-lbl { font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
  .ci-doc-amt-val { font-size:11px; font-weight:600; color:#1a1a1a; font-style:italic; }

  /* Footer */
  .ci-doc-footer { display:grid; grid-template-columns:1fr auto; gap:20px; align-items:flex-end; padding-top:12px; border-top:2px solid #F0ECE8; }
  .ci-doc-terms-lbl { font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .ci-doc-terms-txt { font-size:10.5px; color:#555; line-height:1.6; max-width:340px; }
  .ci-doc-sig       { text-align:center; min-width:130px; }
  .ci-doc-sig-line  { width:110px; border-top:1.5px solid #CCC; margin:28px auto 6px; }
  .ci-doc-sig-lbl   { font-size:8px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; }
  .ci-doc-sig-name  { font-size:11px; color:#1a1a1a; font-weight:700; margin-top:2px; }
  .ci-doc-sig-eoe   { font-size:9px; color:#aaa; margin-top:3px; font-style:italic; }
  .ci-doc-thankyou  { background:#F8F6F3; border-top:1px solid #EDE9E4; padding:10px 24px; display:flex; justify-content:space-between; align-items:center; }
  .ci-doc-ty-title  { font-size:11px; font-weight:700; color:#8B7355; }
  .ci-doc-ty-sub    { font-size:9.5px; color:#8B7355; }
  .ci-doc-comp-gen  { font-size:8px; color:#aaa; text-align:center; padding:4px; background:#F8F6F3; border-top:1px solid #E8E2DA; }

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
  if (status === 'Paid')      return 'cbadge-paid';
  if (status === 'Pending')   return 'cbadge-pending';
  if (status === 'Overdue')   return 'cbadge-overdue';
  if (status === 'Cancelled') return 'cbadge-draft';
  return 'cbadge-draft';
}

function stampColor(status) {
  return { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Cancelled:'#64748b' }[status] || '#64748b';
}

function normalizeStatus(rawStatus, rawDueDate) {
  const s = (rawStatus || 'PENDING').toUpperCase();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isPastDue = rawDueDate && new Date(rawDueDate) < today && !['COMPLETED','PAID','CANCELLED'].includes(s);
  if (isPastDue)                        return 'Overdue';
  if (['COMPLETED','PAID'].includes(s)) return 'Paid';
  if (s === 'CANCELLED')                return 'Cancelled';
  return 'Pending';
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
   PRINT / PDF — REAL ERP INVOICE
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
    if (!taxMap[it.gst]) taxMap[it.gst] = { taxable: 0, gst: 0 };
    taxMap[it.gst].taxable += taxable;
    taxMap[it.gst].gst     += taxable * it.gst / 100;
  });
  const taxRows = Object.entries(taxMap).map(([rate, v]) =>
    '<tr><td>' + rate + '%</td><td class="r">' + inr(v.taxable) + '</td><td class="r bold">' + inr(v.gst) + '</td></tr>'
  ).join('');

  // Pre-compute footer to avoid nested template literals (oxc parser issue)
  const discountHtml = inv.discount > 0
    ? '<div class="tot-row tot-disc"><span class="tot-lbl">Discount</span><span class="tot-val">-' + inr(inv.discount) + '</span></div>'
    : '';
  const termsHtml = showTerms
    ? '<div><div class="terms-lbl">Terms &amp; Conditions</div><div class="terms-txt">' + coTerms + '</div></div>'
    : '<div></div>';
  const sigHtml = showSig
    ? '<div class="sig-area"><div class="sig-line"></div><div class="sig-lbl">Authorized Signatory</div><div class="sig-name">' + coName + '</div><div class="eoe">E. &amp; O.E.</div></div>'
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
    body{font-family:'Inter',sans-serif;background:#f0f0f0;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12px}
    .page{background:#fff;max-width:860px;margin:0 auto;box-shadow:0 0 40px rgba(0,0,0,0.1)}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;max-width:100%}}

    /* ── Header ── */
    .hdr{background:#F8F6F3;border-bottom:1px solid #EDE9E4;padding:20px 32px;display:flex;justify-content:space-between;align-items:flex-start}
    .hdr-brand{display:flex;align-items:center;gap:12px}
    .hdr-logo{width:44px;height:44px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#C6A969;flex-shrink:0}
    .hdr-logo img{width:100%;height:100%;object-fit:contain}
    .hdr-name{font-size:17px;font-weight:800;color:#2D2D2D}
    .hdr-tag{font-size:10px;color:#8B7355;margin-top:2px}
    .hdr-addr{font-size:9.5px;color:#8B7355;margin-top:3px;line-height:1.6}
    .hdr-right{text-align:right}
    .hdr-inv-type{font-size:22px;font-weight:900;color:#C6A969;letter-spacing:4px;line-height:1}
    .hdr-inv-num{font-size:11px;color:#aaa;margin-top:4px;font-weight:500}
    .gold-strip{height:4px;background:linear-gradient(90deg,#C6A969,#E8D5A0,#8B7355)}

    /* ── Info Band ── */
    .info-band{background:#f8f6f3;border-bottom:1px solid #e8e2da;display:flex}
    .info-col{flex:1;padding:12px 20px;border-right:1px solid #e0dbd4}
    .info-col:last-child{border-right:none}
    .info-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:3px}
    .info-val{font-size:12px;font-weight:700;color:#1a1a1a}
    .info-val.gold{color:#C6A969}
    .status-pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${sColor}20;color:${sColor};border:1.5px solid ${sColor}50}

    /* ── Body ── */
    .body{padding:20px 32px}

    /* ── Parties ── */
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
    .party{background:#f8f6f3;border:1px solid #e8e2da;border-radius:8px;padding:12px 16px}
    .party.seller{text-align:right}
    .party-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;border-bottom:1px solid #e8e2da;padding-bottom:5px}
    .party-name{font-size:13px;font-weight:800;color:#1a1a1a;margin-bottom:4px}
    .party-detail{font-size:10.5px;color:#555;line-height:1.7}
    .party-gstin{font-size:10px;color:#8B7355;font-weight:600;margin-top:4px;padding-top:4px;border-top:1px dashed #e0dbd4}
    .stamp{display:inline-block;margin-top:8px;padding:3px 14px;border:2.5px solid ${sColor};color:${sColor};border-radius:3px;font-size:9px;font-weight:900;letter-spacing:3px;text-transform:uppercase;transform:rotate(-5deg)}

    /* ── Items Table ── */
    .tbl-wrap{border:1px solid #ddd;border-radius:8px;overflow:hidden;margin-bottom:16px}
    .tbl{width:100%;border-collapse:collapse;font-size:11px}
    .tbl thead tr{background:#F8F6F3;border-bottom:1px solid #EDE9E4}
    .tbl thead th{padding:9px 10px;color:#8B7355;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:0.8px;text-align:left;white-space:nowrap}
    .tbl thead th.r{text-align:right}
    .tbl thead th.c{text-align:center}
    .tbl thead th.group{text-align:center;background:#F0EDE8;border-bottom:1px solid #EDE9E4;font-size:8.5px;letter-spacing:0.5px}
    .tbl tbody tr:nth-child(even){background:#fafafa}
    .tbl tbody tr:nth-child(odd){background:#fff}
    .tbl tbody td{padding:9px 10px;color:#333;border-bottom:1px solid #f0ece8;vertical-align:middle}
    .tbl tbody tr:last-child td{border-bottom:none}
    .tbl td.c{text-align:center}
    .tbl td.r{text-align:right}
    .tbl td.bold{font-weight:700;color:#1a1a1a}

    /* ── Bottom Section ── */
    .bottom{display:grid;grid-template-columns:1fr 280px;gap:20px;margin-bottom:16px}

    /* ── Tax Summary ── */
    .tax-summary{border:1px solid #e8e2da;border-radius:8px;overflow:hidden}
    .tax-title{background:#f0ede8;padding:7px 12px;font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e8e2da}
    .tax-tbl{width:100%;border-collapse:collapse;font-size:10.5px}
    .tax-tbl thead th{padding:7px 10px;background:#f8f6f3;font-size:8.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid #e8e2da}
    .tax-tbl thead th:first-child{text-align:left}
    .tax-tbl tbody td{padding:7px 10px;border-bottom:1px solid #f5f2ef;text-align:right;color:#333}
    .tax-tbl tbody td:first-child{text-align:left;font-weight:600;color:#1a1a1a}
    .tax-tbl tbody tr:last-child td{border-bottom:none}

    /* ── Totals ── */
    .totals{border:1px solid #e8e2da;border-radius:8px;overflow:hidden}
    .tot-row{display:flex;justify-content:space-between;padding:8px 14px;font-size:12px;border-bottom:1px solid #f5f2ef}
    .tot-row:last-child{border-bottom:none}
    .tot-lbl{color:#666;font-weight:500}
    .tot-val{font-weight:700;color:#1a1a1a}
    .tot-disc .tot-lbl,.tot-disc .tot-val{color:#16a34a}
    .tot-grand{background:#F8F6F3;border-top:2px solid #C6A969;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
    .tot-grand-lbl{color:#8B7355;font-size:12px;font-weight:700;letter-spacing:0.5px}
    .tot-grand-val{color:#2D2D2D;font-size:17px;font-weight:900}

    /* ── Amount in Words ── */
    .amt-words{background:#f8f6f3;border:1px solid #e8e2da;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:11px}
    .amt-words-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}
    .amt-words-val{font-weight:600;color:#1a1a1a;font-style:italic}

    /* ── Footer ── */
    .footer{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:flex-end;padding-top:16px;border-top:2px solid #f0ece8;margin-bottom:0}
    .terms-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
    .terms-txt{font-size:10.5px;color:#666;line-height:1.7;max-width:380px}
    .sig-area{text-align:center;min-width:160px}
    .sig-line{width:140px;border-top:1.5px solid #ccc;margin:36px auto 7px}
    .sig-lbl{font-size:8px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px}
    .sig-name{font-size:11px;color:#1a1a1a;font-weight:700;margin-top:3px}
    .eoe{font-size:9px;color:#aaa;margin-top:4px;font-style:italic}

    /* ── Thank You Band ── */
    .ty-band{background:#F8F6F3;border-top:1px solid #EDE9E4;padding:12px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:20px}
    .ty-title{font-size:12px;font-weight:700;color:#8B7355}
    .ty-note{font-size:9.5px;color:#8B7355}
    .comp-gen{font-size:8.5px;color:#aaa;text-align:center;padding:6px;background:#f8f6f3;border-top:1px solid #e8e2da}
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="hdr">
    <div class="hdr-brand">
      <div class="hdr-logo">
        ${co.logoUrl ? `<img src="${co.logoUrl}">` : `<span>${coName[0]?.toUpperCase()||'C'}</span>`}
      </div>
      <div>
        <div class="hdr-name">${coName}</div>
        ${coTagline ? `<div class="hdr-tag">${coTagline}</div>` : ''}
        <div class="hdr-addr">${[coAddr,coPhone,coEmail].filter(Boolean).join(' &nbsp;|&nbsp; ')}${coGST ? ` &nbsp;|&nbsp; GSTIN: ${coGST}` : ''}</div>
      </div>
    </div>
    <div class="hdr-right">
      <div class="hdr-inv-type">TAX INVOICE</div>
      <div class="hdr-inv-num"># ${inv.id}</div>
    </div>
  </div>
  <div class="gold-strip"></div>

  <!-- INFO BAND -->
  <div class="info-band">
    <div class="info-col"><div class="info-lbl">Invoice Date</div><div class="info-val">${inv.date||'—'}</div></div>
    <div class="info-col"><div class="info-lbl">Due Date</div><div class="info-val">${inv.dueDate&&inv.dueDate!=='—'?inv.dueDate:'On Receipt'}</div></div>
    <div class="info-col"><div class="info-lbl">Payment Mode</div><div class="info-val gold">${inv.payment||'—'}</div></div>
    <div class="info-col"><div class="info-lbl">Place of Supply</div><div class="info-val">${coAddr ? coAddr.split(',').pop()?.trim() || '' : ''}</div></div>
    <div class="info-col" style="text-align:right"><div class="info-lbl">Status</div><div class="info-val"><span class="status-pill">${inv.status}</span></div></div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- PARTIES -->
    <div class="parties">
      <div class="party">
        <div class="party-lbl">Bill To</div>
        <div class="party-name">${inv.customer||'Walk-in Customer'}</div>
        <div class="party-detail">
          ${inv.phone?`<div>${inv.phone}</div>`:''}
          ${inv.email?`<div>${inv.email}</div>`:''}
          ${inv.address?`<div>${inv.address}</div>`:''}
        </div>
        ${inv.gstNo?`<div class="party-gstin">GSTIN: ${inv.gstNo}</div>`:''}
      </div>
      <div class="party seller">
        <div class="party-lbl">Seller Details</div>
        <div class="party-name">${coName}</div>
        <div class="party-detail">
          ${coPhone?`<div>${coPhone}</div>`:''}
          ${coEmail?`<div>${coEmail}</div>`:''}
          ${coAddr?`<div>${coAddr}</div>`:''}
        </div>
        ${coGST?`<div class="party-gstin">GSTIN: ${coGST}</div>`:''}
        <div><span class="stamp">${inv.status}</span></div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
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

    <!-- BOTTOM: TAX SUMMARY + TOTALS -->
    <div class="bottom">
      <!-- Tax Summary -->
      <div>
        <div class="tax-summary">
          <div class="tax-title">Tax Summary</div>
          <table class="tax-tbl">
            <thead><tr>
              <th>GST Rate</th>
              <th>Taxable Amt</th>
              <th>GST Amount</th>
            </tr></thead>
            <tbody>${taxRows}</tbody>
          </table>
        </div>
      </div>

      <!-- Totals -->
      <div class="totals">
        <div class="tot-row"><span class="tot-lbl">Subtotal</span><span class="tot-val">${inr(subtotal)}</span></div>
        <div class="tot-row"><span class="tot-lbl">GST</span><span class="tot-val">${inr(gstTotal)}</span></div>
        ${discountHtml}
        <div class="tot-grand"><span class="tot-grand-lbl">GRAND TOTAL</span><span class="tot-grand-val">${inr(grandTotal)}</span></div>
      </div>
    </div>

    <!-- AMOUNT IN WORDS -->
    <div class="amt-words">
      <div class="amt-words-lbl">Amount in Words</div>
      <div class="amt-words-val">${amountInWords(grandTotal)}</div>
    </div>

    <!-- FOOTER: TERMS + SIGNATURE -->
    ${footerHtml}

  </div><!-- /body -->

  ${coFooter ? '<div class="ty-band"><div class="ty-title">' + coFooter + '</div></div>' : ''}
  <div class="comp-gen">This is a computer generated invoice and does not require a physical signature.</div>

</div><!-- /page -->
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
function PDFPreviewModal({ invoice, onClose, co = {} }) {
  const { subtotal, gstTotal, total } = calcInvoice(invoice);
  const sc = stampColor(invoice.status);

  // Strip backend placeholder values
  const PLACEHOLDERS = ['Company Name Not Set','Please update Company Name','Please update Address'];
  const clean = (val) => (!val || PLACEHOLDERS.includes(val.trim())) ? '' : val.trim();

  const coName    = clean(co.companyName);
  const coTagline = clean(co.tagline)        || co.tagline        || '';
  const coAddr    = clean(co.companyAddress) || '';
  const coPhone   = co.companyPhone   || '';
  const coEmail   = co.companyEmail   || '';
  const coGST     = co.gstNumber      || '';
  const coTerms   = co.defaultPaymentTerms || co.invoicePaymentTerms || '';
  const coFooter  = co.invoiceFooterNote || '';
  const coLogo    = co.logoUrl        || null;
  const displayName = coName || 'Your Company';

  // Display options from settings
  const showLogo    = co.showCompanyLogo        !== false;
  const showGST     = co.showGstBreakdown       !== false;
  const showSig     = co.showSignatureArea      !== false;
  const showQR      = co.showPaymentQrCode      === true;
  const showTerms   = co.showTermsAndConditions !== false;

  const statusColors = { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Cancelled:'#64748b' };
  const sColor = statusColors[invoice.status] || '#64748b';

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
            <button className="ci-btn-sm" onClick={() => printInvoice(invoice, co)}>
              <Printer size={13} /> Print / PDF
            </button>
            <button className="ci-close-btn" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="ci-pdf-modal-body">
          <div className="ci-doc">

            {/* Header */}
            <div className="ci-doc-header-band">
              <div className="ci-doc-brand">
                <div className="ci-doc-logo">
                  {coLogo ? <img src={coLogo} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}} /> : displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="ci-doc-company">{displayName}</div>
                  {coTagline && <div className="ci-doc-company-sub">{coTagline}</div>}
                  <div className="ci-doc-addr">{[coAddr,coPhone,coEmail].filter(Boolean).join(' · ')}{coGST && ` | GSTIN: ${coGST}`}</div>
                </div>
              </div>
              <div className="ci-doc-inv-label">
                <div className="ci-doc-title">TAX INVOICE</div>
                <div className="ci-doc-inv-num"># {invoice.id}</div>
              </div>
            </div>
            <div className="ci-doc-gold-strip" />

            {/* Info Band */}
            <div className="ci-doc-info-band">
              <div className="ci-doc-info-col"><div className="ci-doc-info-lbl">Invoice Date</div><div className="ci-doc-info-val">{invoice.date||'—'}</div></div>
              <div className="ci-doc-info-col"><div className="ci-doc-info-lbl">Due Date</div><div className="ci-doc-info-val">{invoice.dueDate&&invoice.dueDate!=='—'?invoice.dueDate:'On Receipt'}</div></div>
              <div className="ci-doc-info-col"><div className="ci-doc-info-lbl">Payment Mode</div><div className="ci-doc-info-val gold">{invoice.payment}</div></div>
              <div className="ci-doc-info-col"><div className="ci-doc-info-lbl">Place of Supply</div><div className="ci-doc-info-val">{coAddr ? coAddr.split(',').pop()?.trim() || '' : ''}</div></div>
              <div className="ci-doc-info-col">
                <div className="ci-doc-info-lbl">Status</div>
                <div className="ci-doc-info-val">
                  <span className="ci-doc-status-chip" style={{background:`${sColor}20`,color:sColor,border:`1.5px solid ${sColor}50`}}>{invoice.status}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="ci-doc-body">

              {/* Parties */}
              <div className="ci-doc-parties">
                <div className="ci-doc-party">
                  <div className="ci-doc-party-lbl">Bill To</div>
                  <div className="ci-doc-party-name">{invoice.customer||'Walk-in Customer'}</div>
                  <div className="ci-doc-party-info">
                    {invoice.phone && <div>{invoice.phone}</div>}
                    {invoice.email && <div>{invoice.email}</div>}
                    {invoice.address && <div>{invoice.address}</div>}
                  </div>
                  {invoice.gstNo && <div className="ci-doc-party-gstin">GSTIN: {invoice.gstNo}</div>}
                </div>
                <div className="ci-doc-party right">
                  <div className="ci-doc-party-lbl">Seller Details</div>
                  <div className="ci-doc-party-name">{displayName}</div>
                  <div className="ci-doc-party-info">
                    {coPhone && <div>{coPhone}</div>}
                    {coEmail && <div>{coEmail}</div>}
                    {coAddr  && <div>{coAddr}</div>}
                  </div>
                  {coGST && <div className="ci-doc-party-gstin">GSTIN: {coGST}</div>}
                  <div><span className="ci-doc-stamp" style={{border:`2px solid ${sc}`,color:sc}}>{invoice.status}</span></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="ci-doc-table-wrap">
                <table className="ci-doc-table">
                  <thead>
                    <tr className="main-hdr">
                      <th className="c" style={{width:28}}>#</th>
                      <th>Description</th>
                      <th className="c">Qty</th>
                      <th className="r">Rate</th>
                      <th className="r">Taxable Amt</th>
                      <th className="c">GST %</th>
                      <th className="r">GST Amt</th>
                      <th className="r">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((it, i) => {
                      const taxable = it.qty * it.rate;
                      const gstAmt  = taxable * it.gst / 100;
                      return (
                        <tr key={i}>
                          <td className="c">{i+1}</td>
                          <td className="bold">{it.name}</td>
                          <td className="c">{it.qty}</td>
                          <td className="r">{inr(it.rate)}</td>
                          <td className="r">{inr(taxable)}</td>
                          <td className="c">{it.gst}%</td>
                          <td className="r">{inr(gstAmt)}</td>
                          <td className="r bold">{inr(taxable + gstAmt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom: Tax Summary + Totals */}
              <div className="ci-doc-bottom">
                {/* Tax Summary */}
                <div className="ci-doc-tax-box">
                  <div className="ci-doc-tax-title">Tax Summary</div>
                  <table className="ci-doc-tax-table">
                    <thead>
                      <tr><th>GST Rate</th><th>Taxable Amt</th><th>GST Amount</th></tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const taxMap = {};
                        invoice.items.forEach(it => {
                          const taxable = it.qty * it.rate;
                          if (!taxMap[it.gst]) taxMap[it.gst] = {taxable:0, gst:0};
                          taxMap[it.gst].taxable += taxable;
                          taxMap[it.gst].gst     += taxable * it.gst / 100;
                        });
                        return Object.entries(taxMap).map(([rate, v]) => (
                          <tr key={rate}>
                            <td>{rate}%</td>
                            <td>{inr(v.taxable)}</td>
                            <td style={{fontWeight:700,color:'#1a1a1a'}}>{inr(v.gst)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="ci-doc-totals-box">
                  <div className="ci-doc-tot-row"><span className="ci-doc-tot-lbl">Subtotal</span><span className="ci-doc-tot-val">{inr(subtotal)}</span></div>
                  <div className="ci-doc-tot-row"><span className="ci-doc-tot-lbl">GST</span><span className="ci-doc-tot-val">{inr(gstTotal)}</span></div>
                  {invoice.discount > 0 && (
                    <div className="ci-doc-tot-row ci-doc-tot-disc"><span className="ci-doc-tot-lbl">Discount</span><span className="ci-doc-tot-val">-{inr(invoice.discount)}</span></div>
                  )}
                  <div className="ci-doc-grand-row">
                    <span className="ci-doc-grand-lbl">GRAND TOTAL</span>
                    <span className="ci-doc-grand-val">{inr(total)}</span>
                  </div>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="ci-doc-amt-words">
                <div className="ci-doc-amt-lbl">Amount in Words</div>
                <div className="ci-doc-amt-val">{amountInWords(total)}</div>
              </div>

              {/* Footer */}
              {(showTerms || showSig) && (
                <div className="ci-doc-footer">
                  {showTerms ? <div><div className="ci-doc-terms-lbl">Terms &amp; Conditions</div><div className="ci-doc-terms-txt">{coTerms}</div></div> : <div />}
                  {showSig && (
                    <div className="ci-doc-sig">
                      <div className="ci-doc-sig-line" />
                      <div className="ci-doc-sig-lbl">Authorized Signatory</div>
                      <div className="ci-doc-sig-name">{displayName}</div>
                      <div className="ci-doc-sig-eoe">E. &amp; O.E.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thank You — only if set in Settings */}
            {coFooter && (
              <div className="ci-doc-thankyou">
                <div className="ci-doc-ty-title">{coFooter}</div>
              </div>
            )}
            <div className="ci-doc-comp-gen">This is a computer generated invoice and does not require a physical signature.</div>

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
  const [statusFilter, setStatus] = useState("Today's Invoices");
  const [page, setPage]           = useState(1);
  const [previewInv, setPreview]  = useState(null);
  const [toast, setToast]         = useState(null);
  const [co, setCo]               = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/billing/history');
      const all = res.data || [];
      const data = all.map(inv => ({
        id:         inv.invoiceNumber || String(inv.id),
        customer:   inv.customerName    || inv.customer?.name    || 'Walk-in Customer',
        email:      inv.customerEmail   || inv.customer?.email  || '',
        phone:      inv.customerPhone   || inv.customer?.phone  || '',
        address:    inv.customerAddress || inv.customer?.address || '',
        gstNo:      inv.customerGstNo   || inv.customer?.gstNo  || '',
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
        status:     normalizeStatus(inv.status, inv.dueDate),
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

  const handleEmail = async (inv) => {
    try {
      await api.post(`/api/billing/send-email/${inv.id}`);
      showToast(`Email sent for invoice ${inv.id}`);
    } catch {
      showToast('Failed to send email. Try again.', 'error');
    }
  };


  // KPI — statuses are already normalized by normalizeStatus()
  const today     = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const paidInvs  = invoices.filter(i => i.status === 'Paid');
  const totalRev  = paidInvs.reduce((s, i) => s + i.grandTotal, 0);
  const todayInvs = invoices.filter(i => i.date === today);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All Invoices' || (statusFilter === "Today's Invoices" && inv.date === today);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          co={co}
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
              <div className="ci-kpi-value">{todayInvs.length}</div>
              <div className="ci-kpi-label">Today's Bills</div>
              <div className="ci-kpi-sub">Billed on {today}</div>
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
            {["Today's Invoices", 'All Invoices'].map(s => <option key={s}>{s}</option>)}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="ci-empty"><FileText size={36} /><p>No invoices found</p></div>
                    </td>
                  </tr>
                ) : paginated.map(inv => {
                  return (
                    <tr key={inv.id}>
                      <td><span className="ci-id-cell">{inv.id}</span></td>
                      <td>
                        <div className="ci-customer-name">{inv.customer}</div>
                        <div className="ci-customer-sub">{inv.email}</div>
                      </td>
                      <td style={{ color: '#8B7355' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</td>
                      <td><span className="ci-amount">{inr(inv.grandTotal)}</span></td>
                      <td>
                        <span className={`ci-badge ${badgeClass(inv.status)}`}>{inv.status}</span>
                      </td>
                      <td><span className="ci-payment-chip">{inv.payment}</span></td>
                      <td style={{ color: '#8B7355' }}>{inv.date}</td>
                      <td>
                        <div className="ci-actions">
                          <button className="ci-act-btn" title="Preview Invoice" onClick={() => setPreview(inv)}>
                            <Eye size={14} />
                          </button>
                          <button className="ci-act-btn" title="Download PDF" onClick={() => printInvoice(inv, co)}>
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
              <button className="ci-page-btn" disabled={page === 1 || totalPages === 0} onClick={() => setPage(Math.max(1, page - 1))}>
                <ChevronLeft size={14} />
              </button>
              {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`ci-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="ci-page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(Math.min(totalPages, page + 1))}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
