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

export default function Login() {
  const { login, registro } = useApp()
  const [mode, setMode]     = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const [tel, setTel]         = useState('')
  const [pass, setPass]       = useState('')
  const [passConf, setPassConf] = useState('')
  const [nombre, setNombre]   = useState('')
  const [rut, setRut]         = useState('')
  const [categorias, setCategorias] = useState([])
  const [comunas, setComunas] = useState([])
  const [cedulaB64, setCedulaB64] = useState(null)
  const [cedulaPreview, setCedulaPreview] = useState(null)
  const [otpEnviado, setOtpEnviado]       = useState(false)
  const [otpCodigo, setOtpCodigo]         = useState('')
  const [otpVerificado, setOtpVerificado] = useState(false)
  const [otpLoading, setOtpLoading]       = useState(false)
  const [otpMsg, setOtpMsg]               = useState('')
  const [reenviarEn, setReenviarEn]       = useState(0)

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
      setOtpVerificado(true)
      setOtpMsg('')
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
      setCedulaB64(b64)
      setCedulaPreview(b64)
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
    if (!nombre || !rut || !tel || !pass || !passConf) {
      setMsg('Completa todos los campos'); return
    }
    if (pass !== passConf) {
      setMsg('Las contraseñas no coinciden'); return
    }
    if (pass.length < 6) {
      setMsg('La contraseña debe tener al menos 6 caracteres'); return
    }
    if (!validarRut(rut)) {
      setMsg('RUT inválido. Verifica el dígito verificador'); return
    }
    if (!otpVerificado) {
      setMsg('Debes verificar tu número de teléfono'); return
    }
    if (!cedulaB64) {
      setMsg('Debes subir una foto de tu cédula de identidad'); return
    }
    if (categorias.length === 0) {
      setMsg('Selecciona al menos una categoría de servicio'); return
    }
    if (comunas.length === 0) {
      setMsg('Selecciona al menos una comuna'); return
    }
    setLoading(true); setMsg('')
    try {
      await registro({ nombre, rut, telefono: tel, password: pass, categoria: categorias[0], categorias, comunas, cedula_foto: cedulaB64 })
    }
    catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  const pillBase = { padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.1s' }
  const pillOn   = { ...pillBase, borderColor: 'var(--green-800)', background: 'var(--green-50)', color: 'var(--green-800)', fontWeight: 500 }
  const pillOff  = { ...pillBase, borderColor: 'var(--border-md)', background: 'transparent', color: 'var(--gray-600)' }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)' }}>

      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <img src="/Logo_sin_fondo.png" alt="TecnicosYa" style={{ width: 180, height: 180, objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Gestiona tus trabajos</p>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 20px' }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['login', 'registro'].map(m => (
            <button key={m} onClick={() => { setMode(m); setMsg('') }} style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
              fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s',
              border: '1px solid',
              borderColor: mode === m ? 'var(--green-800)' : 'var(--border-md)',
              background: mode === m ? 'var(--green-800)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--gray-700)'
            }}>
              {m === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

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
                  style={{
                    ...inputStyle,
                    borderColor: rut.length > 3
                      ? validarRut(rut) ? 'var(--green-800)' : '#F87171'
                      : 'var(--border-md)'
                  }}
                />
                {rut.length > 3 && !validarRut(rut) && (
                  <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>RUT inválido</p>
                )}
              </Campo>
            </>
          )}

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
              {mode === 'registro' && !otpVerificado && (
                <button
                  onClick={enviarOtp}
                  disabled={otpLoading || !tel || reenviarEn > 0}
                  style={{
                    padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: (otpLoading || !tel || reenviarEn > 0) ? 'var(--gray-200)' : 'var(--green-800)',
                    color: (otpLoading || !tel || reenviarEn > 0) ? 'var(--gray-500)' : 'white',
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {otpLoading ? '...' : otpEnviado && reenviarEn > 0 ? `${reenviarEn}s` : otpEnviado ? 'Reenviar' : 'Enviar código'}
                </button>
              )}
              {mode === 'registro' && otpVerificado && (
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4, color: 'var(--green-800)', fontSize: 18 }}>✓</div>
              )}
            </div>
            {otpMsg && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{otpMsg}</p>}
            {mode === 'registro' && otpEnviado && !otpVerificado && (
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
                    padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: otpCodigo.length === 6 ? 'var(--green-800)' : 'var(--gray-200)',
                    color: otpCodigo.length === 6 ? 'white' : 'var(--gray-500)',
                    fontSize: 12, fontWeight: 600, flexShrink: 0,
                  }}
                >
                  {otpLoading ? '...' : 'Verificar'}
                </button>
              </div>
            )}
            {mode === 'registro' && otpEnviado && !otpVerificado && (
              <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6 }}>
                Revisa tu WhatsApp — enviamos el código al número ingresado
              </p>
            )}
          </Campo>

          <Campo label="Contraseña">
            <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" type="password" style={inputStyle}/>
          </Campo>

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
                    <button key={c} onClick={() => toggleItem(categorias, setCategorias, c)}
                      style={categorias.includes(c) ? pillOn : pillOff}>
                      {c}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Comunas donde trabajas">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                  {COMUNAS.map(c => (
                    <button key={c} onClick={() => toggleItem(comunas, setComunas, c)}
                      style={comunas.includes(c) ? pillOn : pillOff}>
                      {c}
                    </button>
                  ))}
                </div>
              </Campo>
            </>
          )}

          {msg && (
            <p style={{ fontSize: 12, color: 'var(--red-600)', background: 'var(--red-100)', padding: '8px 12px', borderRadius: 8 }}>
              {msg}
            </p>
          )}

          <button
            onClick={mode === 'login' ? handleLogin : handleRegistro}
            disabled={loading}
            style={{ marginTop: 4, padding: '11px 0', background: loading ? 'var(--green-200)' : 'var(--green-800)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: loading ? 'default' : 'pointer', transition: 'background 0.15s' }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>

        </div>
      </div>
    </div>
  )
}
