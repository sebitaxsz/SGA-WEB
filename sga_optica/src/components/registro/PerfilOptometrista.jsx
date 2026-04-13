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

  // Formulas state
  const [formulasData, setFormulasData] = useState([])
  const [formulasLoading, setFormulasLoading] = useState(false)
  const [formulasError, setFormulasError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (!token || !user) { navigate('/login'); return }

      try {
        const userData = JSON.parse(user)

        if (userData.role !== 'optometrist') {
          alert('Acceso no autorizado')
          navigate('/')
          return
        }

        if (userData.optometrist_data) setProfile(userData.optometrist_data)
        else if (userData.entity) setProfile(userData.entity)

        const appointmentsRes = await appointmentService.getAllAppointments()
        const appointments = appointmentsRes.data
        const optometristId = userData.optometrist_data?.id || userData.entity?.id
        const mine = appointments.filter(apt => apt.optometrist_id === optometristId)

        setStats({
          total: mine.length,
          pending: mine.filter(apt => apt.status === 'pendiente').length,
          completed: mine.filter(apt => apt.status === 'completada').length
        })
      } catch (err) {
        console.error('Error al cargar perfil:', err)
        setError('Error al cargar el perfil del optometrista')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  useEffect(() => {
    if (activeTab === 'formulas') {
      loadFormulasData()
    }
  }, [activeTab])

  const loadFormulasData = async () => {
    setFormulasLoading(true)
    setFormulasError('')
    try {
      const res = await formulaService.getFormulasWithCustomerInfo()
      setFormulasData(res.data || [])
    } catch (err) {
      console.error('Error cargando fórmulas:', err)
      setFormulasError('Error al cargar las fórmulas de los clientes.')
    } finally {
      setFormulasLoading(false)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return 'fa-file-pdf text-danger'
    if (fileType?.startsWith('image/')) return 'fa-file-image text-primary'
    return 'fa-file text-secondary'
  }

  const getFileUrl = (filePath) => {
    const BASE = 'https://7l77sjp2-3002.use2.devtunnels.ms'
    return `${BASE}${filePath}`
  }

  const getStatusBadge = (status) => {
    const map = {
      pendiente: 'warning',
      completada: 'success',
      cancelada: 'danger',
      confirmada: 'info'
    }
    return map[status] || 'secondary'
  }

  const filteredFormulas = formulasData.filter(f => {
    const customer = f.Customer
    if (!customer) return true
    const name = `${customer.firstName || ''} ${customer.firstLastName || ''}`.toLowerCase()
    return name.includes(searchTerm.toLowerCase()) || f.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="card shadow-sm mb-4">
          <div className="card-body bg-info text-white rounded">
            <div className="d-flex align-items-center">
              <div className="me-4">
                <i className="fas fa-user-md fa-4x opacity-75"></i>
              </div>
              <div>
                <h2 className="mb-1">
                  {profile ? `${profile.firstName} ${profile.firstLastName}` : 'Optómetra'}
                </h2>
                <p className="mb-0 opacity-90">
                  <i className="fas fa-id-badge me-2"></i>
                  Tarjeta Profesional: <strong>{profile?.professionalCardCode || 'N/A'}</strong>
                </p>
                <p className="mb-0 opacity-90">
                  <i className="fas fa-envelope me-2"></i>
                  {profile?.email || 'N/A'}
                </p>
              </div>
              <div className="ms-auto row text-center g-3">
                {[
                  { label: 'Total Citas', value: stats.total, color: 'light', icon: 'fa-calendar-check' },
                  { label: 'Pendientes', value: stats.pending, color: 'warning', icon: 'fa-clock' },
                  { label: 'Completadas', value: stats.completed, color: 'success', icon: 'fa-check-circle' }
                ].map(s => (
                  <div key={s.label} className="col">
                    <div className={`bg-${s.color} bg-opacity-25 rounded p-3`}>
                      <i className={`fas ${s.icon} fa-lg mb-1`}></i>
                      <h4 className="mb-0">{s.value}</h4>
                      <small>{s.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              <i className="fas fa-user me-2"></i>Mi Perfil
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

        {/* ── PERFIL TAB ── */}
        {activeTab === 'perfil' && profile && (
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-id-card me-2"></i>Información Personal</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr><th width="180">Tipo de Documento:</th><td>Cédula de Ciudadanía (CC)</td></tr>
                      <tr><th>Número de Documento:</th><td><strong>{profile.documentNumber || 'N/A'}</strong></td></tr>
                      <tr><th>Email:</th><td>{profile.email || 'N/A'}</td></tr>
                      <tr><th>Teléfono:</th><td>{profile.phoneNumber || 'No registrado'}</td></tr>
                      <tr>
                        <th>Tarjeta Profesional:</th>
                        <td><span className="badge bg-info fs-6">{profile.professionalCardCode || 'PROF-001'}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-info bg-opacity-10 rounded">
                    <h6 className="text-info">
                      <i className="fas fa-clock me-2"></i>Horario de Atención
                    </h6>
                    <p className="mb-0 small">
                      Lunes a Viernes: 9:00 AM – 12:00 PM, 2:00 PM – 6:00 PM<br />
                      Sábados: 9:00 AM – 1:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CITAS TAB ── */}
        {activeTab === 'citas' && (
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="fas fa-calendar-alt me-2"></i>Citas Agendadas</h5>
              <Link to="/citas/ver" className="btn btn-sm btn-outline-primary">
                <i className="fas fa-external-link-alt me-1"></i>Ver todas
              </Link>
            </div>
            <div className="card-body">
              <div className="row mb-3 g-3">
                {[
                  { label: 'Total', value: stats.total, color: 'primary' },
                  { label: 'Pendientes', value: stats.pending, color: 'warning' },
                  { label: 'Completadas', value: stats.completed, color: 'success' }
                ].map(s => (
                  <div key={s.label} className="col-md-4">
                    <div className={`card border-${s.color}`}>
                      <div className="card-body text-center">
                        <h3 className={`text-${s.color} mb-0`}>{s.value}</h3>
                        <small className="text-muted">{s.label}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link to="/citas/ver" className="btn btn-primary me-2">
                  <i className="fas fa-calendar-alt me-2"></i>Ver Citas Agendadas
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="fas fa-home me-2"></i>Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── FÓRMULAS TAB ── */}
        {activeTab === 'formulas' && (
          <div>
            <div className="card shadow-sm mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-file-medical me-2 text-info"></i>
                  Fórmulas Visuales de Clientes
                </h5>
                <button className="btn btn-sm btn-outline-info" onClick={loadFormulasData} disabled={formulasLoading}>
                  <i className={`fas fa-sync-alt me-1 ${formulasLoading ? 'fa-spin' : ''}`}></i>
                  Actualizar
                </button>
              </div>
              <div className="card-body border-bottom">
                <div className="input-group">
                  <span className="input-group-text"><i className="fas fa-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre de cliente o archivo..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {formulasError && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>{formulasError}
              </div>
            )}

            {formulasLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status"></div>
                <p className="text-muted mt-2">Cargando fórmulas de clientes...</p>
              </div>
            ) : filteredFormulas.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-folder-open fa-3x mb-3 d-block opacity-50"></i>
                {searchTerm ? (
                  <p>No se encontraron fórmulas para "<strong>{searchTerm}</strong>"</p>
                ) : (
                  <p>Ningún cliente ha subido fórmulas visuales aún.</p>
                )}
              </div>
            ) : (
              <div className="row g-4">
                {filteredFormulas.map((formula) => {
                  const customer = formula.Customer
                  const appointments = formula.appointments || []
                  const customerName = customer
                    ? `${customer.firstName || ''} ${customer.secondName || ''} ${customer.firstLastName || ''} ${customer.secondLastName || ''}`.trim()
                    : 'Cliente desconocido'

                  return (
                    <div key={formula.id} className="col-12">
                      <div className="card border shadow-sm">
                        <div className="card-header bg-light d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3" style={{ width: 42, height: 42 }}>
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold">{customerName}</h6>
                              {customer?.email && (
                                <small className="text-muted">
                                  <i className="fas fa-envelope me-1"></i>{customer.email}
                                </small>
                              )}
                              {customer?.phoneNumber && (
                                <small className="text-muted ms-3">
                                  <i className="fas fa-phone me-1"></i>{customer.phoneNumber}
                                </small>
                              )}
                            </div>
                          </div>
                          <span className="badge bg-info">
                            <i className="fas fa-id-card me-1"></i>
                            {customer?.documentNumber || 'Sin documento'}
                          </span>
                        </div>

                        <div className="card-body">
                          <div className="row g-3">
                            {/* Fórmula */}
                            <div className="col-md-5">
                              <h6 className="text-primary mb-2">
                                <i className="fas fa-file-medical me-2"></i>Fórmula Visual
                              </h6>
                              <div className="d-flex align-items-start p-3 bg-light rounded">
                                <i className={`fas ${getFileIcon(formula.fileType)} fa-2x me-3 flex-shrink-0`}></i>
                                <div className="flex-grow-1 min-width-0">
                                  <p className="mb-1 fw-semibold text-truncate" title={formula.fileName}>
                                    {formula.fileName}
                                  </p>
                                  {formula.description && (
                                    <p className="mb-1 small text-muted">{formula.description}</p>
                                  )}
                                  <small className="text-muted">
                                    <i className="fas fa-calendar me-1"></i>
                                    Subida: {new Date(formula.uploadedAt).toLocaleDateString('es-CO', {
                                      year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                  </small>
                                  <div className="mt-2">
                                    <a
                                      href={getFileUrl(formula.filePath)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-primary me-2"
                                    >
                                      <i className="fas fa-eye me-1"></i>Ver Fórmula
                                    </a>
                                    <a
                                      href={getFileUrl(formula.filePath)}
                                      download
                                      className="btn btn-sm btn-outline-secondary"
                                    >
                                      <i className="fas fa-download me-1"></i>Descargar
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Citas del cliente */}
                            <div className="col-md-7">
                              <h6 className="text-success mb-2">
                                <i className="fas fa-calendar-check me-2"></i>
                                Citas Agendadas
                                <span className="badge bg-secondary ms-2">{appointments.length}</span>
                              </h6>
                              {appointments.length === 0 ? (
                                <div className="p-3 bg-light rounded text-center text-muted">
                                  <i className="fas fa-calendar-times me-2"></i>
                                  Sin citas agendadas
                                </div>
                              ) : (
                                <div className="list-group list-group-flush" style={{ maxHeight: 200, overflowY: 'auto' }}>
                                  {appointments.map((apt, idx) => (
                                    <div key={idx} className="list-group-item list-group-item-action py-2 px-3">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                          <small className="fw-semibold">
                                            <i className="fas fa-calendar me-1 text-primary"></i>
                                            {apt.appointment_date
                                              ? new Date(apt.appointment_date).toLocaleDateString('es-CO', {
                                                  weekday: 'short', year: 'numeric',
                                                  month: 'short', day: 'numeric'
                                                })
                                              : 'Fecha no disponible'}
                                          </small>
                                          {apt.appointment_time && (
                                            <small className="text-muted ms-2">
                                              <i className="fas fa-clock me-1"></i>{apt.appointment_time}
                                            </small>
                                          )}
                                          {apt.reason && (
                                            <div className="small text-muted mt-1">
                                              <i className="fas fa-notes-medical me-1"></i>{apt.reason}
                                            </div>
                                          )}
                                        </div>
                                        <span className={`badge bg-${getStatusBadge(apt.status)} ms-2 flex-shrink-0`}>
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

            {!formulasLoading && filteredFormulas.length > 0 && (
              <p className="text-muted small mt-3 text-end">
                Mostrando {filteredFormulas.length} fórmula{filteredFormulas.length !== 1 ? 's' : ''}
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default PerfilOptometrista
