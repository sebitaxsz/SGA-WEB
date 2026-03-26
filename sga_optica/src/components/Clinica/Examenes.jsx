import React from 'react'
import { Link } from 'react-router-dom'

const Examenes = () => {
  const examenes = [
    {
      id: 1,
      nombre: 'Examen de Agudeza Visual',
      descripcion: 'Mide la capacidad para ver detalles a diferentes distancias',
      preparacion: 'Sin preparación especial',
      tiempo: '15 min'
    },
    {
      id: 2,
      nombre: 'Examen de Refracción',
      descripcion: 'Determina la graduación exacta para lentes correctivos',
      preparacion: 'Traer lentes actuales si los usa',
      tiempo: '20 min'
    },
    {
      id: 3,
      nombre: 'Examen de Presión Intraocular',
      descripcion: 'Mide la presión del ojo para detectar glaucoma',
      preparacion: 'No usar lentes de contacto el día del examen',
      tiempo: '10 min'
    },
    {
      id: 4,
      nombre: 'Examen de Fondo de Ojo',
      descripcion: 'Evalúa la retina y el nervio óptico',
      preparacion: 'Se aplicarán gotas para dilatar la pupila',
      tiempo: '30 min'
    },
    {
      id: 5,
      nombre: 'Campo Visual Computarizado',
      descripcion: 'Evalúa la visión periférica',
      preparacion: 'Sin preparación especial',
      tiempo: '20 min'
    },
    {
      id: 6,
      nombre: 'Paquete Examen Completo',
      descripcion: 'Incluye todos los exámenes básicos + consulta especializada',
      preparacion: 'No usar lentes de contacto',
      tiempo: '90 min'
    }
  ]

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <h1 className="text-primary mb-4">🔬 Exámenes de la Vista</h1>
      
      <div className="alert alert-info">
        <h5>📋 Información Importante</h5>
        <p className="mb-0">
          Recomendamos realizar exámenes visuales anuales para mantener una 
          salud ocular óptima. Los exámenes son indoloros y realizados con 
          tecnología de última generación.
        </p>
      </div>

      <div className="row g-4 mt-4">
        {examenes.map(examen => (
          <div key={examen.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{examen.nombre}</h5>
                <p className="card-text">{examen.descripcion}</p>
                
                <div className="mt-3">
                  <p className="mb-1">
                    <strong>⏱️ Duración:</strong> {examen.tiempo}
                  </p>
                  <p className="mb-0">
                    <strong>📝 Preparación:</strong> {examen.preparacion}
                  </p>
                </div>
                
                <div className="d-grid mt-3">
                  <Link to="/citas/nueva" className="btn btn-outline-primary">
                    Agendar Examen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>🕒 Horarios para Exámenes</h5>
              <ul className="mb-0">
                <li>Lunes a Viernes: 8:00 AM - 6:00 PM</li>
                <li>Sábados: 9:00 AM - 2:00 PM</li>
                <li>Domingos: Cerrado</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>📞 Para Mayores de 60 años</h5>
              <p className="mb-0">
                Ofrecemos descuentos especiales en paquetes de exámenes 
                para adultos mayores. Consulta por nuestras promociones.
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

export default Examenes