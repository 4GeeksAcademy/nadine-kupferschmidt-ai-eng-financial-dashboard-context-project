# Validación de reglas

| Regla | Prueba donde se validó | Tipo | Resultado |
|---:|---|---|:---:|
| 1 | Prueba 1 (real): el primer plan calculaba el periodo en `App.tsx`; corregido a `formatMonthlyPeriod` en `lib`. Prueba 2 (plan): aplicada al primer intento para el mes con mayor beneficio. | real / plan | ⚠️→✅ |
| 2 | Prueba 3 (real): dedujo la regla para `/health` aunque no se especificó cuál. | real | ✅ |
| 3 | Prueba 4, pedido A (plan): endpoint con otra semilla. | plan | ✅ |
| 4 | Prueba 1 (real): aplicada al periodo; globs refinados después. | real | ✅ |
| 5 | Prueba 1 (real): respetó el alcance y no modificó el manejo de errores. | real | ✅ |
| 6 | Prueba 1 (real): helper `formatMonthlyPeriod` en `lib`. Prueba 2 (plan): aplicada junto con las reglas 1, 9 y 17. | real / plan | ✅ |
| 7 | Prueba 3 (real): nombró el modelo `HealthResponse`. | real | ✅ |
| 8 | Prueba 3 (real): `docker compose exec backend pytest` → 15 passed. | real | ✅ |
| 9 | Prueba 1 (real): dos pruebas nuevas; 7 tests pasan. Prueba 2 (plan): aplicada junto con las reglas 1, 6 y 17. | real / plan | ✅ |
| 10 | Prueba real en un Codespace nuevo (2026-10-31): se siguió la guía; el arranque normal funcionó sin configuración y mostró que la guía era demasiado pesimista, por lo que se corrigió para dejar los pasos 1 a 4 como alternativa si aparece el error. | real | ✅ |
| 12 | Prueba 3 (real): informó el warning de `httpx` sin modificarlo. Prueba 4, pedido C (plan): agregar `requests`. | real / plan | ✅ |
| 13 | Prueba 1 (real): el cambio se vio sin reconstruir. Prueba 4, pedidos C y F (plan): agregar dependencia y desplegar Compose. | real / plan | ✅ |
| 14 | Prueba 4, pedido D (plan): agregar API key de prueba. | plan | ✅ |
| 15 | Prueba 4, pedido E (plan): preparar el backend para `https://mi-dashboard.app`. | plan | ✅ |
| 16 | Prueba 4, pedido F (plan): desplegar Docker Compose en un servidor. | plan | ✅ |
| 17 | Prueba 1 (real): Copilot no pudo ver el navegador; el usuario verificó «Oct 2025 - Sep 2026». Prueba 2 (plan): aplicada junto con las reglas 1, 6 y 9. | real / plan | ✅ |

## Refinamientos

| Regla | Problema detectado | Cambio aplicado |
|---:|---|---|
| 1 | El primer plan nombró la regla, pero calculaba el periodo dentro de `App.tsx`. | Se reescribió para indicar que cualquier cálculo o transformación, aunque sea de una línea, va en una función exportada de `frontend/src/lib/`; `App.tsx` solo llama funciones y pasa props. |
| 4 | Los globs indicaban dónde estaba la evidencia, no dónde se aplica la regla. | Se corrigieron para `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts` y `frontend/src/components/dashboard/dashboard-header.tsx`. |

## Archivos de código modificados en las pruebas

- Prueba 1: `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`, `frontend/src/App.tsx`.
- Prueba 3: `backend/app/routes.py`.
