# Technical Architecture: Cross-Exchange Perpetual Arbitrage

## System Overview

The system is a TypeScript application with a backend trading service, exchange adapters, a Postgres database, and a Next.js dashboard. The backend owns market data ingestion, opportunity calculation, risk checks, order execution, rescue flows, reconciliation, and persistence.

## Core Modules

### Exchange Adapters

Each exchange implements a shared `ExchangeAdapter` interface. The interface should expose normalized methods and events, not raw exchange SDK types.

Core capabilities:

- Connect market data WebSocket streams
- Fetch REST snapshots
- Fetch balances and positions
- Fetch fees and exchange metadata
- Place IOC limit orders
- Cancel orders
- Fetch order status and fills
- Normalize symbols, quantities, prices, and precision

Initial implementations:

- `BinanceAdapter`
- `BitgetAdapter`
- `HyperliquidAdapter`

### Market Data Service

Maintains the latest top-of-book and order book depth for each configured exchange and symbol.

Rules:

- WebSocket is primary.
- REST snapshot initializes and repairs streams.
- Each update gets a local receive timestamp.
- Data older than 500 ms is stale for opening positions.
- Data older than 2 seconds marks the venue/symbol unhealthy.

### Opportunity Engine

Consumes normalized market data, funding data, fee schedules, and risk config.

It should calculate:

- Long exchange / short exchange direction
- Executable entry prices for configured notional
- Estimated fees
- Estimated slippage
- Expected funding impact
- Net expected return in bps and currency terms
- Required order limits for IOC execution

Only opportunities above 10 bps expected net return should be shown as actionable by default.

### Risk Engine

Runs before every simulated or live action.

Checks:

- Market data freshness
- Exchange health
- Kill switch state
- Per-symbol exposure
- Per-exchange exposure
- Total exposure
- Margin health
- Existing position conflicts
- Rescue mode lockouts

### Execution Engine

Owns paired order placement and state transitions.

Default opening strategy:

1. Receive confirmed opportunity from dashboard.
2. Re-price opportunity using latest fresh order books.
3. Re-run risk checks.
4. Submit both legs as IOC limit orders.
5. Reconcile order acknowledgements and fills.
6. If both sides fill to acceptable tolerance, mark position open.
7. If residual exposure exists, enter rescue mode.

### Rescue Engine

Handles one-sided or partial exposure after execution failure.

Rules:

- Freeze the opportunity immediately.
- Do not open unrelated new positions while rescue is active.
- Attempt automatic hedge or close within a 10 bps rescue-cost cap.
- If cost exceeds cap or APIs are unhealthy, activate reduce-only lock and high-priority alert.
- Persist every attempted rescue action.

### Position Manager

Maintains logical arbitrage positions across exchanges.

Responsibilities:

- Link long leg and short leg into one portfolio-level position
- Track realized and unrealized PnL
- Track funding accruals
- Track margin health
- Reconcile exchange-reported positions against local state
- Trigger close candidates

### Exit Engine

Supports close triggers:

- Spread convergence
- Funding window completion
- Maximum holding time
- Stop loss
- Margin warning
- Manual close

Close execution uses the same paired IOC and rescue machinery as open execution.

### Dashboard

Dashboard views:

- Opportunity table
- Exchange health
- Market data freshness
- Balances and margin
- Open arbitrage positions
- Risk events
- Kill switch controls
- Dry-run/live mode indicator
- One-click open/close with second confirmation

### Persistence

Use Postgres for append-friendly audit records and current state projections.

Suggested tables:

- `exchanges`
- `markets`
- `opportunities`
- `opportunity_snapshots`
- `order_intents`
- `exchange_orders`
- `fills`
- `arbitrage_positions`
- `position_snapshots`
- `risk_events`
- `rescue_actions`
- `user_actions`
- `kill_switch_events`

## Key State Machines

### Opportunity State

- `detected`
- `actionable`
- `confirmed`
- `executing`
- `opened`
- `expired`
- `rejected_by_risk`
- `failed`
- `rescue_required`

### Position State

- `opening`
- `open`
- `closing`
- `closed`
- `rescue_required`
- `manual_intervention_required`

### Exchange Health State

- `healthy`
- `stale_market_data`
- `api_degraded`
- `trading_paused`
- `reduce_only`
- `disabled`

## Configuration

Configuration should include:

- Enabled exchanges
- Enabled symbols
- Per-exchange credentials references
- Per-symbol notional size
- Per-symbol exposure limits
- Per-exchange exposure limits
- Global exposure limits
- Minimum net return threshold, default 10 bps
- Market data stale threshold, default 500 ms
- Market data unhealthy threshold, default 2 seconds
- Rescue cost cap, default 10 bps
- Kill switch defaults

Secrets should be stored outside source control and injected through environment variables or a secret manager.

## Phase Plan

### Phase 1: Read-Only And Dry Run

- Exchange adapters for market data and account reads
- Opportunity engine
- Dashboard opportunity table
- Postgres audit records
- Dry-run simulated execution

### Phase 2: One-Click Live Execution

- Trading API integration
- IOC paired orders
- User confirmation workflow
- Position reconciliation
- Basic close flow

### Phase 3: Rescue And Risk Hardening

- Automatic rescue within 10 bps
- Kill switches
- Reduce-only mode
- Margin and exposure controls
- High-priority alerting

### Phase 4: Expansion

- Add more symbols
- Add more exchanges
- Improve funding models
- Add historical replay or backtesting from stored snapshots
- Add deployment hardening and monitoring
