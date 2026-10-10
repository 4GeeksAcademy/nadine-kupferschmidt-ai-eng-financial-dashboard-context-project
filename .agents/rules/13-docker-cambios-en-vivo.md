---
title: "Docker y cambios en vivo"
description: "Uso de volúmenes Compose y reconstrucción de imágenes al cambiar dependencias."
globs:
  - "docker-compose.yml"
  - "frontend/Dockerfile"
  - "backend/Dockerfile"
  - "frontend/package.json"
  - "backend/requirements.txt"
---

## Regla 13: Usar cambios en vivo y reconstruir solo si cambian dependencias

- **Objetivo:** Con Docker corriendo, los cambios en frontend/ y backend/ se ven en vivo por los volúmenes; reconstruir con `docker compose up --build` solo si cambian package.json o requirements.txt.
- **Justificación:** Hallazgo 13 — `docker-compose.yml:8-10`, `docker-compose.yml:21-22`; instalaciones de dependencias en `frontend/Dockerfile:5-6` y `backend/Dockerfile:5-6`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** reconstruir la imagen ante cualquier cambio de fuente:
  ```sh
  docker compose down
  docker compose up --build
  ```
- **Ejemplo correcto:**
  ```yaml
  frontend:
    volumes: ["./frontend:/app"]
  backend:
    volumes: ["./backend:/app"]
  ```
