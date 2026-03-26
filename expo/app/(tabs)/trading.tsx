import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Zap, RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTrading } from '@/contexts/TradingContext';
import { useExchange } from '@/contexts/ExchangeContext';
import { trpc } from '@/lib/trpc';
import { useMemo, useCallback } from 'react';
import { findTopArbitrageOpportunities } from '@/utils/arbitrage';
import { TickerData, ExchangeName } from '@/types/exchanges';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

export default function TradingScreen() {
  const { theme } = useTheme();
  const {
    tradeMode,
    switchMode,
    paperState,
    executePaperArbitrage,
    resetPaperTrading,
  } = useTrading();
  const { getEnabledConfigs, getEnabledCryptoPairs, configs } = useExchange();

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

  const { data } = trpc.exchanges.ticker.useQuery(
    { exchanges: enabledExchanges, symbols },
    { enabled: enabledExchanges.length > 0 && symbols.length > 0 }
  );

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
      if (!grouped[ticker.symbol]) grouped[ticker.symbol] = [];
      grouped[ticker.symbol].push(ticker);
    });
    return grouped;
  }, [tickers]);

  const topOpportunities = useMemo(
    () => findTopArbitrageOpportunities(tickersByPair, 5),
    [tickersByPair]
  );

  const executeTradeEndpoint = trpc.exchanges.execute.useMutation();

  const executeLiveArbitrageMutation = useMutation({
    mutationFn: async (params: {
      buyExchange: ExchangeName;
      sellExchange: ExchangeName;
      symbol: string;
      amount: number;
    }) => {
      const buyConfig = configs.find((c) => c.name === params.buyExchange);
      const sellConfig = configs.find((c) => c.name === params.sellExchange);

      if (!buyConfig?.apiKey || !sellConfig?.apiKey) {
        throw new Error('API keys not configured for one or both exchanges');
      }

      const buyResult = await executeTradeEndpoint.mutateAsync({
        exchange: params.buyExchange,
        apiKey: buyConfig.apiKey,
        apiSecret: buyConfig.apiSecret,
        symbol: params.symbol,
        side: 'buy',
        amount: params.amount,
      });

      if (!buyResult.success) {
        throw new Error(`Buy failed: ${buyResult.error}`);
      }

      const sellResult = await executeTradeEndpoint.mutateAsync({
        exchange: params.sellExchange,
        apiKey: sellConfig.apiKey,
        apiSecret: sellConfig.apiSecret,
        symbol: params.symbol,
        side: 'sell',
        amount: params.amount,
      });

      return { buyResult, sellResult };
    },
  });

  const handleExecuteArbitrage = useCallback(
    (opp: (typeof topOpportunities)[0]) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (tradeMode === 'paper') {
        const result = executePaperArbitrage(
          opp.buyExchange,
          opp.sellExchange,
          opp.symbol,
          opp.tradeAmount,
          opp.buyPrice,
          opp.sellPrice
        );

        if (result.status === 'complete') {
          Alert.alert(
            'Paper Trade Executed',
            `Bought on ${opp.buyExchange.toUpperCase()} at $${opp.buyPrice.toFixed(2)}\nSold on ${opp.sellExchange.toUpperCase()} at $${opp.sellPrice.toFixed(2)}\nNet P&L: $${result.netProfit.toFixed(2)}`
          );
        } else {
          Alert.alert('Trade Failed', result.buyOrder.errorMessage || result.sellOrder.errorMessage || 'Unknown error');
        }
      } else {
        Alert.alert(
          'Execute Live Trade?',
          `This will place REAL orders:\n\nBuy ${opp.tradeAmount} ${opp.symbol} on ${opp.buyExchange.toUpperCase()} at ~$${opp.buyPrice.toFixed(2)}\nSell on ${opp.sellExchange.toUpperCase()} at ~$${opp.sellPrice.toFixed(2)}\n\nEstimated profit: $${opp.netProfit.toFixed(2)}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Execute',
              style: 'destructive',
              onPress: () => {
                executeLiveArbitrageMutation.mutate({
                  buyExchange: opp.buyExchange,
                  sellExchange: opp.sellExchange,
                  symbol: opp.symbol,
                  amount: opp.tradeAmount,
                });
              },
            },
          ]
        );
      }
    },
    [tradeMode, executePaperArbitrage, executeLiveArbitrageMutation]
  );

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Paper Trading?',
      'This will reset all paper balances and trade history to defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetPaperTrading(),
        },
      ]
    );
  }, [resetPaperTrading]);

  const recentTrades = useMemo(
    () => paperState.trades.slice(0, 20),
    [paperState.trades]
  );

  const recentExecutions = useMemo(
    () => paperState.executions.slice(0, 10),
    [paperState.executions]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Trading' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Zap size={32} color={theme.warning} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Trading</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Execute arbitrage opportunities
          </Text>
        </View>

        <View style={[styles.modeCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
          <View style={styles.modeRow}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Paper Trading</Text>
              <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Simulated trades, no real money</Text>
            </View>
            <Switch
              value={tradeMode === 'live'}
              onValueChange={(val) => {
                if (val) {
                  Alert.alert(
                    'Switch to Live?',
                    'Live mode will execute REAL trades with REAL money. Make sure your API keys are configured correctly.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Switch to Live', style: 'destructive', onPress: () => switchMode('live') },
                    ]
                  );
                } else {
                  void switchMode('paper');
                }
              }}
              trackColor={{ false: '#F59E0B', true: '#EF4444' }}
              thumbColor="#FFFFFF"
            />
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Live Trading</Text>
              <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Real orders, real money</Text>
            </View>
          </View>
          <View style={[styles.modeIndicator, { backgroundColor: tradeMode === 'paper' ? theme.warningLight : theme.errorLight, borderColor: tradeMode === 'paper' ? theme.warningDark : theme.errorDark }]}>
            {tradeMode === 'paper' ? (
              <AlertTriangle size={16} color={theme.warningDark} />
            ) : (
              <Zap size={16} color={theme.errorDark} />
            )}
            <Text style={[styles.modeIndicatorText, { color: tradeMode === 'paper' ? theme.warningDark : theme.errorDark }]}>
              {tradeMode === 'paper' ? 'PAPER MODE — No real money at risk' : 'LIVE MODE — Real money trades'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Opportunities</Text>
        {topOpportunities.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              No profitable opportunities detected right now. Check back soon.
            </Text>
          </View>
        ) : (
          topOpportunities.map((opp, index) => (
            <View
              key={`${opp.buyExchange}-${opp.sellExchange}-${opp.symbol}-${index}`}
              style={[styles.oppCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}
            >
              <View style={styles.oppHeader}>
                <View style={styles.oppExchanges}>
                  <View style={[styles.buyBadge, { backgroundColor: theme.success }]}>
                    <Text style={styles.badgeText}>BUY</Text>
                  </View>
                  <Text style={[styles.oppExchange, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                  <Text style={[styles.oppArrow, { color: theme.textSecondary }]}>→</Text>
                  <View style={[styles.sellBadge, { backgroundColor: theme.error }]}>
                    <Text style={styles.badgeText}>SELL</Text>
                  </View>
                  <Text style={[styles.oppExchange, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
                </View>
                <View style={[styles.symbolBadge, { backgroundColor: theme.infoLight }]}>
                  <Text style={[styles.symbolText, { color: theme.infoDark }]}>{opp.symbol}</Text>
                </View>
              </View>

              <View style={styles.oppMetrics}>
                <View style={styles.oppMetricRow}>
                  <Text style={[styles.oppMetricLabel, { color: theme.textSecondary }]}>Buy at:</Text>
                  <Text style={[styles.oppMetricValue, { color: theme.text }]}>${opp.buyPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.oppMetricRow}>
                  <Text style={[styles.oppMetricLabel, { color: theme.textSecondary }]}>Sell at:</Text>
                  <Text style={[styles.oppMetricValue, { color: theme.text }]}>${opp.sellPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.oppMetricRow}>
                  <Text style={[styles.oppMetricLabel, { color: theme.textSecondary }]}>Est. Net Profit:</Text>
                  <Text style={[styles.oppMetricValue, { color: theme.successDark, fontWeight: '700' as const }]}>
                    ${opp.netProfit.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.executeButton,
                  { backgroundColor: tradeMode === 'paper' ? theme.warning : theme.success },
                ]}
                onPress={() => handleExecuteArbitrage(opp)}
                activeOpacity={0.8}
                testID={`execute-btn-${index}`}
              >
                <Zap size={16} color="#FFFFFF" />
                <Text style={styles.executeButtonText}>
                  {tradeMode === 'paper' ? 'Paper Trade' : 'Execute Live'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {tradeMode === 'paper' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Executions</Text>
              {paperState.executions.length > 0 && (
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                  <RotateCcw size={14} color={theme.error} />
                  <Text style={[styles.resetText, { color: theme.error }]}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentExecutions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                  No trades yet. Execute an opportunity above to start paper trading.
                </Text>
              </View>
            ) : (
              recentExecutions.map((exec) => (
                <View
                  key={exec.id}
                  style={[
                    styles.executionCard,
                    {
                      backgroundColor: theme.surface,
                      shadowColor: theme.cardShadow,
                      borderLeftColor: exec.status === 'complete' ? theme.success : theme.error,
                    },
                  ]}
                >
                  <View style={styles.executionHeader}>
                    <View style={styles.executionStatus}>
                      {exec.status === 'complete' ? (
                        <CheckCircle size={16} color={theme.success} />
                      ) : (
                        <XCircle size={16} color={theme.error} />
                      )}
                      <Text style={[styles.executionStatusText, { color: exec.status === 'complete' ? theme.successDark : theme.errorDark }]}>
                        {exec.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.executionTime}>
                      <Clock size={12} color={theme.textTertiary} />
                      <Text style={[styles.executionTimeText, { color: theme.textTertiary }]}>
                        {new Date(exec.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.executionDesc, { color: theme.textSecondary }]}>
                    {exec.buyOrder.exchange.toUpperCase()} → {exec.sellOrder.exchange.toUpperCase()} • {exec.symbol}
                  </Text>
                  <View style={styles.executionMetrics}>
                    <Text style={[styles.executionPnl, { color: exec.netProfit >= 0 ? theme.successDark : theme.errorDark }]}>
                      {exec.netProfit >= 0 ? '+' : ''}${exec.netProfit.toFixed(4)}
                    </Text>
                    <Text style={[styles.executionFees, { color: theme.textTertiary }]}>
                      Fees: ${exec.totalFees.toFixed(4)}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>Trade Log</Text>
            {recentTrades.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No trades logged yet.</Text>
              </View>
            ) : (
              recentTrades.map((trade) => (
                <View
                  key={trade.id}
                  style={[
                    styles.tradeLogRow,
                    {
                      backgroundColor: theme.surface,
                      borderLeftColor: trade.side === 'buy' ? theme.success : theme.error,
                    },
                  ]}
                >
                  <View style={styles.tradeLogHeader}>
                    <View style={[styles.tradeSideBadge, { backgroundColor: trade.side === 'buy' ? theme.success : theme.error }]}>
                      <Text style={styles.tradeSideText}>{trade.side.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.tradeExchange, { color: theme.text }]}>{trade.exchange.toUpperCase()}</Text>
                    <Text style={[styles.tradeSymbol, { color: theme.textSecondary }]}>{trade.symbol}</Text>
                  </View>
                  <View style={styles.tradeLogDetails}>
                    <Text style={[styles.tradeDetail, { color: theme.text }]}>
                      {trade.amount} @ ${trade.price.toFixed(2)}
                    </Text>
                    <View style={styles.tradeStatusRow}>
                      {trade.status === 'filled' ? (
                        <CheckCircle size={12} color={theme.success} />
                      ) : (
                        <XCircle size={12} color={theme.error} />
                      )}
                      <Text style={[styles.tradeStatusText, { color: trade.status === 'filled' ? theme.success : theme.error }]}>
                        {trade.status}
                      </Text>
                    </View>
                  </View>
                  {trade.errorMessage && (
                    <Text style={[styles.tradeError, { color: theme.errorDark }]}>{trade.errorMessage}</Text>
                  )}
                </View>
              ))
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
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
  modeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  modeDesc: {
    fontSize: 11,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeIndicatorText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  oppCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  oppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  oppExchanges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  buyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  oppExchange: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  oppArrow: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  symbolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  symbolText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  oppMetrics: {
    gap: 6,
    marginBottom: 14,
  },
  oppMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oppMetricLabel: {
    fontSize: 13,
  },
  oppMetricValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  executeButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  executionCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  executionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  executionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  executionStatusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  executionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  executionTimeText: {
    fontSize: 11,
  },
  executionDesc: {
    fontSize: 13,
    marginBottom: 6,
  },
  executionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  executionPnl: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  executionFees: {
    fontSize: 11,
  },
  tradeLogRow: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  tradeLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tradeSideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradeSideText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tradeExchange: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  tradeSymbol: {
    fontSize: 12,
  },
  tradeLogDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeDetail: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  tradeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tradeStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tradeError: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 32,
  },
});
