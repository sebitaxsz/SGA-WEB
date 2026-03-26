import React from "react";
import { useCart } from "./CartContext"; 
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";



// Formateador de moneda simple
const formatCurrency = (n) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartPage() {
  const { cart, clearCart, removeFromCart } = useCart();
    const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <div className="container py-5">
      <Navbar />
      {/* Encabezado */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <h2 className="mb-0">Carrito de Compras</h2>
        </div>
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          <Link to='/'
            className="btn btn-outline-secondary me-2"

          >
            ← Volver al inicio
          </Link>

          <button
            className="btn btn-danger"
            onClick={() => {
              if (cart.length === 0) return;
              // opcional: confirmar
              if (window.confirm("¿Deseas vaciar todo el carrito?")) clearCart();
            }}
          >
            Vaciar carrito
          </button>
        </div>
      </div>

      <div className="row">
        {/* Left: productos */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              {cart.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="mb-3">Tu carrito está vacío</h5>
                  <p className="text-muted">Agrega productos desde la sección de productos.</p>
                  <div className="mt-3">
                    <Link to='/productos/gafas-sol' className="btn btn-primary" onClick={() => navigate("/")}>
                      Ir a Productos
                    </Link>
                  </div>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={item.id ?? idx}
                    className="d-flex justify-content-between align-items-center py-3 border-bottom"
                  >
                    <div>
                      <h6 className="mb-1">{item.name || item.nombre}</h6>
                      {item.descripcion && <small className="text-muted">{item.descripcion}</small>}
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">${formatCurrency(Number(item.price) || 0)}</div>
                        {/* Botón eliminar */}
                        <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.id)}
                        >
                        <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: resumen */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Resumen del Pedido</h5>

              <div className="d-flex justify-content-between mb-2">
                <div>Subtotal</div>
                <div>${formatCurrency(subtotal)}</div>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <div>IVA (16%)</div>
                <div>${formatCurrency(iva)}</div>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                <div>Total</div>
                <div>${formatCurrency(total)}</div>
              </div>

              <button
                className="btn btn-primary btn-lg w-100 mb-2"
                onClick={() => {
                  // placeholder: aquí podrías abrir el checkout
                  if (cart.length === 0) {
                    alert("Tu carrito está vacío.");
                    return;
                  }
                  alert("Proceder al pago (placeholder)");
                }}
              >
                Proceder al Pago
              </button>

              <Link to='/productos/gafas-sol'
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate("/")}
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

