import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TickerData } from '@/types/exchanges';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { findTopArbitrageOpportunities } from '@/utils/arbitrage';
import { TickerCard } from '@/components/market/TickerCard';
import { ComparisonCard } from '@/components/market/ComparisonCard';
import { ExecutionCostCard } from '@/components/market/ExecutionCostCard';
import { ArbitrageOpportunitiesCard } from '@/components/market/ArbitrageOpportunitiesCard';

export default function MarketScreen() {
  const { getEnabledConfigs, globalMode, getEnabledCryptoPairs } = useExchange();
  const { theme } = useTheme();
  const enabledConfigs = getEnabledConfigs();
  const enabledPairs = getEnabledCryptoPairs();

  const enabledExchanges = useMemo(
    () => enabledConfigs.map((c) => c.name as "kraken" | "coinbase" | "binance" | "bybit"),
    [enabledConfigs]
  );
  
  const symbols = useMemo(
    () => enabledPairs.map((p) => p.symbol),
    [enabledPairs]
  );

  const { data, isFetching, isLoading, refetch } = trpc.exchanges.ticker.useQuery(
    { exchanges: enabledExchanges, symbols },
    { 
      enabled: enabledExchanges.length > 0 && symbols.length > 0,
    }
  );

  const handleRefresh = () => {
    refetch();
  };

  const tickers: TickerData[] = useMemo(() => {
    if (!data?.results) return [];
    
    return data.results
      .filter((r: any) => !r.error)
      .map((r: any) => ({
        exchange: r.exchange,
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

  const errors = useMemo(() => {
    if (!data?.results) return [];
    
    return data.results
      .filter((r: any) => r.error)
      .map((r: any, idx: number) => ({
        key: `error-${r.exchange}-${r.symbol}-${idx}`,
        exchange: r.exchange,
        symbol: r.symbol,
        message: r.error,
      }));
  }, [data]);

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
                  {
                    backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight,
                    borderColor: globalMode === 'live' ? theme.successDark : theme.warningDark,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    { color: globalMode === 'live' ? theme.successDark : theme.warningDark },
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
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TrendingUp size={32} color={theme.success} strokeWidth={2.5} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Crypto Market</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Real-time bid/ask prices from multiple exchanges</Text>
          {enabledPairs.length > 0 && (
            <View style={styles.enabledPairsRow}>
              {enabledPairs.map((pair) => (
                <View key={pair.name} style={[styles.pairChip, { backgroundColor: theme.successDark }]}>
                  <Text style={styles.pairChipText}>{pair.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isLoading && tickers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading market data...</Text>
          </View>
        ) : (
          <>
            {enabledPairs.map((pair) => {
              const pairTickers = tickersByPair[pair.symbol] || [];
              
              return (
                <View key={pair.symbol} style={styles.pairSection}>
                  <View style={styles.pairHeader}>
                    <Text style={[styles.pairTitle, { color: theme.text }]}>{pair.displayName}</Text>
                    <Text style={[styles.pairSymbol, { color: theme.successDark, backgroundColor: theme.successLight }]}>{pair.symbol}</Text>
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
              <View key={error.key} style={[styles.errorCard, { backgroundColor: theme.errorLight }]}>
                <AlertCircle size={20} color={theme.error} />
                <View style={styles.errorTextContainer}>
                  <Text style={[styles.errorExchange, { color: theme.errorDark }]}>
                    [{error.exchange}] {error.symbol}
                  </Text>
                  <Text style={[styles.errorText, { color: theme.errorDark }]}>{error.message}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {isFetching && !isLoading && (
          <View style={styles.refreshIndicator}>
            <RefreshCw size={16} color={theme.textSecondary} />
            <Text style={[styles.refreshText, { color: theme.textSecondary }]}>Updating...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  modeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  },
  errorCard: {
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 13,
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
  },
  enabledPairsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pairChip: {
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
  },
  pairSymbol: {
    fontSize: 14,
    fontWeight: '600' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
