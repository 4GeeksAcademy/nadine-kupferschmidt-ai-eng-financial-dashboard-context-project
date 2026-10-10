# Diagnóstico: frontend sin datos financieros

## Causa probable

No encontré una discrepancia entre la URL que llama el frontend y la ruta que expone el backend:

- El cliente toma `VITE_API_BASE_URL` y, si no está definida, usa una base vacía; luego solicita `GET /api/metrics` ([frontend/src/App.tsx](frontend/src/App.tsx#L13), [frontend/src/App.tsx](frontend/src/App.tsx#L16)). El ejemplo de entorno deja la variable vacía ([frontend/.env.example](frontend/.env.example#L4)).
- Vite reenvía las solicitudes `/api` a `http://backend:8000` ([frontend/vite.config.ts](frontend/vite.config.ts#L11-L14)).
- FastAPI incluye el router y este define `GET /api/metrics` ([backend/app/main.py](backend/app/main.py#L14), [backend/app/routes.py](backend/app/routes.py#L248)).

**Causa probable, no confirmada:** el primer fetch pudo ocurrir antes de que el backend estuviera disponible para el proxy. Compose declara `depends_on: backend`, pero no configura una comprobación de salud ni una espera a que la API esté lista ([docker-compose.yml](docker-compose.yml#L11-L12)). Además, el frontend hace una sola petición y convierte cualquier error en el mensaje mostrado, sin reintentar ([frontend/src/App.tsx](frontend/src/App.tsx#L30), [frontend/src/App.tsx](frontend/src/App.tsx#L35-L37)). Si esa petición inicial falla durante el arranque, la pantalla puede seguir mostrando el error aunque el backend termine de iniciar después.

Esto sigue siendo una hipótesis: las pruebas de terminal fueron inconsistentes y, al repetirlas, no había contenedores activos. No queda demostrado que esa fuera la causa de la sesión de Codespaces del usuario. Tampoco encontré evidencia de que Compose defina `VITE_API_BASE_URL`; si el navegador pide una URL distinta del origen de Codespaces, conviene revisar esa variable en el entorno real.

## Comandos ejecutados y resultados

Las pruebas con `curl` fueron de solo lectura; no inicié, detuve ni modifiqué servicios.

| Comando | Resultado |
|---|---|
| `sed -n '1,80p' frontend/.env.example` | Mostró comentarios que recomiendan dejar que el proxy de Vite reenvíe `/api` en Codespaces, y `VITE_API_BASE_URL=` vacío. |
| `curl -sS --max-time 5 -o /dev/null -w 'HTTP %{http_code}; destino %{url_effective}; error=%{errormsg}\\n' http://localhost:8000/api/metrics` | `HTTP 200` en la primera prueba. |
| `curl -sS --max-time 5 -o /dev/null -w 'HTTP %{http_code}; destino %{url_effective}; error=%{errormsg}\\n' http://localhost:5173/api/metrics` | Se agotó el tiempo de espera a los 5 segundos, sin respuesta. |
| `curl -sS --max-time 5 -o /dev/null -w 'HTTP %{http_code}; destino %{url_effective}; error=%{errormsg}\\n' http://backend:8000/api/metrics` | `Could not resolve host: backend`. Esta terminal está fuera de la red DNS de Compose; por sí solo, este resultado no demuestra que falle la comunicación entre contenedores. |
| `curl -sS --max-time 5 -o /dev/null -w 'HTTP %{http_code}; destino %{url_effective}; error=%{errormsg}\\n' http://localhost:8000/health` | `Failed to connect to localhost port 8000`. |
| `docker compose ps` | Solo mostró los encabezados; no había servicios de Compose activos en ese momento. |
| `docker ps --format '{{.Names}} {{.Status}} {{.Ports}}'` | No mostró contenedores activos. |
| `curl -sS --noproxy '*' --max-time 5 -o /dev/null -w 'HTTP %{http_code}; %{errormsg}\\n' http://127.0.0.1:8000/api/metrics` | En la repetición aislada no pudo conectar: puerto 8000 sin listener. |
| `curl -sS --noproxy '*' --max-time 5 -o /dev/null -w 'HTTP %{http_code}; %{errormsg}\\n' http://127.0.0.1:5173/api/metrics` | En la repetición aislada no pudo conectar: puerto 5173 sin listener. |
| `rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' 'VITE_API_BASE_URL|API_BASE_URL|proxy:|target:|/api/metrics|@router.get' .` | No se pudo ejecutar: `rg: command not found`. La búsqueda de código se hizo con la búsqueda del editor. |

El `200` de la primera petición directa confirma que el endpoint respondió en ese instante; los resultados posteriores no permiten verificar el proxy en ejecución ni atribuir con certeza el fallo observado en el navegador.

## Posible solución, sin aplicar

Añadir una comprobación de salud para el backend y configurar el frontend para depender de que el backend esté **healthy**, no solo iniciado; también convendría reintentar la carga cuando falle el primer fetch. Antes de cambiarlo, revisar en DevTools → Network la URL y el error exactos de la petición: con la configuración actual se espera una solicitud al mismo origen de Codespaces, ruta `/api/metrics`. Si aparece otro origen, comprobar y corregir `VITE_API_BASE_URL` para que apunte al backend accesible desde el navegador, o dejarla vacía para usar el proxy de Vite.

## Segunda revisión

Compose estaba activo durante estas pruebas. Se ejecutaron desde una terminal bash separada de la terminal Docker; no se detuvo ningún servicio ni se modificó configuración.

### Comandos y resultados

| Comando | Resultado |
|---|---|
| ``docker compose exec frontend node -e 'fetch("http://backend:8000/api/metrics", { signal: AbortSignal.timeout(5000) }).then(async (response) => { const body = await response.text(); console.log(`HTTP ${response.status}; bytes=${body.length}; content-type=${response.headers.get("content-type")}`); }).catch((error) => { console.error(`${error.name}: ${error.message}`); process.exitCode = 1; })'`` | `TimeoutError: The operation was aborted due to timeout` tras 5 s. No hubo respuesta HTTP desde el backend. |
| `docker compose logs --no-color --tail=100 backend` | Mostró Uvicorn iniciado y `Application startup complete`; no había peticiones de frontend en esos logs. |
| `docker compose ps` | `frontend` y `backend` estaban `Up`; frontend publicó `5173` y backend `8000` y `5678`. |
| ``docker compose exec frontend node -e 'const dns=require("node:dns"); const net=require("node:net"); dns.lookup("backend", {all:true}, (error, addresses) => { console.log(error ? `DNS ERROR: ${error.code}: ${error.message}` : `DNS OK: ${JSON.stringify(addresses)}`); if (error) { process.exitCode=1; return; } const socket=net.connect({host:"backend", port:8000}); const timer=setTimeout(() => { console.log("TCP TIMEOUT after 3000ms"); socket.destroy(); process.exitCode=1; }, 3000); socket.once("connect", () => { clearTimeout(timer); console.log("TCP OK: backend:8000 connected"); socket.end(); }); socket.once("error", (err) => { clearTimeout(timer); console.log(`TCP ERROR: ${err.code}: ${err.message}`); process.exitCode=1; }); });'`` | Consulta DNS correcta: `backend` resolvió a `172.18.0.2`; la conexión TCP a `backend:8000` expiró a los 3 s. |
| `docker compose logs --no-color --tail=100 frontend` | Vite informó `ready` y escuchando en `0.0.0.0:5173`; no registró errores de proxy en las líneas consultadas. |
| ``docker compose exec frontend node -e 'fetch("http://backend:8000/health", {signal:AbortSignal.timeout(3000)}).then(async r=>console.log(`HTTP ${r.status}: ${await r.text()}`)).catch(e=>{console.error(`${e.name}: ${e.message}`);process.exitCode=1})'`` | También expiró tras 3 s; no es un problema exclusivo de `/api/metrics`. |
| `docker compose exec backend python -c 'import urllib.request; response=urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=3); print(f"HTTP {response.status}: {response.read().decode()}")'` | `HTTP 200: {"status":"ok"}` dentro del contenedor backend. |
| `docker inspect -f '{{.Name}} {{json .NetworkSettings.Networks}}' $(docker compose ps -q frontend) $(docker compose ps -q backend)` | Ambos contenedores están conectados a la misma red `nadine-kupferschmidt-ai-eng-financial-dashboard-context-project_default`, con el mismo `NetworkID`; frontend tiene `172.18.0.3` y backend `172.18.0.2`. |
| `docker compose logs --no-color --tail=120 backend` | Confirmó el inicio normal y registró el `GET /health` local con `200 OK`; no registró las solicitudes que expiraron desde frontend. |
| `docker network ls --format '{{.Name}} {{.Driver}}'` | La red `nadine-kupferschmidt-ai-eng-financial-dashboard-context-project_default` usa el driver `bridge`. |
| ``docker compose exec frontend node -e 'const net=require("node:net"); const socket=net.connect({host:"172.18.0.2",port:8000}); const timer=setTimeout(()=>{console.log("TCP TIMEOUT to backend IP 172.18.0.2:8000");socket.destroy();process.exitCode=1},3000);socket.once("connect",()=>{clearTimeout(timer);console.log("TCP OK to backend IP 172.18.0.2:8000");socket.end()});socket.once("error",e=>{clearTimeout(timer);console.log(`TCP ERROR ${e.code}: ${e.message}`);process.exitCode=1})'`` | Prueba TCP directa a `172.18.0.2:8000` desde frontend: `TCP TIMEOUT`. |
| `docker compose exec backend python -c 'import socket, urllib.request; ip=socket.gethostbyname(socket.gethostname()); print(f"backend container IP: {ip}"); response=urllib.request.urlopen(f"http://{ip}:8000/health", timeout=3); print(f"HTTP {response.status}: {response.read().decode()}")'` | La IP del backend fue `172.18.0.2`; su endpoint respondió `HTTP 200: {"status":"ok"}` por esa IP. |
| ``docker compose exec frontend node -e 'fetch("http://127.0.0.1:5173/", {signal:AbortSignal.timeout(3000)}).then(async r=>console.log(`Vite HTTP ${r.status}; bytes=${(await r.text()).length}`)).catch(e=>{console.error(`${e.name}: ${e.message}`);process.exitCode=1})'`` | Vite respondió localmente `HTTP 200` (615 bytes). |

### Causa confirmada o descartada

**Confirmado:** la conexión TCP desde el contenedor frontend al puerto `8000` del contenedor backend no se establece, tanto por el alias `backend` como por la IP `172.18.0.2`. Vite está disponible, el backend responde localmente, y ambos contenedores comparten la red bridge de Compose. Por eso el proxy, configurado para enviar `/api` a `http://backend:8000` ([frontend/vite.config.ts](frontend/vite.config.ts#L11-L14)), queda esperando una conexión que no llega al servidor. Backend escucha en `0.0.0.0:8000` según su comando de inicio ([backend/Dockerfile](backend/Dockerfile#L12)); la ruta también coincide con la petición del frontend ([frontend/src/App.tsx](frontend/src/App.tsx#L16), [backend/app/routes.py](backend/app/routes.py#L248)).

**Descartado:** el problema de tiempo de arranque, una URL/ruta incorrecta y que Vite o Uvicorn no estén iniciados. Esta evidencia no identifica qué regla o condición de bajo nivel impide el tráfico entre contenedores; el origen de la falla de red queda **❓ sin evidencia**.

### Posible solución, sin aplicar

Investigar las reglas de red/firewall del entorno Docker/Codespaces que afectan el tráfico entre contenedores de la red bridge y restablecer la conectividad TCP entre `172.18.0.3` y `172.18.0.2:8000`. No cambiaría la URL del proxy ni las rutas, porque ya coinciden. Si la red necesita recrearse, hacerlo solo en una ventana autorizada: esta revisión no detuvo ni reinició Compose.

## Tercera revisión

Las comprobaciones se ejecutaron desde una terminal nueva, separada de la terminal Docker. No se detuvo ni reinició Docker; la única modificación fue agregar esta sección al diagnóstico. No hay una carpeta `.devcontainer` en la raíz del workspace.

### Comandos y resultados

Comprobación de `.devcontainer`:

```sh
if test -d .devcontainer; then ls -la .devcontainer; else printf '%s\n' '.devcontainer: no existe en la raíz del workspace'; fi
```

Resultado: `.devcontainer: no existe en la raíz del workspace`.

Prueba TCP repetida desde el contenedor frontend:

```sh
docker compose exec frontend node -e 'const dns=require("node:dns"); const net=require("node:net"); dns.lookup("backend", {all:true}, (error, addresses) => { console.log(error ? `DNS ERROR: ${error.code}: ${error.message}` : `DNS OK: ${JSON.stringify(addresses)}`); if (error) { process.exitCode=1; return; } const socket=net.connect({host:"backend", port:8000}); const timer=setTimeout(() => { console.log("TCP TIMEOUT after 3000ms"); socket.destroy(); process.exitCode=1; }, 3000); socket.once("connect", () => { clearTimeout(timer); console.log("TCP OK: backend:8000 connected"); socket.end(); }); socket.once("error", (err) => { clearTimeout(timer); console.log(`TCP ERROR: ${err.code}: ${err.message}`); process.exitCode=1; }); });'
```

Resultado: `DNS OK: [{"address":"172.18.0.2","family":4}]`; `TCP TIMEOUT after 3000ms`.

| Comando | Resultado |
|---|---|
| `docker info` | Docker Client y Server `29.8.0-1`; el servidor reporta `Operating System: Ubuntu 24.04.5 LTS (containerized)`, `Firewall Backend: iptables` y `EnableUserlandProxy: true`. El daemon anuncia soporte para redes `bridge`; esto no muestra las reglas activas que bloquean o permiten el tráfico. |
| `docker network inspect nadine-kupferschmidt-ai-eng-financial-dashboard-context-project_default` | Red `bridge`, subred `172.18.0.0/16`, gateway `172.18.0.1`, no interna. Incluye frontend `172.18.0.3` y backend `172.18.0.2`. |
| `iptables -S` | Falló: `Could not fetch rule set generation id: Permission denied (you must be root)`. |
| `nft list ruleset` | Falló: `Operation not permitted (you must be root)`; netlink no pudo inicializar su caché. |
| `docker compose ps` | Ambos servicios `Up` (5 minutos en el momento de la consulta). Backend publica `8000` y `5678`; frontend publica `5173`. |

### Causa confirmada o pendiente

**Confirmado:** desde frontend, `backend` resuelve a `172.18.0.2`, pero no se completa la conexión TCP al puerto `8000`. Los contenedores comparten la misma red bridge de Compose y ambos estaban activos. La revisión anterior comprobó que el backend responde localmente en su propio contenedor.

**Causa específica del bloqueo: ❓ sin evidencia.** `docker info` indica que el daemon usa el backend de firewall `iptables`, pero no fue posible leer las reglas iptables/nftables por falta de privilegios. Que Docker reporte un sistema operativo “containerized” tampoco demuestra por sí solo que el firewall del host sea la causa; el bloqueo podría estar en la capa de red del daemon/host de Codespaces. Reiniciar Codespace y recrear la red ya fueron intentados sin resolverlo.

### Posibles soluciones

**A) Sin cambiar archivos del repositorio**

- Pedir al administrador/plataforma de Codespaces que inspeccione en el host real del daemon las cadenas `DOCKER-USER`, `FORWARD`, las reglas nftables y el forwarding de la bridge para el tráfico entre `172.18.0.3` y `172.18.0.2:8000`. Las consultas de esta sesión no tienen permisos para hacerlo.
- Si las reglas del host bloquean ese tráfico, solicitar que permitan el forwarding entre contenedores de esa red. No hay evidencia suficiente para justificar un cambio concreto de regla desde este Codespace.

**B) Cambiando archivos del repositorio**

- Como alternativa de arquitectura, configurar el frontend para llamar al backend mediante su puerto publicado y una URL de Codespaces accesible desde el navegador, en vez de usar el proxy interno a `backend:8000`. Requeriría ajustar la URL de API en `frontend/src/App.tsx` o la configuración de entorno correspondiente; si la llamada queda en otro origen, podría requerir habilitar CORS en `backend/app/main.py`. Solo serviría si el puerto 8000 está accesible desde el navegador, y no corregiría el bloqueo bridge subyacente.
- No se recomienda añadir reintentos o una espera de salud como corrección de este síntoma: la prueba actual vence con ambos servicios activos, por lo que no es evidencia de una carrera de arranque.
