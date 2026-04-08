import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import { getProducts, getCategories } from '../services/public.service'

const ProductosPage = () => {
  const { category } = useParams()
  const { addToCart } = useCart()
  const [message, setMessage] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mapeo de URLs amigables a category_id
  const categoryMapping = {
    'gafas-sol': 1,
    'gafas-formuladas': 2,
    'lentes-contacto': 3,
    'gafas-deportivas': 4
  }

  const categoryNames = {
    'gafas-sol': 'Gafas de Sol',
    'gafas-formuladas': 'Gafas Formuladas',
    'lentes-contacto': 'Lentes de Contacto',
    'gafas-deportivas': 'Gafas Deportivas'
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const categoryId = categoryMapping[category]
        
        if (!categoryId) {
          setProducts([])
          setLoading(false)
          return
        }
        
        // Obtener todos los productos y filtrar por categoría
        const response = await getProducts({ limit: 100 })
        const allProducts = response.data?.data || response.data || []
        
        const filteredProducts = allProducts.filter(
          product => product.categoryId === categoryId && product.status === 'ACTIVE'
        )
        
        // Transformar al formato que espera el carrito
        const formattedProducts = filteredProducts.map(product => ({
          id: product.id,
          nombre: product.nameProduct,
          precio: `$${product.unitPrice.toLocaleString('es-CO')}`,
          price: product.unitPrice,
          descripcion: product.description,
          imagen: product.imagen ? `https://7l77sjp2-3002.use2.devtunnels.ms${product.imagen}` : null,
          stock: product.stock
        }))
        
        setProducts(formattedProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Error al cargar los productos. Por favor, intenta más tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [category])

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.nombre,
      price: product.price,
      displayPrice: product.precio,
      descripcion: product.descripcion,
      imagen: product.imagen,
      stock: product.stock
    })
    
    setMessage(product.id)
    setTimeout(() => setMessage(null), 2000)
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '120px' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '120px' }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/" className="btn btn-outline-secondary mt-3">
          Volver al Inicio
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="container" style={{ marginTop: '120px' }}>
        <h1 className="mb-4">{categoryNames[category] || 'Productos'}</h1>

        {products.length === 0 ? (
          <div className="alert alert-info">
            No hay productos disponibles en esta categoría.
          </div>
        ) : (
          <div className="row">
            {products.map(producto => (
              <div key={producto.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen'
                      }}
                    />
                  ) : (
                    <div 
                      className="card-img-top bg-light d-flex align-items-center justify-content-center"
                      style={{ height: "200px" }}
                    >
                      <i className="fas fa-image fa-3x text-muted"></i>
                    </div>
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{producto.nombre}</h5>
                    <p className="card-text">{producto.descripcion}</p>
                    <p className="fw-bold text-primary">{producto.precio}</p>
                    <p className="text-muted small">Stock: {producto.stock} unidades</p>
                    
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleAddToCart(producto)}
                      disabled={producto.stock === 0}
                    >
                      {producto.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                    </button>
                    
                    {message === producto.id && (
                      <div className="alert alert-success mt-2 p-2 text-center">
                        ¡Producto añadido al carrito!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link to="/" className="btn btn-outline-secondary mt-3">
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default ProductosPage