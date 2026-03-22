const BASE = 'https://fixchl-backend-production.up.railway.app/api'

function getToken() {
  return localStorage.getItem('fixchl_token')
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error del servidor')
  return data
}

export const api = {
  // Auth
  login:    (telefono, password) => request('POST', '/auth/login', { telefono, password }),
  registro: (datos) => request('POST', '/auth/registro', datos),

  // Perfil
  getPerfil:          () => request('GET',   '/tecnico/perfil'),
  setDisponible:      (v) => request('PATCH', '/tecnico/disponible', { disponible: v }),
  addComuna:          (c) => request('POST',  '/tecnico/comunas', { comuna: c }),
  deleteComuna:       (c) => request('DELETE',`/tecnico/comunas/${encodeURIComponent(c)}`),
  addCategoria:       (c) => request('POST',  '/tecnico/categorias', { categoria: c }),
  deleteCategoria:    (c) => request('DELETE',`/tecnico/categorias/${encodeURIComponent(c)}`),
  getEstadisticas:    () => request('GET',   '/tecnico/estadisticas'),

  // Trabajos
  getDisponibles: () => request('GET', '/trabajos/disponibles'),
  getMisTrabajos: () => request('GET', '/trabajos/mis-trabajos'),
  aceptarTrabajo: (id) => request('POST', `/trabajos/${id}/aceptar`),
  rechazarTrabajo:(id) => request('POST', `/trabajos/${id}/rechazar`),
  completarTrabajo:(id)=> request('POST', `/trabajos/${id}/completar`),

  // Chat
  getChats:    () => request('GET', '/chat'),
  getMensajes: (id) => request('GET', `/chat/${id}/mensajes`),
  enviarMsg:   (id, contenido) => request('POST', `/chat/${id}/enviar`, { contenido }),

  // Utils
  saveToken: (token) => localStorage.setItem('fixchl_token', token),
  clearToken: () => localStorage.removeItem('fixchl_token'),
  hasToken: () => !!localStorage.getItem('fixchl_token'),
}
