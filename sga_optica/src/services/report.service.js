import axiosInstance from './axiosConfig';

export const reportService = {
  // Reporte de notificaciones
  getNotificationsReport: (startDate, endDate) => 
    axiosInstance.get(`/reports/notifications?startDate=${startDate}&endDate=${endDate}`),
  
  // Reporte de citas - Usar el endpoint de appointments directamente
  getAppointmentsReport: (startDate, endDate) => 
    axiosInstance.get(`/appointment?startDate=${startDate}&endDate=${endDate}`),
  
  // Historial de recordatorios
  getRemindersHistory: (customerId, limit) => 
    axiosInstance.get(`/notification/customer/${customerId || ''}?limit=${limit || 100}`),
};