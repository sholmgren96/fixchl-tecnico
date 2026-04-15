import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HelpModal from '../components/HelpModal'

function UrgencyBadge({ urgency }) {
  if (urgency === 'Hoy mismo')     return <span className="badge badge-red">{urgency}</span>
  if (urgency === 'Elegir fecha')  return <span className="badge badge-amber">Con fecha</span>
  if (urgency === 'Trabajo pendiente') return <span className="badge badge-amber">Pendiente</span>
  return <span className="badge badge-gray">{urgency}</span>
}

function formatFechaCorta(f) {
  if (!f) return ''
  const d = new Date(f + 'T12:00:00')
  const dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`
}

// ── Tarjeta de solicitud normal ───────────────────────────────────────────────
function JobCard({ job, onAccept, onAcceptWithDate, onReject }) {
  const navigate    = useNavigate()
  const tieneFechas = job.fechas_propuestas?.length > 0

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/solicitudes/${job.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>
            {job.clientName}
          </p>
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{job.commune}</p>
        </div>
        <UrgencyBadge urgency={job.urgency} />
      </div>

      <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.45, marginBottom: 10 }}>
        "{job.description.slice(0, 80)}{job.description.length > 80 ? '…' : ''}"
      </p>

      <div className="tag-row" style={{ marginBottom: 12 }}>
        <span className="pill pill-blue">{job.category}</span>
        <span className="pill">{job.commune}</span>
        {job.urgency === 'Hoy mismo' && <span className="pill pill-red">Urgente</span>}
      </div>

      {tieneFechas ? (
        <div onClick={e => e.stopPropagation()}>
          <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fechas propuestas por el cliente
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {job.fechas_propuestas.map((f, i) => (
              <button
                key={i}
                onClick={() => onAcceptWithDate(job.id, f.fecha, f.hora)}
                style={{
                  background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: 'var(--green-800)', fontWeight: 500,
                  textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span>📅 {f.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>Aceptar →</span>
              </button>
            ))}
          </div>
          <button className="btn-danger" style={{ fontSize: 12, padding: '7px 0' }} onClick={() => onReject(job.id)}>
            Rechazar solicitud
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
          <button className="btn-primary" onClick={() => onAccept(job.id)}>Aceptar</button>
          <button className="btn-danger" onClick={() => onReject(job.id)}>Rechazar</button>
        </div>
      )}
    </div>
  )
}

// ── Tarjeta de reagendamiento ────────────────────────────────────────────────
function ReagendamientoCard({ job, onConfirmar, onRechazar }) {
  const [showRazon, setShowRazon] = useState(false)
  const [razon,     setRazon]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const fechaStr = job.fecha_agendada
    ? formatFechaCorta(typeof job.fecha_agendada === 'string' ? job.fecha_agendada : job.fecha_agendada)
    : null

  const handleConfirmar = async () => {
    setLoading(true)
    await onConfirmar(job.id)
    setLoading(false)
  }

  const handleRechazar = async () => {
    setLoading(true)
    await onRechazar(job.id, razon)
    setLoading(false)
  }

  return (
    <div className="card" style={{ borderLeft: '3px solid #F59E0B' }}>
      {/* Etiqueta trabajo pendiente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '2px 8px' }}>
          🔧 Trabajo pendiente
        </span>
        {job.trabajo_padre_id && (
          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>continuación del trabajo #{job.trabajo_padre_id}</span>
        )}
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', marginBottom: 2 }}>
        {job.clientName}
      </p>
      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>{job.category} · {job.commune}</p>

      <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.45, marginBottom: 10 }}>
        "{job.description?.slice(0, 80)}{job.description?.length > 80 ? '…' : ''}"
      </p>

      {/* Fecha propuesta */}
      {fechaStr && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>📅</span>
          <div>
            <p style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>Fecha propuesta por el cliente</p>
            <p style={{ fontSize: 13, color: '#78350F' }}>{fechaStr} a las {job.hora_agendada}</p>
          </div>
        </div>
      )}

      {/* Botones o formulario de razón */}
      {!showRazon ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-primary"
            disabled={loading}
            onClick={handleConfirmar}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            ✅ Confirmar fecha
          </button>
          <button
            className="btn-danger"
            disabled={loading}
            onClick={() => setShowRazon(true)}
          >
            Rechazar
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>Motivo del rechazo (opcional):</p>
          <textarea
            value={razon}
            onChange={e => setRazon(e.target.value)}
            placeholder="Ej: Tengo otro trabajo ese día..."
            rows={2}
            style={{
              width: '100%', borderRadius: 8, border: '1px solid var(--border-md)',
              padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-body)',
              background: 'var(--bg)', resize: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-danger" disabled={loading} onClick={handleRechazar}
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Enviando...' : 'Confirmar rechazo'}
            </button>
            <button className="btn-ghost" onClick={() => { setShowRazon(false); setRazon('') }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pantalla principal ───────────────────────────────────────────────────────
export default function Solicitudes() {
  const { jobs, reagendamientos, acceptJob, acceptJobWithDate, rejectJob, confirmarReagendamiento, rechazarReagendamiento } = useApp()
  const navigate   = useNavigate()
  const [showHelp, setShowHelp] = useState(false)

  const handleAccept = async (jobId) => {
    const chatId = await acceptJob(jobId)
    if (chatId) navigate(`/chats/${chatId}`)
  }

  const handleAcceptWithDate = async (jobId, fecha, hora) => {
    const chatId = await acceptJobWithDate(jobId, fecha, hora)
    if (chatId) navigate(`/chats/${chatId}`)
  }

  const handleConfirmarReagend = async (jobId) => {
    await confirmarReagendamiento(jobId)
    navigate(`/chats/${jobId}`)
  }

  const empty = jobs.length === 0 && reagendamientos.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <div className="topbar">
        <div>
          <p className="topbar-title">Solicitudes</p>
          <p className="topbar-sub">
            {empty ? 'Sin solicitudes nuevas' : `${jobs.length + reagendamientos.length} pendiente${jobs.length + reagendamientos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="topbar-right">
          {(jobs.length + reagendamientos.length) > 0 && (
            <span className="badge badge-green">{jobs.length + reagendamientos.length} nuevas</span>
          )}
          <button onClick={() => setShowHelp(true)} style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div className="screen">
        {empty ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No hay solicitudes en tu zona ahora mismo.<br/>Activa tu disponibilidad para recibirlas.</p>
          </div>
        ) : (
          <div style={{ paddingTop: 12 }}>

            {/* Reagendamientos pendientes de confirmación */}
            {reagendamientos.length > 0 && (
              <>
                <p className="section-label">Trabajos pendientes — confirma la fecha</p>
                {reagendamientos.map(job => (
                  <ReagendamientoCard
                    key={job.id}
                    job={job}
                    onConfirmar={handleConfirmarReagend}
                    onRechazar={rechazarReagendamiento}
                  />
                ))}
              </>
            )}

            {/* Solicitudes nuevas */}
            {jobs.length > 0 && (
              <>
                {reagendamientos.length > 0 && <p className="section-label">Solicitudes nuevas</p>}
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onAccept={handleAccept}
                    onAcceptWithDate={handleAcceptWithDate}
                    onReject={rejectJob}
                  />
                ))}
              </>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
