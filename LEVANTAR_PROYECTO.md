# Cómo levantar el proyecto

## Servicios

| Servicio | Carpeta | Puerto publicado | Comando de inicio |
|---|---|---|---|
| `frontend` (Vite con React y TypeScript) | `frontend/` ([README.es.md](README.es.md), [package.json](frontend/package.json)) | `5173:5173` en Docker Compose ([docker-compose.yml](docker-compose.yml)); URL local documentada: `http://localhost:5173` ([README.es.md](README.es.md)) | `npm run dev -- --host 0.0.0.0 --port 5173` ([frontend/Dockerfile](frontend/Dockerfile)); el script `dev` ejecuta Vite ([frontend/package.json](frontend/package.json)) |
| `backend` (FastAPI servido con Uvicorn) | `backend/` ([README.es.md](README.es.md), [requirements.txt](backend/requirements.txt)) | `8000:8000` para la API y `5678:5678` para depuración ([docker-compose.yml](docker-compose.yml), [backend/Dockerfile](backend/Dockerfile)); URLs documentadas: `http://localhost:8000` y `http://localhost:8000/docs` ([README.es.md](README.es.md)) | `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` ([backend/Dockerfile](backend/Dockerfile)) |

Compose declara únicamente `frontend` y `backend`; no declara un servicio de base de datos ([docker-compose.yml](docker-compose.yml)). El frontend depende del backend, y el proxy Vite de `/api` reenvía a `http://backend:8000` ([docker-compose.yml](docker-compose.yml), [frontend/vite.config.ts](frontend/vite.config.ts)).

## Pasos para levantar todo

1. Desde la raíz del repositorio, ejecuta `docker compose up --build`. Este es el comando de arranque recomendado por el README ([README.es.md](README.es.md)).
2. Abre `http://localhost:5173` para el frontend ([README.es.md](README.es.md)).
3. Abre `http://localhost:8000/docs` para consultar la documentación interactiva de la API ([README.es.md](README.es.md)).

## Lo que no está documentado

- ❓ **Arranque individual fuera de Compose:** los archivos muestran los comandos de cada Dockerfile, pero no documentan un procedimiento completo para iniciar ambos servicios por separado en el host.
- ❓ **Configuración alternativa del backend:** el README menciona `frontend/.env.example` y `VITE_API_BASE_URL`, pero no he podido verificar el contenido del archivo de ejemplo porque el editor lo marca como ignorado.

Los scripts del frontend también incluyen `build`, `lint`, `test`, `test:watch` y `test:coverage` ([frontend/package.json](frontend/package.json)); no son necesarios para el arranque descrito arriba.
