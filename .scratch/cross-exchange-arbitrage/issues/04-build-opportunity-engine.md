# 04 - Build Opportunity Engine

Status: Done

## Goal

Calculate cross-exchange perpetual arbitrage opportunities from executable order book prices, funding impact, fees, and slippage buffers.

## Scope

- Evaluate long-on-exchange-A / short-on-exchange-B directions for configured pairs.
- Estimate executable prices for fixed notional sizes.
- Include taker fees, slippage buffer, and funding rate differential.
- Produce net expected return in bps and currency terms.
- Mark opportunities actionable only above 10 bps expected net return.

## Acceptance Criteria

- Opportunities include direction, exchanges, symbol, notional, estimated entry prices, fee estimate, funding estimate, slippage buffer, and net bps.
- Opportunities based on stale data are rejected with an explainable reason.
- Opportunity snapshots can be persisted.

## Depends On

- 03-implement-market-data-service.md

## Comments

