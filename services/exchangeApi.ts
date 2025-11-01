import { ExchangeConfig, TickerData } from '@/types/exchanges';
import { EXCHANGE_ENDPOINTS, SYMBOL_MAPPING } from '@/constants/exchanges';

interface BinanceTickerResponse {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

export async function fetchBinanceTicker(
  config: ExchangeConfig,
  pairSymbol: string
): Promise<TickerData> {
  console.log(`[Binance] Fetching ${pairSymbol} ticker in ${config.mode} mode`);
  
  const baseUrl = EXCHANGE_ENDPOINTS.binance[config.mode];
  const symbol = SYMBOL_MAPPING.binance[pairSymbol];
  const url = `${baseUrl}/api/v3/ticker/bookTicker?symbol=${symbol}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 451) {
        throw new Error(`Binance: Region restricted or CORS blocked. Use VPN or proxy server.`);
      }
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data: BinanceTickerResponse = await response.json();
    
    console.log(`[Binance] Received ticker:`, data);

    return {
      exchange: 'binance',
      symbol: pairSymbol,
      bidPrice: data.bidPrice,
      bidQty: data.bidQty,
      askPrice: data.askPrice,
      askQty: data.askQty,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Binance] Request timeout');
      throw new Error('Binance: Request timeout');
    }
    console.error('[Binance] Fetch error:', error);
    throw new Error(error.message || 'Binance: Connection failed');
  }
}

interface KrakenTickerResponse {
  error: string[];
  result: {
    [key: string]: {
      a: [string, string, string];
      b: [string, string, string];
    };
  };
}

export async function fetchKrakenTicker(
  config: ExchangeConfig,
  pairSymbol: string
): Promise<TickerData> {
  console.log(`[Kraken] Fetching ${pairSymbol} ticker in ${config.mode} mode`);
  
  const baseUrl = EXCHANGE_ENDPOINTS.kraken[config.mode];
  const symbol = SYMBOL_MAPPING.kraken[pairSymbol];
  const cacheBuster = `&t=${Date.now()}`;
  const apiUrl = `${baseUrl}/0/public/Ticker?pair=${symbol}${cacheBuster}`;
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Kraken: API error ${response.status}`);
    }

    const data: KrakenTickerResponse = await response.json();
    
    if (data.error && data.error.length > 0) {
      const errorMsg = data.error.join(', ');
      if (errorMsg.includes('EService:Unavailable') || errorMsg.includes('Unavailable')) {
        throw new Error(`Kraken: Service temporarily unavailable. Please try again later.`);
      }
      throw new Error(`Kraken: ${errorMsg}`);
    }

    const tickerKey = Object.keys(data.result)[0];
    const ticker = data.result[tickerKey];
    
    console.log(`[Kraken] Received ticker:`, ticker);

    return {
      exchange: 'kraken',
      symbol: pairSymbol,
      askPrice: ticker.a[0],
      askQty: ticker.a[1],
      bidPrice: ticker.b[0],
      bidQty: ticker.b[1],
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Kraken] Request timeout');
      throw new Error('Kraken: Request timeout');
    }
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))) {
      console.error('[Kraken] Network/CORS error:', error);
      throw new Error('Kraken: CORS/Network blocked. APIs may be restricted on web.');
    }
    console.error('[Kraken] Fetch error:', error);
    throw new Error(error.message || 'Kraken: Connection failed');
  }
}

interface CoinbaseTickerResponse {
  asks: [[string, string]];
  bids: [[string, string]];
  time: string;
}

export async function fetchCoinbaseTicker(
  config: ExchangeConfig,
  pairSymbol: string
): Promise<TickerData> {
  console.log(`[Coinbase] Fetching ${pairSymbol} ticker in ${config.mode} mode`);
  
  const baseUrl = EXCHANGE_ENDPOINTS.coinbase[config.mode];
  const symbol = SYMBOL_MAPPING.coinbase[pairSymbol];
  const cacheBuster = `&t=${Date.now()}`;
  const apiUrl = `${baseUrl}/products/${symbol}/book?level=1${cacheBuster}`;
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 451) {
        throw new Error('Coinbase: Region restricted or CORS blocked. Try VPN.');
      }
      throw new Error(`Coinbase: API error ${response.status}`);
    }

    const data: CoinbaseTickerResponse = await response.json();
    
    console.log(`[Coinbase] Received ticker data:`, data);

    if (!data.bids || !data.bids[0] || !data.asks || !data.asks[0]) {
      throw new Error('Coinbase: Invalid response data');
    }

    const bidPrice = data.bids[0][0];
    const bidQty = data.bids[0][1];
    const askPrice = data.asks[0][0];
    const askQty = data.asks[0][1];

    return {
      exchange: 'coinbase',
      symbol: pairSymbol,
      bidPrice,
      bidQty,
      askPrice,
      askQty,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Coinbase] Request timeout');
      throw new Error('Coinbase: Request timeout');
    }
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))) {
      console.error('[Coinbase] Network/CORS error:', error);
      throw new Error('Coinbase: CORS/Network blocked. APIs may be restricted on web.');
    }
    console.error('[Coinbase] Fetch error:', error);
    throw new Error(error.message || 'Coinbase: Connection failed');
  }
}

interface BybitTickerResponse {
  retCode: number;
  retMsg: string;
  result: {
    category: string;
    list: [
      {
        symbol: string;
        bid1Price: string;
        bid1Size: string;
        ask1Price: string;
        ask1Size: string;
      }
    ];
  };
}

export async function fetchBybitTicker(
  config: ExchangeConfig,
  pairSymbol: string
): Promise<TickerData> {
  console.log(`[Bybit] Fetching ${pairSymbol} ticker in ${config.mode} mode`);
  
  const baseUrl = EXCHANGE_ENDPOINTS.bybit[config.mode];
  const symbol = SYMBOL_MAPPING.bybit[pairSymbol];
  const url = `${baseUrl}/v5/market/tickers?category=spot&symbol=${symbol}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 451 || response.status === 403) {
        throw new Error(`Bybit: Region restricted or CORS blocked. Use VPN or proxy server.`);
      }
      throw new Error(`Bybit API error: ${response.status}`);
    }

    const data: BybitTickerResponse = await response.json();
    
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }

    const ticker = data.result.list[0];
    
    console.log(`[Bybit] Received ticker:`, ticker);

    return {
      exchange: 'bybit',
      symbol: pairSymbol,
      bidPrice: ticker.bid1Price,
      bidQty: ticker.bid1Size,
      askPrice: ticker.ask1Price,
      askQty: ticker.ask1Size,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Bybit] Request timeout');
      throw new Error('Bybit: Request timeout');
    }
    console.error('[Bybit] Fetch error:', error);
    throw new Error(error.message || 'Bybit: Connection failed');
  }
}

export async function fetchExchangeTicker(
  config: ExchangeConfig,
  pairSymbol: string = 'BTC/USDT'
): Promise<TickerData> {
  switch (config.name) {
    case 'binance':
      return fetchBinanceTicker(config, pairSymbol);
    case 'bybit':
      return fetchBybitTicker(config, pairSymbol);
    case 'kraken':
      return fetchKrakenTicker(config, pairSymbol);
    case 'coinbase':
      return fetchCoinbaseTicker(config, pairSymbol);
    default:
      throw new Error(`Unknown exchange: ${config.name}`);
  }
}

export function calculateSpread(bidPrice: string, askPrice: string): number {
  const bid = parseFloat(bidPrice);
  const ask = parseFloat(askPrice);
  return ask - bid;
}

export function calculateSpreadPercentage(bidPrice: string, askPrice: string): number {
  const bid = parseFloat(bidPrice);
  const ask = parseFloat(askPrice);
  const spread = ask - bid;
  return (spread / bid) * 100;
}
