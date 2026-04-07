import React, { useState, useEffect } from 'react'
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getPaymentTypes, createPaymentType, updatePaymentType, deletePaymentType,
  getDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType,
  getExamTypes, createExamType, updateExamType, deleteExamType,
  getRoles, createRole, updateRole, deleteRole
} from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, RefreshCw, Tag, CreditCard, FileText, Eye, Shield } from 'lucide-react'

const CATALOGS = [
  { id: 'categories', label: 'Categorías', icon: Tag, color: 'purple' },
  { id: 'payments', label: 'Tipos de Pago', icon: CreditCard, color: 'green' },
  { id: 'documents', label: 'Tipos de Documento', icon: FileText, color: 'blue' },
  { id: 'exams', label: 'Tipos de Examen', icon: Eye, color: 'teal' },
  { id: 'roles', label: 'Roles', icon: Shield, color: 'orange' },
]

function SimpleModal({ title, fields, form, onChange, onSave, onClose, saving, error }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div className="alert-error"><X size={16} />{error}</div>}
        <form onSubmit={onSave} className="modal-form">
          <div className="form-grid">
            {fields.map(f => (
              <div key={f.key} className={`form-group ${f.full ? 'form-full' : ''}`}>
                <label>{f.label}{f.required ? ' *' : ''}</label>
                {f.type === 'select' ? (
                  <select required={f.required} value={form[f.key] || ''} onChange={e => onChange(f.key, e.target.value)}>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input required={f.required} type={f.type || 'text'} value={form[f.key] || ''} onChange={e => onChange(f.key, e.target.value)} placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CatalogTab({ catalog }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const config = {
    categories: {
      getAll: getCategories, create: createCategory, update: updateCategory, del: deleteCategory,
      idKey: 'category_id',
      nameKey: 'category_name',
      fields: [{ key: 'category_name', label: 'Nombre de categoría', required: true, placeholder: 'Ej: Monturas' }],
      cols: ['Categoría'],
      row: (i) => [i.category_name],
    },
    payments: {
      getAll: getPaymentTypes, create: createPaymentType, update: updatePaymentType, del: deletePaymentType,
      idKey: 'payment_type_id',
      nameKey: 'payment_type_name',
      fields: [
        { key: 'payment_type_name', label: 'Nombre', required: true, placeholder: 'Ej: Efectivo' },
        { key: 'description', label: 'Descripción', placeholder: 'Descripción del método de pago', full: true }
      ],
      cols: ['Tipo de Pago', 'Descripción'],
      row: (i) => [i.payment_type_name, i.description || '—'],
    },
    documents: {
      getAll: getDocumentTypes, create: createDocumentType, update: updateDocumentType, del: deleteDocumentType,
      idKey: 'id_doc_type',
      nameKey: 'document_name',
      fields: [
        { key: 'type_document', label: 'Código', required: true, placeholder: 'Ej: CC' },
        { key: 'document_name', label: 'Nombre completo', required: true, placeholder: 'Ej: Cédula de Ciudadanía' },
        { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'ACTIVE', label: 'Activo' }, { value: 'INACTIVE', label: 'Inactivo' }] }
      ],
      cols: ['Código', 'Nombre', 'Estado'],
      row: (i) => [i.type_document, i.document_name, i.status],
    },
    exams: {
      getAll: getExamTypes, create: createExamType, update: updateExamType, del: deleteExamType,
      idKey: 'id_exam_type',
      nameKey: 'exam_name',
      fields: [
        { key: 'exam_name', label: 'Nombre del examen', required: true, placeholder: 'Ej: Examen Visual Completo' },
        { key: 'description', label: 'Descripción', placeholder: 'Descripción', full: true },
        { key: 'duration_minutes', label: 'Duración (min)', type: 'number', placeholder: '30' }
      ],
      cols: ['Nombre', 'Descripción', 'Duración'],
      row: (i) => [i.exam_name, i.description || '—', i.duration_minutes ? `${i.duration_minutes} min` : '—'],
    },
    roles: {
      getAll: getRoles, create: createRole, update: updateRole, del: deleteRole,
      idKey: 'role_id',
      nameKey: 'role_name',
      fields: [
        { key: 'role_name', label: 'Nombre del rol', required: true, placeholder: 'Ej: empleado' },
        { key: 'description', label: 'Descripción', placeholder: 'Descripción del rol', full: true }
      ],
      cols: ['Rol', 'Descripción'],
      row: (i) => [i.role_name, i.description || '—'],
    },
  }

  const cfg = config[catalog.id]

  const load = async () => {
    setLoading(true)
    try {
      const res = await cfg.getAll()
      setItems(res.data || [])
    } catch (e) { setError('Error cargando: ' + (e.response?.data?.message || e.message)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [catalog.id])

  const openNew = () => { setForm({}); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (item) => { setForm({...item}); setEditId(item[cfg.idKey]); setError(''); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editId) { await cfg.update(editId, form); setSuccess('Actualizado correctamente') }
      else { await cfg.create(form); setSuccess('Creado correctamente') }
      setShowModal(false); load(); setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return
    try { await cfg.del(id); setSuccess('Eliminado'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (e) { setError(e.response?.data?.message || 'Error al eliminar') }
  }

  return (
    <div>
      <div className="catalog-toolbar">
        {success && <div className="alert-success inline"><Check size={14} />{success}</div>}
        {error && !showModal && <div className="alert-error inline"><X size={14} />{error}</div>}
        <div className="spacer" />
        <button className="btn-refresh" onClick={load}><RefreshCw size={14} /></button>
        <button className="btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Agregar</button>
      </div>

      {loading ? <div className="loading-spinner sm"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr>{cfg.cols.map(c => <th key={c}>{c}</th>)}<th>Acciones</th></tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan={cfg.cols.length + 1} className="empty-row">Sin registros</td></tr>
                : items.map(item => (
                  <tr key={item[cfg.idKey]}>
                    {cfg.row(item).map((v, i) => <td key={i}>{v}</td>)}
                    <td className="actions-cell">
                      <button className="btn-icon edit" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(item[cfg.idKey], item[cfg.nameKey])}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SimpleModal
          title={editId ? `Editar ${catalog.label}` : `Nuevo ${catalog.label}`}
          fields={cfg.fields}
          form={form}
          onChange={(k, v) => setForm(f => ({...f, [k]: v}))}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
          error={error}
        />
      )}
    </div>
  )
}

export default function AdminCatalogos() {
  const [activeTab, setActiveTab] = useState('categories')
  const active = CATALOGS.find(c => c.id === activeTab)

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Catálogos del Sistema</h2>
          <p className="section-subtitle">Gestiona categorías, tipos de pago, documentos, exámenes y roles</p>
        </div>
      </div>

      <div className="catalog-tabs">
        {CATALOGS.map(c => {
          const Icon = c.icon
          return (
            <button key={c.id} className={`catalog-tab ${activeTab === c.id ? 'active' : ''} tab-${c.color}`} onClick={() => setActiveTab(c.id)}>
              <Icon size={16} />{c.label}
            </button>
          )
        })}
      </div>

      <div className="catalog-content">
        <CatalogTab key={activeTab} catalog={active} />
      </div>
    </div>
  )
}
