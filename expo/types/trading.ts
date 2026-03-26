import { ExchangeName } from './exchanges';

export interface ExchangeBalance {
  exchange: ExchangeName;
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
}

export interface BalanceSummary {
  exchange: ExchangeName;
  balances: ExchangeBalance[];
  totalUsdValue: number;
  lastUpdated: number;
  error?: string;
}

export type TradeMode = 'live' | 'paper';
export type TradeSide = 'buy' | 'sell';
export type TradeStatus = 'pending' | 'filled' | 'failed' | 'cancelled';

export interface TradeOrder {
  id: string;
  mode: TradeMode;
  exchange: ExchangeName;
  symbol: string;
  side: TradeSide;
  amount: number;
  price: number;
  status: TradeStatus;
  fee: number;
  total: number;
  timestamp: number;
  errorMessage?: string;
  linkedOrderId?: string;
}

export interface ArbitrageExecution {
  id: string;
  mode: TradeMode;
  buyOrder: TradeOrder;
  sellOrder: TradeOrder;
  symbol: string;
  grossProfit: number;
  totalFees: number;
  netProfit: number;
  status: 'pending' | 'partial' | 'complete' | 'failed';
  timestamp: number;
}

export interface PaperBalance {
  asset: string;
  amount: number;
}

export interface PaperTradingState {
  enabled: boolean;
  initialCapital: number;
  balances: Record<string, PaperBalance>;
  trades: TradeOrder[];
  executions: ArbitrageExecution[];
  totalPnl: number;
  tradeCount: number;
}
