import axiosInstance from './axiosConfig';

export const userService = {
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (data) => axiosInstance.put('/user/profile', data),
  getCustomers: () => axiosInstance.get('/customer'),
  getCustomerById: (id) => axiosInstance.get(`/customer/${id}`),
};