import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'

export default function TecnicosPendientes() {
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [cedula, setCedula]     = useState(null)  // { id, nombre, foto }
  const [razon, setRazon]       = useState('')
  const [toast, setToast]       = useState('')

  const cargar = async () => {
    try {
      const data = await adminApi.getTecnicosPendientes()
      setTecnicos(data.tecnicos)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const verCedula = async (t) => {
    setCedula({ id: t.id, nombre: t.nombre, foto: null })
    try {
      const data = await adminApi.getCedula(t.id)
      setCedula({ id: t.id, nombre: t.nombre, foto: data.cedula_foto })
    } catch { setCedula(prev => ({ ...prev, foto: 'error' })) }
  }

  const aprobar = async (id) => {
    await adminApi.aprobar(id)
    setCedula(null); setRazon(''); cargar()
    showToast('Técnico aprobado — ya puede ingresar a la app')
  }

  const rechazar = async (id) => {
    await adminApi.rechazar(id, razon)
    setCedula(null); setRazon(''); cargar()
    showToast('Técnico rechazado')
  }

  if (loading) return <Spinner />

  return (
    <div style={s.page}>
      {toast && <Toast msg={toast} />}

      <div style={s.header}>
        <div>
          <p style={s.title}>Verificación de técnicos</p>
          <p style={s.subtitle}>Revisa la cédula y aprueba o rechaza cada solicitud</p>
        </div>
        <span style={{ ...s.badge, background: tecnicos.length ? '#FEF3C7' : '#F3F4F6', color: tecnicos.length ? '#92400E' : '#6B7280' }}>
          {tecnicos.length} pendiente{tecnicos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {tecnicos.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>✓</p>
          <p style={{ fontWeight: 600, color: '#374151' }}>Todo al día</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>No hay técnicos esperando verificación</p>
        </div>
      ) : (
        <div style={s.grid}>
          {tecnicos.map(t => (
            <div key={t.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{t.nombre}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>RUT {t.rut}</p>
                </div>
                <span style={{ ...s.estadoBadge('pendiente') }}>Pendiente</span>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Tel: {t.telefono}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
                Registrado el {new Date(t.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <button style={s.btnPrimary} onClick={() => verCedula(t)}>Ver cédula y decidir</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal cédula */}
      {cedula && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setCedula(null)}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{cedula.nombre}</p>
              <button onClick={() => { setCedula(null); setRazon('') }} style={s.btnClose}>×</button>
            </div>

            {!cedula.foto ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 13 }}>Cargando foto...</div>
            ) : cedula.foto === 'error' ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#DC2626', fontSize: 13 }}>No se pudo cargar la foto</div>
            ) : (
              <img src={cedula.foto} alt="Cédula de identidad"
                style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 18 }}/>
            )}

            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <button style={{ ...s.btnAprobar, flex: 1 }} onClick={() => aprobar(cedula.id)}>
                Aprobar
              </button>
              <button style={{ ...s.btnRechazar, flex: 1 }} onClick={() => rechazar(cedula.id)}
                disabled={false}>
                Rechazar
              </button>
            </div>

            <textarea
              value={razon}
              onChange={e => setRazon(e.target.value)}
              placeholder="Motivo del rechazo (opcional, se muestra al técnico)"
              rows={2}
              style={{ width: '100%', borderRadius: 8, border: '1px solid #D1D5DB', padding: '9px 12px', fontSize: 13, resize: 'none', boxSizing: 'border-box', color: '#374151' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Cargando...</div>
}

function Toast({ msg }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 2000, whiteSpace: 'nowrap' }}>
      {msg}
    </div>
  )
}

const s = {
  page:     { padding: '28px 32px', maxWidth: 900, margin: '0 auto' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:    { fontSize: 20, fontWeight: 700, color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  badge:    { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card:     { background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20 },
  empty:    { background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: '56px 0', textAlign: 'center' },
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 },
  modal:    { background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90dvh', overflowY: 'auto' },
  btnPrimary: { width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', background: '#111827', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnAprobar: { padding: '10px 0', borderRadius: 8, border: 'none', background: '#059669', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnRechazar: { padding: '10px 0', borderRadius: 8, border: 'none', background: '#DC2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnClose:   { width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#F3F4F6', color: '#374151', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  estadoBadge: (estado) => ({
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: estado === 'activo' ? '#D1FAE5' : estado === 'pendiente' ? '#FEF3C7' : estado === 'suspendido' ? '#FEE2E2' : '#F3F4F6',
    color: estado === 'activo' ? '#065F46' : estado === 'pendiente' ? '#92400E' : estado === 'suspendido' ? '#991B1B' : '#6B7280',
  }),
}
