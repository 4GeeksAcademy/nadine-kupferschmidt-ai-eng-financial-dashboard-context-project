---
title: "Generador aleatorio local"
description: "Aislamiento del estado aleatorio al generar datos financieros simulados."
globs:
  - "backend/app/routes.py"
---

## Regla 3: Aislar el generador aleatorio

- **Objetivo:** Usar un generador aleatorio local por función en vez de modificar el estado global de `random`.
- **Justificación:** Hallazgo 3 — `backend/app/routes.py:94`, `backend/app/routes.py:96`.
- **Ejemplo incorrecto:** Código actual en `backend/app/routes.py:96`:
  ```python
  random.seed(seed)
  ```
- **Ejemplo correcto:**
  ```python
  rng = random.Random(seed)
  income_probability = rng.uniform(0.45, 0.7)
  ```
