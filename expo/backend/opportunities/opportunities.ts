import type { Ticker } from "../exchanges/adapters";

export type Opportunity = {
  symbol: string;
  buyOn: string;
  sellOn: string;
  spreadPct: number;
  gross: number;
  fees: number;
  net: number;
  ts: number;
};

export function computeOpportunities(
  tickers: Ticker[],
  feeTable: Record<string, number>
): Opportunity[] {
  const bySymbol: Record<string, Ticker[]> = {};
  
  for (const t of tickers) {
    if (!bySymbol[t.symbol]) {
      bySymbol[t.symbol] = [];
    }
    bySymbol[t.symbol].push(t);
  }

  const out: Opportunity[] = [];
  
  for (const [symbol, arr] of Object.entries(bySymbol)) {
    for (const a of arr) {
      for (const b of arr) {
        if (a.exchange === b.exchange) continue;
        
        const spread = (b.bid - a.ask) / a.ask;
        if (spread <= 0) continue;
        
        const gross = b.bid - a.ask;
        const fees = (feeTable[a.exchange] ?? 0) + (feeTable[b.exchange] ?? 0);
        const net = gross - fees;
        
        if (net > 0) {
          out.push({
            symbol,
            buyOn: a.exchange,
            sellOn: b.exchange,
            spreadPct: spread * 100,
            gross,
            fees,
            net,
            ts: Date.now(),
          });
        }
      }
    }
  }
  
  return out.sort((x, y) => y.net - x.net);
}
