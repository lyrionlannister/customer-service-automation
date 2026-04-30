# Sistema de Login/Registro - Guía de Configuración

## Backend - Configuración

### 1. Variables de Entorno

Copiar el archivo `.env.example` a `.env` en la carpeta `api/`:

```bash
cp api/.env.example api/.env
```

Configurar las variables según tu entorno:

- `DB_HOST`: Host de PostgreSQL (default: localhost)
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_USERNAME`: Usuario de PostgreSQL (default: n8n)
- `DB_PASSWORD`: Contraseña de PostgreSQL (default: n8n_password_dev)
- `DB_NAME`: Nombre de la BD (default: app_db)
- `JWT_SECRET`: Clave secreta para JWT (CAMBIAR EN PRODUCCIÓN)
- `NODE_ENV`: Entorno (development/production)

### 2. Base de Datos

La base de datos se inicializa automáticamente con TypeORM al iniciar el servidor.

Las tablas se crean automáticamente desde las entidades:

- `users` - Tabla de usuarios con los campos: id, firstName, lastName, email, password, createdAt, updatedAt

### 3. Estructura del Backend

```
api/src/
├── entities/
│   └── user.entity.ts          # Entidad User
├── dtos/
│   ├── register-user.dto.ts    # DTO para registro
│   └── login-user.dto.ts       # DTO para login
├── daos/
│   ├── base.dao.ts             # DAO genérico CRUD
│   └── user.dao.ts             # DAO específico de usuarios
├── services/
│   └── auth.service.ts         # Lógica de autenticación
├── controllers/
│   └── auth.controller.ts      # Controlador de autenticación
├── routes/
│   └── auth.routes.ts          # Rutas de autenticación
├── middlewares/
│   └── auth.middleware.ts      # Middleware de autenticación (JWT)
├── config/
│   └── data-source.ts          # Configuración de TypeORM
└── index.ts                    # Punto de entrada
```

### 4. Endpoints

#### Registro de Usuario

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "password": "miPassword123"
}

Respuesta exitosa (201):
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "createdAt": "2024-04-30T...",
    "updatedAt": "2024-04-30T..."
  }
}

Respuesta error (400):
{
  "error": "Email ya registrado"
}
```

#### Login de Usuario

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "juan@email.com",
  "password": "miPassword123"
}

Respuesta exitosa (200):
{
  "message": "Sesión iniciada exitosamente",
  "user": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "createdAt": "2024-04-30T...",
    "updatedAt": "2024-04-30T..."
  },
  "token": "eyJhbGc..."
}

Respuesta error (401):
{
  "error": "Email no registrado" | "Contraseña invalida"
}
```

### 5. Validaciones

El backend valida:

- **Nombre**: Requerido, debe ser texto
- **Apellido**: Requerido, debe ser texto
- **Email**: Requerido, debe ser un email válido, debe ser único
- **Password**: Requerido, mínimo 8 caracteres

## Frontend - Configuración

### 1. Rutas

Se agregaron dos nuevas rutas:

- `/admin/sign-in` - Página de login
- `/admin/sign-up` - Página de registro

### 2. Componentes Nuevos

#### Hooks (en `client/src/modules/common/hooks/`)

- `use-login.ts` - Hook para login, maneja loading, error y success
- `use-register.ts` - Hook para registro, maneja loading, error y success

#### Componentes (en `client/src/modules/auth/components/`)

- `register-form.tsx` - Formulario de registro

#### Páginas (en `client/src/modules/auth/pages/`)

- `register-page.tsx` - Página de registro

### 3. Flujo de Autenticación

**Login:**

1. Usuario ingresa email y contraseña
2. Hook `useLogin` envía petición a `/api/v1/auth/login`
3. Si es exitoso, guarda el token en `sessionStorage.accessToken`
4. Guarda los datos del usuario en `sessionStorage.user`
5. Redirige al dashboard

**Registro:**

1. Usuario completa el formulario (nombre, apellido, email, password)
2. Hook `useRegister` envía petición a `/api/v1/auth/register`
3. Si es exitoso, muestra mensaje de éxito
4. Redirige a la página de login

### 4. Autenticación y Protección de Rutas

El token se almacena en `sessionStorage.accessToken` y se envía automáticamente en el header `Authorization: Bearer <token>` por el `CommonController`.

Para proteger rutas en el frontend, se verifica si existe `sessionStorage.accessToken`.

### 5. Middleware de Autenticación (Backend)

Para proteger rutas en el backend, usar el middleware `authMiddleware`:

```typescript
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/protected-route", authMiddleware, (req, res) => {
  // req.user contiene { id, email }
  res.json({ user: req.user });
});
```

## Ejecución

### Desarrollo

**Backend:**

```bash
cd api
pnpm dev
```

**Frontend:**

```bash
cd client
pnpm dev
```

### Docker Compose

El proyecto tiene un `docker-compose.yaml` que configura:

- PostgreSQL
- Redis
- N8N
- API de customer-service

Para ejecutar todo:

```bash
docker-compose up
```

Asegúrate de tener las variables de entorno correctas configuradas.

## Notas Importantes

1. **Contraseñas**: Se hashean con bcryptjs (10 salts)
2. **JWT**: Expira en 24 horas
3. **Email**: Debe ser único en la BD
4. **CORS**: Configurar según necesidad si es necesario
5. **Producción**: Cambiar `JWT_SECRET` a una clave muy segura
6. **Base de datos**: En docker-compose, la DB está en el servicio `postgres`

## Troubleshooting

### La base de datos no conecta

- Verificar que PostgreSQL esté corriendo
- Verificar las variables de entorno DB\_\*
- Revisar los logs del contenedor de PostgreSQL

### Errores de compilación TypeScript

- Ejecutar `pnpm build` en la carpeta `api/`
- Verificar que todos los imports tengan la extensión `.js`

### El token no se envía

- Verificar que `sessionStorage.accessToken` esté guardado
- Verificar que el `CommonController` está leyendo el token correctamente
