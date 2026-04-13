// NotificationBell.jsx - Asegurar que solo se muestra para clientes
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import axiosInstance from '../../services/axiosConfig';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Verificar si el usuario es cliente (no admin ni optometra)
  const checkUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = (user.role || user.role_name || '').toLowerCase();
      const isClientRole = role === 'cliente' || role === 'customer' || (!role && !user.role_id);
      
      // También verificar si no es admin
      const isAdmin = role === 'admin' || role === 'administrador' || user.role_id === 1;
      const isOptometra = role === 'optometra' || role === 'optometrist' || user.role_id === 2;
      
      setIsClient(isClientRole && !isAdmin && !isOptometra);
      return isClientRole && !isAdmin && !isOptometra;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  };

  const getCorrectCustomerId = async (userEmail) => {
    try {
      console.log('🔍 NotificationBell - Buscando customer_id para:', userEmail);
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
        console.log('✅ NotificationBell - customer_id encontrado:', customer.customer_id);
        return customer.customer_id;
      }
      return null;
    } catch (error) {
      console.error('❌ NotificationBell - Error obteniendo customer_id:', error);
      return null;
    }
  };

  const getStoredCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.customer_id || user.user_id || null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  };

  const initCustomerId = async () => {
    // Primero verificar si es cliente
    const isClientUser = checkUserRole();
    if (!isClientUser) {
      console.log('NotificationBell - Usuario no es cliente, ocultando notificaciones');
      setCustomerId(null);
      setIsClient(false);
      return;
    }

    const storedId = getStoredCustomerId();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || user.user_user;
    
    console.log('NotificationBell - stored customer_id:', storedId);
    console.log('NotificationBell - userEmail:', userEmail);
    
    if (!storedId || isNaN(parseInt(storedId)) || storedId === 13) {
      const correctId = await getCorrectCustomerId(userEmail);
      if (correctId) {
        console.log('✅ NotificationBell - Usando customer_id correcto:', correctId);
        setCustomerId(correctId);
        
        const updatedUser = { ...user, customer_id: correctId };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return;
      }
    }
    
    if (storedId && !isNaN(parseInt(storedId)) && storedId !== 13) {
      console.log('✅ NotificationBell - Usando customer_id de localStorage:', storedId);
      setCustomerId(storedId);
    } else {
      console.warn('⚠️ NotificationBell - No se pudo obtener customer_id válido');
      setCustomerId(null);
    }
  };

  const fetchNotifications = async () => {
    if (!customerId || !isClient) {
      console.log('NotificationBell - No cliente o sin customer_id, omitiendo fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('NotificationBell - Fetching notifications para cliente:', customerId);
      const response = await notificationService.getNotifications(customerId, { limit: 5 });
      const data = response.data;
      const notificationsList = data.data || [];
      setNotifications(notificationsList);
      const unread = notificationsList.filter(n => n.status === 'PENDING' || n.status === 'SENT').length;
      setUnreadCount(unread);
      console.log(`✅ NotificationBell - ${notificationsList.length} notificaciones, ${unread} no leídas`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 404) {
        console.log('No hay notificaciones para este cliente');
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initCustomerId();
  }, []);

  useEffect(() => {
    if (customerId && isClient) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [customerId, isClient]);

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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status !== 'READ');
    for (const notification of unreadNotifications) {
      await markAsRead(notification.notification_id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    return date.toLocaleDateString('es-ES');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'APPOINTMENT_REMINDER':
        return <i className="fas fa-calendar-alt text-info"></i>;
      case 'APPOINTMENT_CONFIRMED':
        return <i className="fas fa-check-circle text-success"></i>;
      case 'APPOINTMENT_CANCELLED':
        return <i className="fas fa-times-circle text-danger"></i>;
      case 'PROMOTION':
        return <i className="fas fa-tag text-warning"></i>;
      default:
        return <i className="fas fa-bell text-secondary"></i>;
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.status !== 'READ') {
      markAsRead(notification.notification_id);
    }
    setShowDropdown(false);
    
    if (notification.type?.includes('APPOINTMENT')) {
      navigate('/citas/ver');
    } else {
      navigate('/mis-notificaciones');
    }
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/mis-notificaciones');
  };

  // No mostrar el componente si no es cliente o no tiene customer_id
  if (!isClient || !customerId) {
    console.log('NotificationBell - No visible para admin/optometra o sin customer_id');
    return null;
  }

  return (
    <div className="position-relative me-2" ref={dropdownRef}>
      <button
        className="btn btn-link position-relative text-dark"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ textDecoration: 'none', padding: '0.375rem 0.75rem' }}
      >
        <i className="fas fa-bell fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="position-absolute end-0 mt-2 shadow-lg rounded" style={{ 
          width: '380px', 
          maxHeight: '500px', 
          zIndex: 1050,
          backgroundColor: 'white', 
          borderRadius: '12px', 
          overflow: 'hidden'
        }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <h6 className="mb-0 fw-bold">
              <i className="fas fa-bell me-2"></i>
              Notificaciones
            </h6>
            {unreadCount > 0 && (
              <button 
                className="btn btn-sm btn-link text-decoration-none"
                onClick={markAllAsRead}
              >
                Marcar todas
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-bell-slash fs-1 mb-3 d-block"></i>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.notification_id}
                  className={`p-3 border-bottom ${notification.status !== 'READ' ? 'bg-light' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <strong className="me-2 small">{notification.subject || 'Notificación'}</strong>
                        <small className="text-muted">{formatDate(notification.sent_at || notification.createdAt)}</small>
                      </div>
                      <p className="mb-1 small text-secondary">{notification.message}</p>
                      {notification.status !== 'READ' && (
                        <span className="badge bg-primary rounded-pill small">Nueva</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-top text-center bg-light">
            <button
              className="btn btn-sm btn-link text-decoration-none"
              onClick={handleViewAll}
            >
              Ver todas las notificaciones
              <i className="fas fa-chevron-right ms-1 small"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;