const BASE = 'https://fixchl-backend-production-bda3.up.railway.app/api'

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
  getPerfil:       () => request('GET',   '/tecnico/perfil'),
  setDisponible:   (v) => request('PATCH', '/tecnico/disponible', { disponible: v }),
  addComuna:       (c) => request('POST',  '/tecnico/comunas', { comuna: c }),
  deleteComuna:    (c) => request('DELETE',`/tecnico/comunas/${encodeURIComponent(c)}`),
  addCategoria:    (c) => request('POST',  '/tecnico/categorias', { categoria: c }),
  deleteCategoria: (c) => request('DELETE',`/tecnico/categorias/${encodeURIComponent(c)}`),
  getEstadisticas: () => request('GET',   '/tecnico/rendimiento'),

  // Trabajos
  getTrabajos:       ()              => request('GET',  '/trabajos'),
  aceptarTrabajo:    (id)            => request('POST', `/trabajos/${id}/aceptar`),
  aceptarConFecha:   (id, fecha, hora) => request('POST', `/trabajos/${id}/aceptar`, { fecha, hora }),
  rechazarTrabajo:   (id)            => request('POST', `/trabajos/${id}/rechazar`),
  completarTrabajo:  (id)            => request('POST', `/trabajos/${id}/completar`),

  // Chat
  getChats:    () => request('GET', '/chat/resumen'),
  getMensajes: (id) => request('GET', `/chat/${id}/mensajes`),
  enviarMsg:   (id, contenido) => request('POST', `/chat/${id}/mensajes`, { contenido }),

  // Disponibilidad
  getDisponibilidad:     ()             => request('GET',  '/disponibilidad'),
  setDisponibilidad:     (bloques)      => request('POST', '/disponibilidad', { bloques }),
  setDisponibilidadFecha:(fecha, horas) => request('POST', '/disponibilidad/fecha', { fecha, horas }),

  // Utils
  saveToken:  (token) => localStorage.setItem('fixchl_token', token),
  clearToken: ()      => localStorage.removeItem('fixchl_token'),
  hasToken:   ()      => !!localStorage.getItem('fixchl_token'),
}
