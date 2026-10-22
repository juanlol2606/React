# `tests/` — pruebas del módulo MVP

Las pruebas viven junto al código (convención de NestJS) y se ejecutan con Jest desde `src/backend/`.

| Archivo | Tipo | Qué verifica |
|---|---|---|
| `src/backend/src/auth/auth.service.spec.ts` | Unitaria | Cifrado con bcrypt, JWT, errores 400/401/500, y que la respuesta no incluya `password` (ADR-001) |
| `src/backend/src/auth/strategies/jwt.strategy.spec.ts` | Unitaria | Passport: usuario válido, inexistente o inactivo |
| `src/backend/src/auth/guards/user-role.guard.spec.ts` | Unitaria | Autorización por roles (permitido, 403, 400) |
| `src/backend/src/auth/auth.integration.spec.ts` | Integración HTTP | Registro, login, `check-status`, token inválido, expirado o de otra firma, roles 401/403/200 y rutas `private*` retiradas (404) |
| `src/backend/test/app.e2e-spec.ts` | E2E (plantilla) | **Conservada y omitida**: exige PostgreSQL y espera `GET /`. Se reemplazará en la Semana 14 |

## Ejecutar

```sh
cd src/backend
pnpm install
pnpm test                # 45 pruebas, 4 suites, sin base de datos
pnpm run test:cov:auth   # cobertura del módulo Auth
```

## Resultado a la fecha

45 pruebas en verde. Cobertura de `AuthController` y `AuthService` del 100 %; módulo Auth completo, 89,67 % de sentencias. Estado antes de esta entrega: 0 pruebas (`pnpm test` terminaba con "No tests found").

La salida completa de la cobertura está en [`resultados/cobertura-auth.txt`](resultados/cobertura-auth.txt).

Pendiente: pruebas e2e con PostgreSQL, pruebas del Frontend (Vitest) y CI. Ver [ADR-004](../docs/adr/ADR-001-suite-de-pruebas-automatizadas-para-auth.md).
