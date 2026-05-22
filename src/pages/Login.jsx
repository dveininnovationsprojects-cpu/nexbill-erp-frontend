import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const successMsg = location.state?.message;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setPending(false); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/cashier/dashboard');
    } catch (err) {
      if (err.isPending) setPending(true);
      else setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .login-page{display:flex;min-height:100vh;background:#F8F5F2;font-family:'Inter',system-ui,sans-serif}
        .login-left{flex:1;background:#2D2D2D;padding:56px 52px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
        .login-left::before{content:'';position:absolute;top:-120px;right:-120px;width:400px;height:400px;border-radius:50%;background:rgba(198,169,105,0.08);pointer-events:none}
        .login-left::after{content:'';position:absolute;bottom:-80px;left:-80px;width:300px;height:300px;border-radius:50%;background:rgba(198,169,105,0.05);pointer-events:none}
        .login-brand{display:flex;align-items:center;gap:12px;margin-bottom:56px}
        .login-logo{width:40px;height:40px;background:#C6A969;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#2D2D2D}
        .login-brand-name{font-size:20px;font-weight:600;color:#F8F5F2;letter-spacing:-0.3px}
        .login-tagline{font-size:38px;font-weight:700;color:#F8F5F2;line-height:1.2;letter-spacing:-0.8px;margin:0 0 16px}
        .login-sub{font-size:15px;color:#8B7355;margin:0 0 48px;line-height:1.6}
        .login-features{display:flex;flex-direction:column;gap:14px}
        .login-feature-item{display:flex;align-items:center;gap:12px;font-size:14px;color:#D6D3D1}
        .login-dot{width:6px;height:6px;border-radius:50%;background:#C6A969;flex-shrink:0}
        .login-right{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 32px;background:#F8F5F2}
        .login-card{width:100%;max-width:420px;background:#FFFFFF;border-radius:20px;padding:44px 40px;box-shadow:0 4px 24px rgba(45,45,45,0.08),0 1px 4px rgba(45,45,45,0.04);border:1px solid #EFE7DE}
        .login-card-header{margin-bottom:32px}
        .login-card-header h2{font-size:26px;font-weight:700;color:#2D2D2D;margin:0 0 6px;letter-spacing:-0.4px}
        .login-card-header p{font-size:14px;color:#8B7355;margin:0}
        .login-form{display:flex;flex-direction:column;gap:20px}
        .login-field{display:flex;flex-direction:column;gap:7px}
        .login-field label{font-size:13px;font-weight:500;color:#3F3F46}
        .login-field input{padding:11px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:14px;color:#2D2D2D;background:#F8F5F2;outline:none;transition:border-color 0.2s,box-shadow 0.2s;font-family:inherit;width:100%;box-sizing:border-box}
        .login-field input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12);background:#FFFFFF}
        .login-field input::placeholder{color:#D6D3D1}
        .login-label-row{display:flex;justify-content:space-between;align-items:center}
        .login-forgot{font-size:12px;color:#8B7355;text-decoration:none}
        .login-forgot:hover{color:#C6A969}
        .login-pass-wrap{position:relative}
        .login-pass-wrap input{padding-right:42px}
        .login-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8B7355;display:flex;align-items:center;padding:0}
        .login-eye:hover{color:#C6A969}
        .login-error{font-size:13px;color:#9B4444;background:#FDF0F0;border:1px solid #F0D0D0;border-radius:8px;padding:10px 14px}
        .login-submit{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.2s;font-family:inherit;margin-top:4px;width:100%}
        .login-submit:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .login-submit:disabled{opacity:0.6;cursor:not-allowed}
        .login-spinner{width:16px;height:16px;border:2px solid rgba(248,245,242,0.3);border-top-color:#F8F5F2;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .login-register-note{text-align:center;font-size:13px;color:#8B7355;margin:24px 0 0}
        .login-register-link{color:#C6A969;font-weight:600;text-decoration:none}
        .login-register-link:hover{color:#2D2D2D}
        .login-success-banner{display:flex;align-items:center;gap:8px;font-size:13px;color:#5A7A5A;background:#F0F7F0;border:1px solid #C8DFC8;border-radius:10px;padding:12px 14px;margin-bottom:4px}
        .login-pending-banner{display:flex;align-items:flex-start;gap:10px;background:#FDF8EE;border:1px solid #E8D9A8;border-radius:10px;padding:14px;margin-bottom:4px;color:#7A6030}
        .login-pending-banner strong{display:block;font-size:13px;font-weight:600;margin-bottom:3px}
        .login-pending-banner p{font-size:12px;margin:0;color:#9A8050;line-height:1.5}
      `}</style>

      <div className="login-page">
        <div className="login-left">
          <div className="login-brand">
            <div className="login-logo">N</div>
            <span className="login-brand-name">NexBill ERP</span>
          </div>
          <h1 className="login-tagline">Smart Billing &<br />Inventory Management</h1>
          <p className="login-sub">Streamline your retail operations with precision and elegance.</p>
          <div className="login-features">
            {['Real-time Inventory Tracking','GST-Ready Billing Engine','Multi-Counter Management','Advanced Analytics'].map(f => (
              <div key={f} className="login-feature-item">
                <span className="login-dot" />{f}
              </div>
            ))}
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to your NexBill account</p>
            </div>

            {successMsg && (
              <div className="login-success-banner"><CheckCircle size={15} /><span>{successMsg}</span></div>
            )}
            {pending && (
              <div className="login-pending-banner">
                <Clock size={15} />
                <div><strong>Awaiting Admin Approval</strong><p>Your account is under review. You'll be notified once approved.</p></div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required autoComplete="email" />
              </div>
              <div className="login-field">
                <div className="login-label-row">
                  <label>Password</label>
                  <Link to="/forgot-password" className="login-forgot">Forgot password?</Link>
                </div>
                <div className="login-pass-wrap">
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required autoComplete="current-password" />
                  <button type="button" className="login-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? <span className="login-spinner" /> : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>

            <p className="login-register-note">
              New cashier? <Link to="/register" className="login-register-link">Request access</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
