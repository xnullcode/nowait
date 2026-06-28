import axios from 'axios';

// CONFIGURATION REQUIRED FOR ONLINE HOSTING:
// Using a relative URL ('') because Nginx is configured to proxy /api requests to the backend.
const BACKEND_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cafe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
