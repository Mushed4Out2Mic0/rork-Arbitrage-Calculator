import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Wallet, RefreshCw, AlertTriangle, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTrading } from '@/contexts/TradingContext';
import { trpc } from '@/lib/trpc';
import { BalanceCard } from '@/components/market/BalanceCard';
import { useMemo, useCallback } from 'react';

export default function PortfolioScreen() {
  const { theme } = useTheme();
  const { getEnabledConfigs } = useExchange();
  const { tradeMode, paperState } = useTrading();
  const enabledConfigs = getEnabledConfigs();

  const configsWithKeys = useMemo(
    () => enabledConfigs.filter((c) => c.apiKey && c.apiSecret),
    [enabledConfigs]
  );

  const balanceQueries = configsWithKeys.map((config) =>
    trpc.exchanges.balance.useQuery(
      { exchange: config.name, apiKey: config.apiKey, apiSecret: config.apiSecret },
      { enabled: tradeMode === 'live' && !!config.apiKey && !!config.apiSecret, refetchInterval: 30000, staleTime: 15000 }
    )
  );

  const isAnyFetching = balanceQueries.some((q) => q.isFetching);
  const isAnyLoading = balanceQueries.some((q) => q.isLoading);

  const handleRefresh = useCallback(() => {
    balanceQueries.forEach((q) => q.refetch());
  }, [balanceQueries]);

  const paperBalances = useMemo(
    () => Object.entries(paperState.balances).map(([asset, b]) => ({ asset, free: b.amount, total: b.amount })),
    [paperState.balances]
  );

  const totalPaperValue = useMemo(
    () => paperBalances.reduce((sum, b) => (b.asset === 'USDT' || b.asset === 'USD' ? sum + b.total : sum), 0),
    [paperBalances]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Portfolio' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isAnyFetching && !isAnyLoading} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Wallet size={28} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Portfolio</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {tradeMode === 'paper' ? 'Paper Trading Balances' : 'Live Exchange Balances'}
          </Text>
        </View>

        <View style={[styles.modeBanner, { backgroundColor: tradeMode === 'paper' ? theme.warningLight : theme.successLight, borderColor: tradeMode === 'paper' ? theme.warning : theme.success }]}>
          {tradeMode === 'paper' ? <AlertTriangle size={14} color={theme.warningDark} /> : <DollarSign size={14} color={theme.successDark} />}
          <Text style={[styles.modeBannerText, { color: tradeMode === 'paper' ? theme.warningDark : theme.successDark }]}>
            {tradeMode === 'paper' ? 'PAPER MODE' : 'LIVE MODE'}
          </Text>
        </View>

        {tradeMode === 'paper' ? (
          <>
            <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Paper Portfolio Value</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ${totalPaperValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>P&L</Text>
                  <Text style={[styles.summaryItemValue, { color: paperState.totalPnl >= 0 ? theme.success : theme.error }]}>
                    {paperState.totalPnl >= 0 ? '+' : ''}${paperState.totalPnl.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>Trades</Text>
                  <Text style={[styles.summaryItemValue, { color: theme.text }]}>{paperState.tradeCount}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>Initial</Text>
                  <Text style={[styles.summaryItemValue, { color: theme.text }]}>${paperState.initialCapital.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Paper Balances</Text>
            <View style={[styles.balanceList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {paperBalances.map((b) => (
                <View key={b.asset} style={[styles.balanceRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={[styles.assetTag, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.assetText, { color: theme.text }]}>{b.asset}</Text>
                  </View>
                  <Text style={[styles.balanceAmt, { color: theme.text }]}>
                    {b.total < 1 ? b.total.toFixed(8) : b.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </Text>
                </View>
              ))}
              {paperBalances.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No paper balances</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {configsWithKeys.length === 0 ? (
              <View style={[styles.noKeysCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <AlertTriangle size={28} color={theme.warning} />
                <Text style={[styles.noKeysTitle, { color: theme.text }]}>No API Keys Configured</Text>
                <Text style={[styles.noKeysDesc, { color: theme.textSecondary }]}>
                  Add API keys in Settings to view live balances.
                </Text>
              </View>
            ) : (
              configsWithKeys.map((config, i) => {
                const q = balanceQueries[i];
                return (
                  <BalanceCard
                    key={config.name}
                    exchange={config.name}
                    balances={q?.data?.balances ?? []}
                    error={q?.data?.error ?? null}
                    isLoading={q?.isLoading ?? false}
                  />
                );
              })
            )}
          </>
        )}

        {isAnyFetching && !isAnyLoading && (
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
  header: { alignItems: 'center', marginBottom: 16, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  modeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  modeBannerText: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.8 },
  summaryCard: { borderRadius: 14, padding: 18, marginBottom: 18, borderWidth: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '500' as const, marginBottom: 4 },
  summaryValue: { fontSize: 30, fontWeight: '700' as const, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center' },
  summaryItemLabel: { fontSize: 10, fontWeight: '500' as const, marginBottom: 3 },
  summaryItemValue: { fontSize: 15, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 10, paddingHorizontal: 2 },
  balanceList: { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  assetTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, minWidth: 45, alignItems: 'center' },
  assetText: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
  balanceAmt: { fontSize: 14, fontWeight: '600' as const },
  emptyText: { fontSize: 12, textAlign: 'center', paddingVertical: 14 },
  noKeysCard: { borderRadius: 14, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1 },
  noKeysTitle: { fontSize: 16, fontWeight: '700' as const },
  noKeysDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  refreshRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  refreshText: { fontSize: 11 },
  bottomPad: { height: 20 },
});
