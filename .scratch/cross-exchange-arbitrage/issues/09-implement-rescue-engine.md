# 09 - Implement Rescue Engine

Status: ready-for-agent

## Goal

Automatically handle one-sided or partial exposure after failed paired execution.

## Scope

- Detect residual exposure after order reconciliation.
- Freeze unrelated new opens while rescue is active.
- Hedge or close residual exposure if estimated cost is within 10 bps.
- Stop retries, activate reduce-only mode, and emit high-priority risk event if estimated rescue cost exceeds 10 bps.
- Persist all rescue decisions and actions.

## Acceptance Criteria

- Residual exposure cannot be ignored silently.
- Rescue attempts are bounded by the configured 10 bps cap.
- Breaching the cap locks new trading and requires manual intervention.

## Depends On

- 06-implement-risk-engine-and-kill-switches.md
- 07-implement-dry-run-execution-engine.md

## Comments
