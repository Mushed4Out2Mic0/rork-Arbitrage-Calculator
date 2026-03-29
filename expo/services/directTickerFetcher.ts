import { Platform } from 'react-native';
import { ExchangeName } from '@/types/exchanges';

export interface DirectTickerResult {
  exchange: ExchangeName;
  symbol: string;
  bid: number;
  ask: number;
  ts: number;
  error?: string;
}

const parseSymbol = (symbol: string) => {
  const [base, quote] = symbol.split('/');
  return { base, quote };
};

async function fetchWithTimeout(url: string, timeoutMs: number = 10000, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    return res;
  } finally {
    clearTimeout(id);
  }
}

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

async function fetchWithCorsProxy(url: string, timeoutMs: number = 10000, headers?: Record<string, string>): Promise<Response> {
  if (Platform.OS !== 'web') {
    return fetchWithTimeout(url, timeoutMs, headers);
  }

  try {
    const res = await fetchWithTimeout(url, timeoutMs, headers);
    if (res.ok) return res;
  } catch {
    console.log(`[DirectFetch] Direct failed on web, trying CORS proxy for ${url}`);
  }

  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const res = await fetchWithTimeout(proxyUrl, timeoutMs);
      if (res.ok) return res;
    } catch {
      continue;
    }
  }

  throw new Error('All CORS proxy attempts failed');
}

async function fetchKraken(symbol: string): Promise<DirectTickerResult> {
  const { base, quote } = parseSymbol(symbol);
  const m = (s: string) => (s === 'BTC' ? 'XBT' : s);
  const pair = `${m(base)}${m(quote)}`.toUpperCase();
  const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;

  console.log(`[DirectFetch][Kraken] Fetching ${pair}`);
  const res = await fetchWithCorsProxy(url);
  const json = await res.json();
  if (json.error?.length) throw new Error(`kraken_api_${json.error[0]}`);

  const data = json.result[Object.keys(json.result)[0]];
  const ask = parseFloat(data.a[0]);
  const bid = parseFloat(data.b[0]);

  console.log(`[DirectFetch][Kraken] ${symbol} bid=${bid} ask=${ask}`);
  return { exchange: 'kraken', symbol, bid, ask, ts: Date.now() };
}

async function fetchCoinbase(symbol: string): Promise<DirectTickerResult> {
  const { base, quote } = parseSymbol(symbol);
  const prod = `${base}-${quote}`.toUpperCase();
  const url = `https://api.exchange.coinbase.com/products/${prod}/ticker`;

  console.log(`[DirectFetch][Coinbase] Fetching ${prod}`);
  const res = await fetchWithCorsProxy(url, 10000);
  const j = await res.json();
  const ask = parseFloat(j.ask);
  const bid = parseFloat(j.bid);

  console.log(`[DirectFetch][Coinbase] ${symbol} bid=${bid} ask=${ask}`);
  return { exchange: 'coinbase', symbol, bid, ask, ts: Date.now() };
}

async function fetchBinance(symbol: string): Promise<DirectTickerResult> {
  const { base, quote } = parseSymbol(symbol);
  const s = `${base}${quote}`.toUpperCase();
  const url = `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${s}`;

  console.log(`[DirectFetch][Binance] Fetching ${s}`);
  const res = await fetchWithCorsProxy(url);
  const j = await res.json();
  const bid = parseFloat(j.bidPrice);
  const ask = parseFloat(j.askPrice);

  console.log(`[DirectFetch][Binance] ${symbol} bid=${bid} ask=${ask}`);
  return { exchange: 'binance', symbol, bid, ask, ts: Date.now() };
}

async function fetchBybit(symbol: string): Promise<DirectTickerResult> {
  const { base, quote } = parseSymbol(symbol);
  const s = `${base}${quote}`.toUpperCase();
  const url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${s}`;

  console.log(`[DirectFetch][Bybit] Fetching ${s}`);
  const res = await fetchWithCorsProxy(url);
  const j = await res.json();
  const d = j.result?.list?.[0];
  const bid = parseFloat(d?.bid1Price ?? '0');
  const ask = parseFloat(d?.ask1Price ?? '0');

  console.log(`[DirectFetch][Bybit] ${symbol} bid=${bid} ask=${ask}`);
  return { exchange: 'bybit', symbol, bid, ask, ts: Date.now() };
}

const fetchers: Record<ExchangeName, (symbol: string) => Promise<DirectTickerResult>> = {
  kraken: fetchKraken,
  coinbase: fetchCoinbase,
  binance: fetchBinance,
  bybit: fetchBybit,
};

export async function fetchTickersDirect(
  exchanges: ExchangeName[],
  symbols: string[]
): Promise<{ results: DirectTickerResult[] }> {
  console.log(`[DirectFetch] Batch: exchanges=[${exchanges.join(',')}] symbols=[${symbols.join(',')}]`);

  const tasks: Promise<DirectTickerResult>[] = [];

  for (const ex of exchanges) {
    for (const sym of symbols) {
      const fetcher = fetchers[ex];
      if (!fetcher) {
        console.warn(`[DirectFetch] No fetcher for ${ex}`);
        continue;
      }
      tasks.push(
        fetcher(sym).catch((err) => ({
          exchange: ex,
          symbol: sym,
          bid: 0,
          ask: 0,
          ts: Date.now(),
          error: String(err),
        }))
      );
    }
  }

  const results = await Promise.all(tasks);
  const ok = results.filter((r) => !r.error).length;
  const fail = results.filter((r) => r.error).length;
  console.log(`[DirectFetch] Done: ${ok} success, ${fail} failed`);

  return { results };
}
