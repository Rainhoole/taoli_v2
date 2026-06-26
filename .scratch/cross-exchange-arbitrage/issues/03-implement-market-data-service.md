# 03 - Implement Market Data Service

Status: Done

## Goal

Build market data ingestion for configured exchanges and symbols using WebSocket as the primary source and REST snapshots for initialization and recovery.

## Scope

- Track top-of-book and order book depth for BTC, ETH, and SOL perpetual markets.
- Attach local receive timestamps to updates.
- Mark data stale after 500 ms and unhealthy after 2 seconds.
- Expose normalized fresh order book views to the opportunity engine.

## Acceptance Criteria

- Market data freshness can be displayed per exchange and symbol.
- Stale data is excluded from actionable opportunity calculations.
- Reconnect/recovery behavior requests REST snapshots before resuming calculations.

## Depends On

- 02-define-exchange-adapter-interface.md

## Comments

