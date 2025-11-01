import { StyleSheet, Text, View } from 'react-native';
import { ArbitrageOpportunity, getCryptoSymbol } from '@/utils/arbitrage';

interface ArbitrageOpportunitiesCardProps {
  opportunities: ArbitrageOpportunity[];
}

export function ArbitrageOpportunitiesCard({ opportunities }: ArbitrageOpportunitiesCardProps) {
  if (opportunities.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top 5 Profitable Opportunities</Text>
      <Text style={styles.subtitle}>After cost analysis • Sorted by net profit</Text>
      <View style={styles.content}>
        {opportunities.map((opp, index) => {
          const cryptoSymbol = getCryptoSymbol(opp.symbol);
          
          return (
            <View key={`${opp.buyExchange}-${opp.sellExchange}-${opp.timestamp}-${index}`} style={styles.row}>
              <View style={styles.header}>
                <View style={styles.exchangePair}>
                  <View style={styles.buyBadge}>
                    <Text style={styles.buyBadgeText}>BUY</Text>
                  </View>
                  <Text style={styles.exchange}>{opp.buyExchange.toUpperCase()}</Text>
                  <Text style={styles.arrow}>→</Text>
                  <View style={styles.sellBadge}>
                    <Text style={styles.sellBadgeText}>SELL</Text>
                  </View>
                  <Text style={styles.exchange}>{opp.sellExchange.toUpperCase()}</Text>
                </View>
                <Text style={styles.time}>{new Date(opp.timestamp).toLocaleTimeString()}</Text>
              </View>
              <View style={styles.pairBadgeRow}>
                <View style={styles.pairBadge}>
                  <Text style={styles.pairBadgeText}>{opp.symbol}</Text>
                </View>
              </View>
              <View style={styles.values}>
                <View style={styles.item}>
                  <Text style={styles.label}>Buy Price:</Text>
                  <Text style={styles.value}>${opp.buyPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.item}>
                  <Text style={styles.label}>Sell Price:</Text>
                  <Text style={styles.value}>${opp.sellPrice.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.metrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Price Deviation:</Text>
                  <Text style={[styles.metricValue, styles.positiveValue]}>
                    ${opp.deviation.toFixed(2)} ({opp.percentDeviation.toFixed(3)}%)
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Execution Cost:</Text>
                  <Text style={[styles.metricValue, styles.costValue]}>
                    ${opp.totalCost.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Gross Profit:</Text>
                  <Text style={[styles.metricValue, styles.neutralValue]}>
                    ${opp.grossProfit.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Net Profit ({opp.tradeAmount} {cryptoSymbol}):</Text>
                  <Text style={[styles.metricValue, styles.profitValue]}>
                    ${opp.netProfit.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.feesBreakdown}>
                  <Text style={styles.feesLabel}>Fees:</Text>
                  <Text style={styles.feesDetail}>Buy ${opp.buyFee.toFixed(2)} + Sell ${opp.sellFee.toFixed(2)}</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
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
    color: '#111827',
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
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
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  value: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#111827',
  },
  buyBadge: {
    backgroundColor: '#10B981',
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
    backgroundColor: '#EF4444',
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
    color: '#6B7280',
    fontWeight: '700' as const,
  },
  metrics: {
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  profitValue: {
    color: '#059669',
    fontSize: 15,
  },
  positiveValue: {
    color: '#10B981',
  },
  neutralValue: {
    color: '#6B7280',
  },
  costValue: {
    color: '#EF4444',
  },
  feesBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  feesLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  feesDetail: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  pairBadgeRow: {
    marginBottom: 8,
  },
  pairBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pairBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
});
