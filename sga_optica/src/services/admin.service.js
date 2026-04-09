import axiosInstance from './axiosConfig';

const BASE = '';

// ── USUARIOS ─────────────────────────────────────────────────────────────────
export const getUsers        = ()         => axiosInstance.get(`${BASE}/user`);
export const getUserById     = (id)       => axiosInstance.get(`${BASE}/user/${id}`);
export const createUser      = (data)     => axiosInstance.post(`${BASE}/user/register`, data);
export const updateUser      = (id, data) => axiosInstance.put(`${BASE}/user/${id}`, data);
export const deleteUser      = (id)       => axiosInstance.delete(`${BASE}/user/${id}`);

// ── CLIENTES ──────────────────────────────────────────────────────────────────
export const getCustomers    = ()         => axiosInstance.get(`${BASE}/customer`);
export const getCustomerById = (id)       => axiosInstance.get(`${BASE}/customer/${id}`);
export const createCustomer  = (data)     => axiosInstance.post(`${BASE}/customer`, data);
export const updateCustomer  = (id, data) => axiosInstance.put(`${BASE}/customer/${id}`, data);
export const deleteCustomer  = (id)       => axiosInstance.delete(`${BASE}/customer/${id}`);

// ── PRODUCTOS ─────────────────────────────────────────────────────────────────
export const getProducts     = (params)   => axiosInstance.get(`${BASE}/products`, { params });
export const getProductById  = (id)       => axiosInstance.get(`${BASE}/products/${id}`);
export const createProduct   = (formData) => axiosInstance.post(`${BASE}/products`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct   = (id, fd)   => axiosInstance.put(`${BASE}/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct   = (id)       => axiosInstance.delete(`${BASE}/products/${id}`);
export const restoreProduct  = (id)       => axiosInstance.patch(`${BASE}/products/${id}/restore`);
export const updateStock     = (id, data) => axiosInstance.patch(`${BASE}/products/${id}/stock`, data);

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
export const getCategories   = ()         => axiosInstance.get(`${BASE}/category`);
export const createCategory  = (data)     => axiosInstance.post(`${BASE}/category`, data);
export const updateCategory  = (id, data) => axiosInstance.put(`${BASE}/category/${id}`, data);
export const deleteCategory  = (id)       => axiosInstance.delete(`${BASE}/category/${id}`);

// ── OPTÓMETRAS ────────────────────────────────────────────────────────────────
export const getOptometrists   = ()         => axiosInstance.get(`${BASE}/optometrist`);
export const getOptometristById = (id)      => axiosInstance.get(`${BASE}/optometrist/${id}`);
export const createOptometrist = (data)     => axiosInstance.post(`${BASE}/optometrist`, data);
export const updateOptometrist = (id, data) => axiosInstance.put(`${BASE}/optometrist/${id}`, data);
export const deleteOptometrist = (id)       => axiosInstance.delete(`${BASE}/optometrist/${id}`);
// ── ROLES ─────────────────────────────────────────────────────────────────────
export const getRoles    = ()         => axiosInstance.get(`${BASE}/roles`);
export const createRole  = (data)     => axiosInstance.post(`${BASE}/roles`, data);
export const updateRole  = (id, data) => axiosInstance.put(`${BASE}/roles/${id}`, data);
export const deleteRole  = (id)       => axiosInstance.delete(`${BASE}/roles/${id}`);

// ── TIPOS DE DOCUMENTO ────────────────────────────────────────────────────────
export const getDocumentTypes   = ()         => axiosInstance.get(`${BASE}/documentType`);
export const createDocumentType = (data)     => axiosInstance.post(`${BASE}/documentType`, data);
export const updateDocumentType = (id, data) => axiosInstance.put(`${BASE}/documentType/${id}`, data);
export const deleteDocumentType = (id)       => axiosInstance.delete(`${BASE}/documentType/${id}`);

// ── TIPOS DE EXAMEN ───────────────────────────────────────────────────────────
export const getExamTypes   = ()         => axiosInstance.get(`${BASE}/examType`);
export const createExamType = (data)     => axiosInstance.post(`${BASE}/examType`, data);
export const updateExamType = (id, data) => axiosInstance.put(`${BASE}/examType/${id}`, data);
export const deleteExamType = (id)       => axiosInstance.delete(`${BASE}/examType/${id}`);

// ── TIPOS DE PAGO ─────────────────────────────────────────────────────────────
export const getPaymentTypes   = ()         => axiosInstance.get(`${BASE}/paymentType`);
export const createPaymentType = (data)     => axiosInstance.post(`${BASE}/paymentType`, data);
export const updatePaymentType = (id, data) => axiosInstance.put(`${BASE}/paymentType/${id}`, data);
export const deletePaymentType = (id)       => axiosInstance.delete(`${BASE}/paymentType/${id}`);

// ── VENTAS ────────────────────────────────────────────────────────────────────
export const getSales    = ()         => axiosInstance.get(`${BASE}/sales`);
export const getSaleById = (id)       => axiosInstance.get(`${BASE}/sales/${id}`);
export const createSale  = (data)     => axiosInstance.post(`${BASE}/sales`, data);
export const deleteSale  = (id)       => axiosInstance.delete(`${BASE}/sales/${id}`);

// ── CITAS ─────────────────────────────────────────────────────────────────────
export const getAppointments   = ()         => axiosInstance.get(`${BASE}/appointment`);
export const getAppointmentById= (id)       => axiosInstance.get(`${BASE}/appointment/${id}`);
export const createAppointment = (data)     => axiosInstance.post(`${BASE}/appointment`, data);
export const updateAppointment = (id, data) => axiosInstance.put(`${BASE}/appointment/${id}`, data);
export const cancelAppointment = (id)       => axiosInstance.patch(`${BASE}/appointment/${id}/cancel`);
export const deleteAppointment = (id)       => axiosInstance.delete(`${BASE}/appointment/${id}`);

// ── NOTIFICACIONES ────────────────────────────────────────────────────────────
export const getNotifications     = ()         => axiosInstance.get(`${BASE}/notification?limit=20`);
export const createNotification   = (data)     => axiosInstance.post(`${BASE}/notification`, data);
export const updateNotification   = (id, data) => axiosInstance.put(`${BASE}/notification/${id}`, data);
export const markNotifRead        = (id)       => axiosInstance.patch(`${BASE}/notification/${id}/read`);
export const deleteNotification   = (id)       => axiosInstance.delete(`${BASE}/notification/${id}`);
export const permDeleteNotif      = (id)       => axiosInstance.delete(`${BASE}/notification/${id}/permanent`);

// ── FÓRMULAS ──────────────────────────────────────────────────────────────────
export const getFormulas   = ()   => axiosInstance.get(`${BASE}/formulas`);
export const deleteFormula = (id) => axiosInstance.delete(`${BASE}/formulas/${id}`);

// ── REPORTES ──────────────────────────────────────────────────────────────────
export const getSalesReport     = (p) => axiosInstance.get(`${BASE}/reports/sales`, { params: p });
export const getApptsReport     = (p) => axiosInstance.get(`${BASE}/reports/appointment`, { params: p });
export const getTopProducts     = (p) => axiosInstance.get(`${BASE}/reports/top-products`, { params: p });
