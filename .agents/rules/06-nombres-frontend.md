---
title: "Nombres frontend"
description: "Convenciones de nombres para componentes, archivos y utilidades TypeScript del frontend."
globs:
  - "frontend/src/components/**/*.tsx"
  - "frontend/src/lib/**/*.ts"
---

## Regla 6: Seguir el estilo de nombres frontend

- **Objetivo:** Usar PascalCase en componentes, kebab-case en archivos de dashboard y camelCase en utilidades TypeScript.
- **Justificación:** Hallazgo 6 — `frontend/src/components/dashboard/income-outcome-chart.tsx:49`, `frontend/src/lib/financial-utils.ts:21`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** nombrar el archivo y la exportación fuera de las convenciones:
  ```tsx
  // IncomeOutcomeChart.tsx
  export function income_outcome_chart() {}
  ```
- **Ejemplo correcto:**
  ```tsx
  // Archivo: kpi-row.tsx
  export function KPIRow({ metrics, loading }: KPIRowProps) {
    return <div />;
  }
  ```
