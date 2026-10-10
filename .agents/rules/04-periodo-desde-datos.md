---
title: "Periodo desde los datos"
description: "Periodo mostrado en el dashboard derivado del rango de movimientos financieros."
globs:
  - "frontend/src/App.tsx"
  - "frontend/src/lib/financial-utils.ts"
  - "frontend/src/components/dashboard/dashboard-header.tsx"
---

## Regla 4: Derivar el periodo de los datos

- **Objetivo:** Derivar el periodo mostrado del periodo real de los datos, no de un literal anual fijo.
- **Justificación:** Hallazgo 4 — `frontend/src/App.tsx:49`, `backend/app/routes.py:97`, `backend/app/routes.py:99`.
- **Ejemplo incorrecto:** Código actual en `frontend/src/App.tsx:49`:
  ```tsx
  <DashboardHeader period="2024 - Full Year" />
  ```
- **Ejemplo correcto:**
  ```tsx
  <DashboardHeader period={formatMonthlyPeriod(monthlyData)} />
  ```
