import { useState, useEffect } from 'react'
import { adminApi, adminAuth } from '../../services/adminApi'
import TecnicosPendientes from './TecnicosPendientes'
import TecnicosLista from './TecnicosLista'

const NAV = [
  { id: 'pendientes', label: 'Verificación', icon: '⏳' },
  { id: 'tecnicos',   label: 'Técnicos',     icon: '👷' },
]

export default function AdminShell({ admin, onLogout }) {
  const [seccion, setSeccion]         = useState('pendientes')
  const [pendientesCount, setPendientesCount] = useState(null)

  useEffect(() => {
    adminApi.getTecnicosPendientes()
      .then(d => setPendientesCount(d.tecnicos.length))
      .catch(() => {})
  }, [seccion])

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#F3F4F6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#111827', display: 'flex', flexDirection: 'column',
        padding: '28px 0', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #1F2937' }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>TecnicosYa</p>
          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Panel Admin</p>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(item => {
            const active = seccion === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSeccion(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  marginBottom: 4,
                  background: active ? '#1F2937' : 'transparent',
                  color: active ? 'white' : '#9CA3AF',
                  fontSize: 13, fontWeight: active ? 600 : 400, textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'pendientes' && pendientesCount > 0 && (
                  <span style={{ background: '#EF4444', color: 'white', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {pendientesCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid #1F2937' }}>
          <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 10, padding: '0 4px' }}>
            {admin?.nombre || 'Admin'}
          </p>
          <button
            onClick={() => { adminAuth.clearToken(); onLogout() }}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #374151',
              background: 'transparent', color: '#9CA3AF', fontSize: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {seccion === 'pendientes' && <TecnicosPendientes />}
        {seccion === 'tecnicos'   && <TecnicosLista />}
      </main>

    </div>
  )
}
