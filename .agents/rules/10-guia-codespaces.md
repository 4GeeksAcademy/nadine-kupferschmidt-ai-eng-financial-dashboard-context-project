---
title: "Guía de Codespaces"
description: "Coherencia de la documentación con la configuración de API requerida en Codespaces."
globs:
  - "README.md"
  - "README.es.md"
  - "frontend/.env.example"
  - "verification.md"
---

## Regla 10: Alinear la guía de Codespaces con el entorno

- **Objetivo:** Mantener la guía de Codespaces alineada con la configuración que realmente requiere el entorno.
- **Justificación:** Hallazgo 10 — `README.es.md:45`, `verification.md:16`, `verification.md:38`.
- **Ejemplo incorrecto:** Afirmación actual de `README.es.md:45`:
  ```text
  El frontend usa por defecto el proxy de Vite para `/api`, así que no necesitas variables de entorno extra ni en desarrollo local ni en Codespaces.
  ```
- **Ejemplo correcto:**
  ```text
  En Codespaces, define VITE_API_BASE_URL con la URL pública
  del puerto 8000 y marca ese puerto como Public.
  ```
