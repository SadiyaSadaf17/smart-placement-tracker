import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('profile');
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.dispatchEvent(new Event('auth:logout'));
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
