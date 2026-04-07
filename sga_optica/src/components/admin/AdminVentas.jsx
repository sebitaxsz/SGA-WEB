import React, { useState, useEffect } from 'react'
import { getSales, getSaleById, deleteSale, createSale, getCustomers, getPaymentTypes, getProducts } from '../../services/admin.service'
import { Trash2, X, Check, Search, RefreshCw, Eye, ShoppingCart, Plus } from 'lucide-react'

const EMPTY_SALE = { customerId: '', paymentTypeId: '', notes: '' }

export default function AdminVentas() {
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [form, setForm] = useState(EMPTY_SALE)
  const [saleItems, setSaleItems] = useState([{ productId: '', quantity: 1 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, cRes, pRes, prRes] = await Promise.all([getSales(), getCustomers(), getPaymentTypes(), getProducts({ limit: 200 })])
      setItems(sRes.data?.data || sRes.data || [])
      setCustomers(cRes.data || [])
      setPaymentTypes(pRes.data || [])
      setProducts(prRes.data?.data || [])
    } catch (e) { setError('Error: ' + (e.response?.data?.message || e.message)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openDetail = async (sale) => {
    try {
      const res = await getSaleById(sale.sale_id)
      setShowDetail(res.data)
    } catch { setShowDetail(sale) }
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const saleProducts = saleItems.filter(i => i.productId).map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) }))
      await createSale({ customerId: parseInt(form.customerId), paymentTypeId: parseInt(form.paymentTypeId), notes: form.notes, products: saleProducts })
      setSuccess('Venta registrada'); setShowModal(false); setForm(EMPTY_SALE); setSaleItems([{ productId: '', quantity: 1 }])
      load(); setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Error al crear venta')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta venta?')) return
    try { await deleteSale(id); setSuccess('Venta eliminada'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (e) { setError(e.response?.data?.message || 'Error') }
  }

  const addItem = () => setSaleItems(prev => [...prev, { productId: '', quantity: 1 }])
  const removeItem = (i) => setSaleItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) => setSaleItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it))

  const customerName = (id) => { const c = customers.find(c => c.customer_id === id); return c ? `${c.firstName} ${c.firstLastName}` : `#${id}` }
  const payName = (id) => { const p = paymentTypes.find(p => p.payment_type_id === id); return p ? p.payment_type_name : `#${id}` }
  const productName = (id) => { const p = products.find(p => p.id === parseInt(id)); return p ? p.nameProduct : '' }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
  const formatMoney = (n) => n !== undefined ? `$${Number(n).toLocaleString('es-CO')}` : '—'

  const filtered = items.filter(s => customerName(s.customerId).toLowerCase().includes(search.toLowerCase()) || String(s.sale_id).includes(search))

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>Gestión de Ventas</h2>
          <p className="section-subtitle">{items.length} ventas registradas</p>
        </div>
        <div className="section-actions">
          <button className="btn-refresh" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn-primary" onClick={() => { setForm(EMPTY_SALE); setSaleItems([{ productId: '', quantity: 1 }]); setError(''); setShowModal(true) }}><Plus size={16} /> Nueva Venta</button>
        </div>
      </div>

      {success && <div className="alert-success"><Check size={16} />{success}</div>}
      {error && !showModal && <div className="alert-error"><X size={16} />{error}</div>}

      <div className="search-bar-section">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente o N° venta..." />
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>N° Venta</th><th>Cliente</th><th>Pago</th><th>Total</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="empty-row">No hay ventas</td></tr>
                : filtered.map(s => (
                  <tr key={s.sale_id}>
                    <td><strong>#{s.sale_id}</strong></td>
                    <td>{customerName(s.customerId)}</td>
                    <td>{payName(s.paymentTypeId)}</td>
                    <td className="money">{formatMoney(s.totalAmount)}</td>
                    <td>{formatDate(s.saleDate || s.createdAt)}</td>
                    <td className="actions-cell">
                      <button className="btn-icon info" onClick={() => openDetail(s)} title="Ver detalle"><Eye size={15} /></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(s.sale_id)} title="Eliminar"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Venta */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Venta</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert-error"><X size={16} />{error}</div>}
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="form-group"><label>Cliente *</label>
                  <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.firstName} {c.firstLastName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Tipo de pago *</label>
                  <select required value={form.paymentTypeId} onChange={e => setForm({...form, paymentTypeId: e.target.value})}>
                    <option value="">Seleccionar pago...</option>
                    {paymentTypes.map(p => <option key={p.payment_type_id} value={p.payment_type_id}>{p.payment_type_name}</option>)}
                  </select>
                </div>
                <div className="form-group form-full"><label>Notas</label><textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notas de la venta..." /></div>
              </div>

              <div className="sale-items-section">
                <div className="sale-items-header">
                  <h4>Productos</h4>
                  <button type="button" className="btn-secondary btn-sm" onClick={addItem}><Plus size={14} /> Agregar producto</button>
                </div>
                {saleItems.map((item, i) => (
                  <div key={i} className="sale-item-row">
                    <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                      <option value="">Seleccionar producto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.nameProduct} — {formatMoney(p.unitPrice)}</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Cant." className="quantity-input" />
                    {saleItems.length > 1 && <button type="button" className="btn-icon delete" onClick={() => removeItem(i)}><X size={14} /></button>}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Registrando...' : 'Registrar Venta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Venta */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle Venta #{showDetail.sale_id}</h3>
              <button className="modal-close" onClick={() => setShowDetail(null)}><X size={18} /></button>
            </div>
            <div className="sale-detail">
              <div className="detail-row"><span>Cliente:</span><strong>{customerName(showDetail.customerId)}</strong></div>
              <div className="detail-row"><span>Pago:</span><strong>{payName(showDetail.paymentTypeId)}</strong></div>
              <div className="detail-row"><span>Fecha:</span><strong>{formatDate(showDetail.saleDate || showDetail.createdAt)}</strong></div>
              {showDetail.notes && <div className="detail-row"><span>Notas:</span><strong>{showDetail.notes}</strong></div>}
              {showDetail.SaleProducts && showDetail.SaleProducts.length > 0 && (
                <div className="detail-products">
                  <h4>Productos:</h4>
                  <table className="admin-table compact">
                    <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {showDetail.SaleProducts.map((sp, i) => (
                        <tr key={i}>
                          <td>{sp.Product?.nameProduct || sp.productId}</td>
                          <td>{sp.quantity}</td>
                          <td>{formatMoney(sp.unitPrice)}</td>
                          <td>{formatMoney(sp.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="detail-total"><strong>Total: {formatMoney(showDetail.totalAmount)}</strong></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
