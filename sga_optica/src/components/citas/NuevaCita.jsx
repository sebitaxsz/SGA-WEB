import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const NuevaCita = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '09:00',
    servicio: 'examen-vista',
    notas: ''
  })

  const servicios = [
    { id: 'examen-vista', nombre: 'Examen de la Vista Completo' },
    { id: 'entrega-lentes', nombre: 'Entrega de Lentes' },
    { id: 'ajuste-montura', nombre: 'Ajuste de Montura' },
    { id: 'consulta-especial', nombre: 'Consulta Especializada' },
    { id: 'limpieza-profesional', nombre: 'Limpieza Profesional' }
  ]

  const horasDisponibles = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('¡Cita agendada exitosamente! Te contactaremos para confirmar.')
    // Aquí normalmente enviarías los datos a un backend
    console.log('Datos de la cita:', formData)
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">📅 Agendar Nueva Cita</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Teléfono *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Hora *</label>
                    <select
                      className="form-select"
                      name="hora"
                      value={formData.hora}
                      onChange={handleChange}
                      required
                    >
                      {horasDisponibles.map(hora => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Servicio *</label>
                    <select
                      className="form-select"
                      name="servicio"
                      value={formData.servicio}
                      onChange={handleChange}
                      required
                    >
                      {servicios.map(serv => (
                        <option key={serv.id} value={serv.id}>{serv.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Notas adicionales</label>
                  <textarea
                    className="form-control"
                    name="notas"
                    rows="3"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Ej: Necesito lentes progresivos, tengo alergias, etc."
                  ></textarea>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Link to="/" className="btn btn-secondary me-md-2">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Agendar Cita
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-light rounded">
                <h5>📋 Información importante:</h5>
                <ul className="mb-0">
                  <li>Las citas deben agendarse con al menos 24 horas de anticipación</li>
                  <li>Te contactaremos para confirmar tu cita</li>
                  <li>Por favor llega 10 minutos antes de tu hora agendada</li>
                  <li>Trae tus lentes o receta médica si los tienes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NuevaCita