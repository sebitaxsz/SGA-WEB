// src/components/Clinica/Examenes.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const Examenes = () => {
  const examenes = [
    {
      id: 1,
      nombre: 'Examen de Agudeza Visual',
      descripcion: 'Evaluación básica de la visión para determinar la capacidad de ver detalles finos y nítidos.',
      duracion: '15-20 minutos',
      icono: 'fa-eye'
    },
    {
      id: 2,
      nombre: 'Examen de Refracción',
      descripcion: 'Medición de la graduación necesaria para corregir miopía, hipermetropía y astigmatismo.',
      duracion: '20-30 minutos',
      icono: 'fa-chart-line'
    },
    {
      id: 3,
      nombre: 'Tonometría',
      descripcion: 'Medición de la presión intraocular para detectar riesgo de glaucoma.',
      duracion: '5-10 minutos',
      icono: 'fa-tachometer-alt'
    }
  ]

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">Exámenes de la Vista</h1>
        <p className="lead text-muted">
          Realizamos exámenes completos con tecnología de punta y profesionales calificados
        </p>
      </div>

      <div className="row g-4">
        {examenes.map(examen => (
          <div key={examen.id} className="col-md-4">
            <div className="card h-100 border-0 shadow-sm hover-card">
              <div className="card-body text-center p-4">
                <div className="display-1 text-primary mb-3">
                  <i className={`fas ${examen.icono}`}></i>
                </div>
                <h3 className="card-title fw-bold mb-3">{examen.nombre}</h3>
                <p className="card-text text-muted mb-3">{examen.descripcion}</p>
                <div className="mt-3">
                  <span className="badge bg-primary me-2">
                    <i className="fas fa-clock me-1"></i> {examen.duracion}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link to="/citas/nueva" className="btn btn-primary btn-lg">
          <i className="fas fa-calendar-check me-2"></i>
          Agendar mi Examen
        </Link>
      </div>

      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default Examenes