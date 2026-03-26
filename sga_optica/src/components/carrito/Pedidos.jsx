import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {

        const pedidosEjemplo = [
            {
                id: 1,
                fecha: "2025-01-10",
                total: 130000,
                estado: "En camino",
                productos: [
                    { nombre: "Gafas de sol aviador", cantidad: 1 },
                    { nombre: "Montura ligera", cantidad: 2 },
                ],
            },
            {
                id: 2,
                fecha: "2025-01-05",
                total: 150000,
                estado: "Entregado",
                productos: [
                    { nombre: "Gafas Ciclismo Pro", cantidad: 1 },
                ],
            },
            {
                id: 3,
                fecha: "2024-12-30",
                total: 145000,
                estado: "Pendiente",
                productos: [
                    { nombre: "Lentes antireflejo", cantidad: 1 },
                    { nombre: "Montura ", cantidad: 1 }
                ],
            },
        ];

        setPedidos(pedidosEjemplo);
    }, []);

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

    return (
        <div className="container mt-4">
            <Navbar />
            <h2 className="mb-4 text-center">Mis Pedidos</h2>

            {pedidos.length === 0 ? (
                <p className="text-center text-muted">No tienes pedidos aún.</p>
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
                                    </li>
                                ))}
                            </ul>

                            {/* Botón */}
                            <div className="text-end">
                                <button className="btn btn-outline-primary btn-sm">
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