# SHOP — Re-arquitectura del módulo de autenticación (Auth)

[![CI](https://github.com/juanlol2606/React/actions/workflows/ci.yml/badge.svg)](https://github.com/juanlol2606/React/actions/workflows/ci.yml)

Plataforma de comercio electrónico: **Backend** en NestJS, TypeORM y PostgreSQL; **Frontend** en React, Vite, TypeScript y Zustand. Permite registrarse e iniciar sesión con JSON Web Token (JWT), consultar un catálogo con paginación y filtros, administrar productos con roles, subir archivos y usar mensajería en tiempo real (WebSocket).

**Proyecto de Arquitectura de Sistemas — Universidad Luis Amigó.** Integrantes: Sebastian Patiño Sandoval, Juan David Diaz Quiros, Isaac Tamayo Sierra, Edison Ciro.

## Módulo MVP: Auth

Registro, inicio y cierre de sesión, emisión y validación del JWT (Passport), protección de rutas con guards y autorización por roles (`admin`, `super-user`, `user`). Código en `src/backend/src/auth` y `src/frontend/src/auth`.

## Estructura del repositorio

```
.
├── .github/              CI (GitHub Actions) y plantilla de pull request
├── docs/                 Documentación del proyecto
├── src/
│   ├── backend/          API NestJS (módulo Auth en src/backend/src/auth)
│   └── frontend/         SPA React (módulo Auth en src/frontend/src/auth)
├── tests/                Índice de pruebas
├── CONTRIBUTING.md       Flujo de trabajo del equipo
└── README.md
```

## Ejecución básica

**Backend** (detalle en [`src/backend/README.md`](src/backend/README.md)):

```sh
cd src/backend
cp .env.template .env      # completar STAGE=dev, JWT_SECRET y credenciales de BD
docker compose up -d       # levanta la API y PostgreSQL
# Semilla de datos: GET http://localhost:3000/api/seed   |   Swagger: http://localhost:3000/api
```

Para ejecutar la API fuera de Docker, levante solo la base (`docker compose up -d db`), use `DB_HOST=localhost` en `.env` y ejecute `npm install` y `npm run start:dev`.

**Frontend:**

```sh
cd src/frontend
cp .env.template .env      # VITE_API_URL=http://localhost:3000/api
pnpm install
pnpm dev
```

Usuarios de la semilla: `test1@google.com` (admin) y `test2@google.com`, ambos con contraseña `Abc123`.

## Pruebas

Ver [`tests/README.md`](tests/README.md). Para colaborar, vea [`CONTRIBUTING.md`](CONTRIBUTING.md).
