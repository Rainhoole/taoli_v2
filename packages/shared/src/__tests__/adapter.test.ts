import { describe, expect, it } from "vitest";
import type { ExchangeAdapter, IocOrderIntent, OrderBookSnapshot } from "../adapter";

const snapshot: OrderBookSnapshot = {
  exchange: "binance",
  symbol: "BTC",
  bids: [{ price: 100, quantity: 2 }],
  asks: [{ price: 101, quantity: 1.5 }],
  receivedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const intent: IocOrderIntent = {
  clientOrderId: "test-order-1",
  exchange: "binance",
  symbol: "BTC",
  side: "buy",
  positionSide: "long",
  orderType: "ioc-limit",
  quantity: 0.01,
  limitPrice: 101,
  reduceOnly: false,
};

class DryRunAdapter implements ExchangeAdapter {
  readonly id = "binance" as const;
  readonly mode = "dry-run" as const;

  async listMarkets() {
    return [
      {
        exchange: this.id,
        symbol: "BTC" as const,
        quoteAsset: "USDT" as const,
        instrumentType: "linear-perpetual" as const,
        pricePrecision: 2,
        quantityPrecision: 3,
        minimumQuantity: 0.001,
        minimumNotionalUsd: 5,
      },
    ];
  }

  async getOrderBookSnapshot() {
    return snapshot;
  }

  async getBalances() {
    return [{ asset: "USDT", available: 1_000, total: 1_000 }];
  }

  async getPositions() {
    return [];
  }

  async placeIocOrder(order: IocOrderIntent) {
    return {
      exchange: order.exchange,
      exchangeOrderId: "dry-run-order-1",
      clientOrderId: order.clientOrderId,
      status: "filled" as const,
      submittedAt: new Date("2026-01-01T00:00:01.000Z"),
    };
  }

  async cancelOrder() {
    return { canceled: true };
  }

  async getOrderFills() {
    return [
      {
        exchange: "binance" as const,
        exchangeOrderId: "dry-run-order-1",
        fillId: "fill-1",
        symbol: "BTC" as const,
        side: "buy" as const,
        price: 101,
        quantity: 0.01,
        feeAsset: "USDT",
        feeAmount: 0.01,
        liquidity: "taker" as const,
        filledAt: new Date("2026-01-01T00:00:02.000Z"),
      },
    ];
  }
}

describe("ExchangeAdapter", () => {
  it("supports dry-run adapters through normalized market, order, and fill types", async () => {
    const adapter: ExchangeAdapter = new DryRunAdapter();
    const markets = await adapter.listMarkets();
    const orderBook = await adapter.getOrderBookSnapshot("BTC");
    const ack = await adapter.placeIocOrder(intent);
    const fills = await adapter.getOrderFills(ack.exchangeOrderId, "BTC");

    expect(markets[0]?.minimumNotionalUsd).toBe(5);
    expect(orderBook.asks[0]?.price).toBe(101);
    expect(ack.status).toBe("filled");
    expect(fills[0]?.liquidity).toBe("taker");
  });
});
