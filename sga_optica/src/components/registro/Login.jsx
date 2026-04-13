import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import axiosInstance from '../../services/axiosConfig'

const ADMIN_ROLES = ['administrador', 'admin']
const OPTOMETRIST_ROLES = ['optometrista', 'optometrist']

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

  // Función para obtener el customer por user_id
  const getCustomerByUserId = async (userId) => {
    try {
      const response = await axiosInstance.get(`/customer/user/${userId}`)
      return response.data
    } catch (error) {
      console.log('No se encontró customer para este usuario:', userId)
      return null
    }
  }

  // Función para verificar si el usuario es optometrista
  const checkIfOptometrist = async (email) => {
    try {
      const response = await axiosInstance.get('/optometrist')
      const optometrists = response.data || []
      const isOptometrist = optometrists.some(opt => opt.email === email)
      return isOptometrist
    } catch (error) {
      console.error('Error verificando optometrista:', error)
      return false
    }
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

      const roleFromApi = user.role || ''
      const roleLower = roleFromApi.toLowerCase()
      const isAdmin = ADMIN_ROLES.includes(roleLower)
      
      // Verificar si es optometrista
      let isOptometrist = OPTOMETRIST_ROLES.includes(roleLower)
      
      if (!isOptometrist && !isAdmin) {
        const userEmail = user.username || formData.user_user
        isOptometrist = await checkIfOptometrist(userEmail)
      }
      
      const isClient = !isAdmin && !isOptometrist
      
      // Obtener datos del customer si es cliente
      let customerData = null
      if (isClient) {
        customerData = await getCustomerByUserId(user.user_id)
      }

      // Construir objeto userData con TODOS los campos necesarios
      const userData = {
        user_id:    user.user_id,
        user_user:  user.username,
        email:      user.username,
        // Datos básicos
        nombre:     customerData?.firstName || user.entity?.first_name || user.username,
        apellido:   customerData?.firstLastName || user.entity?.last_name || '',
        // Datos completos del customer (para EditarPerfil)
        firstName:  customerData?.firstName || '',
        secondName: customerData?.secondName || '',
        firstLastName: customerData?.firstLastName || '',
        secondLastName: customerData?.secondLastName || '',
        phoneNumber: customerData?.phoneNumber || '',
        address:    customerData?.address || '',
        // Roles
        role:       roleFromApi,
        role_lower: roleLower,
        is_admin:   isAdmin,
        is_optometrist: isOptometrist,
        is_client:  isClient,
        customer_id: customerData?.customer_id || user.entity?.customer_id || null
      }

      // Guardar en localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      if (formData.rememberMe) localStorage.setItem('rememberMe', 'true')

      // Redirigir según rol
      if (isAdmin) {
        navigate('/admin')
      } else if (isOptometrist) {
        navigate('/gestion-citas')
      } else {
        navigate('/')
      }

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
                    type="email" 
                    className="form-control" 
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
                    autoComplete="current-password"
                  />
                  <div className="form-text text-end">
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