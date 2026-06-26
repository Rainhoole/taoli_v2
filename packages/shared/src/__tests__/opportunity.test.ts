import { describe, expect, it } from "vitest";
import { MarketDataService } from "../market-data";
import { OpportunityEngine } from "../opportunity";

function marketData(nowMs: number) {
  return new MarketDataService({
    adapters: [],
    staleAfterMs: 500,
    unhealthyAfterMs: 2_000,
    now: () => new Date(nowMs),
  });
}

describe("OpportunityEngine", () => {
  it("calculates actionable executable spread opportunities after fees, funding, and slippage", () => {
    const data = marketData(1_100);
    data.upsertOrderBook({
      exchange: "binance",
      symbol: "BTC",
      bids: [{ price: 100, quantity: 2 }],
      asks: [{ price: 100.1, quantity: 2 }],
      receivedAt: new Date(1_000),
    });
    data.upsertOrderBook({
      exchange: "bitget",
      symbol: "BTC",
      bids: [{ price: 101, quantity: 2 }],
      asks: [{ price: 101.2, quantity: 2 }],
      receivedAt: new Date(1_000),
    });

    const engine = new OpportunityEngine(data, {
      notionalUsd: 1_000,
      minimumNetReturnBps: 10,
      takerFeeBpsByExchange: { binance: 2, bitget: 3, hyperliquid: 2.5 },
      slippageBufferBps: 1,
      fundingBpsByExchange: { binance: 0, bitget: 4, hyperliquid: 0 },
    });

    const result = engine.evaluatePair("BTC", "binance", "bitget");

    if (result.status !== "actionable") {
      throw new Error(`Expected actionable opportunity, got ${result.status}`);
    }

    expect(result.opportunity.longExchange).toBe("binance");
    expect(result.opportunity.shortExchange).toBe("bitget");
    expect(result.opportunity.entry.longPrice).toBe(100.1);
    expect(result.opportunity.entry.shortPrice).toBe(101);
    expect(result.opportunity.costs.feeBps).toBe(5);
    expect(result.opportunity.costs.slippageBufferBps).toBe(1);
    expect(result.opportunity.fundingBps).toBe(4);
    expect(result.opportunity.netReturnBps).toBeCloseTo(87.51, 1);
  });

  it("rejects opportunities when either side has stale market data", () => {
    const data = marketData(1_501);
    data.upsertOrderBook({
      exchange: "binance",
      symbol: "ETH",
      bids: [{ price: 2_000, quantity: 1 }],
      asks: [{ price: 2_001, quantity: 1 }],
      receivedAt: new Date(1_000),
    });

    const engine = new OpportunityEngine(data, {
      notionalUsd: 1_000,
      minimumNetReturnBps: 10,
      takerFeeBpsByExchange: { binance: 2, bitget: 3, hyperliquid: 2.5 },
      slippageBufferBps: 1,
      fundingBpsByExchange: { binance: 0, bitget: 0, hyperliquid: 0 },
    });

    const result = engine.evaluatePair("ETH", "binance", "bitget");

    expect(result).toEqual({
      status: "rejected",
      reason: "missing_or_stale_market_data",
      details: {
        longCandidate: { ageMs: 501, status: "stale" },
        shortCandidate: { ageMs: null, status: "missing" },
      },
    });
  });
});


