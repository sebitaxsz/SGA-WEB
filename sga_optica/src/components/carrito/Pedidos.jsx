import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);

    // Obtener usuario logueado (desde localStorage o contexto)
    useEffect(() => {
        const user = localStorage.getItem("usuario");
        if (user) {
            setUsuarioActual(JSON.parse(user));
        }
    }, []);

    // Cargar pedidos desde localStorage al montar el componente
    useEffect(() => {
        cargarPedidos();
    }, [usuarioActual]);

    const cargarPedidos = () => {
        if (!usuarioActual) return;

        const pedidosGuardados = localStorage.getItem(`pedidos_${usuarioActual.email}`);
        
        if (pedidosGuardados) {
            setPedidos(JSON.parse(pedidosGuardados));
        } else {
            // Datos de ejemplo (solo para primer uso)
            const pedidosEjemplo = [
                {
                    id: 1,
                    fecha: "2025-01-10",
                    total: 130000,
                    estado: "En camino",
                    productos: [
                        { nombre: "Gafas de sol aviador", cantidad: 1, precio: 130000 },
                        { nombre: "Montura ligera", cantidad: 2, precio: 0 },
                    ],
                },
                {
                    id: 2,
                    fecha: "2025-01-05",
                    total: 150000,
                    estado: "Entregado",
                    productos: [
                        { nombre: "Gafas Ciclismo Pro", cantidad: 1, precio: 150000 },
                    ],
                },
                {
                    id: 3,
                    fecha: "2024-12-30",
                    total: 145000,
                    estado: "Pendiente",
                    productos: [
                        { nombre: "Lentes antireflejo", cantidad: 1, precio: 145000 },
                        { nombre: "Montura", cantidad: 1, precio: 0 },
                    ],
                },
            ];
            setPedidos(pedidosEjemplo);
            // Guardar ejemplos en localStorage
            localStorage.setItem(`pedidos_${usuarioActual.email}`, JSON.stringify(pedidosEjemplo));
        }
    };

    // Función para agregar un nuevo pedido (llamar desde el carrito al finalizar compra)
    const agregarPedido = (nuevoPedido) => {
        if (!usuarioActual) return;

        const pedidosActuales = [...pedidos];
        const nuevoId = pedidosActuales.length > 0 ? Math.max(...pedidosActuales.map(p => p.id)) + 1 : 1;
        
        const pedidoConId = {
            ...nuevoPedido,
            id: nuevoId,
            fecha: new Date().toISOString().split('T')[0],
            estado: "Pendiente",
        };
        
        const pedidosActualizados = [pedidoConId, ...pedidosActuales];
        setPedidos(pedidosActualizados);
        localStorage.setItem(`pedidos_${usuarioActual.email}`, JSON.stringify(pedidosActualizados));
        
        return pedidoConId;
    };

    // Exponer función para que CartPage la use
    if (typeof window !== 'undefined') {
        window.agregarPedidoGlobal = agregarPedido;
    }

    // === Función para colores del estado ===
    const colorEstado = (estado) => {
        switch (estado) {
            case "Entregado":
                return "success";
            case "En camino":
                return "primary";
            case "Pendiente":
                return "warning";
            default:
                return "secondary";
        }
    };

    // Ver detalles del pedido (modal o alert por ahora)
    const verDetalles = (pedido) => {
        const productosTexto = pedido.productos.map(p => `- ${p.nombre}: ${p.cantidad} x $${p.precio?.toLocaleString() || 0}`).join('\n');
        alert(`📦 Pedido #${pedido.id}\n📅 Fecha: ${pedido.fecha}\n💰 Total: $${pedido.total.toLocaleString()}\n📊 Estado: ${pedido.estado}\n\n🛒 Productos:\n${productosTexto}`);
    };

    return (
        <div className="container mt-4">
            <Navbar />
            <h2 className="mb-4 text-center">Mis Pedidos</h2>

            {!usuarioActual ? (
                <div className="alert alert-warning text-center">
                    <i className="bi bi-exclamation-triangle"></i> Debes iniciar sesión para ver tus pedidos.
                    <br />
                    <a href="/login" className="btn btn-primary mt-2">Iniciar Sesión</a>
                </div>
            ) : pedidos.length === 0 ? (
                <div className="text-center">
                    <p className="text-muted">No tienes pedidos aún.</p>
                    <a href="/productos" className="btn btn-primary">Ver productos</a>
                </div>
            ) : (
                pedidos.map((pedido) => (
                    <div key={pedido.id} className="card mb-3 shadow-sm">
                        <div className="card-body">

                            {/* Encabezado */}
                            <div className="d-flex justify-content-between">
                                <h5 className="card-title">Pedido #{pedido.id}</h5>
                                <span className={`badge bg-${colorEstado(pedido.estado)} fs-6`}>
                                    {pedido.estado}
                                </span>
                            </div>

                            <p className="text-muted mb-1">
                                Fecha: <strong>{pedido.fecha}</strong>
                            </p>
                            <p className="text-muted">
                                Total: <strong>${pedido.total.toLocaleString()}</strong>
                            </p>

                            {/* Productos */}
                            <h6 className="mt-3">Productos:</h6>
                            <ul className="list-group mb-3">
                                {pedido.productos.map((prod, index) => (
                                    <li key={index} className="list-group-item">
                                        {prod.nombre} — <strong>x{prod.cantidad}</strong>
                                        {prod.precio && <span className="float-end">${(prod.precio * prod.cantidad).toLocaleString()}</span>}
                                    </li>
                                ))}
                            </ul>

                            {/* Botón */}
                            <div className="text-end">
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => verDetalles(pedido)}
                                >
                                    Ver detalles
                                </button>
                            </div>

                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Pedidos;