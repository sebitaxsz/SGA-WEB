import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import NotificationBell from './campanita/NotificationBell'
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('') // 'user', 'optometrist', 'admin'
  const [userEmail, setUserEmail] = useState('')
  const [optometristData, setOptometristData] = useState(null)
  const { cart } = useCart()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          setIsLoggedIn(true)
          
          // Obtener nombre del usuario
          const nombre = userData.nombre || userData.firstName || userData.username || 'Usuario'
          const email = userData.email || userData.user_user || userData.username || ''
          setUserName(nombre)
          setUserEmail(email)
          
          // ============================================
          // 🎯 DETECCIÓN DE ROL CORRECTA
          // ============================================
          let role = 'user' // default: cliente
          
          // 1. Verificar si es ADMIN (role_id = 1 o role = 'admin')
          if (userData.role === 'admin' || 
              userData.role_id === 1 ||
              userData.role === 'administrador') {
            role = 'admin'
            console.log('👑 Navbar detectó ADMIN')
          }
          // 2. Verificar si es OPTOMETRISTA (role_id = 3 o role = 'optometrist')
          else if (userData.role === 'optometrist' || 
                   userData.role_id === 3 ||
                   userData.is_optometrist === true) {
            role = 'optometrist'
            console.log('👨‍⚕️ Navbar detectó OPTOMETRISTA')
            // Guardar datos del optometrista si existen
            if (userData.optometrist_data) {
              setOptometristData(userData.optometrist_data)
            }
          }
          // 3. Si no, es CLIENTE normal
          else {
            role = 'user'
            console.log('👤 Navbar detectó CLIENTE')
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
        setOptometristData(null)
      }
    }
    
    checkAuth()
    
    // Escuchar cambios en localStorage (para cuando se cierra sesión desde otra pestaña)
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
    setOptometristData(null)
    navigate('/')
  }

  // Obtener badge según el rol
  const getRoleBadge = () => {
    switch(userRole) {
      case 'admin':
        return <span className="badge bg-danger ms-2">Admin</span>
      case 'optometrist':
        return <span className="badge bg-info ms-2">Optómetra</span>
      default:
        return null
    }
  }

  // Obtener ícono según el rol
  const getRoleIcon = () => {
    switch(userRole) {
      case 'admin':
        return <i className="fas fa-crown me-1"></i>
      case 'optometrist':
        return <i className="fas fa-stethoscope me-1"></i>
      default:
        return <i className="fas fa-user me-1"></i>
    }
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
              {/* PRODUCTOS - Enlace directo */}
              <li className="nav-item">
                <Link className="nav-link text-dark fs-5 fw-semibold px-3" to="/productos">
                  PRODUCTOS
                </Link>
              </li>
              
              {/* Solo mostrar opciones de agenda/citas para usuarios no-optometristas? 
                  Los optometristas también pueden ver citas, pero no crear nuevas */}
            <li className="nav-item dropdown">
  <Link className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3" to="#" role="button" data-bs-toggle="dropdown">
    AGENDA TU CITA
  </Link>
  <ul className="dropdown-menu">
    {/* Los optometristas NO pueden crear citas, solo verlas */}
    {userRole !== 'optometrist' && (
      <li>
        <Link className="dropdown-item" to="/citas/nueva">
          <i className="fas fa-calendar-plus me-2 text-primary"></i>
          Nueva Cita
        </Link>
      </li>
    )}
    <li>
      <Link className="dropdown-item" to="/citas/ver">
        <i className="fas fa-calendar-alt me-2 text-primary"></i>
        {userRole === 'optometrist' ? 'Gestionar Citas' : 'Mis Citas'}
      </Link>
    </li>
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
              {/* Botón de Admin Panel - SOLO para administradores */}
              {isLoggedIn && userRole === 'admin' && (
                <Link to="/admin" className="btn btn-outline-danger me-2">
                  <i className="fas fa-cog me-1"></i> Panel Admin
                </Link>
              )}
            
              {isLoggedIn ? (
                <>
                  {/* Campanita de notificaciones - SOLO para clientes (tienen customer_id) */}
                  {userRole === 'user' && <NotificationBell />}
                  
                  <div className="dropdown me-2">
                    <button 
                      className="btn btn-outline-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      {getRoleIcon()} {userName}
                      {getRoleBadge()}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link className="dropdown-item" to="/profile">Mi Perfil</Link></li>
                      
                      {/* Opciones según el rol */}
                      {userRole === 'user' && (
                        <>
                          <li><Link className="dropdown-item" to="/citas/ver">Mis Citas</Link></li>
                          <li><Link className="dropdown-item" to="/mis-notificaciones">Notificaciones</Link></li>
                          <li><Link className="dropdown-item" to="/pedidos">Mis Pedidos</Link></li>
                        </>
                      )}
                      
                      {userRole === 'optometrist' && (
                        <>
                          <li><Link className="dropdown-item" to="/citas/ver">Citas Agendadas</Link></li>
                          <li><Link className="dropdown-item" to="/optometrist/perfil">Mi Perfil Profesional</Link></li>
                          <li><Link className="dropdown-item" to="/optometrist/horarios">Mis Horarios</Link></li>
                        </>
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
              
              {/* Carrito - SOLO para clientes */}
              {userRole === 'user' && (
                <Link to="/carrito" className="btn btn-primary position-relative">
                  <i className="fas fa-shopping-cart me-1"></i> Carrito
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cart.length}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar