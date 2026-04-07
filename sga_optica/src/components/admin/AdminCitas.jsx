import React, { useState, useEffect } from 'react'
import { getAppointments, createAppointment, updateAppointment, cancelAppointment, deleteAppointment, getCustomers, getOptometrists, getExamTypes } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw, Calendar, Ban } from 'lucide-react'

const STATUS_LABELS = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada', CANCELLED: 'Cancelada' }
const STATUS_COLORS = { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }
const EMPTY = { customerId: '', optometristId: '', examTypeId: '', appointmentDate: '', startTime: '', notes: '' }

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
    try {
      const [aRes, cRes, oRes, eRes] = await Promise.all([getAppointments(), getCustomers(), getOptometrists(), getExamTypes()])
      setItems(aRes.data?.data || aRes.data || [])
      setCustomers(cRes.data || [])
      setOptometrists(oRes.data || [])
      setExamTypes(eRes.data || [])
    } catch (e) { setError('Error: ' + (e.response?.data?.message || e.message)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (a) => {
    const date = a.appointmentDate ? a.appointmentDate.split('T')[0] : ''
    const time = a.startTime || ''
    setForm({ customerId: a.customerId || '', optometristId: a.optometristId || '', examTypeId: a.examTypeId || '', appointmentDate: date, startTime: time, notes: a.notes || '', status: a.status || 'PENDING' })
    setEditId(a.appointment_id); setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form, customerId: parseInt(form.customerId), optometristId: parseInt(form.optometristId), examTypeId: parseInt(form.examTypeId) }
      if (editId) { await updateAppointment(editId, payload); setSuccess('Cita actualizada') }
      else { await createAppointment(payload); setSuccess('Cita creada') }
      setShowModal(false); load(); setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar esta cita?')) return
    try { await cancelAppointment(id); setSuccess('Cita cancelada'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (e) { setError(e.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta cita permanentemente?')) return
    try { await deleteAppointment(id); setSuccess('Cita eliminada'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (e) { setError(e.response?.data?.message || 'Error') }
  }

  const customerName = (id) => { const c = customers.find(c => c.customer_id === id); return c ? `${c.firstName} ${c.firstLastName}` : id }
  const optoName = (id) => { const o = optometrists.find(o => o.id === id); return o ? `${o.firstName} ${o.firstLastName}` : id }
  const examName = (id) => { const e = examTypes.find(e => e.id_exam_type === id); return e ? e.exam_name : id }

  const filtered = items.filter(a => {
    const matchSearch = customerName(a.customerId).toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? a.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const formatDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }) }

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Citas</h2>
          <p className="section-subtitle">{items.length} citas en total</p>
        </div>
        <div className="section-actions">
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nueva Cita</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente..." />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Cliente</th><th>Optómetra</th><th>Examen</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={7} className="empty-row">No hay citas</td></tr>
                : filtered.map(a => (
                  <tr key={a.appointment_id}>
                    <td><strong>{customerName(a.customerId)}</strong></td>
                    <td>{optoName(a.optometristId)}</td>
                    <td>{examName(a.examTypeId)}</td>
                    <td>{formatDate(a.appointmentDate)}</td>
                    <td>{a.startTime || '—'}</td>
                    <td><span className={`badge badge-${STATUS_COLORS[a.status] || 'secondary'}`}>{STATUS_LABELS[a.status] || a.status}</span></td>
                    <td className="actions-cell">
                      <button className="btn-icon edit" onClick={() => openEdit(a)} title="Editar"><Pencil size={15} /></button>
                      {a.status !== 'CANCELLED' && <button className="btn-icon warn" onClick={() => handleCancel(a.appointment_id)} title="Cancelar"><Ban size={15} /></button>}
                      <button className="btn-icon delete" onClick={() => handleDelete(a.appointment_id)} title="Eliminar"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Cita' : 'Nueva Cita'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert-error"><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group"><label>Cliente *</label>
                  <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.firstName} {c.firstLastName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Optómetra *</label>
                  <select required value={form.optometristId} onChange={e => setForm({...form, optometristId: e.target.value})}>
                    <option value="">Seleccionar optómetra...</option>
                    {optometrists.map(o => <option key={o.id} value={o.id}>{o.firstName} {o.firstLastName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Tipo de examen *</label>
                  <select required value={form.examTypeId} onChange={e => setForm({...form, examTypeId: e.target.value})}>
                    <option value="">Seleccionar examen...</option>
                    {examTypes.map(e => <option key={e.id_exam_type} value={e.id_exam_type}>{e.exam_name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Fecha *</label><input required type="date" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} /></div>
                <div className="form-group"><label>Hora *</label><input required type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} /></div>
                <div className="form-group form-full"><label>Notas</label><textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Observaciones..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Cita'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
