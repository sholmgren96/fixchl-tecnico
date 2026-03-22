import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ITEMS = [
  {
    path: '/solicitudes',
    label: 'Solicitudes',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    path: '/chats',
    label: 'Chats',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    path: '/rendimiento',
    label: 'Rendimiento',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pendingCount, unreadCount } = useApp()

  const badges = {
    '/solicitudes': pendingCount,
    '/chats': unreadCount,
  }

  return (
    <div className="nav-bar">
      {ITEMS.map(item => {
        const active = location.pathname.startsWith(item.path)
        const badge = badges[item.path]
        return (
          <button
            key={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div style={{ position: 'relative' }}>
              {item.icon}
              {badge > 0 && (
                <span className="nav-badge">{badge}</span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
