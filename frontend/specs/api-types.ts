/** Operaciones: enum de #/components/schemas/TopCategoryItem/properties/operation_type. */
export type OperationType = "income" | "outcome";

/** Negocios: enum de #/components/schemas/MetricsFacets/properties/business_types/items. */
export type BusinessType = "B2B" | "B2C";

/** Categorías: enum de #/components/schemas/TopCategoryItem/properties/category. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/**
 * GET /api/metrics/facets, respuesta 200.
 * OpenAPI: #/components/schemas/MetricsFacets.
 */
export interface FacetsResponse {
  /** Operaciones disponibles globalmente: "income" o "outcome". */
  operation_types: OperationType[];
  /** Negocios disponibles globalmente: "B2B" o "B2C". */
  business_types: BusinessType[];
  /** Categorías globales: "suppliers", "sales", "operational", "administrative" u "others". */
  categories: Category[];
  /** Fecha global más antigua, string date YYYY-MM-DD; mínimo de ambos inputs en la UI. */
  min_date: string;
  /** Fecha global más reciente, string date YYYY-MM-DD; máximo de ambos inputs en la UI. */
  max_date: string;
}

/**
 * GET /api/metrics/alerts, elemento de la respuesta 200.
 * OpenAPI: #/components/schemas/MetricsAlert.
 */
export interface AlertEntry {
  /** Período alertado: string sin formato exigido por OpenAPI; YYYY-MM con la agrupación mensual de la UI. */
  period: string;
  /** Egreso registrado del período, número monetario sin moneda ni límites declarados. */
  outcome_total: number;
  /** Media de todos los períodos anteriores del rango, no de tres; número monetario sin límites declarados. */
  baseline_average: number;
  /** Incremento relativo, número sin límites declarados; 0.3 equivale a 30%, puede superar 1. */
  increase_ratio: number;
}

/**
 * GET /api/metrics/alerts, respuesta 200: array, posiblemente vacío.
 * OpenAPI: #/paths/~1api~1metrics~1alerts/get/responses/200/content/application~1json/schema;
 * items: #/components/schemas/MetricsAlert.
 */
export type AlertsResponse = AlertEntry[];

/**
 * GET /api/metrics/categories/top, elemento de la respuesta 200.
 * OpenAPI: #/components/schemas/TopCategoryItem.
 */
export interface CategoryEntry {
  /** Identificador: "suppliers", "sales", "operational", "administrative" u "others"; no es un nombre traducido. */
  category: Category;
  /** Operación agregada: "income" o "outcome"; la vista de ingresos solicita "income". */
  operation_type: OperationType;
  /** Total de la categoría, número monetario sin límites ni moneda declarados; no incluye porcentaje. */
  total_amount: number;
}

/**
 * GET /api/metrics/categories/top, respuesta 200: array de hasta limit categorías existentes, posiblemente vacío.
 * OpenAPI: #/paths/~1api~1metrics~1categories~1top/get/responses/200/content/application~1json/schema;
 * items: #/components/schemas/TopCategoryItem.
 */
export type TopCategoriesResponse = CategoryEntry[];

/**
 * GET /api/metrics/summary, elemento de la respuesta 200.
 * OpenAPI: #/components/schemas/MetricsSummaryItem.
 */
export interface SummaryEntry {
  /** Período agregado: string sin formato exigido por OpenAPI; YYYY-MM si group_by es "month". */
  period: string;
  /** Ingreso del período para los filtros enviados, número monetario sin límites declarados; sumar para el total del grupo. */
  income: number;
  /** Egreso del período, número monetario sin límites declarados; cero al solicitar operation_type="income". */
  outcome: number;
  /** Ingreso menos egreso del período, número monetario sin límites declarados; no sustituye a income como total de ingresos. */
  net: number;
}

/**
 * GET /api/metrics/summary, respuesta 200: array de períodos, posiblemente vacío.
 * OpenAPI: #/paths/~1api~1metrics~1summary/get/responses/200/content/application~1json/schema;
 * items: #/components/schemas/MetricsSummaryItem.
 */
export type SummaryResponse = SummaryEntry[];