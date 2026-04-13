import axiosInstance from './axiosConfig';

export const formulaService = {
  // Cliente: sube su propia fórmula visual
  uploadMyFormula: (formData) =>
    axiosInstance.post('/formulas/my', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Cliente: obtiene sus propias fórmulas
  getMyFormulas: () => axiosInstance.get('/formulas/my'),

  // Optometrista/Admin: todas las fórmulas con info de clientes y citas
  getFormulasWithCustomerInfo: () => axiosInstance.get('/formulas/with-customers'),

  // Admin/Optometrista: todas las fórmulas
  getAllFormulas: () => axiosInstance.get('/formulas'),

  // Fórmulas de un cliente por ID
  getFormulasByCustomer: (customerId) => axiosInstance.get(`/formulas/customer/${customerId}`),

  // Fórmula por ID
  getFormulaById: (id) => axiosInstance.get(`/formulas/${id}`),

  // Eliminar fórmula (admin)
  deleteFormula: (id) => axiosInstance.delete(`/formulas/${id}`)
};
