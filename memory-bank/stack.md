# Stack

- El README declara un frontend React + TypeScript y un backend FastAPI. Fuente: `README.es.md:18`.
- Versiones declaradas del frontend: React y React DOM `^19.2.4`, TypeScript `~6.0.2`, Vite `^8.0.4`, Tailwind CSS `^4.2.2`, Recharts `^3.8.1`, Lucide React `^1.8.0` y Vitest `^4.1.4`. Fuente: `frontend/package.json:18-21`, `frontend/package.json:38-42`.
- La imagen del frontend usa Node `24-alpine`; la imagen backend usa Python `3.13-slim`. Fuente: `frontend/Dockerfile:1`, `backend/Dockerfile:1`.
- Las dependencias backend declaradas son FastAPI, Uvicorn, debugpy, pytest, pytest-cov y httpx; `requirements.txt` no fija versiones. Fuente: `backend/requirements.txt:1-6`.
- Docker Compose declara los servicios `frontend` y `backend`, publica los puertos `5173`, `8000` y `5678`, y monta los directorios fuente. Fuente: `docker-compose.yml:1-22`.
- El comando de inicio backend incluye Uvicorn con `--reload` y debugpy escuchando en `0.0.0.0:5678`. Fuente: `backend/Dockerfile:12`.
