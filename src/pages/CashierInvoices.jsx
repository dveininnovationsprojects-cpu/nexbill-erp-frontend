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
  .ci-doc { background:#FFFFFF; border-radius:12px; overflow:hidden; max-width:740px; margin:0 auto; box-shadow:0 4px 24px rgba(45,45,45,0.12); }

  /* Header band */
  .ci-doc-header-band { background:#1a1a1a; padding:18px 28px; display:flex; justify-content:space-between; align-items:center; }
  .ci-doc-brand  { display:flex; align-items:center; gap:12px; }
  .ci-doc-logo   { width:42px; height:42px; background:linear-gradient(135deg,#C6A969,#8B7355); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:#fff; flex-shrink:0; overflow:hidden; }
  .ci-doc-logo img { width:100%; height:100%; object-fit:contain; }
  .ci-doc-company     { font-size:15px; font-weight:800; color:#FFFFFF; }
  .ci-doc-company-sub { font-size:10px; color:#C6A969; margin-top:2px; }
  .ci-doc-inv-label  { text-align:right; }
  .ci-doc-title      { font-size:26px; font-weight:900; color:#C6A969; letter-spacing:3px; line-height:1; }
  .ci-doc-inv-num    { font-size:11px; color:#A0A0A0; margin-top:4px; }

  /* Gold strip */
  .ci-doc-gold-strip { height:4px; background:linear-gradient(90deg,#C6A969 0%,#E8D5A0 50%,#8B7355 100%); }

  /* Meta band */
  .ci-doc-meta-band { background:#F8F6F3; padding:12px 28px; display:flex; gap:0; border-bottom:1px solid #EDE9E4; }
  .ci-doc-meta-item { flex:1; padding-right:20px; border-right:1px solid #E0DBD4; }
  .ci-doc-meta-item:last-child { border-right:none; padding-right:0; padding-left:20px; text-align:right; }
  .ci-doc-meta-item:not(:first-child):not(:last-child) { padding-left:20px; }
  .ci-doc-meta-lbl { font-size:9px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
  .ci-doc-meta-val { font-size:12px; font-weight:700; color:#1a1a1a; }
  .ci-doc-meta-val.accent { color:#C6A969; }
  .ci-doc-status-chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }

  /* Body */
  .ci-doc-body { padding:20px 28px; }

  /* Parties row */
  .ci-doc-parties { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
  .ci-doc-party   { background:#F8F6F3; border-radius:8px; padding:12px 14px; border:1px solid #EDE9E4; }
  .ci-doc-party.right { text-align:right; }
  .ci-doc-party-lbl  { font-size:8.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .ci-doc-party-name { font-size:13px; font-weight:800; color:#1a1a1a; margin-bottom:3px; }
  .ci-doc-party-info { font-size:11px; color:#555; line-height:1.6; }
  .ci-doc-party-gstin{ font-size:10.5px; color:#8B7355; font-weight:600; margin-top:3px; }
  .ci-doc-stamp { display:inline-block; padding:3px 12px; border-radius:4px; font-size:10px; font-weight:900; letter-spacing:2.5px; text-transform:uppercase; transform:rotate(-7deg); margin-top:10px; }

  /* Table */
  .ci-doc-table-wrap { border-radius:10px; overflow:hidden; border:1px solid #EDE9E4; margin-bottom:16px; }
  .ci-doc-table { width:100%; border-collapse:collapse; }
  .ci-doc-table thead tr { background:#1a1a1a; }
  .ci-doc-table thead th { padding:10px 12px; font-size:9.5px; font-weight:700; color:#C6A969; text-transform:uppercase; letter-spacing:0.8px; text-align:left; }
  .ci-doc-table thead th.r { text-align:right; }
  .ci-doc-table thead th.c { text-align:center; }
  .ci-doc-table tbody tr:nth-child(even) { background:#FAFAF9; }
  .ci-doc-table tbody tr:nth-child(odd)  { background:#FFFFFF; }
  .ci-doc-table tbody td { padding:10px 12px; font-size:12.5px; color:#333; border-bottom:1px solid #F0ECE8; }
  .ci-doc-table tbody tr:last-child td { border-bottom:none; }
  .ci-doc-table tbody td.r    { text-align:right; font-weight:600; color:#1a1a1a; }
  .ci-doc-table tbody td.c    { text-align:center; color:#8B7355; font-weight:600; font-size:11px; }
  .ci-doc-table tbody td.bold { font-weight:700; color:#1a1a1a; }

  /* Totals */
  .ci-doc-totals-wrap { display:flex; justify-content:flex-end; margin-bottom:20px; }
  .ci-doc-totals-box  { width:280px; border-radius:10px; overflow:hidden; border:1px solid #EDE9E4; }
  .ci-doc-tot-row     { display:flex; justify-content:space-between; padding:8px 14px; font-size:12.5px; border-bottom:1px solid #F0ECE8; }
  .ci-doc-tot-row:last-child { border-bottom:none; }
  .ci-doc-tot-lbl { color:#555; font-weight:500; }
  .ci-doc-tot-val { font-weight:700; color:#1a1a1a; }
  .ci-doc-tot-disc .ci-doc-tot-lbl, .ci-doc-tot-disc .ci-doc-tot-val { color:#16a34a; }
  .ci-doc-grand-row { background:#1a1a1a; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; }
  .ci-doc-grand-lbl { color:#C6A969; font-size:12px; font-weight:700; letter-spacing:0.3px; }
  .ci-doc-grand-val { color:#FFFFFF; font-size:18px; font-weight:900; }

  /* Footer */
  .ci-doc-footer { display:grid; grid-template-columns:1fr auto; gap:24px; align-items:flex-end; padding-top:16px; border-top:2px solid #F0ECE8; }
  .ci-doc-terms-lbl { font-size:9px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .ci-doc-terms-txt { font-size:11px; color:#555; line-height:1.6; max-width:340px; }
  .ci-doc-sig       { text-align:center; min-width:140px; }
  .ci-doc-sig-line  { width:120px; border-top:1.5px solid #CCC; margin:28px auto 6px; }
  .ci-doc-sig-lbl   { font-size:9px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:1px; }
  .ci-doc-sig-name  { font-size:11px; color:#1a1a1a; font-weight:700; margin-top:2px; }

  /* Thank you */
  .ci-doc-thankyou  { background:linear-gradient(135deg,#1a1a1a,#2D2D2D); padding:12px 28px; text-align:center; }
  .ci-doc-ty-title  { font-size:12px; font-weight:700; color:#C6A969; letter-spacing:0.5px; }
  .ci-doc-ty-sub    { font-size:10.5px; color:#9E9087; margin-top:2px; }

  /* Addr line */
  .ci-doc-addr { font-size:10px; color:#A0A0A0; margin-top:3px; }

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
  if (['Paid','PAID','COMPLETED','paid','completed'].includes(status)) return 'cbadge-paid';
  if (['Pending','PENDING','pending'].includes(status))               return 'cbadge-pending';
  if (['Overdue','OVERDUE','overdue'].includes(status))               return 'cbadge-overdue';
  if (['CANCELLED','cancelled'].includes(status))                     return 'cbadge-draft';
  return 'cbadge-draft';
}

function stampColor(status) {
  return { Paid:'#16a34a', Pending:'#ca8a04', Overdue:'#dc2626', Draft:'#64748b' }[status] || '#64748b';
}

/* ══════════════════════════════════════════════════════════════════════
   PRINT / PDF
══════════════════════════════════════════════════════════════════════ */
function printInvoice(inv, co = {}) {
  const { subtotal, gstTotal, total } = calcInvoice(inv);
  const sc = stampColor(inv.status);
  const _PLACEHOLDERS = ['Company Name Not Set','Please update Company Name','Please update Address'];
  const _clean = (v) => (!v || _PLACEHOLDERS.includes(v.trim())) ? '' : v.trim();
  const coName    = _clean(co.companyName) || 'Your Company';
  const coTagline = co.tagline        || '';
  const coAddr    = _clean(co.companyAddress) || '';
  const coPhone   = co.companyPhone   || '';
  const coEmail   = co.companyEmail   || '';
  const coGST     = co.gstNumber      || '';
  const coTerms   = co.defaultPaymentTerms || co.invoicePaymentTerms || 'Payment due within 7 days. Late payments attract 2% monthly interest. Goods once sold cannot be returned without prior approval.';
  const coFooter  = co.invoiceFooterNote   || (co.companyEmail ? `For queries: ${co.companyEmail}` : 'Thank you for your business!');
  const showLogo  = co.showCompanyLogo        !== false;
  const showGST   = co.showGstBreakdown       !== false;
  const showSig   = co.showSignatureArea      !== false;
  const showTerms = co.showTermsAndConditions !== false;

  const rows = inv.items.map((it, i) => {
    const lineAmt = it.qty * it.rate;
    const lineGst = (lineAmt * it.gst) / 100;
    return `<tr>
      <td style="text-align:center;color:#8B7355">${i + 1}</td>
      <td style="font-weight:600;color:#2D2D2D">${it.name}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">${inr(it.rate)}</td>
      ${showGST ? `<td style="text-align:right">${it.gst}%</td><td style="text-align:right">${inr(lineGst)}</td>` : ''}
      <td style="text-align:right;font-weight:700;color:#2D2D2D">${inr(lineAmt + lineGst)}</td>
    </tr>`;
  }).join('');

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
    .header-band{background:#1a1a1a;padding:18px 32px;display:flex;justify-content:space-between;align-items:center}
    .brand{display:flex;align-items:center;gap:12px}
    .logo-box{width:40px;height:40px;background:linear-gradient(135deg,#C6A969,#8B7355);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;flex-shrink:0;overflow:hidden}
    .co-name{font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.2px}
    .co-tag{font-size:10px;color:#C6A969;margin-top:1px;font-weight:500}
    .inv-label{text-align:right}
    .inv-word{font-size:28px;font-weight:900;color:#C6A969;letter-spacing:3px;line-height:1}
    .inv-num{font-size:11.5px;color:#a0a0a0;margin-top:4px;font-weight:500}
    .gold-strip{height:4px;background:linear-gradient(90deg,#C6A969 0%,#E8D5A0 50%,#8B7355 100%)}
    .meta-band{background:#f8f6f3;padding:16px 40px;display:flex;gap:0;border-bottom:1px solid #ede9e4}
    .meta-item{flex:1;padding-right:24px;border-right:1px solid #e0dbd4}
    .meta-item:last-child{border-right:none;padding-right:0;padding-left:24px;text-align:right}
    .meta-item:not(:first-child):not(:last-child){padding-left:24px}
    .meta-lbl{font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .meta-val{font-size:13px;font-weight:700;color:#1a1a1a}
    .meta-val.accent{color:#C6A969}
    .status-chip{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${sColor}18;color:${sColor};border:1.5px solid ${sColor}40}
    .body{padding:24px 40px}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;align-items:start}
    .party-box{background:#f8f6f3;border-radius:8px;padding:12px 16px;border:1px solid #ede9e4}
    .party-box.right{text-align:right}
    .party-lbl{font-size:8.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
    .party-name{font-size:13px;font-weight:800;color:#1a1a1a;margin-bottom:3px}
    .party-info{font-size:11px;color:#555;line-height:1.6}
    .party-gstin{font-size:10.5px;color:#8B7355;font-weight:600;margin-top:3px}
    .co-info{font-size:11px;color:#888;line-height:1.6;margin-top:4px}
    .stamp-wrap{margin-top:10px}
    .stamp{display:inline-block;padding:3px 12px;border:2px solid ${sColor};color:${sColor};border-radius:4px;font-size:10px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;transform:rotate(-7deg)}
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
    .footer-band{display:grid;grid-template-columns:1fr auto;gap:32px;align-items:end;padding-top:24px;border-top:2px solid #f0ece8}
    .terms-lbl{font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
    .terms-txt{font-size:11px;color:#666;line-height:1.7;max-width:360px}
    .sig-area{text-align:center;min-width:160px}
    .sig-line{width:140px;border-top:1.5px solid #ccc;margin:32px auto 8px}
    .sig-lbl{font-size:9px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:1px}
    .sig-name{font-size:12px;color:#1a1a1a;font-weight:700;margin-top:3px}
    .thankyou{background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:12px 32px;text-align:center}
    .ty-title{font-size:12px;font-weight:700;color:#C6A969;letter-spacing:0.5px}
    .ty-sub{font-size:10.5px;color:#a0a0a0;margin-top:3px}
    @media print{body{background:#fff}.page{box-shadow:none}}
  </style>
</head>
<body>
<div class="page">
  <div class="header-band">
    <div class="brand">
      ${showLogo ? `<div class="logo-box">${co.logoUrl ? `<img src="${co.logoUrl}" style="width:100%;height:100%;object-fit:contain">` : (coName[0]?.toUpperCase() || 'C')}</div>` : ''}
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
  <div class="meta-band">
    <div class="meta-item"><div class="meta-lbl">Invoice Date</div><div class="meta-val">${inv.date}</div></div>
    <div class="meta-item"><div class="meta-lbl">Due Date</div><div class="meta-val">${inv.dueDate && inv.dueDate !== '—' ? inv.dueDate : 'On Receipt'}</div></div>
    <div class="meta-item"><div class="meta-lbl">Payment Mode</div><div class="meta-val accent">${inv.payment}</div></div>
    <div class="meta-item"><div class="meta-lbl">Status</div><div class="meta-val"><span class="status-chip">${inv.status}</span></div></div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party-box">
        <div class="party-lbl">Bill To</div>
        <div class="party-name">${inv.customer}</div>
        <div class="party-info">${inv.address ? inv.address + '<br>' : ''}${inv.phone ? inv.phone + '<br>' : ''}${inv.email || ''}</div>
        ${inv.gstNo ? `<div class="party-gstin">GSTIN: ${inv.gstNo}</div>` : ''}
      </div>
      <div class="party-box right">
        <div class="party-lbl">From</div>
        <div class="party-name">${coName}</div>
        <div class="co-info">${coAddr ? coAddr + '<br>' : ''}${coPhone ? coPhone + '<br>' : ''}${coEmail || ''}</div>
        ${coGST ? `<div class="party-gstin">GSTIN: ${coGST}</div>` : ''}
        <div class="stamp-wrap"><span class="stamp">${inv.status}</span></div>
      </div>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead><tr>
          <th class="c" style="width:36px">#</th><th>Description</th>
          <th class="r">Qty</th><th class="r">Rate</th>
          ${showGST ? '<th class="r">GST%</th><th class="r">GST Amt</th>' : ''}
          <th class="r">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="tot-row"><span class="tot-lbl">Subtotal</span><span class="tot-val">${inr(subtotal)}</span></div>
        ${showGST ? `<div class="tot-row"><span class="tot-lbl">GST Total</span><span class="tot-val">${inr(gstTotal)}</span></div>` : ''}
        ${inv.discount > 0 ? `<div class="tot-row tot-disc"><span class="tot-lbl">Discount</span><span class="tot-val">-${inr(inv.discount)}</span></div>` : ''}
        <div class="tot-grand-row"><span class="tot-grand-lbl">GRAND TOTAL</span><span class="tot-grand-val">${inr(grandTotal)}</span></div>
      </div>
    </div>
    ${(showTerms || showSig) ? `
    <div class="footer-band">
      ${showTerms ? `<div><div class="terms-lbl">Terms &amp; Conditions</div><div class="terms-txt">${coTerms}</div></div>` : '<div></div>'}
      ${showSig ? `<div class="sig-area"><div class="sig-line"></div><div class="sig-lbl">Authorized Signatory</div><div class="sig-name">${coName}</div></div>` : ''}
    </div>` : ''}
  </div>
  <div class="thankyou">
    <div class="ty-title">Thank you for your business!</div>
    <div class="ty-sub">${coFooter}</div>
  </div>
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
  const coTerms   = co.defaultPaymentTerms || co.invoicePaymentTerms || 'Payment due within 7 days. Late payments attract 2% monthly interest.';
  const coFooter  = co.invoiceFooterNote   || (coEmail ? `For queries: ${coEmail}` : 'Thank you for your business!');
  const coLogo    = co.logoUrl        || null;
  const displayName = coName || 'Your Company';

  // Display options from settings
  const showLogo    = co.showCompanyLogo        !== false;
  const showGST     = co.showGstBreakdown       !== false;
  const showSig     = co.showSignatureArea      !== false;
  const showQR      = co.showPaymentQrCode      === true;
  const showTerms   = co.showTermsAndConditions !== false;

  const statusColors = { Paid:'#16a34a', PAID:'#16a34a', COMPLETED:'#16a34a', Pending:'#ca8a04', PENDING:'#ca8a04', Overdue:'#dc2626', OVERDUE:'#dc2626', Draft:'#64748b', CANCELLED:'#64748b' };
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

            {/* ── Dark Header Band ── */}
            <div className="ci-doc-header-band">
              <div className="ci-doc-brand">
                {showLogo && (
                  <div className="ci-doc-logo">
                    {coLogo ? <img src={coLogo} alt="logo" /> : (displayName[0]?.toUpperCase() || 'C')}
                  </div>
                )}
                <div>
                  <div className="ci-doc-company">{displayName}</div>
                  {coTagline && <div className="ci-doc-company-sub">{coTagline}</div>}
                  <div className="ci-doc-addr">
                    {[coAddr, coPhone, coEmail].filter(Boolean).join(' · ')}
                    {coGST && ` | GSTIN: ${coGST}`}
                  </div>
                </div>
              </div>
              <div className="ci-doc-inv-label">
                <div className="ci-doc-title">INVOICE</div>
                <div className="ci-doc-inv-num">{invoice.id}</div>
              </div>
            </div>

            {/* ── Gold Strip ── */}
            <div className="ci-doc-gold-strip" />

            {/* ── Meta Band ── */}
            <div className="ci-doc-meta-band">
              <div className="ci-doc-meta-item">
                <div className="ci-doc-meta-lbl">Invoice Date</div>
                <div className="ci-doc-meta-val">{invoice.date || '—'}</div>
              </div>
              <div className="ci-doc-meta-item">
                <div className="ci-doc-meta-lbl">Due Date</div>
                <div className="ci-doc-meta-val">{invoice.dueDate && invoice.dueDate !== '—' ? invoice.dueDate : 'On Receipt'}</div>
              </div>
              <div className="ci-doc-meta-item">
                <div className="ci-doc-meta-lbl">Payment Mode</div>
                <div className="ci-doc-meta-val accent">{invoice.payment}</div>
              </div>
              <div className="ci-doc-meta-item">
                <div className="ci-doc-meta-lbl">Status</div>
                <div className="ci-doc-meta-val">
                  <span className="ci-doc-status-chip" style={{ background:`${sColor}18`, color:sColor, border:`1.5px solid ${sColor}40` }}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="ci-doc-body">

              {/* Parties */}
              <div className="ci-doc-parties">
                <div className="ci-doc-party">
                  <div className="ci-doc-party-lbl">Bill To</div>
                  <div className="ci-doc-party-name">{invoice.customer || 'Walk-in Customer'}</div>
                  <div className="ci-doc-party-info">
                    {invoice.address && <div>{invoice.address}</div>}
                    {invoice.phone   && <div>{invoice.phone}</div>}
                    {invoice.email   && <div>{invoice.email}</div>}
                  </div>
                  {invoice.gstNo && <div className="ci-doc-party-gstin">GSTIN: {invoice.gstNo}</div>}
                </div>
                <div className="ci-doc-party right">
                  <div className="ci-doc-party-lbl">Handled By</div>
                  <div className="ci-doc-party-name">{invoice.cashier || '—'}</div>
                  {invoice.counter && invoice.counter !== '—' && (
                    <div className="ci-doc-party-info">{invoice.counter}</div>
                  )}
                  <div>
                    <span className="ci-doc-stamp" style={{ border:`2px solid ${sc}`, color:sc }}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="ci-doc-table-wrap">
                <table className="ci-doc-table">
                  <thead>
                    <tr>
                      <th className="c" style={{ width:32 }}>#</th>
                      <th>Description</th>
                      <th className="r">Qty</th>
                      <th className="r">Rate</th>
                      {showGST && <th className="r">GST%</th>}
                      {showGST && <th className="r">GST Amt</th>}
                      <th className="r">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((it, i) => {
                      const lineAmt = it.qty * it.rate;
                      const lineGst = (lineAmt * it.gst) / 100;
                      return (
                        <tr key={i}>
                          <td className="c">{i + 1}</td>
                          <td className="bold">{it.name}</td>
                          <td className="r">{it.qty}</td>
                          <td className="r">{inr(it.rate)}</td>
                          {showGST && <td className="r">{it.gst}%</td>}
                          {showGST && <td className="r">{inr(lineGst)}</td>}
                          <td className="r">{inr(lineAmt + lineGst)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="ci-doc-totals-wrap">
                <div className="ci-doc-totals-box">
                  <div className="ci-doc-tot-row"><span className="ci-doc-tot-lbl">Subtotal</span><span className="ci-doc-tot-val">{inr(subtotal)}</span></div>
                  {showGST && <div className="ci-doc-tot-row"><span className="ci-doc-tot-lbl">GST Total</span><span className="ci-doc-tot-val">{inr(gstTotal)}</span></div>}
                  {invoice.discount > 0 && (
                    <div className="ci-doc-tot-row ci-doc-tot-disc"><span className="ci-doc-tot-lbl">Discount</span><span className="ci-doc-tot-val">-{inr(invoice.discount)}</span></div>
                  )}
                  <div className="ci-doc-grand-row">
                    <span className="ci-doc-grand-lbl">GRAND TOTAL</span>
                    <span className="ci-doc-grand-val">{inr(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {(showTerms || showSig) && (
                <div className="ci-doc-footer">
                  {showTerms ? (
                    <div>
                      <div className="ci-doc-terms-lbl">Terms &amp; Conditions</div>
                      <div className="ci-doc-terms-txt">{coTerms}</div>
                    </div>
                  ) : <div />}
                  {showSig && (
                    <div className="ci-doc-sig">
                      <div className="ci-doc-sig-line" />
                      <div className="ci-doc-sig-lbl">Authorized Signatory</div>
                      <div className="ci-doc-sig-name">{displayName}</div>
                    </div>
                  )}
                </div>
              )}

            </div>{/* /body */}

            {/* Thank You */}
            <div className="ci-doc-thankyou">
              <div className="ci-doc-ty-title">Thank you for your business!</div>
              <div className="ci-doc-ty-sub">{coFooter}</div>
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
        status:     inv.status        || 'Paid',
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


  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // KPI — handle all backend status variants
  const isPaid    = s => ['Paid','PAID','COMPLETED','paid','completed'].includes(s);
  const isPending = s => ['Pending','PENDING','pending'].includes(s);
  const paidInvs    = invoices.filter(i => isPaid(i.status));
  const pendingInvs = invoices.filter(i => isPending(i.status));
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
