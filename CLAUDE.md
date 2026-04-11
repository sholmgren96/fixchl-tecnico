# TecnicosYa — PWA Técnico

## Descripción
App web progresiva (PWA) para que los técnicos gestionen sus trabajos.
Instalable en celular como app nativa.

## Stack
- React + Vite
- Tailwind CSS
- Recharts v3.8.1 (para gráficos en el panel admin)
- Desplegada en Vercel desde repo sholmgren96/fixchl-tecnico
- URL: https://tecnicosya.vercel.app

## Conexión al backend
- Archivo: src/services/api.js (técnicos)
- Archivo: src/services/adminApi.js (admin)
- BASE URL: https://fixchl-backend-production-bda3.up.railway.app/api
- Técnicos: JWT guardado en localStorage con clave `fixchl_token`
- Admin: JWT guardado en localStorage con clave `tecnoYa_admin_token`

## Pantallas de técnicos
- Login/Registro/Recuperar contraseña — src/screens/Login.jsx
  - Registro: verificación OTP por WhatsApp → formulario con RUT, foto de cédula, categorías, comunas → acepta T&C
  - Recuperar: verificación OTP → nueva contraseña
- Pendiente verificación — src/screens/PendienteVerificacion.jsx (muestra estado pendiente o rechazado con razón)
- Solicitudes — src/screens/Solicitudes.jsx (trabajos disponibles + mis trabajos activos)
- Detalle trabajo — src/screens/DetalleJob.jsx
- Chats — src/screens/Chats.jsx
- Chat individual — src/screens/ChatScreen.jsx
- Rendimiento — src/screens/Rendimiento.jsx (rating y calificaciones)
- Perfil — src/screens/Perfil.jsx (datos, comunas, categorías, toggle disponible)
- Agenda — src/screens/Agenda.jsx (configurar disponibilidad semanal)

## Panel de administración — /admin
- src/App.jsx detecta ruta /admin/* y renderiza AdminApp (flujo completamente separado)
- src/screens/admin/AdminLogin.jsx — login email/contraseña
- src/screens/admin/AdminShell.jsx — sidebar con navegación de 4 secciones
- src/screens/admin/Dashboard.jsx — KPIs, gráficos (Recharts): semanal, embudo, por categoría, por comuna, distribución ratings, top técnicos
- src/screens/admin/TecnicosPendientes.jsx — tarjetas con foto de cédula, aprobar/rechazar
- src/screens/admin/TecnicosLista.jsx — tabla con todos los técnicos, filtros, acciones
- src/screens/admin/ServiciosLista.jsx — tabla de trabajos con filtros (estado, categoría, fechas), paginación, modal con conversación completa

## Contexto de AppContext
- src/context/AppContext.jsx maneja estado global: tecnico, token, trabajos, mensajes
- useApp() hook para acceder al contexto desde cualquier pantalla
- Al cargar perfil, si tecnico.estado !== 'activo' muestra PendienteVerificacion

## Reglas de desarrollo
- Nunca usar etiquetas HTML form — usar onClick/onChange
- Estilos con variables CSS definidas en src/index.css y estilos inline (no Tailwind en pantallas admin)
- Al hacer push a main en GitHub, Vercel redespliega automáticamente
- theme-color del PWA es #FE8315 (naranja TecnicosYa)

## Pendiente por desarrollar
- Pantalla de Agenda — para que el técnico configure su disponibilidad semanal
- Debe consumir GET /api/disponibilidad y POST /api/disponibilidad y POST /api/disponibilidad/fecha
- Formato de bloques: { fecha, hora_inicio, hora_fin }
- El técnico marca días y bloques horarios de la semana
- Cuando acepta un trabajo con fecha agendada, ese bloque queda bloqueado automáticamente
