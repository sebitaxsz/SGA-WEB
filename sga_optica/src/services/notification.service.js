import axiosInstance from './axiosConfig';

export const notificationService = {
  getNotifications: (customerId, params) => 
    axiosInstance.get(`/notification/customer/${customerId}`, { params }),
  getAllNotifications: (params) => axiosInstance.get('/notification', { params }),
  markAsRead: (notificationId) => axiosInstance.put(`/notification/${notificationId}/read`),
  markAsSent: (notificationId) => axiosInstance.put(`/notification/${notificationId}/sent`),
  createReminder: (data) => axiosInstance.post('/notification/reminder', data),
  sendDailyReminders: () => axiosInstance.post('/notification/send-daily-reminders'),
};