import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../carrito/CartContext'
import { formulaService } from '../../services/formula.service'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('perfil')
  const [loading, setLoading] = useState(true)
  const { cart } = useCart()

  // Fórmula visual state
  const [formulas, setFormulas] = useState([])
  const [formulaLoading, setFormulaLoading] = useState(false)
  const [formulaError, setFormulaError] = useState('')
  const [formulaSuccess, setFormulaSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Leer el tab desde sessionStorage (viene del Navbar al hacer clic en "Mi Fórmula Visual")
    const pendingTab = sessionStorage.getItem('profileTab')
    if (pendingTab) {
      setActiveTab(pendingTab)
      sessionStorage.removeItem('profileTab')
    }

    const loadProfile = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (!token || !userData) {
        navigate('/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setLoading(false)
    }

    loadProfile()
  }, [navigate])

  useEffect(() => {
    if (activeTab === 'formula') {
      loadMyFormulas()
    }
  }, [activeTab])

  const loadMyFormulas = async () => {
    setFormulaLoading(true)
    setFormulaError('')
    try {
      const res = await formulaService.getMyFormulas()
      setFormulas(res.data)
    } catch (err) {
      setFormulaError('No se pudieron cargar tus fórmulas. Intenta de nuevo.')
    } finally {
      setFormulaLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowed.includes(file.type)) {
        setFormulaError('Tipo de archivo no permitido. Solo PDF, JPG o PNG.')
        setSelectedFile(null)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormulaError('El archivo no debe superar 5 MB.')
        setSelectedFile(null)
        return
      }
      setFormulaError('')
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setFormulaError('Por favor selecciona un archivo primero.')
      return
    }
    setUploading(true)
    setFormulaError('')
    setFormulaSuccess('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('description', description)
      await formulaService.uploadMyFormula(formData)
      setFormulaSuccess('¡Fórmula subida exitosamente!')
      setSelectedFile(null)
      setDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadMyFormulas()
    } catch (err) {
      setFormulaError(
        err.response?.data?.message || 'Error al subir la fórmula. Intenta de nuevo.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/')
  }

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return 'fa-file-pdf text-danger'
    if (fileType && fileType.startsWith('image/')) return 'fa-file-image text-primary'
    return 'fa-file text-secondary'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms'

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ marginTop: '100px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  // Datos a mostrar desde localStorage (actualizados después de editar perfil)
  const displayName = user?.firstName && user?.firstLastName
    ? `${user.firstName} ${user.firstLastName}`.trim()
    : user?.nombre || 'Usuario'
  
  const displayEmail = user?.email || user?.user_user || ''
  const displayPhone = user?.phoneNumber || user?.telefono || 'No registrado'
  const displayAddress = user?.address || 'No registrada'
  const displaySecondName = user?.secondName || '—'
  const displaySecondLastName = user?.secondLastName || '—'

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="row">

        {/* ── Sidebar ── */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="display-1 mb-3">👤</div>
              <h5>{displayName}</h5>
              <p className="text-muted">{displayEmail}</p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <div className="list-group mt-3">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              <i className="fas fa-user me-2"></i>Mi Perfil
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'formula' ? 'active' : ''}`}
              onClick={() => setActiveTab('formula')}
            >
              <i className="fas fa-file-medical me-2"></i>Mi Fórmula Visual
              {formulas.length > 0 && (
                <span className="badge bg-primary ms-2 float-end">{formulas.length}</span>
              )}
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'pedidos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pedidos')}
            >
              <i className="fas fa-shopping-bag me-2"></i>Mis Pedidos
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'citas' ? 'active' : ''}`}
              onClick={() => setActiveTab('citas')}
            >
              <i className="fas fa-calendar me-2"></i>Mis Citas
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'config' ? 'active' : ''}`}
              onClick={() => setActiveTab('config')}
            >
              <i className="fas fa-cog me-2"></i>Configuración
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="col-md-9">

          {/* Mi Perfil */}
          {activeTab === 'perfil' && (
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Información del Perfil</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Nombre:</strong> {user?.firstName || user?.nombre || '—'}</p>
                    <p><strong>Segundo Nombre:</strong> {displaySecondName}</p>
                    <p><strong>Apellido:</strong> {user?.firstLastName || user?.apellido || '—'}</p>
                    <p><strong>Segundo Apellido:</strong> {displaySecondLastName}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Email:</strong> {displayEmail}</p>
                    <p><strong>Teléfono:</strong> {displayPhone}</p>
                    <p><strong>Dirección:</strong> {displayAddress}</p>
                    <p><strong>Tipo de cuenta:</strong> Cliente</p>
                  </div>
                </div>
                <Link to="/editar-perfil" className="btn btn-primary mt-3">
                  <i className="fas fa-edit me-2"></i>Editar Perfil
                </Link>
              </div>
            </div>
          )}

          {/* Mi Fórmula Visual */}
          {activeTab === 'formula' && (
            <div>
              {/* Uploader */}
              <div className="card mb-4 shadow-sm">
                <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
                  <i className="fas fa-file-medical-alt fs-5"></i>
                  <h5 className="mb-0">Subir Fórmula Visual</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">
                    Sube tu fórmula visual para que nuestros optómetras puedan revisarla.
                    Formatos aceptados: <strong>PDF, JPG, PNG</strong>. Máximo <strong>5 MB</strong>.
                  </p>

                  {formulaError && (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>{formulaError}
                    </div>
                  )}
                  {formulaSuccess && (
                    <div className="alert alert-success" role="alert">
                      <i className="fas fa-check-circle me-2"></i>{formulaSuccess}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-paperclip me-1"></i> Archivo
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    {selectedFile && (
                      <div className="form-text text-success mt-1">
                        <i className="fas fa-check me-1"></i>
                        <strong>{selectedFile.name}</strong> — {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Descripción <span className="text-muted fw-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Fórmula optométrica marzo 2025"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={200}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt me-2"></i>
                        Subir Fórmula
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Historial */}
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-history me-2"></i>Fórmulas Guardadas
                  </h5>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadMyFormulas}
                    disabled={formulaLoading}
                  >
                    <i className="fas fa-sync-alt me-1"></i>Actualizar
                  </button>
                </div>
                <div className="card-body">
                  {formulaLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : formulas.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="fas fa-folder-open fs-1 mb-3 d-block"></i>
                      <p className="mb-1">Aún no has subido ninguna fórmula visual.</p>
                      <p className="small">Usa el formulario de arriba para subir tu primera fórmula.</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {formulas.map((formula) => (
                        <div key={formula.id} className="list-group-item px-0 py-3">
                          <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">
                              <i className={`fas ${getFileIcon(formula.fileType)} fs-2`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <div>
                                  <h6 className="mb-1 text-break">{formula.fileName}</h6>
                                  {formula.description && (
                                    <p className="text-muted small mb-1">{formula.description}</p>
                                  )}
                                  <small className="text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    {formatDate(formula.uploadedAt)}
                                  </small>
                                </div>
                                <a
                                  href={`${BASE_URL}${formula.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="fas fa-eye me-1"></i>Ver
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mis Pedidos */}
          {activeTab === 'pedidos' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Historial de pedidos</h5>
              </div>
              <div className="card-body">
                {cart.length === 0 ? (
                  <>
                    <p className="text-muted">Aún no has realizado pedidos.</p>
                    <Link to="/productos/gafas-sol" className="btn btn-primary">
                      <i className="fas fa-shopping-cart me-2"></i>Ver Productos
                    </Link>
                  </>
                ) : (
                  <>
                    <ul className="list-group mb-3">
                      {cart.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.name}</strong>
                            <br />
                            <small className="text-muted">{item.descripcion}</small>
                          </div>
                          <span className="badge bg-primary rounded-pill">
                            ${item.price.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5>Total:</h5>
                      <h5 className="text-success">
                        ${cart.reduce((total, item) => total + item.price, 0).toLocaleString()}
                      </h5>
                    </div>
                    <button className="btn btn-success w-100 mt-3">
                      <i className="fas fa-check-circle me-2"></i>Finalizar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mis Citas */}
          {activeTab === 'citas' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Mis Citas</h5>
              </div>
              <div className="card-body">
                <p>Gestiona tus citas médicas con nuestros optometristas.</p>
                <Link to="/citas/ver" className="btn btn-primary me-2">
                  <i className="fas fa-eye me-2"></i>Ver Citas
                </Link>
                <Link to="/citas/nueva" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Nueva Cita
                </Link>
              </div>
            </div>
          )}

          {/* Configuración */}
          {activeTab === 'config' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Configuración de la Cuenta</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6>Notificaciones</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="notifEmail" defaultChecked />
                    <label className="form-check-label" htmlFor="notifEmail">
                      Recibir notificaciones por email
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="notifOfertas" defaultChecked />
                    <label className="form-check-label" htmlFor="notifOfertas">
                      Recibir ofertas y promociones
                    </label>
                  </div>
                </div>
                <button className="btn btn-primary">
                  <i className="fas fa-save me-2"></i>Guardar Cambios
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Profile