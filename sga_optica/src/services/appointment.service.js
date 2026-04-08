// appointment.service.js
import axiosInstance from './axiosConfig';

export const appointmentService = {
  // Obtener todas las citas
  getAllAppointments: () => axiosInstance.get('/appointment'),
  
  // Obtener cita por ID
  getAppointmentById: (id) => axiosInstance.get(`/appointment/${id}`),
  
  // Obtener citas de un cliente específico
  getAppointmentsByCustomer: (customerId) => axiosInstance.get(`/appointment/customer/${customerId}`),
  
  // Crear nueva cita
  createAppointment: (appointmentData) => axiosInstance.post('/appointment', appointmentData),
  
  // Cancelar cita
  cancelAppointment: (id) => axiosInstance.delete(`/appointment/${id}`),
  
  // Obtener tipos de examen
  getExamTypes: () => axiosInstance.get('/examType'),
  
  // Obtener optometristas
  getOptometrists: () => axiosInstance.get('/optometrist'),
};