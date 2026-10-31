# Decisiones de frontend

Decisiones tomadas el 2026-10-15 para resolver las diferencias PM vs API.
Este documento registra acuerdos; no implementa funcionalidades.

## 1. Alertas

- **Problema:** La API calcula la media de todos los períodos anteriores, no una ventana de tres.
- **Decisión:** Usar `GET /api/metrics/alerts` tal cual, sin recalcular alertas. La columna se llama **«Media de períodos anteriores»** y muestra `baseline_average`.
- **Evidencia:** [exploracion-api.md](exploracion-api.md), sección «3. GET /api/metrics/alerts», cálculo de la media histórica.
- **Alternativa descartada y por qué:** Calcular tres períodos en frontend con `/summary`; se acepta la semántica de `/alerts` y se evita duplicar su lógica con otra definición de alerta.

## 2. Fechas completas y ordenadas

- **Problema:** La API admite extremos abiertos y no valida que inicio sea anterior o igual a fin.
- **Decisión:** Aplicar el filtro solo con ambas fechas completas y `start_date <= end_date`. Con una sola fecha completa, mostrar todos los datos sin filtro y el mensaje **«Completa ambas fechas para aplicar el filtro»**. Si inicio es posterior a fin, mostrar un mensaje de error y no aplicar el filtro. Sin fechas, mostrar todos los datos.
- **Evidencia:** [exploracion-api.md](exploracion-api.md), sección «2. GET /api/metrics», parámetros y comportamiento de `filter_movements_by_date`.
- **Alternativa descartada y por qué:** Filtrar con un extremo abierto; no representa el rango completo exigido para aplicar el filtro.

## 3. Umbral inválido

- **Problema:** La API permite umbrales desde cero y no declara máximo, mientras el producto exige `[0.01, 1.0]`.
- **Decisión:** Mantener el valor por defecto `0.3`. Si el umbral está fuera de `[0.01, 1.0]`, mostrar un error junto al input y congelar solo la tabla de alertas, sin pedir nuevas alertas hasta que sea válido. Los KPI, gráficos y la vista B2B vs B2C siguen respondiendo a cambios de fechas válidos.
- **Evidencia:** [exploracion-api.md](exploracion-api.md), sección «3. GET /api/metrics/alerts», parámetros; y «Diferencias PM vs API», fila del umbral.
- **Alternativa descartada y por qué:** Ajustarlo al valor válido más cercano; modificaría silenciosamente el valor introducido por el usuario.

## 4. Total de ingresos por negocio

- **Problema:** El top de categorías no incluye el total completo del grupo necesario para el gráfico y los porcentajes.
- **Decisión:** Hacer una petición `GET /api/metrics/summary` por negocio, con `business_type=B2B` o `B2C`, `operation_type=income` y el mismo rango de fechas aplicado al dashboard y al top. Sumar `income` de todos los períodos de cada respuesta. Ese total alimenta el gráfico y es el denominador de `100 * total_amount / totalDelGrupo` para cada categoría.
- **Evidencia:** [exploracion-api.md](exploracion-api.md), sección «Endpoints adicionales revisados», apartado «7. GET /api/metrics/summary»; el ejemplo B2B suma `615540.72`.
- **Alternativa descartada y por qué:** Sumar movimientos de `/api/metrics`; se elige el resumen que ya proporciona los ingresos agregados por período y negocio.

## 5. Rango disponible

- **Problema:** El rango disponible global no equivale al rango seleccionado por el usuario.
- **Decisión:** Obtener `min_date` y `max_date` de `GET /api/metrics/facets`, mostrarlos como referencia global y usarlos como mínimo y máximo de ambos inputs de fecha.
- **Evidencia:** [exploracion-api.md](exploracion-api.md), sección «1. GET /api/metrics/facets», campos y alcance global sin filtros.
- **Alternativa descartada y por qué:** Mostrar el rango solo como referencia sin limitar los inputs, o sustituirlo por el rango seleccionado; no cumpliría su función acordada como límites globales de selección.

## 6. Navegación entre vistas

- **Problema:** El PM pide una nueva página, pero el proyecto no tiene una librería de rutas declarada.
- **Decisión:** Cambiar de vista con estado local de React, sin librerías nuevas. Dentro de `BusinessComparisonView`, incluir el botón **«← Volver al dashboard»** para regresar a la vista principal. No hay URL propia y la flecha Atrás del navegador no cambia de vista; queda por confirmar con el PM si estas limitaciones satisfacen su pedido de nueva página.
- **Evidencia:** [package.json](../package.json), dependencias sin router; [components.md](components.md), sección «F3. Vista B2B vs B2C», navegación y `BusinessComparisonView`.
- **Alternativa descartada y por qué:** Añadir una librería de rutas; el cambio de vista acordado se resuelve con React existente, sin dependencias nuevas.

## 7. Formato consistente con el dashboard

- **Problema:** Los formatos nuevos propuestos diferían de los que ya usa el dashboard para importes y porcentajes.
- **Decisión:** Reutilizar `formatCurrency` y `formatPercent` existentes: importes en USD sin decimales y porcentajes con un decimal. Multiplicar `increase_ratio` por 100 antes de `formatPercent`; los porcentajes de categoría ya calculados se pasan directamente. Mantener el mismo formato en toda la pantalla.
- **Evidencia:** Uso actual de `formatCurrency` en [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx#L16) y de `formatPercent` en [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx#L40); configuración USD en [financial-utils.ts](../src/lib/financial-utils.ts#L80) y porcentaje en [financial-utils.ts](../src/lib/financial-utils.ts#L86).
- **Alternativa descartada y por qué:** Crear formatos nuevos con otro locale y distinta precisión; produciría diferencias dentro de la misma pantalla y duplicaría utilidades que ya existen.

## 8. Aplicación automática del rango

- **Problema:** No se había especificado cuándo se aplica el borrador de fechas.
- **Decisión:** Aplicar automáticamente el filtro en cuanto ambas fechas sean válidas, completas, estén dentro de los límites globales y en orden. Con una sola fecha o con fechas inválidas, mostrar todos los datos y el mensaje correspondiente; no conservar un filtro anterior.
- **Evidencia:** [components.md](components.md), sección «F1. Filtro de fechas», `DateRangeControls`.
- **Alternativa descartada y por qué:** Añadir una acción explícita para aplicar el rango; no es necesaria con aplicación automática.

## 9. Mensajes de validación de fechas

- **Problema:** La validación no especificaba el texto para una fecha de calendario inválida ni para una fecha fuera de los límites globales.
- **Decisión:** Para una fecha no válida, mostrar **«La fecha no es válida.»**; para una fecha fuera de los límites, mostrar **«La fecha debe estar entre {min_date} y {max_date}.»**. Mantener el mensaje ya definido para el rango invertido.
- **Evidencia:** [components.md](components.md), sección «F1. Filtro de fechas», `DateRangeControls`.
- **Alternativa descartada y por qué:** Usar un mensaje genérico para todos los errores; no distinguiría entre formato/calendario y límites de selección.

## 10. Confirmación del umbral

- **Problema:** No se había definido el evento que confirma un umbral válido para consultar alertas.
- **Decisión:** Consultar alertas al salir del campo (blur) o al presionar Enter. No consultar con cada tecla; los valores inválidos siguen bloqueando nuevas consultas.
- **Evidencia:** [components.md](components.md), sección «F2. Alertas de egresos», `OutcomeAlertsSection`.
- **Alternativa descartada y por qué:** Consultar mientras se escribe; produciría consultas por valores intermedios que todavía no se han confirmado.

## 11. Completitud mensual indeterminable

- **Problema:** No se había definido cómo presentar la completitud cuando faltan las fechas necesarias para evaluarla.
- **Decisión:** Si no se puede determinar si el rango incluye meses incompletos, no mostrar ningún aviso de meses incompletos.
- **Evidencia:** [components.md](components.md), sección «F2. Alertas de egresos», «Meses incompletos».
- **Alternativa descartada y por qué:** Mostrar un aviso de estado indeterminado; se decide omitirlo cuando no hay evidencia suficiente.

## 12. Paneles independientes de facetas

- **Problema:** No se había definido si `business_types` de facetas controla qué paneles se muestran.
- **Decisión:** Mostrar siempre los paneles B2B y B2C. Usar `/api/metrics/facets` solo para las fechas, no para decidir la presencia de los paneles. Si un grupo no tiene datos, mostrar el mensaje de top vacío de ese grupo.
- **Evidencia:** [components.md](components.md), sección «F3. Vista B2B vs B2C», `BusinessComparisonView` y `BusinessCategoryPanel`.
- **Alternativa descartada y por qué:** Ocultar un panel según las facetas; los dos grupos forman parte fija de la comparación.

## 13. Errores simultáneos de fecha

- **Problema:** No se había definido qué mostrar cuando hay más de un error de fecha activo.
- **Decisión:** Mostrar simultáneamente todos los errores activos, en este orden fijo: «La fecha no es válida.»; «La fecha debe estar entre {min_date} y {max_date}.»; «Completa ambas fechas para aplicar el filtro»; «La fecha de inicio no puede ser posterior a la fecha de fin.». El error de rango invertido solo se evalúa si ambas fechas están completas y son válidas. Cada mensaje desaparece cuando se corrige su error; los demás permanecen visibles. `validateDateRange` devuelve `string[]`, vacío cuando no hay errores.
- **Alternativa descartada y por qué:** Mostrar un solo error a la vez obligaría al usuario a descubrirlos de a uno.