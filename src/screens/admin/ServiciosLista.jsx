import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/adminApi'

const ESTADOS = ['', 'buscando', 'activo', 'esperando_calificacion', 'completado', 'cancelado']
const CATEGORIAS = ['', 'Electricista', 'Gasfiter', 'Servicio de aseo', 'Pintor', 'Maestro general', 'Otro']

const ESTADO_BADGE = {
  buscando:               { bg: '#FEF3C7', color: '#92400E', label: 'Buscando' },
  activo:                 { bg: '#D1FAE5', color: '#065F46', label: 'Activo' },
  esperando_calificacion: { bg: '#DBEAFE', color: '#1E40AF', label: 'Por calificar' },
  completado:             { bg: '#F3F4F6', color: '#374151', label: 'Completado' },
  cancelado:              { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelado' },
}

function Badge({ estado }) {
  const s = ESTADO_BADGE[estado] || { bg: '#F3F4F6', color: '#374151', label: estado }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

function fmtFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export default function ServiciosLista() {
  const [trabajos, setTrabajos]             = useState([])
  const [total, setTotal]                   = useState(0)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [offset, setOffset]                 = useState(0)
  const [filtros, setFiltros]               = useState({ estado: '', categoria: '', desde: '', hasta: '' })
  const [detalle, setDetalle]               = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  const LIMIT = 25

  const cargar = useCallback((newOffset, f) => {
    setLoading(true)
    setError(null)
    adminApi.getTrabajos({ ...f, limit: LIMIT, offset: newOffset })
      .then(d => { setTrabajos(d.trabajos); setTotal(d.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar(0, filtros) }, [])

  function aplicarFiltros() {
    setOffset(0)
    cargar(0, filtros)
  }

  function limpiarFiltros() {
    const vacios = { estado: '', categoria: '', desde: '', hasta: '' }
    setFiltros(vacios)
    setOffset(0)
    cargar(0, vacios)
  }

  function verDetalle(id) {
    setLoadingDetalle(true)
    setDetalle({})   // open modal immediately (shows loading)
    adminApi.getTrabajoDetalle(id)
      .then(setDetalle)
      .catch(e => { alert(e.message); setDetalle(null) })
      .finally(() => setLoadingDetalle(false))
  }

  function paginar(dir) {
    const nuevo = offset + dir * LIMIT
    setOffset(nuevo)
    cargar(nuevo, filtros)
  }

  const inputStyle = {
    padding: '7px 10px', borderRadius: 8, border: '1px solid #E5E7EB',
    fontSize: 13, background: 'white', color: '#111827', outline: 'none',
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>Servicios</h1>

      {/* Filtros */}
      <div style={{
        background: 'white', borderRadius: 12, padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Estado</label>
          <select value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))} style={inputStyle}>
            {ESTADOS.map(e => <option key={e} value={e}>{e || 'Todos'}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Categoría</label>
          <select value={filtros.categoria} onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))} style={inputStyle}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c || 'Todas'}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Desde</label>
          <input type="date" value={filtros.desde} onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Hasta</label>
          <input type="date" value={filtros.hasta} onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} style={inputStyle} />
        </div>
        <button onClick={aplicarFiltros} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#FE8315', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Filtrar
        </button>
        <button onClick={limpiarFiltros} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer' }}>
          Limpiar
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
          {total} resultado{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#EF4444', fontSize: 14 }}>{error}</div>
        ) : trabajos.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Sin resultados</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6', background: '#F9FAFB' }}>
                {['ID', 'Categoría', 'Cliente', 'Técnico', 'Comuna', 'Estado', 'Fecha', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#374151', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trabajos.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 ? '#FAFAFA' : 'white' }}>
                  <td style={{ padding: '10px 14px', color: '#9CA3AF', fontSize: 11 }}>#{t.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{t.categoria}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', fontSize: 12 }}>{t.cliente_wa}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{t.tecnico_nombre || <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{t.comuna || '—'}</td>
                  <td style={{ padding: '10px 14px' }}><Badge estado={t.estado} /></td>
                  <td style={{ padding: '10px 14px', color: '#6B7280', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtFecha(t.created_at)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => verDetalle(t.id)}
                      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        {!loading && total > LIMIT && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #F3F4F6' }}>
            <button
              onClick={() => paginar(-1)} disabled={offset === 0}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: offset === 0 ? '#F9FAFB' : 'white', color: offset === 0 ? '#D1D5DB' : '#374151', fontSize: 13, cursor: offset === 0 ? 'default' : 'pointer' }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {offset + 1}–{Math.min(offset + LIMIT, total)} de {total}
            </span>
            <button
              onClick={() => paginar(1)} disabled={offset + LIMIT >= total}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: offset + LIMIT >= total ? '#F9FAFB' : 'white', color: offset + LIMIT >= total ? '#D1D5DB' : '#374151', fontSize: 13, cursor: offset + LIMIT >= total ? 'default' : 'pointer' }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal detalle — getTrabajoConMensajes returns flat object: { id, categoria, ..., mensajes, calificacion } */}
      {detalle !== null && (
        <div
          onClick={() => !loadingDetalle && setDetalle(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '85dvh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            {loadingDetalle ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Cargando conversación…</div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 4 }}>
                      Trabajo #{detalle.id} — {detalle.categoria}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge estado={detalle.estado} />
                      {detalle.comuna && <span style={{ fontSize: 11, color: '#6B7280' }}>{detalle.comuna}</span>}
                      <span style={{ fontSize: 11, color: '#6B7280' }}>Cliente: {detalle.cliente_wa}</span>
                    </div>
                  </div>
                  <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280', lineHeight: 1 }}>×</button>
                </div>

                {/* Descripción */}
                {detalle.descripcion && (
                  <div style={{ padding: '12px 24px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>DESCRIPCIÓN</p>
                    <p style={{ fontSize: 13, color: '#374151' }}>{detalle.descripcion}</p>
                  </div>
                )}

                {/* Info secundaria */}
                <div style={{ padding: '10px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {detalle.tecnico_nombre && (
                    <div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>TÉCNICO</p>
                      <p style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{detalle.tecnico_nombre}</p>
                    </div>
                  )}
                  {detalle.urgencia && (
                    <div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>URGENCIA</p>
                      <p style={{ fontSize: 13, color: '#111827' }}>{detalle.urgencia}</p>
                    </div>
                  )}
                  {detalle.calificacion?.puntaje && (
                    <div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>CALIFICACIÓN</p>
                      <p style={{ fontSize: 13, color: '#FE8315', fontWeight: 700 }}>{detalle.calificacion.puntaje}★</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>CREADO</p>
                    <p style={{ fontSize: 13, color: '#374151' }}>{fmtFecha(detalle.created_at)} {fmtHora(detalle.created_at)}</p>
                  </div>
                </div>

                {/* Mensajes */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>CONVERSACIÓN ({detalle.mensajes?.length ?? 0} mensajes)</p>
                  {detalle.mensajes?.length === 0 && (
                    <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Sin mensajes</p>
                  )}
                  {(detalle.mensajes || []).map(m => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.origen === 'tecnico' ? 'flex-end' : m.origen === 'sistema' ? 'center' : 'flex-start',
                        maxWidth: m.origen === 'sistema' ? '90%' : '75%',
                        background: m.origen === 'tecnico' ? '#FE8315' : m.origen === 'sistema' ? '#F3F4F6' : '#EFF6FF',
                        color: m.origen === 'tecnico' ? 'white' : '#111827',
                        padding: '8px 12px', borderRadius: 12,
                        fontSize: 13, lineHeight: 1.4,
                      }}
                    >
                      {m.origen === 'sistema' && (
                        <p style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 2 }}>SISTEMA</p>
                      )}
                      <p>{m.contenido}</p>
                      <p style={{ fontSize: 10, opacity: 0.6, marginTop: 3 }}>
                        {fmtHora(m.created_at)} {fmtFecha(m.created_at)}
                        {' · '}{m.origen}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
