// src/components/ForgotPassword.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import Navbar from '../Navbar'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [backupCode, setBackupCode] = useState('')  // ← Agregar estado para el código

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBackupCode('')  // ← Limpiar código anterior
    setLoading(true)

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico')
      setLoading(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un email válido')
      setLoading(false)
      return
    }

    try {
      const response = await authService.requestPasswordReset(email)
      
      console.log('📦 Respuesta completa:', response.data)  // ← Ver en consola
      
      localStorage.setItem('resetEmail', email)
      
      // ✅ Mostrar el código si viene en la respuesta
      if (response.data.code) {
        setBackupCode(response.data.code)
        localStorage.setItem('resetCode', response.data.code)
        setSuccess(`⚠️ Correo de prueba. Tu código es: ${response.data.code}`)
      } else if (response.data.message) {
        setSuccess(response.data.message)
      } else {
        setSuccess(`Se ha enviado un código de verificación a ${email}`)
      }
      
      setTimeout(() => {
        navigate('/reset-password')
      }, 4000)  // ← Aumentado a 4 segundos para leer el código

    } catch (err) {
      console.error('❌ Error:', err.response?.data)
      setError(err.response?.data?.message || 'Error al solicitar recuperación')
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
            <div className="card-header bg-warning text-dark text-center py-4">
              <h2 className="mb-0">🔐 Recuperar Contraseña</h2>
              <p className="mb-0 mt-2">Te enviaremos un código para restablecer tu contraseña</p>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
              )}

              {/* ✅ Mostrar el código de respaldo de forma destacada */}
              {backupCode && (
                <div className="alert alert-info text-center" style={{ backgroundColor: '#e3f2fd', border: '2px solid #0066cc' }}>
                  <i className="fas fa-key me-2"></i>
                  <strong>Código de verificación (copia este número):</strong>
                  <h1 className="mt-2 mb-0" style={{ 
                    fontSize: '48px', 
                    letterSpacing: '8px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: '#0066cc'
                  }}>
                    {backupCode}
                  </h1>
                  <small className="text-muted">Este código expira en 15 minutos</small>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                  <div className="form-text">
                    Ingresa el correo con el que te registraste
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-warning btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Enviar Código
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none">
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword