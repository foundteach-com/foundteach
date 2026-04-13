# Configuración Railway — FoundTeach

Pasos para configurar los servicios en Railway y conectar **foundteach.com** al servicio Web.

## 1. Servicio Web (sitio institucional)

### Root Directory

- **Settings** → **Source** → Root Directory: dejar **vacío** (raíz del repo)

### Build & Start Commands

- **Build Command**: `npm run build:web`
- **Start Command**: `npm run start:web`

### Dominio foundteach.com

1. **Settings** → **Networking** → **+ Custom Domain**
2. Escribir: `foundteach.com`
3. Copiar el valor CNAME que muestra Railway (ej: `xxxx.up.railway.app`)
4. En tu proveedor DNS:
   - Tipo: **CNAME**
   - Nombre: `@` (o vacío para el dominio raíz)
   - Valor: el CNAME de Railway
5. Esperar propagación (puede tardar hasta 72 h)

### Generar dominio Railway (opcional)

- **Settings** → **Networking** → **Generate Domain** (para pruebas antes del dominio personalizado)

---

## 2. Servicio API

### Root Directory

- **Settings** → **Source** → Root Directory: `apps/api`

### Build & Start Commands

- **Build Command**: `npm install && npm run build:prod`
- **Start Command**: `npm run start:prod`

> ℹ️ `build:prod` ejecuta `prisma generate && nest build` directamente, sin pasar por Turbo. Esto garantiza la compatibilidad con el entorno de Railway.

### Variables de entorno requeridas

| Variable         | Descripción                                                  |
| ---------------- | ------------------------------------------------------------ |
| `DATABASE_URL`   | Conexión PostgreSQL (referenciar desde el servicio Postgres) |
| `JWT_SECRET`     | Clave secreta para firmar los tokens JWT                     |
| `JWT_EXPIRATION` | Duración del token (ej: `24h`)                               |
| `PORT`           | Puerto (Railway lo inyecta automáticamente)                  |
| `DO_SPACES_KEY`    | Access Key de DigitalOcean Spaces                            |
| `DO_SPACES_SECRET` | Secret Key de DigitalOcean Spaces                            |
| `DO_SPACES_BUCKET` | Nombre del Bucket (Space)                                    |
| `DO_SPACES_REGION` | Región (ej: `nyc3`)                                          |

### Base de datos

1. En el servicio **Postgres**: **Variables** → copiar `DATABASE_URL`
2. En el servicio **API**: **Variables** → **Add Variable**
3. Seleccionar **Reference** → Postgres → `DATABASE_URL`

O vincular Postgres al servicio API desde el panel de Postgres.

---

## 3. Servicio Admin (Panel de Administración)

### Root Directory

- **Settings** → **Source** → Root Directory: dejar **vacío** (raíz del repo)

### Build & Start Commands

- **Build Command**: `npm run build:admin`
- **Start Command**: `npm run start:admin`

### Dominio admin.foundteach.com

1. **Settings** → **Networking** → **+ Custom Domain**
2. Escribir: `admin.foundteach.com`
3. Copiar el valor CNAME y configurar en DNS como se hizo con el sitio web.

---

---


## 5. Servicio Videogame (app.foundteach.com)

### Root Directory

- **Settings** → **Source** → Root Directory: dejar **vacío** (raíz del repo)

### Build & Start Commands

- **Build Command**: `npm run build:videogame`
- **Start Command**: `npm run start:videogame`

### Dominio app.foundteach.com

1. **Settings** → **Networking** → **+ Custom Domain**
2. Escribir: `app.foundteach.com`
3. Copiar el valor CNAME y configurar en DNS.

---

## 6. Resumen de Configuración en Railway

| Servicio  | Root Directory | Build Command                       | Start Command           |
| --------- | -------------- | ----------------------------------- | ----------------------- |
| web       | _(vacío)_      | `npm run build:web`                 | `npm run start:web`     |
| api       | `apps/api`     | `npm install && npm run build:prod` | `npm run start:prod`    |
| admin     | _(vacío)_      | `npm run build:admin`               | `npm run start:admin`   |
| videogame | _(vacío)_      | `npm run build:videogame`           | `npm run start:videogame`|
| Postgres  | —              | —                                   | —                       |
