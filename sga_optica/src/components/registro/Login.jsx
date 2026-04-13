import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'

/*
  ═══════════════════════════════════════════════════════════
  FLUJO CORREGIDO
  ═══════════════════════════════════════════════════════════
  La API devuelve:  user.role = "Administrador"  (exacto de BD)
  Antes se comparaba con 'admin' / 'administrador' → nunca coincidía
  → todos quedaban como 'user' → nadie veía el panel admin

  Fix: guardar role_name exacto + comparar siempre en minúscula
  ═══════════════════════════════════════════════════════════
*/

const ADMIN_ROLES = ['administrador', 'admin']

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ user_user: '', user_password: '', rememberMe: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await authService.login({
        user_user:     formData.user_user,
        user_password: formData.user_password
      })

      const { token, user } = response.data

      // role viene exactamente como está en la BD: "Administrador", "cliente", etc.
      const roleFromApi  = user.role || ''
      const roleLower    = roleFromApi.toLowerCase()
      const isAdmin      = ADMIN_ROLES.includes(roleLower)

      // Guardamos todo lo necesario en un objeto unificado
      const userData = {
        user_id:    user.user_id,
        user_user:  user.username,
        email:      user.username,
        nombre:     user.entity?.first_name
                      ? `${user.entity.first_name} ${user.entity.last_name || ''}`.trim()
                      : user.username,
        role:       roleFromApi,   // guardamos exacto de BD ("Administrador")
        role_lower: roleLower,     // guardamos en minúscula para comparar fácil
        is_admin:   isAdmin,
        customer_id: user.entity?.customer_id || null
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      if (formData.rememberMe) localStorage.setItem('rememberMe', 'true')

      navigate(isAdmin ? '/admin' : '/')

    } catch (err) {
      setError(err.response?.data?.message || 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
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
                    type="email" className="form-control" id="user_user" name="user_user"
                    value={formData.user_user} onChange={handleChange}
                    placeholder="tu@email.com" required disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="user_password" className="form-label">
                    <i className="fas fa-lock me-2"></i>Contraseña
                  </label>
                  <input
                    type="password" className="form-control" id="user_password" name="user_password"
                    value={formData.user_password} onChange={handleChange}
                    placeholder="••••••••" required disabled={loading}
                  />
                  <div className="form-text">
                    <Link to="/forgot-password" className="text-decoration-none">¿Olvidaste tu contraseña?</Link>
                  </div>
                </div>
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="rememberMe" name="rememberMe"
                    checked={formData.rememberMe} onChange={handleChange} disabled={loading} />
                  <label className="form-check-label" htmlFor="rememberMe">Recordarme</label>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...</>
                      : <><i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión</>}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <p className="mb-2">¿No tienes una cuenta?</p>
                <Link to="/register" className="btn btn-outline-primary">
                  <i className="fas fa-user-plus me-2"></i>Crear Cuenta
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
