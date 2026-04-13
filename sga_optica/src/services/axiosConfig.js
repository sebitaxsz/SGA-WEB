// src/services/axiosConfig.js
import axios from 'axios';

const API_BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms/api/v1';

// Rutas que NO deben enviar token
const PUBLIC_ROUTES = [
  '/request-password-reset',
  '/verify-reset-code', 
  '/reset-password',
  '/auth/login',
  '/auth/register'
];

const axiosInstance = axios.create({  
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Verificar si la ruta es pública
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;