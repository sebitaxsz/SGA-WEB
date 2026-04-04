import axiosInstance from './axiosConfig';

export const authService = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  requestPasswordReset: (email) => axiosInstance.post('/auth/request-password-reset', { correo: email }),
  verifyResetCode: (email, code) => axiosInstance.post('/auth/verify-reset-code', { correo: email, code }),
  resetPassword: (email, code, newPassword, confirmPassword) => 
    axiosInstance.post('/auth/reset-password', { 
      correo: email, 
      code, 
      nueva_contrasena: newPassword, 
      confirmar_contrasena: confirmPassword 
    }),
};