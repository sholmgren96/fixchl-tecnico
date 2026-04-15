import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'

const ESTADOS = ['todos', 'pendiente', 'revisado', 'resuelto']

const TIPO_LABEL = {
  no_llego:         'El técnico no llegó',
  mal_servicio:     'Problema con el trabajo',
  cancelar_trabajo: 'Cancelar trabajo activo',
  otro:             'Otra consulta o reclamo',
}

const ESTADO_STYLE = {
  pendiente: { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' },
  revisado:  { background: '#DBEAFE', color: '#1E40AF', border: '1px solid #BFDBFE' },
  resuelto:  { background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' },
}

export default function ReportesLista() {
  const [reportes,   setReportes]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [cargando,   setCargando]   = useState(true)
  const [offset,     setOffset]     = useState(0)
  const [expandido,  setExpandido]  = useState(null)
  const LIMIT = 20

  const cargar = async (est, off) => {
    setCargando(true)
    try {
      const params = { limit: LIMIT, offset: off }
      if (est !== 'todos') params.estado = est
      const d = await adminApi.getReportes(params)
      setReportes(d.reportes)
      setTotal(d.total)
    } catch (e) { console.error(e) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar(filtroEstado, offset) }, [filtroEstado, offset])

  const cambiarEstado = async (id, estado) => {
    try {
      await adminApi.updateReporteEstado(id, estado)
      setReportes(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
    } catch (e) { console.error(e) }
  }

  const formatFecha = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Reportes de clientes</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          Situaciones y consultas enviadas por clientes desde el chatbot de WhatsApp
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => { setFiltroEstado(e); setOffset(0) }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: '1px solid',
              borderColor: filtroEstado === e ? '#1D4ED8' : '#D1D5DB',
              background:  filtroEstado === e ? '#EFF6FF' : 'white',
              color:       filtroEstado === e ? '#1D4ED8' : '#6B7280',
              cursor: 'pointer',
            }}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
          {total} reporte{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Cargando...</p>
      ) : reportes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <p style={{ fontSize: 32 }}>📭</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>No hay reportes {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reportes.map(r => (
            <div
              key={r.id}
              style={{ background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}
            >
              {/* Cabecera */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setExpandido(expandido === r.id ? null : r.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {TIPO_LABEL[r.tipo] || r.tipo}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      ...ESTADO_STYLE[r.estado]
                    }}>
                      {r.estado}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280' }}>
                    <span>📱 {r.cliente_wa}</span>
                    {r.trabajo_id && <span>Trabajo #{r.trabajo_id}</span>}
                    {r.categoria  && <span>{r.categoria} · {r.comuna}</span>}
                    <span>{formatFecha(r.created_at)}</span>
                  </div>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transform: expandido === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Detalle expandible */}
              {expandido === r.id && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '14px 16px', background: '#F9FAFB' }}>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 14 }}>
                    {r.descripcion}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {r.estado !== 'revisado' && (
                      <button
                        onClick={() => cambiarEstado(r.id, 'revisado')}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Marcar revisado
                      </button>
                    )}
                    {r.estado !== 'resuelto' && (
                      <button
                        onClick={() => cambiarEstado(r.id, 'resuelto')}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #A7F3D0', background: '#D1FAE5', color: '#065F46', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Marcar resuelto
                      </button>
                    )}
                    {r.estado !== 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(r.id, 'pendiente')}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: 12, cursor: 'pointer' }}
                      >
                        Volver a pendiente
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {total > LIMIT && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button
            disabled={offset === 0}
            onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', color: offset === 0 ? '#D1D5DB' : '#374151', cursor: offset === 0 ? 'default' : 'pointer', fontSize: 13 }}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: 13, color: '#6B7280', alignSelf: 'center' }}>
            {Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
          </span>
          <button
            disabled={offset + LIMIT >= total}
            onClick={() => setOffset(o => o + LIMIT)}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', color: offset + LIMIT >= total ? '#D1D5DB' : '#374151', cursor: offset + LIMIT >= total ? 'default' : 'pointer', fontSize: 13 }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
