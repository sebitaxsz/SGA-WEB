import axiosInstance from './axiosConfig';

// ==================== PRODUCTOS ====================
export const getProducts = (params = {}) => {
  return axiosInstance.get('/products', { params });
};

export const getProductById = (id) => {
  return axiosInstance.get(`/products/${id}`);
};

// ==================== CATEGORÍAS ====================
export const getCategories = () => {
  return axiosInstance.get('/category');
};

// ==================== TIPOS DE PAGO ====================
export const getPaymentTypes = () => {
  return axiosInstance.get('/paymentType');
};

// ==================== VENTA PÚBLICA ====================
export const createPublicSale = (saleData) => {
  return axiosInstance.post('/public/sales', saleData);
};