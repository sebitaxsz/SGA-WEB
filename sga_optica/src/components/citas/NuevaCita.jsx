import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const NuevaCita = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '09:00',
    exam_type_id: '',
    optometrist_id: ''
  })

  const [examTypes, setExamTypes] = useState([])
  const [optometrists, setOptometrists] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  
  const horasDisponibles = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  const API_BASE_URL = 'https://7l77sjp2-3002.use2.devtunnels.ms/api/v1'

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
  })

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        alert('Debes iniciar sesión para agendar una cita')
        navigate('/login')
        return
      }
      
      try {
        const userDataParsed = JSON.parse(user)
        console.log('📋 Datos completos del usuario:', userDataParsed)
        
        if (userDataParsed.role !== 'user') {
          alert('Solo los clientes pueden agendar citas')
          navigate('/')
          return
        }
        
        // Intentar obtener el customer_id de diferentes fuentes
        let customerId = null
        
        if (userDataParsed.customer_id) {
          customerId = userDataParsed.customer_id
        } else if (userDataParsed.entity?.customer_id) {
          customerId = userDataParsed.entity.customer_id
        } else if (userDataParsed.entity?.id) {
          customerId = userDataParsed.entity.id
        }
        
        console.log('🔑 Customer ID obtenido:', customerId)
        
        if (!customerId) {
          alert('Error: No se encontró información de cliente. Por favor contacta al administrador.')
          navigate('/')
          return
        }
        
        // Actualizar userData con el customer_id correcto
        const updatedUserData = {
          ...userDataParsed,
          customer_id: customerId
        }
        
        setUserData(updatedUserData)
        
        // Cargar datos desde las APIs
        await Promise.all([
          loadExamTypes(),
          loadOptometrists()
        ])
        
      } catch (error) {
        console.error('Error:', error)
        navigate('/login')
      } finally {
        setLoadingData(false)
      }
    }
    
    checkAuthAndLoad()
  }, [navigate])

  const loadExamTypes = async () => {
    try {
      console.log('🔄 Cargando tipos de examen...')
      const response = await api.get('/exam-types')
      
      if (response.data && response.data.length > 0) {
        setExamTypes(response.data)
        console.log('✅ Tipos de examen:', response.data)
      } else {
        // Datos de respaldo
        setExamTypes([
          { id: 1, name: 'Examen de Agudeza Visual' },
          { id: 2, name: 'Examen de Refracción' },
          { id: 3, name: 'Tonometría' }
        ])
      }
    } catch (error) {
      console.error('❌ Error cargando tipos de examen:', error)
      setExamTypes([
        { id: 1, name: 'Examen de Agudeza Visual' },
        { id: 2, name: 'Examen de Refracción' },
        { id: 3, name: 'Tonometría' }
      ])
    }
  }

  const loadOptometrists = async () => {
    try {
      console.log('🔄 Cargando optometristas...')
      const response = await api.get('/optometrists')
      
      console.log('📋 Respuesta optometristas:', response.data)
      
      if (response.data && response.data.length > 0) {
        const activeOptometrists = response.data.filter(opt => opt.is_active !== false)
        setOptometrists(activeOptometrists)
        
        // Seleccionar Juan Perez o el primero
        const juanPerez = activeOptometrists.find(opt => 
          opt.email === 'juan.perez@ejemplo.com' || 
          opt.firstName === 'Juan'
        )
        
        if (juanPerez) {
          setFormData(prev => ({ ...prev, optometrist_id: juanPerez.id.toString() }))
          console.log('✅ Optometrista seleccionado:', juanPerez.firstName, juanPerez.id)
        } else if (activeOptometrists.length > 0) {
          setFormData(prev => ({ ...prev, optometrist_id: activeOptometrists[0].id.toString() }))
          console.log('✅ Primer optometrista seleccionado:', activeOptometrists[0].id)
        }
      } else {
        // Datos de respaldo
        const backupOptometrists = [
          { id: 1, firstName: 'Juan', firstLastName: 'Perez', email: 'juan.perez@ejemplo.com', professionalCardCode: 'PROF-001' }
        ]
        setOptometrists(backupOptometrists)
        setFormData(prev => ({ ...prev, optometrist_id: '1' }))
        console.log('⚠️ Usando optometrista de respaldo ID: 1')
      }
    } catch (error) {
      console.error('❌ Error cargando optometristas:', error)
      const backupOptometrists = [
        { id: 1, firstName: 'Juan', firstLastName: 'Perez', email: 'juan.perez@ejemplo.com', professionalCardCode: 'PROF-001' }
      ]
      setOptometrists(backupOptometrists)
      setFormData(prev => ({ ...prev, optometrist_id: '1' }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validaciones
    if (!formData.fecha) {
      setError('Por favor selecciona una fecha')
      setLoading(false)
      return
    }

    if (!formData.exam_type_id) {
      setError('Por favor selecciona un tipo de examen')
      setLoading(false)
      return
    }

    if (!formData.optometrist_id) {
      setError('Por favor selecciona un optometrista')
      setLoading(false)
      return
    }

    // Validar que el customer_id existe
    if (!userData?.customer_id) {
      setError('Error: No se encontró información del cliente. Por favor cierra sesión y vuelve a iniciar.')
      setLoading(false)
      return
    }

    try {
      const appointmentData = {
        date: formData.fecha,
        time: formData.hora,
        customer_id: parseInt(userData.customer_id),
        exam_type_id: parseInt(formData.exam_type_id),
        optometrist_id: parseInt(formData.optometrist_id)
      }

      console.log('📅 Datos de la cita a enviar:', appointmentData)
      console.log('🔑 Customer ID:', appointmentData.customer_id)
      console.log('👨‍⚕️ Optometrist ID:', appointmentData.optometrist_id)

      const response = await api.post('/appointments', appointmentData)

      if (response.status === 201) {
        setSuccess('✅ ¡Cita agendada exitosamente!')
        
        setTimeout(() => {
          navigate('/citas/ver')
        }, 2000)
      }
    } catch (err) {
      console.error('❌ Error completo:', err)
      console.error('❌ Response error:', err.response?.data)
      
      if (err.response?.status === 404) {
        setError('No se encontró el cliente o el optometrista seleccionado. Por favor, verifica los datos.')
      } else if (err.response?.status === 409) {
        setError('Horario no disponible. Selecciona otra hora o fecha.')
      } else if (err.response?.status === 400) {
        setError('Datos inválidos: ' + JSON.stringify(err.response.data?.details || ''))
      } else {
        setError(err.response?.data?.message || 'Error al agendar la cita. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '100px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">📅 Agendar Nueva Cita</h2>
              <p className="mb-0 mt-2">
                <i className="fas fa-user me-2"></i>
                Cliente ID: {userData?.customer_id || 'No disponible'}
              </p>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
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
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Examen *</label>
                  <select
                    className="form-select"
                    name="exam_type_id"
                    value={formData.exam_type_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un tipo de examen</option>
                    {examTypes.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Optometrista *</label>
                  <select
                    className="form-select"
                    name="optometrist_id"
                    value={formData.optometrist_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un optometrista</option>
                    {optometrists.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.firstName} {opt.firstLastName} - {opt.professionalCardCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Link to="/" className="btn btn-secondary me-md-2">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Agendando...' : 'Agendar Cita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NuevaCita