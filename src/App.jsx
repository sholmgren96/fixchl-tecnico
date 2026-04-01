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

const HIDE_NAV = [/^\/chats\/.+/]

function Shell() {
  const { authed } = useApp()
  const location = useLocation()
  const hideNav = HIDE_NAV.some(r => r.test(location.pathname))

  if (!authed) return <Login />

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
