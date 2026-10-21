# Pruebas

Las pruebas se ejecutan con Jest desde `src/backend/`:

```sh
cd src/backend
npm test            # pruebas unitarias (archivos *.spec.ts dentro de src/)
npm run test:e2e    # pruebas e2e (carpeta src/backend/test/)
```

La prueba existente hoy es la plantilla generada por NestJS (`src/backend/test/app.e2e-spec.ts`). Esta carpeta servirá de índice y para las pruebas de punta a punta del proyecto.
