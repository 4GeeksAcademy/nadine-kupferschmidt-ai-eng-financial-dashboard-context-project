# Hallazgos de ingeniería

## Verificación

- Hallazgos 1–10 y 12–17: ✅ revisados contra archivos o ejecutando pruebas.
- Hallazgo 11: ❌ descartado; `LEVANTAR_PROYECTO.md` lo creó el agente en Fase 1 y no es una convención original del repo.
- Los números son identificadores fijos: el hallazgo 17 se agregó después de la revisión y se ubicó en su categoría (Testing) sin renumerar, para no romper las referencias de las reglas propuestas.

## Arquitectura

1. **Tipo: convención.** `App` compone el dashboard y delega visualización y cálculos a componentes y utilidades separados. Evidencia: [frontend/src/App.tsx](frontend/src/App.tsx#L1), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L21).
2. **Tipo: convención.** Los endpoints declaran modelos Pydantic y `response_model` para formalizar el contrato HTTP. Evidencia: [backend/app/routes.py](backend/app/routes.py#L22), [backend/app/routes.py](backend/app/routes.py#L248).
3. **Tipo: riesgo.** `generate_mock_movements` llama a `random.seed(seed)`, que altera el generador aleatorio global del proceso y no aísla la aleatoriedad de esta función. Evidencia: [backend/app/routes.py](backend/app/routes.py#L94), [backend/app/routes.py](backend/app/routes.py#L96).
4. **Tipo: riesgo.** El encabezado fija `2024 - Full Year`, mientras el backend genera movimientos a partir de `date.today()` y recorre los doce meses. Evidencia: [frontend/src/App.tsx](frontend/src/App.tsx#L49), [backend/app/routes.py](backend/app/routes.py#L97), [backend/app/routes.py](backend/app/routes.py#L99).
5. **Tipo: riesgo.** El `.catch` ignora el error recibido y solo establece un mensaje genérico, perdiendo el detalle útil para diagnosticar el fallo. Evidencia: [frontend/src/App.tsx](frontend/src/App.tsx#L35), [frontend/src/App.tsx](frontend/src/App.tsx#L36).

## Nombres

6. **Tipo: convención.** Los componentes React se exportan en PascalCase, los archivos de dashboard usan kebab-case y las funciones de utilidades TypeScript usan camelCase. Evidencia: [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx#L49), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L21).
7. **Tipo: convención.** En backend, las clases de modelos usan PascalCase y las funciones usan snake_case. Evidencia: [backend/app/routes.py](backend/app/routes.py#L22), [backend/app/routes.py](backend/app/routes.py#L94), [backend/app/routes.py](backend/app/routes.py#L249).

## Testing

8. **Tipo: convención.** Las pruebas API usan `TestClient`, funciones `test_*` descriptivas y aserciones sobre estado, contenido y filtros. Evidencia: [backend/tests/test_routes.py](backend/tests/test_routes.py#L3), [backend/tests/test_routes.py](backend/tests/test_routes.py#L25), [backend/tests/test_routes.py](backend/tests/test_routes.py#L42).
9. **Tipo: convención.** Las pruebas frontend agrupan casos con `describe`/`it` e incluyen bordes como movimientos sin ingresos y meses entre años. Evidencia: [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L35), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L47), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L63).
17. **Tipo: riesgo.** Las pruebas frontend solo cubren funciones de `frontend/src/lib`, no `App.tsx` ni componentes, y `package.json` no incluye librerías para probar la interfaz; así no se detectó el periodo `2024 - Full Year` hardcodeado. Evidencia: `docker compose exec frontend npm test` → 1 archivo, 5 tests; [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L1), [frontend/package.json](frontend/package.json#L14-L42), [frontend/src/App.tsx](frontend/src/App.tsx#L49).

## Documentación

10. **Tipo: riesgo.** El README afirma que Codespaces no necesita variables extra, pero la verificación de este Codespace registra que se necesitó una URL pública para que funcionara la API. Evidencia: [README.es.md](README.es.md#L45), [verification.md](verification.md#L16), [verification.md](verification.md#L38).
11. ~~**Tipo: convención.** `LEVANTAR_PROYECTO.md` documenta por servicio carpeta, puerto y comando, además del comando Compose recomendado. Evidencia: [LEVANTAR_PROYECTO.md](LEVANTAR_PROYECTO.md#L5), [LEVANTAR_PROYECTO.md](LEVANTAR_PROYECTO.md#L7), [LEVANTAR_PROYECTO.md](LEVANTAR_PROYECTO.md#L14).~~ (descartado: LEVANTAR_PROYECTO.md lo creó el agente en Fase 1; no es una convención original del repo).

## Entorno/DX

12. **Tipo: riesgo.** `backend/requirements.txt` no fija versiones; la ejecución documentada de pytest reportó un warning deprecado de httpx. Evidencia: [backend/requirements.txt](backend/requirements.txt#L1), [verification.md](verification.md#L14).
13. **Tipo: convención.** Compose monta el código fuente en ambos servicios y Uvicorn arranca con `--reload`, lo que configura un ciclo de desarrollo con cambios en vivo. Evidencia: [docker-compose.yml](docker-compose.yml#L8-L10), [docker-compose.yml](docker-compose.yml#L21-L22), [backend/Dockerfile](backend/Dockerfile#L12).
14. **Tipo: convención.** `.gitignore` excluye `.env` y `.env.*`, y vuelve a permitir `.env.example` como plantilla compartible. Evidencia: [.gitignore](.gitignore#L11), [.gitignore](.gitignore#L12), [.gitignore](.gitignore#L13).

## Seguridad

15. **Tipo: riesgo.** CORS permite cualquier origen, credenciales, método y encabezado, una política amplia para una API que pueda ser accesible desde otros orígenes. Evidencia: [backend/app/main.py](backend/app/main.py#L9), [backend/app/main.py](backend/app/main.py#L10), [backend/app/main.py](backend/app/main.py#L11), [backend/app/main.py](backend/app/main.py#L12).
16. **Tipo: riesgo.** `debugpy` escucha en `0.0.0.0:5678` y Compose publica `5678:5678`, exponiendo el puerto del depurador en el host de Docker. Evidencia: [backend/Dockerfile](backend/Dockerfile#L12), [docker-compose.yml](docker-compose.yml#L20).

## Reglas propuestas

1. Mantener `App` como compositor y ubicar cálculos de dominio en utilidades y presentación en componentes. (Hallazgo 1)
2. Declarar modelos de respuesta y `response_model` en cada endpoint API. (Hallazgo 2)
3. Usar un generador aleatorio local por función en vez de modificar el estado global de `random`. (Hallazgo 3)
4. Derivar el periodo mostrado del periodo real de los datos, no de un literal anual fijo. (Hallazgo 4)
5. Conservar el detalle técnico del error para diagnóstico, aunque la interfaz muestre al usuario un mensaje seguro y legible. (Hallazgo 5)
6. Mantener PascalCase para componentes, kebab-case para sus archivos y camelCase para utilidades frontend. (Hallazgo 6)
7. Mantener PascalCase para modelos Python y snake_case para funciones Python. (Hallazgo 7)
8. Escribir pruebas API con `TestClient` y comprobar estado, contrato y filtros relevantes. (Hallazgo 8)
9. Cubrir funciones frontend con casos nominales y bordes representativos. (Hallazgo 9)
10. Mantener la guía de Codespaces alineada con la configuración que realmente requiere el entorno. (Hallazgo 10)
11. ~~Documentar servicios con sus carpetas, puertos y comandos al cambiar el arranque del proyecto. (Hallazgo 11)~~ (descartado: LEVANTAR_PROYECTO.md lo creó el agente en Fase 1; no es una convención original del repo).
12. Fijar versiones de dependencias backend y revisar warnings de compatibilidad durante las pruebas. (Hallazgo 12)
13. Con Docker corriendo, los cambios en frontend/ y backend/ se ven en vivo por los volúmenes; reconstruir con `docker compose up --build` solo si cambian package.json o requirements.txt. (Hallazgo 13)
14. Ignorar archivos de entorno locales y mantener una plantilla `.env.example` sin valores secretos. (Hallazgo 14)
15. Restringir CORS a los orígenes y capacidades que el frontend necesite realmente. (Hallazgo 15)
16. Restringir el puerto de `debugpy` al entorno local de desarrollo y evitar publicarlo en entornos accesibles externamente. (Hallazgo 16)
17. Al cambiar App.tsx o componentes, verificar el resultado en el navegador, porque no hay pruebas automáticas de interfaz. (Hallazgo 17)
