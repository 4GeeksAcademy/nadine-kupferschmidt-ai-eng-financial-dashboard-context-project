---
title: "Pruebas API"
description: "Pruebas backend de contratos HTTP con TestClient y aserciones relevantes."
globs:
  - "backend/tests/**/*.py"
---

## Regla 8: Probar contratos de API

- **Objetivo:** Escribir pruebas API con `TestClient` y comprobar estado, contrato y filtros relevantes.
- **Justificación:** Hallazgo 8 — `backend/tests/test_routes.py:3`, `backend/tests/test_routes.py:25`, `backend/tests/test_routes.py:42`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** comprobar solo el estado HTTP y no el contrato devuelto:
  ```python
  assert client.get("/api/metrics").status_code == 200
  ```
- **Ejemplo correcto:**
  ```python
  def test_health_endpoint_returns_ok():
      response = client.get("/health")
      assert response.status_code == 200
      assert response.json() == {"status": "ok"}
  ```
