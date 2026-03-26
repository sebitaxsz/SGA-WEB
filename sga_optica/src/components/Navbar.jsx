import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const { cart } = useCart()

useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setTimeout(() => {
          setIsLoggedIn(true)
          setUserName(userData.nombre || 'Usuario')
        }, 0)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])
  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUserName('')
    navigate('/')
  }

  const menuItems = {
    productos: [
      { id: 'gafas-sol', name: 'Gafas de Sol', icon: 'fa-sun', path: '/productos/gafas-sol' },
      { id: 'gafas-formuladas', name: 'Gafas Formuladas', icon: 'fa-glasses', path: '/productos/gafas-formuladas' },
      { id: 'lentes-contacto', name: 'Lentes de Contacto', icon: 'fa-eye', path: '/productos/lentes-contacto' },
      { id: 'gafas-deportivas', name: 'Gafas Deportivas', icon: 'fa-running', path: '/productos/gafas-deportivas' }
    ],
    agenda: [
      { id: 'nueva-cita', name: 'Nueva Cita', icon: 'fa-calendar-plus', path: '/citas/nueva' },
      { id: 'ver-citas', name: 'Ver Citas', icon: 'fa-calendar-alt', path: '/citas/ver' },
      { id: 'calendario', name: 'Calendario', icon: 'fa-calendar', path: '/citas/calendario' }
    ],
    clinica: [
      { id: 'consultas', name: 'Consultas', icon: 'fa-stethoscope', path: '/clinica/consultas' },
      { id: 'examenes', name: 'Exámenes', icon: 'fa-eye-dropper', path: '/clinica/examenes' },
      { id: 'servicios-clinicos', name: 'Servicios Clínicos', icon: 'fa-hand-holding-medical', path: '/clinica/servicios' }
    ]
  }

  return (
    <header>
      {/* Navbar principal */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 fixed-top">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="fas fa-glasses fs-3 text-primary me-2"></i>
            <span className="fs-4 fw-bold text-primary">S.G.A ÓPTICA</span>
          </Link>
          
          {/* Botón hamburguesa */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Contenido del navbar */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              
              {/* Productos Dropdown */}
              <li className="nav-item dropdown">
                <Link 
                  className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  PRODUCTOS
                </Link>
                <ul className="dropdown-menu">
                  {menuItems.productos.map(item => (
                    <li key={item.id}>
                      <Link className="dropdown-item" to={item.path}>
                        <i className={`fas ${item.icon} me-2 text-primary`}></i>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Agenda Dropdown */}
              <li className="nav-item dropdown">
                <Link 
                  className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  AGENDA TU CITA
                </Link>
                <ul className="dropdown-menu">
                  {menuItems.agenda.map(item => (
                    <li key={item.id}>
                      <Link className="dropdown-item" to={item.path}>
                        <i className={`fas ${item.icon} me-2 text-primary`}></i>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Clínica Dropdown */}
              <li className="nav-item dropdown">
                <Link 
                  className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  CLÍNICA
                </Link>
                <ul className="dropdown-menu">
                  {menuItems.clinica.map(item => (
                    <li key={item.id}>
                      <Link className="dropdown-item" to={item.path}>
                        <i className={`fas ${item.icon} me-2 text-primary`}></i>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
            
            {/* Acciones de usuario - ACTUALIZADO CON AUTENTICACIÓN */}
            <div className="d-flex align-items-center">
              <Link to="/admin" className="btn btn-outline-primary me-2">
                <i className="fas fa-cog me-1"></i> Panel Admin
              </Link>
              
              {isLoggedIn ? (
                <div className="dropdown me-2">
                  <button 
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user me-1"></i> {userName}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="fas fa-id-card me-2"></i> Mi Perfil
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/citas/ver">
                        <i className="fas fa-calendar me-2"></i> Mis Citas
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/pedidos">
                        <i className="fas fa-shopping-bag me-2"></i> Mis Pedidos
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline-primary me-2">
                  <i className="fas fa-user me-1"></i> Ingresa
                </Link>
              )}
              
              <Link to="/carrito" className="btn btn-primary position-relative">
                <i className="fas fa-shopping-cart me-1"></i> Carrito
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.length}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar