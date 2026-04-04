import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import Navbar from '../Navbar'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    user_user: '',
    user_password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login({
        user_user: formData.user_user,
        user_password: formData.user_password
      })

      console.log('Respuesta del login:', response.data)

      const { token, user } = response.data
      
      // Determinar el rol
      let userRole = 'user'
      let userRoleId = user.role_id || 3
      
      // Lista de emails de admin para forzar rol
      const adminEmails = ['marlonadmin@gmail.com', 'admin@sgaoptica.com']
      
      if (user.role === 'admin' || user.role === 'administrador' || user.role_id === 1 || adminEmails.includes(formData.user_user)) {
        userRole = 'admin'
        userRoleId = 1
      }
      
      // Guardar datos del usuario
      const userData = {
        user_id: user.user_id,
        nombre: user.entity?.first_name || user.username || 'Usuario',
        email: formData.user_user,
        user_user: formData.user_user,
        role: userRole,
        role_id: userRoleId,
        role_name: user.role,
        customer_id: user.entity?.customer_id || null
      }
      
      console.log('Guardando en localStorage:', userData)
      console.log('Rol guardado:', userRole)
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      // Redirigir según el rol
      if (userRole === 'admin') {
        console.log('Redirigiendo a /admin')
        navigate('/admin')
      } else {
        console.log('Redirigiendo a /')
        navigate('/')
      }
      
    } catch (err) {
      console.error('Error login:', err)
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <Navbar />
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="mb-0">🔐 Iniciar Sesión</h2>
              <p className="mb-0 mt-2">Accede a tu cuenta S.G.A Óptica</p>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="user_user" className="form-label">
                    <i className="fas fa-envelope me-2"></i>Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="user_user"
                    name="user_user"
                    value={formData.user_user}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="user_password" className="form-label">
                    <i className="fas fa-lock me-2"></i>Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="user_password"
                    name="user_password"
                    value={formData.user_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <div className="form-text">
                    <Link to="/forgot-password" className="text-decoration-none">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Recordarme
                  </label>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="mb-2">¿No tienes una cuenta?</p>
                <Link to="/register" className="btn btn-outline-primary">
                  <i className="fas fa-user-plus me-2"></i>
                  Crear Cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login