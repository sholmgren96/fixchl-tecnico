import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

function Stars({ rating }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'var(--amber-500)' : 'var(--gray-200)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export default function Rendimiento() {
  const { profile, history, loadEstadisticas } = useApp()

  useEffect(() => { loadEstadisticas() }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="topbar"><p className="topbar-title">Mi rendimiento</p></div>
      <div className="screen">

        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-num" style={{ color:'var(--amber-800)' }}>★ {profile?.rating?.toFixed(1) || '—'}</p>
            <p className="stat-lbl">Calificación</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">{profile?.total_jobs || 0}</p>
            <p className="stat-lbl">Trabajos</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">{profile?.total_reviews || 0}</p>
            <p className="stat-lbl">Reseñas</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">{profile?.disponible ? 'Sí' : 'No'}</p>
            <p className="stat-lbl">Disponible</p>
          </div>
        </div>

        <p className="section-label">Últimas reseñas</p>

        {history.length === 0 ? (
          <div className="empty-state">
            <p>Aún no tienes reseñas.<br/>Completa tu primer trabajo para recibirlas.</p>
          </div>
        ) : (
          <div className="card" style={{ paddingBottom:2 }}>
            {history.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, paddingBottom:14, borderBottom: i < history.length-1 ? '1px solid var(--border)' : 'none', marginBottom: i < history.length-1 ? 14 : 0 }}>
                <div className="avatar av-green" style={{ width:36, height:36, fontSize:12 }}>
                  {item.cliente_nombre?.split(' ').map(n=>n[0]).join('').slice(0,2) || '?'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <p style={{ fontSize:13, fontWeight:500, fontFamily:'var(--font-display)' }}>{item.cliente_nombre}</p>
                    <span style={{ fontSize:11, color:'var(--gray-500)' }}>{item.categoria} · {item.comuna}</span>
                  </div>
                  <Stars rating={item.puntaje} />
                  {item.comentario && (
                    <p style={{ fontSize:12, color:'var(--gray-600)', marginTop:5, fontStyle:'italic', lineHeight:1.45 }}>"{item.comentario}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
