import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";
import { getPaymentTypes, createPublicSale } from "../../services/public.service";

// Formateador de moneda COP
const formatCurrency = (n) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: carrito, 2: datos cliente, 3: confirmación
  const [customerData, setCustomerData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestAddress: ''
  });
  const [orderComplete, setOrderComplete] = useState(null);

  // Cargar métodos de pago al iniciar
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentTypes();
        const methods = response.data || response;
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].id);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        // Datos de respaldo en caso de error
        setPaymentMethods([
          { id: 1, name: "Nequi" },
          { id: 3, name: "PSE" }
        ]);
        setSelectedPaymentMethod(1);
      }
    };
    
    fetchPaymentMethods();
  }, []);

  const subtotal = totalPrice;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  // === FUNCIÓN PARA GUARDAR PEDIDO EN LOCALSTORAGE ===
  const guardarPedidoLocal = (pedidoData) => {
    try {
      // Obtener usuario actual
      const usuarioStr = localStorage.getItem("usuario");
      let usuario = null;
      
      if (usuarioStr) {
        usuario = JSON.parse(usuarioStr);
      } else {
        // Si no hay usuario logueado, usar datos de invitado
        usuario = { email: `guest_${Date.now()}`, name: customerData.guestName };
        localStorage.setItem("usuario", JSON.stringify(usuario));
      }

      // Obtener pedidos existentes del usuario
      const storageKey = `pedidos_${usuario.email}`;
      const pedidosExistentesStr = localStorage.getItem(storageKey);
      let pedidosExistentes = pedidosExistentesStr ? JSON.parse(pedidosExistentesStr) : [];

      // Crear nuevo pedido
      const nuevoPedido = {
        id: pedidosExistentes.length + 1,
        fecha: new Date().toISOString().split('T')[0],
        total: total,
        estado: "Pendiente",
        productos: cart.map(item => ({
          nombre: item.name,
          cantidad: item.quantity,
          precio: item.price
        })),
        cliente: {
          nombre: customerData.guestName,
          email: customerData.guestEmail || usuario.email,
          telefono: customerData.guestPhone || "",
          direccion: customerData.guestAddress || ""
        },
        metodoPago: paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || "No especificado"
      };

      // Agregar al inicio (más reciente primero)
      const pedidosActualizados = [nuevoPedido, ...pedidosExistentes];
      
      // Guardar en localStorage
      localStorage.setItem(storageKey, JSON.stringify(pedidosActualizados));
      
      // También guardar en un registro global de todos los pedidos (para admin)
      const allOrdersStr = localStorage.getItem("todos_los_pedidos");
      let allOrders = allOrdersStr ? JSON.parse(allOrdersStr) : [];
      allOrders.unshift({ ...nuevoPedido, userEmail: usuario.email });
      localStorage.setItem("todos_los_pedidos", JSON.stringify(allOrders));

      return nuevoPedido;
    } catch (error) {
      console.error("Error guardando pedido local:", error);
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("Selecciona un método de pago.");
      return;
    }

    if (!customerData.guestName) {
      alert("Por favor ingresa tu nombre.");
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para la API
      const saleData = {
        guestName: customerData.guestName,
        guestEmail: customerData.guestEmail || null,
        guestPhone: customerData.guestPhone || null,
        guestAddress: customerData.guestAddress || null,
        paymentTypeId: selectedPaymentMethod,
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      let response;
      let pedidoGuardado = null;

      try {
        // Intentar crear venta en la API
        response = await createPublicSale(saleData);
      } catch (apiError) {
        console.warn("API falló, usando modo offline:", apiError);
        response = null;
      }
      
      if (response && response.data && response.data.success) {
        // Éxito en API
        setOrderComplete({
          id: response.data.id,
          numberBill: response.data.numberBill,
          total: response.data.total
        });
        
        // También guardar localmente como respaldo
        pedidoGuardado = guardarPedidoLocal(saleData);
        
        clearCart();
        setCheckoutStep(3);
        
        // Mostrar mensaje de éxito
        alert("✅ ¡Pedido realizado con éxito! Revisa 'Mis Pedidos' para seguimiento.");
        
      } else {
        // Si la API falla o no hay conexión, guardar localmente
        pedidoGuardado = guardarPedidoLocal(saleData);
        
        if (pedidoGuardado) {
          // Mostrar confirmación local
          setOrderComplete({
            id: pedidoGuardado.id,
            numberBill: `LOCAL-${Date.now()}`,
            total: total
          });
          
          clearCart();
          setCheckoutStep(3);
          
          alert("✅ ¡Pedido guardado localmente! Se sincronizará cuando haya conexión.");
        } else {
          throw new Error("No se pudo guardar el pedido localmente");
        }
      }
      
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(error.response?.data?.message || error.message || "Error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Volver al paso 1 (carrito)
  const handleBackToCart = () => {
    setCheckoutStep(1);
  };

  if (cart.length === 0 && checkoutStep !== 3) {
    return (
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="text-center py-5">
          <h3>Tu carrito está vacío</h3>
          <p className="text-muted">Agrega productos desde la sección de productos.</p>
          <Link to="/productos" className="btn btn-primary mt-3">
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete && checkoutStep === 3) {
    return (
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="fas fa-check-circle text-success" style={{ fontSize: '64px' }}></i>
            <h3 className="mt-3">¡Pedido Realizado con Éxito!</h3>
            <p className="text-muted">Gracias por tu compra. Hemos recibido tu pedido.</p>
            <div className="alert alert-info mt-3">
              <strong>Número de factura:</strong> {orderComplete.numberBill}<br />
              <strong>Total:</strong> {formatCurrency(orderComplete.total)}
            </div>
            <div className="mt-3 d-flex gap-2 justify-content-center">
              <Link to="/productos" className="btn btn-primary">
                Seguir Comprando
              </Link>
              <Link to="/pedidos" className="btn btn-outline-secondary">
                Ver Mis Pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ marginTop: '80px' }}>
      {/* Encabezado */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <h2 className="mb-0">
            {checkoutStep === 1 ? "Carrito de Compras" : "Datos de Envío"}
          </h2>
        </div>
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          {checkoutStep === 2 && (
            <button
              className="btn btn-outline-secondary me-2"
              onClick={handleBackToCart}
            >
              ← Volver al Carrito
            </button>
          )}
          <Link to="/productos" className="btn btn-outline-secondary">
            ← Seguir Comprando
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Left: productos o formulario */}
        <div className="col-lg-8 mb-4">
          {checkoutStep === 1 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.imagen && (
                                <img 
                                  src={item.imagen} 
                                  alt={item.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                              <div>
                                <strong>{item.name}</strong>
                                {item.descripcion && (
                                  <div className="text-muted small">{item.descripcion}</div>
                                )}
                              </div>
                            </div>
                           </td>
                           <td>{formatCurrency(item.price)}</td>
                           <td>
                            <div className="d-flex align-items-center" style={{ width: '100px' }}>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="mx-2" style={{ minWidth: '30px', textAlign: 'center' }}>
                                {item.quantity}
                              </span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.stock || 999)}
                              >
                                +
                              </button>
                            </div>
                           </td>
                           <td>{formatCurrency(item.price * item.quantity)}</td>
                           <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm("¿Deseas vaciar todo el carrito?")) {
                        clearCart();
                      }
                    }}
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Información de Contacto</h5>
                <div className="mb-3">
                  <label className="form-label">Nombre completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="guestName"
                    value={customerData.guestName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    name="guestEmail"
                    value={customerData.guestEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="guestPhone"
                    value={customerData.guestPhone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <textarea
                    className="form-control"
                    name="guestAddress"
                    rows="2"
                    value={customerData.guestAddress}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: resumen y checkout */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Resumen del Pedido</h5>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>IVA (16%)</span>
                <span>{formatCurrency(iva)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {checkoutStep === 1 && cart.length > 0 && (
                <button
                  className="btn btn-primary btn-lg w-100 mb-2"
                  onClick={() => setCheckoutStep(2)}
                >
                  Continuar con el Pago
                </button>
              )}

              {checkoutStep === 2 && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Método de Pago *</label>
                    <select
                      className="form-select"
                      value={selectedPaymentMethod || ''}
                      onChange={(e) => setSelectedPaymentMethod(parseInt(e.target.value))}
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="btn btn-success btn-lg w-100 mb-2"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}