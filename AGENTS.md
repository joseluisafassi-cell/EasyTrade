# AGENTS.md — Reglas para Codex (Trading Floor AI)

Proyecto: oficina de trading con agentes de IA para Jose. App web local, simple y modificable.
Lee `PLAN.md` y trabaja fase por fase. No saltes de fase sin que los criterios de aceptación pasen.

## Reglas de seguridad (NO NEGOCIABLES)
1. **Ningún código que coloque órdenes.** No integres APIs de brokers (Tradovate, NinjaTrader, MT5)
   para ejecutar. La app **solo analiza**.
2. Los "bots" son solo **borradores de estrategia** o archivos exportados para probar en Sim101/Playback.
   Nunca marques algo como listo para cuenta fondeada.
3. **Nada se publica, gasta o exporta sin aprobación humana** (flujo de aprobaciones, ver PLAN.md §Fase 1).
4. **No inventes datos.** Cifras solo desde datos importados por Jose (CSV de fills, backtests propios).
   Sin dato → el agente responde "sin dato", no estima.
5. Prohibido tocar: `C:\TradingViewBridge\`, `jose_sync.py`, sync nocturno, cuentas reales,
   easytradeclub.com (solo leer datos que Jose exporte).
6. **Secretos nunca en código ni en el repo.** La API key va en Settings de la app (guardada
   localmente, fuera de git). `.env` y `data/` están en `.gitignore`.

## Stack (decisión del proyecto)
- Node 20 + TypeScript, `pnpm`.
- Backend: Fastify + SQLite (`better-sqlite3`) + `zod` para validar.
- Frontend: React + Vite. Oficina isométrica en **SVG** (sin motores 3D).
- Tests: Vitest. Lint: ESLint + Prettier.
- Agentes definidos en `agents/*.yaml` (se recargan sin reiniciar).
- Proveedor de LLM detrás de una interfaz `LLMProvider`; **modo `mock` por defecto**.
  Implementaciones: `mock`, `anthropic`, `openai`. El proveedor se elige en Settings.

## Convenciones
- Estructura: `apps/server`, `apps/web`, `packages/core` (tipos, loader de YAML, orquestador),
  `agents/`, `config/`, `docs/`, `data/` (ignorado).
- Commits pequeños por tarea. Mensajes en español o inglés, consistentes.
- Cada tarea del plan termina con tests pasando (`pnpm test`) y `pnpm lint` limpio.
- Mantén todo simple: sin frameworks extra, sin abstracciones que el plan no pida.
- Al terminar una fase, actualiza `TEST_RESULTS.md` con comandos ejecutados y resultados reales.
