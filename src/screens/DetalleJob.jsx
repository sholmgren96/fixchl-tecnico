import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function DetalleJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobs, acceptJob, acceptJobWithDate, rejectJob } = useApp()
  const job = jobs.find(j => j.id === id)

  if (!job) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="topbar">
          <button className="btn-back" onClick={() => navigate('/solicitudes')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Volver
          </button>
        </div>
        <div className="empty-state"><p>Esta solicitud ya no está disponible.</p></div>
      </div>
    )
  }

  const tieneFechas = job.fechas_propuestas?.length > 0

  const handleAccept = async () => {
    const chatId = await acceptJob(job.id)
    if (chatId) navigate(`/chats/${chatId}`)
  }

  const handleAcceptWithDate = async (fecha, hora) => {
    const chatId = await acceptJobWithDate(job.id, fecha, hora)
    if (chatId) navigate(`/chats/${chatId}`)
  }

  const handleReject = () => {
    rejectJob(job.id)
    navigate('/solicitudes')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topbar">
        <button className="btn-back" onClick={() => navigate('/solicitudes')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Volver
        </button>
        <div className="topbar-right">
          {job.urgency === 'Hoy mismo'
            ? <span className="badge badge-red">{job.urgency}</span>
            : job.urgency === 'Elegir fecha'
              ? <span className="badge badge-amber">Con fecha</span>
              : <span className="badge badge-gray">{job.urgency}</span>
          }
        </div>
      </div>

      <div className="screen">
        <div style={{ paddingTop: 14 }}>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div className={`avatar ${job.avatarClass}`} style={{ width: 46, height: 46, fontSize: 15 }}>
                {job.initials}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-display)' }}>{job.clientName}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{job.commune}</p>
              </div>
            </div>

            <div className="divider" />

            <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
              Descripción del problema
            </p>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.55, background: 'var(--bg)', borderRadius: 8, padding: '10px 12px' }}>
              "{job.description}"
            </p>

            <div className="divider" />

            <div className="tag-row">
              <span className="pill pill-blue">{job.category}</span>
              <span className="pill">{job.urgency}</span>
            </div>
          </div>

          {tieneFechas ? (
            <div style={{ padding: '0 12px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 8 }}>
                📅 El cliente propone estas fechas — elige la que mejor te quede:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {job.fechas_propuestas.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleAcceptWithDate(f.fecha, f.hora)}
                    style={{
                      background: 'var(--green-50)',
                      border: '1px solid var(--green-200)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      fontSize: 14,
                      color: 'var(--green-800)',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{ fontSize: 12, background: 'var(--green-800)', color: '#fff', borderRadius: 6, padding: '3px 10px' }}>
                      Aceptar
                    </span>
                  </button>
                ))}
              </div>
              <button className="btn-danger" onClick={handleReject}>Rechazar solicitud</button>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
                Al aceptar, quedas conectado con el cliente vía chat.
              </p>
            </div>
          ) : (
            <div style={{ padding: '0 12px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button className="btn-primary" onClick={handleAccept}>Aceptar trabajo</button>
                <button className="btn-danger" onClick={handleReject}>Rechazar</button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', lineHeight: 1.5 }}>
                Al aceptar, quedas conectado con el cliente vía chat. El cliente no verá tu número.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
