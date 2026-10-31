# Contrato de datos del frontend

Fase 4. Guía para implementar F1, F2 y F3; este documento no implementa código.

## Cómo usar esta spec

Leer en este orden, además de las instrucciones del repositorio:

1. [decisiones.md](decisiones.md): los siete acuerdos de producto. **Manda si hay dudas o contradicciones** con propuestas anteriores o comentarios de tipos.
2. [exploracion-api.md](exploracion-api.md): contrato observado, ejemplos reales, fuentes OpenAPI y límites de la evidencia. Sus alternativas no sustituyen decisiones posteriores.
3. [api-types.ts](api-types.ts): formas de las respuestas y enums literales.
4. [param-types.ts](param-types.ts): formas de las peticiones y restricciones de UI.
5. [components.md](components.md): props, layout, estados, textos exactos, utilidades y comprobaciones visuales.
6. Este README: conectar cada funcionalidad con sus peticiones y casos límite.

Las queries siguientes son plantillas exactas, no nuevas llamadas de ejemplo.
Sustituir `{inicio}` y `{fin}` por fechas válidas `YYYY-MM-DD` del **rango aplicado**;
`{umbral}` por el ratio numérico validado. Nunca enviar llaves literales, cadenas
vacías ni `null`. Con rango válido, enviar ambas fechas; sin rango, omitir ambas.
No usar las fechas del borrador ni conservar un filtro previo cuando queda una
sola fecha o el rango es inválido.

Las respuestas descritas son `200` JSON, sin envoltorios añadidos. `null` es estado
interno de recurso no disponible; un array `[]` es éxito vacío. Conservar el error
técnico original para diagnóstico y mostrar solo los mensajes seguros de
[components.md](components.md). No confundir error con vacío ni mezclar respuestas
de distintos rangos o negocios. Los formatos y cálculos se delegan a utilidades
de [financial-utils.ts](../src/lib/financial-utils.ts); `App` solo compone.

## F1. Filtro de fechas

### Endpoints y tipos

Facetas globales, sin query y sin filtros:

```http
GET /api/metrics/facets
```

- Petición: sin parámetros; no hay un tipo de petición específico en los contratos.
- Respuesta: `FacetsResponse` en [api-types.ts](api-types.ts).
- Reutilizar `min_date` y `max_date` como referencia global y límites de ambos inputs; no recalcularlos a partir de la selección.

Movimientos del dashboard, sin rango y con rango aplicado, respectivamente:

```http
GET /api/metrics
GET /api/metrics?start_date={inicio}&end_date={fin}
```

- Petición: `DateRangeFilter` en [param-types.ts](param-types.ts), usado también para esta query de fechas. No crear otro contrato de movimientos.
- Respuesta: `FinancialMovement[]`, con `FinancialMovement` existente en [financial-types.ts](../src/lib/financial-types.ts); no está duplicado en los tipos de la spec.
- Derivar KPI y series con `computeKPIs` y `computeMonthlyData`; período con `formatMonthlyPeriod`. El mismo rango se propaga a F2 y F3; solo las alertas quedan congeladas si su umbral es inválido.

### Parámetros

Facetas no declara parámetros. Para movimientos:

| Nombre | Valores válidos | Restricción de la API | Restricción de la UI |
| --- | --- | --- | --- |
| `start_date` | Fecha real `YYYY-MM-DD` u omitido | Opcional/anulable, extremo inclusivo, sin mínimo/máximo declarados. | Ambas fechas o ninguna; entre `min_date` y `max_date`, no posterior a `end_date`. |
| `end_date` | Fecha real `YYYY-MM-DD` u omitido | Opcional/anulable, extremo inclusivo, sin mínimo/máximo declarados. | Ambas fechas o ninguna; entre `min_date` y `max_date`, no anterior a `start_date`. |
| `category` | Valores de `Category` en [api-types.ts](api-types.ts) | Opcional/anulable: `suppliers`, `sales`, `operational`, `administrative`, `others`. | Omitir: F1 no filtra categorías. |
| `operation_type` | `income`, `outcome` | Opcional/anulable. | Omitir: los KPI y gráficos necesitan ingresos y egresos. |

### Casos límite

- Una sola fecha completa, incluso después de un filtro previo: mostrar todos los datos sin filtro y **«Completa ambas fechas para aplicar el filtro»**. No enviar un extremo abierto.
- Fecha de calendario inválida: mostrar **«La fecha no es válida.»** junto al campo y usar todos los datos sin filtro.
- Fecha fuera de los límites globales: mostrar **«La fecha debe estar entre {min_date} y {max_date}.»** junto al campo y usar todos los datos sin filtro.
- Inicio posterior a fin: **«La fecha de inicio no puede ser posterior a la fecha de fin.»**; no aplicar el filtro, usar datos sin filtro.
- Mostrar todos los errores activos a la vez, en este orden fijo: **«La fecha no es válida.»**, **«La fecha debe estar entre {min_date} y {max_date}.»**, **«Completa ambas fechas para aplicar el filtro»**, **«La fecha de inicio no puede ser posterior a la fecha de fin.»**. El error de rango invertido solo se evalúa si ambas fechas están completas y son válidas. Cada mensaje desaparece al corregir su error; los demás siguen visibles. Mientras haya errores, usar todos los datos sin filtro.
- Ambas fechas válidas, dentro de límites y ordenadas: aplicar el filtro automáticamente a movimientos, alertas (si el umbral es válido), tops y resúmenes. No hay botón de aplicación.
- Error de facetas: **«No se pudo cargar el rango disponible.»** e inputs deshabilitados; no inventar límites ni mostrar un dashboard vacío por ese error.
- Sin facetas, carga ni error: **«Rango disponible no disponible»** e inputs deshabilitados. Durante carga, skeleton de referencia e inputs deshabilitados.
- Ambas fechas ausentes: todos los datos sin query de fechas. Rango válido sin movimientos: conservar selección y referencia global, KPI en cero y estados vacíos de cada gráfico o recurso.

Referencia de presentación y validación: [components.md](components.md#f1-filtro-de-fechas),
`DateRangeControls`. Mostrar **«Rango disponible: {min_date} a {max_date}»**,
independiente de la selección. Los valores de facetas son fechas, no etiquetas mensuales.

## F2. Alertas de egresos

### Endpoint y tipos

Sin rango y con rango aplicado, respectivamente:

```http
GET /api/metrics/alerts?threshold={umbral}&group_by=month
GET /api/metrics/alerts?threshold={umbral}&group_by=month&start_date={inicio}&end_date={fin}
```

- Petición: `AlertsParams` en [param-types.ts](param-types.ts); `threshold` y `group_by` explícitos. Valor inicial de umbral: `0.3`.
- Respuesta: `AlertsResponse` = `AlertEntry[]` en [api-types.ts](api-types.ts).
- Consumir las alertas tal cual. La columna se llama **«Media de períodos anteriores»** y usa `baseline_average`; no recalcular tres períodos ni usar summary para alertas.
- `period` se muestra mensual `YYYY-MM`; `outcome_total` y `baseline_average` con `formatCurrency`. `increase_ratio` pasa a `formatPercent(increase_ratio * 100)`: `1.0201` → `102.0%`. Ver las cuatro columnas en [components.md](components.md#f2-alertas-de-egresos).

### Parámetros

| Nombre | Valores válidos | Restricción de la API | Restricción de la UI |
| --- | --- | --- | --- |
| `threshold` | Ratio numérico | Opcional, defecto `0.3`, mínimo inclusivo `0`, sin máximo declarado. | Número finito en `[0.01, 1.0]`; inicial `0.3`. No ajustar automáticamente. |
| `group_by` | `day`, `week`, `month` en API | Opcional, defecto `month`. | Enviar solo `month`, exigido por `AlertsParams`. |
| `start_date` | Fecha real `YYYY-MM-DD` u omitido | Opcional/anulable, inclusivo, sin límites declarados. | Regla F1: pareja válida dentro de facetas o ambas omitidas. |
| `end_date` | Fecha real `YYYY-MM-DD` u omitido | Opcional/anulable, inclusivo, sin límites declarados. | Regla F1: pareja válida y ordenada o ambas omitidas. |
| `business_type` | `B2B`, `B2C` | Opcional/anulable; sin defecto declarado. | Omitir: la tabla de alertas no se separa por negocio y `AlertsParams` no lo incluye. |

### Casos límite

- Umbral fuera de rango, vacío o no numérico: **«Introduce un umbral entre 0.01 y 1.0.»** junto al input. Congelar **solo alertas**, sin nuevas consultas de ese recurso; KPI, gráficos y F3 siguen respondiendo a fechas válidas.
- Consultar el nuevo umbral válido al salir del campo o al presionar Enter; no consultar mientras se escribe.
- Durante ese bloqueo, conservar la última respuesta con **«Se muestran los últimos datos válidos.»**, sus fechas y umbral. Si no existe respuesta previa: **«Alertas no disponibles»**. Al corregir, usar el rango global actual, no el antiguo de la tabla.
- Respuesta `[]`: **«No hay alertas para el rango de fechas y el umbral seleccionados.»** No equivale necesariamente a ausencia de movimientos.
- Rango con inicio distinto del primer día de mes o fin distinto del último: **«El rango incluye meses incompletos; las alertas comparan totales mensuales parciales.»** Usar el rango de la consulta mostrada; sin filtro, extremos de facetas. El aviso también acompaña el vacío. Si no se puede determinar la completitud, no mostrar aviso.
- Error de consulta: **«No se pudieron cargar las alertas.»**; no mostrar el mensaje de éxito vacío. En carga, skeleton con las cuatro columnas.

La API compara estrictamente `increase_ratio > threshold` y calcula la media con
el historial anterior dentro del rango filtrado; no completar meses ni generar
filas en frontend. Para el detalle de estados y del aviso mensual, seguir
[components.md](components.md#outcomealertssection) y las decisiones 1, 3 y 7.

## F3. Vista B2B vs B2C

### Endpoints y tipos

Reutilizar `GET /api/metrics/facets` de F1, sin query, con respuesta `FacetsResponse`
de [api-types.ts](api-types.ts), solo para las fechas y sus límites globales. No
usar `business_types` para decidir qué paneles mostrar: B2B y B2C siempre están
visibles. No enviar fechas a facetas.

Top por negocio: dos peticiones sin rango o sus correspondientes variantes con rango.

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date={inicio}&end_date={fin}
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C&start_date={inicio}&end_date={fin}
```

- Petición: `TopCategoriesParams` en [param-types.ts](param-types.ts), con `operation_type: "income"`, `limit: 5` y un negocio por petición.
- Respuesta: `TopCategoriesResponse` = `CategoryEntry[]` en [api-types.ts](api-types.ts).

Resumen por negocio: dos peticiones sin rango o sus correspondientes variantes con rango.

```http
GET /api/metrics/summary?operation_type=income&business_type=B2B
GET /api/metrics/summary?operation_type=income&business_type=B2C
GET /api/metrics/summary?operation_type=income&business_type=B2B&start_date={inicio}&end_date={fin}
GET /api/metrics/summary?operation_type=income&business_type=B2C&start_date={inicio}&end_date={fin}
```

- Petición: `SummaryParams` en [param-types.ts](param-types.ts). Omitir `group_by`: la API usa `month` por defecto. No filtrar categorías.
- Respuesta: `SummaryResponse` = `SummaryEntry[]` en [api-types.ts](api-types.ts).
- Top y resumen deben corresponder al mismo negocio y rango. Asociar resultados a los parámetros de origen: esas respuestas no incluyen un campo de negocio. La prop interna del panel es `businessType`; el parámetro HTTP sigue siendo `business_type`.

### Parámetros

| Nombre | Valores válidos | Restricción de la API | Restricción de la UI |
| --- | --- | --- | --- |
| `operation_type` | `income`, `outcome` | Top: opcional, defecto `outcome`. Summary: opcional/anulable, sin defecto declarado. | Enviar siempre `income`, literal de ambos tipos de petición. |
| `limit` (solo top) | Entero | Opcional, defecto `5`, mínimo `1`, máximo `20`. | Enviar `5`; no garantizar cinco categorías existentes. |
| `business_type` | `B2B`, `B2C` | Opcional/anulable en top y summary; sin defecto declarado. | Obligatorio en ambos tipos; una consulta por cada negocio, no mezcla global. |
| `start_date` | Fecha real `YYYY-MM-DD` u omitido | Opcional/anulable en ambos endpoints, inclusivo, sin límites declarados. | Regla F1; idéntico en los cuatro recursos. |
| `end_date` | Fecha real `YYYY-MM-DD` u omitido | Opcional/anulable en ambos endpoints, inclusivo, sin límites declarados. | Regla F1; idéntico en los cuatro recursos y no anterior al inicio. |
| `group_by` (solo summary) | `day`, `week`, `month` | Opcional, defecto `month`. | Omitir; no forma parte de `SummaryParams`. |
| `category` (solo summary) | Valores de `Category` en [api-types.ts](api-types.ts) | Opcional/anulable; enum de cinco categorías. | Omitir para incluir todo el ingreso del grupo. |

El gráfico tiene **dos puntos**: suma de todos los `income` de summary B2B y suma
de todos los `income` de summary B2C, en el rango aplicado. El porcentaje de cada
categoría es `100 * total_amount / totalDelGrupo`; el denominador es el mismo
total completo de summary, nunca la suma del top ni movimientos de metrics.
Con total cero, porcentaje no aplicable. No usar `net` como ingreso. Importes con
`formatCurrency` y porcentajes ya calculados con `formatPercent`, sin multiplicar
otra vez. Funciones y composición: [components.md](components.md#f3-vista-b2b-vs-b2c).

### Casos límite

- Top B2B vacío: **«No hay categorías de ingreso B2B para el rango seleccionado.»** Top B2C vacío: **«No hay categorías de ingreso B2C para el rango seleccionado.»** No rellenar categorías ficticias ni deducir el total de ese vacío.
- Mostrar siempre ambos paneles, aunque las facetas no enumeren uno de los negocios; si el top de ese grupo está vacío, mostrar su mensaje de vacío correspondiente.
- Top correcto con error de resumen: mantener categorías e importes, **«No se pudo cargar el total del grupo.»** y **«No disponible»** en porcentajes; no convertir el error en total cero. Mientras carga el resumen, skeleton solo en porcentajes.
- Total válido del grupo igual a cero: porcentaje **«No aplica»**, sin división por cero. Si ambos totales son cero: **«No hay ingresos para comparar en el rango seleccionado.»** y ambos valores cero en la alternativa textual.
- Un resumen fallido: **«No se pudo completar la comparación de ingresos.»**; conservar el valor disponible del otro negocio en texto, sin fabricar una barra cero. Un único total válido cero y el otro positivo no constituyen vacío global.
- Al volver, el botón **«← Volver al dashboard»** cambia el estado local sin perder el rango compartido; sigue disponible con carga, error o vacío. La flecha Atrás del navegador no cambia de vista y no existe URL propia.

Navegación mediante React local, sin nuevas librerías, según decisión 6; no usar
historial para el botón. Las props y los estados independientes de cada recurso
se detallan en [components.md](components.md#businesscomparisonview).

## Fuera de alcance

- Esta fase no implementa componentes, utilidades, fetch, rutas ni cambios de backend. Las ubicaciones futuras de componentes y las pruebas al implementar están en [components.md](components.md#verificación-al-implementar).
- No recalcular alertas de tres períodos, completar meses, ajustar umbrales automáticamente ni aplicar fechas con un extremo abierto: son alternativas descartadas, no decisiones pendientes.
- No usar los endpoints de movimientos por negocio ni el de comparación para sustituir summary; no añadir filtros de categorías, selector de granularidad, exportaciones o campos de respuesta nuevos.
- No añadir router, URL propia, historial de vistas ni persistencia de la selección tras recargar. **Por confirmar con el PM:** si el cambio local y sus limitaciones satisfacen la petición de nueva página. La solución técnica vigente es la decisión 6, no una invitación a escoger otra sin acuerdo.
- Etiquetas traducidas definitivas de categorías: **❓ sin evidencia**. Hasta confirmarlas, mantener los identificadores según la especificación de componentes; no bloquear el resto de la implementación.
- La integridad del origen y la existencia de movimientos todos los días no se pueden deducir de facetas: **❓ sin evidencia**. Los casos no ejercitados por HTTP siguen identificados como tales en la exploración; esta guía no los convierte en pruebas realizadas.
- El formato no queda pendiente: decisión 7 adopta `formatCurrency` (USD, cero decimales) y `formatPercent` (un decimal) existentes. No introducir otro locale ni inferir un nuevo campo de moneda en la API.