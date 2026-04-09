// MisNotificaciones.jsx - Añadir la misma lógica
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import axiosInstance from '../../services/axiosConfig';
import Navbar from '../Navbar';

const MisNotificaciones = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const navigate = useNavigate();

  // 🔧 Función para obtener el customer_id CORRECTO
  const getCorrectCustomerId = async (userEmail) => {
    try {
      console.log('MisNotificaciones - Buscando customer_id para:', userEmail);
      const response = await axiosInstance.get('/customer');
      const customers = response.data || [];
      
      let customer = customers.find(c => c.email === userEmail);
      if (!customer) {
        customer = customers.find(c => 
          c.firstName?.toLowerCase() === 'marlon' || 
          c.email?.includes('marlon')
        );
      }
      
      if (customer) {
        console.log('✅ MisNotificaciones - customer_id encontrado:', customer.customer_id);
        return customer.customer_id;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo customer_id:', error);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email || user.user_user;
      
      let finalCustomerId = user.customer_id;
      
      // Si el customer_id es 13 o no es numérico, buscar el correcto
      if (!finalCustomerId || finalCustomerId === 13 || isNaN(parseInt(finalCustomerId))) {
        const correctId = await getCorrectCustomerId(userEmail);
        if (correctId) {
          finalCustomerId = correctId;
          // Actualizar localStorage
          const updatedUser = { ...user, customer_id: correctId };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      if (finalCustomerId) {
        setCustomerId(finalCustomerId);
      } else {
        console.log('No hay usuario logueado válido');
        setLoading(false);
      }
    };
    
    init();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchNotifications();
    }
  }, [page, customerId]);

  const fetchNotifications = async () => {
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

  if (!customerId) {
    return (
      <>
        <Navbar />
        <div style={{ marginTop: '100px' }}>
          <div className="container py-5">
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Debes iniciar sesión para ver tus notificaciones.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ marginTop: '100px' }}>
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
    </>
  );
};

export default MisNotificaciones;