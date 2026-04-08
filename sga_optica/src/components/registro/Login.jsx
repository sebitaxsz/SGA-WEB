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

      console.log('=== RESPUESTA COMPLETA DEL LOGIN ===')
      console.log('Response data:', response.data)
      
      const { token, user } = response.data
      
      console.log('Usuario recibido:', user)
      console.log('Role ID:', user.role_id)
      console.log('Entity:', user.entity)
      
      // Determinar el rol del usuario basado en role_id
      // role_id = 1: Admin
      // role_id = 2: Cliente/Usuario normal
      // role_id = 3: Optometrista
      let userRole = 'user'
      let isOptometrist = false
      let customerId = null
      let optometristData = null
      let nombreCompleto = user.username || formData.user_user.split('@')[0] || 'Usuario'
      
      if (user.role_id === 1) {
        userRole = 'admin'
        console.log('✅ Rol detectado: ADMIN')
      } else if (user.role_id === 3) {
        userRole = 'optometrist'
        isOptometrist = true
        console.log('✅ Rol detectado: OPTOMETRISTA')
        
        // Para optometrista, obtener sus datos profesionales
        if (user.entity) {
          optometristData = {
            id: user.entity.id,
            documentNumber: user.entity.document_number,
            firstName: user.entity.first_name,
            firstLastName: user.entity.first_last_name,
            email: user.entity.email,
            professionalCardCode: user.entity.professional_card_code,
            phoneNumber: user.entity.phone_number,
            idDocType: user.entity.id_doc_type
          }
          nombreCompleto = `${user.entity.first_name || ''} ${user.entity.first_last_name || ''}`.trim()
          if (nombreCompleto === '') nombreCompleto = user.username || 'Optometrista'
          console.log('Datos del optometrista:', optometristData)
        }
      } else if (user.role_id === 2) {
        userRole = 'user'
        console.log('✅ Rol detectado: CLIENTE/USUARIO')
        
        // Para cliente normal, obtener customer_id
        // El customer_id puede venir en diferentes lugares de la respuesta
        if (user.entity) {
          // Intentar obtener customer_id de diferentes campos posibles
          customerId = user.entity.customer_id || 
                      user.entity.id || 
                      user.customer_id || 
                      null
          
          nombreCompleto = `${user.entity.first_name || ''} ${user.entity.first_last_name || ''}`.trim()
          if (nombreCompleto === '') nombreCompleto = user.username || 'Cliente'
          
          console.log('Entity del cliente:', user.entity)
          console.log('Customer ID obtenido:', customerId)
        }
        
        // Si aún no hay customer_id, intentar obtenerlo de otros lugares
        if (!customerId && user.customer_id) {
          customerId = user.customer_id
          console.log('Customer ID desde user.customer_id:', customerId)
        }
      }
      
      // Validar que el customer_id existe para usuarios normales
      if (userRole === 'user' && !customerId) {
        console.error('⚠️ ADVERTENCIA: No se encontró customer_id para el usuario')
        console.error('Datos completos del usuario:', user)
      }
      
      // Guardar datos del usuario en localStorage
      const userData = {
        user_id: user.user_id,
        user_uuid: user.user_uuid,
        nombre: nombreCompleto,
        email: formData.user_user,
        user_user: formData.user_user,
        username: user.username,
        role: userRole,
        role_id: user.role_id,
        customer_id: customerId,
        is_optometrist: isOptometrist,
        optometrist_data: optometristData,
        entity: user.entity,
        permissions: user.permissions || []
      }
      
      console.log('=== DATOS GUARDADOS EN LOCALSTORAGE ===')
      console.log('userData:', userData)
      console.log('Token guardado:', token ? '✅ Sí' : '❌ No')
      console.log('Customer ID guardado:', customerId)
      console.log('Rol guardado:', userRole)
      
      // Guardar en localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      
      // Disparar evento storage para que otros componentes se actualicen
      window.dispatchEvent(new Event('storage'))
      
      // Redirigir según el rol
      console.log('=== REDIRIGIENDO ===')
      if (userRole === 'admin') {
        console.log('Redirigiendo a /admin')
        navigate('/admin')
      } else if (userRole === 'optometrist') {
        console.log('Redirigiendo a /optometrist/perfil')
        navigate('/optometrist/perfil')
      } else {
        console.log('Redirigiendo a /')
        navigate('/')
      }
      
    } catch (err) {
      console.error('=== ERROR EN LOGIN ===')
      console.error('Error:', err)
      
      if (err.response) {
        console.error('Status:', err.response.status)
        console.error('Data:', err.response.data)
        
        switch (err.response.status) {
          case 401:
            setError('Credenciales incorrectas. Verifica tu email y contraseña.')
            break
          case 403:
            setError('Cuenta bloqueada. Contacta al administrador.')
            break
          case 404:
            setError('Usuario no encontrado.')
            break
          case 429:
            setError('Demasiados intentos. Intenta más tarde.')
            break
          default:
            setError(err.response.data?.message || 'Error al iniciar sesión.')
        }
      } else if (err.request) {
        setError('Error de conexión. Verifica tu internet.')
      } else {
        setError('Error inesperado. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ marginTop: '100px' }}>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <i className="fas fa-glasses fs-1 mb-2"></i>
                <h2 className="mb-0">🔐 Iniciar Sesión</h2>
                <p className="mb-0 mt-2">Accede a tu cuenta S.G.A Óptica</p>
              </div>
              
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="user_user" className="form-label">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="user_user"
                      name="user_user"
                      value={formData.user_user}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="user_password" className="form-label">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="user_password"
                      name="user_password"
                      value={formData.user_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <div className="form-text text-end">
                      <Link to="/forgot-password" className="text-decoration-none">
                        <i className="fas fa-question-circle me-1"></i>
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
                      Recordarme en este equipo
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
                  <p className="mb-2 text-muted">¿No tienes una cuenta?</p>
                  <Link to="/register" className="btn btn-outline-primary">
                    <i className="fas fa-user-plus me-2"></i>
                    Crear Cuenta
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Tus datos están seguros con nosotros
                  </small>
                </div>

                {/* Información de prueba (solo visible en desarrollo) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3 p-2 bg-light rounded">
                    <small className="text-muted">
                      <strong>Cuentas de prueba:</strong><br />
                      • Cliente: cliente@test.com / 123456<br />
                      • Optómetra: juan.perez@ejemplo.com / juanopto123<br />
                      • Admin: admin@sgaoptica.com / admin123
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login