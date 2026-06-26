# 02 - Define Exchange Adapter Interface

Status: Done

## Goal

Define the internal `ExchangeAdapter` contract that all exchange integrations must satisfy.

## Scope

- Normalize exchange identifiers, symbols, prices, quantities, fees, balances, positions, order intents, order acknowledgements, and fills.
- Include methods for market data streams, REST snapshots, account reads, IOC limit order placement, cancellation, and order/fill reconciliation.
- Keep raw exchange SDK/API types out of opportunity, risk, and execution engines.

## Acceptance Criteria

- Business logic can compile against adapter interfaces without importing Binance, Bitget, or Hyperliquid SDK types.
- Interface supports dry-run and live implementations.
- Symbol precision and minimum order constraints have normalized representations.

## Depends On

- 01-scaffold-application-and-runtime-config.md

## Comments

