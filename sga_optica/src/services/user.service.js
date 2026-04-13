// user.service.js
import axiosInstance from './axiosConfig';

export const userService = {
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (data) => axiosInstance.put('/user/profile', data),
  
  // Obtener todos los clientes (para buscar customer_id por idUser)
  getCustomers: () => axiosInstance.get('/customer'),
  
  // Obtener cliente por ID numérico
  getCustomerById: (id) => axiosInstance.get(`/customer/${id}`),
  
  // Obtener todos los optometristas
  getAllOptometrists: () => axiosInstance.get('/optometrist'),
  
  // Obtener optometrista por ID
  getOptometristById: (id) => axiosInstance.get(`/optometrist/${id}`),
  
  // Obtener perfil de optometrista
  getOptometristProfile: () => axiosInstance.get('/optometrist/profile'),
  
  // Actualizar perfil de optometrista
  updateOptometristProfile: (data) => axiosInstance.put('/optometrist/profile', data)
};