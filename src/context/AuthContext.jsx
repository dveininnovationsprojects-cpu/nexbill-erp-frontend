import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexbill_user');
      if (!stored) return null;

      const parsed = JSON.parse(stored);

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
    const res = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );

    if (!res.data.token) {
      throw {
        isPending: true,
        message: res.data.message
      };
    }

    const userData = {
      email,
      token: res.data.token,
      role: res.data.role
    };

    setUser(userData);
    localStorage.setItem('nexbill_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexbill_user');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);