# SHOP — Re-arquitectura del módulo de autenticación (Auth)

Plataforma de comercio electrónico: **Backend** en NestJS, TypeORM y PostgreSQL; **Frontend** en React, Vite, TypeScript y Zustand. Permite registrarse e iniciar sesión con JSON Web Token (JWT), consultar un catálogo con paginación y filtros, administrar productos según el rol, subir archivos y usar mensajería en tiempo real (WebSocket).

**Proyecto de Arquitectura de Sistemas — Universidad Luis Amigó.** Integrantes: Sebastian Patiño Sandoval, Juan David Diaz Quiros, Isaac Tamayo Sierra, Edison Ciro.

## Módulo MVP: Auth

El módulo que se re-arquitecta es el de autenticación y autorización:

- **Backend:** registro (`POST /api/auth/register`), inicio de sesión (`POST /api/auth/login`) y renovación del token (`GET /api/auth/check-status`); emisión y validación del JWT con Passport (vigencia de 2 horas), protección de rutas con guards y autorización por roles (`admin`, `super-user`, `user`). Código en [`src/backend/src/auth`](src/backend/src/auth).
- **Frontend:** páginas de inicio de sesión y registro, estado de sesión con Zustand y rutas protegidas. Código en [`src/frontend/src/auth`](src/frontend/src/auth).

La estructura de capas del módulo y el estado de cada decisión están en [`src/README.md`](src/README.md).

## Problemas arquitectónicos identificados (Semana 3)

| # | Problema | Estado | Decisión |
|---|---|---|---|
| 1 | Endpoints de prueba `GET /auth/private`, `/private2` y `/private3` expuestos en producción | Resuelto: rutas y decorador `@RawHeaders` retirados | [ADR-003](docs/adr/ADR-003-retirar-endpoints-de-prueba-de-auth.md) |
| 2 | Exclusión manual de la contraseña con `delete user.password` | Resuelto: DTOs de respuesta con lista blanca (`@Expose`) | [ADR-002](docs/adr/ADR-002-exclusion-declarativa-del-password.md) |
| 3 | JWT guardado en `localStorage`, expuesto ante un XSS exitoso | Pendiente: decisión aceptada, sin implementar | [ADR-004](docs/adr/ADR-004-jwt-en-cookie-httponly-con-proteccion-csrf.md) |
| 4 | Ausencia de pruebas automatizadas | Iniciado: 45 pruebas en 4 suites para el módulo Auth | [ADR-001](docs/adr/ADR-001-suite-de-pruebas-automatizadas-para-auth.md) |

Arquitectura objetivo, tabla de componentes y sus responsabilidades: **[`docs/arquitectura.md`](docs/arquitectura.md)**. Vistas C4 (contexto, contenedores, componentes y despliegue): [`docs/diagramas/`](docs/diagramas/README.md).

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`docs/`](docs/) | Arquitectura ([`arquitectura.md`](docs/arquitectura.md)), decisiones ([`adr/`](docs/adr/)) y diagramas C4 ([`diagramas/`](docs/diagramas/README.md)) |
| [`src/backend/`](src/backend/README.md) | API NestJS (TypeORM, PostgreSQL, Swagger) |
| [`src/frontend/`](src/frontend/README.md) | SPA React (Vite, Tailwind, Zustand, TanStack Query) |
| [`src/`](src/README.md) | Índice de la refactorización: capas del módulo Auth y decisiones implementadas |
| [`tests/`](tests/README.md) | Índice de pruebas y resultado de cobertura ([`resultados/`](tests/resultados/cobertura-auth.txt)) |

## Cómo ejecutarlo

### Requisitos

- Node.js 22 o superior.
- pnpm: el proyecto fija la versión en `packageManager`; basta con `corepack enable`.
- Docker, para la base de datos PostgreSQL.

### Backend

```sh
cd src/backend
cp .env.template .env      # completar STAGE=dev, JWT_SECRET y credenciales de la base de datos
docker compose up -d db    # levanta solo PostgreSQL
pnpm install
pnpm run start:dev
```

En `.env` use `DB_HOST=localhost` cuando la API corre fuera de Docker. La API queda en `http://localhost:3000/api`, con la documentación Swagger en esa misma ruta.

Para cargar datos de ejemplo, abra `http://localhost:3000/api/seed`. Crea productos y dos usuarios: `test1@google.com` (admin) y `test2@google.com`, ambos con la contraseña `Abc123`.

El detalle del Backend, incluido el uso de Docker Compose para levantar también la API, está en [`src/backend/README.md`](src/backend/README.md).

### Frontend

```sh
cd src/frontend
cp .env.template .env      # VITE_API_URL=http://localhost:3000/api
pnpm install
pnpm dev                   # http://localhost:5173
```

### Pruebas del Backend

No requieren base de datos.

```sh
cd src/backend
pnpm install
pnpm test                  # 45 pruebas en 4 suites del módulo Auth
pnpm run test:cov:auth     # cobertura solo del módulo Auth
```

## Estado y pendientes

Implementado: las decisiones ADR-001 (pruebas iniciales), ADR-002 (exclusión declarativa de `password`) y ADR-003 (retiro de rutas de prueba).

Pendiente:

- ADR-004: mover el JWT a una cookie `httpOnly` con protección CSRF.
- Pruebas e2e con PostgreSQL (la plantilla actual está omitida), pruebas del Frontend (Vitest) y CI.

El detalle está en [`src/README.md`](src/README.md) y [`tests/README.md`](tests/README.md).
