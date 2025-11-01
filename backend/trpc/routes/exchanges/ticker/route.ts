import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const EXCHANGE_ENDPOINTS = {
  binance: {
    sandbox: 'https://testnet.binance.vision',
    live: 'https://api.binance.com'
  },
  kraken: {
    sandbox: 'https://api.kraken.com',
    live: 'https://api.kraken.com'
  },
  coinbase: {
    sandbox: 'https://api-public.sandbox.exchange.coinbase.com',
    live: 'https://api.exchange.coinbase.com'
  },
  bybit: {
    sandbox: 'https://api-testnet.bybit.com',
    live: 'https://api.bybit.com'
  }
};

const SYMBOL_MAPPING = {
  binance: {
    'BTC/USDT': 'BTCUSDT',
    'ETH/USDT': 'ETHUSDT',
    'XRP/USDT': 'XRPUSDT',
    'SOL/USDT': 'SOLUSDT',
    'BNB/USDT': 'BNBUSDT',
    'ADA/USDT': 'ADAUSDT',
  },
  kraken: {
    'BTC/USDT': 'XBTUSDT',
    'ETH/USDT': 'ETHUSDT',
    'XRP/USDT': 'XRPUSDT',
    'SOL/USDT': 'SOLUSDT',
    'BNB/USDT': 'BNBUSDT',
    'ADA/USDT': 'ADAUSDT',
  },
  coinbase: {
    'BTC/USDT': 'BTC-USDT',
    'ETH/USDT': 'ETH-USDT',
    'XRP/USDT': 'XRP-USDT',
    'SOL/USDT': 'SOL-USDT',
    'BNB/USDT': 'BNB-USDT',
    'ADA/USDT': 'ADA-USDT',
  },
  bybit: {
    'BTC/USDT': 'BTCUSDT',
    'ETH/USDT': 'ETHUSDT',
    'XRP/USDT': 'XRPUSDT',
    'SOL/USDT': 'SOLUSDT',
    'BNB/USDT': 'BNBUSDT',
    'ADA/USDT': 'ADAUSDT',
  }
};

async function fetchBinanceTicker(mode: 'sandbox' | 'live', pairSymbol: string) {
  const baseUrl = EXCHANGE_ENDPOINTS.binance[mode];
  const symbol = SYMBOL_MAPPING.binance[pairSymbol as keyof typeof SYMBOL_MAPPING.binance];
  const url = `${baseUrl}/api/v3/ticker/bookTicker?symbol=${symbol}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 451) {
        throw new Error(`Binance: Region restricted or CORS blocked.`);
      }
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      exchange: 'binance' as const,
      symbol: pairSymbol,
      bidPrice: data.bidPrice,
      bidQty: data.bidQty,
      askPrice: data.askPrice,
      askQty: data.askQty,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Binance: Request timeout');
    }
    throw new Error(error.message || 'Binance: Connection failed');
  }
}

async function fetchKrakenTicker(mode: 'sandbox' | 'live', pairSymbol: string) {
  const baseUrl = EXCHANGE_ENDPOINTS.kraken[mode];
  const symbol = SYMBOL_MAPPING.kraken[pairSymbol as keyof typeof SYMBOL_MAPPING.kraken];
  const url = `${baseUrl}/0/public/Ticker?pair=${symbol}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Kraken: API error ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error && data.error.length > 0) {
      const errorMsg = data.error.join(', ');
      if (errorMsg.includes('EService:Unavailable') || errorMsg.includes('Unavailable')) {
        throw new Error(`Kraken: Service temporarily unavailable.`);
      }
      throw new Error(`Kraken: ${errorMsg}`);
    }

    const tickerKey = Object.keys(data.result)[0];
    const ticker = data.result[tickerKey];

    return {
      exchange: 'kraken' as const,
      symbol: pairSymbol,
      askPrice: ticker.a[0],
      askQty: ticker.a[1],
      bidPrice: ticker.b[0],
      bidQty: ticker.b[1],
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Kraken: Request timeout');
    }
    throw new Error(error.message || 'Kraken: Connection failed');
  }
}

async function fetchCoinbaseTicker(mode: 'sandbox' | 'live', pairSymbol: string) {
  const baseUrl = EXCHANGE_ENDPOINTS.coinbase[mode];
  const symbol = SYMBOL_MAPPING.coinbase[pairSymbol as keyof typeof SYMBOL_MAPPING.coinbase];
  const url = `${baseUrl}/products/${symbol}/book?level=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 451) {
        throw new Error('Coinbase: Region restricted or CORS blocked.');
      }
      throw new Error(`Coinbase: API error ${response.status}`);
    }

    const data = await response.json();

    if (!data.bids || !data.bids[0] || !data.asks || !data.asks[0]) {
      throw new Error('Coinbase: Invalid response data');
    }

    const bidPrice = data.bids[0][0];
    const bidQty = data.bids[0][1];
    const askPrice = data.asks[0][0];
    const askQty = data.asks[0][1];

    return {
      exchange: 'coinbase' as const,
      symbol: pairSymbol,
      bidPrice,
      bidQty,
      askPrice,
      askQty,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Coinbase: Request timeout');
    }
    throw new Error(error.message || 'Coinbase: Connection failed');
  }
}

async function fetchBybitTicker(mode: 'sandbox' | 'live', pairSymbol: string) {
  const baseUrl = EXCHANGE_ENDPOINTS.bybit[mode];
  const symbol = SYMBOL_MAPPING.bybit[pairSymbol as keyof typeof SYMBOL_MAPPING.bybit];
  const url = `${baseUrl}/v5/market/tickers?category=spot&symbol=${symbol}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 451 || response.status === 403) {
        throw new Error(`Bybit: Region restricted or CORS blocked.`);
      }
      throw new Error(`Bybit API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }

    const ticker = data.result.list[0];

    return {
      exchange: 'bybit' as const,
      symbol: pairSymbol,
      bidPrice: ticker.bid1Price,
      bidQty: ticker.bid1Size,
      askPrice: ticker.ask1Price,
      askQty: ticker.ask1Size,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Bybit: Request timeout');
    }
    throw new Error(error.message || 'Bybit: Connection failed');
  }
}

export default publicProcedure
  .input(
    z.object({
      exchange: z.enum(['binance', 'kraken', 'coinbase', 'bybit']),
      mode: z.enum(['sandbox', 'live']),
      pairSymbol: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log(`[Backend] Fetching ${input.exchange} ${input.pairSymbol} in ${input.mode} mode`);
    
    switch (input.exchange) {
      case 'binance':
        return await fetchBinanceTicker(input.mode, input.pairSymbol);
      case 'bybit':
        return await fetchBybitTicker(input.mode, input.pairSymbol);
      case 'kraken':
        return await fetchKrakenTicker(input.mode, input.pairSymbol);
      case 'coinbase':
        return await fetchCoinbaseTicker(input.mode, input.pairSymbol);
      default:
        throw new Error(`Unknown exchange: ${input.exchange}`);
    }
  });
