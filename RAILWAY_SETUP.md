# Configuración Railway — FoundTeach

Pasos para configurar los servicios en Railway y conectar **foundteach.com** al servicio Web.

## 1. Servicio Web (sitio institucional)

### Root Directory
- **Settings** → **Source** → Root Directory: dejar **vacío** (raíz del repo)

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
- **Settings** → **Source** → Root Directory: `api`

### Base de datos
1. En el servicio **Postgres**: **Variables** → copiar `DATABASE_URL`
2. En el servicio **API**: **Variables** → **Add Variable**
3. Seleccionar **Reference** → Postgres → `DATABASE_URL`

O vincular Postgres al servicio API desde el panel de Postgres.

---

## 3. Resumen de Root Directories

| Servicio | Root Directory |
|----------|----------------|
| web      | *(vacío)*      |
| api      | `api`          |
| Postgres | —              |
