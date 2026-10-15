# Exploración de la API del dashboard

Fecha de consulta: 2026-10-15. Servidor consultado: `http://localhost:8000`.
Contrato servido: OpenAPI `3.1.0`, Financial Metrics API `0.1.0`.
Este documento no implementa funcionalidades ni modifica frontend o backend.

## Fuentes y alcance

Contrato obtenido con el siguiente comando; se repitió su lectura en la ampliación
para revisar los cuatro endpoints adicionales:

```sh
curl --fail-with-body --silent --show-error --max-time 20 http://localhost:8000/openapi.json
```

Se hizo una única petición con curl a cada uno de los cuatro endpoints iniciales
y, en la ampliación, a cada uno de los cuatro endpoints adicionales.
Los ejemplos proceden de esas respuestas, no de los ejemplos del esquema.
Las rutas `#/paths/...` son punteros JSON sobre ese OpenAPI; `~1` representa `/`.
Las reglas de cálculo que OpenAPI no describe se contrastaron con
[routes.py](../../backend/app/routes.py), sin modificarlo. Ese código local no
demuestra por sí solo qué versión está ejecutándose en Docker: los casos no
ejercitados se distinguen de los resultados HTTP observados.

| Funcionalidad | Endpoints del alcance | Uso previsto en la spec |
| --- | --- | --- |
| Rango de fechas | `GET /api/metrics/facets`, `GET /api/metrics` | Obtener límites globales y movimientos filtrados para todos los KPI y gráficos actuales. |
| Alertas | `GET /api/metrics/alerts` | Pedir alertas con fechas, umbral y agrupación mensual; resolver antes la incompatibilidad de la media. |
| B2B vs B2C | `GET /api/metrics/categories/top`, `GET /api/metrics/facets`, `GET /api/metrics/summary`; alternativa: movimientos de `/api/metrics`, `/api/metrics/b2b` o `/api/metrics/b2c` | **Actualizado:** descubrir grupos, pedir un top por grupo y obtener sus ingresos agregados por período con `summary`, sumándolos para el total del rango; también pueden derivarse de movimientos. |

Convenciones de las tablas: todos los parámetros son de query; «no declarado»
significa que OpenAPI no fija ese límite o valor, no que se haya probado cualquier
valor. Para parámetros opcionales anulables, el esquema no publica `default`;
el código local usa `None`. En las futuras peticiones se omitirán los valores
vacíos, sin enviar `start_date=`, `end_date=` ni la cadena `null`.

## 1. GET /api/metrics/facets

### Parámetros

Ninguno declarado. No admite filtros de fechas en su contrato.

### Campos de respuesta

Respuesta `200`: objeto `MetricsFacets`. Todos sus campos son obligatorios y no anulables.

| Campo | Tipo |
| --- | --- |
| `operation_types` | array de string enum `income`, `outcome` |
| `business_types` | array de string enum `B2B`, `B2C` |
| `categories` | array de string enum `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `min_date` | string, formato `date` (`YYYY-MM-DD`) |
| `max_date` | string, formato `date` (`YYYY-MM-DD`) |

### Ejemplo real

Respuesta completa; no necesita recorte:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-10-02",
  "max_date": "2026-09-28"
}
```

### Fuente

- Operación: `#/paths/~1api~1metrics~1facets/get`.
- Respuesta: `#/paths/~1api~1metrics~1facets/get/responses/200/content/application~1json/schema`.
- Modelo: `#/components/schemas/MetricsFacets`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/facets'
```

El código local `get_metrics_facets` calcula las facetas sobre todos los movimientos:
el rango disponible no es el rango seleccionado ni cambia con él.

## 2. GET /api/metrics

### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `start_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `end_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others`, o null | No | No declarado; localmente `None` | No aplica |
| `operation_type` | string enum `income`, `outcome`, o null | No | No declarado; localmente `None` | No aplica |

No declara `business_type`. Cada movimiento sí identifica su línea de negocio.

### Campos de respuesta

Respuesta `200`: array de objetos `FinancialMovement`; todos los campos de cada
objeto son obligatorios y no anulables. No hay envoltorio, total ni paginación declarados.

| Campo de cada elemento | Tipo |
| --- | --- |
| `create_date` | string, formato `date` |
| `amount` | number |
| `operation_type` | string enum `income`, `outcome` |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `business_type` | string enum `B2B`, `B2C` |

### Ejemplo real recortado

Se recibieron 360 movimientos. A continuación, los primeros dos; el recuento
lo calculó el comando de presentación y no es un campo de la API:

```json
[
  {"create_date":"2025-10-02","amount":10178.62,"operation_type":"income","category":"sales","business_type":"B2B"},
  {"create_date":"2025-10-03","amount":1437.17,"operation_type":"income","category":"sales","business_type":"B2B"}
]
```

### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics/get/responses/200/content/application~1json/schema`.
- Modelo de elemento: `#/components/schemas/FinancialMovement`.
- Comando ejecutado (Node solo recorta la respuesta de la única llamada curl):

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics' | node -e 'let raw="";process.stdin.on("data",chunk=>raw+=chunk);process.stdin.on("end",()=>{const rows=JSON.parse(raw); console.log(JSON.stringify({count:rows.length,first:rows.slice(0,2)},null,2));});'
```

El código local `filter_movements_by_date` aplica ambos extremos de forma inclusiva
(`>= start_date`, `<= end_date`); omitir uno deja ese extremo abierto. No valida
`start_date <= end_date`: un rango invertido termina sin movimientos. Estas
variantes no se ejercitaron por HTTP: ❓ sin evidencia de ejecución para esos casos.

## 3. GET /api/metrics/alerts

### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `threshold` | number | No | `0.3` | Mínimo inclusivo `0`; máximo no declarado |
| `group_by` | string enum `day`, `week`, `month` | No | `month` | No aplica |
| `start_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `end_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `business_type` | string enum `B2B`, `B2C`, o null | No | No declarado; localmente `None` | No aplica |

### Campos de respuesta

Respuesta `200`: array de objetos `MetricsAlert`; todos los campos son
obligatorios y no anulables. Solo contiene períodos detectados como alertas.

| Campo de cada elemento | Tipo |
| --- | --- |
| `period` | string; OpenAPI no declara un formato |
| `outcome_total` | number |
| `baseline_average` | number |
| `increase_ratio` | number; ratio, no porcentaje listo para mostrar |

### Ejemplo real recortado

Se recibieron cuatro alertas. Se muestran las primeras dos:

```json
[
  {"period":"2025-12","outcome_total":103378.98,"baseline_average":51174.1,"increase_ratio":1.0201},
  {"period":"2026-03","outcome_total":88076.9,"baseline_average":56456.19,"increase_ratio":0.5601}
]
```

La primera equivale a un incremento del `102.01%`, no del `1.0201%`.

### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics~1alerts/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics~1alerts/get/responses/200/content/application~1json/schema`.
- Modelo de elemento: `#/components/schemas/MetricsAlert`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/alerts?threshold=0.3'
```

Evidencia adicional del código local `get_metrics_alerts`, `summarize_movements`
y `detect_outcome_alerts`:

- Filtra movimientos antes de agrupar y calcular la media; no incorpora historia exterior al rango.
- La media usa **todos** los períodos anteriores presentes, no una ventana de tres.
- Puede alertar desde el segundo período; el primero no tiene base de comparación.
- Calcula `(outcome - baseline) / baseline` y exige `increase_ratio > threshold`, no `>=`.
- Si la base no es positiva, no genera alerta. No rellena períodos sin movimientos.
- Redondea importes y media a dos decimales y el ratio a cuatro; compara antes de redondear el ratio.
- El período mensual es `YYYY-MM`, el diario `YYYY-MM-DD` y el semanal `YYYY-Www` ISO según el código; solo el mensual se observó por HTTP.

La alerta observada de diciembre aparece en el tercer mes de los datos disponibles:
es incompatible con exigir tres períodos anteriores completos antes de alertar.
Los bordes de umbral, base cero, fechas y agrupaciones alternativas no se probaron:
❓ sin evidencia HTTP para esos casos.

## 4. GET /api/metrics/categories/top

### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `operation_type` | string enum `income`, `outcome` | No | `outcome` | No aplica |
| `limit` | integer | No | `5` | Mínimo inclusivo `1`; máximo inclusivo `20` |
| `start_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `end_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `business_type` | string enum `B2B`, `B2C`, o null | No | No declarado; localmente `None` | No aplica |

### Campos de respuesta

Respuesta `200`: array de objetos `TopCategoryItem`, con todos sus campos
obligatorios y no anulables.

| Campo de cada elemento | Tipo |
| --- | --- |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | string enum `income`, `outcome` |
| `total_amount` | number |

No devuelve `business_type`, nombre localizado, porcentaje ni total del grupo.

### Ejemplo real

Respuesta completa de dos categorías, aunque `limit=5`:

```json
[
  {"category":"sales","operation_type":"income","total_amount":1132097.38},
  {"category":"others","operation_type":"income","total_amount":126049.49}
]
```

Sin `business_type`, este ejemplo combina B2B y B2C; no representa un ranking por grupo.

### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics~1categories~1top/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics~1categories~1top/get/responses/200/content/application~1json/schema`.
- Modelo de elemento: `#/components/schemas/TopCategoryItem`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/categories/top?operation_type=income&limit=5'
```

El código local `get_top_categories` filtra negocio y fechas antes de sumar;
`build_top_categories` ordena por total descendente y devuelve como máximo `limit`
categorías existentes, sin completar filas ficticias. El generador local solo
asigna `sales` u `others` a ingresos. El agente no hizo llamadas curl adicionales
a este endpoint. La variante B2B cuenta con la siguiente evidencia del usuario;
rankings B2C o filtrados por fecha: ❓ sin evidencia HTTP para esas variantes.

### Evidencia aportada por el usuario

`GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`
→ 2 categorías: `sales 557903.97`, `others 57636.75`.
✅ verificado en navegador por el usuario.

Esta evidencia no procede de una llamada curl del agente. La suma de ambas
categorías es `615540.72`, coincidente con el total B2B derivado en la ampliación.
En este ejemplo hay solo dos categorías, pero en general no debe usarse la suma
de un top truncado como denominador del grupo.

## Endpoints adicionales revisados

Ampliación del 2026-10-15: una petición curl por endpoint, todas con fechas
explícitas. **Conclusión corregida:** `/api/metrics/summary` sí entrega ingresos
agregados por período para una línea de negocio mediante `business_type`.
No entrega un único total del rango ni ambos negocios separados en una respuesta:
se suman los `income` de todos los períodos de una petición por negocio. Omitir
`business_type` combina los negocios y no añade una dimensión de negocio al resultado.

| Endpoint | ¿Entrega totales de ingresos por negocio? | `start_date` / `end_date` |
| --- | --- | --- |
| `/api/metrics/b2b` | No agregados: movimientos B2B; sumar `amount` con `operation_type=income`. | Sí, ambos opcionales. |
| `/api/metrics/b2c` | No agregados: movimientos B2C; sumar `amount` con `operation_type=income`. | Sí, ambos opcionales. |
| `/api/metrics/summary` | **Sí, por período**, con `business_type=B2B` o `B2C`; sumar `income` para el total del rango. | Sí, ambos opcionales. |
| `/api/metrics/comparison` | No: compara neto entre dos intervalos, no ingresos ni B2B frente a B2C. | Sí, ambos obligatorios. |

En los siguientes comandos, Node solo presenta un recorte y calcula `count` y
`derived_income_total`; **ninguno de esos dos campos es parte de la respuesta API**.
Los ejemplos JSON muestran únicamente elementos o campos reales de la API.

### 5. GET /api/metrics/b2b

#### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `start_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `end_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others`, o null | No | No declarado; localmente `None` | No aplica |
| `operation_type` | string enum `income`, `outcome`, o null | No | No declarado; localmente `None` | No aplica |

No declara `business_type`: el negocio queda fijado a B2B por la ruta.

#### Campos de respuesta

Respuesta `200`: array de `FinancialMovement`, sin agregado ni envoltorio.
Todos los campos del elemento son obligatorios y no anulables.

| Campo de cada elemento | Tipo |
| --- | --- |
| `create_date` | string, formato `date` |
| `amount` | number |
| `operation_type` | string enum `income`, `outcome` |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `business_type` | string enum `B2B`, `B2C` en el modelo compartido; B2B en esta ruta |

#### Ejemplo real recortado

101 movimientos recibidos. Total de ingresos calculado por el comando:
`615540.72`. Primeros dos elementos:

```json
[
  {"create_date":"2025-10-02","amount":10178.62,"operation_type":"income","category":"sales","business_type":"B2B"},
  {"create_date":"2025-10-03","amount":1437.17,"operation_type":"income","category":"sales","business_type":"B2B"}
]
```

#### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics~1b2b/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics~1b2b/get/responses/200/content/application~1json/schema`.
- Modelo: `#/components/schemas/FinancialMovement`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/b2b?operation_type=income&start_date=2025-10-02&end_date=2026-09-28' | node -e 'let raw="";process.stdin.on("data",chunk=>raw+=chunk);process.stdin.on("end",()=>{const rows=JSON.parse(raw);console.log(JSON.stringify({count:rows.length,derived_income_total:Math.round(rows.reduce((total,row)=>total+row.amount,0)*100)/100,first:rows.slice(0,2)},null,2));});'
```

### 6. GET /api/metrics/b2c

#### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `start_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `end_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others`, o null | No | No declarado; localmente `None` | No aplica |
| `operation_type` | string enum `income`, `outcome`, o null | No | No declarado; localmente `None` | No aplica |

No declara `business_type`: el negocio queda fijado a B2C por la ruta.

#### Campos de respuesta

Respuesta `200`: array de `FinancialMovement`, sin agregado ni envoltorio.
Todos los campos del elemento son obligatorios y no anulables.

| Campo de cada elemento | Tipo |
| --- | --- |
| `create_date` | string, formato `date` |
| `amount` | number |
| `operation_type` | string enum `income`, `outcome` |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `business_type` | string enum `B2B`, `B2C` en el modelo compartido; B2C en esta ruta |

#### Ejemplo real recortado

96 movimientos recibidos. Total de ingresos calculado por el comando:
`642606.15`. Primeros dos elementos:

```json
[
  {"create_date":"2025-10-05","amount":8147.81,"operation_type":"income","category":"sales","business_type":"B2C"},
  {"create_date":"2025-10-12","amount":5775.03,"operation_type":"income","category":"sales","business_type":"B2C"}
]
```

#### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics~1b2c/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics~1b2c/get/responses/200/content/application~1json/schema`.
- Modelo: `#/components/schemas/FinancialMovement`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/b2c?operation_type=income&start_date=2025-10-02&end_date=2026-09-28' | node -e 'let raw="";process.stdin.on("data",chunk=>raw+=chunk);process.stdin.on("end",()=>{const rows=JSON.parse(raw);console.log(JSON.stringify({count:rows.length,derived_income_total:Math.round(rows.reduce((total,row)=>total+row.amount,0)*100)/100,first:rows.slice(0,2)},null,2));});'
```

### 7. GET /api/metrics/summary

#### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `group_by` | string enum `day`, `week`, `month` | No | `month` | No aplica |
| `start_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `end_date` | string `date` o null | No | No declarado; localmente `None` | No declarados |
| `category` | string enum `suppliers`, `sales`, `operational`, `administrative`, `others`, o null | No | No declarado; localmente `None` | No aplica |
| `operation_type` | string enum `income`, `outcome`, o null | No | No declarado; localmente `None` | No aplica |
| `business_type` | string enum `B2B`, `B2C`, o null | No | No declarado; localmente `None` | No aplica |

#### Campos de respuesta

Respuesta `200`: array de `MetricsSummaryItem`. Todos los campos son obligatorios
y no anulables. No devuelve el negocio ni un total general adicional.

| Campo de cada elemento | Tipo |
| --- | --- |
| `period` | string; sin formato declarado, `YYYY-MM` observado con `group_by=month` |
| `income` | number; ingreso agregado del período para los filtros enviados |
| `outcome` | number; egreso agregado del período para los filtros enviados |
| `net` | number; ingreso menos egreso del período según el código local |

#### Ejemplo real recortado

12 períodos B2B recibidos. Suma de sus `income`, calculada por el comando:
`615540.72`. Primeros dos períodos:

```json
[
  {"period":"2025-10","income":39038.91,"outcome":0,"net":39038.91},
  {"period":"2025-11","income":54757.96,"outcome":0,"net":54757.96}
]
```

Se pidió `operation_type=income`: por eso `outcome` es cero. Para obtener egresos
y neto completos a la vez, se debe omitir ese filtro. Para el gráfico del PM,
pedir un resumen por negocio con las mismas fechas y sumar todos sus `income`;
no usar `net` como ingreso. La variante `business_type=B2C` de este endpoint no
se llamó: aceptada por OpenAPI, pero ❓ sin evidencia HTTP específica en esta revisión.

#### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics~1summary/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics~1summary/get/responses/200/content/application~1json/schema`.
- Modelo: `#/components/schemas/MetricsSummaryItem`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/summary?group_by=month&operation_type=income&business_type=B2B&start_date=2025-10-02&end_date=2026-09-28' | node -e 'let raw="";process.stdin.on("data",chunk=>raw+=chunk);process.stdin.on("end",()=>{const rows=JSON.parse(raw);console.log(JSON.stringify({count:rows.length,derived_income_total:Math.round(rows.reduce((total,row)=>total+row.income,0)*100)/100,first:rows.slice(0,2)},null,2));});'
```

### 8. GET /api/metrics/comparison

#### Parámetros

| Nombre | Tipo | Obligatorio | Valor por defecto | Mínimo / máximo |
| --- | --- | --- | --- | --- |
| `start_date` | string, formato `date` | **Sí** | Ninguno | No declarados |
| `end_date` | string, formato `date` | **Sí** | Ninguno | No declarados |
| `business_type` | string enum `B2B`, `B2C`, o null | No | No declarado; localmente `None` | No aplica |

No admite `operation_type` ni selecciona una comparación B2B frente a B2C.

#### Campos de respuesta

Respuesta `200`: objeto `MetricsComparison`, todos sus campos obligatorios;
solo `delta_pct` admite null.

| Campo | Tipo |
| --- | --- |
| `current_period` | number |
| `previous_period` | number |
| `delta_abs` | number |
| `delta_pct` | number o null |

Según `get_metrics_comparison` y `calculate_net_value` del código local, los dos
primeros campos son **netos monetarios**, no fechas ni ingresos. El intervalo
previo tiene la misma duración inclusiva y termina el día anterior a `start_date`.
`delta_abs` es neto actual menos previo; `delta_pct` es
`100 * delta_abs / abs(previous_period)`, o null si el neto previo es cero.
La fórmula no está descrita en OpenAPI. Base cero y otros intervalos:
❓ sin evidencia HTTP específica; se distingue el código local del caso observado.

#### Ejemplo real

Respuesta completa para agosto de 2026, B2B:

```json
{
  "current_period": -4968.02,
  "previous_period": 40402.53,
  "delta_abs": -45370.55,
  "delta_pct": -112.3
}
```

#### Fuente

- Operación y parámetros: `#/paths/~1api~1metrics~1comparison/get`, propiedad `parameters`.
- Respuesta: `#/paths/~1api~1metrics~1comparison/get/responses/200/content/application~1json/schema`.
- Modelo: `#/components/schemas/MetricsComparison`.
- Comando ejecutado:

```sh
curl --fail-with-body --silent --show-error --max-time 20 'http://localhost:8000/api/metrics/comparison?start_date=2026-08-01&end_date=2026-08-31&business_type=B2B'
```

## Errores declarados

`/api/metrics`, `/api/metrics/alerts` y `/api/metrics/categories/top` declaran
respuesta `422` con `HTTPValidationError`, al igual que los cuatro endpoints
adicionales revisados; `/api/metrics/facets` no la declara.

| Campo | Tipo / obligatoriedad |
| --- | --- |
| `detail` | array de `ValidationError`, opcional |
| `detail[].loc` | array de string o integer, obligatorio |
| `detail[].msg` | string, obligatorio |
| `detail[].type` | string, obligatorio |
| `detail[].input` | sin restricción de tipo en el esquema, opcional |
| `detail[].ctx` | object, opcional |

Fuentes: `responses/422` de cada operación y
`#/components/schemas/HTTPValidationError`, `#/components/schemas/ValidationError`.
No se hicieron peticiones inválidas: ejemplo real de error y comportamiento
de otros códigos HTTP, ❓ sin evidencia. No se inventan respuestas de error.

## Fetch actual del frontend

Fuente: [App.tsx](../src/App.tsx#L17).

- `API_BASE_URL` usa `import.meta.env.VITE_API_BASE_URL ?? ""`.
- `fetchFinancialData()` llama a `fetch` con la URL `${API_BASE_URL}/api/metrics`, sin query params ni opciones explícitas.
- Comprueba `response.ok`; si falla lanza un error con el estado HTTP, sin leer el cuerpo de error.
- Devuelve `response.json()` como `Promise<FinancialMovement[]>`, sin validación runtime del JSON.
- Un `useEffect` con dependencias `[]` inicia la carga al montar; no reacciona a fechas ni a umbrales y no tiene cancelación explícita.
- Deriva KPI y datos mensuales con `computeKPIs` y `computeMonthlyData`. El encabezado usa `formatMonthlyPeriod(monthlyData)`.
- Solo guarda KPI, serie mensual, carga y error; no conserva los movimientos como estado para nuevos cálculos por grupo.
- El `catch` descarta el detalle técnico y muestra un mensaje genérico; `finally` desactiva la carga.
- No consulta facetas, alertas ni rankings. Todo esto es lectura de código, no una verificación de interfaz en navegador.

## Diferencias PM vs API

Las resoluciones siguientes son decisiones propuestas para la futura spec, no
funcionalidades implementadas ni acuerdos del PM ya confirmados.

### Qué cambió en la ampliación

- **CAMBIO 1:** se corrige cualquier lectura general de «ningún endpoint ofrece ingresos agregados por negocio»: `summary` sí los ofrece por período y admite fechas y `business_type`. Sigue siendo cierto que top + facetas solos no entregan ambos totales completos.
- **CAMBIO 2:** para el gráfico y los denominadores se añade la opción de sumar `income` de `summary` por negocio; reutilizar movimientos sigue siendo válido, pero no es obligatorio. B2B/B2C son alternativas de movimientos, no agregados; `comparison` queda descartado porque compara netos entre intervalos.
- **CAMBIO 3:** se registra la verificación del usuario del top B2B en navegador; ya no se considera esa variante sin evidencia.
- **CAMBIO 4:** `summary` también permite obtener una serie completa de períodos para calcular una ventana de tres períodos en frontend. No corrige la fórmula de `/alerts` ni rellena períodos vacíos; esa incompatibilidad continúa.

| Lo que dice el PM | Lo que dice la API / evidencia | Cómo resolverlo en la spec |
| --- | --- | --- |
| Dos fechas opcionales `YYYY-MM-DD` filtran todo el dashboard. | Coinciden con `start_date` y `end_date`, pero cada endpoint de datos recibe sus propios filtros; el fetch actual no envía ninguno. | Definir un rango compartido y propagar las mismas fechas a movimientos, alertas y ambos tops. Omitir extremos vacíos y validar inicio no posterior a fin antes de solicitar. Recalcular KPI y gráficos con los movimientos filtrados. |
| Mostrar el rango disponible junto a los inputs. | Facetas ofrece `min_date` y `max_date` globales y no recibe fechas; no representa el rango seleccionado. | Mostrar ambos valores como disponibilidad global, independiente de la selección. Usarlos como límites de los inputs por decisión de UX, no como una restricción declarada de la API. No usar el período mensual del encabezado como sustituto de las fechas exactas. |
| Media móvil de los tres períodos anteriores. | OpenAPI no define la fórmula; el código local usa todo el historial previo filtrado y la respuesta ya alerta en el tercer mes disponible. `/alerts` devuelve solo alertas, no todos los períodos; **CAMBIO 4:** `/summary` sí entrega una serie agregada. | **Incompatibilidad bloqueante para usar directamente `/alerts` como tabla PM.** Pedir decisión del PM: aceptar y renombrar la media histórica, o conservar los tres períodos y calcular las alertas en frontend desde movimientos o, **añadido**, desde `/summary?group_by=month` sin filtrar a ingresos, usando `outcome`. No corregir solo la celda: también cambia qué filas son alertas. Conservar simultáneamente la fórmula PM y el uso exclusivo de `/alerts` no es posible con este contrato. No cambiar backend en esta tarea. |
| «Períodos» sin granularidad explícita. | Alertas permite día, semana o mes y usa mes por defecto. | Proponer `group_by=month` explícito. Definir antes de implementar si la ventana requiere tres meses calendario, cómo tratar meses vacíos y si los meses parciales cuentan. Decisión PM: ❓ sin evidencia. |
| Las alertas respetan el rango de fechas. | El código filtra antes de calcular: la base se reinicia al inicio del rango, sin consultar meses previos externos. | Acordar si solo se muestran filas del rango o si también la ventana debe quedar dentro. Para ventana de tres meses, proponer no alertar hasta tener tres períodos anteriores válidos dentro del rango; si se necesita historia externa, habrá que especificar su obtención. Expectativa exacta del PM: ❓ sin evidencia. |
| Umbral configurable de `0.01` a `1.0`, por defecto `0.3`. | API: mínimo `0`, sin máximo; el valor por defecto sí es `0.3`. Compara estrictamente `>` en el código local. | Restringir el control frontend a `[0.01, 1.0]` y enviar un ratio. Especificar que `0.3` equivale a `30%` y que el incremento debe superar el umbral; confirmar con PM si esperaba incluir igualdad. No confundir el máximo del control con un máximo del incremento observado. |
| Columna de incremento porcentual. | Devuelve `increase_ratio`, por ejemplo `1.0201`. | Presentar `increase_ratio * 100` con formato porcentual, por ejemplo `102.01%`; no volver a multiplicar el umbral al enviarlo. |
| Por cada línea de negocio, top 5 de ingresos. | Sin `business_type`, el top mezcla grupos; además su operación por defecto es `outcome`. Facetas solo enumera grupos. **CAMBIO 3:** el usuario verificó B2B en navegador: `sales 557903.97`, `others 57636.75`. | Especificar una petición top para `business_type=B2B` y otra para `business_type=B2C`, ambas con `operation_type=income`, `limit=5` y el mismo rango. Asociar cada respuesta con el grupo solicitado, ya que no lo devuelve. B2B tiene evidencia del usuario sin fechas explícitas; B2C y tops con fechas siguen sin prueba HTTP en esta exploración. |
| Cinco categorías por grupo. | `limit` es un máximo, no un número garantizado. El ejemplo global tiene solo `sales` y `others`; el generador local solo produce esas categorías de ingreso. | Mostrar hasta cinco categorías reales y un estado vacío cuando corresponda, sin inventar categorías ni duplicar filas para llegar a cinco. |
| Nombre, total y porcentaje del grupo en cada categoría. | El top solo contiene `category`, `operation_type` y `total_amount`; no hay nombre traducido, porcentaje ni denominador. **CAMBIO 2:** se puede obtener el denominador sumando `income` del resumen del negocio en el rango. | Mapear identificadores a etiquetas de producto; traducciones definitivas: ❓ sin evidencia. Calcular `100 * total_amount / totalIncomeDelGrupo` con ingresos completos del mismo negocio y rango, obtenidos de `summary` o movimientos, no con la suma del top truncado. Si el total es cero, mostrar porcentaje no aplicable. |
| Gráfico del total de ingresos B2B vs B2C usando top y facetas. | **CAMBIO 1:** top y facetas no ofrecen ambos totales completos, pero `/summary` sí agrega `income` por período y filtra negocio y fechas. `/b2b` y `/b2c` devuelven movimientos; `/comparison` devuelve netos comparados en el tiempo, no ingresos. | **CAMBIO 2:** opción de API agregada: una petición `/summary` por negocio con `operation_type=income` y las mismas fechas, sumando sus `income`. Alternativa válida: reutilizar `/api/metrics` y sumar ingresos por negocio, o sumar movimientos de `/b2b` y `/b2c`. Ninguna exige modificar backend. Solo top + facetas siguen siendo insuficientes en general. |
| Tabla de alertas, sin detalle de estados o unidades monetarias. | Puede devolver un array vacío; los importes son `number` sin moneda declarada. El fetch actual solo tiene carga/error globales y descarta el detalle técnico. | Especificar carga, error y vacío por recurso para no mostrar datos obsoletos como si fueran del nuevo rango. Conservar diagnóstico técnico y mensaje legible. Moneda y formato monetario acordados con el PM: ❓ sin evidencia; no deducirlos del esquema. |

En la primera fase no se probaron filtros por HTTP. En la ampliación sí se enviaron
fechas en los cuatro endpoints nuevos, `operation_type=income` en B2B/B2C y
summary, y `business_type=B2B` en summary y comparison. Esos casos tienen evidencia
de ejecución, pero el rango completo en B2B/B2C/summary no demuestra por sí solo
la exclusión en los bordes. Se mantiene una sola llamada curl por endpoint.
Límites inválidos, fechas invertidas, estados vacíos y variantes no llamadas:
❓ sin evidencia HTTP. La evidencia de navegador del usuario es independiente.