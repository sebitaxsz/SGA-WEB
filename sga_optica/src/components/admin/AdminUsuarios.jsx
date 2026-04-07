import React, { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw } from 'lucide-react'

const EMPTY_FORM = {
  nombre: '', correo: '', contrasena: '', confirmar_contrasena: '',
  telefono: '', role_id: ''
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([getUsers(), getRoles()])
      setUsers(uRes.data || [])
      setRoles(rRes.data || [])
    } catch (e) {
      setError('Error cargando datos: ' + (e.response?.data?.message || e.message))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (u) => {
    setForm({ nombre: u.nombre || '', correo: u.correo || '', contrasena: '', confirmar_contrasena: '', telefono: u.telefono || '', role_id: u.role_id || '' })
    setEditId(u.user_id); setError(''); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setError('') }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editId) {
        const payload = { nombre: form.nombre, correo: form.correo, telefono: form.telefono, role_id: parseInt(form.role_id) }
        if (form.contrasena) { payload.contrasena = form.contrasena; payload.confirmar_contrasena = form.confirmar_contrasena }
        await updateUser(editId, payload)
        setSuccess('Usuario actualizado correctamente')
      } else {
        await createUser({ ...form, role_id: parseInt(form.role_id) })
        setSuccess('Usuario creado correctamente')
      }
      closeModal(); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar usuario "${nombre}"?`)) return
    try {
      await deleteUser(id)
      setSuccess('Usuario eliminado'); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al eliminar')
    }
  }

  const filtered = users.filter(u =>
    (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.correo || '').toLowerCase().includes(search.toLowerCase())
  )

  const roleLabel = (id) => roles.find(r => r.role_id === id)?.role_name || id

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="section-subtitle">{users.length} usuarios registrados</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Usuario</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o correo..." />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">No se encontraron usuarios</td></tr>
              ) : filtered.map(u => (
                <tr key={u.user_id}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.correo}</td>
                  <td>{u.telefono || '—'}</td>
                  <td><span className="badge badge-role">{roleLabel(u.role_id)}</span></td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" onClick={() => openEdit(u)} title="Editar"><Pencil size={15} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(u.user_id, u.nombre)} title="Eliminar"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            {error && <div className="alert-error"><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre completo" />
                </div>
                <div className="form-group">
                  <label>Correo electrónico *</label>
                  <input required type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} placeholder="correo@ejemplo.com" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="+57 300 000 0000" />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select required value={form.role_id} onChange={e => setForm({...form, role_id: e.target.value})}>
                    <option value="">Seleccionar rol...</option>
                    {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{editId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                  <input type="password" required={!editId} value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} placeholder="Contraseña" />
                </div>
                <div className="form-group">
                  <label>Confirmar contraseña {!editId && '*'}</label>
                  <input type="password" required={!editId} value={form.confirmar_contrasena} onChange={e => setForm({...form, confirmar_contrasena: e.target.value})} placeholder="Confirmar contraseña" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
