# Actualización del memory bank

- **`producto.md`:** actualizar cuando cambien los KPI, gráficos, campos o endpoints que definen lo que el dashboard muestra, o la procedencia de los movimientos. Fuentes: `frontend/src/App.tsx:19-20`, `frontend/src/App.tsx:62-70`, `backend/app/routes.py:22-28`, `backend/app/routes.py:252-262`.
- **`stack.md`:** actualizar si cambian dependencias/versiones declaradas, imágenes base, servicios Compose o puertos publicados. Fuentes: `frontend/package.json:18-42`, `backend/requirements.txt:1-6`, `frontend/Dockerfile:1`, `backend/Dockerfile:1`, `docker-compose.yml:1-22`.
- **`arquitectura.md`:** actualizar si cambia el flujo frontend-API, el proxy de Vite, los modelos/rutas backend, la generación de datos o la topología de Compose. Fuentes: `frontend/src/App.tsx:19-37`, `frontend/vite.config.ts:8-15`, `backend/app/routes.py:22-28`, `backend/app/routes.py:98-108`, `docker-compose.yml:1-22`.
- **`estado-actual.md`:** actualizar cuando haya nuevos resultados de pruebas o verificaciones manuales, cuando se confirme o resuelva un problema de entorno, o cuando cambie el estado de un riesgo de `hallazgos.md`. Fuentes: `.agents/validacion-reglas.md` (pruebas 1 y 3), `verification.md` (resultado Codespaces), `hallazgos.md:13-42`.
- **`actualizacion.md`:** revisar estos disparadores cuando cambie el alcance de los documentos del memory bank o su fuente de verdad. Fuentes: `README.es.md:18`, `docker-compose.yml:1-22`, `.agents/validacion-reglas.md` (pruebas 1-4).

Las convenciones para agentes viven en `.agents/rules/` y no se copian al memory bank. Fuente: `AGENTS.md:5-13`, `.agents/rules/01-app-como-compositor.md:10-13`, `.agents/rules/08-pruebas-api.md:8-11`.
