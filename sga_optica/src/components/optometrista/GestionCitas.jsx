import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentService } from '../../services/appointment.service'
import axiosInstance from '../../services/axiosConfig'

const GestionCitas = () => {
  const navigate = useNavigate()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userName, setUserName] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        navigate('/login')
        return
      }
      
      try {
        const userData = JSON.parse(user)
        setUserName(userData.nombre || userData.firstName || 'Optometrista')
        
        // Verificar que sea optometrista
        if (!userData.is_optometrist) {
          navigate('/')
          return
        }
        
        await fetchAppointments()
        
      } catch (error) {
        console.error('Error:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuthAndFetch()
  }, [navigate])

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAllAppointments()
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
      await fetchAppointments()
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
      await fetchAppointments()
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
      await fetchAppointments()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al completar')
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
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">
          <i className="fas fa-calendar-check me-3"></i>
          Gestión de Citas
        </h1>
        <p className="lead text-muted">
          Bienvenido, Dr. {userName}. Aquí puedes gestionar todas las citas agendadas.
        </p>
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
          <h3>No hay citas agendadas</h3>
          <p className="text-muted">Espera a que los pacientes agenden citas contigo.</p>
        </div>
      ) : (
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Todas las Citas
              <span className="badge bg-light text-dark ms-2">{citas.length}</span>
            </h4>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Paciente</th>
                    <th>Contacto</th>
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
                      <td>
                        <strong>{cita.Customer?.firstName} {cita.Customer?.firstLastName}</strong>
                       </td>
                      <td>
                        <small className="text-muted">
                          <i className="fas fa-phone me-1"></i>{cita.Customer?.phoneNumber || '—'}
                          <br />
                          <i className="fas fa-envelope me-1"></i>{cita.Customer?.email || '—'}
                        </small>
                       </td>
                      <td>{new Date(cita.date).toLocaleDateString('es-CO')}</td>
                      <td>{cita.time}</td>
                      <td>{cita.ExamType?.name || 'No especificado'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(cita.status)}`}>
                          {getStatusText(cita.status)}
                        </span>
                       </td>
                      <td className="actions-cell" style={{ whiteSpace: 'nowrap' }}>
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
                          <span className="text-success">
                            <i className="fas fa-check-circle me-1"></i> Atendida
                          </span>
                        )}
                        
                        {(cita.status === 'CANCELLED' || cita.status === 'cancelada') && (
                          <span className="text-muted">
                            <i className="fas fa-ban me-1"></i> Cancelada
                          </span>
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
    </div>
  )
}

export default GestionCitas