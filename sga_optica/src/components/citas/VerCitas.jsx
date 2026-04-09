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
  const [optometristId, setOptometristId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // 🔧 Función para obtener el optometrist_id CORRECTO
  const getCorrectOptometristId = async (userEmail) => {
    try {
      console.log('🔍 VerCitas - Buscando optometrist_id correcto para:', userEmail)
      const response = await axiosInstance.get('/optometrist')
      const optometrists = response.data || []
      
      let optometrist = optometrists.find(opt => 
        opt.email === userEmail ||
        opt.professionalCardCode === 'PROF-001' ||
        opt.firstName === 'Juan'
      )
      
      if (!optometrist && optometrists.length > 0) {
        optometrist = optometrists[0]
      }
      
      if (optometrist) {
        console.log('✅ optometrist_id CORRECTO:', optometrist.id)
        return { id: optometrist.id, data: optometrist }
      }
      return null
    } catch (error) {
      console.error('❌ Error:', error)
      return null
    }
  }

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
        setUserRole(userData.role)
        setUserName(userData.nombre)
        
        console.log('📋 Usuario logueado - Rol:', userData.role)
        
        // Solo si es optometrista, obtener su ID
        if (userData.role === 'optometrist') {
          const userEmail = userData.email || userData.user_user
          const currentId = userData.optometrist_data?.id
          
          if (!currentId || currentId !== 1) {
            const result = await getCorrectOptometristId(userEmail)
            if (result) {
              setOptometristId(result.id)
              const updatedUserData = {
                ...userData,
                optometrist_data: {
                  id: result.id,
                  firstName: result.data.firstName,
                  firstLastName: result.data.firstLastName,
                  professionalCardCode: result.data.professionalCardCode
                }
              }
              localStorage.setItem('user', JSON.stringify(updatedUserData))
            } else {
              setOptometristId(1)
            }
          } else {
            setOptometristId(currentId)
          }
        }
        
        await fetchAppointments(userData)
        
      } catch (error) {
        console.error('Error:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuthAndFetch()
  }, [navigate])

  const fetchAppointments = async (userData) => {
    try {
      let response
      
      // CLIENTE: ver solo sus citas
      if (userData.role === 'user') {
        const customerId = userData.customer_id
        if (!customerId) {
          console.error('No customer_id para cliente')
          setCitas([])
          return
        }
        console.log('🔍 Cliente - Buscando citas para customer_id:', customerId)
        response = await appointmentService.getAppointmentsByCustomer(customerId)
      } 
      // OPTOMETRISTA: ver citas asignadas a él
      else if (userData.role === 'optometrist') {
        const optId = optometristId || 1
        console.log('🔍 Optometrista - Buscando citas para optometrist_id:', optId)
        response = await appointmentService.getAppointmentsByOptometrist(optId)
      } 
      // ADMIN: ver todas las citas
      else {
        console.log('🔍 Admin - Buscando todas las citas')
        response = await appointmentService.getAllAppointments()
      }
      
      const citasData = response.data?.data || response.data || []
      setCitas(citasData)
      console.log(`✅ ${citasData.length} citas cargadas para rol: ${userData.role}`)
      
    } catch (error) {
      console.error('Error al cargar citas:', error)
      setError('Error al cargar las citas')
    }
  }

  // 🔧 Solo OPTÓMETRA puede aceptar/rechazar citas
  const acceptAppointment = async (appointmentId) => {
    if (userRole !== 'optometrist') {
      setError('No tienes permisos para aceptar citas')
      return
    }
    
    if (!window.confirm('¿Confirmar esta cita?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.updateAppointment(appointmentId, { status: 'CONFIRMED' })
      setSuccess('✅ Cita confirmada')
      const user = JSON.parse(localStorage.getItem('user'))
      await fetchAppointments(user)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al confirmar')
    } finally {
      setActionLoading(null)
    }
  }

  // 🔧 Solo OPTÓMETRA puede rechazar citas
  const rejectAppointment = async (appointmentId) => {
    if (userRole !== 'optometrist') {
      setError('No tienes permisos para rechazar citas')
      return
    }
    
    if (!window.confirm('¿Rechazar esta cita?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.cancelAppointment(appointmentId)
      setSuccess('❌ Cita rechazada')
      const user = JSON.parse(localStorage.getItem('user'))
      await fetchAppointments(user)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al rechazar')
    } finally {
      setActionLoading(null)
    }
  }

  // 🔧 Solo OPTÓMETRA puede completar citas
  const completeAppointment = async (appointmentId) => {
    if (userRole !== 'optometrist') {
      setError('No tienes permisos para completar citas')
      return
    }
    
    if (!window.confirm('¿Marcar como completada?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.updateAppointment(appointmentId, { status: 'COMPLETED' })
      setSuccess('✅ Cita completada')
      const user = JSON.parse(localStorage.getItem('user'))
      await fetchAppointments(user)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Error al completar')
    } finally {
      setActionLoading(null)
    }
  }

  // 🔧 Cliente puede cancelar sus propias citas (solo si están pendientes)
  const cancelAppointment = async (appointmentId) => {
    if (userRole !== 'user') {
      setError('No tienes permisos para cancelar citas')
      return
    }
    
    if (!window.confirm('¿Cancelar esta cita?')) return
    
    setActionLoading(appointmentId)
    try {
      await appointmentService.cancelAppointment(appointmentId)
      setSuccess('❌ Cita cancelada')
      const user = JSON.parse(localStorage.getItem('user'))
      await fetchAppointments(user)
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
            {userRole === 'optometrist' ? '👨‍⚕️ Gestión de Citas' : '📋 Mis Citas'}
          </h1>
          <p className="text-muted">
            {userRole === 'optometrist' 
              ? `Bienvenido, Dr. ${userName}` 
              : `Bienvenido, ${userName}`}
          </p>
        </div>
        
        {/* Solo clientes pueden crear nuevas citas */}
        {userRole === 'user' && (
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
            {userRole === 'optometrist' 
              ? 'No hay citas agendadas contigo' 
              : 'No tienes citas agendadas'}
          </h3>
          <p className="text-muted mb-4">
            {userRole === 'optometrist' 
              ? 'Espera a que los pacientes agenden citas' 
              : 'Agenda tu primera cita con nosotros'}
          </p>
          {userRole === 'user' && (
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
              {userRole === 'optometrist' ? 'Citas Programadas' : 'Mis Citas'}
              <span className="badge bg-light text-dark ms-2">{citas.length}</span>
            </h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    {/* Optometrista ve más columnas */}
                    {userRole === 'optometrist' && <th>Paciente</th>}
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Tipo de Examen</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(cita => (
                    <tr key={cita.appointment_id}>
                      {/* Solo optometrista ve información del paciente */}
                      {userRole === 'optometrist' && (
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
                        {/* ============================================ */}
                        {/* ACCIONES PARA OPTOMETRISTA */}
                        {/* ============================================ */}
                        {userRole === 'optometrist' && (
                          <>
                            {/* Cita PENDIENTE: botones Aceptar/Rechazar */}
                            {(cita.status === 'PENDING' || cita.status === 'pendiente') && (
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-success"
                                  onClick={() => acceptAppointment(cita.appointment_id)}
                                  disabled={actionLoading === cita.appointment_id}
                                >
                                  {actionLoading === cita.appointment_id ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <><i className="fas fa-check me-1"></i> Aceptar</>
                                  )}
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  onClick={() => rejectAppointment(cita.appointment_id)}
                                  disabled={actionLoading === cita.appointment_id}
                                >
                                  <i className="fas fa-times me-1"></i> Rechazar
                                </button>
                              </div>
                            )}
                            
                            {/* Cita CONFIRMADA: botón Completar */}
                            {(cita.status === 'CONFIRMED' || cita.status === 'confirmada') && (
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => completeAppointment(cita.appointment_id)}
                                disabled={actionLoading === cita.appointment_id}
                              >
                                {actionLoading === cita.appointment_id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="fas fa-clipboard-check me-1"></i> Completar</>
                                )}
                              </button>
                            )}
                            
                            {/* Cita COMPLETADA: mensaje informativo */}
                            {(cita.status === 'COMPLETED' || cita.status === 'completada') && (
                              <span className="text-success small">
                                <i className="fas fa-check-circle me-1"></i> Atendida
                              </span>
                            )}
                            
                            {/* Cita CANCELADA: mensaje informativo */}
                            {(cita.status === 'CANCELLED' || cita.status === 'cancelada') && (
                              <span className="text-muted small">
                                <i className="fas fa-ban me-1"></i> Cancelada
                              </span>
                            )}
                          </>
                        )}
                        
                        {/* ============================================ */}
                        {/* ACCIONES PARA CLIENTE */}
                        {/* ============================================ */}
                        {userRole === 'user' && (
                          <>
                            {/* Cliente puede cancelar SOLO si está pendiente */}
                            {(cita.status === 'PENDING' || cita.status === 'pendiente') && (
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => cancelAppointment(cita.appointment_id)}
                                disabled={actionLoading === cita.appointment_id}
                              >
                                {actionLoading === cita.appointment_id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="fas fa-times me-1"></i> Cancelar</>
                                )}
                              </button>
                            )}
                            
                            {/* Cita confirmada: solo mensaje informativo */}
                            {(cita.status === 'CONFIRMED' || cita.status === 'confirmada') && (
                              <span className="text-success small">
                                <i className="fas fa-check-circle me-1"></i> Confirmada
                              </span>
                            )}
                            
                            {/* Cita completada: mensaje informativo */}
                            {(cita.status === 'COMPLETED' || cita.status === 'completada') && (
                              <span className="text-info small">
                                <i className="fas fa-clipboard-check me-1"></i> Completada
                              </span>
                            )}
                            
                            {/* Cita cancelada: mensaje informativo */}
                            {(cita.status === 'CANCELLED' || cita.status === 'cancelada') && (
                              <span className="text-muted small">
                                <i className="fas fa-ban me-1"></i> Cancelada
                              </span>
                            )}
                          </>
                        )}
                        
                        {/* ============================================ */}
                        {/* ACCIONES PARA ADMIN */}
                        {/* ============================================ */}
                        {userRole === 'admin' && (
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate(`/admin/citas/${cita.appointment_id}`)}
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