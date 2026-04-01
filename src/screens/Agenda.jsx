import { useState, useEffect } from 'react'
import { api } from '../services/api'

const DIAS = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
  { dia: 0, nombre: 'Domingo' },
]

const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

function generarProximas4Semanas(semana) {
  const bloques = []
  const hoy = new Date()
  for (let semanaOffset = 0; semanaOffset < 4; semanaOffset++) {
    for (const item of semana) {
      if (!item.activo) continue
      for (let diasOffset = 0; diasOffset < 7; diasOffset++) {
        const d = new Date(hoy)
        d.setDate(hoy.getDate() + semanaOffset * 7 + diasOffset + 1)
        if (d.getDay() === item.dia) {
          bloques.push({
            fecha: d.toISOString().split('T')[0],
            hora_inicio: item.hora_inicio,
            hora_fin: item.hora_fin,
          })
          break
        }
      }
    }
  }
  return bloques
}

export default function Agenda() {
  const [semana, setSemana] = useState(
    DIAS.map(d => ({ ...d, activo: false, hora_inicio: '09:00', hora_fin: '18:00' }))
  )
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [cargando, setCargando]   = useState(true)

  useEffect(() => {
    api.getDisponibilidad().then(({ slots }) => {
      if (!slots?.length) { setCargando(false); return }
      // Inferir patrón semanal desde los slots guardados
      const patron = {}
      for (const s of slots) {
        const d = new Date(s.fecha + 'T12:00:00')
        const diaSemana = d.getDay()
        if (!patron[diaSemana]) {
          patron[diaSemana] = { hora_inicio: s.hora_inicio, hora_fin: s.hora_fin }
        }
      }
      setSemana(prev => prev.map(item => ({
        ...item,
        activo: !!patron[item.dia],
        hora_inicio: patron[item.dia]?.hora_inicio || item.hora_inicio,
        hora_fin:    patron[item.dia]?.hora_fin    || item.hora_fin,
      })))
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const toggleDia = (dia) => {
    setSemana(prev => prev.map(item =>
      item.dia === dia ? { ...item, activo: !item.activo } : item
    ))
    setGuardado(false)
  }

  const updateHora = (dia, campo, valor) => {
    setSemana(prev => prev.map(item =>
      item.dia === dia ? { ...item, [campo]: valor } : item
    ))
    setGuardado(false)
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      const bloques = generarProximas4Semanas(semana)
      await api.setDisponibilidad(bloques)
      setGuardado(true)
    } catch (e) {
      console.error(e)
    } finally {
      setGuardando(false)
    }
  }

  const diasActivos = semana.filter(d => d.activo).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topbar">
        <div>
          <p className="topbar-title">Agenda</p>
          <p className="topbar-sub">
            {diasActivos > 0
              ? `${diasActivos} día${diasActivos !== 1 ? 's' : ''} activo${diasActivos !== 1 ? 's' : ''} esta semana`
              : 'Sin disponibilidad configurada'}
          </p>
        </div>
      </div>

      <div className="screen" style={{ paddingTop: 12 }}>

        <div style={{ padding: '0 12px 8px' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>
            Activa los días en que estás disponible para recibir trabajos agendados. Los clientes verán estos horarios al elegir una fecha.
          </p>
        </div>

        {cargando ? (
          <div className="empty-state"><p>Cargando disponibilidad...</p></div>
        ) : (
          <>
            {semana.map(item => (
              <div key={item.dia} className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: item.activo ? 12 : 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: item.activo ? 'var(--gray-900)' : 'var(--gray-500)' }}>
                    {item.nombre}
                  </p>
                  <button
                    className={`toggle-btn ${item.activo ? 'on' : 'off'}`}
                    onClick={() => toggleDia(item.dia)}
                  />
                </div>

                {item.activo && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Desde</p>
                      <select
                        value={item.hora_inicio}
                        onChange={e => updateHora(item.dia, 'hora_inicio', e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 8,
                          border: '1px solid var(--border-md)', fontSize: 13,
                          color: 'var(--gray-900)', background: 'var(--bg)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Hasta</p>
                      <select
                        value={item.hora_fin}
                        onChange={e => updateHora(item.dia, 'hora_fin', e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 8,
                          border: '1px solid var(--border-md)', fontSize: 13,
                          color: 'var(--gray-900)', background: 'var(--bg)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {HORAS.filter(h => h > item.hora_inicio).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ padding: '8px 12px 24px' }}>
              <button
                className="btn-primary"
                onClick={handleGuardar}
                disabled={guardando}
                style={{ opacity: guardando ? 0.7 : 1 }}
              >
                {guardando ? 'Guardando...' : guardado ? '✅ Guardado' : 'Guardar disponibilidad'}
              </button>
              {diasActivos > 0 && (
                <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
                  Se generan horarios para las próximas 4 semanas
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
