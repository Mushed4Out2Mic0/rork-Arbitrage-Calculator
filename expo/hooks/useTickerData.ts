import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { TickerData, ExchangeName } from '@/types/exchanges';
import { useExchange } from '@/contexts/ExchangeContext';
import { findTopArbitrageOpportunities, ArbitrageOpportunity } from '@/utils/arbitrage';

interface TickerError {
  key: string;
  exchange: string;
  symbol: string;
  message: string;
}

interface UseTickerDataResult {
  tickers: TickerData[];
  tickersByPair: Record<string, TickerData[]>;
  topOpportunities: ArbitrageOpportunity[];
  errors: TickerError[];
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export function useTickerData(opportunityLimit: number = 5): UseTickerDataResult {
  const { getEnabledConfigs, getEnabledCryptoPairs } = useExchange();
  const enabledConfigs = getEnabledConfigs();
  const enabledPairs = getEnabledCryptoPairs();

  const enabledExchanges = useMemo(
    () => enabledConfigs.map((c) => c.name as ExchangeName),
    [enabledConfigs]
  );

  const symbols = useMemo(
    () => enabledPairs.map((p) => p.symbol),
    [enabledPairs]
  );

  const { data, isFetching, isLoading, refetch } = trpc.exchanges.ticker.useQuery(
    { exchanges: enabledExchanges, symbols },
    { enabled: enabledExchanges.length > 0 && symbols.length > 0 }
  );

  const tickers: TickerData[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: Record<string, unknown>) => !r.error)
      .map((r: Record<string, unknown>) => ({
        exchange: r.exchange as ExchangeName,
        symbol: r.symbol as string,
        bidPrice: String(r.bid),
        askPrice: String(r.ask),
        bidQty: '0',
        askQty: '0',
        timestamp: r.ts as number,
      }));
  }, [data]);

  const tickersByPair = useMemo(() => {
    const grouped: Record<string, TickerData[]> = {};
    for (const ticker of tickers) {
      if (!grouped[ticker.symbol]) grouped[ticker.symbol] = [];
      grouped[ticker.symbol].push(ticker);
    }
    return grouped;
  }, [tickers]);

  const topOpportunities = useMemo(
    () => findTopArbitrageOpportunities(tickersByPair, opportunityLimit),
    [tickersByPair, opportunityLimit]
  );

  const errors: TickerError[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: Record<string, unknown>) => r.error)
      .map((r: Record<string, unknown>, idx: number) => ({
        key: `error-${String(r.exchange)}-${String(r.symbol)}-${idx}`,
        exchange: r.exchange as string,
        symbol: r.symbol as string,
        message: r.error as string,
      }));
  }, [data]);

  return { tickers, tickersByPair, topOpportunities, errors, isFetching, isLoading, refetch };
}
