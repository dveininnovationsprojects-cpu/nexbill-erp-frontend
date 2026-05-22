import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ShieldCheck, User } from 'lucide-react';
import axios from 'axios';
import styles from '../css/Register.module.css';

export default function Register() {
  const [role, setRole] = useState('CASHIER');
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecretKey: '' });
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchRole = (r) => {
    setRole(r);
    setError('');
    setSuccess('');
    setForm({ name: '', email: '', password: '', adminSecretKey: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'ADMIN') payload.adminSecretKey = form.adminSecretKey;
      const res = await axios.post('/api/auth/register', payload);
      setSuccess(res.data?.message || (role === 'CASHIER'
        ? 'Registration submitted! Await admin approval.'
        : 'Admin account created successfully!'));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'ADMIN';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>N</div>
          <span>NexBill ERP</span>
        </div>

        {/* Role Toggle */}
        <div className={styles.roleToggle}>
          <button
            type="button"
            className={`${styles.roleBtn} ${!isAdmin ? styles.roleActive : ''}`}
            onClick={() => switchRole('CASHIER')}
          >
            <User size={14} /> Cashier
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${isAdmin ? styles.roleActive : ''}`}
            onClick={() => switchRole('ADMIN')}
          >
            <ShieldCheck size={14} /> Admin
          </button>
        </div>

        <h2>{isAdmin ? 'Create Admin Account' : 'Request Cashier Access'}</h2>
        <p className={styles.sub}>
          {isAdmin
            ? 'Enter the admin secret key to register.'
            : 'Submit your details for admin approval.'}
        </p>

        {success && (
          <div className={styles.success}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
          </div>
          <div className={styles.field}>
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.passWrapper}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength={6}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className={styles.field}>
              <label>Admin Secret Key</label>
              <div className={styles.passWrapper}>
                <input
                  type={showKey ? 'text' : 'password'}
                  name="adminSecretKey"
                  value={form.adminSecretKey}
                  onChange={handleChange}
                  placeholder="Enter secret key"
                  required
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading || !!success}>
            {loading ? <span className={styles.spinner} /> : (isAdmin ? 'Create Admin Account' : 'Submit Request')}
          </button>
        </form>

        <p className={styles.loginNote}>
          Already have access? <Link to="/login" className={styles.loginLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
