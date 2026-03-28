import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { calculateArbitrageOpportunity } from '@/utils/arbitrage';
import { TRADE_AMOUNT } from '@/constants/exchanges';
import { useTheme } from '@/contexts/ThemeContext';

interface ExecutionCostCardProps {
  tickers: TickerData[];
}

export const ExecutionCostCard = React.memo(function ExecutionCostCard({ tickers }: ExecutionCostCardProps) {
  const { theme } = useTheme();
  if (tickers.length < 2) return null;

  const symbol = tickers[0].symbol.split('/')[0];

  const opportunities = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) continue;
      opportunities.push(calculateArbitrageOpportunity(tickers[i], tickers[j], TRADE_AMOUNT));
    }
  }
  const top = opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Execution Costs</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        For {TRADE_AMOUNT} {symbol}
      </Text>

      {top.map((opp, i) => (
        <View
          key={`${opp.buyExchange}-${opp.sellExchange}-${i}`}
          style={[
            styles.row,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            opp.isProfitable && { backgroundColor: theme.successLight, borderColor: theme.success },
          ]}
        >
          <View style={styles.flowRow}>
            <View style={[styles.sideBadge, { backgroundColor: theme.success }]}>
              <Text style={styles.sideText}>BUY</Text>
            </View>
            <Text style={[styles.exName, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
            <Text style={[styles.flowArrow, { color: theme.textSecondary }]}>→</Text>
            <View style={[styles.sideBadge, { backgroundColor: theme.error }]}>
              <Text style={styles.sideText}>SELL</Text>
            </View>
            <Text style={[styles.exName, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
            {opp.isProfitable && i === 0 && (
              <View style={[styles.bestTag, { backgroundColor: theme.success }]}>
                <Text style={styles.bestText}>BEST</Text>
              </View>
            )}
          </View>

          <View style={styles.metrics}>
            <MetricRow label="Gross" value={`$${opp.grossProfit.toFixed(2)}`} valueColor={opp.grossProfit > 0 ? theme.success : theme.error} theme={theme} />
            <MetricRow label="Fees" value={`$${opp.totalCost.toFixed(2)} (${opp.costPercentage.toFixed(3)}%)`} valueColor={theme.error} theme={theme} />
            <MetricRow label="Net" value={`$${opp.netProfit.toFixed(2)}`} valueColor={opp.isProfitable ? theme.successDark : theme.error} theme={theme} />
          </View>
        </View>
      ))}
    </View>
  );
});

function MetricRow({ label, value, valueColor, theme }: { label: string; value: string; valueColor: string; theme: { textSecondary: string } }) {
  return (
    <View style={styles.metricRow}>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: '700' as const, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 12 },
  row: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  sideBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  sideText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  exName: { fontSize: 12, fontWeight: '700' as const },
  flowArrow: { fontSize: 13, fontWeight: '700' as const },
  bestTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 'auto' },
  bestText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  metrics: { gap: 6 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 13, fontWeight: '600' as const },
});
