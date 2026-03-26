import { StyleSheet, Text, View } from 'react-native';
import { ArbitrageOpportunity, getCryptoSymbol } from '@/utils/arbitrage';
import { useTheme } from '@/contexts/ThemeContext';

interface ArbitrageOpportunitiesCardProps {
  opportunities: ArbitrageOpportunity[];
}

export function ArbitrageOpportunitiesCard({ opportunities }: ArbitrageOpportunitiesCardProps) {
  const { theme } = useTheme();
  if (opportunities.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
      <Text style={[styles.title, { color: theme.text }]}>Top 5 Profitable Opportunities</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>After cost analysis • Sorted by net profit</Text>
      <View style={styles.content}>
        {opportunities.map((opp, index) => {
          const cryptoSymbol = getCryptoSymbol(opp.symbol);
          
          return (
            <View
              key={`${opp.buyExchange}-${opp.sellExchange}-${opp.timestamp}-${index}`}
              style={[styles.row, { backgroundColor: theme.successLight, borderColor: theme.success }]}
            >
              <View style={styles.header}>
                <View style={styles.exchangePair}>
                  <View style={[styles.buyBadge, { backgroundColor: theme.success }]}>
                    <Text style={styles.buyBadgeText}>BUY</Text>
                  </View>
                  <Text style={[styles.exchange, { color: theme.text }]}>{opp.buyExchange.toUpperCase()}</Text>
                  <Text style={[styles.arrow, { color: theme.textSecondary }]}>→</Text>
                  <View style={[styles.sellBadge, { backgroundColor: theme.error }]}>
                    <Text style={styles.sellBadgeText}>SELL</Text>
                  </View>
                  <Text style={[styles.exchange, { color: theme.text }]}>{opp.sellExchange.toUpperCase()}</Text>
                </View>
                <Text style={[styles.time, { color: theme.textTertiary }]}>{new Date(opp.timestamp).toLocaleTimeString()}</Text>
              </View>
              <View style={styles.pairBadgeRow}>
                <View style={[styles.pairBadge, { backgroundColor: theme.infoLight }]}>
                  <Text style={[styles.pairBadgeText, { color: theme.infoDark }]}>{opp.symbol}</Text>
                </View>
              </View>
              <View style={styles.values}>
                <View style={styles.item}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Buy Price:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>${opp.buyPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.item}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Sell Price:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>${opp.sellPrice.toFixed(2)}</Text>
                </View>
              </View>
              <View style={[styles.metrics, { borderTopColor: theme.successDark }]}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Price Deviation:</Text>
                  <Text style={[styles.metricValue, { color: theme.success }]}>
                    ${opp.deviation.toFixed(2)} ({opp.percentDeviation.toFixed(3)}%)
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Execution Cost:</Text>
                  <Text style={[styles.metricValue, { color: theme.error }]}>
                    ${opp.totalCost.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Gross Profit:</Text>
                  <Text style={[styles.metricValue, { color: theme.textSecondary }]}>
                    ${opp.grossProfit.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Net Profit ({opp.tradeAmount} {cryptoSymbol}):</Text>
                  <Text style={[styles.metricValue, styles.profitValue, { color: theme.successDark }]}>
                    ${opp.netProfit.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.feesBreakdown, { borderTopColor: theme.successDark }]}>
                  <Text style={[styles.feesLabel, { color: theme.textSecondary }]}>Fees:</Text>
                  <Text style={[styles.feesDetail, { color: theme.textTertiary }]}>Buy ${opp.buyFee.toFixed(2)} + Sell ${opp.sellFee.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangePair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exchange: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  time: {
    fontSize: 11,
  },
  values: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  value: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  buyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sellBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  arrow: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  metrics: {
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  profitValue: {
    fontSize: 15,
  },
  feesBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  feesLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  feesDetail: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  pairBadgeRow: {
    marginBottom: 8,
  },
  pairBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pairBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});
