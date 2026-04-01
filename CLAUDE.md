# TecnoYa — PWA Técnico

## Descripción
App web progresiva (PWA) para que los técnicos gestionen sus trabajos.
Instalable en celular como app nativa.

## Stack
- React + Vite
- Tailwind CSS
- Desplegada en Vercel desde repo sholmgren96/fixchl-tecnico
- URL: https://fixchl-tecnico.vercel.app

## Conexión al backend
- Archivo: src/services/api.js
- BASE URL: https://fixchl-backend-production-bda3.up.railway.app/api
- Autenticación: JWT token guardado en localStorage

## Pantallas actuales
- Login/Registro — src/screens/Login.jsx
- Solicitudes — src/screens/Solicitudes.jsx (trabajos disponibles + mis trabajos)
- Detalle trabajo — src/screens/DetalleJob.jsx
- Chats — src/screens/Chats.jsx
- Chat individual — src/screens/ChatScreen.jsx
- Rendimiento — src/screens/Rendimiento.jsx (rating y calificaciones)
- Perfil — src/screens/Perfil.jsx (datos, comunas, categorías, toggle disponible)

## Contexto de AppContext
- src/context/AppContext.jsx maneja estado global: tecnico, token, trabajos, mensajes
- useApp() hook para acceder al contexto desde cualquier pantalla

## Pendiente por desarrollar
- Pantalla de Agenda — para que el técnico configure su disponibilidad semanal
- Debe consumir GET /api/disponibilidad y POST /api/disponibilidad
- Formato de bloques: { fecha, hora_inicio, hora_fin }
- El técnico marca días y bloques horarios de la semana
- Cuando acepta un trabajo con fecha agendada, ese bloque queda bloqueado automáticamente

## Reglas de desarrollo
- Nunca usar etiquetas HTML form — usar onClick/onChange
- Estilos con variables CSS definidas en src/index.css
- Al hacer push a main en GitHub, Vercel redespliega automáticamente