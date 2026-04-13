import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import NotificationBell from './campanita/NotificationBell'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('') // 'user', 'optometrist', 'admin'
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

          // Detección de rol
          let role = 'user'
          const roleLower = (userData.role_lower || userData.role || '').toLowerCase()

          if (
            userData.is_admin === true ||
            userData.role === 'admin' ||
            userData.role_id === 1 ||
            roleLower === 'administrador' ||
            roleLower === 'admin'
          ) {
            role = 'admin'
          } else if (
            userData.is_optometrist === true ||
            userData.role === 'optometrist' ||
            userData.role_id === 3 ||
            roleLower === 'optometrist' ||
            roleLower === 'optometrista'
          ) {
            role = 'optometrist'
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

  const getRoleBadge = () => {
    if (userRole === 'admin')       return <span className="badge bg-danger ms-2">Admin</span>
    if (userRole === 'optometrist') return <span className="badge bg-info ms-2">Optómetra</span>
    return null
  }

  const getRoleIcon = () => {
    if (userRole === 'admin')       return <i className="fas fa-crown me-1"></i>
    if (userRole === 'optometrist') return <i className="fas fa-stethoscope me-1"></i>
    return <i className="fas fa-user me-1"></i>
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

              {/* PRODUCTOS */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  PRODUCTOS
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/productos">
                      <i className="fas fa-th me-2 text-primary"></i>Todos los Productos
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/productos/gafas-sol">
                      <i className="fas fa-sun me-2 text-primary"></i>Gafas de Sol
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/productos/gafas-formuladas">
                      <i className="fas fa-glasses me-2 text-primary"></i>Gafas Formuladas
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/productos/lentes-contacto">
                      <i className="fas fa-eye me-2 text-primary"></i>Lentes de Contacto
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/productos/gafas-deportivas">
                      <i className="fas fa-running me-2 text-primary"></i>Gafas Deportivas
                    </Link>
                  </li>
                </ul>
              </li>

              {/* AGENDA TU CITA */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  AGENDA TU CITA
                </Link>
                <ul className="dropdown-menu">
                  {/* Los optometristas NO crean citas, solo las gestionan */}
                  {userRole !== 'optometrist' && (
                    <li>
                      <Link className="dropdown-item" to="/citas/nueva">
                        <i className="fas fa-calendar-plus me-2 text-primary"></i>Nueva Cita
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/citas/ver">
                      <i className="fas fa-calendar-alt me-2 text-primary"></i>
                      {userRole === 'optometrist' ? 'Gestionar Citas' : 'Mis Citas'}
                    </Link>
                  </li>
                  {userRole !== 'optometrist' && (
                    <li>
                      <Link className="dropdown-item" to="/citas/calendario">
                        <i className="fas fa-calendar me-2 text-primary"></i>Calendario
                      </Link>
                    </li>
                  )}
                </ul>
              </li>

              {/* CLÍNICA */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle text-dark fs-5 fw-semibold px-3"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  CLÍNICA
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/clinica/examenes">
                      <i className="fas fa-eye-dropper me-2 text-primary"></i>Exámenes
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/clinica/servicios">
                      <i className="fas fa-hand-holding-medical me-2 text-primary"></i>Servicios Clínicos
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              {/* Botón Panel Admin - solo admins */}
              {isLoggedIn && userRole === 'admin' && (
                <Link to="/admin" className="btn btn-outline-danger me-2">
                  <i className="fas fa-cog me-1"></i> Panel Admin
                </Link>
              )}

              {/* Botón Panel Optometrista */}
              {isLoggedIn && userRole === 'optometrist' && (
                <Link to="/perfil-optometrista" className="btn btn-outline-info me-2">
                  <i className="fas fa-user-md me-1"></i> Mi Panel
                </Link>
              )}

              {isLoggedIn ? (
                <>
                  {/* Campanita - solo clientes */}
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
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          <i className="fas fa-user me-2"></i>Mi Perfil
                        </Link>
                      </li>

                      {/* Opciones exclusivas del CLIENTE */}
                      {userRole === 'user' && (
                        <>
                          <li>
                            <Link
                              className="dropdown-item"
                              to="/profile"
                              onClick={() => sessionStorage.setItem('profileTab', 'formula')}
                            >
                              <i className="fas fa-file-medical me-2 text-primary"></i>Mi Fórmula Visual
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/citas/ver">
                              <i className="fas fa-calendar-alt me-2"></i>Mis Citas
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/mis-notificaciones">
                              <i className="fas fa-bell me-2"></i>Notificaciones
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/pedidos">
                              <i className="fas fa-shopping-bag me-2"></i>Mis Pedidos
                            </Link>
                          </li>
                        </>
                      )}

                      {/* Opciones exclusivas del OPTOMETRISTA */}
                      {userRole === 'optometrist' && (
                        <>
                          <li>
                            <Link className="dropdown-item" to="/citas/ver">
                              <i className="fas fa-calendar-alt me-2"></i>Citas Agendadas
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/perfil-optometrista">
                              <i className="fas fa-file-medical me-2 text-info"></i>Fórmulas de Clientes
                            </Link>
                          </li>
                        </>
                      )}

                      {/* Opciones exclusivas del ADMIN */}
                      {userRole === 'admin' && (
                        <>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <Link className="dropdown-item text-danger" to="/admin">
                              <i className="fas fa-cog me-2"></i>Panel Administrativo
                            </Link>
                          </li>
                        </>
                      )}

                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
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

              {/* Carrito - solo clientes */}
              {(userRole === 'user' || !isLoggedIn) && (
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
