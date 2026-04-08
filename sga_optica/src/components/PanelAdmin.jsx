import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Package, Calendar, DollarSign, Settings,
  LogOut, Bell, FileText, LayoutDashboard, Stethoscope,
  Tag, X, Check, Clock, CheckCircle, XCircle, ChevronRight,
  ShoppingCart, FileSearch, Menu
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

import { getNotifications, markNotifRead, getSales, getCustomers, getProducts, getAppointments } from '../services/admin.service'
import './Admin.css'
import './admin/AdminPanel.css'

const NAV = [
  {
    section: 'Principal',
    items: [
      { id: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
      { id: 'reportes',        label: 'Reportes',         icon: FileText },
    ]
  },
  {
    section: 'Gestión',
    items: [
      { id: 'usuarios',        label: 'Usuarios',         icon: Users },
      { id: 'clientes',        label: 'Clientes',         icon: Users },
      { id: 'optometras',      label: 'Optómetras',       icon: Stethoscope },
      { id: 'productos',       label: 'Productos',        icon: Package },
      { id: 'ventas',          label: 'Ventas',           icon: DollarSign },
      { id: 'citas',           label: 'Citas',            icon: Calendar },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { id: 'notificaciones',  label: 'Notificaciones',   icon: Bell },
      { id: 'formulas',        label: 'Fórmulas',         icon: FileSearch },
      { id: 'catalogos',       label: 'Catálogos',        icon: Tag },
    ]
  }
]

const SECTION_TITLES = {
  dashboard:'Dashboard', reportes:'Reportes', usuarios:'Usuarios',
  clientes:'Clientes', optometras:'Optómetras', productos:'Productos',
  ventas:'Ventas', citas:'Citas', notificaciones:'Notificaciones',
  formulas:'Fórmulas Ópticas', catalogos:'Catálogos',
}

/* Dashboard con datos reales */
function Dashboard() {
  const [stats, setStats] = useState({ sales:0, customers:0, products:0, appointments:0, salesAmount:0 })
  const [loading, setLoading] = useState(true)
  const [recentSales, setRecentSales] = useState([])
  const [upcomingAppts, setUpcomingAppts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes, pRes, aRes] = await Promise.all([
          getSales(), getCustomers(), getProducts({ limit: 1 }), getAppointments()
        ])
        const sales = sRes.data?.data || sRes.data || []
        const customers = cRes.data || []
        const products = pRes.data?.totalItems || 0
        const appts = aRes.data?.data || aRes.data || []
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
  const STATUS_COLORS = { PENDING:'warning', CONFIRMED:'success', COMPLETED:'info', CANCELLED:'danger' }
  const STATUS_LABELS = { PENDING:'Pendiente', CONFIRMED:'Confirmada', COMPLETED:'Completada', CANCELLED:'Cancelada' }

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
            {recentSales.length === 0 ? <p className="empty-msg">Sin ventas registradas aún</p> : (
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
            {upcomingAppts.length === 0 ? <p className="empty-msg">No hay citas activas</p>
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
                  <p className="appointment-service">{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('es-CO', {day:'2-digit',month:'short',year:'numeric'}) : '—'}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Panel principal */
const PanelAdmin = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (!token || !user) { navigate('/login'); return }
    try {
      const userData = JSON.parse(user)
      const roleVal = (userData.role || userData.role_name || '').toLowerCase(); const isUserAdmin = roleVal === 'admin' || roleVal === 'administrador' || userData.role_id === 1
      if (!isUserAdmin) { navigate('/'); return }
      setIsAdmin(true)
      setUserName(userData.nombre || userData.firstName || 'Administrador')
    } catch { navigate('/') }
    finally { setLoading(false) }
  }, [navigate])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      const data = res.data?.data || res.data || []
      setNotifications(data)
      setUnreadCount(data.filter(n => n.status === 'PENDING' || n.status === 'SENT').length)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { if (isAdmin) fetchNotifications() }, [isAdmin])

  const handleMarkRead = async (id) => {
    try {
      await markNotifRead(id)
      setNotifications(prev => prev.map(n => n.notification_id === id ? {...n, status:'READ'} : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch(e) { console.error(e) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('rememberMe')
    navigate('/login')
  }

  const formatDate = (d) => {
    if (!d) return ''
    const diff = Math.floor((Date.now() - new Date(d)) / 60000)
    if (diff < 1) return 'Ahora'
    if (diff < 60) return `Hace ${diff} min`
    if (diff < 1440) return `Hace ${Math.floor(diff/60)} h`
    return new Date(d).toLocaleDateString('es-ES')
  }

  const getNotifIcon = (type) => {
    if (type === 'APPOINTMENT_CONFIRMED') return <CheckCircle size={15} style={{color:'#22c55e'}} />
    if (type === 'APPOINTMENT_CANCELLED') return <XCircle size={15} style={{color:'#ef4444'}} />
    return <Clock size={15} style={{color:'#60a5fa'}} />
  }

  const navigate_section = (id) => { setActiveSection(id); setShowNotifications(false) }

  const renderSection = () => {
    switch(activeSection) {
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
    <div className="admin-panel" style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh'}}>
      <div className="spinner" />
    </div>
  )
  if (!isAdmin) return null

  return (
    <div className={`admin-panel new-panel ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* Sidebar */}
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

      {/* Main */}
      <div className="admin-main new-main">
        {/* Topbar */}
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
            <div className="notifications-dropdown-container">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h6>Notificaciones</h6>
                    <button onClick={fetchNotifications} className="mark-all-btn">↺</button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0
                      ? <div className="no-notifications"><Bell size={24} /><p>Sin notificaciones</p></div>
                      : notifications.slice(0, 8).map(n => (
                        <div key={n.notification_id} className={`notification-item ${n.status !== 'READ' ? 'unread' : ''}`} onClick={() => handleMarkRead(n.notification_id)}>
                          <div className="notification-icon">{getNotifIcon(n.type)}</div>
                          <div className="notification-content">
                            <div className="notification-title">{n.subject}</div>
                            <div className="notification-message">{(n.message || '').slice(0, 55)}{(n.message || '').length > 55 ? '…' : ''}</div>
                            <div className="notification-time">{formatDate(n.sent_at || n.createdAt)}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  <div className="notifications-footer">
                    <button onClick={() => navigate_section('notificaciones')}>Ver todas →</button>
                  </div>
                </div>
              )}
            </div>
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
