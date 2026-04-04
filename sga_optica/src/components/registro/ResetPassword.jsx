import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import Navbar from '../Navbar'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail')
    if (!savedEmail) {
      navigate('/forgot-password')
    } else {
      setEmail(savedEmail)
    }
  }, [navigate])

  const verifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!code.trim()) {
      setError('Por favor ingresa el código de verificación')
      setLoading(false)
      return
    }

    try {
      await authService.verifyResetCode(email, code)
      setStep(2)
      setSuccess('Código verificado correctamente')
    } catch (err) {
      setError(err.response?.data?.message || 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!newPassword) {
      setError('La contraseña es requerida')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      await authService.resetPassword(email, code, newPassword, confirmPassword)
      
      setSuccess('¡Contraseña restablecida exitosamente!')
      
      localStorage.removeItem('resetEmail')
      localStorage.removeItem('resetCode')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setError('')
    setLoading(true)

    try {
      await authService.requestPasswordReset(email)
      setSuccess('Se ha enviado un nuevo código a tu correo')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar código')
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
            <div className="card-header bg-info text-white text-center py-4">
              <h2 className="mb-0">
                {step === 1 ? '📧 Verificar Código' : '🔑 Nueva Contraseña'}
              </h2>
              <p className="mb-0 mt-2">
                {step === 1 
                  ? `Ingresa el código enviado a ${email}` 
                  : 'Establece tu nueva contraseña'}
              </p>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={verifyCode}>
                  <div className="mb-4">
                    <label htmlFor="code" className="form-label">
                      <i className="fas fa-key me-2"></i>Código de Verificación
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ingresa el código de 6 dígitos"
                      maxLength="6"
                      disabled={loading}
                      style={{ fontSize: '1.5rem', letterSpacing: '4px' }}
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-info btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verificando...
                        </>
                      ) : (
                        'Verificar Código'
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={resendCode}
                      disabled={loading}
                    >
                      Reenviar Código
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={resetPassword}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      <i className="fas fa-lock me-2"></i>Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="fas fa-check-circle me-2"></i>Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu nueva contraseña"
                      disabled={loading}
                    />
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
                          Restableciendo...
                        </>
                      ) : (
                        'Restablecer Contraseña'
                      )}
                    </button>
                  </div>
                </form>
              )}

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

export default ResetPassword