# 05 - Add Postgres Persistence And Audit Log

Status: ready-for-agent

## Goal

Persist opportunities, orders, fills, positions, risk events, rescue actions, and user actions in Postgres.

## Scope

- Define schema for append-friendly audit records and current state projections.
- Persist opportunity snapshots and rejection reasons.
- Persist dry-run and live order intents consistently.
- Persist user confirmations and kill switch events.

## Acceptance Criteria

- The system can reconstruct why an opportunity was or was not executed.
- Order intents, exchange orders, fills, and rescue actions are linked by IDs.
- User actions are timestamped and auditable.

## Depends On

- 01-scaffold-application-and-runtime-config.md
- 04-build-opportunity-engine.md

## Comments
