import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import Navbar from '../Navbar';

const MisNotificaciones = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const getCustomerId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.customer_id || user.user_id || null;
  };

  useEffect(() => {
    const customerId = getCustomerId();
    if (!customerId) {
      console.log('No hay usuario logueado');
      setLoading(false);
      return;
    }
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    const customerId = getCustomerId();
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await notificationService.getNotifications(customerId, { 
        limit: 10,
        page: page 
      });
      const data = response.data;
      setNotifications(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status !== 401) {
        console.log('Error al cargar notificaciones');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, status: 'READ' }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'APPOINTMENT_REMINDER':
        return <i className="fas fa-calendar-alt fa-2x text-info"></i>;
      case 'APPOINTMENT_CONFIRMED':
        return <i className="fas fa-check-circle fa-2x text-success"></i>;
      case 'APPOINTMENT_CANCELLED':
        return <i className="fas fa-times-circle fa-2x text-danger"></i>;
      case 'PROMOTION':
        return <i className="fas fa-tag fa-2x text-warning"></i>;
      default:
        return <i className="fas fa-bell fa-2x text-secondary"></i>;
    }
  };

  const customerId = getCustomerId();
  
  if (!customerId) {
    return (
      <div style={{ marginTop: '100px' }}>
        <div className="container py-5">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Debes iniciar sesión para ver tus notificaciones.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '100px' }}>
      <Navbar />
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">
                  <i className="fas fa-bell me-2"></i>
                  Mis Notificaciones
                  {totalItems > 0 && (
                    <span className="badge bg-light text-dark ms-2">{totalItems}</span>
                  )}
                </h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <h5>No hay notificaciones</h5>
                    <p className="text-muted">No tienes notificaciones en este momento</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {notifications.map(notification => (
                      <div
                        key={notification.notification_id}
                        className={`list-group-item list-group-item-action ${notification.status !== 'READ' ? 'bg-light' : ''}`}
                        onClick={() => {
                          if (notification.status !== 'READ') {
                            markAsRead(notification.notification_id);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="row align-items-center">
                          <div className="col-auto">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="col">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {notification.subject}
                                  {notification.status !== 'READ' && (
                                    <span className="badge bg-primary ms-2">Nueva</span>
                                  )}
                                </h6>
                                <p className="mb-0">{notification.message}</p>
                              </div>
                              <small className="text-muted">
                                {formatDate(notification.sent_at || notification.createdAt)}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>
                          Anterior
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisNotificaciones;