import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import { getProducts, getCategories } from '../services/public.service'

const AllProductsPage = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  
  // Obtener productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Obtener categorías
        const categoriesResponse = await getCategories()
        const categoriesData = categoriesResponse.data || categoriesResponse
        setCategories(categoriesData)
        
        // Obtener productos
        const productsResponse = await getProducts({ limit: 1000 })
        const productsData = productsResponse.data?.data || productsResponse.data || productsResponse
        
        // Filtrar solo productos activos y formatear
        const activeProducts = productsData.filter(product => product.status === 'ACTIVE')
        
        const formattedProducts = activeProducts.map(product => ({
          id: product.id,
          nombre: product.nameProduct,
          precio: `$${product.unitPrice.toLocaleString('es-CO')}`,
          price: product.unitPrice,
          descripcion: product.description || 'Sin descripción',
          imagen: product.imagen ? `https://7l77sjp2-3002.use2.devtunnels.ms${product.imagen}` : null,
          stock: product.stock,
          categoryId: product.categoryId,
          categoryName: product.Category?.category_name || 'Sin categoría'
        }))
        
        setAllProducts(formattedProducts)
        setProducts(formattedProducts)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error al cargar los productos. Por favor, intenta más tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Filtrar productos por búsqueda y categoría
  useEffect(() => {
    let filtered = [...allProducts]
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categoryId === parseInt(selectedCategory)
      )
    }
    
    setProducts(filtered)
    setCurrentPage(1) // Resetear a primera página cuando se filtra
  }, [searchTerm, selectedCategory, allProducts])
  
  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(products.length / productsPerPage)
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  
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
        <h1 className="mb-4">Todos los Productos</h1>
        
        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2 text-md-end">
            <span className="text-muted">
              {products.length} productos encontrados
            </span>
          </div>
        </div>
        
        {/* Productos */}
        {currentProducts.length === 0 ? (
          <div className="alert alert-info">
            No hay productos disponibles con los filtros seleccionados.
          </div>
        ) : (
          <>
            <div className="row">
              {currentProducts.map(producto => (
                <div key={producto.id} className="col-md-3 mb-4">
                  <div className="card h-100">
                    {/* Enlace en la imagen */}
                    <Link to={`/producto/${producto.id}`}>
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="card-img-top"
                          style={{ height: "180px", objectFit: "cover", cursor: "pointer" }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x180?text=Sin+Imagen'
                          }}
                        />
                      ) : (
                        <div 
                          className="card-img-top bg-light d-flex align-items-center justify-content-center"
                          style={{ height: "180px", cursor: "pointer" }}
                        >
                          <i className="fas fa-image fa-3x text-muted"></i>
                        </div>
                      )}
                    </Link>
                    <div className="card-body">
                      {/* Enlace en el título */}
                      <Link to={`/producto/${producto.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h5 className="card-title" style={{ fontSize: "1rem", minHeight: "48px", cursor: "pointer" }}>
                          {producto.nombre}
                        </h5>
                      </Link>
                      <p className="card-text small text-muted">{producto.categoryName}</p>
                      <p className="fw-bold text-primary fs-5 mb-2">{producto.precio}</p>
                      <p className="text-muted small mb-3">Stock: {producto.stock} unidades</p>
                      
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleAddToCart(producto)}
                        disabled={producto.stock === 0}
                        style={{ fontSize: "0.9rem" }}
                      >
                        {producto.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                      </button>
                      
                      {message === producto.id && (
                        <div className="alert alert-success mt-2 p-2 text-center small">
                          ¡Añadido!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage - 1)}
                    >
                      Anterior
                    </button>
                  </li>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    // Mostrar solo algunas páginas si hay muchas
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      )
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <li key={pageNumber} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )
                    }
                    return null
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage + 1)}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
        
        <Link to="/" className="btn btn-outline-secondary mt-3">
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default AllProductsPage