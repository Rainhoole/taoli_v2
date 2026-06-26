import type { ExchangeId, MarketSymbol, NormalizedMarket } from "./types";

export type AdapterMode = "dry-run" | "live";

export interface TradableMarket extends NormalizedMarket {
  pricePrecision: number;
  quantityPrecision: number;
  minimumQuantity: number;
  minimumNotionalUsd: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBookSnapshot {
  exchange: ExchangeId;
  symbol: MarketSymbol;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  receivedAt: Date;
}

export interface AssetBalance {
  asset: string;
  available: number;
  total: number;
}

export type PositionSide = "long" | "short";

export interface PerpetualPosition {
  exchange: ExchangeId;
  symbol: MarketSymbol;
  side: PositionSide;
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnlUsd: number;
  liquidationPrice?: number;
  marginRatio?: number;
}

export type OrderSide = "buy" | "sell";

export interface IocOrderIntent {
  clientOrderId: string;
  exchange: ExchangeId;
  symbol: MarketSymbol;
  side: OrderSide;
  positionSide: PositionSide;
  orderType: "ioc-limit";
  quantity: number;
  limitPrice: number;
  reduceOnly: boolean;
}

export type ExchangeOrderStatus = "accepted" | "partially-filled" | "filled" | "canceled" | "rejected";

export interface ExchangeOrderAck {
  exchange: ExchangeId;
  exchangeOrderId: string;
  clientOrderId: string;
  status: ExchangeOrderStatus;
  submittedAt: Date;
  rejectionReason?: string;
}

export interface CancelOrderResult {
  canceled: boolean;
  reason?: string;
}

export interface OrderFill {
  exchange: ExchangeId;
  exchangeOrderId: string;
  fillId: string;
  symbol: MarketSymbol;
  side: OrderSide;
  price: number;
  quantity: number;
  feeAsset: string;
  feeAmount: number;
  liquidity: "maker" | "taker";
  filledAt: Date;
}

export interface ExchangeAdapter {
  readonly id: ExchangeId;
  readonly mode: AdapterMode;

  listMarkets(): Promise<TradableMarket[]>;
  getOrderBookSnapshot(symbol: MarketSymbol): Promise<OrderBookSnapshot>;
  getBalances(): Promise<AssetBalance[]>;
  getPositions(): Promise<PerpetualPosition[]>;
  placeIocOrder(order: IocOrderIntent): Promise<ExchangeOrderAck>;
  cancelOrder(exchangeOrderId: string, symbol: MarketSymbol): Promise<CancelOrderResult>;
  getOrderFills(exchangeOrderId: string, symbol: MarketSymbol): Promise<OrderFill[]>;
}
