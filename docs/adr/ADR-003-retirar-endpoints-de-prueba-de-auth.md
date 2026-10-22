# ADR-0003: Retirar los endpoints de prueba `private`, `private2` y `private3`

## Estado
Aceptada

## Problema que resuelve (semana 3)
Problema 1, endpoints de prueba en producción: `AuthController` expone `GET /auth/private`, `/private2` y `/private3`, residuos de aprendizaje sin función de negocio. `/private` conserva un `console.log(user)` y devuelve `rawHeaders` y `headers` completos (incluido el token) en la respuesta, lo que amplía la superficie de ataque.

## Cambio propuesto
1. Eliminar `testPrivateRoute`, `privateRoute2` y `privateRoute3` de `AuthController`.
2. Conservar `check-status` con `@Auth()` como patrón estándar de ruta protegida, y estandarizar la protección con el decorador `@Auth(...roles)` en lugar de combinar `@UseGuards(AuthGuard(), UserRoleGuard)` y `@RoleProtected` a mano.
3. Mover la demostración de roles a pruebas automatizadas (ADR-0001), con un controlador de prueba solo en el entorno de test si hace falta.
4. Retirar los `console.log` restantes (por ejemplo en `handleDBErrors`) y usar `Logger` de NestJS.

## Código afectado
- `Backend/src/auth/auth.controller.ts` (rutas `private*` y `console.log`)
- `Backend/src/auth/auth.service.ts` (`console.log` en `handleDBErrors`)
- Decoradores `@Auth`, `@RoleProtected` y `@GetUser` en `Backend/src/auth/decorators/`, sin cambios, ya usados como forma estándar

## Atributo de calidad que mejora (semana 8)
**Seguridad y Mantenibilidad:** se elimina la exposición de headers y los logs de depuración en producción, y hay menos código sin valor de negocio que mantener.

## Consecuencias
- (+) Menor superficie de ataque y un único patrón de protección de rutas.
- (-) Se pierden los ejemplos de uso de guards; se cubren con las pruebas del ADR-0001.
