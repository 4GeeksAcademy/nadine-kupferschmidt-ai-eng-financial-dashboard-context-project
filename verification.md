# Verificación del resumen del proyecto

| N.º | Afirmación resumida | Estado | Evidencia |
|---:|---|:---:|---|
| 1 | Panel financiero con frontend React/TypeScript y API FastAPI. | ✅ | [README.es.md](README.es.md#L18) |
| 2 | La pantalla presenta cuatro KPI financieros. | ✅ | [frontend/src/App.tsx](frontend/src/App.tsx#L52-L54), [kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx#L10-L37) |
| 3 | Incluye gráficos mensuales de ingresos/egresos y margen. | ✅ | [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L54-L58), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L56-L60) |
| 4 | El backend genera 360 movimientos de ejemplo usando semilla 42. | ✅ | [backend/app/routes.py](backend/app/routes.py#L94-L107), [backend/app/routes.py](backend/app/routes.py#L248-L256) |
| 5 | La API expone endpoints de métricas, facetas, resumen, categorías, comparación, alertas y B2B/B2C. | ✅ | [backend/app/routes.py](backend/app/routes.py#L248-L264), [backend/app/routes.py](backend/app/routes.py#L268-L303), [backend/app/routes.py](backend/app/routes.py#L305-L386) |
| 6 | La pantalla consume `/api/metrics`; no los otros endpoints. | ✅ | [frontend/src/App.tsx](frontend/src/App.tsx#L13-L20) |
| 7 | Compose define frontend/backend, puertos y dependencia entre servicios. | ⚠️ | [docker-compose.yml](docker-compose.yml#L1-L19); omite el puerto `5678` de depuración. |
| 8 | La interfaz se organiza en `frontend/src`, con dashboard, tipos y utilidades. | ✅ | [frontend/src/App.tsx](frontend/src/App.tsx#L1-L12) |
| 9 | `backend/app/main.py` crea FastAPI, añade CORS y registra el router. | ✅ | [backend/app/main.py](backend/app/main.py#L1-L13) |
| 10 | Hay pruebas backend de generación, filtros, salud y métricas. | ✅ | `docker compose exec backend pytest` → **15 passed, 1 warning** (`httpx deprecated`); [backend/tests/test_routes.py](backend/tests/test_routes.py#L1-L43) |
| 11 | El frontend forma la URL con `VITE_API_BASE_URL` y pide `/api/metrics`. | ✅ | [frontend/src/App.tsx](frontend/src/App.tsx#L13-L20) |
| 12 | Vite reenvía `/api` a `http://backend:8000`. | ✅ en configuración; ❌ en Codespace | [frontend/vite.config.ts](frontend/vite.config.ts#L7-L15); [DIAGNOSTICO.md](DIAGNOSTICO.md#L88-L111) |
| 13 | Compose configura ambos servicios y `depends_on: backend`. | ✅ en configuración; ❌ en Codespace | [docker-compose.yml](docker-compose.yml#L1-L19); [DIAGNOSTICO.md](DIAGNOSTICO.md#L88-L111) |
| 14 | `/api/metrics` devuelve movimientos y admite filtros. | ✅ | [backend/app/routes.py](backend/app/routes.py#L248-L260) |
| 15 | El contrato de movimientos alimenta los cálculos de KPI y series mensuales. | ✅ | [backend/app/routes.py](backend/app/routes.py#L17-L24), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L21-L69) |
| 16 | README describe el proxy como predeterminado y la variable para otro backend. | ✅ en configuración; ❌ en Codespace | [README.es.md](README.es.md#L45-L46), [frontend/.env.example](frontend/.env.example#L4), [DIAGNOSTICO.md](DIAGNOSTICO.md#L88-L111) |
| 17 | Stack frontend: React 19, TypeScript 6 y Vite 8. | ✅ | [frontend/package.json](frontend/package.json#L17-L21), [frontend/package.json](frontend/package.json#L36-L41) |
| 18 | Usa Recharts, Tailwind CSS y Lucide React. | ✅ | [frontend/package.json](frontend/package.json#L19-L21), [frontend/package.json](frontend/package.json#L30-L39) |
| 19 | Backend FastAPI/Uvicorn sobre Python 3.13. | ✅ | [backend/requirements.txt](backend/requirements.txt#L1-L6), [backend/Dockerfile](backend/Dockerfile#L1-L14) |
| 20 | La imagen frontend usa Node 24 Alpine e inicia Vite en 5173. | ✅ | [frontend/Dockerfile](frontend/Dockerfile#L1-L14) |
| 21 | Hay scripts de build, lint y test; requisitos backend incluyen pytest y httpx. | ✅, con omisiones | [frontend/package.json](frontend/package.json#L5-L15), [backend/requirements.txt](backend/requirements.txt#L1-L6); también incluye `debugpy` y `pytest-cov`. |

## Correcciones

- Afirmación 7 incompleta → Compose también publica `5678` para depuración ([docker-compose.yml](docker-compose.yml#L1-L19)).
- Afirmaciones 12, 13 y 16 → describen la configuración, pero en este Codespace el proxy no conecta con `backend:8000` ([DIAGNOSTICO.md](DIAGNOSTICO.md#L88-L111)).
- Afirmación 21 incompleta → los requisitos backend también incluyen `debugpy` y `pytest-cov` ([backend/requirements.txt](backend/requirements.txt#L1-L6)).
- Hipótesis «el primer fetch ocurrió antes de que el backend arrancara» → descartada: se esperó y se recargó, y el fallo persistió ([DIAGNOSTICO.md](DIAGNOSTICO.md#L88-L111)).
- Encabezado «2024 - Full Year» → está escrito a mano, mientras que el backend genera fechas según `date.today()` para los últimos 12 meses ([frontend/src/App.tsx](frontend/src/App.tsx#L49-L49), [backend/app/routes.py](backend/app/routes.py#L94-L107)).
- README y `.env.example` dicen que Codespaces no requiere configuración adicional → en este Codespace sí hizo falta configurar la URL pública del backend ([README.es.md](README.es.md#L45-L46), [frontend/.env.example](frontend/.env.example#L4)).

## Cómo ejecutar en Codespaces

1. Crear `frontend/.env` (archivo ignorado por `.gitignore`) con `VITE_API_BASE_URL=<URL pública del puerto 8000>`.
2. Marcar el puerto `8000` como **Public** en Codespaces.
3. Reiniciar los servicios para que Vite lea `.env` al arrancar: `docker compose down` y `docker compose up --build`.
4. Recargar el dashboard; con esa configuración muestra los datos.
