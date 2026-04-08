import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentService } from '../../services/appointment.service'

const PerfilOptometrista = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        navigate('/login')
        return
      }
      
      try {
        const userData = JSON.parse(user)
        
        // Verificar que sea optometrista
        if (userData.role !== 'optometrist') {
          alert('Acceso no autorizado')
          navigate('/')
          return
        }
        
        // Obtener datos del optometrista desde localStorage o API
        if (userData.optometrist_data) {
          setProfile(userData.optometrist_data)
        } else if (userData.entity) {
          setProfile(userData.entity)
        }
        
        // Obtener todas las citas para estadísticas
        const appointmentsRes = await appointmentService.getAllAppointments()
        const appointments = appointmentsRes.data
        
        // Filtrar citas de este optometrista
        const optometristId = userData.optometrist_data?.id || userData.entity?.id
        const optometristAppointments = appointments.filter(
          apt => apt.optometrist_id === optometristId
        )
        
        setStats({
          total: optometristAppointments.length,
          pending: optometristAppointments.filter(apt => apt.status === 'pendiente').length,
          completed: optometristAppointments.filter(apt => apt.status === 'completada').length
        })
      } catch (error) {
        console.error('Error al cargar perfil:', error)
        setError('Error al cargar el perfil del optometrista')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [navigate])

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '100px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5" style={{ marginTop: '100px' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h2 className="mb-0">
                <i className="fas fa-user-md me-2"></i>
                Perfil Profesional - Optómetra
              </h2>
            </div>
            <div className="card-body">
              {profile && (
                <>
                  <div className="text-center mb-4">
                    <div className="display-1">
                      <i className="fas fa-user-circle text-info"></i>
                    </div>
                    <h3>{profile.firstName} {profile.firstLastName}</h3>
                    <p className="text-muted">Optómetra Profesional</p>
                  </div>
                  
                  <hr />
                  
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="text-info">
                        <i className="fas fa-id-card me-2"></i>
                        Información Personal
                      </h5>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <th>Tipo de Documento:</th>
                            <td>Cédula de Ciudadanía (CC)</td>
                          </tr>
                          <tr>
                            <th>Número de Documento:</th>
                            <td>
                              <strong>{profile.documentNumber || '1234567890'}</strong>
                            </td>
                          </tr>
                          <tr>
                            <th>Email:</th>
                            <td>{profile.email || 'juan.perez@ejemplo.com'}</td>
                          </tr>
                          <tr>
                            <th>Teléfono:</th>
                            <td>{profile.phoneNumber || 'No registrado'}</td>
                          </tr>
                          <tr>
                            <th>Código de Tarjeta Profesional:</th>
                            <td>
                              <span className="badge bg-info fs-6">
                                {profile.professionalCardCode || 'PROF-001'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="col-md-6">
                      <h5 className="text-info">
                        <i className="fas fa-chart-line me-2"></i>
                        Estadísticas de Citas
                      </h5>
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="border rounded p-3 bg-light">
                            <h3 className="text-primary mb-0">{stats.total}</h3>
                            <small className="text-muted">Total Citas</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="border rounded p-3 bg-light">
                            <h3 className="text-warning mb-0">{stats.pending}</h3>
                            <small className="text-muted">Pendientes</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="border rounded p-3 bg-light">
                            <h3 className="text-success mb-0">{stats.completed}</h3>
                            <small className="text-muted">Completadas</small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-info bg-opacity-10 rounded">
                        <h6 className="text-info">
                          <i className="fas fa-clock me-2"></i>
                          Horario de Atención
                        </h6>
                        <p className="mb-0 small">
                          Lunes a Viernes: 9:00 AM - 12:00 PM, 2:00 PM - 6:00 PM<br />
                          Sábados: 9:00 AM - 1:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="text-center mt-3">
                    <Link to="/citas/ver" className="btn btn-primary me-2">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Ver Citas Agendadas
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary">
                      <i className="fas fa-home me-2"></i>
                      Volver al Inicio
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerfilOptometrista