# 11 - Build Web Dashboard

Status: ready-for-agent

## Goal

Build the first dashboard for opportunity review, health monitoring, one-click dry-run/live actions, and emergency controls.

## Scope

- Opportunity table with net bps, direction, exchanges, symbol, size, and reasons.
- Exchange health and market data freshness views.
- Balances, margin, and open arbitrage positions.
- Risk event log.
- Dry-run/live mode indicator.
- One-click open/close with second confirmation.
- Global and per-exchange kill switch controls.

## Acceptance Criteria

- A user can inspect why an opportunity is actionable or rejected.
- Trading actions require second confirmation.
- Kill switch state is visible and controllable.
- Dashboard does not expose trading actions without authentication.

## Depends On

- 04-build-opportunity-engine.md
- 06-implement-risk-engine-and-kill-switches.md
- 07-implement-dry-run-execution-engine.md
- 10-implement-position-manager-and-exit-engine.md

## Comments
