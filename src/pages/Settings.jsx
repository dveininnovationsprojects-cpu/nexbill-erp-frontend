// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Settings Module  (Enhanced UI v2)                  ║
// ║   Tabs: Business Profile · Invoice · Tax & GST ·                   ║
// ║          Notifications · Security                                  ║
// ║   All CSS, all components, all logic — ONE FILE                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Building2, FileText, Percent, Bell, Shield,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, X,
  User, Phone, Mail, MapPin, Globe, Hash, Camera,
  CreditCard, Calendar, Clock, ToggleLeft, ToggleRight,
  ChevronRight, Lock, Smartphone, RefreshCw, Upload,
  Info, AlertTriangle, Send, Check,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   STYLES — NexBill Design System (matches Layout, Profile, Invoices)
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  * { box-sizing: border-box; }

  .st-shell {
    display: flex;
    gap: 0;
    font-family: 'Inter', system-ui, sans-serif;
    min-height: calc(100vh - 120px);
    align-items: flex-start;
  }

  /* ── Sidebar ── */
  .st-sidebar {
    width: 224px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: hidden;
    box-shadow: none;
    position: sticky;
    top: 20px;
  }
  .st-sidebar-section {
    padding: 14px 16px 6px;
    font-size: 10px; font-weight: 700;
    color: #8B7355;
    text-transform: uppercase; letter-spacing: 0.8px;
    border-top: 1px solid #F8F5F2;
  }
  .st-sidebar-section:first-child { border-top: none; }
  .st-tab {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    cursor: pointer; transition: all 0.15s;
    color: #9E9087; font-size: 13px; font-weight: 500;
    border: none; background: none;
    font-family: inherit; width: 100%; text-align: left;
    border-left: 3px solid transparent;
    position: relative;
  }
  .st-tab:hover { background: rgba(198,169,105,0.06); color: #2D2D2D; }
  .st-tab.active {
    background: rgba(198,169,105,0.1);
    color: #C6A969;
    border-left-color: #C6A969;
    font-weight: 600;
  }
  .st-tab svg { flex-shrink: 0; }
  .st-tab-dot {
    width: 6px; height: 6px;
    background: #C6A969; border-radius: 50%;
    margin-left: auto; flex-shrink: 0;
  }

  /* ── Content ── */
  .st-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── Sub-header ── */
  .st-subheader {
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 14px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
  }
  .st-subheader-icon {
    width: 42px; height: 42px;
    background: #2D2D2D;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    color: #C6A969; flex-shrink: 0;
  }
  .st-subheader-title { font-size: 16px; font-weight: 700; color: #2D2D2D; }
  .st-subheader-sub   { font-size: 12px; color: #8B7355; margin-top: 3px; }

  /* ── Card ── */
  .st-card {
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
  }
  .st-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid #EFE7DE;
  }
  .st-card-title {
    font-size: 14px; font-weight: 700; color: #2D2D2D;
    display: flex; align-items: center; gap: 8px;
  }
  .st-card-sub { font-size: 12px; color: #8B7355; margin-top: 3px; }
  .st-card-body { padding: 20px 22px; }
  .st-card-foot {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 14px 22px;
    border-top: 1px solid #EFE7DE;
    background: #FDFCFB;
  }

  /* ── Form fields ── */
  .st-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .st-field:last-child { margin-bottom: 0; }
  .st-field label {
    font-size: 10.5px; font-weight: 700; color: #3F3F46;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .st-field input, .st-field select, .st-field textarea {
    padding: 9px 12px;
    border: 1.5px solid #EFE7DE;
    border-radius: 9px;
    font-size: 13px; color: #2D2D2D;
    background: #F8F5F2; outline: none;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  .st-field input:focus, .st-field select:focus, .st-field textarea:focus {
    border-color: #C6A969;
    box-shadow: 0 0 0 3px rgba(198,169,105,0.12);
    background: #FFFFFF;
  }
  .st-field textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
  .st-field-hint { font-size: 11px; color: #8B7355; margin-top: 3px; }
  .st-field-badge {
    font-size: 10px; font-weight: 700; color: #16a34a;
    background: #DCFCE7; padding: 2px 8px; border-radius: 10px;
    border: 1px solid #86EFAC; margin-left: 6px;
  }
  .st-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .st-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* Input with icon */
  .st-input-wrap { position: relative; }
  .st-input-wrap input { padding-left: 36px; }
  .st-input-icon {
    position: absolute; left: 10px; top: 50%;
    transform: translateY(-50%); color: #8B7355; pointer-events: none;
  }
  .st-eye-btn {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #8B7355; padding: 2px; display: flex; align-items: center;
  }
  .st-eye-btn:hover { color: #2D2D2D; }

  /* ── Section label ── */
  .st-section-lbl {
    font-size: 11px; font-weight: 700; color: #8B7355;
    text-transform: uppercase; letter-spacing: 0.7px;
    margin: 20px 0 14px;
    display: flex; align-items: center; gap: 6px;
  }
  .st-section-lbl::after { content: ''; flex: 1; height: 1px; background: #EFE7DE; }
  .st-section-lbl:first-child { margin-top: 0; }

  /* ── Logo / Avatar ── */
  .st-logo-wrap {
    display: flex; align-items: center; gap: 20px;
    padding: 18px; background: #F8F5F2;
    border: 1px solid #EFE7DE; border-radius: 12px;
    margin-bottom: 22px;
  }
  .st-logo-box {
    width: 76px; height: 76px;
    background: #2D2D2D; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 900; color: #C6A969;
    flex-shrink: 0; overflow: hidden;
  }
  .st-logo-info { flex: 1; }
  .st-logo-name { font-size: 16px; font-weight: 700; color: #2D2D2D; }
  .st-logo-sub  { font-size: 12px; color: #8B7355; margin-top: 3px; }
  .st-logo-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .st-logo-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    background: #FFFFFF; border: 1.5px dashed #C6A969;
    border-radius: 9px; font-size: 12px; font-weight: 600;
    color: #8B7355; cursor: pointer; font-family: inherit;
    transition: all 0.2s;
  }
  .st-logo-btn:hover { background: #EFE7DE; color: #2D2D2D; border-style: solid; }
  .st-logo-remove {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    background: #FEE2E2; border: 1.5px solid #FCA5A5;
    border-radius: 9px; font-size: 12px; font-weight: 600;
    color: #dc2626; cursor: pointer; font-family: inherit; transition: all 0.2s;
  }
  .st-logo-remove:hover { background: #dc2626; color: #FFFFFF; }
  .st-logo-hint { font-size: 11px; color: #8B7355; margin-top: 6px; }

  /* ── Toggle switch ── */
  .st-toggle-row {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; padding: 13px 0;
    border-bottom: 1px solid #F8F5F2;
  }
  .st-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
  .st-toggle-info { flex: 1; }
  .st-toggle-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .st-toggle-desc  { font-size: 12px; color: #8B7355; margin-top: 3px; }
  .st-toggle-btn {
    background: none; border: none; cursor: pointer;
    padding: 2px; display: flex; align-items: center; flex-shrink: 0;
    transition: transform 0.15s;
  }
  .st-toggle-btn:hover { transform: scale(1.05); }
  .st-toggle-on  { color: #C6A969; }
  .st-toggle-off { color: #D6D3D1; }

  /* ── GST slab grid ── */
  .st-gst-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
  @media (max-width: 900px) { .st-gst-grid { grid-template-columns: repeat(3, 1fr); } }
  .st-gst-chip {
    background: #F8F5F2; border: 1.5px solid #EFE7DE;
    border-radius: 12px; padding: 14px 10px; text-align: center;
    cursor: pointer; transition: all 0.2s; user-select: none;
  }
  .st-gst-chip:hover   { border-color: #C6A969; background: #FBF8F4; }
  .st-gst-chip.selected {
    border-color: #C6A969; background: #EFE7DE;
    box-shadow: 0 0 0 3px rgba(198,169,105,0.12);
  }
  .st-gst-rate { font-size: 22px; font-weight: 800; color: #2D2D2D; line-height: 1; }
  .st-gst-name { font-size: 11px; font-weight: 700; color: #8B7355; margin-top: 4px; }
  .st-gst-desc { font-size: 10px; color: #9E9087; margin-top: 2px; }
  .st-gst-chip.selected .st-gst-rate { color: #8B7355; }
  .st-gst-chip.selected .st-gst-name { color: #C6A969; }

  /* Tax summary chips */
  .st-tax-summary {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding: 14px; background: #F8F5F2;
    border: 1px solid #EFE7DE; border-radius: 10px; margin-bottom: 16px;
  }
  .st-tax-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; background: #EFE7DE;
    border: 1px solid #C6A969; border-radius: 20px;
    font-size: 12px; font-weight: 700; color: #8B7355;
  }
  .st-tax-chip-none { color: #D6D3D1; font-size: 12px; font-style: italic; }

  /* ── Security item ── */
  .st-security-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 0; border-bottom: 1px solid #F8F5F2; gap: 16px;
  }
  .st-security-item:last-child { border-bottom: none; padding-bottom: 0; }
  .st-sec-icon {
    width: 38px; height: 38px; background: #EFE7DE;
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    color: #8B7355; flex-shrink: 0;
  }
  .st-sec-info { flex: 1; }
  .st-sec-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .st-sec-desc  { font-size: 12px; color: #8B7355; margin-top: 2px; }
  .st-sec-action {
    padding: 7px 16px; background: #F8F5F2;
    border: 1.5px solid #EFE7DE; border-radius: 8px;
    font-size: 12px; font-weight: 600; color: #8B7355;
    cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap;
  }
  .st-sec-action:hover { background: #2D2D2D; color: #C6A969; border-color: #2D2D2D; }

  /* ── Buttons ── */
  .st-btn-primary {
    display: flex; align-items: center; gap: 6px;
    padding: 0 20px; height: 38px;
    background: #2D2D2D; color: #F8F5F2;
    border: none; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: background 0.2s, color 0.2s;
    white-space: nowrap;
  }
  .st-btn-primary:hover:not(:disabled) { background: #C6A969; color: #2D2D2D; }
  .st-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .st-btn-secondary {
    display: flex; align-items: center; gap: 6px;
    padding: 0 20px; height: 38px;
    background: #F8F5F2; color: #8B7355;
    border: 1.5px solid #EFE7DE; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all 0.2s; white-space: nowrap;
  }
  .st-btn-secondary:hover { background: #EFE7DE; color: #2D2D2D; }
  .st-btn-danger {
    display: flex; align-items: center; gap: 6px;
    padding: 0 18px; height: 38px;
    background: #FEE2E2; color: #dc2626;
    border: 1.5px solid #FCA5A5; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all 0.2s; white-space: nowrap;
  }
  .st-btn-danger:hover { background: #dc2626; color: #FFFFFF; border-color: #dc2626; }
  .st-btn-ghost {
    display: flex; align-items: center; gap: 6px;
    padding: 0 16px; height: 36px;
    background: none; color: #8B7355;
    border: none; border-radius: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all 0.2s;
  }
  .st-btn-ghost:hover { background: #EFE7DE; color: #2D2D2D; }

  /* ── Toast ── */
  .st-toast {
    position: fixed; top: 20px; right: 28px;
    background: #2D2D2D; color: #F8F5F2;
    padding: 12px 18px; border-radius: 10px;
    font-size: 13px; display: flex; align-items: center; gap: 8px;
    z-index: 9999; box-shadow: 0 4px 16px rgba(45,45,45,0.2);
    animation: stSlideIn 0.25s ease;
    min-width: 220px; border-left: 3px solid #22c55e;
  }
  .st-toast-err { background: #7A3A3A; border-left-color: #dc2626; }
  @keyframes stSlideIn {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .st-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(248,245,242,0.3);
    border-top-color: #F8F5F2;
    border-radius: 50%;
    animation: stSpin 0.7s linear infinite;
    display: inline-block; flex-shrink: 0;
  }
  @keyframes stSpin { to { transform: rotate(360deg); } }

  /* ── Invoice preview ── */
  .st-inv-preview {
    background: #F8F5F2; border: 1px solid #EFE7DE;
    border-radius: 12px; padding: 20px;
    position: relative; overflow: hidden;
  }
  .st-inv-preview::before {
    content: 'PREVIEW';
    position: absolute; top: 10px; right: -22px;
    background: #C6A969; color: #2D2D2D;
    font-size: 9px; font-weight: 800; letter-spacing: 1px;
    padding: 4px 28px; transform: rotate(45deg);
  }
  .st-inv-prev-head {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 14px; padding-bottom: 14px;
    border-bottom: 2px solid #2D2D2D;
  }
  .st-inv-prev-logo {
    width: 38px; height: 38px; background: #2D2D2D;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 800; color: #C6A969;
  }
  .st-inv-prev-title { font-size: 22px; font-weight: 900; color: #2D2D2D; letter-spacing: -0.5px; }
  .st-inv-prev-meta  { font-size: 11px; color: #8B7355; text-align: right; margin-top: 2px; }
  .st-inv-prev-body  {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 14px;
  }
  .st-inv-prev-label { font-size: 10px; color: #8B7355; font-weight: 600; text-transform: uppercase; }
  .st-inv-prev-val   { font-size: 12px; color: #2D2D2D; font-weight: 600; margin-top: 2px; }
  .st-inv-prev-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
  .st-inv-prev-table th {
    background: #2D2D2D; color: #C6A969; padding: 6px 10px;
    text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.4px;
  }
  .st-inv-prev-table td { padding: 6px 10px; border-bottom: 1px solid #EFE7DE; color: #2D2D2D; }
  .st-inv-prev-table tr:last-child td { border-bottom: none; }
  .st-inv-total {
    display: flex; justify-content: flex-end;
    padding-top: 10px; border-top: 2px solid #EFE7DE;
  }
  .st-inv-total-box {
    background: #2D2D2D; color: #F8F5F2;
    border-radius: 8px; padding: 10px 16px; text-align: right;
  }
  .st-inv-total-label { font-size: 10px; color: #9E9087; text-transform: uppercase; }
  .st-inv-total-val   { font-size: 18px; font-weight: 800; color: #C6A969; }

  /* ── Quota bar ── */
  .st-quota-wrap { background: #F8F5F2; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
  .st-quota-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .st-quota-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .st-quota-size  { font-size: 13px; font-weight: 700; color: #8B7355; }
  .st-quota-sub   { font-size: 11px; color: #9E9087; margin-bottom: 8px; }
  .st-quota-track { height: 8px; background: #EFE7DE; border-radius: 4px; overflow: hidden; }
  .st-quota-fill  { height: 100%; background: linear-gradient(90deg, #C6A969 0%, #8B7355 100%); border-radius: 4px; transition: width 0.4s ease; }

  /* ── Color chips ── */
  .st-color-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .st-color-chip {
    width: 30px; height: 30px; border-radius: 9px;
    cursor: pointer; border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
    position: relative;
  }
  .st-color-chip:hover { transform: scale(1.15); }
  .st-color-chip.selected { border-color: #2D2D2D; transform: scale(1.1); }
  .st-color-chip.selected::after {
    content: '✓'; position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; color: #FFFFFF;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }

  /* ── Accent preview ── */
  .st-accent-preview {
    margin-top: 14px; padding: 14px 16px;
    background: #F8F5F2; border: 1px solid #EFE7DE;
    border-radius: 10px;
  }
  .st-accent-preview-label { font-size: 11px; font-weight: 600; color: #8B7355; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .st-accent-sample-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border: none; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: default;
    font-family: inherit; margin-right: 8px; margin-bottom: 6px;
  }
  .st-accent-nav-dot {
    width: 8px; height: 8px; border-radius: 50%;
    display: inline-block; margin-right: 4px;
  }

  /* Password strength */
  .st-pw-strength { display: flex; gap: 4px; margin: 6px 0 2px; }
  .st-pw-bar { flex: 1; height: 3px; border-radius: 2px; background: #EFE7DE; transition: background 0.3s; }

  /* Info banner */
  .st-info-banner {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: 10px;
    font-size: 12px; line-height: 1.5; margin-bottom: 16px;
  }
  .st-info-banner.info   { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1d4ed8; }
  .st-info-banner.warn   { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400e; }
  .st-info-banner.success{ background: #DCFCE7; border: 1px solid #86EFAC; color: #15803d; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .st-shell   { flex-direction: column; }
    .st-sidebar { width: 100%; position: static; flex-direction: row; flex-wrap: wrap; border-radius: 12px; padding: 8px; }
    .st-sidebar-section { display: none; }
    .st-tab { width: auto; border-left: none; border-bottom: 2px solid transparent; border-radius: 8px; padding: 8px 12px; }
    .st-tab.active { border-left: none; border-bottom-color: #C6A969; }
    .st-grid2 { grid-template-columns: 1fr; }
    .st-grid3 { grid-template-columns: 1fr 1fr; }
    .st-gst-grid { grid-template-columns: repeat(3, 1fr); }
  }
`;

/* ══════════════════════════════════════════════════════════════════════
   TAB DEFINITIONS
══════════════════════════════════════════════════════════════════════ */
const TABS = [
  {
    id: 'profile',       label: 'Business Profile', icon: Building2, group: 'Account',
    sub: 'Company info used on invoices and communications',
  },
  {
    id: 'invoice',       label: 'Invoice Settings', icon: FileText,  group: 'Billing',
    sub: 'Invoice prefix, currency and numbering',
  },
  {
    id: 'security',      label: 'Security',          icon: Shield,    group: 'Account',
    sub: 'Password and account security',
  },
];

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════ */
function Toggle({ on, onChange }) {
  return (
    <button
      className={`st-toggle-btn ${on ? 'st-toggle-on' : 'st-toggle-off'}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );
}

function useSaving(onSave) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const handle = async (msg) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    onSave(msg);
    setTimeout(() => setSaved(false), 2000);
  };
  return { saving, saved, handle };
}

function SaveBtn({ saving, saved, onClick, label = 'Save', icon: Icon = Save }) {
  return (
    <button className="st-btn-primary" onClick={onClick} disabled={saving}>
      {saving
        ? <><span className="st-spinner" /> Saving…</>
        : saved
          ? <><Check size={14} style={{ color: '#22c55e' }} /> Saved!</>
          : <><Icon size={14} /> {label}</>
      }
    </button>
  );
}

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

/* ══════════════════════════════════════════════════════════════════════
   BUSINESS PROFILE TAB
══════════════════════════════════════════════════════════════════════ */
function ProfileTab({ onSave }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    companyName: '',
    tagline:     '',
    email:       '',
    phone:       '',
    website:     '',
    address:     '',
    city:        '',
    state:       '',
    pincode:     '',
    country:     'India',
    gstNo:       '',
    pan:         '',
    cin:         '',
    invoicePrefix: '',
    currency:    'INR',
    defaultReorderLevel: 10,
  });
  const [dirty, setDirty] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  useEffect(() => {
    api.get('/api/settings').then(res => {
      const s = res.data;
      setForm(f => ({
        ...f,
        companyName:         s.companyName         || '',
        email:               s.companyEmail        || '',
        phone:               s.companyPhone        || '',
        address:             s.companyAddress      || '',
        gstNo:               s.gstNumber           || '',
        invoicePrefix:       s.invoicePrefix       || '',
        currency:            s.currency            || 'INR',
        defaultReorderLevel: s.defaultReorderLevel || 10,
        logoUrl:             s.logoUrl             || null,
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings/update', {
        companyName:         form.companyName,
        companyAddress:      form.address,
        companyPhone:        form.phone,
        companyEmail:        form.email,
        gstNumber:           form.gstNo,
        invoicePrefix:       form.invoicePrefix || 'INV',
        currency:            form.currency      || 'INR',
        defaultReorderLevel: form.defaultReorderLevel || 10,
        logoUrl:             form.logoUrl       || null,
      });
      setSaved(true);
      setDirty(false);
      onSave('Business profile saved!');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      onSave(err.response?.data?.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const logoInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { onSave('Please select a valid image file.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setLogoPreview(ev.target.result); setDirty(true); };
    reader.readAsDataURL(file);
  };

  const handleDiscard = () => { setForm(orig); setDirty(false); if (logoInputRef.current) logoInputRef.current.value = ''; setLogoPreview(null); };
  return (
    <div className="st-card">
      <div className="st-card-head">
        <div>
          <div className="st-card-title"><Building2 size={15} /> Business Profile</div>
          <div className="st-card-sub">Your company information used on invoices and communications</div>
        </div>
        {dirty && <span style={{ fontSize: 11, fontWeight: 600, color: '#C6A969', background: 'rgba(198,169,105,0.12)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(198,169,105,0.25)' }}>Unsaved changes</span>}
      </div>
      <div className="st-card-body">
        <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />

        {/* Logo area */}
        <div className="st-logo-wrap">
          <div className="st-logo-box" style={logoPreview ? { background: 'transparent', padding: 4 } : {}}>
            {logoPreview
              ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />
              : form.companyName?.[0]?.toUpperCase() || 'N'
            }
          </div>
          <div className="st-logo-info">
            <div className="st-logo-name">{form.companyName}</div>
            <div className="st-logo-sub">{form.tagline}</div>
            <div className="st-logo-actions">
              <button className="st-logo-btn" onClick={() => logoInputRef.current?.click()}>
                <Upload size={12} /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
              </button>
              {logoPreview && (
                <button className="st-logo-remove" onClick={() => { setLogoPreview(null); setDirty(true); if (logoInputRef.current) logoInputRef.current.value = ''; }}>
                  <X size={12} /> Remove
                </button>
              )}
            </div>
            <div className="st-logo-hint">PNG, JPG or SVG · Max 2 MB · Recommended 256×256px</div>
          </div>
        </div>

        <div className="st-section-lbl"><Building2 size={11} /> Company Details</div>
        <div className="st-grid2">
          <div className="st-field">
            <label>Company Name *</label>
            <div className="st-input-wrap">
              <Building2 size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 34 }} value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Your Company Name" />
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
              <input style={{ paddingLeft: 34 }} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="st-field">
            <label>Phone *</label>
            <div className="st-input-wrap">
              <Phone size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 34 }} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="st-grid2">
          <div className="st-field">
            <label>Website</label>
            <div className="st-input-wrap">
              <Globe size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 34 }} value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
          </div>
          <div className="st-field">
            <label>Street Address</label>
            <div className="st-input-wrap">
              <MapPin size={14} className="st-input-icon" />
              <input style={{ paddingLeft: 34 }} value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="st-grid3">
          <div className="st-field"><label>City</label><input value={form.city}    onChange={e => set('city', e.target.value)}    /></div>
          <div className="st-field"><label>State</label><input value={form.state}   onChange={e => set('state', e.target.value)}   /></div>
          <div className="st-field"><label>PIN Code</label><input value={form.pincode} onChange={e => set('pincode', e.target.value)} /></div>
        </div>

        <div className="st-section-lbl"><Hash size={11} /> Tax Registration Numbers</div>
        <div className="st-info-banner info">
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>These numbers appear on all your invoices. Make sure they match your GST certificate exactly.</span>
        </div>
        <div className="st-grid3">
          <div className="st-field">
            <label>GSTIN <span className="st-field-badge">Verified</span></label>
            <input value={form.gstNo} onChange={e => set('gstNo', e.target.value)} placeholder="29AABCN1234M1Z5" />
            <div className="st-field-hint">15-digit GST identification number</div>
          </div>
          <div className="st-field">
            <label>PAN Number <span className="st-field-badge">Verified</span></label>
            <input value={form.pan} onChange={e => set('pan', e.target.value)} placeholder="AABCN1234M" />
            <div className="st-field-hint">10-character PAN</div>
          </div>
          <div className="st-field">
            <label>CIN <span style={{ fontSize: 10, color: '#8B7355', fontWeight: 500 }}>(optional)</span></label>
            <input value={form.cin} onChange={e => set('cin', e.target.value)} placeholder="U72300KA..." />
            <div className="st-field-hint">Company Identification Number</div>
          </div>
        </div>
      </div>
      <div className="st-card-foot">
        <button className="st-btn-secondary" onClick={() => { setDirty(false); }} disabled={!dirty}>Discard Changes</button>
        <SaveBtn saving={saving} saved={saved} onClick={handleSaveSettings} label="Save Profile" />
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════════════════════════════
   INVOICE SETTINGS TAB
══════════════════════════════════════════════════════════════════════ */
function InvoiceSettingsTab({ onSave }) {
  const { saving, saved, handle } = useSaving(onSave);
  const [form, setForm] = useState({
    prefix: 'INV-', currency: 'INR',
  });
  const [orig] = useState(form);
  const [dirty, setDirty] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  return (
    <div className="st-card">
      <div className="st-card-head">
        <div>
          <div className="st-card-title"><FileText size={15} /> Invoice Settings</div>
          <div className="st-card-sub">Control how invoices are numbered and formatted</div>
        </div>
        {dirty && <span style={{ fontSize: 11, fontWeight: 600, color: '#C6A969', background: 'rgba(198,169,105,0.12)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(198,169,105,0.25)' }}>Unsaved</span>}
      </div>
      <div className="st-card-body">
        <div className="st-section-lbl">Numbering</div>
        <div className="st-grid2">
          <div className="st-field">
            <label>Invoice Prefix</label>
            <input value={form.prefix} onChange={e => set('prefix', e.target.value)} placeholder="INV-" />
            <div className="st-field-hint">e.g. INV-, BILL-, NB-</div>
          </div>
          <div className="st-field">
            <label>Currency</label>
            <select value={form.currency} onChange={e => set('currency', e.target.value)}>
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
            </select>
          </div>
        </div>
      </div>
      <div className="st-card-foot">
        <button className="st-btn-secondary" disabled={!dirty} onClick={() => { setForm(orig); setDirty(false); }}>Discard</button>
        <SaveBtn saving={saving} saved={saved} onClick={() => handle('Invoice settings saved!')} label="Save Settings" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAX & GST TAB
══════════════════════════════════════════════════════════════════════ */
const GST_SLABS = [
  { rate: '0%',  name: 'Exempt',    desc: 'Basic necessities'     },
  { rate: '5%',  name: 'Essential', desc: 'Packaged food, drugs'  },
  { rate: '12%', name: 'Standard',  desc: 'Processed food'        },
  { rate: '18%', name: 'Standard+', desc: 'Most goods & services' },
  { rate: '28%', name: 'Luxury',    desc: 'Luxury, sin goods'     },
];

function TaxTab({ onSave }) {
  const [selected, setSelected] = useState(['18%', '5%']);
  const [cgst, setCGST]         = useState('9');
  const [sgst, setSGST]         = useState('9');
  const [igst, setIGST]         = useState('18');
  const [inclusive, setInclusive] = useState(false);
  const [hsnEnabled, setHSN]    = useState(true);
  const [sacEnabled, setSAC]    = useState(false);

  const toggleSlab = (rate) =>
    setSelected(prev => prev.includes(rate) ? prev.filter(r => r !== rate) : [...prev, rate]);

  return (
    <div className="st-card">
      <div className="st-card-head">
        <div>
          <div className="st-card-title"><Percent size={15} /> Tax &amp; GST Configuration</div>
          <div className="st-card-sub">Configure GST rates, CGST/SGST splits, and HSN/SAC codes</div>
        </div>
      </div>
      <div className="st-card-body">
        <div className="st-section-lbl">Active GST Slabs</div>
        <div className="st-tax-summary">
          {selected.length === 0
            ? <span className="st-tax-chip-none">No slabs selected</span>
            : selected.sort().map(r => (
                <span key={r} className="st-tax-chip"><CheckCircle size={10} /> {r} GST</span>
              ))
          }
        </div>
        <div className="st-gst-grid">
          {GST_SLABS.map(s => (
            <div key={s.rate} className={`st-gst-chip ${selected.includes(s.rate) ? 'selected' : ''}`} onClick={() => toggleSlab(s.rate)}>
              <div className="st-gst-rate">{s.rate}</div>
              <div className="st-gst-name">{s.name}</div>
              <div className="st-gst-desc">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="st-section-lbl">CGST / SGST / IGST Rates</div>
        <div className="st-grid3">
          <div className="st-field">
            <label>CGST Rate (%)</label>
            <input type="number" value={cgst} onChange={e => setCGST(e.target.value)} min="0" max="14" />
            <div className="st-field-hint">Central GST — intrastate</div>
          </div>
          <div className="st-field">
            <label>SGST Rate (%)</label>
            <input type="number" value={sgst} onChange={e => setSGST(e.target.value)} min="0" max="14" />
            <div className="st-field-hint">State GST — intrastate</div>
          </div>
          <div className="st-field">
            <label>IGST Rate (%)</label>
            <input type="number" value={igst} onChange={e => setIGST(e.target.value)} min="0" max="28" />
            <div className="st-field-hint">Interstate GST</div>
          </div>
        </div>
        <div className="st-info-banner info" style={{ marginBottom: 16 }}>
          <Info size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Intrastate:</strong> CGST ({cgst}%) + SGST ({sgst}%) = <strong>{Number(cgst) + Number(sgst)}%</strong> &nbsp;|&nbsp;
            <strong>Interstate:</strong> IGST ({igst}%) applies
          </span>
        </div>
        <div className="st-section-lbl">Tax Options</div>
        {[
          { val: inclusive,  set: setInclusive, label: 'Tax Inclusive Pricing', desc: 'Product prices already include GST' },
          { val: hsnEnabled, set: setHSN,       label: 'HSN Code for Goods',    desc: 'Show HSN code on invoice items' },
          { val: sacEnabled, set: setSAC,       label: 'SAC Code for Services', desc: 'Show SAC code on service items' },
        ].map(({ val, set, label, desc }) => (
          <div key={label} className="st-toggle-row">
            <div className="st-toggle-info">
              <div className="st-toggle-label">{label}</div>
              <div className="st-toggle-desc">{desc}</div>
            </div>
            <Toggle on={val} onChange={set} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
══════════════════════════════════════════════════════════════════════ */
function NotificationsTab({ onSave }) {
  const [notifs, setNotifs] = useState({
    emailNewInvoice: true, emailPaymentReceived: true, emailOverdue: true,
    emailLowStock: false,  emailCashierApproval: true,
    appNewInvoice: true,   appPaymentReceived: true,
    appOverdue: true,      appLowStock: true,
  });
  const tog = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }));

  const groups = [
    {
      title: 'Email Notifications', icon: Mail,
      sub: 'Sent to your registered email address',
      items: [
        { key: 'emailNewInvoice',      label: 'New Invoice Created',      desc: 'Notified when any invoice is generated' },
        { key: 'emailPaymentReceived', label: 'Payment Received',         desc: 'Alert when a customer payment is recorded' },
        { key: 'emailOverdue',         label: 'Invoice Overdue',          desc: 'Reminder when invoices pass their due date' },
        { key: 'emailLowStock',        label: 'Low Stock Alert',          desc: 'Email when a product falls below minimum stock' },
        { key: 'emailCashierApproval', label: 'Cashier Approval Request', desc: 'New cashier registration awaiting your approval' },
      ],
    },
    {
      title: 'In-App Notifications', icon: Bell,
      sub: 'Shown in the notification panel inside NexBill',
      items: [
        { key: 'appNewInvoice',       label: 'New Invoice',   desc: 'In-app notification when a new invoice is created' },
        { key: 'appPaymentReceived',  label: 'Payment Alert', desc: 'In-app alert when a payment is received' },
        { key: 'appOverdue',          label: 'Overdue Alert', desc: 'In-app reminder for overdue invoices' },
        { key: 'appLowStock',         label: 'Low Stock',     desc: 'In-app alert when product inventory is running low' },
      ],
    },
  ];

  return (
    <>
      {groups.map(({ title, icon: Icon, sub, items }) => (
        <div className="st-card" key={title}>
          <div className="st-card-head">
            <div>
              <div className="st-card-title"><Icon size={15} /> {title}</div>
              <div className="st-card-sub">{sub}</div>
            </div>
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
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════════════════════════════════════ */
function SecurityTab({ onSave }) {
  const { saving, saved, handle } = useSaving(onSave);
  const [pwForm, setPWForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [twoFA, setTwoFA]   = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [pwError, setPwError] = useState('');

  const togglePw = (k) => setShowPw(s => ({ ...s, [k]: !s[k] }));
  const setP = (k, v) => { setPWForm(f => ({ ...f, [k]: v })); setPwError(''); };

  const str    = pwStrength(pwForm.newPw);
  const strCol = ['', '#dc2626', '#f59e0b', '#22c55e', '#16a34a'][str];
  const strLbl = ['', 'Weak', 'Fair', 'Good', 'Strong'][str];

  const handlePwSave = async () => {
    if (!pwForm.current)                 { setPwError('Current password is required.'); return; }
    if (pwForm.newPw.length < 8)         { setPwError('New password must be at least 8 characters.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    try {
      await api.put('/api/profile/update', { password: pwForm.newPw });
      onSave('Password updated successfully!');
      setPWForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password. Try again.');
    }
  };

  const PwField = ({ field, label, placeholder }) => (
    <div className="st-field">
      <label>{label}</label>
      <div className="st-input-wrap">
        <Lock size={14} className="st-input-icon" />
        <input
          style={{ paddingLeft: 34, paddingRight: 36 }}
          type={showPw[field] ? 'text' : 'password'}
          value={pwForm[field]}
          placeholder={placeholder}
          onChange={e => setP(field, e.target.value)}
        />
        <button className="st-eye-btn" type="button" onClick={() => togglePw(field)}>
          {showPw[field] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Change Password */}
      <div className="st-card">
        <div className="st-card-head">
          <div>
            <div className="st-card-title"><Lock size={15} /> Change Password</div>
            <div className="st-card-sub">Keep your account secure with a strong, unique password</div>
          </div>
        </div>
        <div className="st-card-body">
          <PwField field="current" label="Current Password"     placeholder="Enter current password" />
          <PwField field="newPw"   label="New Password"         placeholder="Min 8 characters" />

          {/* Strength bar */}
          {pwForm.newPw.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="st-pw-strength">
                {[1,2,3,4].map(i => (
                  <div key={i} className="st-pw-bar" style={{ background: i <= str ? strCol : '#EFE7DE' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: strCol, fontWeight: 600 }}>{strLbl} password</div>
            </div>
          )}

          <PwField field="confirm" label="Confirm New Password" placeholder="Re-enter new password" />

          {pwError && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <AlertCircle size={13} /> {pwError}
            </div>
          )}

          <div style={{ background: '#F8F5F2', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#8B7355', lineHeight: 1.5 }}>
            Use at least 8 characters — mix uppercase, lowercase, numbers and symbols.
          </div>
        </div>
        <div className="st-card-foot">
          <button className="st-btn-secondary" onClick={() => { setPWForm({ current: '', newPw: '', confirm: '' }); setPwError(''); }}>Clear</button>
          <SaveBtn saving={saving} saved={saved} onClick={handlePwSave} label="Update Password" icon={Shield} />
        </div>
      </div>

    </>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   SETTINGS — DEFAULT EXPORT
══════════════════════════════════════════════════════════════════════ */
export default function Settings() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const path = location.pathname;
  const isAdmin = user?.role === 'ADMIN';
  const prefix  = isAdmin ? '/admin' : '/cashier';

  // Determine active tab from path
  let activeTab = isAdmin ? 'profile' : 'notifications';
  if (path.includes('/accounts/business-profile'))      activeTab = 'profile';
  else if (path.includes('/billing/invoice'))           activeTab = 'invoice';
  else if (path.includes('/preferences/security'))      activeTab = 'security';

  // Cashier only sees Security
  const visibleTabs = isAdmin ? TABS : TABS.filter(t => t.id === 'security');

  const TAB_URLS = {
    profile:       `${prefix}/settings/accounts/business-profile`,
    invoice:       `${prefix}/settings/billing/invoice`,
    tax:           `${prefix}/settings/billing/tax`,
    notifications: `${prefix}/settings/preferences/notifications`,
    security:      `${prefix}/settings/preferences/security`,
  };

  const setActiveTab = (id) => navigate(TAB_URLS[id]);

  const [toast, setToast] = useState(null);

  const showToast = (msg = 'Settings saved successfully!', type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeTabDef = TABS.find(t => t.id === activeTab);

  // Group tabs for sidebar rendering
  const groups = ['Account', 'Billing'];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileTab          onSave={(m, t) => showToast(m, t)} />;
      case 'invoice':       return <InvoiceSettingsTab  onSave={(m, t) => showToast(m, t)} />;
      case 'security':      return <SecurityTab         onSave={(m, t) => showToast(m, t)} />;
      default:              return null;
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      {toast && (
        <div className={`st-toast ${toast.type === 'error' ? 'st-toast-err' : ''}`}>
          {toast.type === 'error'
            ? <AlertCircle size={14} style={{ color: '#FCA5A5', flexShrink: 0 }} />
            : <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
          }
          {toast.msg}
        </div>
      )}

      <div className="st-shell">

        {/* ── Content ── */}
        <div className="st-content">

          {/* Sub-header */}
          {activeTabDef && (
            <div className="st-subheader">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="st-subheader-icon">
                  <activeTabDef.icon size={20} />
                </div>
                <div>
                  <div className="st-subheader-title">{activeTabDef.label}</div>
                  <div className="st-subheader-sub">{activeTabDef.sub}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#D6D3D1', fontWeight: 500, textAlign: 'right' }}>
                {groups.indexOf(activeTabDef.group) + 1} of 3 sections<br />
                <span style={{ color: '#EFE7DE', fontWeight: 700 }}>{activeTabDef.group}</span>
              </div>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </>
  );
}
