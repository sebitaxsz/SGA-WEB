import axiosInstance from './axiosConfig';

export const reportService = {
  getNotificationsReport: (startDate, endDate) => 
    axiosInstance.get('/reports/notifications', { params: { startDate, endDate } }),
  getAppointmentsReport: (startDate, endDate) => 
    axiosInstance.get('/reports/appointments/status', { params: { startDate, endDate } }),
  getRemindersHistory: (customerId, limit = 50) => 
    axiosInstance.get('/reports/reminders', { params: { customerId, limit } }),
};