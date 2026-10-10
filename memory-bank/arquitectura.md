# Arquitectura observable

- `App.tsx` solicita `/api/metrics`, deriva KPI y datos mensuales mediante utilidades frontend y pasa los resultados a componentes del dashboard. Fuente: `frontend/src/App.tsx:19-20`, `frontend/src/App.tsx:34-37`, `frontend/src/App.tsx:62`, `frontend/src/App.tsx:69-70`.
- La utilidad `formatMonthlyPeriod` deriva la etiqueta del primer y último mes en los datos; `App.tsx` la usa para el encabezado. Fuente: `frontend/src/lib/financial-utils.ts:69-76`, `frontend/src/App.tsx:53`.
- En desarrollo Vite reenvía `/api` a `http://backend:8000`. Fuente: `frontend/vite.config.ts:8-15`.
- FastAPI define modelos Pydantic para movimientos y respuestas; `/health` declara `HealthResponse` como `response_model`, y `/api/metrics` devuelve movimientos filtrables. Fuente: `backend/app/routes.py:22-28`, `backend/app/routes.py:65-66`, `backend/app/routes.py:247-262`.
- El backend genera movimientos simulados: 30 por cada mes del año móvil construido desde `date.today()`, y las rutas de métricas usan la semilla `42`. Fuente: `backend/app/routes.py:98-108`, `backend/app/routes.py:252-262`.
- Compose define frontend y backend, los conecta mediante nombres de servicio, publica puertos y monta los directorios de código. No declara un servicio de base de datos. Fuente: `docker-compose.yml:1-22`.
- Motivo de usar datos simulados en lugar de persistencia: ❓ motivo sin documentar. Fuente observable: `backend/app/routes.py:98-108`, `docker-compose.yml:1-22`.
- Motivo de no declarar un servicio de base de datos: ❓ motivo sin documentar. Fuente observable: `docker-compose.yml:1-22`.
- Motivo específico para elegir el proxy de Vite: ❓ motivo sin documentar. Fuente observable: `frontend/vite.config.ts:8-15`, `README.es.md:45-46`.
