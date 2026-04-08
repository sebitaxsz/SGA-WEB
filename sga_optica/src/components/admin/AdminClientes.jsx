import React, { useState, useEffect } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getDocumentTypes } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw } from 'lucide-react'

/*
  GET  /customer      → requiere token + rol adminOrEmployee
  POST /customer      → requiere token + rol adminOrEmployee
  PUT  /customer/:id  → requiere token + rol adminOrEmployee
  DELETE /customer/:id → requiere token + solo admin

  Campos del modelo Customer:
    customer_id, firstName, secondName, firstLastName, secondLastName,
    phoneNumber, email, documentNumber, idDocType
*/

const EMPTY = {
  firstName: '', secondName: '', firstLastName: '', secondLastName: '',
  phoneNumber: '', email: '', documentNumber: '', idDocType: ''
}

export default function AdminClientes() {
  const [items, setItems]       = useState([])
  const [docTypes, setDocTypes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [cRes, dRes] = await Promise.all([getCustomers(), getDocumentTypes()])
      setItems(cRes.data || [])
      setDocTypes(dRes.data || [])
    } catch (e) {
      const msg = e.response?.data?.message || e.message
      setError('Error cargando clientes: ' + msg)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (c) => {
    setForm({
      firstName:      c.firstName      || '',
      secondName:     c.secondName     || '',
      firstLastName:  c.firstLastName  || '',
      secondLastName: c.secondLastName || '',
      phoneNumber:    c.phoneNumber    || '',
      email:          c.email          || '',
      documentNumber: c.documentNumber || '',
      idDocType:      c.idDocType      || ''
    })
    setEditId(c.customer_id); setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        idDocType: form.idDocType ? parseInt(form.idDocType) : null
      }
      if (editId) {
        await updateCustomer(editId, payload)
        setSuccess('Cliente actualizado correctamente')
      } else {
        await createCustomer(payload)
        setSuccess('Cliente creado correctamente')
      }
      setShowModal(false); load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar cliente "${name}"?`)) return
    try {
      await deleteCustomer(id)
      setSuccess('Cliente eliminado'); load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al eliminar')
    }
  }

  const fullName = (c) => [c.firstName, c.secondName, c.firstLastName, c.secondLastName].filter(Boolean).join(' ')
  const docLabel = (id) => {
    const d = docTypes.find(d => d.id_doc_type === id)
    return d ? d.type_document : ''
  }

  const filtered = items.filter(c => {
    const q = search.toLowerCase()
    return fullName(c).toLowerCase().includes(q)
      || (c.email || '').toLowerCase().includes(q)
      || (c.documentNumber || '').includes(q)
  })

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Clientes</h2>
          <p className="section-subtitle">{items.length} clientes registrados</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Cliente</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, correo o documento..." />
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">No se encontraron clientes</td></tr>
              ) : filtered.map(c => (
                <tr key={c.customer_id}>
                  <td>
                    <div className="cell-with-icon">
                      <span className="avatar-sm">{(c.firstName || '?').charAt(0).toUpperCase()}</span>
                      <strong>{fullName(c)}</strong>
                    </div>
                  </td>
                  <td>
                    {c.documentNumber
                      ? <><span className="badge badge-role">{docLabel(c.idDocType)}</span> {c.documentNumber}</>
                      : '—'}
                  </td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phoneNumber || '—'}</td>
                  <td className="actions-cell">
                    <button className="btn-icon edit"   onClick={() => openEdit(c)}                             title="Editar"><Pencil size={15} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(c.customer_id, fullName(c))} title="Eliminar"><Trash2 size={15} /></button>
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
              <h3>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert-error" style={{margin:'0 20px'}}><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group"><label>Primer nombre *</label><input required value={form.firstName}      onChange={e => setForm({...form, firstName:      e.target.value})} placeholder="Primer nombre" /></div>
                <div className="form-group"><label>Segundo nombre</label> <input         value={form.secondName}     onChange={e => setForm({...form, secondName:     e.target.value})} placeholder="Segundo nombre" /></div>
                <div className="form-group"><label>Primer apellido *</label><input required value={form.firstLastName}  onChange={e => setForm({...form, firstLastName:  e.target.value})} placeholder="Primer apellido" /></div>
                <div className="form-group"><label>Segundo apellido</label><input         value={form.secondLastName} onChange={e => setForm({...form, secondLastName: e.target.value})} placeholder="Segundo apellido" /></div>
                <div className="form-group">
                  <label>Tipo de documento</label>
                  <select value={form.idDocType} onChange={e => setForm({...form, idDocType: e.target.value})}>
                    <option value="">Sin tipo...</option>
                    {docTypes.map(d => <option key={d.id_doc_type} value={d.id_doc_type}>{d.document_name} ({d.type_document})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Número de documento</label><input value={form.documentNumber} onChange={e => setForm({...form, documentNumber: e.target.value})} placeholder="Número de documento" /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email}       onChange={e => setForm({...form, email:       e.target.value})} placeholder="correo@ejemplo.com" /></div>
                <div className="form-group"><label>Teléfono</label>    <input         value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="+57 300 000 0000" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
