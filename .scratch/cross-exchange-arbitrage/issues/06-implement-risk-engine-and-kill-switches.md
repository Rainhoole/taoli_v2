# 06 - Implement Risk Engine And Kill Switches

Status: ready-for-agent

## Goal

Add pre-trade and runtime risk checks, including global and per-exchange kill switches.

## Scope

- Check market data freshness, exchange health, kill switch state, exposure limits, margin health, and rescue locks.
- Support global stop, per-exchange stop, and reduce-only mode.
- Trigger automatic stop conditions for rescue cap breach, consecutive API errors, position mismatch, and balance anomalies.

## Acceptance Criteria

- Every execution attempt records pass/fail risk checks.
- New opens are blocked in reduce-only mode, while closes remain allowed.
- Kill switch changes are visible in the dashboard and persisted.

## Depends On

- 05-add-postgres-persistence-and-audit-log.md

## Comments
