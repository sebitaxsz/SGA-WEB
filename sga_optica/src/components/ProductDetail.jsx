import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from './carrito/CartContext';
import axiosInstance from '../services/axiosConfig';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // Función para construir URL de imagen (igual que en AllProductsPage)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `https://7l77sjp2-3002.use2.devtunnels.ms${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('No se pudo cargar el producto. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.nameProduct,
      price: product.unitPrice,
      displayPrice: `$${product.unitPrice.toLocaleString('es-CO')}`,
      descripcion: product.description,
      imagen: getImageUrl(product.imagen),
      stock: product.stock,
    });
    alert('Producto agregado al carrito');
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mt-5 pt-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ← Volver a productos
      </button>
      <div className="row">
        <div className="col-md-6">
          <img
            src={getImageUrl(product.imagen)}
            alt={product.nameProduct}
            className="img-fluid rounded shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/500?text=Sin+imagen';
            }}
          />
        </div>
        <div className="col-md-6">
          <h1 className="display-5 fw-bold">{product.nameProduct}</h1>
          <p className="text-muted">
            <strong>Categoría:</strong> {product.Category?.category_name || 'Sin categoría'}
          </p>
          <p className="lead">{product.description}</p>
          <h2 className="text-primary">${product.unitPrice.toLocaleString()}</h2>
          <p className={product.stock > 0 ? 'text-success' : 'text-danger'}>
            <strong>Stock disponible:</strong> {product.stock} unidades
          </p>
          <button
            className="btn btn-primary btn-lg w-100 mt-3"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <i className="fas fa-cart-plus me-2"></i>
            {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;