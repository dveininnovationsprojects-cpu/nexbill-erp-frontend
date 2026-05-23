import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setPending(''); setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.role === 'ADMIN' ? '/admin/dashboard' : '/cashier/dashboard', { replace: true });
    } catch (err) {
      if (err?.isPending) setPending(err.message);
      else setError('Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .lg-page{min-height:100vh;background:#F8F5F2;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;padding:24px}
        .lg-card{width:100%;max-width:400px;background:#FFFFFF;border-radius:22px;padding:48px 40px;box-shadow:0 4px 24px rgba(45,45,45,0.08);border:1px solid #EFE7DE}
        .lg-brand{display:flex;align-items:center;gap:10px;margin-bottom:32px}
        .lg-logo{width:36px;height:36px;background:#2D2D2D;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#C6A969}
        .lg-brand-name{font-size:17px;font-weight:700;color:#2D2D2D}
        .lg-brand-sub{font-size:12px;color:#8B7355;margin-top:1px}
        .lg-title{font-size:24px;font-weight:700;color:#2D2D2D;margin:0 0 6px}
        .lg-sub{font-size:14px;color:#8B7355;margin:0 0 28px}
        .lg-form{display:flex;flex-direction:column;gap:18px}
        .lg-field{display:flex;flex-direction:column;gap:7px}
        .lg-field label{font-size:13px;font-weight:500;color:#3F3F46}
        .lg-field-row{display:flex;align-items:center;justify-content:space-between}
        .lg-forgot{font-size:12px;color:#C6A969;text-decoration:none;font-weight:500}
        .lg-forgot:hover{color:#8B7355}
        .lg-field input{padding:11px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:14px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s,box-shadow 0.2s;width:100%;box-sizing:border-box}
        .lg-field input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .lg-pass-wrap{position:relative}
        .lg-pass-wrap input{padding-right:44px}
        .lg-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8B7355;display:flex;align-items:center;padding:0}
        .lg-eye:hover{color:#C6A969}
        .lg-error{font-size:13px;color:#9B4444;background:#FDF0F0;border:1px solid #F0D0D0;border-radius:9px;padding:11px 14px}
        .lg-pending{font-size:13px;color:#8B5E1E;background:#FDF6E3;border:1px solid #E8D5A3;border-radius:9px;padding:11px 14px}
        .lg-submit{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:11px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;margin-top:4px}
        .lg-submit:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .lg-submit:disabled{opacity:0.6;cursor:not-allowed}
        .lg-spinner{width:16px;height:16px;border:2px solid rgba(248,245,242,0.3);border-top-color:#F8F5F2;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .lg-register{text-align:center;font-size:13px;color:#8B7355;margin:24px 0 0}
        .lg-register a{color:#C6A969;font-weight:600;text-decoration:none}
        .lg-register a:hover{color:#2D2D2D}
        .lg-dev-hint{margin-top:20px;padding:12px;background:#F8F5F2;border:1px dashed #EFE7DE;border-radius:10px;font-size:11px;color:#8B7355;line-height:1.6}
        .lg-dev-hint strong{color:#2D2D2D}
      `}</style>
      <div className="lg-page">
        <div className="lg-card">
          <div className="lg-brand">
            <div className="lg-logo">N</div>
            <div>
              <div className="lg-brand-name">NexBill ERP</div>
              <div className="lg-brand-sub">Smart Billing & Inventory</div>
            </div>
          </div>
          <h2 className="lg-title">Welcome back</h2>
          <p className="lg-sub">Sign in to your NexBill account</p>

          <form onSubmit={handleSubmit} className="lg-form">
            <div className="lg-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
            </div>
            <div className="lg-field">
              <div className="lg-field-row">
                <label>Password</label>
                <Link to="/forgot-password" className="lg-forgot">Forgot password?</Link>
              </div>
              <div className="lg-pass-wrap">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" className="lg-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div className="lg-error">{error}</div>}
            {pending && <div className="lg-pending">⏳ {pending}</div>}
            <button type="submit" className="lg-submit" disabled={loading}>
              {loading ? <span className="lg-spinner" /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="lg-register">New cashier? <Link to="/register">Request access</Link></p>

          <div className="lg-dev-hint">
            <strong>Dev accounts:</strong><br />
            Admin → <strong>admin@nexbill.com</strong> / admin123<br />
            Cashier → <strong>cashier@nexbill.com</strong> / cashier123
          </div>
        </div>
      </div>
    </>
  );
}
