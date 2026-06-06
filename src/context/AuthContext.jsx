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
    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    if (!res.data.token) {
      if (res.data.pending) {
        throw { isPending: true, message: res.data.message };
      }
      throw { response: { data: { message: res.data.message || 'Invalid credentials. Please try again.' } } };
    }
    // Use role returned directly from login response, fallback to probing
    let role = res.data.role || 'CASHIER';
    if (!res.data.role) {
      try {
        await axios.get('/api/admin/active-cashiers', {
          headers: { Authorization: `Bearer ${res.data.token}` },
          withCredentials: true,
        });
        role = 'ADMIN';
      } catch {
        role = 'CASHIER';
      }
    }
    const userData = { 
      email, 
      token: res.data.token, 
      role,
      username: res.data.username || res.data.name || email.split('@')[0],
      name: res.data.name || res.data.username || email.split('@')[0],
      counter: res.data.counter || res.data.counterNumber || 'Counter 1',
      shift: res.data.shift || res.data.shiftTiming || '9:00 AM – 5:00 PM',
      shiftTiming: res.data.shiftTiming || res.data.shift || '9:00 AM – 5:00 PM',
      branch: res.data.branch || 'Main Branch',
      phone: res.data.phone || res.data.mobile,
    };
    setUser(userData);
    localStorage.setItem('nexbill_user', JSON.stringify(userData));
    return { ...res.data, role };
  };

  const logout = async () => {
    try { await axios.post('/api/auth/logout', {}, { withCredentials: true }); } catch {}
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