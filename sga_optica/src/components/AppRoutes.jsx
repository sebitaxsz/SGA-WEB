import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from '../App'
import PanelAdmin from './PanelAdmin'
import ProductosPage from './ProductosPage'
import AllProductsPage from './AllProductsPage'
import Pedidos from './carrito/Pedidos'
import Navbar from './Navbar'

// Importar componentes de citas
import NuevaCita from './citas/NuevaCita'
import VerCitas from './citas/VerCitas'

// Importar componentes de clínica
import Examenes from './Clinica/Examenes'
import Servicios from './Clinica/Servicios'

// Importar componentes de registro
import Login from './registro/Login'
import Register from './registro/Register'
import Profile from './registro/Profile'
import EditarPerfil from './registro/EditarPerfil'
import ForgotPassword from './registro/ForgotPassword'
import ResetPassword from './registro/ResetPassword'

//Importar componente de carrito
import CartPage from './carrito/CartPage'

//Importar componente de notificación
import MisNotificaciones from './campanita/MisNotificaciones';

// Layout que incluye Navbar (para todas las rutas EXCEPTO admin)
const LayoutWithNavbar = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Rutas CON Navbar */}
        <Route path="/" element={<LayoutWithNavbar><App /></LayoutWithNavbar>} />
        <Route path="/productos" element={<LayoutWithNavbar><AllProductsPage /></LayoutWithNavbar>} />
        <Route path="/productos/:category" element={<LayoutWithNavbar><ProductosPage /></LayoutWithNavbar>} />
        
        {/* Rutas de citas */}
        <Route path="/citas/nueva" element={<LayoutWithNavbar><NuevaCita /></LayoutWithNavbar>} />
        <Route path="/citas/ver" element={<LayoutWithNavbar><VerCitas /></LayoutWithNavbar>} />
        
        {/* Rutas de clínica */}
        <Route path="/clinica/examenes" element={<LayoutWithNavbar><Examenes /></LayoutWithNavbar>} />
        <Route path="/clinica/servicios" element={<LayoutWithNavbar><Servicios /></LayoutWithNavbar>} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<LayoutWithNavbar><Login /></LayoutWithNavbar>} />
        <Route path="/register" element={<LayoutWithNavbar><Register /></LayoutWithNavbar>} />
        <Route path="/profile" element={<LayoutWithNavbar><Profile /></LayoutWithNavbar>} />
         <Route path="/editar-perfil" element={<LayoutWithNavbar><EditarPerfil /></LayoutWithNavbar>} />
        <Route path="/forgot-password" element={<LayoutWithNavbar><ForgotPassword /></LayoutWithNavbar>} />
        <Route path="/reset-password" element={<LayoutWithNavbar><ResetPassword /></LayoutWithNavbar>} />
        
        {/* Rutas de carrito y pedidos */}
        <Route path="/carrito" element={<LayoutWithNavbar><CartPage /></LayoutWithNavbar>} />
        <Route path="/pedidos" element={<LayoutWithNavbar><Pedidos /></LayoutWithNavbar>} />
        
        {/* Ruta de notificaciones */}
        <Route path="/mis-notificaciones" element={<LayoutWithNavbar><MisNotificaciones /></LayoutWithNavbar>} />

        {/* Ruta de ADMIN - SIN Navbar */}
        <Route path="/admin/*" element={<PanelAdmin />} />
      </Routes>
    </Router>
  )
}

export default AppRouter