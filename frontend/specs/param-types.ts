import type { BusinessType } from "./api-types";

/**
 * Fechas compartidas por GET /api/metrics/alerts, /api/metrics/categories/top y /api/metrics/summary.
 * OpenAPI: #/paths/~1api~1metrics~1alerts/get/parameters, entradas start_date y end_date;
 * mismo schema anyOf string(format: date) o null en los otros dos endpoints.
 * La UI omite valores ausentes en vez de enviar null. Solo aplica ambas fechas
 * completas y ordenadas; con una sola muestra todos los datos y el mensaje
 * "Completa ambas fechas para aplicar el filtro"; con inicio posterior a fin,
 * muestra error y no aplica el filtro. Sin fechas, no se filtra.
 * El formato y las reglas cruzadas requieren validación en ejecución.
 */
export interface DateRangeFilter {
  /** Inicio inclusivo opcional, string YYYY-MM-DD; API sin límites, UI entre min_date y max_date globales y no posterior a end_date. */
  start_date?: string;
  /** Fin inclusivo opcional, string YYYY-MM-DD; API sin límites, UI entre min_date y max_date globales y no anterior a start_date. */
  end_date?: string;
}

/**
 * Parámetros explícitos de la UI para GET /api/metrics/alerts.
 * OpenAPI: #/paths/~1api~1metrics~1alerts/get/parameters, schema de cada entrada.
 * La API permite omitir threshold y group_by; esta interfaz exige ambos.
 * No se recalculan alertas: se usa la media de todos los períodos anteriores.
 */
export interface AlertsParams extends DateRangeFilter {
  /** Ratio: API mínimo inclusivo 0, sin máximo, defecto 0.3; UI [0.01, 1.0], defecto 0.3. Fuera del rango, error junto al input y ninguna nueva petición hasta corregirlo; sin ajuste automático. Validar en ejecución. */
  threshold: number;
  /** Agrupación: API "day" | "week" | "month", defecto "month"; UI solo "month". */
  group_by: "month";
}

/**
 * Parámetros explícitos de la UI para GET /api/metrics/categories/top.
 * OpenAPI: #/paths/~1api~1metrics~1categories~1top/get/parameters, schema de cada entrada.
 * La API permite omitir estos parámetros; la UI los envía para un top por negocio.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operación: API "income" | "outcome", defecto "outcome"; UI restringida al literal "income" para impedir solicitar gastos por error. */
  operation_type: "income";
  /** Máximo de categorías: API entero [1, 20], defecto 5; UI solicita 5, sin garantizar cinco filas. Validar entero y límites en ejecución. */
  limit: number;
  /** Negocio de la petición: "B2B" o "B2C"; API opcional/anulable y sin defecto declarado, UI obligatorio para separar grupos. */
  business_type: BusinessType;
}

/**
 * Parámetros de la decisión 4 para GET /api/metrics/summary: una petición por negocio.
 * OpenAPI: #/paths/~1api~1metrics~1summary/get/parameters, schema de cada entrada.
 * La API permite omitir operation_type y business_type; la UI exige ambos,
 * no filtra category y suma income de todos los períodos del mismo rango.
 */
export interface SummaryParams extends DateRangeFilter {
  /** Operación: API "income" | "outcome" o null, opcional sin defecto declarado; UI exclusivamente "income" para el total de ingresos. */
  operation_type: "income";
  /** Negocio: API "B2B" | "B2C" o null, opcional sin defecto declarado; UI exige uno por petición. */
  business_type: BusinessType;
}