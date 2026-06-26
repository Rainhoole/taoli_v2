import { describe, expect, it } from "vitest";
import { DEFAULT_RUNTIME_CONFIG, loadRuntimeConfig } from "../config";

describe("runtime config", () => {
  it("defaults to the phase-one exchanges, symbols, and safety thresholds", () => {
    expect(DEFAULT_RUNTIME_CONFIG.exchanges).toEqual(["binance", "bitget", "hyperliquid"]);
    expect(DEFAULT_RUNTIME_CONFIG.symbols).toEqual(["BTC", "ETH", "SOL"]);
    expect(DEFAULT_RUNTIME_CONFIG.minimumNetReturnBps).toBe(10);
    expect(DEFAULT_RUNTIME_CONFIG.marketDataStaleMs).toBe(500);
    expect(DEFAULT_RUNTIME_CONFIG.marketDataUnhealthyMs).toBe(2_000);
    expect(DEFAULT_RUNTIME_CONFIG.rescueCostCapBps).toBe(10);
    expect(DEFAULT_RUNTIME_CONFIG.mode).toBe("dry-run");
  });

  it("keeps credential values as environment variable references", () => {
    const config = loadRuntimeConfig({
      BINANCE_API_KEY_ENV: "BINANCE_KEY",
      BINANCE_API_SECRET_ENV: "BINANCE_SECRET",
    });

    expect(config.credentials.binance).toEqual({
      apiKeyEnv: "BINANCE_KEY",
      apiSecretEnv: "BINANCE_SECRET",
    });
  });
});
