import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'

const CATEGORIAS = ['Electricista', 'Gasfiter', 'Servicio de aseo', 'Pintor', 'Maestro general', 'Otro']
const COMUNAS    = ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Chicureo']

function validarRut(rut) {
  const limpio = String(rut).replace(/[\.\-\s]/g, '').toUpperCase()
  if (limpio.length < 2) return false
  const cuerpo = limpio.slice(0, -1)
  const dv     = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false
  let suma = 0, mul = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === dvEsperado
}

function formatRut(value) {
  const limpio = value.replace(/[\.\-\s]/g, '').toUpperCase()
  if (limpio.length <= 1) return limpio
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const dv = limpio.slice(-1)
  return `${cuerpo}-${dv}`
}

function Campo({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 5 }}>{label}</p>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', borderRadius: 8, border: '1px solid var(--border-md)',
  padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-body)',
  background: 'var(--bg)', color: 'var(--gray-900)', outline: 'none'
}

// ── Términos y Condiciones ────────────────────────────────────────────────────
function ModalTerminos({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 14, padding: '24px 20px', maxWidth: 480, width: '100%', maxHeight: '85dvh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>Términos y Condiciones</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-500)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.7 }}>
          <p style={sh}>1. Identificación</p>
          <p>TecnicosYa es una plataforma digital que actúa como intermediaria entre clientes que requieren servicios del hogar y técnicos independientes que los ofrecen, operada conforme a la legislación chilena vigente.</p>

          <p style={sh}>2. Naturaleza de la plataforma</p>
          <p>TecnicosYa es un marketplace de servicios. Los técnicos registrados son trabajadores independientes y no empleados, socios ni representantes de TecnicosYa. La plataforma no es parte de los contratos de servicio celebrados entre técnicos y clientes.</p>

          <p style={sh}>3. Requisitos para el registro</p>
          <p>Para registrarse como técnico debes: (a) ser persona natural mayor de 18 años; (b) tener RUT chileno válido; (c) contar con teléfono activo; (d) proporcionar fotografía de cédula de identidad vigente para verificación de identidad. TecnicosYa se reserva el derecho de rechazar solicitudes que no cumplan estos requisitos.</p>

          <p style={sh}>4. Protección de datos personales</p>
          <p>De conformidad con la Ley N° 19.628 sobre Protección de la Vida Privada, los datos personales recopilados (nombre, RUT, teléfono, fotografía de cédula) serán utilizados exclusivamente para: (a) verificar tu identidad; (b) gestionar tu cuenta y los servicios prestados; (c) comunicaciones relacionadas con la plataforma. No se cederán datos a terceros sin tu consentimiento, salvo obligación legal. Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición contactando a TecnicosYa.</p>

          <p style={sh}>5. Obligaciones del técnico</p>
          <p>El técnico se compromete a: (a) proporcionar información veraz al registrarse; (b) cumplir los trabajos aceptados con diligencia y profesionalismo; (c) no contactar directamente a clientes obtenidos mediante la plataforma para eludir su uso; (d) mantener actualizados sus datos de contacto y disponibilidad.</p>

          <p style={sh}>6. Calificaciones y reputación</p>
          <p>Los clientes pueden calificar el servicio recibido. TecnicosYa puede suspender o eliminar cuentas con calificaciones reiteradamente bajas o que infrinjan estas condiciones.</p>

          <p style={sh}>7. Responsabilidad</p>
          <p>TecnicosYa actúa como intermediaria y no se hace responsable por: (a) la calidad o resultado de los servicios prestados por los técnicos; (b) daños o perjuicios derivados de la ejecución de los trabajos; (c) disputas entre técnicos y clientes. Lo anterior no limita los derechos que la Ley N° 19.496 de Protección al Consumidor otorga a los usuarios.</p>

          <p style={sh}>8. Suspensión y eliminación de cuenta</p>
          <p>TecnicosYa puede suspender o eliminar cuentas en caso de incumplimiento de estos términos, uso fraudulento, o conductas contrarias a la ley chilena, sin perjuicio de las acciones legales que correspondan.</p>

          <p style={sh}>9. Ley aplicable y jurisdicción</p>
          <p>Estos términos se rigen por la legislación chilena. Cualquier controversia será sometida a los tribunales ordinarios de justicia de la ciudad de Santiago de Chile.</p>

          <p style={sh}>10. Modificaciones</p>
          <p>TecnicosYa podrá modificar estos términos notificando a los usuarios registrados. El uso continuado de la plataforma tras la notificación implica aceptación de los nuevos términos.</p>

          <p style={{ marginTop: 14, color: 'var(--gray-500)', fontSize: 11 }}>Última actualización: abril 2026</p>
        </div>
        <button onClick={onClose} style={{ marginTop: 16, width: '100%', padding: '10px 0', background: 'var(--green-800)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
const sh = { fontWeight: 700, marginTop: 14, marginBottom: 4, color: 'var(--gray-900)' }

// ── Componente principal ──────────────────────────────────────────────────────
export default function Login() {
  const { login, registro } = useApp()
  const [mode, setMode]       = useState('login') // 'login' | 'registro' | 'recuperar'
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  // Campos comunes
  const [tel, setTel]   = useState('')
  const [pass, setPass] = useState('')

  // Campos solo registro
  const [passConf, setPassConf]   = useState('')
  const [nombre, setNombre]       = useState('')
  const [rut, setRut]             = useState('')
  const [categorias, setCategorias] = useState([])
  const [comunas, setComunas]     = useState([])
  const [cedulaB64, setCedulaB64] = useState(null)
  const [cedulaPreview, setCedulaPreview] = useState(null)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [showTerminos, setShowTerminos]     = useState(false)

  // OTP (registro y recuperar)
  const [otpEnviado, setOtpEnviado]     = useState(false)
  const [otpCodigo, setOtpCodigo]       = useState('')
  const [otpVerificado, setOtpVerificado] = useState(false)
  const [otpLoading, setOtpLoading]     = useState(false)
  const [otpMsg, setOtpMsg]             = useState('')
  const [reenviarEn, setReenviarEn]     = useState(0)

  // Recuperar contraseña
  const [nuevaPass, setNuevaPass]         = useState('')
  const [nuevaPassConf, setNuevaPassConf] = useState('')

  const resetForm = () => {
    setTel(''); setPass(''); setPassConf(''); setNombre(''); setRut('')
    setCategorias([]); setComunas([]); setCedulaB64(null); setCedulaPreview(null)
    setAceptaTerminos(false); setOtpEnviado(false); setOtpCodigo('')
    setOtpVerificado(false); setOtpMsg(''); setReenviarEn(0)
    setNuevaPass(''); setNuevaPassConf(''); setMsg('')
  }

  const cambiarMode = (m) => { resetForm(); setMode(m) }

  const toggleItem = (list, setList, item) =>
    setList(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])

  const enviarOtp = async () => {
    if (!tel) { setOtpMsg('Ingresa tu teléfono primero'); return }
    setOtpLoading(true); setOtpMsg('')
    try {
      await api.otpEnviar(tel)
      setOtpEnviado(true)
      setReenviarEn(60)
      const t = setInterval(() => setReenviarEn(s => { if (s <= 1) { clearInterval(t); return 0 } return s - 1 }), 1000)
    } catch (e) { setOtpMsg(e.message) }
    finally { setOtpLoading(false) }
  }

  const verificarOtp = async () => {
    if (otpCodigo.length !== 6) { setOtpMsg('Ingresa el código de 6 dígitos'); return }
    setOtpLoading(true); setOtpMsg('')
    try {
      await api.otpVerificar(tel, otpCodigo)
      setOtpVerificado(true); setOtpMsg('')
    } catch (e) { setOtpMsg(e.message) }
    finally { setOtpLoading(false) }
  }

  const handleCedula = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1200
      let w = img.width, h = img.height
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else       { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      const b64 = canvas.toDataURL('image/jpeg', 0.75)
      setCedulaB64(b64); setCedulaPreview(b64)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleLogin = async () => {
    if (!tel || !pass) { setMsg('Completa todos los campos'); return }
    setLoading(true); setMsg('')
    try { await login(tel, pass) }
    catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  const handleRegistro = async () => {
    if (!nombre || !rut || !tel || !pass || !passConf) { setMsg('Completa todos los campos'); return }
    if (pass !== passConf)          { setMsg('Las contraseñas no coinciden'); return }
    if (pass.length < 6)            { setMsg('La contraseña debe tener al menos 6 caracteres'); return }
    if (!validarRut(rut))           { setMsg('RUT inválido. Verifica el dígito verificador'); return }
    if (!otpVerificado)             { setMsg('Debes verificar tu número de teléfono'); return }
    if (!cedulaB64)                 { setMsg('Debes subir una foto de tu cédula de identidad'); return }
    if (categorias.length === 0)    { setMsg('Selecciona al menos una categoría de servicio'); return }
    if (comunas.length === 0)       { setMsg('Selecciona al menos una comuna'); return }
    if (!aceptaTerminos)            { setMsg('Debes aceptar los términos y condiciones'); return }
    setLoading(true); setMsg('')
    try {
      await registro({ nombre, rut, telefono: tel, password: pass, categoria: categorias[0], categorias, comunas, cedula_foto: cedulaB64 })
    }
    catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  const handleRecuperar = async () => {
    if (!otpVerificado)             { setMsg('Debes verificar tu número de teléfono'); return }
    if (!nuevaPass)                 { setMsg('Ingresa tu nueva contraseña'); return }
    if (nuevaPass.length < 6)       { setMsg('La contraseña debe tener al menos 6 caracteres'); return }
    if (nuevaPass !== nuevaPassConf){ setMsg('Las contraseñas no coinciden'); return }
    setLoading(true); setMsg('')
    try {
      await api.recuperarPass(tel, nuevaPass)
      setMsg(''); cambiarMode('login')
    }
    catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  const pillBase = { padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.1s' }
  const pillOn   = { ...pillBase, borderColor: 'var(--green-800)', background: 'var(--green-50)', color: 'var(--green-800)', fontWeight: 500 }
  const pillOff  = { ...pillBase, borderColor: 'var(--border-md)', background: 'transparent', color: 'var(--gray-600)' }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)' }}>

      {showTerminos && <ModalTerminos onClose={() => setShowTerminos(false)} />}

      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <img src="/Logo_sin_fondo.png" alt="TecnicosYa" style={{ width: 180, height: 180, objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Gestiona tus trabajos</p>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 20px' }}>

        {/* Tabs login / registro */}
        {mode !== 'recuperar' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['login', 'registro'].map(m => (
              <button key={m} onClick={() => cambiarMode(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
                fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                borderColor: mode === m ? 'var(--green-800)' : 'var(--border-md)',
                background:  mode === m ? 'var(--green-800)' : 'transparent',
                color:       mode === m ? '#fff' : 'var(--gray-700)',
              }}>
                {m === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>
        )}

        {/* Header recuperar */}
        {mode === 'recuperar' && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => cambiarMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontSize: 12, padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Volver
            </button>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>Recuperar contraseña</p>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>Verificaremos tu número y podrás crear una nueva contraseña</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Campos solo registro */}
          {mode === 'registro' && (
            <>
              <Campo label="Nombre completo">
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Mario González" style={inputStyle}/>
              </Campo>
              <Campo label="RUT">
                <input
                  value={rut}
                  onChange={e => setRut(formatRut(e.target.value))}
                  placeholder="12.345.678-9"
                  style={{ ...inputStyle, borderColor: rut.length > 3 ? validarRut(rut) ? 'var(--green-800)' : '#F87171' : 'var(--border-md)' }}
                />
                {rut.length > 3 && !validarRut(rut) && (
                  <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>RUT inválido</p>
                )}
              </Campo>
            </>
          )}

          {/* Teléfono (con OTP en registro y recuperar) */}
          <Campo label="Teléfono">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={tel}
                onChange={e => { setTel(e.target.value); setOtpVerificado(false); setOtpEnviado(false); setOtpCodigo('') }}
                placeholder="+56912345678"
                type="tel"
                style={{ ...inputStyle, flex: 1, borderColor: otpVerificado ? 'var(--green-800)' : 'var(--border-md)' }}
                readOnly={otpVerificado}
              />
              {(mode === 'registro' || mode === 'recuperar') && !otpVerificado && (
                <button
                  onClick={enviarOtp}
                  disabled={otpLoading || !tel || reenviarEn > 0}
                  style={{
                    padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: (otpLoading || !tel || reenviarEn > 0) ? 'var(--gray-200)' : 'var(--green-800)',
                    color:      (otpLoading || !tel || reenviarEn > 0) ? 'var(--gray-500)' : 'white',
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  }}
                >
                  {otpLoading ? '...' : otpEnviado && reenviarEn > 0 ? `${reenviarEn}s` : otpEnviado ? 'Reenviar' : 'Enviar código'}
                </button>
              )}
              {(mode === 'registro' || mode === 'recuperar') && otpVerificado && (
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4, color: 'var(--green-800)', fontSize: 18 }}>✓</div>
              )}
            </div>
            {otpMsg && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{otpMsg}</p>}
            {(mode === 'registro' || mode === 'recuperar') && otpEnviado && !otpVerificado && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input
                  value={otpCodigo}
                  onChange={e => setOtpCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Código de 6 dígitos"
                  inputMode="numeric"
                  style={{ ...inputStyle, flex: 1, letterSpacing: '0.15em', textAlign: 'center' }}
                  onKeyDown={e => e.key === 'Enter' && verificarOtp()}
                />
                <button
                  onClick={verificarOtp}
                  disabled={otpLoading || otpCodigo.length !== 6}
                  style={{
                    padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: otpCodigo.length === 6 ? 'var(--green-800)' : 'var(--gray-200)',
                    color:      otpCodigo.length === 6 ? 'white' : 'var(--gray-500)',
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {otpLoading ? '...' : 'Verificar'}
                </button>
              </div>
            )}
            {(mode === 'registro' || mode === 'recuperar') && otpEnviado && !otpVerificado && (
              <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6 }}>
                Revisa tu WhatsApp — enviamos el código al número ingresado
              </p>
            )}
          </Campo>

          {/* Contraseña login/registro */}
          {mode !== 'recuperar' && (
            <Campo label="Contraseña">
              <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" type="password" style={inputStyle}/>
            </Campo>
          )}

          {/* Olvidé contraseña */}
          {mode === 'login' && (
            <button onClick={() => cambiarMode('recuperar')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontSize: 12, textAlign: 'right', padding: 0, marginTop: -6 }}>
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {/* Campos solo registro */}
          {mode === 'registro' && (
            <>
              <Campo label="Confirmar contraseña">
                <input value={passConf} onChange={e => setPassConf(e.target.value)} placeholder="Repite la contraseña" type="password"
                  style={{ ...inputStyle, borderColor: passConf && pass !== passConf ? '#F5B3B3' : 'var(--border-md)' }}/>
                {passConf && pass !== passConf && (
                  <p style={{ fontSize: 11, color: 'var(--red-600)', marginTop: 4 }}>Las contraseñas no coinciden</p>
                )}
              </Campo>

              <Campo label="Foto de cédula de identidad">
                <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 6 }}>
                  Sube una foto clara del frente de tu cédula. Será revisada por nuestro equipo antes de activar tu cuenta.
                </p>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  padding: '9px 12px', borderRadius: 8, border: `1.5px dashed ${cedulaB64 ? 'var(--green-800)' : 'var(--border-md)'}`,
                  background: cedulaB64 ? 'var(--green-50)' : 'transparent', color: cedulaB64 ? 'var(--green-800)' : 'var(--gray-600)', fontSize: 13
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {cedulaB64 ? 'Foto cargada' : 'Subir foto de cédula'}
                  <input type="file" accept="image/*" capture="environment" onChange={handleCedula} style={{ display: 'none' }}/>
                </label>
                {cedulaPreview && (
                  <img src={cedulaPreview} alt="Vista previa cédula"
                    style={{ marginTop: 8, width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}/>
                )}
              </Campo>

              <Campo label="Categorías de servicio (puedes elegir varias)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                  {CATEGORIAS.map(c => (
                    <button key={c} onClick={() => toggleItem(categorias, setCategorias, c)} style={categorias.includes(c) ? pillOn : pillOff}>{c}</button>
                  ))}
                </div>
              </Campo>

              <Campo label="Comunas donde trabajas">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                  {COMUNAS.map(c => (
                    <button key={c} onClick={() => toggleItem(comunas, setComunas, c)} style={comunas.includes(c) ? pillOn : pillOff}>{c}</button>
                  ))}
                </div>
              </Campo>

              {/* Términos y condiciones */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: aceptaTerminos ? 'var(--green-50)' : 'var(--gray-50)', borderRadius: 8, border: `1px solid ${aceptaTerminos ? 'var(--green-200)' : 'var(--border)'}` }}>
                <input
                  type="checkbox"
                  id="terminos"
                  checked={aceptaTerminos}
                  onChange={e => setAceptaTerminos(e.target.checked)}
                  style={{ marginTop: 2, accentColor: 'var(--green-800)', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                />
                <label htmlFor="terminos" style={{ fontSize: 12, color: 'var(--gray-700)', cursor: 'pointer', lineHeight: 1.5 }}>
                  He leído y acepto los{' '}
                  <button onClick={() => setShowTerminos(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-800)', fontWeight: 600, fontSize: 12, padding: 0, textDecoration: 'underline' }}>
                    Términos y Condiciones
                  </button>
                  {' '}de TecnicosYa
                </label>
              </div>
            </>
          )}

          {/* Campos recuperar contraseña */}
          {mode === 'recuperar' && otpVerificado && (
            <>
              <Campo label="Nueva contraseña">
                <input value={nuevaPass} onChange={e => setNuevaPass(e.target.value)} placeholder="Mínimo 6 caracteres" type="password" style={inputStyle}/>
              </Campo>
              <Campo label="Confirmar nueva contraseña">
                <input value={nuevaPassConf} onChange={e => setNuevaPassConf(e.target.value)} placeholder="Repite la contraseña" type="password"
                  style={{ ...inputStyle, borderColor: nuevaPassConf && nuevaPass !== nuevaPassConf ? '#F5B3B3' : 'var(--border-md)' }}/>
                {nuevaPassConf && nuevaPass !== nuevaPassConf && (
                  <p style={{ fontSize: 11, color: 'var(--red-600)', marginTop: 4 }}>Las contraseñas no coinciden</p>
                )}
              </Campo>
            </>
          )}

          {msg && (
            <p style={{ fontSize: 12, color: 'var(--red-600)', background: 'var(--red-100)', padding: '8px 12px', borderRadius: 8 }}>
              {msg}
            </p>
          )}

          <button
            onClick={mode === 'login' ? handleLogin : mode === 'registro' ? handleRegistro : handleRecuperar}
            disabled={loading || (mode === 'recuperar' && !otpVerificado)}
            style={{
              marginTop: 4, padding: '11px 0', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
              cursor: loading ? 'default' : 'pointer', transition: 'background 0.15s', color: '#fff',
              background: loading ? 'var(--green-200)' : (mode === 'recuperar' && !otpVerificado) ? 'var(--gray-200)' : 'var(--green-800)',
            }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : mode === 'registro' ? 'Crear cuenta' : 'Cambiar contraseña'}
          </button>

        </div>
      </div>
    </div>
  )
}
