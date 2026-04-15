import { useState } from 'react'
import { api } from '../services/api'

const FAQ = [
  {
    id: 'aceptar',
    pregunta: '¿Cómo acepto un trabajo?',
    respuesta: 'En la sección Solicitudes verás los trabajos disponibles en tus comunas. Toca "Aceptar" en la tarjeta del trabajo. Si el cliente propuso fechas, elige la que más te acomode. Una vez aceptado, aparecerá en tu sección de Chats.',
  },
  {
    id: 'agenda',
    pregunta: '¿Cómo configuro mi disponibilidad?',
    respuesta: 'En la sección Agenda, toca cualquier día futuro para activar las horas en que estás disponible. Puedes marcar o desmarcar hora por hora. Guarda los cambios con el botón verde. Los clientes solo podrán agendar en los horarios que actives.',
  },
  {
    id: 'calificaciones',
    pregunta: '¿Cómo funciona el sistema de calificaciones?',
    respuesta: 'Al marcar un trabajo como "Completado", el cliente recibe una solicitud de calificación por WhatsApp (1 a 5 estrellas). Tu rating es el promedio de todas tus calificaciones y es visible para los clientes al elegir técnico. Lo puedes revisar en la sección Rendimiento.',
  },
  {
    id: 'activacion',
    pregunta: '¿Cuándo me activan la cuenta?',
    respuesta: 'Un administrador revisa manualmente la foto de cédula que enviaste al registrarte. El proceso toma entre 1 y 2 días hábiles. Recibirás una notificación por WhatsApp al número registrado cuando tu cuenta esté activa.',
  },
  {
    id: 'no_asistir',
    pregunta: '¿Qué pasa si no puedo ir a un trabajo que acepté?',
    respuesta: 'Avisa al cliente lo antes posible por el chat del trabajo. Luego usa el botón "Reportar un problema" en esta sección para notificar al equipo de TecnicosYa. Cancelaciones frecuentes pueden afectar tu cuenta.',
  },
]

const TIPOS_REPORTE = [
  { id: 'problema_cliente',  label: 'Problema con un cliente' },
  { id: 'no_puedo_asistir',  label: 'No puedo ir a un trabajo aceptado' },
  { id: 'error_app',         label: 'Error en la aplicación' },
  { id: 'otro',              label: 'Otra consulta o reclamo' },
]

export default function HelpModal({ onClose }) {
  const [expandido,    setExpandido]    = useState(null)
  const [vistaReporte, setVistaReporte] = useState(false)
  const [tipo,         setTipo]         = useState('')
  const [descripcion,  setDescripcion]  = useState('')
  const [enviando,     setEnviando]     = useState(false)
  const [enviado,      setEnviado]      = useState(false)
  const [error,        setError]        = useState('')

  const enviar = async () => {
    if (!tipo)                  { setError('Selecciona el tipo de problema'); return }
    if (descripcion.length < 5) { setError('Describe un poco más la situación'); return }
    setEnviando(true); setError('')
    try {
      await api.enviarReporte(tipo, descripcion)
      setEnviado(true)
    } catch (e) { setError(e.message) }
    finally { setEnviando(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '85dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {vistaReporte && !enviado && (
              <button onClick={() => { setVistaReporte(false); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: 0, display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>
              {enviado ? '¡Reporte enviado!' : vistaReporte ? 'Reportar un problema' : 'Centro de ayuda'}
            </p>
          </div>
          <button onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>

          {/* ── Vista: reporte enviado ── */}
          {enviado && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 8 }}>Tu reporte fue enviado</p>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
                El equipo de TecnicosYa lo revisará y te contactará si es necesario por WhatsApp.
              </p>
              <button onClick={onClose} className="btn-primary" style={{ marginTop: 24 }}>
                Cerrar
              </button>
            </div>
          )}

          {/* ── Vista: formulario de reporte ── */}
          {!enviado && vistaReporte && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
                Cuéntanos qué pasó y nuestro equipo te contactará a la brevedad.
              </p>

              {/* Tipo */}
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>¿Qué tipo de problema tienes?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TIPOS_REPORTE.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTipo(t.id)}
                      style={{
                        padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                        border: `1.5px solid ${tipo === t.id ? 'var(--green-800)' : 'var(--border-md)'}`,
                        background: tipo === t.id ? 'var(--green-50)' : 'var(--surface)',
                        color: tipo === t.id ? 'var(--green-800)' : 'var(--gray-700)',
                        fontSize: 13, fontWeight: tipo === t.id ? 500 : 400,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Describe la situación</p>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: El cliente no abrió la puerta a la hora acordada..."
                  rows={4}
                  style={{
                    width: '100%', borderRadius: 10, border: '1px solid var(--border-md)',
                    padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font-body)',
                    background: 'var(--bg)', color: 'var(--gray-900)', outline: 'none',
                    resize: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>
                  {error}
                </p>
              )}

              <button
                onClick={enviar}
                disabled={enviando}
                className="btn-primary"
                style={{ opacity: enviando ? 0.7 : 1 }}
              >
                {enviando ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          )}

          {/* ── Vista: FAQ principal ── */}
          {!enviado && !vistaReporte && (
            <>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 14 }}>
                Escribe <strong>ayuda</strong> en cualquier momento para volver aquí.
              </p>

              {/* Preguntas frecuentes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {FAQ.map(item => (
                  <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <button
                      onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-900)', lineHeight: 1.4 }}>
                        {item.pregunta}
                      </span>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round"
                        style={{ flexShrink: 0, transform: expandido === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {expandido === item.id && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.65, marginTop: 10 }}>
                          {item.respuesta}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón reportar */}
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
                  ⚠️ ¿Tienes un problema?
                </p>
                <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.5, marginBottom: 12 }}>
                  Si no encontraste respuesta en las preguntas frecuentes, envíanos un reporte y te contactaremos.
                </p>
                <button
                  onClick={() => setVistaReporte(true)}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                    background: '#92400E', color: 'white', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  Reportar un problema
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
