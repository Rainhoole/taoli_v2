import type { CredentialsByExchange, ExchangeCredentialsRef, ExchangeId, RuntimeConfig } from "./types";

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  exchanges: ["binance", "bitget", "hyperliquid"],
  symbols: ["BTC", "ETH", "SOL"],
  mode: "dry-run",
  minimumNetReturnBps: 10,
  marketDataStaleMs: 500,
  marketDataUnhealthyMs: 2_000,
  rescueCostCapBps: 10,
  defaultNotionalUsd: 100,
  credentials: {},
};

type Env = Record<string, string | undefined>;

const CREDENTIAL_ENV_KEYS: Record<ExchangeId, { apiKey: string; apiSecret: string }> = {
  binance: {
    apiKey: "BINANCE_API_KEY_ENV",
    apiSecret: "BINANCE_API_SECRET_ENV",
  },
  bitget: {
    apiKey: "BITGET_API_KEY_ENV",
    apiSecret: "BITGET_API_SECRET_ENV",
  },
  hyperliquid: {
    apiKey: "HYPERLIQUID_API_KEY_ENV",
    apiSecret: "HYPERLIQUID_API_SECRET_ENV",
  },
};

export function loadRuntimeConfig(env: Env = process.env): RuntimeConfig {
  return {
    ...DEFAULT_RUNTIME_CONFIG,
    credentials: loadCredentials(env),
  };
}

function loadCredentials(env: Env): CredentialsByExchange {
  return DEFAULT_RUNTIME_CONFIG.exchanges.reduce<CredentialsByExchange>((credentials, exchange) => {
    const refs = credentialRefsFor(exchange, env);

    if (refs) {
      credentials[exchange] = refs;
    }

    return credentials;
  }, {});
}

function credentialRefsFor(exchange: ExchangeId, env: Env): ExchangeCredentialsRef | undefined {
  const keys = CREDENTIAL_ENV_KEYS[exchange];
  const apiKeyEnv = env[keys.apiKey];
  const apiSecretEnv = env[keys.apiSecret];

  if (!apiKeyEnv && !apiSecretEnv) {
    return undefined;
  }

  if (!apiKeyEnv || !apiSecretEnv) {
    throw new Error(`Both ${keys.apiKey} and ${keys.apiSecret} must be set for ${exchange} credentials.`);
  }

  return { apiKeyEnv, apiSecretEnv };
}
