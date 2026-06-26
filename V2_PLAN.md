# TAOLI V2 — 跨场所套利扩展计划

> 基于 7 路并行研究 + 社区实战 + 学术论文 · 2026-06-27

---

## 一、当前 TAOLI 定位 vs 扩展方向

| 维度 | TAOLI V1 (现有) | V2 扩展 |
|------|----------------|---------|
| 场所 | CEX ↔ CEX（Binance/Bitget） | + DEX（Hyperliquid）+ PM（Polymarket） |
| 策略 | 永续合约价差 + 资金费率差 | + 预测市场组合套利 + 跨场所概率套利 |
| 标的 | BTC/ETH/SOL 永续 | + 事件概率代币 + PM 永续 |
| 交易所接口 | ExchangeAdapter（CEX） | 扩展 PolymarketAdapter + HyperliquidAdapter |

---

## 二、三大新策略 → 可行性矩阵

### 策略 1：CEX ↔ Hyperliquid 资金费率套利

| 维度 | 评估 |
|------|------|
| **可行性** | ⭐⭐⭐⭐⭐ **极高** — API 成熟、CCXT 已支持 |
| **利润率** | 年化 5-25%（大币种），20-60%+（长尾） |
| **容量** | 大（Hyperliquid 24h $21.8B 成交量） |
| **延迟要求** | 中等（分钟级费率差，不需要亚秒级） |
| **竞争** | 中等（已有开源 bot 但长尾仍有机会） |
| **核心风险** | 腿风险（0.2s 区块确认 vs CEX 50ms）、桥接风险 |
| **实施难度** | ⭐⭐ **低** — 与现有 CEX Adapter 模式完全一致，仅需 EIP-712 签名替代 API Key |
| **推荐优先级** | 🥇 **P0 — 立即开始，扩展最小** |

**核心差异**: Hyperliquid 每小时结算 vs CEX 8小时结算 → 更频繁的费率差变化 → 更多窗口。

### 策略 2：Polymarket 内部套利（NegRisk + 二元）

| 维度 | 评估 |
|------|------|
| **可行性** | ⭐⭐⭐⭐ **高** — API 完善，官方 TS/Python SDK |
| **利润率** | 小（简单 YES+NO 中位 0.3% 价差），大（NegRisk 多结果） |
| **利润池**| $40M 已被提取（2024.4-2025.4），73% 来自 NegRisk |
| **延迟要求** | 高（简单套利 2.7s 平均窗口，NegRisk <500ms） |
| **竞争** | 高（简单套利已被 HFT bot 挤满），中等（NegRisk） |
| **核心风险** | Oracle 风险、Gas、长时间资金锁仓 |
| **实施难度** | ⭐⭐⭐ **中** — 需要完整的 CLOB Adapter + EIP-712 签名 + Gas 管理 |
| **推荐优先级** | 🥈 **P1 — NegRisk 优先，简单二元跳过** |

**关键洞察**: NegRisk 贡献 73% 利润但只占 8.6% 机会量 → 竞争远低于简单二元套利。且资本效率高 29 倍。

### 策略 3：Polymarket ↔ CEX 跨场所套利

| 维度 | 评估 |
|------|------|
| **可行性** | ⭐⭐⭐ **中高** — 理论成熟，实证验证 |
| **利润率** | 中（Portnaya 2026 论文：PM-Binance 期权平均 5.6pp 概率差） |
| **策略 A** | Binance→PM 延迟套利：5-min BTC 合约，30-90s 窗口。已被验证（stargate5: $168K，61.5% 胜率，16K 笔） |
| **策略 B** | PM 事件永续 vs CEX 永续：2026年5月 PM 推出事件概率 Perp，开创新套利维度 |
| **策略 C** | PM-期权 Delta 对冲套利：卖高估 PM YES + 买 CEX 期权，学术验证有正收益 |
| **延迟要求** | 策略 A: <200ms。策略 B/C: 分钟级 |
| **核心风险** | Oracle 分歧（不同平台不同结算标准）、基差风险（到期日错配） |
| **实施难度** | ⭐⭐⭐⭐ **高** — 需要期权定价引擎 + Delta 对冲 + 双场所调度 |
| **推荐优先级** | 🥉 **P2 — Phase 1 先做延迟套利（策略 A），Phase 2 探索期权套利** |

**最大发现**: Polymarket 2026年5月推出**事件概率永续合约**（以预测市场概率为标的的 perp）。这直接打通了 PM↔CEX perp 的跨所套利——不需期权转换，直接比较两个 perp 的资金费率/价格。

---

## 三、扩展后的 TAOLI 架构

```
                        ┌─────────────────────────┐
                        │    TAOLI Dashboard       │
                        │  (Next.js — 统一视图)     │
                        └───────────┬─────────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               ▼                    ▼                    ▼
     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
     │  Opportunity     │  │  Risk Engine     │  │  Execution       │
     │  Engine          │  │  (跨策略风控)     │  │  Engine          │
     │                  │  │                  │  │  (IOC/FAK/FOK)   │
     │ CEX价差 + HL费率 │  │ 熔断/只减仓/救援  │  │                  │
     │ + PM二元+NegRisk │  │                  │  │                  │
     └────────┬─────────┘  └─────────────────┘  └────────┬─────────┘
              │                                          │
     ┌────────┼──────────────────────────────────────────┼────────┐
     │        ▼              Adapter Layer               ▼        │
     │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐ │
     │  │ Binance  │ │ Bitget   │ │ Hyperliquid  │ │PolyMarket│ │
     │  │ CCXT/WS  │ │ CCXT/WS  │ │ EIP-712/WS   │ │CLOB V2   │ │
     │  └──────────┘ └──────────┘ └──────────────┘ └──────────┘ │
     └──────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │   Postgres + Redis     │
                        │   审计 + 热状态缓存      │
                        └───────────────────────┘
```

---

## 四、分阶段实施路线

### Phase 1A：Hyperliquid 集成（2-3 周）

```
目标：HL 资金费率套利上线 dry-run

Week 1:
├── HyperliquidAdapter 实现 ExchangeAdapter 接口
│   ├── /info 行情/费率/持仓
│   ├── /exchange IOC 下单（EIP-712 签名）
│   └── WebSocket (l2Book + allMids)
├── 资金费率差检测器（处理 1h vs 8h 结算）
├── API Wallet 模式（Agent 钱包，非主钱包）
└── 单元测试

Week 2:
├── 双边下单执行器 + 超时回滚（10s）
├── 腿风险处理（部分成交检测 + 自动取消）
├── 桥接资金管理
└── 集成测试

Week 3:
├── Dry-run 14 天
├── 费率差监控 Dashboard
└── 上线检查清单
```

### Phase 1B：Polymarket Adapter（2-3 周）

```
目标：二元套利 + NegRisk 扫描

Week 1:
├── PolymarketAdapter 映射到 ExchangeAdapter
│   ├── symbol → condition_id + token_id
│   ├── side → YES/NO buy
│   └── CLOB API + Gamma API + WebSocket
├── EIP-712 签名 + L2 认证
└── 单元测试

Week 2:
├── NegRisk 扫描器（优先！资本效率 29x）
├── 二元套利扫描器（YES_ask + NO_ask < $1）
├── 手续费/Gas 成本计算器
└── FOK 批量下单

Week 3:
├── Dry-run 14 天
├── 自动结算（市场到期后 claim）
└── 上线检查清单
```

### Phase 2：跨场所 PM↔CEX 延迟套利（3-4 周）

```
目标：5-min BTC 方向市场延迟套利

Week 1-2:
├── Binance WS aggTrade + PM CLOB WS 双流
├── Chainlink oracle 价格追踪（window-open 价格神圣不可变）
├── 动量检测器（>0.3% in 60s）
└── 概率模型（sigmoid + 距离开口价格）

Week 3-4:
├── PM CLOB 下单（FAK + 250ms taker delay 处理）
├── 对冲逻辑（UP + DOWN = $1 二元对冲）
├── Paper → Shadow → Small Live
└── 上线
```

### Phase 3：高阶策略（持续探索）

```
├── PM 事件概率 Perp vs CEX Perp 资金费率套利（2026 新产品）
├── PM vs CEX 期权 Delta 对冲套利（需期权定价引擎）
├── CEX↔HL 长尾币种费率套利（20-60%+ 年化）
└── HyperEVM ↔ HyperCore 原子套利
```

---

## 五、技术选型更新

| 组件 | V1 方案 | V2 新增 |
|------|---------|---------|
| Hyperliquid | — | `ccxt` (统一接口) 或官方 `hyperliquid-python-sdk` |
| Polymarket | — | `@polymarket/clob-client-v2` (TS) 或 `py-clob-client` |
| CLOB 订单签名 | — | EIP-712 + HMAC L2 认证 |
| Gas 管理 | — | Polygon MATIC gas fee 计算 |
| 延迟套利 | — | 阿姆斯特丹/都柏林 VPS（<5ms 到 PM CLOB） |

---

## 六、风险总表

| 风险 | 影响策略 | 严重性 | 缓解 |
|------|---------|--------|------|
| **腿风险** (HL 0.2s 确认) | 策略 1 | 高 | 超时 10s + 自动取消 + 安全模式 |
| **Oracle 分歧** (UMA vs CFTC vs Chainlink) | 策略 2/3 | 高 | 选择同 Oracle 的标的对 |
| **桥接风险** (HL Arbitrum bridge) | 策略 1 | 高 | 不在 HL 存放超额资金（<2x 保证金） |
| **Gas 波动** (Polygon 拥堵) | 策略 2 | 中 | 预留 MATIC 余额 + gas 上限 |
| **taker delay** (250ms PM) | 策略 3A | 中 | 计入延迟模型 |
| **资金费率反转** | 策略 1/3B | 中 | 持续监控 + 止损退出 |
| **监管** (CFTC DCM 合规) | 策略 2/3 | 中 | 仅使用非美国 PM International |
| **竞争恶化** | 策略 2A | 高 | 优先 NegRisk + 长尾，不碰简单二元 |

---

## 七、立即可行动项

| # | 行动 | 优先级 |
|---|------|--------|
| 1 | Hyperliquid API Wallet 创建 | P0 |
| 2 | `HyperliquidAdapter` 骨架 + 单元测试 | P0 |
| 3 | Polymarket L2 凭证创建 | P1 |
| 4 | `PolymarketAdapter` 骨架 + NegRisk 扫描器 | P1 |
| 5 | 阿姆斯特丹 VPS（PM 延迟套利用） | P2 |
| 6 | 现有测试跑通（已有 10/10 ✓） | ✅ |

---

## 八、参考资源

### 学术论文
- Portnaya (2026): "Do Prediction Markets Match Option Prices?" — PM vs CEX 期权 5.6pp 概率差
- IMDEA Networks: Polymarket 套利实证 — $40M 利润提取
- Kroer et al. (2016): 无套利组合市场做市 — Frank-Wolfe + Bregman 投影

### 开源 Bot
- `learningworship/polymarket-latency-bot` — Python PM↔Binance 延迟套利（测试/实盘双模式）
- `sanjulaonline/polymarket-arb` — Rust 生产级，Bayesian + Stoikov 模型
- `sebbourgeois/polybtcbot` — Python + FastAPI Dashboard，stargate5 启发
- `JREREEE/btc-5m-market-trading-bot` — TypeScript，CLOB V2
- `ai-trading-terminal/cloddsbot` — 多场所 AI Agent（PM+Kalshi+Binance+HL+Solana）
- `Hummingbot` — 最成熟框架，原生 Hyperliquid connector

### API 文档
- Polymarket CLOB API: docs.polymarket.com
- Hyperliquid API: hyperliquid.gitbook.io
- Binance WS: binance-docs.github.io

---

*计划生成：2026-06-27 · 研究来源：7 路并行 agent + 20+ X 账号 + 15+ 学术/行业文献 + 10+ GitHub 仓库*
