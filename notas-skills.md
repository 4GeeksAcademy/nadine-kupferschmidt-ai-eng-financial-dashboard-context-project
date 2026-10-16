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

## Accesibilidad: línea base Lighthouse

Medición de referencia indicada por el usuario: Chrome Lighthouse **13.4.1**, **Desktop**, categoría **Accessibility** solamente; puntuación **100**, **20** auditorías aprobadas, **43** no aplicables (la página no tiene botones, inputs, links ni imágenes) y **10** ítems de revisión manual. La skill advierte que una puntuación automatizada no equivale a conformidad WCAG. La revisión siguiente es estática del código; no se ejecutó una comprobación en navegador.

### Revisión manual y correcciones propuestas

- **Gráficos: faltan una alternativa textual estable y acceso a todos los datos fuera del tooltip.** Archivos: [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L64-L119), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L65-L108). Los valores por mes se representan en líneas y se muestran en `Tooltip`; no hay una descripción larga ni una tabla de datos alternativa en el componente. Recharts 3.8.1 activa `accessibilityLayer` por defecto, pero ❓ **verificar en navegador** que el usuario de teclado/lector llegue a cada punto y que el tooltip anuncie el mes y valor. **Skill:** [SKILL.md, alternativas de texto para contenido complejo](.agents/skills/accessibility/SKILL.md#perceivable) y [WCAG.md, 1.1.1 y 1.3.1](.agents/skills/accessibility/references/WCAG.md#level-a-minimum). **Propuesta:** añadir por gráfico una descripción accesible y una tabla semántica de mes y valores de todas las series, asociadas al gráfico con `aria-describedby`; conservar tooltip como ayuda visual, no como única vía a los datos.
- **Los títulos de gráfico no forman encabezados en el árbol del documento.** Archivos: [card.tsx](frontend/src/components/ui/card.tsx#L31-L38), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L68-L71), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L69-L72). `CardTitle` renderiza un `div`, por lo que los títulos quedan fuera de la estructura de encabezados. **Skill:** [SKILL.md, árbol de accesibilidad y estructura de encabezados](.agents/skills/accessibility/SKILL.md#evidence-led-audit-workflow); [WCAG.md, 1.3.1 y 2.4.6](.agents/skills/accessibility/references/WCAG.md#level-a-minimum). **Propuesta:** renderizar los títulos de estos dos gráficos como encabezados de nivel 2, preservando sus estilos.
- **Carga y error no se anuncian como cambios de estado.** Archivos: [App.tsx](frontend/src/App.tsx#L30-L31), [App.tsx](frontend/src/App.tsx#L39-L59), [kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx#L37-L48), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L49-L61), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L50-L62). Durante `loading` solo se muestran skeletons; el error aparece en un `div` ordinario sin `role="alert"`/`aria-live`. **Skill:** [A11Y-PATTERNS.md, live regions and notifications](.agents/skills/accessibility/references/A11Y-PATTERNS.md#live-regions-and-notifications) y [A11Y-PATTERNS.md, error handling](.agents/skills/accessibility/references/A11Y-PATTERNS.md#error-handling). **Propuesta:** anunciar carga mediante un mensaje `role="status"`/`aria-live="polite"` y marcar la región de contenido `aria-busy` mientras espera; anunciar el error mediante `role="alert"` o una región viva asertiva.
- **Idioma de la página y cadenas mezcladas; título del documento genérico.** Archivos: [index.html](frontend/index.html#L2-L7), [App.tsx](frontend/src/App.tsx#L39-L42), [dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx#L15-L16), [kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx#L14-L42), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L69-L76), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L70-L76). El documento declara `lang="en"` y casi todos los textos de interfaz están en inglés, pero el error está en español; además `<title>` es `frontend`. **Skill:** [SKILL.md, Page language](.agents/skills/accessibility/SKILL.md#page-language) y [WCAG.md, 3.1.1 Page Language y 2.4.2 Page Titled](.agents/skills/accessibility/references/WCAG.md#level-a-minimum). **Propuesta:** mantener el idioma inglés ya declarado y traducir el mensaje de error a inglés; sustituir el título genérico por un título descriptivo en ese mismo idioma.
- **Las animaciones no respetan explícitamente movimiento reducido.** Archivos: [skeleton.tsx](frontend/src/components/ui/skeleton.tsx#L3-L9), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L100-L116), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L98-L105) y estilos globales [index.css](frontend/src/index.css#L111-L125). `animate-pulse` se aplica siempre y los `<Line>` omiten `isAnimationActive`; Recharts 3.8.1 usa por defecto `isAnimationActive: "auto"` y `animationDuration: 1500`. No hay regla `prefers-reduced-motion` en los estilos inspeccionados. **Skill:** [SKILL.md, Motion](.agents/skills/accessibility/SKILL.md#motion). **Propuesta:** limitar el pulso a `motion-safe` y desactivar la animación de las líneas cuando `prefers-reduced-motion: reduce` esté activo.
- **Foco visible en los gráficos: ❓ verificar en navegador.** Archivos: [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L78-L119), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L79-L108), [index.css](frontend/src/index.css#L111-L125). Recharts proporciona su capa de teclado por defecto, pero la inspección estática no permite confirmar el orden real de Tab, la visibilidad/contraste del foco ni que las flechas anuncien correctamente cada punto. **Skill:** [SKILL.md, Keyboard accessible y Focus visible](.agents/skills/accessibility/SKILL.md#operable). **Propuesta:** probar Tab y flechas en ambos gráficos; si el foco no se distingue claramente, añadir una regla `:focus-visible` con indicador contrastado y confirmar que no queda oculto.

### Elementos revisados sin corrección propuesta

- **Iconos decorativos:** [dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx#L11-L13) y [kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx#L55-L61) los colocan junto a títulos/etiquetas que ya expresan su significado. La implementación instalada de Lucide agrega `aria-hidden="true"` a los SVG sin contenido ni nombre accesible explícito, por lo que no propongo duplicar una etiqueta. **Skill:** [SKILL.md, Text alternatives e icon buttons](.agents/skills/accessibility/SKILL.md#perceivable). Confirmar en el árbol de accesibilidad del navegador como parte de la revisión manual.

## Accesibilidad: cambios aplicados

1. **Alternativa accesible para los gráficos.** Archivos: [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx) y [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx). Ambos gráficos ahora describen el contenido de sus datos y exponen una tabla semántica con clase Tailwind `sr-only`, caption, mes y valores de series. **Instrucción:** [SKILL.md, Text alternatives para contenido complejo](.agents/skills/accessibility/SKILL.md#perceivable) y [WCAG.md, 1.1.1/1.3.1](.agents/skills/accessibility/references/WCAG.md#level-a-minimum).
2. **Encabezados semánticos.** Archivo: [card.tsx](frontend/src/components/ui/card.tsx). `CardTitle` ahora renderiza un `h2`, manteniendo sus clases visuales, para que los títulos de ambos gráficos aparezcan en la estructura de encabezados. **Instrucción:** [SKILL.md, inspeccionar la estructura de encabezados](.agents/skills/accessibility/SKILL.md#evidence-led-audit-workflow); [WCAG.md, 1.3.1/2.4.6](.agents/skills/accessibility/references/WCAG.md#level-a-minimum).
3. **Anuncios de carga y error.** Archivo: [App.tsx](frontend/src/App.tsx). Se añadió un estado de carga `role="status"` con `aria-live="polite"` y `aria-atomic`, `aria-busy` en el contenido principal y `role="alert"` al error. **Instrucción:** [A11Y-PATTERNS.md, live regions and notifications](.agents/skills/accessibility/references/A11Y-PATTERNS.md#live-regions-and-notifications) y [error handling](.agents/skills/accessibility/references/A11Y-PATTERNS.md#error-handling).
4. **Idioma y título del documento.** Archivos: [App.tsx](frontend/src/App.tsx) e [index.html](frontend/index.html). Se mantuvo `lang="en"`, se tradujo el mensaje de error al inglés y se reemplazó el título genérico por `Financial Metrics Dashboard`. **Instrucción:** [SKILL.md, Page language](.agents/skills/accessibility/SKILL.md#page-language) y [WCAG.md, 3.1.1/2.4.2](.agents/skills/accessibility/references/WCAG.md#level-a-minimum).
5. **Movimiento reducido.** Archivos: [skeleton.tsx](frontend/src/components/ui/skeleton.tsx), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx) y [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx). El pulso de skeletons usa `motion-safe`; las animaciones de las líneas se desactivan cuando `prefers-reduced-motion: reduce` está activo. **Instrucción:** [SKILL.md, Motion](.agents/skills/accessibility/SKILL.md#motion).

6. **Foco visible y navegación de gráficos: no aplicado.** Queda pendiente de la prueba manual de teclado del usuario, como se solicitó. Abrí `http://localhost:5173` con el navegador configurado, pero este Codespace no ofrece inspección del árbol de accesibilidad ni automatización de teclado; no afirmo que esa verificación se haya completado. **Instrucción:** [SKILL.md, Keyboard accessible y Focus visible](.agents/skills/accessibility/SKILL.md#operable) y [regla 17 del repo](.agents/rules/17-verificar-interfaz-en-navegador.md).

### Verificaciones frente a la línea base

- **Build:** pasó. Se mantiene el mismo aviso de chunks mayores a 500 kB copiado en la línea base. El bundle JS pasó de **584.39 kB** (175.27 kB gzip) a **585.99 kB** (175.59 kB gzip) después de añadir las tablas ocultas.
- **Tests:** **1 archivo y 7 tests pasaron**, igual que en la línea base; sin errores ni advertencias.
- **Lint:** pasó sin errores, advertencias ni diagnósticos, igual que en la línea base.

## Accesibilidad: verificación manual (usuario)

- **Título de la pestaña:** muestra “Financial Metrics Dashboard”. ✅
- **Teclado:** Tab enfoca ambos gráficos con contorno visible; las flechas izquierda/derecha recorren los meses y muestran su tooltip; arriba/abajo desplazan la página con el comportamiento normal del navegador; no hay trampa de foco. Las tarjetas KPI no reciben foco porque no son interactivas. ✅
- **Corrección 6 (foco visible):** no requiere cambios; verificado manualmente.
- **Lighthouse después de los cambios:** Chrome Lighthouse 13.4.1, Desktop, solo Accessibility, con la misma configuración: puntuación 100; 21 auditorías aprobadas (antes 20) y 42 no aplicables (antes 43). La auditoría nueva aprobada es “table cells have [headers] attribute”, al existir ahora las tablas `sr-only`. El orden de encabezados sigue aprobado tras cambiar `CardTitle` a `h2`. ✅

## Vercel React: auditoría y propuestas

### Evidencia del bundle

- El build del contenedor produjo `dist/assets/index-DEKEIsYJ.js` con **585,975 bytes** (**585.99 kB**, **175.59 kB gzip**), por encima del límite de 500 kB del aviso.
- Añadí en memoria un plugin de reporte al pipeline de Vite/Rolldown para leer `chunk.modules` sin cambiar archivos ni instalar dependencias. Sus sumas de `renderedLength` por paquete (tamaño de módulos renderizados antes de la minificación final; no son partes aditivas del tamaño final) fueron: `recharts` **478,290 bytes**, `react-dom` **458,707 bytes**, `tailwind-merge` **54,185 bytes**, `es-toolkit` **43,990 bytes**, `immer` **36,850 bytes**, `d3-scale` **27,681 bytes**, `@reduxjs/toolkit` **26,231 bytes** y `decimal.js-light` **25,427 bytes**. Entre los módulos individuales grandes: `react-dom-client.production.js` **452,058 bytes**, `recharts/es6/state/selectors/axisSelectors.js` **43,003 bytes**, y `recharts/es6/cartesian/Line.js` **16,638 bytes**, con la misma métrica previa a minificación.
- `App.tsx` importa estáticamente los dos componentes de gráficos ([App.tsx](frontend/src/App.tsx#L1-L5)); ambos dependen de Recharts ([income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L5-L14), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L5-L14)). La dependencia está declarada en [package.json](frontend/package.json#L18-L21). La evidencia apunta al conjunto de gráficos/Recharts como candidato que se puede separar del entry; React DOM sigue siendo base necesaria de la app, no una dependencia que convenga quitar.

### Propuestas

1. **Separar el código de los gráficos del entry inicial.** Archivos: [App.tsx](frontend/src/App.tsx#L1-L5) y componentes [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L5-L14), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx#L5-L14). El import estático incorpora Recharts y su grafo (incluidos módulos D3 y Redux Toolkit) al único chunk de 585,975 bytes. **Regla:** [bundle-dynamic-imports.md](.agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md), cuya intención es apartar componentes pesados del bundle inicial; su ejemplo `next/dynamic` no aplica a Vite. **Cambio propuesto:** usar `React.lazy(() => import(...))` con rutas literales para ambos componentes y envolverlos en `Suspense` con un fallback de skeleton ya existente. Las gráficas seguirían montándose al cargar el dashboard, pero su código quedaría en chunks asíncronos. Volver a medir cada chunk: el split reduce el entry, pero hay que comprobar que ningún chunk asíncrono conserve un tamaño superior a 500 kB.
2. **Combinar las iteraciones de los KPI.** Archivo: [financial-utils.ts](frontend/src/lib/financial-utils.ts#L21-L33). `computeKPIs` hace dos `filter()` sobre `movements`, crea dos arrays temporales y luego recorre cada uno con `reduce()` para sumar. **Regla:** [js-combine-iterations.md](.agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md). **Cambio propuesto:** acumular `totalIncome` y `totalOutcome` en un único `for...of` con una condición por `operation_type`, evitando los arrays intermedios; conservar las aserciones de totales y de ingreso cero en [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L14-L53).

## Vercel React: cambios aplicados

1. **Carga diferida de los gráficos.** Archivo: [App.tsx](frontend/src/App.tsx). Los dos componentes se cargan mediante `React.lazy` con imports dinámicos de rutas literales y `Suspense` con fallback `Skeleton`; no se usó ninguna API de Next.js. **Regla:** [bundle-dynamic-imports.md](.agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md), adaptada al code splitting nativo de Vite.
2. **KPI en una iteración.** Archivo: [financial-utils.ts](frontend/src/lib/financial-utils.ts). `computeKPIs` ahora acumula ingresos y egresos en un solo `for...of`, sin arrays temporales. Se conservaron las pruebas existentes de totales y el caso sin ingresos (`frontend/src/lib/financial-utils.test.ts`). **Regla:** [js-combine-iterations.md](.agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md).

### Resultados de validación

- **Build:** pasó; el aviso de chunks mayores a 500 kB desapareció. Comparación de los assets reportados por Vite:

   | Asset | Antes | Después |
   |---|---:|---:|
   | `index.html` | 0.47 kB (0.30 kB gzip) | 0.56 kB (0.34 kB gzip) |
   | CSS | 17.81 kB (4.39 kB gzip) | 18.13 kB (4.47 kB gzip) |
   | Chunk JS único / entry | 585.99 kB (175.59 kB gzip) | 188.05 kB (59.91 kB gzip) |
   | `LineChart` compartido | incluido en el único chunk | 342.30 kB (100.46 kB gzip) |
   | `income-outcome-chart` | incluido en el único chunk | 10.40 kB (3.50 kB gzip) |
   | `profit-percent-chart` | incluido en el único chunk | 7.21 kB (2.80 kB gzip) |
   | `financial-utils` | incluido en el único chunk | 40.55 kB (13.47 kB gzip) |

- **Tests:** 1 archivo aprobado; **7/7 tests**, sin errores ni advertencias. Igual que la línea base.
- **Lint:** pasó sin errores, advertencias ni diagnósticos, igual que la línea base.

## Ecosistema

- **Búsquedas realizadas:** `npx skills find testing` devolvió, entre otras, `wshobson/agents@python-testing-patterns`, `wshobson/agents@e2e-testing-patterns` y skills de pruebas de navegador. `npx skills find typescript` devolvió, entre otras, `wshobson/agents@typescript-advanced-types`, `jeffallan/claude-skills@typescript-pro`, `sickn33/agentic-awesome-skills@typescript-expert` y `github/awesome-copilot@javascript-typescript-jest`.
- **Skill elegida:** [python-testing-patterns](.agents/skills/python-testing-patterns/SKILL.md). El cambio es una prueba de integración pytest con `TestClient` sobre el contrato de FastAPI; `pytest.mark.parametrize` cubre límites inclusivos, cada extremo abierto y rango invertido. Esto convierte en evidencia automatizada los casos del filtro de fechas que, según la exploración de `feature/frontend-specs`, habían quedado como «❓ sin evidencia».
- **Skills TypeScript descartadas:** las opciones encontradas se enfocan en tipos avanzados, desarrollo TypeScript/Jest o servicios/frameworks TypeScript. Este endpoint y sus pruebas son Python/FastAPI/pytest; no hay un problema TypeScript relacionado que resolver en esta tarea.
- **Pruebas API:** `docker compose exec -T backend pytest` recogió **20 casos, 20 pasaron**; la línea base era 15, por lo que se añadieron cinco casos parametrizados. No apareció un bug y no se modificó código del backend.
- **Warning de pytest:** `StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.` Es el warning deprecado ya registrado en la línea base; no se instalaron dependencias.

## Skill interna

- **Gap que cubre:** [dashboard-qa-pre-merge.md](.skills/dashboard-qa-pre-merge.md) reúne QA específico de este repo que no estaba en las skills comunitarias: arranque Docker, incidencia Codespaces con `frontend/.env` y puerto público 8000, procedencia/comparación de línea base, warnings conocidos, verificación humana en navegador y alcance de `git status`.
- **Validación en una tarea real (QA de `feature/agent-skills` antes del PR):** en la primera aplicación, frontend/backend e interfaz pasaron, pero la comparación de baseline quedó `PENDING`: el paso 5 solo aceptaba una ejecución en `main` y rechazaba el registro de la rama recién creada desde `main` sin cambios. Se refinó para aceptar (a) registros de los mismos comandos en `main` o (b) un registro tomado en la rama nueva antes del primer commit, documentando que tenía el mismo código que `main`. En la segunda aplicación, el informe quedó con todo `PASS`: build/tests/lint/pytest, endpoints y Git; teclado y Lighthouse fueron verificados por una persona. Fuentes: `verification.md` en `main`, esta nota (línea base y verificación manual) y el informe QA de la rama.
