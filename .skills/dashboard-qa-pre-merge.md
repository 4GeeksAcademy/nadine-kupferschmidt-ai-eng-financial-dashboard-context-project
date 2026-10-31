---
name: dashboard-qa-pre-merge
description: Use before merging changes to this financial dashboard to run repository-specific container, API, frontend, and browser QA.
---

# Dashboard QA Pre-Merge

## Objetivo
Confirmar con pruebas reproducibles que el dashboard funciona y que el merge solo incluye cambios previstos.

## Inputs
- Rama/cambios del PR y lista de archivos modificados (`git status --short`).
- Indicar si se modificaron `frontend/src/App.tsx`, componentes o estilos.

## Pasos
1. Desde la raíz, iniciar con `docker compose up --build`; abrir `http://localhost:5173` y comprobar API en `http://localhost:8000` (`README.es.md`, `docker-compose.yml`).
2. Si Codespaces muestra `Unable to load financial data. Please check the backend API.`, crear `frontend/.env` con `VITE_API_BASE_URL=<URL pública del puerto 8000>`, marcar el puerto 8000 como **Public** y reiniciar con `docker compose down` seguido de `docker compose up --build` (`verification.md`, `DIAGNOSTICO.md`). `frontend/.env` está ignorado (`.gitignore`); no compartir ni versionar su contenido.
3. Recordar que el puerto 5678 es `debugpy`, no una página web (`docker-compose.yml`, `backend/Dockerfile`, `LEVANTAR_PROYECTO.md`).
4. Ejecutar dentro de los contenedores:
   - `docker compose exec -T frontend npm run build`
   - `docker compose exec -T frontend npm test`
   - `docker compose exec -T frontend npm run lint`
   - `docker compose exec -T backend pytest`
   Scripts frontend: `frontend/package.json`; suite API: `backend/tests/test_routes.py`.
5. Comparar con una fuente de baseline identificada: (a) registro de los mismos comandos en `main` (por ejemplo, `verification.md` en `main` registra pytest: 15 passed, 1 warning); o (b) registro tomado en la rama nueva antes de su primer commit, indicando que tenía el mismo código que `main` y anotando esa procedencia. Para la opción (b), `notas-skills.md` puede ser el registro; no lo uses sin documentar la procedencia. Si falta un resultado comparable para alguno de los cuatro comandos, ejecútalo en `main` y registra el resultado antes de comparar. Justificar o corregir cualquier warning nuevo (el warning httpx/TestClient conocido está documentado en `memory-bank/estado-actual.md`).
6. Si cambió la interfaz, una persona debe abrirla en Chrome DevTools, probar flujo/teclado y ejecutar Lighthouse Accessibility; comparar el puntaje con la medición de `main` (`.agents/rules/17-verificar-interfaz-en-navegador.md`, `.agents/skills/accessibility/SKILL.md`). El agente no dispone de navegador: registra los resultados que le entregue la persona y nunca marca PASS sin ellos; mientras falten, anota `PENDING`.
7. Revisar `git status --short`: confirmar que solo aparecen archivos dentro del alcance, y que `frontend/.env` no aparece (`.gitignore`).

## Salida esperada
Entregar este informe; usar `N/A` si no hubo cambio de interfaz:

| Comprobación | Resultado | Evidencia / avisos |
|---|---|---|
| Entorno y API | PASS/FAIL | URL, disponibilidad o configuración Codespaces |
| Frontend (build/tests/lint) | PASS/FAIL | comandos, tests, chunks y warnings |
| Backend (pytest) | PASS/FAIL | recuento y warnings |
| Interfaz (Chrome DevTools/Lighthouse) | PASS/FAIL/N/A/PENDING | resultados humanos y puntaje vs. `main` |
| Git / alcance | PASS/FAIL | `git status --short`, `.env` ausente |

## Criterios de aceptación
1. Build, tests y lint del frontend y pytest del backend pasan; los warnings quedan comparados y cualquier nuevo warning se justifica o corrige.
2. Si cambió la interfaz, los resultados humanos de teclado y Lighthouse Accessibility están registrados; sin ellos, el estado permanece `PENDING`, nunca PASS.
3. `git status --short` no muestra `frontend/.env` ni archivos fuera del alcance del cambio.
