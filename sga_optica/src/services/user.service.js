import axiosInstance from './axiosConfig';

export const userService = {
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (data) => axiosInstance.put('/user/profile', data),
  getCustomers: () => axiosInstance.get('/customer'),
  getCustomerById: (id) => axiosInstance.get(`/customer/${id}`),
  
  // Nuevo: Obtener perfil de optometrista
  getOptometristProfile: () => axiosInstance.get('/optometrist/profile'),
  
  // Nuevo: Obtener todos los optometristas (para admin)
  getAllOptometrists: () => axiosInstance.get('/optometrist'),
  
  // Nuevo: Obtener optometrista por ID
  getOptometristById: (id) => axiosInstance.get(`/optometrist/${id}`),
  
  // Nuevo: Actualizar perfil de optometrista
  updateOptometristProfile: (data) => axiosInstance.put('/optometrist/profile', data)
};