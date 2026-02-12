# FoundTeach

Sitio web institucional y API de **FoundTeach** — empresa de ingeniería de software.

## Arquitectura

Monorepo con tres servicios en [Railway](https://railway.app):

| Servicio | Descripción | Raíz |
|----------|-------------|------|
| **web** | Sitio institucional (HTML, CSS, JS) | raíz del repo |
| **api** | Backend API (Express + Postgres) | `/api` |
| **Postgres** | Base de datos | — |

## Configuración Railway

### Servicio Web (foundteach.com)

1. **Root Directory**: vacío (raíz del repo)
2. **Dominio personalizado**: 
   - Settings → Networking → + Custom Domain
   - Agregar `foundteach.com`
   - Crear registro CNAME en DNS apuntando al valor que indica Railway

### Servicio API

1. **Root Directory**: `api`
2. **Variables**: Railway inyecta `DATABASE_URL` al vincular el servicio Postgres
3. Vincular Postgres: Variables → Add Variable → Reference → Postgres → `DATABASE_URL`

### Servicio Postgres

- Crear desde Railway (Database → Postgres)
- Vincular al servicio API para compartir `DATABASE_URL`

## Desarrollo local

### Web

```bash
npm install
npm start
```

Sitio en `http://localhost:3000`.

### API

```bash
cd api
npm install
DATABASE_URL=postgresql://user:pass@localhost:5432/foundteach npm start
```

API en `http://localhost:4000`.

## Estructura

```
foundteach/
├── index.html        # Sitio institucional
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── server.js         # Servidor web (Express)
├── package.json      # Web
├── Procfile          # Railway web
├── api/              # Backend API
│   ├── server.js
│   └── package.json
└── README.md
```
