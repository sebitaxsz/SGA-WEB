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
          
          const nombre = userData.nombre || userData.firstName || userData.username || 'Usuario'
          const email = userData.email || userData.user_user || userData.username || ''
          setUserName(nombre)
          setUserEmail(email)
          
          let role = 'user'
          const adminEmails = ['marlonadmin@gmail.com', 'admin@sgaoptica.com', 'administrador@sgaoptica.com']
          
          if (adminEmails.includes(email) || 
              userData.role === 'admin' || 
              userData.role === 'administrador' || 
              userData.role_id === 1) {
            role = 'admin'
          }
          
          setUserRole(role)
          
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
              {/* PRODUCTOS - Ahora es un enlace directo */}
              <li className="nav-item">
                <Link className="nav-link text-dark fs-5 fw-semibold px-3" to="/productos">
                  PRODUCTOS
                </Link>
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
              {isLoggedIn && userRole === 'admin' && (
                <Link to="/admin" className="btn btn-outline-danger me-2">
                  <i className="fas fa-cog me-1"></i> Panel Admin
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
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" to="/profile">Mi Perfil</Link></li>
                      <li><Link className="dropdown-item" to="/citas/ver">Mis Citas</Link></li>
                      <li><Link className="dropdown-item" to="/mis-notificaciones">Notificaciones</Link></li>
                      <li><Link className="dropdown-item" to="/pedidos">Mis Pedidos</Link></li>
                      
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