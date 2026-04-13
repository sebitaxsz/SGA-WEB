// appointment.service.js
import axiosInstance from './axiosConfig';

export const appointmentService = {
  // Obtener todas las citas (admin/optometrist)
  getAllAppointments: () => axiosInstance.get('/appointment'),
  
  // Obtener cita por ID
  getAppointmentById: (id) => axiosInstance.get(`/appointment/${id}`),
  
  // Obtener citas de un cliente específico
  getAppointmentsByCustomer: (customerId) => 
    axiosInstance.get(`/appointment/customer/${customerId}`),
  
  // Obtener citas de un optometrista específico
  getAppointmentsByOptometrist: (optometristId) => 
    axiosInstance.get(`/appointment/optometrist/${optometristId}`),
  
  // Crear nueva cita
  createAppointment: (appointmentData) => axiosInstance.post('/appointment', appointmentData),
  
  // Cancelar cita (soft delete)
  cancelAppointment: (id) => axiosInstance.patch(`/appointment/${id}/cancel`),
  
  // 🔧 ACTUALIZAR CITA (para cambiar estado: confirmada, completada)
  updateAppointment: (id, data) => axiosInstance.put(`/appointment/${id}`, data),
  
  // Eliminar cita permanentemente (solo admin)
  deleteAppointment: (id) => axiosInstance.delete(`/appointment/${id}`),
  
  // Obtener tipos de examen
  getExamTypes: () => axiosInstance.get('/examType'),
  
  // Obtener optometristas
  getOptometrists: () => axiosInstance.get('/optometrist'),
};