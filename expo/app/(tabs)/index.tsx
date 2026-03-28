import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { useTickerData } from '@/hooks/useTickerData';
import { TickerCard } from '@/components/market/TickerCard';
import { ComparisonCard } from '@/components/market/ComparisonCard';
import { ExecutionCostCard } from '@/components/market/ExecutionCostCard';
import { ArbitrageOpportunitiesCard } from '@/components/market/ArbitrageOpportunitiesCard';

export default function MarketScreen() {
  const { globalMode, getEnabledCryptoPairs } = useExchange();
  const { theme } = useTheme();
  const enabledPairs = getEnabledCryptoPairs();
  const { tickers, tickersByPair, topOpportunities, errors, queryError, isFetching, isLoading, isEnabled, refetch } = useTickerData(5);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Market',
          headerRight: () => (
            <View style={[
              styles.modeBadge,
              {
                backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight,
                borderColor: globalMode === 'live' ? theme.success : theme.warning,
              },
            ]}>
              <Text style={[styles.modeText, { color: globalMode === 'live' ? theme.successDark : theme.warningDark }]}>
                {globalMode.toUpperCase()}
              </Text>
            </View>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        testID="market-scroll"
      >
        <View style={styles.header}>
          <TrendingUp size={28} color={theme.success} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Crypto Market</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Real-time prices across exchanges
          </Text>
          {enabledPairs.length > 0 && (
            <View style={styles.chipRow}>
              {enabledPairs.map((p) => (
                <View key={p.name} style={[styles.chip, { backgroundColor: theme.tint }]}>
                  <Text style={styles.chipText}>{p.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {!isEnabled ? (
          <View style={styles.loadingBox}>
            <AlertCircle size={32} color={theme.warning} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Data Sources</Text>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Enable exchanges and crypto pairs in Settings to see live market data.
            </Text>
          </View>
        ) : queryError && tickers.length === 0 ? (
          <View style={styles.loadingBox}>
            <AlertCircle size={32} color={theme.error} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Connection Error</Text>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{queryError}</Text>
          </View>
        ) : isLoading && tickers.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading market data...</Text>
          </View>
        ) : tickers.length === 0 && !isFetching ? (
          <View style={styles.loadingBox}>
            <AlertCircle size={32} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Market Data</Text>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Pull down to refresh, or check your exchange settings.
            </Text>
          </View>
        ) : (
          <>
            {enabledPairs.map((pair) => {
              const pairTickers = tickersByPair[pair.symbol] || [];
              return (
                <View key={pair.symbol} style={styles.pairSection}>
                  <View style={styles.pairHeader}>
                    <Text style={[styles.pairTitle, { color: theme.text }]}>{pair.displayName}</Text>
                    <View style={[styles.pairBadge, { backgroundColor: theme.infoLight }]}>
                      <Text style={[styles.pairBadgeText, { color: theme.infoDark }]}>{pair.symbol}</Text>
                    </View>
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

            {errors.length > 0 && (
              <View style={styles.errorsSection}>
                {errors.map((err) => (
                  <View key={err.key} style={[styles.errorRow, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
                    <AlertCircle size={16} color={theme.error} />
                    <View style={styles.errorContent}>
                      <Text style={[styles.errorLabel, { color: theme.errorDark }]}>[{err.exchange}] {err.symbol}</Text>
                      <Text style={[styles.errorMsg, { color: theme.errorDark }]}>{err.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {isFetching && !isLoading && (
          <View style={styles.refreshRow}>
            <RefreshCw size={14} color={theme.textTertiary} />
            <Text style={[styles.refreshText, { color: theme.textTertiary }]}>Updating...</Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 4,
  },
  modeText: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 11, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  loadingBox: { alignItems: 'center', paddingVertical: 50 },
  loadingText: { marginTop: 14, fontSize: 13, textAlign: 'center' as const, lineHeight: 19, paddingHorizontal: 20 },
  emptyTitle: { marginTop: 12, fontSize: 17, fontWeight: '700' as const },
  pairSection: { marginBottom: 20 },
  pairHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 2 },
  pairTitle: { fontSize: 20, fontWeight: '700' as const },
  pairBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pairBadgeText: { fontSize: 12, fontWeight: '600' as const },
  errorsSection: { gap: 8, marginTop: 8 },
  errorRow: { borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1 },
  errorContent: { flex: 1, gap: 2 },
  errorLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.3 },
  errorMsg: { fontSize: 12, lineHeight: 17 },
  refreshRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  refreshText: { fontSize: 11 },
  bottomPad: { height: 20 },
});
