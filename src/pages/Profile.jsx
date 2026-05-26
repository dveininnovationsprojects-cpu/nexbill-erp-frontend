// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Profile & Logout Module  (Enhanced UI v2)          ║
// ║   Tabs: Overview · Security · Activity · Preferences               ║
// ║   Works for both Admin & Cashier roles — ONE FILE                  ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Clock, Shield,
  LogOut, Edit3, Save, X, Camera, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Briefcase, Building2,
  Activity, ChevronRight, Smartphone, RefreshCw,
  Star, Award, TrendingUp, Hash, ToggleLeft, ToggleRight,
  Key, AlertTriangle, Monitor, Wifi, Globe,
  Bell, Copy, Check, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════════════════
   STYLES — NexBill Design System (matches Layout, Settings, Invoices)
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  /* ── Shell ── */
  .pr-shell {
    display: flex;
    gap: 24px;
    font-family: 'Inter', system-ui, sans-serif;
    min-height: calc(100vh - 120px);
  }

  /* ── Left Column ── */
  .pr-left {
    width: 272px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Right Column ── */
  .pr-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── Card ── */
  .pr-card {
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
  }
  .pr-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid #EFE7DE;
  }
  .pr-card-title {
    font-size: 14px;
    font-weight: 700;
    color: #2D2D2D;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pr-card-sub {
    font-size: 12px;
    color: #8B7355;
    margin-top: 3px;
  }
  .pr-card-body { padding: 20px 22px; }
  .pr-card-foot {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 22px;
    border-top: 1px solid #EFE7DE;
    background: #FDFCFB;
  }

  /* ── Hero Card ── */
  .pr-hero {
    background: #2D2D2D;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(45,45,45,0.12);
  }
  .pr-hero-banner {
    height: 56px;
    background: linear-gradient(135deg, #C6A969 0%, #8B7355 50%, #2D2D2D 100%);
    position: relative;
  }
  .pr-hero-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(255,255,255,0.04) 8px,
      rgba(255,255,255,0.04) 16px
    );
  }
  .pr-hero-body {
    padding: 0 22px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .pr-avatar-wrap {
    position: relative;
    margin-top: -28px;
    margin-bottom: 12px;
    z-index: 2;
  }
  .pr-avatar {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C6A969 0%, #8B7355 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; font-weight: 800; color: #2D2D2D;
    border: 4px solid #2D2D2D;
    position: relative;
    overflow: hidden;
  }
  .pr-avatar-edit {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 24px; height: 24px;
    background: #C6A969;
    border: 2px solid #2D2D2D;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    z-index: 3;
  }
  .pr-avatar-edit:hover { background: #EFE7DE; transform: scale(1.1); }
  .pr-hero-name {
    font-size: 17px; font-weight: 700; color: #F8F5F2;
    margin-bottom: 3px;
  }
  .pr-hero-email {
    font-size: 12px; color: #9E9087;
    margin-bottom: 10px;
  }
  .pr-role-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    margin-bottom: 16px;
  }
  .pr-role-admin   { background: rgba(198,169,105,0.2); color: #C6A969; border: 1px solid rgba(198,169,105,0.3); }
  .pr-role-cashier { background: rgba(34,197,94,0.15);  color: #22c55e; border: 1px solid rgba(34,197,94,0.25); }

  /* Profile completion bar */
  .pr-completion {
    width: 100%;
    margin-bottom: 16px;
  }
  .pr-completion-top {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  .pr-completion-label { font-size: 10px; color: #9E9087; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-completion-pct   { font-size: 12px; color: #C6A969; font-weight: 700; }
  .pr-completion-track {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.08); border-radius: 4px;
    overflow: hidden;
  }
  .pr-completion-fill {
    height: 100%;
    background: linear-gradient(90deg, #C6A969 0%, #EFE7DE 100%);
    border-radius: 4px;
    transition: width 0.6s ease;
  }

  .pr-hero-divider {
    width: 100%; height: 1px;
    background: rgba(255,255,255,0.07);
    margin-bottom: 14px;
  }
  .pr-hero-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; width: 100%;
  }
  .pr-hero-stat {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 10px 12px;
    text-align: center;
  }
  .pr-hero-stat-val {
    font-size: 18px; font-weight: 700; color: #C6A969;
    line-height: 1;
  }
  .pr-hero-stat-lbl {
    font-size: 10px; color: #9E9087;
    margin-top: 3px;
  }

  /* Online dot */
  .pr-status-online {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #22c55e;
    margin-top: 12px;
  }
  .pr-status-dot {
    width: 7px; height: 7px;
    background: #22c55e; border-radius: 50%;
    animation: prPulse 2s ease infinite;
  }
  @keyframes prPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(0.8); }
  }

  /* ── Quick Actions ── */
  .pr-quick-action {
    display: flex; align-items: center;
    gap: 12px; padding: 10px 14px;
    border-radius: 10px; cursor: pointer;
    transition: background 0.15s;
    border: none; background: none;
    font-family: inherit; width: 100%; text-align: left;
  }
  .pr-quick-action:hover { background: #F8F5F2; }
  .pr-qa-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pr-qa-gold   { background: #EFE7DE; color: #8B7355; }
  .pr-qa-green  { background: #DCFCE7; color: #16a34a; }
  .pr-qa-red    { background: #FEE2E2; color: #dc2626; }
  .pr-qa-blue   { background: #DBEAFE; color: #2563eb; }
  .pr-qa-purple { background: #EDE9FE; color: #7c3aed; }
  .pr-qa-label  { font-size: 13px; font-weight: 600; color: #2D2D2D; flex: 1; }
  .pr-qa-sub    { font-size: 11px; color: #8B7355; margin-top: 1px; }

  /* ── Tab Navigation ── */
  .pr-tabs {
    display: flex;
    gap: 4px;
    padding: 16px 22px 0;
    border-bottom: 1px solid #EFE7DE;
    background: #FFFFFF;
    border-radius: 14px 14px 0 0;
    border: 1px solid #EFE7DE;
    border-bottom: none;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .pr-tabs::-webkit-scrollbar { display: none; }
  .pr-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px;
    border-radius: 9px 9px 0 0;
    font-size: 13px; font-weight: 600;
    color: #8B7355; cursor: pointer;
    border: none; background: none;
    font-family: inherit; white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    margin-bottom: -1px;
  }
  .pr-tab:hover { color: #2D2D2D; background: #F8F5F2; }
  .pr-tab.active {
    color: #2D2D2D;
    border-bottom: 2px solid #C6A969;
    background: #FDFCFB;
  }
  .pr-tab-count {
    font-size: 10px; font-weight: 700;
    background: #EFE7DE; color: #8B7355;
    padding: 1px 6px; border-radius: 8px;
  }
  .pr-tab.active .pr-tab-count {
    background: rgba(198,169,105,0.2); color: #C6A969;
  }

  /* Tab Panel */
  .pr-tab-panel {
    display: flex; flex-direction: column; gap: 20px;
    padding-top: 20px;
  }

  /* ── Form Fields ── */
  .pr-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .pr-field label {
    font-size: 10.5px; font-weight: 700; color: #3F3F46;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .pr-field input, .pr-field select, .pr-field textarea {
    padding: 9px 12px;
    border: 1.5px solid #EFE7DE;
    border-radius: 9px;
    font-size: 13px; color: #2D2D2D;
    background: #F8F5F2; outline: none;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%; box-sizing: border-box;
  }
  .pr-field input:focus, .pr-field select:focus, .pr-field textarea:focus {
    border-color: #C6A969;
    box-shadow: 0 0 0 3px rgba(198,169,105,0.12);
    background: #FFFFFF;
  }
  .pr-field input:disabled, .pr-field select:disabled {
    background: #F1EEE8; color: #8B7355; cursor: not-allowed;
    border-color: #EFE7DE;
  }
  .pr-field-hint { font-size: 11px; color: #8B7355; margin-top: 3px; }
  .pr-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pr-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  .pr-input-wrap { position: relative; }
  .pr-input-wrap input { padding-left: 36px; }
  .pr-input-icon {
    position: absolute; left: 10px; top: 50%;
    transform: translateY(-50%); color: #8B7355; pointer-events: none;
  }
  .pr-eye-btn {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #8B7355; padding: 2px;
    display: flex; align-items: center;
  }
  .pr-eye-btn:hover { color: #2D2D2D; }

  /* ── Section Label ── */
  .pr-section-lbl {
    font-size: 11px; font-weight: 700; color: #8B7355;
    text-transform: uppercase; letter-spacing: 0.7px;
    margin: 20px 0 14px;
    display: flex; align-items: center; gap: 6px;
  }
  .pr-section-lbl::after {
    content: ''; flex: 1; height: 1px; background: #EFE7DE;
  }
  .pr-section-lbl:first-child { margin-top: 0; }

  /* ── Info Row ── */
  .pr-info-row {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    padding: 11px 0;
    border-bottom: 1px solid #F8F5F2;
    gap: 12px;
    transition: background 0.1s;
    border-radius: 6px;
    margin: 0 -4px;
    padding-left: 4px; padding-right: 4px;
  }
  .pr-info-row:hover { background: #FDFCFB; }
  .pr-info-row:last-child { border-bottom: none; }
  .pr-info-icon {
    width: 32px; height: 32px;
    background: #EFE7DE; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #8B7355; flex-shrink: 0;
  }
  .pr-info-content { flex: 1; }
  .pr-info-label { font-size: 11px; font-weight: 600; color: #8B7355; text-transform: uppercase; letter-spacing: 0.4px; }
  .pr-info-val   { font-size: 13px; font-weight: 600; color: #2D2D2D; margin-top: 2px; }

  /* ── Copy btn ── */
  .pr-copy-btn {
    background: none; border: none; cursor: pointer;
    color: #D6D3D1; padding: 4px;
    display: flex; align-items: center;
    border-radius: 5px; transition: color 0.15s, background 0.15s;
  }
  .pr-copy-btn:hover { color: #8B7355; background: #EFE7DE; }

  /* ── Toggle ── */
  .pr-toggle-row {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 16px;
    padding: 13px 0; border-bottom: 1px solid #F8F5F2;
  }
  .pr-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
  .pr-toggle-info { flex: 1; }
  .pr-toggle-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-toggle-desc  { font-size: 12px; color: #8B7355; margin-top: 3px; }
  .pr-toggle-btn {
    background: none; border: none; cursor: pointer;
    padding: 2px; display: flex; align-items: center; flex-shrink: 0;
    transition: transform 0.15s;
  }
  .pr-toggle-btn:hover { transform: scale(1.05); }
  .pr-toggle-on  { color: #C6A969; }
  .pr-toggle-off { color: #D6D3D1; }

  /* ── Activity Log ── */
  .pr-activity-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 11px 0; border-bottom: 1px solid #F8F5F2;
  }
  .pr-activity-item:last-child { border-bottom: none; }
  .pr-act-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0; margin-top: 5px;
  }
  .pr-act-dot-green  { background: #22c55e; }
  .pr-act-dot-gold   { background: #C6A969; }
  .pr-act-dot-red    { background: #dc2626; }
  .pr-act-dot-blue   { background: #2563eb; }
  .pr-act-dot-gray   { background: #D6D3D1; }
  .pr-act-content { flex: 1; }
  .pr-act-title { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-act-meta  { font-size: 11px; color: #8B7355; margin-top: 2px; }
  .pr-act-time  { font-size: 11px; color: #8B7355; white-space: nowrap; flex-shrink: 0; }

  /* ── Security Item ── */
  .pr-sec-item {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 13px 0; border-bottom: 1px solid #F8F5F2;
    gap: 12px;
  }
  .pr-sec-item:last-child { border-bottom: none; padding-bottom: 0; }
  .pr-sec-icon {
    width: 36px; height: 36px;
    background: #EFE7DE; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: #8B7355; flex-shrink: 0;
  }
  .pr-sec-info { flex: 1; }
  .pr-sec-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-sec-desc  { font-size: 12px; color: #8B7355; margin-top: 2px; }
  .pr-sec-action {
    padding: 6px 14px;
    background: #F8F5F2; border: 1.5px solid #EFE7DE;
    border-radius: 8px; font-size: 12px; font-weight: 600;
    color: #8B7355; cursor: pointer; font-family: inherit;
    transition: all 0.2s; white-space: nowrap;
  }
  .pr-sec-action:hover { background: #2D2D2D; color: #C6A969; border-color: #2D2D2D; }

  /* ── Session Item ── */
  .pr-session {
    display: flex; align-items: center; gap: 12px;
    padding: 12px; background: #F8F5F2;
    border: 1px solid #EFE7DE; border-radius: 10px;
    margin-bottom: 8px; transition: border-color 0.2s;
  }
  .pr-session:hover { border-color: #C6A969; }
  .pr-session:last-child { margin-bottom: 0; }
  .pr-session-icon {
    width: 36px; height: 36px;
    background: #EFE7DE; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: #8B7355; flex-shrink: 0;
  }
  .pr-session-info { flex: 1; }
  .pr-session-device { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-session-meta   { font-size: 11px; color: #8B7355; margin-top: 2px; }
  .pr-session-current {
    font-size: 10px; font-weight: 700; color: #16a34a;
    background: #DCFCE7; padding: 3px 8px; border-radius: 12px;
    border: 1px solid #86EFAC;
  }

  /* ── Role Panel ── */
  .pr-role-panel {
    background: linear-gradient(135deg, #2D2D2D 0%, #3a3a3a 100%);
    border-radius: 12px; padding: 20px;
    margin-bottom: 4px;
  }
  .pr-rp-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .pr-rp-icon {
    width: 38px; height: 38px;
    background: rgba(198,169,105,0.2); border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: #C6A969;
  }
  .pr-rp-title { font-size: 14px; font-weight: 700; color: #F8F5F2; }
  .pr-rp-sub   { font-size: 11px; color: #9E9087; margin-top: 2px; }
  .pr-rp-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pr-rp-stat  {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 9px; padding: 12px;
  }
  .pr-rp-stat-label { font-size: 10px; color: #9E9087; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-rp-stat-val   { font-size: 14px; font-weight: 700; color: #C6A969; margin-top: 3px; }

  /* ── Danger Zone ── */
  .pr-danger-zone {
    border: 1.5px solid #FCA5A5;
    border-radius: 14px;
    overflow: hidden;
  }
  .pr-danger-head {
    background: #FEF2F2; padding: 14px 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .pr-danger-title { font-size: 13px; font-weight: 700; color: #dc2626; }
  .pr-danger-body { padding: 16px 20px; background: #FFFFFF; }
  .pr-danger-item {
    display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
    padding: 12px 0; border-bottom: 1px solid #F8F5F2;
  }
  .pr-danger-item:last-child { border-bottom: none; padding-bottom: 0; }
  .pr-danger-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-danger-desc  { font-size: 12px; color: #8B7355; margin-top: 2px; }

  /* ── Buttons ── */
  .pr-btn-primary {
    display: flex; align-items: center; gap: 6px;
    padding: 0 20px; height: 38px;
    background: #2D2D2D; color: #F8F5F2;
    border: none; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: background 0.2s, color 0.2s;
  }
  .pr-btn-primary:hover { background: #C6A969; color: #2D2D2D; }
  .pr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .pr-btn-secondary {
    display: flex; align-items: center; gap: 6px;
    padding: 0 20px; height: 38px;
    background: #F8F5F2; color: #8B7355;
    border: 1.5px solid #EFE7DE; border-radius: 9px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all 0.2s;
  }
  .pr-btn-secondary:hover { background: #EFE7DE; color: #2D2D2D; }
  .pr-btn-danger {
    display: flex; align-items: center; gap: 6px;
    padding: 0 18px; height: 36px;
    background: #FEE2E2; color: #dc2626;
    border: 1.5px solid #FCA5A5; border-radius: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all 0.2s;
  }
  .pr-btn-danger:hover { background: #dc2626; color: #FFFFFF; border-color: #dc2626; }
  .pr-btn-logout {
    display: flex; align-items: center; gap: 8px;
    padding: 0 20px; height: 42px; width: 100%;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #FFFFFF; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: opacity 0.2s, transform 0.15s;
    justify-content: center; letter-spacing: 0.2px;
    box-shadow: 0 2px 8px rgba(220,38,38,0.25);
  }
  .pr-btn-logout:hover { opacity: 0.9; transform: translateY(-1px); }
  .pr-btn-logout:active { transform: translateY(0); }

  /* ── Toast ── */
  .pr-toast {
    position: fixed; top: 20px; right: 28px;
    background: #2D2D2D; color: #F8F5F2;
    padding: 12px 18px; border-radius: 10px;
    font-size: 13px; display: flex; align-items: center; gap: 8px;
    z-index: 9999; box-shadow: 0 4px 16px rgba(45,45,45,0.2);
    animation: prSlideIn 0.25s ease;
    min-width: 220px;
  }
  .pr-toast-success { border-left: 3px solid #22c55e; }
  .pr-toast-error   { background: #7A3A3A; border-left: 3px solid #dc2626; }
  @keyframes prSlideIn {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Logout Overlay ── */
  .pr-overlay {
    position: fixed; inset: 0;
    background: rgba(45,45,45,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 9998; backdrop-filter: blur(4px);
    animation: prFadeIn 0.2s ease;
  }
  @keyframes prFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .pr-logout-modal {
    background: #FFFFFF; border-radius: 20px;
    padding: 36px 32px; width: 400px; max-width: 95vw;
    box-shadow: 0 24px 64px rgba(45,45,45,0.25);
    animation: prSlideUp 0.25s ease;
    text-align: center;
  }
  @keyframes prSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pr-logout-icon-wrap {
    width: 68px; height: 68px;
    background: linear-gradient(135deg, #FEE2E2, #FECACA);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px; color: #dc2626;
    border: 4px solid #FEF2F2;
  }
  .pr-logout-title {
    font-size: 20px; font-weight: 700; color: #2D2D2D;
    margin-bottom: 8px;
  }
  .pr-logout-desc {
    font-size: 13px; color: #8B7355;
    line-height: 1.6; margin-bottom: 24px;
  }
  .pr-logout-user {
    background: #F8F5F2; border: 1px solid #EFE7DE;
    border-radius: 12px; padding: 14px 18px;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px; text-align: left;
  }
  .pr-logout-user-avatar {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, #C6A969 0%, #8B7355 100%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 700; color: #2D2D2D;
    flex-shrink: 0;
  }
  .pr-logout-user-email { font-size: 13px; font-weight: 700; color: #2D2D2D; }
  .pr-logout-user-role  { font-size: 11px; color: #8B7355; margin-top: 3px; }
  .pr-logout-actions    { display: flex; gap: 10px; }
  .pr-logout-actions .pr-btn-secondary { flex: 1; justify-content: center; height: 44px; font-size: 13px; }
  .pr-logout-actions .pr-btn-logout    { flex: 1; height: 44px; }

  /* ── Change PW Modal ── */
  .pr-pw-modal {
    background: #FFFFFF; border-radius: 18px;
    padding: 28px; width: 440px; max-width: 95vw;
    box-shadow: 0 20px 60px rgba(45,45,45,0.2);
    animation: prSlideUp 0.25s ease;
  }
  .pr-pw-modal-head {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 22px;
  }
  .pr-pw-modal-title {
    font-size: 16px; font-weight: 700; color: #2D2D2D;
    display: flex; align-items: center; gap: 8px;
  }
  .pr-pw-close {
    background: #F8F5F2; border: 1px solid #EFE7DE;
    border-radius: 8px; width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #8B7355; transition: all 0.2s;
  }
  .pr-pw-close:hover { background: #EFE7DE; color: #2D2D2D; }
  .pr-pw-form { display: flex; flex-direction: column; gap: 14px; }

  /* ── Spinner ── */
  .pr-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(248,245,242,0.3);
    border-top-color: #F8F5F2;
    border-radius: 50%;
    animation: prSpin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes prSpin { to { transform: rotate(360deg); } }

  /* ── Avatar file input ── */
  .pr-file-input { display: none; }

  /* ── Account info card ── */
  .pr-acct-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid #F8F5F2;
  }
  .pr-acct-row:last-child { border-bottom: none; }
  .pr-acct-icon {
    width: 28px; height: 28px;
    background: #EFE7DE; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: #8B7355; flex-shrink: 0;
  }
  .pr-acct-label { font-size: 10px; color: #8B7355; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .pr-acct-val   { font-size: 12px; font-weight: 600; color: #2D2D2D; margin-top: 1px; }

  /* ── Empty panel ── */
  .pr-empty {
    text-align: center; padding: 32px 20px;
    color: #D6D3D1; font-size: 13px;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .pr-shell { flex-direction: column; }
    .pr-left  { width: 100%; }
    .pr-grid2 { grid-template-columns: 1fr; }
    .pr-grid3 { grid-template-columns: 1fr; }
  }
`;

/* ══════════════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════════════ */
const ACTIVITY_LOG = [
  { dot: 'green', title: 'Logged in successfully',     meta: 'Chrome · Windows · 192.168.1.10',         time: 'Just now'    },
  { dot: 'gold',  title: 'Invoice #INV-1042 created',  meta: 'New invoice for Ravi Kumar — ₹12,400',     time: '2h ago'      },
  { dot: 'green', title: 'Payment received',            meta: '₹18,500 recorded for Invoice #INV-1038',   time: '5h ago'      },
  { dot: 'blue',  title: 'Settings updated',            meta: 'Invoice prefix changed to INV-',           time: 'Yesterday'   },
  { dot: 'gold',  title: 'New cashier approved',        meta: 'Yasik approved for Counter 2',             time: '2 days ago'  },
  { dot: 'red',   title: 'Failed login attempt',        meta: 'Unknown device · IP 103.55.12.8',          time: '3 days ago'  },
  { dot: 'gray',  title: 'Logged out',                  meta: 'Session ended · 8h session duration',      time: '3 days ago'  },
];

const CASHIER_ACTIVITY = [
  { dot: 'green', title: 'Logged in successfully',      meta: 'Chrome · Windows · Counter 2',            time: 'Just now'    },
  { dot: 'gold',  title: 'Invoice #INV-1051 generated', meta: 'Billed ₹4,200 to Mohan Lal',              time: '1h ago'      },
  { dot: 'green', title: 'Cash payment collected',      meta: '₹1,850 for INV-1049',                     time: '2h ago'      },
  { dot: 'blue',  title: 'Product stock checked',       meta: 'Checked 5 items for low stock alert',      time: '4h ago'      },
  { dot: 'gold',  title: 'Customer record added',       meta: 'Added Priya Nair to customer list',        time: 'Yesterday'   },
  { dot: 'gray',  title: 'Shift ended',                 meta: '9AM–5PM shift completed · 18 invoices',   time: 'Yesterday'   },
];

const SESSIONS = [
  { icon: Monitor,    device: 'Chrome on Windows 11',       location: 'Bangalore, Karnataka · 192.168.1.10', time: 'Active now', current: true  },
  { icon: Smartphone, device: 'Mobile Chrome · Android',    location: 'Bangalore, Karnataka · 103.44.22.5',  time: '2h ago',     current: false },
];

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════ */
function Toggle({ on, onChange }) {
  return (
    <button
      className={`pr-toggle-btn ${on ? 'pr-toggle-on' : 'pr-toggle-off'}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
      title={on ? 'Turn off' : 'Turn on'}
    >
      {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className="pr-copy-btn" onClick={handleCopy} title="Copy to clipboard">
      {copied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CHANGE PASSWORD MODAL
══════════════════════════════════════════════════════════════════════ */
function ChangePasswordModal({ onClose, onSave }) {
  const [form, setForm]   = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow]   = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const toggleShow = (k) => setShow(s => ({ ...s, [k]: !s[k] }));
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const strength = (pw) => {
    let s = 0;
    if (pw.length >= 8)        s++;
    if (/[A-Z]/.test(pw))     s++;
    if (/[0-9]/.test(pw))     s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const pw = form.newPw;
  const str = strength(pw);
  const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][str];
  const strColor = ['', '#dc2626', '#f59e0b', '#22c55e', '#16a34a'][str];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current)                 { setError('Please enter your current password.'); return; }
    if (pw.length < 8)                 { setError('New password must be at least 8 characters.'); return; }
    if (pw !== form.confirm)           { setError('New passwords do not match.'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    onSave('Password updated successfully!');
    onClose();
  };

  const PwInput = ({ field, label, placeholder }) => (
    <div className="pr-field" style={{ marginBottom: 0 }}>
      <label>{label}</label>
      <div className="pr-input-wrap">
        <Lock size={14} className="pr-input-icon" />
        <input
          style={{ paddingLeft: 34, paddingRight: 36, boxSizing: 'border-box' }}
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          placeholder={placeholder}
          onChange={e => set(field, e.target.value)}
          required
        />
        <button type="button" className="pr-eye-btn" onClick={() => toggleShow(field)}>
          {show[field] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="pr-overlay" onClick={onClose}>
      <div className="pr-pw-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-pw-modal-head">
          <div className="pr-pw-modal-title"><Lock size={16} /> Change Password</div>
          <button className="pr-pw-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="pr-pw-form">
          <PwInput field="current" label="Current Password"     placeholder="Enter current password" />
          <PwInput field="newPw"   label="New Password"         placeholder="Min 8 characters"       />

          {/* Strength bar */}
          {pw.length > 0 && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= str ? strColor : '#EFE7DE',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: strColor, fontWeight: 600 }}>{strLabel}</div>
            </div>
          )}

          <PwInput field="confirm" label="Confirm New Password" placeholder="Re-enter new password" />

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <div style={{ background: '#F8F5F2', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#8B7355', lineHeight: 1.5 }}>
            🔐 Use at least 8 characters — mix uppercase, lowercase, numbers and symbols.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
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
   LOGOUT CONFIRMATION MODAL
══════════════════════════════════════════════════════════════════════ */
function LogoutModal({ user, onCancel, onConfirm, loading }) {
  return (
    <div className="pr-overlay" onClick={onCancel}>
      <div className="pr-logout-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-logout-icon-wrap">
          <LogOut size={30} />
        </div>
        <div className="pr-logout-title">Sign Out of NexBill?</div>
        <div className="pr-logout-desc">
          You're about to sign out. Any unsaved changes will be lost.<br />You'll need to sign in again to access the system.
        </div>
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
            {loading ? <span className="pr-spinner" style={{ borderTopColor: '#fff' }} /> : <><LogOut size={15} /> Sign Out</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OVERVIEW TAB — Personal Info + Role Section
══════════════════════════════════════════════════════════════════════ */
function PersonalInfoCard({ user, onSave }) {
  const isAdmin = user?.role === 'ADMIN';
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    name:       isAdmin ? 'NexBill Admin' : 'Ahamed Yasik',
    phone:      isAdmin ? '+91 9876 543 210' : '+91 9123 456 789',
    department: isAdmin ? 'Administration'   : 'Billing & Counter',
    location:   'Bangalore, Karnataka',
    bio:        isAdmin
      ? 'System administrator for NexBill ERP. Manages users, settings, and overall platform operations.'
      : 'Cashier at Counter 2. Responsible for billing customers and managing daily transactions.',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setEditing(false);
    onSave('Profile updated successfully!');
  };

  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <div>
          <div className="pr-card-title"><User size={15} /> Personal Information</div>
          <div className="pr-card-sub">Your display name, contact details and bio</div>
        </div>
        {!editing && (
          <button className="pr-btn-secondary" style={{ height: 34, fontSize: 12, padding: '0 14px' }} onClick={() => setEditing(true)}>
            <Edit3 size={13} /> Edit
          </button>
        )}
      </div>

      <div className="pr-card-body">
        {editing ? (
          <>
            <div className="pr-grid2">
              <div className="pr-field">
                <label>Full Name</label>
                <div className="pr-input-wrap">
                  <User size={14} className="pr-input-icon" />
                  <input style={{ paddingLeft: 34 }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
                </div>
              </div>
              <div className="pr-field">
                <label>Phone Number</label>
                <div className="pr-input-wrap">
                  <Phone size={14} className="pr-input-icon" />
                  <input style={{ paddingLeft: 34 }} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>
            <div className="pr-grid2">
              <div className="pr-field">
                <label>Department</label>
                <input value={form.department} onChange={e => set('department', e.target.value)} />
              </div>
              <div className="pr-field">
                <label>Location</label>
                <div className="pr-input-wrap">
                  <MapPin size={14} className="pr-input-icon" />
                  <input style={{ paddingLeft: 34 }} value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="pr-field" style={{ marginBottom: 0 }}>
              <label>Bio</label>
              <textarea
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                rows={3}
                style={{ padding: '9px 12px', border: '1.5px solid #EFE7DE', borderRadius: 9, fontSize: 13, color: '#2D2D2D', background: '#F8F5F2', outline: 'none', fontFamily: 'inherit', resize: 'vertical', width: '100%', boxSizing: 'border-box', lineHeight: 1.5 }}
              />
            </div>
          </>
        ) : (
          <>
            {[
              { icon: User,      label: 'Full Name',      val: form.name,        copy: false },
              { icon: Mail,      label: 'Email Address',  val: user?.email,      copy: true, badge: 'Verified' },
              { icon: Phone,     label: 'Phone Number',   val: form.phone,       copy: true  },
              { icon: Briefcase, label: 'Department',     val: form.department,  copy: false },
              { icon: MapPin,    label: 'Location',       val: form.location,    copy: false },
            ].map(({ icon: Icon, label, val, copy, badge }, i) => (
              <div key={i} className="pr-info-row" style={i === 0 ? { paddingTop: 4 } : {}}>
                <div className="pr-info-icon"><Icon size={15} /></div>
                <div className="pr-info-content">
                  <div className="pr-info-label">{label}</div>
                  <div className="pr-info-val">{val}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#DCFCE7', padding: '3px 8px', borderRadius: 10, border: '1px solid #86EFAC' }}>{badge}</span>
                  )}
                  {copy && val && <CopyButton text={val} />}
                </div>
              </div>
            ))}
            <div className="pr-info-row">
              <div className="pr-info-icon" style={{ alignSelf: 'flex-start', marginTop: 4 }}><Star size={15} /></div>
              <div className="pr-info-content">
                <div className="pr-info-label">Bio</div>
                <div className="pr-info-val" style={{ fontWeight: 400, color: '#3F3F46', lineHeight: 1.55 }}>{form.bio}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {editing && (
        <div className="pr-card-foot">
          <button className="pr-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          <button className="pr-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="pr-spinner" /> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );
}

function AdminRoleCard() {
  const permissions = [
    { label: 'Product & Inventory Management',  granted: true  },
    { label: 'Billing & Invoice Control',        granted: true  },
    { label: 'Customer Data Management',         granted: true  },
    { label: 'Reports & Analytics',              granted: true  },
    { label: 'Cashier Approval & Management',    granted: true  },
    { label: 'System Settings',                  granted: true  },
    { label: 'API & Integration Access',         granted: false },
  ];
  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <div>
          <div className="pr-card-title"><Award size={15} /> Administrator Details</div>
          <div className="pr-card-sub">Your admin privileges and system access level</div>
        </div>
      </div>
      <div className="pr-card-body">
        <div className="pr-role-panel">
          <div className="pr-rp-header">
            <div className="pr-rp-icon"><Award size={18} /></div>
            <div>
              <div className="pr-rp-title">Super Administrator</div>
              <div className="pr-rp-sub">Full system access · NexBill ERP</div>
            </div>
          </div>
          <div className="pr-rp-grid">
            {[['Access Level','Level 5'],['Since','Jan 2024'],['Users Managed','12'],['Last Action','2h ago']].map(([l,v]) => (
              <div key={l} className="pr-rp-stat">
                <div className="pr-rp-stat-label">{l}</div>
                <div className="pr-rp-stat-val">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pr-section-lbl"><Shield size={11} /> Access Permissions</div>
        {permissions.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < permissions.length - 1 ? '1px solid #F8F5F2' : 'none' }}>
            <span style={{ fontSize: 13, color: '#2D2D2D', fontWeight: 500 }}>{p.label}</span>
            {p.granted
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#DCFCE7', padding: '3px 9px', borderRadius: 10, border: '1px solid #86EFAC' }}><CheckCircle size={11} /> Granted</span>
              : <span style={{ fontSize: 11, fontWeight: 600, color: '#8B7355', background: '#F1EEE8', padding: '3px 9px', borderRadius: 10, border: '1px solid #EFE7DE' }}>Restricted</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function CashierRoleCard() {
  const data = {
    branch: 'Main Branch — Bangalore', counter: 'Counter 2',
    shift: '9:00 AM – 5:00 PM',       employeeId: 'NB-CSH-042',
    joiningDate: '15 March 2025',      supervisor: 'Admin Manager',
    todayInvoices: 14, weekInvoices: 87,
    totalRevenue: '₹1,24,500',         avgBillValue: '₹1,432',
  };
  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <div>
          <div className="pr-card-title"><Briefcase size={15} /> Cashier Details</div>
          <div className="pr-card-sub">Your assigned counter, shift and performance stats</div>
        </div>
      </div>
      <div className="pr-card-body">
        <div className="pr-role-panel">
          <div className="pr-rp-header">
            <div className="pr-rp-icon"><Briefcase size={18} /></div>
            <div>
              <div className="pr-rp-title">Cashier — {data.counter}</div>
              <div className="pr-rp-sub">{data.branch}</div>
            </div>
          </div>
          <div className="pr-rp-grid">
            {[["Today's Bills", data.todayInvoices],["This Week", data.weekInvoices],["Revenue", data.totalRevenue],["Avg. Bill", data.avgBillValue]].map(([l,v]) => (
              <div key={l} className="pr-rp-stat">
                <div className="pr-rp-stat-label">{l}</div>
                <div className="pr-rp-stat-val" style={{ fontSize: typeof v === 'string' && v.length > 5 ? 12 : 14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pr-section-lbl"><Hash size={11} /> Assignment Details</div>
        {[
          { icon: Hash,       label: 'Employee ID',   val: data.employeeId,   copy: true  },
          { icon: Building2,  label: 'Branch',        val: data.branch,       copy: false },
          { icon: Briefcase,  label: 'Counter',       val: data.counter,      copy: false },
          { icon: Clock,      label: 'Shift Timing',  val: data.shift,        copy: false },
          { icon: Calendar,   label: 'Joining Date',  val: data.joiningDate,  copy: false },
          { icon: User,       label: 'Supervisor',    val: data.supervisor,   copy: false },
        ].map(({ icon: Icon, label, val, copy }, i) => (
          <div key={i} className="pr-info-row" style={i === 0 ? { paddingTop: 4 } : {}}>
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
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════════════════════════════════════ */
function SecurityTab({ onOpenChangePW, onSave }) {
  const [twoFA, setTwoFA]       = useState(false);
  const [loginAlert, setAlert]  = useState(true);

  return (
    <>
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Lock size={15} /> Password & Authentication</div>
            <div className="pr-card-sub">Manage your password and two-factor authentication</div>
          </div>
        </div>
        <div className="pr-card-body">
          <div className="pr-sec-item" style={{ paddingTop: 4 }}>
            <div className="pr-sec-icon"><Lock size={16} /></div>
            <div className="pr-sec-info">
              <div className="pr-sec-label">Password</div>
              <div className="pr-sec-desc">Last changed 45 days ago · ●●●●●●●●</div>
            </div>
            <button className="pr-sec-action" onClick={onOpenChangePW}>Change</button>
          </div>

          <div className="pr-sec-item">
            <div className="pr-sec-icon"><Smartphone size={16} /></div>
            <div className="pr-sec-info">
              <div className="pr-sec-label">Two-Factor Authentication</div>
              <div className="pr-sec-desc">{twoFA ? 'Enabled — using Authenticator app' : 'Not enabled — highly recommended'}</div>
            </div>
            <Toggle on={twoFA} onChange={v => { setTwoFA(v); onSave(v ? '2FA enabled successfully' : '2FA has been disabled'); }} />
          </div>

          {twoFA && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 8 }}>
              <CheckCircle size={13} /> 2FA active — your account is secured with an authenticator app.
            </div>
          )}

          <div className="pr-sec-item">
            <div className="pr-sec-icon"><Bell size={16} /></div>
            <div className="pr-sec-info">
              <div className="pr-sec-label">Login Alerts</div>
              <div className="pr-sec-desc">Get notified of new logins from unrecognized devices</div>
            </div>
            <Toggle on={loginAlert} onChange={v => { setAlert(v); onSave(v ? 'Login alerts enabled' : 'Login alerts disabled'); }} />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Monitor size={15} /> Active Sessions</div>
            <div className="pr-card-sub">Devices currently signed in to your account</div>
          </div>
          <button className="pr-btn-secondary" style={{ height: 34, fontSize: 12, padding: '0 14px' }} onClick={() => onSave('All other sessions revoked')}>
            <RefreshCw size={13} /> Revoke Others
          </button>
        </div>
        <div className="pr-card-body">
          {SESSIONS.map((s, i) => (
            <div key={i} className="pr-session">
              <div className="pr-session-icon"><s.icon size={16} /></div>
              <div className="pr-session-info">
                <div className="pr-session-device">{s.device}</div>
                <div className="pr-session-meta">{s.location} · {s.time}</div>
              </div>
              {s.current
                ? <div className="pr-session-current">Current</div>
                : <button className="pr-sec-action" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => onSave('Session revoked')}>Revoke</button>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pr-danger-zone">
        <div className="pr-danger-head">
          <AlertTriangle size={15} style={{ color: '#dc2626' }} />
          <div className="pr-danger-title">Danger Zone</div>
        </div>
        <div className="pr-danger-body">
          <div className="pr-danger-item" style={{ paddingTop: 4 }}>
            <div>
              <div className="pr-danger-label">Sign Out All Devices</div>
              <div className="pr-danger-desc">Immediately end all active sessions on every device</div>
            </div>
            <button className="pr-btn-danger" onClick={() => onSave('All sessions signed out')}>
              <LogOut size={13} /> Sign Out All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ACTIVITY TAB
══════════════════════════════════════════════════════════════════════ */
function ActivityTab({ isAdmin }) {
  const [showAll, setShowAll] = useState(false);
  const log     = isAdmin ? ACTIVITY_LOG : CASHIER_ACTIVITY;
  const visible = showAll ? log : log.slice(0, 5);

  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <div>
          <div className="pr-card-title"><Activity size={15} /> Recent Activity</div>
          <div className="pr-card-sub">Your login history and recent account actions</div>
        </div>
        <button className="pr-btn-secondary" style={{ height: 32, fontSize: 12, padding: '0 12px' }} onClick={() => setShowAll(v => !v)}>
          {showAll ? 'Show Less' : `View All (${log.length})`}
        </button>
      </div>
      <div className="pr-card-body">
        {visible.map((a, i) => (
          <div key={i} className="pr-activity-item">
            <div className={`pr-act-dot pr-act-dot-${a.dot}`} />
            <div className="pr-act-content">
              <div className="pr-act-title">{a.title}</div>
              <div className="pr-act-meta">{a.meta}</div>
            </div>
            <div className="pr-act-time">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PREFERENCES TAB
══════════════════════════════════════════════════════════════════════ */
function PreferencesTab({ onSave }) {
  const [notifs, setNotifs] = useState({
    emailInvoice:  true,
    emailPayment:  true,
    emailLogin:    false,
    pushLowStock:  true,
    pushApproval:  true,
    weeklyReport:  false,
  });
  const set = (k) => setNotifs(n => {
    const updated = { ...n, [k]: !n[k] };
    onSave('Notification preferences saved');
    return updated;
  });

  const notifGroups = [
    {
      label: 'Email Notifications',
      icon: Mail,
      items: [
        { key: 'emailInvoice', label: 'Invoice Created', desc: 'Receive email when a new invoice is generated' },
        { key: 'emailPayment', label: 'Payment Received', desc: 'Receive email when a payment is recorded' },
        { key: 'emailLogin',   label: 'New Login Alert', desc: 'Receive email on unrecognized device login' },
      ],
    },
    {
      label: 'In-App Notifications',
      icon: Bell,
      items: [
        { key: 'pushLowStock',  label: 'Low Stock Alert', desc: 'Notify when a product falls below minimum stock' },
        { key: 'pushApproval',  label: 'Cashier Approval', desc: 'Notify when a new cashier awaits approval' },
        { key: 'weeklyReport',  label: 'Weekly Summary', desc: 'Receive a weekly summary every Monday morning' },
      ],
    },
  ];

  return (
    <>
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Bell size={15} /> Notification Preferences</div>
            <div className="pr-card-sub">Choose what you want to be notified about</div>
          </div>
        </div>
        <div className="pr-card-body">
          {notifGroups.map(({ label, icon: Icon, items }) => (
            <div key={label}>
              <div className="pr-section-lbl"><Icon size={11} /> {label}</div>
              {items.map(({ key, label: l, desc }) => (
                <div key={key} className="pr-toggle-row">
                  <div className="pr-toggle-info">
                    <div className="pr-toggle-label">{l}</div>
                    <div className="pr-toggle-desc">{desc}</div>
                  </div>
                  <Toggle on={notifs[key]} onChange={() => set(key)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Globe size={15} /> Regional Settings</div>
            <div className="pr-card-sub">Language, timezone and date format preferences</div>
          </div>
        </div>
        <div className="pr-card-body">
          <div className="pr-grid2">
            <div className="pr-field">
              <label>Language</label>
              <select defaultValue="en">
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="pr-field">
              <label>Timezone</label>
              <select defaultValue="IST">
                <option value="IST">IST (UTC+5:30)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="pr-field">
              <label>Date Format</label>
              <select defaultValue="dd/mm/yyyy">
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="pr-field">
              <label>Currency Display</label>
              <select defaultValue="inr">
                <option value="inr">₹ Indian Rupee (INR)</option>
                <option value="usd">$ US Dollar (USD)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="pr-btn-primary" onClick={() => onSave('Regional settings saved')}>
              <Save size={14} /> Save Preferences
            </button>
          </div>
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
  const fileInputRef      = useRef(null);

  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab]         = useState('overview');
  const [toast, setToast]                 = useState(null);
  const [showLogout, setShowLogout]       = useState(false);
  const [logoutLoading, setLLo]           = useState(false);
  const [showChangePW, setShowCPW]        = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Profile completion percentage (mocked based on filled fields)
  const completionPct = avatarPreview ? 90 : 75;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogoutConfirm = async () => {
    setLLo(true);
    await new Promise(r => setTimeout(r, 800));
    logout();
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      showToast('Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  const accountStats = isAdmin
    ? [{ val: '12', lbl: 'Users' }, { val: '248', lbl: 'Invoices' }]
    : [{ val: '87',  lbl: 'Bills' }, { val: '14',  lbl: 'Today'   }];

  const tabs = [
    { id: 'overview',     label: 'Overview',     icon: User    },
    { id: 'security',     label: 'Security',     icon: Shield  },
    { id: 'activity',     label: 'Activity',     icon: Activity, count: isAdmin ? '7' : '6' },
    { id: 'preferences',  label: 'Preferences',  icon: Settings },
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Toast ── */}
      {toast && (
        <div className={`pr-toast ${toast.type === 'error' ? 'pr-toast-error' : 'pr-toast-success'}`}>
          {toast.type === 'error'
            ? <AlertCircle size={14} style={{ color: '#FCA5A5', flexShrink: 0 }} />
            : <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Logout Modal ── */}
      {showLogout && (
        <LogoutModal
          user={user}
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogoutConfirm}
          loading={logoutLoading}
        />
      )}

      {/* ── Change Password Modal ── */}
      {showChangePW && (
        <ChangePasswordModal
          onClose={() => setShowCPW(false)}
          onSave={showToast}
        />
      )}

      {/* ── Hidden Avatar Input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="pr-file-input"
        onChange={handleAvatarChange}
      />

      <div className="pr-shell">

        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div className="pr-left">

          {/* Hero Card */}
          <div className="pr-hero">
            <div className="pr-hero-banner" />
            <div className="pr-hero-body">
              <div className="pr-avatar-wrap">
                <div className="pr-avatar">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.email?.[0]?.toUpperCase()
                  }
                </div>
                <div className="pr-avatar-edit" onClick={handleAvatarClick} title="Change photo">
                  <Camera size={11} color="#2D2D2D" />
                </div>
              </div>

              <div className="pr-hero-name">{isAdmin ? 'NexBill Admin' : 'Ahamed Yasik'}</div>
              <div className="pr-hero-email">{user?.email}</div>

              <div className={`pr-role-badge ${isAdmin ? 'pr-role-admin' : 'pr-role-cashier'}`}>
                {isAdmin ? <Award size={11} /> : <Briefcase size={11} />}
                {isAdmin ? 'Administrator' : 'Cashier'}
              </div>

              {/* Profile Completion */}
              <div className="pr-completion">
                <div className="pr-completion-top">
                  <span className="pr-completion-label">Profile completion</span>
                  <span className="pr-completion-pct">{completionPct}%</span>
                </div>
                <div className="pr-completion-track">
                  <div className="pr-completion-fill" style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              <div className="pr-hero-divider" />

              <div className="pr-hero-stats">
                {accountStats.map((s, i) => (
                  <div key={i} className="pr-hero-stat">
                    <div className="pr-hero-stat-val">{s.val}</div>
                    <div className="pr-hero-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              <div className="pr-status-online">
                <div className="pr-status-dot" />
                Online Now
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="pr-card">
            <div className="pr-card-head" style={{ paddingBottom: 12 }}>
              <div className="pr-card-title" style={{ fontSize: 13 }}><Calendar size={14} /> Account Info</div>
            </div>
            <div className="pr-card-body" style={{ padding: '12px 18px' }}>
              {[
                { icon: Calendar, label: 'Member Since', val: 'January 2024'   },
                { icon: Clock,    label: 'Last Login',   val: 'Today, 9:14 AM' },
                { icon: Globe,    label: 'Timezone',     val: 'IST (UTC+5:30)' },
              ].map(({ icon: Icon, label, val }, i) => (
                <div key={i} className="pr-acct-row">
                  <div className="pr-acct-icon"><Icon size={13} /></div>
                  <div>
                    <div className="pr-acct-label">{label}</div>
                    <div className="pr-acct-val">{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pr-card">
            <div className="pr-card-head" style={{ paddingBottom: 12 }}>
              <div className="pr-card-title" style={{ fontSize: 13 }}><ChevronRight size={14} /> Quick Actions</div>
            </div>
            <div style={{ padding: '6px 10px 10px' }}>
              <button className="pr-quick-action" onClick={() => { setShowCPW(true); }}>
                <div className="pr-qa-icon pr-qa-gold"><Key size={15} /></div>
                <div><div className="pr-qa-label">Change Password</div><div className="pr-qa-sub">Update your login password</div></div>
                <ChevronRight size={14} color="#D6D3D1" />
              </button>
              <button className="pr-quick-action" onClick={() => setActiveTab('security')}>
                <div className="pr-qa-icon pr-qa-blue"><Shield size={15} /></div>
                <div><div className="pr-qa-label">Security Settings</div><div className="pr-qa-sub">2FA, sessions & alerts</div></div>
                <ChevronRight size={14} color="#D6D3D1" />
              </button>
              <button className="pr-quick-action" onClick={() => navigate(isAdmin ? '/admin/settings' : '/cashier/settings')}>
                <div className="pr-qa-icon pr-qa-purple"><Settings size={15} /></div>
                <div><div className="pr-qa-label">App Settings</div><div className="pr-qa-sub">System preferences</div></div>
                <ChevronRight size={14} color="#D6D3D1" />
              </button>
              <button className="pr-quick-action" onClick={() => navigate(isAdmin ? '/admin/reports' : '/cashier/invoices')}>
                <div className="pr-qa-icon pr-qa-green"><TrendingUp size={15} /></div>
                <div><div className="pr-qa-label">{isAdmin ? 'View Reports' : 'My Invoices'}</div><div className="pr-qa-sub">{isAdmin ? 'Sales & analytics' : 'Billing history'}</div></div>
                <ChevronRight size={14} color="#D6D3D1" />
              </button>
              <button className="pr-quick-action" onClick={() => setShowLogout(true)}>
                <div className="pr-qa-icon pr-qa-red"><LogOut size={15} /></div>
                <div><div className="pr-qa-label" style={{ color: '#dc2626' }}>Sign Out</div><div className="pr-qa-sub">End your session</div></div>
                <ChevronRight size={14} color="#D6D3D1" />
              </button>
            </div>
          </div>

        </div>

        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        <div className="pr-right">

          {/* Tab Bar */}
          <div className="pr-tabs">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                className={`pr-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} />
                {label}
                {count && <span className="pr-tab-count">{count}</span>}
              </button>
            ))}
          </div>

          {/* Tab content sits below the tab bar with a connected card look */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #EFE7DE',
            borderTop: 'none',
            borderRadius: '0 0 14px 14px',
            padding: '0 22px 22px',
            boxShadow: '0 1px 4px rgba(45,45,45,0.05)',
          }}>
            <div className="pr-tab-panel">
              {activeTab === 'overview' && (
                <>
                  <PersonalInfoCard user={user} onSave={showToast} />
                  {isAdmin ? <AdminRoleCard /> : <CashierRoleCard />}
                </>
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  onOpenChangePW={() => setShowCPW(true)}
                  onSave={showToast}
                />
              )}

              {activeTab === 'activity' && (
                <ActivityTab isAdmin={isAdmin} />
              )}

              {activeTab === 'preferences' && (
                <PreferencesTab onSave={showToast} />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
