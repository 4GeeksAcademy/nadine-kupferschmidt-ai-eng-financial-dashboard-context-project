---
title: "Verificar interfaz en navegador"
description: "Comprobación visual manual al cambiar App o componentes porque no hay tests automáticos de interfaz."
globs:
  - "frontend/src/App.tsx"
  - "frontend/src/components/**/*.tsx"
---

## Regla 17: Verificar cambios de interfaz en el navegador

- **Objetivo:** Al cambiar `App.tsx` o componentes, verificar el resultado en el navegador, porque no hay pruebas automáticas de interfaz.
- **Justificación:** Hallazgo 17 — `frontend/src/lib/financial-utils.test.ts:1`, `frontend/package.json:14`, `frontend/src/App.tsx:49`; `docker compose exec frontend npm test` reportó 1 archivo y 5 tests.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** cambiar la interfaz y omitir la verificación del dashboard en navegador:
  ```ts
  it("verifica el formato", () => expect(formatCurrency(10)).toBe("$10"));
  ```
- **Ejemplo correcto:**
  ```text
  Cambiar App.tsx o un componente
  Ejecutar el dashboard
  Comprobar el resultado en el navegador
  ```
