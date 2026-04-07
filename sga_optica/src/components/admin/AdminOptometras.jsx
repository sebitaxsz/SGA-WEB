import React, { useState, useEffect } from 'react'
import { getOptometrists, createOptometrist, updateOptometrist, deleteOptometrist, getDocumentTypes, getUsers } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw, Stethoscope } from 'lucide-react'

const EMPTY = { firstName: '', secondName: '', firstLastName: '', secondLastName: '', email: '', phoneNumber: '', documentNumber: '', idDocType: '', professionalCardCode: '', idUser: '' }

export default function AdminOptometras() {
  const [items, setItems] = useState([])
  const [docTypes, setDocTypes] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [oRes, dRes, uRes] = await Promise.all([getOptometrists(), getDocumentTypes(), getUsers()])
      setItems(oRes.data || [])
      setDocTypes(dRes.data || [])
      setUsers(uRes.data || [])
    } catch (e) { setError('Error: ' + (e.response?.data?.message || e.message)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (o) => {
    setForm({ firstName: o.firstName || '', secondName: o.secondName || '', firstLastName: o.firstLastName || '', secondLastName: o.secondLastName || '', email: o.email || '', phoneNumber: o.phoneNumber || '', documentNumber: o.documentNumber || '', idDocType: o.idDocType || '', professionalCardCode: o.professionalCardCode || '', idUser: o.idUser || '' })
    setEditId(o.id); setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form, idDocType: parseInt(form.idDocType) }
      if (editId) { await updateOptometrist(editId, payload); setSuccess('Optómetra actualizado') }
      else { await createOptometrist(payload); setSuccess('Optómetra creado') }
      setShowModal(false); load(); setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Desactivar optómetra "${name}"?`)) return
    try {
      await deleteOptometrist(id); setSuccess('Optómetra desactivado'); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.response?.data?.message || 'Error') }
  }

  const fullName = (o) => [o.firstName, o.secondName, o.firstLastName, o.secondLastName].filter(Boolean).join(' ')
  const filtered = items.filter(o => fullName(o).toLowerCase().includes(search.toLowerCase()) || (o.email || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Optómetras</h2>
          <p className="section-subtitle">{items.length} optómetras registrados</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Optómetra</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar optómetra..." />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Tarjeta Profesional</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} className="empty-row">No hay optómetras</td></tr>
                : filtered.map(o => (
                  <tr key={o.id}>
                    <td><div className="cell-with-icon"><span className="avatar-sm teal">{(o.firstName || '?').charAt(0)}</span><strong>{fullName(o)}</strong></div></td>
                    <td>{o.email}</td>
                    <td>{o.phoneNumber || '—'}</td>
                    <td><span className="badge badge-teal">{o.professionalCardCode}</span></td>
                    <td className="actions-cell">
                      <button className="btn-icon edit" onClick={() => openEdit(o)}><Pencil size={15} /></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(o.id, fullName(o))}><Trash2 size={15} /></button>
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
              <h3>{editId ? 'Editar Optómetra' : 'Nuevo Optómetra'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert-error"><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group"><label>Primer nombre *</label><input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Primer nombre" /></div>
                <div className="form-group"><label>Segundo nombre</label><input value={form.secondName} onChange={e => setForm({...form, secondName: e.target.value})} placeholder="Segundo nombre" /></div>
                <div className="form-group"><label>Primer apellido *</label><input required value={form.firstLastName} onChange={e => setForm({...form, firstLastName: e.target.value})} placeholder="Primer apellido" /></div>
                <div className="form-group"><label>Segundo apellido</label><input value={form.secondLastName} onChange={e => setForm({...form, secondLastName: e.target.value})} placeholder="Segundo apellido" /></div>
                <div className="form-group"><label>Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="correo@ejemplo.com" /></div>
                <div className="form-group"><label>Teléfono</label><input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="+57 300 000 0000" /></div>
                <div className="form-group"><label>Tipo de documento *</label>
                  <select required value={form.idDocType} onChange={e => setForm({...form, idDocType: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {docTypes.map(d => <option key={d.id_doc_type} value={d.id_doc_type}>{d.document_name} ({d.type_document})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Número de documento *</label><input required value={form.documentNumber} onChange={e => setForm({...form, documentNumber: e.target.value})} placeholder="Número de documento" /></div>
                <div className="form-group"><label>Tarjeta profesional *</label><input required value={form.professionalCardCode} onChange={e => setForm({...form, professionalCardCode: e.target.value})} placeholder="Código tarjeta profesional" /></div>
                <div className="form-group"><label>Usuario del sistema *</label>
                  <select required value={form.idUser} onChange={e => setForm({...form, idUser: e.target.value})}>
                    <option value="">Seleccionar usuario...</option>
                    {users.map(u => <option key={u.user_id} value={u.user_id}>{u.nombre} ({u.correo})</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Optómetra'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
