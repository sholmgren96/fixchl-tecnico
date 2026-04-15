import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HelpModal from '../components/HelpModal'

function ChatItem({ chat }) {
  const navigate = useNavigate()
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: chat.unread ? 'var(--green-50)' : 'transparent' }}
      onClick={() => navigate(`/chats/${chat.id}`)}
    >
      <div className={`avatar ${chat.avatarClass}`}>{chat.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--gray-900)' }}>{chat.clientName}</p>
          <span style={{ fontSize: 11, color: 'var(--gray-500)', flexShrink: 0 }}>{chat.lastTime}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: chat.status === 'awaiting_review' ? 'var(--amber-800)' : 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
            {chat.status === 'awaiting_review' ? 'Esperando calificación...' : chat.lastMsg}
          </p>
          {chat.unread && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--green-700)', flexShrink: 0 }} />}
        </div>
        <div style={{ marginTop: 4 }}>
          <span className="pill" style={{ fontSize: 10, padding: '1px 7px' }}>{chat.category} · {chat.commune}</span>
        </div>
      </div>
    </div>
  )
}

export default function Chats() {
  const { chats } = useApp()
  const [showHelp, setShowHelp] = useState(false)
  const active = chats.filter(c => c.status === 'active')
  const awaiting = chats.filter(c => c.status === 'awaiting_review')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <div className="topbar">
        <div>
          <p className="topbar-title">Conversaciones</p>
          <p className="topbar-sub">{active.length} activa{active.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="topbar-right">
          <button onClick={() => setShowHelp(true)} style={{ width:32, height:32, borderRadius:'50%', background:'var(--gray-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div className="screen">
        {active.length === 0 && awaiting.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Sin conversaciones activas.<br/>Acepta una solicitud para comenzar.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)' }}>
            {active.length > 0 && (
              <>
                <p className="section-label">Activas</p>
                {active.map(c => <ChatItem key={c.id} chat={c} />)}
              </>
            )}
            {awaiting.length > 0 && (
              <>
                <p className="section-label">Esperando calificación</p>
                {awaiting.map(c => <ChatItem key={c.id} chat={c} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
