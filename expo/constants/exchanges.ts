import { ExchangeConfig, ExchangeName, CryptoPairConfig } from '@/types/exchanges';

export const DEFAULT_EXCHANGE_CONFIGS: ExchangeConfig[] = [
  { name: 'kraken', displayName: 'Kraken', enabled: true, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'coinbase', displayName: 'Coinbase', enabled: true, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'binance', displayName: 'Binance', enabled: false, apiKey: '', apiSecret: '', mode: 'live' },
  { name: 'bybit', displayName: 'Bybit', enabled: false, apiKey: '', apiSecret: '', mode: 'live' },
];

export const DEFAULT_CRYPTO_PAIRS: CryptoPairConfig[] = [
  { name: 'BTC', displayName: 'Bitcoin', symbol: 'BTC/USDT', enabled: true },
  { name: 'ETH', displayName: 'Ethereum', symbol: 'ETH/USDT', enabled: false },
  { name: 'XRP', displayName: 'Ripple', symbol: 'XRP/USDT', enabled: false },
  { name: 'SOL', displayName: 'Solana', symbol: 'SOL/USDT', enabled: false },
  { name: 'BNB', displayName: 'Binance Coin', symbol: 'BNB/USDT', enabled: false },
  { name: 'ADA', displayName: 'Cardano', symbol: 'ADA/USDT', enabled: false },
];

export const EXCHANGE_TRADING_FEES: Record<ExchangeName, { maker: number; taker: number }> = {
  binance: { maker: 0.001, taker: 0.001 },
  bybit: { maker: 0.001, taker: 0.001 },
  kraken: { maker: 0.0016, taker: 0.0026 },
  coinbase: { maker: 0.004, taker: 0.006 },
};

export const TRADE_AMOUNT = 0.1;
export const REFRESH_INTERVAL = 5000;
