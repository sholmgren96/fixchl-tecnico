import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'

const ESTADOS = ['todos', 'activo', 'pendiente', 'rechazado', 'suspendido']

export default function TecnicosLista() {
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast]       = useState('')

  const cargar = async () => {
    try {
      const data = await adminApi.getTodosLosTecnicos()
      setTecnicos(data.tecnicos)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const accion = async (fn, msg) => {
    await fn()
    cargar()
    showToast(msg)
  }

  const visible = tecnicos.filter(t => {
    const matchFiltro = filtro === 'todos' || t.estado === filtro
    const q = busqueda.toLowerCase()
    const matchBusqueda = !q || t.nombre.toLowerCase().includes(q) || t.rut.includes(q) || t.telefono.includes(q)
    return matchFiltro && matchBusqueda
  })

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Cargando...</div>

  return (
    <div style={s.page}>
      {toast && <Toast msg={toast} />}

      <div style={s.header}>
        <div>
          <p style={s.title}>Técnicos</p>
          <p style={s.subtitle}>{tecnicos.length} técnico{tecnicos.length !== 1 ? 's' : ''} en total</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, RUT o teléfono..."
          style={s.searchInput}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltro(e)}
              style={{ ...s.filterBtn, background: filtro === e ? '#111827' : 'white', color: filtro === e ? 'white' : '#374151' }}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Nombre', 'RUT', 'Teléfono', 'Estado', 'Rating', 'Registrado', 'Acciones'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Sin resultados</td></tr>
            ) : visible.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={s.td}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{t.nombre}</p>
                </td>
                <td style={{ ...s.td, fontSize: 12, color: '#6B7280' }}>{t.rut}</td>
                <td style={{ ...s.td, fontSize: 12, color: '#6B7280' }}>{t.telefono}</td>
                <td style={s.td}>
                  <span style={s.estadoBadge(t.estado)}>
                    {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                  </span>
                </td>
                <td style={{ ...s.td, fontSize: 13, color: '#374151' }}>
                  {t.rating > 0 ? `★ ${Number(t.rating).toFixed(1)}` : '—'}
                </td>
                <td style={{ ...s.td, fontSize: 12, color: '#9CA3AF' }}>
                  {new Date(t.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.estado === 'activo' && (
                      <button style={s.btnSm('#DC2626')} onClick={() => accion(() => adminApi.suspender(t.id), `${t.nombre} suspendido`)}>
                        Suspender
                      </button>
                    )}
                    {t.estado === 'suspendido' && (
                      <button style={s.btnSm('#059669')} onClick={() => accion(() => adminApi.reactivar(t.id), `${t.nombre} reactivado`)}>
                        Reactivar
                      </button>
                    )}
                    {t.estado === 'pendiente' && (
                      <>
                        <button style={s.btnSm('#059669')} onClick={() => accion(() => adminApi.aprobar(t.id), `${t.nombre} aprobado`)}>
                          Aprobar
                        </button>
                        <button style={s.btnSm('#DC2626')} onClick={() => accion(() => adminApi.rechazar(t.id, ''), `${t.nombre} rechazado`)}>
                          Rechazar
                        </button>
                      </>
                    )}
                    {t.estado === 'rechazado' && (
                      <button style={s.btnSm('#6B7280')} onClick={() => accion(() => adminApi.reactivar(t.id), `${t.nombre} reactivado`)}>
                        Reactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Toast({ msg }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 2000, whiteSpace: 'nowrap' }}>
      {msg}
    </div>
  )
}

const s = {
  page:       { padding: '28px 32px', maxWidth: 1100, margin: '0 auto' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:      { fontSize: 20, fontWeight: 700, color: '#111827' },
  subtitle:   { fontSize: 13, color: '#6B7280', marginTop: 3 },
  searchInput:{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, background: 'white', color: '#111827', outline: 'none', minWidth: 260 },
  filterBtn:  { padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  th:         { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td:         { padding: '13px 16px', verticalAlign: 'middle' },
  btnSm:      (color) => ({ padding: '5px 12px', borderRadius: 6, border: 'none', background: color, color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }),
  estadoBadge: (estado) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: estado === 'activo' ? '#D1FAE5' : estado === 'pendiente' ? '#FEF3C7' : estado === 'suspendido' ? '#FEE2E2' : '#F3F4F6',
    color: estado === 'activo' ? '#065F46' : estado === 'pendiente' ? '#92400E' : estado === 'suspendido' ? '#991B1B' : '#6B7280',
  }),
}
