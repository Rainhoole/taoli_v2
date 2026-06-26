# PRD: Cross-Exchange Perpetual Arbitrage System

## Background

Build a cross-exchange perpetual futures arbitrage system that starts with Bitget, Binance, and Hyperliquid, and can add more exchanges later. The first product should focus on BTC, ETH, and SOL linear perpetual markets.

The system should not start as a fully autonomous high-frequency bot. It should first make opportunities observable, auditable, and executable through human confirmation, while still handling dangerous partial-execution cases automatically.

## Goals

- Detect cross-exchange perpetual opportunities using executable order book prices, funding rate impact, fees, and slippage buffers.
- Support a Web dashboard where a user can review opportunities and one-click open or close hedged positions.
- Execute paired positions with IOC limit orders and strict risk controls.
- Automatically handle partial fills or failed legs by hedging or closing residual exposure within a 10 bps rescue-cost limit.
- Persist opportunities, order requests, fills, positions, risk events, and user actions for audit and replay.
- Support dry-run mode before small live trading.
- Keep exchange integrations modular so new venues can be added behind a stable adapter interface.

## Non-Goals For Phase 1

- Full automatic open/close without human confirmation.
- Spot transfer arbitrage or cross-exchange real-time fund movement.
- All-market scanning, long-tail assets, or illiquid altcoins.
- Historical order-book backtesting as a prerequisite for the first build.
- Custody, withdrawals, or automated exchange-to-exchange rebalancing.

## Scope

### Exchanges

- Binance
- Bitget
- Hyperliquid

Each exchange should run through an internal `ExchangeAdapter` interface. Business logic must not depend directly on exchange SDK or API response shapes.

### Markets

- BTC linear perpetual
- ETH linear perpetual
- SOL linear perpetual

### Product Shape

- TypeScript/Node.js backend
- React/Next.js Web dashboard
- Postgres database
- Cloud VPS deployment
- Single-user authenticated access with HTTPS and second confirmation for trading actions

## Opportunity Definition

An opportunity is eligible only when all of the following are true:

- Both sides have fresh order book data.
- The relevant executable bid/ask prices can fill the configured notional size within slippage limits.
- Expected net return is at least 10 bps after estimated fees, slippage buffer, and funding impact.
- The opportunity does not breach per-symbol, per-exchange, or total account risk limits.
- Neither exchange is unhealthy, paused, or in reduce-only mode.

Expected net return should account for:

- Executable order book spread
- Next funding interval or expected funding differential
- Exchange taker fees
- Slippage buffer
- Rescue/risk buffer

## Execution Requirements

- Use IOC limit orders for both legs.
- Price limits should be derived from order book depth and max slippage.
- If both legs fill fully, record the arbitrage position as open.
- If one leg fails or partially fills, immediately enter rescue mode.
- Rescue mode may hedge or close residual exposure automatically, up to 10 bps cost.
- If rescue cost exceeds 10 bps, stop automated retries, lock new trading, emit a high-priority alert, and require manual intervention.

## Exit Requirements

The system should support multiple exit triggers:

- Spread convergence below the configured close threshold
- Funding window completion or funding opportunity expiry
- Maximum holding time
- Portfolio-level stop loss
- Margin health deterioration
- Manual close from dashboard

Closed positions should record realized PnL, fees, funding, slippage estimate, and all order/fill IDs.

## Risk Controls

Phase 1 must include:

- Fixed small notional sizing for each opportunity
- Per-symbol exposure limits
- Per-exchange exposure limits
- Total account exposure limits
- API key permissions limited to trading only, withdrawals disabled
- IP whitelist for API keys where supported
- Separate exchange subaccounts where supported
- Global kill switch
- Per-exchange kill switch
- Automatic reduce-only mode after critical risk events
- Stale market data rejection
- Continuous position reconciliation

## Market Data Requirements

- Use WebSocket feeds as the primary data source.
- Use REST for startup snapshots and reconnect recovery.
- Track local receive timestamps for all order book updates.
- Do not open positions using order book data older than 500 ms.
- Mark an exchange market data feed unhealthy after 2 seconds without valid updates.

## Persistence Requirements

Persist these records in Postgres:

- Opportunity snapshots
- User decisions and confirmations
- Order intents and requests
- Exchange order acknowledgements
- Fills and partial fills
- Position snapshots
- Risk events
- Rescue actions
- Kill switch events

Full long-term order book/tick storage is out of scope for Phase 1. Store only short-window in-memory data and key opportunity snapshots.

## Modes

### Dry Run

Dry-run mode uses real market data, balances, symbols, fees, and risk rules, but simulates order placement and fills. It is required before live trading.

### Live Small

Live-small mode uses real trading API keys and fixed small notional sizes. It should only be enabled after dry-run validates opportunity quality and reconciliation behavior.

## Success Criteria

- Dashboard shows fresh cross-exchange opportunities for BTC, ETH, and SOL.
- Dry-run can simulate open and close flows end-to-end.
- Live mode can submit IOC paired orders with second confirmation.
- Partial fill rescue behavior is deterministic and auditable.
- All order, fill, opportunity, risk, and user-action records are queryable in Postgres.
- Adding a fourth exchange does not require changing opportunity or execution core logic.
