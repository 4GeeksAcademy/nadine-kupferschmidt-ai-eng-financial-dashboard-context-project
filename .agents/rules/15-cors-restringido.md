---
title: "CORS restringido"
description: "Orígenes y capacidades CORS limitados a lo que requiere el frontend."
globs:
  - "backend/app/main.py"
---

## Regla 15: Limitar CORS

- **Objetivo:** Restringir CORS a los orígenes y capacidades que el frontend necesite realmente.
- **Justificación:** Hallazgo 15 — `backend/app/main.py:9-12`.
- **Ejemplo incorrecto:** Configuración actual en `backend/app/main.py:9-12`:
  ```python
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
  ```
- **Ejemplo correcto:**
  ```python
  allow_origins=["https://dashboard.example"],
  allow_credentials=True,
  allow_methods=["GET"],
  allow_headers=["Content-Type"],
  ```
