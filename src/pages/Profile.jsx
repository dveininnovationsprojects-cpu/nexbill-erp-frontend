// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Profile Module  (Tab UI v4)                        ║
// ║   Tabs: Personal Info · Role Details                               ║
// ║   Works for both Admin & Cashier roles — ONE FILE                  ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  User, Mail, Phone, Clock, Shield,
  LogOut, Edit3, Save, X, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Briefcase, Building2,
  ChevronRight, Award, TrendingUp, Hash, Key, Globe,
  Copy, Check, Settings, FileText, CreditCard,
  Package, AlertTriangle, LogIn, UserCheck,
  Loader2, Users, BarChart2, ShoppingCart, Receipt, DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  .pr-shell {
    display: flex; gap: 24px;
    font-family: 'Inter', system-ui, sans-serif;
    align-items: flex-start;
  }

  /* ── Left Column ── */
  .pr-left { width: 295px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; position: sticky; top: 24px; }
  .pr-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; }

  /* ── Card ── */
  .pr-card {
    background: #FFFFFF; border: 1px solid #EFE7DE;
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 3px rgba(45,45,45,0.04);
  }
  .pr-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #EFE7DE; background: #FDFCFB;
  }
  .pr-card-title { font-size: 14px; font-weight: 700; color: #2D2D2D; display: flex; align-items: center; gap: 8px; }
  .pr-card-sub   { font-size: 12px; color: #8B7355; margin-top: 3px; }
  .pr-card-body  { padding: 18px 20px; }
  .pr-card-foot  {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 14px 20px; border-top: 1px solid #EFE7DE; background: #FDFCFB;
  }

  /* ── Hero Card ── */
  .pr-hero { background: #2D2D2D; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(45,45,45,0.2); }
  .pr-hero-banner {
    height: 76px;
    background: linear-gradient(135deg, #C6A969 0%, #A08040 40%, #2D2D2D 100%);
    position: relative;
  }
  .pr-hero-banner::after {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px);
  }
  .pr-hero-body { padding: 0 20px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .pr-avatar-wrap { position: relative; margin-top: -36px; margin-bottom: 12px; z-index: 2; }
  .pr-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #C6A969 0%, #8B7355 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 800; color: #2D2D2D;
    border: 3px solid #2D2D2D;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35);
  }
  .pr-hero-name  { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; letter-spacing: -0.4px; line-height: 1.25; text-transform: capitalize; }
  .pr-hero-email { font-size: 12px; color: #9A8878; margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; font-weight: 400; }
  .pr-role-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.4px; margin-bottom: 16px;
    text-transform: uppercase;
  }
  .pr-role-admin   { background: rgba(198,169,105,0.15); color: #C6A969; border: 1px solid rgba(198,169,105,0.25); }
  .pr-role-cashier { background: rgba(34,197,94,0.12);   color: #4ade80; border: 1px solid rgba(34,197,94,0.2);   }
  .pr-completion { width: 100%; margin-bottom: 16px; }
  .pr-completion-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .pr-completion-label { font-size: 11px; color: #9E8E7E; font-weight: 500; letter-spacing: 0.1px; }
  .pr-completion-pct   { font-size: 12px; color: #C6A969; font-weight: 700; letter-spacing: 0.3px; }
  .pr-completion-track { width: 100%; height: 4px; background: rgba(255,255,255,0.07); border-radius: 4px; overflow: hidden; }
  .pr-completion-fill  { height: 100%; background: linear-gradient(90deg, #C6A969 0%, #E8D5A0 100%); border-radius: 4px; transition: width 0.6s ease; }
  .pr-hero-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.07); margin-bottom: 14px; }
  .pr-hero-stats   { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
  .pr-hero-stat    { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 13px 10px; text-align: center; transition: background 0.2s; }
  .pr-hero-stat:hover { background: rgba(255,255,255,0.09); }
  .pr-hero-stat-val { font-size: 12px; font-weight: 600; color: #C6A969; line-height: 1; letter-spacing: 0.8px; text-transform: uppercase; }
  .pr-hero-stat-lbl { font-size: 9.5px; color: #9E8E7E; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500; }
  .pr-status-online {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500; color: #4ade80; margin-top: 12px;
    background: rgba(34,197,94,0.07); padding: 5px 14px; border-radius: 20px;
    border: 1px solid rgba(34,197,94,0.13); letter-spacing: 0.2px;
  }
  .pr-status-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; animation: prPulse 2s ease infinite; }
  @keyframes prPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.8)} }

  /* ── Quick Actions ── */
  .pr-quick-action {
    display: flex; align-items: center; gap: 11px; padding: 9px 10px;
    border-radius: 9px; cursor: pointer; transition: background 0.15s, transform 0.1s;
    border: none; background: none; font-family: inherit; width: 100%; text-align: left;
  }
  .pr-quick-action:hover { background: #F8F5F2; transform: translateX(2px); }
  .pr-qa-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pr-qa-gold   { background: #EFE7DE; color: #8B7355; }
  .pr-qa-green  { background: #DCFCE7; color: #16a34a; }
  .pr-qa-red    { background: #FEE2E2; color: #dc2626; }
  .pr-qa-blue   { background: #DBEAFE; color: #2563eb; }
  .pr-qa-purple { background: #EDE9FE; color: #7c3aed; }
  .pr-qa-label  { font-size: 13px; font-weight: 600; color: #2D2D2D; flex: 1; }
  .pr-qa-sub    { font-size: 11px; color: #8B7355; margin-top: 1px; }
  .pr-qa-danger-zone {
    margin: 4px 10px 8px; padding-top: 10px;
    border-top: 1px solid #EFE7DE;
  }
  .pr-btn-signout {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 10px; border-radius: 10px;
    background: #FEF2F2; border: 1.5px solid #FECACA;
    color: #dc2626; font-size: 13px; font-weight: 700;
    font-family: inherit; cursor: pointer; transition: all 0.2s;
  }
  .pr-btn-signout:hover { background: #FEE2E2; border-color: #FCA5A5; }

  /* ══════════════════════════════════════════════════════════════
     TAB NAVIGATION (right panel)
  ══════════════════════════════════════════════════════════════ */
  .pr-tab-bar {
    display: flex; gap: 0;
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 14px 14px 0 0;
    border-bottom: none;
    box-shadow: 0 1px 3px rgba(45,45,45,0.04);
    overflow-x: auto; scrollbar-width: none;
    padding: 0 10px;
  }
  .pr-tab-bar::-webkit-scrollbar { display: none; }

  .pr-tab-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 15px 20px 13px;
    border: none; background: none; cursor: pointer;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #9E9087; white-space: nowrap;
    border-bottom: 3px solid transparent;
    transition: color 0.18s, border-color 0.18s;
  }
  .pr-tab-btn:hover { color: #2D2D2D; }
  .pr-tab-btn.active { color: #2D2D2D; border-bottom-color: #C6A969; }
  .pr-tab-btn .pr-tab-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.18s, color 0.18s; background: transparent;
  }
  .pr-tab-btn:hover .pr-tab-icon { background: #F8F5F2; }
  .pr-tab-btn.active .pr-tab-icon { background: rgba(198,169,105,0.15); color: #C6A969; }

  /* Tab panel container */
  .pr-tab-panel-wrap {
    background: #F8F5F2;
    border: 1px solid #EFE7DE;
    border-radius: 0 0 14px 14px;
    border-top: none;
    padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
    animation: prFadeSlide 0.2s ease;
  }
  @keyframes prFadeSlide {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Form Fields ── */
  .pr-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .pr-field label { font-size: 10.5px; font-weight: 700; color: #3F3F46; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-field input, .pr-field select, .pr-field textarea {
    padding: 9px 12px; border: 1.5px solid #EFE7DE; border-radius: 9px;
    font-size: 13px; color: #2D2D2D; background: #F8F5F2; outline: none;
    font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box;
  }
  .pr-field input:focus, .pr-field select:focus, .pr-field textarea:focus {
    border-color: #C6A969; box-shadow: 0 0 0 3px rgba(198,169,105,0.12); background: #FFFFFF;
  }
  .pr-field input:disabled { background: #F1EEE8; color: #8B7355; cursor: not-allowed; border-color: #EFE7DE; }
  .pr-field-hint { font-size: 11px; color: #8B7355; margin-top: 3px; }
  .pr-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pr-input-wrap { position: relative; }
  .pr-input-wrap input { padding-left: 36px; }
  .pr-input-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #8B7355; pointer-events: none; }
  .pr-eye-btn {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #8B7355; padding: 2px; display: flex; align-items: center;
  }
  .pr-eye-btn:hover { color: #2D2D2D; }

  /* ── Section Label ── */
  .pr-section-lbl {
    font-size: 11px; font-weight: 700; color: #8B7355;
    text-transform: uppercase; letter-spacing: 0.7px;
    margin: 20px 0 14px; display: flex; align-items: center; gap: 6px;
  }
  .pr-section-lbl::after { content: ''; flex: 1; height: 1px; background: #EFE7DE; }
  .pr-section-lbl:first-child { margin-top: 0; }

  /* ── Info Row ── */
  .pr-info-row {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 11px 8px; border-bottom: 1px solid #F8F5F2; gap: 12px;
    transition: background 0.1s; border-radius: 8px; margin: 0 -8px;
  }
  .pr-info-row:hover { background: #FDFCFB; }
  .pr-info-row:last-child { border-bottom: none; }
  .pr-info-icon { width: 32px; height: 32px; background: #EFE7DE; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #8B7355; flex-shrink: 0; }
  .pr-info-content { flex: 1; }
  .pr-info-label { font-size: 11px; font-weight: 600; color: #8B7355; text-transform: uppercase; letter-spacing: 0.4px; }
  .pr-info-val   { font-size: 13px; font-weight: 600; color: #2D2D2D; margin-top: 2px; }

  /* ── Copy btn ── */
  .pr-copy-btn {
    background: none; border: none; cursor: pointer; color: #D6D3D1; padding: 4px;
    display: flex; align-items: center; border-radius: 5px; transition: color 0.15s, background 0.15s;
  }
  .pr-copy-btn:hover { color: #8B7355; background: #EFE7DE; }

  /* ── Role Panel (dark) ── */
  .pr-role-panel { background: linear-gradient(135deg, #2D2D2D 0%, #3a3a3a 100%); border-radius: 12px; padding: 18px; margin-bottom: 4px; }
  .pr-rp-header  { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .pr-rp-icon    { width: 38px; height: 38px; background: rgba(198,169,105,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #C6A969; }
  .pr-rp-title   { font-size: 14px; font-weight: 700; color: #F8F5F2; }
  .pr-rp-sub     { font-size: 11px; color: #9E9087; margin-top: 2px; }
  .pr-rp-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pr-rp-stat    { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; padding: 12px; }
  .pr-rp-stat-label { font-size: 10px; color: #9E9087; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-rp-stat-val   { font-size: 14px; font-weight: 700; color: #C6A969; margin-top: 3px; }

  /* ── Buttons ── */
  .pr-btn-primary {
    display: flex; align-items: center; gap: 6px; padding: 0 20px; height: 38px;
    background: #2D2D2D; color: #F8F5F2; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: background 0.2s, color 0.2s;
  }
  .pr-btn-primary:hover { background: #C6A969; color: #2D2D2D; }
  .pr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .pr-btn-secondary {
    display: flex; align-items: center; gap: 6px; padding: 0 20px; height: 38px;
    background: #F8F5F2; color: #8B7355; border: 1.5px solid #EFE7DE; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s;
  }
  .pr-btn-secondary:hover { background: #EFE7DE; color: #2D2D2D; }
  .pr-btn-logout {
    display: flex; align-items: center; gap: 8px; padding: 0 20px; height: 42px; width: 100%;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #FFFFFF; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: opacity 0.2s, transform 0.15s; justify-content: center;
    box-shadow: 0 2px 8px rgba(220,38,38,0.25);
  }
  .pr-btn-logout:hover { opacity: 0.9; transform: translateY(-1px); }

  /* ── Toast ── */
  .pr-toast {
    position: fixed; top: 20px; right: 28px; background: #2D2D2D; color: #F8F5F2;
    padding: 12px 18px; border-radius: 10px; font-size: 13px;
    display: flex; align-items: center; gap: 8px;
    z-index: 9999; box-shadow: 0 4px 16px rgba(45,45,45,0.2);
    animation: prSlideIn 0.25s ease; min-width: 220px;
  }
  .pr-toast-success { border-left: 3px solid #22c55e; }
  .pr-toast-error   { background: #7A3A3A; border-left: 3px solid #dc2626; }
  @keyframes prSlideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }

  /* ── Modals ── */
  .pr-overlay {
    position: fixed; inset: 0; background: rgba(45,45,45,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 9998; backdrop-filter: blur(4px); animation: prFadeIn 0.2s ease;
  }
  @keyframes prFadeIn { from{opacity:0} to{opacity:1} }
  .pr-logout-modal {
    background: #FFFFFF; border-radius: 20px; padding: 36px 32px;
    width: 400px; max-width: 95vw; box-shadow: 0 24px 64px rgba(45,45,45,0.25);
    animation: prSlideUp 0.25s ease; text-align: center;
  }
  @keyframes prSlideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .pr-logout-icon-wrap { width: 68px; height: 68px; background: linear-gradient(135deg,#FEE2E2,#FECACA); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: #dc2626; border: 4px solid #FEF2F2; }
  .pr-logout-title { font-size: 20px; font-weight: 700; color: #2D2D2D; margin-bottom: 8px; }
  .pr-logout-desc  { font-size: 13px; color: #8B7355; line-height: 1.6; margin-bottom: 24px; }
  .pr-logout-user  { background: #F8F5F2; border: 1px solid #EFE7DE; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; text-align: left; }
  .pr-logout-user-avatar { width: 42px; height: 42px; background: linear-gradient(135deg,#C6A969 0%,#8B7355 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 700; color: #2D2D2D; flex-shrink: 0; }
  .pr-logout-user-email { font-size: 13px; font-weight: 700; color: #2D2D2D; }
  .pr-logout-user-role  { font-size: 11px; color: #8B7355; margin-top: 3px; }
  .pr-logout-actions    { display: flex; gap: 10px; }
  .pr-logout-actions .pr-btn-secondary { flex: 1; justify-content: center; height: 44px; }
  .pr-logout-actions .pr-btn-logout    { flex: 1; height: 44px; }
  .pr-pw-modal { background: #FFFFFF; border-radius: 18px; padding: 28px; width: 440px; max-width: 95vw; box-shadow: 0 20px 60px rgba(45,45,45,0.2); animation: prSlideUp 0.25s ease; }
  .pr-pw-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .pr-pw-modal-title { font-size: 16px; font-weight: 700; color: #2D2D2D; display: flex; align-items: center; gap: 8px; }
  .pr-pw-close { background: #F8F5F2; border: 1px solid #EFE7DE; border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8B7355; transition: all 0.2s; }
  .pr-pw-close:hover { background: #EFE7DE; color: #2D2D2D; }
  .pr-pw-form { display: flex; flex-direction: column; gap: 14px; }

  /* ── Misc ── */
  .pr-spinner { width: 14px; height: 14px; border: 2px solid rgba(248,245,242,0.3); border-top-color: #F8F5F2; border-radius: 50%; animation: prSpin 0.7s linear infinite; display: inline-block; }
  @keyframes prSpin { to{transform:rotate(360deg)} }
  .pr-sec-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F8F5F2; gap: 12px; }
  .pr-sec-item:last-child { border-bottom: none; padding-bottom: 0; }
  .pr-sec-icon { width: 34px; height: 34px; background: #EFE7DE; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #8B7355; flex-shrink: 0; }
  .pr-sec-info { flex: 1; }
  .pr-sec-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-sec-desc  { font-size: 12px; color: #8B7355; margin-top: 2px; }
  .pr-sec-action { padding: 6px 14px; background: #F8F5F2; border: 1.5px solid #EFE7DE; border-radius: 8px; font-size: 12px; font-weight: 600; color: #8B7355; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap; }
  .pr-sec-action:hover { background: #2D2D2D; color: #C6A969; border-color: #2D2D2D; }

  @media (max-width: 960px) {
    .pr-shell { flex-direction: column; }
    .pr-left  { width: 100%; position: static; }
    .pr-grid2 { grid-template-columns: 1fr; }
    .pr-grid3 { grid-template-columns: 1fr; }
    .pr-tab-btn { padding: 12px 14px 10px; font-size: 12px; }
  }
`;


/* ══════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════ */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button className="pr-copy-btn" onClick={handleCopy} title="Copy">
      {copied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PASSWORD INPUT (standalone — avoids re-mount bug if nested inside modal)
══════════════════════════════════════════════════════════════════════ */
function PwInput({ label, value, onChange, showPw, onToggle, placeholder }) {
  return (
    <div className="pr-field" style={{ marginBottom: 0 }}>
      <label>{label}</label>
      <div className="pr-input-wrap">
        <Lock size={14} className="pr-input-icon" />
        <input
          style={{ paddingLeft: 34, paddingRight: 36, boxSizing: 'border-box' }}
          type={showPw ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required
        />
        <button type="button" className="pr-eye-btn" onClick={onToggle}>
          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CHANGE PASSWORD MODAL
══════════════════════════════════════════════════════════════════════ */
function ChangePasswordModal({ onClose, onSave }) {
  const [form, setForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow]     = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const toggle = (k)  => setShow(s => ({ ...s, [k]: !s[k] }));

  const str = (() => { let s = 0; const p = form.newPw; if(p.length>=8)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return s; })();
  const strLabel = ['','Weak','Fair','Good','Strong'][str];
  const strColor = ['','#dc2626','#f59e0b','#22c55e','#16a34a'][str];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current)               { setError('Please enter your current password.'); return; }
    if (form.newPw.length < 8)       { setError('New password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(form.newPw))   { setError('Password must contain at least 1 uppercase letter.'); return; }
    if (!/[0-9]/.test(form.newPw))   { setError('Password must contain at least 1 number.'); return; }
    if (!/[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(form.newPw)) { setError('Password must contain at least 1 special character.'); return; }
    if (form.newPw !== form.confirm)  { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      await api.put('/api/profile/update', {
        currentPassword: form.current,
        password:        form.newPw,
      });
      onSave('Password updated successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pr-overlay" onClick={onClose}>
      <div className="pr-pw-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-pw-modal-head">
          <div className="pr-pw-modal-title"><Lock size={16} /> Change Password</div>
          <button className="pr-pw-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="pr-pw-form">
          <PwInput label="Current Password"     value={form.current} onChange={e => set('current', e.target.value)} showPw={show.current} onToggle={() => toggle('current')} placeholder="Enter current password" />
          <PwInput label="New Password"         value={form.newPw}   onChange={e => set('newPw',   e.target.value)} showPw={show.newPw}   onToggle={() => toggle('newPw')}   placeholder="Min 8 characters" />
          {form.newPw.length > 0 && (
            <div>
              <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=str ? strColor : '#EFE7DE', transition:'background 0.3s' }} />)}
              </div>
              <div style={{ fontSize:11, color:strColor, fontWeight:600 }}>{strLabel} password</div>
            </div>
          )}
          <PwInput label="Confirm New Password" value={form.confirm} onChange={e => set('confirm', e.target.value)} showPw={show.confirm} onToggle={() => toggle('confirm')} placeholder="Re-enter new password" />
          {error && (
            <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#dc2626', display:'flex', alignItems:'center', gap:6 }}>
              <AlertCircle size={13} />{error}
            </div>
          )}
          <div style={{ background:'#F8F5F2', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#8B7355', lineHeight:1.5 }}>
            Mix uppercase, lowercase, numbers and symbols.
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button type="button" className="pr-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="pr-btn-primary" disabled={saving}>
              {saving ? <span className="pr-spinner" /> : <><Shield size={14} /> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LOGOUT MODAL
══════════════════════════════════════════════════════════════════════ */
function LogoutModal({ user, onCancel, onConfirm, loading }) {
  return (
    <div className="pr-overlay" onClick={onCancel}>
      <div className="pr-logout-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-logout-icon-wrap"><LogOut size={30} /></div>
        <div className="pr-logout-title">Sign Out of NexBill?</div>
        <div className="pr-logout-desc">You're about to sign out. Any unsaved changes will be lost.</div>
        <div className="pr-logout-user">
          <div className="pr-logout-user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
          <div>
            <div className="pr-logout-user-email">{user?.email}</div>
            <div className="pr-logout-user-role">{user?.role === 'ADMIN' ? '⬡ Administrator' : '⬡ Cashier'} · NexBill ERP</div>
          </div>
        </div>
        <div className="pr-logout-actions">
          <button className="pr-btn-secondary" onClick={onCancel}>Stay Signed In</button>
          <button className="pr-btn-logout" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="pr-spinner" style={{ borderTopColor:'#fff' }} /> : <><LogOut size={15} /> Sign Out</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAB 1 — PERSONAL INFORMATION
══════════════════════════════════════════════════════════════════════ */
function PersonalInfoTab({ user, profileData, profileLoading, onSave, onChangePW, onProfileRefresh }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name: '', phone: '' });
  const [orig, setOrig]       = useState({ name: '', phone: '' });

  // Sync form AND orig when profileData first loads (or refreshes)
  useEffect(() => {
    if (profileData) {
      const vals = { name: profileData.name || '', phone: profileData.phone || '' };
      setForm(vals);
      setOrig(vals);
    }
  }, [profileData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/profile/update', { name: form.name, phone: form.phone });
      setOrig(form);
      setEditing(false);
      onSave('Profile updated successfully!');
      onProfileRefresh(); // Re-fetch latest from backend
    } catch (err) {
      onSave(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Personal Details Card */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><User size={15} /> Personal Details</div>
            <div className="pr-card-sub">Your display name and contact</div>
          </div>
          {!editing && !profileLoading && (
            <button className="pr-btn-secondary" style={{ height:34, fontSize:12, padding:'0 14px' }} onClick={() => setEditing(true)}>
              <Edit3 size={13} /> Edit
            </button>
          )}
        </div>
        <div className="pr-card-body">
          {profileLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'#F1EEE8', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ height:10, width:60, background:'#F1EEE8', borderRadius:4, marginBottom:6 }} />
                    <div style={{ height:13, width:'70%', background:'#F8F5F2', borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : editing ? (
            <>
              <div className="pr-grid2">
                <div className="pr-field">
                  <label>Full Name</label>
                  <div className="pr-input-wrap">
                    <User size={14} className="pr-input-icon" />
                    <input style={{ paddingLeft:34 }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
                  </div>
                </div>
                <div className="pr-field" style={{ marginBottom:0 }}>
                  <label>Phone Number</label>
                  <div className="pr-input-wrap">
                    <Phone size={14} className="pr-input-icon" />
                    <input
                      style={{ paddingLeft:34 }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="pr-field-hint">{form.phone.length}/10 digits</div>
                </div>
              </div>
            </>
          ) : (
            <>
              {[
                { icon: User,  label: 'Full Name',     val: form.name,   copy: false },
                { icon: Mail,  label: 'Email Address', val: user?.email, copy: true,  badge: 'Verified' },
                { icon: Phone, label: 'Phone Number',  val: form.phone,  copy: true  },
              ].map(({ icon: Icon, label, val, copy, badge }, i) => (
                <div key={i} className="pr-info-row">
                  <div className="pr-info-icon"><Icon size={15} /></div>
                  <div className="pr-info-content">
                    <div className="pr-info-label">{label}</div>
                    <div className="pr-info-val">{val}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {badge && <span style={{ fontSize:10, fontWeight:700, color:'#16a34a', background:'#DCFCE7', padding:'3px 8px', borderRadius:10, border:'1px solid #86EFAC' }}>{badge}</span>}
                    {copy && val && <CopyButton text={val} />}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {!profileLoading && editing && (
          <div className="pr-card-foot">
            <button className="pr-btn-secondary" onClick={() => { setForm(orig); setEditing(false); }}>Cancel</button>
            <button className="pr-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="pr-spinner" /> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      {/* Account Security Card */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Shield size={15} /> Account Security</div>
            <div className="pr-card-sub">Password and session management</div>
          </div>
        </div>
        <div className="pr-card-body">
          <div className="pr-sec-item" style={{ paddingTop:0, paddingBottom:0 }}>
            <div className="pr-sec-icon"><Lock size={16} /></div>
            <div className="pr-sec-info">
              <div className="pr-sec-label">Login Password</div>
              <div className="pr-sec-desc">Manage your account password</div>
            </div>
            <button className="pr-sec-action" onClick={onChangePW}>Change</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAB 2a — ADMIN DETAILS
══════════════════════════════════════════════════════════════════════ */
const PERMISSIONS_BY_ROLE = {
  ADMIN: [
    { label: 'Product & Inventory Management', granted: true  },
    { label: 'Billing & Invoice Control',       granted: true  },
    { label: 'Customer Data Management',        granted: true  },
    { label: 'Reports & Analytics',             granted: true  },
    { label: 'Cashier Approval & Management',   granted: true  },
    { label: 'System Settings',                 granted: true  },
  ],
  CASHIER: [
    { label: 'Create & Generate Invoices',      granted: true  },
    { label: 'Collect & Record Payments',       granted: true  },
    { label: 'View Customer Records',           granted: true  },
    { label: 'View Product & Stock',            granted: true  },
    { label: 'Reports & Analytics',             granted: false },
    { label: 'System Settings',                 granted: false },
    { label: 'Cashier Approval & Management',   granted: false },
  ],
};

function AdminDetailsTab({ profileData }) {
  const role   = profileData?.role || 'ADMIN';
  const permissions = PERMISSIONS_BY_ROLE[role] || PERMISSIONS_BY_ROLE.ADMIN;

  return (
    <>
      {/* Role Overview */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Award size={15} /> Administrator Role</div>
            <div className="pr-card-sub">Your role, access scope and permissions</div>
          </div>
          <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:10, background:'rgba(198,169,105,0.15)', color:'#C6A969', border:'1px solid rgba(198,169,105,0.3)' }}>Full Access</span>
        </div>
        <div className="pr-card-body">
          <div className="pr-role-panel">
            <div className="pr-rp-header" style={{ marginBottom:14 }}>
              <div className="pr-rp-icon"><Award size={18} /></div>
              <div>
                <div className="pr-rp-title">Super Administrator</div>
                <div className="pr-rp-sub">Full system access · NexBill ERP</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(198,169,105,0.2)', color:'#C6A969', border:'1px solid rgba(198,169,105,0.3)', whiteSpace:'nowrap' }}>
                {profileData?.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
              </span>
            </div>
            {[
              { label:'Email',  val: profileData?.email  || '—', Icon: Mail    },
              { label:'Role',   val: profileData?.role   || 'ADMIN', Icon: Award },
            ].map(({ label, val, Icon }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:28, height:28, borderRadius:7, background:'rgba(198,169,105,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C6A969', flexShrink:0 }}>
                  <Icon size={13} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10, color:'#9E9087', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{label}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#F8F5F2', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAB 2b — CASHIER DETAILS
══════════════════════════════════════════════════════════════════════ */
function CashierDetailsTab({ profileData }) {
  const data = {
    branch:      profileData?.branch        || '—',
    counter:     profileData?.counterNumber ? String(profileData.counterNumber) : '—',
    shift:       profileData?.shiftTiming   || '—',
    status:      profileData?.status        || 'ACTIVE',
    email:       profileData?.email         || '—',
    basicSalary: profileData?.basicSalary != null ? `₹${Number(profileData.basicSalary).toLocaleString('en-IN')}` : '—',
  };

  return (
    <>
      {/* Assignment Details */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Briefcase size={15} /> Cashier Details</div>
            <div className="pr-card-sub">Branch, counter and shift information</div>
          </div>
          <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:10, background: data.status==='ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: data.status==='ACTIVE' ? '#22c55e' : '#f59e0b', border:`1px solid ${data.status==='ACTIVE' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`, whiteSpace:'nowrap' }}>
            {data.status==='ACTIVE' ? '● Active' : '○ Pending'}
          </span>
        </div>
        <div className="pr-card-body">
          {[
            { icon:Mail,        label:'Email',        val:data.email,       copy:true  },
            { icon:Building2,   label:'Branch',       val:data.branch,      copy:false },
            { icon:Briefcase,   label:'Counter',      val:data.counter,     copy:false },
            { icon:Clock,       label:'Shift Timing', val:data.shift,       copy:false },
            { icon:DollarSign,  label:'Basic Salary', val:data.basicSalary, copy:false },
          ].map(({ icon:Icon, label, val, copy }, i) => (
            <div key={i} className="pr-info-row">
              <div className="pr-info-icon"><Icon size={15} /></div>
              <div className="pr-info-content">
                <div className="pr-info-label">{label}</div>
                <div className="pr-info-val">{val}</div>
              </div>
              {copy && <CopyButton text={val} />}
            </div>
          ))}
        </div>
      </div>

    </>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   PROFILE — DEFAULT EXPORT
══════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const isAdmin           = user?.role === 'ADMIN';

  const [activeTab, setActiveTab]           = useState('personal');
  const [toast, setToast]                   = useState(null);
  const [showLogout, setShowLogout]         = useState(false);
  const [logoutLoading, setLogoutLoading]   = useState(false);
  const [showChangePW, setShowChangePW]     = useState(false);

  // ── Real profile data from backend ──
  const [profileData, setProfileData]       = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // showToast defined before fetchProfile so it can be called inside
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchProfile = async () => {
    if (!user?.token) return;
    try {
      const res = await api.get('/api/profile/me');
      setProfileData(res.data);
    } catch (err) {
      showToast('Could not load profile data.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completionPct = (() => {
    if (!profileData) return 40;
    if (isAdmin) {
      let pct = 60;
      if (profileData.name)  pct += 20;
      if (profileData.phone) pct += 20;
      return Math.min(pct, 100);
    } else {
      let pct = 60;
      if (profileData.name)   pct += 13;
      if (profileData.phone)  pct += 13;
      if (profileData.branch) pct += 14;
      return Math.min(pct, 100);
    }
  })();

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    await new Promise(r => setTimeout(r, 800));
    logout();
  };

  const TABS = [
    {
      id:    'personal',
      label: 'Personal Information',
      Icon:  User,
      sub:   'Name, contact, bio & security',
    },
    {
      id:    'role',
      label: isAdmin ? 'Administration Details' : 'Cashier Details',
      Icon:  isAdmin ? Award : Briefcase,
      sub:   isAdmin ? 'Role & system access' : 'Counter, shift & performance',
    },
    {
      id:    'permissions',
      label: 'Access Permissions',
      Icon:  Shield,
      sub:   'Modules and capabilities',
    },
  ];

  const accountStats = isAdmin
    ? [
        { val: profileData?.role   || '—',    lbl: 'Role'   },
        { val: profileData?.status || '—',    lbl: 'Status' },
      ]
    : [
        { val: profileData?.counterNumber ? `${profileData.counterNumber}` : '—', lbl: 'Counter' },
        { val: profileData?.status        || '—',                                   lbl: 'Status'  },
      ];

  return (
    <>
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && (
        <div className={`pr-toast ${toast.type==='error' ? 'pr-toast-error' : 'pr-toast-success'}`}>
          {toast.type==='error' ? <AlertCircle size={14} style={{ color:'#FCA5A5', flexShrink:0 }} /> : <CheckCircle size={14} style={{ color:'#22c55e', flexShrink:0 }} />}
          {toast.msg}
        </div>
      )}

      {showLogout && <LogoutModal user={user} onCancel={() => setShowLogout(false)} onConfirm={handleLogoutConfirm} loading={logoutLoading} />}
      {showChangePW && <ChangePasswordModal onClose={() => setShowChangePW(false)} onSave={showToast} />}

      <div className="pr-shell">

        {/* ══ LEFT COLUMN ══ */}
        <div className="pr-left">

          {/* Hero */}
          <div className="pr-hero">
            <div className="pr-hero-banner" />
            <div className="pr-hero-body">
              <div className="pr-avatar-wrap">
                <div className="pr-avatar">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="pr-hero-name">
                {profileLoading
                  ? <span style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#9E9087' }}><Loader2 size={14} style={{ animation:'prSpin 0.7s linear infinite' }} /> Loading…</span>
                  : (profileData?.name || user?.email?.split('@')[0] || 'User')
                }
              </div>
              <div className="pr-hero-email">{user?.email}</div>
              {!profileLoading && profileData?.phone && (
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9E9087', marginBottom:10, marginTop:-4 }}>
                  <Phone size={11} />{profileData.phone}
                </div>
              )}
              <div className={`pr-role-badge ${isAdmin ? 'pr-role-admin' : 'pr-role-cashier'}`}>
                {isAdmin ? <Award size={11} /> : <Briefcase size={11} />}
                {isAdmin ? 'Administrator' : 'Cashier'}
              </div>
              <div className="pr-completion">
                <div className="pr-completion-top">
                  <span className="pr-completion-label">Profile Completion</span>
                  <span className="pr-completion-pct">{completionPct}%</span>
                </div>
                <div className="pr-completion-track">
                  <div className="pr-completion-fill" style={{ width:`${completionPct}%` }} />
                </div>
              </div>
              <div className="pr-hero-divider" />
              <div className="pr-hero-stats">
                {accountStats.map((s, i) => (
                  <div key={i} className="pr-hero-stat">
                    <div className="pr-hero-stat-val">
                      {profileLoading ? <span style={{ display:'inline-block', width:36, height:14, background:'rgba(255,255,255,0.08)', borderRadius:4 }} /> : s.val}
                    </div>
                    <div className="pr-hero-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div className="pr-status-online"><div className="pr-status-dot" />Online Now</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pr-card">
            <div style={{ padding:'14px 18px 6px', borderBottom:'1px solid #EFE7DE' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#8B7355', textTransform:'uppercase', letterSpacing:'0.6px' }}>Quick Actions</div>
            </div>
            <div style={{ padding:'6px 8px 4px' }}>
              {(isAdmin ? [
                { icon:BarChart2,    cls:'pr-qa-blue',   label:'Reports',         sub:'Sales & analytics',          onClick:() => navigate('/admin/reports') },
                { icon:Users,       cls:'pr-qa-gold',   label:'Customers',       sub:'Manage customer records',    onClick:() => navigate('/admin/customers') },
                { icon:ShoppingCart,cls:'pr-qa-green',  label:'Inventory',       sub:'Products & stock',           onClick:() => navigate('/admin/inventory') },
                { icon:Settings,    cls:'pr-qa-purple', label:'Settings',        sub:'System preferences',         onClick:() => navigate('/admin/settings') },
              ] : [
                { icon:Receipt,     cls:'pr-qa-gold',   label:'My Invoices',     sub:'Billing history',            onClick:() => navigate('/cashier/invoices') },
                { icon:Users,       cls:'pr-qa-blue',   label:'Customers',       sub:'Customer records',           onClick:() => navigate('/cashier/customers') },
                { icon:CreditCard,  cls:'pr-qa-green',  label:'Payments',        sub:'Payment records',            onClick:() => navigate('/cashier/payments') },
                { icon:Settings,    cls:'pr-qa-purple', label:'Settings',        sub:'System preferences',         onClick:() => navigate('/cashier/settings') },
              ]).map(({ icon:Icon, cls, label, sub, onClick }, i) => (
                <button key={i} className="pr-quick-action" onClick={onClick}>
                  <div className={`pr-qa-icon ${cls}`}><Icon size={15} /></div>
                  <div style={{ flex:1 }}>
                    <div className="pr-qa-label">{label}</div>
                    <div className="pr-qa-sub">{sub}</div>
                  </div>
                  <ChevronRight size={13} color="#D6D3D1" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ══ RIGHT COLUMN — TABBED ══ */}
        <div className="pr-right">

          {/* Tab Bar */}
          <div className="pr-tab-bar">
            {TABS.map((tab, i) => {
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  className={`pr-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="pr-tab-icon"><Icon size={15} /></span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panel */}
          <div className="pr-tab-panel-wrap" key={activeTab}>
            {activeTab === 'personal' && (
              <PersonalInfoTab
                user={user}
                profileData={profileData}
                profileLoading={profileLoading}
                onSave={showToast}
                onChangePW={() => setShowChangePW(true)}
                onProfileRefresh={fetchProfile}
              />
            )}
            {activeTab === 'role' && (
              profileLoading
                ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 0', color:'#9E9087', gap:10 }}><Loader2 size={20} style={{ animation:'prSpin 0.7s linear infinite', color:'#C6A969' }} /> Loading details…</div>
                : isAdmin
                  ? <AdminDetailsTab profileData={profileData} />
                  : <CashierDetailsTab profileData={profileData} />
            )}
            {activeTab === 'permissions' && (
              <div className="pr-card">
                <div className="pr-card-head">
                  <div>
                    <div className="pr-card-title"><Shield size={15} /> Access Permissions</div>
                    <div className="pr-card-sub">Modules and capabilities granted to your account</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:10, background: isAdmin ? 'rgba(198,169,105,0.15)' : 'rgba(34,197,94,0.12)', color: isAdmin ? '#C6A969' : '#22c55e', border: isAdmin ? '1px solid rgba(198,169,105,0.3)' : '1px solid rgba(34,197,94,0.25)' }}>
                    {isAdmin ? 'Full Access' : 'Limited Access'}
                  </span>
                </div>
                <div className="pr-card-body">
                  {(PERMISSIONS_BY_ROLE[profileData?.role] || PERMISSIONS_BY_ROLE.ADMIN).map((p, i, arr) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 8px', borderBottom: i < arr.length-1 ? '1px solid #F8F5F2' : 'none', borderRadius:8, margin:'0 -8px', transition:'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#FDFCFB'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background: p.granted ? '#22c55e' : '#D6D3D1', flexShrink:0 }} />
                        <span style={{ fontSize:13, color:'#2D2D2D', fontWeight:500 }}>{p.label}</span>
                      </div>
                      {p.granted
                        ? <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:'#16a34a', background:'#DCFCE7', padding:'3px 9px', borderRadius:10, border:'1px solid #86EFAC' }}><CheckCircle size={11} /> Granted</span>
                        : <span style={{ fontSize:11, fontWeight:600, color:'#8B7355', background:'#F1EEE8', padding:'3px 9px', borderRadius:10, border:'1px solid #EFE7DE' }}>Restricted</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
