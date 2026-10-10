---
title: "Versiones de dependencias"
description: "Versionado reproducible y revisión de avisos de compatibilidad en dependencias backend."
globs:
  - "backend/requirements.txt"
---

## Regla 12: Fijar versiones y revisar warnings

- **Objetivo:** Fijar versiones de dependencias backend y revisar warnings de compatibilidad durante las pruebas.
- **Justificación:** Hallazgo 12 — `backend/requirements.txt:1`, `verification.md:14`.
- **Ejemplo incorrecto:** Dependencias actuales sin versiones en `backend/requirements.txt:1-6`:
  ```text
  fastapi
  httpx
  ```
- **Ejemplo correcto:**
  ```text
  fastapi==<versión-validada>
  httpx==<versión-validada>
  ```
