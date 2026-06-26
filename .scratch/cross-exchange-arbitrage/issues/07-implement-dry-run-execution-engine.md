# 07 - Implement Dry-Run Execution Engine

Status: ready-for-agent

## Goal

Implement dry-run execution that simulates paired IOC orders using real market data and configured risk rules.

## Scope

- Accept a confirmed opportunity from the dashboard or test harness.
- Re-price using the latest fresh order books.
- Run risk checks before simulation.
- Simulate fills, partial fills, fees, and position creation.
- Persist simulated order intents, fills, and position state.

## Acceptance Criteria

- Dry-run mode can simulate open and close flows end-to-end.
- Simulated execution uses the same normalized order intent model as live execution.
- Dry-run results are clearly labeled and cannot be confused with live fills.

## Depends On

- 04-build-opportunity-engine.md
- 05-add-postgres-persistence-and-audit-log.md
- 06-implement-risk-engine-and-kill-switches.md

## Comments
