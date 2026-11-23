# PLAN.md — Trading Floor AI (para Codex)

Objetivo: una oficina virtual donde cada agente de IA es un empleado con rol y tareas editables.
Jose habla solo con el Jefe; los agentes analizan; **nada sale sin su "va"**.
Inspiración: el Trading Floor de Joel Perrone (piso isométrico, departamentos, Strategy Lab) y la
oficina de agentes de David Chavarin (equipo con flujo y aprobaciones). No es copia de ninguno.

Entrega final: app local (`pnpm dev`), `README.md` y `TEST_RESULTS.md`. Empaquetado Electron/instalador
Windows al final y opcional.

## Modelo central
```
Agent (YAML)  : id, name, role, department, desk{x,y}, enabled, reports_to,
                instructions, tools[], schedule
Task          : id, title, assigned_to, status (pendiente|en_curso|en_revision|
                esperando_aprobacion|aprobada|rechazada|bloqueada), input, output, evidence[]
Approval      : id, task_id, kind (publicar|gastar|exportar), status, decided_at
LogEntry      : ts, actor, event, detail   (auditoría append-only)
```
**Modificable = editar un YAML o usar el panel "Editar empleado"** (nombre, rol, instrucciones, tools,
horario, activo/inactivo). Los cambios se guardan en el YAML y se recargan en caliente.
Nuevas herramientas = una función registrada en `packages/core/tools/` + su nombre en el YAML.

## Fase 0 — Andamiaje
- Monorepo pnpm (`apps/server`, `apps/web`, `packages/core`), TS estricto, Vitest, ESLint/Prettier,
  `.gitignore` (`node_modules`, `data/`, `.env`).
- Scripts: `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm build`.
- **Aceptación:** `pnpm test` y `pnpm lint` pasan en limpio; `pnpm dev` sirve una página vacía.

## Fase 1 — La oficina (base, solo análisis)
1. **Loader de agentes** (`packages/core`): lee `agents/*.yaml`, valida con zod, recarga en caliente.
   Test: YAML inválido da error claro; cambio de archivo actualiza el agente.
2. **Interfaz `LLMProvider`** + `mock` determinista (respuesta etiquetada `[MOCK]`) + Settings
   para elegir proveedor y guardar la key (local, nunca en git).
3. **Orquestador**: el Jefe recibe un mensaje de Jose → crea tareas → las asigna → los agentes
   trabajan en paralelo (Técnico/Macro/Riesgos/Quant) → Revisor califica → Jefe resume →
   `esperando_aprobacion`. Reglas: sin evidencia → el Revisor rechaza; Riesgos puede marcar `bloqueada`.
4. **Herramientas de lectura** (solo lectura): importar CSV de fills/cuentas, leer `config/risk_limits.yaml`,
   leer datos de mercado de CSV importado. Ningún acceso a brokers.
5. **Aprobaciones**: toda salida que implique publicar/gastar/exportar pasa por la bandeja; el botón
   Aprobar/Rechazar queda en el log.
6. **UI**: oficina isométrica SVG (escritorios por departamento según `desk{x,y}`), personaje por
   agente con estado (inactivo/trabajando/esperando/bloqueado), tarjeta de agente (nombre, rol, estado,
   enlace "Ver evidencia"), chat con el Jefe, panel de tareas, panel de log, bandeja de aprobaciones,
   panel "Editar empleado", Settings. Barra superior: nº de agentes, tareas abiertas, aprobaciones pendientes.
7. **Scheduler** simple (cron en proceso) para agentes con `schedule`; **apagado por defecto**.
- **Aceptación:** en modo mock, "analiza el ORB de hoy en MNQ" recorre todo el flujo y termina en una
  aprobación pendiente; editar las instrucciones de un agente en la UI cambia su YAML y su siguiente
  respuesta; ningún archivo del repo contiene llamadas a brokers (`grep` en tests).

## Fase 2 — Strategy Lab (motor propio, sin ejecución)
1. Definición de estrategia declarativa (YAML/JSON): instrumento, sesión, reglas de entrada/salida,
   filtros (rango, EMA), RR, tamaño. Ejemplo incluido: ORB Asia 18:00–20:00 ET.
2. **Motor de backtest propio** sobre barras de CSV importado (sin MT5): trades cerrados, profit factor,
   expectancy, max drawdown, curva de capital, **Monte Carlo** (reordenado de trades, N simulaciones).
   Tests con datasets sintéticos de resultado conocido.
3. Flujo: Investigador propone borrador → Quant corre backtest → Revisor califica con umbrales
   configurables (`config/thresholds.yaml`, p. ej. PF y drawdown) → Jefe pide aprobación.
4. Salida aprobada = **archivo exportado** (definición + reporte) para probar en Sim101/Playback.
   La app no lo ejecuta ni lo envía.
- **Aceptación:** backtest reproducible (misma semilla, mismo resultado); una estrategia que no pasa
  umbrales no puede llegar a "exportar".

## Fase 3 — Datos en vivo (solo lectura)
- Recepción de alertas/webhooks de TradingView en un endpoint local de solo lectura y mostrarlas
  en la actividad; importación periódica de fills desde un CSV/carpeta que Jose indique.
- Alertas de riesgo en la oficina (Inés) con distancia a los floors.
- **Sin** ejecución, **sin** claves de broker. Aceptación: una alerta simulada aparece en la UI
  y en el log; ningún camino de código envía órdenes.

## Fase 4 — Empaquetado (opcional)
- Envoltorio Electron para Windows (build desempaquetado + instrucciones del instalador).
- Para 24/7: correr en un VPS siempre encendido (documentar en README).

## Fuera de alcance
Trading automatizado en fondeada, ejecución directa en cuentas reales, conector MCP, cualquier
cambio en easytradeclub.com o en el puente TradingView→NinjaTrader.

## Pendientes que Jose debe decidir antes de la Fase 1
- Valores reales de `config/risk_limits.yaml` (floors por PA, pérdida diaria).
- Formato de los CSV de fills y de barras que va a importar.
- Proveedor de LLM y su key (se pone en Settings, nunca en el chat).
