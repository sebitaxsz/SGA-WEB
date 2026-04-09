import React, { useState, useEffect } from 'react'
import {
  getAppointments, createAppointment, updateAppointment,
  cancelAppointment, deleteAppointment,
  getCustomers, getOptometrists, getExamTypes
} from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw, Ban, CheckCircle } from 'lucide-react'

const STATUS_LABELS = { 
  PENDING: 'Pendiente', 
  CONFIRMED: 'Confirmada', 
  COMPLETED: 'Completada', 
  CANCELLED: 'Cancelada' 
}

const STATUS_COLORS = { 
  PENDING: 'warning', 
  CONFIRMED: 'success', 
  COMPLETED: 'info', 
  CANCELLED: 'danger' 
}

const EMPTY = {
  customer_id: '',
  optometrist_id: '',
  exam_type_id: '',
  date: '',
  time: '',
  notes: '',
  status: 'PENDING'
}

export default function AdminCitas() {
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [optometrists, setOptometrists] = useState([])
  const [examTypes, setExamTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [aRes, cRes, oRes, eRes] = await Promise.all([
        getAppointments(),
        getCustomers(),
        getOptometrists(),
        getExamTypes()
      ])
      
      // Los datos pueden venir en data.data o directamente en data
      const appointments = aRes.data?.data || aRes.data || []
      setItems(appointments)
      setCustomers(cRes.data || [])
      setOptometrists(oRes.data || [])
      setExamTypes(eRes.data || [])
      
      console.log('📋 Citas cargadas:', appointments.length)
      console.log('📋 Clientes:', customers.length)
      console.log('📋 Optometristas:', optometrists.length)
      
    } catch (e) {
      console.error('Error cargando:', e)
      setError('Error cargando citas: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm(EMPTY)
    setEditId(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (a) => {
    setForm({
      customer_id: a.customer_id || '',
      optometrist_id: a.optometrist_id || '',
      exam_type_id: a.exam_type_id || '',
      date: a.date ? a.date.split('T')[0] : '',
      time: a.time || '',
      notes: a.notes || '',
      status: a.status || 'PENDING'
    })
    setEditId(a.appointment_id)
    setError('')
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        date: form.date,
        time: form.time,
        customer_id: parseInt(form.customer_id),
        optometrist_id: parseInt(form.optometrist_id),
        exam_type_id: parseInt(form.exam_type_id),
        status: form.status,
        notes: form.notes
      }
      
      if (editId) {
        await updateAppointment(editId, payload)
        setSuccess('Cita actualizada correctamente')
      } else {
        await createAppointment(payload)
        setSuccess('Cita creada correctamente')
      }
      setShowModal(false)
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      console.error('Error guardando:', e)
      setError(e.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Confirmar cita (PENDING -> CONFIRMED)
  const handleConfirm = async (id) => {
    if (!window.confirm('¿Confirmar esta cita? El cliente recibirá una notificación.')) return
    try {
      await updateAppointment(id, { status: 'CONFIRMED' })
      setSuccess('✅ Cita confirmada correctamente')
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al confirmar')
    }
  }

  // Cancelar cita
  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar esta cita? El cliente será notificado.')) return
    try {
      await cancelAppointment(id)
      setSuccess('❌ Cita cancelada')
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cancelar')
    }
  }

  // Completar cita (CONFIRMED -> COMPLETED)
  const handleComplete = async (id) => {
    if (!window.confirm('¿Marcar esta cita como completada?')) return
    try {
      await updateAppointment(id, { status: 'COMPLETED' })
      setSuccess('✅ Cita completada')
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al completar')
    }
  }

  // Eliminar cita permanentemente
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta cita permanentemente? Esta acción no se puede deshacer.')) return
    try {
      await deleteAppointment(id)
      setSuccess('Cita eliminada permanentemente')
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al eliminar')
    }
  }

  // Helper: Obtener nombre del cliente
  const getCustomerName = (id) => {
    const c = customers.find(c => c.customer_id === id)
    return c ? `${c.firstName} ${c.firstLastName}` : `Cliente #${id}`
  }

  // Helper: Obtener nombre del optometrista
  const getOptometristName = (id) => {
    const o = optometrists.find(o => o.id === id)
    return o ? `${o.firstName} ${o.firstLastName}` : `Optómetra #${id}`
  }

  // Helper: Obtener nombre del examen
  const getExamName = (id) => {
    const e = examTypes.find(e => e.id_exam_type === id || e.id === id)
    return e ? (e.exam_name || e.name) : `Examen #${id}`
  }

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Filtrar citas
  const filtered = items.filter(a => {
    const customerName = getCustomerName(a.customer_id).toLowerCase()
    const matchSearch = customerName.includes(search.toLowerCase())
    const matchStatus = statusFilter ? a.status === statusFilter : true
    return matchSearch && matchStatus
  })

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Citas</h2>
          <p className="section-subtitle">{items.length} citas en total</p>
        </div>
        <div className="section-actions">
          <select 
            className="filter-select" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button className="btn-refresh" onClick={load}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Nueva Cita
          </button>
        </div>
      </div>

      {success && (
        <div className="alert-success">
          <Check size={16} /> {success}
        </div>
      )}
      
      {error && !showModal && (
        <div className="alert-error">
          <X size={16} /> {error}
        </div>
      )}

      <div className="search-bar-section">
        <Search size={16} />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Buscar por cliente..." 
        />
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Optómetra</th>
                <th>Examen</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No hay citas</td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.appointment_id}>
                    <td>
                      <strong>{getCustomerName(a.customer_id)}</strong>
                    </td>
                    <td>{getOptometristName(a.optometrist_id)}</td>
                    <td>{getExamName(a.exam_type_id)}</td>
                    <td>{formatDate(a.date)}</td>
                    <td>{a.time || '—'}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[a.status] || 'secondary'}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {/* Confirmar - solo para PENDING */}
                      {a.status === 'PENDING' && (
                        <button 
                          className="btn-icon confirm" 
                          onClick={() => handleConfirm(a.appointment_id)} 
                          title="Confirmar cita"
                          style={{ background: 'rgba(34,197,94,.1)', color: '#16a34a' }}
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      
                      {/* Completar - solo para CONFIRMED */}
                      {a.status === 'CONFIRMED' && (
                        <button 
                          className="btn-icon complete" 
                          onClick={() => handleComplete(a.appointment_id)} 
                          title="Completar cita"
                          style={{ background: 'rgba(59,130,246,.1)', color: '#3b82f6' }}
                        >
                          <Check size={15} />
                        </button>
                      )}
                      
                      {/* Editar */}
                      <button 
                        className="btn-icon edit" 
                        onClick={() => openEdit(a)} 
                        title="Editar cita"
                      >
                        <Pencil size={15} />
                      </button>
                      
                      {/* Cancelar - excepto CANCELLED y COMPLETED */}
                      {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                        <button 
                          className="btn-icon warn" 
                          onClick={() => handleCancel(a.appointment_id)} 
                          title="Cancelar cita"
                        >
                          <Ban size={15} />
                        </button>
                      )}
                      
                      {/* Eliminar permanentemente */}
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(a.appointment_id)} 
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar cita */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Cita' : 'Nueva Cita'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            {error && (
              <div className="alert-error" style={{ margin: '0 20px' }}>
                <X size={16} /> {error}
              </div>
            )}
            
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Cliente *</label>
                  <select 
                    required 
                    value={form.customer_id} 
                    onChange={e => setForm({...form, customer_id: e.target.value})}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.firstName} {c.firstLastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Optómetra *</label>
                  <select 
                    required 
                    value={form.optometrist_id} 
                    onChange={e => setForm({...form, optometrist_id: e.target.value})}
                  >
                    <option value="">Seleccionar optómetra...</option>
                    {optometrists.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.firstName} {o.firstLastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tipo de examen *</label>
                  <select 
                    required 
                    value={form.exam_type_id} 
                    onChange={e => setForm({...form, exam_type_id: e.target.value})}
                  >
                    <option value="">Seleccionar examen...</option>
                    {examTypes.map(ex => (
                      <option key={ex.id_exam_type || ex.id} value={ex.id_exam_type || ex.id}>
                        {ex.exam_name || ex.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Estado</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Fecha *</label>
                  <input 
                    required 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Hora *</label>
                  <input 
                    required 
                    type="time" 
                    value={form.time} 
                    onChange={e => setForm({...form, time: e.target.value})} 
                  />
                </div>
                
                <div className="form-group form-full">
                  <label>Notas</label>
                  <textarea 
                    rows={3} 
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                    placeholder="Observaciones o indicaciones..." 
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editId ? 'Actualizar Cita' : 'Crear Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}