# Resumen del proyecto

## Qué hace

1. El proyecto se presenta como un panel de métricas financieras cuya interfaz está construida con React y TypeScript y cuya API está construida con FastAPI. ([README.es.md](README.es.md#L18))
2. La pantalla principal obtiene movimientos financieros y muestra KPI de ingresos totales, egresos totales, beneficio y margen de beneficio. ([frontend/src/App.tsx](frontend/src/App.tsx#L13-L20), [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx#L10-L37))
3. La pantalla también muestra gráficos mensuales de ingresos frente a egresos y de margen de beneficio. ([frontend/src/App.tsx](frontend/src/App.tsx#L52-L62), [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L54-L58), [frontend/src/components/dashboard/profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L56-L60))
4. El backend genera 360 movimientos de ejemplo, distribuidos en 12 meses con 30 movimientos por mes; las rutas mostradas usan semilla `42` al generarlos. ([backend/app/routes.py](backend/app/routes.py#L94-L107), [backend/app/routes.py](backend/app/routes.py#L248-L256))
5. La API define endpoints para movimientos, facetas, resúmenes, categorías principales, comparación de periodos, alertas y movimientos B2B/B2C. ([backend/app/routes.py](backend/app/routes.py#L248-L264), [backend/app/routes.py](backend/app/routes.py#L268-L303), [backend/app/routes.py](backend/app/routes.py#L305-L386))
6. La aplicación frontend mostrada consume `/api/metrics`; no hay evidencia en esa pantalla de que consuma los demás endpoints. ([frontend/src/App.tsx](frontend/src/App.tsx#L13-L20))

## Estructura

7. La configuración raíz de Docker Compose define los servicios `frontend` y `backend`, publica los puertos `5173` y `8000` respectivamente, y hace que el frontend dependa del backend. ([docker-compose.yml](docker-compose.yml#L1-L19))
8. El código de interfaz está bajo `frontend/src`: `App.tsx` compone componentes del dashboard y utilidades/tipos financieros importados desde `components/dashboard` y `lib`. ([frontend/src/App.tsx](frontend/src/App.tsx#L1-L12))
9. El backend está bajo `backend/app`: `main.py` crea la aplicación FastAPI, añade middleware CORS e incluye el router definido en `routes.py`. ([backend/app/main.py](backend/app/main.py#L1-L13))
10. Las pruebas del backend están en `backend/tests/test_routes.py` y comprueban, entre otros casos, generación de movimientos, filtros, `/health` y endpoints de métricas. ([backend/tests/test_routes.py](backend/tests/test_routes.py#L1-L43), [backend/tests/test_routes.py](backend/tests/test_routes.py#L89-L159))

## Conexión frontend-backend

11. El frontend lee `VITE_API_BASE_URL` y, si no está definida, usa una cadena vacía como base; solicita `GET /api/metrics`. ([frontend/src/App.tsx](frontend/src/App.tsx#L13-L20))
12. En desarrollo, Vite escucha en `0.0.0.0` y reenvía las rutas `/api` al destino `http://backend:8000`. ([frontend/vite.config.ts](frontend/vite.config.ts#L7-L15))
13. Compose configura frontend y backend como servicios del mismo proyecto; el servicio frontend declara `depends_on: backend`. ([docker-compose.yml](docker-compose.yml#L1-L19))
14. FastAPI registra el router de métricas y `/api/metrics` responde con una lista de movimientos financieros; acepta filtros opcionales por fecha, categoría y tipo de operación. ([backend/app/main.py](backend/app/main.py#L1-L13), [backend/app/routes.py](backend/app/routes.py#L248-L260))
15. El contrato de cada movimiento incluye fecha, importe, tipo de operación, categoría y tipo de negocio; el frontend deriva KPI y puntos mensuales de esos movimientos. ([backend/app/routes.py](backend/app/routes.py#L17-L24), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts#L1-L21), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L21-L69))
16. El README indica que el proxy de Vite es la configuración predeterminada y que `VITE_API_BASE_URL` se usa para apuntar a otro backend. ([README.es.md](README.es.md#L45-L46))

## Stack

17. El frontend declara React 19, React DOM 19, TypeScript 6 y Vite 8 en sus dependencias/configuración de paquetes. ([frontend/package.json](frontend/package.json#L17-L21), [frontend/package.json](frontend/package.json#L36-L41))
18. Los gráficos usan Recharts; el proyecto incluye Tailwind CSS y Lucide React para iconos. ([frontend/package.json](frontend/package.json#L19-L21), [frontend/package.json](frontend/package.json#L30-L39), [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx#L4-L4))
19. El backend declara FastAPI y Uvicorn; su imagen parte de Python 3.13 y ejecuta Uvicorn para servir `app.main:app`. ([backend/requirements.txt](backend/requirements.txt#L1-L6), [backend/Dockerfile](backend/Dockerfile#L1-L14))
20. La imagen frontend parte de Node 24 Alpine e inicia Vite en el puerto `5173`. ([frontend/Dockerfile](frontend/Dockerfile#L1-L14))
21. El frontend define scripts de desarrollo, build, lint y test con Vitest; los requisitos del backend incluyen pytest y httpx. ([frontend/package.json](frontend/package.json#L5-L15), [backend/requirements.txt](backend/requirements.txt#L1-L6))
