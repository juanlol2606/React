# ADR-0004: Mover el JWT de localStorage a una cookie httpOnly con protección CSRF

## Estado
Aceptada

## Problema que resuelve (semana 3)
Problema 3, token guardado en `localStorage`: `auth.store.ts` guarda el JWT con `localStorage.setItem` (en `login`, `register` y `checkAuthStatus`) y el interceptor de `eShopApi.ts` lo lee y lo envía como `Authorization: Bearer`. Un ataque XSS exitoso puede leer el token con JavaScript y suplantar al usuario durante las 2 horas de validez.

## Cambio propuesto
1. **Backend:** al registrar o iniciar sesión, `AuthController` enviará el JWT en una cookie `httpOnly`, `Secure` y `SameSite` (`res.cookie(...)` con `passthrough`), y dejará de devolverlo en el cuerpo. `JwtStrategy` extraerá el token de la cookie (con `cookie-parser`) en vez del header. Nuevo `POST /auth/logout` que limpia la cookie.
2. **CORS:** en `main.ts`, reemplazar `enableCors()` por una lista de orígenes permitidos con `credentials: true`.
3. **CSRF:** usar `SameSite` y un token CSRF (patrón double-submit cookie) exigido en las solicitudes de mutación (POST, PUT, PATCH, DELETE).
4. **Expiración y renovación:** reutilizar `GET /auth/check-status`, que ya emite un token nuevo, para renovar la cookie, y definir un `expiresIn` explícito.
5. **Frontend:** quitar `localStorage` de `auth.store.ts`, configurar Axios con `withCredentials: true` en `eShopApi.ts` y eliminar el header `Authorization` del interceptor. El store guardará solo el estado del usuario en memoria.

## Código afectado
- `src/backend/src/auth/auth.controller.ts` (`login`, `register`, `check-status`, nuevo `logout`)
- `src/backend/src/auth/strategies/jwt.strategy.ts` (extracción desde cookie)
- `src/backend/src/auth/auth.module.ts` (`expiresIn`)
- `src/backend/src/main.ts` (CORS con credenciales, `cookie-parser`, CSRF)
- Frontend: `auth.store.ts`, `eShopApi.ts`, `login.action.ts` y `register.action.ts`

## Atributo de calidad que mejora (semana 8)
**Seguridad** (escenario 1): 0% de tokens legibles desde `localStorage` o `document.cookie`, 100% de rutas protegidas responden 401 sin token válido, y 100% de las mutaciones exigen token CSRF.

## Consecuencias
- (+) Un XSS ya no puede leer el token.
- (-) Las cookies exponen a CSRF, por eso se añade esa protección; hay más configuración de CORS y cookies entre dominios (despliegue frontend y backend). Esto no elimina todo el riesgo de XSS: un script malicioso aún puede hacer solicitudes en nombre del usuario mientras la sesión esté activa.
