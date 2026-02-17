# FoundTeach Monorepo

Sitio web institucional y API de **FoundTeach** — empresa de ingeniería de software.

## Arquitectura

Monorepo basado en [Turbo](https://turbo.build/repo) con las siguientes tecnologías:

- **Frontend:** Next.js (App Router, TypeScript)
- **Backend:** NestJS (TypeScript, Prisma)
- **Base de Datos:** Postgres
- **Package Manager:** npm Workspaces

## Estructura del Proyecto

```
foundteach/
├── apps/
│   ├── web/          # Sitio institucional (Next.js)
│   └── api/          # Backend API (NestJS + Prisma)
├── legacy/           # Versiones anteriores (Express, Sitios Estáticos)
├── package.json      # Configuración de Workspaces
└── turbo.json        # Configuración de Orquestación
```

## Desarrollo Local

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar ambos servicios en paralelo (modo desarrollo):

```bash
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Base de Datos (Prisma)

En `apps/api`:

- `npm run db:generate` para generar el cliente de Prisma.
- `npm run db:migrate` para aplicar migraciones.

## Configuración Railway

| Servicio | Root Directory |
| -------- | -------------- |
| **web**  | `apps/web`     |
| **api**  | `apps/api`     |
