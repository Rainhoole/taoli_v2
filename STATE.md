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
- [x] Loop system infra (.hermes.md, STATE.md, SKILL.md)

### V2 Research ✅ (2026-06-27)
- [x] Polymarket arbitrage (NegRisk + binary + combinatorial)
- [x] PM↔CEX cross-venue (latency arb, perp arb, options arb)
- [x] CEX↔DEX Hyperliquid (funding rate, leg risk)
- [x] Tools & libraries scan (2026 ecosystem)
- [x] V2_PLAN.md synthesized from 7 research sources

### V2 Phase 1A: Hyperliquid Integration
- [ ] HyperliquidAdapter implementation
- [ ] EIP-712 signing + API Wallet setup
- [ ] 1h vs 8h funding rate cycle handling
- [ ] Leg risk management (timeout + rollback)
- [ ] Dry-run 14 days

### V2 Phase 1B: Polymarket Adapter
- [ ] PolymarketAdapter (CLOB + Gamma + WebSocket)
- [ ] NegRisk scanner (priority!)
- [ ] Binary YES+NO scanner
- [ ] FOK order execution + gas management
- [ ] Dry-run 14 days

### V2 Phase 2: PM↔CEX Latency Arb
- [ ] Dual Binance WS + PM CLOB WS stream
- [ ] Chainlink oracle window-open price tracking
- [ ] Momentum detector + probability model
- [ ] FAK execution + 250ms taker delay handling
- [ ] Paper → Shadow → Small Live

### Phase 1: Market Data (CEX only)
- [ ] BinanceAdapter implementation
- [ ] BitgetAdapter implementation
- [ ] WebSocket connection + order book maintenance
- [ ] REST snapshot fallback on reconnect

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
