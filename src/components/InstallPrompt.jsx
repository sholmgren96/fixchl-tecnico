import { useState, useEffect } from 'react'

const STORAGE_KEY = 'tecnicosya_install_dismissed'

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showAndroid, setShowAndroid]       = useState(false)
  const [showIOS, setShowIOS]               = useState(false)

  useEffect(() => {
    // No mostrar si ya está instalada o fue descartada antes
    if (isInStandaloneMode()) return
    if (localStorage.getItem(STORAGE_KEY)) return

    if (isIOS()) {
      // iOS: mostrar instrucciones manuales
      setShowIOS(true)
      return
    }

    // Android/Chrome: esperar el evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowAndroid(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowAndroid(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShowAndroid(false)
    setShowIOS(false)
  }

  if (!showAndroid && !showIOS) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 72,           // encima del NavBar (56px) + margen
      left: 12,
      right: 12,
      zIndex: 999,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      border: '1px solid var(--border-sm)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      {/* Ícono */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
        background: '#FE8315', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 2 }}>
          Instalar TecnicosYa
        </p>
        {showAndroid && (
          <>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.4, marginBottom: 10 }}>
              Agrega la app a tu pantalla de inicio para acceso rápido sin el navegador.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleInstall}
                style={{
                  background: '#FE8315', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none', color: 'var(--gray-500)', border: 'none',
                  borderRadius: 8, padding: '7px 14px', fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Ahora no
              </button>
            </div>
          </>
        )}
        {showIOS && (
          <>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 4 }}>
              Para instalar en iPhone:{' '}
              <strong style={{ color: 'var(--gray-700)' }}>toca</strong>{' '}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                background: 'var(--gray-100)', borderRadius: 4, padding: '1px 5px',
                fontSize: 11,
              }}>
                {/* ícono share de iOS */}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Compartir
              </span>{' '}
              y luego{' '}
              <strong style={{ color: 'var(--gray-700)' }}>"Añadir a pantalla de inicio"</strong>.
            </p>
            <button
              onClick={handleDismiss}
              style={{
                background: 'none', color: 'var(--gray-400)', border: 'none',
                padding: 0, fontSize: 12, cursor: 'pointer', marginTop: 4,
              }}
            >
              No mostrar de nuevo
            </button>
          </>
        )}
      </div>

      {/* X para cerrar */}
      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          color: 'var(--gray-400)', flexShrink: 0, lineHeight: 1,
        }}
        aria-label="Cerrar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
