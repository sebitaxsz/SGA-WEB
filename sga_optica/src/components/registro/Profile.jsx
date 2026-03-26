import React, { useState, useEffect, } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../carrito/CartContext'
import Navbar from '../Navbar'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('perfil')
  const { cart } = useCart()

  useEffect(() => {
    // Pequeño delay para evitar el warning
    const timer = setTimeout(() => {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      } else {
        navigate('/login')
      }
    }, 10) // 10ms es suficiente para evitar el warning

    return () => clearTimeout(timer)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <Navbar />
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="display-1 mb-3">👤</div>
              <h5>{user.nombre} {user.apellido}</h5>
              <p className="text-muted">{user.email}</p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <div className="list-group mt-3">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              <i className="fas fa-user me-2"></i>Mi Perfil
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'pedidos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pedidos')}
            >
              <i className="fas fa-shopping-bag me-2"></i>Mis Pedidos
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'citas' ? 'active' : ''}`}
              onClick={() => setActiveTab('citas')}
            >
              <i className="fas fa-calendar me-2"></i>Mis Citas
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'config' ? 'active' : ''}`}
              onClick={() => setActiveTab('config')}
            >
              <i className="fas fa-cog me-2"></i>Configuración
            </button>
          </div>
        </div>

        <div className="col-md-9">
          {activeTab === 'perfil' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Información del Perfil</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Nombre:</strong> {user.nombre}</p>
                    <p><strong>Apellido:</strong> {user.apellido}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Teléfono:</strong> {user.telefono || 'No registrado'}</p>
                    <p><strong>Miembro desde:</strong> {new Date(user.fechaRegistro).toLocaleDateString()}</p>
                    <p><strong>Tipo de cuenta:</strong> {user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                  </div>
                </div>
                <Link to="/editar-perfil" className="btn btn-primary mt-3">
                  <i className="fas fa-edit me-2"></i>Editar Perfil
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Historial de pedidos</h5>
              </div>
              <div className="card-body">

                {cart.length === 0 ? (
                  <>
                    <p className="text-muted">Aún no has añadido productos.</p>
                    <Link to="/productos/gafas-sol" className="btn btn-primary">
                      <i className="fas fa-shopping-cart me-2"></i>Ver Productos
                    </Link>
                  </>
                ) : (
                  <>
                    <ul className="list-group mb-3">
                      {cart.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.name}</strong>
                            <br />
                            <small className="text-muted">{item.descripcion}</small>
                          </div>
                          <span className="badge bg-primary rounded-pill">
                            ${item.price.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="d-flex justify-content-between align-items-center">
                      <h5>Total:</h5>
                      <h5 className="text-success">
                        $
                        {cart
                          .reduce((total, item) => total + item.price, 0)
                          .toLocaleString()}
                      </h5>
                    </div>

                    <button className="btn btn-success w-100 mt-3">
                      <i className="fas fa-check-circle me-2"></i>Finalizar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Mis Citas</h5>
              </div>
              <div className="card-body">
                <p>Gestiona tus citas médicas.</p>
                <Link to="/citas/ver" className="btn btn-primary me-2">
                  <i className="fas fa-eye me-2"></i>Ver Citas
                </Link>
                <Link to="/citas/nueva" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Nueva Cita
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Configuración de la Cuenta</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6>Notificaciones</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="notifEmail" defaultChecked />
                    <label className="form-check-label" htmlFor="notifEmail">
                      Recibir notificaciones por email
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="notifOfertas" defaultChecked />
                    <label className="form-check-label" htmlFor="notifOfertas">
                      Recibir ofertas y promociones
                    </label>
                  </div>
                </div>
                <button className="btn btn-primary">
                  <i className="fas fa-save me-2"></i>Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile