---
title: "Response models en endpoints"
description: "Contrato de respuesta tipado para endpoints FastAPI."
globs:
  - "backend/app/routes.py"
---

## Regla 2: Declarar modelos de respuesta

- **Objetivo:** Declarar modelos de respuesta y `response_model` en cada endpoint API.
- **Justificación:** Hallazgo 2 — `backend/app/routes.py:22`, `backend/app/routes.py:248`.
- **Ejemplo incorrecto:** Endpoint actual sin `response_model`, en `backend/app/routes.py:243-245`:
  ```python
  @router.get("/health")
  def health() -> dict[str, str]:
      return {"status": "ok"}
  ```
- **Ejemplo correcto:**
  ```python
  @router.get("/api/metrics", response_model=list[FinancialMovement])
  def get_metrics(...) -> list[FinancialMovement]:
      ...
  ```
