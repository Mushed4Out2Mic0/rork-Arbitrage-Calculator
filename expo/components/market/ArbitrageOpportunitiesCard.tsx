import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArbitrageOpportunity } from '@/utils/arbitrage';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  opportunities: ArbitrageOpportunity[];
}

export const ArbitrageOpportunitiesCard = React.memo(function ArbitrageOpportunitiesCard({ opportunities }: Props) {
  const { theme } = useTheme();
  if (opportunities.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profitable Opportunities</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sorted by net profit after fees</Text>

      {opportunities.map((opp, idx) => {
        const sym = opp.symbol.split('/')[0];
        return (
          <View key={`${opp.buyExchange}-${opp.sellExchange}-${idx}`} style={[styles.row, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
            <View style={styles.header}>
              <View style={styles.exchangeFlow}>
                <View style={[styles.badge, { backgroundColor: theme.success }]}>
                  <Text style={styles.badgeText}>BUY</Text>
                </View>
                <Text style={[styles.exName, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                <Text style={[styles.arrow, { color: theme.textSecondary }]}>→</Text>
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text style={styles.badgeText}>SELL</Text>
                </View>
                <Text style={[styles.exName, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
              </View>
              <View style={[styles.pairTag, { backgroundColor: theme.infoLight }]}>
                <Text style={[styles.pairText, { color: theme.infoDark }]}>{opp.symbol}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Buy: ${opp.buyPrice.toFixed(2)}</Text>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Sell: ${opp.sellPrice.toFixed(2)}</Text>
            </View>

            <View style={[styles.metricSection, { borderTopColor: theme.success }]}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Deviation</Text>
                <Text style={[styles.metricVal, { color: theme.success }]}>
                  ${opp.deviation.toFixed(2)} ({opp.percentDeviation.toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Fees</Text>
                <Text style={[styles.metricVal, { color: theme.error }]}>
                  ${opp.totalCost.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Net ({opp.tradeAmount} {sym})</Text>
                <Text style={[styles.netValue, { color: theme.successDark }]}>${opp.netProfit.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '700' as const, marginBottom: 2 },
  subtitle: { fontSize: 12, marginBottom: 14 },
  row: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exchangeFlow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  badgeText: { fontSize: 9, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.5 },
  exName: { fontSize: 12, fontWeight: '700' as const },
  arrow: { fontSize: 13, fontWeight: '700' as const },
  pairTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  pairText: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 12 },
  metricSection: { gap: 6, paddingTop: 10, borderTopWidth: 1 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 11, fontWeight: '500' as const },
  metricVal: { fontSize: 12, fontWeight: '700' as const },
  netValue: { fontSize: 14, fontWeight: '700' as const },
});
