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
      {
        exchange: config.name,
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
      },
      {
        enabled: tradeMode === 'live' && !!config.apiKey && !!config.apiSecret,
        refetchInterval: 30000,
        staleTime: 15000,
      }
    )
  );

  const isAnyLoading = balanceQueries.some((q) => q.isLoading);
  const isAnyFetching = balanceQueries.some((q) => q.isFetching);

  const handleRefresh = useCallback(() => {
    balanceQueries.forEach((q) => q.refetch());
  }, [balanceQueries]);

  const paperBalances = useMemo(() => {
    return Object.entries(paperState.balances).map(([asset, b]) => ({
      asset,
      free: b.amount,
      total: b.amount,
    }));
  }, [paperState.balances]);

  const totalPaperValue = useMemo(() => {
    return paperBalances.reduce((sum, b) => {
      if (b.asset === 'USDT' || b.asset === 'USD') return sum + b.total;
      return sum;
    }, 0);
  }, [paperBalances]);

  return (
    <>
      <Stack.Screen options={{ title: 'Portfolio' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isAnyFetching && !isAnyLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Wallet size={32} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Portfolio</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {tradeMode === 'paper' ? 'Paper Trading Balances' : 'Live Exchange Balances'}
          </Text>
        </View>

        <View style={[styles.modeBanner, { backgroundColor: tradeMode === 'paper' ? theme.warningLight : theme.successLight, borderColor: tradeMode === 'paper' ? theme.warningDark : theme.successDark }]}>
          <View style={styles.modeBannerContent}>
            {tradeMode === 'paper' ? (
              <AlertTriangle size={16} color={theme.warningDark} />
            ) : (
              <DollarSign size={16} color={theme.successDark} />
            )}
            <Text style={[styles.modeBannerText, { color: tradeMode === 'paper' ? theme.warningDark : theme.successDark }]}>
              {tradeMode === 'paper' ? 'PAPER TRADING MODE' : 'LIVE TRADING MODE'}
            </Text>
          </View>
        </View>

        {tradeMode === 'paper' ? (
          <>
            <View style={[styles.summaryCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Paper Portfolio Value</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ${totalPaperValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryItemLabel, { color: theme.textTertiary }]}>Total P&L</Text>
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
            <View style={[styles.paperBalanceCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
              {paperBalances.map((b) => (
                <View key={b.asset} style={[styles.paperBalanceRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={[styles.assetBadge, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.assetText, { color: theme.text }]}>{b.asset}</Text>
                  </View>
                  <Text style={[styles.balanceAmount, { color: theme.text }]}>
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
              <View style={[styles.noKeysCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
                <AlertTriangle size={32} color={theme.warning} />
                <Text style={[styles.noKeysTitle, { color: theme.text }]}>No API Keys Configured</Text>
                <Text style={[styles.noKeysDesc, { color: theme.textSecondary }]}>
                  Add API keys in Settings to view live balances from your exchanges.
                </Text>
              </View>
            ) : (
              configsWithKeys.map((config, index) => {
                const query = balanceQueries[index];
                return (
                  <BalanceCard
                    key={config.name}
                    exchange={config.name}
                    balances={query?.data?.balances ?? []}
                    error={query?.data?.error ?? null}
                    isLoading={query?.isLoading ?? false}
                  />
                );
              })
            )}
          </>
        )}

        {isAnyFetching && !isAnyLoading && (
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modeBanner: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  modeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeBannerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  paperBalanceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  paperBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  assetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  assetText: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  noKeysCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  noKeysTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  noKeysDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
});
