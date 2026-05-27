// ╔══════════════════════════════════════════════════════════════════════╗
// ║   NexBill ERP — Profile Module  (Tab UI v4)                        ║
// ║   Tabs: Personal Info · Role Details · Activity Log                ║
// ║   Works for both Admin & Cashier roles — ONE FILE                  ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Clock, Shield,
  LogOut, Edit3, Save, X, Camera, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Briefcase, Building2,
  ChevronRight, Star, Award, TrendingUp, Hash, Key, Globe,
  Copy, Check, Settings, Activity, FileText, CreditCard,
  Package, AlertTriangle, LogIn, UserCheck, RefreshCw,
  Filter, Search, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  .pr-shell {
    display: flex; gap: 24px;
    font-family: 'Inter', system-ui, sans-serif;
    min-height: calc(100vh - 120px);
  }

  /* ── Left Column ── */
  .pr-left { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
  .pr-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; }

  /* ── Card ── */
  .pr-card {
    background: #FFFFFF; border: 1px solid #EFE7DE;
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
  }
  .pr-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; border-bottom: 1px solid #EFE7DE; background: #FDFCFB;
  }
  .pr-card-title { font-size: 14px; font-weight: 700; color: #2D2D2D; display: flex; align-items: center; gap: 8px; }
  .pr-card-sub   { font-size: 12px; color: #8B7355; margin-top: 3px; }
  .pr-card-body  { padding: 20px 22px; }
  .pr-card-foot  {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 14px 22px; border-top: 1px solid #EFE7DE; background: #FDFCFB;
  }

  /* ── Hero Card ── */
  .pr-hero { background: #2D2D2D; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(45,45,45,0.18); }
  .pr-hero-banner {
    height: 64px;
    background: linear-gradient(135deg, #C6A969 0%, #8B7355 50%, #2D2D2D 100%);
    position: relative;
  }
  .pr-hero-banner::after {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 16px);
  }
  .pr-hero-body { padding: 0 22px 22px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .pr-avatar-wrap { position: relative; margin-top: -32px; margin-bottom: 12px; z-index: 2; }
  .pr-avatar {
    width: 84px; height: 84px; border-radius: 50%;
    background: linear-gradient(135deg, #C6A969 0%, #8B7355 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 800; color: #2D2D2D;
    border: 4px solid #2D2D2D; position: relative; overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .pr-avatar-edit {
    position: absolute; bottom: 2px; right: 2px;
    width: 26px; height: 26px; background: #C6A969;
    border: 2px solid #2D2D2D; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, transform 0.15s; z-index: 3;
  }
  .pr-avatar-edit:hover { background: #EFE7DE; transform: scale(1.1); }
  .pr-hero-name  { font-size: 17px; font-weight: 700; color: #F8F5F2; margin-bottom: 3px; letter-spacing: -0.2px; }
  .pr-hero-email { font-size: 12px; color: #9E9087; margin-bottom: 10px; }
  .pr-role-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 16px;
  }
  .pr-role-admin   { background: rgba(198,169,105,0.2); color: #C6A969; border: 1px solid rgba(198,169,105,0.3); }
  .pr-role-cashier { background: rgba(34,197,94,0.15);  color: #22c55e; border: 1px solid rgba(34,197,94,0.25); }
  .pr-completion { width: 100%; margin-bottom: 16px; }
  .pr-completion-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .pr-completion-label { font-size: 10px; color: #9E9087; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-completion-pct   { font-size: 12px; color: #C6A969; font-weight: 700; }
  .pr-completion-track { width: 100%; height: 5px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
  .pr-completion-fill  { height: 100%; background: linear-gradient(90deg, #C6A969 0%, #EFE7DE 100%); border-radius: 4px; transition: width 0.6s ease; }
  .pr-hero-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.07); margin-bottom: 14px; }
  .pr-hero-stats   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
  .pr-hero-stat    { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px; text-align: center; transition: background 0.2s; }
  .pr-hero-stat:hover { background: rgba(255,255,255,0.09); }
  .pr-hero-stat-val { font-size: 20px; font-weight: 700; color: #C6A969; line-height: 1; }
  .pr-hero-stat-lbl { font-size: 10px; color: #9E9087; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.4px; }
  .pr-status-online {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #22c55e; margin-top: 12px;
    background: rgba(34,197,94,0.1); padding: 4px 10px; border-radius: 20px;
    border: 1px solid rgba(34,197,94,0.2);
  }
  .pr-status-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; animation: prPulse 2s ease infinite; }
  @keyframes prPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.8)} }

  /* ── Quick Actions ── */
  .pr-quick-action {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px;
    border-radius: 10px; cursor: pointer; transition: background 0.15s, transform 0.1s;
    border: none; background: none; font-family: inherit; width: 100%; text-align: left;
  }
  .pr-quick-action:hover { background: #F8F5F2; transform: translateX(2px); }
  .pr-qa-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pr-qa-gold   { background: #EFE7DE; color: #8B7355; }
  .pr-qa-green  { background: #DCFCE7; color: #16a34a; }
  .pr-qa-red    { background: #FEE2E2; color: #dc2626; }
  .pr-qa-blue   { background: #DBEAFE; color: #2563eb; }
  .pr-qa-purple { background: #EDE9FE; color: #7c3aed; }
  .pr-qa-label  { font-size: 13px; font-weight: 600; color: #2D2D2D; flex: 1; }
  .pr-qa-sub    { font-size: 11px; color: #8B7355; margin-top: 1px; }

  /* ══════════════════════════════════════════════════════════════
     TAB NAVIGATION (right panel)
  ══════════════════════════════════════════════════════════════ */
  .pr-tab-bar {
    display: flex; gap: 0;
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 14px 14px 0 0;
    border-bottom: none;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
    overflow-x: auto; scrollbar-width: none;
    padding: 0 8px;
  }
  .pr-tab-bar::-webkit-scrollbar { display: none; }

  .pr-tab-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 16px 20px 14px;
    border: none; background: none; cursor: pointer;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #9E9087; white-space: nowrap;
    border-bottom: 3px solid transparent;
    transition: color 0.18s, border-color 0.18s;
    position: relative;
  }
  .pr-tab-btn:hover { color: #2D2D2D; }
  .pr-tab-btn.active {
    color: #2D2D2D;
    border-bottom-color: #C6A969;
  }
  .pr-tab-btn .pr-tab-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.18s, color 0.18s;
    background: transparent;
  }
  .pr-tab-btn:hover .pr-tab-icon { background: #F8F5F2; }
  .pr-tab-btn.active .pr-tab-icon { background: rgba(198,169,105,0.15); color: #C6A969; }

  .pr-tab-divider {
    width: 1px; background: #EFE7DE;
    margin: 10px 4px; flex-shrink: 0;
  }

  /* Tab panel container */
  .pr-tab-panel-wrap {
    background: #FFFFFF;
    border: 1px solid #EFE7DE;
    border-radius: 0 0 14px 14px;
    border-top: none;
    box-shadow: 0 1px 4px rgba(45,45,45,0.05);
    padding: 24px 22px;
    display: flex; flex-direction: column; gap: 20px;
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
  .pr-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
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
  .pr-role-panel { background: linear-gradient(135deg, #2D2D2D 0%, #3a3a3a 100%); border-radius: 12px; padding: 20px; margin-bottom: 4px; }
  .pr-rp-header  { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .pr-rp-icon    { width: 38px; height: 38px; background: rgba(198,169,105,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #C6A969; }
  .pr-rp-title   { font-size: 14px; font-weight: 700; color: #F8F5F2; }
  .pr-rp-sub     { font-size: 11px; color: #9E9087; margin-top: 2px; }
  .pr-rp-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pr-rp-stat    { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; padding: 12px; }
  .pr-rp-stat-label { font-size: 10px; color: #9E9087; text-transform: uppercase; letter-spacing: 0.5px; }
  .pr-rp-stat-val   { font-size: 14px; font-weight: 700; color: #C6A969; margin-top: 3px; }

  /* ── Activity Log ── */
  .pr-act-filters {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
    padding-bottom: 16px; border-bottom: 1px solid #EFE7DE; margin-bottom: 4px;
  }
  .pr-act-filter-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1.5px solid #EFE7DE; background: #F8F5F2; color: #8B7355;
    font-family: inherit; transition: all 0.15s;
  }
  .pr-act-filter-btn:hover { border-color: #C6A969; color: #2D2D2D; }
  .pr-act-filter-btn.active { background: #2D2D2D; color: #C6A969; border-color: #2D2D2D; }
  .pr-act-search {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px; border: 1.5px solid #EFE7DE;
    border-radius: 20px; background: #F8F5F2; flex: 1; min-width: 160px; max-width: 240px;
    transition: border-color 0.2s;
  }
  .pr-act-search:focus-within { border-color: #C6A969; background: #FFFFFF; }
  .pr-act-search input { border: none; background: none; outline: none; font-size: 12px; color: #2D2D2D; font-family: inherit; width: 100%; }
  .pr-act-search input::placeholder { color: #D6D3D1; }

  .pr-act-timeline { display: flex; flex-direction: column; }
  .pr-act-item {
    display: flex; gap: 14px; padding: 14px 0;
    border-bottom: 1px solid #F8F5F2; position: relative;
    transition: background 0.1s; border-radius: 8px; margin: 0 -8px; padding-left: 8px; padding-right: 8px;
  }
  .pr-act-item:hover { background: #FDFCFB; }
  .pr-act-item:last-child { border-bottom: none; }
  .pr-act-icon-wrap {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; position: relative;
  }
  .pr-act-icon-line {
    position: absolute; left: 19px; top: 38px; bottom: -14px;
    width: 1px; background: #EFE7DE; pointer-events: none;
  }
  .pr-act-item:last-child .pr-act-icon-line { display: none; }
  .pr-act-body { flex: 1; min-width: 0; }
  .pr-act-title { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-act-meta  { font-size: 12px; color: #8B7355; margin-top: 3px; line-height: 1.4; }
  .pr-act-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 10px;
    font-size: 10px; font-weight: 700; margin-top: 5px;
  }
  .pr-act-time  { font-size: 11px; color: #8B7355; white-space: nowrap; flex-shrink: 0; padding-top: 2px; }

  .pr-act-color-green  { background: #DCFCE7; color: #16a34a; }
  .pr-act-color-gold   { background: #FEF3C7; color: #d97706; }
  .pr-act-color-red    { background: #FEE2E2; color: #dc2626; }
  .pr-act-color-blue   { background: #DBEAFE; color: #2563eb; }
  .pr-act-color-gray   { background: #F1EEE8; color: #8B7355; }

  .pr-act-icon-green  { background: #DCFCE7; color: #16a34a; }
  .pr-act-icon-gold   { background: #FEF3C7; color: #d97706; }
  .pr-act-icon-red    { background: #FEE2E2; color: #dc2626; }
  .pr-act-icon-blue   { background: #DBEAFE; color: #2563eb; }
  .pr-act-icon-gray   { background: #F1EEE8; color: #8B7355; }

  .pr-act-empty {
    text-align: center; padding: 40px 20px;
    color: #9E9087; font-size: 13px;
  }
  .pr-act-empty-icon { font-size: 32px; margin-bottom: 10px; }

  .pr-act-load-more {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; padding: 10px; margin-top: 4px;
    border: 1.5px dashed #EFE7DE; border-radius: 10px;
    background: none; font-family: inherit; font-size: 12px; font-weight: 600;
    color: #8B7355; cursor: pointer; transition: all 0.2s;
  }
  .pr-act-load-more:hover { border-color: #C6A969; color: #2D2D2D; background: #F8F5F2; }

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
  .pr-file-input { display: none; }
  .pr-acct-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F8F5F2; }
  .pr-acct-row:last-child { border-bottom: none; }
  .pr-acct-icon { width: 28px; height: 28px; background: #EFE7DE; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: #8B7355; flex-shrink: 0; }
  .pr-acct-label { font-size: 10px; color: #8B7355; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .pr-acct-val   { font-size: 12px; font-weight: 600; color: #2D2D2D; margin-top: 1px; }
  .pr-sec-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F8F5F2; gap: 12px; }
  .pr-sec-item:last-child { border-bottom: none; padding-bottom: 0; }
  .pr-sec-icon { width: 34px; height: 34px; background: #EFE7DE; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #8B7355; flex-shrink: 0; }
  .pr-sec-info { flex: 1; }
  .pr-sec-label { font-size: 13px; font-weight: 600; color: #2D2D2D; }
  .pr-sec-desc  { font-size: 12px; color: #8B7355; margin-top: 2px; }
  .pr-sec-action { padding: 6px 14px; background: #F8F5F2; border: 1.5px solid #EFE7DE; border-radius: 8px; font-size: 12px; font-weight: 600; color: #8B7355; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap; }
  .pr-sec-action:hover { background: #2D2D2D; color: #C6A969; border-color: #2D2D2D; }

  @media (max-width: 900px) {
    .pr-shell { flex-direction: column; }
    .pr-left  { width: 100%; }
    .pr-grid2 { grid-template-columns: 1fr; }
    .pr-grid3 { grid-template-columns: 1fr; }
    .pr-tab-btn { padding: 12px 14px 10px; font-size: 12px; }
  }
`;

/* ══════════════════════════════════════════════════════════════════════
   ACTIVITY DATA
══════════════════════════════════════════════════════════════════════ */
const ACTIVITY_ADMIN = [
  { type: 'login',   color: 'green', Icon: LogIn,      title: 'Logged in successfully',      meta: 'Chrome · Windows 11 · 192.168.1.10',       time: 'Just now',   badge: 'Login',    category: 'auth'     },
  { type: 'invoice', color: 'gold',  Icon: FileText,   title: 'Invoice #INV-1042 created',   meta: 'New invoice for Ravi Kumar — ₹12,400',      time: '2h ago',     badge: 'Billing',  category: 'billing'  },
  { type: 'payment', color: 'green', Icon: CreditCard, title: 'Payment received',             meta: '₹18,500 recorded for Invoice #INV-1038',    time: '5h ago',     badge: 'Payment',  category: 'billing'  },
  { type: 'settings',color: 'blue',  Icon: Settings,   title: 'Settings updated',             meta: 'Invoice prefix changed to INV-',             time: 'Yesterday',  badge: 'Settings', category: 'system'   },
  { type: 'user',    color: 'gold',  Icon: UserCheck,  title: 'Cashier approved',             meta: 'Yasik approved for Counter 2 · Main Branch', time: '2 days ago', badge: 'Admin',    category: 'system'   },
  { type: 'product', color: 'blue',  Icon: Package,    title: 'Inventory updated',            meta: '3 products restocked — Rice, Sugar, Flour',  time: '2 days ago', badge: 'Inventory',category: 'system'   },
  { type: 'alert',   color: 'red',   Icon: AlertTriangle, title: 'Failed login attempt',     meta: 'Unknown device · IP 103.55.12.8',            time: '3 days ago', badge: 'Alert',    category: 'auth'     },
  { type: 'logout',  color: 'gray',  Icon: LogOut,     title: 'Session ended',                meta: '8h session · Chrome · Windows 11',           time: '3 days ago', badge: 'Logout',   category: 'auth'     },
  { type: 'report',  color: 'blue',  Icon: TrendingUp, title: 'Monthly report generated',    meta: 'April 2026 — ₹3,24,800 total revenue',       time: '5 days ago', badge: 'Report',   category: 'system'   },
];
const ACTIVITY_CASHIER = [
  { type: 'login',   color: 'green', Icon: LogIn,      title: 'Logged in successfully',      meta: 'Chrome · Windows 11 · Counter 2',           time: 'Just now',   badge: 'Login',    category: 'auth'     },
  { type: 'invoice', color: 'gold',  Icon: FileText,   title: 'Invoice #INV-1051 generated', meta: 'Billed ₹4,200 to Mohan Lal',               time: '1h ago',     badge: 'Billing',  category: 'billing'  },
  { type: 'payment', color: 'green', Icon: CreditCard, title: 'Cash payment collected',      meta: '₹1,850 for Invoice #INV-1049',              time: '2h ago',     badge: 'Payment',  category: 'billing'  },
  { type: 'product', color: 'blue',  Icon: Package,    title: 'Product stock checked',       meta: 'Checked 5 items for low stock alert',        time: '4h ago',     badge: 'Inventory',category: 'system'   },
  { type: 'invoice', color: 'gold',  Icon: FileText,   title: 'Invoice #INV-1048 generated', meta: 'Billed ₹7,600 to Anita Sharma',             time: 'Yesterday',  badge: 'Billing',  category: 'billing'  },
  { type: 'user',    color: 'blue',  Icon: User,       title: 'Customer record added',       meta: 'Added Priya Nair to customer list',          time: 'Yesterday',  badge: 'Customer', category: 'system'   },
  { type: 'logout',  color: 'gray',  Icon: LogOut,     title: 'Shift ended',                 meta: '9AM–5PM · 18 invoices · ₹24,350 collected', time: 'Yesterday',  badge: 'Logout',   category: 'auth'     },
  { type: 'payment', color: 'green', Icon: CreditCard, title: 'UPI payment recorded',        meta: '₹3,200 for Invoice #INV-1041',              time: '2 days ago', badge: 'Payment',  category: 'billing'  },
];

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
   CHANGE PASSWORD MODAL
══════════════════════════════════════════════════════════════════════ */
function ChangePasswordModal({ onClose, onSave }) {
  const [form, setForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow]     = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const str = (() => { let s = 0; const p = form.newPw; if(p.length>=8)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return s; })();
  const strLabel = ['','Weak','Fair','Good','Strong'][str];
  const strColor = ['','#dc2626','#f59e0b','#22c55e','#16a34a'][str];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current)             { setError('Please enter your current password.'); return; }
    if (form.newPw.length < 8)     { setError('New password must be at least 8 characters.'); return; }
    if (form.newPw !== form.confirm){ setError('Passwords do not match.'); return; }
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
        <input style={{ paddingLeft: 34, paddingRight: 36, boxSizing: 'border-box' }}
          type={show[field] ? 'text' : 'password'} value={form[field]} placeholder={placeholder}
          onChange={e => set(field, e.target.value)} required />
        <button type="button" className="pr-eye-btn" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}>
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
          <PwInput field="current" label="Current Password" placeholder="Enter current password" />
          <PwInput field="newPw"   label="New Password"     placeholder="Min 8 characters" />
          {form.newPw.length > 0 && (
            <div>
              <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=str ? strColor : '#EFE7DE', transition:'background 0.3s' }} />)}
              </div>
              <div style={{ fontSize:11, color:strColor, fontWeight:600 }}>{strLabel} password</div>
            </div>
          )}
          <PwInput field="confirm" label="Confirm New Password" placeholder="Re-enter new password" />
          {error && <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#dc2626', display:'flex', alignItems:'center', gap:6 }}><AlertCircle size={13} />{error}</div>}
          <div style={{ background:'#F8F5F2', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#8B7355', lineHeight:1.5 }}>🔐 Mix uppercase, lowercase, numbers and symbols.</div>
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
function PersonalInfoTab({ user, onSave, onChangePW }) {
  const isAdmin = user?.role === 'ADMIN';
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    name:       isAdmin ? 'NexBill Admin' : 'Ahamed Yasik',
    phone:      isAdmin ? '+91 9876 543 210' : '+91 9123 456 789',
    department: isAdmin ? 'Administration' : 'Billing & Counter',
    location:   'Bangalore, Karnataka',
    bio:        isAdmin
      ? 'System administrator for NexBill ERP. Manages users, settings, and overall platform operations.'
      : 'Cashier at Counter 2. Responsible for billing customers and managing daily transactions.',
  });
  const [orig] = useState(form);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false); setEditing(false);
    onSave('Profile updated successfully!');
  };

  return (
    <>
      {/* Personal Details Card */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><User size={15} /> Personal Details</div>
            <div className="pr-card-sub">Your display name, contact and bio</div>
          </div>
          {!editing && (
            <button className="pr-btn-secondary" style={{ height:34, fontSize:12, padding:'0 14px' }} onClick={() => setEditing(true)}>
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
                    <input style={{ paddingLeft:34 }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
                  </div>
                </div>
                <div className="pr-field">
                  <label>Phone Number</label>
                  <div className="pr-input-wrap">
                    <Phone size={14} className="pr-input-icon" />
                    <input style={{ paddingLeft:34 }} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
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
                    <input style={{ paddingLeft:34 }} value={form.location} onChange={e => set('location', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="pr-field" style={{ marginBottom:0 }}>
                <label>Bio</label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                  style={{ padding:'9px 12px', border:'1.5px solid #EFE7DE', borderRadius:9, fontSize:13, color:'#2D2D2D', background:'#F8F5F2', outline:'none', fontFamily:'inherit', resize:'vertical', width:'100%', boxSizing:'border-box', lineHeight:1.5 }} />
              </div>
            </>
          ) : (
            <>
              {[
                { icon: User,      label: 'Full Name',     val: form.name,       copy: false },
                { icon: Mail,      label: 'Email Address', val: user?.email,     copy: true,  badge: 'Verified' },
                { icon: Phone,     label: 'Phone Number',  val: form.phone,      copy: true  },
                { icon: Briefcase, label: 'Department',    val: form.department, copy: false },
                { icon: MapPin,    label: 'Location',      val: form.location,   copy: false },
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
              <div className="pr-info-row">
                <div className="pr-info-icon" style={{ alignSelf:'flex-start', marginTop:4 }}><Star size={15} /></div>
                <div className="pr-info-content">
                  <div className="pr-info-label">Bio</div>
                  <div className="pr-info-val" style={{ fontWeight:400, color:'#3F3F46', lineHeight:1.55 }}>{form.bio}</div>
                </div>
              </div>
            </>
          )}
        </div>
        {editing && (
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
          <div className="pr-sec-item" style={{ paddingTop:0 }}>
            <div className="pr-sec-icon"><Lock size={16} /></div>
            <div className="pr-sec-info">
              <div className="pr-sec-label">Login Password</div>
              <div className="pr-sec-desc">Last changed 30 days ago · ••••••••</div>
            </div>
            <button className="pr-sec-action" onClick={onChangePW}>Change</button>
          </div>
          <div className="pr-sec-item">
            <div className="pr-sec-icon"><Globe size={16} /></div>
            <div className="pr-sec-info">
              <div className="pr-sec-label">Active Session</div>
              <div className="pr-sec-desc">Chrome · Windows 11 · Bangalore · Since 9:14 AM</div>
            </div>
            <button className="pr-sec-action">Revoke</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAB 2a — ADMIN DETAILS
══════════════════════════════════════════════════════════════════════ */
function AdminDetailsTab() {
  const permissions = [
    { label: 'Product & Inventory Management', granted: true  },
    { label: 'Billing & Invoice Control',       granted: true  },
    { label: 'Customer Data Management',        granted: true  },
    { label: 'Reports & Analytics',             granted: true  },
    { label: 'Cashier Approval & Management',   granted: true  },
    { label: 'System Settings',                 granted: true  },
    { label: 'API & Integration Access',        granted: false },
  ];

  return (
    <>
      {/* Role Overview */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Award size={15} /> Administrator Role</div>
            <div className="pr-card-sub">Your admin level, access scope and system stats</div>
          </div>
          <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:10, background:'rgba(198,169,105,0.15)', color:'#C6A969', border:'1px solid rgba(198,169,105,0.3)' }}>Level 5 · Full Access</span>
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
              {[['Access Level','Level 5'],['Admin Since','Jan 2024'],['Users Managed','12'],['Last Action','2h ago']].map(([l,v]) => (
                <div key={l} className="pr-rp-stat">
                  <div className="pr-rp-stat-label">{l}</div>
                  <div className="pr-rp-stat-val">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pr-section-lbl"><TrendingUp size={11} /> System Overview</div>
          <div className="pr-grid3" style={{ marginBottom:4 }}>
            {[['Total Users','12'],['Total Invoices','248'],['Monthly Revenue','₹3.2L'],['Pending Approvals','2'],['Low Stock Items','5'],['Active Sessions','3']].map(([l,v]) => (
              <div key={l} style={{ background:'#F8F5F2', border:'1px solid #EFE7DE', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:10, color:'#8B7355', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{l}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#2D2D2D', marginTop:4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Shield size={15} /> Access Permissions</div>
            <div className="pr-card-sub">Modules and capabilities granted to your account</div>
          </div>
        </div>
        <div className="pr-card-body">
          {permissions.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 8px', borderBottom: i < permissions.length-1 ? '1px solid #F8F5F2' : 'none', borderRadius:8, margin:'0 -8px', transition:'background 0.1s' }}
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
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TAB 2b — CASHIER DETAILS
══════════════════════════════════════════════════════════════════════ */
function CashierDetailsTab() {
  const data = {
    branch:'Main Branch — Bangalore', counter:'Counter 2', shift:'9:00 AM – 5:00 PM',
    employeeId:'NB-CSH-042', joiningDate:'15 March 2025', supervisor:'Admin Manager',
    todayInvoices:14, weekInvoices:87, totalRevenue:'₹1,24,500', avgBillValue:'₹1,432',
  };

  return (
    <>
      {/* Assignment & Stats */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Briefcase size={15} /> Cashier Assignment</div>
            <div className="pr-card-sub">Your counter, shift and performance stats</div>
          </div>
          <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:10, background:'rgba(34,197,94,0.12)', color:'#16a34a', border:'1px solid rgba(34,197,94,0.25)' }}>Active · On Duty</span>
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
              {[["Today's Bills",data.todayInvoices],["This Week",data.weekInvoices],["Revenue",data.totalRevenue],["Avg. Bill",data.avgBillValue]].map(([l,v]) => (
                <div key={l} className="pr-rp-stat">
                  <div className="pr-rp-stat-label">{l}</div>
                  <div className="pr-rp-stat-val" style={{ fontSize: typeof v==='string'&&v.length>5 ? 12:14 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="pr-card">
        <div className="pr-card-head">
          <div>
            <div className="pr-card-title"><Hash size={15} /> Assignment Details</div>
            <div className="pr-card-sub">Employee ID, branch, counter and shift information</div>
          </div>
        </div>
        <div className="pr-card-body">
          {[
            { icon:Hash,      label:'Employee ID',  val:data.employeeId,  copy:true  },
            { icon:Building2, label:'Branch',       val:data.branch,      copy:false },
            { icon:Briefcase, label:'Counter',      val:data.counter,     copy:false },
            { icon:Clock,     label:'Shift Timing', val:data.shift,       copy:false },
            { icon:Calendar,  label:'Joining Date', val:data.joiningDate, copy:false },
            { icon:User,      label:'Supervisor',   val:data.supervisor,  copy:false },
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
   TAB 3 — ACTIVITY LOG
══════════════════════════════════════════════════════════════════════ */
function ActivityLogTab({ isAdmin }) {
  const allLog = isAdmin ? ACTIVITY_ADMIN : ACTIVITY_CASHIER;
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [showAll, setShowAll] = useState(false);

  const FILTERS = [
    { key:'all',     label:'All'      },
    { key:'auth',    label:'Logins'   },
    { key:'billing', label:'Billing'  },
    { key:'system',  label:'System'   },
  ];

  const filtered = allLog.filter(a => {
    const matchCat    = filter === 'all' || a.category === filter;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.meta.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const visible = showAll ? filtered : filtered.slice(0, 5);

  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <div>
          <div className="pr-card-title"><Activity size={15} /> Activity Log</div>
          <div className="pr-card-sub">Your recent logins, actions and system events</div>
        </div>
        <button className="pr-btn-secondary" style={{ height:32, fontSize:12, padding:'0 12px', gap:5 }}>
          <Download size={13} /> Export
        </button>
      </div>
      <div className="pr-card-body">
        {/* Filters + Search */}
        <div className="pr-act-filters">
          {FILTERS.map(f => (
            <button key={f.key} className={`pr-act-filter-btn ${filter===f.key ? 'active':''}`} onClick={() => { setFilter(f.key); setShowAll(false); }}>
              {f.label}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <div className="pr-act-search">
            <Search size={13} color="#D6D3D1" />
            <input placeholder="Search events…" value={search} onChange={e => { setSearch(e.target.value); setShowAll(false); }} />
            {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#8B7355', padding:0, display:'flex' }}><X size={12} /></button>}
          </div>
        </div>

        {/* Timeline */}
        {visible.length === 0 ? (
          <div className="pr-act-empty">
            <div className="pr-act-empty-icon">🔍</div>
            No events match your filter.
          </div>
        ) : (
          <div className="pr-act-timeline">
            {visible.map((a, i) => {
              const Icon = a.Icon;
              return (
                <div key={i} className="pr-act-item">
                  <div className={`pr-act-icon-wrap pr-act-icon-${a.color}`}>
                    <Icon size={16} />
                    <div className="pr-act-icon-line" />
                  </div>
                  <div className="pr-act-body">
                    <div className="pr-act-title">{a.title}</div>
                    <div className="pr-act-meta">{a.meta}</div>
                    <span className={`pr-act-badge pr-act-color-${a.color}`}>{a.badge}</span>
                  </div>
                  <div className="pr-act-time">{a.time}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {filtered.length > 5 && !showAll && (
          <button className="pr-act-load-more" onClick={() => setShowAll(true)}>
            <RefreshCw size={13} /> Show {filtered.length - 5} more events
          </button>
        )}
        {showAll && filtered.length > 5 && (
          <button className="pr-act-load-more" onClick={() => setShowAll(false)}>
            Show less
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PROFILE — DEFAULT EXPORT
══════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const fileInputRef      = useRef(null);
  const isAdmin           = user?.role === 'ADMIN';

  const [activeTab, setActiveTab]           = useState('personal');
  const [toast, setToast]                   = useState(null);
  const [showLogout, setShowLogout]         = useState(false);
  const [logoutLoading, setLogoutLoading]   = useState(false);
  const [showChangePW, setShowChangePW]     = useState(false);
  const [avatarPreview, setAvatarPreview]   = useState(null);

  const completionPct = avatarPreview ? 90 : 75;

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    await new Promise(r => setTimeout(r, 800));
    logout();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select a valid image.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setAvatarPreview(ev.target.result); showToast('Profile photo updated!'); };
    reader.readAsDataURL(file);
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
      sub:   isAdmin ? 'Permissions & system access' : 'Counter, shift & performance',
    },
    {
      id:    'activity',
      label: 'Activity Log',
      Icon:  Activity,
      sub:   'Logins, actions & events',
    },
  ];

  const accountStats = isAdmin
    ? [{ val:'12', lbl:'Users' }, { val:'248', lbl:'Invoices' }]
    : [{ val:'87', lbl:'Bills' }, { val:'14',  lbl:'Today'   }];

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

      <input ref={fileInputRef} type="file" accept="image/*" className="pr-file-input" onChange={handleAvatarChange} />

      <div className="pr-shell">

        {/* ══ LEFT COLUMN ══ */}
        <div className="pr-left">

          {/* Hero */}
          <div className="pr-hero">
            <div className="pr-hero-banner" />
            <div className="pr-hero-body">
              <div className="pr-avatar-wrap">
                <div className="pr-avatar">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : user?.email?.[0]?.toUpperCase()
                  }
                </div>
                <div className="pr-avatar-edit" onClick={() => fileInputRef.current?.click()} title="Change photo">
                  <Camera size={11} color="#2D2D2D" />
                </div>
              </div>
              <div className="pr-hero-name">{isAdmin ? 'NexBill Admin' : 'Ahamed Yasik'}</div>
              <div className="pr-hero-email">{user?.email}</div>
              <div className={`pr-role-badge ${isAdmin ? 'pr-role-admin' : 'pr-role-cashier'}`}>
                {isAdmin ? <Award size={11} /> : <Briefcase size={11} />}
                {isAdmin ? 'Administrator' : 'Cashier'}
              </div>
              <div className="pr-completion">
                <div className="pr-completion-top">
                  <span className="pr-completion-label">Profile completion</span>
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
                    <div className="pr-hero-stat-val">{s.val}</div>
                    <div className="pr-hero-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div className="pr-status-online"><div className="pr-status-dot" />Online Now</div>
            </div>
          </div>

          {/* Account Info */}
          <div className="pr-card">
            <div className="pr-card-head" style={{ paddingBottom:12 }}>
              <div className="pr-card-title" style={{ fontSize:13 }}><Calendar size={14} /> Account Info</div>
            </div>
            <div className="pr-card-body" style={{ padding:'12px 18px' }}>
              {[
                { icon:Calendar, label:'Member Since', val:'January 2024'   },
                { icon:Clock,    label:'Last Login',   val:'Today, 9:14 AM' },
                { icon:Globe,    label:'Timezone',     val:'IST (UTC+5:30)' },
              ].map(({ icon:Icon, label, val }, i) => (
                <div key={i} className="pr-acct-row">
                  <div className="pr-acct-icon"><Icon size={13} /></div>
                  <div><div className="pr-acct-label">{label}</div><div className="pr-acct-val">{val}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pr-card">
            <div className="pr-card-head" style={{ paddingBottom:12 }}>
              <div className="pr-card-title" style={{ fontSize:13 }}><ChevronRight size={14} /> Quick Actions</div>
            </div>
            <div style={{ padding:'6px 10px 10px' }}>
              {[
                { icon:Key,         cls:'pr-qa-gold',   label:'Change Password', sub:'Update your login password',              onClick:() => setShowChangePW(true) },
                { icon:Settings,    cls:'pr-qa-purple',  label:'App Settings',    sub:'System preferences',                      onClick:() => navigate(isAdmin ? '/admin/settings' : '/cashier/settings') },
                { icon:TrendingUp,  cls:'pr-qa-green',   label: isAdmin ? 'View Reports' : 'My Invoices', sub: isAdmin ? 'Sales & analytics':'Billing history', onClick:() => navigate(isAdmin ? '/admin/reports' : '/cashier/invoices') },
                { icon:Activity,    cls:'pr-qa-blue',    label:'Activity Log',    sub:'View recent actions',                     onClick:() => setActiveTab('activity') },
                { icon:LogOut,      cls:'pr-qa-red',     label:'Sign Out',        sub:'End your session',                        onClick:() => setShowLogout(true), danger:true },
              ].map(({ icon:Icon, cls, label, sub, onClick, danger }, i) => (
                <button key={i} className="pr-quick-action" onClick={onClick}>
                  <div className={`pr-qa-icon ${cls}`}><Icon size={15} /></div>
                  <div>
                    <div className="pr-qa-label" style={danger ? { color:'#dc2626' } : {}}>{label}</div>
                    <div className="pr-qa-sub">{sub}</div>
                  </div>
                  <ChevronRight size={14} color="#D6D3D1" />
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
              <PersonalInfoTab user={user} onSave={showToast} onChangePW={() => setShowChangePW(true)} />
            )}
            {activeTab === 'role' && (
              isAdmin ? <AdminDetailsTab /> : <CashierDetailsTab />
            )}
            {activeTab === 'activity' && (
              <ActivityLogTab isAdmin={isAdmin} />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
