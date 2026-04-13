import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import NotificationBell from './campanita/NotificationBell'
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const { cart } = useCart()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          setIsLoggedIn(true)
          
          // Obtener nombre y email
          const nombre = userData.nombre || userData.firstName || userData.username || 'Usuario'
          const email = userData.email || userData.user_user || userData.username || ''
          setUserName(nombre)
          setUserEmail(email)
          
          // Detectar admin usando el mismo criterio que Login.jsx
          // userData.role viene exacto de la BD: "Administrador", "cliente", etc.
          // userData.is_admin es el flag que guarda Login.jsx directamente
          const ADMIN_ROLES = ['administrador', 'admin']
          const roleLower = (userData.role_lower || userData.role || '').toLowerCase()
          const isAdmin = userData.is_admin === true || ADMIN_ROLES.includes(roleLower)
          const isOptometrist = roleLower === 'optometrist' || roleLower === 'optometrista'
          
          setUserRole(isAdmin ? 'admin' : isOptometrist ? 'optometrist' : 'user')
          
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      } else {
        setIsLoggedIn(false)
        setUserName('')
        setUserRole('')
        setUserEmail('')
      }
    }
    
    checkAuth()
    
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
    setIsLoggedIn(false)
    setUserName('')
    setUserRole('')
    setUserEmail('')
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
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 fixed-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="fas fa-glasses fs-3 text-primary me-2"></i>
            <span className="fs-4 fw-bold text-primary">S.G.A ÓPTICA</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3" to="#" role="button" data-bs-toggle="dropdown">
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
              
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3" to="#" role="button" data-bs-toggle="dropdown">
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
              
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3" to="#" role="button" data-bs-toggle="dropdown">
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
            
            <div className="d-flex align-items-center">
              {/* Botón Panel Admin - Se muestra si es admin */}
              {isLoggedIn && userRole === 'admin' && (
                <Link to="/admin" className="btn btn-outline-danger me-2">
                  <i className="fas fa-cog me-1"></i> Panel Admin
                </Link>
              )}

              {/* Botón Perfil Optometrista */}
              {isLoggedIn && userRole === 'optometrist' && (
                <Link to="/perfil-optometrista" className="btn btn-outline-info me-2">
                  <i className="fas fa-user-md me-1"></i> Mi Panel
                </Link>
              )}
              
              {isLoggedIn ? (
                <>
                  <NotificationBell />
                  
                  <div className="dropdown me-2">
                    <button 
                      className="btn btn-outline-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="fas fa-user me-1"></i> {userName}
                      {userRole === 'admin' && (
                        <span className="badge bg-danger ms-2">Admin</span>
                      )}
                      {userRole === 'optometrist' && (
                        <span className="badge bg-info ms-2">Optómetra</span>
                      )}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" to="/profile">Mi Perfil</Link></li>
                      <li><Link className="dropdown-item" to="/citas/ver">Mis Citas</Link></li>
                      <li><Link className="dropdown-item" to="/mis-notificaciones">Notificaciones</Link></li>
                      <li><Link className="dropdown-item" to="/pedidos">Mis Pedidos</Link></li>
                      
                      {/* Fórmula visual — solo clientes (no admin) */}
                      {userRole !== 'admin' && (
                        <li>
                          <Link className="dropdown-item" to="/profile" state={{ tab: 'formula' }}
                            onClick={() => {
                              // Guardamos el tab para que Profile lo lea si lo desea
                              sessionStorage.setItem('profileTab', 'formula')
                            }}
                          >
                            <i className="fas fa-file-medical me-2 text-primary"></i>Mi Fórmula Visual
                          </Link>
                        </li>
                      )}
                      
                      {userRole === 'admin' && (
                        <>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <Link className="dropdown-item text-danger" to="/admin">
                              <i className="fas fa-cog me-2"></i> Panel Administrativo
                            </Link>
                          </li>
                        </>
                      )}

                      {userRole === 'optometrist' && (
                        <>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <Link className="dropdown-item text-info" to="/perfil-optometrista">
                              <i className="fas fa-file-medical me-2"></i> Fórmulas de Clientes
                            </Link>
                          </li>
                        </>
                      )}
                      
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
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