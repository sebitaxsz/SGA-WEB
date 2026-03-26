import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulación de autenticación
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular API call
      
      // Validación simple
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos')
      }

      if (!formData.email.includes('@')) {
        throw new Error('Email inválido')
      }

      // Simular login exitoso
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        name: 'Usuario Demo',
        role: 'user'
      }))

      alert('¡Inicio de sesión exitoso!')
      navigate('/') // Redirigir al inicio
      
    } catch (err) {
      setError(err.message)
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
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock me-2"></i>Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <div className="form-text">
                    <Link to="/recuperar-contrasena" className="text-decoration-none">
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

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-2">O inicia sesión con</p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-outline-dark">
                    <i className="fab fa-google me-2"></i>Google
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="fab fa-facebook me-2"></i>Facebook
                  </button>
                </div>
              </div>
            </div>

            <div className="card-footer text-center py-3">
              <small className="text-muted">
                Al iniciar sesión aceptas nuestros 
                <Link to="/terminos" className="text-decoration-none ms-1">Términos y Condiciones</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login