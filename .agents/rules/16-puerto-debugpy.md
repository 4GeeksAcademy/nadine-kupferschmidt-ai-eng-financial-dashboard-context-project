---
title: "Puerto de debugpy"
description: "Restricción del acceso al puerto de depuración fuera del entorno local."
globs:
  - "backend/Dockerfile"
  - "docker-compose.yml"
---

## Regla 16: Limitar la exposición de debugpy

- **Objetivo:** Restringir `debugpy` al entorno local de desarrollo y evitar publicar su puerto en entornos accesibles externamente.
- **Justificación:** Hallazgo 16 — `backend/Dockerfile:12`, `docker-compose.yml:20`.
- **Ejemplo incorrecto:** Publicación actual en `docker-compose.yml:20`:
  ```yaml
  - "5678:5678"
  ```
- **Ejemplo correcto:**
  ```yaml
  ports:
    - "127.0.0.1:5678:5678"
  ```
