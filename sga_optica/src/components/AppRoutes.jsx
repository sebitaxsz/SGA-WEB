import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from '../App'
import PanelAdmin from './PanelAdmin'
import ProductosPage from './ProductosPage'
import Navbar from './Navbar'

// Importar componentes de citas
import NuevaCita from './citas/NuevaCita'
import VerCitas from './citas/VerCitas'
import CalendarioCitas from './citas/CalendarioCitas'

// Importar componentes de clínica
import Consultas from './Clinica/Consultas'
import Examenes from './Clinica/Examenes'
import Servicios from './Clinica/Servicios'

// Importar componentes de registro
import Login from './registro/Login'
import Register from './registro/Register'
import Profile from './registro/Profile'
//Importar componente de carrito
import CartPage from './carrito/CartPage'
import Pedidos from './carrito/Pedidos'

function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/productos/:category" element={<ProductosPage />} />
        
        {/* Rutas de citas */}
        <Route path="/citas/nueva" element={<NuevaCita />} />
        <Route path="/citas/ver" element={<VerCitas />} />
        <Route path="/citas/calendario" element={<CalendarioCitas />} />
        
        {/* Rutas de clínica */}
        <Route path="/clinica/consultas" element={<Consultas />} />
        <Route path="/clinica/examenes" element={<Examenes />} />
        <Route path="/clinica/servicios" element={<Servicios />} />
        {/* Rutas de registro */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile />} />
        {/* Ruta de carrito */}
        <Route path="/carrito" element={<CartPage />} />
        <Route path='/pedidos' element={<Pedidos />} />
      </Routes>
    </Router>
  )
}

export default AppRouter