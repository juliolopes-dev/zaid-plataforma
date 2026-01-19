import axios from 'axios';

// Usa proxy reverso do Next.js (/api -> localhost:3001/api)
// Isso funciona tanto no servidor quanto no browser
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('zaid-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zaid-token');
        localStorage.removeItem('zaid-usuario');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
