import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await axios.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .fp-page{min-height:100vh;background:#F8F5F2;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;padding:24px}
        .fp-card{width:100%;max-width:400px;background:#FFFFFF;border-radius:20px;padding:44px 40px;box-shadow:0 4px 24px rgba(45,45,45,0.08);border:1px solid #EFE7DE;text-align:center}
        .fp-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#8B7355;text-decoration:none;margin-bottom:28px}
        .fp-back:hover{color:#C6A969}
        .fp-icon{width:56px;height:56px;background:#EFE7DE;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:#8B7355}
        .fp-card h2{font-size:22px;font-weight:700;color:#2D2D2D;margin:0 0 8px}
        .fp-sub{font-size:14px;color:#8B7355;margin:0 0 28px}
        .fp-form{display:flex;flex-direction:column;gap:14px}
        .fp-form input{padding:11px 14px;border:1.5px solid #EFE7DE;border-radius:10px;font-size:14px;color:#2D2D2D;background:#F8F5F2;outline:none;font-family:inherit;transition:border-color 0.2s;width:100%;box-sizing:border-box}
        .fp-form input:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .fp-form button{padding:12px;background:#2D2D2D;color:#F8F5F2;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;display:flex;align-items:center;justify-content:center}
        .fp-form button:hover:not(:disabled){background:#C6A969;color:#2D2D2D}
        .fp-form button:disabled{opacity:0.6;cursor:not-allowed}
        .fp-error{font-size:13px;color:#9B4444;background:#FDF0F0;border:1px solid #F0D0D0;border-radius:8px;padding:10px 14px;text-align:left}
        .fp-success{font-size:14px;color:#5A7A5A;background:#F0F7F0;border:1px solid #C8DFC8;border-radius:10px;padding:16px;line-height:1.5}
        .fp-spinner{width:16px;height:16px;border:2px solid rgba(248,245,242,0.3);border-top-color:#F8F5F2;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div className="fp-page">
        <div className="fp-card">
          <Link to="/login" className="fp-back"><ArrowLeft size={16} /> Back to Sign In</Link>
          <div className="fp-icon"><Mail size={28} /></div>
          <h2>Reset your password</h2>
          <p className="fp-sub">Enter your email and we'll send you a reset link.</p>
          {sent ? (
            <div className="fp-success">✓ Reset link sent! Check your inbox at <strong>{email}</strong></div>
          ) : (
            <form onSubmit={handleSubmit} className="fp-form">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              {error && <div className="fp-error">{error}</div>}
              <button type="submit" disabled={loading}>{loading ? <span className="fp-spinner" /> : 'Send Reset Link'}</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
