# TAOLI — Research References

> Community research compiled 2026-06-27. See full PLAN.md for implementation roadmap.

## Key Sources

### @MrRyanChi — Solana MEV Bot Architecture
- "快还不够" — latency jitter > raw speed. p99 > average.
- Four-layer architecture: gRPC data → Rust detection → Jito Bundle execution → bare-metal infra
- Pre-computation: calculate direction/size/limit before trigger signal
- Multi-connection race: 100-300 parallel WS, drop slowest 10% every 4s
- Articles: learnblockchain.cn/article/20929

### @RohOnChain — Quant Arbitrage + Loop Engineering
- Polymarket arb: Bregman projection + Frank-Wolfe + integer programming
- α-extraction: stop at 90% theoretical profit, don't over-optimize
- Rust execution loop: millisecond-level detect→optimize→check→execute
- Loop Engineering: Automation/Skill/State/Verifier/Worktrees/Connectors
- MIT HFT 78-page system design: dspace.mit.edu (49a425f8...)
- Stanford order book ML: web.stanford.edu/class/msande448/2017/Final/Reports/gr4.pdf

### X/Twitter Practitioners (15+ traders)
- @0x_Punisher: "Data cleanliness > strategy logic." Pre-warm WS 15s, discard first tick.
- @casatrick: Python→Rust 48ms→0.8ms (60x), but Node.js fine for crypto arb windows.
- @Abomination81: 100-300 parallel WS, track jitter EMA, reject stale silently.
- @Mnilax: Calculate in shares first, USD derived. VWAP execution for cost estimation.

### Academic
- MDPI 2025: Cross-exchange spreads <20bps rarely profitable after fees. 20bps floor for institutional.
- Kroer et al. 2016: Arbitrage-free combinatorial market making via integer programming.

### Open Source
- Hummingbot (19K⭐): spot_perpetual_arbitrage.py, v2_funding_rate_arb.py
- CCXT (43K⭐): Unified 100+ exchange API with watchOrderBook
- R2 Bitcoin Arbitrager: TypeScript arb structure reference
- tiagosiebler/orderbooks: Order book delta processing utility
