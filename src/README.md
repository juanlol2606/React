# `src/` — código de la refactorización

El código fuente de SHOP vive en dos aplicaciones independientes dentro de `src/`. Cada una conserva su propio `package.json`, Dockerfile y configuración (con rutas relativas).

| Aplicación | Ruta | Tecnología |
|---|---|---|
| Backend | [`src/backend/`](backend/) | NestJS + TypeORM + PostgreSQL |
| Frontend | [`src/frontend/`](frontend/) | React + Vite |

Este índice indica dónde está la estructura de la refactorización del módulo Auth.

## Backend: `src/backend/src/auth/`

El módulo Auth se organiza en capas. Cada capa solo depende de la que tiene debajo.

```
src/backend/src/auth/
├── auth.module.ts                   # cableado: TypeORM, Passport y JwtModule (configuración JWT)
│
│   ── Presentación ──────────────────────────────────────────────────────────────
├── auth.controller.ts               # rutas register, login y check-status           [ADR-001, ADR-003]
├── dto/
│   ├── create-user.dto.ts           # entrada: registro
│   ├── login-user.dto.ts            # entrada: login
│   ├── user-response.dto.ts         # salida: lista blanca con @Expose()             [ADR-001, nuevo]
│   ├── auth-response.dto.ts         # salida: { user, token }                        [ADR-001, nuevo]
│   └── index.ts
│
│   ── Control de acceso ─────────────────────────────────────────────────────────
├── decorators/                      # @Auth, @RoleProtected y @GetUser (@RawHeaders retirado [ADR-003])
├── guards/user-role.guard.ts        # autorización por roles
├── strategies/jwt.strategy.ts       # estrategia Passport: valida el JWT y carga el usuario
│
│   ── Aplicación ───────────────────────────────────────────────────────────────
├── auth.service.ts                  # registro, login y renovación del token         [ADR-001]
│
│   ── Persistencia ─────────────────────────────────────────────────────────────
├── entities/user.entity.ts          # entidad User (tabla `users`)
│
│   ── Transversal ──────────────────────────────────────────────────────────────
└── interfaces/                      # JwtPayload y ValidRoles
```

| Capa | Archivos | Responsabilidad |
|---|---|---|
| Presentación | `auth.controller.ts`, `dto/*` | Recibir y validar la petición HTTP y dar forma a la respuesta (sin `password`). |
| Control de acceso | `decorators/*`, `guards/user-role.guard.ts`, `strategies/jwt.strategy.ts` | Autenticar con JWT y autorizar por rol. |
| Aplicación | `auth.service.ts` | Reglas de negocio: cifrado con bcrypt, emisión del JWT y manejo de errores. |
| Persistencia | `entities/user.entity.ts` + `Repository<User>` de TypeORM | Acceso a la tabla `users`. El repositorio lo inyecta TypeORM en `AuthService` y `JwtStrategy`; no existe una clase de repositorio propia. |

Las pruebas están junto al código, en `src/backend/src/auth/**/*.spec.ts` (ver [`tests/`](../tests/README.md)).

### Planificado (no existe todavía)

Lo que sigue **no está en el repositorio**; llegará con la ADR-002:

- `auth/services/token.service.ts` — *planificado*.
- `auth/guards/csrf.guard.ts` — *planificado*.

## Frontend: `src/frontend/src/`

- `auth/` — páginas, store de Zustand y acciones.
- `api/eShopApi.ts` — cliente HTTP (axios).
- `components/routes/ProtectedRoutes.tsx` — rutas protegidas.

El código del Frontend solo se movió de lugar; no se modificó.

## Decisiones de refactorización

| ADR | Decisión | Estado | Dónde se ve |
|---|---|---|---|
| ADR-001 | Exclusión declarativa de `password` con DTOs de respuesta | Implementada | `dto/user-response.dto.ts`, `dto/auth-response.dto.ts`, `auth.service.ts` |
| ADR-002 | JWT en cookie HttpOnly con protección CSRF | **Pendiente** | — (ver «Planificado») |
| ADR-003 | Retiro de las rutas de prueba `private`, `private2` y `private3` y del decorador `@RawHeaders` | Implementada | `auth.controller.ts`, `decorators/` |
| ADR-004 | Estrategia de pruebas automatizadas | Implementada (inicial) | 45 pruebas en 4 suites, ver [`tests/`](../tests/README.md) |

Más detalle en [`docs/arquitectura.md`](../docs/arquitectura.md).
