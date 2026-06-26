# 10 - Implement Position Manager And Exit Engine

Status: ready-for-agent

## Goal

Track arbitrage positions across exchanges and support multi-rule close logic.

## Scope

- Link long and short legs into portfolio-level arbitrage positions.
- Track realized PnL, unrealized PnL, funding, fees, and margin health.
- Reconcile local state against exchange-reported positions.
- Support exit triggers for spread convergence, funding window completion, maximum holding time, stop loss, margin warning, and manual close.

## Acceptance Criteria

- Open positions are visible with both exchange legs and portfolio-level metrics.
- Position mismatch creates a risk event.
- Close candidates include an explainable trigger reason.

## Depends On

- 05-add-postgres-persistence-and-audit-log.md
- 06-implement-risk-engine-and-kill-switches.md
- 07-implement-dry-run-execution-engine.md

## Comments
