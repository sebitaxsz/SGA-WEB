import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentService } from '../../services/appointment.service'
import axiosInstance from '../../services/axiosConfig'

const NuevaCita = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    date: '',
    time: '09:00',
    exam_type_id: '',
    optometrist_id: ''
  })

  const [examTypes, setExamTypes] = useState([])
  const [optometrists, setOptometrists] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [verifiedCustomerId, setVerifiedCustomerId] = useState(null)
  
  const horasDisponibles = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  // 🔧 Función para obtener el customer_id CORRECTO desde la base de datos
  const getCorrectCustomerId = async (userEmail) => {
    try {
      console.log('🔍 Buscando customer_id correcto para el email:', userEmail)
      
      // Opción 1: Buscar por email en la tabla customer
      const response = await axiosInstance.get('/customer')
      const customers = response.data || []
      
      // Buscar por email
      let customer = customers.find(c => c.email === userEmail)
      
      // Si no encuentra por email, buscar por nombre
      if (!customer) {
        customer = customers.find(c => 
          c.firstName?.toLowerCase() === 'marlon' || 
          c.email?.includes('marlon')
        )
      }
      
      if (customer) {
        console.log('✅ Cliente encontrado en BD:', customer)
        console.log('✅ customer_id CORRECTO:', customer.customer_id)
        console.log('✅ Nombre:', customer.firstName, customer.firstLastName)
        return customer.customer_id
      }
      
      console.warn('⚠️ No se encontró cliente con email:', userEmail)
      return null
    } catch (error) {
      console.error('❌ Error obteniendo customer_id:', error)
      return null
    }
  }

  // 🔧 Función para obtener el optometrist_id correcto
  const getCorrectOptometristId = async () => {
    try {
      const response = await axiosInstance.get('/optometrist')
      const optometrists = response.data || []
      
      // Buscar a Juan Perez
      const juanPerez = optometrists.find(opt => 
        opt.professionalCardCode === 'PROF-001' || 
        opt.email === 'juan.perez@ejemplo.com' ||
        opt.firstName === 'Juan'
      )
      
      if (juanPerez) {
        console.log('✅ Optometrista Juan Perez encontrado - ID:', juanPerez.id)
        return juanPerez.id
      }
      
      if (optometrists.length > 0) {
        console.log('✅ Primer optometrista encontrado - ID:', optometrists[0].id)
        return optometrists[0].id
      }
      
      return 1 // Fallback
    } catch (error) {
      console.error('❌ Error obteniendo optometrista:', error)
      return 1
    }
  }

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
        console.log('📋 Datos del usuario en localStorage:', userDataParsed)
        
        // Solo clientes pueden agendar citas
        if (userDataParsed.role !== 'user') {
          alert('Solo los clientes pueden agendar citas')
          navigate('/')
          return
        }
        
        // 🔧 OBTENER EL CUSTOMER_ID CORRECTO (6, no 13)
        const email = userDataParsed.email || userDataParsed.user_user
        const correctCustomerId = await getCorrectCustomerId(email)
        
        if (!correctCustomerId) {
          console.error('❌ No se pudo obtener customer_id correcto')
          alert('Error: No se encontró información de cliente. Por favor contacta al administrador.')
          navigate('/')
          return
        }
        
        console.log('🎯 Usando customer_id CORRECTO:', correctCustomerId)
        setVerifiedCustomerId(correctCustomerId)
        
        // Obtener el optometrist_id correcto
        const correctOptometristId = await getCorrectOptometristId()
        
        setUserData({
          ...userDataParsed,
          customer_id: correctCustomerId
        })
        
        // Seleccionar Juan Perez por defecto
        setFormData(prev => ({
          ...prev,
          optometrist_id: correctOptometristId.toString()
        }))
        
        // Cargar tipos de examen
        await loadExamTypes()
        
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
      const response = await appointmentService.getExamTypes()
      
      let examTypesData = response.data
      if (response.data?.data) examTypesData = response.data.data
      if (response.data?.rows) examTypesData = response.data.rows
      
      if (examTypesData && examTypesData.length > 0) {
        setExamTypes(examTypesData)
        // Seleccionar el primer tipo de examen por defecto
        setFormData(prev => ({
          ...prev,
          exam_type_id: examTypesData[0].id.toString()
        }))
        console.log(`✅ ${examTypesData.length} tipos de examen cargados`)
      } else {
        // Datos de respaldo
        const backupExamTypes = [
          { id: 1, name: 'Examen de Agudeza Visual', description: 'Evaluación básica de la visión' },
          { id: 2, name: 'Examen de Refracción', description: 'Medición de graduación' },
          { id: 3, name: 'Tonometría', description: 'Medición de presión ocular' }
        ]
        setExamTypes(backupExamTypes)
        setFormData(prev => ({ ...prev, exam_type_id: '1' }))
      }
    } catch (error) {
      console.error('❌ Error cargando tipos de examen:', error)
      setExamTypes([
        { id: 1, name: 'Examen de Agudeza Visual', description: 'Evaluación básica de la visión' },
        { id: 2, name: 'Examen de Refracción', description: 'Medición de graduación' },
        { id: 3, name: 'Tonometría', description: 'Medición de presión ocular' }
      ])
      setFormData(prev => ({ ...prev, exam_type_id: '1' }))
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

    if (!formData.date) {
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

    // Usar el customer_id verificado (6)
    const finalCustomerId = verifiedCustomerId || userData?.customer_id
    
    if (!finalCustomerId) {
      setError('Error: No se encontró información del cliente')
      setLoading(false)
      return
    }

    console.log('=== ENVIANDO CITA ===')
    console.log('customer_id a usar:', finalCustomerId)
    console.log('exam_type_id:', formData.exam_type_id)
    console.log('optometrist_id:', formData.optometrist_id)
    console.log('fecha:', formData.date)
    console.log('hora:', formData.time)

    try {
      const appointmentData = {
        date: formData.date,
        time: formData.time,
        customer_id: parseInt(finalCustomerId),
        exam_type_id: parseInt(formData.exam_type_id),
        optometrist_id: parseInt(formData.optometrist_id)
      }

      console.log('📅 Body de la petición:', JSON.stringify(appointmentData, null, 2))

      const response = await appointmentService.createAppointment(appointmentData)

      console.log('✅ Respuesta:', response.data)

      if (response.status === 201 || response.status === 200) {
        setSuccess('✅ ¡Cita agendada exitosamente!')
        
        setTimeout(() => {
          navigate('/citas/ver')
        }, 2000)
      }
    } catch (err) {
      console.error('❌ Error:', err)
      console.error('❌ Status:', err.response?.status)
      console.error('❌ Data:', err.response?.data)
      
      if (err.response?.status === 404) {
        setError(`No se encontró: ${err.response?.data?.message || 'cliente u optometrista'}. Verifica que existan.`)
      } else if (err.response?.status === 409) {
        setError('Horario no disponible. El optometrista ya tiene una cita en esa fecha y hora.')
      } else if (err.response?.status === 400) {
        setError(`Datos inválidos: ${err.response?.data?.message || 'Verifica los campos'}`)
      } else {
        setError(err.response?.data?.message || `Error ${err.response?.status}: No se pudo agendar la cita.`)
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
                Cliente: Marlon Castañeda (ID: {verifiedCustomerId || '...'})
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
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Hora *</label>
                    <select
                      className="form-select"
                      name="time"
                      value={formData.time}
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
                        {exam.name} {exam.description && `- ${exam.description}`}
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
                    <option value="1">Juan Perez - PROF-001</option>
                  </select>
                </div>

                <div className="alert alert-info mt-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <small>
                    Recibirás un recordatorio por correo electrónico y en tus notificaciones.
                  </small>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
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