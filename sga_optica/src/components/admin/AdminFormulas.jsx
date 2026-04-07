import React, { useState, useEffect } from 'react'
import { getFormulas, deleteFormula } from '../../services/admin.service'
import { Trash2, X, Check, Search, RefreshCw, FileText, Eye } from 'lucide-react'

const BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms'

export default function AdminFormulas() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getFormulas()
      setItems(res.data?.data || res.data || [])
    } catch (e) { setError('Error: ' + (e.response?.data?.message || e.message)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta fórmula permanentemente?')) return
    try { await deleteFormula(id); setSuccess('Fórmula eliminada'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (e) { setError(e.response?.data?.message || 'Error al eliminar') }
  }

  const customerName = (f) => {
    if (f.Customer) return `${f.Customer.firstName} ${f.Customer.firstLastName}`
    return `Cliente #${f.customerId}`
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const filtered = items.filter(f => customerName(f).toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Fórmulas Ópticas</h2>
          <p className="section-subtitle">{items.length} fórmulas registradas</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente..." />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Cliente</th><th>Tipo de examen</th><th>Fecha de examen</th><th>Archivo</th><th>Fecha registro</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="empty-row">No hay fórmulas</td></tr>
                : filtered.map(f => (
                  <tr key={f.formula_id}>
                    <td><strong>{customerName(f)}</strong></td>
                    <td>{f.ExamType?.exam_name || f.examTypeId || '—'}</td>
                    <td>{formatDate(f.examDate)}</td>
                    <td>
                      {f.filePath ? (
                        <button className="btn-icon info" onClick={() => setPreview(f)} title="Ver fórmula"><Eye size={15} /></button>
                      ) : <span className="text-muted">Sin archivo</span>}
                    </td>
                    <td>{formatDate(f.createdAt)}</td>
                    <td className="actions-cell">
                      <button className="btn-icon delete" onClick={() => handleDelete(f.formula_id)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Fórmula — {customerName(preview)}</h3>
              <button className="modal-close" onClick={() => setPreview(null)}><X size={18} /></button>
            </div>
            <div className="formula-preview">
              <div className="formula-details">
                <div className="detail-row"><span>Cliente:</span><strong>{customerName(preview)}</strong></div>
                <div className="detail-row"><span>Fecha examen:</span><strong>{formatDate(preview.examDate)}</strong></div>
                {preview.notes && <div className="detail-row"><span>Notas:</span><strong>{preview.notes}</strong></div>}
              </div>
              {preview.filePath && (
                <div className="formula-file-preview">
                  <p>Archivo de fórmula:</p>
                  <a href={`${BASE_URL}/${preview.filePath}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <FileText size={16} /> Abrir archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
