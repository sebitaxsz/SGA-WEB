import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentService } from '../../services/appointment.service'

const VerCitas = () => {
  const navigate = useNavigate()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        alert('Debes iniciar sesión para ver las citas')
        navigate('/login')
        return
      }
      
      try {
        const userData = JSON.parse(user)
        setUserRole(userData.role)
        setUserName(userData.nombre)
        
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
      
      // Si es usuario normal, obtener solo sus citas
      if (userData.role === 'user') {
        const customerId = userData.customer_id
        if (!customerId) {
          throw new Error('No se encontró información del cliente')
        }
        response = await appointmentService.getAppointmentsByCustomer(customerId)
      } 
      // Si es optometrista o admin, obtener todas las citas
      else {
        response = await appointmentService.getAllAppointments()
      }
      
      setCitas(response.data)
    } catch (error) {
      console.error('Error al cargar citas:', error)
      setError('Error al cargar las citas. Por favor intenta nuevamente.')
    }
  }

  const cancelarCita = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return
    }
    
    // Solo usuarios pueden cancelar citas
    if (userRole !== 'user') {
      alert('Solo los clientes pueden cancelar citas')
      return
    }
    
    try {
      await appointmentService.cancelAppointment(id)
      
      alert('Cita cancelada exitosamente')
      // Recargar citas
      const user = JSON.parse(localStorage.getItem('user'))
      await fetchAppointments(user)
    } catch (error) {
      console.error('Error al cancelar cita:', error)
      
      if (error.response?.status === 400) {
        alert('No se puede cancelar una cita que ya fue cancelada')
      } else {
        alert('Error al cancelar la cita. Por favor intenta nuevamente.')
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'pendiente': 'bg-warning',
      'confirmada': 'bg-success',
      'cancelada': 'bg-danger',
      'completada': 'bg-secondary'
    }
    return statusMap[status?.toLowerCase()] || 'bg-info'
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'completada': 'Completada'
    }
    return statusMap[status?.toLowerCase()] || status || 'Pendiente'
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
            {userRole === 'optometrist' ? '📋 Citas Agendadas' : '📋 Mis Citas'}
          </h1>
          {userRole === 'optometrist' && (
            <p className="text-muted">Bienvenido, {userName}</p>
          )}
        </div>
        
        {userRole === 'user' && (
          <Link to="/citas/nueva" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Nueva Cita
          </Link>
        )}
      </div>

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

      {citas.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">📅</div>
          <h3>
            {userRole === 'optometrist' 
              ? 'No hay citas agendadas' 
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
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        {userRole === 'optometrist' && <th>Paciente</th>}
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Tipo de Examen</th>
                        <th>Optometrista</th>
                        <th>Estado</th>
                        {userRole === 'user' && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map(cita => (
                        <tr key={cita.appointment_id}>
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
                          <td>{new Date(cita.date).toLocaleDateString()}</td>
                          <td>{cita.time}</td>
                          <td>{cita.ExamType?.name || 'No especificado'}</td>
                          <td>
                            {cita.Optometrist?.firstName} {cita.Optometrist?.firstLastName}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(cita.status)}`}>
                              {getStatusText(cita.status)}
                            </span>
                          </td>
                          {userRole === 'user' && cita.status !== 'cancelada' && (
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => cancelarCita(cita.appointment_id)}
                                  disabled={cita.status === 'cancelada'}
                                >
                                  <i className="fas fa-times me-1"></i> 
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card mt-4 bg-light">
              <div className="card-body">
                <h5>
                  <i className="fas fa-headset me-2 text-primary"></i>
                  ¿Necesitas ayuda?
                </h5>
                <p className="mb-0">
                  Para reagendar o consultar sobre tus citas, contáctanos al 
                  <strong> (601) 123-4567</strong> o escribe a 
                  <strong> citas@opticasga.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default VerCitas