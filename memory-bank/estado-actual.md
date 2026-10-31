# Estado actual

## Cambios y verificaciones registrados

- El encabezado ya usa `formatMonthlyPeriod(monthlyData)`; la utilidad toma el primer y último `month` de los datos. En la Prueba 1 se confirmó que el dashboard mostró «Oct 2025 - Sep 2026». Fuente: `frontend/src/App.tsx:53`, `frontend/src/lib/financial-utils.ts:69-76`, `.agents/validacion-reglas.md` (Prueba 1, reglas 1, 4 y 17).
- La utilidad del periodo tiene pruebas de rango normal y lista vacía; la suite frontend reportó 7 tests pasados. Fuente: `frontend/src/lib/financial-utils.test.ts:107-119`, `.agents/validacion-reglas.md` (Prueba 1, regla 9).
- `/health` ahora usa el modelo `HealthResponse` y declara `response_model=HealthResponse`; la suite backend reportó 15 tests pasados y un warning deprecado de `httpx` en `TestClient`. Fuente: `backend/app/routes.py:65-66`, `backend/app/routes.py:247-249`, `.agents/validacion-reglas.md` (Prueba 3, reglas 2, 7, 8 y 12).
- En un Codespace nuevo probado el 2026-10-31, `docker compose up --build` funcionó sin configuración: no existía `frontend/.env` (solo `.env.example`), el dashboard cargó datos y DevTools mostró `/api/metrics` a través del puerto `5173` con estado `200 OK`. En el Codespace anterior probado el 2026-10-09 el proxy no conectó; la causa sigue sin confirmarse. Fuentes: `verification.md` (Correcciones de la devolución, 2026-10-31), `DIAGNOSTICO.md`.
- Los pasos para configurar `frontend/.env` con la URL pública del puerto `8000`, marcarlo como Public, reiniciar Compose y abrir `5173` se conservan como procedimiento alternativo solo si aparece el mensaje de error. La guía se siguió en una sesión nueva y se corrigió por ser demasiado pesimista. Fuente: `README.es.md`, `README.md`, `.agents/validacion-reglas.md` (regla 10).

## Skills de agente

- **Skills comunitarias aplicadas:**
	- `accessibility`: Lighthouse Accessibility se mantuvo en **100 → 100**, con **21 auditorías aprobadas** después del cambio; una persona verificó el teclado en Chrome (foco visible, navegación por meses y sin trampa). Fuente: `notas-skills.md` (Accesibilidad: verificación manual).
	- `vercel-react-best-practices`: la carga diferida de gráficos redujo el entry inicial de **585.99 kB a 188.05 kB**; el warning de chunks mayores a 500 kB desapareció. Fuente: `notas-skills.md` (Vercel React: cambios aplicados).
	- `python-testing-patterns`: los casos parametrizados del filtro de fechas elevaron pytest de **15 a 20 pasados**; no apareció un bug. Fuente: `notas-skills.md` (Ecosistema).
- **Selección del ecosistema:** se eligió `python-testing-patterns` porque el gap era probar por pytest/TestClient los límites inclusivos, extremos abiertos y rango invertido del endpoint FastAPI; se descartaron skills TypeScript por no corresponder al stack/problemática. Fuente: `notas-skills.md` (Ecosistema).
- **Ubicación:** skills comunitarias en `.agents/skills/`, según `AGENTS.md`; skill interna de QA en `.skills/dashboard-qa-pre-merge.md`, según la consigna del repo.

## Limitaciones y prioridades pendientes

- La limitación de que faltaba `.agents/skills/` quedó resuelta: ahora contiene `accessibility/`, `python-testing-patterns/` y `vercel-react-best-practices/`. La checklist interna está en `.skills/dashboard-qa-pre-merge.md`.
- El warning de build “Some chunks are larger than 500 kB” ya no aparece tras separar los gráficos; no es un riesgo pendiente. El warning de `httpx`/`TestClient` del backend sí persiste.

Las prioridades siguientes corresponden únicamente a riesgos que siguen listados en `hallazgos.md`:

- Aislar el generador aleatorio del estado global de `random` (hallazgo 3). Fuente: `hallazgos.md:13`.
- Conservar el error técnico recibido por el frontend para diagnóstico (hallazgo 5). Fuente: `hallazgos.md:15`.
- Fijar versiones de dependencias backend y revisar el warning de compatibilidad de `httpx` (hallazgo 12). Fuente: `hallazgos.md:35`.
- Restringir la configuración CORS amplia (hallazgo 15). Fuente: `hallazgos.md:41`.
- Limitar la exposición del puerto `debugpy` publicado por Compose (hallazgo 16). Fuente: `hallazgos.md:42`.
- Añadir cobertura automática de interfaz; la suite frontend registrada cubre utilidades, no `App.tsx` ni componentes (hallazgo 17). Fuente: `hallazgos.md:26`.
