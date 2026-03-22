# FixChl Técnico — PWA

App web progresiva para que los técnicos gestionen solicitudes, chats y su perfil.

## Cómo correr el proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Correr en desarrollo
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador.

### 3. Build para producción
```bash
npm run build
```
Los archivos listos para desplegar quedan en la carpeta `/dist`.

---

## Estructura del proyecto

```
src/
├── context/
│   └── AppContext.jsx     ← Estado global y datos mock
├── screens/
│   ├── Solicitudes.jsx    ← Lista de trabajos disponibles
│   ├── DetalleJob.jsx     ← Detalle de una solicitud
│   ├── Chats.jsx          ← Lista de conversaciones
│   ├── ChatScreen.jsx     ← Chat individual con cliente
│   ├── Rendimiento.jsx    ← Stats y calificaciones
│   └── Perfil.jsx         ← Perfil y configuración
├── components/
│   └── NavBar.jsx         ← Barra de navegación inferior
├── App.jsx                ← Router principal
├── main.jsx               ← Entry point
└── index.css              ← Design system y estilos globales
```

---

## Conectar con el backend real

El archivo `src/context/AppContext.jsx` contiene datos mock.
Para conectar con el backend real, reemplaza las funciones del contexto
con llamadas a tu API:

```js
// Ejemplo: reemplazar datos mock por fetch real
const acceptJob = async (jobId) => {
  const res = await fetch(`/api/jobs/${jobId}/accept`, { method: 'POST' })
  const data = await res.json()
  // actualizar estado con la respuesta
}
```

---

## Despliegue

La forma más rápida es con [Railway](https://railway.app) o [Render](https://render.com):

1. Sube el proyecto a GitHub
2. Crea un nuevo proyecto en Railway o Render
3. Conecta el repo → deploy automático

---

## Instalación como PWA en el celular

1. Abre la URL de la app en Chrome (Android) o Safari (iPhone)
2. Android: menú → "Agregar a pantalla de inicio"
3. iPhone: botón compartir → "Agregar a pantalla de inicio"

La app se instala sin App Store ni Play Store.
