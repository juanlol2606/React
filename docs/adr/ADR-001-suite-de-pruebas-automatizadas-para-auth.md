# ADR-0001: Construir una suite de pruebas automatizadas para el módulo Auth

## Estado
Aceptada

## Problema que resuelve (semana 3)
Problema 4, ausencia de pruebas automatizadas: en el backend el único test es `Backend/test/app.e2e-spec.ts` (generado por NestJS, solo verifica `GET /`), no existe ningún `*.spec.ts` para `AuthController`, `AuthService`, `JwtStrategy` ni `UserRoleGuard`, y el frontend no tiene tests ni un script `test` en su `package.json`. Ningún flujo crítico de Auth está verificado, por lo que cualquier cambio (incluida esta re-arquitectura) puede romper la autenticación sin que nadie lo note.

## Cambio propuesto
Crear, antes de tocar seguridad y mantenibilidad, una suite mínima que cubra los 7 flujos críticos de Auth:
1. Registro exitoso.
2. Registro con correo duplicado (responde 400).
3. Login válido.
4. Login inválido (responde 401).
5. Validación del JWT en `JwtStrategy` (token válido, usuario inexistente o inactivo).
6. Rechazo de rutas protegidas sin token (401).
7. Autorización por rol con `UserRoleGuard` (403 si el rol no corresponde).

Pruebas unitarias con Jest (repositorio y `JwtService` simulados) para `AuthService` y los guards, y pruebas e2e con Supertest contra `/auth/*`. En el frontend, agregar Vitest y el script `test` para el store de Zustand (`auth.store.ts`). Ejecutar `jest --coverage` en el pipeline.

## Código afectado
- Nuevo: `Backend/src/auth/auth.service.spec.ts`, `Backend/src/auth/auth.controller.spec.ts`, `Backend/src/auth/strategies/jwt.strategy.spec.ts`, `Backend/src/auth/guards/user-role.guard.spec.ts`
- Nuevo: `Backend/test/auth.e2e-spec.ts` (junto a `app.e2e-spec.ts`)
- `Backend/package.json` (umbral de cobertura) y `Frontend/package.json` (script `test`, Vitest)
- Nuevo en el frontend: pruebas de `auth.store.ts`

## Atributo de calidad que mejora (semana 8)
**Testabilidad** (escenario 3): cada cambio en `AuthService` o en un guard dispara la suite y reporta regresiones. Meta: al menos 1 caso por cada uno de los 7 flujos y cobertura de al menos 70% en `AuthController` y `AuthService` (hoy 0%).

## Consecuencias
- (+) Los ADR siguientes se pueden implementar con verificación automática.
- (-) Hay que mantener las pruebas y simular el repositorio y el JWT.
