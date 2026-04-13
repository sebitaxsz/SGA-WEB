// src/components/registro/EditarPerfil.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosConfig'
import Navbar from '../Navbar'

const EditarPerfil = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    firstLastName: '',
    secondLastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (!token || !user.user_id) {
        navigate('/login')
        return
      }

      setUserData(user)
      
      try {
        // Obtener datos del customer por user_id
        const response = await axiosInstance.get(`/customer/user/${user.user_id}`)
        if (response.data) {
          const customer = response.data
          setFormData(prev => ({
            ...prev,
            firstName: customer.firstName || '',
            secondName: customer.secondName || '',
            firstLastName: customer.firstLastName || '',
            secondLastName: customer.secondLastName || '',
            phoneNumber: customer.phoneNumber || '',
            email: customer.email || '',
            address: customer.address || ''
          }))
        }
      } catch (error) {
        console.error('Error cargando datos del customer:', error)
        if (error.response?.status === 404) {
          setErrors({ general: 'Perfil de cliente no encontrado. Contacta al administrador.' })
        } else {
          setErrors({ general: 'Error al cargar los datos del perfil' })
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }
    if (!formData.firstLastName.trim()) {
      newErrors.firstLastName = 'El apellido es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Debes ingresar tu contraseña actual para cambiarla'
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres'
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Las contraseñas no coinciden'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    setSuccessMessage('')
    
    try {
      const dataToSend = {}
      
      if (formData.firstName) dataToSend.firstName = formData.firstName
      if (formData.secondName) dataToSend.secondName = formData.secondName
      if (formData.firstLastName) dataToSend.firstLastName = formData.firstLastName
      if (formData.secondLastName) dataToSend.secondLastName = formData.secondLastName
      if (formData.phoneNumber) dataToSend.phoneNumber = formData.phoneNumber
      if (formData.email) dataToSend.email = formData.email
      if (formData.address) dataToSend.address = formData.address
      
      if (formData.newPassword) {
        dataToSend.currentPassword = formData.currentPassword
        dataToSend.newPassword = formData.newPassword
        dataToSend.confirmNewPassword = formData.confirmNewPassword
      }
      
      const response = await axiosInstance.put('/customer/profile', dataToSend)
      
      if (response.data.message) {
        setSuccessMessage('Perfil actualizado exitosamente')
        
        // Actualizar localStorage
        const updatedUser = {
          ...userData,
          nombre: formData.firstName,
          apellido: formData.firstLastName,
          email: formData.email,
          telefono: formData.phoneNumber
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }))
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/profile')
        }, 2000)
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Error al actualizar el perfil' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ marginTop: '100px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <Navbar />
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-edit me-2"></i>
                Editar Perfil
              </h5>
            </div>
            <div className="card-body">
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  {successMessage}
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}
              
              {errors.general && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errors.general}
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <h6 className="mb-3">Información Personal</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Segundo Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="secondName"
                      value={formData.secondName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Apellido *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstLastName ? 'is-invalid' : ''}`}
                      name="firstLastName"
                      value={formData.firstLastName}
                      onChange={handleChange}
                    />
                    {errors.firstLastName && <div className="invalid-feedback">{errors.firstLastName}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Segundo Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      name="secondLastName"
                      value={formData.secondLastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Cambiar Contraseña (Opcional)</h6>
                <div className="mb-3">
                  <label className="form-label">Contraseña Actual</label>
                  <input
                    type="password"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Requerido para cambiar contraseña"
                  />
                  {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                    />
                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    {errors.confirmNewPassword && <div className="invalid-feedback">{errors.confirmNewPassword}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/profile')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Guardar Cambios
                      </>
                    )}
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

export default EditarPerfil