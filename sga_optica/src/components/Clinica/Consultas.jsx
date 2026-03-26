import React from 'react'
import { Link } from 'react-router-dom'

const Consultas = () => {
  const serviciosConsultas = [
    {
      id: 1,
      nombre: 'Consulta General de Oftalmología',
      descripcion: 'Evaluación completa de la salud ocular y diagnóstico de enfermedades',
      duracion: '45-60 min',
      precio: '$80.000'
    },
    {
      id: 2,
      nombre: 'Consulta Especializada en Retina',
      descripcion: 'Diagnóstico y tratamiento de enfermedades de la retina',
      duracion: '60 min',
      precio: '$120.000'
    },
    {
      id: 3,
      nombre: 'Consulta de Glaucoma',
      descripcion: 'Evaluación y seguimiento de pacientes con glaucoma',
      duracion: '45 min',
      precio: '$90.000'
    },
    {
      id: 4,
      nombre: 'Consulta Pediátrica',
      descripcion: 'Atención especializada para niños y adolescentes',
      duracion: '40 min',
      precio: '$70.000'
    }
  ]

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <h1 className="text-primary mb-4">🩺 Consultas Especializadas</h1>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <p className="lead">
            Contamos con un equipo de oftalmólogos especializados para atender 
            todas tus necesidades de salud visual. Diagnósticos precisos y 
            tratamientos personalizados.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {serviciosConsultas.map(servicio => (
          <div key={servicio.id} className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">{servicio.nombre}</h5>
                <p className="card-text">{servicio.descripcion}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="badge bg-secondary me-2">
                      ⏱️ {servicio.duracion}
                    </span>
                    <span className="badge bg-success">
                      💰 {servicio.precio}
                    </span>
                  </div>
                  <Link to="/citas/nueva" className="btn btn-primary btn-sm">
                    Agendar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-5">
        <div className="card-body">
          <h5>👨‍⚕️ Nuestros Especialistas</h5>
          <div className="row mt-3">
            <div className="col-md-4 text-center">
              <div className="display-1">👨‍⚕️</div>
              <h6>Dr. Carlos Méndez</h6>
              <small className="text-muted">Oftalmólogo General</small>
            </div>
            <div className="col-md-4 text-center">
              <div className="display-1">👩‍⚕️</div>
              <h6>Dra. Ana Rodríguez</h6>
              <small className="text-muted">Especialista en Retina</small>
            </div>
            <div className="col-md-4 text-center">
              <div className="display-1">👨‍⚕️</div>
              <h6>Dr. Luis Fernández</h6>
              <small className="text-muted">Pediatría Oftalmológica</small>
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

export default Consultas