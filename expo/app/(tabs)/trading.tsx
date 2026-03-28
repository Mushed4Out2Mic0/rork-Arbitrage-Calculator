import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Zap, RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTrading } from '@/contexts/TradingContext';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTickerData } from '@/hooks/useTickerData';
import { trpc } from '@/lib/trpc';
import { useMemo, useCallback } from 'react';
import { ExchangeName } from '@/types/exchanges';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LivePriceTicker } from '@/components/trading/LivePriceTicker';
import { PaperExecutionSimulator } from '@/components/trading/PaperExecutionSimulator';

export default function TradingScreen() {
  const { theme } = useTheme();
  const { tradeMode, switchMode, paperState, executePaperArbitrage, resetPaperTrading } = useTrading();
  const { configs } = useExchange();
  const { tickers, topOpportunities, isFetching, isLoading, queryError, isEnabled, refetch } = useTickerData(5);

  const executeTradeEndpoint = trpc.exchanges.execute.useMutation();

  const executeLiveMutation = useMutation({
    mutationFn: async (params: { buyExchange: ExchangeName; sellExchange: ExchangeName; symbol: string; amount: number }) => {
      const buyConfig = configs.find((c) => c.name === params.buyExchange);
      const sellConfig = configs.find((c) => c.name === params.sellExchange);
      if (!buyConfig?.apiKey || !sellConfig?.apiKey) throw new Error('API keys not configured');

      const buyResult = await executeTradeEndpoint.mutateAsync({
        exchange: params.buyExchange, apiKey: buyConfig.apiKey, apiSecret: buyConfig.apiSecret,
        symbol: params.symbol, side: 'buy', amount: params.amount,
      });
      if (!buyResult.success) throw new Error(`Buy failed: ${buyResult.error}`);

      const sellResult = await executeTradeEndpoint.mutateAsync({
        exchange: params.sellExchange, apiKey: sellConfig.apiKey, apiSecret: sellConfig.apiSecret,
        symbol: params.symbol, side: 'sell', amount: params.amount,
      });
      return { buyResult, sellResult };
    },
  });

  const handleExecute = useCallback((opp: (typeof topOpportunities)[0]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tradeMode === 'paper') {
      const result = executePaperArbitrage(opp.buyExchange, opp.sellExchange, opp.symbol, opp.tradeAmount, opp.buyPrice, opp.sellPrice);
      if (result.status === 'complete') {
        Alert.alert(
          'Paper Trade Executed',
          `${opp.symbol} • ${opp.tradeAmount} units\n` +
          `Buy ${opp.buyExchange.toUpperCase()} @ ${opp.buyPrice.toFixed(2)}\n` +
          `Sell ${opp.sellExchange.toUpperCase()} @ ${opp.sellPrice.toFixed(2)}\n` +
          `Gross: ${result.grossProfit.toFixed(4)}\n` +
          `Fees: ${result.totalFees.toFixed(4)}\n` +
          `Net P&L: ${result.netProfit.toFixed(4)}\n` +
          `Executed at live prices`
        );
      } else {
        Alert.alert('Trade Failed', result.buyOrder.errorMessage || result.sellOrder.errorMessage || 'Unknown error');
      }
    } else {
      Alert.alert(
        'Execute Live Trade?',
        `REAL orders:\nBuy ${opp.tradeAmount} ${opp.symbol} on ${opp.buyExchange.toUpperCase()}\nSell on ${opp.sellExchange.toUpperCase()}\nEst. profit: $${opp.netProfit.toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Execute', style: 'destructive',
            onPress: () => executeLiveMutation.mutate({ buyExchange: opp.buyExchange, sellExchange: opp.sellExchange, symbol: opp.symbol, amount: opp.tradeAmount }),
          },
        ]
      );
    }
  }, [tradeMode, executePaperArbitrage, executeLiveMutation]);

  const handleReset = useCallback(() => {
    Alert.alert('Reset Paper Trading?', 'All paper balances and history will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetPaperTrading() },
    ]);
  }, [resetPaperTrading]);

  const recentExecutions = useMemo(() => paperState.executions.slice(0, 10), [paperState.executions]);
  const recentTrades = useMemo(() => paperState.trades.slice(0, 20), [paperState.trades]);

  return (
    <>
      <Stack.Screen options={{ title: 'Trading' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <Zap size={28} color={theme.warning} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Trading</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Execute arbitrage opportunities</Text>
        </View>

        <LivePriceTicker tickers={tickers} isFetching={isFetching} />

        <View style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.modeRow}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Paper</Text>
              <Text style={[styles.modeDesc, { color: theme.textTertiary }]}>Simulated</Text>
            </View>
            <Switch
              value={tradeMode === 'live'}
              onValueChange={(val) => {
                if (val) {
                  Alert.alert('Switch to Live?', 'Live mode executes REAL trades with REAL money.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go Live', style: 'destructive', onPress: () => switchMode('live') },
                  ]);
                } else {
                  void switchMode('paper');
                }
              }}
              trackColor={{ false: theme.warning, true: theme.error }}
              thumbColor="#FFFFFF"
            />
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Live</Text>
              <Text style={[styles.modeDesc, { color: theme.textTertiary }]}>Real money</Text>
            </View>
          </View>
          <View style={[styles.modeIndicator, { backgroundColor: tradeMode === 'paper' ? theme.warningLight : theme.errorLight, borderColor: tradeMode === 'paper' ? theme.warning : theme.error }]}>
            {tradeMode === 'paper' ? <AlertTriangle size={14} color={theme.warningDark} /> : <Zap size={14} color={theme.errorDark} />}
            <Text style={[styles.modeIndicatorText, { color: tradeMode === 'paper' ? theme.warningDark : theme.errorDark }]}>
              {tradeMode === 'paper' ? 'PAPER — No real money' : 'LIVE — Real money trades'}
            </Text>
          </View>
        </View>

        {tradeMode === 'paper' && topOpportunities.length > 0 && (
          <PaperExecutionSimulator opportunities={topOpportunities} isFetching={isFetching} />
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Opportunities</Text>
          {isFetching && (
            <View style={styles.fetchingIndicator}>
              <Activity size={12} color={theme.tint} />
              <Text style={[styles.fetchingText, { color: theme.tint }]}>Live</Text>
            </View>
          )}
        </View>

        {queryError && tickers.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
            <AlertTriangle size={18} color={theme.error} />
            <Text style={[styles.emptyText, { color: theme.errorDark, marginTop: 6 }]}>{queryError}</Text>
          </View>
        )}

        {!isEnabled && (
          <View style={[styles.emptyCard, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
            <AlertTriangle size={18} color={theme.warning} />
            <Text style={[styles.emptyText, { color: theme.warningDark, marginTop: 6 }]}>Enable exchanges and pairs in Settings to see opportunities.</Text>
          </View>
        )}

        {isEnabled && !queryError && topOpportunities.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>{isLoading ? 'Loading market data...' : 'No profitable opportunities right now.'}</Text>
          </View>
        ) : (
          topOpportunities.map((opp, i) => (
            <View key={`${opp.buyExchange}-${opp.sellExchange}-${opp.symbol}-${i}`} style={[styles.oppCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.oppHeader}>
                <View style={styles.oppFlow}>
                  <View style={[styles.sideBadge, { backgroundColor: theme.success }]}><Text style={styles.sideText}>BUY</Text></View>
                  <Text style={[styles.oppEx, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                  <Text style={[styles.oppArrow, { color: theme.textTertiary }]}>→</Text>
                  <View style={[styles.sideBadge, { backgroundColor: theme.error }]}><Text style={styles.sideText}>SELL</Text></View>
                  <Text style={[styles.oppEx, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
                </View>
                <View style={[styles.symbolTag, { backgroundColor: theme.infoLight }]}>
                  <Text style={[styles.symbolText, { color: theme.infoDark }]}>{opp.symbol}</Text>
                </View>
              </View>

              <View style={styles.oppMetrics}>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Buy at</Text><Text style={[styles.metricVal, { color: theme.text }]}>${opp.buyPrice.toFixed(2)}</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Sell at</Text><Text style={[styles.metricVal, { color: theme.text }]}>${opp.sellPrice.toFixed(2)}</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Spread</Text><Text style={[styles.metricVal, { color: theme.tint }]}>{opp.percentDeviation.toFixed(3)}%</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Fees</Text><Text style={[styles.metricVal, { color: theme.error }]}>${opp.totalCost.toFixed(4)}</Text></View>
                <View style={styles.metricRow}><Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Net Profit</Text><Text style={[styles.metricVal, { color: theme.successDark, fontWeight: '700' as const }]}>${opp.netProfit.toFixed(4)}</Text></View>
                <View style={[styles.liveTag, { backgroundColor: theme.success + '15' }]}>
                  <View style={[styles.liveDotSmall, { backgroundColor: theme.success }]} />
                  <Text style={[styles.liveTagText, { color: theme.success }]}>Live price @ {new Date().toLocaleTimeString()}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.execBtn, { backgroundColor: tradeMode === 'paper' ? theme.warning : theme.success }]}
                onPress={() => handleExecute(opp)}
                activeOpacity={0.7}
                testID={`execute-btn-${i}`}
              >
                <Zap size={14} color="#FFF" />
                <Text style={styles.execBtnText}>{tradeMode === 'paper' ? 'Paper Trade' : 'Execute Live'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {tradeMode === 'paper' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Executions</Text>
              {paperState.executions.length > 0 && (
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                  <RotateCcw size={12} color={theme.error} />
                  <Text style={[styles.resetText, { color: theme.error }]}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentExecutions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No trades yet. Execute an opportunity above.</Text>
              </View>
            ) : (
              recentExecutions.map((exec) => (
                <View key={exec.id} style={[styles.execCard, { backgroundColor: theme.surface, borderLeftColor: exec.status === 'complete' ? theme.success : theme.error, borderColor: theme.border }]}>
                  <View style={styles.execHeader}>
                    <View style={styles.execStatus}>
                      {exec.status === 'complete' ? <CheckCircle size={14} color={theme.success} /> : <XCircle size={14} color={theme.error} />}
                      <Text style={[styles.execStatusText, { color: exec.status === 'complete' ? theme.successDark : theme.errorDark }]}>{exec.status.toUpperCase()}</Text>
                    </View>
                    <View style={styles.execTime}>
                      <Clock size={10} color={theme.textTertiary} />
                      <Text style={[styles.execTimeText, { color: theme.textTertiary }]}>{new Date(exec.timestamp).toLocaleTimeString()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.execDesc, { color: theme.textSecondary }]}>
                    {exec.buyOrder.exchange.toUpperCase()} → {exec.sellOrder.exchange.toUpperCase()} • {exec.symbol}
                  </Text>
                  <View style={[styles.execPriceRow, { borderColor: theme.borderLight }]}>
                    <View style={styles.execPriceCol}>
                      <Text style={[styles.execPriceLabel, { color: theme.textTertiary }]}>Buy</Text>
                      <Text style={[styles.execPriceVal, { color: theme.success }]}>${exec.buyOrder.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.execPriceCol}>
                      <Text style={[styles.execPriceLabel, { color: theme.textTertiary }]}>Sell</Text>
                      <Text style={[styles.execPriceVal, { color: theme.error }]}>${exec.sellOrder.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.execPriceCol}>
                      <Text style={[styles.execPriceLabel, { color: theme.textTertiary }]}>Gross</Text>
                      <Text style={[styles.execPriceVal, { color: theme.text }]}>${exec.grossProfit.toFixed(4)}</Text>
                    </View>
                  </View>
                  <View style={styles.execBottom}>
                    <Text style={[styles.execPnl, { color: exec.netProfit >= 0 ? theme.successDark : theme.errorDark }]}>{exec.netProfit >= 0 ? '+' : ''}${exec.netProfit.toFixed(4)}</Text>
                    <Text style={[styles.execFees, { color: theme.textTertiary }]}>Fees: ${exec.totalFees.toFixed(4)}</Text>
                  </View>
                  <View style={[styles.liveTag, { backgroundColor: theme.tint + '10' }]}>
                    <View style={[styles.liveDotSmall, { backgroundColor: theme.tint }]} />
                    <Text style={[styles.liveTagText, { color: theme.tint }]}>Executed at live market prices</Text>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>Trade Log</Text>
            {recentTrades.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No trades logged yet.</Text>
              </View>
            ) : (
              recentTrades.map((trade) => (
                <View key={trade.id} style={[styles.tradeRow, { backgroundColor: theme.surface, borderLeftColor: trade.side === 'buy' ? theme.success : theme.error, borderColor: theme.border }]}>
                  <View style={styles.tradeHeader}>
                    <View style={[styles.tradeSide, { backgroundColor: trade.side === 'buy' ? theme.success : theme.error }]}>
                      <Text style={styles.tradeSideText}>{trade.side.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.tradeEx, { color: theme.text }]}>{trade.exchange.toUpperCase()}</Text>
                    <Text style={[styles.tradeSym, { color: theme.textSecondary }]}>{trade.symbol}</Text>
                  </View>
                  <View style={styles.tradeDetails}>
                    <Text style={[styles.tradeDetail, { color: theme.text }]}>{trade.amount} @ ${trade.price.toFixed(2)}</Text>
                    <View style={styles.tradeStatusRow}>
                      {trade.status === 'filled' ? <CheckCircle size={10} color={theme.success} /> : <XCircle size={10} color={theme.error} />}
                      <Text style={[styles.tradeStatusText, { color: trade.status === 'filled' ? theme.success : theme.error }]}>{trade.status}</Text>
                    </View>
                  </View>
                  {trade.errorMessage && <Text style={[styles.tradeError, { color: theme.errorDark }]}>{trade.errorMessage}</Text>}
                </View>
              ))
            )}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  modeCard: { borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1 },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modeInfo: { flex: 1 },
  modeLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 1 },
  modeDesc: { fontSize: 10 },
  modeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  modeIndicatorText: { fontSize: 11, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 10, paddingHorizontal: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 2 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resetText: { fontSize: 12, fontWeight: '600' as const },
  emptyCard: { borderRadius: 14, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  oppCard: { borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  oppHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  oppFlow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sideBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  sideText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  oppEx: { fontSize: 12, fontWeight: '700' as const },
  oppArrow: { fontSize: 13, fontWeight: '700' as const },
  symbolTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  symbolText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.3 },
  oppMetrics: { gap: 5, marginBottom: 12 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12 },
  metricVal: { fontSize: 13, fontWeight: '600' as const },
  execBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  execBtnText: { fontSize: 13, fontWeight: '700' as const, color: '#FFF' },
  fetchingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fetchingText: { fontSize: 10, fontWeight: '600' as const },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 6 },
  liveDotSmall: { width: 5, height: 5, borderRadius: 3 },
  liveTagText: { fontSize: 9, fontWeight: '600' as const },
  execCard: { borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderWidth: 1 },
  execHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  execStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  execStatusText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  execTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  execTimeText: { fontSize: 10 },
  execDesc: { fontSize: 12, marginBottom: 4 },
  execBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  execPnl: { fontSize: 15, fontWeight: '700' as const },
  execFees: { fontSize: 10 },
  execPriceRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6, marginBottom: 6, borderTopWidth: 1, borderBottomWidth: 1 },
  execPriceCol: { alignItems: 'center' },
  execPriceLabel: { fontSize: 9, fontWeight: '600' as const, letterSpacing: 0.3, marginBottom: 2 },
  execPriceVal: { fontSize: 12, fontWeight: '700' as const },
  tradeRow: { borderRadius: 10, padding: 10, marginBottom: 6, borderLeftWidth: 3, borderWidth: 1 },
  tradeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tradeSide: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  tradeSideText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  tradeEx: { fontSize: 12, fontWeight: '700' as const },
  tradeSym: { fontSize: 11 },
  tradeDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeDetail: { fontSize: 12, fontWeight: '500' as const },
  tradeStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tradeStatusText: { fontSize: 10, fontWeight: '600' as const },
  tradeError: { fontSize: 10, marginTop: 4, lineHeight: 15 },
  bottomPad: { height: 24 },
});
