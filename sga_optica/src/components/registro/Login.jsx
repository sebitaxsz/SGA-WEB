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

  // 🔧 Función para obtener customer_id numérico desde la tabla customer
  const getNumericCustomerId = async (userId) => {
    try {
      const response = await fetch('https://7l77sjp2-3002.use2.devtunnels.ms/api/v1/customer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const customers = await response.json()
      const customer = customers.find(c => c.idUser === userId)
      return customer ? customer.customer_id : null
    } catch (error) {
      console.error('Error obteniendo customer_id:', error)
      return null
    }
  }

  // 🔧 Función para obtener optometrist_id numérico
  const getNumericOptometristId = async (userId) => {
    try {
      const response = await fetch('https://7l77sjp2-3002.use2.devtunnels.ms/api/v1/optometrist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const optometrists = await response.json()
      const optometrist = optometrists.find(o => o.idUser === userId)
      return optometrist ? optometrist.id : null
    } catch (error) {
      console.error('Error obteniendo optometrist_id:', error)
      return null
    }
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
      const inputEmail = formData.user_user.toLowerCase()
      
      // ============================================
      // 📧 EMAILS CONOCIDOS PARA DETECCIÓN MANUAL
      // ============================================
      const adminEmails = ['marlonadmin@gmail.com', 'admin@sgaoptica.com', 'administrador@sgaoptica.com']
      const optometristEmails = ['juan.perez@ejemplo.com']
      
      // ============================================
      // 🎯 DETECCIÓN DE ROLES
      // ============================================
      let userRole = 'user'
      let isOptometrist = false
      let customerId = null
      let optometristData = null
      let nombreCompleto = user.username || inputEmail.split('@')[0] || 'Usuario'
      
      // 1️⃣ DETECTAR ADMIN (por email o role_id)
      if (adminEmails.includes(inputEmail) || user.role_id === 1) {
        userRole = 'admin'
        console.log('👑 ADMIN detectado')
        nombreCompleto = 'Administrador'
      } 
      // 2️⃣ DETECTAR OPTOMETRISTA (por email o role_id)
      else if (optometristEmails.includes(inputEmail) || user.role_id === 3) {
        userRole = 'optometrist'
        isOptometrist = true
        console.log('👨‍⚕️ OPTOMETRISTA detectado')
        
        // Obtener el optometrist_id numérico
        const numericOptoId = await getNumericOptometristId(user.user_id)
        
        if (user.entity) {
          optometristData = {
            id: numericOptoId || user.entity.id || 1,
            documentNumber: user.entity.document_number,
            firstName: user.entity.first_name || 'Juan',
            firstLastName: user.entity.first_last_name || 'Perez',
            email: user.entity.email || inputEmail,
            professionalCardCode: user.entity.professional_card_code || 'PROF-001',
            phoneNumber: user.entity.phone_number
          }
          nombreCompleto = `${optometristData.firstName} ${optometristData.firstLastName}`.trim()
        } else {
          optometristData = {
            id: numericOptoId || 1,
            firstName: 'Juan',
            firstLastName: 'Perez',
            email: inputEmail,
            professionalCardCode: 'PROF-001'
          }
          nombreCompleto = 'Juan Perez'
        }
        console.log('📋 Optometrista ID:', optometristData.id)
      } 
      // 3️⃣ DETECTAR CLIENTE (por defecto)
      else {
        userRole = 'user'
        console.log('👤 CLIENTE detectado')
        
        // Obtener el customer_id numérico
        customerId = await getNumericCustomerId(user.user_id)
        
        if (user.entity) {
          nombreCompleto = `${user.entity.first_name || ''} ${user.entity.first_last_name || ''}`.trim()
        }
        
        if (nombreCompleto === '' || nombreCompleto === 'Usuario') {
          nombreCompleto = user.username || inputEmail.split('@')[0] || 'Cliente'
        }
        
        console.log('📋 Customer ID:', customerId)
      }
      
      // ============================================
      // 💾 GUARDAR DATOS EN LOCALSTORAGE
      // ============================================
      const userData = {
        user_id: user.user_id,
        user_uuid: user.user_uuid,
        nombre: nombreCompleto,
        email: inputEmail,
        user_user: inputEmail,
        username: user.username,
        role: userRole,
        role_id: user.role_id,
        customer_id: customerId,
        is_optometrist: isOptometrist,
        optometrist_data: optometristData,
        entity: user.entity,
        permissions: user.permissions || []
      }
      
      console.log('=== DATOS GUARDADOS ===')
      console.log('Rol:', userRole)
      console.log('Customer ID:', customerId)
      console.log('Optometrist ID:', optometristData?.id)
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new Event('storage'))
      
      // ============================================
      // 🚀 REDIRECCIÓN POST-LOGIN
      // ============================================
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      
      console.log('=== REDIRIGIENDO ===')
      console.log('Rol detectado:', userRole)
      
      if (redirectAfterLogin) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectAfterLogin);
      } 
      else if (userRole === 'admin') {
        console.log('🚀 Redirigiendo a /admin')
        navigate('/admin')
      } 
      else if (userRole === 'optometrist') {
        console.log('🚀 Redirigiendo a /citas/ver')
        navigate('/citas/ver')
      } 
      else {
        console.log('🚀 Redirigiendo a /')
        navigate('/')
      }
      
    } catch (err) {
      console.error('=== ERROR EN LOGIN ===', err)
      
      if (err.response) {
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

                {/* Cuentas de prueba */}
                <div className="mt-3 p-3 bg-light rounded small">
                  <strong className="text-primary">📋 Cuentas de prueba:</strong>
                  <div className="mt-2">
                    <div className="mb-2">
                      <strong>👤 Cliente:</strong><br />
                      📧 marlon4753@gmail.com<br />
                      🔑 marlon02
                    </div>
                    <div className="mb-2">
                      <strong>👨‍⚕️ Optómetra:</strong><br />
                      📧 juan.perez@ejemplo.com<br />
                      🔑 juanopto123<br />
                      🆔 ID: 1 | Código: PROF-001
                    </div>
                    <div>
                      <strong>👑 Administrador:</strong><br />
                      📧 marlonadmin@gmail.com<br />
                      🔑 marlonad02
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login