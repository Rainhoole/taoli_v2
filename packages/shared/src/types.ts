export type ExchangeId = "binance" | "bitget" | "hyperliquid";

export type MarketSymbol = "BTC" | "ETH" | "SOL";

export type RuntimeMode = "dry-run" | "live-small";

export interface ExchangeCredentialsRef {
  apiKeyEnv: string;
  apiSecretEnv: string;
}

export type CredentialsByExchange = Partial<Record<ExchangeId, ExchangeCredentialsRef>>;

export interface RuntimeConfig {
  exchanges: ExchangeId[];
  symbols: MarketSymbol[];
  mode: RuntimeMode;
  minimumNetReturnBps: number;
  marketDataStaleMs: number;
  marketDataUnhealthyMs: number;
  rescueCostCapBps: number;
  defaultNotionalUsd: number;
  credentials: CredentialsByExchange;
}

export interface NormalizedMarket {
  exchange: ExchangeId;
  symbol: MarketSymbol;
  quoteAsset: "USDT" | "USDC";
  instrumentType: "linear-perpetual";
}

export interface OpportunityThresholds {
  minimumNetReturnBps: number;
  marketDataStaleMs: number;
  marketDataUnhealthyMs: number;
  rescueCostCapBps: number;
}
