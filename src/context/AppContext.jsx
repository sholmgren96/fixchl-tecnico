import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api.js'

const AppCtx = createContext(null)

const AVATAR_CLASSES = ['av-green', 'av-blue', 'av-amber', 'av-purple']

function mapJob(j) {
  return {
    ...j,
    id: String(j.id),
    clientName:  j.cliente_nombre || 'Cliente',
    category:    j.categoria,
    description: j.descripcion,
    urgency:     j.urgencia,
    commune:     j.comuna,
    initials:    (j.cliente_nombre || 'C').charAt(0).toUpperCase(),
    avatarClass: AVATAR_CLASSES[j.id % AVATAR_CLASSES.length] || 'av-amber',
    fechas_propuestas: j.fechas_propuestas || [],
  }
}

export function AppProvider({ children }) {
  const [authed, setAuthed]   = useState(api.hasToken())
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs]                   = useState([])
  const [chats, setChats]                 = useState([])
  const [reagendamientos, setReagendamientos] = useState([])
  const [history, setHistory]             = useState([])
  const [error, setError]                 = useState(null)

  const login = async (telefono, password) => {
    const data = await api.login(telefono, password)
    api.saveToken(data.token)
    setAuthed(true)
  }

  const registro = async (datos) => {
    const data = await api.registro(datos)
    api.saveToken(data.token)
    setAuthed(true)
  }

  const logout = () => {
    api.clearToken()
    setAuthed(false)
    setProfile(null)
    setJobs([])
    setChats([])
  }

  const loadPerfil = useCallback(async () => {
    try { setProfile(await api.getPerfil()) }
    catch (e) { if (e.message.includes('Token')) logout() }
  }, [])

  const loadJobs = useCallback(async () => {
    try {
      const d = await api.getTrabajos()
      setJobs((d.disponibles || []).map(mapJob))
      setReagendamientos((d.reagendamientos || []).map(mapJob))
    }
    catch (e) { console.error(e) }
  }, [])

  const loadChats = useCallback(async () => {
    try {
      const d = await api.getChats()
      setChats(d.trabajos || [])
    }
    catch (e) { console.error(e) }
  }, [])

  const loadEstadisticas = useCallback(async () => {
    try {
      const d = await api.getEstadisticas()
      setHistory(d.calificaciones || [])
      setProfile(p => p ? { ...p, rating: d.rating, total_jobs: d.total_jobs, total_reviews: d.total_reviews } : p)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    if (!authed) return
    loadPerfil(); loadJobs(); loadChats()
  }, [authed])

  useEffect(() => {
    if (!authed) return
    const t = setInterval(() => { loadJobs(); loadChats() }, 15000)
    return () => clearInterval(t)
  }, [authed])

  const acceptJob = async (jobId) => {
    try {
      await api.aceptarTrabajo(jobId)
      setJobs(p => p.filter(j => j.id !== String(jobId)))
      await loadChats()
      return String(jobId)
    } catch (e) { setError(e.message); return null }
  }

  const acceptJobWithDate = async (jobId, fecha, hora) => {
    try {
      await api.aceptarConFecha(jobId, fecha, hora)
      setJobs(p => p.filter(j => j.id !== String(jobId)))
      await loadChats()
      return String(jobId)
    } catch (e) { setError(e.message); return null }
  }

  const rejectJob = async (jobId) => {
    try { setJobs(p => p.filter(j => j.id !== String(jobId))) }
    catch (e) { console.error(e) }
  }

  const confirmarReagendamiento = async (jobId) => {
    try {
      await api.confirmarReagendamiento(jobId)
      setReagendamientos(p => p.filter(j => j.id !== String(jobId)))
      await loadChats()
    } catch (e) { setError(e.message) }
  }

  const rechazarReagendamiento = async (jobId, razon) => {
    try {
      await api.rechazarReagendamiento(jobId, razon)
      setReagendamientos(p => p.filter(j => j.id !== String(jobId)))
    } catch (e) { setError(e.message) }
  }

  const sendMessage = async (chatId, text) => {
    try { await api.enviarMsg(chatId, text) }
    catch (e) { console.error(e) }
  }

  const markComplete = async (chatId) => {
    try {
      await api.completarTrabajo(chatId)
      setChats(p => p.map(c => c.id === parseInt(chatId) ? { ...c, estado: 'esperando_calificacion' } : c))
    } catch (e) { console.error(e) }
  }

  const toggleAvailable = async () => {
    try {
      const next = !profile?.disponible
      await api.setDisponible(next)
      setProfile(p => ({ ...p, disponible: next }))
    } catch (e) { console.error(e) }
  }

  const addComuna = async (comuna) => {
    try {
      await api.addComuna(comuna)
      setProfile(p => ({ ...p, comunas: [...(p.comunas || []), comuna] }))
    } catch (e) { setError(e.message) }
  }

  const removeComuna = async (comuna) => {
    try {
      await api.deleteComuna(comuna)
      setProfile(p => ({ ...p, comunas: p.comunas.filter(c => c !== comuna) }))
    } catch (e) { console.error(e) }
  }

  const addCategoria = async (categoria) => {
    try {
      await api.addCategoria(categoria)
      setProfile(p => ({ ...p, categorias: [...(p.categorias || []), categoria] }))
    } catch (e) { setError(e.message) }
  }

  const pendingCount      = jobs.length
  const reagendCount      = reagendamientos.length
  const unreadCount       = chats.filter(c => c.no_leidos > 0).length

  return (
    <AppCtx.Provider value={{
      authed, profile, jobs, chats, reagendamientos, history,
      error, setError,
      login, registro, logout,
      loadJobs, loadChats, loadPerfil, loadEstadisticas,
      acceptJob, acceptJobWithDate, rejectJob,
      confirmarReagendamiento, rechazarReagendamiento,
      sendMessage, markComplete,
      toggleAvailable, addComuna, removeComuna, addCategoria,
      pendingCount, reagendCount, unreadCount,
    }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
