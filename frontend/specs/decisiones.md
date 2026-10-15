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
- **Decisión:** Mantener el valor por defecto `0.3`. Si el umbral está fuera de `[0.01, 1.0]`, mostrar un error junto al input y no pedir datos nuevos hasta que sea válido.
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