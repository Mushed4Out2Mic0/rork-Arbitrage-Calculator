import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TradeMode, TradeOrder, ArbitrageExecution, PaperTradingState, TradeSide } from '@/types/trading';
import { ExchangeName } from '@/types/exchanges';
import { EXCHANGE_TRADING_FEES } from '@/constants/exchanges';

const PAPER_KEY = 'paper_trading_state';
const MODE_KEY = 'trade_mode';

const DEFAULT_PAPER: PaperTradingState = {
  enabled: false,
  initialCapital: 10000,
  balances: { USDT: { asset: 'USDT', amount: 10000 } },
  trades: [],
  executions: [],
  totalPnl: 0,
  tradeCount: 0,
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const [TradingProvider, useTrading] = createContextHook(() => {
  const [tradeMode, setTradeMode] = useState<TradeMode>('paper');
  const [paperState, setPaperState] = useState<PaperTradingState>(DEFAULT_PAPER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [storedMode, storedPaper] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(PAPER_KEY),
        ]);
        if (storedMode === 'live' || storedMode === 'paper') setTradeMode(storedMode);
        if (storedPaper) setPaperState(JSON.parse(storedPaper));
      } catch (e) {
        console.error('[Trading] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (state: PaperTradingState) => {
    try { await AsyncStorage.setItem(PAPER_KEY, JSON.stringify(state)); } catch (e) { console.error('[Trading] Save error:', e); }
  }, []);

  const switchMode = useCallback(async (mode: TradeMode) => {
    setTradeMode(mode);
    await AsyncStorage.setItem(MODE_KEY, mode);
  }, []);

  const executePaperTrade = useCallback(
    (exchange: ExchangeName, symbol: string, side: TradeSide, amount: number, price: number): TradeOrder => {
      const fees = EXCHANGE_TRADING_FEES[exchange];
      const fee = price * amount * fees.taker;
      const total = side === 'buy' ? price * amount + fee : price * amount - fee;
      const [base, quote] = symbol.split('/');

      const order: TradeOrder = {
        id: uid(), mode: 'paper', exchange, symbol, side, amount, price, status: 'filled', fee, total, timestamp: Date.now(),
      };

      setPaperState((prev) => {
        const bal = { ...prev.balances };

        if (side === 'buy') {
          const qBal = bal[quote]?.amount ?? 0;
          if (qBal < total) {
            order.status = 'failed';
            order.errorMessage = `Insufficient ${quote}: need $${total.toFixed(2)}, have $${qBal.toFixed(2)}`;
            return { ...prev, trades: [order, ...prev.trades].slice(0, 100) };
          }
          bal[quote] = { asset: quote, amount: qBal - total };
          bal[base] = { asset: base, amount: (bal[base]?.amount ?? 0) + amount };
        } else {
          const bBal = bal[base]?.amount ?? 0;
          if (bBal < amount) {
            order.status = 'failed';
            order.errorMessage = `Insufficient ${base}: need ${amount}, have ${bBal.toFixed(6)}`;
            return { ...prev, trades: [order, ...prev.trades].slice(0, 100) };
          }
          bal[base] = { asset: base, amount: bBal - amount };
          bal[quote] = { asset: quote, amount: (bal[quote]?.amount ?? 0) + total };
        }

        const next: PaperTradingState = {
          ...prev, balances: bal, trades: [order, ...prev.trades].slice(0, 100), tradeCount: prev.tradeCount + 1,
        };
        void persist(next);
        return next;
      });

      return order;
    },
    [persist]
  );

  const executePaperArbitrage = useCallback(
    (buyEx: ExchangeName, sellEx: ExchangeName, symbol: string, amount: number, buyPrice: number, sellPrice: number): ArbitrageExecution => {
      const buyOrder = executePaperTrade(buyEx, symbol, 'buy', amount, buyPrice);
      const sellOrder = executePaperTrade(sellEx, symbol, 'sell', amount, sellPrice);

      const grossProfit = (sellPrice - buyPrice) * amount;
      const totalFees = buyOrder.fee + sellOrder.fee;
      const netProfit = grossProfit - totalFees;

      const execution: ArbitrageExecution = {
        id: uid(), mode: 'paper', buyOrder, sellOrder, symbol, grossProfit, totalFees, netProfit,
        status: buyOrder.status === 'filled' && sellOrder.status === 'filled' ? 'complete' : 'failed',
        timestamp: Date.now(),
      };

      setPaperState((prev) => {
        const next: PaperTradingState = {
          ...prev,
          executions: [execution, ...prev.executions].slice(0, 50),
          totalPnl: prev.totalPnl + (execution.status === 'complete' ? netProfit : 0),
        };
        void persist(next);
        return next;
      });

      return execution;
    },
    [executePaperTrade, persist]
  );

  const resetPaperTrading = useCallback(async () => {
    setPaperState(DEFAULT_PAPER);
    await persist(DEFAULT_PAPER);
  }, [persist]);

  const getPaperBalance = useCallback((asset: string) => paperState.balances[asset]?.amount ?? 0, [paperState.balances]);

  const canAffordTrade = useCallback(
    (symbol: string, side: TradeSide, amount: number, price: number, exchange: ExchangeName): boolean => {
      const [base, quote] = symbol.split('/');
      const fee = price * amount * EXCHANGE_TRADING_FEES[exchange].taker;
      return side === 'buy' ? getPaperBalance(quote) >= price * amount + fee : getPaperBalance(base) >= amount;
    },
    [getPaperBalance]
  );

  return useMemo(
    () => ({ tradeMode, paperState, isLoading, switchMode, executePaperTrade, executePaperArbitrage, resetPaperTrading, getPaperBalance, canAffordTrade }),
    [tradeMode, paperState, isLoading, switchMode, executePaperTrade, executePaperArbitrage, resetPaperTrading, getPaperBalance, canAffordTrade]
  );
});
