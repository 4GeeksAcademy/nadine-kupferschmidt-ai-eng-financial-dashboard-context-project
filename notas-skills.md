# Línea base (antes de aplicar skills)

1. **Ejecución de la app y comandos de validación del frontend**
   - Desde la raíz, la app se inicia con `docker compose up --build`; el frontend está en `http://localhost:5173` y el backend/API en `http://localhost:8000` (`README.es.md:39-50`; pasos detallados en `LEVANTAR_PROYECTO.md:12-16`). Compose define `frontend` y `backend`, publica sus puertos y monta las carpetas fuente (`docker-compose.yml:1-22`).
   - Los comandos declarados por el frontend son `npm run build` (`frontend/package.json:8`), `npm test` (`frontend/package.json:11`) y `npm run lint` (`frontend/package.json:9`). En esta línea base se ejecutaron con `docker compose exec -T frontend` dentro del contenedor que ya estaba activo.

2. **Framework del frontend**
   - El frontend usa **Vite**, no Next.js: `dev` ejecuta `vite`, `build` ejecuta `tsc -b && vite build`, y `vite` figura como dependencia de desarrollo (`frontend/package.json:6-13`, `frontend/package.json:38-42`). `next` no figura entre las dependencias declaradas en el manifiesto (`frontend/package.json:15-42`).

3. **Estado de Git de `memory-bank/` y `.agents/rules/`**
   - La rama consultada fue `feature/agent-skills` y `git status --short --branch` informó `## feature/agent-skills` sin cambios listados.
   - `git ls-tree -r --name-only HEAD -- .agents/rules memory-bank` mostró los 17 archivos de `.agents/rules/` y los 5 archivos de `memory-bank/` en el commit `HEAD` de esta rama. `git ls-files --stage` también los mostró registrados en el índice con modo `100644`. Por tanto, ambos directorios están commiteados en la rama actual.

4. **Resultados exactos de las validaciones (antes de aplicar skills)**
   - **Build**: se ejecutó `docker compose exec -T frontend npm run build`; terminó correctamente (`vite v8.0.8`, 2290 módulos transformados, build en 3.37 s), sin errores. Emitió este aviso, copiado literalmente:

     ```text
     [plugin builtin:vite-reporter]
     (!) Some chunks are larger than 500 kB after minification. Consider:
     - Using dynamic import() to code-split the application
     - Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
     - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
     ```

   - **Tests**: se ejecutó `docker compose exec -T frontend npm test`; resultado exacto: `Test Files  1 passed (1)` y `Tests  7 passed (7)`. Sin errores ni advertencias.
   - **Lint**: se ejecutó `docker compose exec -T frontend npm run lint`; ESLint terminó sin errores ni advertencias y sin salida de diagnósticos.

## Skills cargadas

### accessibility

Fuentes: [SKILL.md](.agents/skills/accessibility/SKILL.md), [A11Y-PATTERNS.md](.agents/skills/accessibility/references/A11Y-PATTERNS.md) y [WCAG.md](.agents/skills/accessibility/references/WCAG.md).

- **Qué revisa:** accesibilidad WCAG 2.2 bajo POUR (perceptible, operable, comprensible y robusto): alternativas de texto y nombres accesibles, contraste y uso del color, teclado y foco, skip links y tamaño de objetivos, movimiento, idioma, estructura/etiquetas, errores, roles/estados ARIA y anuncios dinámicos. El objetivo indicado es nivel A; AA es el estándar recomendado y AAA es deseable.
- **Orden de auditoría:** 1) correr Lighthouse Accessibility sobre la página renderizada, en modo mobile navigation o snapshot si recargar pierde estado; 2) usar los nodos fallidos para localizar el componente; 3) inspeccionar el árbol de accesibilidad (nombres, roles, estados, landmarks y encabezados) y recorrer el flujo con teclado; 4) corregir y repetir la misma auditoría más las comprobaciones manuales. Si las herramientas live no están disponibles, usar Lighthouse CLI o axe y completar las mismas comprobaciones manuales. Un score automatizado no equivale a conformidad WCAG.
- **Comprobaciones manuales:** teclado, lector de pantalla, zoom al 200 %, modo de alto contraste, `prefers-reduced-motion`, orden del foco y objetivos de al menos 24 × 24 CSS px.
- **Herramientas en este Codespace:** `lighthouse_audit` y `take_snapshot` de Chrome DevTools MCP no aparecen entre las herramientas disponibles; tampoco hay ejecutables Lighthouse, axe, Chrome/Chromium ni Orca en `PATH`. `npx` sí está disponible en el host, pero Lighthouse, axe, Playwright y Puppeteer no están instalados como dependencias del contenedor frontend (`npm ls` no encontró paquetes). No hay lector de pantalla local; VoiceOver/NVDA/TalkBack requieren sus plataformas correspondientes. WAVE y axe DevTools son extensiones de navegador, no herramientas instaladas en el contenedor. Por tanto, aquí no se pudo hacer una auditoría live ni las pruebas visuales/manuales; requieren un navegador y las herramientas de asistencia del host.
- La skill también apunta a `../web-quality-audit/SKILL.md`, pero esa referencia no está presente en `.agents/skills`.

### vercel-react-best-practices

Fuentes para la taxonomía y los 70 identificadores: [SKILL.md](.agents/skills/vercel-react-best-practices/SKILL.md) y su documento compilado [AGENTS.md](.agents/skills/vercel-react-best-practices/AGENTS.md). Esta clasificación es para React en navegador con Vite; “aplican” significa que la regla puede ser pertinente si aparece su caso, no que haya que implementar todos los patrones.

**Aplican a este repo**

- **Eliminating Waterfalls:** `async-cheap-condition-before-await`, `async-defer-await`, `async-dependencies`, `async-parallel`.
- **Bundle Size Optimization:** `bundle-barrel-imports`, `bundle-analyzable-paths`, `bundle-conditional`, `bundle-preload`.
- **Client-Side Data Fetching:** `client-event-listeners`, `client-passive-event-listeners`, `client-localstorage-schema`.
- **Re-render Optimization:** `rerender-defer-reads`, `rerender-memo`, `rerender-memo-with-default-value`, `rerender-dependencies`, `rerender-derived-state`, `rerender-derived-state-no-effect`, `rerender-functional-setstate`, `rerender-lazy-state-init`, `rerender-simple-expression-in-memo`, `rerender-split-combined-hooks`, `rerender-move-effect-to-event`, `rerender-transitions`, `rerender-use-deferred-value`, `rerender-use-ref-transient-values`, `rerender-no-inline-components`.
- **Rendering Performance:** `rendering-animate-svg-wrapper`, `rendering-content-visibility`, `rendering-hoist-jsx`, `rendering-svg-precision`, `rendering-activity`, `rendering-script-defer-async`, `rendering-conditional-render`, `rendering-resource-hints`, `rendering-usetransition-loading`.
- **JavaScript Performance:** `js-batch-dom-css`, `js-index-maps`, `js-cache-property-access`, `js-cache-function-results`, `js-cache-storage`, `js-combine-iterations`, `js-length-check-first`, `js-early-exit`, `js-hoist-regexp`, `js-min-max-loop`, `js-set-map-lookups`, `js-tosorted-immutable`, `js-flatmap-filter`, `js-request-idle-callback`.
- **Advanced Patterns:** `advanced-effect-event-deps`, `advanced-event-handler-refs`, `advanced-init-once`, `advanced-use-latest`.
- Son patrones de React/browser o JavaScript/bundler. La regla de imports directos también ofrece explícitamente una alternativa para proyectos no Next; la de rutas estáticas menciona Vite/Rollup. `toSorted()` está incluido en el `lib` ES2023 del frontend (`frontend/tsconfig.app.json`); la regla advierte que hace falta fallback si se soportan navegadores antiguos. Fuentes de matiz: [bundle-barrel-imports.md](.agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md), [bundle-analyzable-paths.md](.agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md), [js-tosorted-immutable.md](.agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md).

**No aplican (servidor/SSR o API de Next.js)**

- `async-api-routes`: trata de API Routes/Server Actions de Next.js; este frontend no define esas rutas y la API es FastAPI.
- **Server-Side Performance:** `server-auth-actions`, `server-cache-react`, `server-cache-lru`, `server-dedup-props`, `server-hoist-static-io`, `server-no-shared-module-state`, `server-serialization`, `server-parallel-fetching`, `server-parallel-nested-fetching`, `server-after-nonblocking`. Requieren contexto de servidor, Server Components/RSC, serialización de props o APIs server-side que no existen en el cliente Vite; el backend Python no cambia ese alcance.
- `rendering-hydration-no-flicker` y `rendering-hydration-suppress-warning`: dependen de SSR/hidratación. Este frontend monta con `createRoot` (`frontend/src/main.tsx`) y no hidrata HTML generado en servidor.
- La skill no contiene reglas llamadas `next/image`, `next/font` ni `metadata`; no se agregan como reglas a esta clasificación. Fuentes: [async-api-routes.md](.agents/skills/vercel-react-best-practices/rules/async-api-routes.md), [server-cache-react.md](.agents/skills/vercel-react-best-practices/rules/server-cache-react.md), [server-dedup-props.md](.agents/skills/vercel-react-best-practices/rules/server-dedup-props.md), [rendering-hydration-no-flicker.md](.agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md), [rendering-hydration-suppress-warning.md](.agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md).

**Dudosas: requieren adaptación o un caso concreto**

- `async-suspense-boundaries`: React Suspense existe en cliente, pero el beneficio descrito de streaming se centra en componentes async/SSR; el frontend actual usa carga client-side.
- `bundle-dynamic-imports`: su receta usa `next/dynamic` y `ssr: false`, que no existen en Vite. La intención de code splitting sí se puede trasladar a `import()`/`React.lazy`.
- `bundle-defer-third-party`: el ejemplo usa `next/dynamic` y habla de cargar después de hidratación; Vite CSR requiere definir otro momento de carga.
- `client-swr-dedup`: requiere SWR, que no está en las dependencias; la deduplicación solo aporta si varias instancias comparten solicitudes. Fuentes: [async-suspense-boundaries.md](.agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md), [bundle-dynamic-imports.md](.agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md), [bundle-defer-third-party.md](.agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md), [client-swr-dedup.md](.agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md).

**Advertencia del build**

- La regla más directamente relacionada con `Some chunks are larger than 500 kB` es `bundle-dynamic-imports`: propone separar componentes pesados para reducir el bundle inicial. El concepto aplica al diagnóstico de Vite, pero su ejemplo `next/dynamic` no; para este repo habría que usar carga dinámica compatible con Vite. Fuente: [bundle-dynamic-imports.md](.agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md). Esto identifica una regla relacionada, no afirma que el chunk actual provenga de un componente concreto.
