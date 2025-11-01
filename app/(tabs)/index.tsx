import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { TickerData } from '@/types/exchanges';
import { REFRESH_INTERVAL } from '@/constants/exchanges';
import { Stack } from 'expo-router';
import { useMemo, useEffect } from 'react';
import { trpcClient } from '@/lib/trpc';
import { findTopArbitrageOpportunities } from '@/utils/arbitrage';
import { TickerCard } from '@/components/market/TickerCard';
import { ComparisonCard } from '@/components/market/ComparisonCard';
import { ExecutionCostCard } from '@/components/market/ExecutionCostCard';
import { ArbitrageOpportunitiesCard } from '@/components/market/ArbitrageOpportunitiesCard';

export default function MarketScreen() {
  const queryClient = useQueryClient();
  const { getEnabledConfigs, globalMode, getEnabledCryptoPairs } = useExchange();
  const enabledConfigs = getEnabledConfigs();
  const enabledPairs = getEnabledCryptoPairs();

  const queryKeys = useMemo(
    () => enabledConfigs.flatMap((config) =>
      enabledPairs.map((pair) => ['ticker', config.name, config.mode, pair.symbol])
    ),
    [enabledConfigs, enabledPairs]
  );

  useEffect(() => {
    const allTickerKeys = queryClient.getQueryCache().findAll({
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'ticker'
    });

    allTickerKeys.forEach((query) => {
      const isActive = queryKeys.some(
        (key) => JSON.stringify(key) === JSON.stringify(query.queryKey)
      );
      
      if (!isActive) {
        console.log('[Cleanup] Removing inactive query:', query.queryKey);
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryKeys, queryClient]);

  const queries = useQueries({
    queries: enabledConfigs.flatMap((config) =>
      enabledPairs.map((pair) => ({
        queryKey: ['ticker', config.name, config.mode, pair.symbol],
        queryFn: async ({ signal }) => {
          console.log(`[Query] Fetching ${config.name} ${pair.symbol}`);
          
          if (signal?.aborted) {
            throw new Error('Query aborted');
          }

          try {
            const result = await trpcClient.exchanges.ticker.query({
              exchange: config.name,
              mode: config.mode,
              pairSymbol: pair.symbol,
            });
            console.log(`[Query] Received ${config.name} ${pair.symbol}:`, result.bidPrice, result.askPrice);
            return result;
          } catch (error) {
            if (signal?.aborted) {
              throw new Error('Query aborted');
            }
            throw error;
          }
        },
        refetchInterval: REFRESH_INTERVAL,
        refetchIntervalInBackground: true,
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
        staleTime: 0,
        gcTime: 1000,
        networkMode: 'always' as const,
        refetchOnMount: 'always' as const,
        refetchOnWindowFocus: true,
        enabled: config.enabled && pair.enabled,
      }))
    ),
  });

  const isAnyLoading = queries.some((q) => q.isLoading);
  const isAnyRefetching = queries.some((q) => q.isRefetching);

  const handleRefresh = () => {
    queries.forEach((q) => q.refetch());
  };

  const tickers = queries
    .map((q) => q.data)
    .filter((data): data is TickerData => data !== undefined);

  const tickersByPair = useMemo(() => {
    const grouped: Record<string, TickerData[]> = {};
    tickers.forEach((ticker) => {
      if (!grouped[ticker.symbol]) {
        grouped[ticker.symbol] = [];
      }
      grouped[ticker.symbol].push(ticker);
    });
    return grouped;
  }, [tickers]);

  const topOpportunities = useMemo(
    () => findTopArbitrageOpportunities(tickersByPair, 5),
    [tickersByPair]
  );

  const queriesData = queries.map(q => ({
    isError: q.isError,
    error: q.error,
  }));

  const errors = useMemo(() => {
    return queriesData
      .map((query, queryIndex) => {
        if (!query.isError || !query.error) return null;
        
        const configIndex = Math.floor(queryIndex / enabledPairs.length);
        const pairIndex = queryIndex % enabledPairs.length;
        const config = enabledConfigs[configIndex];
        const pair = enabledPairs[pairIndex];
        
        if (!config || !pair) return null;
        
        return {
          key: `error-${config.name}-${pair.symbol}`,
          exchange: config.displayName,
          symbol: pair.symbol,
          message: (query.error as Error)?.message || 'Connection failed',
        };
      })
      .filter((error): error is NonNullable<typeof error> => error !== null);
  }, [queriesData, enabledConfigs, enabledPairs]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Market',
          headerRight: () => (
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.modeBadge,
                  globalMode === 'live' ? styles.modeBadgeLive : styles.modeBadgeSandbox,
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    globalMode === 'live' ? styles.modeTextLive : styles.modeTextSandbox,
                  ]}
                >
                  {globalMode.toUpperCase()}
                </Text>
              </View>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isAnyRefetching && !isAnyLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TrendingUp size={32} color="#10B981" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Crypto Market</Text>
          <Text style={styles.subtitle}>Real-time bid/ask prices from multiple exchanges</Text>
          {enabledPairs.length > 0 && (
            <View style={styles.enabledPairsRow}>
              {enabledPairs.map((pair) => (
                <View key={pair.name} style={styles.pairChip}>
                  <Text style={styles.pairChipText}>{pair.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isAnyLoading && tickers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading market data...</Text>
          </View>
        ) : (
          <>
            {enabledPairs.map((pair) => {
              const pairTickers = tickersByPair[pair.symbol] || [];
              
              return (
                <View key={pair.symbol} style={styles.pairSection}>
                  <View style={styles.pairHeader}>
                    <Text style={styles.pairTitle}>{pair.displayName}</Text>
                    <Text style={styles.pairSymbol}>{pair.symbol}</Text>
                  </View>

                  {pairTickers.map((ticker) => (
                    <TickerCard key={`${ticker.exchange}-${ticker.symbol}`} ticker={ticker} />
                  ))}

                  {pairTickers.length > 1 && (
                    <>
                      <ComparisonCard tickers={pairTickers} />
                      <ExecutionCostCard tickers={pairTickers} />
                    </>
                  )}
                </View>
              );
            })}

            <ArbitrageOpportunitiesCard opportunities={topOpportunities} />

            {errors.length > 0 && errors.map((error) => (
              <View key={error.key} style={styles.errorCard}>
                <AlertCircle size={20} color="#EF4444" />
                <View style={styles.errorTextContainer}>
                  <Text style={styles.errorExchange}>
                    [{error.exchange}] {error.symbol}
                  </Text>
                  <Text style={styles.errorText}>{error.message}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {isAnyRefetching && !isAnyLoading && (
          <View style={styles.refreshIndicator}>
            <RefreshCw size={16} color="#6B7280" />
            <Text style={styles.refreshText}>Updating...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  headerRight: {
    marginRight: 8,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeBadgeLive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  modeBadgeSandbox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  modeTextLive: {
    color: '#059669',
  },
  modeTextSandbox: {
    color: '#D97706',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  errorTextContainer: {
    flex: 1,
    gap: 4,
  },
  errorExchange: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#991B1B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  refreshText: {
    fontSize: 12,
    color: '#6B7280',
  },
  enabledPairsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pairChip: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pairChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pairSection: {
    marginBottom: 24,
  },
  pairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pairTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
  },
  pairSymbol: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
