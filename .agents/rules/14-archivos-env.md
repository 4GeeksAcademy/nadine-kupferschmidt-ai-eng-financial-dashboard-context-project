---
title: "Archivos de entorno"
description: "Exclusión de archivos de entorno locales y conservación de la plantilla compartible."
globs:
  - ".gitignore"
  - "frontend/.env.example"
---

## Regla 14: Ignorar entornos locales y conservar la plantilla

- **Objetivo:** Ignorar archivos de entorno locales y mantener una plantilla `.env.example` sin valores secretos.
- **Justificación:** Hallazgo 14 — `.gitignore:11-13`.
- **Ejemplo incorrecto (hipotético, no existe en el repo):** ignorar la plantilla junto con los archivos de entorno locales:
  ```gitignore
  .env*
  ```
- **Ejemplo correcto:**
  ```gitignore
  .env
  .env.*
  !.env.example
  ```
