// AdminNotificaciones.jsx - Versión corregida (solo admin, no cliente)
import React, { useState, useEffect } from 'react'
import { 
  getNotifications as getAdminNotifications, 
  createNotification, 
  updateNotification, 
  deleteNotification, 
  permDeleteNotif, 
  getCustomers 
} from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, RefreshCw, Bell, Send, Eye } from 'lucide-react'

const TYPE_LABELS = {
  APPOINTMENT_REMINDER: 'Recordatorio Cita',
  APPOINTMENT_CONFIRMED: 'Cita Confirmada',
  APPOINTMENT_CANCELLED: 'Cita Cancelada',
  GENERAL: 'General',
  PROMOTION: 'Promoción',
  SYSTEM_ALERT: 'Alerta del Sistema',
  MAINTENANCE: 'Mantenimiento'
}
const STATUS_COLORS = { PENDING: 'warning', SENT: 'info', READ: 'success' }
const EMPTY = { customerId: '', subject: '', message: '', type: 'GENERAL', scheduledFor: '' }

export default function AdminNotificaciones() {
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      // Usar el servicio específico de admin para notificaciones
      const [nRes, cRes] = await Promise.all([getAdminNotifications(), getCustomers()])
      // Filtrar para mostrar solo notificaciones creadas por admin o generales
      const notifications = nRes.data?.data || nRes.data || []
      setItems(notifications)
      setCustomers(cRes.data || [])
    } catch (e) { 
      setError('Error: ' + (e.response?.data?.message || e.message)) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (n) => {
    setForm({ 
      customerId: n.customerId || '', 
      subject: n.subject || '', 
      message: n.message || '', 
      type: n.type || 'GENERAL', 
      scheduledFor: n.scheduledFor ? n.scheduledFor.slice(0, 16) : '' 
    })
    setEditId(n.notification_id); setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form, customerId: parseInt(form.customerId) }
      if (editId) { 
        await updateNotification(editId, payload); 
        setSuccess('Notificación actualizada') 
      } else { 
        await createNotification(payload); 
        setSuccess('Notificación creada') 
      }
      setShowModal(false); load(); setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { 
      setSaving(false) 
    }
  }

  const handleSoftDelete = async (id) => {
    if (!window.confirm('¿Archivar esta notificación?')) return
    try { 
      await deleteNotification(id); 
      setSuccess('Notificación archivada'); 
      load(); 
      setTimeout(() => setSuccess(''), 3000) 
    } catch (e) { 
      setError(e.response?.data?.message || 'Error') 
    }
  }

  const handlePermDelete = async (id) => {
    if (!window.confirm('¿Eliminar PERMANENTEMENTE esta notificación? Esta acción no se puede deshacer.')) return
    try { 
      await permDeleteNotif(id); 
      setSuccess('Notificación eliminada'); 
      load(); 
      setTimeout(() => setSuccess(''), 3000) 
    } catch (e) { 
      setError(e.response?.data?.message || 'Error') 
    }
  }

  const customerName = (id) => {
    const c = customers.find(c => c.customer_id === id)
    return c ? `${c.firstName} ${c.firstLastName}` : `Cliente #${id}`
  }
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Notificaciones a Clientes</h2>
          <p className="section-subtitle">{items.length} notificaciones enviadas</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nueva Notificación</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Destinatario</th>
                <th>Asunto</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Enviada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No hay notificaciones</td></tr>
              ) : items.map(n => (
                <tr key={n.notification_id}>
                  <td>{customerName(n.customerId)}</td>
                  <td>
                    <strong>{n.subject}</strong>
                    <br />
                    <span className="text-sm text-muted">{n.message?.slice(0, 50)}{n.message?.length > 50 ? '…' : ''}</span>
                  </td>
                  <td><span className="badge badge-role">{TYPE_LABELS[n.type] || n.type}</span></td>
                  <td><span className={`badge badge-${STATUS_COLORS[n.status] || 'secondary'}`}>{n.status}</span></td>
                  <td>{formatDate(n.sent_at)}</td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" onClick={() => openEdit(n)} title="Editar"><Pencil size={15} /></button>
                    <button className="btn-icon warn" onClick={() => handleSoftDelete(n.notification_id)} title="Archivar"><Eye size={15} /></button>
                    <button className="btn-icon delete" onClick={() => handlePermDelete(n.notification_id)} title="Eliminar permanentemente"><Trash2 size={15} /></button>
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
              <h3>{editId ? 'Editar Notificación' : 'Nueva Notificación para Cliente'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert-error"><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Cliente destinatario *</label>
                  <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.firstName} {c.firstLastName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group form-full">
                  <label>Asunto *</label>
                  <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Asunto de la notificación" />
                </div>
                <div className="form-group form-full">
                  <label>Mensaje *</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Escribe el mensaje aquí..." />
                </div>
                <div className="form-group">
                  <label>Programar para (opcional)</label>
                  <input type="datetime-local" value={form.scheduledFor} onChange={e => setForm({...form, scheduledFor: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Send size={15} />
                  {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Notificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}