import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/report.service';
import { userService } from '../../services/user.service';
import { appointmentService } from '../../services/appointment.service';
import { notificationService } from '../../services/notification.service';
import { FileText, TrendingUp, Download, Calendar, Users } from 'lucide-react';

const Reportes = () => {
  const [reportType, setReportType] = useState('notifications');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await userService.getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Reporte de notificaciones
  const generateNotificationsReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getNotificationsReport(dateRange.startDate, dateRange.endDate);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar el reporte de notificaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reporte de citas
  const generateAppointmentsReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getAllAppointments();
      let appointments = response.data?.data || response.data || [];
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59);
      
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= startDate && aptDate <= endDate;
      });
      
      const total = filteredAppointments.length;
      const pending = filteredAppointments.filter(a => a.status === 'PENDING' || a.status === 'pendiente').length;
      const confirmed = filteredAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'confirmada').length;
      const completed = filteredAppointments.filter(a => a.status === 'COMPLETED' || a.status === 'completada').length;
      const cancelled = filteredAppointments.filter(a => a.status === 'CANCELLED' || a.status === 'cancelada').length;
      
      setReportData({
        detalles: filteredAppointments,
        resumen: {
          total,
          pendientes: pending,
          confirmadas: confirmed,
          completadas: completed,
          canceladas: cancelled
        },
        rango: {
          inicio: dateRange.startDate,
          fin: dateRange.endDate
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar el reporte de citas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reporte de recordatorios
  const generateRemindersReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (selectedCustomer) {
        response = await notificationService.getNotifications(selectedCustomer, { limit: 100 });
      } else {
        response = await notificationService.getAllNotifications({ limit: 100 });
      }
      
      let reminders = response.data?.data || response.data || [];
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59);
      
      const filteredReminders = reminders.filter(rem => {
        const remDate = new Date(rem.sent_at || rem.createdAt);
        return remDate >= startDate && remDate <= endDate;
      });
      
      setReportData({
        recordatorios: filteredReminders,
        total: filteredReminders.length,
        rango: {
          inicio: dateRange.startDate,
          fin: dateRange.endDate
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar el reporte de recordatorios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'notifications') {
      generateNotificationsReport();
    } else if (reportType === 'appointments') {
      generateAppointmentsReport();
    } else if (reportType === 'reminders') {
      generateRemindersReport();
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvData = [];
    let headers = [];

    if (reportType === 'notifications' && reportData.notificaciones) {
      headers = ['ID', 'Cliente', 'Tipo', 'Asunto', 'Mensaje', 'Estado', 'Fecha Envío'];
      csvData = reportData.notificaciones.map(n => [
        n.notification_id,
        `${n.Customer?.firstName || ''} ${n.Customer?.firstLastName || ''}`,
        n.type,
        n.subject,
        n.message?.replace(/,/g, ' '),
        n.status,
        new Date(n.sent_at).toLocaleString()
      ]);
    } else if (reportType === 'appointments' && reportData.detalles) {
      headers = ['ID', 'Cliente', 'Fecha', 'Hora', 'Estado', 'Teléfono', 'Examen'];
      csvData = reportData.detalles.map(a => [
        a.appointment_id,
        `${a.Customer?.firstName || ''} ${a.Customer?.firstLastName || ''}`,
        a.date,
        a.time,
        a.status,
        a.Customer?.phoneNumber || '',
        a.ExamType?.name || ''
      ]);
    } else if (reportType === 'reminders' && reportData.recordatorios) {
      headers = ['ID', 'Cliente', 'Tipo', 'Mensaje', 'Estado', 'Fecha Envío', 'Cita'];
      csvData = reportData.recordatorios.map(r => [
        r.notification_id,
        `${r.Customer?.firstName || ''} ${r.Customer?.firstLastName || ''}`,
        r.type,
        r.message?.replace(/,/g, ' '),
        r.status,
        new Date(r.sent_at || r.createdAt).toLocaleString(),
        r.Appointment ? `${r.Appointment.date} ${r.Appointment.time}` : ''
      ]);
    }

    if (csvData.length === 0) return;

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending' || s === 'pendiente') return 'warning';
    if (s === 'confirmed' || s === 'confirmada') return 'success';
    if (s === 'completed' || s === 'completada') return 'info';
    if (s === 'cancelled' || s === 'cancelada') return 'danger';
    return 'secondary';
  };

  const getStatusText = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending' || s === 'pendiente') return 'Pendiente';
    if (s === 'confirmed' || s === 'confirmada') return 'Confirmada';
    if (s === 'completed' || s === 'completada') return 'Completada';
    if (s === 'cancelled' || s === 'cancelada') return 'Cancelada';
    return status || 'Desconocido';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FileText size={24} />
          Reportes y Estadísticas
        </h2>
        <p style={{ color: '#6c757d', margin: 0 }}>Genera reportes detallados de notificaciones, citas y recordatorios</p>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Tipo de Reporte</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="notifications">Notificaciones de Citas</option>
                <option value="appointments">Estado de Citas</option>
                <option value="reminders">Historial de Recordatorios</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>

            {reportType === 'reminders' && (
              <div className="col-md-2 mb-3">
                <label className="form-label">Cliente</label>
                <select
                  className="form-select"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Todos</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.firstName} {customer.firstLastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-md-2 mb-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Generando...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} className="me-2" />
                    Generar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Resultados */}
      {reportData && !loading && (
        <div className="mt-4">
          {/* Estadísticas */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="bg-primary rounded p-3 text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="mb-0">
                      {reportType === 'notifications' ? reportData.estadisticas?.total || 0 :
                       reportType === 'appointments' ? reportData.resumen?.total || 0 :
                       reportData.total || 0}
                    </h3>
                    <small className="text-muted">Total Registros</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas específicas para citas */}
            {reportType === 'appointments' && reportData.resumen && (
              <>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="bg-warning rounded p-3 text-white">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 className="mb-0">{reportData.resumen.pendientes || 0}</h3>
                        <small className="text-muted">Pendientes</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="bg-success rounded p-3 text-white">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <h3 className="mb-0">{reportData.resumen.confirmadas || 0}</h3>
                        <small className="text-muted">Confirmadas</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="bg-info rounded p-3 text-white">
                        <Users size={20} />
                      </div>
                      <div>
                        <h3 className="mb-0">{reportData.resumen.completadas || 0}</h3>
                        <small className="text-muted">Completadas</small>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabla */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Detalles del Reporte</h5>
              <button className="btn btn-sm btn-success" onClick={exportToCSV}>
                <Download size={16} className="me-1" />
                Exportar CSV
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      {reportType === 'notifications' && (
                        <>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Tipo</th>
                          <th>Asunto</th>
                          <th>Mensaje</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </>
                      )}
                      {reportType === 'appointments' && (
                        <>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Teléfono</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Examen</th>
                          <th>Estado</th>
                        </>
                      )}
                      {reportType === 'reminders' && (
                        <>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Tipo</th>
                          <th>Mensaje</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                          <th>Cita</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reportType === 'notifications' && reportData.notificaciones?.map(notif => (
                      <tr key={notif.notification_id}>
                        <td>{notif.notification_id}</td>
                        <td>{notif.Customer?.firstName} {notif.Customer?.firstLastName}</td>
                        <td>{notif.type}</td>
                        <td>{notif.subject}</td>
                        <td>{notif.message?.substring(0, 50)}...</td>
                        <td>
                          <span className={`badge bg-${notif.status === 'SENT' ? 'success' : notif.status === 'PENDING' ? 'warning' : 'danger'}`}>
                            {notif.status}
                          </span>
                        </td>
                        <td>{new Date(notif.sent_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    
                    {reportType === 'appointments' && reportData.detalles?.map(apt => (
                      <tr key={apt.appointment_id}>
                        <td>{apt.appointment_id}</td>
                        <td>{apt.Customer?.firstName} {apt.Customer?.firstLastName}</td>
                        <td>{apt.Customer?.phoneNumber || '—'}</td>
                        <td>{apt.date}</td>
                        <td>{apt.time}</td>
                        <td>{apt.ExamType?.name || '—'}</td>
                        <td>
                          <span className={`badge bg-${getStatusBadge(apt.status)}`}>
                            {getStatusText(apt.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {reportType === 'reminders' && reportData.recordatorios?.map(rem => (
                      <tr key={rem.notification_id}>
                        <td>{rem.notification_id}</td>
                        <td>{rem.Customer?.firstName} {rem.Customer?.firstLastName}</td>
                        <td>{rem.type}</td>
                        <td>{rem.message?.substring(0, 50)}...</td>
                        <td>
                          <span className={`badge bg-${rem.status === 'SENT' ? 'success' : 'warning'}`}>
                            {rem.status}
                          </span>
                        </td>
                        <td>{new Date(rem.sent_at || rem.createdAt).toLocaleString()}</td>
                        <td>{rem.Appointment?.date} {rem.Appointment?.time}</td>
                      </tr>
                    ))}
                    
                    {/* Mensaje cuando no hay datos en appointments */}
                    {reportType === 'appointments' && (!reportData.detalles || reportData.detalles.length === 0) && (
                      <tr>
                        <td colSpan="7" className="text-center">No hay citas en el rango de fechas seleccionado</td>
                      </tr>
                    )}
                    
                    {/* Mensaje cuando no hay datos en notifications */}
                    {reportType === 'notifications' && (!reportData.notificaciones || reportData.notificaciones.length === 0) && (
                      <tr>
                        <td colSpan="7" className="text-center">No hay notificaciones en el rango de fechas seleccionado</td>
                      </tr>
                    )}
                    
                    {/* Mensaje cuando no hay datos en reminders */}
                    {reportType === 'reminders' && (!reportData.recordatorios || reportData.recordatorios.length === 0) && (
                      <tr>
                        <td colSpan="7" className="text-center">No hay recordatorios en el rango de fechas seleccionado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;