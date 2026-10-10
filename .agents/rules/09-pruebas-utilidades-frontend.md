---
title: "Pruebas de utilidades frontend"
description: "Cobertura de casos nominales y bordes en las utilidades TypeScript del frontend."
globs:
  - "frontend/src/**/*.test.ts"
---

## Regla 9: Cubrir casos nominales y bordes en utilidades frontend

- **Objetivo:** Cubrir funciones frontend con casos nominales y bordes representativos.
- **Justificación:** Hallazgo 9 — `frontend/src/lib/financial-utils.test.ts:35`, `frontend/src/lib/financial-utils.test.ts:47`, `frontend/src/lib/financial-utils.test.ts:63`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** probar solo un caso nominal y omitir el caso sin ingresos:
  ```ts
  it("computes income", () => {
    expect(computeKPIs(sampleMovements).totalIncome).toBe(1500);
  });
  ```
- **Ejemplo correcto:**
  ```ts
  it("returns 0 profitPercent when there is no income", () => {
    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
  ```
