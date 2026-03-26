import React from 'react'
import { Link } from 'react-router-dom'

const CalendarioCitas = () => {
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  
  const semanas = [
    [
      { dia: 1, citas: ['10:00 - María G.', '14:00 - Carlos R.'] },
      { dia: 2, citas: ['11:00 - Ana L.'] },
      { dia: 3, citas: [] },
      { dia: 4, citas: ['09:00 - Pedro M.', '16:00 - Laura S.'] },
      { dia: 5, citas: [] },
      { dia: 6, citas: ['10:00 - Juan P.'] },
      { dia: 7, citas: [] }
    ]
  ]

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>🗓️ Calendario de Citas</h1>
        <div>
          <Link to="/citas/nueva" className="btn btn-primary me-2">
            + Nueva Cita
          </Link>
          <button className="btn btn-outline-secondary">
            <i className="fas fa-print"></i> Imprimir
          </button>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          {/* Encabezado del calendario */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Enero 2024</h3>
            <div>
              <button className="btn btn-outline-primary me-2">
                <i className="fas fa-chevron-left"></i> Mes Anterior
              </button>
              <button className="btn btn-outline-primary">
                Mes Siguiente <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="row mb-3 text-center fw-bold">
            {dias.map(dia => (
              <div key={dia} className="col p-2 border bg-light">
                {dia}
              </div>
            ))}
          </div>

          {/* Semanas del mes */}
          {semanas.map((semana, index) => (
            <div key={index} className="row mb-3">
              {semana.map((dia, idx) => (
                <div key={idx} className="col p-2 border" style={{ minHeight: '150px' }}>
                  <div className="d-flex justify-content-between">
                    <span className={`badge ${dia.citas.length > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                      {dia.dia}
                    </span>
                    {dia.citas.length > 0 && (
                      <span className="badge bg-success">{dia.citas.length} cita(s)</span>
                    )}
                  </div>
                  
                  {/* Lista de citas del día */}
                  <div className="mt-2">
                    {dia.citas.map((cita, i) => (
                      <div key={i} className="alert alert-info p-2 mb-1 small">
                        {cita}
                      </div>
                    ))}
                    {dia.citas.length === 0 && (
                      <div className="text-muted small mt-3">No hay citas</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Leyenda</h5>
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-primary me-2">●</span>
                <span>Día con citas</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-secondary me-2">●</span>
                <span>Día sin citas</span>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-success me-2">●</span>
                <span>Número de citas</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Disponibilidad</h5>
              <p className="mb-2">
                <strong>Horarios disponibles:</strong><br/>
                Lunes a Viernes: 9:00 AM - 6:00 PM<br/>
                Sábados: 9:00 AM - 2:00 PM
              </p>
              <p className="mb-0">
                <strong>Tiempo por cita:</strong> 30-60 minutos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          ← Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default CalendarioCitas