// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Cashier Invoice Module + PDF Preview               ║
// ║   Includes: Invoice List, PDF Preview Modal, Email & Download      ║
// ║   All CSS, all components, all logic — ONE FILE                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useEffect } from 'react';
import {
  Search, Eye, Download, Mail, FileText, X,
  ChevronLeft, ChevronRight, Printer, CheckCircle,
  AlertCircle, Receipt, TrendingUp, Clock, Filter,
  Send, Package,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — NexBill Color Palette (matches project)
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  .ci-page { display:flex; flex-direction:column; gap:20px; font-family:'Inter',system-ui,sans-serif; }

  /* ── KPI Cards ── */
  .ci-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .ci-kpi-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:20px; display:flex; align-items:flex-start; gap:14px; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .ci-kpi-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ci-icon-gold  { background:#EFE7DE; color:#8B7355; }
  .ci-icon-green { background:#DCFCE7; color:#16a34a; }
  .ci-icon-amber { background:#FEF9C3; color:#ca8a04; }
  .ci-kpi-value  { font-size:24px; font-weight:700; color:#2D2D2D; line-height:1; margin-bottom:4px; }
  .ci-kpi-label  { font-size:13px; font-weight:500; color:#3F3F46; }
  .ci-kpi-sub    { font-size:11px; color:#8B7355; margin-top:2px; }

  /* ── Toolbar ── */
  .ci-toolbar { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .ci-search-box { flex:1; min-width:200px; display:flex; align-items:center; gap:8px; background:#F8F5F2; border:1.5px solid #EFE7DE; border-radius:9px; padding:0 12px; height:38px; }
  .ci-search-box input { flex:1; border:none; background:transparent; outline:none; font-size:13px; color:#2D2D2D; font-family:inherit; }
  .ci-search-box input::placeholder { color:#D6D3D1; }
  .ci-select { height:38px; padding:0 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#3F3F46; background:#F8F5F2; outline:none; font-family:inherit; cursor:pointer; }
  .ci-select:focus { border-color:#C6A969; }
  .ci-date-input { height:38px; padding:0 12px; border:1.5px solid #EFE7DE; border-radius:9px; font-size:13px; color:#3F3F46; background:#F8F5F2; outline:none; font-family:inherit; cursor:pointer; }

  /* ── Table Card ── */
  .ci-table-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(45,45,45,0.05); }
  .ci-table-scroll { overflow-x:auto; }
  .ci-table { width:100%; border-collapse:collapse; font-size:13px; }
  .ci-table thead th { background:#F8F5F2; padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #EFE7DE; white-space:nowrap; }
  .ci-table tbody td { padding:12px 14px; border-bottom:1px solid #F8F5F2; color:#3F3F46; vertical-align:middle; }
  .ci-table tbody tr:last-child td { border-bottom:none; }
  .ci-table tbody tr:hover td { background:#FDFCFB; }
  .ci-id-cell { font-weight:700; color:#2D2D2D; font-size:13px; }
  .ci-customer-name { font-weight:600; color:#2D2D2D; font-size:13px; }
  .ci-customer-sub  { font-size:11px; color:#8B7355; margin-top:2px; }
  .ci-amount { font-weight:700; color:#2D2D2D; }

  /* ── Status Badges ── */
  .ci-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .cbadge-paid    { background:#DCFCE7; color:#16a34a; }
  .cbadge-pending { background:#FEF9C3; color:#ca8a04; }
  .cbadge-overdue { background:#FEE2E2; color:#dc2626; }
  .cbadge-draft   { background:#F1F5F9; color:#64748b; }

  /* ── Action Buttons ── */
  .ci-actions { display:flex; align-items:center; gap:5px; }
  .ci-act-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; transition:all 0.15s; }
  .ci-act-btn:hover           { background:#2D2D2D; color:#C6A969; border-color:#2D2D2D; }
  .ci-act-btn.btn-blue:hover  { background:#DBEAFE; color:#2563eb; border-color:#93C5FD; }

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
  .ci-pdf-modal { background:#FFFFFF; border-radius:18px; width:100%; max-width:820px; max-height:92vh; display:flex; flex-direction:column; box-shadow:0 28px 72px rgba(45,45,45,0.28); overflow:hidden; }
  .ci-pdf-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid #EFE7DE; flex-shrink:0; background:#FFFFFF; }
  .ci-pdf-modal-title { font-size:14px; font-weight:700; color:#2D2D2D; display:flex; align-items:center; gap:8px; }
  .ci-pdf-modal-acts { display:flex; gap:8px; align-items:center; }
  .ci-pdf-modal-body { flex:1; overflow-y:auto; padding:28px; background:#F0EDE9; }
  .ci-close-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; cursor:pointer; color:#8B7355; }
  .ci-close-btn:hover { background:#EFE7DE; color:#2D2D2D; }
  .ci-btn-primary { display:flex; align-items:center; gap:6px; padding:0 18px; height:36px; background:#2D2D2D; color:#F8F5F2; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s,color 0.2s; }
  .ci-btn-primary:hover { background:#C6A969; color:#2D2D2D; }

  /* ── Invoice Document ── */
  .ci-doc { background:#FFFFFF; border-radius:10px; padding:44px; box-shadow:0 2px 16px rgba(45,45,45,0.08); max-width:720px; margin:0 auto; }
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

  .ci-doc-totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
  .ci-doc-totals-inner { min-width:280px; }
  .ci-doc-tot-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; color:#3F3F46; }
  .ci-doc-tot-row.discount { color:#16a34a; font-weight:500; }
  .ci-doc-tot-row.grand { border-top:2px solid #2D2D2D; padding-top:10px; margin-top:4px; font-size:15px; font-weight:800; color:#2D2D2D; }

  .ci-doc-footer { display:flex; justify-content:space-between; align-items:flex-end; padding-top:24px; border-top:1px solid #EFE7DE; margin-top:4px; }
  .ci-doc-terms-lbl { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:6px; }
  .ci-doc-terms-txt { font-size:11.5px; color:#3F3F46; line-height:1.7; max-width:340px; }
  .ci-doc-sig { text-align:center; }
  .ci-doc-sig-line { width:140px; border-top:1.5px solid #D6D3D1; margin:0 auto 6px; margin-top:36px; }
  .ci-doc-sig-lbl  { font-size:10px; font-weight:700; color:#8B7355; text-transform:uppercase; letter-spacing:0.8px; }
  .ci-doc-sig-name { font-size:12px; color:#2D2D2D; font-weight:600; margin-top:2px; }
  .ci-doc-thankyou { text-align:center; margin-top:24px; padding:14px; background:#F8F5F2; border-radius:8px; }
  .ci-doc-ty-title { font-size:13px; font-weight:700; color:#2D2D2D; }
  .ci-doc-ty-sub   { font-size:11.5px; color:#8B7355; margin-top:3px; }

  /* ── Empty State ── */
  .ci-empty { display:flex; flex-direction:column; align-items:center; padding:48px 24px; color:#D6D3D1; gap:10px; }
  .ci-empty p { font-size:13px; }

  /* ── Toast ── */
  .ci-toast { position:fixed; top:20px; right:28px; background:#2D2D2D; color:#F8F5F2; padding:12px 18px; border-radius:10px; font-size:13px; display:flex; align-items:center; gap:8px; z-index:999; box-shadow:0 4px 16px rgba(45,45,45,0.2); animation:ciSlideIn 0.25s ease; }
  @keyframes ciSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

  /* ── Info card (cashier shift info) ── */
  .ci-info-card { background:#FFFFFF; border:1px solid #EFE7DE; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:16px; box-shadow:0 1px 4px rgba(45,45,45,0.05); flex-wrap:wrap; }
  .ci-info-chip { display:flex; align-items:center; gap:7px; background:#F8F5F2; border:1px solid #EFE7DE; border-radius:8px; padding:6px 12px; font-size:12px; color:#3F3F46; }
  .ci-info-chip strong { color:#2D2D2D; font-weight:700; }
`;

/* ══════════════════════════════════════════════════════════════════════
   MOCK DATA — Cashier's invoice records
══════════════════════════════════════════════════════════════════════ */
const CASHIER_INVOICES = [
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
  {
    id: 'INV-2026-009', customer: 'Quick Bazaar', email: 'purchase@quickbazaar.in',
    phone: '+91 9988776655', address: '2 High Street, Jaipur, Rajasthan 302001',
    gstNo: '08AABCK4567V1Z7',
    items: [
      { name: 'Wireless Router', qty: 6, rate: 3200, gst: 18 },
      { name: 'Network Switch 8-Port', qty: 3, rate: 1800, gst: 18 },
    ],
    discount: 2000, status: 'Pending', date: '23 May 2026', dueDate: '30 May 2026',
    cashier: 'Ravi Kumar', counter: 'Counter 1', payment: 'Pending',
  },
  {
    id: 'INV-2026-010', customer: 'Bright Stores', email: 'accounts@brightstores.com',
    phone: '+91 8877665544', address: '78 Park Ave, Nagpur, Maharashtra 440001',
    gstNo: '27AABCL7890W1Z1',
    items: [
      { name: 'LED Strip Lights (5m)', qty: 20, rate: 850, gst: 12 },
      { name: 'Smart Bulb Pack (4pcs)', qty: 10, rate: 1200, gst: 12 },
    ],
    discount: 1500, status: 'Pending', date: '22 May 2026', dueDate: '29 May 2026',
    cashier: 'Ravi Kumar', counter: 'Counter 1', payment: 'Pending',
  },
];

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
    return `<tr>
      <td style="text-align:center;color:#8B7355">${i + 1}</td>
      <td style="font-weight:600;color:#2D2D2D">${it.name}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">${inr(it.rate)}</td>
      <td style="text-align:right">${it.gst}%</td>
      <td style="text-align:right">${inr(lineGst)}</td>
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
    body{font-family:'Inter',sans-serif;color:#2D2D2D;background:#fff;padding:40px;max-width:800px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #EFE7DE}
    .brand-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .logo{width:46px;height:46px;background:#2D2D2D;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#C6A969;text-align:center;line-height:46px}
    .co-name{font-size:18px;font-weight:800}
    .co-sub{font-size:10px;color:#8B7355}
    .co-addr{font-size:11px;color:#3F3F46;line-height:1.7}
    .inv-title{font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:12px}
    .meta-row{display:flex;gap:20px;justify-content:flex-end;margin-bottom:3px}
    .meta-lbl{font-size:11px;color:#8B7355}
    .meta-val{font-size:12px;font-weight:600}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
    .party-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:6px}
    .party-name{font-size:14px;font-weight:700;margin-bottom:4px}
    .party-info{font-size:11.5px;color:#3F3F46;line-height:1.7}
    .stamp{display:inline-block;padding:4px 14px;border:3px solid ${sc};color:${sc};border-radius:6px;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;transform:rotate(-10deg);margin-top:12px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    thead th{background:#2D2D2D;color:#F8F5F2;padding:9px 11px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;text-align:left}
    thead th:first-child{border-radius:6px 0 0 6px;text-align:center}
    thead th:last-child{border-radius:0 6px 6px 0;text-align:right}
    thead th.r{text-align:right}
    tbody td{padding:9px 11px;border-bottom:1px solid #EFE7DE;font-size:12px;color:#3F3F46}
    .totals{display:flex;justify-content:flex-end;margin-bottom:24px}
    .totals-inner{min-width:280px}
    .tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px;color:#3F3F46}
    .tot-grand{border-top:2px solid #2D2D2D;padding-top:10px;font-size:15px;font-weight:800;color:#2D2D2D}
    .footer{display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid #EFE7DE}
    .terms-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px}
    .terms-txt{font-size:11px;color:#3F3F46;line-height:1.7;max-width:320px}
    .sig-line{width:130px;border-top:1.5px solid #D6D3D1;margin:28px auto 5px}
    .sig-lbl{font-size:9.5px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.8px;text-align:center}
    .sig-name{font-size:11.5px;color:#2D2D2D;font-weight:700;text-align:center;margin-top:2px}
    .thankyou{text-align:center;margin-top:20px;padding:12px;background:#F8F5F2;border-radius:7px}
    .ty-title{font-size:13px;font-weight:700}
    .ty-sub{font-size:11px;color:#8B7355;margin-top:3px}
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
      <div class="co-addr">📍 45 Tech Park, Bangalore, Karnataka 560001<br>📞 +91 9876 543 210 | ✉ billing@nexbill.in<br>GSTIN: 29AABCN1234M1Z5</div>
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
      <th class="r">GST%</th><th class="r">GST Amt</th><th class="r">Total</th>
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
function PDFPreviewModal({ invoice, onClose }) {
  const { subtotal, gstTotal, total } = calcInvoice(invoice);
  const sc = stampColor(invoice.status);

  return (
    <div className="ci-overlay" onClick={onClose}>
      <div className="ci-pdf-modal" onClick={e => e.stopPropagation()}>
        <div className="ci-pdf-modal-head">
          <div className="ci-pdf-modal-title"><FileText size={15} /> Invoice Preview — {invoice.id}</div>
          <div className="ci-pdf-modal-acts">
            <button className="ci-btn-primary" onClick={() => printInvoice(invoice)}>
              <Printer size={14} /> Print / Save PDF
            </button>
            <button className="ci-close-btn" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

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
                  📍 45 Tech Park, Bangalore, Karnataka 560001<br />
                  📞 +91 9876 543 210 &nbsp;|&nbsp; ✉ billing@nexbill.in<br />
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
  const headers = () => ({ Authorization: `Bearer ${user.token}` });

  const [invoices, setInvoices]   = useState([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [page, setPage]           = useState(1);
  const [previewInv, setPreview]  = useState(null);
  const [toast, setToast]         = useState(null);

  const loadInvoices = () => {
    // Try backend first, fallback to localStorage
    axios.get('/api/orders/my', { headers: headers(), withCredentials: true })
      .then(res => { if (res.data?.length) setInvoices(res.data); })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem('nexbill_invoices') || '[]');
        setInvoices(local.length ? local : CASHIER_INVOICES);
      });
  };

  useEffect(() => {
    loadInvoices();
    // Reload when tab gets focus (after billing)
    window.addEventListener('focus', loadInvoices);
    return () => window.removeEventListener('focus', loadInvoices);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // KPI
  const paidInvs    = invoices.filter(i => i.status === 'Paid');
  const pendingInvs = invoices.filter(i => i.status === 'Pending');
  const todayRev    = paidInvs.reduce((s, i) => s + calcInvoice(i).total, 0);

  return (
    <>
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && (
        <div className="ci-toast"><CheckCircle size={14} /> {toast}</div>
      )}

      {/* PDF Preview */}
      {previewInv && <PDFPreviewModal invoice={previewInv} onClose={() => setPreview(null)} />}

      <div className="ci-page">
        {/* Cashier Info Strip */}
        <div className="ci-info-card">
          <div className="ci-info-chip"><span>👤 Cashier:</span> <strong>Ravi Kumar</strong></div>
          <div className="ci-info-chip"><span>🏷️ Counter:</span> <strong>Counter 1</strong></div>
          <div className="ci-info-chip"><span>⏰ Shift:</span> <strong>9:00 AM – 5:00 PM</strong></div>
          <div className="ci-info-chip"><span>📅 Date:</span> <strong>23 May 2026</strong></div>
        </div>

        {/* KPI Cards */}
        <div className="ci-kpi-grid">
          <div className="ci-kpi-card">
            <div className="ci-kpi-icon ci-icon-gold"><Receipt size={20} /></div>
            <div>
              <div className="ci-kpi-value">{invoices.length}</div>
              <div className="ci-kpi-label">My Invoices</div>
              <div className="ci-kpi-sub">This billing cycle</div>
            </div>
          </div>
          <div className="ci-kpi-card">
            <div className="ci-kpi-icon ci-icon-green"><TrendingUp size={20} /></div>
            <div>
              <div className="ci-kpi-value">{inr(todayRev)}</div>
              <div className="ci-kpi-label">Revenue Collected</div>
              <div className="ci-kpi-sub">{paidInvs.length} paid invoices</div>
            </div>
          </div>
          <div className="ci-kpi-card">
            <div className="ci-kpi-icon ci-icon-amber"><Clock size={20} /></div>
            <div>
              <div className="ci-kpi-value">{pendingInvs.length}</div>
              <div className="ci-kpi-label">Pending</div>
              <div className="ci-kpi-sub">Awaiting payment</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ci-toolbar">
          <div className="ci-search-box">
            <Search size={15} color="#D6D3D1" />
            <input
              placeholder="Search by invoice ID or customer…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Filter size={15} color="#8B7355" />
          <select className="ci-select" value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {['All', 'Paid', 'Pending', 'Overdue'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Invoice Table */}
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
                  <th>Date</th>
                  <th>Due Date</th>
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
                          <button className="ci-act-btn btn-blue" title="Send Email" onClick={() => showToast(`Email sent to ${inv.email}`)}>
                            <Send size={14} />
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
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} invoices
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
