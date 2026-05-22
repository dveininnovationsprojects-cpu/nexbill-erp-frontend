import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/login" className={styles.back}><ArrowLeft size={16} /> Back to Sign In</Link>

        <div className={styles.iconWrap}><Mail size={28} /></div>
        <h2>Reset your password</h2>
        <p className={styles.sub}>Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className={styles.success}>
            ✓ Reset link sent! Check your inbox at <strong>{email}</strong>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
