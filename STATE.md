# TAOLI — State

> Auto-updated by loop. Last: 2026-06-27 02:15 UTC

## Phase Progress

### Phase 0: Scaffold ✅
- [x] monorepo (npm workspaces)
- [x] shared types
- [x] ExchangeAdapter interface
- [x] RuntimeConfig + env loading
- [x] Basic API server (/health)
- [x] Next.js dashboard skeleton
- [x] Tests (10/10 passing)

### Phase 1: Market Data
- [ ] BinanceAdapter implementation
- [ ] BitgetAdapter implementation
- [ ] HyperliquidAdapter implementation
- [ ] WebSocket connection + order book maintenance
- [ ] REST snapshot fallback on reconnect
- [ ] Freshness tracking integrated with MarketDataService

### Phase 2: Persistence
- [x] AuditRepository interface
- [x] InMemoryAuditRepository
- [x] Postgres schema (SQL)
- [ ] PostgresAuditRepository implementation
- [ ] Database migration tooling
- [ ] API integration with audit repo

### Phase 3: Risk + Dry-Run
- [ ] RiskEngine (freshness, health, kill switch, exposure)
- [ ] Kill switch state machine (global + per-exchange)
- [ ] DryRunExecutionEngine
- [ ] Simulated order fills
- [ ] Risk event recording

### Phase 4: Live Execution
- [ ] Live IOC paired execution
- [ ] Order reconciliation
- [ ] RescueEngine (10bps cap)
- [ ] PositionManager
- [ ] ExitEngine

### Phase 5: Dashboard + Deploy
- [ ] Opportunity table
- [ ] Position view
- [ ] Risk event log
- [ ] Kill switch controls
- [ ] One-click confirm flow
- [ ] VPS deployment
- [ ] HTTPS + auth

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-26 | npm workspaces (not pnpm) | Simpler setup, fewer deps |
| 2026-06-26 | InMemoryAuditRepository first | Can swap to Postgres without changing interface |
| 2026-06-26 | $100 default notional | Conservative for dry-run |
| 2026-06-27 | Loop Engineering framework adopted | RohOnChain pattern: skill/state/verifier/worktrees |

## Blockers

| Blocker | Status |
|---------|--------|
| Exchange API keys | ❌ User needs to provide Binance/Bitget/Hyperliquid keys |
| Postgres database | ⚠️ Need to set up local Postgres or use Railway |
| VPS target | ❌ User needs to decide Railway vs self-hosted |
