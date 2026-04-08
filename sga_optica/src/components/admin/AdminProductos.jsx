import React, { useState, useEffect } from 'react'
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, getCategories
} from '../../services/admin.service'
import { Plus, Pencil, Trash2, X, Check, Search, RefreshCw, Image } from 'lucide-react'

/*
  La API DELETE /products/:id hace soft-delete (status → INACTIVE).
  Para que el producto "desaparezca" de la vista de admin se carga
  siempre con status=ACTIVE. El admin puede ver inactivos usando el
  filtro manual "Inactivos".

  Para reactivar un producto inactivo: PATCH /products/:id/restore
  ya está disponible pero en este panel manejamos solo activos por defecto.
*/

const BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms'
const EMPTY = {
  nameProduct: '', description: '', unitPrice: '',
  stock: '', categoryId: '', status: 'ACTIVE', imagen: null
}

export default function AdminProductos() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)

  /* ── Carga: siempre status=ACTIVE ─────────────── */
  const load = async (p = page) => {
    setLoading(true); setError('')
    try {
      const [pRes, cRes] = await Promise.all([
        getProducts({ page: p, limit: 16, status: 'ACTIVE' }),
        getCategories()
      ])
      setProducts(pRes.data?.data || [])
      setTotalPages(pRes.data?.totalPages || 1)
      setTotalItems(pRes.data?.totalItems || 0)
      setCategories(cRes.data || [])
    } catch (e) {
      setError('Error cargando productos: ' + (e.response?.data?.message || e.message))
    } finally { setLoading(false) }
  }

  useEffect(() => { load(page) }, [page])

  /* ── Modal: abrir nuevo ────────────────────────── */
  const openNew = () => {
    setForm(EMPTY); setEditId(null)
    setPreviewUrl(null); setError(''); setShowModal(true)
  }

  /* ── Modal: abrir edición ──────────────────────── */
  const openEdit = (p) => {
    setForm({
      nameProduct: p.nameProduct   || '',
      description: p.description   || '',
      unitPrice:   p.unitPrice     || '',
      stock:       p.stock         || 0,
      categoryId:  p.categoryId    || '',
      status:      p.status        || 'ACTIVE',
      imagen:      null
    })
    // Mostrar imagen actual
    if (p.imagen) {
      const filename = p.imagen.split('/').pop()
      setPreviewUrl(`${BASE_URL}/uploads/products/${filename}`)
    } else {
      setPreviewUrl(null)
    }
    setEditId(p.id); setError(''); setShowModal(true)
  }

  /* ── Guardar (crear o editar) ──────────────────── */
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('nameProduct', form.nameProduct)
      fd.append('description', form.description || '')
      fd.append('unitPrice',   parseFloat(form.unitPrice))
      fd.append('stock',       parseInt(form.stock))
      fd.append('status',      form.status)
      if (form.categoryId) fd.append('categoryId', parseInt(form.categoryId))
      if (form.imagen)     fd.append('imagen', form.imagen)

      if (editId) {
        await updateProduct(editId, fd)
        setSuccess('Producto actualizado correctamente')
      } else {
        await createProduct(fd)
        setSuccess('Producto creado correctamente')
      }

      setShowModal(false)
      load(1); setPage(1)
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar producto')
    } finally { setSaving(false) }
  }

  /* ── Eliminar (soft-delete → desaparece de la lista ACTIVE) ─ */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Desactivar el producto "${name}"?\n\nEl producto quedará inactivo y no aparecerá en el catálogo.`)) return
    try {
      await deleteProduct(id)
      setSuccess(`"${name}" desactivado correctamente`)
      // Quitar de la lista local inmediatamente (sin recargar)
      setProducts(prev => prev.filter(p => p.id !== id))
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al eliminar producto')
    }
  }

  /* ── Cambio de imagen ──────────────────────────── */
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm({ ...form, imagen: file })
    setPreviewUrl(URL.createObjectURL(file))
  }

  /* ── Filtrado local por nombre ─────────────────── */
  const filtered = products.filter(p =>
    (p.nameProduct || '').toLowerCase().includes(search.toLowerCase())
  )

  /* ═══════════════════════════════════════════════ */
  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p className="section-subtitle">{totalItems} productos activos en total</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={() => load(page)} title="Recargar">
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre..."
        />
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>No se encontraron productos activos</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map(p => (
                <div key={p.id} className="product-card-admin">
                  {/* Imagen */}
                  <div className="product-img-wrap">
                    {p.imagen ? (
                      <img
                        src={`${BASE_URL}/uploads/products/${p.imagen.split('/').pop()}`}
                        alt={p.nameProduct}
                        className="product-img"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                      />
                    ) : null}
                    <div
                      className="product-img-placeholder"
                      style={{ display: p.imagen ? 'none' : 'flex' }}
                    >
                      <Image size={32} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="product-card-body">
                    <h4 title={p.nameProduct}>{p.nameProduct}</h4>
                    <p className="product-category">
                      {p.Category?.category_name || <em>Sin categoría</em>}
                    </p>
                    <div className="product-meta">
                      <span className="product-price">
                        ${Number(p.unitPrice).toLocaleString('es-CO')}
                      </span>
                      <span className={`stock-badge ${p.stock < 5 ? 'low' : ''}`}>
                        Stock: {p.stock}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="product-actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => openEdit(p)}
                        title="Editar producto"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(p.id, p.nameProduct)}
                        title="Desactivar producto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ← Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modal crear / editar ─────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="alert-error" style={{ margin: '0 20px' }}>
                <X size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">

                <div className="form-group form-full">
                  <label>Nombre del producto *</label>
                  <input
                    required
                    value={form.nameProduct}
                    onChange={e => setForm({...form, nameProduct: e.target.value})}
                    placeholder="Ej: Ray-Ban Aviator Classic"
                  />
                </div>

                <div className="form-group form-full">
                  <label>Descripción</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Descripción del producto..."
                  />
                </div>

                <div className="form-group">
                  <label>Precio unitario (COP) *</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={form.unitPrice}
                    onChange={e => setForm({...form, unitPrice: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    required type="number" min="0"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({...form, categoryId: e.target.value})}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>

                {/* Imagen */}
                <div className="form-group form-full">
                  <label>Imagen del producto</label>
                  <div className="image-upload-row">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="image-preview-thumb"
                        onError={e => e.target.style.display='none'}
                      />
                    )}
                    <div className="image-upload-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {editId && !form.imagen && (
                        <p className="file-name">Dejar vacío para conservar la imagen actual</p>
                      )}
                      {form.imagen && (
                        <p className="file-name">📎 {form.imagen.name}</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editId ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
