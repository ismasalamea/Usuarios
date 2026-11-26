# Nexo — Gestión de usuarios

Aplicación MERN para administrar el directorio de un equipo. Incluye creación, edición y eliminación de usuarios, búsqueda, filtro por estado, paginación y exportación CSV.

## Requisitos

- Node.js 20 o superior
- MongoDB local o una instancia de MongoDB Atlas

## Configuración

Desde la carpeta del proyecto:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Copia las variables de ejemplo y configura la conexión a MongoDB:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

En `server/.env`, configura `MONGODB_URI` con la dirección de tu base de datos. `CLIENT_ORIGIN` y `VITE_API_URL` deben apuntar a las direcciones donde se ejecutan el frontend y el backend.

## Desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` y la API en `http://localhost:4000`. También puedes iniciar cada parte por separado con `npm run dev --prefix server` y `npm run dev --prefix client`.

## API

La API devuelve JSON y está disponible bajo `/api`:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del servicio |
| `GET` | `/api/users` | Lista paginada; acepta `page`, `limit`, `q` y `status` |
| `GET` | `/api/users/stats` | Totales de usuarios activos e inactivos |
| `GET` | `/api/users/:id` | Obtiene un usuario |
| `POST` | `/api/users` | Crea un usuario |
| `PATCH` | `/api/users/:id` | Actualiza los campos enviados |
| `DELETE` | `/api/users/:id` | Elimina un usuario |

Cada usuario tiene nombre y correo obligatorios; correo único; teléfono, cargo y departamento opcionales; y estado activo o inactivo. La API valida los datos y responde con errores explícitos para entradas inválidas y correos duplicados.
