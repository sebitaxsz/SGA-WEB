import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentService } from '../../services/appointment.service'
import { formulaService } from '../../services/formula.service'

const PerfilOptometrista = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('perfil')

  // Fórmulas con info de clientes
  const [formulasData, setFormulasData] = useState([])
  const [formulasLoading, setFormulasLoading] = useState(false)
  const [formulasError, setFormulasError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms'

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

        if (userData.role !== 'optometrist') {
          alert('Acceso no autorizado')
          navigate('/')
          return
        }

        if (userData.optometrist_data) {
          setProfile(userData.optometrist_data)
        } else if (userData.entity) {
          setProfile(userData.entity)
        }

        const appointmentsRes = await appointmentService.getAllAppointments()
        const appointments = appointmentsRes.data
        const optometristId = userData.optometrist_data?.id || userData.entity?.id
        const mine = appointments.filter(apt => apt.optometrist_id === optometristId)

        setStats({
          total: mine.length,
          pending: mine.filter(apt => apt.status === 'pendiente').length,
          completed: mine.filter(apt => apt.status === 'completada').length,
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

  // Cargar fórmulas cuando se cambia a esa pestaña
  useEffect(() => {
    if (activeTab === 'formulas') {
      loadFormulas()
    }
  }, [activeTab])

  const loadFormulas = async () => {
    setFormulasLoading(true)
    setFormulasError('')
    try {
      const res = await formulaService.getFormulasWithCustomerInfo()
      setFormulasData(res.data)
    } catch (err) {
      setFormulasError('No se pudieron cargar las fórmulas de los clientes.')
    } finally {
      setFormulasLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return 'fa-file-pdf text-danger'
    if (fileType && fileType.startsWith('image/')) return 'fa-file-image text-primary'
    return 'fa-file text-secondary'
  }

  const getStatusBadge = (status) => {
    const map = {
      pendiente: 'warning',
      completada: 'success',
      cancelada: 'danger',
      confirmada: 'info',
    }
    return map[status?.toLowerCase()] || 'secondary'
  }

  const filteredFormulas = formulasData.filter((item) => {
    const customer = item.Customer
    if (!customer) return true
    const name = `${customer.firstName || ''} ${customer.firstLastName || ''}`.toLowerCase()
    return name.includes(searchTerm.toLowerCase())
  })

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
    <div className="container-fluid py-5" style={{ marginTop: '80px' }}>
      <div className="container">

        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-info text-white shadow">
              <div className="card-body d-flex align-items-center gap-4 py-4">
                <div className="fs-1">
                  <i className="fas fa-user-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">
                    {profile ? `${profile.firstName} ${profile.firstLastName}` : 'Optómetra'}
                  </h3>
                  <p className="mb-0 opacity-75">Panel del Optómetra Profesional</p>
                </div>
                {profile?.professionalCardCode && (
                  <div className="ms-auto">
                    <span className="badge bg-white text-info fs-6">
                      <i className="fas fa-id-badge me-1"></i>
                      {profile.professionalCardCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4 g-3">
          <div className="col-md-4">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body py-4">
                <h2 className="text-primary fw-bold mb-0">{stats.total}</h2>
                <p className="text-muted mb-0 mt-1">
                  <i className="fas fa-calendar-check me-1"></i> Total Citas
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body py-4">
                <h2 className="text-warning fw-bold mb-0">{stats.pending}</h2>
                <p className="text-muted mb-0 mt-1">
                  <i className="fas fa-clock me-1"></i> Pendientes
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body py-4">
                <h2 className="text-success fw-bold mb-0">{stats.completed}</h2>
                <p className="text-muted mb-0 mt-1">
                  <i className="fas fa-check-circle me-1"></i> Completadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              <i className="fas fa-id-card me-2"></i>Mi Perfil
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'citas' ? 'active' : ''}`}
              onClick={() => setActiveTab('citas')}
            >
              <i className="fas fa-calendar-alt me-2"></i>Citas Agendadas
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'formulas' ? 'active' : ''}`}
              onClick={() => setActiveTab('formulas')}
            >
              <i className="fas fa-file-medical me-2"></i>Fórmulas de Clientes
              {formulasData.length > 0 && (
                <span className="badge bg-info ms-2">{formulasData.length}</span>
              )}
            </button>
          </li>
        </ul>

        {/* ── Pestaña: Mi Perfil ── */}
        {activeTab === 'perfil' && profile && (
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="text-info mb-3">
                    <i className="fas fa-id-card me-2"></i>Información Personal
                  </h5>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <th className="text-muted">Nombre completo:</th>
                        <td>{profile.firstName} {profile.firstLastName}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Número de Documento:</th>
                        <td><strong>{profile.documentNumber || '—'}</strong></td>
                      </tr>
                      <tr>
                        <th className="text-muted">Email:</th>
                        <td>{profile.email || '—'}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Teléfono:</th>
                        <td>{profile.phoneNumber || 'No registrado'}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Tarjeta Profesional:</th>
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
                  <h5 className="text-info mb-3">
                    <i className="fas fa-clock me-2"></i>Horario de Atención
                  </h5>
                  <div className="p-3 bg-info bg-opacity-10 rounded">
                    <p className="mb-1"><i className="fas fa-sun me-2 text-warning"></i><strong>Lunes a Viernes</strong></p>
                    <p className="mb-1 ms-4">9:00 AM – 12:00 PM</p>
                    <p className="mb-3 ms-4">2:00 PM – 6:00 PM</p>
                    <p className="mb-1"><i className="fas fa-calendar me-2 text-info"></i><strong>Sábados</strong></p>
                    <p className="mb-0 ms-4">9:00 AM – 1:00 PM</p>
                  </div>
                </div>
              </div>
              <hr />
              <div className="d-flex gap-2">
                <Link to="/citas/ver" className="btn btn-primary">
                  <i className="fas fa-calendar-alt me-2"></i>Ver Citas Agendadas
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="fas fa-home me-2"></i>Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Pestaña: Citas Agendadas ── */}
        {activeTab === 'citas' && (
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>Citas Agendadas
              </h5>
              <Link to="/citas/ver" className="btn btn-sm btn-outline-primary">
                <i className="fas fa-external-link-alt me-1"></i>Ver todas
              </Link>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Aquí puedes gestionar todas las citas asignadas a tu consulta.
              </p>
              <div className="d-flex gap-2">
                <Link to="/citas/ver" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i>Lista de Citas
                </Link>
                <Link to="/citas/calendario" className="btn btn-outline-info">
                  <i className="fas fa-calendar me-2"></i>Ver Calendario
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Pestaña: Fórmulas de Clientes ── */}
        {activeTab === 'formulas' && (
          <div>
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0">
                  <i className="fas fa-file-medical me-2"></i>
                  Fórmulas Visuales de Clientes
                </h5>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadFormulas}
                    disabled={formulasLoading}
                  >
                    <i className="fas fa-sync-alt me-1"></i>Actualizar
                  </button>
                </div>
              </div>

              <div className="card-body p-0">
                {formulasLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status"></div>
                    <p className="text-muted mt-2">Cargando fórmulas...</p>
                  </div>
                ) : formulasError ? (
                  <div className="alert alert-danger m-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>{formulasError}
                  </div>
                ) : filteredFormulas.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="fas fa-folder-open fs-1 mb-3 d-block"></i>
                    <p>No se encontraron fórmulas{searchTerm ? ` para "${searchTerm}"` : ''}.</p>
                  </div>
                ) : (
                  <div className="accordion accordion-flush" id="formulasAccordion">
                    {filteredFormulas.map((item, index) => {
                      const customer = item.Customer
                      const appointments = item.appointments || []
                      const customerName = customer
                        ? `${customer.firstName || ''} ${customer.secondName || ''} ${customer.firstLastName || ''} ${customer.secondLastName || ''}`.trim()
                        : `Cliente #${item.customerId}`

                      return (
                        <div key={item.id} className="accordion-item border-start border-4 border-info mb-1">
                          <h2 className="accordion-header">
                            <button
                              className="accordion-button collapsed py-3"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#formula-${item.id}`}
                            >
                              <div className="d-flex align-items-center gap-3 w-100 me-3">
                                <i className={`fas ${getFileIcon(item.fileType)} fs-4`}></i>
                                <div className="flex-grow-1">
                                  <div className="fw-semibold">{customerName}</div>
                                  <small className="text-muted">
                                    {item.fileName} · {formatDateTime(item.uploadedAt)}
                                  </small>
                                </div>
                                <div className="d-flex gap-2 flex-shrink-0">
                                  <span className="badge bg-info">
                                    <i className="fas fa-calendar me-1"></i>{appointments.length} citas
                                  </span>
                                </div>
                              </div>
                            </button>
                          </h2>
                          <div id={`formula-${item.id}`} className="accordion-collapse collapse">
                            <div className="accordion-body pt-0">
                              <div className="row g-4">

                                {/* Info del cliente */}
                                <div className="col-md-4">
                                  <h6 className="text-info mb-3">
                                    <i className="fas fa-user me-2"></i>Datos del Cliente
                                  </h6>
                                  {customer ? (
                                    <table className="table table-sm table-borderless mb-0">
                                      <tbody>
                                        <tr>
                                          <th className="text-muted ps-0" style={{ width: '40%' }}>Nombre:</th>
                                          <td>{customerName}</td>
                                        </tr>
                                        <tr>
                                          <th className="text-muted ps-0">Email:</th>
                                          <td>{customer.email || '—'}</td>
                                        </tr>
                                        <tr>
                                          <th className="text-muted ps-0">Teléfono:</th>
                                          <td>{customer.phoneNumber || '—'}</td>
                                        </tr>
                                        <tr>
                                          <th className="text-muted ps-0">Documento:</th>
                                          <td>{customer.documentNumber || '—'}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-muted small">Sin datos del cliente.</p>
                                  )}
                                </div>

                                {/* Fórmula */}
                                <div className="col-md-4">
                                  <h6 className="text-info mb-3">
                                    <i className="fas fa-file-medical me-2"></i>Fórmula Visual
                                  </h6>
                                  <p className="mb-1">
                                    <strong>Archivo:</strong> {item.fileName}
                                  </p>
                                  {item.description && (
                                    <p className="mb-1">
                                      <strong>Descripción:</strong> {item.description}
                                    </p>
                                  )}
                                  <p className="mb-3">
                                    <strong>Subida:</strong> {formatDateTime(item.uploadedAt)}
                                  </p>
                                  <a
                                    href={`${BASE_URL}${item.filePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm"
                                  >
                                    <i className="fas fa-eye me-2"></i>Ver Fórmula
                                  </a>
                                </div>

                                {/* Citas del cliente */}
                                <div className="col-md-4">
                                  <h6 className="text-info mb-3">
                                    <i className="fas fa-calendar-check me-2"></i>
                                    Citas del Cliente ({appointments.length})
                                  </h6>
                                  {appointments.length === 0 ? (
                                    <p className="text-muted small">Sin citas registradas.</p>
                                  ) : (
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                      {appointments.map((apt) => (
                                        <div key={apt.appointment_id || apt.id} className="border rounded p-2 mb-2 bg-light">
                                          <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                              <small className="fw-semibold d-block">
                                                <i className="fas fa-calendar me-1 text-muted"></i>
                                                {formatDate(apt.appointment_date || apt.appointmentDate)}
                                              </small>
                                              {apt.appointment_time || apt.appointmentTime ? (
                                                <small className="text-muted">
                                                  <i className="fas fa-clock me-1"></i>
                                                  {apt.appointment_time || apt.appointmentTime}
                                                </small>
                                              ) : null}
                                            </div>
                                            <span className={`badge bg-${getStatusBadge(apt.status)}`}>
                                              {apt.status || 'pendiente'}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {filteredFormulas.length > 0 && (
                <div className="card-footer text-muted small">
                  Mostrando {filteredFormulas.length} de {formulasData.length} fórmulas
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PerfilOptometrista
