import { useApp } from '../context/AppContext'

export default function PendienteVerificacion() {
  const { profile, logout } = useApp()
  const rechazado = profile?.estado === 'rechazado'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', padding: '32px 24px', textAlign: 'center', background: 'var(--bg)' }}>

      <div style={{ fontSize: 52, marginBottom: 20 }}>
        {rechazado ? '❌' : '⏳'}
      </div>

      <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', marginBottom: 10 }}>
        {rechazado ? 'Cuenta rechazada' : 'Verificación pendiente'}
      </p>

      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, maxWidth: 320, marginBottom: rechazado ? 16 : 32 }}>
        {rechazado
          ? 'Tu cuenta no pudo ser verificada. Si crees que es un error, contacta al equipo de TecnicosYa.'
          : 'Estamos revisando tu cédula de identidad. Recibirás acceso a la app en un plazo de 24 horas hábiles.'}
      </p>

      {rechazado && profile?.razon_rechazo && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 16px', marginBottom: 24, maxWidth: 320 }}>
          <p style={{ fontSize: 12, color: '#991B1B', fontWeight: 600, marginBottom: 2 }}>Motivo:</p>
          <p style={{ fontSize: 13, color: '#7F1D1D' }}>{profile.razon_rechazo}</p>
        </div>
      )}

      <button onClick={logout} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border-md)', background: 'transparent', color: 'var(--gray-700)', fontSize: 13, cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  )
}
