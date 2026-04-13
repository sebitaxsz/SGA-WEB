// App.jsx
import React, { useEffect, useState, useCallback } from 'react'
import './App.css'
import { Link } from 'react-router-dom'
import { useCart } from './components/carrito/CartContext';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null)
  
  const carouselImages = [
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80",
    "https://images.unsplash.com/photo-1615468822882-4828d2602857?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80",
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }, [carouselImages.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <div className="App">
      {/* Banner de envío gratis */}
      <div className="container-fluid bg-primary text-white text-center py-2 banner-envio">
        <i className="fas fa-shipping-fast me-2"></i> 
        Envíos gratis por compras superiores a $300.000
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main>
        {/* SECCIÓN 1: CARRUSEL */}
        <section className="container-fluid p-0 mt-3">
          <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#mainCarousel"
                  data-bs-slide-to={index}
                  className={index === currentSlide ? 'active' : ''}
                  aria-current={index === currentSlide ? 'true' : 'false'}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
            
            <div className="carousel-inner">
              {carouselImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
                >
                  <img 
                    src={image} 
                    className="d-block w-100" 
                    alt={`Gafas ópticas ${index + 1}`}
                    style={{ height: '500px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/1200x500/007bff/ffffff?text=Gafas+${index + 1}`
                    }}
                  />
                  <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-4 rounded">
                    <h2 className="display-5 fw-bold">S.G.A ÓPTICA</h2>
                    <p className="fs-4">Tu visión, nuestra pasión</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="carousel-control-prev" 
              type="button" 
              data-bs-target="#mainCarousel"
              data-bs-slide="prev"
              onClick={prevSlide}
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button 
              className="carousel-control-next" 
              type="button" 
              data-bs-target="#mainCarousel"
              data-bs-slide="next"
              onClick={nextSlide}
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: CATEGORÍAS PRINCIPALES */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary mb-3">Nuestras Categorías</h1>
              <p className="lead text-muted">
                Descubre nuestra amplia gama de productos para el cuidado de tu visión
              </p>
            </div>

            <div className="row g-4">
              {/* Categoría 1 - Accesorios */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm hover-card">
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">🕶️</div>
                    <h3 className="card-title fw-bold mb-3">Accesorios</h3>
                    <p className="card-text text-muted mb-4">
                      Encuentra los mejores accesorios para tus gafas: estuches, limpiadores, cadenas y más.
                    </p>
                    <Link to="/productos/accesorios" className="btn btn-primary px-4">
                      Ver Productos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Categoría 2 - Lentes */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm hover-card">
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">👓</div>
                    <h3 className="card-title fw-bold mb-3">Lentes</h3>
                    <p className="card-text text-muted mb-4">
                      Lentes de alta calidad con tecnología antirreflejo y protección blue light.
                    </p>
                    <Link to="/productos/lentes" className="btn btn-primary px-4">
                      Ver Productos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Categoría 3 - Lentes de Contacto */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm hover-card">
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">🔍</div>
                    <h3 className="card-title fw-bold mb-3">Lentes de Contacto</h3>
                    <p className="card-text text-muted mb-4">
                      Máxima comodidad y visión nítida. Disponibles en diarias, mensuales y anuales.
                    </p>
                    <Link to="/productos/lentes-contacto" className="btn btn-primary px-4">
                      Ver Productos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: AGENDA TU CITA */}
        <section className="py-5 bg-primary text-white">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="display-5 fw-bold mb-3">¿Necesitas un examen visual?</h2>
                <p className="lead mb-4">
                  Agenda una cita con nuestros especialistas. Realizamos exámenes completos 
                  de la vista y te asesoramos en la elección de tus lentes.
                </p>
                <Link to="/citas/nueva" className="btn btn-light btn-lg px-4">
                  <i className="fas fa-calendar-check me-2"></i>
                  Agendar Cita
                </Link>
              </div>
              <div className="col-lg-4 text-center">
                <div className="display-1">👁️</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: INFORMACIÓN DE CONTACTO */}
        <section className="py-5">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="display-1 text-primary mb-3">📍</div>
                    <h4 className="fw-bold mb-3">Nuestras Sucursales</h4>
                    <p className="text-muted">
                      <strong>Principal:</strong> Calle 123 #45-67, Centro<br/>
                      <strong>Norte:</strong> Carrera 89 #12-34, Zona Norte<br/>
                      <strong>Sur:</strong> Avenida 56 #78-90, Zona Sur
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="display-1 text-primary mb-3">📞</div>
                    <h4 className="fw-bold mb-3">Contáctanos</h4>
                    <p className="text-muted">
                      <strong>Teléfono:</strong> (601) 123-4567<br/>
                      <strong>WhatsApp:</strong> +57 300 123 4567<br/>
                      <strong>Email:</strong> info@opticasga.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="display-1 text-primary mb-3">⏰</div>
                    <h4 className="fw-bold mb-3">Horarios de Atención</h4>
                    <p className="text-muted">
                      <strong>Lunes a Viernes:</strong> 8:00 AM - 7:00 PM<br/>
                      <strong>Sábados:</strong> 9:00 AM - 5:00 PM<br/>
                      <strong>Domingos:</strong> 10:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-4">Productos</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/productos/accesorios" className="text-white-50 text-decoration-none">
                    Accesorios
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/productos/lentes" className="text-white-50 text-decoration-none">
                    Lentes
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/productos/lentes-contacto" className="text-white-50 text-decoration-none">
                    Lentes de Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-4">Servicios</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/clinica/examenes" className="text-white-50 text-decoration-none">
                    Exámenes de la Vista
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/clinica/servicios" className="text-white-50 text-decoration-none">
                    Ajuste de Monturas
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/clinica/servicios" className="text-white-50 text-decoration-none">
                    Limpieza Profesional
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/clinica/servicios" className="text-white-50 text-decoration-none">
                    Reparaciones
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-4">Contacto</h5>
              <ul className="list-unstyled">
                <li className="mb-2 text-white-50">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Calle 123 #45-67, Centro
                </li>
                <li className="mb-2 text-white-50">
                  <i className="fas fa-phone me-2"></i>
                  (601) 123-4567
                </li>
                <li className="mb-2 text-white-50">
                  <i className="fas fa-envelope me-2"></i>
                  info@opticasga.com
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-4">Suscríbete</h5>
              <div className="mb-3">
                <p className="text-white-50 small mb-2">
                  Recibe ofertas exclusivas y novedades
                </p>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Tu email"
                    aria-label="Email"
                  />
                  <button className="btn btn-primary" type="button">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
              <div className="d-flex gap-3">
                <a href="#" className="text-white fs-4">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-white fs-4">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-white fs-4">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>

          <hr className="my-4 opacity-50" />

          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0 text-white-50">
                © 2024 S.G.A Óptica. Todos los derechos reservados.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <a href="#" className="text-white-50 text-decoration-none me-3">
                Términos y Condiciones
              </a>
              <a href="#" className="text-white-50 text-decoration-none">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App