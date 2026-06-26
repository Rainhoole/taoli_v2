# 08 - Implement Live IOC Paired Execution

Status: needs-triage

## Goal

Add live one-click paired execution using IOC limit orders after dry-run behavior is validated.

## Scope

- Submit both legs as IOC limit orders through exchange adapters.
- Derive limit prices from executable order book depth and max slippage.
- Reconcile acknowledgements, fills, partial fills, and failures.
- Persist all live order and fill events.

## Acceptance Criteria

- Live execution requires explicit second confirmation from the dashboard.
- Both legs use IOC limit orders, not naked market orders.
- Partial fills enter rescue flow instead of silently leaving residual exposure.

## Depends On

- 07-implement-dry-run-execution-engine.md
- 09-implement-rescue-engine.md

## Comments
