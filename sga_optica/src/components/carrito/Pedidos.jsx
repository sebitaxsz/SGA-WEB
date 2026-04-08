import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem("usuario");
        if (user) {
            setUsuarioActual(JSON.parse(user));
        }
    }, []);

    useEffect(() => {
        cargarPedidos();
    }, [usuarioActual]);

    const cargarPedidos = () => {
        if (!usuarioActual) return;

        const pedidosGuardados = localStorage.getItem(`pedidos_${usuarioActual.email}`);
        
        if (pedidosGuardados) {
            setPedidos(JSON.parse(pedidosGuardados));
        } else {
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
            localStorage.setItem(`pedidos_${usuarioActual.email}`, JSON.stringify(pedidosEjemplo));
        }
    };

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

    const textoEstado = (estado) => {
        switch (estado) {
            case "Entregado":
                return "📦 Entregado";
            case "En camino":
                return "🚚 En camino";
            case "Pendiente":
                return "⏳ Pendiente";
            default:
                return estado;
        }
    };

    const verDetalles = (pedido) => {
        const productosTexto = pedido.productos.map(p => 
            `- ${p.nombre}: ${p.cantidad} x $${(p.precio || 0).toLocaleString()}`
        ).join('\n');
        
        alert(`📦 Pedido #${pedido.id}
📅 Fecha: ${pedido.fecha}
💰 Total: $${pedido.total.toLocaleString()}
📊 Estado: ${pedido.estado}

🛒 Productos:
${productosTexto}`);
    };

    return (
        <div className="container mt-4">
            <Navbar />
            <h2 className="mb-4 text-center">Mis Pedidos</h2>

            {!usuarioActual ? (
                <div className="alert alert-warning text-center">
                    <i className="bi bi-exclamation-triangle"></i> Debes iniciar sesión para ver tus pedidos.
                    <br />
                    <Link to="/login" className="btn btn-primary mt-2">Iniciar Sesión</Link>
                </div>
            ) : pedidos.length === 0 ? (
                <div className="text-center">
                    <p className="text-muted">No tienes pedidos aún.</p>
                    <Link to="/productos" className="btn btn-primary">Ver productos</Link>
                </div>
            ) : (
                pedidos.map((pedido) => (
                    <div key={pedido.id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <h5 className="card-title">Pedido #{pedido.id}</h5>
                                <span className={`badge bg-${colorEstado(pedido.estado)} fs-6`}>
                                    {textoEstado(pedido.estado)}
                                </span>
                            </div>

                            <p className="text-muted mb-1">
                                Fecha: <strong>{pedido.fecha}</strong>
                            </p>
                            <p className="text-muted">
                                Total: <strong>${pedido.total.toLocaleString()}</strong>
                            </p>

                            <h6 className="mt-3">Productos:</h6>
                            <ul className="list-group mb-3">
                                {pedido.productos.map((prod, index) => (
                                    <li key={index} className="list-group-item">
                                        {prod.nombre} — <strong>x{prod.cantidad}</strong>
                                        {prod.precio && (
                                            <span className="float-end">
                                                ${(prod.precio * prod.cantidad).toLocaleString()}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>

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