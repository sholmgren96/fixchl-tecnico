import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api.js'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [authed, setAuthed]   = useState(api.hasToken())
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs]       = useState([])
  const [chats, setChats]     = useState([])
  const [history, setHistory] = useState([])
  const [error, setError]     = useState(null)

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
    try { const d = await api.getDisponibles(); setJobs(d.trabajos || []) }
    catch (e) { console.error(e) }
  }, [])

  const loadChats = useCallback(async () => {
    try { const d = await api.getChats(); setChats(d.chats || []) }
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
      setJobs(p => p.filter(j => j.id !== jobId))
      await loadChats()
      return String(jobId)
    } catch (e) { setError(e.message); return null }
  }

  const rejectJob = async (jobId) => {
    try { await api.rechazarTrabajo(jobId); setJobs(p => p.filter(j => j.id !== jobId)) }
    catch (e) { console.error(e) }
  }

  const sendMessage = async (chatId, text) => {
    try { await api.enviarMsg(chatId, text) }
    catch (e) { console.error(e) }
  }

  const markComplete = async (chatId) => {
    try {
      await api.completarTrabajo(chatId)
      setChats(p => p.map(c => c.id === chatId ? { ...c, estado: 'esperando_calificacion' } : c))
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

  const pendingCount = jobs.length
  const unreadCount  = chats.filter(c => c.no_leidos > 0).length

  return (
    <AppCtx.Provider value={{
      authed, profile, jobs, chats, history,
      error, setError,
      login, registro, logout,
      loadJobs, loadChats, loadPerfil, loadEstadisticas,
      acceptJob, rejectJob, sendMessage, markComplete,
      toggleAvailable, addComuna, removeComuna, addCategoria,
      pendingCount, unreadCount,
    }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
