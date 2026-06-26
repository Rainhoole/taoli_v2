import type { ExchangeAdapter, OrderBookLevel, OrderBookSnapshot } from "./adapter";
import type { ExchangeId, MarketSymbol } from "./types";

export type MarketHealthStatus = "fresh" | "stale" | "unhealthy" | "missing";

export interface MarketFreshness {
  ageMs: number | null;
  status: MarketHealthStatus;
}

export interface FreshOrderBookView {
  exchange: ExchangeId;
  symbol: MarketSymbol;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: OrderBookLevel;
  bestAsk: OrderBookLevel;
  receivedAt: Date;
  freshness: { ageMs: number; status: "fresh" };
}

export interface MarketDataServiceOptions {
  adapters: ExchangeAdapter[];
  staleAfterMs: number;
  unhealthyAfterMs: number;
  now?: () => Date;
}

export class MarketDataService {
  private readonly adapters: Map<ExchangeId, ExchangeAdapter>;
  private readonly books = new Map<string, OrderBookSnapshot>();
  private readonly now: () => Date;

  constructor(private readonly options: MarketDataServiceOptions) {
    this.adapters = new Map(options.adapters.map((adapter) => [adapter.id, adapter]));
    this.now = options.now ?? (() => new Date());
  }

  upsertOrderBook(snapshot: OrderBookSnapshot): void {
    this.assertBookHasExecutableSides(snapshot);
    this.books.set(marketKey(snapshot.exchange, snapshot.symbol), snapshot);
  }

  peekFreshOrderBook(exchange: ExchangeId, symbol: MarketSymbol): FreshOrderBookView | null {
    const snapshot = this.books.get(marketKey(exchange, symbol));

    if (!snapshot) {
      return null;
    }

    return this.toFreshView(snapshot);
  }

  async getFreshOrderBook(exchange: ExchangeId, symbol: MarketSymbol): Promise<FreshOrderBookView | null> {
    const cached = this.peekFreshOrderBook(exchange, symbol);

    if (cached) {
      return cached;
    }

    const adapter = this.adapters.get(exchange);

    if (!adapter) {
      return null;
    }

    const snapshot = await adapter.getOrderBookSnapshot(symbol);
    this.upsertOrderBook(snapshot);

    return this.peekFreshOrderBook(exchange, symbol);
  }

  getMarketHealth(exchange: ExchangeId, symbol: MarketSymbol): MarketFreshness {
    const snapshot = this.books.get(marketKey(exchange, symbol));

    if (!snapshot) {
      return { ageMs: null, status: "missing" };
    }

    const ageMs = this.ageMs(snapshot);

    if (ageMs > this.options.unhealthyAfterMs) {
      return { ageMs, status: "unhealthy" };
    }

    if (ageMs > this.options.staleAfterMs) {
      return { ageMs, status: "stale" };
    }

    return { ageMs, status: "fresh" };
  }

  private toFreshView(snapshot: OrderBookSnapshot): FreshOrderBookView | null {
    const health = this.getMarketHealth(snapshot.exchange, snapshot.symbol);

    if (health.status !== "fresh" || health.ageMs === null) {
      return null;
    }

    const bestBid = snapshot.bids[0];
    const bestAsk = snapshot.asks[0];

    if (!bestBid || !bestAsk) {
      return null;
    }

    return {
      ...snapshot,
      bestBid,
      bestAsk,
      freshness: {
        ageMs: health.ageMs,
        status: "fresh",
      },
    };
  }

  private ageMs(snapshot: OrderBookSnapshot): number {
    return Math.max(0, this.now().getTime() - snapshot.receivedAt.getTime());
  }

  private assertBookHasExecutableSides(snapshot: OrderBookSnapshot): void {
    if (snapshot.bids.length === 0 || snapshot.asks.length === 0) {
      throw new Error(`Order book for ${snapshot.exchange}:${snapshot.symbol} must include at least one bid and ask.`);
    }
  }
}

function marketKey(exchange: ExchangeId, symbol: MarketSymbol): string {
  return `${exchange}:${symbol}`;
}
