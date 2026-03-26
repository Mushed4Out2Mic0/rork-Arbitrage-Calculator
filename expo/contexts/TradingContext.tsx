import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TradeMode,
  TradeOrder,
  ArbitrageExecution,
  PaperTradingState,
  TradeSide,
} from '@/types/trading';
import { ExchangeName } from '@/types/exchanges';
import { EXCHANGE_TRADING_FEES } from '@/constants/exchanges';

const PAPER_STATE_KEY = 'paper_trading_state';
const TRADE_MODE_KEY = 'trade_mode';

const DEFAULT_PAPER_STATE: PaperTradingState = {
  enabled: false,
  initialCapital: 10000,
  balances: {
    USDT: { asset: 'USDT', amount: 10000 },
  },
  trades: [],
  executions: [],
  totalPnl: 0,
  tradeCount: 0,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const [TradingProvider, useTrading] = createContextHook(() => {
  const [tradeMode, setTradeMode] = useState<TradeMode>('paper');
  const [paperState, setPaperState] = useState<PaperTradingState>(DEFAULT_PAPER_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [storedMode, storedPaper] = await Promise.all([
          AsyncStorage.getItem(TRADE_MODE_KEY),
          AsyncStorage.getItem(PAPER_STATE_KEY),
        ]);

        if (storedMode === 'live' || storedMode === 'paper') {
          setTradeMode(storedMode);
        }

        if (storedPaper) {
          const parsed = JSON.parse(storedPaper) as PaperTradingState;
          setPaperState(parsed);
          console.log('[TradingContext] Loaded paper state:', parsed.tradeCount, 'trades');
        }
      } catch (error) {
        console.error('[TradingContext] Error loading state:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const savePaperState = useCallback(async (state: PaperTradingState) => {
    try {
      await AsyncStorage.setItem(PAPER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[TradingContext] Error saving paper state:', error);
    }
  }, []);

  const switchMode = useCallback(async (mode: TradeMode) => {
    console.log('[TradingContext] Switching to', mode, 'mode');
    setTradeMode(mode);
    await AsyncStorage.setItem(TRADE_MODE_KEY, mode);
  }, []);

  const executePaperTrade = useCallback(
    (
      exchange: ExchangeName,
      symbol: string,
      side: TradeSide,
      amount: number,
      price: number
    ): TradeOrder => {
      const fees = EXCHANGE_TRADING_FEES[exchange];
      const fee = price * amount * fees.taker;
      const total = side === 'buy' ? price * amount + fee : price * amount - fee;

      const [base, quote] = symbol.split('/');

      const order: TradeOrder = {
        id: generateId(),
        mode: 'paper',
        exchange,
        symbol,
        side,
        amount,
        price,
        status: 'filled',
        fee,
        total,
        timestamp: Date.now(),
      };

      setPaperState((prev) => {
        const newBalances = { ...prev.balances };

        if (side === 'buy') {
          const quoteBalance = newBalances[quote]?.amount ?? 0;
          if (quoteBalance < total) {
            order.status = 'failed';
            order.errorMessage = `Insufficient ${quote} balance. Need $${total.toFixed(2)}, have $${quoteBalance.toFixed(2)}`;
            return {
              ...prev,
              trades: [order, ...prev.trades].slice(0, 100),
            };
          }

          newBalances[quote] = {
            asset: quote,
            amount: quoteBalance - total,
          };
          newBalances[base] = {
            asset: base,
            amount: (newBalances[base]?.amount ?? 0) + amount,
          };
        } else {
          const baseBalance = newBalances[base]?.amount ?? 0;
          if (baseBalance < amount) {
            order.status = 'failed';
            order.errorMessage = `Insufficient ${base} balance. Need ${amount}, have ${baseBalance.toFixed(6)}`;
            return {
              ...prev,
              trades: [order, ...prev.trades].slice(0, 100),
            };
          }

          newBalances[base] = {
            asset: base,
            amount: baseBalance - amount,
          };
          newBalances[quote] = {
            asset: quote,
            amount: (newBalances[quote]?.amount ?? 0) + total,
          };
        }

        const newState: PaperTradingState = {
          ...prev,
          balances: newBalances,
          trades: [order, ...prev.trades].slice(0, 100),
          tradeCount: prev.tradeCount + 1,
        };

        void savePaperState(newState);
        return newState;
      });

      return order;
    },
    [savePaperState]
  );

  const executePaperArbitrage = useCallback(
    (
      buyExchange: ExchangeName,
      sellExchange: ExchangeName,
      symbol: string,
      amount: number,
      buyPrice: number,
      sellPrice: number
    ): ArbitrageExecution => {
      const buyOrder = executePaperTrade(buyExchange, symbol, 'buy', amount, buyPrice);
      const sellOrder = executePaperTrade(sellExchange, symbol, 'sell', amount, sellPrice);

      const grossProfit = (sellPrice - buyPrice) * amount;
      const totalFees = buyOrder.fee + sellOrder.fee;
      const netProfit = grossProfit - totalFees;

      const execution: ArbitrageExecution = {
        id: generateId(),
        mode: 'paper',
        buyOrder,
        sellOrder,
        symbol,
        grossProfit,
        totalFees,
        netProfit,
        status: buyOrder.status === 'filled' && sellOrder.status === 'filled' ? 'complete' : 'failed',
        timestamp: Date.now(),
      };

      setPaperState((prev) => {
        const newPnl = prev.totalPnl + (execution.status === 'complete' ? netProfit : 0);
        const newState: PaperTradingState = {
          ...prev,
          executions: [execution, ...prev.executions].slice(0, 50),
          totalPnl: newPnl,
        };
        void savePaperState(newState);
        return newState;
      });

      return execution;
    },
    [executePaperTrade, savePaperState]
  );

  const resetPaperTrading = useCallback(async () => {
    console.log('[TradingContext] Resetting paper trading');
    setPaperState(DEFAULT_PAPER_STATE);
    await savePaperState(DEFAULT_PAPER_STATE);
  }, [savePaperState]);

  const getPaperBalance = useCallback(
    (asset: string): number => {
      return paperState.balances[asset]?.amount ?? 0;
    },
    [paperState.balances]
  );

  const canAffordTrade = useCallback(
    (symbol: string, side: TradeSide, amount: number, price: number, exchange: ExchangeName): boolean => {
      const [base, quote] = symbol.split('/');
      const fees = EXCHANGE_TRADING_FEES[exchange];
      const fee = price * amount * fees.taker;

      if (side === 'buy') {
        const needed = price * amount + fee;
        return getPaperBalance(quote) >= needed;
      } else {
        return getPaperBalance(base) >= amount;
      }
    },
    [getPaperBalance]
  );

  return useMemo(
    () => ({
      tradeMode,
      paperState,
      isLoading,
      switchMode,
      executePaperTrade,
      executePaperArbitrage,
      resetPaperTrading,
      getPaperBalance,
      canAffordTrade,
    }),
    [
      tradeMode,
      paperState,
      isLoading,
      switchMode,
      executePaperTrade,
      executePaperArbitrage,
      resetPaperTrading,
      getPaperBalance,
      canAffordTrade,
    ]
  );
});
