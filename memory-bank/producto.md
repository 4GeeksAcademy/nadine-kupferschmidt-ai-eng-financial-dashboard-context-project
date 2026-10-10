# Producto

- El repositorio describe la aplicación como un dashboard de métricas financieras, con frontend React + TypeScript y backend FastAPI. Fuente: `README.es.md:18`.
- La interfaz presenta cuatro KPI: ingresos totales, egresos totales, beneficio y margen de beneficio. Fuente: `frontend/src/components/dashboard/kpi-row.tsx:11-41`.
- La interfaz incluye un gráfico mensual de ingresos frente a egresos y otro de margen de beneficio. Fuente: `frontend/src/App.tsx:69-70`, `frontend/src/components/dashboard/income-outcome-chart.tsx:49-57`, `frontend/src/components/dashboard/profit-percent-chart.tsx:50-59`.
- Cada movimiento financiero contiene fecha, importe, tipo de operación, categoría y tipo de negocio. Fuente: `backend/app/routes.py:22-28`.
- La pantalla solicita `/api/metrics` y calcula en el frontend los KPI y los puntos mensuales. Fuente: `frontend/src/App.tsx:19-20`, `frontend/src/App.tsx:34-37`.
- El backend crea 30 movimientos por cada uno de 12 meses, usando la fecha actual para asignar el año; las rutas de métricas usan semilla `42`. Fuente: `backend/app/routes.py:98-108`, `backend/app/routes.py:252-262`.
- En la verificación de la Fase 3, se confirmó que el periodo visible fue «Oct 2025 - Sep 2026». Fuente: `.agents/validacion-reglas.md` (Prueba 1, regla 17).
- Usuarios y métricas de éxito: ❓ sin evidencia en el repo.
