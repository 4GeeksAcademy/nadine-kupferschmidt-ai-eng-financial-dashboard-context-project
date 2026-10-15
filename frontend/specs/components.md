# Especificación de componentes

Fase 3. Solo especificación: no se crean componentes, utilidades, rutas ni fetch.
Las ubicaciones y funciones nuevas indicadas abajo son propuestas para la implementación futura.

## Fuentes y convenciones

- Contratos: [api-types.ts](api-types.ts) y [param-types.ts](param-types.ts).
- Acuerdos prevalentes: [decisiones.md](decisiones.md). Evidencia de API: [exploracion-api.md](exploracion-api.md), secciones 1 a 4 y «Endpoints adicionales revisados».
- Reglas: [01](../../.agents/rules/01-app-como-compositor.md), [05](../../.agents/rules/05-conservar-error-real.md), [06](../../.agents/rules/06-nombres-frontend.md) y [17](../../.agents/rules/17-verificar-interfaz-en-navegador.md).
- Los nombres de props y estados son contratos **internos de UI**, no campos nuevos de la API. Los objetos de respuesta conservan exactamente sus campos. `null` significa recurso aún no disponible; `[]`, respuesta válida sin filas.
- Todas las transformaciones, validaciones y formatos se delegan a funciones exportadas desde el módulo existente [financial-utils.ts](../src/lib/financial-utils.ts). `App` compone, mantiene estado y pasa props; no suma, filtra ni formatea en JSX. Las funciones futuras se enumeran al final.
- Errores de recurso: `error: string | null` contiene un mensaje seguro; el responsable de la carga conserva el error original como `unknown`, estado HTTP y contexto del recurso para diagnóstico, sin exponer cuerpos técnicos al usuario. El `catch` actual descarta ese detalle: deberá corregirse al implementar, no en esta fase.
- Prioridad visual de recursos: error, carga, éxito vacío, éxito con datos. Nunca mostrar datos del rango anterior como si pertenecieran al nuevo. Durante cambios se sustituye el contenido afectado por skeleton; no mezclar respuestas de distintas selecciones.

### Reutilización verificada

| Existente | Contrato actual y uso futuro |
| --- | --- |
| [DashboardHeader](../src/components/dashboard/dashboard-header.tsx) | `period?: string`; mantener el período derivado, sin usar su texto como rango disponible exacto. |
| [KPIRow](../src/components/dashboard/kpi-row.tsx) y [KPICard](../src/components/dashboard/kpi-card.tsx) | `metrics: KPIMetrics | null`, `loading?: boolean`; mantener KPI derivados de movimientos del rango aplicado con `computeKPIs`. Sin nuevas props en esta fase. |
| [IncomeOutcomeChart](../src/components/dashboard/income-outcome-chart.tsx) y [ProfitPercentChart](../src/components/dashboard/profit-percent-chart.tsx) | `data: MonthlyDataPoint[]`, `loading?: boolean`; conservar series con `computeMonthlyData` y encabezado con `formatMonthlyPeriod`. Tienen skeleton, área de gráfico de 280 px y vacío; no tienen prop de error. El contenedor deberá reemplazarlos por el error cuando corresponda. |
| [Card](../src/components/ui/card.tsx) y [Skeleton](../src/components/ui/skeleton.tsx) | Reutilizar primitivas y estilo existente; no envolver secciones enteras en tarjetas ni anidar tarjetas. |

Los componentes actuales usan Tailwind, Recharts y Lucide. Mantener sus tokens,
tipografía compacta y espaciado; nuevos controles con etiquetas accesibles. Dos
columnas en escritorio cuando se indique y una en móvil. Tablas con cabecera
semántica y desbordamiento horizontal local, sin desbordar la página. Skeletons
con dimensiones estables; alertas de validación asociadas al input.

## F1. Filtro de fechas

### DateRangeControls

**Archivo propuesto:** `frontend/src/components/dashboard/date-range-controls.tsx`.

**Props:**

| Prop | Tipo | Significado |
| --- | --- | --- |
| `value` | `DateRangeFilter` | Borrador de los dos inputs, no necesariamente aplicado. |
| `onChange` | `(value: DateRangeFilter) => void` | Comunica la edición; un input vacío omite su propiedad. |
| `facets` | `FacetsResponse | null` | Referencia global de fechas. |
| `loading` | `boolean` | Carga de facetas. |
| `error` | `string | null` | Error seguro al obtener facetas. |

**Layout:** franja sin tarjeta debajo del encabezado y de la navegación, compartida
por ambas vistas. Inputs nativos de fecha «Inicio» y «Fin»; valores contractuales
`YYYY-MM-DD` aunque el navegador pueda localizarlos. Debajo, texto
«Rango disponible: {min_date} a {max_date}» con las fechas completas. Ambos inputs
usan `min=facets.min_date` y `max=facets.max_date`; la referencia es global, no
cambia con la selección. Los mensajes se muestran junto a los controles.

**Comportamiento y renderizado condicional:**

| Caso | Resultado |
| --- | --- |
| Facetas cargando | Skeleton para el rango disponible e inputs deshabilitados hasta conocer sus límites. Los datos del dashboard tienen su carga independiente. |
| Error de facetas | «No se pudo cargar el rango disponible.»; inputs deshabilitados, sin inventar límites. No convertirlo en un dashboard vacío. |
| `facets === null` sin carga ni error | «Rango disponible no disponible» e inputs deshabilitados. No es una respuesta vacía del contrato: facetas exige ambas fechas. |
| Ambas fechas ausentes | Rango aplicado `{}`: todos los datos disponibles, sin parámetros de fecha. |
| Solo una fecha completa | Rango aplicado `{}`: mostrar todos los datos y el texto exacto «Completa ambas fechas para aplicar el filtro». No conservar un filtro previo ni enviar un extremo abierto. |
| Inicio posterior a fin | «La fecha de inicio no puede ser posterior a la fecha de fin.»; rango aplicado `{}`, sin enviar el rango inválido. |
| Fecha inválida o fuera de los límites | Error junto al campo y ningún filtro inválido; usar datos sin filtro. Validar también fuera de la validación nativa del input. |
| Ambas válidas, dentro de límites y ordenadas | Aplicar ambas fechas inclusive al dashboard, tops y resúmenes; también a alertas si el umbral es válido. Un umbral inválido solo congela las alertas. |
| Rango válido sin movimientos | Conservar inputs y referencia global; KPI en cero, gráficos vacíos, alertas y paneles con sus mensajes propios. No borrar el rango elegido. |

**Funciones necesarias:** `validateDateRange`, `resolveAppliedDateRange` y
`formatAvailableDateRange`. Para los componentes existentes, seguir usando
`computeKPIs`, `computeMonthlyData` y `formatMonthlyPeriod` sobre los movimientos
del rango aplicado, no sobre el borrador.

## F2. Alertas de egresos

### OutcomeAlertsSection

**Archivo propuesto:** `frontend/src/components/dashboard/outcome-alerts-section.tsx`.

**Props:**

| Prop | Tipo | Significado |
| --- | --- | --- |
| `params` | `AlertsParams` | Parámetros de la última consulta válida de alertas: `threshold`, `group_by: "month"` y su rango; mientras la tabla esté congelada pueden diferir del rango actual del dashboard. |
| `thresholdInput` | `string` | Borrador editable, conserva valores vacíos o inválidos sin ajustarlos. |
| `onThresholdInputChange` | `(value: string) => void` | Edición del control; no representa todavía un umbral validado. |
| `entries` | `AlertsResponse | null` | Filas de API; cada una es `AlertEntry`. |
| `facets` | `FacetsResponse | null` | Permite evaluar los extremos disponibles cuando no hay filtro. |
| `loading` | `boolean` | Carga de alertas. |
| `error` | `string | null` | Error seguro del recurso. |

**Layout:** sección debajo de los gráficos actuales. Encabezado «Alertas de
egresos» y control numérico «Umbral» con ratio visible; valor inicial `0.3`,
`min=0.01`, `max=1.0`. Debajo, error del input o aviso de meses incompletos y tabla
de cuatro columnas. No introducir un selector de agrupación: siempre mensual.

| Columna | Campo y tipo | Formato |
| --- | --- | --- |
| Período | `AlertEntry["period"]` = `string` | `YYYY-MM`, sin convertirlo en fecha con zona horaria. OpenAPI solo declara string; el formato mensual está observado. |
| Outcome registrado | `AlertEntry["outcome_total"]` = `number` | `formatCurrency(outcome_total)`: USD, separadores existentes y cero decimales, igual que los KPI. |
| Media de períodos anteriores | `AlertEntry["baseline_average"]` = `number` | `formatCurrency(baseline_average)`; media histórica que entrega la API, no ventana de tres. |
| Incremento porcentual | `AlertEntry["increase_ratio"]` = `number` | `formatPercent(increase_ratio * 100)`: `1.0201` se presenta como `102.0%`. Puede superar `100%`. |

**Renderizado condicional y validación:**

- Cargando: conservar encabezados y skeleton de cuatro columnas. Error: «No se pudieron cargar las alertas.», sin presentarlo como ausencia de alertas.
- Éxito con `entries.length === 0`: texto exacto **«No hay alertas para el rango de fechas y el umbral seleccionados.»** Una respuesta vacía no prueba que no existan movimientos.
- `entries === null` sin carga ni error: «Alertas no disponibles», no el texto de éxito vacío.
- Umbral fuera de `[0.01, 1.0]`, vacío o no numérico: mostrar junto al input **«Introduce un umbral entre 0.01 y 1.0.»** Marcarlo inválido y no pedir datos nuevos de alertas hasta corregirlo; no ajustar al extremo más cercano ni sustituirlo por `0.3` silenciosamente. API admite desde `0` sin máximo, pero la UI es más restrictiva.
- Durante un umbral inválido congelar solo la tabla de alertas: conservar su última respuesta y sus parámetros, identificada como «Se muestran los últimos datos válidos.» e indicar las fechas y el umbral de esa consulta. Los KPI, gráficos y la vista B2B vs B2C siguen respondiendo a cambios de fechas válidos, incluidos tops y resúmenes. No atribuir las alertas anteriores al nuevo rango global. Si aún no hay respuesta válida, mantener «Alertas no disponibles». Al corregir el umbral, consultar alertas con el rango actual resuelto; no recuperar las fechas antiguas de la tabla congelada.
- Las alertas se muestran tal cual; el cliente no recalcula medias, no genera filas adicionales ni aplica una ventana de tres. Usar `group_by: "month"`; la API decide con comparación estricta `increase_ratio > threshold`.

**Meses incompletos:** sobre la tabla, mostrar el aviso exacto **«El rango incluye
meses incompletos; las alertas comparan totales mensuales parciales.»** cuando el
inicio efectivo no sea el primer día del mes o el fin efectivo no sea el último.
Usar ambas fechas aplicadas; sin filtro, usar `facets.min_date` y `facets.max_date`
como extremos disponibles. No usar el borrador inválido o incompleto. No asumir
meses de 30 días ni completar importes. Si faltan facetas y no hay filtro, la
completitud no puede determinarse: ❓ sin evidencia. La existencia de movimientos
todos los días o la integridad del origen tampoco está demostrada por las facetas.

**Funciones necesarias:** `validateAlertThreshold`, `hasPartialMonthRange`,
`formatAlertPeriod`, `formatCurrency` y `formatRatioPercent` (que reutiliza `formatPercent`). El aviso
permanece visible junto al vacío si corresponde al rango consultado. Si se muestran
últimos datos válidos, calcular también su aviso con sus parámetros, no con la edición actual.

## F3. Vista B2B vs B2C

### Navegación acordada

[package.json](../package.json) declara React, Recharts y Lucide, pero **ninguna
librería de rutas** en `dependencies` ni `devDependencies`.

**Decisión 6:** usar dos vistas mediante estado local de React,
`"dashboard" | "business-comparison"`, sin nuevas dependencias. El control
segmentado «Dashboard» / «B2B vs B2C» cambia el contenido principal, con estado
activo accesible. Dentro de `BusinessComparisonView`, el botón «← Volver al dashboard»
regresa a la vista principal. Compartir el rango aplicado al cambiar de vista.
No hay URL propia ni enlace directo; la flecha Atrás del navegador no cambia de
vista y la selección no persiste tras recargar. La solución técnica está decidida;
queda por confirmar con el PM si estas limitaciones satisfacen «nueva página».

### DashboardViewNavigation

**Archivo propuesto:** `frontend/src/components/dashboard/dashboard-view-navigation.tsx`.

**Props:** `value: "dashboard" | "business-comparison"` y
`onChange: (value: "dashboard" | "business-comparison") => void`.
Son valores locales de UI, no enums de la API.

**Layout:** control segmentado bajo el encabezado, antes del filtro compartido.
**Renderizado condicional:** no depende de datos; sigue disponible durante carga,
error y vacío. No borra el rango ni el umbral. La vista destino muestra sus propios
estados. **Funciones de cálculo:** ninguna; solo comunica una selección conforme
a la decisión 6.

### BusinessComparisonView

**Archivo propuesto:** `frontend/src/components/dashboard/business-comparison-view.tsx`.

**Props:**

| Prop | Tipo | Significado |
| --- | --- | --- |
| `range` | `DateRangeFilter` | Rango ya aplicado, nunca el borrador. |
| `onBack` | `() => void` | Cambia el estado local a `"dashboard"`; no llama al historial del navegador. |
| `topParams` | `Record<BusinessType, TopCategoriesParams>` | Un top por negocio con `operation_type: "income"`, `limit: 5` y el mismo rango. |
| `summaryParams` | `Record<BusinessType, SummaryParams>` | Un resumen por negocio con `operation_type: "income"` y el mismo rango. |
| `tops` | `Record<BusinessType, TopCategoriesResponse | null>` | Resultados de categorías separados por la petición de origen. |
| `summaries` | `Record<BusinessType, SummaryResponse | null>` | Series de ingresos separadas por negocio. |
| `topLoading` / `summaryLoading` | `Record<BusinessType, boolean>` | Carga independiente para cada recurso y negocio. |
| `topErrors` / `summaryErrors` | `Record<BusinessType, string | null>` | Errores seguros por recurso y negocio. |

`BusinessType` procede de los enums existentes. Las claves B2B y B2C de estos
mapas son organización interna de UI: ni el top ni summary devuelven un nuevo
campo `business_type`. Asociar cada respuesta a sus parámetros de petición;
comprobar que negocio y rango coincidan antes de combinarla.

**Layout:** botón «← Volver al dashboard» junto al título «B2B vs B2C»;
gráfico comparativo a todo el ancho,
después paneles «B2B» y «B2C» en dos columnas, apilados en móvil. Sin tarjeta
exterior que contenga otras tarjetas. El filtro F1 permanece fuera de la vista.

**Renderizado condicional:** carga y error independientes por negocio y recurso;
el botón de vuelta sigue disponible durante carga, error y vacío.
un top fallido no oculta el otro ni impide un gráfico con resúmenes válidos.
Un resumen fallido no se transforma en cero. No hay un vacío global que sustituya
las explicaciones particulares de cada panel. La tabla puede mostrar importes
del top con porcentajes pendientes si su resumen aún no está disponible.

**Funciones necesarias:** `sumSummaryIncome` y `buildBusinessIncomePoints`;
las llama el responsable de composición y pasa los resultados a los componentes
presentacionales. Esta vista no carga ni suma movimientos de `/api/metrics`.

### BusinessCategoryPanel

**Archivo propuesto:** `frontend/src/components/dashboard/business-category-panel.tsx`.
Reutilizar dos instancias, no crear implementaciones distintas por negocio.

**Props:**

| Prop | Tipo | Significado |
| --- | --- | --- |
| `businessType` | `BusinessType` | Prop interna camelCase; negocio indicado por `business_type` en los parámetros de la petición, sin renombrar el campo de API. |
| `entries` | `TopCategoriesResponse | null` | Cada fila es `CategoryEntry`; hasta cinco categorías existentes. |
| `totalIncome` | `number | null` | Suma derivada de `SummaryResponse` del mismo negocio y rango, no campo de API. |
| `loading` / `totalLoading` | `boolean` | Carga de top / resumen. |
| `error` / `totalError` | `string | null` | Error de top / resumen. |

**Layout:** panel individual con título del negocio y tabla «Categoría», «Total de
ingresos», «% del grupo». Mantener identificadores `category` si no hay etiquetas
de producto confirmadas; sus traducciones son ❓ sin evidencia. Importes con
`formatCurrency` (USD y cero decimales) y porcentajes con `formatPercent` (un decimal).
No completar hasta cinco filas ficticias.

**Renderizado condicional:**

- Top cargando: skeleton de tres columnas. Error: «No se pudieron cargar las categorías de B2B.» o «No se pudieron cargar las categorías de B2C.» según instancia.
- Top B2B vacío: **«No hay categorías de ingreso B2B para el rango seleccionado.»**
- Top B2C vacío: **«No hay categorías de ingreso B2C para el rango seleccionado.»**
- `entries === null` sin carga/error: «Categorías no disponibles», no el éxito vacío.
- Con top válido y resumen cargando: conservar nombre e importe y skeleton en porcentajes. Con error de resumen, mostrar «No se pudo cargar el total del grupo.» y «No disponible» en porcentajes; no esconder las categorías.
- Total válido cero: porcentaje «No aplica», sin dividir por cero ni inventar `0 %`. Un top vacío no implica por sí solo que el total sea cero.

**Cálculo por categoría:** `totalDelGrupo = suma de income de todos los períodos
del summary del negocio`; `% = 100 * entry.total_amount / totalDelGrupo`.
El denominador incluye todas las categorías y usa exactamente el mismo rango
aplicado. Nunca sumar solo el top ni usar movimientos, `net` u `outcome` como
denominador. Redondear solo la presentación; no el cociente intermedio.

**Funciones necesarias:** `computeCategoryShare`, `formatCurrency` y
`formatPercent`. El panel no necesita ni calcula una media de alertas.

### BusinessIncomeChart

**Archivo propuesto:** `frontend/src/components/dashboard/business-income-chart.tsx`.

**Props:** `totals: Record<BusinessType, number | null>`,
`loading: Record<BusinessType, boolean>` y
`errors: Record<BusinessType, string | null>`. Los totales son derivados de
`SummaryResponse`, no nuevas propiedades del modelo de respuesta.

**Layout:** gráfico de barras Recharts, altura estable de 280 px siguiendo los
gráficos existentes. Eje horizontal B2B / B2C; vertical ingreso total; tooltip
con `formatCurrency`. Alternativa textual accesible con ambos valores en el mismo
formato al lado del gráfico.

**Los dos puntos representan:** uno es la suma de `income` de **todos** los períodos
de B2B y el otro la de B2C, ambos en el rango aplicado. No son meses, categorías,
beneficio neto ni importes de solo los cinco primeros resultados. Mantener ambos
negocios aunque una respuesta válida de resumen sea `[]`: su suma es cero.

**Renderizado condicional:** mientras falte una respuesta por carga, skeleton del
gráfico para evitar una comparación incompleta. Con error, no dibujar una barra
cero para el recurso fallido; mostrar «No se pudo completar la comparación de
ingresos.» y conservar en la alternativa textual el valor válido del otro negocio.
Si alguno es `null` sin carga/error, indicar «Comparación no disponible». Si ambos
totales válidos son cero, mostrar **«No hay ingresos para comparar en el rango
seleccionado.»** y ambos valores cero en la alternativa textual. Con un solo
total cero y el otro positivo, mostrar los dos puntos, sin estado vacío global.

**Funciones necesarias:** `sumSummaryIncome`, `buildBusinessIncomePoints` y
`formatCurrency`. El adaptador al gráfico usa dos puntos derivados
identificados por negocio; su forma interna no se añade a los tipos de API.

## Contrato de utilidades

Las nuevas utilidades se proponen como exportaciones de [financial-utils.ts](../src/lib/financial-utils.ts);
`formatCurrency` y `formatPercent` ya existen y se reutilizan sin cambios.
No se implementa ninguna aquí. Las comprobaciones de formato y calendario no deben
depender de conversiones que desplacen una fecha por zona horaria.

| Función | Entradas → salida / responsabilidad |
| --- | --- |
| `validateDateRange` | `(range: DateRangeFilter, facets: FacetsResponse) → string \| null`; validar formato real de calendario, pareja completa, límites globales y orden. Mensajes de F1. |
| `resolveAppliedDateRange` | `(range: DateRangeFilter, facets: FacetsResponse) → DateRangeFilter`; devolver ambas fechas válidas o `{}`; nunca un extremo abierto. |
| `formatAvailableDateRange` | `(facets: FacetsResponse) → string`; referencia global exacta con `min_date` y `max_date`. |
| `validateAlertThreshold` | `(input: string) → string \| null`; exigir número finito en `[0.01, 1.0]`, sin ajustar; normalización del valor válido también fuera del JSX. |
| `hasPartialMonthRange` | `(range: DateRangeFilter, facets: FacetsResponse \| null) → boolean \| null`; extremos del rango aplicado o disponibles, primer/último día del mes; null si faltan extremos. |
| `formatAlertPeriod` | `(period: AlertEntry["period"]) → string`; conservar el `YYYY-MM` mensual; no convertirlo a otra granularidad ni fabricar fechas. |
| `sumSummaryIncome` | `(entries: SummaryResponse) → number`; sumar todos los `SummaryEntry.income`; `[] → 0`, sin interpretar null/error como cero. |
| `buildBusinessIncomePoints` | `(totals: Record<BusinessType, number>) → pares internos negocio/total`; dos puntos en orden B2B, B2C. Solo entradas ya disponibles, no null. |
| `computeCategoryShare` | `(entry: CategoryEntry, totalIncome: number) → number \| null`; porcentaje `100 * total_amount / totalIncome`, null si el denominador es cero. |
| `formatCurrency` (existente) | `(value: number) → string`; formato actual `en-US`, USD y cero decimales. Reutilizar para todos los importes nuevos. |
| `formatRatioPercent` | `(ratio: AlertEntry["increase_ratio"]) → string`; multiplicar por 100 y delegar en `formatPercent`. |
| `formatPercent` (existente) | `(value: number) → string`; porcentaje con un decimal y `%`, sin multiplicar por 100. Usarlo directamente para el resultado de `computeCategoryShare`. |

**Decisión 7:** conservar el formato de toda la pantalla. El dashboard ya usa
`formatCurrency` para ingresos en [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx#L16)
y `formatPercent` para el margen en [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx#L40).
La moneda de presentación acordada es USD: su configuración está en
[financial-utils.ts](../src/lib/financial-utils.ts#L80), dentro de `formatCurrency`.
La función `formatPercent` está en [financial-utils.ts](../src/lib/financial-utils.ts#L86).
Esto fija la presentación por decisión de producto, no añade un campo de moneda
a la API. Para alertas, siempre multiplicar `increase_ratio` por 100 antes de
`formatPercent`; para porcentajes de categoría ya calculados, no multiplicar otra vez.

## Verificación al implementar

La regla 17 exige comprobar en navegador cualquier futuro cambio de `App` o
componentes. Esta fase documental no verifica una interfaz nueva. Casos mínimos:
dos fechas válidas; una fecha tras un filtro previo; inicio posterior a fin;
límites globales; umbral inválido sin nuevas peticiones de alertas mientras KPI,
gráficos y B2B vs B2C sí responden a fechas válidas; aviso de meses parciales;
alertas vacías y porcentaje superior a 100; top vacío en cada negocio; fallo de
un resumen sin falsear ceros; gráfico con cero, uno o ambos grupos con ingresos;
cambio de vista sin perder selección, botón «← Volver al dashboard», flecha Atrás
del navegador sin cambio de vista, formatos existentes y escritorio/móvil sin solapamientos.
Probar también los helpers con casos nominales y bordes durante la implementación.