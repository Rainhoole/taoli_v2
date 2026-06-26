import { createServer } from "node:http";
import { DEFAULT_RUNTIME_CONFIG, loadRuntimeConfig } from "@arb/shared";

const config = loadRuntimeConfig();
const port = Number(process.env.API_PORT ?? 4000);

const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        status: "ok",
        mode: config.mode,
        exchanges: config.exchanges,
        symbols: config.symbols,
        thresholds: {
          minimumNetReturnBps: DEFAULT_RUNTIME_CONFIG.minimumNetReturnBps,
          marketDataStaleMs: DEFAULT_RUNTIME_CONFIG.marketDataStaleMs,
          marketDataUnhealthyMs: DEFAULT_RUNTIME_CONFIG.marketDataUnhealthyMs,
          rescueCostCapBps: DEFAULT_RUNTIME_CONFIG.rescueCostCapBps,
        },
      }),
    );
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
});

server.listen(port, () => {
  console.log(`Arbitrage API listening on http://localhost:${port}`);
});
