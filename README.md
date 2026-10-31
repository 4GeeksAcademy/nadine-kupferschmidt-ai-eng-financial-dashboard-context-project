# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run

From the repository root:

```bash
docker compose up --build
```

- Frontend: port `5173`
- Backend: port `8000` (API documentation at `/docs`)
- Port `5678` is the debugger (`debugpy`), not a web page.

### Locally

Open `http://localhost:5173`. By default, the frontend uses the Vite proxy for `/api`, which forwards requests to the backend inside Docker Compose. This procedure was not verified on a local machine in this fork.

### In GitHub Codespaces

In a new Codespace tested on 2026-10-31, `docker compose up --build` worked without additional configuration: `frontend/.env` did not exist (only `.env.example` did), the dashboard loaded data, and DevTools showed `GET /api/metrics` through port `5173` with status `200 OK`. In an earlier Codespace tested on 2026-10-09, the proxy did not connect; the cause could not be confirmed (see `DIAGNOSTICO.md`).

If you see “Unable to load financial data. Please check the backend API.”, try this alternative procedure:

This alternative procedure is what worked in the 2026-10-09 Codespace. To get `<codespace-name>`, copy it from the port `5173` address in the **Ports** tab, or run `echo $CODESPACE_NAME` in the terminal.

1. Create `frontend/.env` (ignored by Git) with the public URL for port 8000, without a trailing `/`:
   `VITE_API_BASE_URL=https://<codespace-name>-8000.app.github.dev`
2. In the **Ports** tab, change port `8000` visibility to **Public**.
3. Restart the services so Vite reads `.env`: `docker compose down`, then `docker compose up --build`.
4. Open port `5173` from the **Ports** tab.

The normal startup worked in the new Codespace tested; use the alternative steps only if the error appears.

### Validate the project

`pytest` and `vitest` are installed inside the containers, not on your machine. With the services running, in another terminal:

```bash
docker compose exec -T frontend npm run build
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T backend pytest
```

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
