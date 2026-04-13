// AdminOptometras.jsx - Versión corregida
import React, { useState, useEffect } from 'react'
import { getOptometrists, createOptometrist, updateOptometrist, deleteOptometrist, getDocumentTypes, getUsers } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw, Stethoscope } from 'lucide-react'

const EMPTY = { 
  firstName: '', 
  secondName: '', 
  firstLastName: '', 
  secondLastName: '', 
  email: '', 
  phoneNumber: '', 
  documentNumber: '', 
  idDocType: '', 
  professionalCardCode: '', 
  idUser: '' 
}

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
      const [oRes, dRes, uRes] = await Promise.all([
        getOptometrists(), 
        getDocumentTypes(), 
        getUsers()
      ])
      // Asegurarse de que los datos sean arrays
      const optometrists = Array.isArray(oRes.data) ? oRes.data : []
      const documents = Array.isArray(dRes.data) ? dRes.data : []
      const usersList = Array.isArray(uRes.data) ? uRes.data : []
      
      setItems(optometrists)
      setDocTypes(documents)
      setUsers(usersList)
    } catch (e) { 
      setError('Error: ' + (e.response?.data?.message || e.message))
      console.error('Error loading optometrists:', e)
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
  
  const openEdit = (o) => {
    setForm({ 
      firstName: o.firstName || '', 
      secondName: o.secondName || '', 
      firstLastName: o.firstLastName || '', 
      secondLastName: o.secondLastName || '', 
      email: o.email || '', 
      phoneNumber: o.phoneNumber || '', 
      documentNumber: o.documentNumber || '', 
      idDocType: o.idDocType || '', 
      professionalCardCode: o.professionalCardCode || '', 
      idUser: o.idUser || '' 
    })
    setEditId(o.id)
    setError('')
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    // Validaciones básicas
    if (!form.firstName.trim()) {
      setError('El primer nombre es requerido')
      setSaving(false)
      return
    }
    if (!form.firstLastName.trim()) {
      setError('El primer apellido es requerido')
      setSaving(false)
      return
    }
    if (!form.documentNumber.trim()) {
      setError('El número de documento es requerido')
      setSaving(false)
      return
    }
    if (!form.idDocType) {
      setError('El tipo de documento es requerido')
      setSaving(false)
      return
    }
    if (!form.professionalCardCode.trim()) {
      setError('El código de tarjeta profesional es requerido')
      setSaving(false)
      return
    }
    if (!form.idUser) {
      setError('Debes seleccionar un usuario del sistema')
      setSaving(false)
      return
    }

    try {
      const payload = { 
        ...form, 
        idDocType: parseInt(form.idDocType),
        idUser: form.idUser // Asegurar que sea string o número según el modelo
      }
      
      // Eliminar campos vacíos para no enviarlos
      if (!payload.secondName) delete payload.secondName
      if (!payload.secondLastName) delete payload.secondLastName
      if (!payload.phoneNumber) delete payload.phoneNumber
      
      if (editId) { 
        await updateOptometrist(editId, payload)
        setSuccess('Optómetra actualizado correctamente')
      } else { 
        await createOptometrist(payload)
        setSuccess('Optómetra creado correctamente')
      }
      setShowModal(false)
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'Error al guardar'
      setError(errorMsg)
      console.error('Error saving optometrist:', e)
    } finally { 
      setSaving(false) 
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Desactivar optómetra "${name}"?`)) return
    try {
      await deleteOptometrist(id)
      setSuccess('Optómetra desactivado correctamente')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { 
      const errorMsg = e.response?.data?.message || 'Error al desactivar'
      setError(errorMsg)
      console.error('Error deleting optometrist:', e)
    }
  }

  const fullName = (o) => {
    const names = [o.firstName, o.secondName, o.firstLastName, o.secondLastName].filter(Boolean)
    return names.join(' ')
  }
  
  const filtered = items.filter(o => {
    const name = fullName(o).toLowerCase()
    const email = (o.email || '').toLowerCase()
    const searchTerm = search.toLowerCase()
    return name.includes(searchTerm) || email.includes(searchTerm)
  })

  // Filtrar usuarios que no están ya asociados a un optómetra (para nuevos)
  const availableUsers = users.filter(user => {
    if (editId) {
      // En edición, mostrar el usuario actual y los no asignados
      const currentOptometrist = items.find(o => o.id === editId)
      if (currentOptometrist && currentOptometrist.idUser === user.user_id) {
        return true
      }
    }
    // Verificar si el usuario ya está asignado a algún optómetra
    const isAssigned = items.some(opt => opt.idUser === user.user_id)
    return !isAssigned
  })

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
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Buscar optómetra por nombre o email..." 
        />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Tarjeta Profesional</th>
                <th>Usuario Sistema</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">No hay optómetras registrados</td></tr>
              ) : (
                filtered.map(o => {
                  const assignedUser = users.find(u => u.user_id === o.idUser)
                  return (
                    <tr key={o.id}>
                      <td>
                        <div className="cell-with-icon">
                          <span className="avatar-sm teal">{(o.firstName || '?').charAt(0)}</span>
                          <strong>{fullName(o)}</strong>
                        </div>
                      </td>
                      <td>{o.email || '—'}</td>
                      <td>{o.phoneNumber || '—'}</td>
                      <td>
                        <span className="badge badge-info">
                          {o.documentNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-teal">{o.professionalCardCode || '—'}</span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {assignedUser?.user_user || o.idUser || '—'}
                        </small>
                      </td>
                      <td className="actions-cell">
                        <button className="btn-icon edit" onClick={() => openEdit(o)} title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDelete(o.id, fullName(o))} title="Desactivar">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
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
            {error && <div className="alert-error" style={{ margin: '16px' }}><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Primer nombre *</label>
                  <input 
                    required 
                    value={form.firstName} 
                    onChange={e => setForm({...form, firstName: e.target.value})} 
                    placeholder="Primer nombre" 
                  />
                </div>
                <div className="form-group">
                  <label>Segundo nombre</label>
                  <input 
                    value={form.secondName} 
                    onChange={e => setForm({...form, secondName: e.target.value})} 
                    placeholder="Segundo nombre (opcional)" 
                  />
                </div>
                <div className="form-group">
                  <label>Primer apellido *</label>
                  <input 
                    required 
                    value={form.firstLastName} 
                    onChange={e => setForm({...form, firstLastName: e.target.value})} 
                    placeholder="Primer apellido" 
                  />
                </div>
                <div className="form-group">
                  <label>Segundo apellido</label>
                  <input 
                    value={form.secondLastName} 
                    onChange={e => setForm({...form, secondLastName: e.target.value})} 
                    placeholder="Segundo apellido (opcional)" 
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    required 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    placeholder="correo@ejemplo.com" 
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    value={form.phoneNumber} 
                    onChange={e => setForm({...form, phoneNumber: e.target.value})} 
                    placeholder="+57 300 000 0000" 
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de documento *</label>
                  <select 
                    required 
                    value={form.idDocType} 
                    onChange={e => setForm({...form, idDocType: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {docTypes.map(d => (
                      <option key={d.id_doc_type} value={d.id_doc_type}>
                        {d.document_name} ({d.type_document})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Número de documento *</label>
                  <input 
                    required 
                    value={form.documentNumber} 
                    onChange={e => setForm({...form, documentNumber: e.target.value})} 
                    placeholder="Número de documento" 
                  />
                </div>
                <div className="form-group">
                  <label>Tarjeta profesional *</label>
                  <input 
                    required 
                    value={form.professionalCardCode} 
                    onChange={e => setForm({...form, professionalCardCode: e.target.value})} 
                    placeholder="Código tarjeta profesional" 
                  />
                </div>
                <div className="form-group">
                  <label>Usuario del sistema *</label>
                  <select 
                    required 
                    value={form.idUser} 
                    onChange={e => setForm({...form, idUser: e.target.value})}
                  >
                    <option value="">Seleccionar usuario...</option>
                    {availableUsers.map(u => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.nombre || u.user_user} ({u.correo || u.user_user})
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    {editId ? 'El usuario actual ya está asignado a este optómetra' : 'Selecciona un usuario que no esté asignado a otro optómetra'}
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear Optómetra')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}