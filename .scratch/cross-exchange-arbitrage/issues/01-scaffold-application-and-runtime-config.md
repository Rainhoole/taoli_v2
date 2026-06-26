# 01 - Scaffold Application And Runtime Config

Status: Done

## Goal

Create the initial TypeScript application structure for the arbitrage system, including backend service, dashboard app, shared types, and configuration loading.

## Scope

- Set up a Next.js dashboard and Node.js backend service shape.
- Add shared package/module for normalized exchange, market, opportunity, order, and position types.
- Add runtime configuration for enabled exchanges, symbols, thresholds, notional sizing, and mode.
- Add environment variable handling for secrets without committing credentials.

## Acceptance Criteria

- The project can run a backend dev process and dashboard dev process.
- Config includes BTC, ETH, and SOL perpetual markets.
- Defaults include 10 bps minimum net return, 500 ms stale threshold, 2s unhealthy threshold, and 10 bps rescue cap.
- Secrets are referenced by environment variable names, not stored in source.

## Depends On

- PRD.md
- ARCHITECTURE.md

## Comments

