const BASE = 'https://fixchl-backend-production-bda3.up.railway.app/api/admin'

const TOKEN_KEY = 'tecnoYa_admin_token'

export const adminAuth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  saveToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  hasToken: () => !!localStorage.getItem(TOKEN_KEY),
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAuth.getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error del servidor')
  return data
}

export const adminApi = {
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d }),

  getTecnicosPendientes: () => request('GET', '/tecnicos/pendientes'),
  getTodosLosTecnicos:   () => request('GET', '/tecnicos'),
  getCedula:    (id)         => request('GET', `/tecnicos/${id}/cedula`),
  aprobar:      (id)         => request('POST', `/tecnicos/${id}/aprobar`),
  rechazar:     (id, razon)  => request('POST', `/tecnicos/${id}/rechazar`, { razon }),
  suspender:    (id)         => request('POST', `/tecnicos/${id}/suspender`),
  reactivar:    (id)         => request('POST', `/tecnicos/${id}/reactivar`),

  getStats: () => request('GET', '/stats'),
  getTrabajos: (params = {}) => {
    const q = new URLSearchParams()
    if (params.estado)    q.set('estado',    params.estado)
    if (params.categoria) q.set('categoria', params.categoria)
    if (params.desde)     q.set('desde',     params.desde)
    if (params.hasta)     q.set('hasta',     params.hasta)
    if (params.limit)     q.set('limit',     params.limit)
    if (params.offset)    q.set('offset',    params.offset)
    const qs = q.toString()
    return request('GET', `/trabajos${qs ? '?' + qs : ''}`)
  },
  getTrabajoDetalle: (id) => request('GET', `/trabajos/${id}`),

  getReportes: (params = {}) => {
    const q = new URLSearchParams()
    if (params.estado) q.set('estado', params.estado)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.offset) q.set('offset', params.offset)
    const qs = q.toString()
    return request('GET', `/reportes${qs ? '?' + qs : ''}`)
  },
  updateReporteEstado: (id, estado) => request('PATCH', `/reportes/${id}/estado`, { estado }),
}
