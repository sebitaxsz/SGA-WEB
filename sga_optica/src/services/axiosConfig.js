import axios from 'axios';

const API_BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms/api/v1';

const axiosInstance = axios.create({  
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;  