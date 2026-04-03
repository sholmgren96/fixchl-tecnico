import { useState } from 'react'
import { adminApi, adminAuth } from '../../services/adminApi'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError('')
    try {
      const data = await adminApi.login(email, password)
      adminAuth.saveToken(data.token)
      onLogin(data.admin)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F3F4F6', padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '36px 32px',
        width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', fontFamily: 'var(--font-display)' }}>
            TecnoYa Admin
          </p>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Panel de administración</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Email</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@tecnoya.cl"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Contraseña</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#DC2626', marginTop: 12 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: 20, width: '100%', padding: '11px 0',
            borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer',
            background: loading ? '#9CA3AF' : '#111827',
            color: 'white', fontSize: 14, fontWeight: 600,
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', borderRadius: 8, border: '1px solid #D1D5DB',
  padding: '10px 12px', fontSize: 13, background: '#F9FAFB',
  color: '#111827', outline: 'none', boxSizing: 'border-box',
}
