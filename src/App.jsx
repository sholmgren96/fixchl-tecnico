import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import NavBar from './components/NavBar'
import Login from './screens/Login'
import Solicitudes from './screens/Solicitudes'
import DetalleJob from './screens/DetalleJob'
import Chats from './screens/Chats'
import ChatScreen from './screens/ChatScreen'
import Rendimiento from './screens/Rendimiento'
import Perfil from './screens/Perfil'
import Agenda from './screens/Agenda'
import PendienteVerificacion from './screens/PendienteVerificacion'
import AdminLogin from './screens/admin/AdminLogin'
import AdminShell from './screens/admin/AdminShell'
import { adminAuth } from './services/adminApi'

const HIDE_NAV = [/^\/chats\/.+/]

function AdminApp() {
  const [adminProfile, setAdminProfile] = useState(() => {
    // Si hay token guardado, intentar parsear el nombre del JWT payload
    try {
      const token = adminAuth.getToken()
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role === 'admin' ? { nombre: payload.nombre, email: payload.email } : null
    } catch { return null }
  })

  if (!adminProfile) {
    return <AdminLogin onLogin={(admin) => setAdminProfile(admin)} />
  }
  return <AdminShell admin={adminProfile} onLogout={() => setAdminProfile(null)} />
}

function Shell() {
  const { authed, profile } = useApp()
  const location = useLocation()
  const hideNav = HIDE_NAV.some(r => r.test(location.pathname))

  if (location.pathname.startsWith('/admin')) return <AdminApp />
  if (!authed) return <Login />
  if (profile && profile.estado !== 'activo') return <PendienteVerificacion />

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/solicitudes" replace />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/solicitudes/:id" element={<DetalleJob />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:id" element={<ChatScreen />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/rendimiento" element={<Rendimiento />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
      {!hideNav && <NavBar />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
