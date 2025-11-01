import { StyleSheet, Text, View } from 'react-native';
import { TickerData } from '@/types/exchanges';
import { calculateArbitrageOpportunity, getCryptoSymbol } from '@/utils/arbitrage';
import { TRADE_AMOUNT } from '@/constants/exchanges';

interface ExecutionCostCardProps {
  tickers: TickerData[];
}

export function ExecutionCostCard({ tickers }: ExecutionCostCardProps) {
  if (tickers.length < 2) return null;

  const cryptoSymbol = getCryptoSymbol(tickers[0]?.symbol || 'BTC/USDT');
  
  const opportunities = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) continue;
      opportunities.push(calculateArbitrageOpportunity(tickers[i], tickers[j], TRADE_AMOUNT));
    }
  }

  const topOpportunities = opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 3);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Execution Cost Analysis</Text>
      <Text style={styles.subtitle}>Cross-exchange execution costs for {TRADE_AMOUNT} {cryptoSymbol}</Text>
      <View style={styles.content}>
        {topOpportunities.map((opp, index) => (
          <View 
            key={`${opp.buyExchange}-${opp.sellExchange}-${index}`}
            style={[
              styles.row,
              opp.isProfitable && styles.profitableRow,
            ]}
          >
            <View style={styles.header}>
              <View style={styles.exchangeFlow}>
                <View style={styles.buyIndicator}>
                  <Text style={styles.buyIndicatorText}>BUY</Text>
                </View>
                <Text style={styles.exchangeName}>{opp.buyExchange.toUpperCase()}</Text>
                <Text style={styles.flowArrow}>→</Text>
                <View style={styles.sellIndicator}>
                  <Text style={styles.sellIndicatorText}>SELL</Text>
                </View>
                <Text style={styles.exchangeName}>{opp.sellExchange.toUpperCase()}</Text>
              </View>
              {opp.isProfitable && index === 0 && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>BEST</Text>
                </View>
              )}
            </View>

            <View style={styles.metrics}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Buy Price:</Text>
                <Text style={styles.metricValue}>${opp.buyPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Sell Price:</Text>
                <Text style={styles.metricValue}>${opp.sellPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Gross Profit:</Text>
                <Text style={[styles.metricValue, opp.grossProfit > 0 ? styles.positiveValue : styles.negativeValue]}>
                  ${opp.grossProfit.toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Fees:</Text>
                <Text style={[styles.metricValue, styles.costValue]}>
                  ${opp.totalCost.toFixed(2)} ({opp.costPercentage.toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Net Profit:</Text>
                <Text style={[styles.metricValue, opp.isProfitable ? styles.profitValue : styles.negativeValue]}>
                  ${opp.netProfit.toFixed(2)} ({((opp.netProfit / (opp.buyPrice * opp.tradeAmount)) * 100).toFixed(3)}%)
                </Text>
              </View>
              <View style={styles.feesBreakdown}>
                <Text style={styles.feesLabel}>Fee Breakdown:</Text>
                <Text style={styles.feesDetail}>
                  Buy ${opp.buyFee.toFixed(2)} + Sell ${opp.sellFee.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
    marginBottom: 8,
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
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profitableRow: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  metrics: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  costValue: {
    color: '#EF4444',
    fontWeight: '700' as const,
  },
  negativeValue: {
    color: '#EF4444',
  },
  positiveValue: {
    color: '#10B981',
  },
  profitValue: {
    color: '#059669',
    fontWeight: '700' as const,
  },
  exchangeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyIndicator: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyIndicatorText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sellIndicator: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellIndicatorText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  exchangeName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#111827',
  },
  flowArrow: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700' as const,
  },
  feesBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
});
