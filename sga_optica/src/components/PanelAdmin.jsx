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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const PanelAdmin = () => {
  const navigate = useNavigate();
  // Datos de ejemplo
  const salesData = [
    {
      cliente: "María González",
      producto: "Ray-Ban Aviator",
      monto: "$150.00",
      estado: "Completada",
    },
    {
      cliente: "Carlos Rodríguez",
      producto: "Montura Titanio",
      monto: "$159.990",
      estado: "Pendiente",
    },
    {
      cliente: "Ana López",
      producto: "Lentes Progressivos",
      monto: "$220.00",
      estado: "En Proceso",
    },
  ];

  const appointmentsData = [
    {
      cliente: "María González",
      hora: "09:00",
      servicio: "Examen de vista completo",
      estado: "Confirmada",
      telefono: "(+57) 123-4567",
    },
    {
      cliente: "Carlos Rodríguez",
      hora: "11:30",
      servicio: "Entrega de lentes",
      estado: "Pendiente",
      telefono: "(+57) 987-6543",
    },
    {
      cliente: "Ana López",
      hora: "14:00",
      servicio: "Ajuste de monturas",
      estado: "Reagendada",
      telefono: "(+57) 456-7890",
    },
  ];

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
              <li className="nav-item active">
                <Eye size={18} />
                <span>Inventario</span>
              </li>
              <li className="nav-item">
                <DollarSign size={18} />
                <span>Ventas</span>
              </li>
              <li className="nav-item">
                <Calendar size={18} />
                <span>Citas</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3>Gestión</h3>
            <ul>
              <li className="nav-item">
                <Users size={18} />
                <span>Clientes</span>
              </li>
              <li className="nav-item">
                <Package size={18} />
                <span>Productos</span>
              </li>
              <li className="nav-item">
                <Settings size={18} />
                <span>Configuración</span>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => navigate("/")}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <h1>Dashboard Principal</h1>
            <p>Resumen general del sistema</p>
          </div>

          <div className="topbar-right">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Buscar..." />
            </div>
            <button className="notification-btn">
              <Bell size={18} />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-profile">
              <div className="avatar">A</div>
              <span>Administrador</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon sales">
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <h3>$12,450</h3>
              <p>Ventas del Mes</p>
              <span className="stat-trend positive">
                +15.3% vs mes anterior
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon appointments">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>28</h3>
              <p>Citas Esta Semana</p>
              <span className="stat-trend positive">+8 vs semana anterior</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inventory">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <h3>156</h3>
              <p>Productos en Stock</p>
              <span className="stat-trend negative">
                12 productos bajo mínimo
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon clients">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>342</h3>
              <p>Clientes Registrados</p>
              <span className="stat-trend positive">+23 este mes</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Ventas Recientes */}
          <div className="content-card">
            <div className="card-header">
              <h2>Ventas Recientes</h2>
              <button className="view-all-btn">Ver Todas</button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale, index) => (
                    <tr key={index}>
                      <td>{sale.cliente}</td>
                      <td>{sale.producto}</td>
                      <td>{sale.monto}</td>
                      <td>
                        <span
                          className={`status-badge status-${sale.estado
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {sale.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citas de Hoy */}
          <div className="content-card">
            <div className="card-header">
              <h2>Citas de Hoy</h2>
              <button className="new-appointment-btn">Nueva Cita</button>
            </div>

            <div className="appointments-list">
              {appointmentsData.map((appointment, index) => (
                <div key={index} className="appointment-item">
                  <div className="appointment-header">
                    <div className="appointment-client">
                      <h4>{appointment.cliente}</h4>
                      <span className="appointment-time">
                        {appointment.hora}
                      </span>
                    </div>
                    <span
                      className={`appointment-status status-${appointment.estado
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {appointment.estado}
                    </span>
                  </div>
                  <p className="appointment-service">{appointment.servicio}</p>
                  <p className="appointment-phone">
                    Tel: {appointment.telefono}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;
