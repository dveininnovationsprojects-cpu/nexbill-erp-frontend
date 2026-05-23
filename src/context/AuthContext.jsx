import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexbill_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Must have both token AND role — else clear and force re-login
      if (!parsed?.token || !parsed?.role) {
        localStorage.removeItem('nexbill_user');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('nexbill_user');
      return null;
    }
  });

  const login = async (email, password) => {
    // ── DEV BYPASS (remove before production) ──────────────────────────
    const DEV_ACCOUNTS = {
      'admin@nexbill.com':   { password: 'admin123',   role: 'ADMIN' },
      'cashier@nexbill.com': { password: 'cashier123', role: 'CASHIER' },
    };
    if (DEV_ACCOUNTS[email] && DEV_ACCOUNTS[email].password === password) {
      const userData = { email, token: 'dev-token', role: DEV_ACCOUNTS[email].role };
      setUser(userData);
      localStorage.setItem('nexbill_user', JSON.stringify(userData));
      return userData;
    }
    // ── END DEV BYPASS ─────────────────────────────────────────────────

    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    if (!res.data.token) {
      throw { isPending: true, message: res.data.message || 'Your account is awaiting admin approval.' };
    }
    // Backend doesn't return role & JWT has no role claim
    // Probe admin-only endpoint to determine role
    let role = 'CASHIER';
    try {
      await axios.get('/api/admin/pending-cashiers', {
        headers: { Authorization: `Bearer ${res.data.token}` },
        withCredentials: true,
      });
      role = 'ADMIN';
    } catch {
      role = 'CASHIER';
    }
    const userData = { email, token: res.data.token, role };
    setUser(userData);
    localStorage.setItem('nexbill_user', JSON.stringify(userData));
    return { ...res.data, role };
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
    localStorage.removeItem('nexbill_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
