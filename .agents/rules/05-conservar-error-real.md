---
title: "Conservar el error real"
description: "Detalle técnico de errores en la carga de datos financieros del frontend."
globs:
  - "frontend/src/App.tsx"
---

## Regla 5: Conservar el error real para diagnóstico

- **Objetivo:** Conservar el detalle técnico del error para diagnóstico aunque la interfaz muestre un mensaje seguro y legible.
- **Justificación:** Hallazgo 5 — `frontend/src/App.tsx:35-36`.
- **Ejemplo incorrecto:** Código actual en `frontend/src/App.tsx:35`:
  ```tsx
  .catch(() => {
    setError("No se pudo cargar la informacion financiera. Revisa la API de backend.");
  })
  ```
- **Ejemplo correcto:**
  ```tsx
  .catch((error: unknown) => {
    console.error("Error al cargar métricas", error);
    setError("No se pudo cargar la información financiera.");
  })
  ```
