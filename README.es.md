# Panel de Métricas Financieras

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_These instructions are [available in English](./README.md)._

**Antes de empezar**: 📗 [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Pasos recomendados

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Ejecuta tu agente de IA para inspeccionar frontend y backend.
4. Documenta las reglas propuestas y el banco de memoria en tu fork.
5. Ajusta y valida las reglas hasta que sean aplicables al flujo real del proyecto.

## Estructura esperada del directorio para agentes

```text
./.agents
└─ /rules
   └─ <nombre-regla>.md
└─ /skills
   └─ /<nombre-skill>
      └─ /SKILL.md
```

## Cómo ejecutar

Desde la raíz del repositorio:

```bash
docker compose up --build
```

- Frontend: puerto `5173`
- Backend: puerto `8000` (documentación de la API en `/docs`)
- El puerto `5678` es el depurador (`debugpy`), no una página web.

### En local

Abre `http://localhost:5173`. El frontend usa por defecto el proxy de Vite para `/api`, que reenvía al backend dentro de Docker Compose. Este procedimiento no se verificó en una máquina local en este fork.

### En GitHub Codespaces (procedimiento verificado)

En el Codespace verificado, el proxy de Vite no logró conectar con el backend y el dashboard muestra «Unable to load financial data. Please check the backend API.». La causa no se pudo confirmar (ver `DIAGNOSTICO.md`). El dashboard funcionó así:

1. Crea `frontend/.env` (Git lo ignora) con la URL pública del puerto 8000, sin `/` al final:
   `VITE_API_BASE_URL=https://<nombre-del-codespace>-8000.app.github.dev`
2. En la pestaña **Puertos**, cambia la visibilidad del puerto `8000` a **Public**.
3. Reinicia los servicios para que Vite lea `.env`: `docker compose down` y luego `docker compose up --build`.
4. Abre el puerto `5173` desde la pestaña **Puertos**.

Al crear un Codespace nuevo, la URL cambia y el puerto vuelve a ser privado: repite los pasos 1 a 4.

### Validar el proyecto

`pytest` y `vitest` se instalan dentro de los contenedores, no en tu máquina. Con los servicios en marcha, en otra terminal:

```bash
docker compose exec -T frontend npm run build
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T backend pytest
```

---

Este y muchos otros proyectos son construidos por estudiantes como parte de los [Coding Bootcamps](https://4geeksacademy.com/) de 4Geeks Academy. Encuentra más acerca de los [cursos](https://4geeksacademy.com/es/comparar-programas) de [Ingeniería de IA](https://4geeksacademy.com/es/coding-bootcamps/ingenieria-ia), [Data Science & Machine Learning](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning), [Ciberseguridad](https://4geeksacademy.com/es/coding-bootcamps/curso-ciberseguridad) y [Full-Stack Software Developer con IA](https://4geeksacademy.com/es/coding-bootcamps/programador-full-stack).
