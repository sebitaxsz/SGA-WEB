import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../carrito/CartContext'
import Navbar from '../Navbar'
import { formulaService } from '../../services/formula.service'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('perfil')
  const { cart } = useCart()

  // Formula states
  const [formulas, setFormulas] = useState([])
  const [formulaLoading, setFormulaLoading] = useState(false)
  const [formulaError, setFormulaError] = useState('')
  const [formulaSuccess, setFormulaSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [description, setDescription] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      } else {
        navigate('/login')
      }
    }, 10)
    return () => clearTimeout(timer)
  }, [navigate])

  useEffect(() => {
    if (activeTab === 'formula' && user) {
      loadMyFormulas()
    }
  }, [activeTab, user])

  const loadMyFormulas = async () => {
    setFormulaLoading(true)
    setFormulaError('')
    try {
      const res = await formulaService.getMyFormulas()
      setFormulas(res.data || [])
    } catch (err) {
      setFormulaError('No se pudieron cargar tus fórmulas. Verifica que tengas un perfil de cliente activo.')
    } finally {
      setFormulaLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setFormulaError('Solo se permiten archivos JPG, PNG o PDF.')
      setSelectedFile(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormulaError('El archivo no puede superar 5 MB.')
      setSelectedFile(null)
      return
    }
    setFormulaError('')
    setSelectedFile(file)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) { setFormulaError('Selecciona un archivo antes de subir.'); return }

    setUploading(true)
    setFormulaError('')
    setFormulaSuccess('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (description) formData.append('description', description)
      await formulaService.uploadMyFormula(formData)
      setFormulaSuccess('¡Fórmula visual subida exitosamente! Ya está guardada en tu cuenta.')
      setSelectedFile(null)
      setDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadMyFormulas()
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al subir la fórmula. Intenta de nuevo.'
      setFormulaError(msg)
    } finally {
      setUploading(false)
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

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/')
  }

  if (!user) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <Navbar />
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="display-1 mb-3">👤</div>
              <h5>{user.nombre} {user.apellido}</h5>
              <p className="text-muted">{user.email}</p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <div className="list-group mt-3">
            <button className={`list-group-item list-group-item-action ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
              <i className="fas fa-user me-2"></i>Mi Perfil
            </button>
            <button className={`list-group-item list-group-item-action ${activeTab === 'formula' ? 'active' : ''}`} onClick={() => setActiveTab('formula')}>
              <i className="fas fa-file-medical me-2"></i>Mi Fórmula Visual
              {formulas.length === 0 && <span className="badge bg-primary ms-2 float-end">Nuevo</span>}
            </button>
            <button className={`list-group-item list-group-item-action ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
              <i className="fas fa-shopping-bag me-2"></i>Mis Pedidos
            </button>
            <button className={`list-group-item list-group-item-action ${activeTab === 'citas' ? 'active' : ''}`} onClick={() => setActiveTab('citas')}>
              <i className="fas fa-calendar me-2"></i>Mis Citas
            </button>
            <button className={`list-group-item list-group-item-action ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
              <i className="fas fa-cog me-2"></i>Configuración
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">

          {/* ── MI PERFIL ── */}
          {activeTab === 'perfil' && (
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Información del Perfil</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Nombre:</strong> {user.nombre}</p>
                    <p><strong>Apellido:</strong> {user.apellido}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Teléfono:</strong> {user.telefono || 'No registrado'}</p>
                    <p><strong>Miembro desde:</strong> {user.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Tipo de cuenta:</strong> {user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                  </div>
                </div>
                <Link to="/editar-perfil" className="btn btn-primary mt-3">
                  <i className="fas fa-edit me-2"></i>Editar Perfil
                </Link>
              </div>
            </div>
          )}

          {/* ── MI FÓRMULA VISUAL ── */}
          {activeTab === 'formula' && (
            <div className="card">
              <div className="card-header bg-primary text-white d-flex align-items-center">
                <i className="fas fa-file-medical me-2 fs-5"></i>
                <h5 className="mb-0">Mi Fórmula Visual</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info d-flex align-items-start mb-4">
                  <i className="fas fa-info-circle me-2 mt-1 flex-shrink-0"></i>
                  <div>
                    <strong>¿Qué es esto?</strong> Aquí puedes subir tu fórmula visual (receta óptica) en formato imagen o PDF.
                    Tu optómetra podrá verla y usarla para atenderte mejor en tu próxima consulta.
                  </div>
                </div>

                {/* Upload form */}
                <div className="card border mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0"><i className="fas fa-upload me-2"></i>Subir Nueva Fórmula</h6>
                  </div>
                  <div className="card-body">
                    {formulaError && (
                      <div className="alert alert-danger alert-dismissible">
                        <i className="fas fa-exclamation-triangle me-2"></i>{formulaError}
                        <button type="button" className="btn-close" onClick={() => setFormulaError('')}></button>
                      </div>
                    )}
                    {formulaSuccess && (
                      <div className="alert alert-success alert-dismissible">
                        <i className="fas fa-check-circle me-2"></i>{formulaSuccess}
                        <button type="button" className="btn-close" onClick={() => setFormulaSuccess('')}></button>
                      </div>
                    )}

                    <form onSubmit={handleUpload}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Archivo de fórmula <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          required
                        />
                        <div className="form-text">
                          <i className="fas fa-paperclip me-1"></i>
                          Formatos permitidos: JPG, PNG, PDF — Tamaño máximo: 5 MB
                        </div>
                      </div>

                      {selectedFile && (
                        <div className="alert alert-light border mb-3 py-2">
                          <i className={`fas ${getFileIcon(selectedFile.type)} me-2`}></i>
                          <strong>{selectedFile.name}</strong>
                          <span className="text-muted ms-2">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Descripción (opcional)</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Ej: Fórmula del Dr. García, enero 2025..."
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          maxLength={200}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
                        {uploading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Subiendo...</>
                        ) : (
                          <><i className="fas fa-cloud-upload-alt me-2"></i>Subir Fórmula</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Lista de fórmulas */}
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-history me-2 text-primary"></i>
                  Mis Fórmulas Guardadas
                  {formulas.length > 0 && <span className="badge bg-secondary ms-2">{formulas.length}</span>}
                </h6>

                {formulaLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2">Cargando fórmulas...</p>
                  </div>
                ) : formulas.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-folder-open fa-3x mb-3 d-block opacity-50"></i>
                    <p>Aún no tienes fórmulas guardadas.</p>
                    <p className="small">Sube tu primera fórmula visual usando el formulario de arriba.</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {formulas.map((formula) => (
                      <div key={formula.id} className="list-group-item">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <i className={`fas ${getFileIcon(formula.fileType)} fa-2x me-3`}></i>
                            <div>
                              <h6 className="mb-0">{formula.fileName}</h6>
                              {formula.description && (
                                <small className="text-muted d-block">{formula.description}</small>
                              )}
                              <small className="text-muted">
                                <i className="fas fa-calendar-alt me-1"></i>
                                {new Date(formula.uploadedAt).toLocaleDateString('es-CO', {
                                  year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </small>
                            </div>
                          </div>
                          <a
                            href={getFileUrl(formula.filePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fas fa-eye me-1"></i>Ver
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MIS PEDIDOS ── */}
          {activeTab === 'pedidos' && (
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Historial de pedidos</h5></div>
              <div className="card-body">
                {cart.length === 0 ? (
                  <>
                    <p className="text-muted">Aún no has añadido productos.</p>
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
                            <strong>{item.name}</strong><br />
                            <small className="text-muted">{item.descripcion}</small>
                          </div>
                          <span className="badge bg-primary rounded-pill">${item.price.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5>Total:</h5>
                      <h5 className="text-success">${cart.reduce((t, i) => t + i.price, 0).toLocaleString()}</h5>
                    </div>
                    <button className="btn btn-success w-100 mt-3">
                      <i className="fas fa-check-circle me-2"></i>Finalizar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── MIS CITAS ── */}
          {activeTab === 'citas' && (
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Mis Citas</h5></div>
              <div className="card-body">
                <p>Gestiona tus citas médicas.</p>
                <Link to="/citas/ver" className="btn btn-primary me-2">
                  <i className="fas fa-eye me-2"></i>Ver Citas
                </Link>
                <Link to="/citas/nueva" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Nueva Cita
                </Link>
              </div>
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {activeTab === 'config' && (
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Configuración de la Cuenta</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <h6>Notificaciones</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="notifEmail" defaultChecked />
                    <label className="form-check-label" htmlFor="notifEmail">Recibir notificaciones por email</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="notifOfertas" defaultChecked />
                    <label className="form-check-label" htmlFor="notifOfertas">Recibir ofertas y promociones</label>
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
