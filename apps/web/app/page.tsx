import { DEFAULT_RUNTIME_CONFIG } from "@arb/shared";
import "./styles.css";

export default function DashboardHome() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Dry-run first</p>
        <h1>Cross-Exchange Perpetual Arbitrage</h1>
        <p>
          Monitor Binance, Bitget, and Hyperliquid perpetual markets before enabling one-click IOC execution.
        </p>
      </section>

      <section className="grid" aria-label="Runtime defaults">
        <Metric label="Mode" value={DEFAULT_RUNTIME_CONFIG.mode} />
        <Metric label="Symbols" value={DEFAULT_RUNTIME_CONFIG.symbols.join(" / ")} />
        <Metric label="Min net return" value={`${DEFAULT_RUNTIME_CONFIG.minimumNetReturnBps} bps`} />
        <Metric label="Stale quote" value={`${DEFAULT_RUNTIME_CONFIG.marketDataStaleMs} ms`} />
        <Metric label="Unhealthy feed" value={`${DEFAULT_RUNTIME_CONFIG.marketDataUnhealthyMs} ms`} />
        <Metric label="Rescue cap" value={`${DEFAULT_RUNTIME_CONFIG.rescueCostCapBps} bps`} />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
