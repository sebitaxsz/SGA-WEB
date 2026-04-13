import axiosInstance from './axiosConfig';

export const notificationService = {
  // Obtener notificaciones de un cliente
  getNotifications: (customerId, params) => 
    axiosInstance.get(`/notification/customer/${customerId}`, { params }),
  
  // Obtener todas las notificaciones (admin)
  getAllNotifications: (params) => axiosInstance.get('/notification', { params }),
  
  // Marcar como leída
  markAsRead: (notificationId) => axiosInstance.patch(`/notification/${notificationId}/read`),
  
  // Marcar como enviada
  markAsSent: (notificationId) => axiosInstance.patch(`/notification/${notificationId}/sent`),
  
  // Crear notificación manual
  createNotification: (data) => axiosInstance.post('/notification', data),
  
  // Actualizar notificación
  updateNotification: (id, data) => axiosInstance.put(`/notification/${id}`, data),
  
  // Eliminar notificación (soft delete)
  deleteNotification: (id) => axiosInstance.delete(`/notification/${id}`),
  
  // Eliminar permanentemente
  permanentDeleteNotification: (id) => axiosInstance.delete(`/notification/${id}/permanent`),
};