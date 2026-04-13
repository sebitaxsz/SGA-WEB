import axiosInstance from './axiosConfig';

export const authService = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  requestPasswordReset: (email) => axiosInstance.post('/password/request-reset', { correo: email }),
  verifyResetCode: (email, code) => axiosInstance.post('/password/verify-code', { correo: email, code }),
  resetPassword: (email, code, newPassword, confirmPassword) => 
    axiosInstance.post('/password/reset', { 
      correo: email, 
      code, 
      nueva_contrasena: newPassword, 
      confirmar_contrasena: confirmPassword 
    }),
};