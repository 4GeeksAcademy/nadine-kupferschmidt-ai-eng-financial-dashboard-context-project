---
title: "App como compositor"
description: "Separación entre composición del dashboard, cálculo financiero y presentación."
globs:
  - "frontend/src/App.tsx"
  - "frontend/src/components/**/*.tsx"
  - "frontend/src/lib/**/*.ts"
---

## Regla 1: Separar composición, cálculo y presentación

- **Objetivo:** Cualquier cálculo o transformación de datos, aunque sea de una línea, debe estar en una función exportada desde `frontend/src/lib/`; `App.tsx` solo llama funciones y pasa props.
- **Justificación:** Hallazgo 1 — `frontend/src/App.tsx:1`, `frontend/src/lib/financial-utils.ts:21`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** concentrar cálculo y presentación en `App`:
  ```tsx
  const profit = income - outcome;
  return <main>{profit}<IncomeOutcomeChart data={data} /></main>;
  ```
- **Ejemplo correcto:**
  ```tsx
  setMetrics(computeKPIs(movements));
  setMonthlyData(computeMonthlyData(movements));
  <DashboardHeader period={formatMonthlyPeriod(monthlyData)} />
  ```
