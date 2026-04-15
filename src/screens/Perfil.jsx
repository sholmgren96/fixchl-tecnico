import { useState } from 'react'
import { useApp } from '../context/AppContext'
import HelpModal from '../components/HelpModal'

const COMUNAS_STGO = ['Providencia','Las Condes','Ñuñoa','Santiago','Macul','La Florida','Vitacura','Maipú','Pudahuel','La Reina','Peñalolén','San Miguel']
const CATEGORIAS   = ['Gasfitería','Electricidad','Pintura','Aseo','Otro']

export default function Perfil() {
  const { profile, toggleAvailable, addComuna, removeComuna, addCategoria, logout } = useApp()
  const [showAddComuna,    setShowAddComuna]    = useState(false)
  const [showAddCategoria, setShowAddCategoria] = useState(false)
  const [showHelp,         setShowHelp]         = useState(false)

  if (!profile) return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}><div className="topbar"><p className="topbar-title">Mi perfil</p></div><div className="empty-state"><p>Cargando...</p></div></div>

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <div className="topbar">
        <p className="topbar-title">Mi perfil</p>
        <div className="topbar-right">
          <button onClick={() => setShowHelp(true)} style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
        </div>
      </div>
      <div className="screen">
        <div style={{ paddingTop: 14 }}>

          <div className="card" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div className="avatar av-green" style={{ width:56, height:56, fontSize:20 }}>
              {profile.nombre?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <p style={{ fontSize:16, fontWeight:600, fontFamily:'var(--font-display)' }}>{profile.nombre}</p>
                {profile.verificado === 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--green-700)" stroke="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                )}
              </div>
              <p style={{ fontSize:13, color:'var(--gray-500)' }}>{profile.categorias?.[0]} · ★ {profile.rating?.toFixed(1) || '—'} · {profile.total_jobs || 0} trabajos</p>
            </div>
          </div>

          <p className="section-label">Disponibilidad</p>
          <div className="toggle-wrap">
            <div>
              <p style={{ fontSize:14, fontWeight:500 }}>Disponible ahora</p>
              <p style={{ fontSize:12, color:'var(--gray-500)', marginTop:2 }}>{profile.disponible ? 'Recibes solicitudes nuevas' : 'No recibes solicitudes'}</p>
            </div>
            <button className={`toggle-btn ${profile.disponible ? 'on' : 'off'}`} onClick={toggleAvailable}/>
          </div>

          <p className="section-label">Zona de cobertura</p>
          <div className="card">
            <div className="tag-row" style={{ marginBottom: 12 }}>
              {(profile.comunas || []).map(c => (
                <div key={c} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--green-50)', border:'1px solid var(--green-200)', borderRadius:20, padding:'4px 10px 4px 12px' }}>
                  <span style={{ fontSize:12, color:'var(--green-800)', fontWeight:500 }}>{c}</span>
                  <button onClick={() => removeComuna(c)} style={{ width:14, height:14, borderRadius:'50%', background:'var(--green-200)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
            {showAddComuna ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {COMUNAS_STGO.filter(c => !(profile.comunas||[]).includes(c)).map(c => (
                  <button key={c} onClick={() => { addComuna(c); setShowAddComuna(false) }}
                    style={{ padding:'4px 10px', borderRadius:20, fontSize:12, border:'1px solid var(--border-md)', cursor:'pointer', background:'var(--bg)', color:'var(--gray-700)', fontFamily:'var(--font-body)' }}>
                    {c}
                  </button>
                ))}
                <button onClick={() => setShowAddComuna(false)} style={{ padding:'4px 10px', borderRadius:20, fontSize:12, border:'1px solid var(--border-md)', cursor:'pointer', background:'var(--bg)', color:'var(--gray-500)', fontFamily:'var(--font-body)' }}>Cancelar</button>
              </div>
            ) : (
              <button className="btn-ghost" style={{ fontSize:13 }} onClick={() => setShowAddComuna(true)}>+ Agregar comuna</button>
            )}
          </div>

          <p className="section-label">Categorías de servicio</p>
          <div className="card">
            <div className="tag-row" style={{ marginBottom:12 }}>
              {(profile.categorias || []).map(c => (
                <span key={c} className="pill pill-blue" style={{ fontSize:12, padding:'4px 12px' }}>{c}</span>
              ))}
            </div>
            {showAddCategoria ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {CATEGORIAS.filter(c => !(profile.categorias||[]).includes(c)).map(c => (
                  <button key={c} onClick={() => { addCategoria(c); setShowAddCategoria(false) }}
                    style={{ padding:'4px 10px', borderRadius:20, fontSize:12, border:'1px solid var(--border-md)', cursor:'pointer', background:'var(--bg)', color:'var(--gray-700)', fontFamily:'var(--font-body)' }}>
                    {c}
                  </button>
                ))}
                <button onClick={() => setShowAddCategoria(false)} style={{ padding:'4px 10px', borderRadius:20, fontSize:12, border:'1px solid var(--border-md)', cursor:'pointer', background:'var(--bg)', color:'var(--gray-500)', fontFamily:'var(--font-body)' }}>Cancelar</button>
              </div>
            ) : (
              <button className="btn-ghost" style={{ fontSize:13 }} onClick={() => setShowAddCategoria(true)}>+ Agregar categoría</button>
            )}
          </div>

          <p className="section-label">Soporte</p>
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button
              onClick={() => setShowHelp(true)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', padding:0, width:'100%' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'var(--green-50)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div style={{ textAlign:'left' }}>
                  <p style={{ fontSize:13, fontWeight:500, color:'var(--gray-900)' }}>Centro de ayuda</p>
                  <p style={{ fontSize:11, color:'var(--gray-500)', marginTop:1 }}>Preguntas frecuentes y reportes</p>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div style={{ padding:'14px 12px 24px' }}>
            <button className="btn-ghost" style={{ color:'var(--red-600)', borderColor:'#F5B3B3' }} onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
