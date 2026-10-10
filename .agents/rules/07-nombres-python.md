---
title: "Nombres Python"
description: "Convenciones PascalCase y snake_case para modelos y funciones del backend."
globs:
  - "backend/app/**/*.py"
---

## Regla 7: Seguir el estilo de nombres Python

- **Objetivo:** Usar PascalCase para modelos Python y snake_case para funciones Python.
- **Justificación:** Hallazgo 7 — `backend/app/routes.py:22`, `backend/app/routes.py:94`, `backend/app/routes.py:249`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** invertir las convenciones de nombres de clases y funciones:
  ```python
  class financial_movement:
      ...
  def GenerateMockMovements(): ...
  ```
- **Ejemplo correcto:**
  ```python
  class FinancialMovement(BaseModel):
      ...

  def generate_mock_movements(seed=None):
      ...
  ```
