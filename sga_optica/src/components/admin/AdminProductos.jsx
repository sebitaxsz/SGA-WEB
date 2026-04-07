import React, { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct, restoreProduct, getCategories } from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw, RotateCcw, Image } from 'lucide-react'

const BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms'
const EMPTY = { nameProduct: '', description: '', unitPrice: '', stock: '', categoryId: '', status: 'ACTIVE', imagen: null }

export default function AdminProductos() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (statusFilter) params.status = statusFilter
      const [pRes, cRes] = await Promise.all([getProducts(params), getCategories()])
      setProducts(pRes.data?.data || [])
      setTotalPages(pRes.data?.totalPages || 1)
      setCategories(cRes.data || [])
    } catch (e) {
      setError('Error: ' + (e.response?.data?.message || e.message))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, statusFilter])

  const openNew = () => { setForm(EMPTY); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (p) => {
    setForm({ nameProduct: p.nameProduct, description: p.description || '', unitPrice: p.unitPrice, stock: p.stock, categoryId: p.categoryId || '', status: p.status, imagen: null })
    setEditId(p.id); setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('nameProduct', form.nameProduct)
      fd.append('description', form.description)
      fd.append('unitPrice', parseFloat(form.unitPrice))
      fd.append('stock', parseInt(form.stock))
      fd.append('status', form.status)
      if (form.categoryId) fd.append('categoryId', parseInt(form.categoryId))
      if (form.imagen) fd.append('imagen', form.imagen)
      if (editId) { await updateProduct(editId, fd); setSuccess('Producto actualizado') }
      else { await createProduct(fd); setSuccess('Producto creado') }
      setShowModal(false); load(); setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return
    try {
      await deleteProduct(id); setSuccess('Producto eliminado'); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.response?.data?.message || 'Error') }
  }

  const handleRestore = async (id) => {
    try { await restoreProduct(id); setSuccess('Producto restaurado'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (e) { setError(e.response?.data?.message || 'Error') }
  }

  const filtered = products.filter(p => (p.nameProduct || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p className="section-subtitle">{products.length} productos cargados</p>
        </div>
        <div className="section-actions">
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Producto</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <>
          <div className="products-grid">
            {filtered.length === 0 ? (
              <p className="empty-msg">No se encontraron productos</p>
            ) : filtered.map(p => (
              <div key={p.id} className={`product-card-admin ${p.status === 'INACTIVE' ? 'inactive' : ''}`}>
                <div className="product-img-wrap">
                  {p.imagen ? (
                    <img src={`${BASE_URL}/uploads/products/${p.imagen.split('/').pop()}`} alt={p.nameProduct} className="product-img" onError={e => e.target.style.display='none'} />
                  ) : <div className="product-img-placeholder"><Image size={32} /></div>}
                  {p.status === 'INACTIVE' && <span className="inactive-badge">Inactivo</span>}
                </div>
                <div className="product-card-body">
                  <h4>{p.nameProduct}</h4>
                  <p className="product-category">{p.Category?.category_name || '—'}</p>
                  <div className="product-meta">
                    <span className="product-price">${Number(p.unitPrice).toLocaleString('es-CO')}</span>
                    <span className={`stock-badge ${p.stock < 5 ? 'low' : ''}`}>Stock: {p.stock}</span>
                  </div>
                  <div className="product-actions">
                    <button className="btn-icon edit" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                    {p.status === 'INACTIVE'
                      ? <button className="btn-icon restore" onClick={() => handleRestore(p.id)} title="Restaurar"><RotateCcw size={14} /></button>
                      : <button className="btn-icon delete" onClick={() => handleDelete(p.id, p.nameProduct)}><Trash2 size={14} /></button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
              <span>Pág {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert-error"><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group form-full">
                  <label>Nombre del producto *</label>
                  <input required value={form.nameProduct} onChange={e => setForm({...form, nameProduct: e.target.value})} placeholder="Ej: Ray-Ban Aviator Classic" />
                </div>
                <div className="form-group form-full">
                  <label>Descripción</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripción del producto..." />
                </div>
                <div className="form-group">
                  <label>Precio unitario *</label>
                  <input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
                <div className="form-group form-full">
                  <label>Imagen del producto</label>
                  <input type="file" accept="image/*" onChange={e => setForm({...form, imagen: e.target.files[0]})} />
                  {form.imagen && <p className="file-name">📎 {form.imagen.name}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
