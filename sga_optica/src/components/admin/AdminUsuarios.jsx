import React, { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw } from 'lucide-react'

/*
  La API /user/register (admin) espera:
    user_user       → username / email del usuario
    user_password   → contraseña
    role_id         → id del rol (integer)
    first_name      → nombre (va a UserEntity)
    last_name       → apellido (va a UserEntity)
    phone           → teléfono (va a UserEntity, opcional)

  La API /user devuelve array de objetos con estructura:
    { user_id, user_user, role_id,
      UserEntityInfo: { first_name, last_name, phone },
      Role: { role_id, role_name } }

  La API /user/:id (PUT) espera los mismos campos opcionales.
*/

const EMPTY_FORM = {
  user_user: '',        // email/username
  user_password: '',
  confirm_password: '',
  role_id: '',
  first_name: '',
  last_name: '',
  phone: ''
}

export default function AdminUsuarios() {
  const [users, setUsers]       = useState([])
  const [roles, setRoles]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  /* ── Carga ─────────────────────────────────────── */
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

  /* ── Helpers ───────────────────────────────────── */
  const fullName = (u) => {
    const e = u.UserEntityInfo
    if (!e) return u.user_user || '—'
    return [e.first_name, e.last_name].filter(Boolean).join(' ') || u.user_user || '—'
  }

  const roleName = (u) => u.Role?.role_name || `Rol #${u.role_id}`

  /* ── Abrir modales ─────────────────────────────── */
  const openNew = () => {
    setForm(EMPTY_FORM); setEditId(null); setError(''); setShowModal(true)
  }

  const openEdit = (u) => {
    setForm({
      user_user:        u.user_user || '',
      user_password:    '',
      confirm_password: '',
      role_id:          u.role_id || '',
      first_name:       u.UserEntityInfo?.first_name || '',
      last_name:        u.UserEntityInfo?.last_name  || '',
      phone:            u.UserEntityInfo?.phone       || ''
    })
    setEditId(u.user_id); setError(''); setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError('') }

  /* ── Guardar ───────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    // Validar contraseñas coinciden (solo si se escribió alguna)
    if (form.user_password || !editId) {
      if (form.user_password !== form.confirm_password) {
        setError('Las contraseñas no coinciden.')
        return
      }
    }

    setSaving(true)
    try {
      if (editId) {
        /* PUT /user/:id — solo envía lo que cambió */
        const payload = {
          role_id:    parseInt(form.role_id),
          first_name: form.first_name,
          last_name:  form.last_name,
          phone:      form.phone || null
        }
        // El username también se puede cambiar
        if (form.user_user) payload.user_user = form.user_user
        // Solo envía contraseña si el admin la escribió
        if (form.user_password) payload.user_password = form.user_password

        await updateUser(editId, payload)
        setSuccess('Usuario actualizado correctamente')
      } else {
        /* POST /user/register (admin) */
        const payload = {
          user_user:     form.user_user,
          user_password: form.user_password,
          role_id:       parseInt(form.role_id),
          first_name:    form.first_name,
          last_name:     form.last_name,
          phone:         form.phone || null
        }
        await createUser(payload)
        setSuccess('Usuario creado correctamente')
      }

      closeModal()
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  /* ── Eliminar ──────────────────────────────────── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar usuario "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteUser(id)
      setSuccess('Usuario eliminado')
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al eliminar')
    }
  }

  /* ── Filtrado ──────────────────────────────────── */
  const filtered = users.filter(u => {
    const name  = fullName(u).toLowerCase()
    const email = (u.user_user || '').toLowerCase()
    const q     = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  /* ═══════════════════════════════════════════════ */
  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="section-subtitle">{users.length} usuarios registrados</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load} title="Recargar"><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Usuario</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
        />
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email / Username</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">No se encontraron usuarios</td></tr>
              ) : filtered.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div className="cell-with-icon">
                      <span className="avatar-sm">{(u.UserEntityInfo?.first_name || u.user_user || '?').charAt(0).toUpperCase()}</span>
                      <strong>{fullName(u)}</strong>
                    </div>
                  </td>
                  <td>{u.user_user}</td>
                  <td>{u.UserEntityInfo?.phone || '—'}</td>
                  <td><span className="badge badge-role">{roleName(u)}</span></td>
                  <td className="actions-cell">
                    <button className="btn-icon edit"   onClick={() => openEdit(u)}                         title="Editar"><Pencil size={15} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(u.user_id, fullName(u))} title="Eliminar"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            {error && <div className="alert-error" style={{margin:'0 20px 0'}}><X size={16} />{error}</div>}

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">

                {/* Nombre */}
                <div className="form-group">
                  <label>Primer nombre *</label>
                  <input
                    required
                    value={form.first_name}
                    onChange={e => setForm({...form, first_name: e.target.value})}
                    placeholder="Ej: Marlón"
                  />
                </div>

                {/* Apellido */}
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    required
                    value={form.last_name}
                    onChange={e => setForm({...form, last_name: e.target.value})}
                    placeholder="Ej: García"
                  />
                </div>

                {/* Email / username */}
                <div className="form-group">
                  <label>Email (username) *</label>
                  <input
                    required
                    type="email"
                    value={form.user_user}
                    onChange={e => setForm({...form, user_user: e.target.value})}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                {/* Teléfono */}
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+57 300 000 0000"
                  />
                </div>

                {/* Rol */}
                <div className="form-group form-full">
                  <label>Rol *</label>
                  <select
                    required
                    value={form.role_id}
                    onChange={e => setForm({...form, role_id: e.target.value})}
                  >
                    <option value="">Seleccionar rol...</option>
                    {/* Todos los roles disponibles en la BD */}
                    {roles.map(r => (
                      <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                    ))}
                  </select>
                </div>

                {/* Contraseña */}
                <div className="form-group">
                  <label>{editId ? 'Nueva contraseña (dejar vacío = no cambia)' : 'Contraseña *'}</label>
                  <input
                    type="password"
                    required={!editId}
                    value={form.user_password}
                    onChange={e => setForm({...form, user_password: e.target.value})}
                    placeholder={editId ? '••••••••' : 'Contraseña'}
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirmar contraseña */}
                <div className="form-group">
                  <label>Confirmar contraseña {!editId && '*'}</label>
                  <input
                    type="password"
                    required={!editId}
                    value={form.confirm_password}
                    onChange={e => setForm({...form, confirm_password: e.target.value})}
                    placeholder={editId ? '••••••••' : 'Confirmar contraseña'}
                    autoComplete="new-password"
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
