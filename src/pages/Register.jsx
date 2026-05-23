import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ShieldCheck, User } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [role, setRole] = useState('CASHIER');
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecretKey: '' });
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const switchRole = (r) => { setRole(r); setError(''); setSuccess(''); setForm({ name: '', email: '', password: '', adminSecretKey: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'ADMIN') payload.adminSecretKey = form.adminSecretKey;
      const res = await axios.post('/api/auth/register', payload);
      setSuccess(res.data?.message || (role === 'CASHIER' ? 'Registration submitted! Await admin approval.' : 'Admin account created successfully!'));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const isAdmin = role === 'ADMIN';

  return (
    <>
      <style>{`
        .reg-page{min-height:100vh;background:#F8F5F2;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;padding:24px}
        .reg-card{width:100%;max-width:420px;background:#FFFFFF;border-radius:20px;padding:44px 40px;box-shadow:0 4px 24px rgba(45,45,45,0.08);border:1px solid #EFE7DE}
        .reg-brand{display:flex;align-items:center;gap:10px;margin-bottom:20px;font-size:16px;font-weight:600;color:#2D2D2D}
        .reg-logo{width:34px;height:34px;background:#2D2D2D;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#C6A969}
        .reg-toggle{display:flex;background:#F8F5F2;border:1.5px solid #EFE7DE;border-radius:10px;padding:4px;gap:4px;margin-bottom:20px}
        .reg-role-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;border:none;border-radius:7px;font-size:13px;font-weight:500;color:#8B7355;background:transparent;cursor:pointer;transition:all 0.2s;font-family:inherit}
        .reg-role-btn:hover{color:#2D2D2D}
        .reg-role-active{background:#2D2D2D;color:#F8F5F2 !important;box-shadow:0 1px 4px rgba(45,45,45,0.15)}
        .reg-card h2{font-size:22px;font-weight:700;color:#2D2D2D;margin:0 0 6px}
        .reg-sub{font-size:14px;color:#8B7355;margin:0 0 28px}
        .reg-form{display:flex;flex-direction:column;gap:18px}
        .reg-field{display:flex;flex-direction:column;gap:7px}
        .reg-field label{font-size:13px;font-weight:500;color:#3F3F46}
        .reg-field input{padding:11px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:14px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s,box-shadow 0.2s;width:100%;box-sizing:border-box}
        .reg-field input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .reg-pass-wrap{position:relative}
        .reg-pass-wrap input{padding-right:42px}
        .reg-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8B7355;display:flex;align-items:center;padding:0}
        .reg-eye:hover{color:#C6A969}
        .reg-error{font-size:13px;color:#9B4444;background:#FDF0F0;border:1px solid #F0D0D0;border-radius:8px;padding:10px 14px}
        .reg-success{display:flex;align-items:center;gap:8px;font-size:13px;color:#5A7A5A;background:#F0F7F0;border:1px solid #C8DFC8;border-radius:10px;padding:12px 14px;margin-bottom:4px}
        .reg-submit{padding:13px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;display:flex;align-items:center;justify-content:center;margin-top:4px;width:100%}
        .reg-submit:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .reg-submit:disabled{opacity:0.6;cursor:not-allowed}
        .reg-spinner{width:16px;height:16px;border:2px solid rgba(248,245,242,0.3);border-top-color:#F8F5F2;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .reg-login-note{text-align:center;font-size:13px;color:#8B7355;margin:24px 0 0}
        .reg-login-link{color:#C6A969;font-weight:600;text-decoration:none}
        .reg-login-link:hover{color:#2D2D2D}
      `}</style>
      <div className="reg-page">
        <div className="reg-card">
          <div className="reg-brand"><div className="reg-logo">N</div><span>NexBill ERP</span></div>
          <div className="reg-toggle">
            <button type="button" className={`reg-role-btn ${!isAdmin ? 'reg-role-active' : ''}`} onClick={() => switchRole('CASHIER')}><User size={14} /> Cashier</button>
            <button type="button" className={`reg-role-btn ${isAdmin ? 'reg-role-active' : ''}`} onClick={() => switchRole('ADMIN')}><ShieldCheck size={14} /> Admin</button>
          </div>
          <h2>{isAdmin ? 'Create Admin Account' : 'Request Cashier Access'}</h2>
          <p className="reg-sub">{isAdmin ? 'Enter the admin secret key to register.' : 'Submit your details for admin approval.'}</p>
          {success && <div className="reg-success"><CheckCircle size={16} /><span>{success}</span></div>}
          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-field"><label>Full Name</label><input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required /></div>
            <div className="reg-field"><label>Email Address</label><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required /></div>
            <div className="reg-field">
              <label>Password</label>
              <div className="reg-pass-wrap">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a password" required minLength={6} />
                <button type="button" className="reg-eye" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            {isAdmin && (
              <div className="reg-field">
                <label>Admin Secret Key</label>
                <div className="reg-pass-wrap">
                  <input type={showKey ? 'text' : 'password'} name="adminSecretKey" value={form.adminSecretKey} onChange={handleChange} placeholder="Enter secret key" required />
                  <button type="button" className="reg-eye" onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            )}
            {error && <div className="reg-error">{error}</div>}
            <button type="submit" className="reg-submit" disabled={loading || !!success}>
              {loading ? <span className="reg-spinner" /> : (isAdmin ? 'Create Admin Account' : 'Submit Request')}
            </button>
          </form>
          <p className="reg-login-note">Already have access? <Link to="/login" className="reg-login-link">Sign in</Link></p>
        </div>
      </div>
    </>
  );
}
