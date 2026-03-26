import { withBreaker } from "./safeFetch";

export type Ticker = {
  exchange: "kraken" | "coinbase" | "binance" | "bybit";
  symbol: string;
  bid: number;
  ask: number;
  ts: number;
};

type Fetcher = (symbol: string) => Promise<Ticker>;

const parseSymbol = (symbol: string) => {
  const [base, quote] = symbol.split("/");
  return { base, quote };
};

const toKrakenPair = (symbol: string) => {
  const { base, quote } = parseSymbol(symbol);
  const m = (s: string) => (s === "BTC" ? "XBT" : s);
  return `${m(base)}${m(quote)}`.toUpperCase();
};

export const krakenFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`kraken_${symbol}`, async () => {
    const pair = toKrakenPair(symbol);
    const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;
    
    console.log(`[Kraken] Fetching ${pair} from ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    
    if (res.status === 520 || res.status === 503) {
      throw new Error("kraken_service_unavailable");
    }
    if (!res.ok) {
      throw new Error(`kraken_http_${res.status}`);
    }
    
    const json = await res.json();
    if (json.error?.length) {
      throw new Error(`kraken_api_${json.error[0]}`);
    }
    
    const data = json.result[Object.keys(json.result)[0]];
    const ask = parseFloat(data.a[0]);
    const bid = parseFloat(data.b[0]);
    
    console.log(`[Kraken] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "kraken", symbol, bid, ask, ts: Date.now() };
  });
};

export const coinbaseFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`coinbase_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const prod = `${base}-${quote}`.toUpperCase();
    const url = `https://api.exchange.coinbase.com/products/${prod}/ticker`;
    
    console.log(`[Coinbase] Fetching ${prod} from ${url}`);
    const res = await fetch(url, { 
      headers: { "User-Agent": "arb-app/1.0" },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!res.ok) {
      throw new Error(`coinbase_http_${res.status}`);
    }
    
    const j = await res.json();
    const ask = parseFloat(j.ask);
    const bid = parseFloat(j.bid);
    
    console.log(`[Coinbase] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "coinbase", symbol, bid, ask, ts: Date.now() };
  });
};

export const binanceFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`binance_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const s = `${base}${quote}`.toUpperCase();
    const url = `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${s}`;
    
    console.log(`[Binance] Fetching ${s} from ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    
    if (!res.ok) {
      throw new Error(`binance_http_${res.status}`);
    }
    
    const j = await res.json();
    const bid = parseFloat(j.bidPrice);
    const ask = parseFloat(j.askPrice);
    
    console.log(`[Binance] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "binance", symbol, bid, ask, ts: Date.now() };
  });
};

export const bybitFetcher: Fetcher = async (symbol) => {
  return await withBreaker(`bybit_${symbol}`, async () => {
    const { base, quote } = parseSymbol(symbol);
    const s = `${base}${quote}`.toUpperCase();
    const url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${s}`;
    
    console.log(`[Bybit] Fetching ${s} from ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    
    if (!res.ok) {
      throw new Error(`bybit_http_${res.status}`);
    }
    
    const j = await res.json();
    const d = j.result?.list?.[0];
    
    const bid = parseFloat(d?.bid1Price ?? "0");
    const ask = parseFloat(d?.ask1Price ?? "0");
    
    console.log(`[Bybit] ${symbol} - bid: ${bid}, ask: ${ask}`);
    return { exchange: "bybit", symbol, bid, ask, ts: Date.now() };
  });
};

export const adapters: Record<string, Fetcher> = {
  kraken: krakenFetcher,
  coinbase: coinbaseFetcher,
  binance: binanceFetcher,
  bybit: bybitFetcher,
};
