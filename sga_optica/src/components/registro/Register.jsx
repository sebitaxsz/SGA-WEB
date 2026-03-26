import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
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
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono debe tener 10 dígitos'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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
      // Simular registro
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Guardar usuario simulado
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        role: 'user',
        fechaRegistro: new Date().toISOString()
      }

      localStorage.setItem('user', JSON.stringify(userData))
      
      alert('¡Registro exitoso! Bienvenido a S.G.A Óptica')
      navigate('/') // Redirigir al inicio
      
  } catch (error) {  // <-- Aquí se usa la variable
    console.error('Error en registro:', error);
    setErrors({ general: 'Error en el registro. Intenta nuevamente.' });
  } finally {
    setLoading(false);
  }
};

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
                <div className="alert alert-danger">{errors.general}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Tu apellido"
                    />
                    {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@email.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contraseña *</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirmar Contraseña *</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
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