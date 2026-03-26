import React from 'react'
import { Link } from 'react-router-dom'

const Servicios = () => {
  const serviciosClinicos = [
    {
      categoria: '💊 Tratamientos',
      items: [
        { nombre: 'Tratamiento para Ojo Seco', icon: '💧' },
        { nombre: 'Terapia Visual', icon: '👁️' },
        { nombre: 'Control de Glaucoma', icon: '📉' },
        { nombre: 'Tratamiento de Cataratas', icon: '🔍' }
      ]
    },
    {
      categoria: '🔧 Servicios Técnicos',
      items: [
        { nombre: 'Ajuste y Reparación de Monturas', icon: '🔧' },
        { nombre: 'Limpieza Profesional de Lentes', icon: '✨' },
        { nombre: 'Cambio de Cristales', icon: '🔄' },
        { nombre: 'Montaje de Lentes de Contacto', icon: '👁️‍🗨️' }
      ]
    },
    {
      categoria: '👁️ Especialidades',
      items: [
        { nombre: 'Oftalmología Pediátrica', icon: '👶' },
        { nombre: 'Retina y Vítreo', icon: '🔬' },
        { nombre: 'Córnea y Segmento Anterior', icon: '👁️' },
        { nombre: 'Neuro-oftalmología', icon: '🧠' }
      ]
    }
  ]

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <h1 className="text-primary mb-4">💊 Servicios Clínicos Integrales</h1>
      
      <div className="row mb-4">
        <div className="col-lg-8">
          <p className="lead">
            En S.G.A Óptica ofrecemos una amplia gama de servicios clínicos 
            para el cuidado integral de tu salud visual. Contamos con tecnología 
            de punta y personal altamente capacitado.
          </p>
        </div>
      </div>

      {serviciosClinicos.map((categoria, index) => (
        <div key={index} className="card mb-4">
          <div className="card-header bg-light">
            <h4 className="mb-0">{categoria.categoria}</h4>
          </div>
          <div className="card-body">
            <div className="row">
              {categoria.items.map((item, idx) => (
                <div key={idx} className="col-md-6 col-lg-3 mb-3">
                  <div className="d-flex align-items-center p-3 border rounded">
                    <span className="fs-3 me-3">{item.icon}</span>
                    <div>
                      <h6 className="mb-0">{item.nombre}</h6>
                      <small className="text-muted">Más información</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-1 mb-3">🏥</div>
              <h5>Instalaciones Modernas</h5>
              <p>Consultorios equipados con tecnología de última generación</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-1 mb-3">👨‍⚕️</div>
              <h5>Profesionales Certificados</h5>
              <p>Equipo médico con especializaciones en diferentes áreas</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="display-1 mb-3">💳</div>
              <h5>Convenios y Seguros</h5>
              <p>Aceptamos la mayoría de seguros médicos y tenemos convenios</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body text-center">
          <h5>📞 ¿Necesitas más información?</h5>
          <p className="mb-3">
            Contáctanos para programar una consulta o resolver tus dudas
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="tel:+573001234567" className="btn btn-primary">
              <i className="fas fa-phone me-2"></i> Llamar Ahora
            </a>
            <Link to="/citas/nueva" className="btn btn-success">
              <i className="fas fa-calendar me-2"></i> Agendar Cita
            </Link>
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

export default Servicios