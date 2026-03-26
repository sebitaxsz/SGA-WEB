import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const VerCitas = () => {
  const [citas, setCitas] = useState([
    {
      id: 1,
      paciente: 'María González',
      fecha: '2024-01-15',
      hora: '10:00',
      servicio: 'Examen de la Vista',
      estado: 'Confirmada',
      telefono: '3001234567'
    },
    {
      id: 2,
      paciente: 'Carlos Rodríguez',
      fecha: '2024-01-16',
      hora: '14:00',
      servicio: 'Entrega de Lentes',
      estado: 'Pendiente',
      telefono: '3007654321'
    },
    {
      id: 3,
      paciente: 'Ana López',
      fecha: '2024-01-17',
      hora: '11:00',
      servicio: 'Ajuste de Montura',
      estado: 'Completada',
      telefono: '3009876543'
    }
  ])

  const cancelarCita = (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      setCitas(citas.filter(cita => cita.id !== id))
      alert('Cita cancelada exitosamente')
    }
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>📋 Mis Citas Agendadas</h1>
        <Link to="/citas/nueva" className="btn btn-primary">
          + Nueva Cita
        </Link>
      </div>

      {citas.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">📅</div>
          <h3>No tienes citas agendadas</h3>
          <p className="text-muted mb-4">Agenda tu primera cita con nosotros</p>
          <Link to="/citas/nueva" className="btn btn-primary btn-lg">
            Agendar Mi Primera Cita
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map(cita => (
                        <tr key={cita.id}>
                          <td>
                            <strong>{cita.paciente}</strong><br/>
                            <small className="text-muted">{cita.telefono}</small>
                          </td>
                          <td>{cita.fecha}</td>
                          <td>{cita.hora}</td>
                          <td>{cita.servicio}</td>
                          <td>
                            <span className={`badge ${
                              cita.estado === 'Confirmada' ? 'bg-success' :
                              cita.estado === 'Pendiente' ? 'bg-warning' :
                              'bg-secondary'
                            }`}>
                              {cita.estado}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary">
                                <i className="fas fa-edit"></i> Editar
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => cancelarCita(cita.id)}
                              >
                                <i className="fas fa-times"></i> Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-body">
                <h5>📞 ¿Necesitas ayuda?</h5>
                <p className="mb-0">
                  Para reagendar o consultar sobre tus citas, contáctanos al 
                  <strong> (601) 123-4567</strong> o escribe a 
                  <strong> citas@opticasga.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          ← Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default VerCitas