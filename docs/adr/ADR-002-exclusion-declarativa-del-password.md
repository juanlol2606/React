# ADR-0002: Excluir el campo `password` de forma declarativa

## Estado
Aceptada

## Problema que resuelve (semana 3)
Problema 2, ocultar la contraseña de forma manual: `AuthService.create()` y `AuthService.login()` repiten `delete user.password` para no devolver el hash. Como la entidad usa `select: false` y `login()` selecciona `password` explícitamente, un endpoint nuevo que haga lo mismo y olvide esa línea filtraría el hash en la respuesta.

## Cambio propuesto
Quitar los `delete user.password` y excluir el campo de forma declarativa:
1. Marcar `password` con `@Exclude()` (class-transformer) en `User`, manteniendo `select: false`.
2. Registrar `ClassSerializerInterceptor` de forma global en `main.ts` (o en `AuthController`), de modo que ninguna respuesta con una entidad `User` incluya el hash.
3. Como alternativa si se prefiere, devolver un DTO de salida (`AuthResponseDto`) con solo los campos públicos.
4. Agregar pruebas que verifiquen que `register`, `login` y `check-status` nunca devuelven `password`.

## Código afectado
- `src/backend/src/auth/auth.service.ts` (`create()` y `login()`)
- `src/backend/src/auth/entities/user.entity.ts`
- `src/backend/src/main.ts` o `src/backend/src/auth/auth.controller.ts` (interceptor)
- Tests del ADR-0001 (verifican la exclusión)

## Atributo de calidad que mejora (semana 8)
**Mantenibilidad y Seguridad** (escenario 2): el 100% de los endpoints de Auth excluye `password`, verificable con una prueba automatizada, y ningún endpoint nuevo necesita una línea manual adicional.

## Consecuencias
- (+) El hash no depende de la memoria del desarrollador.
- (-) La serialización pasa a depender de `class-transformer`, y hay que recordar que el interceptor debe estar activo.
