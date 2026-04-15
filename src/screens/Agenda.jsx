import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import HelpModal from '../components/HelpModal'

const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00',
               '14:00','15:00','16:00','17:00','18:00','19:00','20:00']

const DIAS_HDR   = ['L','M','X','J','V','S','D']
const MESES_NOM  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_LARGO = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MESES_CORTO= ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fechaStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function celdas(year, month) {
  const firstDow  = new Date(year, month, 1).getDay()       // 0=Dom..6=Sáb
  const totalDias = new Date(year, month + 1, 0).getDate()
  const offset    = firstDow === 0 ? 6 : firstDow - 1       // Lun=0..Dom=6
  const grid = []
  for (let i = 0; i < offset; i++) grid.push(null)
  for (let d = 1; d <= totalDias; d++) grid.push(d)
  return grid
}

function formatLargo(f) {
  const d = new Date(f + 'T12:00:00')
  return `${DIAS_LARGO[d.getDay()]} ${d.getDate()} ${MESES_CORTO[d.getMonth()]}`
}

function esBloqueado(hora, bloqDia) {
  if (!bloqDia?.length) return null
  const h = parseInt(hora)
  const b = bloqDia.find(b => {
    const bs = parseInt(b.hora_inicio)
    const be = parseInt(b.hora_fin)
    return h >= bs && h < be
  })
  return b || null
}

export default function Agenda() {
  const hoy    = new Date()
  const hoyStr = hoy.toISOString().split('T')[0]

  const [mes,       setMes]       = useState({ y: hoy.getFullYear(), m: hoy.getMonth() })
  const [disp,      setDisp]      = useState({})   // { fecha: Set<hora> }
  const [bloq,      setBloq]      = useState({})   // { fecha: [{hora_inicio,hora_fin,categoria,cliente_nombre}] }
  const [fechaSel,  setFechaSel]  = useState(null)
  const [horasSel,  setHorasSel]  = useState(new Set())
  const [guardando, setGuardando] = useState(false)
  const [cargando,  setCargando]  = useState(true)
  const [errorMsg,  setErrorMsg]  = useState(null)
  const [showHelp,  setShowHelp]  = useState(false)

  const cargar = useCallback(async () => {
    try {
      const { slots = [], bloques_ocupados = [] } = await api.getDisponibilidad()

      const dMap = {}
      for (const s of slots) {
        const f = typeof s.fecha === 'string' ? s.fecha : s.fecha.toISOString().split('T')[0]
        if (!dMap[f]) dMap[f] = new Set()
        const hIni = parseInt(s.hora_inicio)
        const hFin = parseInt(s.hora_fin)
        for (let h = hIni; h < hFin; h++) dMap[f].add(`${String(h).padStart(2,'0')}:00`)
      }

      const bMap = {}
      for (const b of bloques_ocupados) {
        const f = b.fecha
        if (!bMap[f]) bMap[f] = []
        bMap[f].push(b)
      }

      setDisp(dMap)
      setBloq(bMap)
    } catch (e) {
      console.error(e)
      setErrorMsg('No se pudo cargar la agenda. Verifica tu conexión.')
    }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const selFecha = (f) => {
    if (f < hoyStr) return
    if (fechaSel === f) { setFechaSel(null); return }
    setFechaSel(f)
    setHorasSel(new Set(disp[f] || []))
  }

  const toggleHora = (hora) => {
    setHorasSel(prev => {
      const next = new Set(prev)
      next.has(hora) ? next.delete(hora) : next.add(hora)
      return next
    })
  }

  const guardar = async () => {
    if (!fechaSel) return
    setGuardando(true)
    setErrorMsg(null)
    try {
      await api.setDisponibilidadFecha(fechaSel, [...horasSel])
      setDisp(prev => ({ ...prev, [fechaSel]: new Set(horasSel) }))
      setFechaSel(null)
    } catch (e) {
      console.error(e)
      setErrorMsg('Error al guardar. Intenta de nuevo.')
    }
    finally { setGuardando(false) }
  }

  const navMes = (d) => {
    setFechaSel(null)
    setMes(({ y, m }) => {
      let nm = m + d, ny = y
      if (nm > 11) { nm = 0; ny++ }
      if (nm < 0)  { nm = 11; ny-- }
      return { y: ny, m: nm }
    })
  }

  const grid = celdas(mes.y, mes.m)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="topbar">
        <div>
          <p className="topbar-title">Agenda</p>
          <p className="topbar-sub">Toca una fecha para configurar horarios</p>
        </div>
        <div className="topbar-right">
          <button onClick={() => setShowHelp(true)} style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>

        {errorMsg && (
          <div style={{ margin:'8px 12px 0', padding:'10px 14px', background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'#991B1B' }}>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#991B1B', fontSize:16, lineHeight:1, padding:0 }}>×</button>
          </div>
        )}

        {/* ── Navegación de mes ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px 8px' }}>
          <button
            onClick={() => navMes(-1)}
            style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-700)" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <p style={{ fontSize:15, fontWeight:600, fontFamily:'var(--font-display)', color:'var(--gray-900)' }}>
            {MESES_NOM[mes.m]} {mes.y}
          </p>
          <button
            onClick={() => navMes(1)}
            style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-700)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* ── Cabecera días ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 8px 4px' }}>
          {DIAS_HDR.map(d => (
            <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--gray-500)', padding:'2px 0' }}>{d}</div>
          ))}
        </div>

        {/* ── Grid días ── */}
        {cargando ? (
          <div className="empty-state" style={{ paddingTop:40 }}><p>Cargando...</p></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, padding:'0 8px' }}>
            {grid.map((dia, i) => {
              if (!dia) return <div key={`e${i}`} />

              const f        = fechaStr(mes.y, mes.m, dia)
              const pasado   = f < hoyStr
              const esHoy    = f === hoyStr
              const esSel    = f === fechaSel
              const tieneD   = (disp[f]?.size || 0) > 0
              const tieneB   = (bloq[f]?.length || 0) > 0

              return (
                <button
                  key={f}
                  onClick={() => selFecha(f)}
                  disabled={pasado}
                  style={{
                    position:'relative',
                    height:50,
                    borderRadius:10,
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
                    border: esSel  ? '2px solid var(--green-800)'
                          : esHoy  ? '2px solid var(--green-200)'
                          : '2px solid transparent',
                    background: esSel    ? 'var(--green-50)'
                              : pasado   ? 'transparent'
                              : 'var(--surface)',
                    cursor: pasado ? 'default' : 'pointer',
                    opacity: pasado ? 0.3 : 1,
                    boxShadow: pasado ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                >
                  <span style={{
                    fontSize:13, lineHeight:1,
                    fontWeight: esHoy || esSel ? 700 : 400,
                    color: esSel ? 'var(--green-800)' : 'var(--gray-900)',
                  }}>
                    {dia}
                  </span>
                  {/* Indicadores */}
                  <div style={{ display:'flex', gap:3, height:6, alignItems:'center' }}>
                    {tieneD && (
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green-800)' }} />
                    )}
                    {tieneB && (
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#1558A0' }} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Leyenda ── */}
        <div style={{ display:'flex', gap:16, padding:'10px 16px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green-800)' }} />
            <span style={{ fontSize:11, color:'var(--gray-500)' }}>Disponible</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#1558A0' }} />
            <span style={{ fontSize:11, color:'var(--gray-500)' }}>Visita agendada</span>
          </div>
        </div>

        {/* ── Panel de horas ── */}
        {fechaSel && (
          <div style={{ margin:'4px 12px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:14 }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <p style={{ fontSize:14, fontWeight:600, fontFamily:'var(--font-display)', color:'var(--gray-900)' }}>
                {formatLargo(fechaSel)}
              </p>
              <button
                onClick={() => setFechaSel(null)}
                style={{ width:24, height:24, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gray-700)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <p style={{ fontSize:11, color:'var(--gray-500)', marginBottom:10 }}>
              Toca las horas en que estás disponible. Las horas con visita agendada no se pueden modificar.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:12 }}>
              {HORAS.map(hora => {
                const bloqueado  = esBloqueado(hora, bloq[fechaSel])
                const seleccionado = horasSel.has(hora)

                return (
                  <button
                    key={hora}
                    onClick={() => !bloqueado && toggleHora(hora)}
                    title={bloqueado ? `Visita: ${bloqueado.categoria || ''}` : ''}
                    style={{
                      padding:'9px 2px',
                      borderRadius:8,
                      border:`1.5px solid ${
                        bloqueado    ? '#B3D4F5'
                        : seleccionado ? 'var(--green-800)'
                        : 'var(--border-md)'
                      }`,
                      background: bloqueado    ? '#EBF3FD'
                                : seleccionado ? 'var(--green-50)'
                                : 'white',
                      color: bloqueado    ? '#1558A0'
                           : seleccionado ? 'var(--green-800)'
                           : 'var(--gray-700)',
                      fontSize:12,
                      fontWeight: seleccionado || bloqueado ? 600 : 400,
                      cursor: bloqueado ? 'not-allowed' : 'pointer',
                      textAlign:'center',
                      lineHeight:1.2,
                    }}
                  >
                    <div>{hora}</div>
                    {bloqueado && (
                      <div style={{ fontSize:8, marginTop:2, opacity:0.8 }}>Visita</div>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              className="btn-primary"
              onClick={guardar}
              disabled={guardando}
              style={{ opacity: guardando ? 0.7 : 1 }}
            >
              {guardando
                ? 'Guardando...'
                : horasSel.size === 0
                  ? 'Guardar (sin horas = no disponible)'
                  : `Guardar — ${horasSel.size} hora${horasSel.size !== 1 ? 's' : ''}`
              }
            </button>

          </div>
        )}

      </div>
    </div>
  )
}
