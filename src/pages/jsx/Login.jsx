import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../css/Login.module.css';

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
    setError('');
    setPending(false);
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/cashier/dashboard');
    } catch (err) {
      if (err.isPending) setPending(true);
      else setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.logo}>N</div>
          <span className={styles.brandName}>NexBill ERP</span>
        </div>
        <h1 className={styles.tagline}>Smart Billing &amp;<br />Inventory Management</h1>
        <p className={styles.sub}>Streamline your retail operations with precision and elegance.</p>
        <div className={styles.features}>
          {['Real-time Inventory Tracking', 'GST-Ready Billing Engine', 'Multi-Counter Management', 'Advanced Analytics'].map(f => (
            <div key={f} className={styles.featureItem}>
              <span className={styles.dot} />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Welcome back</h2>
            <p>Sign in to your NexBill account</p>
          </div>

          {successMsg && (
            <div className={styles.successBanner}>
              <CheckCircle size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {pending && (
            <div className={styles.pendingBanner}>
              <Clock size={15} />
              <div>
                <strong>Awaiting Admin Approval</strong>
                <p>Your account is under review. You'll be notified once approved.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div className={styles.passWrapper}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          <p className={styles.registerNote}>
            New cashier? <Link to="/register" className={styles.registerLink}>Request access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
