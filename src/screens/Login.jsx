import { useState } from 'react'
import { useApp } from '../context/AppContext'

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

  const toggleItem = (list, setList, item) =>
    setList(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])

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
    if (categorias.length === 0) {
      setMsg('Selecciona al menos una categoría de servicio'); return
    }
    if (comunas.length === 0) {
      setMsg('Selecciona al menos una comuna'); return
    }
    setLoading(true); setMsg('')
    try {
      await registro({ nombre, rut, telefono: tel, password: pass, categoria: categorias[0], categorias, comunas })
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
            <input value={tel} onChange={e => setTel(e.target.value)} placeholder="+56912345678" type="tel" style={inputStyle}/>
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
