import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentService } from '../../services/appointment.service'
import axiosInstance from '../../services/axiosConfig'

const VerCitas = () => {
  const navigate = useNavigate()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [optometristId, setOptometristId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        alert('Debes iniciar sesión')
        navigate('/login')
        return
      }
      
      try {
        const userData = JSON.parse(user)
        const role = userData.role_lower || userData.role || ''
        const email = userData.email || userData.user_user || ''
        
        setUserRole(role)
        setUserName(userData.nombre || userData.firstName || 'Usuario')
        setUserEmail(email)
        
        const isOptometrist = role === 'optometrist' || role === 'optometrista'
        const isAdmin = role === 'admin' || role === 'administrador'
        const isClient = !isOptometrist && !isAdmin
        
        // Para optometrista, obtener su ID
        if (isOptometrist) {
          const optometristsRes = await axiosInstance.get('/optometrist')
          const optometrists = optometristsRes.data || []
          const currentOptometrist = optometrists.find(opt => opt.email === email)
          if (currentOptometrist) {
            setOptometristId(currentOptometrist.id)
          } else if (optometrists.length > 0) {
            setOptometristId(optometrists[0].id)
          }
        }
        
        await fetchAppointments(userData, isOptometrist, isAdmin, isClient)
        
      } catch (error) {
        console.error('Error:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuthAndFetch()
  }, [navigate])

  const fetchAppointments = async (userData, isOptometrist, isAdmin, isClient) => {
    try {
      let response
      
      if (isClient) {
        // Cliente: ver solo sus citas
        const customerId = userData.customer_id
        if (!customerId) {
          setCitas([])
          return
        }
        response = await appointmentService.getAppointmentsByCustomer(customerId)
      } 
      else if (isOptometrist && optometristId) {
        // Optometrista: ver citas asignadas a él
        response = await appointmentService.getAppointmentsByOptometrist(optometristId)
      } 
      else if (isAdmin) {
        // Admin: ver todas las citas
        response = await appointmentService.getAllAppointments()
      } 
      else {
        setCitas([])
        return
      }
      
      const citasData = response.data?.data || response.data || []
      setCitas(citasData)
      
    } catch (error) {
      console.error('Error al cargar citas:', error)
      setError('Error al cargar las citas')
    }
  }

  const acceptAppointment = async (appointmentId) => {
    if (!window.confirm('¿Confirmar esta cita?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.updateAppointment(appointmentId, { status: 'CONFIRMED' })
      setSuccess('✅ Cita confirmada')
      const user = JSON.parse(localStorage.getItem('user'))
      const role = user.role_lower || user.role || ''
      const isOpt = role === 'optometrist' || role === 'optometrista'
      await fetchAppointments(user, isOpt, false, false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al confirmar')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectAppointment = async (appointmentId) => {
    if (!window.confirm('¿Rechazar esta cita?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.cancelAppointment(appointmentId)
      setSuccess('❌ Cita rechazada')
      const user = JSON.parse(localStorage.getItem('user'))
      const role = user.role_lower || user.role || ''
      const isOpt = role === 'optometrist' || role === 'optometrista'
      await fetchAppointments(user, isOpt, false, false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al rechazar')
    } finally {
      setActionLoading(null)
    }
  }

  const completeAppointment = async (appointmentId) => {
    if (!window.confirm('¿Marcar como completada?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.updateAppointment(appointmentId, { status: 'COMPLETED' })
      setSuccess('✅ Cita completada')
      const user = JSON.parse(localStorage.getItem('user'))
      const role = user.role_lower || user.role || ''
      const isOpt = role === 'optometrist' || role === 'optometrista'
      await fetchAppointments(user, isOpt, false, false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al completar')
    } finally {
      setActionLoading(null)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Cancelar esta cita?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.cancelAppointment(appointmentId)
      setSuccess('❌ Cita cancelada')
      const user = JSON.parse(localStorage.getItem('user'))
      const role = user.role_lower || user.role || ''
      const isClient = !(role === 'optometrist' || role === 'optometrista' || role === 'admin' || role === 'administrador')
      await fetchAppointments(user, false, false, isClient)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al cancelar')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase()
    if (s === 'pending' || s === 'pendiente') return 'bg-warning'
    if (s === 'confirmed' || s === 'confirmada') return 'bg-success'
    if (s === 'cancelled' || s === 'cancelada') return 'bg-danger'
    if (s === 'completed' || s === 'completada') return 'bg-secondary'
    return 'bg-info'
  }

  const getStatusText = (status) => {
    const s = status?.toLowerCase()
    if (s === 'pending' || s === 'pendiente') return 'Pendiente'
    if (s === 'confirmed' || s === 'confirmada') return 'Confirmada'
    if (s === 'cancelled' || s === 'cancelada') return 'Cancelada'
    if (s === 'completed' || s === 'completada') return 'Completada'
    return status || 'Pendiente'
  }

  const isOptometrist = userRole === 'optometrist' || userRole === 'optometrista'
  const isAdmin = userRole === 'admin' || userRole === 'administrador'
  const isClient = !isOptometrist && !isAdmin

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '100px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>
            {isOptometrist ? '👨‍⚕️ Gestión de Citas' : isAdmin ? '📋 Todas las Citas' : '📋 Mis Citas'}
          </h1>
          <p className="text-muted">
            {isOptometrist 
              ? `Bienvenido, Dr. ${userName}` 
              : isAdmin
              ? `Bienvenido, ${userName}`
              : `Bienvenido, ${userName}`}
          </p>
        </div>
        
        {isClient && (
          <Link to="/citas/nueva" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Nueva Cita
          </Link>
        )}
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="fas fa-check-circle me-2"></i>{success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {citas.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">📅</div>
          <h3>
            {isOptometrist 
              ? 'No hay citas agendadas contigo' 
              : isAdmin
              ? 'No hay citas en el sistema'
              : 'No tienes citas agendadas'}
          </h3>
          <p className="text-muted mb-4">
            {isOptometrist 
              ? 'Espera a que los pacientes agenden citas contigo' 
              : isAdmin
              ? 'Los clientes agendarán citas próximamente'
              : 'Agenda tu primera cita con nosotros'}
          </p>
          {isClient && (
            <Link to="/citas/nueva" className="btn btn-primary btn-lg">
              <i className="fas fa-calendar-plus me-2"></i>
              Agendar Mi Primera Cita
            </Link>
          )}
        </div>
      ) : (
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">
              <i className="fas fa-calendar-alt me-2"></i>
              {isOptometrist ? 'Citas Programadas' : isAdmin ? 'Todas las Citas' : 'Mis Citas'}
              <span className="badge bg-light text-dark ms-2">{citas.length}</span>
            </h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    {(isOptometrist || isAdmin) && <th>Paciente</th>}
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Tipo de Examen</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(cita => (
                    <tr key={cita.appointment_id || cita.id}>
                      {(isOptometrist || isAdmin) && (
                        <td>
                          <strong>
                            {cita.Customer?.firstName} {cita.Customer?.firstLastName}
                          </strong>
                          <br/>
                          <small className="text-muted">
                            <i className="fas fa-phone me-1"></i>
                            {cita.Customer?.phoneNumber || 'No especificado'}
                          </small>
                        </td>
                      )}
                      <td>{new Date(cita.date).toLocaleDateString('es-CO')}</td>
                      <td>{cita.time}</td>
                      <td>{cita.ExamType?.name || 'No especificado'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(cita.status)}`}>
                          {getStatusText(cita.status)}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {/* OPTOMETRISTA */}
                        {isOptometrist && (
                          <>
                            {(cita.status === 'PENDING' || cita.status === 'pendiente') && (
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-success"
                                  onClick={() => acceptAppointment(cita.appointment_id || cita.id)}
                                  disabled={actionLoading === (cita.appointment_id || cita.id)}
                                >
                                  {actionLoading === (cita.appointment_id || cita.id) ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <><i className="fas fa-check me-1"></i> Aceptar</>
                                  )}
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  onClick={() => rejectAppointment(cita.appointment_id || cita.id)}
                                  disabled={actionLoading === (cita.appointment_id || cita.id)}
                                >
                                  <i className="fas fa-times me-1"></i> Rechazar
                                </button>
                              </div>
                            )}
                            
                            {(cita.status === 'CONFIRMED' || cita.status === 'confirmada') && (
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => completeAppointment(cita.appointment_id || cita.id)}
                                disabled={actionLoading === (cita.appointment_id || cita.id)}
                              >
                                {actionLoading === (cita.appointment_id || cita.id) ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="fas fa-clipboard-check me-1"></i> Completar</>
                                )}
                              </button>
                            )}
                            
                            {(cita.status === 'COMPLETED' || cita.status === 'completada') && (
                              <span className="text-success small">
                                <i className="fas fa-check-circle me-1"></i> Atendida
                              </span>
                            )}
                            
                            {(cita.status === 'CANCELLED' || cita.status === 'cancelada') && (
                              <span className="text-muted small">
                                <i className="fas fa-ban me-1"></i> Cancelada
                              </span>
                            )}
                          </>
                        )}
                        
                        {/* CLIENTE */}
                        {isClient && (
                          <>
                            {(cita.status === 'PENDING' || cita.status === 'pendiente') && (
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => cancelAppointment(cita.appointment_id || cita.id)}
                                disabled={actionLoading === (cita.appointment_id || cita.id)}
                              >
                                {actionLoading === (cita.appointment_id || cita.id) ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="fas fa-times me-1"></i> Cancelar</>
                                )}
                              </button>
                            )}
                            
                            {(cita.status === 'CONFIRMED' || cita.status === 'confirmada') && (
                              <span className="text-success small">
                                <i className="fas fa-check-circle me-1"></i> Confirmada
                              </span>
                            )}
                            
                            {(cita.status === 'COMPLETED' || cita.status === 'completada') && (
                              <span className="text-info small">
                                <i className="fas fa-clipboard-check me-1"></i> Completada
                              </span>
                            )}
                            
                            {(cita.status === 'CANCELLED' || cita.status === 'cancelada') && (
                              <span className="text-muted small">
                                <i className="fas fa-ban me-1"></i> Cancelada
                              </span>
                            )}
                          </>
                        )}
                        
                        {/* ADMIN */}
                        {isAdmin && (
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate(`/admin/citas/${cita.appointment_id || cita.id}`)}
                          >
                            <i className="fas fa-edit me-1"></i> Gestionar
                          </button>
                        )}
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i> Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default VerCitas