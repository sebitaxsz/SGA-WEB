import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Package,
  Calendar,
  DollarSign,
  Eye,
  Settings,
  LogOut,
  Bell,
  Search,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart
} from "lucide-react"
import Reportes from './reportes/Reportes'
import "./Admin.css"

const PanelAdmin = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('inventario')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Datos de ejemplo
  const [salesData] = useState([
    { cliente: "María González", producto: "Ray-Ban Aviator", monto: "$150.00", estado: "Completada" },
    { cliente: "Carlos Rodríguez", producto: "Montura Titanio", monto: "$159.990", estado: "Pendiente" },
    { cliente: "Ana López", producto: "Lentes Progressivos", monto: "$220.00", estado: "En Proceso" },
  ])

  const [appointmentsData] = useState([
    { cliente: "María González", hora: "09:00", servicio: "Examen de vista completo", estado: "Confirmada", telefono: "(+57) 123-4567" },
    { cliente: "Carlos Rodríguez", hora: "11:30", servicio: "Entrega de lentes", estado: "Pendiente", telefono: "(+57) 987-6543" },
    { cliente: "Ana López", hora: "14:00", servicio: "Ajuste de monturas", estado: "Reagendada", telefono: "(+57) 456-7890" },
  ])

  // Verificar autenticación y rol
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    console.log('Verificando acceso a PanelAdmin...')
    
    if (!token || !user) {
      console.log('No hay token o usuario, redirigiendo a login')
      navigate('/login')
      return
    }
    
    try {
      const userData = JSON.parse(user)
      console.log('Datos del usuario:', userData)
      
      // Verificar si es admin (role = 'admin' o role_id = 1)
      const isUserAdmin = userData.role === 'admin' || 
                          userData.role === 'administrador' || 
                          userData.role_id === 1
      
      if (!isUserAdmin) {
        console.log('Acceso denegado: No es administrador')
        navigate('/')
        return
      }
      
      setIsAdmin(true)
      setUserName(userData.nombre || userData.firstName || 'Administrador')
      
    } catch (error) {
      console.error('Error verificando admin:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('https://7l77sjp2-3002.use2.devtunnels.ms/api/v1/notification?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        const unread = data.data?.filter(n => n.status === 'PENDING' || n.status === 'SENT').length || 0
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications()
    }
  }, [isAdmin])

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch(`https://7l77sjp2-3002.use2.devtunnels.ms/api/v1/notification/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n.notification_id === notificationId ? { ...n, status: 'READ' } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status !== 'READ')
    for (const notification of unreadNotifications) {
      await markAsRead(notification.notification_id)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    navigate('/login')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMins = Math.floor((now - date) / 60000)
    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`
    return date.toLocaleDateString('es-ES')
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'APPOINTMENT_REMINDER': return <Clock size={16} className="text-info" />
      case 'APPOINTMENT_CONFIRMED': return <CheckCircle size={16} className="text-success" />
      case 'APPOINTMENT_CANCELLED': return <XCircle size={16} className="text-danger" />
      default: return <Bell size={16} className="text-secondary" />
    }
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'reportes':
        return <Reportes />
      case 'inventario':
        return (
          <div className="content-grid">
            <div className="content-card">
              <div className="card-header">
                <h2>Ventas Recientes</h2>
                <button className="view-all-btn">Ver Todas</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Cliente</th><th>Producto</th><th>Monto</th><th>Estado</th></tr></thead>
                  <tbody>
                    {salesData.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale.cliente}</td><td>{sale.producto}</td><td>{sale.monto}</td>
                        <td><span className={`status-badge status-${sale.estado.toLowerCase().replace(/\s+/g, "-")}`}>{sale.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="content-card">
              <div className="card-header">
                <h2>Citas de Hoy</h2>
                <button className="new-appointment-btn">Nueva Cita</button>
              </div>
              <div className="appointments-list">
                {appointmentsData.map((appointment, index) => (
                  <div key={index} className="appointment-item">
                    <div className="appointment-header">
                      <div className="appointment-client"><h4>{appointment.cliente}</h4><span className="appointment-time">{appointment.hora}</span></div>
                      <span className={`appointment-status status-${appointment.estado.toLowerCase().replace(/\s+/g, "-")}`}>{appointment.estado}</span>
                    </div>
                    <p className="appointment-service">{appointment.servicio}</p>
                    <p className="appointment-phone">Tel: {appointment.telefono}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return <div className="content-card"><div className="card-header"><h2>Sección en construcción</h2></div><div className="p-4 text-center"><p>Próximamente disponible.</p></div></div>
    }
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>S.G.A Óptica</h2>
          <p>Sistema Administrativo</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Dashboard</h3>
            <ul>
              <li className={`nav-item ${activeSection === 'inventario' ? 'active' : ''}`} onClick={() => setActiveSection('inventario')}>
                <Eye size={18} /><span>Inventario</span>
              </li>
              <li className={`nav-item ${activeSection === 'ventas' ? 'active' : ''}`} onClick={() => setActiveSection('ventas')}>
                <DollarSign size={18} /><span>Ventas</span>
              </li>
              <li className={`nav-item ${activeSection === 'citas' ? 'active' : ''}`} onClick={() => setActiveSection('citas')}>
                <Calendar size={18} /><span>Citas</span>
              </li>
            </ul>
          </div>
          <div className="nav-section">
            <h3>Gestión</h3>
            <ul>
              <li className={`nav-item ${activeSection === 'clientes' ? 'active' : ''}`} onClick={() => setActiveSection('clientes')}>
                <Users size={18} /><span>Clientes</span>
              </li>
              <li className={`nav-item ${activeSection === 'productos' ? 'active' : ''}`} onClick={() => setActiveSection('productos')}>
                <Package size={18} /><span>Productos</span>
              </li>
              <li className={`nav-item ${activeSection === 'reportes' ? 'active' : ''}`} onClick={() => setActiveSection('reportes')}>
                <FileText size={18} /><span>Reportes</span>
              </li>
              <li className={`nav-item ${activeSection === 'configuracion' ? 'active' : ''}`} onClick={() => setActiveSection('configuracion')}>
                <Settings size={18} /><span>Configuración</span>
              </li>
            </ul>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /><span>Cerrar Sesión</span></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-left">
            <h1>{activeSection === 'reportes' ? 'Reportes' : activeSection === 'inventario' ? 'Inventario' : 'Dashboard'}</h1>
            <p>Bienvenido, {userName}</p>
          </div>
          <div className="topbar-right">
            <div className="search-bar"><Search size={18} /><input type="text" placeholder="Buscar..." /></div>
            <div className="notifications-dropdown-container">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header"><h6>Notificaciones</h6>{unreadCount > 0 && <button onClick={markAllAsRead} className="mark-all-btn">Marcar todas</button>}</div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? <div className="no-notifications"><Bell size={24} /><p>No hay notificaciones</p></div> :
                      notifications.slice(0, 5).map(notification => (
                        <div key={notification.notification_id} className={`notification-item ${notification.status !== 'READ' ? 'unread' : ''}`} onClick={() => markAsRead(notification.notification_id)}>
                          <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.subject}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">{formatDate(notification.sent_at || notification.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile"><div className="avatar">{userName.charAt(0).toUpperCase()}</div><span>{userName}</span><span className="role-badge admin">Admin</span></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon sales"><DollarSign size={24} /></div><div className="stat-info"><h3>$12,450</h3><p>Ventas del Mes</p><span className="stat-trend positive">+15.3%</span></div></div>
          <div className="stat-card"><div className="stat-icon appointments"><Calendar size={24} /></div><div className="stat-info"><h3>28</h3><p>Citas Esta Semana</p><span className="stat-trend positive">+8</span></div></div>
          <div className="stat-card"><div className="stat-icon inventory"><Package size={24} /></div><div className="stat-info"><h3>156</h3><p>Productos en Stock</p><span className="stat-trend negative">12 bajo mínimo</span></div></div>
          <div className="stat-card"><div className="stat-icon clients"><Users size={24} /></div><div className="stat-info"><h3>342</h3><p>Clientes Registrados</p><span className="stat-trend positive">+23</span></div></div>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default PanelAdmin