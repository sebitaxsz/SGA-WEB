import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Package, Calendar, DollarSign,
  LogOut, Bell, FileText, LayoutDashboard, Stethoscope,
  Tag, FileSearch, Menu
} from 'lucide-react'

import Reportes from './reportes/Reportes'
import AdminUsuarios from './admin/AdminUsuarios'
import AdminProductos from './admin/AdminProductos'
import AdminClientes from './admin/AdminClientes'
import AdminOptometras from './admin/AdminOptometras'
import AdminCitas from './admin/AdminCitas'
import AdminCatalogos from './admin/AdminCatalogos'
import AdminVentas from './admin/AdminVentas'
import AdminNotificaciones from './admin/AdminNotificaciones'
import AdminFormulas from './admin/AdminFormulas'

import { getSales, getCustomers, getProducts, getAppointments } from '../services/admin.service'
import './Admin.css'
import './admin/AdminPanel.css'

const NAV = [
  {
    section: 'Principal',
    items: [
      { id: 'dashboard',      label: 'Dashboard',            icon: LayoutDashboard },
      { id: 'reportes',       label: 'Reportes',             icon: FileText },
    ]
  },
  {
    section: 'Gestión',
    items: [
      { id: 'usuarios',       label: 'Usuarios',             icon: Users },
      { id: 'clientes',       label: 'Clientes',             icon: Users },
      { id: 'optometras',     label: 'Optómetras',           icon: Stethoscope },
      { id: 'productos',      label: 'Productos',            icon: Package },
      { id: 'ventas',         label: 'Ventas',               icon: DollarSign },
      { id: 'citas',          label: 'Citas',                icon: Calendar },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { id: 'notificaciones', label: 'Notificaciones Admin', icon: Bell },
      { id: 'formulas',       label: 'Fórmulas',             icon: FileSearch },
      { id: 'catalogos',      label: 'Catálogos',            icon: Tag },
    ]
  }
]

const SECTION_TITLES = {
  dashboard: 'Dashboard',       reportes: 'Reportes',
  usuarios: 'Usuarios',         clientes: 'Clientes',
  optometras: 'Optómetras',     productos: 'Productos',
  ventas: 'Ventas',             citas: 'Citas',
  notificaciones: 'Notificaciones Admin',
  formulas: 'Fórmulas Ópticas', catalogos: 'Catálogos',
}

/* ── Dashboard ── */
function Dashboard() {
  const [stats, setStats] = useState({ sales: 0, customers: 0, products: 0, appointments: 0, salesAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [recentSales, setRecentSales] = useState([])
  const [upcomingAppts, setUpcomingAppts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes, pRes, aRes] = await Promise.all([
          getSales(), getCustomers(), getProducts({ limit: 1 }), getAppointments()
        ])
        const sales     = sRes.data?.data || sRes.data || []
        const customers = cRes.data || []
        const products  = pRes.data?.totalItems || 0
        const appts     = aRes.data?.data || aRes.data || []
        const totalAmount = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0)
        setStats({ sales: sales.length, customers: customers.length, products, appointments: appts.length, salesAmount: totalAmount })
        setRecentSales(sales.slice(0, 5))
        setUpcomingAppts(appts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').slice(0, 5))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`
  const STATUS_COLORS = { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'info', CANCELLED: 'danger' }
  const STATUS_LABELS = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada', CANCELLED: 'Cancelada' }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon sales"><DollarSign size={24} /></div>
          <div className="stat-info"><h3>{fmt(stats.salesAmount)}</h3><p>Total en Ventas</p><span className="stat-sub">{stats.sales} transacciones</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon appointments"><Calendar size={24} /></div>
          <div className="stat-info"><h3>{stats.appointments}</h3><p>Citas Totales</p><span className="stat-sub">{upcomingAppts.length} activas</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inventory"><Package size={24} /></div>
          <div className="stat-info"><h3>{stats.products}</h3><p>Productos</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon clients"><Users size={24} /></div>
          <div className="stat-info"><h3>{stats.customers}</h3><p>Clientes</p></div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="card-header"><h2>Ventas Recientes</h2></div>
          <div className="table-container">
            {recentSales.length === 0
              ? <p className="empty-msg">Sin ventas registradas aún</p>
              : (
                <table className="data-table">
                  <thead><tr><th>N°</th><th>Total</th><th>Fecha</th></tr></thead>
                  <tbody>
                    {recentSales.map(s => (
                      <tr key={s.sale_id}>
                        <td>#{s.sale_id}</td>
                        <td className="money">{fmt(s.totalAmount)}</td>
                        <td>{s.saleDate ? new Date(s.saleDate).toLocaleDateString('es-CO') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header"><h2>Citas Activas</h2></div>
          <div className="appointments-list">
            {upcomingAppts.length === 0
              ? <p className="empty-msg">No hay citas activas</p>
              : upcomingAppts.map(a => (
                <div key={a.appointment_id} className="appointment-item">
                  <div className="appointment-header">
                    <div className="appointment-client">
                      <h4>Cita #{a.appointment_id}</h4>
                      <span className="appointment-time">{a.startTime || '—'}</span>
                    </div>
                    <span className={`appointment-status status-${STATUS_COLORS[a.status] || 'secondary'}`}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </div>
                  <p className="appointment-service">
                    {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Panel Principal ── */
const PanelAdmin = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Agregar clase al body para estilos específicos del admin
  useEffect(() => {
    document.body.classList.add('admin-active')
    return () => document.body.classList.remove('admin-active')
  }, [])

  // Verificar autenticación y rol admin
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user  = localStorage.getItem('user')
    if (!token || !user) { navigate('/login'); return }
    try {
      const userData    = JSON.parse(user)
      const ADMIN_ROLES = ['administrador', 'admin']
      const roleLower   = (userData.role_lower || userData.role || '').toLowerCase()
      const isUserAdmin = userData.is_admin === true || ADMIN_ROLES.includes(roleLower)
      if (!isUserAdmin) { navigate('/'); return }
      setIsAdmin(true)
      setUserName(userData.nombre || userData.user_user || 'Administrador')
    } catch { navigate('/') }
    finally { setLoading(false) }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    navigate('/login')
  }

  const navigate_section = (id) => {
    setActiveSection(id)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':      return <Dashboard />
      case 'reportes':       return <Reportes />
      case 'usuarios':       return <AdminUsuarios />
      case 'clientes':       return <AdminClientes />
      case 'optometras':     return <AdminOptometras />
      case 'productos':      return <AdminProductos />
      case 'ventas':         return <AdminVentas />
      case 'citas':          return <AdminCitas />
      case 'notificaciones': return <AdminNotificaciones />
      case 'formulas':       return <AdminFormulas />
      case 'catalogos':      return <AdminCatalogos />
      default:               return <Dashboard />
    }
  }

  if (loading) return (
    <div className="admin-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )
  if (!isAdmin) return null

  return (
    <div className={`admin-panel new-panel ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar new-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-emoji">👁</span>
            <div className={`logo-text ${sidebarOpen ? '' : 'hidden'}`}>
              <span className="logo-title">SGA Óptica</span>
              <span className="logo-sub">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(group => (
            <div className="nav-section" key={group.section}>
              {sidebarOpen && <h3 className="nav-section-title">{group.section}</h3>}
              <ul>
                {group.items.map(item => {
                  const Icon = item.icon
                  return (
                    <li
                      key={item.id}
                      className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => navigate_section(item.id)}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <Icon size={18} className="nav-icon" />
                      {sidebarOpen && <span className="nav-label">{item.label}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-user">
              <div className="avatar sm">{userName.charAt(0).toUpperCase()}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{userName}</span>
                <span className="role-badge admin">Admin</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={18} />
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main new-main">

        {/* Topbar - SIN campanita de notificaciones */}
        <header className="admin-topbar new-topbar">
          <div className="topbar-left">
            <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="topbar-title">{SECTION_TITLES[activeSection]}</h1>
              <p className="topbar-sub">Bienvenido, {userName}</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-user">
              <div className="avatar sm">{userName.charAt(0).toUpperCase()}</div>
              <span className="topbar-user-name">{userName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}

export default PanelAdmin