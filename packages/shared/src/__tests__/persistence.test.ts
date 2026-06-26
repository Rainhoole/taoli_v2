import { describe, expect, it } from "vitest";
import type { IocOrderIntent, OrderFill } from "../adapter";
import type { ArbitrageOpportunity } from "../opportunity";
import { InMemoryAuditRepository } from "../persistence";

const opportunity: ArbitrageOpportunity = {
  symbol: "BTC",
  longExchange: "binance",
  shortExchange: "bitget",
  notionalUsd: 1_000,
  entry: { longPrice: 100.1, shortPrice: 101 },
  costs: { feeBps: 5, slippageBufferBps: 1 },
  fundingBps: 4,
  grossSpreadBps: 89.51,
  netReturnBps: 87.51,
};

const orderIntent: IocOrderIntent = {
  clientOrderId: "open-btc-1-long",
  exchange: "binance",
  symbol: "BTC",
  side: "buy",
  positionSide: "long",
  orderType: "ioc-limit",
  quantity: 0.01,
  limitPrice: 100.1,
  reduceOnly: false,
};

const fill: OrderFill = {
  exchange: "binance",
  exchangeOrderId: "ex-order-1",
  fillId: "fill-1",
  symbol: "BTC",
  side: "buy",
  price: 100.1,
  quantity: 0.01,
  feeAsset: "USDT",
  feeAmount: 0.01,
  liquidity: "taker",
  filledAt: new Date("2026-01-01T00:00:03.000Z"),
};

describe("InMemoryAuditRepository", () => {
  it("links opportunity snapshots, order intents, fills, and user actions by correlation id", async () => {
    const repository = new InMemoryAuditRepository(() => new Date("2026-01-01T00:00:00.000Z"));

    await repository.recordOpportunitySnapshot({
      id: "opp-1",
      correlationId: "cycle-1",
      resultStatus: "actionable",
      opportunity,
    });
    await repository.recordUserAction({
      id: "action-1",
      correlationId: "cycle-1",
      actor: "rain",
      action: "confirm-open",
      metadata: { secondConfirmation: true },
    });
    await repository.recordOrderIntent({
      id: "intent-1",
      correlationId: "cycle-1",
      intent: orderIntent,
    });
    await repository.recordFill({
      id: "fill-record-1",
      correlationId: "cycle-1",
      orderIntentId: "intent-1",
      fill,
    });

    const timeline = await repository.getAuditTimeline("cycle-1");

    expect(timeline.map((event) => event.type)).toEqual([
      "opportunity_snapshot",
      "user_action",
      "order_intent",
      "fill",
    ]);
    expect(timeline[0]?.occurredAt).toEqual(new Date("2026-01-01T00:00:00.000Z"));
    expect(timeline[3]).toMatchObject({ orderIntentId: "intent-1" });
  });

  it("records rejected opportunity reasons for later reconstruction", async () => {
    const repository = new InMemoryAuditRepository(() => new Date("2026-01-01T00:00:00.000Z"));

    await repository.recordOpportunitySnapshot({
      id: "opp-2",
      correlationId: "cycle-2",
      resultStatus: "rejected",
      rejectionReason: "missing_or_stale_market_data",
      rejectionDetails: {
        longCandidate: { status: "stale", ageMs: 501 },
        shortCandidate: { status: "missing", ageMs: null },
      },
    });

    const timeline = await repository.getAuditTimeline("cycle-2");

    expect(timeline[0]).toMatchObject({
      type: "opportunity_snapshot",
      resultStatus: "rejected",
      rejectionReason: "missing_or_stale_market_data",
    });
  });
});
