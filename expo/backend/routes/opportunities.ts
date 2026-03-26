import { Hono } from "hono";
import { adapters } from "../exchanges/adapters";
import { computeOpportunities } from "../opportunities/opportunities";

export const oppRouter = new Hono();

oppRouter.get("/", async (c) => {
  const exchanges = (c.req.query("ex") ?? "kraken,coinbase").split(",").filter(Boolean);
  const symbols = (c.req.query("sym") ?? "BTC/USDT").split(",").filter(Boolean);
  
  const fee = {
    kraken: Number(c.req.query("fee_kraken") ?? "0.0016"),
    coinbase: Number(c.req.query("fee_coinbase") ?? "0.0025"),
    binance: Number(c.req.query("fee_binance") ?? "0.001"),
    bybit: Number(c.req.query("fee_bybit") ?? "0.001"),
  };

  console.log(`[Opportunities] Fetching: ex=${exchanges.join(",")}, sym=${symbols.join(",")}`);

  const tasks: Promise<any>[] = [];
  
  for (const ex of exchanges) {
    for (const sym of symbols) {
      const f = adapters[ex];
      if (!f) continue;
      tasks.push(f(sym).catch(() => null));
    }
  }
  
  const tickers = (await Promise.all(tasks)).filter(Boolean);
  const opps = computeOpportunities(tickers, fee);
  
  console.log(`[Opportunities] Found ${opps.length} opportunities from ${tickers.length} tickers`);
  
  return c.json({ tickers, opportunities: opps });
});
