import axios from 'axios';

const api = axios.create({ baseURL: '/' });

api.interceptors.request.use(config => {
  try {
    const stored = localStorage.getItem('nexbill_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;
