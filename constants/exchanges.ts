import { ExchangeConfig, ExchangeName, CryptoPairConfig } from '@/types/exchanges';

export const EXCHANGE_ENDPOINTS = {
  binance: {
    live: 'https://api.binance.com',
    sandbox: 'https://testnet.binance.vision',
  },
  kraken: {
    live: 'https://api.kraken.com',
    sandbox: 'https://api.kraken.com',
  },
  coinbase: {
    live: 'https://api.exchange.coinbase.com',
    sandbox: 'https://api-public.sandbox.exchange.coinbase.com',
  },
  bybit: {
    live: 'https://api.bybit.com',
    sandbox: 'https://api-testnet.bybit.com',
  },
} as const;

export const DEFAULT_EXCHANGE_CONFIGS: ExchangeConfig[] = [
  {
    name: 'binance',
    displayName: 'Binance',
    enabled: false,
    apiKey: '',
    apiSecret: '',
    mode: 'live',
  },
  {
    name: 'bybit',
    displayName: 'Bybit',
    enabled: false,
    apiKey: '',
    apiSecret: '',
    mode: 'live',
  },
  {
    name: 'kraken',
    displayName: 'Kraken',
    enabled: true,
    apiKey: '',
    apiSecret: '',
    mode: 'live',
  },
  {
    name: 'coinbase',
    displayName: 'Coinbase',
    enabled: true,
    apiKey: '',
    apiSecret: '',
    mode: 'live',
  },
];

export const DEFAULT_CRYPTO_PAIRS: CryptoPairConfig[] = [
  {
    name: 'BTC',
    displayName: 'Bitcoin',
    symbol: 'BTC/USDT',
    enabled: true,
  },
  {
    name: 'ETH',
    displayName: 'Ethereum',
    symbol: 'ETH/USDT',
    enabled: false,
  },
  {
    name: 'XRP',
    displayName: 'Ripple',
    symbol: 'XRP/USDT',
    enabled: false,
  },
  {
    name: 'SOL',
    displayName: 'Solana',
    symbol: 'SOL/USDT',
    enabled: false,
  },
  {
    name: 'BNB',
    displayName: 'Binance Coin',
    symbol: 'BNB/USDT',
    enabled: false,
  },
  {
    name: 'ADA',
    displayName: 'Cardano',
    symbol: 'ADA/USDT',
    enabled: false,
  },
];

export const SYMBOL_MAPPING: Record<ExchangeName, Record<string, string>> = {
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
  },
};

export const REFRESH_INTERVAL = 5000;

export const EXCHANGE_TRADING_FEES: Record<ExchangeName, { maker: number; taker: number }> = {
  binance: { maker: 0.001, taker: 0.001 },
  bybit: { maker: 0.001, taker: 0.001 },
  kraken: { maker: 0.0016, taker: 0.0026 },
  coinbase: { maker: 0.004, taker: 0.006 },
};
