import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function UrgencyBadge({ urgency }) {
  if (urgency === 'Hoy mismo') return <span className="badge badge-red">{urgency}</span>
  if (urgency === 'Elegir fecha') return <span className="badge badge-amber">Con fecha</span>
  return <span className="badge badge-gray">{urgency}</span>
}

function JobCard({ job, onAccept, onAcceptWithDate, onReject }) {
  const navigate = useNavigate()
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
                  background: 'var(--green-50)',
                  border: '1px solid var(--green-200)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  color: 'var(--green-800)',
                  fontWeight: 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
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

export default function Solicitudes() {
  const { jobs, acceptJob, acceptJobWithDate, rejectJob } = useApp()
  const navigate = useNavigate()

  const handleAccept = async (jobId) => {
    const chatId = await acceptJob(jobId)
    if (chatId) navigate(`/chats/${chatId}`)
  }

  const handleAcceptWithDate = async (jobId, fecha, hora) => {
    const chatId = await acceptJobWithDate(jobId, fecha, hora)
    if (chatId) navigate(`/chats/${chatId}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topbar">
        <div>
          <p className="topbar-title">Solicitudes</p>
          <p className="topbar-sub">{jobs.length > 0 ? `${jobs.length} nuevas en tu zona` : 'Sin solicitudes nuevas'}</p>
        </div>
        <div className="topbar-right">
          {jobs.length > 0 && <span className="badge badge-green">{jobs.length} nuevas</span>}
        </div>
      </div>

      <div className="screen">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No hay solicitudes en tu zona ahora mismo.<br/>Activa tu disponibilidad para recibirlas.</p>
          </div>
        ) : (
          <div style={{ paddingTop: 12 }}>
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onAccept={handleAccept}
                onAcceptWithDate={handleAcceptWithDate}
                onReject={rejectJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
