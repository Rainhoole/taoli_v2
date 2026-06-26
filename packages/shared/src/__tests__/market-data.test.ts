import { describe, expect, it } from "vitest";
import type { ExchangeAdapter, IocOrderIntent, OrderBookSnapshot } from "../adapter";
import { DEFAULT_RUNTIME_CONFIG } from "../config";
import { MarketDataService } from "../market-data";

class SnapshotAdapter implements ExchangeAdapter {
  readonly id = "binance" as const;
  readonly mode = "dry-run" as const;
  public snapshotRequests = 0;

  constructor(private readonly snapshot: OrderBookSnapshot) {}

  async listMarkets() {
    return [];
  }

  async getOrderBookSnapshot() {
    this.snapshotRequests += 1;
    return this.snapshot;
  }

  async getBalances() {
    return [];
  }

  async getPositions() {
    return [];
  }

  async placeIocOrder(order: IocOrderIntent) {
    return {
      exchange: order.exchange,
      exchangeOrderId: "unused",
      clientOrderId: order.clientOrderId,
      status: "accepted" as const,
      submittedAt: new Date(0),
    };
  }

  async cancelOrder() {
    return { canceled: true };
  }

  async getOrderFills() {
    return [];
  }
}

const baseSnapshot: OrderBookSnapshot = {
  exchange: "binance",
  symbol: "BTC",
  bids: [{ price: 100, quantity: 1 }],
  asks: [{ price: 101, quantity: 1 }],
  receivedAt: new Date(1_000),
};

describe("MarketDataService", () => {
  it("uses adapter snapshots when no local book is available", async () => {
    const adapter = new SnapshotAdapter(baseSnapshot);
    const service = new MarketDataService({
      adapters: [adapter],
      staleAfterMs: DEFAULT_RUNTIME_CONFIG.marketDataStaleMs,
      unhealthyAfterMs: DEFAULT_RUNTIME_CONFIG.marketDataUnhealthyMs,
      now: () => new Date(1_100),
    });

    const book = await service.getFreshOrderBook("binance", "BTC");

    expect(adapter.snapshotRequests).toBe(1);
    expect(book?.bestBid.price).toBe(100);
    expect(book?.bestAsk.price).toBe(101);
    expect(book?.freshness).toEqual({ ageMs: 100, status: "fresh" });
  });

  it("excludes stale books from actionable fresh reads", () => {
    const service = new MarketDataService({
      adapters: [],
      staleAfterMs: 500,
      unhealthyAfterMs: 2_000,
      now: () => new Date(1_501),
    });

    service.upsertOrderBook(baseSnapshot);

    expect(service.getMarketHealth("binance", "BTC")).toEqual({ ageMs: 501, status: "stale" });
    expect(service.peekFreshOrderBook("binance", "BTC")).toBeNull();
  });

  it("marks books unhealthy after the unhealthy threshold", () => {
    const service = new MarketDataService({
      adapters: [],
      staleAfterMs: 500,
      unhealthyAfterMs: 2_000,
      now: () => new Date(3_001),
    });

    service.upsertOrderBook(baseSnapshot);

    expect(service.getMarketHealth("binance", "BTC")).toEqual({ ageMs: 2_001, status: "unhealthy" });
  });
});

