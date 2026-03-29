import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TickerData, ExchangeName } from '@/types/exchanges';
import { useExchange } from '@/contexts/ExchangeContext';
import { findTopArbitrageOpportunities, ArbitrageOpportunity } from '@/utils/arbitrage';
import { fetchTickersDirect, DirectTickerResult } from '@/services/directTickerFetcher';
import { trpc } from '@/lib/trpc';

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
  queryError: string | null;
  isFetching: boolean;
  isLoading: boolean;
  isEnabled: boolean;
  refetch: () => void;
}

async function fetchViaTrpc(
  trpcUtils: ReturnType<typeof trpc.useUtils>,
  exchanges: ExchangeName[],
  symbols: string[]
): Promise<{ results: DirectTickerResult[] }> {
  console.log(`[useTickerData] Trying tRPC backend...`);
  const data = await trpcUtils.exchanges.ticker.fetch({ exchanges, symbols });
  console.log(`[useTickerData] tRPC returned ${data.results?.length ?? 0} results`);
  return {
    results: (data.results ?? []).map((r: Record<string, unknown>) => ({
      exchange: r.exchange as ExchangeName,
      symbol: r.symbol as string,
      bid: Number(r.bid ?? 0),
      ask: Number(r.ask ?? 0),
      ts: Number(r.ts ?? Date.now()),
      error: r.error as string | undefined,
    })),
  };
}

export function useTickerData(opportunityLimit: number = 5): UseTickerDataResult {
  const { getEnabledConfigs, getEnabledCryptoPairs } = useExchange();
  const trpcUtils = trpc.useUtils();
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

  const isEnabled = enabledExchanges.length > 0 && symbols.length > 0;

  const { data, isFetching, isLoading, refetch, error: rawQueryError } = useQuery({
    queryKey: ['ticker-data', enabledExchanges, symbols],
    queryFn: async () => {
      console.log(`[useTickerData] Fetching: exchanges=[${enabledExchanges.join(',')}] symbols=[${symbols.join(',')}]`);

      try {
        const result = await fetchViaTrpc(trpcUtils, enabledExchanges, symbols);
        if (result.results.length > 0 && result.results.some((r) => !r.error)) {
          console.log(`[useTickerData] tRPC success: ${result.results.length} results`);
          return result;
        }
        throw new Error('tRPC returned no valid results');
      } catch (trpcErr) {
        console.warn(`[useTickerData] tRPC failed, falling back to direct fetch:`, trpcErr);
      }

      const result = await fetchTickersDirect(enabledExchanges, symbols);
      console.log(`[useTickerData] Direct fetch: ${result.results.length} results`);
      return result;
    },
    enabled: isEnabled,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const queryError = useMemo(() => {
    if (!isEnabled) return 'No exchanges or pairs enabled. Enable them in Settings.';
    if (rawQueryError) {
      const msg = rawQueryError instanceof Error ? rawQueryError.message : JSON.stringify(rawQueryError);
      console.error('[useTickerData] Query error:', msg);
      return `Failed to fetch market data: ${msg}`;
    }
    return null;
  }, [isEnabled, rawQueryError]);

  const tickers: TickerData[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results
      .filter((r: DirectTickerResult) => !r.error)
      .map((r: DirectTickerResult) => ({
        exchange: r.exchange as ExchangeName,
        symbol: r.symbol,
        bidPrice: String(r.bid),
        askPrice: String(r.ask),
        bidQty: '0',
        askQty: '0',
        timestamp: r.ts,
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
      .filter((r: DirectTickerResult) => r.error)
      .map((r: DirectTickerResult, idx: number) => ({
        key: `error-${r.exchange}-${r.symbol}-${idx}`,
        exchange: r.exchange,
        symbol: r.symbol,
        message: r.error ?? 'Unknown error',
      }));
  }, [data]);

  return { tickers, tickersByPair, topOpportunities, errors, queryError, isFetching, isLoading, isEnabled, refetch };
}
