import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmar_contrasena: '',
    aceptaTerminos: false,
    recibirOfertas: true
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Email inválido'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono debe tener 10 dígitos'
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida'
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'Mínimo 6 caracteres'
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      newErrors.confirmar_contrasena = 'Las contraseñas no coinciden'
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos y condiciones'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formErrors = validateForm()
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      console.log('Enviando datos de registro:', {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        contrasena: formData.contrasena,
        confirmar_contrasena: formData.confirmar_contrasena
      })

      const response = await authService.register({
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        contrasena: formData.contrasena,
        confirmar_contrasena: formData.confirmar_contrasena
      })
      
      console.log('Respuesta del registro:', response.data)
      
      alert('¡Registro exitoso! Bienvenido a S.G.A Óptica')
      navigate('/login')
      
    } catch (error) {
      console.error('Error en registro:', error)
      console.error('Respuesta del error:', error.response?.data)
      
      let mensajeError = 'Error en el registro. Intenta nuevamente.'
      
      if (error.response) {
        mensajeError = error.response.data?.message || 
                       error.response.data?.error || 
                       `Error ${error.response.status}: ${error.response.statusText}`
      } else if (error.request) {
        mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión.'
      } else {
        mensajeError = error.message || 'Error desconocido'
      }
      
      setErrors({ general: mensajeError })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center py-4">
              <h2 className="mb-0">👤 Crear Cuenta</h2>
              <p className="mb-0 mt-2">Únete a S.G.A Óptica y disfruta de beneficios exclusivos</p>
            </div>
            
            <div className="card-body p-4">
              {errors.general && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      disabled={loading}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="ejemplo@email.com"
                      disabled={loading}
                    />
                    {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="3001234567"
                      disabled={loading}
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contraseña *</label>
                    <input
                      type="password"
                      className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      disabled={loading}
                    />
                    {errors.contrasena && <div className="invalid-feedback">{errors.contrasena}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirmar Contraseña *</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmar_contrasena ? 'is-invalid' : ''}`}
                      name="confirmar_contrasena"
                      value={formData.confirmar_contrasena}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      disabled={loading}
                    />
                    {errors.confirmar_contrasena && (
                      <div className="invalid-feedback">{errors.confirmar_contrasena}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className={`form-check ${errors.aceptaTerminos ? 'is-invalid' : ''}`}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="aceptaTerminos"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="aceptaTerminos">
                      Acepto los <Link to="/terminos" className="text-decoration-none">Términos y Condiciones</Link> 
                      y la <Link to="/privacidad" className="text-decoration-none">Política de Privacidad</Link> *
                    </label>
                  </div>
                  {errors.aceptaTerminos && (
                    <div className="invalid-feedback d-block">{errors.aceptaTerminos}</div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="recibirOfertas"
                      name="recibirOfertas"
                      checked={formData.recibirOfertas}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="recibirOfertas">
                      Quiero recibir ofertas exclusivas y novedades por email
                    </label>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Crear Cuenta
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="mb-2">¿Ya tienes una cuenta?</p>
                <Link to="/login" className="btn btn-outline-primary">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Iniciar Sesión
                </Link>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <h6>✅ Beneficios de registrarte:</h6>
                <ul className="mb-0">
                  <li>Seguimiento de tus pedidos</li>
                  <li>Historial de compras</li>
                  <li>Ofertas exclusivas para miembros</li>
                  <li>Agendar y gestionar citas fácilmente</li>
                  <li>Acceso rápido al carrito de compras</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register