export type ExchangeName = 'binance' | 'kraken' | 'coinbase' | 'bybit';
export type ExchangeMode = 'sandbox' | 'live';
export type CryptoPairName = 'BTC' | 'ETH' | 'XRP' | 'SOL' | 'BNB' | 'ADA';

export interface CryptoPairConfig {
  name: CryptoPairName;
  displayName: string;
  symbol: string;
  enabled: boolean;
}

export interface ExchangeConfig {
  name: ExchangeName;
  displayName: string;
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  mode: ExchangeMode;
}

export interface TickerData {
  exchange: ExchangeName;
  symbol: string;
  bidPrice: string;
  askPrice: string;
  bidQty: string;
  askQty: string;
  timestamp: number;
}

export interface TickerResult {
  exchange: ExchangeName;
  symbol: string;
  bid: number;
  ask: number;
  ts: number;
  error?: string;
}
