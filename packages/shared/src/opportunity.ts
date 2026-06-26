import type { ExchangeId, MarketSymbol } from "./types";
import type { MarketDataService, MarketFreshness } from "./market-data";

export interface OpportunityEngineConfig {
  notionalUsd: number;
  minimumNetReturnBps: number;
  takerFeeBpsByExchange: Record<ExchangeId, number>;
  slippageBufferBps: number;
  fundingBpsByExchange: Record<ExchangeId, number>;
}

export interface ArbitrageOpportunity {
  symbol: MarketSymbol;
  longExchange: ExchangeId;
  shortExchange: ExchangeId;
  notionalUsd: number;
  entry: {
    longPrice: number;
    shortPrice: number;
  };
  costs: {
    feeBps: number;
    slippageBufferBps: number;
  };
  fundingBps: number;
  grossSpreadBps: number;
  netReturnBps: number;
}

export type OpportunityResult =
  | { status: "actionable"; opportunity: ArbitrageOpportunity }
  | { status: "below_threshold"; opportunity: ArbitrageOpportunity }
  | {
      status: "rejected";
      reason: "missing_or_stale_market_data";
      details: {
        longCandidate: MarketFreshness;
        shortCandidate: MarketFreshness;
      };
    };

export class OpportunityEngine {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly config: OpportunityEngineConfig,
  ) {}

  evaluatePair(symbol: MarketSymbol, exchangeA: ExchangeId, exchangeB: ExchangeId): OpportunityResult {
    const firstDirection = this.evaluateDirection(symbol, exchangeA, exchangeB);
    const secondDirection = this.evaluateDirection(symbol, exchangeB, exchangeA);

    if (firstDirection.status === "rejected") {
      return firstDirection;
    }

    if (secondDirection.status === "rejected") {
      return secondDirection;
    }

    const best = firstDirection.opportunity.netReturnBps >= secondDirection.opportunity.netReturnBps
      ? firstDirection.opportunity
      : secondDirection.opportunity;

    return best.netReturnBps >= this.config.minimumNetReturnBps
      ? { status: "actionable", opportunity: best }
      : { status: "below_threshold", opportunity: best };
  }

  private evaluateDirection(symbol: MarketSymbol, longExchange: ExchangeId, shortExchange: ExchangeId): OpportunityResult {
    const longBook = this.marketData.peekFreshOrderBook(longExchange, symbol);
    const shortBook = this.marketData.peekFreshOrderBook(shortExchange, symbol);

    if (!longBook || !shortBook) {
      return {
        status: "rejected",
        reason: "missing_or_stale_market_data",
        details: {
          longCandidate: this.marketData.getMarketHealth(longExchange, symbol),
          shortCandidate: this.marketData.getMarketHealth(shortExchange, symbol),
        },
      };
    }

    const longPrice = longBook.bestAsk.price;
    const shortPrice = shortBook.bestBid.price;
    const midPrice = (longPrice + shortPrice) / 2;
    const grossSpreadBps = ((shortPrice - longPrice) / midPrice) * 10_000;
    const feeBps = this.config.takerFeeBpsByExchange[longExchange] + this.config.takerFeeBpsByExchange[shortExchange];
    const fundingBps = this.config.fundingBpsByExchange[shortExchange] - this.config.fundingBpsByExchange[longExchange];
    const netReturnBps = grossSpreadBps + fundingBps - feeBps - this.config.slippageBufferBps;

    const opportunity: ArbitrageOpportunity = {
      symbol,
      longExchange,
      shortExchange,
      notionalUsd: this.config.notionalUsd,
      entry: {
        longPrice,
        shortPrice,
      },
      costs: {
        feeBps,
        slippageBufferBps: this.config.slippageBufferBps,
      },
      fundingBps,
      grossSpreadBps,
      netReturnBps,
    };

    return netReturnBps >= this.config.minimumNetReturnBps
      ? { status: "actionable", opportunity }
      : { status: "below_threshold", opportunity };
  }
}
