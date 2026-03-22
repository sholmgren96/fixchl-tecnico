import { useNavigate, useParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api.js'

function SystemMsg({ text }) {
  return (
    <div style={{ textAlign:'center', padding:'6px 0' }}>
      <span style={{ fontSize:11, color:'var(--gray-500)', background:'var(--gray-100)', borderRadius:20, padding:'4px 12px' }}>{text}</span>
    </div>
  )
}

function MsgBubble({ msg }) {
  if (msg.origen === 'sistema') return <SystemMsg text={msg.contenido} />
  const isMe = msg.origen === 'tecnico'
  return (
    <div style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom:4 }}>
      <div style={{ maxWidth:'78%', background: isMe ? 'var(--green-800)' : 'var(--surface)', color: isMe ? '#fff' : 'var(--gray-900)', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', border: isMe ? 'none' : '1px solid var(--border)', padding:'9px 13px', fontSize:13, lineHeight:1.5 }}>
        <p>{msg.contenido}</p>
        <p style={{ fontSize:10, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--gray-500)', marginTop:3, textAlign:'right' }}>
          {new Date(msg.created_at).toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default function ChatScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { markComplete } = useApp()
  const [mensajes, setMensajes] = useState([])
  const [trabajo, setTrabajo]   = useState(null)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const trabajoId = parseInt(id)

  const loadMensajes = async () => {
    try {
      const data = await api.getMensajes(trabajoId)
      setMensajes(data.mensajes || [])
      setTrabajo(data.trabajo || null)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { loadMensajes() }, [id])

  useEffect(() => {
    const t = setInterval(loadMensajes, 5000)
    return () => clearInterval(t)
  }, [id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [mensajes])

  const handleSend = async () => {
    if (!text.trim()) return
    const contenido = text.trim()
    setText('')
    setMensajes(p => [...p, { id: Date.now(), origen:'tecnico', contenido, created_at: new Date().toISOString() }])
    try { await api.enviarMsg(trabajoId, contenido) }
    catch (e) { console.error(e) }
  }

  const handleComplete = async () => {
    await markComplete(trabajoId)
    setTrabajo(p => p ? { ...p, estado:'esperando_calificacion' } : p)
  }

  const isActive   = trabajo?.estado === 'activo'
  const isAwaiting = trabajo?.estado === 'esperando_calificacion'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh' }}>
      <div className="topbar">
        <button className="btn-back" onClick={() => navigate('/chats')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="avatar av-green" style={{ width:32, height:32, fontSize:11 }}>
          {trabajo?.cliente_nombre?.split(' ').map(n=>n[0]).join('').slice(0,2) || '?'}
        </div>
        <div>
          <p style={{ fontSize:14, fontWeight:500, fontFamily:'var(--font-display)' }}>{trabajo?.cliente_nombre || 'Cliente'}</p>
          <p style={{ fontSize:11, color:'var(--gray-500)' }}>{trabajo?.categoria} · {trabajo?.comuna}</p>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 8px', background:'var(--bg)' }}>
        {mensajes.map(msg => <MsgBubble key={msg.id} msg={msg} />)}

        {isActive && (
          <div style={{ margin:'12px 0', background:'var(--green-50)', border:'1px solid var(--green-200)', borderRadius:10, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:13, fontWeight:500, color:'var(--green-800)' }}>¿Terminaste el trabajo?</p>
              <p style={{ fontSize:11, color:'var(--green-700)', marginTop:2 }}>Esto envía la solicitud de calificación al cliente</p>
            </div>
            <button className="btn-primary" style={{ width:'auto', padding:'8px 14px', fontSize:12, flexShrink:0 }} onClick={handleComplete}>Completado</button>
          </div>
        )}

        {isAwaiting && (
          <div style={{ margin:'12px 0', background:'var(--amber-50)', border:'1px solid var(--amber-100)', borderRadius:10, padding:'12px 14px' }}>
            <p style={{ fontSize:13, fontWeight:500, color:'var(--amber-800)' }}>Calificación enviada al cliente</p>
            <p style={{ fontSize:12, color:'var(--amber-800)', opacity:0.8, marginTop:3 }}>El cliente recibirá una consulta por WhatsApp en breve.</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {isActive ? (
        <div style={{ padding:'10px 12px', background:'var(--surface)', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Escribe un mensaje..." rows={1}
            style={{ flex:1, resize:'none', border:'1px solid var(--border-md)', borderRadius:20, padding:'10px 14px', fontSize:13, fontFamily:'var(--font-body)', background:'var(--bg)', color:'var(--gray-900)', outline:'none', lineHeight:1.4 }}/>
          <button onClick={handleSend} style={{ width:38, height:38, borderRadius:'50%', background: text.trim() ? 'var(--green-800)' : 'var(--gray-300)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      ) : (
        <div style={{ padding:'10px 12px', background:'var(--surface)', borderTop:'1px solid var(--border)' }}>
          <p style={{ fontSize:12, color:'var(--gray-500)', textAlign:'center' }}>Chat cerrado · Esperando calificación del cliente</p>
        </div>
      )}
    </div>
  )
}
